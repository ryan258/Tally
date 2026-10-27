const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Runs the real inline controller against an in-memory DOM/storage boundary.
// This proves persistence decisions, not mobile layout, touch or PWA acceptance.
function boot(initialRaw, options={}) {
  const nodes=new Map();
  function element(key="") {
    if(nodes.has(key)) return nodes.get(key);
    const attrs={}; const classes=new Set();
    const node={value:"",textContent:"",innerHTML:"",hidden:false,checked:false,
      firstElementChild:{style:{}},dataset:{},style:{setProperty(){}},children:[],offsetHeight:20,clientWidth:390,
      classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},contains(n){return classes.has(n);},toggle(n,on){const keep=on===undefined?!classes.has(n):on;keep?classes.add(n):classes.delete(n);return keep;}},
      addEventListener(){},removeEventListener(){},appendChild(child){this.children.push(child);return child;},append(){},remove(){},click(){if(this.onclick)this.onclick();},focus(){},scrollIntoView(){},
      querySelector(s){return element(key+" "+s);},querySelectorAll(){return [];},closest(){return null;},matches(){return false;},
      setAttribute(k,v){attrs[k]=v;},getAttribute(k){return attrs[k]??null;},removeAttribute(k){delete attrs[k];},
      getBoundingClientRect(){return {top:0,left:0,width:390,height:20,bottom:20};},
      getContext(){return new Proxy({measureText(){return {width:10};},createLinearGradient(){return {addColorStop(){}};}},{get(o,k){return o[k]??(()=>{});},set(o,k,v){o[k]=v;return true;}});}
    };
    nodes.set(key,node);return node;
  }
  const values=new Map(initialRaw===undefined?[]:[["tally.v1",initialRaw]]);
  const controls={failWrite:!!options.failWrite,failRead:!!options.failRead}; const blobs=[];
  const document={querySelector:element,querySelectorAll:()=>[],getElementById:id=>element("#"+id),createElement:()=>element("created-"+nodes.size),createDocumentFragment:()=>element("fragment-"+nodes.size),addEventListener(){},body:element("body"),documentElement:element("html"),hidden:false};
  const context={console,document,navigator:{},Date,Math,JSON,Blob,URL,URLSearchParams,
    localStorage:{getItem(k){if(controls.failRead&&k==="tally.v1")throw Error("blocked");return values.get(k)??null;},setItem(k,v){if(controls.failWrite&&k==="tally.v1")throw Error("full");values.set(k,v);},removeItem(k){values.delete(k);}},
    location:{search:"",pathname:"/"},history:{replaceState(){}},confirm:()=>options.confirm!==false,
    matchMedia:()=>({matches:true,addEventListener(){}}),addEventListener(){},
    setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,requestAnimationFrame:()=>1,
    fetch:()=>{throw Error("network forbidden");},
    FileReader:class{readAsText(file){this.result=file.text;this.onload();}},
    TallyHelpers:require("../tally-helpers.js"),TallyFoodImages:require("../food-images.js"),
  };
  context.URL=class extends URL{};
  context.URL.createObjectURL=blob=>{blobs.push(blob);return "blob:synthetic";};
  context.URL.revokeObjectURL=()=>{};
  context.window=context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../version.js"),"utf8"),context);
  const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
  let code=html.match(/<script>\s*(\(function\(\)\{[\s\S]*?)<\/script>/)[1];
  const end=code.lastIndexOf("})();");
  code=code.slice(0,end)+"globalThis.__controller={getState:()=>state,save,sanitizeGoals};\n"+code.slice(end);
  vm.runInContext(code,context);
  return {context,nodes,values,controls,blobs,import(text){nodes.get("#importFile").onchange({target:{files:[{text}],value:"fixture"}});}};
}

function fixture(name="Saved egg") {
  return {goals:{calories:1800,protein:130,carbs:190,fat:55,fiber:38,sugar:24,waterGoal:9},theme:"auto",usdaApiKey:"",foods:[{id:"food",name,calories:78,protein:6}],days:{"2026-07-30":{water:4,entries:[{id:"entry",type:"food",name,calories:156,protein:12,timestamp:1785400200000}]}}};
}

test("malformed saved data survives controller startup for deliberate recovery",()=>{
  const raw="{interrupted backup"; const app=boot(raw);
  assert.equal(app.values.get("tally.v1"),raw);
  assert.match(app.nodes.get("#storageNotice").textContent,/saved|storage|recover/i);
});

test("blocked storage read is a visible recoverable mode, not a startup crash",()=>{
  let app; assert.doesNotThrow(()=>{app=boot(undefined,{failRead:true,failWrite:true});});
  assert.match(app.nodes.get("#storageNotice").textContent,/storage|saved/i);
});

test("full backup export and import retain goals and history in a fresh controller",async()=>{
  const original=fixture(); const source=boot(JSON.stringify(original));
  source.nodes.get("#exportBtn").onclick();
  const backup=await source.blobs.at(-1).text();
  const restored=boot(JSON.stringify(fixture("Existing pear"))); restored.import(backup);
  const result=JSON.parse(restored.values.get("tally.v1"));
  assert.equal(result.goals.fiber,38); assert.equal(result.goals.sugar,24);
  assert.equal(result.goals.waterGoal,9); assert.equal(result.foods[0].name,"Saved egg");
  assert.equal(result.days["2026-07-30"].water,4);
  assert.equal(result.days["2026-07-30"].entries[0].calories,156);
});

test("failed backup persistence retains previous RAM and stored data without a success toast",()=>{
  const initial=fixture("Existing pear"); const app=boot(JSON.stringify(initial));
  const before=JSON.stringify(app.context.__controller.getState());
  const stored=app.values.get("tally.v1"); app.controls.failWrite=true;
  app.import(JSON.stringify({schemaVersion:1,...fixture("New apple")}));
  assert.equal(JSON.stringify(app.context.__controller.getState()),before);
  assert.equal(app.values.get("tally.v1"),stored);
  assert.doesNotMatch(app.nodes.get("#toastMsg").textContent,/safely brought in/i);
});

test("canceling backup replacement leaves saved data unchanged",()=>{
  const app=boot(JSON.stringify(fixture()),{confirm:false}); const before=app.values.get("tally.v1");
  app.import(JSON.stringify({schemaVersion:1,...fixture("Replacement")}));
  assert.equal(app.values.get("tally.v1"),before);
});

test("preserved bytes can be downloaded before an explicit full-backup recovery",async()=>{
  const raw="{interrupted original";const app=boot(raw);const replacement=JSON.stringify({schemaVersion:1,...fixture()});
  app.import(replacement);assert.equal(app.values.get("tally.v1"),raw);
  app.nodes.get("#exportRecoveryBtn").onclick();
  assert.equal(await app.blobs.at(-1).text(),raw);
  app.import(replacement);
  assert.equal(JSON.parse(app.values.get("tally.v1")).foods[0].name,"Saved egg");
  assert.equal(app.nodes.get("#storageNotice").hidden,true);
});

test("failed foods-only import keeps the previous in-memory list",()=>{
  const app=boot(JSON.stringify(fixture()));const before=JSON.stringify(app.context.__controller.getState());app.controls.failWrite=true;
  app.import(JSON.stringify({foods:[{name:"Unsaved apple",calories:90}]}));
  assert.equal(JSON.stringify(app.context.__controller.getState()),before);
  assert.doesNotMatch(app.nodes.get("#toastMsg").textContent,/go-tos? added/i);
});

test("zero-valued goals survive a full backup import",()=>{
  const app=boot(JSON.stringify(fixture()));const data=fixture();Object.assign(data.goals,{protein:0,fiber:0,sugar:0});
  app.import(JSON.stringify({schemaVersion:1,...data}));const stored=JSON.parse(app.values.get("tally.v1"));
  assert.equal(stored.goals.protein,0);assert.equal(stored.goals.fiber,0);assert.equal(stored.goals.sugar,0);
});
