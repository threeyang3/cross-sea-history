// Exercise the actual static output at the Pages repository subpath.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile,stat } from 'node:fs/promises';
import { resolve,extname,sep } from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(resolve(process.env.PLAYWRIGHT_PREFIX??'.','package.json'));
const {chromium}=require('playwright');
const base=process.env.PAGES_BASE_PATH??'/cross-sea-history/';
const dist=resolve('dist-pages');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'};
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!path.startsWith(base)){res.writeHead(404).end('not within Pages base');return;}
  let file=resolve(dist,decodeURIComponent(path.slice(base.length)));
  if(file!==dist&&!file.startsWith(dist+sep)){res.writeHead(403).end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  res.writeHead(200,{'content-type':types[extname(file)]??'application/octet-stream'}).end(await readFile(file));
 }catch{res.writeHead(404).end('not found');}
});
await new Promise((ok,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',ok)});
const origin='http://127.0.0.1:'+server.address().port;
const url=origin+base;
let browser;
const errors=[];
const local404=[];
const check=async(label,fn)=>{await fn();console.log('PASS:',label)};
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},locale:'zh-CN',reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)local404.push(r.status()+' '+r.url());});
 const go=async(hash='')=>{await page.goto(url+hash);};
 const show=async(selector)=>{await page.locator(selector).first().waitFor({state:'visible',timeout:15000});};
 await check('homepage and local hero image',async()=>{
  await go();await show('.editorial-hero-image img');
  const img=page.locator('.editorial-hero-image img');
  await img.evaluate(el=>el.decode());
  assert((await img.getAttribute('src')).startsWith(base+'images/'));
  assert(await img.evaluate(el=>el.naturalWidth>0));
  assert.equal(await page.locator('.editorial-tile img[src*="/museum/"]').count(),4);
 });
 await check('direct article route, diagram, citation return and modal close',async()=>{
  await go('#timeline/exchange/cj-sinan-shipwreck');
  await show('.history-reader .reading-section');
  await show('.learning-visual');
  assert.equal(await page.locator('.learning-visual').count(),2);
  await page.locator('.learning-visual .lv-controls button').first().click();
  await page.locator('.reading-citations button').first().click();
  await show('.reader-citation-return');
  await page.locator('.reader-citation-return').click();
  await page.locator('.reader-back').click();
  await page.locator('.history-reader-dialog').waitFor({state:'hidden'});
 });
 await check('poetry deep link and Japanese word gloss',async()=>{
  await go('#poetry/jiang-jin-jiu');await show('#poem-title');
  assert.match(await page.locator('#poem-title').textContent(),/将进酒/);
  await page.locator('.poem-line button').first().click();
  await show('#poem-active-gloss');
  assert((await page.locator('#poem-active-gloss [lang="ja"]').count())>0);
 });
 await check('notebook survives reload in same origin',async()=>{
  await go('#desk');await show('#understanding');
  await page.locator('#understanding').fill('Pages isolated browser smoke test');
  await page.getByRole('button',{name:'保存摘记'}).click();
  await page.reload();await show('#understanding');
  await page.waitForFunction(()=>document.querySelector('#understanding')?.value==='Pages isolated browser smoke test');
 });
 await check('static city atlas and return link',async()=>{
  await page.goto(url+'city-atlas/?lang=ja#city/xian');
  await show('#main h1');
  assert.equal(await page.locator('html').getAttribute('data-site-root'),base);
  const back=page.locator('.atlas-site-links a').first();
  assert.equal(await back.getAttribute('href'),base);
  await back.click();await show('.editorial-hero-image');
 });
 await page.setViewportSize({width:390,height:844});
 await check('mobile contents and full-screen reader',async()=>{
  await go('#timeline/china/cn-dujiangyan');await show('.reading-section');
  await show('.reader-toc-toggle');
  await page.locator('.reader-toc-toggle').click();await show('.reader-mobile-toc');
  await page.locator('.reader-mobile-toc button').nth(1).click();
  await page.locator('.reader-mobile-toc').waitFor({state:'hidden'});
  assert(await page.locator('.history-reader-dialog').evaluate(el=>el.getBoundingClientRect().width<=window.innerWidth+1));
  await page.locator('.reader-toc-toggle').click();
  await page.keyboard.press('Escape');
  await page.locator('.reader-mobile-toc').waitFor({state:'hidden'});
  await show('.history-reader-dialog');
  await page.locator('.reader-back').click();
  await page.locator('.history-reader-dialog').waitFor({state:'hidden'});
 });
 assert.deepEqual(errors,[],'uncaught browser errors');
 assert.deepEqual(local404,[],'failed local HTTP requests');
 console.log('Pages Chromium smoke tests passed at '+base);
 await context.close();
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
