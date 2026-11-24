/* ===== Shared coverage flow engine =====
   One workflow for every concept, following the product's states:
   DRAFT -> (PENDING_APPROVAL) -> READY_FOR_OUTREACH -> OUTREACH_IN_PROGRESS -> PARTIALLY_FILLED / FILLED / UNABLE_TO_FILL
   Accept never assigns. The manager assigns, capped at headcount. Nothing is sent without the manager. */
(function(){
const F=window.Flow={workerView:true,fullPhone:false};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ini=n=>n.replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2);
const LBL={DRAFT:'Draft',PENDING_APPROVAL:'Pending approval',READY_FOR_OUTREACH:'Ready for outreach',OUTREACH_IN_PROGRESS:'Outreach in progress',PARTIALLY_FILLED:'Partially filled',FILLED:'Filled',UNABLE_TO_FILL:'Unable to fill'};
const CFG=Object.assign({org:'Example Resort',link:'exr.io',event:'Fight night',date:'Sat Nov 21',planTitle:'The resort plan',planRole:'Resort plan',unit:'departments',approverRole:'Bell &amp; Valet manager'},window.FLOW_CFG||{});
const FROM0={sec:'Security',valet:'Bell & Valet',front:'Front Office',hk:'Housekeeping',evs:'Facilities & EVS',casino:'Casino Floor',steak:'Ember & Oak',market:'The Market',mkt:'Marketing',shop:'Resort Shop',vendor:'Approved vendor',slots:'Slot Ops',grounds:'Grounds',it:'IT'};
const FROM=Object.assign(FROM0,window.FROM_EXTRA||{});
let clock=0;function now(){clock+=2+Math.floor(Math.random()*3);const base=14*60+10+clock;const h=Math.floor(base/60)%24,m=base%60;return `${((h+11)%12)+1}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`}
let W=null,R=null,O=null,busy=false,histOpen=false,planMode=null;
F.state=r=>{if(!r.st)r.st={status:'DRAFT',step:'draft',elig:null,offers:{},assigned:[],released:[],hist:[],round:1,incentive:r.incentive||0,need:r.need,returned:null,rated:false};return r.st};
F.open=(req,opts={})=>{R=req;O=opts;planMode=null;histOpen=false;const st=F.state(req);if(!st.hist.length)ev('Draft created by the agent','Shifty','From the callout: “'+req.callout+'”');mount(req.c);render()};
F.close=()=>{if(!W)return;W.classList.remove('on');const w=W;W=null;setTimeout(()=>w.remove(),450);const r=R;R=null;if(O&&O.onEvent)O.onEvent('close',r)};
function emit(t,d){if(O&&O.onEvent)O.onEvent(t,R,d||{})}
/* update a live list in place: keeps existing elements, so rows don't replay their entry animation and bars slide instead of restarting */
function morph(el,html){const t=document.createElement(el.tagName);t.innerHTML=html;sync(el,t)}
function sync(a,b){const A=[...a.childNodes],B=[...b.childNodes];
  B.forEach((nb,i)=>{const na=A[i];
    if(!na){a.appendChild(nb.cloneNode(true));return}
    if(na.nodeType!==nb.nodeType||na.nodeName!==nb.nodeName){a.replaceChild(nb.cloneNode(true),na);return}
    if(nb.nodeType===3){if(na.nodeValue!==nb.nodeValue)na.nodeValue=nb.nodeValue;return}
    if(nb.nodeType===1){[...na.attributes].forEach(x=>{if(!nb.hasAttribute(x.name))na.removeAttribute(x.name)});[...nb.attributes].forEach(x=>{if(na.getAttribute(x.name)!==x.value)na.setAttribute(x.name,x.value)});sync(na,nb)}});
  for(let i=A.length-1;i>=B.length;i--)A[i].remove()}
function ev(title,by,sub){F.state(R).hist.unshift({t:now(),title,by:by||'Maya Rivers',sub:sub||''})}
function face(){return window.agentFace?agentFace():''}
function mount(c){if(W)W.remove();const root=O.root||document.body;W=document.createElement('div');W.className='fl-wrap';
  W.innerHTML=`<div class="fl-dim"></div><div class="fl-phone" id="flPhone"><div class="lbl">Worker’s phone</div><div class="scr"><div class="notch"></div><div class="stat"><span>9:41</span><span>●●● ▮</span></div><div id="flPh"></div></div></div>
   <aside class="fl-panel" style="--fa:${c||'#7c5cff'}"><div class="fl-hd" id="flHd"></div><div style="position:relative;flex:1;display:flex;flex-direction:column;min-height:0"><div class="fl-body" id="flBody"></div><div class="fl-hist" id="flHist"></div></div><div class="fl-foot" id="flFoot"></div></aside>`;
  root.appendChild(W);requestAnimationFrame(()=>W.classList.add('on'));W.querySelector('.fl-dim').onclick=()=>{if(!busy)F.close()}}
function steps(st){const s=['Draft','Confirm'];if(st.incentive>0)s.push('Approve');s.push('Eligibility','Outreach','Responses','Assign');return s}
function stepIdx(st){const s=steps(st);const m={draft:0,approve:s.indexOf('Approve'),elig:s.indexOf('Eligibility'),preview:s.indexOf('Outreach'),responses:s.indexOf('Responses'),decide:s.length-1,assign:s.length-1,partial:s.length-1,done:s.length};return m[st.step]}
function header(){const st=R.st;if(planMode){st.assigned=planMode.reqs.flatMap(r=>r.st?r.st.assigned:[])}const si=stepIdx(st),s=steps(st);
  document.getElementById('flHd').innerHTML=`<div class="r1"><span class="dot"></span><div style="min-width:0"><small>${R.deptName} · Coverage request</small><b class="t">${R.role}</b></div><span class="sp"></span><span class="fl-pill ${st.status}">${LBL[st.status]}</span>
   <button class="fl-ib ${histOpen?'on':''}" id="flH" title="History">⟲</button><button class="fl-ib" id="flX" title="Close">✕</button></div>
   <div class="fl-meta"><span>${R.loc}</span><span>${R.when}</span><span>${st.assigned.reduce((a,c)=>a+c.n,0)} of ${st.need} filled</span>${st.incentive?`<span>$${st.incentive} bonus</span>`:''}</div>
   <div class="fl-steps">${s.map((x,i)=>`<div class="${i<si?'done':i===si?'cur':''}">${x}</div>`).join('')}</div>`;
  document.getElementById('flX').onclick=()=>{if(!busy)F.close()};document.getElementById('flH').onclick=()=>{histOpen=!histOpen;hist();header()}}
function hist(){const H=document.getElementById('flHist');H.classList.toggle('show',histOpen);if(!histOpen)return;
  H.innerHTML=`<div style="font-weight:800;font-size:15px">History</div><div style="font-size:12px;opacity:.6;margin:2px 0 8px">Every step, who did it and when. Newest first.</div>`+R.st.hist.map(h=>`<div class="fl-ev"><i></i><div><b>${h.title}</b><small>${h.by}${h.sub?' · '+h.sub:''}</small></div><time>${h.t}</time></div>`).join('')}
function body(agent,html){document.getElementById('flBody').innerHTML=`<div class="fl-ag"><span class="fo faceHost" id="flFace">${face()}</span><p>${agent}</p></div>${html}`;if(window.faceTalk)faceTalk(document.getElementById('flFace'),Math.min(2400,400+agent.replace(/<[^>]+>/g,'').length*24))}
function foot(btns){const f=document.getElementById('flFoot');f.innerHTML=btns.map((b,i)=>b==='|'?'<span class="sp"></span>':`<button class="fl-btn ${b.cls||''}" data-i="${i}" ${b.dis?'disabled':''}>${b.t}</button>`).join('');
  f.querySelectorAll('[data-i]').forEach(x=>x.onclick=()=>{const b=btns[+x.dataset.i];if(!busy||b.always)b.go()})}
function setStatus(s){R.st.status=s;emit('status',{status:s})}
function render(){if(!W)return;header();hist();({draft,approve,elig,preview,responses,decide,assign,partial,done})[R.st.step]()}
function go(step){R.st.step=step;render()}

/* --- 1 Draft --- */
function draft(){const st=R.st;let q=R.callout;R.hl.forEach(([t,k])=>{q=q.replace(t,`<mark class="${k}">${t}</mark>`)});
  body(st.returned?`Taylor sent this back: “${st.returned}”. Adjust it and confirm again.`:'I drafted this request from the callout. Check the fields, then confirm. Nothing goes out yet.',
  `<div class="fl-quote"><small>The callout</small>${q}</div>
   <div class="fl-grid"><div class="fl-card"><div class="k">Role</div><div class="v">${R.role}</div></div><div class="fl-card" style="animation-delay:.05s"><div class="k">Where</div><div class="v">${R.loc}</div></div>
    <div class="fl-card" style="animation-delay:.1s"><div class="k">When</div><div class="v">${R.when}</div></div><div class="fl-card" style="animation-delay:.15s"><div class="k">Headcount</div><div class="v"><button id="flM">−</button>${st.need}<button id="flP">+</button></div></div>
    <div class="fl-card" style="animation-delay:.2s"><div class="k">Must have</div><div class="v">${R.quals.map(q=>`<span class="fl-chip">${q}</span>`).join('')}</div></div>
    <div class="fl-card" style="animation-delay:.25s"><div class="k">Shift bonus</div><div class="v"><div class="fl-seg">${[0,50,75].map(a=>`<button class="${st.incentive===a?'on':''}" data-a="${a}">${a?'$'+a:'None'}</button>`).join('')}</div></div></div></div>
   <div class="fl-note">🔒 ${st.incentive?'A bonus needs a second manager to approve before anything is sent.':'Saved as a draft. Nothing is sent until you start outreach.'}</div>`);
  document.getElementById('flM').onclick=()=>{st.need=Math.max(1,st.need-1);render()};document.getElementById('flP').onclick=()=>{st.need++;render()};
  document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{st.incentive=+b.dataset.a;render()});
  foot(['|',{t:'Confirm request',cls:'pri',go:()=>{ev('Confirmed',undefined,st.incentive?`$${st.incentive} bonus · needs approval`:'No bonus');st.returned=null;
    if(st.incentive){setStatus('PENDING_APPROVAL');ev('Sent for approval',undefined,'To Taylor Brooks');go('approve')}else{setStatus('READY_FOR_OUTREACH');go('elig')}}}]);
}
/* --- 2 Approve (peer manager) --- */
let asTaylor=false;
function approve(){const st=R.st;
  if(!asTaylor){body(`Because there’s a $${st.incentive} bonus, a second manager has to approve this. You can’t approve your own request.`,
    `<div class="fl-msg"><div style="display:flex;align-items:center;gap:12px"><div class="fl-row" style="flex:1;margin:0"><span class="av">TB</span><div class="nm"><b>Taylor Brooks</b><small>${CFG.approverRole} · notified ${st.hist[0].t}</small></div><span class="fl-tag wait">Waiting</span></div></div></div>
     <div class="fl-note">For the demo, you can jump into Taylor’s seat to see what the approver sees.</div>`);
    foot([{t:'Back to draft',go:()=>{setStatus('DRAFT');ev('Returned to draft');go('draft')}},'|',{t:'See Taylor’s view',cls:'pri',go:()=>{asTaylor=true;render()}}]);return}
  body(`<b>Viewing as Taylor Brooks.</b> Maya wants to add a $${st.incentive} bonus to this request.`,
   `<div class="fl-msg"><div class="fl-grid" style="margin:0"><div class="fl-card"><div class="k">Request</div><div class="v">${R.role} · ${st.need}</div></div><div class="fl-card"><div class="k">When</div><div class="v">${R.when}</div></div>
    <div class="fl-card"><div class="k">Bonus</div><div class="v">$${st.incentive} per shift</div></div><div class="fl-card"><div class="k">Requested by</div><div class="v">Maya Rivers</div></div></div>
    <textarea class="fl-ta" id="flRs" rows="2" placeholder="Reason, if you send it back"></textarea></div>`);
  foot([{t:'Send back',go:()=>{const r=document.getElementById('flRs').value.trim()||'Try without the bonus first.';asTaylor=false;st.returned=r;setStatus('DRAFT');ev('Returned to draft','Taylor Brooks',r);go('draft')}},'|',
   {t:'Approve',cls:'pri',go:()=>{asTaylor=false;ev('Approved','Taylor Brooks',`$${st.incentive} bonus`);setStatus(st.round>1?'PARTIALLY_FILLED':'READY_FOR_OUTREACH');go(st.round>1?'preview':'elig')}}]);
}
/* --- 3 Eligibility --- */
function roundCands(){return R.st.round>1&&R.next?R.next.cands:R.cands}
async function elig(){const st=R.st;const cs=roundCands();
  body('Checking everyone against licenses, certifications, hours, rest rules and union order…',`<div class="fl-rows" id="flEl">${cs.map((c,i)=>`<div class="fl-row ${c.ok?'':'no'}" data-i="${i}" style="animation-delay:${i*.05}s"><span class="av">${ini(c.name)}</span><div class="nm"><b>${c.name}</b><small>${FROM[c.from]||''} · ${c.note}</small></div><span class="fl-spin"></span></div>`).join('')}</div>`);
  foot(['|',{t:'Preview the offer',cls:'pri',dis:true,go:()=>{}}]);busy=true;
  for(const [i,c] of cs.entries()){await sleep(st.elig?60:260);const row=document.querySelector(`#flEl [data-i="${i}"]`);if(!row)break;row.querySelector('.fl-spin').outerHTML=`<span class="fl-tag ${c.ok?'ok':'no'}">${c.ok?'Eligible':'Not eligible'}</span>`}
  busy=false;st.elig=cs.filter(c=>c.ok);const tot=st.elig.reduce((a,c)=>a+c.n,0);
  if(!st.eligLogged){ev('Eligibility checked','Shifty',`${tot} eligible of ${cs.reduce((a,c)=>a+c.n,0)}`);st.eligLogged=true}
  document.querySelector('#flBody .fl-ag p').innerHTML=`<b>${tot} eligible</b> out of ${cs.reduce((a,c)=>a+c.n,0)}. The others are shown with the reason, so you can see why.`;
  foot([{t:'Back',go:()=>go('draft')},'|',{t:'Preview the offer',cls:'pri',go:()=>go('preview')}]);
}
/* --- 4 Outreach preview + send --- */
function preview(){const st=R.st;const cs=st.round>1&&R.next?R.next.cands:(st.elig||R.cands.filter(c=>c.ok));const n=cs.reduce((a,c)=>a+c.n,0);
  body(`Here’s exactly what ${n} ${n===1?'person':'people'} will get. <b>You’re sending this, not me.</b>`,
   `<div class="fl-msg"><div style="font-size:10.5px;font-weight:800;letter-spacing:1px;opacity:.5;margin-bottom:8px">TEXT + EMAIL</div>
     <div class="fl-bub">${CFG.org}: shift offer for you. <b>${R.role}</b>, ${R.when}, ${R.loc}${st.incentive?`, <b>$${st.incentive} bonus</b>`:''}. Tap to accept or decline: <u>${CFG.link}/r/8f3k…</u></div>
     <div style="display:flex;gap:6px;margin-top:12px"><span class="fl-chip">✉ Email</span><span class="fl-chip">💬 SMS</span><span class="fl-chip">No login needed</span><span class="fl-chip">Link expires at shift start</span></div></div>
   <div style="font-size:11px;font-weight:800;letter-spacing:1px;opacity:.5;margin:14px 0 8px">RECIPIENTS</div>
   <div class="fl-rows">${cs.map(c=>`<div class="fl-row"><span class="av">${ini(c.name)}</span><div class="nm"><b>${c.name}</b><small>${FROM[c.from]} · fit ${c.fit}</small></div></div>`).join('')}</div>
   <div class="fl-wv ${F.workerView?'on':''}" id="flWv" style="margin-top:14px"><i></i>Show what the worker sees</div>`);
  document.getElementById('flWv').onclick=()=>{F.workerView=!F.workerView;document.getElementById('flWv').classList.toggle('on',F.workerView)};
  foot([{t:'Back',go:()=>go(st.round>1?'partial':'elig')},'|',{t:`Send ${n} offer${n>1?'s':''}`,cls:'acc',go:()=>{
    cs.forEach(c=>st.offers[c.name]={c,s:'sent'});if(st.round===1)setStatus('OUTREACH_IN_PROGRESS');ev(st.round>1?'Re-offered with bonus':'Outreach started',undefined,`${n} offers by email and SMS`);emit('sent',{cands:cs});go('responses')}}]);
}
/* --- 5 Responses (with the worker's phone) --- */
async function responses(){const st=R.st;const offs=Object.values(st.offers).filter(o=>roundCands().includes(o.c)||st.round===1);
  const draw=()=>{const list=Object.values(st.offers);const a=list.filter(o=>o.s==='accept').reduce((x,o)=>x+o.c.n,0),d=list.filter(o=>o.s==='decline').length,p=list.filter(o=>o.s==='sent'||o.s==='open').length;
    return `<div class="fl-kpis"><div><b>${list.length}</b><small>Sent</small></div><div><b style="color:#5effc8">${a}</b><small>Accepted</small></div><div><b style="color:#ff8fab">${d}</b><small>Declined</small></div><div><b>${p}</b><small>Waiting</small></div></div>
     <div class="fl-rows">${list.map(o=>`<div class="fl-row"><span class="av">${ini(o.c.name)}</span><div class="nm"><b>${o.c.name}</b><small>${FROM[o.c.from]}${o.c.n>1?' · '+o.c.n+' people':''}</small></div><span class="fl-tag ${o.s==='accept'?'ok':o.s==='decline'?'no':o.s==='open'?'open':o.s==='cancelled'?'wait':'sent'}">${{sent:'Sent',open:'Opened',accept:'Accepted',decline:'Declined',cancelled:'Offer cancelled'}[o.s]}</span></div>`).join('')}</div>`};
  body('Offers are out. Replies come in from each person’s link. <b>Accepting doesn’t assign anyone.</b> You decide who works.',`<div id="flRs">${draw()}</div>`);
  const pending=Object.values(st.offers).filter(o=>o.s==='sent');if(!pending.length){finishResp();return}
  /* you can move on as soon as one person accepts; anyone still out gets a warning first */
  let stop=false;const redraw=()=>{const el=document.getElementById('flRs');if(el)morph(el,draw())};
  const liveFoot=()=>{const accN=accOf(st),wait=waitOf(st).length;const p=document.querySelector('#flBody .fl-ag p');
    if(p&&accN)p.innerHTML=`<b>${accN} accepted</b> so far, ${wait} still out. You can assign now, or wait for the rest.`;
    foot(['|',{t:accN?nextLabel(st):'Waiting for a yes…',cls:'pri',dis:!accN,always:true,go:()=>confirmEarly(()=>{stop=true;busy=false})}])};
  liveFoot();busy=true;let phoneShown=false;follow=F.fullPhone?pickFollow():null;
  for(const [i,o] of pending.entries()){await sleep(i<2?500:1300+Math.random()*900);if(stop||!document.getElementById('flRs')){busy=false;return}
    o.s='open';redraw();
    if(o.c.resp==='none'){continue} /* opened the text, never replied */
    if(F.workerView&&!phoneShown&&(F.fullPhone?o.c===follow:o.c.resp==='accept'&&o.c.n===1)){phoneShown=true;await (F.fullPhone?phoneFull(o.c):phone(o.c));}else await sleep(450);
    if(stop)return;
    o.s=o.c.resp==='decline'?'decline':'accept';ev(o.s==='accept'?'Offer accepted':'Offer declined',o.c.name,'via secure link');emit('response',{cand:o.c,resp:o.s});
    redraw();liveFoot()}
  busy=false;if(!stop)finishResp();
}
const accOf=st=>Object.values(st.offers).filter(o=>o.s==='accept'&&!st.assigned.includes(o.c)&&!st.released.includes(o.c)).reduce((a,o)=>a+o.c.n,0);
const waitOf=st=>Object.values(st.offers).filter(o=>o.s==='sent'||o.s==='open');
const openOf=st=>st.need-st.assigned.reduce((a,c)=>a+c.n,0);
const nextLabel=st=>accOf(st)>openOf(st)?'Make the call':'Assign';
function nextStep(){go(accOf(R.st)>openOf(R.st)?'decide':'assign')}
/* warn before moving on while offers are still out; going ahead cancels those offers */
function confirmEarly(onGo){const st=R.st,w=waitOf(st);if(!w.length){onGo&&onGo();nextStep();return}
  const P=document.querySelector('.fl-panel');if(!P)return;const d=document.createElement('div');d.className='fl-confirm';
  d.innerHTML=`<div class="fl-cbox"><div class="fl-cic">!</div><h4>${w.length} ${w.length>1?'people haven’t':'person hasn’t'} replied yet</h4>
    <p>You still haven’t received responses from <b>${w.length} eligible employee${w.length>1?'s':''}</b> (${w.map(o=>o.c.name).join(', ')}). Are you sure you want to continue? This will cancel the offer for ${w.length>1?'those employees':'that employee'}.</p>
    <div class="fl-cact"><button class="fl-btn" id="flCk">Keep waiting</button><button class="fl-btn pri" id="flCg">Cancel ${w.length} offer${w.length>1?'s':''} and continue</button></div></div>`;
  P.appendChild(d);d.querySelector('#flCk').onclick=()=>d.remove();
  d.querySelector('#flCg').onclick=()=>{d.remove();onGo&&onGo();waitOf(st).forEach(o=>{o.s='cancelled';ev('Offer cancelled',o.c.name,'No reply before assignment · link expired');if(o.c===follow)follow=null});
    emit('response',{});nextStep()}}
