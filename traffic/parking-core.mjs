export const CAR={length:64,width:30,wheelbase:42};
export const SUV={length:76,width:34,wheelbase:51};
export const levels=[
 {name:'01 · 晚饭别洒',type:'倒车入库',tip:'先往右开，把车尾对准空位，再倒进去。车头朝上停稳。',start:{x:140,y:230,a:0},bay:{x:260,y:440,w:48,h:90,a:-Math.PI/2},obstacles:[{x:190,y:440,w:42,h:82},{x:330,y:440,w:42,h:82}],label:'海边停车场 · B 区'},
 {name:'02 · 就剩这一个',type:'侧方停车',tip:'沿右侧向前开，斜着倒入两辆车之间，再回正。车头朝上。',start:{x:300,y:420,a:-Math.PI/2},bay:{x:405,y:310,w:48,h:110,a:-Math.PI/2},obstacles:[{x:405,y:195,w:34,h:74},{x:405,y:425,w:34,h:74},{x:450,y:310,w:16,h:350}],label:'便利店门口 · 临时停车'},
 {name:'03 · 柱子不让路',type:'柱旁极限泊车',tip:'车位两侧被夹住，先在上方摆正。倒车时留意外摆的车头。',start:{x:130,y:230,a:0},bay:{x:330,y:435,w:40,h:82,a:-Math.PI/2},obstacles:[{x:270,y:435,w:54,h:88},{x:383,y:435,w:40,h:88},{x:291,y:365,w:18,h:18},{x:370,y:365,w:18,h:18},{x:330,y:495,w:158,h:16},{x:150,y:110,w:170,h:40}],label:'海边最后一个车位 · 小心车头'},
 {name:'04 · 横着也得停',type:'横向车库',tip:'车头朝右，先在左侧转正，再向前进入横向车位。',start:{x:145,y:420,a:-Math.PI/2},bay:{x:390,y:200,w:44,h:90,a:0},obstacles:[{x:390,y:145,w:105,h:30},{x:390,y:255,w:105,h:30},{x:455,y:200,w:14,h:135}],label:'朋友家楼下 · 横向车库'},
 {name:'05 · 借来的大车',type:'SUV 倒车入库',tip:'大车的轴距更长，转弯半径更大。先在空地摆正，再倒入。',vehicle:SUV,start:{x:135,y:215,a:0},bay:{x:320,y:430,w:48,h:96,a:-Math.PI/2},obstacles:[{x:250,y:435,w:48,h:95},{x:390,y:435,w:48,h:95},{x:320,y:500,w:190,h:12}],label:'海边停车场 · 大车位'},
 {name:'06 · 最后一把',type:'斜角窄库',tip:'车头对准箭头，沿斜角倒入。两侧余量很小，慢速修正。',start:{x:125,y:190,a:0},bay:{x:340,y:395,w:40,h:84,a:-Math.PI/3},obstacles:[{x:288,y:365,w:80,h:30,a:-Math.PI/3},{x:392,y:425,w:80,h:30,a:-Math.PI/3},{x:385,y:475,w:140,h:14},{x:145,y:385,w:90,h:42}],label:'海边餐厅 · 留给阿停的最后一个位置'}
];
export function corners(c){const l=c.length??c.w??CAR.length,w=c.width??c.h??CAR.width,a=c.a??0;return [[-l/2,-w/2],[l/2,-w/2],[l/2,w/2],[-l/2,w/2]].map(([x,y])=>({x:c.x+x*Math.cos(a)-y*Math.sin(a),y:c.y+x*Math.sin(a)+y*Math.cos(a)}));}
export function overlap(a,b){const p=corners(a),q=corners(b);for(const poly of [p,q])for(let i=0;i<4;i++){const u=poly[i],v=poly[(i+1)%4],axis={x:-(v.y-u.y),y:v.x-u.x};const pp=p.map(t=>t.x*axis.x+t.y*axis.y),qq=q.map(t=>t.x*axis.x+t.y*axis.y);if(Math.max(...pp)<=Math.min(...qq)||Math.max(...qq)<=Math.min(...pp))return false;}return true;}
export function move(car,steer,drive,dt){const v=drive*65,angle=Math.max(-1,Math.min(1,steer))*.58,da=v/(car.wheelbase??CAR.wheelbase)*Math.tan(angle)*dt;return {...car,x:car.x+v*Math.cos(car.a+da/2)*dt,y:car.y+v*Math.sin(car.a+da/2)*dt,a:car.a+da};}
export function collision(car,level){if(corners(car).some(p=>p.x<20||p.x>500||p.y<65||p.y>530))return '场地边界';const i=level.obstacles.findIndex(o=>overlap(car,o));return i<0?null:level.obstacles[i].w<25?'立柱':'障碍车辆 / 路沿';}
export function parking(car,bay){
 const angle=Math.abs(Math.atan2(Math.sin(car.a-bay.a),Math.cos(car.a-bay.a)));
 const inside=corners(car).every(p=>{const dx=p.x-bay.x,dy=p.y-bay.y;return Math.abs(dx*Math.cos(bay.a)+dy*Math.sin(bay.a))<=bay.h/2&&Math.abs(-dx*Math.sin(bay.a)+dy*Math.cos(bay.a))<=bay.w/2;});
 const offset=Math.hypot(car.x-bay.x,car.y-bay.y);
 return {inside,angle,offset,ready:inside&&angle<.09};
}
export function rating({hits,shifts,assisted,offset}){return hits?1:!assisted&&shifts<=4&&offset<=6?3:2;}
export function advance(car,steer,drive,dt){
 const target=drive*(drive<0?42:62),speed=car.speed??0;
 const rate=drive&&Math.sign(speed)!==-drive?85:240;
 const nextSpeed=speed+Math.sign(target-speed)*Math.min(Math.abs(target-speed),rate*dt);
 return {...move(car,steer,nextSpeed/65,dt),speed:nextSpeed};
}
function pointSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
export function clearance(car,level){
 const p=corners(car);let distance=Math.min(...p.flatMap(v=>[v.x-20,500-v.x,v.y-65,530-v.y]));
 for(const o of level.obstacles){if(overlap(car,o))return 0;const q=corners(o);for(let i=0;i<4;i++)for(let j=0;j<4;j++)distance=Math.min(distance,pointSegment(p[i],q[j],q[(j+1)%4]),pointSegment(q[i],p[j],p[(j+1)%4]));}
 return Math.max(0,distance);
}
