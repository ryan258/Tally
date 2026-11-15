const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Runs the real inline controller against an in-memory DOM/storage boundary.
// This proves persistence decisions, not mobile layout, touch or PWA acceptance.
function boot(initialRaw, options={}) {
  const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
  const sheetIds=["foodSheet","exSheet","manageSheet","goalSheet","menuSheet"];
  const nodes=new Map(),timers=[];
  function element(key="") {
    if(nodes.has(key)) return nodes.get(key);
    const attrs={}; const classes=new Set();
    const markup=key.startsWith("#") ? html.match(new RegExp('<[A-Za-z][^>]*\\bid="'+key.slice(1)+'"[^>]*>'))?.[0] : null;
    const node={value:"",textContent:"",innerHTML:"",hidden:false,checked:false,
      tagName:markup?.match(/^<(\w+)/)?.[1].toUpperCase()||"DIV",
      inert:!!markup?.match(/\binert(?:[\s=>]|$)/),disabled:false,tabIndex:0,parentElement:null,
      firstElementChild:{style:{}},dataset:{},style:{setProperty(){}},children:[],offsetHeight:20,clientWidth:390,
      classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},contains(n){return classes.has(n);},toggle(n,on){const keep=on===undefined?!classes.has(n):on;keep?classes.add(n):classes.delete(n);return keep;}},
      events:{},addEventListener(name,handler){this.events[name]=handler;},removeEventListener(){},appendChild(child){this.children.push(child);child.parentElement=this;return child;},append(){},remove(){},click(){if(this.onclick)this.onclick();},
      focus(){document.activeElement=this;},blur(){if(document.activeElement===this)document.activeElement=document.body;},scrollIntoView(){},
      contains(child){return child===this||this.children.some(node=>node.contains(child));},
      getClientRects(){return this.hidden||this.rendered===false?[]:[{}];},
      querySelector(s){
        if(sheetIds.includes(key.slice(1))&&s==="[data-autofocus]"){
          const id=key==="#foodSheet"?"#fName":key==="#exSheet"?"#eName":null;
          return id?element(id):null;
        }
        return element(key+" "+s);
      },querySelectorAll(){return this.focusable||[];},
      closest(s){let node=this;while(node){if(s==="[inert]"&&node.inert)return node;node=node.parentElement;}return null;},matches(){return false;},
      setAttribute(k,v){attrs[k]=v;},getAttribute(k){return attrs[k]??null;},removeAttribute(k){delete attrs[k];},
      getBoundingClientRect(){return {top:0,left:0,width:390,height:20,bottom:20};},
      getContext(){return new Proxy({measureText(){return {width:10};},createLinearGradient(){return {addColorStop(){}};}},{get(o,k){return o[k]??(()=>{});},set(o,k,v){o[k]=v;return true;}});}
    };
    nodes.set(key,node);return node;
  }
  const values=new Map(initialRaw===undefined?[]:[["tally.v1",initialRaw]]);
  const controls={failWrite:!!options.failWrite,failRead:!!options.failRead,writes:0}; const blobs=[];
  const document={querySelector:element,querySelectorAll:s=>s===".sheet"?sheetIds.map(id=>element("#"+id)):[],getElementById:id=>element("#"+id),createElement:()=>element("created-"+nodes.size),createDocumentFragment:()=>element("fragment-"+nodes.size),
    events:{},addEventListener(name,handler){this.events[name]=handler;},contains:node=>[...nodes.values()].includes(node),
    body:element("body"),documentElement:element("html"),hidden:false};
  document.activeElement=document.body;
  const context={console,document,navigator:{},Date,Math,JSON,Blob,URL,URLSearchParams,
    localStorage:{getItem(k){if(controls.failRead&&k==="tally.v1")throw Error("blocked");return values.get(k)??null;},setItem(k,v){controls.writes++;if(controls.failWrite&&k==="tally.v1")throw Error("full");values.set(k,v);},removeItem(k){values.delete(k);}},
    location:{search:"",pathname:"/"},history:{replaceState(){}},confirm:()=>options.confirm!==false,
    matchMedia:()=>({matches:true,addEventListener(){}}),addEventListener(){},
    setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout(){},setInterval:()=>1,requestAnimationFrame:()=>1,
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
  let code=html.match(/<script>\s*(\(function\(\)\{[\s\S]*?)<\/script>/)[1];
  const end=code.lastIndexOf("})();");
  code=code.slice(0,end)+"globalThis.__controller={getState:()=>state,save,sanitizeGoals,show,hide};\n"+code.slice(end);
  vm.runInContext(code,context);
  return {context,nodes,values,controls,blobs,element,flushTimers(){timers.splice(0).forEach(fn=>fn());},import(text){nodes.get("#importFile").onchange({target:{files:[{text}],value:"fixture"}});}};
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

// Synthetic credential fixtures only. No real browser/profile or provider calls.
const SYNTHETIC_KEY="synthetic-usda-key-not-a-real-credential";
function settingsFixture(){return JSON.stringify({...fixture(),usdaApiKey:SYNTHETIC_KEY});}

test("USDA key markup is masked with a named native reveal button",()=>{
  const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
  const input=html.match(/<input\b[^>]*id="menuUsdaKey"[^>]*>/)[0];
  assert.match(input,/type="password"/);
  assert.match(html,/<label for="menuUsdaKey">USDA API Key<\/label>/);
  assert.match(html,/<button\b[^>]*id="toggleUsdaKey"[^>]*type="button"[^>]*aria-controls="menuUsdaKey"[^>]*>SHOW API KEY<\/button>/);
});

test("repeated USDA reveal and hide preserve the value without storage writes",()=>{
  const app=boot(settingsFixture());
  app.nodes.get("#openMenu").onclick();
  const input=app.nodes.get("#menuUsdaKey"),button=app.nodes.get("#toggleUsdaKey");
  const stored=app.values.get("tally.v1"),writes=app.controls.writes;
  assert.equal(input.type,"password");
  for(let i=0;i<4;i++){
    button.onclick();assert.equal(input.type,"text");assert.equal(button.textContent,"HIDE API KEY");
    button.onclick();assert.equal(input.type,"password");assert.equal(button.textContent,"SHOW API KEY");
    assert.equal(input.value,SYNTHETIC_KEY);
  }
  assert.equal(app.controls.writes,writes);
  assert.equal(app.values.get("tally.v1"),stored);
});

test("dismissal and reopening remask an exposed USDA key without changing it",()=>{
  const app=boot(settingsFixture());
  for(let i=0;i<3;i++){
    app.nodes.get("#openMenu").onclick();
    const input=app.nodes.get("#menuUsdaKey"),button=app.nodes.get("#toggleUsdaKey");
    assert.equal(input.type,"password");
    button.onclick();assert.equal(input.type,"text");
    app.context.__controller.hide();
    assert.equal(input.type,"password");assert.equal(button.textContent,"SHOW API KEY");
    assert.equal(input.value,SYNTHETIC_KEY);
  }
  app.nodes.get("#openMenu").onclick();
  assert.equal(app.nodes.get("#menuUsdaKey").type,"password");
});

test("switching from settings to another sheet remasks the USDA key",()=>{
  const app=boot(settingsFixture());app.nodes.get("#openMenu").onclick();
  app.nodes.get("#toggleUsdaKey").onclick();
  assert.equal(app.nodes.get("#menuUsdaKey").type,"text");
  app.context.__controller.show("foodSheet");
  assert.equal(app.nodes.get("#menuUsdaKey").type,"password");
  assert.equal(app.nodes.get("#menuUsdaKey").value,SYNTHETIC_KEY);
});

test("editing a masked or revealed USDA key retains existing trim and save behavior",()=>{
  const app=boot(settingsFixture());app.nodes.get("#openMenu").onclick();
  const input=app.nodes.get("#menuUsdaKey"),button=app.nodes.get("#toggleUsdaKey");
  for(const type of ["password","text"]){
    assert.equal(input.type,type);
    const value="synthetic-edited-"+type;
    input.value="  "+value+"  ";input.events.input();
    assert.equal(app.context.__controller.getState().usdaApiKey,value);
    assert.equal(JSON.parse(app.values.get("tally.v1")).usdaApiKey,value);
    input.events.change();
    assert.equal(JSON.parse(app.values.get("tally.v1")).usdaApiKey,value);
    button.onclick();
  }
  app.context.__controller.hide();app.nodes.get("#openMenu").onclick();
  assert.equal(input.type,"password");assert.equal(input.value,"synthetic-edited-text");
});

test("malformed backup containers cannot replace existing saved history",()=>{
  const malformed=[
    {foods:[],days:[]},
    {foods:"not a food list",days:{}},
    {foods:[],days:"not history"},
    {foods:[],days:{},goals:[]},
    {foods:[],days:{},goals:"not goals"},
  ];
  for(const data of malformed){
    const app=boot(JSON.stringify(fixture()));
    const stored=app.values.get("tally.v1"),before=JSON.stringify(app.context.__controller.getState());
    app.import(JSON.stringify(data));
    assert.equal(app.values.get("tally.v1"),stored,"invalid containers must not overwrite persisted data");
    assert.equal(JSON.stringify(app.context.__controller.getState()),before);
    assert.doesNotMatch(app.nodes.get("#toastMsg").textContent,/safely brought in|go-tos? added/i);
  }
});


function keyEvent(key,target,shiftKey=false){
  return {key,target,shiftKey,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}};
}
function sheetControls(app,id,ids){
  const sheet=app.nodes.get("#"+id);
  const controls=ids.map(id=>app.element(id));
  controls.forEach(node=>{node.tagName="BUTTON";sheet.appendChild(node);});
  sheet.focusable=controls;
  return {sheet,controls};
}

test("closed sheets start inert and each dialog has an accessible heading",()=>{
  const app=boot(JSON.stringify(fixture()));
  const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
  for(const id of ["foodSheet","exSheet","manageSheet","goalSheet","menuSheet"]){
    const markup=html.match(new RegExp('<div[^>]*id="'+id+'"[^>]*>'))[0];
    assert.match(markup,/\binert(?:[\s=>]|$)/,id+" must be inert before JS runs");
    assert.match(markup,/role="dialog"/);assert.match(markup,/aria-modal="true"/);
    const label=markup.match(/aria-labelledby="([^"]+)"/)[1];
    assert.match(html,new RegExp('<h3[^>]*id="'+label+'"'));
    assert.equal(app.nodes.get("#"+id).inert,true);
  }
});

test("opening and switching sheets isolates focus and preserves the original opener",()=>{
  const app=boot(JSON.stringify(fixture()));
  const doc=app.context.document,opener=app.nodes.get("#addFood");opener.focus();
  const writes=app.controls.writes;
  app.context.__controller.show("foodSheet");
  assert.equal(app.nodes.get("#foodSheet").inert,false);
  assert.equal(app.nodes.get("#exSheet").inert,true);
  assert.equal(app.nodes.get("#app").inert,true);
  assert.equal(app.nodes.get("#mainHeader").inert,true);
  app.context.__controller.show("exSheet");app.flushTimers();
  assert.equal(doc.activeElement,app.nodes.get("#eName"));
  assert.equal(app.nodes.get("#foodSheet").inert,true);
  assert.equal(app.nodes.get("#exSheet").inert,false);
  app.context.__controller.hide();
  assert.equal(doc.activeElement,opener);
  assert.equal(app.nodes.get("#exSheet").inert,true);
  assert.equal(app.nodes.get("#app").inert,false);
  assert.equal(app.nodes.get("#mainHeader").inert,false);
  assert.equal(app.controls.writes,writes);
});

test("Tab and Shift Tab wrap inside the active sheet and skip unavailable controls",()=>{
  const app=boot(JSON.stringify(fixture()));
  const {sheet,controls:[first,middle,last,hidden,disabled]}=sheetControls(app,"foodSheet",["first-meal","#fName","#fSubmit","hidden-control","disabled-control"]);
  hidden.rendered=false;disabled.disabled=true;
  app.context.__controller.show("foodSheet");
  last.focus();let event=keyEvent("Tab",last);app.context.document.events.keydown(event);
  assert.equal(event.defaultPrevented,true);assert.equal(app.context.document.activeElement,first);
  event=keyEvent("Tab",first,true);app.context.document.events.keydown(event);
  assert.equal(event.defaultPrevented,true);assert.equal(app.context.document.activeElement,last);
  middle.focus();event=keyEvent("Tab",middle);app.context.document.events.keydown(event);
  assert.equal(event.defaultPrevented,false);assert.equal(app.context.document.activeElement,middle);
  sheet.focus();event=keyEvent("Tab",sheet,true);app.context.document.events.keydown(event);
  assert.equal(event.defaultPrevented,true);assert.equal(app.context.document.activeElement,last);
});

test("empty sheets retain focus and Escape restores the opener",()=>{
  const app=boot(JSON.stringify(fixture()));
  const opener=app.nodes.get("#openMenu");opener.focus();
  app.context.__controller.show("menuSheet");app.flushTimers();
  const sheet=app.nodes.get("#menuSheet"),event=keyEvent("Tab",sheet);
  app.context.document.events.keydown(event);
  assert.equal(event.defaultPrevented,true);assert.equal(app.context.document.activeElement,sheet);
  app.context.document.events.keydown(keyEvent("Escape",sheet));
  assert.equal(app.context.document.activeElement,opener);assert.equal(sheet.inert,true);
});

test("Enter on goal buttons preserves their native action without submitting",()=>{
  const app=boot(JSON.stringify(fixture()));let saves=0;
  app.nodes.get("#goalSubmit").click=()=>{saves++;};
  for(const id of ["goal-cancel","ratio-preset","#goalSubmit"]){
    const button=app.element(id);button.tagName="BUTTON";
    const event=keyEvent("Enter",button);
    app.nodes.get("#goalSheet").events.keydown(event);
    assert.equal(saves,0,"button Enter must not synthesize an extra save");
    assert.equal(event.defaultPrevented,false);
  }
  const input=app.nodes.get("#goalCalInput");input.tagName="INPUT";
  const event=keyEvent("Enter",input);app.nodes.get("#goalSheet").events.keydown(event);
  assert.equal(saves,1);assert.equal(event.defaultPrevented,true);
});