function finishResp(){const st=R.st;const acc=Object.values(st.offers).filter(o=>o.s==='accept'&&!st.assigned.includes(o.c)&&!st.released.includes(o.c)).map(o=>o.c);const accN=acc.reduce((a,c)=>a+c.n,0);
  const open=st.need-st.assigned.reduce((a,c)=>a+c.n,0);const p=document.querySelector('#flBody .fl-ag p');
  const w=waitOf(st).length;const wt=w?` ${w} ${w>1?'people haven’t':'person hasn’t'} replied.`:'';
  if(accN>open){p.innerHTML=`<b>${accN} people said yes for ${open} ${open===1?'spot':'spots'}.</b> That’s your call, and I’ll show you how they compare.${wt}`;foot(['|',{t:'Make the call',cls:'pri',go:()=>confirmEarly()}])}
  else{p.innerHTML=`<b>${accN} accepted</b> for ${open} open ${open===1?'spot':'spots'}.${accN<open?' That won’t fully cover it. Assign them now and I’ll suggest the next option.':''}${wt}`;foot(['|',{t:'Assign',cls:'pri',dis:!accN,go:()=>confirmEarly()}])}
}
function phone(c){return new Promise(async res=>{const P=document.getElementById('flPhone'),S=document.getElementById('flPh');if(!P){res();return}
  const first=c.name.split(' ')[0];S.innerHTML=`<div class="ph-notif"><b>MESSAGES · now</b><br>${CFG.org}: shift offer for you. ${R.role}, ${R.when}. Tap to respond: <u>${CFG.link}/r/8f3k…</u></div>`;
  P.classList.add('show');await sleep(1300);
  S.innerHTML=`<div class="ph-page"><div class="ph-card"><small>${CFG.orgFull||"EXAMPLE RESORT &amp; CASINO"}</small><h4>Hi ${first}, can you take this shift?</h4>
    <div class="ln"><span>Role</span><b>${R.role}</b></div><div class="ln"><span>Where</span><b>${R.loc}</b></div><div class="ln"><span>When</span><b>${R.when.replace(' – ','–')}</b></div>${R.st.incentive?`<div class="ln"><span>Bonus</span><b>$${R.st.incentive}</b></div>`:''}
    <button class="ph-acc" id="phA">Accept shift</button><button class="ph-dec">Decline shift</button>
    <div class="ph-help">Accepting confirms you’re interested and available. It doesn’t guarantee the shift. Your manager confirms who works.</div></div></div><div class="ph-finger" id="phF" style="left:200px;top:560px;opacity:0"></div>`;
  await sleep(900);const fg=document.getElementById('phF'),a=document.getElementById('phA');if(!fg){res();return}
  const r=a.getBoundingClientRect(),sr=S.getBoundingClientRect(),k=sr.width/276;fg.style.opacity=1;fg.style.left=((r.left-sr.left)/k+110)+'px';fg.style.top=((r.top-sr.top)/k+2)+'px';
  await sleep(750);a.classList.add('tap');await sleep(260);
  S.innerHTML=`<div class="ph-page"><div class="ph-done"><div class="c">✓</div><h4 style="margin-top:16px;font-size:18px">Thanks, ${first}!</h4><p style="font-size:12.5px;color:#555;margin-top:6px;padding:0 20px;line-height:1.45">You’re on the list. Maya will confirm who works this shift.</p></div></div>`;
  await sleep(1200);P.classList.remove('show');await sleep(300);res()})}

