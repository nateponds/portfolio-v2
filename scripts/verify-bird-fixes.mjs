import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || undefined});
try {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.route('https://ipapi.co/**',r=>r.fulfill({json:{latitude:14.6,longitude:121}}));
  await page.goto(`${baseURL}/?sky=day&sceneTime=18`);
  await page.waitForSelector('canvas[data-ready="true"]');
  const headDrift=await page.evaluate(async()=>{
    const bird=window.__sky.createBird();
    const head=bird.root.getObjectByName('head');
    const random=Math.random;Math.random=()=>.75;
    try {
      bird.pose(12,0,0,1/60,true);
      const base=head.quaternion.clone();let maximum=0;
      for(let i=0;i<400;i++) {
        bird.pose(12,0,0,1/60,false);
        maximum=Math.max(maximum,base.angleTo(head.quaternion));
      }
      bird.dispose();return maximum;
    } finally {Math.random=random;}
  });
  console.log('Maximum head offset (radians):',headDrift);
  assert.ok(headDrift<.4,'Head offset accumulates across repeated animation frames');
  const motion=await page.evaluate(()=>{
    const bird=window.__sky.createBird(),head=bird.root.getObjectByName('head');
    const left=bird.root.getObjectByName('Foot_L'),right=bird.root.getObjectByName('Foot_R');
    const samples=[];
    for(const time of [0,1.8,2.1,3.4,6,7,10,14,16.8]) {
      bird.pose(time,0,1,1/60,false,{lookTime:time});
      const midpoint=left.getWorldPosition(bird.root.position.clone()).add(right.getWorldPosition(bird.root.position.clone())).multiplyScalar(.5);
      samples.push({head:head.quaternion.toArray(),foot:midpoint.toArray()});
    }
    bird.pose(6,0,1,1/30,false,{lookTime:6});const before=head.quaternion.clone();
    bird.pose(40,0,1,1/60,false,{lookTime:40});
    bird.pose(6,0,1,1/144,false,{lookTime:6});const seekError=before.angleTo(head.quaternion);
    bird.pose(20,0,1,1/60,true);const still=head.quaternion.clone();
    bird.pose(60,0,1,1/30,true);const stillError=still.angleTo(head.quaternion);
    bird.dispose();return {samples,seekError,stillError};
  });
  assert.ok(motion.seekError<1e-6,'Head pose depends on frame rate or seek history');
  assert.ok(motion.stillError<1e-6,'Reduced-motion head must remain still');
  const rigStability=await page.evaluate(()=>{
    const bird=window.__sky.createBird();
    const bones=bird.rigInfo.controls.map(name=>bird.root.getObjectByName(name));
    bird.pose(8,1,.8,1/60,false,{bank:.15});
    const expected=bones.map(bone=>bone.quaternion.clone());
    for(let frame=0;frame<300;frame++)bird.pose(8,1,.8,1/144,false,{bank:.15});
    const drift=Math.max(...bones.map((bone,i)=>bone.quaternion.angleTo(expected[i])));
    bird.pose(30,0,1,1/30,false);
    bird.pose(8,1,.8,1/60,false,{bank:.15});
    const seek=Math.max(...bones.map((bone,i)=>bone.quaternion.angleTo(expected[i])));
    bird.dispose();return {drift,seek};
  });
  assert.ok(rigStability.drift<1e-6,'Rig offsets accumulate on repeated frames');
  assert.ok(rigStability.seek<1e-6,'Rig offsets depend on seek history');
  assert.ok(new Set(motion.samples.map(s=>s.head.join(','))).size>5,'Perched head should inspect different directions');
  for(const sample of motion.samples) {
    assert.ok(Math.hypot(...sample.foot.map((v,i)=>v-motion.samples[0].foot[i]))<1e-5,'Perch anchor slides during idle');
  }
  for(const width of [390,1440,2560]) {
    await page.setViewportSize({width,height:900});
    for(const time of [18,22,30,45,70]) {
      await page.evaluate(t=>window.__sky.setTime(t),time);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const birds=await page.evaluate(()=>window.__sky.state().travelers);
      assert.ok(birds.every(b=>b.visible || b.ndcX < -1.05),`Premature exit at ${width}px / ${time}s`);
      if(time===70)assert.ok(birds.every(b=>!b.visible),'Birds should finish exiting');
    }
  }
  console.log('PASS: bounded varied head looks, deterministic seeking, still reduced motion, stable foot midpoint; full offscreen exits at mobile, desktop and wide sizes.');
} finally {await browser.close();}
