import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createAtmosphere } from './atmosphere.js';
import { createBranch, createMoon } from './nature.js';
import { loadBirds } from './birds.js';
import { approximateLocation, skyState } from './daylight.js';
import { createForeground } from './foreground.js';

export async function startScene(canvas, signal) {
  // Load before allocating a renderer so an abandoned React mount cannot
  // create a second WebGL context on the same canvas.
  const loader=new THREE.TextureLoader();
  const [createBird,lunarTexture]=await Promise.all([
    loadBirds(),loader.loadAsync('/assets/moon.png').catch(()=>null),
  ]);
  if (signal?.aborted) {
    lunarTexture?.dispose();
    return () => {};
  }
  canvas.hidden = false;
  delete canvas.dataset.ready;
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  const pointerPreference=matchMedia('(hover: hover) and (pointer: fine)');
  const mobile=matchMedia('(max-width: 700px)').matches || !pointerPreference.matches;
  let reduced=motionPreference.matches, disposed=false, hidden=document.hidden;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.6));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1;
  renderer.info.autoReset=false;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,1,.1,120);camera.position.z=12;
  const atmosphere=createAtmosphere(renderer,mobile);scene.background=atmosphere.texture;
  const hemi=new THREE.HemisphereLight('#e5edff','#393545',2.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff1d8',2.8);sun.position.set(-8,12,6);scene.add(sun);
  const rim=new THREE.DirectionalLight('#bacdff',.5);rim.position.set(5,6,-8);scene.add(rim);
  if(lunarTexture)lunarTexture.colorSpace=THREE.SRGBColorSpace;
  const moon=createMoon(lunarTexture);scene.add(moon);
  const branch=createBranch();scene.add(branch.root);
  const foreground=createForeground(renderer,camera,branch.near,[hemi,sun,rim]);
  const bird=createBird();scene.add(bird.root);
  const travelers=[createBird(),createBird()];
  travelers.forEach(b=>scene.add(b.root));
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const blur=new BokehPass(scene,camera,{focus:12.5,aperture:.003,maxblur:.028});
  // Keep the distant sky clear; use the circle of confusion on the near side.
  blur.materialBokeh.fragmentShader=blur.materialBokeh.fragmentShader.replace('float factor = ( focus + viewZ );','float factor = max(0.0, focus + viewZ);');
  composer.addPass(blur);composer.addPass(foreground.pass);composer.addPass(new OutputPass());
  const pointer=new THREE.Vector2(), landingPoint=new THREE.Vector3();
  let width=1,height=1,halfW=1,halfH=1,quality=1,elapsed=0,last=0,frame=0;
  let viewerLocation=null, target=skyState(new Date()), lighting={...target};
  const presets={day:{daylight:1,golden:0},sunset:{daylight:.58,golden:1},night:{daylight:0,golden:0}};
  // Development-only art direction controls; no additional visitor UI.
  const params=process.env.NODE_ENV === 'development' ? new URLSearchParams(window.location.search) : null;
  let preview=params?.get('sky'), fixedTime=params?.has('sceneTime')?Number(params.get('sceneTime')):null;
  if(presets[preview])lighting={...presets[preview]};

  function resize() {
    width=innerWidth;height=innerHeight;
    camera.aspect=width/height;camera.updateProjectionMatrix();
    halfH=Math.tan(THREE.MathUtils.degToRad(21))*12;halfW=halfH*camera.aspect;
    renderer.setSize(width,height,false);composer.setSize(width,height);atmosphere.resize(width,height,quality);foreground.resize(width,height);
    const narrow=width<700;
    branch.root.scale.set(narrow?.9:1.5,narrow?.72:1,1);
    branch.root.position.set(halfW*(narrow?.46:.48)+.93*branch.root.scale.x,-halfH*.62-.69*branch.root.scale.y,0);
    branch.near.position.set(halfW*(narrow?.55:.35),-halfH*.56,5);
    branch.near.scale.set(narrow?.7:1.3,narrow?.55:1,1);
    const birdScale=2*halfW*(narrow?.17:.095)/1.75;
    bird.root.scale.setScalar(birdScale);
    const moonDepth=47,moonH=Math.tan(THREE.MathUtils.degToRad(21))*moonDepth;
    moon.position.set(moonH*camera.aspect*(narrow?.37:.49),moonH*.53,12-moonDepth);
    moon.scale.setScalar(moonH*(narrow?.19:.22));
    travelers.forEach((b,i)=>b.root.scale.setScalar(.4-i*.12));
  }
  function onPointer(event) {
    if(!pointerPreference.matches || reduced || event.pointerType==='touch')return;
    pointer.set((event.clientX/width-.5)*.27,-(event.clientY/height-.5)*.17);
  }
  function resetPointer(){pointer.set(0,0);}
  function visibility(){hidden=document.hidden;last=0;}
  function preference(){reduced=motionPreference.matches;if(reduced)resetPointer();}
  window.addEventListener('resize',resize);
  window.addEventListener('pointermove',onPointer,{passive:true});
  document.addEventListener('pointerleave',resetPointer);
  document.addEventListener('visibilitychange',visibility);
  motionPreference.addEventListener('change',preference);
  resize();
  const refresh=()=>{target=skyState(new Date(),viewerLocation);};
  const refreshTimer=setInterval(refresh,30000);
  approximateLocation().then(value=>{if(!disposed){viewerLocation=value;refresh();}});
  let samples=0,totalFrameTime=0,qualityChecked=false;

  function tick(now) {
    if(disposed)return;
    frame=requestAnimationFrame(tick);
    if(hidden){last=0;return;}
    const rawDt=last?(now-last)/1000:0;
    const dt=Math.min(rawDt,.1);last=now;
    elapsed+=rawDt;
    const t=fixedTime!==null && Number.isFinite(fixedTime)?fixedTime:elapsed;
    const motionTime=reduced?0:t;
    const desired=presets[preview]||target;
    const blend=1-Math.exp(-dt*.4);
    lighting.daylight+=(desired.daylight-lighting.daylight)*blend;
    lighting.golden+=(desired.golden-lighting.golden)*blend;
    const day=lighting.daylight,gold=lighting.golden;
    const follow=1-Math.exp(-dt*2.1);
    camera.position.x+=(pointer.x-camera.position.x)*follow;
    camera.position.y+=(pointer.y-camera.position.y)*follow;
    atmosphere.uniforms.cameraOffset.value.set(camera.position.x,camera.position.y);
    atmosphere.uniforms.time.value=motionTime;
    atmosphere.uniforms.daylight.value=day;atmosphere.uniforms.golden.value=gold;
    hemi.intensity=.16+day*1.75;sun.intensity=.08+day*1.65+gold*.8;rim.intensity=.65+gold*1.1;
    sun.color.set('#fff1d8').lerp(new THREE.Color('#ffb469'),gold);
    hemi.color.set('#829cc9').lerp(new THREE.Color('#e5edff'),day);
    moon.material.uniforms.daylight.value=day;
    const arrivalStart=3.5, duration=3.2,landedAt=arrivalStart+duration;
    const afterLanding=motionTime-landedAt;
    const impact=!reduced && afterLanding>=0 ? Math.sin(afterLanding*14)*Math.exp(-afterLanding*3)*.009 : 0;
    branch.update(motionTime,impact);
    branch.root.updateMatrixWorld(true);branch.perch.getWorldPosition(landingPoint);
    if(reduced || t>=landedAt) {
      bird.root.visible=true;
      bird.root.position.copy(landingPoint);
      bird.root.quaternion.copy(branch.sway.getWorldQuaternion(new THREE.Quaternion()));
      bird.root.rotation.z+=!reduced && afterLanding<1?-.035*Math.exp(-afterLanding*5):0;
      bird.pose(motionTime,0,0,dt,reduced);
      bird.root.userData.state='perched';
    } else if(t<arrivalStart) {
      bird.root.visible=false;bird.root.userData.state='waiting';
    } else {
      bird.root.visible=true;
      const progress=(t-arrivalStart)/duration;
      const eased=1-(1-progress)**1.65;
      const path=new THREE.CubicBezierCurve3(
        new THREE.Vector3(-halfW*1.45,halfH*.18,-5),
        new THREE.Vector3(-halfW*.6,halfH*.07,-3),
        landingPoint.clone().add(new THREE.Vector3(-1.2,.85,-.8)),landingPoint,
      );
      bird.root.position.copy(path.getPoint(eased));
      const tangent=path.getTangent(eased);
      const brake=THREE.MathUtils.smoothstep(progress,.55,.98);
      bird.root.rotation.set(0,-Math.atan2(tangent.z,tangent.x),Math.atan2(tangent.y,tangent.x)*(1-brake)+brake*.16);
      const flight=1-THREE.MathUtils.smoothstep(progress,.87,1);
      bird.pose(motionTime,flight,brake,dt);
      bird.root.userData.state=progress>.7?'landing':'flying';
    }
    travelers.forEach((b,i)=>{
      b.root.position.set(halfW*(.15+i*.65)-t*(.55+i*.15),halfH*(.42+i*.18)+t*.075,-7-i*3);
      const viewHalfWidth=halfW*(camera.position.z-b.root.position.z)/12;
      const exitMargin=Math.max(viewHalfWidth*.12,b.root.scale.x*2);
      b.root.visible=!reduced && b.root.position.x>camera.position.x-viewHalfWidth-exitMargin;
      b.root.rotation.set(.1,Math.PI-.15,-.06);
      b.pose(motionTime+i*.9,1,0,dt,reduced);
    });
    renderer.info.reset();
    atmosphere.render();foreground.render();composer.render();
    if(canvas.dataset.ready!=='true')last=performance.now();
    canvas.dataset.ready='true';
    // One conservative quality adjustment based on sustained visible frame time.
    if(!qualityChecked && t>2 && rawDt>0) {
      totalFrameTime+=rawDt;samples++;
      if(samples>=90) {
        qualityChecked=true;
        if(totalFrameTime/samples>.029){quality=.7;renderer.setPixelRatio(Math.min(devicePixelRatio,1));resize();}
      }
    }
  }
  frame=requestAnimationFrame(tick);
  if(process.env.NODE_ENV === 'development')window.__sky={
    createBird,
    setMode(mode){preview=mode;},setTime(time){fixedTime=time;},
    state(){return {elapsed,bird:bird.root.userData.state,rig:bird.rigInfo,travelers:travelers.map(b=>({visible:b.root.visible,ndcX:b.root.position.clone().project(camera).x})),daylight:lighting.daylight,golden:lighting.golden,locationSource:viewerLocation?'ip':'clock',quality,reduced,drawCalls:renderer.info.render.calls};},
  };
  return function dispose() {
    if (disposed) return;
    disposed=true;cancelAnimationFrame(frame);clearInterval(refreshTimer);
    window.removeEventListener('resize',resize);window.removeEventListener('pointermove',onPointer);
    document.removeEventListener('pointerleave',resetPointer);document.removeEventListener('visibilitychange',visibility);
    motionPreference.removeEventListener('change',preference);
    bird.dispose();travelers.forEach(b=>b.dispose());
    const geometries=new Set(),materials=new Set(),textures=new Set();
    scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});
    foreground.scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});
    materials.forEach(material=>{
      for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
      for(const uniform of Object.values(material.uniforms||{}))if(uniform.value?.isTexture)textures.add(uniform.value);
      material.dispose();
    });
    geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());
    atmosphere.dispose();foreground.dispose();blur.dispose();composer.dispose();renderer.dispose();
    delete canvas.dataset.ready;
    if(process.env.NODE_ENV === 'development')delete window.__sky;
  };
}
