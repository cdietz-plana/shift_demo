/* Shared demo password gate. Client-side only: keeps casual visitors out. */
(function(){
  var H='38599b5a729b7c73a6a9aff253cb63749f52a37718bd17de8d2973b23dd78a82';
  function ok(){try{return sessionStorage.getItem('sca-ok')==='1'}catch(e){return false}}
  function save(){try{sessionStorage.setItem('sca-ok','1')}catch(e){}}
  async function sha(t){try{var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}catch(e){return null}}
  window.scaGate=function(theme,onOk){
    if(ok()){onOk();return}
    var dark=theme!=='light';
    var st=document.createElement('style');
    st.textContent='#scaGate{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;font-family:Inter,system-ui,sans-serif;'+(dark?'background:radial-gradient(ellipse at 50% 30%,#141a2b,#05070c);color:#e8ecf5':'background:radial-gradient(ellipse at 50% 30%,#fff,#e4ebf2);color:#0f2233')+'}'+
    '#scaGate form{width:380px;padding:34px 32px;border-radius:22px;text-align:center;'+(dark?'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);box-shadow:0 40px 80px rgba(0,0,0,.5);backdrop-filter:blur(20px)':'background:#fff;border:1px solid #dbe4ed;box-shadow:0 30px 70px rgba(15,34,51,.14)')+'}'+
    '#scaGate .m{width:54px;height:54px;border-radius:50%;margin:0 auto;display:grid;place-items:center;font-weight:900;color:#fff;background:conic-gradient(from 0deg,#f3d77a,#7c5cff,#22d3ee,#f3d77a);box-shadow:0 0 30px rgba(124,92,255,.45)}'+
    '#scaGate .m i{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-style:normal;background:'+(dark?'#0b0f1a':'#fff')+';color:'+(dark?'#fff':'#0f2233')+';font-size:14px}'+
    '#scaGate h1{font-size:21px;margin:14px 0 6px}#scaGate p{font-size:13px;opacity:.7;margin:0 0 20px}'+
    '#scaGate input{width:100%;box-sizing:border-box;padding:13px 15px;border-radius:12px;font-size:15px;outline:0;'+(dark?'background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#fff':'background:#f3f6f9;border:1px solid #e1e8ef;color:#0f2233')+'}'+
    '#scaGate button{width:100%;margin-top:12px;padding:13px;border-radius:12px;font-size:14px;font-weight:700;border:0;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7c5cff,#22d3ee)}'+
    '#scaGate .e{font-size:12.5px;margin-top:10px;min-height:16px;color:#ff6b6b}#scaGate.sh form{animation:scaSh .4s}@keyframes scaSh{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}';
    document.head.appendChild(st);
    var g=document.createElement('div');g.id='scaGate';
    g.innerHTML='<form autocomplete="off"><div class="m"><i>SC</i></div><h1>Shift Coverage Agent</h1><p>Concept demos by Plan A Technologies. Enter the password to continue.</p><input type="password" placeholder="Password"><button type="submit">Enter</button><div class="e"></div></form>';
    document.body.appendChild(g);
    var inp=g.querySelector('input');setTimeout(function(){inp.focus()},50);
    g.querySelector('form').onsubmit=async function(e){e.preventDefault();var v=inp.value;var h=await sha(v);
      var good=h?h===H:v===['P','l','a','n','A'].join('');
      if(good){save();g.remove();st.remove();onOk()}
      else{g.querySelector('.e').textContent='That password isn’t right.';g.classList.remove('sh');void g.offsetWidth;g.classList.add('sh');inp.select()}};
  };
})();
