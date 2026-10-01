'use strict';
/* ===== Data ===== */
const TOURS=[
['🇹🇷','Turkiya','7 kecha','Nonushta (BB)',760,'turkiya','Istanbul, Kapadokiya va Egey sohillari — tarix, bozorlar va issiq havo sharlari.'],
['🇻🇳','Vyetnam — Nyachang','7+1 kecha','Nonushta (BB)',860,'nyachang','Tropik plyajlar, issiq buloqlar va dengiz mahsulotlari.'],
['🇻🇳','Vyetnam — Fukuok','7 kecha','Nonushta (BB)',650,'fukuok','Sokin tropik orol, oq qum va ajoyib quyosh botishlari.'],
['🇪🇬','Misr — Sharm el-Sheyx','7 kecha','All Inclusive — barcha ovqatlanishlar',590,'sharm','Qizil dengiz, marjon riflari va All Inclusive kurortlar.'],
['🇲🇻','Maldiv orollari','7 kecha','Nonushta (BB)',900,'maldiv','Zumrad rangli suv va suv ustidagi villalar.'],
['🇦🇪','Dubay','7 kecha','Nonushta (BB)',420,'dubay','Burj Xalifa, zamonaviy osmono‘par binolar va cho‘l safari.'],
['🇲🇾','Langkavi + Kuala-Lumpur','6+1 kecha','Nonushta (BB)',1160,'langkavi','Langkavi plyajlari va Kuala-Lumpurdagi Petronas minoralari.'],
['🇨🇳','Xitoy — Xaynan','7+1 kecha','Nonushta (BB)',660,'xaynan','Xitoyning tropik oroli: dengiz, palmalar va kurortlar.'],
['🇨🇳','Xitoy — Guanchjou','7 kecha','Nonushta (BB)',1100,'guanchjou','Zamonaviy megapolis, osmono‘par binolar va mazali oshxona.'],
['🇹🇭','Tailand — Pattaya','7+1 kecha','Nonushta (BB)',645,'pattaya','Plyajlar, orollarga sayohatlar va jonli kechalar.'],
['🇹🇭','Tailand — Phuket','7 kecha','Nonushta (BB)',675,'phuket','Phuket plyajlari va Andaman dengizi orollari.'],
['🇬🇪','Gruziya — Tbilisi','7 kecha','Nonushta (BB)',555,'tbilisi','Qadimiy ko‘chalar, issiq hammomlar va gruzin taomlari.'],
['🇦🇿','Ozarbayjon — Baku','7 kecha','Nonushta (BB)',500,'baku','Zamonaviy Baku silueti, Eski shahar va Kaspiy sohili.']];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const flow=()=>matchMedia('(max-width:800px),(prefers-reduced-motion:reduce)').matches;

/* ===== Render tour cards ===== */
function renderTours(){
  $('#grid').innerHTML=TOURS.map((t,i)=>`<article class="card glass tilt" tabindex="0" role="button" data-i="${i}" aria-label="${t[1]} — batafsil">
  <img src="assets/images/${t[5]}.svg" alt="${t[1]} manzarasi" loading="lazy"><div class="cb"><h3>${t[0]} ${t[1].toUpperCase()}</h3>
  <p>${t[2]}<br>🍽 ${t[3]}</p><p class="price">${t[4]} USD dan</p><span class="btn glass">Batafsil →</span></div></article>`).join('');
  $('#bd').innerHTML=TOURS.map(t=>`<option>${t[1]}</option>`).join('');
}

/* ===== Scroll-to-zoom: virtual progress p (0..3) eased toward target ===== */
const layers=$$('.layer');let target=0,p=0,raf=0;
function render(){
  p+=(target-p)*0.08;
  layers.forEach((el,i)=>{
    const d=p-i,a=Math.abs(d);
    if(a>1.05){el.style.visibility='hidden';return}
    el.style.visibility='visible';
    // d<0: still far away (small, behind); d>0: passed through (large, fading)
    const s=d<0?1+d*0.35:1+d*0.9, z=d<0?d*300:d*250;
    el.style.opacity=Math.max(0,1-a*1.4);
    el.style.transform=`translateZ(${z}px) scale(${s}) rotateX(${d*-6}deg)`;
    el.style.filter=a>.05?`blur(${a*8}px)`:'none';
    el.style.pointerEvents=a<.4?'auto':'none';
  });
  raf=Math.abs(target-p)>0.001?requestAnimationFrame(render):0;
}
function go(n){target=Math.max(0,Math.min(layers.length-1,n));if(!raf)raf=requestAnimationFrame(render)}
function initZoom(){
  let lock=0;
  addEventListener('wheel',e=>{
    if(flow()||!$('.modal[hidden]')===false&&0)return;
    if($$('.modal').some(m=>!m.hidden))return;
    const sc=e.target.closest('.scrolly');
    if(sc&&Math.round(p)===layers.indexOf(sc)){ // scroll inside long sections first
      const atTop=sc.scrollTop<=0,atEnd=sc.scrollTop+sc.clientHeight>=sc.scrollHeight-2;
      if((e.deltaY>0&&!atEnd)||(e.deltaY<0&&!atTop))return;
    }
    e.preventDefault();
    const now=performance.now();if(now-lock<650)return; // one step per gesture
    lock=now;go(Math.round(target)+Math.sign(e.deltaY));
    $$('.scrolly').forEach(s=>s.scrollTop=0);
  },{passive:false});
  addEventListener('keydown',e=>{if(flow())return;if(e.key==='PageDown'||e.key==='ArrowRight')go(target+1);if(e.key==='PageUp'||e.key==='ArrowLeft')go(target-1)});
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const i=layers.findIndex(l=>'#'+l.id===a.getAttribute('href'));
    if(i>=0&&!flow()){e.preventDefault();go(i)}}));
  let t0;addEventListener('touchstart',e=>t0=e.touches[0].clientY,{passive:true});
  render();
}

