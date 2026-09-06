const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
function worker(){
  const handlers={},stored=new Map(),deleted=[],network=[];let precached=[];
  const cache={addAll:async assets=>{precached=[...assets];assets.forEach(a=>stored.set(a,new Response('cached '+a)));},match:async key=>stored.get(key)?.clone()};
  const context={URL,Response,Promise,self:{location:{origin:'https://example.test',href:'https://example.test/fitness_tracker/sw.js'},clients:{claim:async()=>{}},addEventListener:(type,cb)=>handlers[type]=cb},caches:{open:async()=>cache,keys:async()=>['iron-logbook-v1','other-app-cache'],delete:async k=>deleted.push(k)},fetch:async req=>{network.push(req.url);throw Error('Offline');}};
  vm.runInNewContext(source,context);
  return {handlers,deleted,network,get assets(){return precached;},async install(){await new Promise(resolve=>handlers.install({waitUntil:promise=>resolve(promise)}));}};
}
test('offline install includes every public runtime dependency',async()=>{
  const w=worker();await w.install();
  for(const asset of ['index.html','src/app.js','src/model.js','src/poses.js','src/catalog.js','src/styles.css','icons/mark.svg','manifest.webmanifest'])assert.ok(w.assets.includes('./'+asset),asset);
  for(const asset of w.assets)assert.ok(fs.existsSync(path.join(__dirname,'..',asset)),asset);
});
test('activation removes only this app’s older caches',async()=>{
  const w=worker();await new Promise(resolve=>w.handlers.activate({waitUntil:p=>resolve(p)}));assert.deepEqual(w.deleted,['iron-logbook-v1']);
});
test('offline navigation and query variants resolve the versioned shell under a subpath',async()=>{
  const w=worker();await w.install();
  for(const pathname of ['index.html?demo=1','src/model.js','?demo=1']){let response;w.handlers.fetch({request:{url:'https://example.test/fitness_tracker/'+pathname,method:'GET'},respondWith:p=>response=p});assert.ok(response);assert.match(await (await response).text(),/^cached/);}
  assert.equal(w.network.length,0);
});
test('the worker leaves external URLs, unrelated apps, POSTs and unknown resources alone',async()=>{
  const w=worker();let responses=0;
  for(const [url,method] of [['https://external.test/data','GET'],['https://example.test/other/index.html','GET'],['https://example.test/fitness_tracker/index.html','POST'],['https://example.test/fitness_tracker/private.json','GET']])w.handlers.fetch({request:{url,method},respondWith:()=>responses++});assert.equal(responses,0);
});
