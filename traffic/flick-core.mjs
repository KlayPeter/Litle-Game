export const WIDTH=540,HEIGHT=680,RADIUS=17;
export const BAYS=[{x:78,y:130},{x:205,y:90},{x:335,y:90},{x:462,y:130}];
export const POSTS=[{x:155,y:315,r:22},{x:385,y:315,r:22}];
export const FLICK_MAPS=[
 {name:'老街停车场',tip:'熟悉力度，借黄桩和墙壁调整角度。',bays:BAYS,posts:POSTS,points:[[90,548],[180,488],[270,550],[360,488],[450,548]]},
 {name:'弹簧游乐场',tip:'青色弹簧桩会加力反弹，每辆车每发可触发一次。',bays:BAYS,posts:[...POSTS,{x:270,y:340,r:25,spring:true}],points:[[85,550],[185,500],[270,555],[355,500],[455,550]]},
 {name:'连停练习场',tip:'前后两辆车适合擦边碰撞，试试一发把它们送向两侧。',bays:[{x:145,y:210},{x:415,y:130},{x:80,y:80},{x:450,y:300}],posts:[{x:100,y:330,r:18},{x:440,y:410,r:18}],points:[[270,450],[290,300],[80,540],[430,540],[160,500]]}
];
export function newFlick(seed=1,level=0){let n=seed|0;const random=()=>{n=Math.imul(n,1664525)+1013904223|0;return(n>>>0)/4294967296};const layout=FLICK_MAPS[level]||FLICK_MAPS[0];return {seed,level:FLICK_MAPS.indexOf(layout),layout,phase:'aim',shots:5,cars:layout.points.map(([x,y],id)=>({id,x:x+(random()-.5)*24,y:y+(random()-.5)*30,vx:0,vy:0,angle:-Math.PI/2,parked:-1})),settled:0,combo:0,bestCombo:0,shotParks:[],startedParked:[],springUsed:[],bonusGiven:false,events:[],time:0,won:false}}

export const parkedCount=g=>g.cars.filter(c=>c.parked>=0).length;
export function fire(g,id,vx,vy){if(g.phase!=='aim'||!Number.isInteger(id)||!g.cars[id]||!Number.isFinite(vx)||!Number.isFinite(vy)||Math.hypot(vx,vy)<20)return false;g.startedParked=g.cars.filter(c=>c.parked>=0).map(c=>c.id);const c=g.cars[id],scale=Math.min(1,850/Math.hypot(vx,vy));c.vx=vx*scale;c.vy=vy*scale;c.parked=-1;g.shots--;g.phase='move';g.settled=0;g.combo=0;g.shotParks=[];g.springUsed=[];g.events=[];return true}
export function collide(a,b){const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),min=RADIUS*2;if(dist>=min)return false;const nx=dist>0?dx/dist:1,ny=dist>0?dy/dist:0,over=min-dist;a.x-=nx*over/2;a.y-=ny*over/2;b.x+=nx*over/2;b.y+=ny*over/2;const speed=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(speed>0){const impulse=.92*speed;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;return speed>25}return false}
export function tickFlick(g,dt){
 if(g.phase!=='move')return;g.time+=dt;const drag=Math.exp(-1.25*dt);
 for(const c of g.cars){
  c.vx*=drag;c.vy*=drag;c.x+=c.vx*dt;c.y+=c.vy*dt;
  for(const [axis,vaxis,limit] of [['x','vx',WIDTH],['y','vy',HEIGHT]])if(c[axis]<RADIUS||c[axis]>limit-RADIUS){c[axis]=Math.max(RADIUS,Math.min(limit-RADIUS,c[axis]));c[vaxis]*=-.76;g.events.push({type:'hit',x:c.x,y:c.y,power:Math.abs(c[vaxis])})}
  for(const p of g.layout.posts){const dx=c.x-p.x,dy=c.y-p.y,d=Math.hypot(dx,dy),min=p.r+RADIUS;if(d<min){const nx=d?dx/d:1,ny=d?dy/d:0;c.x=p.x+nx*min;c.y=p.y+ny*min;const v=c.vx*nx+c.vy*ny;if(v<0){const boost=p.spring&&!g.springUsed.includes(c.id);const bounce=boost?2.15:1.8;c.vx-=bounce*v*nx;c.vy-=bounce*v*ny;if(boost){g.springUsed.push(c.id);g.events.push({type:'spring',x:c.x,y:c.y});const speed=Math.hypot(c.vx,c.vy);if(speed>950){c.vx*=950/speed;c.vy*=950/speed}}if(v< -25)g.events.push({type:'hit',x:c.x,y:c.y,power:-v})}}}
 }
 for(let i=0;i<g.cars.length;i++)for(let j=i+1;j<g.cars.length;j++)if(collide(g.cars[i],g.cars[j]))g.events.push({type:'hit',x:(g.cars[i].x+g.cars[j].x)/2,y:(g.cars[i].y+g.cars[j].y)/2,power:100});
 for(const c of g.cars){
  const speed=Math.hypot(c.vx,c.vy);if(speed>12)c.angle=Math.atan2(c.vy,c.vx);
  if(c.parked>=0&&(speed>18||Math.hypot(c.x-g.layout.bays[c.parked].x,c.y-g.layout.bays[c.parked].y)>10)){g.events.push({type:'out',x:c.x,y:c.y});c.parked=-1}
  const bay=g.layout.bays.findIndex((b,i)=>!g.cars.some(z=>z!==c&&z.parked===i)&&Math.hypot(c.x-b.x,c.y-b.y)<29);
  if(c.parked<0&&bay>=0&&speed<95){c.parked=bay;c.x=g.layout.bays[bay].x;c.y=g.layout.bays[bay].y;c.vx=0;c.vy=0;c.angle=-Math.PI/2;if(!g.shotParks.includes(c.id)&&!g.startedParked.includes(c.id)){g.shotParks.push(c.id);g.combo++;g.bestCombo=Math.max(g.bestCombo,g.combo)}g.events.push({type:'park',x:c.x,y:c.y,combo:g.combo})}
  if(Math.hypot(c.vx,c.vy)<6){c.vx=0;c.vy=0}
 }
 if(g.cars.every(c=>c.vx===0&&c.vy===0))g.settled+=dt;else g.settled=0;
 if(g.settled>.3){if(!g.bonusGiven&&g.shotParks.filter(id=>g.cars[id].parked>=0).length>=2){g.shots++;g.bonusGiven=true;g.events.push({type:'bonus'})}g.won=parkedCount(g)===g.layout.bays.length;g.phase=g.won||g.shots<=0?'end':'aim';g.events.push({type:g.phase==='end'?'end':'ready'})}
}
