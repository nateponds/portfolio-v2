import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';
import assert from 'node:assert/strict';
import { skyState, solarAltitude } from '../src/lib/sky/daylight.js';

// Keep the compositor on the GPU for visual evidence. Do not use the common
// --disable-gpu/SwiftShader flags: they flatten the volumetric sky.
const browser=await chromium.launch({
  headless:true,
  channel:process.env.BROWSER_CHANNEL || undefined,
  args:['--enable-gpu','--ignore-gpu-blocklist','--use-angle=d3d11'],
});
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.route('https://ipapi.co/**',route=>route.fulfill({json:{latitude:14.6,longitude:121}}));
const page=await context.newPage();
page.setDefaultTimeout(90000);
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error' && !message.text().includes('favicon'))errors.push(message.text());});
await mkdir('artifacts/sky',{recursive:true});
for(const mode of ['day','sunset','night']) {
  await page.goto(`${baseURL}/?sky=${mode}&sceneTime=12`);
  await page.waitForSelector('canvas[data-ready="true"]',{timeout:60000});
  await page.waitForFunction(expected=>document.documentElement.dataset.skyPhase===expected,mode);
  await page.screenshot({path:`artifacts/sky/${mode}.png`});
  const phaseCheck=await page.evaluate(()=>({
    state:window.__sky.state(),
    phase:document.documentElement.dataset.skyPhase,
    heading:getComputedStyle(document.querySelector('.hero-content h1')).color,
    nav:getComputedStyle(document.querySelector('.nav-button')).color,
    secondary:getComputedStyle(document.querySelector('.hero-btn.btn-secondary')).color,
  }));
  assert.equal(phaseCheck.phase,mode);
  if(mode==='night') {
    assert.equal(phaseCheck.heading,'rgb(244, 247, 247)');
    assert.equal(phaseCheck.nav,'rgb(244, 247, 247)');
    assert.equal(phaseCheck.secondary,'rgb(244, 247, 247)');
  } else {
    assert.equal(phaseCheck.heading,'rgb(36, 59, 64)');
    assert.equal(phaseCheck.nav,'rgb(36, 59, 64)');
    assert.equal(phaseCheck.secondary,'rgb(36, 59, 64)');
  }
  console.log(mode,phaseCheck);
  const rig=await page.evaluate(()=>window.__sky.state().rig);
  assert.equal(rig.bones,55);
  assert.ok(rig.clips.includes('Flap') && rig.clips.includes('Idle'));
}
await page.goto(`${baseURL}/?sky=day&sceneTime=0`);
await page.waitForSelector('canvas[data-ready="true"]');
for(const [time,state] of [[2.99,'waiting'],[3.01,'flying'],[3.7,'flying'],[4.4,'away'],[5.8,'away'],[7.5,'flying'],[9.5,'landing'],[11,'perched'],[40,'perched']]) {
  await page.evaluate(t=>window.__sky.setTime(t),time);
  await page.waitForFunction(expected=>window.__sky.state().bird===expected,state);
  if(time===9.5)await page.screenshot({path:'artifacts/sky/landing.png'});
  if(time===3.7)await page.screenshot({path:'artifacts/sky/flight.png'});
}
await page.setViewportSize({width:390,height:844});
await page.goto(`${baseURL}/?sky=day&sceneTime=12`);
await page.waitForSelector('canvas[data-ready="true"]');
await page.screenshot({path:'artifacts/sky/mobile.png'});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);

// Scroll is part of the scene, not a static wallpaper. Capture a small set of
// named waypoints so the foreground exit, depth drift, and fresh lower sky are
// easy to inspect in review.
await page.setViewportSize({width:1440,height:900});
await page.goto(`${baseURL}/?sky=day&sceneTime=12`);
await page.waitForSelector('canvas[data-ready="true"]');
const scrollMax=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
const capture=async(path,position)=>{
  await page.evaluate(y=>window.scrollTo(0,y),position);
  await page.waitForTimeout(650);
  await page.screenshot({path:`artifacts/${path}`});
};
const sectionTop=async(id)=>page.evaluate(name=>Math.max(0,document.getElementById(name).offsetTop-56),id);
const elementTop=async(selector)=>page.evaluate(name=>Math.max(0,document.querySelector(name).getBoundingClientRect().top+scrollY-56),selector);
await capture('landscape-desktop-hero.png',0);
const first=await page.evaluate(()=>window.__sky.state());
await capture('landscape-desktop-about.png',await sectionTop('about'));
const about=await page.evaluate(()=>window.__sky.state());
await capture('landscape-desktop-intermediate-01.png',scrollMax*.37);
const middle=await page.evaluate(()=>window.__sky.state());
await capture('landscape-desktop-projects.png',await sectionTop('projects'));
await capture('landscape-desktop-intermediate-02.png',scrollMax*.73);
await capture('landscape-desktop-contact.png',await sectionTop('contact'));
const contact=await page.evaluate(()=>window.__sky.state());
assert.ok(about.worldOffset>first.worldOffset,'World offset should increase below hero');
assert.ok(middle.cloudOffset>about.cloudOffset,'Cloud sample should move through the world');
assert.ok(contact.worldOffset>middle.worldOffset,'World offset should reach contact');
assert.ok(contact.worldOffset-first.worldOffset>20,'Scroll should cover meaningful atmospheric depth');

await page.setViewportSize({width:390,height:844});
await page.goto(`${baseURL}/?sky=day&sceneTime=12`);
await page.waitForSelector('canvas[data-ready="true"]');
await page.screenshot({path:'artifacts/landscape-mobile-hero.png'});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await capture('landscape-mobile-about.png',await elementTop('.about-copy'));
await capture('landscape-mobile-projects.png',await sectionTop('projects'));
await capture('landscape-mobile-contact.png',await sectionTop('contact'));
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto(`${baseURL}/?sky=day&sceneTime=0`);
await page.waitForSelector('canvas[data-ready="true"]');
assert.equal(await page.evaluate(()=>window.__sky.state().bird),'perched');
await context.unroute('https://ipapi.co/**');
await context.route('https://ipapi.co/**',route=>route.abort());
await page.evaluate(()=>sessionStorage.clear());
await page.goto(`${baseURL}/?sky=day`);
await page.waitForSelector('canvas[data-ready="true"]');
assert.equal(await page.evaluate(()=>window.__sky.state().locationSource),'clock');
const manila={latitude:14.6,longitude:121};
assert.ok(solarAltitude(new Date('2026-09-11T04:00:00Z'),14.6,121)>70);
assert.equal(skyState(new Date('2026-09-11T16:00:00Z'),manila).mode,'night');
let goldenMinutes=0;
for(let i=0;i<1440;i++) {
  const date=new Date(Date.UTC(2026,8,11,0,i));
  if(skyState(date,manila).golden>.25)goldenMinutes++;
}
assert.ok(goldenMinutes>=10 && goldenMinutes<=24,`Golden window: ${goldenMinutes}`);
assert.ok(solarAltitude(new Date('2026-06-21T12:00:00Z'),89,0)>0);
assert.ok(solarAltitude(new Date('2026-12-21T12:00:00Z'),89,0)<0);
await browser.close();
assert.deepEqual(errors.filter(e=>!e.includes('ERR_FAILED')),[]);
console.log(`PASS: shader compilation, bird timing, three palettes, mobile, reduced motion, location fallback, solar altitude, polar day/night; golden window ${goldenMinutes} minutes.`);
