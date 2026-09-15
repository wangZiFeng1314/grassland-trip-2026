'use strict';
const fs=require('fs');const path=require('path');const vm=require('vm');
const dir=__dirname;
const template=fs.readFileSync(path.join(dir,'page-template.html'),'utf8');
const trip=JSON.parse(fs.readFileSync(path.join(dir,'researchData.json'),'utf8'));
const scripts=[...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].slice(1);
const sandbox={};vm.createContext(sandbox);vm.runInContext(scripts[0][1],sandbox);vm.runInContext(scripts[1][1],sandbox);
const esc=sandbox.escapeHTML;
trip.days.forEach(d=>d.slots.forEach(s=>{if(s.rawGCJ){const p=sandbox.gcj02ToWgs84(...s.rawGCJ);s.lat=+p.lat.toFixed(6);s.lng=+p.lng.toFixed(6);s.coordinateSystem='WGS-84 converted from documented GCJ-02';}else{s.coordinateSystem='WGS-84 documented regional marker';}s.photo='';s.rating=null;s.needsBooking=false;s.leadDays=0;}));
const sources=new Map(trip.sources.map(s=>[s.id,s]));
function refs(ids){return '<div class="sources-inline">'+ids.map(id=>{if(!sources.has(id))throw new Error('Missing source '+id);return '<a href="#src-'+esc(id)+'">'+esc(sources.get(id).name.split('｜')[0])+' ↗</a>';}).join('')+'</div>';}
function paragraph(s){return '<p>'+esc(s)+'</p>';}
function stop(a){return '<article class="stop"><div class="time">'+esc(a.time)+'</div><h3>'+esc(a.name)+'</h3><span class="tag '+(a.status.includes('候选')?'candidate':'')+'">'+esc(a.status)+'</span><p class="small">'+esc(a.detail)+'</p><div class="data-row"><div><b>范围：</b>'+esc(a.distance)+'</div><div><b>停留：</b>'+esc(a.duration)+'</div><div><b>费用：</b>'+esc(a.cost)+'</div>'+(a.openingHours?'<div><b>开放：</b>'+esc(a.openingHours)+'</div>':'')+'</div>'+refs(a.sources)+'</article>';}
function meal(m){return '<article class="meal"><span class="label">'+esc(m.meal)+'</span><h3>'+esc(m.place)+'</h3><p class="dim">'+esc(m.address)+'</p><p class="small">'+esc(m.hours)+'</p><div class="price">'+esc(m.perPerson)+' · '+esc(m.groupBudget)+'</div><ul class="dishes">'+m.dishes.map(d=>'<li>'+esc(d.name)+'<br><span class="caption">'+esc(d.price)+'</span></li>').join('')+'</ul><p class="meal-note">'+esc(m.note)+'</p>'+refs(m.sources)+'</article>';}
function day(d,i){return '<section class="day" id="day-'+i+'"><div class="day-heading"><div class="day-num"><small>DAY</small><strong>'+i+'</strong></div><div><span class="label">'+esc(d.date)+' / '+esc(d.weekday)+'</span><h2>'+esc(d.theme)+'</h2></div></div><div class="route-summary"><strong>'+esc(d.route)+'</strong><br>'+esc(d.km)+'公里 · 基础车程'+esc(d.baseDrive)+'<br><span class="dim">'+esc(d.driveBudget)+'<br>当晚落点：'+esc(d.sleep)+'</span></div><div class="timeline">'+d.activities.map(stop).join('')+'</div><div class="section-heading"><h3>这一天，吃什么</h3><span class="caption">五人点菜与整桌预算</span></div><div class="grid two">'+d.dining.map(meal).join('')+'</div>'+(d.alternatives.length?'<div class="grid two" style="margin-top:14px">'+d.alternatives.map(a=>'<div class="alternate"><h4>'+esc(a.label)+'</h4>'+esc(a.summary)+'</div>').join('')+'</div>':'')+'<ul class="tips-list">'+d.tips.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></section>';}
const blocks={
 NAV:'<button class="active" data-day="all" aria-pressed="true">全程</button>'+trip.days.map((d,i)=>'<button data-day="day-'+i+'" aria-pressed="false">'+d.date.slice(5).replace('-','/')+' '+esc(d.label)+'</button>').join(''),
 SCOPE:esc(trip.scope),
 CHECKLIST:sandbox.renderChecklistHTML(sandbox.computeReminders(trip.startDate,trip.reminders)),
 DECISIONS:trip.decisions.map(d=>'<article class="paper small"><span class="label">ROUTE NOTE</span><h3>'+esc(d.name)+'</h3>'+esc(d.detail)+'</article>').join(''),
 PRETRIP:[['天气是出发前再查的事项',trip.preTrip.weather.summary+' '+trip.preTrip.weather.typhoon],['穿什么，车里带什么',trip.preTrip.packing],['如何购票与付钱',trip.preTrip.payment+' '+trip.preTrip.ticketTip],['提前存好这些工具',trip.preTrip.apps.join('；')]].map(x=>'<article class="paper pretrip-card"><h3>'+esc(x[0])+'</h3>'+paragraph(x[1])+'</article>').join(''),
 DAYS:trip.days.map(day).join(''),
 BUDGET:paragraph(trip.budget.note)+'<table class="budget-table"><thead><tr><th>项目与估算依据</th><th>五人合计</th></tr></thead><tbody>'+trip.budget.items.map(b=>'<tr><td><strong>'+esc(b.name)+'</strong> <span class="tag candidate">'+esc(b.reliability)+'</span><br><span class="caption">'+esc(b.basis)+'</span></td><td>¥'+b.low.toLocaleString('en-US')+'—'+b.high.toLocaleString('en-US')+'</td></tr>').join('')+'</tbody></table><div class="budget-total"><div><span class="small">玩＋吃＋补给 / 五人</span><br><strong>¥6,600—9,000</strong></div><div>人均约<br><b>¥1,320—1,800</b></div></div><p class="caption">'+esc(trip.budget.excluded)+'</p>',
 TIPS:trip.tips.map(t=>'<li>'+esc(t)+'</li>').join(''),
 DISCLAIMER:esc(trip.disclaimer),
 SOURCES:trip.sources.map(s=>'<li class="reference" id="src-'+esc(s.id)+'"><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+'</a><br><small>'+esc(s.type)+'</small></li>').join(''),
 TRIP:JSON.stringify(trip,null,2).replace(/</g,'\\u003c')
};
let output=template.replace(/@@([A-Z]+)@@/g,(_,key)=>{if(!(key in blocks))throw new Error(key);return blocks[key];});
if(/@@[A-Z]+@@/.test(output))throw new Error('Unexpanded placeholder');
const executable=[...output.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('application/json'));
executable.forEach(m=>new Function(m[2]));
const total=trip.days.reduce((s,d)=>s+d.km,0);if(Math.abs(total-trip.distanceKm)>0.001)throw new Error('Wrong mileage');
if(trip.days.length!==7)throw new Error('Wrong day count');
trip.days.forEach((d,i)=>{const expected=new Date(Date.UTC(2026,8,30+i)).toISOString().slice(0,10);if(d.date!==expected)throw new Error('Wrong date '+i);});
const htmlPath=path.join(dir,'草原环线-7天旅行计划.html');
fs.writeFileSync(htmlPath,output,'utf8');fs.writeFileSync(path.join(dir,'tripData.json'),JSON.stringify(trip,null,2),'utf8');
console.log(JSON.stringify({html:htmlPath,bytes:Buffer.byteLength(output),days:trip.days.length,mileage:total,stops:trip.days.reduce((s,d)=>s+d.activities.length,0),dining:trip.days.reduce((s,d)=>s+d.dining.length,0),sourceCount:trip.sources.length,mapPoints:trip.days.reduce((s,d)=>s+d.slots.length,0),syntax:'passed',dates:'passed'},null,2));
