export const FINAL_PUZZLE={"size":8,"solution":[[6,7,15,14,22,23,31,39,47,55,63],[62,61,60,52,51,59,58,50,49,57,56],[48,40,32,24,16,8,0,1,9,10,2],[3,11,19,18,17,25,26,34,33,41],[42,43,35,27,28,20,12,4,5,13],[21,29,30,38,46,54,53,45,44,36,37]],"hubs":[null,59,null,null,20,null],"name":"配额困局","quotas":[11,11,11,10,10,11]};
export const PUZZLES=[
 {name:'街区入门',size:5,solution:[[20,21,22,17,16,15,10,11],[6,5,0,1,2,7,12,13],[8,3,4,9,14,19,24,23,18]]},
 {name:'寸路必争',size:6,solution:[[10,16,17,23,29,35,34,33,27],[28,22,21,20,26,32,31,30,24],[25,19,18,12,6,0,1,2,8],[7,13,14,15,9,3,4,5,11]]},
 FINAL_PUZZLE
];
export const adjacent=(a,b,n)=>Math.abs(a%n-b%n)+Math.abs(Math.floor(a/n)-Math.floor(b/n))===1;
export const endpoints=p=>p.solution.map(path=>[path[0],path.at(-1)]);
export function inspect(p,paths){
 const ends=endpoints(p),occupied=new Set(),issues=[],connected=[];
 paths.forEach((path,i)=>{
  const pair=ends[i];let valid=!!pair;
  if(p.quotas&&path.length!==p.quotas[i])issues.push(`${'ABCDEF'[i]}线须恰好占${p.quotas[i]}格，目前${path.length}格`);
  if(p.hubs?.[i]!=null&&!path.includes(p.hubs[i]))issues.push(`${'ABCDEF'[i]}线尚未经过同字母◇必经站`);
  for(let j=0;j<path.length;j++){
   const k=path[j];
   if(!Number.isInteger(k)||k<0||k>=p.size*p.size){issues.push('线路超出地图');valid=false;continue}
   if(occupied.has(k)){issues.push('线路交叉或重复占格');valid=false}
   if(ends.some((e,c)=>c!==i&&e.includes(k))||(p.hubs||[]).some((h,c)=>c!==i&&h===k)){issues.push('线路穿过其他组的住宅或站点');valid=false}
   occupied.add(k);
   if(j&&!adjacent(path[j-1],k,p.size)){issues.push('道路必须横竖相连，不能跳格');valid=false}
  }
  connected[i]=valid&&path.length>1&&pair.includes(path[0])&&pair.includes(path.at(-1))&&path[0]!==path.at(-1);
 });
 const missing=Array.from({length:p.size*p.size},(_,i)=>i).filter(k=>!occupied.has(k)&&!ends.some(e=>e.includes(k)));
 const ready=ends.map((_,i)=>connected[i]&&(!p.quotas||paths[i].length===p.quotas[i])&&(p.hubs?.[i]==null||paths[i].includes(p.hubs[i])));
 const unlinked=ends.map((_,i)=>i).filter(i=>!connected[i]);
 return {ok:!issues.length&&!unlinked.length&&!missing.length,issues:[...new Set(issues)],connected,ready,unlinked,missing};
}
export function extend(p,paths,line,k){
 if(!Number.isInteger(line)||line<0||line>=paths.length||!Number.isInteger(k)||k<0||k>=p.size*p.size)return '先选择一个住宅';
 const ends=endpoints(p),path=paths[line],existing=path.indexOf(k);
 if(existing>=0){path.splice(existing+1);return ''}
 if(paths.some((v,i)=>i!==line&&v.includes(k))||ends.some((v,i)=>i!==line&&v.includes(k))||(p.hubs||[]).some((h,i)=>i!==line&&h===k))return '这一格属于另一条线路，不能交叉或共用';
 if(!path.length){if(!ends[line].includes(k))return '请从同字母住宅或站点开始';path.push(k);return ''}
 if(path.length>1&&ends[line].includes(path.at(-1)))return '已连接两端，点击已有线路可回退';
 if(p.quotas&&path.length>=p.quotas[line])return `${'ABCDEF'[line]}线的${p.quotas[line]}格配额已用完，请回退重排`;
 if(!adjacent(path.at(-1),k,p.size))return '只能接相邻的一格';
 path.push(k);return '';
}
