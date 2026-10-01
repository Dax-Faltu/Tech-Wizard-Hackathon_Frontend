const $=i=>document.getElementById(i),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),list=s=>s.split(',').map(x=>x.trim()).filter(Boolean);
const D=['Mon','Tue','Wed','Thu','Fri'],PT=[[9,10],[10,11],[11,12],[13,14],[14,15],[15,16]],PL=PT.map(t=>t[0]+':00'),HUE=[95,150,45,25,170,120,200,70,10,185];
const DEF={subs:[{n:'Data Structures',f:'Dr. Mehta',h:3,lab:0},{n:'Databases',f:'Prof. Shah',h:3,lab:0},{n:'Operating Systems',f:'Dr. Patel',h:3,lab:0},{n:'Networks',f:'Prof. Desai',h:2,lab:0},{n:'Maths',f:'Dr. Joshi',h:3,lab:0},{n:'DS Lab',f:'Dr. Mehta',h:2,lab:1},{n:'DB Lab',f:'Prof. Shah',h:2,lab:1}],lec:'LH-101, LH-102, LH-103',lab:'Lab-1, Lab-2',bat:'CE-A, CE-B',blk:{'Dr. Joshi':['0,0','0,1'],'Prof. Shah':['4,3','4,4','4,5']}};
let S,T=[],view='b:0',sel=null,seed=0,msg0='';
try{S=JSON.parse(localStorage.getItem('tg1'))}catch(e){}if(!S||!S.subs)S=JSON.parse(JSON.stringify(DEF));
const save=()=>{try{localStorage.setItem('tg1',JSON.stringify(S))}catch(e){}};
const fac=()=>[...new Set(S.subs.map(s=>s.f).filter(Boolean))],blocked=(f,d,q)=>(S.blk[f]||[]).includes(d+','+q);
function diag(){const B=list(S.bat).length,LR=list(S.lec).length,LB=list(S.lab).length;
 if(!B||!S.subs.length)return 'Add at least one batch and one subject.';
 const bad=S.subs.find(s=>!s.lab&&s.h>5);if(bad)return bad.n+' has more than 5 hours. Only one session per day is allowed.';
 for(const f of fac()){const need=S.subs.filter(s=>s.f===f).reduce((a,s)=>a+s.h,0)*B,av=30-(S.blk[f]||[]).length;if(need>av)return f+' needs '+need+' hours but is free for only '+av+'. Unblock slots or cut hours.'}
 const lh=S.subs.filter(s=>s.lab).reduce((a,s)=>a+Math.ceil(s.h/2),0)*B;
 if(lh&&!LB)return 'Lab subjects need at least one lab room.';if(lh>LB*20)return 'Too many lab blocks for the lab rooms. Add a lab.';
 if(S.subs.filter(s=>!s.lab).reduce((a,s)=>a+s.h,0)*B>LR*30)return 'Too many lecture hours for the lecture halls. Add a hall.';return ''}
