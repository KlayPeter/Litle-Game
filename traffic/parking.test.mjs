import assert from 'node:assert/strict';
import {levels,move,collision,parking,overlap} from './parking-core.mjs';
const c={x:260,y:200,a:-Math.PI/2};
assert.ok(move(c,0,-1,1).y>c.y,'reverse moves backward');
assert.ok(move(c,1,1,1).a>c.a);assert.ok(move(c,1,-1,1).a<c.a,'reverse steering flips yaw');
assert.deepEqual(move(c,1,0,1),c,'cannot turn on spot');
assert.ok(overlap({x:0,y:0,w:20,h:20},{x:5,y:0,w:20,h:20}));
assert.ok(!overlap({x:0,y:0,w:20,h:20},{x:50,y:0,w:20,h:20}));
for(const l of levels){assert.equal(collision(l.start,l),null);assert.ok(parking({x:l.bay.x,y:l.bay.y,a:l.bay.a},l.bay).ready);assert.equal(collision({x:l.bay.x,y:l.bay.y,a:l.bay.a},l),null);assert.ok(!parking({...l.bay,a:0},l.bay).ready);assert.ok(!parking({...l.bay,x:l.bay.x+20},l.bay).ready);
 // Every bay has a collision-free straight reverse approach, reached through the open maneuvering area.
 const distance=l.type==='侧方停车'?20:140;let car={x:l.bay.x,y:l.bay.y-distance,a:l.bay.a};for(let i=0;i<distance;i++){assert.equal(collision(car,l),null,`${l.type}: approach blocked`);car=move(car,0,-1,1/65);}assert.ok(parking(car,l.bay).ready);
}
console.log('PASS: steering, reverse, collision, success bounds and three feasible bay approaches');
