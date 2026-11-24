/* Data mode: "Ops data" (demand signals like arrivals, covers, room status)
   vs "Roster only" (schedule, staffing template, callouts, hours, certifications).
   Shared by every prototype. Persists for the browser session. */
(function(){
  const KEY='sca-data';
  const get=()=>{try{return sessionStorage.getItem(KEY)||'roster'}catch(e){return 'roster'}};
  const DM={
    get mode(){return get()},
    get full(){return get()==='full'},
    get roster(){return get()==='roster'},
    set(m){try{sessionStorage.setItem(KEY,m)}catch(e){}document.querySelectorAll('.dmT').forEach(paint);dispatchEvent(new CustomEvent('sca-data',{detail:m}))},
    /* insert the toggle into a container (prepend or append) */
    mount(where,opts={}){if(!where)return null;const el=document.createElement('div');el.className='dmT'+(opts.light?' light':'');
      el.innerHTML=`<button data-m="full" title="Uses demand signals: arrivals, covers, room status, guest counts">Ops data</button><button data-m="roster" title="Uses only the schedule, staffing template, callouts, hours and certifications">Roster only</button><span class="dmI" tabindex="0">i<span class="dmTip"><b>Ops data</b> adds demand signals from other systems: hotel arrivals, reservations and covers, room status, valet tickets, guest counts.<br><br><b>Roster only</b> assumes we only have the schedule, the staffing template (minimum people per role per shift), callouts, hours and certifications.</span></span>`;
      el.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();DM.set(b.dataset.m)});
      if(opts.prepend)where.prepend(el);else if(opts.before)where.parentNode.insertBefore(el,where);else where.appendChild(el);paint(el);return el},
    on(fn){addEventListener('sca-data',e=>fn(e.detail))}
  };
  function paint(el){el.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.m===get()))}
  const css=`.dmT{display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;background:rgba(10,12,24,.72);border:1px solid rgba(255,255,255,.16);font-family:Inter,system-ui,sans-serif;position:relative;z-index:50;flex:0 0 auto;backdrop-filter:blur(8px)}
  .dmT button{font-size:11.5px;font-weight:800;padding:6px 11px;border-radius:999px;color:rgba(238,240,255,.7);background:transparent;border:0;cursor:pointer;white-space:nowrap;transition:background .2s,color .2s}
  .dmT button.on{background:#fff;color:#0b0d1a}
  .dmT button[data-m=roster].on{background:#fbbf24;color:#1a1000}
  .dmT.light{background:#fff;border-color:rgba(20,33,61,.16)}.dmT.light button{color:#5a4a30}.dmT.light button.on{background:#14213d;color:#fff}.dmT.light button[data-m=roster].on{background:#b45309;color:#fff}
  .dmI{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:900;font-style:italic;color:rgba(238,240,255,.7);border:1px solid rgba(255,255,255,.25);margin:0 4px 0 2px;cursor:help;position:relative}
  .dmT.light .dmI{color:#5a4a30;border-color:rgba(20,33,61,.25)}
  .dmTip{display:none;position:absolute;top:28px;right:-6px;width:300px;padding:12px 14px;border-radius:12px;background:#0d0f1e;color:#eef0ff;font-size:12px;font-weight:500;font-style:normal;line-height:1.5;box-shadow:0 20px 40px rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.12);text-align:left;z-index:500}
  .dmI:hover .dmTip,.dmI:focus .dmTip{display:block}
  .dmBadge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:rgba(251,191,36,.18);color:#fbbf24;border:1px solid rgba(251,191,36,.35)}`;
  const st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);
  window.DM=DM;
})();
