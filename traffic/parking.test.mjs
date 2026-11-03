import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {levels,CAR,SUV,move,advance,collision,parking,overlap,clearance,rating} from './parking-core.mjs';
const c={x:260,y:200,a:-Math.PI/2};
assert.ok(move(c,0,-1,1).y>c.y,'reverse moves backward');
assert.ok(move(c,1,1,1).a>c.a);assert.ok(move(c,1,-1,1).a<c.a,'reverse steering flips yaw');
assert.deepEqual(move(c,1,0,1),c,'cannot turn on spot');
assert.ok(Math.abs(move({...c,...SUV},1,1,1).a-c.a)<Math.abs(move(c,1,1,1).a-c.a),'long wheelbase turns wider');
assert.ok(overlap({x:0,y:0,w:20,h:20},{x:5,y:0,w:20,h:20}));assert.ok(!overlap({x:0,y:0,w:20,h:20},{x:50,y:0,w:20,h:20}));
let moving={...c,speed:0};for(let i=0;i<50;i++)moving=advance(moving,0,1,.02);assert.equal(moving.speed,62);for(let i=0;i<20;i++)moving=advance(moving,0,0,.02);assert.equal(moving.speed,0,'release brakes to zero');moving=advance({...c,speed:60},0,-1,.02);assert.ok(moving.speed>0,'reverse first brakes instead of teleporting velocity');
assert.equal(rating({hits:0,shifts:4,offset:2,assisted:false}),3);assert.equal(rating({hits:0,shifts:4,offset:2,assisted:true}),2);assert.equal(rating({hits:1,shifts:0,offset:0,assisted:false}),1);
for(const l of levels){const car={...CAR,...l.vehicle,x:l.bay.x,y:l.bay.y,a:l.bay.a};assert.equal(collision({...car,...l.start},l),null);assert.ok(parking(car,l.bay).ready);assert.equal(collision(car,l),null);assert.ok(!parking({...car,a:car.a+Math.PI},l.bay).ready,'wrong-facing car fails');assert.ok(!parking({...car,x:car.x+50},l.bay).ready);assert.ok(clearance(car,l)>0);assert.equal(clearance({...car,x:0},l),0);}
const solutions=JSON.parse(readFileSync(new URL('./parking-solutions.json',import.meta.url)));assert.equal(solutions.length,levels.length);
for(const [index,path]of solutions.entries()){const l=levels[index];let car={...CAR,...l.vehicle,...l.start};for(const [steer,drive]of path)for(let i=0;i<4;i++){car=move(car,steer,drive,.05);assert.equal(collision(car,l),null,`level ${index+1}: solution collision`);}assert.ok(parking(car,l.bay).ready,`level ${index+1}: full route must park`);const shifts=path.reduce((n,a,i)=>n+(i>0&&a[1]!==path[i-1][1]?1:0),0);assert.equal(rating({hits:0,shifts,assisted:false,offset:parking(car,l.bay).offset}),3,`level ${index+1}: gold medal must be achievable`);}
console.log('PASS: acceleration/braking, reverse steering, SUV radius, rotated bays, radar, medals, six collision-free full solutions');