/* ===== full worker simulation (opt-in: Flow.fullPhone) =====
   follows one person: lock screen text > message thread > secure link > accept > waiting > confirmed or released */
let follow=null;
function pickFollow(){const acc=R.cands.filter(c=>c.ok&&c.resp==='accept'&&c.n===1);const pol=(typeof POLICY!=='undefined'?POLICY:{})[R.dept];
  /* follow whoever asked for more hours: shows either the confirmed text or the 'first in line next time' text */
  return acc.find(c=>c.f&&c.f.wants)||(pol&&acc.find(c=>pol.pick.includes(c.name)))||acc[0]||null}
const PHD=()=>{const d=new Date();return d.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})};
async function tap(sel){const S=document.getElementById('flPh');if(!S)return;const t=S.querySelector(sel),fg=S.querySelector('.ph-finger');if(!t||!fg)return;
  const r=t.getBoundingClientRect(),sr=S.getBoundingClientRect(),k=sr.width/276;fg.style.opacity=1;fg.style.left=((r.left-sr.left)/k+Math.min(110,r.width/k/2-22))+'px';fg.style.top=((r.top-sr.top)/k+Math.max(-6,r.height/k/2-22))+'px';
  await sleep(700);t.classList.add('tap');fg.classList.add('press');await sleep(280);fg.classList.remove('press')}