/* ===== Mouse: portal rotation, 3D card tilt, cursor ===== */
function initMouse(){
  const cur=$('.cursor');let cx=0,cy=0,tx=0,ty=0;
  addEventListener('mousemove',e=>{
    tx=e.clientX;ty=e.clientY;
    const mx=e.clientX/innerWidth-.5,my=e.clientY/innerHeight-.5;
    document.documentElement.style.setProperty('--mx',mx);document.documentElement.style.setProperty('--my',my);
    $('#stars').style.transform=`translate(${mx*-14}px,${my*-14}px)`;
    const c=e.target.closest('.tilt');if(c){const r=c.getBoundingClientRect();
      c.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*8+'deg');c.style.setProperty('--rx',(((e.clientY-r.top)/r.height-.5)*-8)+'deg')}
    cur.classList.toggle('big',!!e.target.closest('a,button,.card,input,select'));
  });
  addEventListener('mouseout',e=>{const c=e.target.closest&&e.target.closest('.tilt');if(c){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}});
  (function loop(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop)})();
}

/* ===== Starfield / travel-light particles ===== */
function initStars(){
  const c=$('#stars'),x=c.getContext('2d');let w,h,pts=[];
  const n=flow()?40:110;
  const size=()=>{w=c.width=innerWidth;h=c.height=innerHeight};size();addEventListener('resize',size);
  for(let i=0;i<n;i++)pts.push({x:Math.random(),y:Math.random(),r:Math.random()*1.5+.3,v:Math.random()*.00008+.00002,c:Math.random()<.2?'180,170,255':'200,240,255'});
  (function draw(){x.clearRect(0,0,w,h);
    pts.forEach(q=>{q.y-=q.v;if(q.y<0)q.y=1;x.fillStyle=`rgba(${q.c},${.3+q.r/3})`;x.beginPath();x.arc(q.x*w,q.y*h,q.r,0,7);x.fill()});
    if(!matchMedia('(prefers-reduced-motion:reduce)').matches)requestAnimationFrame(draw)})();
}

/* ===== Modals: destination detail + booking form ===== */
function openM(m){m.hidden=false;m.dataset.prev=document.activeElement?.id||'';$('.x,button',m).focus()}
function closeM(){$$('.modal').forEach(m=>m.hidden=true)}
function initModals(){
  const d=$('#detail');let cur=0;
  $('#grid').addEventListener('click',e=>{const c=e.target.closest('.card');if(!c)return;
    const t=TOURS[cur=+c.dataset.i];$('#di').src=`assets/images/${t[5]}.svg`;$('#di').alt=t[1]+' manzarasi';
    $('#dt').textContent=`${t[0]} ${t[1]}`;$('#dm').textContent=`${t[2]} · 🍽 ${t[3]}`;$('#dd').textContent=t[6];$('#dp').textContent=`${t[4]} USD dan`;openM(d)});
  $('#grid').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.click()}});
  const book=$('#book');
  const openBook=i=>{$('#bd').selectedIndex=i;$('#res').hidden=true;closeM();openM(book)};
  $('#db').onclick=()=>openBook(cur);
  $('[data-book]').onclick=()=>openBook(0);
  $$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-close]'))closeM()}));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
  // Static site: build a prefilled Telegram link instead of posting to a server
  $('#bf').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);
    const txt=`Salom! Akmus Tour.\nIsm: ${f.get('n')}\nTelefon: ${f.get('p')}\nYo‘nalish: ${f.get('d')}\nSayohatchilar: ${f.get('c')}\nXabar: ${f.get('m')||'-'}`;
    $('#tg').href='https://t.me/Akmus_Ruxshona?text='+encodeURIComponent(txt);$('#res').hidden=false});
}

/* ===== Boot ===== */
renderTours();initStars();initModals();
if(!flow()){initZoom();initMouse()}
setTimeout(()=>document.body.classList.remove('loading'),400);
