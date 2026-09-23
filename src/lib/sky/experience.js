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
import { getSkyMode, setSkyMode, subscribeSkyMode } from './mode.js';

export async function startScene(canvas, signal, overlayCanvas, onFirstFrame) {
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
  const pixelRatio=Math.min(devicePixelRatio,mobile?1.25:1.6);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(pixelRatio);
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
  const branch=createBranch();
  const bird=createBird();
  const travelers=[createBird(),createBird(),createBird(),createBird()];
  const foliage=new THREE.Group();
  foliage.add(branch.root,branch.grove,bird.root);
  const flock=new THREE.Group();
  flock.add(...travelers.map(b=>b.root));
  if(overlayCanvas) {
    overlayCanvas.hidden=true;
  }
  const lights=[hemi,sun,rim];
  const soft=createForeground(renderer,camera,foliage,lights);
  const flockSoft=createForeground(renderer,camera,flock,lights,.5);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const blur=new BokehPass(scene,camera,{focus:14.5,aperture:.00255,maxblur:.0102});
  // Keep the distant sky clear; use the circle of confusion on the near side.
  blur.materialBokeh.fragmentShader=blur.materialBokeh.fragmentShader.replace('float factor = ( focus + viewZ );','float factor = max(0.0, focus + viewZ);');
  composer.addPass(blur);
  composer.addPass(soft.pass);
  composer.addPass(flockSoft.pass);
  composer.addPass(new OutputPass());
  const pointer=new THREE.Vector2(), landingPoint=new THREE.Vector3();
  const perchFacing=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI);
  const worldQuat=new THREE.Quaternion();
  const crossStart=3,crossDuration=1.25,awayDuration=3,returnDuration=2.8;
  const returnStart=crossStart+crossDuration+awayDuration,landedAt=returnStart+returnDuration;
  let width=1,height=1,halfW=1,halfH=1,quality=1,elapsed=0,last=0,frame=0;
  let scrollTarget=0,scrollOffset=0,scrollProgress=0;
  let viewerLocation=null, target=skyState(new Date()), lighting={...target};
  const presets={day:{daylight:1,golden:0},sunset:{daylight:.58,golden:1},night:{daylight:0,golden:0}};
  const params=process.env.NODE_ENV === 'development' ? new URLSearchParams(window.location.search) : null;
  let preview=getSkyMode()||params?.get('sky'), fixedTime=params?.has('sceneTime')?Number(params.get('sceneTime')):null;
  if(!presets[preview])preview=null;
  if(presets[preview])lighting={...presets[preview]};
  const stopMode=subscribeSkyMode((mode)=>{preview=presets[mode]?mode:null;});
  const rootElement=document.documentElement;
  let skyPhase=null;
  let textLight=-1;
  function syncTextContrast() {
    const next=Math.round(THREE.MathUtils.smoothstep(1-lighting.daylight,.35,.9)*100);
    if(next!==textLight) {
      textLight=next;
      rootElement.style.setProperty('--sky-text-light',`${next}%`);
    }
  }
  function syncSkyPhase() {
    const next=lighting.golden>.25 ? 'sunset' : lighting.daylight>.5 ? 'day' : 'night';
    if(next!==skyPhase) {
      skyPhase=next;
      rootElement.dataset.skyPhase=next;
    }
  }
  syncSkyPhase();
  syncTextContrast();

  function readScroll() {
    const maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    scrollProgress=THREE.MathUtils.clamp(scrollY/maxScroll,0,1);
    // A modest world scale gives the page enough altitude for new cloud banks
    // while keeping the foreground tree readable before it exits above frame.
    scrollTarget=scrollProgress*38;
  }

  function resize() {
    width=innerWidth;height=innerHeight;
    camera.aspect=width/height;camera.updateProjectionMatrix();
    halfH=Math.tan(THREE.MathUtils.degToRad(21))*12;halfW=halfH*camera.aspect;
    renderer.setSize(width,height,false);
    composer.setSize(width,height);atmosphere.resize(width,height,quality);soft.resize(width,height);flockSoft.resize(width,height);
    const narrow=width<700;
    branch.root.scale.set(narrow?.9:1.5,narrow?.72:1,1);
    branch.root.position.set(halfW*(narrow?.46:.48)+.93*branch.root.scale.x,-halfH*.62-.69*branch.root.scale.y,0);
    branch.grove.scale.set(narrow?.85:1.35,narrow?.7:.95,1);
    branch.grove.position.set(halfW*(narrow?.18:.22)+.7*branch.grove.scale.x,-halfH*.58-.62*branch.grove.scale.y,0);
    const birdScale=2*halfW*(narrow?.17:.095)/1.75;
    bird.root.scale.setScalar(birdScale);
    const moonDepth=47,moonH=Math.tan(THREE.MathUtils.degToRad(21))*moonDepth;
    moon.position.set(moonH*camera.aspect*(narrow?.37:.49),moonH*.53,12-moonDepth);
    moon.scale.setScalar(moonH*(narrow?.19:.22));
    travelers.forEach((b,i)=>b.root.scale.setScalar(.4-i*.05));
    readScroll();
  }
  function onPointer(event) {
    if(!pointerPreference.matches || reduced || event.pointerType==='touch')return;
    pointer.set((event.clientX/width-.5)*.27,-(event.clientY/height-.5)*.17);
  }
  function resetPointer(){pointer.set(0,0);}
  function visibility(){hidden=document.hidden;last=0;}
  function preference(){reduced=motionPreference.matches;if(reduced)resetPointer();}
  window.addEventListener('resize',resize);
  window.addEventListener('scroll',readScroll,{passive:true});
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
    const blendRate=preview?1.2:.4;
    const blend=1-Math.exp(-dt*blendRate);
    lighting.daylight+=(desired.daylight-lighting.daylight)*blend;
    lighting.golden+=(desired.golden-lighting.golden)*blend;
    const day=lighting.daylight,gold=lighting.golden;
    syncSkyPhase();
    syncTextContrast();
    scrollOffset+=(scrollTarget-scrollOffset)*(1-Math.exp(-dt*5.5));
    const follow=1-Math.exp(-dt*2.1);
    const idleX=reduced?0:.02*Math.sin(elapsed*.29)+.009*Math.sin(elapsed*.67+1.1);
    const idleY=reduced?0:.014*Math.sin(elapsed*.23+.6)+.007*Math.sin(elapsed*.51+1.7);
    camera.position.x+=(pointer.x+idleX-camera.position.x)*follow;
    camera.position.y+=(pointer.y+idleY-camera.position.y)*follow;
    atmosphere.uniforms.cameraOffset.value.set(0,0);
    atmosphere.uniforms.scrollOffset.value=scrollOffset;
    atmosphere.uniforms.scrollProgress.value=scrollProgress;
    atmosphere.uniforms.time.value=0;
    atmosphere.uniforms.daylight.value=day;atmosphere.uniforms.golden.value=gold;
    hemi.intensity=.16+day*1.75;sun.intensity=.08+day*1.65+gold*.8;rim.intensity=.65+gold*1.1;
    sun.color.set('#fff1d8').lerp(new THREE.Color('#ffb469'),gold);
    hemi.color.set('#829cc9').lerp(new THREE.Color('#e5edff'),day);
    moon.material.uniforms.daylight.value=day;
    const afterLanding=motionTime-landedAt;
    const impact=!reduced && afterLanding>=0 ? Math.sin(afterLanding*14)*Math.exp(-afterLanding*3)*.009 : 0;
    branch.update(motionTime,impact);
    const foregroundY=-scrollOffset*1.12;
    const distantY=-scrollOffset*.56;
    branch.root.position.y=-(halfH*.62+.69*branch.root.scale.y)+foregroundY;
    branch.grove.position.y=-(halfH*.58+.62*branch.grove.scale.y)+foregroundY*.86;
    branch.root.updateMatrixWorld(true);branch.perch.getWorldPosition(landingPoint);
    const edge=(z,side)=>side*(halfW*(camera.position.z-z)/12+bird.root.scale.x*2);
    const followPath=(path,progress,brake)=>{
      const returning=t>=returnStart;
      // Arc length avoids Bezier control-point spacing changing cruise speed.
      // Return distance has zero terminal velocity and acceleration.
      const distance=returning?1.6*progress+.4*progress**3-2.2*progress**4+1.2*progress**5:progress;
      bird.root.position.copy(path.getPointAt(distance));
      const tangent=path.getTangentAt(distance);
      const ahead=path.getTangentAt(Math.min(1,distance+.025));
      const flare=returning?THREE.MathUtils.smootherstep(progress,.48,.86):0;
      const pitch=THREE.MathUtils.clamp(Math.atan2(tangent.y,Math.hypot(tangent.x,tangent.z)),-.22,.32)*(1-flare)
        +flare*.48*(1-THREE.MathUtils.smootherstep(progress,.9,1));
      const bank=THREE.MathUtils.clamp(tangent.z*ahead.x-tangent.x*ahead.z,-.25,.25)*3;
      bird.root.rotation.set(0,-Math.atan2(tangent.z,tangent.x),0);
      bird.root.rotateZ(pitch);bird.root.rotateX(bank*(1-flare));
      if(returning) {
        const contact=THREE.MathUtils.smootherstep(progress,.78,1);
        branch.sway.getWorldQuaternion(worldQuat).multiply(perchFacing);
        bird.root.quaternion.slerp(worldQuat,contact);
      }
      const glide=returning?THREE.MathUtils.lerp(.08,.84,flare):0;
      const cadence=returning?THREE.MathUtils.lerp(2.15,.7,flare):3.45;
      // Keep wings working through contact; fold them during the settle.
      bird.pose(motionTime,1,brake,dt,false,{glide,bank,cadence});
    };
    if(reduced || t>=landedAt) {
      bird.root.visible=true;
      bird.root.position.copy(landingPoint);
      bird.root.quaternion.copy(branch.sway.getWorldQuaternion(worldQuat)).multiply(perchFacing);
      if(!reduced && afterLanding<1)bird.root.rotateZ(-.05*Math.sin(afterLanding*9)*Math.exp(-afterLanding*5));
      const fold=1-THREE.MathUtils.smootherstep(afterLanding,0,.55);
      bird.pose(motionTime,reduced?0:fold,1,dt,reduced,{lookTime:Math.max(0,afterLanding-.65)});
      bird.root.userData.state='perched';
    } else if(t<crossStart) {
      bird.root.visible=false;bird.root.userData.state='waiting';
    } else if(t<crossStart+crossDuration) {
      bird.root.visible=true;
      followPath(new THREE.CubicBezierCurve3(
        new THREE.Vector3(edge(-5.6,-1),halfH*.24+foregroundY,-5.6),
        new THREE.Vector3(-halfW*.22,halfH*.22+foregroundY,-6.2),
        new THREE.Vector3(halfW*.22,halfH*.24+foregroundY,-6),
        new THREE.Vector3(edge(-5.4,1),halfH*.26+foregroundY,-5.4),
      ),(t-crossStart)/crossDuration,0);
      bird.root.userData.state='flying';
    } else if(t<returnStart) {
      bird.root.visible=false;bird.root.userData.state='away';
    } else {
      bird.root.visible=true;
      const progress=(t-returnStart)/returnDuration;
      const brake=THREE.MathUtils.smoothstep(progress,.48,.98);
      followPath(new THREE.CubicBezierCurve3(
        new THREE.Vector3(edge(2.2,1),halfH*.18+foregroundY,2.2),
        new THREE.Vector3(halfW*.58,halfH*.22+foregroundY,1.15),
        landingPoint.clone().add(new THREE.Vector3(1.35,.72,.18)),landingPoint,
      ),progress,brake);
      bird.root.userData.state=progress>.7?'landing':'flying';
    }
    travelers.forEach((b,i)=>{
      const far=i/3,phase=t*(.28-far*.06)+i*1.85,speed=.58+i*.1;
      b.root.position.set(halfW*(.22+i*.52)-t*speed,halfH*(.5+i*.08)+t*.025+.1*Math.sin(phase)+distantY,-5.4-i*2.2+.22*Math.sin(phase*.5));
      const viewHalfWidth=halfW*(camera.position.z-b.root.position.z)/12;
      const exitMargin=Math.max(viewHalfWidth*.12,b.root.scale.x*2);
      b.root.visible=!reduced && b.root.position.x>camera.position.x-viewHalfWidth-exitMargin;
      const vy=.03+.1*(.28-far*.06)*Math.cos(phase),vz=.22*(.28-far*.06)*.5*Math.cos(phase*.5);
      b.root.rotation.set(0,-Math.atan2(vz,-speed),0);
      b.root.rotateZ(Math.atan2(vy,Math.hypot(speed,vz)));
      b.root.rotateX(.05*Math.sin(phase*.5));
      const glide=Math.min(.96,.78+.16*far+.06*THREE.MathUtils.smootherstep(Math.sin(t*.7+i*2.1),.2,.85));
      const cadence=.88-.32*far;
      b.pose(motionTime*.45+i*1.7,1,0,dt,reduced,{glide,bank:.05*Math.sin(phase*.5),cadence});
    });
    renderer.info.reset();
    atmosphere.render();soft.render(false);flockSoft.render(false);composer.render();
    if(canvas.dataset.ready!=='true') {
      last=performance.now();
      canvas.dataset.ready='true';
      if(!disposed && !signal?.aborted) onFirstFrame?.();
    }
    // One conservative quality adjustment based on sustained visible frame time.
    if(!qualityChecked && t>2 && rawDt>0) {
      totalFrameTime+=rawDt;samples++;
      if(samples>=90) {
        qualityChecked=true;
        if(totalFrameTime/samples>.029){
          quality=.7;renderer.setPixelRatio(Math.min(devicePixelRatio,1));
          resize();
        }
      }
    }
  }
  frame=requestAnimationFrame(tick);
  if(process.env.NODE_ENV === 'development')window.__sky={
    createBird,
    setMode(mode){setSkyMode(presets[mode]?mode:null);},setTime(time){fixedTime=time;},
    state(){return {elapsed,bird:bird.root.userData.state,rig:bird.rigInfo,travelers:travelers.map(b=>({visible:b.root.visible,ndcX:b.root.position.clone().project(camera).x})),daylight:lighting.daylight,golden:lighting.golden,scrollProgress,worldOffset:scrollOffset,cloudOffset:atmosphere.uniforms.scrollOffset.value,locationSource:viewerLocation?'ip':'clock',quality,reduced,staticClouds:true,atmosphereDraws:atmosphere.draws,drawCalls:renderer.info.render.calls};},
  };
  return function dispose() {
    if (disposed) return;
    disposed=true;cancelAnimationFrame(frame);clearInterval(refreshTimer);
    window.removeEventListener('resize',resize);window.removeEventListener('scroll',readScroll);window.removeEventListener('pointermove',onPointer);
    document.removeEventListener('pointerleave',resetPointer);document.removeEventListener('visibilitychange',visibility);
    motionPreference.removeEventListener('change',preference);
    bird.dispose();travelers.forEach(b=>b.dispose());branch.dispose?.();
    const geometries=new Set(),materials=new Set(),textures=new Set();
    scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});
    soft.scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});
    flockSoft.scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});
    materials.forEach(material=>{
      for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
      for(const uniform of Object.values(material.uniforms||{}))if(uniform.value?.isTexture)textures.add(uniform.value);
      material.dispose();
    });
    geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());
    atmosphere.dispose();soft.dispose();flockSoft.dispose();blur.dispose();composer.dispose();renderer.dispose();
    delete canvas.dataset.ready;
    stopMode();
    if(rootElement.dataset.skyPhase===skyPhase)delete rootElement.dataset.skyPhase;
    rootElement.style.removeProperty('--sky-text-light');
    if(process.env.NODE_ENV === 'development')delete window.__sky;
  };
}
