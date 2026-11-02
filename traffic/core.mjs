export const W=12,H=14;
export const key=(x,y)=>y*W+x;
export const water=k=>k%W===5&&Math.floor(k/W)>=3&&Math.floor(k/W)<=10;
export function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function hash(s){return [...s].reduce((h,c)=>Math.imul(h,31)+c.charCodeAt(0)|0,7)}
export function route(from,to,roads,blocked=new Set()){
 const queue=[from],prev=new Map([[from,null]]);
 for(let i=0;i<queue.length;i++){const n=queue[i];if(n===to){const out=[];for(let a=to;a!==null;a=prev.get(a))out.push(a);return out.reverse()}
 const x=n%W,y=Math.floor(n/W);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,k=key(xx,yy);if(xx<0||xx>=W||yy<0||yy>=H||prev.has(k)||blocked.has(k)&&k!==to||!roads.has(k)&&k!==to)continue;prev.set(k,n);queue.push(k)}}return null;
}
export const LEVELS=[
 {name:'第一关 · 接通就好',duration:60,quota:5,count:2,budget:28,interval:4,grace:10,congestion:.65,desc:'每个住宅送达5人；先学会连接同色站点。'},
 {name:'第二关 · 晚高峰',duration:90,quota:20,count:3,budget:38,interval:1.8,grace:7,congestion:1.2,desc:'每个住宅送达20人；三股车流，别把路都挤在一起。'},
 {name:'最终关 · 三轮换线',duration:120,quota:28,count:5,budget:34,interval:1,grace:5,congestion:1.2,desc:'三轮各40秒，每轮每处送达28人；换轮站点变色，暂停不可修路。'}
];
export function createGame(seed,mode='free',level=0){
 const random=rng(seed),flip=mode==='daily'&&random()>.5;const config=LEVELS[level];
 const pairs=[[[1,2],[4,5]],[[8,10],[10,3]],[[2,11],[8,6]],[[1,7],[4,1]],[[8,1],[10,12]]];
 const buildings=pairs.slice(0,config.count).flatMap((p,i)=>p.map(([x,y],j)=>({k:key(x,flip?13-y:y),color:i%3,home:j===0,active:true,unlock:0,queue:0,timer:5+i,over:0,delivered:0,roundDelivered:0})));
 return {seed,mode,level,config,random,wave:0,roads:new Set([key(5,7)]),buildings,cars:[],time:0,score:0,delivered:[0,0,0],ended:false,reason:'',rescued:false,bonus:false,credits:0,events:[],serial:0};
}
export function pathFor(g,b){let best=null;const blocked=new Set(g.buildings.filter(z=>z.active).map(z=>z.k));for(const d of g.buildings.filter(z=>z.active&&!z.home&&z.color===b.color)){const p=route(b.k,d.k,g.roads,blocked);if(p&&(!best||p.length<best.length))best=p}return best}
export function paint(g,k,erase=false){if(k<0||k>=W*H||g.buildings.some(b=>b.k===k))return false;if(erase)return g.roads.delete(k);if(g.roads.has(k))return false;if(g.roads.size>=g.config.budget)return false;if(water(k)&&[...g.roads].some(water))return false;g.roads.add(k);return true}
export function step(g,dt){if(g.ended)return;g.time+=dt;
 for(const b of g.buildings){if(!b.active&&g.time>=b.unlock){b.active=true;g.events.push('新街坊入住，记得接通道路')};if(!b.active||!b.home)continue;b.timer-=dt;if(b.timer<=0){b.queue++;b.timer+=g.config.interval}
 const p=pathFor(g,b);if(p&&b.queue>0&&!g.cars.some(c=>c.from===b.k&&c.progress<1.2)){b.queue--;g.cars.push({id:g.serial++,from:b.k,color:b.color,path:p,progress:0})}
 b.over=b.queue>=8?b.over+dt:Math.max(0,b.over-dt*2);if(b.over>=g.config.grace){g.ended=true;g.reason='blocked'} }
 const occupancy=new Map();for(const c of g.cars){const k=c.path[Math.min(c.path.length-1,Math.floor(c.progress)+1)];occupancy.set(k,(occupancy.get(k)||0)+1)}
 g.cars=g.cars.filter(c=>{if(c.path.slice(1,-1).some(k=>!g.roads.has(k))){const b=g.buildings.find(b=>b.k===c.from);b.queue++;return false}const n=c.path[Math.min(c.path.length-1,Math.floor(c.progress)+1)];c.progress+=dt*2.8/(1+Math.max(0,(occupancy.get(n)||1)-1)*g.config.congestion);if(c.progress>=c.path.length-1){g.score++;g.delivered[c.color]++;const home=g.buildings.find(b=>b.k===c.from);home.delivered++;home.roundDelivered++;return false}return true});
 const homes=g.buildings.filter(b=>b.home);
 if(g.level===2){
  const complete=homes.every(b=>b.roundDelivered>=g.config.quota);
  if(!g.ended&&g.wave===2&&complete){g.ended=true;g.reason='win'}
  if(!g.ended&&g.time>=(g.wave+1)*40){
   if(!complete){g.ended=true;g.reason='wave';g.failedHomes=homes.map((b,i)=>b.roundDelivered<g.config.quota?i+1:0).filter(Boolean)}
   else{
    g.wave++;
    // Vehicles between rounds return to their homes because destinations change.
    for(const car of g.cars)g.buildings.find(b=>b.k===car.from).queue++;
    g.cars=[];
    for(const b of g.buildings){if(b.home)b.roundDelivered=0;else b.color=(b.color+1)%3}
    g.events.push(`第${g.wave+1}轮！站点已换色，拆旧路、接新站；在途乘客返回住宅。`);
   }
  }
 }else if(!g.ended&&homes.every(b=>b.delivered>=g.config.quota)){g.ended=true;g.reason='win'}
 if(!g.ended&&g.time>=g.config.duration){g.time=g.config.duration;g.ended=true;g.reason='timeout'}
}
export function rescue(g){if(g.mode==='daily'||g.rescued||g.reason!=='blocked')return false;g.rescued=true;g.ended=false;g.reason='';for(const b of g.buildings){b.queue=0;b.over=0;b.timer=6}g.cars=[];return true}