function solve(sd){const B=list(S.bat),LR=list(S.lec),LB=list(S.lab);let rs=sd*7919+13;const rnd=()=>(rs=(rs*9301+49297)%233280)/233280;
 const fl={};S.subs.forEach(s=>fl[s.f]=(fl[s.f]||0)+s.h);const ss=[];
 B.forEach((b,bi)=>S.subs.forEach((s,si)=>{const n=s.lab?Math.ceil(s.h/2):s.h;for(let k=0;k<n;k++)ss.push({bi,si,len:s.lab?2:1})}));
 ss.sort((a,b)=>b.len-a.len||fl[S.subs[b.si].f]-fl[S.subs[a.si].f]||rnd()-.5);
 const occ=new Set(),sd2={},fd={},bd={},out=[];let nodes=0;const t0=performance.now();
 const go=i=>{if(i===ss.length)return 1;if(++nodes>300000)return 0;const s=ss[i],sub=S.subs[s.si],f=sub.f,rooms=(sub.lab?LB:LR).slice().sort(()=>rnd()-.5);
  const days=[0,1,2,3,4].sort((a,b)=>(bd[s.bi+'|'+a]||0)-(bd[s.bi+'|'+b]||0)||rnd()-.5);
  for(const d of days){if(sd2[s.bi+'|'+s.si+'|'+d]||(fd[f+'|'+d]||0)+s.len>4)continue;
   for(const p of (s.len===2?[0,1,3,4]:[0,1,2,3,4,5]).sort(()=>rnd()-.5)){const ps=s.len===2?[p,p+1]:[p];
    if(ps.some(q=>occ.has(`b|${s.bi}|${d}|${q}`)||occ.has(`f|${f}|${d}|${q}`)||blocked(f,d,q)))continue;
    for(const r of rooms){if(ps.some(q=>occ.has(`r|${r}|${d}|${q}`)))continue;
     const keys=ps.flatMap(q=>[`b|${s.bi}|${d}|${q}`,`f|${f}|${d}|${q}`,`r|${r}|${d}|${q}`]);keys.forEach(k=>occ.add(k));
     sd2[s.bi+'|'+s.si+'|'+d]=1;fd[f+'|'+d]=(fd[f+'|'+d]||0)+s.len;bd[s.bi+'|'+d]=(bd[s.bi+'|'+d]||0)+s.len;out.push({s,d,p,r});
     if(go(i+1))return 1;
     keys.forEach(k=>occ.delete(k));delete sd2[s.bi+'|'+s.si+'|'+d];fd[f+'|'+d]-=s.len;bd[s.bi+'|'+d]-=s.len;out.pop()}}}
  return 0};
 const ok=go(0);T=[];if(ok)out.forEach(o=>{for(let k=0;k<o.s.len;k++)T.push({bi:o.s.bi,si:o.s.si,d:o.d,p:o.p+k,r:o.r,lab:o.s.len===2})});
 return{ok,nodes,ms:Math.round(performance.now()-t0)}}
function grow(){const e=diag();sel=null;if(e){T=[];msg0=e;$('log').textContent='';paint();return}
 seed++;const r=solve(seed);msg0=r.ok?'':'No clash-free timetable found within the search limit. Try growing again, add a room, or unblock some slots.';
 $('log').textContent=r.ok?`Grown in ${r.ms} ms, ${r.nodes} placements tried (variation ${seed}).`:'';paint()}
function conf(){const m={},bad=new Set(),msg=[];
 T.forEach((u,i)=>{const f=S.subs[u.si].f;[['f',f],['r',u.r],['b',u.bi]].forEach(([k,v])=>(m[`${k}|${v}|${u.d}|${u.p}`]=m[`${k}|${v}|${u.d}|${u.p}`]||[]).push(i));if(blocked(f,u.d,u.p)){bad.add(i);msg.push(`${f} is blocked on ${D[u.d]} ${PL[u.p]}`)}});
 for(const k in m)if(m[k].length>1){m[k].forEach(i=>bad.add(i));const[t,v,d,p]=k.split('|');msg.push(`${t==='f'?'Teacher':t==='r'?'Room':'Batch'} ${t==='b'?list(S.bat)[v]:v} is double-booked on ${D[d]} ${PL[p]}`)}
 return{bad,msg:[...new Set(msg)]}}
