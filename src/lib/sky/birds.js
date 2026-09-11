import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

// Mesh2Motion's CC0 bird: original mesh, weights, 55-bone skeleton and clips.
export async function loadBirds() {
  const asset=await new GLTFLoader().loadAsync('/assets/bird-animations.glb');
  for(const name of ['Flap','Idle']) {
    if(!asset.animations.some(clip=>clip.name===name))throw new Error(`Bird missing ${name} animation`);
  }
  // Feather colour stays in the supplied texture; soften the harsh white highlights.
  asset.scene.traverse(object=>{
    if(!object.isMesh)return;
    for(const material of [object.material].flat()) {
      material.roughness=.88;
      material.metalness=0;
      material.color.setRGB(.88,.9,.94);
    }
  });
  return function createBird() {
    const root=new THREE.Group(), model=clone(asset.scene);
    const facing=new THREE.Group();facing.rotation.y=Math.PI/2;
    root.add(facing);facing.add(model);
    let mesh;
    model.traverse(object=>{
      if(object.isSkinnedMesh){mesh=object;object.frustumCulled=false;}
    });
    if(!mesh?.skeleton?.bones.length)throw new Error('Bird asset has no skinning');
    const mixer=new THREE.AnimationMixer(model);
    const flap=mixer.clipAction(asset.animations.find(a=>a.name==='Flap')).play();
    const idle=mixer.clipAction(asset.animations.find(a=>a.name==='Idle')).play();
    const glideClip=asset.animations.find(a=>a.name==='Glide');
    const glide=glideClip?mixer.clipAction(glideClip).play():null;
    glide?.setEffectiveWeight(0);
    flap.setEffectiveWeight(0);idle.setEffectiveWeight(1);mixer.setTime(0);
    model.updateMatrixWorld(true);
    const size=new THREE.Box3().setFromObject(model,true).getSize(new THREE.Vector3());
    facing.scale.setScalar(1.75/size.z);
    const head=model.getObjectByName('head');
    const footL=model.getObjectByName('Foot_L'),footR=model.getObjectByName('Foot_R');
    if(!head || !footL || !footR)throw new Error('Bird missing head or foot controls');
    const controlledNames=['head','spine_3','tail_1','tail_2',...['L','R'].flatMap(side=>['UpperLeg','LowerLeg','AnkleLeg','Foot','Toes'].map(name=>`${name}_${side}`))];
    const controls=new Map(controlledNames.map(name=>{
      const bone=model.getObjectByName(name);
      if(!bone)throw new Error(`Bird missing rig control ${name}`);
      return [name,{bone,authored:bone.quaternion.clone(),perched:bone.quaternion.clone()}];
    }));
    const rotation=new THREE.Quaternion(),rotationEuler=new THREE.Euler();
    const offset=(name,x=0,y=0,z=0)=>{
      rotation.setFromEuler(rotationEuler.set(x,y,z));
      controls.get(name).bone.quaternion.multiply(rotation);
    };
    const anchor=new THREE.Vector3(),other=new THREE.Vector3();
    const headOffset=new THREE.Quaternion();
    const restAnchor=new THREE.Vector3();
    footL.getWorldPosition(restAnchor);footR.getWorldPosition(other);
    restAnchor.add(other).multiplyScalar(.5);model.worldToLocal(restAnchor);
    // Fixed, irregular observation bouts: quick turns, long holds, occasional tilts.
    // Absolute time makes head movement identical during replay and preview seeking.
    const looks=[
      [0,0,0,0],[1.8,.32,-.06,.03],[3.1,.12,.13,-.08],
      [5.7,-.34,.03,0],[6.6,-.21,-.12,.09],[9.4,0,.06,0],
      [12.2,.27,.1,-.06],[14.1,-.12,0,0],[16.5,0,0,0],[17,0,0,0],
    ];
    return {root,
      rigInfo:{bones:mesh.skeleton.bones.length,clips:asset.animations.map(a=>a.name),controls:controlledNames},
      pose(time,flight,landing,dt,still=false,options={}) {
        const weight=still?0:THREE.MathUtils.clamp(flight,0,1);
        const glideWeight=glide?weight*(options.glide||0):0;
        flap.setEffectiveWeight(weight-glideWeight);idle.setEffectiveWeight(1-weight);
        glide?.setEffectiveWeight(glideWeight);
        // Absolute clip time supports preview scrubbing and independent cloned rigs.
        // The mixer may skip unchanged tracks: restore its last unmodified pose first.
        controls.forEach(({bone,authored})=>bone.quaternion.copy(authored));
        // Analytic phase with smoothly varying cadence, never a timeScale jump.
        const phase=time*1.65+.11*Math.sin(time*1.7);
        mixer.setTime(still?0:phase);
        controls.forEach(control=>control.authored.copy(control.bone.quaternion));
        // A rig layer over the imported clips: tucked flight legs, reaching feet,
        // tail trim and neck compensation. Every offset starts from the mixer pose.
        const contact=THREE.MathUtils.clamp(landing,0,1);
        const tuck=weight*(1-contact);
        for(const side of ['L','R']) {
          // Reach using the asset's standing leg chain while wings keep flying.
          // Once settled this also prevents alternating idle feet from sliding.
          for(const name of ['UpperLeg','LowerLeg','AnkleLeg','Foot','Toes']) {
            const control=controls.get(`${name}_${side}`);
            control.bone.quaternion.slerp(control.perched,contact);
          }
          offset(`UpperLeg_${side}`,-.48*tuck);
          offset(`AnkleLeg_${side}`,.72*tuck);
          offset(`Toes_${side}`,.22*tuck+.12*contact);
        }
        const beat=still?0:Math.sin(phase/flap.getClip().duration*Math.PI*2);
        const effort=weight-glideWeight;
        offset('tail_1',-.12*contact*weight+.025*beat*effort,0,THREE.MathUtils.clamp(options.bank||0,-.25,.25)*.35);
        offset('tail_2',-.08*contact*weight);
        offset('spine_3',-.025*beat*effort);
        if(head && !still) {
          const lookTime=Math.max(0,options.lookTime??time)%17;
          let index=0;
          while(index<looks.length-2 && lookTime>=looks[index+1][0])index++;
          const current=looks[index],previous=looks[Math.max(0,index-1)];
          const turn=THREE.MathUtils.smootherstep(lookTime-current[0],0,.19);
          const attention=(1-weight)*THREE.MathUtils.smoothstep(options.lookTime??time,0,.8);
          const pitch=THREE.MathUtils.lerp(previous[2],current[2],turn)*attention;
          const yaw=THREE.MathUtils.lerp(previous[1],current[1],turn)*attention;
          const tilt=THREE.MathUtils.lerp(previous[3],current[3],turn)*attention;
          headOffset.setFromEuler(new THREE.Euler(pitch,tilt,yaw));
          head.quaternion.multiply(headOffset);
          // Neck follows a little; the head performs most of the quick observation.
          offset('spine_3',pitch*.18,tilt*.12,yaw*.2);
        }
        controls.forEach(({bone})=>bone.quaternion.normalize());
        // Anchor the authored feet at the branch, not the model's origin.
        model.position.set(0,0,0);model.updateMatrixWorld(true);
        footL.getWorldPosition(anchor);footR.getWorldPosition(other);
        anchor.add(other).multiplyScalar(.5);model.worldToLocal(anchor);
        anchor.lerp(restAnchor,weight*(1-landing));
        model.position.set(-anchor.x,-anchor.y+.014,-anchor.z);
        root.updateMatrixWorld(true);
      },
      dispose(){mixer.stopAllAction();mixer.uncacheRoot(model);mesh.skeleton.dispose();},
    };
  };
}
