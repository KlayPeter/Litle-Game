import assert from 'node:assert/strict';
import {newFlick,fire,tickFlick,collide,parkedCount,BAYS,WIDTH,HEIGHT,RADIUS} from './flick-core.mjs';
function settle(g){for(let i=0;i<3600&&g.phase==='move';i++)tickFlick(g,1/120);assert.notEqual(g.phase,'move','shots must settle');}
const g=newFlick(1);assert.equal(fire(g,0,0,0),false);assert.equal(g.shots,5);assert.equal(fire(g,0,NaN,1),false);assert.equal(fire(g,0,10000,0),true);assert.equal(g.shots,4);assert.ok(Math.abs(g.cars[0].vx-850)<1e-8);assert.equal(fire(g,1,500,0),false);settle(g);
const a={x:0,y:0,vx:200,vy:0},b={x:30,y:0,vx:0,vy:0};assert.equal(collide(a,b),true);assert.ok(b.vx>150);assert.ok(a.vx<50);
const park=newFlick();park.cars[0]={...park.cars[0],...BAYS[0],vx:20,vy:0};park.phase='move';tickFlick(park,1/120);assert.equal(parkedCount(park),1);assert.equal(park.combo,1);tickFlick(park,1/120);assert.equal(park.combo,1,'standing still cannot farm combos');park.cars[0].vx=250;tickFlick(park,1/120);assert.equal(park.cars[0].parked,-1,'parked cars can be knocked out');
const win=newFlick();BAYS.forEach((b,i)=>Object.assign(win.cars[i],b));win.phase='move';settle(win);assert.equal(win.won,true);assert.equal(win.phase,'end');assert.equal(win.bestCombo,4);
const loss=newFlick();loss.shots=1;fire(loss,0,30,0);settle(loss);assert.equal(loss.phase,'end');assert.equal(loss.won,false);assert.equal(loss.shots,0);
const p=newFlick(14),q=newFlick(14);fire(p,2,144,-560);fire(q,2,144,-560);settle(p);settle(q);assert.deepEqual(p.cars,q.cars);
for(let seed=1;seed<30;seed++){const game=newFlick(seed);for(let shot=0;shot<5&&game.phase!=='end';shot++){fire(game,shot,Math.sin(seed+shot)*800,Math.cos(seed-shot)*800);settle(game);for(const c of game.cars){assert.ok(Number.isFinite(c.x)&&Number.isFinite(c.y));assert.ok(c.x>=RADIUS-1&&c.x<=WIDTH-RADIUS+1&&c.y>=RADIUS-1&&c.y<=HEIGHT-RADIUS+1)}}}
console.log('PASS: shot limits, velocity cap, collision transfer, parking, knock-out, combos, win/loss, deterministic replay, 29 layouts stable');
const playable=newFlick(1);for(const [id,vx,vy] of [[2,95,-570],[4,-324,-613],[0,-7,-518],[1,352,-455]]){assert.equal(fire(playable,id,vx,vy),true);settle(playable)}assert.equal(playable.won,true,'normal opening is winnable through real shots');assert.equal(playable.shots,1);console.log('PASS: opening #1 won with four legal shots, no state manipulation');
const double=newFlick(1,2);fire(double,0,20,-495);settle(double);assert.equal(parkedCount(double),2);assert.equal(double.bestCombo,2);assert.equal(double.shots,5);assert.equal(double.bonusGiven,true);
const granted=double.shots;tickFlick(double,1/120);assert.equal(double.shots,granted,'bonus cannot repeat while idle');
fire(double,0,25,0);settle(double);assert.equal(double.shots,granted-1,'reparking an already parked car grants no new reward');
const spring=newFlick(1,1);spring.cars[0].x=270;spring.cars[0].y=400;fire(spring,0,0,-400);let springHits=0;for(let i=0;i<2000&&spring.phase==='move';i++){tickFlick(spring,1/120);springHits+=spring.events.filter(e=>e.type==='spring').length;spring.events=[]}assert.equal(springHits,1);assert.equal(spring.springUsed.includes(0),true);assert.equal(spring.phase,'aim');
for(const level of [1,2])for(let seed=1;seed<=20;seed++){const game=newFlick(seed,level);fire(game,2,Math.sin(seed)*800,-Math.abs(Math.cos(seed)*800));settle(game);assert.ok(game.cars.every(c=>Number.isFinite(c.x)&&Number.isFinite(c.y)))}
console.log('PASS: real two-car combo refunds one shot, no bonus farming, spring triggers once per car/shot, both new layouts settle');
for(const [level,moves] of [[1,[[2,200,-549],[4,-330,-617],[0,-1,-520],[3,266,-506],[3,-31,33]]],[2,[[2,533,-401],[3,-31,-642],[0,-230,-458],[1,200,-8]]]]){const game=newFlick(1,level);for(const [id,x,y] of moves){assert.equal(fire(game,id,x,y),true);settle(game)}assert.equal(game.won,true,`map ${level+1} must be winnable`)}
console.log('PASS: both new maps won with legal shots within the available attempts');
