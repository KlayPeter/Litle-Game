import assert from 'node:assert/strict';
import {W,H,key,water,route,createGame,paint,step,rescue} from './core.mjs';
assert.deepEqual(route(0,2,new Set([1])),[0,1,2]);
assert.equal(route(11,12,new Set()),null);
assert.equal(route(0,2,new Set([1]),new Set([1])),null);
function connect(g){
 for(const k of [...g.roads])paint(g,k,true);paint(g,key(5,7));
 const blocked=new Set(g.buildings.map(b=>b.k));
 const all=new Set(Array.from({length:W*H},(_,k)=>k).filter(k=>!water(k)||k===key(5,7)));
 for(const b of g.buildings.filter(b=>b.home)){
 const routes=g.buildings.filter(d=>!d.home&&d.color===b.color).map(d=>route(b.k,d.k,all,blocked)).filter(Boolean).sort((a,b)=>a.length-b.length);
 assert.ok(routes.length);for(const k of routes[0])paint(g,k);
 }
 assert.ok(g.roads.size<=g.config.budget);
}
function run(g,adapt=false){for(let i=0;i<3000&&!g.ended;i++){const wave=g.wave;step(g,.05);if(adapt&&g.wave!==wave)connect(g)}assert.ok(g.ended)}
for(let level=0;level<3;level++){
 for(const mode of ['free','daily'])for(const seed of [3,42]){
 const g=createGame(seed,mode,level);connect(g);run(g,true);
 assert.equal(g.reason,'win',`${mode} level ${level+1} must have a working solution`);
 assert.ok(g.buildings.filter(b=>b.home).every(b=>b.delivered>=g.config.quota));
 console.log(`PASS: ${mode} stage ${level+1}, seed ${seed}: ${g.time.toFixed(1)}s / ${g.config.duration}s, roads ${g.roads.size}/${g.config.budget}`);
 }
}
const timeout=createGame(3);timeout.buildings.forEach(b=>b.timer=1000);run(timeout);assert.equal(timeout.reason,'timeout');assert.equal(timeout.score,0);
const one=createGame(3);one.score=10000;one.buildings.find(b=>b.home).delivered=10000;step(one,.05);assert.equal(one.ended,false,'total score cannot substitute for every-home quota');
const blocked=createGame(3);run(blocked);assert.equal(blocked.reason,'blocked');assert.equal(rescue(blocked),true);assert.equal(rescue(blocked),false);
const daily=createGame(3,'daily');run(daily);assert.equal(rescue(daily),false);
const bridge=createGame(3);assert.equal(paint(bridge,key(5,6)),false);paint(bridge,key(5,7),true);assert.equal(paint(bridge,key(5,6)),true);
const delayed=createGame(42,'free',2);for(let i=0;i<400;i++)step(delayed,.05);connect(delayed);run(delayed);assert.notEqual(delayed.reason,'win','final stage punishes slow planning');
const f=createGame(123,'daily',2),f2=createGame(123,'daily',2);connect(f);connect(f2);run(f,true);run(f2,true);assert.deepEqual(f.buildings,f2.buildings);assert.equal(f.time,f2.time);
console.log('PASS: timeout is failure, every home required, rescue limits, bridge budget, final-stage pressure, deterministic replay');

const fixed=createGame(42,'free',2);connect(fixed);run(fixed);assert.notEqual(fixed.reason,'win','fixed roads must fail after station changes');
console.log('PASS: fixed opening solution cannot clear final stage');
function timedRefit(delay){
 const g=createGame(42,'free',2);let next=delay;
 for(let i=0;i<3000&&!g.ended;i++){
  if(next!==null&&g.time>=next){connect(g);next=null}
  const wave=g.wave;step(g,.05);
  if(g.wave!==wave){for(const k of [...g.roads])paint(g,k,true);next=g.time+delay}
 }
 return g;
}
assert.equal(timedRefit(5).reason,'win','solution leaves five seconds for each refit');
assert.notEqual(timedRefit(8).reason,'win','slow refits must fail');
const deadline=createGame(42,'free',2);deadline.time=39.95;deadline.buildings.forEach(b=>b.timer=1000);step(deadline,.05);assert.equal(deadline.reason,'wave');assert.deepEqual(deadline.failedHomes,[1,2,3,4,5]);
const transition=createGame(42,'free',2);transition.time=39.95;transition.buildings.filter(b=>b.home).forEach(b=>b.roundDelivered=28);const oldColors=transition.buildings.filter(b=>!b.home).map(b=>b.color);step(transition,.05);assert.equal(transition.wave,1);assert.ok(transition.buildings.filter(b=>b.home).every(b=>b.roundDelivered===0));assert.deepEqual(transition.buildings.filter(b=>!b.home).map(b=>b.color),oldColors.map(c=>(c+1)%3));
console.log('PASS: timed refits, per-wave deadlines, counter reset, destination rotation');
