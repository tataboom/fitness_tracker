const {test}=require('node:test');
const assert=require('node:assert/strict');
const T=require('../src/model.js');
const {EXERCISES:E}=require('../src/catalog.js');
function fixture(id='row'){
  const state=T.defaults();state.config.start='2026-09-01';
  const entry={id,name:E[id].name,target:2,range:E[id].range.slice(),unit:E[id].unit,rest:E[id].rest};
  const s=T.newSession(state,'2026-09-04',{key:'home0',name:'Upper body A',ex:[entry]});
  s.exercises[id].sets.forEach(x=>Object.assign(x,{w:'28.7',r:String(entry.range.at(-1)),rir:'2',complete:true}));
  s.finishedAt=123;s.updatedAt=123;state.sessions[s.date]=s;
  return {state,s,entry,r:s.exercises[id]};
}
test('profile reflects four days, fitness and the actual equipment kit',()=>{
  const c=T.defaults().config;assert.deepEqual(c.days,[1,2,4,5]);assert.equal(c.goal,'fitness');assert.equal(c.maxLoad,88.7);assert.equal(c.barWeight,8.7);assert.equal(c.attachmentMax,25);assert.equal(c.equipment.dumbbells,true);
  const all=T.routines(c).flatMap(p=>p.ex.map(e=>e.id));assert.ok(all.includes('legext'));assert.ok(all.includes('preach'));assert.ok(all.includes('lat'));assert.ok(!all.includes('bench'));assert.ok(!all.includes('ohext'));
});
test('equipment changes filter future routines; stored snapshots do not change',()=>{
  const {state,s}=fixture();const before=T.clone(s.snapshot);state.config.equipment.dumbbells=false;state.config.equipment.preacher=false;
  for(const p of T.routines(state.config))for(const e of p.ex){assert.ok(T.available(e.id,state.config));assert.ok(!E[e.id].equipment.includes('dumbbells'));}assert.deepEqual(s.snapshot,before);
  state.config.equipment.safeties=true;assert.ok(T.routines(state.config).flatMap(p=>p.ex).some(e=>e.id==='bench'));
});
test('two and three day settings generate full-body routines on chosen weekdays',()=>{
  for(const days of [[2,5],[1,3,5]]){const c=T.defaults().config;c.start='2026-09-01';c.days=days;assert.equal(T.routines(c).length,days.length);assert.ok(T.routines(c).every(p=>p.name.startsWith('Full body')));assert.equal(T.planAt(c,'2026-09-06'),null);}
});
test('date math is calendar-based across daylight saving and leap days',()=>{
  assert.equal(T.addDays('2027-03-22',7),'2027-03-29');assert.equal(T.monday('2027-03-28'),'2027-03-22');assert.equal(T.validDate('2026-02-30'),false);assert.equal(T.validDate('2028-02-29'),true);
});
test('a future programme starts on its configured date, not today',()=>{
  const s=T.defaults();s.config.start='2026-11-02';assert.equal(T.planAt(s.config,'2026-09-07'),null);assert.equal(T.nextPlan(s,'2026-09-06').date,'2026-11-02');
});
test('legacy migration retains workouts, extra sets, notes, and original template',()=>{
  const old={schema:3,config:{start:'2026-11-02'},sessions:{'2026-09-04':{date:'2026-09-04',day:'upperA',updatedAt:80,notes:'Keep these notes',exercises:{bench:{done:true,sets:Array.from({length:5},()=>({w:'28.7',r:'8'}))}}}},metrics:{'2026-09':{days:{'4':{bw:'82.5',waist:'88'}}}}};
  const state=T.migrate(old),s=state.sessions['2026-09-04'];assert.equal(s.exercises.bench.sets.length,5);assert.equal(s.notes,old.sessions['2026-09-04'].notes);assert.equal(s.snapshot[0].id,'bench');assert.ok(s.exercises.bench.sets.every(x=>x.complete));assert.equal(s.snapshot.find(e=>e.id==='incdb').name,'Incline dumbbell press');assert.equal(state.metrics['2026-09'].days['4'].bw,'82.5');assert.equal(state.config.start,'2026-11-02');assert.equal(old.schema,3);
});
test('empty legacy install sheds only the old hard-coded future date',()=>{
  const s=T.migrate({schema:3,config:{start:'2026-11-02'},sessions:{},metrics:{}});assert.equal(s.config.start,T.today());const v4=T.defaults();v4.config.start='2026-11-02';assert.equal(T.migrate(v4).config.start,'2026-11-02');
});
test('backup round trip preserves the modern log and settings',()=>{
  const {state}=fixture();state.config.coachNotes='Keep range controlled';assert.deepEqual(T.migrate(JSON.parse(JSON.stringify(state))),state);
});
test('merge keeps newer local sessions and measurements and preserves local preferences',()=>{
  const {state}=fixture();state.metrics={'2026-09':{month:'2026-09',days:{'4':{bw:'80',waist:'85',updatedAt:20}}}};
  const incoming=T.clone(state);incoming.app='iron-logbook';incoming.sessions['2026-09-04'].updatedAt=120;incoming.sessions['2026-09-04'].notes='Older note';incoming.config.goal='muscle';incoming.metrics['2026-09'].days['4']={bw:'90',waist:'90',updatedAt:10};
  const merged=T.mergeBackup(state,incoming);assert.equal(merged.sessions['2026-09-04'].notes,'');assert.equal(merged.config.goal,'fitness');assert.equal(merged.metrics['2026-09'].days['4'].bw,'80');
  incoming.sessions['2026-09-04'].updatedAt=200;assert.equal(T.mergeBackup(state,incoming).sessions['2026-09-04'].notes,'Older note');
});
test('malformed and unsafe imports fail before touching local data',()=>{
  const {state}=fixture(),original=JSON.stringify(state);
  assert.throws(()=>T.mergeBackup(state,{app:'different'}));
  assert.throws(()=>T.mergeBackup(state,{app:'iron-logbook',schema:99}));
  assert.throws(()=>T.mergeBackup(state,JSON.parse('{"app":"iron-logbook","config":{"__proto__":{"polluted":true}}}')));
  const invalid={app:'iron-logbook',...T.clone(state)};invalid.sessions['2026-09-04'].snapshot.push(invalid.sessions['2026-09-04'].snapshot[0]);assert.throws(()=>T.mergeBackup(state,invalid));assert.equal(JSON.stringify(state),original);assert.equal({}.polluted,undefined);
});
test('progression needs every planned set, every rep target and a consistent load',()=>{
  const {state,entry,r}=fixture();assert.equal(T.recommend(state,entry,'2026-09-06').next,30.7);
  r.sets[1].complete=false;assert.equal(T.recommend(state,entry,'2026-09-06').kind,'hold');r.sets[1].complete=true;r.sets[1].r='8';assert.equal(T.recommend(state,entry,'2026-09-06').kind,'hold');r.sets[1].r='12';r.sets[1].w='26.7';assert.equal(T.recommend(state,entry,'2026-09-06').kind,'hold');
});
test('missing effort, reported pain, low readiness, and high effort hold progression',()=>{
  const {state,s,entry,r}=fixture();r.sets[1].rir='';assert.equal(T.recommend(state,entry,'2026-09-06').kind,'hold');r.sets[1].rir='2';r.pain=true;assert.equal(T.recommend(state,entry,'2026-09-06').kind,'review');r.pain=false;s.readiness='low';assert.equal(T.recommend(state,entry,'2026-09-06').kind,'hold');s.readiness='normal';s.effort='too-hard';assert.equal(T.recommend(state,entry,'2026-09-06').kind,'hold');
});
test('progression respects barbell, attachment and vertical-grip limits',()=>{
  const bar=fixture();bar.r.sets.forEach(x=>x.w='88.7');assert.equal(T.recommend(bar.state,bar.entry,'2026-09-06').kind,'cap');
  const leg=fixture('legext');leg.r.sets.forEach(x=>x.w='24');assert.equal(T.recommend(leg.state,leg.entry,'2026-09-06').kind,'cap');
  const goblet=fixture('goblet');goblet.r.sets.forEach(x=>x.w='14');assert.equal(T.recommend(goblet.state,goblet.entry,'2026-09-06').kind,'cap');
});
test('timed and bodyweight targets never recommend kilogram jumps',()=>{
  for(const id of ['plank','squat']){const f=fixture(id);f.r.sets.forEach(x=>x.w='');assert.equal(T.recommend(f.state,f.entry,'2026-09-06').kind,'control');assert.equal(T.totals(f.s).volume,0);}
});
test('invalid entries do not pass completion; zero reps-left remains valid',()=>{
  const {state,entry}=fixture();assert.ok(T.setError({w:'-10',r:'8',rir:''},entry,state.config));assert.ok(T.setError({w:'28.7',r:'2.5',rir:''},entry,state.config));assert.ok(T.setError({w:'99',r:'8',rir:''},entry,state.config));assert.ok(T.setError({w:'2',r:'8',rir:''},entry,state.config));assert.equal(T.setError({w:'28,7',r:'8',rir:'0'},entry,state.config),null);
  const leg=fixture('legext');assert.ok(T.setError({w:'26',r:'10',rir:'2'},leg.entry,leg.state.config));
});
test('volume counts completed work even when the remaining exercise is skipped',()=>{
  const {s,r}=fixture();r.sets[1].complete=false;r.skipped=true;const result=T.totals(s);assert.equal(result.sets,1);assert.equal(result.volume,28.7*12);
});
test('paired dumbbells and per-side lifts include both sides, goblet uses one load',()=>{
  for(const id of ['lat','onerow','goblet']){const f=fixture(id);f.r.sets.forEach(x=>Object.assign(x,{w:'10',r:'10'}));assert.equal(T.totals(f.s).volume,id==='goblet'?200:400);}
});
test('all-skipped or unlogged sessions are not complete',()=>{
  const f=fixture();f.r.sets.forEach(x=>x.complete=false);f.r.skipped=true;assert.equal(T.completeSession(f.s),false);f.r.skipped=false;f.r.sets.forEach(x=>x.complete=true);assert.equal(T.completeSession(f.s),true);
});
test('weekly body trend averages by actual Monday and excludes missing weight',()=>{
  const s=T.defaults();s.metrics={'2026-09':{days:{'1':{bw:'80',waist:'85'},'2':{bw:'82',waist:''},'3':{bw:'',waist:'85'},'8':{bw:'80',waist:''}}}};assert.deepEqual(T.weeklyWeights(s),[{date:'2026-08-31',value:81,count:2},{date:'2026-09-07',value:80,count:1}]);
});
test('plate calculator balances inventory and uses correct bar/handle tare',()=>{
  const c=T.defaults().config;const bar=T.plateLoad(28.7,'barbell',c);assert.deepEqual(bar.plates,[{size:10,count:1}]);assert.equal(bar.base,8.7);assert.equal(T.plateLoad(88.7,'barbell',c).plates.reduce((n,p)=>n+p.size*p.count,0),40);assert.ok(T.plateLoad(29,'barbell',c).error);assert.ok(T.plateLoad(90.7,'barbell',c).error);const pair=T.plateLoad(42,'pair',c);assert.equal(pair.sides,4);assert.equal(pair.plates.reduce((n,p)=>n+p.size*p.count,0),20);assert.ok(T.plateLoad(44,'pair',c).error);
});
test('an early workout keeps its real date and satisfies the originally scheduled day',()=>{
  const state=T.defaults();state.config.start='2026-09-06';const plan=T.nextPlan(state,'2026-09-06');assert.equal(plan.date,'2026-09-07');
  const s=T.newSession(state,'2026-09-06',plan);s.finishedAt=1;state.sessions[s.date]=s;
  assert.equal(s.date,'2026-09-06');assert.equal(s.scheduledFor,'2026-09-07');assert.equal(T.sessionOn(state,'2026-09-07'),s);assert.equal(T.nextPlan(state,'2026-09-07').date,'2026-09-08');
});