const FG='<div class="ph-finger" style="left:120px;top:640px;opacity:0"></div>';
const lockScr=(app,title,text)=>`<div class="ph-lock"><div class="lt">9:41</div><div class="ld">${PHD()}</div><div class="ph-notif lk" id="phN"><div class="nh"><i>💬</i><b>${app}</b><span>now</span></div><b>${title}</b><p>${text}</p></div></div>`;
const thread=(msgs)=>`<div class="ph-thr"><div class="th"><span class="bk">‹</span><div class="who"><i>${(CFG.org||'EC').replace(/[^A-Z]/g,'').slice(0,2)||'EC'}</i><b>${CFG.org}</b><small>Text message</small></div></div><div class="msgs">${msgs}</div></div>`;
async function phoneFull(c){const P=document.getElementById('flPhone'),S=document.getElementById('flPh');if(!P)return;const first=c.name.split(' ')[0];
  P.classList.add('show','stay');P.querySelector('.lbl').innerHTML=`${c.name}’s phone`;
  S.innerHTML=lockScr('MESSAGES',CFG.org,`Shift offer for you: ${R.role}, ${R.when}. Tap to respond.`)+FG;P.classList.add('buzz');setTimeout(()=>P.classList.remove('buzz'),700);
  await sleep(1700);await tap('#phN');
  const offer=`<div class="bub in">${CFG.org}: shift offer for you, ${first}. <b>${R.role}</b>, ${R.when}, ${R.loc}.${R.st.incentive?` Includes a $${R.st.incentive} bonus.`:''} Tap to accept or decline: <u id="phL">${CFG.link}/r/8f3k</u></div>`;
  S.innerHTML=thread(offer+`<small class="ts">Also sent by email</small>`)+FG;await sleep(1700);await tap('#phL');
  S.innerHTML=`<div class="ph-page web"><div class="ph-url">🔒 ${CFG.link}/r/8f3k</div><div class="ph-card"><small>${CFG.orgFull||CFG.org}</small><h4>Hi ${first}, can you take this shift?</h4>
    <div class="ln"><span>Role</span><b>${R.role}</b></div><div class="ln"><span>Where</span><b>${R.loc}</b></div><div class="ln"><span>When</span><b>${R.when.replace(' – ','–')}</b></div>${R.st.incentive?`<div class="ln"><span>Bonus</span><b>$${R.st.incentive}</b></div>`:''}
    <button class="ph-acc" id="phA">Accept shift</button><button class="ph-dec">Decline shift</button>
    <div class="ph-help">No login needed. Accepting says you’re interested and available. It doesn’t guarantee the shift. ${CFG.manager||'Maya'} confirms who works.</div></div></div>`+FG;
  await sleep(1900);await tap('#phA');
  S.innerHTML=`<div class="ph-page web"><div class="ph-url">🔒 ${CFG.link}/r/8f3k</div><div class="ph-done"><div class="c">✓</div><h4 style="margin-top:16px;font-size:18px">Thanks, ${first}!</h4><p>You’re on the list for this shift. We’ll text you when ${CFG.manager||'Maya'} confirms who works.</p></div></div>`;
  await sleep(1800);
  S.innerHTML=thread(offer+`<div class="bub out">Accepted ✓</div><small class="ts">Waiting for ${CFG.manager||'Maya'} to confirm</small>`);P.classList.add('wait')}
