const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

function worker(network=()=>Promise.reject(Error("offline"))) {
  const listeners={};const stores=new Map();const events=[];let claimed=0,skipped=0;
  const controls={rejectPut:false,syncPutError:false,putBarrier:null};
  const key=request=>new URL(typeof request==="string"?request:request.url,"https://tally.test/app/").href;
  function cache(name){if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return {addAll:async assets=>{events.push(assets);},match:async req=>store.get(key(req)),put:(req,res)=>{
    if(controls.syncPutError) throw new TypeError("unsupported response cache write");
    return (async()=>{
      if(controls.rejectPut) throw new Error("cache quota/blocked write");
      if(controls.putBarrier) await controls.putBarrier;
      store.set(key(req),res);
    })();
  }};}
  const context={console,Promise,URL,fetch:network,Response,
    caches:{open:async n=>cache(n),keys:async()=>[...stores.keys()],delete:async n=>stores.delete(n),match:async req=>{for(const store of stores.values())if(store.has(key(req)))return store.get(key(req));}},
    self:{location:{origin:"https://tally.test"},addEventListener:(n,f)=>listeners[n]=f,skipWaiting:async()=>{skipped++;},clients:{claim:async()=>{claimed++;}}},
  };
  vm.createContext(context);context.importScripts=()=>vm.runInContext(fs.readFileSync(path.join(__dirname,"../version.js"),"utf8"),context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../sw.js"),"utf8"),context);
  const current="tally-v"+context.TALLY_VERSION;
  function event(request){const promises=[];return {request,waiting:promises,waitUntil:p=>promises.push(Promise.resolve(p)),respondWith(p){this.result=Promise.resolve(p);}};}
  return {listeners,stores,cache,current,event,events,controls,get claimed(){return claimed;},get skipped(){return skipped;}};
}

test("install precaches the complete local shell and activation retains unrelated applications",async()=>{
  const app=worker();const install=app.event();app.listeners.install(install);await Promise.all(install.waiting);
  assert.ok(app.events[0].includes("./index.html"));assert.ok(app.events[0].includes("./tally-helpers.js"));assert.equal(app.skipped,1);
  app.cache("other-app-cache");app.cache("tally-vold");
  const activate=app.event();app.listeners.activate(activate);await Promise.all(activate.waiting);
  assert.equal(app.stores.has("tally-vold"),false);assert.equal(app.stores.has("other-app-cache"),true);assert.equal(app.claimed,1);
});

test("offline document navigation uses the local shell but an API miss never returns HTML",async()=>{
  const app=worker();await app.cache(app.current).put("./index.html",new Response("app shell"));
  const nav=app.event({method:"GET",mode:"navigate",url:"https://tally.test/app/route"});app.listeners.fetch(nav);
  assert.equal(await (await nav.result).text(),"app shell");
  const api=app.event({method:"GET",mode:"cors",url:"https://api.example.invalid/foods"});app.listeners.fetch(api);
  await assert.rejects(api.result,/offline/);
});

test("cached responses retain background refresh through the fetch-event lifetime",async()=>{
  const app=worker(async()=>new Response("updated"));await app.cache(app.current).put("./index.html",new Response("cached"));
  const request=app.event({method:"GET",mode:"navigate",url:"https://tally.test/app/index.html"});app.listeners.fetch(request);
  assert.equal(await (await request.result).text(),"cached");assert.ok(request.waiting.length>0);
  await Promise.all(request.waiting);assert.equal(await (await app.cache(app.current).match("./index.html")).text(),"updated");
});


test("navigation cache miss returns usable network response when storing it rejects",async()=>{
  const app=worker(async()=>new Response("fresh network document",{headers:{"content-type":"text/html"}}));
  await app.cache(app.current).put("./index.html",new Response("stale fallback shell"));
  app.controls.rejectPut=true;
  const request=app.event({method:"GET",mode:"navigate",url:"https://tally.test/app/fresh-route"});
  app.listeners.fetch(request);
  const response=await request.result;
  assert.equal(response.status,200);
  assert.equal(await response.text(),"fresh network document");
  await Promise.all(request.waiting);
  assert.equal(await (await app.cache(app.current).match("./index.html")).text(),"stale fallback shell");
});

test("script cache miss returns network JavaScript despite cache-write rejection",async()=>{
  const app=worker(async()=>new Response("window.fixtureLoaded=true;",{headers:{"content-type":"application/javascript"}}));
  app.controls.rejectPut=true;
  const request=app.event({method:"GET",mode:"cors",url:"https://tally.test/app/new-script.js"});
  app.listeners.fetch(request);
  const response=await request.result;
  assert.equal(response.headers.get("content-type"),"application/javascript");
  assert.equal(await response.text(),"window.fixtureLoaded=true;");
  await Promise.all(request.waiting);
});

test("synchronous cache-write refusal preserves a successful image response",async()=>{
  const bytes=new Uint8Array([137,80,78,71]);
  const app=worker(async()=>new Response(bytes,{headers:{"content-type":"image/png"}}));
  app.controls.syncPutError=true;
  const request=app.event({method:"GET",mode:"cors",url:"https://tally.test/app/new-image.png"});
  app.listeners.fetch(request);
  const response=await request.result;
  assert.equal(response.headers.get("content-type"),"image/png");
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()),bytes);
  await Promise.all(request.waiting);
});

test("an unfinished cache write does not delay the successful network response",async()=>{
  const app=worker(async()=>new Response("online asset"));
  let release;
  app.controls.putBarrier=new Promise(resolve=>{release=resolve;});
  const request=app.event({method:"GET",mode:"cors",url:"https://tally.test/app/not-cached.js"});
  app.listeners.fetch(request);
  let responded=false;
  const result=request.result.then(response=>{responded=true;return response;});
  try{
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(responded,true,"cache persistence must not gate a fetched response");
    assert.equal(await (await result).text(),"online asset");
    assert.ok(request.waiting.length>0,"background cache write must extend fetch-event lifetime");
  }finally{
    release();
  }
  await Promise.all(request.waiting);
});
