import {levels,CAR,corners,move,advance,collision,parking,clearance,rating} from './parking-core.mjs';
const $=s=>document.getElementById(s),ctx=$('scene').getContext('2d');
let index=0,car,steer=0,drive=0,hits=0,shifts=0,lastDrive=0,hold=0,won=false,blocked=false;
let snapshots=[],keys=new Set(),wheelPointer=null,pedalPointer=null,wheelStart=0,flash=0,elapsed=0;
let assisted=false,showAssist=false,sound=false,audio,beepAt=0,records={};
try {const saved=JSON.parse(localStorage.getItem('commute-parking-v1'));if(saved&&typeof saved==='object')for(const [id,r] of Object.entries(saved))if(r&&Number.isInteger(Number(id))&&Number(id)>=0&&Number(id)<levels.length&&r.time>=0&&r.hits>=0&&r.shifts>=0&&Number.isInteger(r.stars)&&r.stars>=1&&r.stars<=3&&Number.isFinite(r.time)&&Number.isFinite(r.shifts)&&Number.isFinite(r.hits))records[id]=r;}catch{}
const medal=['','铜牌','银牌','金牌'];
function tone(frequency){if(!sound)return;try{audio||=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),gain=audio.createGain();o.frequency.value=frequency;gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.09);o.connect(gain);gain.connect(audio.destination);o.start();o.stop(audio.currentTime+.1);}catch{}}
function menus(){
 $('levelSelect').replaceChildren();levels.forEach((l,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${l.name} · ${l.type}${records[i]?' · '+medal[records[i].stars]:''}`;$('levelSelect').append(option);});$('levelSelect').value=index;
 $('levels').replaceChildren();levels.forEach((l,i)=>{const b=document.createElement('button');b.innerHTML=`${l.name}<small>${l.type} · ${records[i]?medal[records[i].stars]:'未完成'}</small>`;b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',i===index);b.onclick=()=>reset(i);$('levels').append(b);});
 $('collection').textContent=`海边泊车手册 · ${Object.keys(records).length}/${levels.length} 已完成 · ${Object.values(records).filter(r=>r.stars===3).length} 枚金牌`;
 const r=records[index];$('personal').textContent=r?`本机关卡最佳：${medal[r.stars]} · 擦碰 ${r.hits} · 换向 ${r.shifts} · ${Math.round(r.time)} 秒`:'金牌目标：零擦碰 · 换向≤4 · 居中 · 不用辅助或回退';
}
function updateWheel(){$('wheel').style.transform=`rotate(${steer*100}deg)`;$('wheel').setAttribute('aria-valuenow',Math.round(steer*100));}
function stop(){drive=0;steer=0;keys.clear();wheelPointer=null;pedalPointer=null;if(car)car.speed=0;updateWheel();}
function reset(i=index){
 index=i;stop();car={...CAR,...levels[i].vehicle,...levels[i].start,speed:0};hits=0;shifts=0;lastDrive=0;hold=0;elapsed=0;won=false;blocked=false;assisted=false;showAssist=false;flash=0;snapshots=[];
 $('assist').textContent='辅助线关';$('assist').setAttribute('aria-pressed','false');$('result').hidden=true;$('title').textContent=levels[i].type;$('location').textContent=levels[i].label;$('vehicle').textContent=levels[i].vehicle?'长轴 SUV · 转弯留宽':'紧凑轿车 · 不限时';$('status').textContent=levels[i].tip;menus();
}
$('wheel').onpointerdown=e=>{if(wheelPointer!==null)return;wheelPointer=e.pointerId;wheelStart=e.clientX;$('wheel').setPointerCapture(e.pointerId);};
$('wheel').onpointermove=e=>{if(e.pointerId!==wheelPointer)return;steer=Math.max(-1,Math.min(1,(e.clientX-wheelStart)/65));updateWheel();};
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('wheel').addEventListener(type,e=>{if(e.pointerId===wheelPointer){wheelPointer=null;steer=0;updateWheel();}});
for(const [id,d]of [['forward',1],['reverse',-1]]){const b=$(id);b.onpointerdown=e=>{if(pedalPointer!==null)return;pedalPointer=e.pointerId;b.setPointerCapture(e.pointerId);drive=d;};for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,e=>{if(e.pointerId===pedalPointer){pedalPointer=null;drive=0;}});}
const controls=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];window.addEventListener('keydown',e=>{if(!controls.includes(e.key))return;e.preventDefault();keys.add(e.key);});window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
$('levelSelect').onchange=()=>reset(Number($('levelSelect').value));
$('restart').onclick=()=>reset();$('again').onclick=()=>reset();$('next').onclick=()=>reset((index+1)%levels.length);
$('undo').onclick=()=>{const s=snapshots.pop();if(!s)return;stop();({car,hits,shifts,lastDrive}=s);car.speed=0;won=false;hold=0;blocked=false;assisted=true;$('result').hidden=true;$('status').textContent='已回退。练习辅助本局最高银牌，免费重开可重新挑战金牌。';};
$('assist').onclick=()=>{showAssist=!showAssist;if(showAssist)assisted=true;$('assist').textContent=showAssist?'辅助线开':'辅助线关';$('assist').setAttribute('aria-pressed',showAssist);$('status').textContent=showAssist?'虚线预测当前转向下的前进和倒车位置；使用辅助本局最高银牌。':levels[index].tip;};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'音效开':'音效关';$('sound').setAttribute('aria-pressed',sound);tone(650);};
function finish(p){
 won=true;stop();const stars=rating({hits,shifts,assisted,offset:p.offset}),record={stars,hits,shifts,time:elapsed};const old=records[index];
 if(!old||stars>old.stars||(stars===old.stars&&(hits<old.hits||(hits===old.hits&&(shifts<old.shifts||(shifts===old.shifts&&elapsed<old.time)))))){records[index]=record;try{localStorage.setItem('commute-parking-v1',JSON.stringify(records));}catch{}}
 $('stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);$('award').textContent=`${medal[stars]}入位${index===levels.length-1?' · 海边见！':''}`;
 $('resultText').textContent=`${Math.round(elapsed)} 秒 · 擦碰 ${hits} 次 · 换向 ${shifts} 次。${stars===3?'居中、干净，晚饭稳稳送到。':hits?'下次先挑战零擦碰。':assisted?'已经学会了！不用辅助再试一局。':shifts>4?'下次试试少倒几把。':'再靠近车位中心一点，就能拿金牌。'}`;
 $('next').textContent=index===levels.length-1?'回第一关刷金牌 →':'下一处停车场 →';$('result').hidden=false;tone(980);menus();
}
function rect(x,y,w,h,color,r=4){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function drawCar(c,color,player=false){
 ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.a??0);const l=player?car.length:c.w,w=player?car.width:c.h;
 rect(-l/2+2,-w/2+4,l,w,'#243d3533',6);rect(-l/2,-w/2,l,w,color,5);rect(l*.05,-w/2+4,l*.19,w-8,'#d9e9df',3);rect(-l*.31,-w/2+4,l*.13,w-8,'#829a92',2);
 if(player){for(const y of [-w/2-1,w/2-2]){ctx.save();ctx.translate(car.wheelbase/2,y);ctx.rotate(steer*.58);rect(-6,-2,12,4,'#253b35',1);ctx.restore();}rect(l/2-3,-w/2+3,3,6,'#fff4c0',1);rect(l/2-3,w/2-9,3,6,'#fff4c0',1);if(car.speed<=0){rect(-l/2,-w/2+3,3,6,car.speed<0?'#fffbd9':'#df593f',1);rect(-l/2,w/2-9,3,6,car.speed<0?'#fffbd9':'#df593f',1);}}
 ctx.restore();
}
function bay(b,p){
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a+Math.PI/2);ctx.fillStyle=p.ready?'#80bd9660':'#fff9db80';ctx.fillRect(-b.w/2,-b.h/2,b.w,b.h);ctx.strokeStyle=p.ready?'#307a51':'#fdfbef';ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.strokeRect(-b.w/2,-b.h/2,b.w,b.h);ctx.setLineDash([]);ctx.fillStyle='#7d916e';ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillText('↑',0,-10);ctx.font='11px system-ui';ctx.fillText('停这里',0,10);if(p.ready){ctx.fillStyle='#28594a';ctx.fillRect(-b.w/2,b.h/2+8,b.w*Math.min(1,hold),4);}ctx.restore();
}
function path(){if(!showAssist||won)return;for(const d of [-1,1]){let projected={...car};ctx.strokeStyle=d<0?'#dc8c49':'#458a83';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(car.x,car.y);for(let i=0;i<30;i++){projected=move(projected,steer,d,.04);if(collision(projected,levels[index]))break;ctx.lineTo(projected.x,projected.y);}ctx.stroke();ctx.setLineDash([]);}}
function render(now){
 ctx.clearRect(0,0,520,550);rect(0,0,520,550,'#e3e8d9');rect(20,65,480,465,'#d5ddcd',12);ctx.strokeStyle='#c7d0c0';ctx.lineWidth=1;for(let y=95;y<530;y+=40){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(500,y);ctx.stroke();}
 ctx.fillStyle='#7d8c78';ctx.textAlign='left';ctx.font='12px system-ui';ctx.fillText(`P  海边见 / ${String(index+1).padStart(2,'0')} · PRECISION PARKING`,25,36);
 const l=levels[index],p=parking(car,l.bay);bay(l.bay,p);
 for(const o of l.obstacles){if(o.w<25||o.h<25){rect(o.x-o.w/2,o.y-o.h/2,o.w,o.h,'#a79064',3);ctx.fillStyle='#f8df8f';ctx.fillRect(o.x-o.w/2+3,o.y-o.h/2+3,Math.max(2,o.w-6),3);}else drawCar(o,'#82978b');}
 path();drawCar(car,flash>0?'#d77151':'#e9b34f',true);
 if(flash>0){ctx.strokeStyle='#c65c43';ctx.lineWidth=3;const pts=corners(car);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();}
 const gap=clearance(car,l);$('radar').textContent=gap<10?'雷达：非常近':gap<35?'雷达：注意车角':'雷达：空间充足';$('radar').className=gap<10?'danger':gap<35?'near':'';
 if(Math.abs(car.speed)>1&&gap<35&&now-beepAt>(gap<10?160:400)){tone(gap<10?950:650);beepAt=now;}
 $('gear').textContent=`${car.speed>1?'D · 前进':car.speed< -1?'R · 倒车':'N · 已刹停'} · ${Math.round(elapsed)} 秒`;
 $('hits').textContent=hits;$('shifts').textContent=shifts;$('undo').disabled=!snapshots.length;
 $('progress').textContent=p.ready?'已摆正 · 松开踏板停稳':p.inside?`回正方向 · 偏差 ${Math.round(p.angle*180/Math.PI)}°`:'车身需完整进入车位';
}
let prev=performance.now();function frame(now){
 const dt=Math.min((now-prev)/1000,.04);prev=now;flash=Math.max(0,flash-dt);
 if(!won&&!document.hidden){
  const s=keys.has('ArrowLeft')?-1:keys.has('ArrowRight')?1:wheelPointer!==null?steer:0,d=keys.has('ArrowUp')?1:keys.has('ArrowDown')?-1:drive;steer=s;updateWheel();
  if(d&&d!==lastDrive){snapshots.push({car:{...car},hits,shifts,lastDrive});if(lastDrive)shifts++;lastDrive=d;}
  if(lastDrive)elapsed+=dt;
  const next=advance(car,s,d,dt),hit=collision(next,levels[index]);
  if(hit){if(!blocked&&Math.abs(next.speed)>1){hits++;flash=.6;tone(180);$('status').textContent=`擦碰：${hit}。先退出，再给车头多留一点空间。`;}blocked=true;car.speed=0;}else{car=next;blocked=false;}
  const p=parking(car,levels[index].bay);hold=p.ready&&Math.abs(car.speed)<.5&&!d?hold+dt:0;if(hold>=1)finish(p);
 }
 render(now);requestAnimationFrame(frame);
}
reset();requestAnimationFrame(frame);