async function phoneResult(ok){const P=document.getElementById('flPhone'),S=document.getElementById('flPh');if(!P||!P.classList.contains('stay')||!follow)return;const c=follow,first=c.name.split(' ')[0];
  P.classList.remove('wait');await sleep(500);
  const msg=ok?`You’re confirmed: ${R.role}, ${R.when}, ${R.loc}. See you then!`:`Thanks, ${first}. This shift is filled. You’re first in line for the next one.`;
  S.innerHTML=lockScr('MESSAGES',CFG.org,msg)+FG;P.classList.add('buzz');setTimeout(()=>P.classList.remove('buzz'),700);await sleep(1600);await tap('#phN');
  S.innerHTML=thread(`<div class="bub in">${CFG.org}: shift offer for you, ${first}. <b>${R.role}</b>, ${R.when}.</div><div class="bub out">Accepted ✓</div><div class="bub in ${ok?'good':''}">${CFG.org}: ${msg}</div>`+
    (ok?`<button class="ph-cal" id="phC">＋ Add to calendar</button>`:'')+`<small class="ts">${ok?'Confirmed by '+(CFG.manager||'Maya')+' · just now':'Delivered'}</small>`)+FG;
  if(ok){await sleep(1300);await tap('#phC');const b=S.querySelector('#phC');if(b){b.textContent='✓ Added to calendar';b.classList.add('done')}}}
