import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

// Mesh2Motion's CC0 bird: original mesh, weights, 55-bone skeleton and clips.
export async function loadBirds() {
  const asset=await new GLTFLoader().loadAsync('/assets/bird-animations.glb');
  for(const name of ['Flap','Idle']) {
    if(!asset.animations.some(clip=>clip.name===name))throw new Error(`Bird missing ${name} animation`);
  }
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
    flap.timeScale=1.15;
    flap.setEffectiveWeight(0);idle.setEffectiveWeight(1);mixer.setTime(0);
    model.updateMatrixWorld(true);
    const size=new THREE.Box3().setFromObject(model,true).getSize(new THREE.Vector3());
    facing.scale.setScalar(1.75/size.z);
    const head=model.getObjectByName('head');
    const animatedHead=head?.quaternion.clone();
    const footL=model.getObjectByName('Foot_L'),footR=model.getObjectByName('Foot_R');
    const anchor=new THREE.Vector3(),other=new THREE.Vector3();
    const headOffset=new THREE.Quaternion();
    let yaw=0,pitch=0,targetYaw=0,targetPitch=0,nextLook=0;
    return {root,
      rigInfo:{bones:mesh.skeleton.bones.length,clips:asset.animations.map(a=>a.name)},
      pose(time,flight,landing,dt,still=false) {
        const weight=still?0:THREE.MathUtils.clamp(flight*(1-landing*.45),0,1);
        flap.setEffectiveWeight(weight);idle.setEffectiveWeight(1-weight);
        // Absolute clip time supports preview scrubbing and independent cloned rigs.
        // The mixer may skip unchanged tracks: restore its last unmodified pose first.
        if(head)head.quaternion.copy(animatedHead);
        mixer.setTime(still?0:time);
        if(head)animatedHead.copy(head.quaternion);
        if(!still && time>nextLook) {
          targetYaw=(Math.random()-.5)*.4;targetPitch=(Math.random()-.5)*.14;
          nextLook=time+1.5+Math.random()*3;
        }
        const follow=1-Math.exp(-dt*19);
        yaw+=(targetYaw-yaw)*follow;pitch+=(targetPitch-pitch)*follow;
        if(head && !still) {
          headOffset.setFromEuler(new THREE.Euler(pitch*(1-weight),0,yaw*(1-weight)));
          head.quaternion.multiply(headOffset);
        }
        // Anchor the authored feet at the branch, not the model's origin.
        model.position.set(0,0,0);model.updateMatrixWorld(true);
        footL.getWorldPosition(anchor);footR.getWorldPosition(other);
        anchor.add(other).multiplyScalar(.5);model.worldToLocal(anchor);
        model.position.set(-anchor.x,-anchor.y+.014,-anchor.z);
        root.updateMatrixWorld(true);
      },
      dispose(){mixer.stopAllAction();mixer.uncacheRoot(model);mesh.skeleton.dispose();},
    };
  };
}
