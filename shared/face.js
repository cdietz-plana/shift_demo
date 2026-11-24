/* Shifty, the coverage agent: eyes + mouth.
   Pupils follow the cursor, blinks at random (sometimes twice), talks, smiles. */
(function(){
  var css='.face{position:absolute;inset:0;width:100%;height:100%;z-index:3;overflow:visible;pointer-events:none}'+
  '.face .eo ellipse.wh{fill:#fff}.face .eo{transform-box:fill-box;transform-origin:center;transition:transform .07s ease-in,opacity .2s}'+
  '.face .pu{fill:#1a0b4a}.face .gl{fill:#fff;opacity:.9}'+
  '.face .pg{transition:transform .12s ease-out}'+
  '.blink .face .eo{transform:scaleY(.08)}'+
  '.face .eh path,.face .ms{fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round}'+
  '.face .eh{opacity:0;transition:opacity .2s}'+
  '.face .mt{fill:#1a0b4a;stroke:#fff;stroke-width:4;opacity:0;transform-box:fill-box;transform-origin:center}'+
  '.face .ms{transition:opacity .15s}.face .ck{fill:#ff8fc8;opacity:0;transition:opacity .3s}'+
  '.talk .face .ms{opacity:0}.talk .face .mt{opacity:1;animation:fTalk .18s ease-in-out infinite alternate}'+
  '.happy .face .eo{opacity:0}.happy .face .eh{opacity:1}.happy .face .ck{opacity:.55}'+
  '.happy .face .ms{d:path("M30 60 Q50 82 70 60")}'+
  '.face .eyes{transition:transform .25s ease-out}'+
  '@keyframes fTalk{from{transform:scaleY(.35)}to{transform:scaleY(1.1)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  window.AGENT_NAME='Shifty';
  window.agentFace=function(){return '<svg class="face" viewBox="0 0 100 100" aria-hidden="true">'+
    '<ellipse class="ck" cx="26" cy="60" rx="7" ry="4"/><ellipse class="ck" cx="74" cy="60" rx="7" ry="4"/>'+
    '<g class="eyes"><g class="eo"><ellipse class="wh" cx="36" cy="42" rx="7.5" ry="10"/><ellipse class="wh" cx="64" cy="42" rx="7.5" ry="10"/>'+
    '<g class="pg"><ellipse class="pu" cx="36" cy="43" rx="3.4" ry="4.2"/><ellipse class="pu" cx="64" cy="43" rx="3.4" ry="4.2"/><circle class="gl" cx="37.3" cy="41.2" r="1.1"/><circle class="gl" cx="65.3" cy="41.2" r="1.1"/></g></g>'+
    '<g class="eh"><path d="M28 45 Q36 34 44 45"/><path d="M56 45 Q64 34 72 45"/></g></g>'+
    '<path class="ms" d="M36 62 Q50 74 64 62"/><ellipse class="mt" cx="50" cy="66" rx="8" ry="6.5"/></svg>'};
  function host(el){return el&&(el.closest('.faceHost')||el)}
  window.faceTalk=function(el,ms){el=host(el);if(!el)return;el.classList.add('talk');clearTimeout(el._ft);el._ft=setTimeout(function(){el.classList.remove('talk')},ms||1500)};
  window.faceHappy=function(el,ms){el=host(el);if(!el)return;el.classList.add('happy');clearTimeout(el._fh);el._fh=setTimeout(function(){el.classList.remove('happy')},ms||2200)};
  /* pupils look at the cursor; the whole eye shifts a touch so it reads as a glance */
  var mx=null,my=null;
  function look(){if(mx===null)return;document.querySelectorAll('.face').forEach(function(sv){var r=sv.getBoundingClientRect();if(!r.width)return;
    var dx=mx-(r.left+r.width/2),dy=my-(r.top+r.height*.42),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/220);
    var pg=sv.querySelector('.pg'),ey=sv.querySelector('.eyes');
    if(pg)pg.setAttribute('transform','translate('+(dx/d*k*3.4).toFixed(2)+','+(dy/d*k*4.6).toFixed(2)+')');
    if(ey)ey.style.transform='translate('+(dx/d*k*1.6).toFixed(2)+'px,'+(dy/d*k*1.2).toFixed(2)+'px)'})}
  var raf=0;document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;if(!raf)raf=requestAnimationFrame(function(){raf=0;look()})});
  /* blinks: every face on its own clock, 2.5 to 6.5 s apart, sometimes a double blink */
  function blink(h){h.classList.add('blink');setTimeout(function(){h.classList.remove('blink')},140)}
  setInterval(function(){var now=Date.now();document.querySelectorAll('.face').forEach(function(sv){var h=sv.parentNode;if(!h||!h.classList)return;
    if(!h._nb){h._nb=now+800+Math.random()*3000;return}
    if(now>=h._nb){blink(h);if(Math.random()<.22)setTimeout(function(){blink(h)},260);h._nb=now+2500+Math.random()*4000}})},120);
})();