/* --- 6a Your call (more yeses than spots) --- */
let pick=null;
function decide(){const st=R.st;const open=st.need-st.assigned.reduce((a,c)=>a+c.n,0);
  const acc=Object.values(st.offers).filter(o=>o.s==='accept'&&!st.assigned.includes(o.c)).map(o=>o.c);
  const pol=(typeof POLICY!=='undefined'?POLICY:{})[R.dept];const rec=pol?acc.filter(c=>pol.pick.includes(c.name)):acc.slice().sort((a,b)=>b.fit-a.fit).slice(0,open);
  if(!pick)pick=new Set(rec.map(c=>c.name));const n=acc.filter(c=>pick.has(c.name)).reduce((a,c)=>a+c.n,0);const same=rec.every(c=>pick.has(c.name))&&pick.size===rec.length;
  const f=c=>c.f||{sen:'-',extra:'-',ot:0,wants:0};
  body(pol?pol.why:`More people accepted than you need. I ranked them by fit, hours and overtime.`,
   `${pol?`<div class="fl-pol"><b>Rule I’m following.</b> ${pol.rule}</div>`:''}
    <div style="font-size:12px;font-weight:700;opacity:.7;margin-bottom:6px">Pick ${open} · ${n} selected</div>
    <div class="fl-cmp">${acc.map(c=>{const x=f(c);return `<div class="fl-cmpc ${pick.has(c.name)?'sel':''}" data-n="${c.name}">${rec.includes(c)?'<span class="rec">Recommended</span>':''}
      <div class="hd"><span class="fl-row" style="padding:0;border:0;background:none"><span class="av">${ini(c.name)}</span></span><div><b>${c.name}</b><small>${FROM[c.from]} · ${c.note}</small></div></div>
      <div class="fl-fac"><div>Seniority<b>${x.sen} yrs</b></div><div class="${x.extra===0?'good':x.extra>=3?'bad':''}">Extra shifts, 30 days<b>${x.extra}</b></div><div class="${x.ot?'bad':'good'}">Overtime<b>${x.ot?x.ot+' hrs':'None'}</b></div><div class="${x.wants?'good':''}">Asked for hours<b>${x.wants?'Yes':'No'}</b></div></div></div>`}).join('')}</div>
    ${same?'':`<textarea class="fl-ta" id="flOv" rows="2" placeholder="You’re going against the rule. Add a note for the record (kept in History)."></textarea>`}
    ${n>open?`<div class="fl-warn">Only ${open} ${open===1?'spot is':'spots are'} open. Unselect someone to continue. I won’t overfill the shift.</div>`:''}`);
  document.querySelectorAll('.fl-cmpc').forEach(el=>el.onclick=()=>{const k=el.dataset.n;pick.has(k)?pick.delete(k):pick.add(k);const ta=document.getElementById('flOv');const keep=ta?ta.value:'';render();const t2=document.getElementById('flOv');if(t2)t2.value=keep});
  foot([{t:'Back',go:()=>go('responses')},'|',{t:`Assign ${n} and notify`,cls:'pri',dis:n>open||n===0,go:()=>{const ov=document.getElementById('flOv');if(!same&&(!ov||!ov.value.trim())){ov.focus();ov.style.borderColor='#fda4af';return}
    const chosen=acc.filter(c=>pick.has(c.name));const others=acc.filter(c=>!pick.has(c.name));
    if(!same)ev('Manager override',undefined,ov.value.trim());else if(pol)ev('Picked by rule',undefined,pol.rule.split(':')[0]);
    doAssign(chosen,others);pick=null}}]);
}
/* --- 6b Assign --- */
function assign(){const st=R.st;const open=st.need-st.assigned.reduce((a,c)=>a+c.n,0);const acc=Object.values(st.offers).filter(o=>o.s==='accept'&&!st.assigned.includes(o.c)).map(o=>o.c);
  body(acc.length?`Assign the people who said yes. I’ll confirm their shift and update the schedule.`:'Nobody else accepted this round.',
   `<div class="fl-rows">${acc.map(c=>`<div class="fl-row"><span class="av">${ini(c.name)}</span><div class="nm"><b>${c.name}</b><small>${FROM[c.from]}${c.n>1?' · '+c.n+' people':''} · fit ${c.fit}</small></div><span class="fl-tag ok">Accepted</span></div>`).join('')}</div>
    <div class="fl-note">${acc.reduce((a,c)=>a+c.n,0)} of ${open} open ${open===1?'spot':'spots'} will be filled.</div>`);
  foot([{t:'Back',go:()=>go('responses')},'|',{t:acc.length?'Assign and notify':'Continue',cls:'pri',go:()=>acc.length?doAssign(acc,[]):go('partial')}]);
}
function doAssign(chosen,others){const st=R.st;chosen.forEach(c=>{st.assigned.push(c);ev('Worker assigned',undefined,c.name+(c.n>1?` (${c.n})`:''))});
  others.forEach(c=>{st.released.push(c);ev('Released with thanks',undefined,c.name+' told the shift is filled')});
  const tot=st.assigned.reduce((a,c)=>a+c.n,0);emit('assigned',{cands:chosen,filled:tot,need:st.need});if(F.fullPhone&&follow)phoneResult(chosen.includes(follow));
  if(tot>=st.need){setStatus('FILLED');ev('Filled','Shifty',`${tot} of ${st.need}`);go('done')}else{setStatus('PARTIALLY_FILLED');go('partial')}}
/* --- 7 Partial: next option or unable to fill --- */
function partial(){const st=R.st;const tot=st.assigned.reduce((a,c)=>a+c.n,0),left=st.need-tot;const nx=st.round===1&&R.next;
  body(`<b>${tot} of ${st.need} filled.</b> ${left} still open. ${nx?'Here’s what I’d try next.':'I’ve run out of eligible people for this one.'}`,
   `<div class="fl-prog" style="--pc:#f59e0b"><u style="width:${tot/st.need*100}%"></u></div>
    ${nx?`<div class="fl-opt"><b>${R.next.t}</b><p>${R.next.p}</p></div>`:`<div class="fl-opt"><b>Mark it unable to fill</b><p>I’ll keep the assigned people on and flag the gap to the shift lead.</p></div>`}`);
  foot([{t:'Unable to fill',go:()=>{setStatus('UNABLE_TO_FILL');ev('Marked unable to fill',undefined,`${left} open`);go('done')}},'|',
    ...(nx?[{t:R.next.approval?'Request approval':'Try it',cls:'pri',go:()=>{st.round=2;st.incentive=R.next.incentive||st.incentive;
      if(R.next.approval){setStatus('PENDING_APPROVAL');ev('Bonus requested',undefined,`$${st.incentive} · to Taylor Brooks`);go('approve')}else go('preview')}}]:[])]);
}
/* --- 8 Done --- */
function done(){const st=R.st;const tot=st.assigned.reduce((a,c)=>a+c.n,0);const ok=st.status==='FILLED';
  body(ok?`Covered. Everyone assigned got a confirmation${st.released.length?', and the people I didn’t pick got a thank-you':''}.`:`This one stays at ${tot} of ${st.need}. The gap is flagged to the shift lead.`,
   `<div class="fl-big"><div class="ck ${ok?'':'red'}">${ok?'✓':'!'}</div><h3>${ok?'Filled':'Unable to fill'}</h3><p>${tot} of ${st.need} · ${R.role} · ${R.when}</p></div>
    <div class="fl-rows">${st.assigned.map(c=>`<div class="fl-row"><span class="av">${ini(c.name)}</span><div class="nm"><b>${c.name}</b><small>${FROM[c.from]}${c.n>1?' · '+c.n+' people':''}</small></div><span class="fl-tag ok">Assigned</span></div>`).join('')}
     ${st.released.map(c=>`<div class="fl-row no"><span class="av">${ini(c.name)}</span><div class="nm"><b>${c.name}</b><small>Thanked, not needed this time</small></div></div>`).join('')}</div>`);
  if(ok&&window.faceHappy)faceHappy(document.getElementById('flFace'),3000);
  foot([{t:'View history',go:()=>{histOpen=true;render()}},'|',{t:'Done',cls:'pri',go:()=>F.close()}]);
}

/* ===== Batch: review the whole plan ===== */
F.openPlan=(reqs,opts={})=>{O=opts;planMode={reqs,step:'review'};R={deptName:CFG.event,role:CFG.planRole,loc:reqs.length+' '+CFG.unit,when:CFG.date,c:'#7c5cff',st:{status:'DRAFT',need:reqs.reduce((a,r)=>a+r.need,0),assigned:[],hist:[],incentive:0}};
  mount('#7c5cff');pRender()};