const vu=()=>{const[t,k]=[view[0],view.slice(2)];return T.map((u,i)=>({...u,i})).filter(u=>t==='b'?u.bi==k:t==='f'?S.subs[u.si].f===k:u.r===k)};
function paint(){const us=vu(),{bad,msg}=conf(),n=new Date(),dn=(n.getDay()+6)%7,h=n.getHours(),B=list(S.bat),t=view[0];
 let x='<table class="tt"><thead><tr><th></th>'+D.map(d=>`<th>${d}</th>`).join('')+'</tr></thead><tbody>';
 for(let p=0;p<6;p++){if(p===3)x+='<tr class="lunch"><td colspan="6">Lunch break</td></tr>';x+=`<tr><th>${PL[p]}</th>`;
  for(let d=0;d<5;d++){const c=us.filter(u=>u.d===d&&u.p===p);x+=`<td class="${d===dn&&h>=PT[p][0]&&h<PT[p][1]?'now':''}">`+(c.length?c.map(u=>{const s=S.subs[u.si],sm=t==='b'?[u.r,s.f]:t==='f'?[u.r,B[u.bi]]:[B[u.bi],s.f];
   return `<button class="cell${bad.has(u.i)?' bad':''}${sel===u.i?' sel':''}" style="--h:${HUE[u.si%10]}" data-i="${u.i}"><b>${esc(s.n)}</b><small>${sm.map(esc).join(' &middot; ')}</small></button>`}).join(''):`<button class="empty${''}" data-d="${d}" data-p="${p}" aria-label="Free ${D[d]} ${PL[p]}"></button>`)+'</td>'}x+='</tr>'}
 $('tt').innerHTML=x+'</tbody></table>';
 const r=$('radar');r.className='radar'+(msg0||msg.length?' bad':'');
 r.innerHTML=msg0?`<b>Cannot schedule:</b> ${esc(msg0)}`:!T.length?'Press Grow timetable to start.':msg.length?`<b>${msg.length} clash${msg.length>1?'es':''} found.</b><ul>${msg.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`:'<b>Clash radar is clear.</b> No teacher, room or batch is double-booked and no blocked slot is used.';
 const now=dn*24+h+n.getMinutes()/60;let best=null,bs=1e9;us.forEach(u=>{let d=u.d*24+PT[u.p][0]-now;if(d<0)d+=168;if(d<bs){bs=d;best=u}});
 $('next').textContent=best?`Next up in this view: ${S.subs[best.si].n}, ${D[best.d]} ${PL[best.p]}, ${best.r}.`:'';insights()}
function insights(){const bar=(l,v,max,txt,w)=>`<div class="bar${w?' w':''}"><span>${esc(l)}</span><div><i style="width:${Math.min(100,v/max*100)}%"></i></div><b>${txt}</b></div>`;
 $('ld').innerHTML=fac().map(f=>{const n=T.filter(u=>S.subs[u.si].f===f).length;return bar(f,n,20,n+'h',n>16)}).join('');
 $('ru').innerHTML=[...list(S.lec),...list(S.lab)].map(r=>{const n=T.filter(u=>u.r===r).length;return bar(r,n,30,Math.round(n/.3)+'%')}).join('');
 const us=vu();$('db').innerHTML=D.map((d,i)=>{const n=us.filter(u=>u.d===i).length;return bar(d,n,6,n+'h',n>5)}).join('');free()}
function free(){const d=+$('fd').value,p=+$('fp').value,bf=new Set,br=new Set;T.forEach(u=>{if(u.d===d&&u.p===p){bf.add(S.subs[u.si].f);br.add(u.r)}});
 const a=fac().filter(f=>!bf.has(f)&&!blocked(f,d,p)),b=[...list(S.lec),...list(S.lab)].filter(r=>!br.has(r));
 $('fr').innerHTML=`<p><b>Free teachers:</b> ${a.map(esc).join(', ')||'none'}</p><p><b>Free rooms:</b> ${b.map(esc).join(', ')||'none'}</p>`}
function opts(){const B=list(S.bat);$('view').innerHTML=B.map((b,i)=>`<option value="b:${i}">Batch ${esc(b)}</option>`).join('')+fac().map(f=>`<option value="f:${esc(f)}">Teacher ${esc(f)}</option>`).join('')+[...list(S.lec),...list(S.lab)].map(r=>`<option value="r:${esc(r)}">Room ${esc(r)}</option>`).join('');
 if(![...$('view').options].some(o=>o.value===view))view=$('view').options[0]?.value||'b:0';$('view').value=view;
 const cur=$('bf').value;$('bf').innerHTML=fac().map(f=>`<option>${esc(f)}</option>`).join('');if(fac().includes(cur))$('bf').value=cur;blk()}
