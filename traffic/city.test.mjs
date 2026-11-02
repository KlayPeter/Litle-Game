import assert from 'node:assert/strict';
import {cityMap,createCity,activeCount,auditCity,editCity,unlockCity,advanceCity,rollbackCity} from './city-core.mjs';
for(let seed=1;seed<=100;seed++){
 const g=createCity(seed),map=cityMap(seed);assert.deepEqual(map,cityMap(seed));
 for(let stage=0;stage<3;stage++){
  for(let i=stage*2;i<activeCount(g);i++)for(const k of map.solution[i])assert.equal(editCity(g,i,k),'');
  assert.equal(auditCity(g).ok,true,`seed ${seed} stage ${stage} must be solvable within budget`);
  if(stage<2)assert.equal(advanceCity(g,['bridge','tunnel','roads'][seed%3]),true);
 }
 assert.equal(g.locked.length,4);const before=structuredClone(g.paths[0]);assert.match(editCity(g,0,before[0]),/锁定/);assert.deepEqual(g.paths[0],before);
 assert.equal(unlockCity(g,0),'');assert.equal(g.replans,0);assert.match(unlockCity(g,1),/用完/);
 const prior=rollbackCity(g);assert.equal(prior.stage,1);assert.equal(prior.rollbacks,1);assert.equal(prior.paths[4].length,0);assert.equal(rollbackCity(prior),null);
 prior.adGranted=true;prior.assisted=true;const twice=rollbackCity(prior);assert.equal(twice.stage,0);assert.equal(twice.assisted,true);assert.equal(twice.rollbacks,2);assert.equal(rollbackCity(twice),null);
}
// A bridge relaxes a real shared-cell conflict, rather than changing only the UI counter.
const bridge=createCity(1);const endpoints=new Set(cityMap(1).ends.slice(0,2).flat());let center=18;while(endpoints.has(center)||endpoints.has(center-1)||endpoints.has(center+1)||endpoints.has(center-8)||endpoints.has(center+8))center++;
bridge.paths[0]=[center-1,center,center+1];bridge.paths[1]=[center-8,center,center+8];assert.ok(auditCity(bridge).errors.some(s=>s.includes('立交桥')));bridge.tools.bridge=1;assert.equal(auditCity(bridge).errors.length,0);
const tunnel=createCity(2);const home=cityMap(2).ends[0][0];tunnel.paths[0]=[home];const candidates=[home-16,home+16,home-2,home+2].filter(k=>k>=0&&k<64&&(k%8===home%8||Math.floor(k/8)===Math.floor(home/8))&&!cityMap(2).ends.slice(0,2).flat().includes(k));assert.ok(candidates.length);assert.match(editCity(tunnel,0,candidates[0],true),/隧道/);tunnel.tools.tunnel=1;assert.equal(editCity(tunnel,0,candidates[0],true),'');assert.equal(auditCity(tunnel).jumps.length,1);editCity(tunnel,0,home);assert.equal(auditCity(tunnel).jumps.length,0);
const preview=createCity(5),ends=cityMap(5).ends;preview.paths[0]=[ends[0][0],ends[2][0]];preview.stage=1;assert.ok(auditCity(preview).errors.some(s=>s.includes('占用了C')));
const noPremature=createCity();assert.equal(advanceCity(noPremature,'bridge'),false);assert.equal(noPremature.stage,0);
console.log('PASS: 100 cities × 3 batches solvable, deterministic maps, lock/unlock limits, rollback snapshots, one extra ad rollback, bridge conflicts, tunnel jump/refund, future-home diagnosis, no premature reward');
