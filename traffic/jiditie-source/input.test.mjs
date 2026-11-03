import assert from 'node:assert/strict';
import {joystickVector} from './src/input.ts';
assert.deepEqual(joystickVector(0,0,40),{x:0,y:0});
assert.deepEqual(joystickVector(0,-20,40),{x:0,y:-.5});
assert.deepEqual(joystickVector(0,500,40),{x:0,y:1});
assert.ok(Math.abs(Math.hypot(...Object.values(joystickVector(70,-80,40)))-1)<1e-12);
assert.deepEqual(joystickVector(NaN,1,40),{x:0,y:0});
assert.deepEqual(joystickVector(2,1,40),{x:0,y:0});
console.log('PASS: joystick dead zone, analog movement, capped diagonal and invalid input');
