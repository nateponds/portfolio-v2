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
  console.log('PASS: bounded head offsets; full offscreen exits at mobile, desktop and wide sizes.');
} finally {await browser.close();}
