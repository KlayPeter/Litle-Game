import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as actions from './src/actions.ts';
const source=fs.readFileSync(new URL('./src/main.ts',import.meta.url),'utf8');
const logic=source.slice(0,source.indexOf('const app=')).replace(/^import .*$/gm,'')+'\nglobalThis.Game=Game;';
const canvas={getContext:()=>({setTransform(){}}),parentElement:{getBoundingClientRect:()=>({width:390,height:844})}};
let seed=1;const math=Object.create(Math);math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const context=vm.createContext({...actions,Math:math,document:{createElement:()=>canvas,querySelector:()=>({prepend(){}})},devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){return 1},cancelAnimationFrame(){},hideOverlay(){},flash(){},text(){},performance:{now:()=>0}});
vm.runInContext(ts.transpile(logic,{target:ts.ScriptTarget.ES2022}),context);
let wins=0,losses=0;const events=new Set();
for(let i=1;i<=36;i++){
 seed=i;const g=new context.Game();g.sound={tone(){},success(){}};g.say=()=>{};g.hud=()=>{};g.finish=ok=>{g.running=false;ok?wins++:losses++};g.start(i%3);events.add(g.randomEvent.name);
 for(let frame=0;frame<2100&&g.running;frame++){
  const dx=g.doors[0]-g.player.x;g.input={x:Math.max(-.8,Math.min(.8,dx/60)),y:-1};g.sideways=frame%180<90;if(frame%180===0)g.dash();g.update(1/60);
  for(const a of [g.player,...g.actors])assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));
  assert.ok(g.player.x>=g.player.r&&g.player.x<=g.w-g.player.r);
  assert.ok(g.player.stamina>=0&&g.player.stamina<=100);
 }
 assert.equal(g.running,false,'round must resolve');
}
assert.ok(wins>0,'legal movement must be able to board');assert.ok(events.size>=4,'random events must vary');
console.log(`PASS: 36 random rounds terminate with finite bounded bodies; ${wins} scripted wins / ${losses} losses across ${events.size} events (not human difficulty).`);

const g=new context.Game();g.sound={tone(){}};g.say=()=>{};g.hud=()=>{};let outcome;g.finish=ok=>{outcome=ok;g.running=false};g.start(0);
for(let i=0;i<2000&&g.running;i++)g.update(1/60);assert.equal(outcome,false,'standing still must lose');
g.start(0);g.actions.civil=35;g.player.dir={x:0,y:-1};g.actors=[{...g.make(g.player.x,g.player.y-25,'exit'),kind:'elder'}];g.pull();assert.equal(outcome,false);assert.equal(g.actions.civil,0);assert.ok(g.failReason.includes('文明度'));assert.equal(g.running,false);
console.log('PASS: idle timeout and actual pull-triggered ejection explain the failure.');
g.start(0);g.input={x:.25,y:0};g.updatePlayer(1/60);const slow=g.player.vx;g.player.vx=0;g.input={x:1,y:0};g.updatePlayer(1/60);assert.ok(Math.abs(g.player.vx-slow*4)<1e-8,'analog input must retain its magnitude');
console.log('PASS: quarter joystick input produces quarter target acceleration.');
