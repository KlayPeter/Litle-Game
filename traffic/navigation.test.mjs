import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
for(const name of ['index','race','puzzle','flick','parking','shift','squeeze']){const html=readFileSync(resolve(root,name+'.html'),'utf8');for(const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|#|data:)/.test(link))continue;assert.ok(existsSync(resolve(root,link)),`${name}: missing ${link}`)}if(name!=='index')assert.match(html,/href="\.\/"/,'game needs home link');}
const home=readFileSync(resolve(root,'index.html'),'utf8');for(const game of ['flick','shift','race','puzzle','parking'])assert.ok(home.includes(`href="${game}.html"`));assert.ok(!home.includes('city.html'));console.log('PASS: three-category home, four game links, local resources and return navigation');

assert.ok(home.includes('href="jiditie/"'));for(const name of ['index','race','puzzle','flick','city']){const page=readFileSync(resolve(root,name+'.html'),'utf8');assert.ok(!/href="squeeze[^"]*"/.test(page));assert.ok(page.includes('href="jiditie/"'));}
const entry=readFileSync(resolve(root,'../index.html'),'utf8');assert.match(entry,/url=traffic\//);assert.equal((home.match(/<article class="card /g)||[]).length,3);assert.match(home,/七点/);assert.match(home,/阿停/);assert.match(home,/小路/);assert.match(home,/小深/);for(const name of ['flick','race','puzzle'])assert.match(readFileSync(resolve(root,name+'.html'),'utf8'),/story-strip/);console.log('PASS: root entry and three-character story integration');
