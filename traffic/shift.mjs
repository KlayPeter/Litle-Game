import {WIDTH,HEIGHT,parkedCount} from './flick-core.mjs';
import {ORDERS,newShift,shootShift,tickShift,collect,riskOrder,nextOrder} from './shift-core.mjs';
const elements={};
const $=id=>elements[id]??(elements[id]=document.getElementById(id)),canvas=$('board'),ctx=canvas.getContext('2d');
const goal=document.querySelector('.goal'),orderDots=ORDERS.map(()=>{const dot=document.createElement('i');$('orders').append(dot);return dot;});
const colors=['#ef9c63','#7eb8d0','#bd9fd0','#edcc71','#8ec5a0'];
let state=newShift(),selected=0,aim=null,pointer=null,angle=-Math.PI/2,power=520,paused=true,acc=0,last=0,sound=false,audio;
let sparks=[],trail=[],callUntil=0,best=0,recorded=false;
try{const saved=Number(localStorage.getItem('commute-shift-best-v1'));if(Number.isInteger(saved)&&saved>=0&&saved<=1650)best=saved;}catch{}
function feedback(text){$('feedback').textContent=text;}
function beep(hz){if(!sound)return;try{audio||=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.frequency.value=hz;v.gain.setValueAtTime(.03,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+.15);}catch{}}
function cancel(){aim=null;pointer=null;$('power').style.width='0%';$('powerText').textContent='0%';}
function panel(kicker,title,text,first,second,decision=false){
 cancel();$('panel').hidden=false;$('panel').classList.toggle('decision',decision);$('panelKicker').textContent=kicker;$('panelTitle').textContent=title;$('panelText').textContent=text;
 $('primary').textContent=first.text;$('primary').onclick=first.action;$('primary').disabled=false;
 $('secondary').textContent=second.text;$('secondary').onclick=second.action;$('secondary').disabled=!!second.disabled;$('tertiary').hidden=true;$('panelStats').replaceChildren();$('primary').focus({preventScroll:true});
}
function hidePanel(){$('panel').hidden=true;canvas.focus({preventScroll:true});}
function refresh(){
 const g=state.game,count=parkedCount(g);$('bank').textContent=state.bank;$('shots').textContent=g.shots;$('parked').textContent=`${count} / ${state.risk?4:2}`;$('title').textContent=ORDERS[state.order].title;
 $('objective').textContent=state.risk?'已接加急单 · 停满四辆得 500 分':'先停好两辆 · 保底 200 分';goal.classList.toggle('risk',state.risk);
 $('place').textContent=`${ORDERS[state.order].place} · 第 ${state.order+1} / 3 单`;orderDots.forEach((dot,i)=>{dot.className=i<state.order?'done':i===state.order?'current':'';dot.setAttribute('aria-label',`第${i+1}单${i<state.order?'已结束':i===state.order?'进行中':'未开始'}`);});
}
function resolve(){
 refresh();const g=state.game;
 if(state.phase==='offer'){
  panel('这单已经有保底','收工，还是再冲？',`已停 ${parkedCount(g)} 辆，剩 ${g.shots} 发。继续后必须停满四辆，否则这一单没有分；前面收下的 ${state.bank} 分保留。`,{text:`收下 ${g.bestCombo>=2?250:200} 分，稳稳走人`,action:()=>{if(collect(state))resolve();}},{text:g.shots>0?'继续冲四辆 · 500 分起':'次数已用完，先收工',disabled:g.shots<=0,action:()=>{if(riskOrder(state)){hidePanel();feedback('加急单接下了！剩下的车位，要一起保住。');refresh();}}},true);
 }else if(state.phase==='result'){
  const r=state.history.at(-1);panel(`第 ${state.order+1} 单 · ${r.kind==='full'?'加急完成':r.kind==='safe'?'稳妥收工':'这次没停稳'}`,r.earned?`+${r.earned}，收好了。`:'这单没拿下。',r.kind==='miss'?`停好 ${r.parked}/${state.risk?4:2} 辆。前面收下的 ${state.bank} 分还在。下一单可以选择更稳的打法。`:r.kind==='safe'?'懂得收手也是本事。下一单换个停车场。':'四辆全部到位！这一把值得给朋友看看。',{text:state.order===2?'看看今晚的成绩 →':'下一单，换个停车场 →',action:()=>{if(nextOrder(state)){selected=0;trail=[];sparks=[];if(state.phase==='complete')resolve();else{hidePanel();feedback(ORDERS[state.order].message);refresh();}}}},{text:'重新挑战整轮',action:()=>restart(state.seed)});
 }else if(state.phase==='complete'){
  if(!recorded){recorded=true;best=Math.max(best,state.bank);try{localStorage.setItem('commute-shift-best-v1',String(best));}catch{}}
  panel('阿停：我到海边了，开饭！',`${state.bank} 分 · ${state.bank>=1000?'今晚有点东西':state.bank>=600?'稳稳下班':state.bank>0?'下次少贪一把':'再练一轮就好'}`,`本机最高 ${best} 分。三单里，你收了 ${state.history.filter(r=>r.kind==='safe').length} 次保底，完成 ${state.history.filter(r=>r.kind==='full').length} 次加急。`,{text:'换个开局，再来三单',action:()=>restart(state.seed+1)},{text:'同一开局，再试一种策略',action:()=>restart(state.seed)});
  $('panelStats').innerHTML=state.history.map((r,i)=>`<span>第${i+1}单<br><b>${r.earned} 分</b></span>`).join('');$('tertiary').hidden=false;$('tertiary').textContent='复制成绩，和朋友比一轮';$('tertiary').onclick=async()=>{const text=`七点海边见 · 下班接单 #${state.seed}：三单 ${state.bank} 分，${state.history.map(r=>r.earned).join(' / ')}。你会收工还是继续冲？`;try{await navigator.clipboard.writeText(text);$('tertiary').textContent='已复制';}catch{$('panelText').textContent=text+'（长按复制）';}};
 }
}
function restart(seed){state=newShift(seed);paused=false;recorded=false;selected=0;trail=[];sparks=[];acc=0;cancel();hidePanel();refresh();feedback('先停好两辆，再决定这一单要不要冒险。');}
function pause(){if(paused||state.phase!=='play')return;paused=true;panel('休息一下','车先停着。','暂停期间不消耗次数，回来继续刚才这一单。',{text:'继续这一单',action:()=>{paused=false;acc=0;hidePanel();}},{text:'重开整轮（清空本轮分数）',action:()=>restart(state.seed)});}
$('panel').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const buttons=[...$('panel').querySelectorAll('button:not([hidden]):not(:disabled)')];const first=buttons[0],end=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}});
$('pause').onclick=pause;$('cancel').onclick=()=>{cancel();feedback('已取消瞄准，不消耗次数。');};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'音效开':'音效关';$('sound').setAttribute('aria-pressed',sound);beep(550);};
$('rules').onclick=()=>{cancel();$('help').showModal();};$('closeHelp').onclick=()=>$('help').close();$('help').addEventListener('close',()=>{acc=0;last=0;});
function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*WIDTH,y:(e.clientY-r.top)/r.height*HEIGHT};}
function vector(){const c=state.game.cars[selected];if(!aim)return {x:Math.cos(angle)*power,y:Math.sin(angle)*power};const dx=c.x-aim.x,dy=c.y-aim.y,length=Math.hypot(dx,dy),scale=length?Math.min(850,length*6)/length:0;return {x:dx*scale,y:dy*scale};}
function shoot(v){if(shootShift(state,selected,v.x,v.y)){trail=[];beep(180);feedback('等车停稳，再决定下一发。');refresh();}}
function canAim(){return !paused&&state.phase==='play'&&state.game.phase==='aim'&&!$('help').open;}
canvas.onpointerdown=e=>{if(!canAim()||pointer!==null)return;const p=point(e),nearest=state.game.cars.map((c,i)=>({i,d:Math.hypot(c.x-p.x,c.y-p.y)})).sort((a,b)=>a.d-b.d)[0];if(nearest.d>46){feedback('按住一辆小车，再往后拉。');return;}e.preventDefault();pointer=e.pointerId;selected=nearest.i;aim={...state.game.cars[selected]};canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});};
canvas.onpointermove=e=>{if(e.pointerId!==pointer||!aim)return;aim=point(e);const v=vector(),percent=Math.round(Math.hypot(v.x,v.y)/850*100);$('power').style.width=`${percent}%`;$('powerText').textContent=`${percent}%`;feedback(percent<5?'轻点选车，不消耗次数。':'往后拉蓄力 · 松手弹出');};
canvas.onpointerup=e=>{if(e.pointerId!==pointer||!aim)return;const v=vector();cancel();if(Math.hypot(v.x,v.y)>=40)shoot(v);};
for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(e.pointerId===pointer)cancel();});
canvas.onkeydown=e=>{if(e.key==='Escape'){cancel();pause();return;}if(!canAim())return;if(/^[1-5]$/.test(e.key)){selected=Number(e.key)-1;return;}if(e.key==='ArrowLeft')angle-=.06;else if(e.key==='ArrowRight')angle+=.06;else if(e.key==='ArrowUp')power=Math.min(850,power+25);else if(e.key==='ArrowDown')power=Math.max(100,power-25);else if(e.key===' '){e.preventDefault();shoot(vector());return;}else return;e.preventDefault();$('powerText').textContent=`${Math.round(power/850*100)}%`;};
window.addEventListener('blur',()=>{cancel();pause();});document.addEventListener('visibilitychange',()=>{cancel();last=0;acc=0;if(document.hidden)pause();});
function popup(text,now){$('callout').textContent=text;$('callout').style.opacity=1;callUntil=now+1100;}
function events(now){for(const e of state.game.events){if(e.type==='park'){popup(e.combo>1?`${e.combo} 连停！`:'稳稳入位 +1',now);beep(500+e.combo*100);for(let i=0;i<18;i++){const a=i/18*Math.PI*2;sparks.push({x:e.x,y:e.y,vx:Math.cos(a)*100,vy:Math.sin(a)*100,life:.7});}}if(e.type==='out'){popup('被撞出来了！',now);feedback('停好的车也会被撞出。下一发留点余量。');}if(e.type==='bonus')popup('双停！多一发',now);if(e.type==='spring'){popup('借力反弹！',now);beep(300);}if(e.type==='ready')feedback(`还剩 ${state.game.shots} 发，${state.risk?'要同时保住四个车位。':'停好两辆就有保底。'}`);}state.game.events=[];}
function round(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function resize(){
 const b=canvas.parentElement,scale=Math.min(b.clientWidth/WIDTH,b.clientHeight/HEIGHT),w=Math.floor(WIDTH*scale),h=Math.floor(HEIGHT*scale),dpr=Math.min(devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){cancel();canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
}
new ResizeObserver(resize).observe(canvas.parentElement);resize();
function draw(now){
 ctx.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);ctx.clearRect(0,0,WIDTH,HEIGHT);const g=state.game;
 round(0,0,WIDTH,HEIGHT,0,'#314b3e');round(12,12,WIDTH-24,HEIGHT-24,14,'#3b5745');
 ctx.strokeStyle='#7c916147';ctx.lineWidth=1;for(let y=50;y<HEIGHT;y+=42){ctx.beginPath();ctx.moveTo(22,y);ctx.lineTo(WIDTH-22,y);ctx.stroke();}
 ctx.setLineDash([15,17]);ctx.strokeStyle='#cfcc9b39';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(30,420);ctx.lineTo(510,420);ctx.stroke();ctx.setLineDash([]);
 ctx.textAlign='center';ctx.fillStyle='#c4ceb0';ctx.font='12px sans-serif';ctx.fillText(`${ORDERS[state.order].place}  /  PARK & GO`,270,35);
 g.layout.bays.forEach((b,i)=>{const occupied=g.cars.some(c=>c.parked===i);round(b.x-36,b.y-46,72,92,7,occupied?'#689253':'#516e4d');ctx.strokeStyle=occupied?'#e3f1b2':'#a7bd86';ctx.lineWidth=3;ctx.strokeRect(b.x-29,b.y-38,58,76);ctx.fillStyle=occupied?'#f2f5bd':'#a0b67d';ctx.font='bold 26px sans-serif';ctx.fillText(occupied?'✓':'P',b.x,b.y+10);});
 for(const p of g.layout.posts){ctx.fillStyle='#233a2f';ctx.beginPath();ctx.arc(p.x+4,p.y+6,p.r+3,0,Math.PI*2);ctx.fill();ctx.fillStyle=p.spring?'#74c6b2':'#d7b568';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=p.spring?'#c7f6df':'#f4dc97';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,p.r-6,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#355b45';ctx.font='bold 18px sans-serif';ctx.fillText(p.spring?'↝':'×',p.x,p.y+6);}
 ctx.strokeStyle='#f1d39555';ctx.lineWidth=3;if(trail.length){ctx.beginPath();trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
 if(canAim()){const c=g.cars[selected],v=vector(),len=Math.hypot(v.x,v.y)||1,reach=aim?30+len*.15:55;ctx.strokeStyle='#fff0ac';ctx.lineWidth=2;ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x+v.x/len*reach,c.y+v.y/len*reach);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(c.x,c.y,26,0,7);ctx.stroke();}
 for(const c of g.cars){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.angle);round(-21,-9,42,26,7,'#1c322c77');round(-20,-12,40,24,6,colors[c.id]);round(1,-9,10,18,3,'#325644');round(-12,-8,8,16,2,'#678873');round(16,-8,3,5,1,'#fff5c0');round(16,3,3,5,1,'#fff5c0');ctx.restore();ctx.fillStyle='#e3e8c3';ctx.font='11px sans-serif';ctx.fillText(String(c.id+1),c.x,c.y+31);}
 for(const p of sparks){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle='#f6d58d';ctx.fillRect(p.x,p.y,5,5);}ctx.globalAlpha=1;if(now>callUntil)$('callout').style.opacity=0;
}
function frame(now){const dt=last?Math.min(.08,(now-last)/1000):0;last=now;if(!paused&&!document.hidden&&!$('help').open){acc+=dt;const previous=state.phase;while(acc>=1/120){tickShift(state,1/120);acc-=1/120;}if(state.game.phase==='move'){const c=state.game.cars[selected];trail.push({x:c.x,y:c.y});if(trail.length>22)trail.shift();}const hadEvents=state.game.events.length>0;events(now);sparks=sparks.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;return p.life>0;});if(hadEvents)refresh();if(previous!==state.phase)resolve();}draw(now);requestAnimationFrame(frame);}
refresh();panel('七点海边见 · 阿停的停车场','再停两辆，就下班。','三单一轮。先停好两辆收保底，再决定要不要冒险冲满四辆。积分仅用于挑战。',{text:'开始接第一单 →',action:()=>{paused=false;hidePanel();feedback('按住任意小车向后拉，松手弹出。');}},{text:'先看看怎么玩',action:()=>$('help').showModal()});requestAnimationFrame(frame);
