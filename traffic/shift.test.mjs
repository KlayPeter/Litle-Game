import assert from 'node:assert/strict';
import {newShift,shootShift,tickShift,collect,riskOrder,nextOrder} from './shift-core.mjs';
const moves=[[[2,95,-570],[4,-324,-613],[0,-7,-518],[1,352,-455]],[[2,200,-549],[4,-330,-617],[0,-1,-520],[3,266,-506],[3,-31,33]],[[2,533,-401],[3,-31,-642],[0,-230,-458],[1,200,-8]]];
function shot(s,[id,x,y]){assert.ok(shootShift(s,id,x,y));for(let i=0;i<3600&&s.phase==='play'&&s.game.phase==='move';i++)tickShift(s,1/120);assert.notEqual(s.game.phase,'move');}
const safe=newShift();assert.equal(collect(safe),false);assert.equal(nextOrder(safe),false);assert.equal(riskOrder(safe),false);
shot(safe,moves[0][0]);shot(safe,moves[0][1]);assert.equal(safe.phase,'offer');assert.equal(shootShift(safe,0,100,0),false,'decision blocks shooting');const before=structuredClone(safe);tickShift(safe,1/120);assert.deepEqual(safe,before,'offer freezes physics');assert.ok(collect(safe));assert.equal(safe.bank,200);assert.equal(collect(safe),false,'cannot claim twice');assert.equal(safe.history.length,1);assert.ok(nextOrder(safe));assert.equal(safe.order,1);assert.equal(safe.bank,200);
// Legal low-power misses on the second order cannot claw back the first order's bank.
for(let i=0;i<5;i++)shot(safe,[0,20,0]);assert.equal(safe.phase,'result');assert.equal(safe.bank,200);assert.equal(safe.history[1].earned,0);
const risk=newShift();shot(risk,moves[0][0]);shot(risk,moves[0][1]);assert.ok(riskOrder(risk));assert.equal(collect(risk),false);while(risk.phase==='play')shot(risk,[3,20,0]);assert.equal(risk.bank,0);assert.equal(risk.history[0].kind,'miss');
const full=newShift();for(let order=0;order<3;order++){for(const action of moves[order]){if(full.phase==='offer')assert.ok(riskOrder(full));shot(full,action);}assert.equal(full.phase,'result');assert.equal(full.history[order].kind,'full');assert.ok(nextOrder(full));}
assert.equal(full.phase,'complete');assert.ok(full.bank>=1500);const total=full.bank;assert.equal(nextOrder(full),false);assert.equal(collect(full),false);assert.equal(shootShift(full,0,200,0),false);tickShift(full,1/120);assert.equal(full.bank,total);
const invalid=newShift();const clean=structuredClone(invalid);for(const dt of [NaN,Infinity,-1,1])tickShift(invalid,dt);assert.deepEqual(invalid,clean);assert.throws(()=>newShift(NaN));assert.throws(()=>newShift(-1));
const exhausted=newShift();shot(exhausted,moves[0][0]);shot(exhausted,moves[0][1]);exhausted.game.shots=0;assert.equal(riskOrder(exhausted),false);assert.ok(collect(exhausted));assert.equal(exhausted.bank,200);
console.log('PASS: real-shot safe collection, risk loss, protected bank, all-three-order completion, exactly-once payouts and blocked invalid transitions');
