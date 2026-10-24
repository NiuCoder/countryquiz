import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import topoData from '../data/topo.json';
import metaData from '../data/meta.json';
import capsData from '../data/caps.json';
import namesFr from '../data/names-fr.json';
import capsFr from '../data/caps-fr.json';
import { I18N } from './i18n.js';

/**
 * 启动游戏。
 * @param cfg.lang       界面语言 'zh' | 'en' | 'fr'
 * @param cfg.qmode      可选，预设玩法（shape/findShape/flag/findFlag/capital/fromCapital/mix）
 * @param cfg.cont       可选，预设地区（CONTS 中的中文名）
 * @param cfg.start      可选，'learn' 直接进入学习模式
 * @param cfg.countryUrl 英文国名 -> 国家详情页 URL
 */
export function initGame(cfg){
const $=s=>document.getElementById(s);
const CONTS=['全世界','亚洲','欧洲','非洲','北美洲','南美洲','大洋洲'];
const CONT_I18N={
  zh:{'全世界':'全世界','亚洲':'亚洲','欧洲':'欧洲','非洲':'非洲','北美洲':'北美洲','南美洲':'南美洲','大洋洲':'大洋洲'},
  en:{'全世界':'World','亚洲':'Asia','欧洲':'Europe','非洲':'Africa','北美洲':'North America','南美洲':'South America','大洋洲':'Oceania'},
  fr:{'全世界':'Monde','亚洲':'Asie','欧洲':'Europe','非洲':'Afrique','北美洲':'Amérique du Nord','南美洲':'Amérique du Sud','大洋洲':'Océanie'},
};
const CONT_IC={'全世界':'🌏','亚洲':'🏯','欧洲':'🏰','非洲':'🦒','北美洲':'🗽','南美洲':'🦙','大洋洲':'🦘'};
const QMODES=[['shape','🗺️'],['findShape','🔍'],['flag','🚩'],['findFlag','🎌'],['capital','🏛️'],['fromCapital','🏙️'],['mix','🎲']];
const QTYPES=['shape','findShape','flag','findFlag','capital','fromCapital'];

/* ---------- 数据 ---------- */
const TOPO=topoData,META=metaData,CAPS=capsData;
const FEATS=topojson.feature(TOPO,TOPO.objects.countries).features;
const C={};
for(const id in META){
  const [zh,tier,cont,fi,drop,a2,en,nat]=META[id];
  const full=FEATS[fi];
  let shape=full;
  if(drop.length){
    shape={type:'Feature',geometry:{type:'MultiPolygon',coordinates:full.geometry.coordinates.filter((_,i)=>!drop.includes(i))}};
  }
  C[id]={id,zh,en,fr:namesFr[a2]||en,nat,a2,tier,cont,full,shape,omit:drop.length>0,center:d3.geoCentroid(shape)};
}
const IDS=Object.keys(C);
function flagUrl(c){return '/flags/'+c.a2+'.svg';}

/* ---------- 存档 ---------- */
const KEY='shape-guess-v1';
let S={xp:0,streak:0,last:'',known:{},sound:true,tier:1,cont:'全世界',qmode:'shape',lang:''};
try{const r=localStorage.getItem(KEY); if(r) S=Object.assign(S,JSON.parse(r));}catch(e){}
S.lang=cfg.lang;
if(cfg.qmode)S.qmode=cfg.qmode;
if(cfg.cont)S.cont=cfg.cont;
if(!QMODES.some(q=>q[0]===S.qmode))S.qmode='shape';
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function dayStr(d){d=d||new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function yesterday(){const d=new Date();d.setDate(d.getDate()-1);return dayStr(d);}
function curStreak(){return (S.last===dayStr()||S.last===yesterday())?S.streak:0;}

/* ---------- 语言 ---------- */
const t=k=>I18N[S.lang][k];
const N1=c=>S.lang==='zh'?c.zh:S.lang==='fr'?c.fr:c.en; // 当前语言的国名
const N2=c=>S.lang==='en'?c.zh:c.en;                     // 副标题：英文界面配中文，其余配英文
const NAT=c=>{
  const n1=N1(c);
  return (c.nat&&c.nat!==c.zh&&c.nat.toLowerCase()!==c.en.toLowerCase()&&c.nat!==n1)?c.nat:'';
};
const CN=k=>(CONT_I18N[S.lang]||CONT_I18N.en)[k]||k;
const stripNote=s=>String(s||'').replace(/\s*[（(].*[）)]$/,''); // 去掉“（行政首都）”之类说明
const capRaw=(c,lang)=>{
  if(lang==='fr') return capsFr[c.a2]||(CAPS[c.a2]||['',''])[1]||'';
  const row=CAPS[c.a2]||['',''];
  return lang==='zh'?row[0]:row[1];
};
const CAPN=c=>stripNote(capRaw(c,S.lang));
const CAPN2=c=>stripNote(capRaw(c,S.lang==='en'?'zh':'en'));
function esc(s){return String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
function applyLang(){
  document.querySelectorAll('[data-i]').forEach(el=>{el.textContent=t(el.dataset.i);});
  $('stStreak').title=t('streak');$('stXp').title=t('xp');
  $('sndBtn').setAttribute('aria-label',t('sound'));
  $('quitBtn').setAttribute('aria-label',t('quit'));
  $('hLoc').textContent=t('hintLoc');$('hCut').textContent=t('hintCut');
}

/* ---------- 声音 ---------- */
let AC=null;
function tone(fs,dur,type,gap){
  if(!S.sound) return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const t0=AC.currentTime+.01;
    fs.forEach((f,i)=>{
      const o=AC.createOscillator(),g=AC.createGain(),tt=t0+i*gap;
      o.type=type;o.frequency.value=f;
      g.gain.setValueAtTime(.0001,tt);g.gain.exponentialRampToValueAtTime(.16,tt+.02);g.gain.exponentialRampToValueAtTime(.0001,tt+dur);
      o.connect(g);g.connect(AC.destination);o.start(tt);o.stop(tt+dur+.03);
    });
  }catch(e){}
}
const sfx={
  ok:()=>tone([660,990],.22,'triangle',.11),
  bad:()=>tone([240,180],.25,'triangle',.13),
  tap:()=>tone([520],.06,'sine',0),
  win:()=>tone([523,659,784,1047],.25,'triangle',.12),
  lose:()=>tone([392,330,262],.3,'triangle',.16)
};

/* ---------- 吉祥物 小圆 ---------- */
function mascot(mood){
  const mouth={
    happy:'<path d="M41 61 q9 10 18 0" fill="none" stroke="#3c3c3c" stroke-width="3.6" stroke-linecap="round"/>',
    wow:'<ellipse cx="50" cy="64" rx="7" ry="8" fill="#3c3c3c"/><ellipse cx="50" cy="68" rx="4.5" ry="3" fill="#ff7a9a"/>',
    sad:'<path d="M42 68 q8 -7 16 0" fill="none" stroke="#3c3c3c" stroke-width="3.6" stroke-linecap="round"/>'
  }[mood||'happy'];
  const eyeY=mood==='sad'?49:46;
  return `<svg viewBox="0 0 100 104" width="100%" height="100%" aria-hidden="true">
  <ellipse cx="50" cy="98" rx="26" ry="4.5" fill="rgba(0,0,0,.12)"/>
  <path d="M50 12 q-1-9 -10-11 q0 9 10 11z" fill="#58cc02"/><path d="M50 12 q3-8 11-8 q-3 8 -11 8z" fill="#89e219"/>
  <circle cx="50" cy="52" r="40" fill="#1cb0f6"/>
  <path d="M18 40 q6-14 20-12 q7 5 0 12 q-9 3 -7 11 q-5 6 -11 0 q-4-5 -2-11z" fill="#58cc02"/>
  <path d="M64 74 q11-5 17 3 q-3 10 -14 11 q-7-5 -3-14z" fill="#58cc02"/>
  <path d="M58 19 q11-1 17 8 q-9 3 -17-3z" fill="#58cc02"/>
  <path d="M22 70 q4 6 10 7" fill="none" stroke="#58cc02" stroke-width="4" stroke-linecap="round"/>
  <path d="M27 31 a32 32 0 0 1 18-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>
  <circle cx="37" cy="${eyeY}" r="10.5" fill="#fff"/><circle cx="63" cy="${eyeY}" r="10.5" fill="#fff"/>
  <circle cx="39" cy="${eyeY+1}" r="5.6" fill="#3c3c3c"/><circle cx="65" cy="${eyeY+1}" r="5.6" fill="#3c3c3c"/>
  <circle cx="41" cy="${eyeY-1}" r="1.9" fill="#fff"/><circle cx="67" cy="${eyeY-1}" r="1.9" fill="#fff"/>
  ${mood==='sad'?'<path d="M28 36 l12 4 M72 36 l-12 4" stroke="#3c3c3c" stroke-width="3" stroke-linecap="round"/>':''}
  <ellipse cx="26" cy="62" rx="6" ry="3.6" fill="#ff86a8" opacity=".75"/><ellipse cx="74" cy="62" rx="6" ry="3.6" fill="#ff86a8" opacity=".75"/>
  ${mouth}</svg>`;
}
function setM(el,mood,hop){el.innerHTML=mascot(mood);if(hop){el.classList.remove('hop');void el.offsetWidth;el.classList.add('hop');}}

/* ---------- 地图绘制 ---------- */
const W=400,H=300;
function shapeProj(c,w,h,pad){
  return d3.geoAzimuthalEqualArea().rotate([-c.center[0],-c.center[1]]).fitExtent([[pad,pad],[w-pad,h-pad]],c.shape);
}
const DOTS='<defs><pattern id="dp" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="var(--dot)"/></pattern></defs><rect width="400" height="300" fill="url(#dp)"/>';
function setCard(alt,cls){
  $('card').classList.toggle('alt',alt);
  $('cardAlt').className='cardalt'+(cls?' '+cls:'');
  $('card').querySelector('.globe')?.remove();
}
function drawShape(c){
  setCard(false);
  const p=shapeProj(c,W,H,30), d=d3.geoPath(p).digits(1)(c.shape);
  $('mapSvg').innerHTML=DOTS+`<g class="pop"><path class="shape-sh" d="${d}" transform="translate(0,6)"/><path class="shape" d="${d}"/></g>`;
  $('mapSvg').setAttribute('aria-label',t('mapLabel'));
}
function drawFlag(c){
  setCard(true,'flagv');
  $('cardAlt').innerHTML=`<img class="bigflag pop" src="${flagUrl(c)}" alt="${esc(t('flagLabel'))}">`;
}
function drawName(c){
  setCard(true,'namev');
  const nat=NAT(c);
  $('cardAlt').innerHTML=`<div class="pop"><div class="bigname">${esc(N1(c))}</div><div class="subname">${esc(N2(c))}</div>${nat?`<div class="natname"><bdi>${esc(nat)}</bdi></div>`:''}</div>`;
}
function drawCapital(c){
  setCard(true,'namev');
  $('cardAlt').innerHTML=`<div class="pop"><div class="bigname">${esc(CAPN(c))}</div><div class="subname">${esc(CAPN2(c))}</div></div>`;
}
function drawContext(c,ok){
  setCard(false);
  const p=shapeProj(c,W,H,40);
  let s=p.scale()*0.42; s=Math.max(95,Math.min(s,1700));
  p.scale(s).translate([W/2,H/2]).clipAngle(90).clipExtent([[-4,-4],[W+4,H+4]]);
  const path=d3.geoPath(p).digits(1);
  let h=`<path class="ocean" d="${path({type:'Sphere'})}"/><path class="grat" d="${path(d3.geoGraticule10())}"/>`;
  for(const f of FEATS){if(f===c.full)continue;const d=path(f);if(d)h+=`<path class="land" d="${d}"/>`;}
  h+=`<path class="tgt${ok?'':' bad'}" d="${path(c.full)}"/>`;
  const b=path.bounds(c.shape);
  if((b[1][0]-b[0][0])*(b[1][1]-b[0][1])<260){const xy=p(c.center);if(xy)h+=`<circle class="ring${ok?' ok':''}" cx="${xy[0]}" cy="${xy[1]}" r="16"/>`;}
  $('mapSvg').innerHTML=`<g class="pop">${h}</g>`;
  $('mapSvg').setAttribute('aria-label',t('ctxLabel')(N1(c)));
}
function globeSvg(c){
  const lat=Math.max(-55,Math.min(55,c.center[1]));
  const p=d3.geoOrthographic().rotate([-c.center[0],-lat]).fitExtent([[4,4],[116,116]],{type:'Sphere'});
  const path=d3.geoPath(p).digits(1);
  let h=`<circle cx="60" cy="60" r="${p.scale()}" fill="var(--ocean)" stroke="var(--border)" stroke-width="2"/><path class="grat" d="${path(d3.geoGraticule10())}"/>`;
  for(const f of FEATS){const d=path(f);if(d)h+=`<path class="land" style="stroke-width:.3" d="${d}"/>`;}
  const d=path(c.full); if(d)h+=`<path fill="var(--red)" d="${d}"/>`;
  const xy=p(c.center); if(xy)h+=`<circle cx="${xy[0]}" cy="${xy[1]}" r="9" fill="none" stroke="var(--red)" stroke-width="2.5"/>`;
  return `<svg class="globe" viewBox="0 0 120 120" role="img" aria-label="${esc(t('globe'))}">${h}</svg>`;
}
function miniShape(c,w,h,pad){
  const p=shapeProj(c,w,h,pad);
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d3.geoPath(p).digits(1)(c.shape)}"/></svg>`;
}
function nameTag(c){
  const nat=NAT(c);
  return `<span class="tag"><img src="${flagUrl(c)}" alt=""><b>${esc(N1(c))}</b><span>${esc(N2(c))}</span>${nat?`<span><bdi>${esc(nat)}</bdi></span>`:''}</span>`;
}

/* ---------- 工具 ---------- */
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));try{window.scrollTo(0,0);}catch(e){}}