function blk(){const f=$('bf').value;$('bg').innerHTML='<b></b>'+D.map(d=>`<b>${d}</b>`).join('')+PL.map((l,p)=>`<b>${l}</b>`+D.map((d,i)=>{const on=blocked(f,i,p);return `<button data-b="${i},${p}" aria-pressed="${on}" aria-label="${D[i]} ${l}">${on?'Off':'Free'}</button>`}).join('')).join('')}
function subs(){$('subs').innerHTML=S.subs.map((s,i)=>`<div class="srow"><input type="text" data-i="${i}" data-k="n" value="${esc(s.n)}" aria-label="Subject"><input type="text" data-i="${i}" data-k="f" value="${esc(s.f)}" aria-label="Faculty"><input type="number" min="1" max="8" data-i="${i}" data-k="h" value="${s.h}" aria-label="Hours per week"><label class="chk"><input type="checkbox" data-i="${i}" data-k="lab" ${s.lab?'checked':''}>Lab</label><button class="btn alt" data-del="${i}" aria-label="Remove ${esc(s.n)}">Remove</button></div>`).join('')}
function dirty(){save();opts();msg0='Inputs changed. Press Grow timetable to rebuild the schedule.';T.length&&(T=[]);paint()}
$('subs').addEventListener('change',e=>{const i=e.target.dataset.i,k=e.target.dataset.k;if(i==null)return;S.subs[i][k]=k==='h'?Math.max(1,+e.target.value||1):k==='lab'?+e.target.checked:e.target.value.trim();dirty()});
$('subs').addEventListener('click',e=>{const d=e.target.dataset.del;if(d!=null){S.subs.splice(d,1);subs();dirty()}});
$('add').onclick=()=>{S.subs.push({n:'New subject',f:'New faculty',h:2,lab:0});subs();dirty()};
['bat','lec','lab'].forEach(k=>{$(k).value=S[k];$(k).addEventListener('change',e=>{S[k]=e.target.value;dirty()})});
$('view').onchange=e=>{view=e.target.value;sel=null;paint()};$('bf').onchange=blk;
$('bg').addEventListener('click',e=>{const b=e.target.dataset.b;if(!b)return;const f=$('bf').value,a=S.blk[f]=S.blk[f]||[];const i=a.indexOf(b);i<0?a.push(b):a.splice(i,1);blk();save();T.length&&paint()});
$('tt').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||view[0]!=='b')return;
 if(b.dataset.i!=null){const i=+b.dataset.i;if(T[i].lab){$('log').textContent='Lab blocks move only when you grow the timetable again.';return}
  if(sel===null)sel=i;else if(sel===i)sel=null;else{const a=T[sel],c=T[i];[a.d,c.d]=[c.d,a.d];[a.p,c.p]=[c.p,a.p];sel=null}}
 else if(sel!==null){T[sel].d=+b.dataset.d;T[sel].p=+b.dataset.p;sel=null}paint()});
$('grow').onclick=grow;$('go').onclick=()=>{grow();$('bench').scrollIntoView()};
$('fd').innerHTML=D.map((d,i)=>`<option value="${i}">${d}</option>`).join('');$('fp').innerHTML=PL.map((l,i)=>`<option value="${i}">${l}</option>`).join('');$('fd').onchange=$('fp').onchange=free;
$('exp').onclick=()=>{const q=s=>'"'+String(s).replace(/"/g,'""')+'"',B=list(S.bat);const t=$('csv');t.value=['batch,day,time,subject,faculty,room',...T.slice().sort((a,b)=>a.bi-b.bi||a.d-b.d||a.p-b.p).map(u=>[q(B[u.bi]),D[u.d],PL[u.p],q(S.subs[u.si].n),q(S.subs[u.si].f),q(u.r)].join(','))].join('\n');t.style.display='block';t.select();try{navigator.clipboard.writeText(t.value)}catch(e){}};
subs();opts();grow();