function pHeader(){const s=['Review','Eligibility','Outreach','Responses','Assign'];const i={review:0,elig:1,send:2,resp:3,assign:4,result:5}[planMode.step];
  const filled=planMode.reqs.reduce((a,r)=>a+(r.st?r.st.assigned.reduce((x,c)=>x+c.n,0):0),0),need=planMode.reqs.reduce((a,r)=>a+r.need,0);
  document.getElementById('flHd').innerHTML=`<div class="r1"><span class="dot"></span><div><small>${CFG.event} · ${CFG.date}</small><b class="t">${CFG.planTitle}</b></div><span class="sp"></span><span class="fl-pill ${i>=5?'FILLED':i>=2?'OUTREACH_IN_PROGRESS':'DRAFT'}">${filled} of ${need} filled</span><button class="fl-ib" id="flX">✕</button></div>
   <div class="fl-meta"><span>${planMode.reqs.length} requests</span><span>${planMode.reqs.reduce((a,r)=>a+r.cands.filter(c=>c.ok).length,0)} candidates</span><span>${i>=3?'Offers sent':'Nothing sent until you approve'}</span></div>
   <div class="fl-steps">${s.map((x,j)=>`<div class="${j<i?'done':j===i?'cur':''}">${x}</div>`).join('')}</div>`;
  document.getElementById('flX').onclick=()=>{if(!busy)F.close()}}
function pRender(){if(!W)return;pHeader();({review:pReview,elig:pElig,send:pSend,resp:pResp,assign:pAssign,result:pResult})[planMode.step]()}
function pGo(s){planMode.step=s;pRender()}
const rowP=(r,right)=>`<div class="fl-row"><span class="av" style="background:${r.c}33;color:${r.c}">${r.need}</span><div class="nm"><b>${r.deptName} · ${r.role}</b><small>${r.when}</small></div>${right}</div>`;
function pReview(){const L=planMode.reqs;
  body(`${CFG.event} needs <b>${L.reduce((a,r)=>a+r.need,0)} people</b> across ${L.length} ${CFG.unit}. I drafted a request for each one. Review them together, then I’ll check eligibility.`,
   `<div class="fl-rows">${L.map(r=>rowP(r,`<span class="fl-tag wait">${(r.st&&r.st.status!=='DRAFT')?LBL[r.st.status]:'Draft'}</span>`)).join('')}</div>
    <div class="fl-note">Each request still keeps its own history, and you can open any of them later.</div>`);
  foot(['|',{t:`Confirm all ${L.length}`,cls:'pri',go:()=>{L.forEach(r=>{F.state(r);if(!r.st.hist.length){const pr=R;R=r;ev('Draft created by the agent','Shifty');ev('Confirmed',undefined,'As part of the fight night plan');R=pr}r.st.status='READY_FOR_OUTREACH';r.st.step='elig'});pGo('elig')}}]);
}
async function pElig(){const L=planMode.reqs;body('Checking eligibility for every request…',`<div class="fl-rows" id="flPe">${L.map((r,i)=>rowP(r,`<span class="fl-spin" data-i="${i}"></span>`)).join('')}</div>`);
  foot(['|',{t:'Preview offers',cls:'pri',dis:true,go:()=>{}}]);busy=true;
  for(const [i,r] of L.entries()){await sleep(220);r.st.elig=r.cands.filter(c=>c.ok);const sp=document.querySelector(`#flPe [data-i="${i}"]`);if(sp)sp.outerHTML=`<span class="fl-tag ok">${r.st.elig.reduce((a,c)=>a+c.n,0)} eligible</span>`;
    const pr=R;R=r;if(!r.st.eligLogged){ev('Eligibility checked','Shifty');r.st.eligLogged=true}R=pr}
  busy=false;const n=L.reduce((a,r)=>a+r.st.elig.reduce((x,c)=>x+c.n,0),0);document.querySelector('#flBody .fl-ag p').innerHTML=`<b>${n} eligible people</b> across the plan. Next, the offers.`;
  foot(['|',{t:'Preview offers',cls:'pri',go:()=>pGo('send')}])}
function pSend(){const L=planMode.reqs;const n=L.reduce((a,r)=>a+r.st.elig.length,0);
  body(`That’s <b>${n} offers</b> by email and SMS. Same message format for each department. <b>You’re sending them, not me.</b>`,`<div class="fl-rows">${L.map(r=>rowP(r,`<span class="fl-tag sent">${r.st.elig.length} offers</span>`)).join('')}</div>`);
  foot([{t:'Back',go:()=>pGo('elig')},'|',{t:`Send ${n} offers`,cls:'acc',go:()=>{L.forEach(r=>{r.st.elig.forEach(c=>r.st.offers[c.name]={c,s:'sent'});r.st.status='OUTREACH_IN_PROGRESS';r.st.step='responses';const pr=R;R=r;ev('Outreach started',undefined,`${r.st.elig.length} offers`);emit('sent',{cands:r.st.elig});R=pr});pGo('resp')}}]);
}
async function pResp(){const L=planMode.reqs;const draw=()=>L.map(r=>{const o=Object.values(r.st.offers);const a=o.filter(x=>x.s==='accept').reduce((s,x)=>s+x.c.n,0),w=o.filter(x=>x.s==='sent'||x.s==='open').length;
   return `<div class="fl-row" style="flex-wrap:wrap"><span class="av" style="background:${r.c}33;color:${r.c}">${r.need}</span><div class="nm"><b>${r.deptName}</b><small>${a} accepted · ${w} waiting</small></div><span class="fl-tag ${a>r.need?'open':a>=r.need?'ok':w?'sent':'no'}">${a>r.need?'Your call':a>=r.need?'Enough':w?'…':'Short'}</span><div class="fl-prog" style="flex:0 0 100%;--pc:${r.c}"><u style="width:${Math.min(100,a/r.need*100)}%"></u></div></div>`}).join('');
  body('Replies are coming in. Accepting doesn’t assign anyone yet.',`<div class="fl-rows" id="flPr">${draw()}</div>`);foot(['|',{t:'Waiting for replies…',cls:'pri',dis:true,go:()=>{}}]);busy=true;
  const all=[];L.forEach(r=>Object.values(r.st.offers).forEach(o=>all.push([r,o])));all.sort(()=>Math.random()-.5);
  for(const [r,o] of all){await sleep(110);if(o.c.resp==='none'){o.s='open';continue}o.s=o.c.resp==='decline'?'decline':'accept';const pr=R;R=r;ev(o.s==='accept'?'Offer accepted':'Offer declined',o.c.name);emit('response',{cand:o.c,resp:o.s});R=pr;const el=document.getElementById('flPr');if(el)morph(el,draw())}
  busy=false;const calls=L.filter(r=>Object.values(r.st.offers).filter(o=>o.s==='accept').reduce((s,o)=>s+o.c.n,0)>r.need).length;
  document.querySelector('#flBody .fl-ag p').innerHTML=`All replies are in. ${calls?`<b>${calls} ${calls>1?'requests have':'request has'} more yeses than spots</b>, so I picked by the house and union rules. You can change those.`:''}`;
  const out=[];L.forEach(r=>Object.values(r.st.offers).forEach(o=>{if(o.s==='sent'||o.s==='open')out.push([r,o])}));
  if(out.length)document.querySelector('#flBody .fl-ag p').innerHTML+=` ${out.length} ${out.length>1?'people haven’t':'person hasn’t'} replied.`;
  foot(['|',{t:'Review assignments',cls:'pri',go:()=>{if(!out.length){pGo('assign');return}planConfirm(out)}}])}
