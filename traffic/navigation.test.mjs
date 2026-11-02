import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
for(const name of ['index','race','puzzle','flick','squeeze']){const html=readFileSync(resolve(root,name+'.html'),'utf8');for(const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|#|data:)/.test(link))continue;assert.ok(existsSync(resolve(root,link)),`${name}: missing ${link}`)}if(name!=='index')assert.match(html,/href="\.\/"/,'game needs home link');}
const home=readFileSync(resolve(root,'index.html'),'utf8');for(const game of ['flick','race','puzzle'])assert.ok(home.includes(`href="${game}.html"`));assert.ok(!home.includes('city.html'));console.log('PASS: three-category home, four game links, local resources and return navigation');

assert.ok(home.includes('href="jiditie/"'));for(const name of ['index','race','puzzle','flick','city']){const page=readFileSync(resolve(root,name+'.html'),'utf8');assert.ok(!/href="squeeze[^"]*"/.test(page));assert.ok(page.includes('href="jiditie/"'));}