/* ---------- 首页 ---------- */
function renderHome(){
  applyLang();
  $('hStreak').textContent=curStreak();
  $('hXp').textContent=S.xp;
  $('sndBtn').textContent=S.sound?'🔊':'🔇';
  const qm=t('qm');
  $('qmodes').innerHTML=QMODES.map(([k,ic])=>`<button class="qm${k==='mix'?' wide':''}" data-q="${k}" aria-pressed="${k===S.qmode}"><span class="ic">${ic}</span><span><span class="t">${qm[k][0]}</span><span class="d">${qm[k][1]}</span></span></button>`).join('');
  const lv=t('lv');
  $('modes').innerHTML=[['1','🌱'],['2','🌿'],['3','🌳']].map(([k,ic])=>`<button class="mode" data-t="${k}" aria-pressed="${+k===S.tier}"><span class="ic">${ic}</span><span class="t">${lv[k][0]}</span><span class="d">${lv[k][1]}</span></button>`).join('');
  $('chips').innerHTML=CONTS.map(c=>`<button class="chip" data-c="${c}" aria-pressed="${c===S.cont}">${CONT_IC[c]} ${CN(c)}</button>`).join('');
  const n=IDS.filter(id=>(S.known[id]||0)>=1).length;
  $('kN').textContent=n;$('kT').textContent=IDS.length;
  $('kBar').style.width=(n/IDS.length*100)+'%';
  $('startBtn').textContent=t('start')(Math.min(10,buildPool().length));
  const tips=t('tips');
  $('heroTxt').innerHTML=S.xp===0?tips[0]:tips[(Math.random()*tips.length)|0];
}
$('qmodes').addEventListener('click',e=>{const b=e.target.closest('.qm');if(!b)return;S.qmode=b.dataset.q;save();sfx.tap();renderHome();});
$('modes').addEventListener('click',e=>{const b=e.target.closest('.mode');if(!b)return;S.tier=+b.dataset.t;save();sfx.tap();renderHome();});
$('chips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;S.cont=b.dataset.c;save();sfx.tap();renderHome();});
$('sndBtn').onclick=()=>{S.sound=!S.sound;save();renderHome();sfx.tap();};

function buildPool(){
  const inC=IDS.filter(id=>S.cont==='全世界'||C[id].cont===S.cont);
  const tiers=S.tier===1?[1]:S.tier===2?[1,2]:[2,3];
  let pool=inC.filter(id=>tiers.includes(C[id].tier));
  if(pool.length<6) pool=inC.filter(id=>C[id].tier<=Math.max(...tiers));
  if(pool.length<6) pool=inC.slice();
  return pool;
}
function pickChoices(id){
  const c=C[id];
  const maxT=S.tier;
  let cand=IDS.filter(x=>x!==id&&C[x].cont===c.cont);
  const score=x=>Math.abs(C[x].tier-c.tier)+(C[x].tier>maxT?2:0)+Math.random()*.9;
  cand=cand.map(x=>[x,score(x)]).sort((a,b)=>a[1]-b[1]).map(a=>a[0]);
  let pick=cand.slice(0,3);
  if(pick.length<3){
    const more=shuffle(IDS.filter(x=>x!==id&&!pick.includes(x))).sort((a,b)=>C[a].tier-C[b].tier);
    pick=pick.concat(more.slice(0,3-pick.length));
  }
  return shuffle([id,...pick]);
}

/* ---------- 练习 ---------- */
let L=null;
function startLesson(){
  const pool=buildPool();
  const order=pool.map(id=>[id,(S.known[id]||0)+Math.random()*1.6]).sort((a,b)=>a[1]-b[1]).map(a=>a[0]);
  const qs=shuffle(order.slice(0,Math.min(10,pool.length)));
  const types={};
  qs.forEach((id,i)=>{types[id]=S.qmode==='mix'?QTYPES[i%QTYPES.length]:S.qmode;});
  if(S.qmode==='mix'){const ts=shuffle(qs.map(id=>types[id]));qs.forEach((id,i)=>types[id]=ts[i]);}
  L={queue:qs.slice(),types,total:qs.length,i:0,done:0,wrong:0,hearts:5,xp:0,combo:0,miss:new Set(),requeued:new Set(),seen:qs.slice(),start:Date.now(),q:null};
  show('lesson');
  nextQ();
}
function nextQ(){
  const id=L.queue[L.i], type=L.types[id], c=C[id];
  L.q={id,type,choices:pickChoices(id),sel:null,answered:false,hinted:false};
  if(type==='shape')drawShape(c);
  else if(type==='flag')drawFlag(c);
  else if(type==='fromCapital')drawCapital(c);
  else drawName(c);
  $('capTxt').textContent=(type==='shape'&&c.omit)?t('omit'):'';
  $('hints').hidden=false;$('hLoc').disabled=false;$('hCut').disabled=false;
  const pic=type==='findShape'||type==='findFlag';
  $('opts').className='opts'+(pic?' pics':'');
  $('opts').innerHTML=L.q.choices.map((x,i)=>{
    const o=C[x];
    if(!pic)return `<button class="opt" data-id="${x}"><span class="k">${i+1}</span>${esc(type==='capital'?CAPN(o):N1(o))}</button>`;
    const inner=type==='findShape'?miniShape(o,160,120,8):`<img src="${flagUrl(o)}" alt="">`;
    return `<button class="opt pic" data-id="${x}" aria-label="${esc(t('opt')(i+1))}"><span class="k">${i+1}</span>${inner}<span class="nm"></span></button>`;
  }).join('');
  $('lfoot').className='lfoot';
  const cb=$('checkBtn');cb.textContent=t('check');cb.disabled=true;cb.className='btn';
  const again=L.requeued.has(id)&&L.i>=L.total;
  const ask=t('ask')[type];
  $('askTxt').innerHTML=again?esc(t('again')+ask):(L.combo>=3?`<span class="combo">${esc(t('combo')(L.combo))}</span> ${esc(ask)}`:esc(ask));
  setM($('askM'),L.combo>=3?'wow':'happy');
  $('pBar').style.width=(L.done/L.total*100)+'%';
  $('hN').textContent=L.hearts;
}
function select(btn){
  if(L.q.answered||btn.disabled)return;
  document.querySelectorAll('.opt').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');L.q.sel=btn.dataset.id;$('checkBtn').disabled=false;sfx.tap();
}
$('opts').addEventListener('click',e=>{const b=e.target.closest('.opt');if(b)select(b);});

function check(){
  const q=L.q;if(!q.sel||q.answered)return;
  q.answered=true;
  const c=C[q.id],ok=q.sel===q.id;
  document.querySelectorAll('.opt').forEach(b=>{
    b.disabled=true;b.classList.remove('sel');
    if(b.dataset.id===q.id)b.classList.add('ok');else if(b.dataset.id===q.sel)b.classList.add('no');
    const nm=b.querySelector('.nm');if(nm)nm.textContent=N1(C[b.dataset.id]);
  });
  $('hints').hidden=true;
  drawContext(c,ok);
  $('capTxt').innerHTML=nameTag(c);
  const ans=q.type==='capital'?CAPN(c):N1(c);  // 首都玩法的“答案”是首都名
  const extra=[q.type==='capital'?esc(N1(c)):q.type==='fromCapital'?esc(CAPN(c)):'',esc(N2(c)),NAT(c)?`<bdi>${esc(NAT(c))}</bdi>`:''].filter(Boolean).join(t('sep'));
  const lf=$('lfoot'),cb=$('checkBtn');
  if(ok){
    L.done++;L.combo++;const g=q.hinted?5:10;L.xp+=g;
    S.known[q.id]=(S.known[q.id]||0)+1;
    lf.className='lfoot ok';$('fbIc').textContent='✓';
    const praise=t('praise');
    $('fbT').textContent=L.combo>=3?t('combo')(L.combo):praise[(Math.random()*praise.length)|0];
    $('fbD').innerHTML=esc(ans)+t('sep')+extra+t('sep')+esc(t('plusXp')(g));
    setM($('askM'),'wow',true);
    $('askTxt').textContent=L.combo>=3?t('askFire'):t('askOk');
    cb.className='btn';sfx.ok();
  }else{
    L.hearts--;L.wrong++;L.combo=0;L.miss.add(q.id);
    if(!L.requeued.has(q.id)){L.requeued.add(q.id);L.queue.push(q.id);}
    lf.className='lfoot bad';$('fbIc').textContent='✕';
    $('fbT').textContent=t('answer')+ans;
    $('fbD').innerHTML=extra+t('sep')+esc(L.hearts>0?t('retry'):t('out'));
    setM($('askM'),'sad',true);
    $('askTxt').textContent=t('askBad');
    $('hearts').classList.remove('shake');void $('hearts').offsetWidth;$('hearts').classList.add('shake');
    cb.className='btn red';sfx.bad();
  }
  save();
  $('hN').textContent=L.hearts;
  $('pBar').style.width=(L.done/L.total*100)+'%';
  cb.textContent=L.hearts<=0?t('seeRes'):t('cont');cb.disabled=false;cb.focus({preventScroll:true});
}
function cont(){
  if(L.hearts<=0)return finish(false);
  L.i++;
  if(L.i>=L.queue.length)return finish(true);
  nextQ();
}
$('checkBtn').onclick=()=>{if(!L)return;L.q.answered?cont():check();};

$('hLoc').onclick=()=>{
  if(!L||L.q.answered)return;
  const c=C[L.q.id];
  L.q.hinted=true;$('hLoc').disabled=true;sfx.tap();
  $('card').insertAdjacentHTML('beforeend',globeSvg(c));
  $('capTxt').textContent=t('hintLocTxt')(CN(c.cont));
};
$('hCut').onclick=()=>{
  if(!L||L.q.answered)return;
  L.q.hinted=true;$('hCut').disabled=true;sfx.tap();
  const wrong=shuffle([...document.querySelectorAll('.opt')].filter(b=>b.dataset.id!==L.q.id)).slice(0,2);
  wrong.forEach(b=>{b.classList.add('gone');b.classList.remove('sel');b.disabled=true;if(L.q.sel===b.dataset.id){L.q.sel=null;$('checkBtn').disabled=true;}});
};

/* ---------- 结果 ---------- */
function finish(win){
  const secs=Math.round((Date.now()-L.start)/1000);
  let bonus=0;
  if(win){
    if(L.miss.size===0)bonus=10;
    const d=dayStr();
    if(S.last!==d){S.streak=(S.last===yesterday()?S.streak:0)+1;S.last=d;}
  }
  const gained=L.xp+bonus;S.xp+=gained;save();
  const tries=L.done+L.wrong;
  const acc=tries?Math.round(L.done/tries*100):0;
  setM($('resM'),win?'wow':'sad');
  const h=$('resT');h.className=win?'':'fail';
  h.textContent=win?(L.miss.size===0?t('resPerfect'):t('resDone')):t('resFail');
  $('resS').textContent=win?(bonus?t('subBonus')(bonus):t('subStreak')(S.streak)):t('subFail');
  $('rXp').textContent='+'+gained;
  $('rAcc').textContent=acc+'%';
  $('rTime').textContent=Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');
  $('review').innerHTML=L.seen.map(id=>{
    const c=C[id],m=L.miss.has(id);
    return `<div class="rv${m?' miss':''}"><img class="fl" src="${flagUrl(c)}" alt="">${miniShape(c,100,60,4)}<span>${esc(N1(c))}</span><small>${esc(N2(c))}</small>${m?`<em>${esc(t('missed'))}</em>`:''}</div>`;
  }).join('');
  show('result');
  win?sfx.win():sfx.lose();
}
$('againBtn').onclick=startLesson;
$('homeBtn').onclick=()=>{L=null;renderHome();show('home');};


/* ---------- 学习模式 ---------- */
let WM=null, LSel=null;
const CAN_SPEAK=typeof window.speechSynthesis!=='undefined';
function speak(text,lang){
  if(!CAN_SPEAK)return;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=.85;speechSynthesis.speak(u);}catch(e){}
}
function initWorld(){
  if(WM)return;
  const w=960,h=500,svg=d3.select('#worldSvg');
  const proj=d3.geoNaturalEarth1().fitExtent([[6,6],[w-6,h-6]],{type:'Sphere'});
  const path=d3.geoPath(proj).digits(2);
  const g=svg.append('g');
  const idOf=new Map();for(const id in C)idOf.set(C[id].full,id);
  let s=`<path class="wocean" d="${path({type:'Sphere'})}"/><path class="wgrat" d="${path(d3.geoGraticule10())}"/>`;
  for(const f of FEATS){const id=idOf.get(f),d=path(f);if(d)s+=`<path class="wl${id?' on':''}"${id?` data-id="${id}"`:''} d="${d}"/>`;}
  for(const id in C){
    const b=path.bounds(C[id].shape);
    if((b[1][0]-b[0][0])*(b[1][1]-b[0][1])<20){const xy=proj(C[id].center);if(xy)s+=`<circle class="dotc" data-id="${id}" cx="${xy[0].toFixed(1)}" cy="${xy[1].toFixed(1)}" r="4.5"/>`;}
  }
  g.node().innerHTML=s;
  // 手机上地图区域比世界地图更“高”，用 slice 铺满并允许左右拖动
  const vis=()=>{const r=svg.node().getBoundingClientRect();if(!r.width||!r.height)return [[0,0],[w,h]];const a=r.width/r.height;
    if(a<w/h){const vw=h*a;return [[(w-vw)/2,0],[(w+vw)/2,h]];}const vh=w/a;return [[0,(h-vh)/2],[w,(h+vh)/2]];};
  const zoom=d3.zoom().extent(vis).scaleExtent([1,40]).translateExtent([[0,0],[w,h]]).clickDistance(6)
    .on('zoom',e=>{g.attr('transform',e.transform);g.selectAll('.dotc').attr('r',5.5/e.transform.k);});
  svg.call(zoom).on('dblclick.zoom',null);
  svg.on('click',e=>{const el=e.target.closest&&e.target.closest('[data-id]');if(el)learnSelect(el.dataset.id);});
  WM={svg,g,zoom,proj,path,w,h,vis};
}
function zoomTo(id){
  const c=C[id];let b=WM.path.bounds(c.shape);
  if(b[1][0]-b[0][0]>WM.w*.5){ // 跨越日界线时只看最大的那块
    const geo=c.shape.geometry;
    if(geo.type==='MultiPolygon'){let best=null,ba=-1;for(const co of geo.coordinates){const pg={type:'Polygon',coordinates:co},a=d3.geoArea(pg);if(a>ba){ba=a;best=pg;}}b=WM.path.bounds(best);}
  }
  const dx=Math.max(b[1][0]-b[0][0],1),dy=Math.max(b[1][1]-b[0][1],1),x=(b[0][0]+b[1][0])/2,y=(b[0][1]+b[1][1])/2;
  const ext=WM.vis(),vw=ext[1][0]-ext[0][0],vh=ext[1][1]-ext[0][1];
  const k=Math.max(1,Math.min(20,.5/Math.max(dx/vw,dy/vh)));
  WM.svg.transition().duration(750).call(WM.zoom.transform,d3.zoomIdentity.translate(WM.w/2,WM.h/2).scale(k).translate(-x,-y));
}
function learnSelect(id){
  LSel=id;sfx.tap();
  WM.g.selectAll('.sel').classed('sel',false);
  WM.g.selectAll(`[data-id="${id}"]`).classed('sel',true);
  zoomTo(id);renderInfo();
  if(window.matchMedia('(max-width:899px)').matches)$('linfo').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function renderInfo(){
  const el=$('linfo');
  if(!LSel){
    el.innerHTML=`<div class="iempty"><span class="m">${mascot('happy')}</span><p>${t('learnEmpty')}</p><button class="hint" id="lRand">${esc(t('randomBtn'))}</button></div>`;
    $('lRand').onclick=()=>learnSelect(IDS[(Math.random()*IDS.length)|0]);
    return;
  }
  const c=C[LSel],nat=NAT(c);
  const pair=(a,b)=>`${esc(a)}<span>${esc(b)}</span>`;
  const contMain=CN(c.cont), contAlt=S.lang==='en'?CONT_I18N.zh[c.cont]:CONT_I18N.en[c.cont];
  const capMain=capRaw(c,S.lang), capAlt=capRaw(c,S.lang==='en'?'zh':'en');
  el.innerHTML=`<div class="itop"><img class="iflag" src="${flagUrl(c)}" alt=""><div><div class="iname">${esc(N1(c))}</div><div class="ien">${esc(N2(c))}</div></div></div>
  <div class="ishape">${miniShape(c,320,200,12)}</div>
  <dl class="ifacts">
    <div><dt>${t('fName')}</dt><dd>${pair(N1(c),N2(c))}</dd></div>
    <div><dt>${t('fCont')}</dt><dd>${pair(contMain,contAlt)}</dd></div>
    <div><dt>${t('fCap')}</dt><dd>${pair(capMain,capAlt)}</dd></div>
    ${nat?`<div><dt>${t('fNat')}</dt><dd><bdi>${esc(nat)}</bdi></dd></div>`:''}
  </dl>
  ${CAN_SPEAK?`<div class="iact"><button class="hint" id="spMain">${esc(S.lang==='fr'?t('speakFr'):S.lang==='zh'?t('speakZh'):t('speakEn'))}</button>${S.lang!=='en'?`<button class="hint" id="spEn">${esc(t('speakEn'))}</button>`:''}${S.lang!=='zh'?`<button class="hint" id="spZh">${esc(t('speakZh'))}</button>`:''}</div>`:''}
  <div class="iact"><a class="hint" href="${cfg.countryUrl(c.en)}">${esc(t('details'))}</a><button class="hint" id="lRand">${esc(t('randomBtn'))}</button></div>`;
  if(CAN_SPEAK){
    const voice={zh:'zh-CN',en:'en-US',fr:'fr-FR'}[S.lang]||'en-US';
    $('spMain').onclick=()=>speak(N1(c),voice);
    if($('spEn'))$('spEn').onclick=()=>speak(c.en,'en-US');
    if($('spZh'))$('spZh').onclick=()=>speak(c.zh,'zh-CN');
  }
  $('lRand').onclick=()=>learnSelect(IDS[(Math.random()*IDS.length)|0]);
}
function openLearn(){
  applyLang();
  $('lsearch').placeholder=t('searchPh');$('lsearch').setAttribute('aria-label',t('searchPh'));
  $('learnBack').setAttribute('aria-label',t('back'));
  $('zIn').setAttribute('aria-label',t('zIn'));$('zOut').setAttribute('aria-label',t('zOut'));$('zReset').setAttribute('aria-label',t('zReset'));
  $('worldSvg').setAttribute('aria-label',t('worldLabel'));
  show('learn');initWorld();renderInfo();
}
$('learnBtn').onclick=()=>{sfx.tap();openLearn();};
$('learnBack').onclick=()=>{try{speechSynthesis.cancel();}catch(e){}if(cfg.start==='learn'){location.href='/'+cfg.lang+'/';return;}renderHome();show('home');};
$('zIn').onclick=()=>WM.svg.transition().duration(300).call(WM.zoom.scaleBy,1.8);
$('zOut').onclick=()=>WM.svg.transition().duration(300).call(WM.zoom.scaleBy,1/1.8);
$('zReset').onclick=()=>WM.svg.transition().duration(600).call(WM.zoom.transform,d3.zoomIdentity);
function searchHits(q){
  q=q.trim().toLowerCase();if(!q)return null;
  const sc=id=>{const c=C[id];
    const ns=[c.zh,c.en,c.fr||'',c.nat||''].map(n=>String(n).toLowerCase());
    if(ns.some(n=>n===q))return 0;if(ns.some(n=>n.startsWith(q)))return 1;if(ns.some(n=>n.includes(q)))return 2;return 9;};
  return IDS.map(id=>[id,sc(id)]).filter(a=>a[1]<9).sort((a,b)=>a[1]-b[1]||C[a[0]].tier-C[b[0]].tier).slice(0,6).map(a=>a[0]);
}
function renderSugg(){
  const hits=searchHits($('lsearch').value),box=$('lsugg');
  if(!hits){box.classList.remove('on');return;}
  box.innerHTML=hits.length?hits.map((id,i)=>`<button data-id="${id}" class="${i?'':'act'}" role="option"><img src="${flagUrl(C[id])}" alt=""><b>${esc(N1(C[id]))}</b><span>${esc(N2(C[id]))}</span></button>`).join(''):`<p>${esc(t('noMatch'))}</p>`;
  box.classList.add('on');
}
function pickSugg(id){$('lsearch').value='';$('lsugg').classList.remove('on');$('lsearch').blur();learnSelect(id);}
$('lsearch').addEventListener('input',renderSugg);
$('lsearch').addEventListener('focus',renderSugg);
$('lsearch').addEventListener('blur',()=>setTimeout(()=>$('lsugg').classList.remove('on'),150));
$('lsearch').addEventListener('keydown',e=>{
  const bs=[...$('lsugg').querySelectorAll('button')];let i=bs.findIndex(b=>b.classList.contains('act'));
  if(e.key==='Enter'){e.preventDefault();if(i>=0)pickSugg(bs[i].dataset.id);}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!bs.length)return;bs[i]?.classList.remove('act');i=(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length;bs[i].classList.add('act');}
  else if(e.key==='Escape'){$('lsearch').value='';$('lsugg').classList.remove('on');}
});
$('lsugg').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-id]');if(b){e.preventDefault();pickSugg(b.dataset.id);}});