function planConfirm(out){const P=document.querySelector('.fl-panel');const d=document.createElement('div');d.className='fl-confirm';
  d.innerHTML=`<div class="fl-cbox"><div class="fl-cic">!</div><h4>${out.length} ${out.length>1?'people haven’t':'person hasn’t'} replied yet</h4><p>You still haven’t received responses from <b>${out.length} eligible employee${out.length>1?'s':''}</b> (${out.map(([r,o])=>o.c.name+', '+r.deptName).join('; ')}). Are you sure you want to continue? This will cancel the offer for ${out.length>1?'those employees':'that employee'}.</p>
   <div class="fl-cact"><button class="fl-btn" id="flCk">Keep waiting</button><button class="fl-btn pri" id="flCg">Cancel ${out.length} offer${out.length>1?'s':''} and continue</button></div></div>`;
  P.appendChild(d);d.querySelector('#flCk').onclick=()=>d.remove();
  d.querySelector('#flCg').onclick=()=>{d.remove();out.forEach(([r,o])=>{o.s='cancelled';const pr=R;R=r;ev('Offer cancelled',o.c.name,'No reply before assignment · link expired');R=pr});pGo('assign')}}
function recFor(r){const open=r.need-r.st.assigned.reduce((a,c)=>a+c.n,0);const acc=Object.values(r.st.offers).filter(o=>o.s==='accept'&&!r.st.assigned.includes(o.c)).map(o=>o.c);
  const pol=(typeof POLICY!=='undefined'?POLICY:{})[r.dept];let rec=pol?acc.filter(c=>pol.pick.includes(c.name)):acc.slice().sort((a,b)=>b.fit-a.fit);const out=[];let n=0;for(const c of rec){if(n+c.n>open)continue;out.push(c);n+=c.n}return {rec:out,acc,pol}}
function pAssign(){const L=planMode.reqs;
  body('Here’s who I’d assign. Where more people said yes than needed, I followed the rule shown. Assigning sends each person a confirmation.',
   `<div class="fl-rows">${L.map(r=>{const {rec,acc,pol}=recFor(r);const n=rec.reduce((a,c)=>a+c.n,0);return `<div class="fl-row" style="flex-wrap:wrap;align-items:flex-start"><span class="av" style="background:${r.c}33;color:${r.c}">${r.need}</span><div class="nm"><b>${r.deptName} · ${n} of ${r.need}</b><small style="white-space:normal">${rec.map(c=>c.name).join(', ')}</small>${pol&&acc.length>rec.length?`<small style="white-space:normal;color:#fde68a;opacity:1;margin-top:3px">Your call · ${pol.rule.split(':')[0]}</small>`:''}</div><span class="fl-tag ${n>=r.need?'ok':'wait'}" style="${n<r.need?'background:rgba(245,158,11,.22);color:#fde68a':''}">${n>=r.need?'Fills it':'Short '+(r.need-n)}</span></div>`}).join('')}</div>`);
  foot([{t:'Back',go:()=>pGo('resp')},'|',{t:'Assign and notify',cls:'pri',go:async()=>{busy=true;for(const r of L){const {rec,acc}=recFor(r);const pr=R;R=r;doAssignQuiet(rec,acc.filter(c=>!rec.includes(c)));R=pr;await sleep(260)}busy=false;pGo('result')}}]);
}
function doAssignQuiet(chosen,others){const st=R.st;chosen.forEach(c=>{st.assigned.push(c);ev('Worker assigned',undefined,c.name)});others.forEach(c=>{st.released.push(c);ev('Released with thanks',undefined,c.name)});
  const tot=st.assigned.reduce((a,c)=>a+c.n,0);emit('assigned',{cands:chosen,filled:tot,need:st.need});if(tot>=st.need){st.status='FILLED';st.step='done';ev('Filled','Shifty')}else{st.status='PARTIALLY_FILLED';st.step='partial'}emit('status',{status:st.status})}
function pResult(){const L=planMode.reqs;const part=L.filter(r=>r.st.status!=='FILLED');const filled=L.reduce((a,r)=>a+r.st.assigned.reduce((x,c)=>x+c.n,0),0),need=L.reduce((a,r)=>a+r.need,0);
  body(part.length?`<b>${filled} of ${need} covered.</b> ${part.map(r=>r.deptName).join(' and ')} ${part.length>1?'are':'is'} still short. I have a next step for ${part.length>1?'them':'it'}.`:'Everything is covered.',
   `<div class="fl-big"><div class="ck ${part.length?'amber':''}">${part.length?filled:'✓'}</div><h3>${part.length?'Almost there':`${CFG.event} is covered`}</h3><p>${L.length-part.length} of ${L.length} requests filled</p></div>
    <div class="fl-rows">${L.map(r=>rowP(r,`<span class="fl-pill ${r.st.status}">${LBL[r.st.status]}</span>`)).join('')}</div>`);
  if(!part.length&&window.faceHappy)faceHappy(document.getElementById('flFace'),3000);
  foot([...(part.length?[{t:`Finish ${part[0].deptName}`,cls:'acc',go:()=>{const r=part[0];F.close();setTimeout(()=>{if(O.openOne)O.openOne(r);else F.open(r,O)},500)}}]:[]),'|',{t:'Done',cls:'pri',go:()=>F.close()}]);
  emit('planDone',{})}
F.phoneDemo=(req,c,root,pos)=>{const pr=R;R={...req,st:req.st||{incentive:0}};const w=document.createElement('div');w.className='fl-wrap on';
  w.innerHTML=`<div class="fl-phone" id="flPhone" style="${pos||''}"><div class="lbl">Worker’s phone</div><div class="scr"><div class="notch"></div><div class="stat"><span>9:41</span><span>●●● ▮</span></div><div id="flPh"></div></div></div>`;
  (root||document.body).appendChild(w);return phone(c).then(()=>{w.remove();R=pr})};
/* demo scenario tags: lets a presenter spot the interesting requests */
F.scen=r=>{if(!r)return [];const st=r.st;if(st&&['FILLED','UNABLE_TO_FILL'].includes(st.status))return [];const acc=r.cands.filter(c=>c.ok&&c.resp==='accept').reduce((x,c)=>x+c.n,0);const t=[];
  if(acc>r.need)t.push(['call','Your call','More people say yes than there are spots. You pick, with the agent’s recommendation.']);
  if(r.next)t.push(['bonus','Bonus round','Not enough yeses. A bonus needs a second manager’s approval, then a second round of offers.']);return t};
F.scenTags=(r,cls='')=>F.scen(r).map(([k,l,d])=>`<span class="scn scn-${k} ${cls}" title="${d}">${k==='call'?'⚖':'＋'} ${l}</span>`).join('');
window.FROM=FROM;
})();
