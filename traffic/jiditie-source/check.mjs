import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const source=readFileSync(new URL('./src/main.ts',import.meta.url),'utf8');
const stations=JSON.parse(source.match(/const stationNames=(\[.*?\])/)[1]);
const mechanics=JSON.parse(source.match(/const mechanisms=(\[.*?\])/)[1]);
assert.equal(stations.length,30);assert.equal(mechanics.length,30);assert.equal(new Set(stations).size,30);assert.equal(stations[0],'罗湖');assert.equal(stations.at(-1),'机场东');assert.ok(!/广州|3号线|34 站|line3-save/.test(source));assert.ok(source.includes('href="../"'));
const built=readFileSync(new URL('../jiditie/index.html',import.meta.url),'utf8');for(const [,path] of built.matchAll(/(?:src|href)="(\.\/assets\/[^\"]+)"/g))assert.ok(existsSync(new URL('../jiditie/'+path,import.meta.url)));console.log('PASS: Shenzhen station data, localization, isolated save key, home link and built assets');
