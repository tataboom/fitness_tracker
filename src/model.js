(function(root) {
  'use strict';
  const C = typeof module !== 'undefined' ? require('./catalog.js') : root;
  const legacy = typeof module !== 'undefined' ? require('./poses.js').LEGACY_PROGRAM : LEGACY_PROGRAM;
  const E = C.EXERCISES;
  const clone = value => JSON.parse(JSON.stringify(value));
  const number = value => {
    if(value == null || String(value).trim()==='') return null;
    const s=String(value).trim().replace(',','.');
    return /^\d+(\.\d+)?$/.test(s) && Number.isFinite(+s) ? +s : null;
  };
  const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today = () => iso(new Date());
  const date = s => new Date(s+'T12:00:00');
  const addDays = (s,n) => {const d=date(s);d.setDate(d.getDate()+n);return iso(d);};
  const monday = s => addDays(s,-((date(s).getDay()+6)%7));
  const validDate = s => typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(date(s)) && iso(date(s))===s;
  const defaults = () => ({schema:4,config:{start:today(),name:'',goal:'fitness',days:[1,2,4,5],experience:'new',duration:45,maxLoad:88.7,increment:2,barWeight:8.7,attachmentMax:25,dumbbellMax:42,verticalMax:15,equipment:{barbell:true,bench:true,preacher:true,legExtension:true,dumbbells:true,safeties:false},setup:false,autoRest:true},sessions:{},metrics:{}});
  const available = (id,cfg) => E[id] && E[id].equipment.every(k=>cfg.equipment[k]);
  function routines(cfg) {
    const press=available('bench',cfg)?'bench':available('pushup',cfg)?'pushup':'pike';
    const squat=available('goblet',cfg)?'goblet':'squat';
    const row=available('row',cfg)?'row':available('onerow',cfg)?'onerow':null;
    const hinge=available('bbrdl',cfg)?'bbrdl':available('dbrdl',cfg)?'dbrdl':'bridge';
    const curl=available('preach',cfg)?'preach':available('curl',cfg)?'curl':available('hammer',cfg)?'hammer':null;
    const legs=available('legext',cfg)?'legext':'split';
    const shoulder=available('lat',cfg)?'lat':'pike';
    let rows=cfg.days.length===4 ? [
      ['Upper body A','Build your push & pull',[press,row,shoulder,curl,'deadbug']],
      ['Lower body A','Strong legs, steady foundations',[squat,hinge,legs,'calfBW','plank']],
      ['Upper body B','Control every repetition',[row,press,curl,shoulder,'plank']],
      ['Lower body B','Hinge, balance & core',[hinge,'split',legs,'bridge','deadbug']]
    ] : [
      ['Full body A','Build your foundation',[squat,press,row,legs,'plank']],
      ['Full body B','Strength in every movement',[hinge,'split',press,curl,'deadbug']],
      ['Full body C','Make every rep count',[squat,row,press,'bridge',curl]]
    ].slice(0,cfg.days.length);
    return rows.map((r,i)=>({key:'home'+i,name:r[0],tag:r[1],ex:r[2].filter(Boolean).filter((id,n,a)=>available(id,cfg)&&a.indexOf(id)===n).slice(0,cfg.duration===30?4:5).map(id=>({id,name:E[id].name,target:cfg.experience==='new'?2:3,range:E[id].range.slice(),unit:E[id].unit,rest:E[id].rest}))}));
  }
  function planAt(cfg,d) {
    if(d<cfg.start)return null;
    const idx=cfg.days.indexOf(date(d).getDay());
    return idx<0?null:routines(cfg)[idx];
  }
  function nextPlan(state,from=today()) {
    const first=from<state.config.start?state.config.start:from;
    for(let i=0;i<14;i++){const d=addDays(first,i),p=planAt(state.config,d);if(p && !sessionOn(state,d)?.finishedAt)return {date:d,...p};}
    return null;
  }
  function newSession(state,d,plan) {
    const snapshot=clone(plan.ex);
    return {date:d,scheduledFor:plan.scheduledFor||plan.date||d,day:plan.key,name:plan.name,snapshot,startedAt:Date.now(),updatedAt:Date.now(),exercises:Object.fromEntries(snapshot.map(e=>[e.id,{sets:Array.from({length:e.target},()=>({w:'',r:'',rir:'',complete:false})),done:false,skipped:false,skipReason:''}])),notes:'',readiness:'normal'};
  }
  function migrate(input) {
    if(!input || typeof input!=='object' || Array.isArray(input))throw Error('This file does not contain a training log.');
    if(input.schema>4)throw Error('This backup is from a newer app. Update before importing it.');
    function safeKeys(value,depth=0){if(depth>15)throw Error('Backup nesting is invalid.');if(!value||typeof value!=='object')return;for(const key of Object.keys(value)){if(['__proto__','prototype','constructor'].includes(key))throw Error('Unsafe field in backup.');safeKeys(value[key],depth+1);}}
    safeKeys(input);
    const out=defaults();
    if(input.config && typeof input.config==='object') Object.assign(out.config,clone(input.config));
    const cfg=out.config;
    cfg.equipment={...defaults().config.equipment,...cfg.equipment};
    Object.keys(cfg.equipment).forEach(k=>cfg.equipment[k]=cfg.equipment[k]===true);
    if(!Array.isArray(cfg.days)||cfg.days.length<2||cfg.days.length>4||new Set(cfg.days).size!==cfg.days.length||cfg.days.some(x=>!Number.isInteger(x)||x<0||x>6))cfg.days=[1,3,5];
    cfg.days.sort((a,b)=>((a+6)%7)-((b+6)%7));
    if(!validDate(cfg.start))cfg.start=today();
    // The old release hard-coded a future start, even for completely empty logs.
    if(input.schema!==4&&cfg.start==='2026-11-02'&&!Object.keys(input.sessions||{}).length)cfg.start=today();
    if(!['muscle','fatloss','fitness'].includes(cfg.goal))cfg.goal='muscle';
    if(!['new','experienced'].includes(cfg.experience))cfg.experience='new';
    if(![30,45,60].includes(cfg.duration))cfg.duration=45;
    cfg.name=String(cfg.name||'').slice(0,40);
    if(cfg.favorites!==undefined)cfg.favorites=Array.isArray(cfg.favorites)?cfg.favorites.filter(id=>typeof id==='string'&&E[id]):[];
    if(cfg.coachNotes!==undefined)cfg.coachNotes=String(cfg.coachNotes).slice(0,3000);
    cfg.autoRest=cfg.autoRest!==false;
    if(cfg.activeTimer && (!Number.isFinite(cfg.activeTimer.end)||!Number.isFinite(cfg.activeTimer.total)||cfg.activeTimer.total<=0||cfg.activeTimer.total>86400))delete cfg.activeTimer;
    ['maxLoad','barWeight','increment','attachmentMax','dumbbellMax','verticalMax'].forEach(k=>{cfg[k]=number(cfg[k]);if(cfg[k]!==null&&(cfg[k]<=0||cfg[k]>1000))cfg[k]=null;});
    if(!input.sessions || typeof input.sessions!=='object' || Array.isArray(input.sessions)) {if(input.sessions)throw Error('Invalid sessions in backup.');}
    for(const [d,raw] of Object.entries(input.sessions||{})) {
      if(!validDate(d)||!raw||typeof raw!=='object'||!raw.exercises||typeof raw.exercises!=='object'||Array.isArray(raw.exercises))throw Error('Invalid session in backup. Nothing was imported.');
      const s=clone(raw); s.date=d;
      s.updatedAt=Number.isFinite(+s.updatedAt)?+s.updatedAt:0;
      if(!s.snapshot) {
        const program=legacy[s.day];
        s.name=s.name||program?.name||'Imported workout';
        s.snapshot=(program?program.ex:Object.keys(s.exercises).map(id=>[id,E[id]?.name||id,2,'8-12','90 s'])).map(e=>({id:e[0],name:e[1],target:e[2],range:(String(e[3]).match(/\d+/g)||[8,12]).slice(0,2).map(Number),unit:/\d\s*s\b/.test(e[3])?'seconds':/\d\s*m\b/.test(e[3])?'metres':'reps',rest:E[e[0]]?.rest||90,legacy:true}));
        if(s.snapshot.every(e=>s.exercises[e.id]?.done||s.exercises[e.id]?.skipped)&&Object.values(s.exercises).some(r=>r.done))s.finishedAt=s.updatedAt||1;
      }
      if(!Array.isArray(s.snapshot)||s.snapshot.length>100||s.snapshot.some(e=>!e||typeof e.id!=='string'||!/^[a-zA-Z0-9_-]+$/.test(e.id)||typeof e.name!=='string'||!Array.isArray(e.range)||!e.range.length||e.range.some(n=>!Number.isFinite(n)||n<=0)||!Number.isFinite(e.rest)||e.rest<0||!['reps','seconds','metres'].includes(e.unit)||!Number.isFinite(e.target)||e.target<1||e.target>100)||new Set(s.snapshot.map(e=>e.id)).size!==s.snapshot.length)throw Error('Invalid workout template in backup.');
      for(const [id,r] of Object.entries(s.exercises)) {
        if(['__proto__','constructor','prototype'].includes(id)||!r||!Array.isArray(r.sets)||r.sets.length>100)throw Error('Invalid exercise in backup.');
        r.sets=r.sets.map(x=>{if(!x||typeof x!=='object')throw Error('Invalid set in backup.');return {w:String(x.w??''),r:String(x.r??''),rir:String(x.rir??''),complete:typeof x.complete==='boolean'?x.complete:!!r.done&&number(x.r)>0};});
      }
      for(const e of s.snapshot)if(!s.exercises[e.id])s.exercises[e.id]={sets:Array.from({length:e.target},()=>({w:'',r:'',rir:'',complete:false})),done:false,skipped:false};
      out.sessions[d]=s;
    }
    if(input.metrics && (typeof input.metrics!=='object'||Array.isArray(input.metrics)))throw Error('Invalid body measurements.');
    for(const [month,raw] of Object.entries(input.metrics||{})) {
      if(!/^\d{4}-\d{2}$/.test(month)||!raw||!raw.days||typeof raw.days!=='object'||Array.isArray(raw.days))throw Error('Invalid measurement month.');
      out.metrics[month]={month,days:{}};
      for(const [day,row] of Object.entries(raw.days)) {
        if(!validDate(month+'-'+String(day).padStart(2,'0'))||!row||typeof row!=='object')throw Error('Invalid measurement date.');
        out.metrics[month].days[String(+day)]={bw:String(row.bw??''),waist:String(row.waist??''),updatedAt:Number(row.updatedAt)||0};
      }
    }
    return out;
  }
  function mergeBackup(state,payload) {
    if(payload.app!=='iron-logbook')throw Error('Choose an Iron Logbook JSON backup.');
    const incoming=migrate(payload),out=clone(state);
    for(const [d,s] of Object.entries(incoming.sessions))if(!out.sessions[d]||s.updatedAt>out.sessions[d].updatedAt)out.sessions[d]=s;
    for(const [m,v] of Object.entries(incoming.metrics)) {
      out.metrics[m]??={month:m,days:{}};
      for(const [d,row] of Object.entries(v.days))if(!out.metrics[m].days[d]||row.updatedAt>out.metrics[m].days[d].updatedAt)out.metrics[m].days[d]=row;
    }
    return out;
  }
  function records(state,id,before='9999-12-31') {
    return Object.values(state.sessions).filter(s=>s.date<before&&s.exercises[id]&&!s.exercises[id].skipped).sort((a,b)=>b.date.localeCompare(a.date)).map(s=>({session:s,record:s.exercises[id],entry:s.snapshot.find(e=>e.id===id)}));
  }
  function recommend(state,entry,before=today()) {
    const ex=E[entry.id];
    const last=records(state,entry.id,before).find(x=>x.record.sets.some(s=>s.complete));
    if(!last)return {kind:'start',text:'Find a comfortable starting point. Finish with 2–3 good reps left.',weight:null};
    const sets=last.record.sets.filter(s=>s.complete),weight=number(sets[0]?.w);
    const base={weight,date:last.session.date};
    if(last.record.pain||last.session.readiness==='pain')return {...base,kind:'review',text:'Pain was reported last time. Review the movement before loading it again.'};
    if(last.session.readiness==='low'||last.session.effort==='too-hard')return {...base,kind:'hold',text:'Your last session felt demanding. Keep the load comfortable and reassess your energy before increasing it.'};
    const top=entry.range.at(-1);
    if(last.record.skipped||sets.length<last.record.sets.length||sets.length<entry.target||!sets.every(s=>number(s.r)>=top))return {...base,kind:'hold',text:'Keep a manageable load and build toward the top of your rep range.'};
    if(entry.unit!=='reps')return {...base,kind:'control',text:'Target reached. Keep this duration with steady breathing and good position.'};
    if(!ex || !ex.equipment.some(k=>['barbell','dumbbells','legExtension'].includes(k)))return {...base,kind:'control',text:'Target reached. Keep your reps controlled before choosing a harder variation.'};
    if(weight===null||!sets.every(s=>number(s.w)===weight))return {...base,kind:'hold',text:'Use a consistent load before considering an increase.'};
    if(!sets.every(s=>number(s.rir)!==null&&number(s.rir)>=2))return {...base,kind:'hold',text:'Rep target reached. Confirm at least 2 reps left on every set before adding weight.'};
    if(!available(entry.id,state.config))return {...base,kind:'review',text:'Review your equipment settings before repeating this movement.'};
    const max=ex.equipment.includes('barbell')?state.config.maxLoad:ex.equipment.includes('legExtension')?state.config.attachmentMax:ex.equipment.includes('dumbbells')?(entry.id==='goblet'?Math.min(state.config.verticalMax??15,state.config.dumbbellMax??42):state.config.dumbbellMax):null;
    const step=state.config.increment;
    if(!step || max===null)return {...base,kind:'ready',text:'Ready to review a small increase. Confirm your available increment and load limit in Settings.'};
    const next=Math.round((weight+step)*100)/100;
    if(next>max)return {...base,kind:'cap',text:'You have reached your configured load limit. Keep the load and work on control.'};
    return {...base,kind:'up',next,text:`All sets reached ${top} with 2+ reps left. Consider ${next} kg if you feel ready.`};
  }
  function setError(set,entry,cfg) {
    const reps=number(set.r),weight=number(set.w),rir=number(set.rir),ex=E[entry.id];
    if(reps===null||reps<=0||reps>10000||entry.unit==='reps'&&!Number.isInteger(reps))return `Enter a valid ${entry.unit==='seconds'?'duration in seconds':entry.unit==='metres'?'distance in metres':'whole number of reps'}.`;
    const weighted=ex?ex.equipment.some(k=>['barbell','dumbbells','legExtension'].includes(k)):set.w!=='';
    if(weighted&&(weight===null||weight<0))return 'Enter the weight you actually used (0 is allowed for an unloaded attachment).';
    if(ex?.equipment.includes('barbell') && cfg.maxLoad!==null && weight>cfg.maxLoad)return `This exceeds your ${cfg.maxLoad} kg barbell limit. Check the value or your equipment settings.`;
    if(ex?.equipment.includes('barbell') && cfg.barWeight!==null && weight<cfg.barWeight)return `Include the ${cfg.barWeight} kg bar in the total load.`;
    if(ex?.equipment.includes('legExtension') && cfg.attachmentMax!==null && weight>cfg.attachmentMax)return 'This exceeds your configured attachment limit.';
    if(ex?.equipment.includes('dumbbells') && cfg.dumbbellMax!==null && weight>cfg.dumbbellMax)return 'This exceeds your configured per-dumbbell limit.';
    if(entry.id==='goblet' && weight>(cfg.verticalMax??15))return 'This exceeds the vertical-grip dumbbell limit for your kit.';
    if(set.rir!==''&&(rir===null||rir>5||!Number.isInteger(rir)))return 'Reps left must be a whole number from 0 to 5, or left blank.';
    return null;
  }
  function totals(session) {
    let sets=0,volume=0;
    for(const e of session.snapshot||[]) {
      const r=session.exercises[e.id];if(!r)continue;
      for(const x of r.sets)if(x.complete&&number(x.r)>0){sets++;if(e.unit==='reps'&&number(x.w)!==null){const ex=E[e.id];const multiplier=ex?.equipment.includes('dumbbells')&&(!ex.side&&['dbrdl','lat','hammer'].includes(e.id)||ex.side)?2:ex?.side?2:1;volume+=number(x.w)*number(x.r)*multiplier;}}
    }
    return {sets,volume};
  }
  function measurements(state) {
    return Object.entries(state.metrics).flatMap(([m,v])=>Object.entries(v.days).map(([d,r])=>({date:m+'-'+String(d).padStart(2,'0'),...r}))).filter(r=>number(r.bw)>0||number(r.waist)>0).sort((a,b)=>a.date.localeCompare(b.date));
  }
  function weeklyWeights(state) {
    const buckets={};measurements(state).filter(r=>number(r.bw)>0).forEach(r=>{(buckets[monday(r.date)]??=[]).push(number(r.bw));});
    return Object.entries(buckets).sort(([a],[b])=>a.localeCompare(b)).map(([date,values])=>({date,value:values.reduce((a,b)=>a+b,0)/values.length,count:values.length}));
  }
  function completeSession(s) { return s.snapshot.every(e=>s.exercises[e.id]?.skipped||s.exercises[e.id]?.sets.every(x=>x.complete)) && totals(s).sets>0; }
  function plateLoad(total,kind,cfg) {
    const base=kind==='barbell'?cfg.barWeight:2,sides=kind==='pair'?4:2;
    if(base===null)return {error:'Enter your bar weight in Settings first.'};
    const target=(total-base)/2;
    if(target<0)return {error:`Include the ${base} kg bar or handle in your target.`};
    const max=kind==='barbell'?Math.min(cfg.maxLoad??88.7,88.7):Math.min(cfg.dumbbellMax??42,42);
    if(total>max)return {error:`This exceeds the configured ${max} kg limit for this setup.`};
    const inventory=[[10,4],[5,4],[2,8],[1,4]];
    function find(i,left,picked){if(i===inventory.length)return Math.abs(left)<.001?picked:null;const [size,count]=inventory[i];for(let n=Math.min(Math.floor(count/sides),Math.floor((left+.001)/size));n>=0;n--){const out=find(i+1,left-size*n,[...picked,{size,count:n}]);if(out)return out;}return null;}
    const plates=find(0,target,[]);return plates?{base,total,plates:plates.filter(p=>p.count),sides}:{error:'This load cannot be built evenly with the plates in your Domyos kit. Try a 2 kg step.'};
  }
  function sessionOn(state,d){return state.sessions[d]||Object.values(state.sessions).find(s=>s.scheduledFor===d);}
  const api={clone,number,iso,today,date,addDays,monday,validDate,defaults,available,routines,planAt,nextPlan,newSession,migrate,mergeBackup,records,recommend,setError,totals,measurements,weeklyWeights,completeSession,plateLoad,sessionOn};
  if(typeof module!=='undefined')module.exports=api;else root.Training=api;
})(typeof window!=='undefined'?window:globalThis);
