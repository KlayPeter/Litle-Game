import assert from 'node:assert/strict';
import {PUZZLES,inspect,extend,endpoints} from './puzzle-core.mjs';
for(const p of PUZZLES){
 const paths=p.solution.map(()=>[]);
 for(const [i,path] of p.solution.entries())for(const k of path)assert.equal(extend(p,paths,i,k),'');
 assert.equal(inspect(p,paths).ok,true,`${p.name} must be solvable`);
 assert.equal(inspect(p,p.solution.map(a=>a.toReversed())).ok,true,'both endpoint directions work');
 const truncated=structuredClone(paths);truncated[0].pop();assert.equal(inspect(p,truncated).ok,false);
 const jump=structuredClone(paths);jump[0].splice(1,1);assert.equal(inspect(p,jump).ok,false);
 const overlap=structuredClone(paths);overlap[1].push(paths[0][1]);assert.equal(inspect(p,overlap).ok,false);
 const empty=p.solution.map(()=>[]);assert.equal(inspect(p,empty).ok,false);
 extend(p,empty,0,endpoints(p)[0][0]);const before=structuredClone(empty);assert.notEqual(extend(p,empty,0,endpoints(p)[1][0]),'');assert.deepEqual(empty,before,'crossing rejected without corrupting paths');
 const back=structuredClone(paths);assert.equal(extend(p,back,0,back[0][2]),'');assert.equal(back[0].length,3);
 assert.equal(inspect(p,p.solution.map(a=>[a[0],a.at(-1)])).ok,false);
 console.log(`PASS: ${p.name}: full solution, reverse, missing road, jumps, crossings, backtrack`);
}
// All pairs connected is insufficient if a district is left unserved.
const small={size:3,solution:[[0,3,6,7,8,5,4,1,2]]};
const short=[[0,1,2]];assert.equal(inspect(small,short).connected[0],true);assert.equal(inspect(small,short).ok,false);assert.equal(inspect(small,short).missing.length,6);
assert.notEqual(extend(PUZZLES[0],[[],[],[]],0,-1),'');
console.log('PASS: connected but uncovered is rejected; out-of-bounds edits rejected; no time-based loss exists');

const final=PUZZLES[2];
const wrongQuota={...final,quotas:final.quotas.map((v,i)=>v+(i===0?1:i===1?-1:0))};
const quotaResult=inspect(wrongQuota,final.solution);assert.equal(quotaResult.ok,false);assert.ok(quotaResult.issues.some(s=>s.includes('须恰好占')));
const wrongHub={...final,hubs:[null,0,null,null,20,null]};assert.ok(inspect(wrongHub,final.solution).issues.some(s=>s.includes('尚未经过')));
const shortQuota={...final,quotas:final.quotas.map(()=>2)},limited=final.solution.map(()=>[]);extend(shortQuota,limited,0,final.solution[0][0]);extend(shortQuota,limited,0,final.solution[0][1]);assert.match(extend(shortQuota,limited,0,final.solution[0][2]),/配额/);assert.equal(limited[0].length,2);
console.log('PASS: per-line quotas and mandatory hubs are enforced');
