import {PUZZLES,endpoints,inspect,extend} from './puzzle-core.mjs';
const $=id=>document.getElementById(id),palette=['#d77d51','#518eaa','#9c7aaf','#bf9637','#468975','#bd6786'],letters='ABCDEF';
let level=0,paths=[],selected=0,history=[],dragging=false,before=null,assisted=false,revisions=0,testing=false,hint=-1,missing=[],message='',ad=null,store={records:[],draft:null};
try{const saved=JSON.parse(localStorage.getItem('commute-puzzle-v1'));if(saved&&Array.isArray(saved.records))store={records:saved.records.filter(r=>Number.isInteger(r.level)&&r.level>=0&&r.level<3&&Number.isFinite(r.revisions)&&Number.isFinite(r.at)),draft:saved.draft}}catch{}
function save(){try{store.draft={level,paths,assisted,revisions,rules:'quota-v2'};localStorage.setItem('commute-puzzle-v1',JSON.stringify(store))}catch{message='浏览器未允许保存，当前布局仍可继续';$('status').textContent=message}}
function p(){return PUZZLES[level]}
function popup(html){$('puzzleDialogBody').innerHTML=html;$('puzzleDialog').showModal()}
function close(){if(ad){clearInterval(ad);ad=null}$('puzzleDialog').close()}
$('puzzleDialog').addEventListener('cancel',()=>{if(ad){clearInterval(ad);ad=null}});
function load(n){level=n;paths=p().solution.map(()=>[]);selected=0;history=[];assisted=false;revisions=0;hint=-1;missing=[];message=p().quotas?'每线须恰好用完自己的配额（含两端）；B、E线须经过同字母◇站。覆盖全图且不能交叉。':'不限时规划。先选 ⌂ 或 ▣，连接同字母两端，并覆盖全部街区。';render()}
function render(){
 const q=p(),ends=endpoints(q),result=inspect(q,paths),coverage=q.size*q.size-result.missing.length;
 $('puzzleTitle').textContent=`${level+1} · ${q.name}`;
 $('puzzleLevels').innerHTML=PUZZLES.map((q,i)=>`<button data-level="${i}" class="${i===level?'selected':''}" ${testing?'disabled':''}>${i+1} · ${['入门','进阶','极难'][i]}</button>`).join('');
 $('puzzleLevels').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(testing)return;load(Number(b.dataset.level));save()});
 const linked=result.ready.filter(Boolean).length;
 $('progress').textContent=result.ok?'布局完成 · 可以发车验收':`尚未过关 · ${linked}/${ends.length} 线达标 · 还需覆盖 ${result.missing.length} 格`;
 if(result.connected.every(Boolean)&&!result.ok&&!q.quotas){missing=result.missing;message=`两端接通只是第一步：还有 ${result.missing.length} 个橙色街区未覆盖。点击已有线路回退，绕路覆盖它们，同时保持所有组连通。`}
 $('status').textContent=message;
 $('linePicker').innerHTML=ends.map((_,i)=>`<button style="--route:${palette[i]}" class="${selected===i?'selected':''}" ${testing?'disabled':''} data-line="${i}" aria-pressed="${selected===i}">${letters[i]} ${q.quotas?`${paths[i].length}/${q.quotas[i]}格 `:''}${result.ready[i]?'✓':'待完成'}</button>`).join('');
 $('linePicker').querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.line);hint=-1;render()});
 const board=$('board');board.style.gridTemplateColumns=`repeat(${q.size},1fr)`;board.style.gridTemplateRows=`repeat(${q.size},1fr)`;board.classList.toggle('testing',testing);
 const focused=document.activeElement?.dataset?.cell;
 board.innerHTML=Array.from({length:q.size*q.size},(_,k)=>{
  const hub=(q.hubs||[]).findIndex(h=>h===k),i=ends.findIndex(e=>e.includes(k)),end=i<0?(hub<0?'':`<span class="endpoint hub" style="--route:${palette[hub]}">◇${letters[hub]}</span>`):`<span class="endpoint" style="--route:${palette[i]}">${ends[i][0]===k?'⌂':'▣'}${letters[i]}</span>`;
  const owner=paths.findIndex(v=>v.includes(k));
  return `<button class="puzzle-cell ${missing.includes(k)?'missing':''} ${owner===selected?'selected':''}" data-cell="${k}" aria-label="${Math.floor(k/q.size)+1}行${k%q.size+1}列${i<0?(hub>=0?letters[hub]+'必经站':owner<0?'空白街区':letters[owner]+'线路'):letters[i]+(ends[i][0]===k?'住宅':'站点')}" ${testing?'disabled':''}>${end}</button>`;
 }).join('');
 const points=path=>path.map(k=>`${k%q.size+.5},${Math.floor(k/q.size)+.5}`).join(' ');
 board.insertAdjacentHTML('beforeend',`<svg class="route-layer" viewBox="0 0 ${q.size} ${q.size}" aria-hidden="true">${paths.map((path,i)=>`<polyline points="${points(path)}" stroke="${palette[i]}" stroke-width=".27"/>`).join('')}${hint<0?'':`<polyline class="hint-route" points="${points(q.solution[hint])}" stroke="${palette[hint]}" stroke-width=".13"/>`}<g id="cars"></g></svg>`);
 if(focused!==undefined)board.querySelector(`[data-cell="${focused}"]`)?.focus({preventScroll:true});
 for(const id of ['verify','undoPlan','eraseLine','resetPlan','hintPlan'])$(id).disabled=testing;
}
function begin(k){
 if(testing||$('puzzleDialog').open)return;
 before=structuredClone(paths);hint=-1;missing=[];
 const owner=paths.findIndex(v=>v.includes(k)),end=endpoints(p()).findIndex(e=>e.includes(k));
 if(owner>=0)selected=owner;else if(end>=0)selected=end;
 message=extend(p(),paths,selected,k)||`正在规划 ${letters[selected]} 线 · 点已有线路可以回退`;
 render();
}
function finishGesture(){if(before&&JSON.stringify(before)!==JSON.stringify(paths)){history.push(before);if(history.length>100)history.shift();revisions++;save()}before=null;dragging=false}
function cellAt(e){const r=$('board').getBoundingClientRect(),border=parseFloat(getComputedStyle($('board')).borderLeftWidth),x=Math.floor((e.clientX-r.left-border)/(r.width-2*border)*p().size),y=Math.floor((e.clientY-r.top-border)/(r.height-2*border)*p().size);return x<0||y<0||x>=p().size||y>=p().size?null:y*p().size+x}
$('board').onpointerdown=e=>{if(testing||e.button!==0)return;const k=cellAt(e);if(k===null)return;e.preventDefault();$('board').setPointerCapture(e.pointerId);dragging=true;begin(k)};
$('board').onpointermove=e=>{if(!dragging||testing)return;const k=cellAt(e);if(k===null||paths[selected].at(-1)===k)return;let error='';while(paths[selected].length&&paths[selected].at(-1)!==k){const a=paths[selected].at(-1),n=p().size,dx=k%n-a%n,dy=Math.floor(k/n)-Math.floor(a/n),next=Math.abs(dx)>=Math.abs(dy)&&dx?a+Math.sign(dx):a+Math.sign(dy)*n;error=extend(p(),paths,selected,next);if(error)break}message=error||`正在规划 ${letters[selected]} 线 · 每格只能有一条路`;render()};
$('board').onpointerup=$('board').onpointercancel=finishGesture;
$('board').onkeydown=e=>{const k=Number(e.target.dataset.cell);if(!Number.isInteger(k)||testing)return;const n=p().size;let next=k;if(e.key==='ArrowRight'&&k%n<n-1)next++;else if(e.key==='ArrowLeft'&&k%n>0)next--;else if(e.key==='ArrowUp'&&k>=n)next-=n;else if(e.key==='ArrowDown'&&k<n*(n-1))next+=n;else if(e.key==='Enter'||e.key===' '){e.preventDefault();begin(k);finishGesture();return}else return;e.preventDefault();$('board').querySelector(`[data-cell="${next}"]`)?.focus()};
function change(fn){if(testing)return;before=structuredClone(paths);fn();missing=[];hint=-1;finishGesture();render()}
$('undoPlan').onclick=()=>{if(testing||!history.length)return;paths=history.pop();revisions++;missing=[];hint=-1;message='已撤销。没有计时，继续推敲就好。';save();render()};
$('eraseLine').onclick=()=>change(()=>{paths[selected]=[];message=`已清除 ${letters[selected]} 线，腾出街区重新规划。`});
$('resetPlan').onclick=()=>change(()=>{paths=p().solution.map(()=>[]);message='已清空布局；可用撤销恢复。'});
$('verify').onclick=()=>{
 if(testing)return;finishGesture();const result=inspect(p(),paths);missing=result.missing;
 if(!result.ok){message=[...result.issues,result.unlinked.length?`未连通：${result.unlinked.map(i=>letters[i]).join('、')} 线。`:'',result.missing.length?`还有 ${result.missing.length} 个空白街区（已标橙色），需调整路线覆盖。`:''].filter(Boolean).join(' ');render();return}
 testing=true;message='路网验收通过！车辆正在沿你的线路出发。没有时间考核。';render();
 const start=performance.now();function animate(now){const t=Math.min(1,(now-start)/4500),q=p();$('cars').innerHTML=paths.map((path,i)=>{const at=t*(path.length-1),j=Math.min(path.length-2,Math.floor(at)),f=at-j,a=path[j],b=path[j+1],x=(a%q.size+.5)*(1-f)+(b%q.size+.5)*f,y=(Math.floor(a/q.size)+.5)*(1-f)+(Math.floor(b/q.size)+.5)*f;return `<circle class="car" cx="${x}" cy="${y}" r=".12" fill="#fffdf6" stroke="${palette[i]}" stroke-width=".05"/>`}).join('');if(t<1)requestAnimationFrame(animate);else complete()};requestAnimationFrame(animate);
};
function complete(){testing=false;store.records.push({level,assisted,revisions,at:Date.now(),rules:'quota-v2'});store.records=store.records.slice(-100);message='全部线路送达！你完成了空间规划，不是抢时间。';save();render();popup(`<span class="pill">${assisted?'参考辅助通关':'独立规划通关'}</span><h2>${p().name}，全线畅通。</h2><p>${paths.length} 组全部接通，覆盖 ${p().size*p().size} 个街区，无交叉、无遗漏。<br>布局修订 ${revisions} 次 · 不计耗时</p><div class="modal-actions">${level<2?'<button id="nextPuzzle" class="primary">下一张 · 更多路线争空间 ↗</button>':''}<button id="keepPlan" class="secondary">回看我的布局</button></div>`);$('keepPlan').onclick=close;if($('nextPuzzle'))$('nextPuzzle').onclick=()=>{close();load(level+1);save()}}
$('records').onclick=()=>{if(testing)return;popup(`<span class="pill">仅本机真实记录</span><h2>我的规划成绩</h2>${PUZZLES.map((q,i)=>{const r=store.records.filter(r=>r.level===i&&(i!==2||r.rules==='quota-v2')),solo=r.filter(r=>!r.assisted);return `<div class="rank-row"><span>${i+1} · ${q.name}</span><b>${solo.length?'独立通关 · 最少修订 '+Math.min(...solo.map(r=>r.revisions))+' 次':r.length?'参考辅助通关':'尚未通关'}</b></div>`}).join('')}<p>两种模式单独记录。烧脑不按时间排名；使用参考提示的成绩单独标记。</p><button id="closeRecords" class="secondary">返回布局</button>`);$('closeRecords').onclick=close};
$('hintPlan').onclick=()=>{if(testing)return;let remaining=5;popup('<span class="pill">5秒模拟广告 · 无真实广告</span><h2>看看一种参考走法</h2><p>领取后显示选中线路的参考路径。它属于一套完整参考解，可能需要调整你已经画的其他线路。</p><p id="adCount">5 秒后可以领取</p><div class="modal-actions"><button id="claimHint" class="primary" disabled>等待播放完成</button><button id="cancelHint" class="secondary">关闭 · 不领取</button></div>');let last=performance.now();ad=setInterval(()=>{const now=performance.now();if(!document.hidden)remaining=Math.max(0,remaining-(now-last)/1000);last=now;$('adCount').textContent=remaining>0?`${Math.ceil(remaining)} 秒后可以领取`:'模拟播放完成';if(remaining===0){$('claimHint').disabled=false;$('claimHint').textContent='领取参考路线';clearInterval(ad);ad=null}},100);$('cancelHint').onclick=close;$('claimHint').onclick=()=>{if(remaining>0)return;assisted=true;hint=selected;message=`虚线是 ${letters[selected]} 线的一种参考走法；可能需要重排其他线。`;close();save();render()}};
const draft=store.draft;load(Number.isInteger(draft?.level)&&draft.level>=0&&draft.level<3?draft.level:0);
if(draft&&(level!==2||draft.rules==='quota-v2')&&Array.isArray(draft.paths)&&draft.paths.length===paths.length){const restored=p().solution.map(()=>[]);let valid=true;draft.paths.forEach((path,i)=>{if(!Array.isArray(path)){valid=false;return}for(const k of path)if(extend(p(),restored,i,k))valid=false});if(valid){paths=restored;assisted=!!draft.assisted;revisions=Number.isInteger(draft.revisions)&&draft.revisions>=0?draft.revisions:0;render()}}