/* ---------- 退出 ---------- */
$('quitBtn').onclick=()=>{setM($('quitM'),'sad');$('quitModal').classList.add('on');$('stayBtn').focus();};
$('stayBtn').onclick=()=>$('quitModal').classList.remove('on');
$('leaveBtn').onclick=()=>{$('quitModal').classList.remove('on');L=null;renderHome();show('home');};
$('quitModal').addEventListener('click',e=>{if(e.target.id==='quitModal')$('quitModal').classList.remove('on');});

/* ---------- 键盘 ---------- */
document.addEventListener('keydown',e=>{
  if($('quitModal').classList.contains('on')){if(e.key==='Escape')$('quitModal').classList.remove('on');return;}
  if($('home').classList.contains('on')&&e.key==='Enter'&&e.target===document.body){startLesson();return;}
  if(!L||!$('lesson').classList.contains('on'))return;
  if(/^[1-4]$/.test(e.key)){const b=document.querySelectorAll('.opt')[+e.key-1];if(b)select(b);}
  else if(e.key==='Enter'){e.preventDefault();$('checkBtn').click();}
  else if(e.key==='Escape'){$('quitBtn').click();}
});

$('startBtn').onclick=startLesson;
setM($('logoM'),'happy');setM($('heroM'),'happy');
renderHome();
if(cfg.start==='learn')openLearn();
}
