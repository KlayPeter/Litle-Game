import {FINAL_PUZZLE} from './puzzle-core.mjs';
import {rng} from './core.mjs';
const MAPS=[FINAL_PUZZLE.solution,[[28,36,37,29,30,38,39,31,23,22],[21,20,12,13,14,15,7,6,5,4,3],[11,19,27,26,18,10,2,1,0,8],[9,17,16,24,25,33,32,40,48,56,57],[49,50,58,59,60,61,53,54,62,63,55],[47,46,45,44,52,51,43,35,34,42,41]]];
export const SIZE=8,LETTERS='ABCDEF';
export function cityMap(seed){const random=rng(seed),source=MAPS[Math.floor(random()*MAPS.length)],turn=Math.floor(random()*4),flip=random()>.5;const paths=source.map(path=>path.map(k=>{let x=k%8,y=Math.floor(k/8);if(flip)x=7-x;for(let i=0;i<turn;i++)[x,y]=[7-y,x];return y*8+x}));for(let i=paths.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[paths[i],paths[j]]=[paths[j],paths[i]]}return {solution:paths,ends:paths.map(p=>[p[0],p.at(-1)])}}
export function createCity(seed=1){return {seed,stage:0,paths:Array.from({length:6},()=>[]),locked:[],tools:{bridge:0,tunnel:0,roads:0},replans:1,completed:false,choosing:false,previous:[],rollbacks:0,adGranted:false,assisted:false}}
export const activeCount=g=>(g.stage+1)*2;
export const roadBudget=g=>[18,36,52][g.stage]+g.tools.roads*6;
const distance=(a,b)=>Math.abs(a%8-b%8)+Math.abs(Math.floor(a/8)-Math.floor(b/8));
export function auditCity(g){
 const ends=cityMap(g.seed).ends,active=activeCount(g),owners=new Map(),errors=[],bad=new Set(),linked=[],jumps=[];
 let roadUse=0;
 for(let i=0;i<active;i++){
  const p=g.paths[i];roadUse+=Math.max(0,p.length-2);
  linked[i]=p.length>1&&ends[i].includes(p[0])&&ends[i].includes(p.at(-1))&&p[0]!==p.at(-1);
  for(let j=0;j<p.length;j++){
   const k=p[j];if(!Number.isInteger(k)||k<0||k>=64){errors.push('线路超出地图');continue}
   if(p.indexOf(k)!==j){errors.push(`${LETTERS[i]}线绕回了自己的道路`);bad.add(k)}
   const owner=ends.slice(0,active).findIndex((e,c)=>c!==i&&e.includes(k));
   if(owner>=0){errors.push(`${LETTERS[i]}线占用了${LETTERS[owner]}住宅或站点，先改${LETTERS[i]}线`);bad.add(k)}
   if(!owners.has(k))owners.set(k,[]);owners.get(k).push(i);
   if(j&&distance(p[j-1],k)!==1){
    const a=p[j-1],straight=a%8===k%8||Math.floor(a/8)===Math.floor(k/8);
    if(distance(a,k)!==2||!straight){errors.push(`${LETTERS[i]}线存在断路`);bad.add(k)}
    else jumps.push([a,k]);
   }
  }
 }
 const crossings=[...owners].filter(([,v])=>v.length>1).map(([k])=>k);
 for(const k of crossings){if(owners.get(k).length>2){errors.push('立交桥最多容纳两条线路');bad.add(k)}}
 if(crossings.length>g.tools.bridge){errors.push(`有${crossings.length}处共用格，立交桥只有${g.tools.bridge}座`);crossings.forEach(k=>bad.add(k))}
 if(jumps.length>g.tools.tunnel)errors.push(`有${jumps.length}段跨格道路，隧道只有${g.tools.tunnel}条`);
 if(roadUse>roadBudget(g))errors.push(`道路用了${roadUse}格，预算${roadBudget(g)}格，请缩短路线或增加道路`);
 const unlinked=linked.map((v,i)=>v?-1:i).filter(i=>i>=0);
 return {ok:errors.length===0&&unlinked.length===0,errors:[...new Set(errors)],bad:[...bad],linked,unlinked,roadUse,crossings,jumps};
}
export function editCity(g,line,k,tunnel=false){
 if(g.completed||g.choosing)return '先完成当前结算';
 if(!Number.isInteger(line)||line<0||line>=activeCount(g)||!Number.isInteger(k)||k<0||k>=64)return '请选择已入住的住宅';
 if(g.locked.includes(line))return `${LETTERS[line]}线已通车锁定，先点「改选中旧线」`;
 const ends=cityMap(g.seed).ends,p=g.paths[line],at=p.indexOf(k);
 if(at>=0){p.splice(at+1);return ''}
 if(!p.length){if(!ends[line].includes(k))return '从同字母的住宅或站点开始';p.push(k);return ''}
 if(p.length>1&&ends[line].includes(p.at(-1)))return '已经接通；点击已有线路回退';
 const d=distance(p.at(-1),k);if(d!==1&&!(tunnel&&d===2&&(p.at(-1)%8===k%8||Math.floor(p.at(-1)/8)===Math.floor(k/8))))return tunnel?'隧道需点同一直线上隔一格的位置':'只能连接横竖相邻格';
 if(d===2&&auditCity(g).jumps.length>=g.tools.tunnel)return '没有可用隧道';
 p.push(k);const result=auditCity(g);if(result.errors.length){p.pop();return result.errors[0]}return '';
}
export function unlockCity(g,line){if(!g.locked.includes(line))return '这条线还未锁定，可以直接改';if(g.replans<=0)return '本批免费改线已用完，可回退上一批或用立交/隧道绕开';g.replans--;g.locked=g.locked.filter(i=>i!==line);return ''}
export function advanceCity(g,tool){
 if(!['bridge','tunnel','roads'].includes(tool)||g.stage>=2||!auditCity(g).ok)return false;
 const prior=structuredClone(g);prior.previous=[];prior.choosing=false;g.previous.push(prior);
 g.tools[tool]++;g.locked=Array.from({length:activeCount(g)},(_,i)=>i);g.stage++;g.replans=1;g.choosing=false;return true;
}
export function rollbackCity(g){if(!g.previous.length||g.rollbacks>=1+(g.adGranted?1:0))return null;const prev=g.previous.at(-1),history=g.previous.slice(0,-1);return {...structuredClone(prev),previous:history,rollbacks:g.rollbacks+1,adGranted:g.adGranted,assisted:g.assisted,completed:false,choosing:false}}
