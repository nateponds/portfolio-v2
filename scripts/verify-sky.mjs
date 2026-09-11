import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';
import assert from 'node:assert/strict';
import { skyState, solarAltitude } from '../src/lib/sky/daylight.js';

const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || undefined});
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.route('https://ipapi.co/**',route=>route.fulfill({json:{latitude:14.6,longitude:121}}));
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error' && !message.text().includes('favicon'))errors.push(message.text());});
await mkdir('artifacts/sky',{recursive:true});
for(const mode of ['day','sunset','night']) {
  await page.goto(`${baseURL}/?sky=${mode}&sceneTime=12`);
  await page.waitForSelector('canvas[data-ready="true"]',{timeout:60000});
  await page.screenshot({path:`artifacts/sky/${mode}.png`});
  console.log(mode,await page.evaluate(()=>window.__sky.state()));
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
