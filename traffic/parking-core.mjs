export const CAR={length:64,width:30,wheelbase:42};
export const levels=[
 {name:'01 · 晚饭别洒',type:'倒车入库',tip:'先往右开，把车尾对准空位，再倒进去。车头朝上停稳。',start:{x:140,y:230,a:0},bay:{x:260,y:440,w:48,h:90,a:-Math.PI/2},obstacles:[{x:190,y:440,w:42,h:82},{x:330,y:440,w:42,h:82}],label:'海边停车场 · B 区'},
 {name:'02 · 就剩这一个',type:'侧方停车',tip:'沿右侧向前开，斜着倒入两辆车之间，再回正。车头朝上。',start:{x:300,y:420,a:-Math.PI/2},bay:{x:405,y:310,w:48,h:110,a:-Math.PI/2},obstacles:[{x:405,y:195,w:34,h:74},{x:405,y:425,w:34,h:74},{x:450,y:310,w:16,h:350}],label:'便利店门口 · 临时停车'},
 {name:'03 · 柱子不让路',type:'柱旁极限泊车',tip:'车位两侧被夹住，先在上方摆正。倒车时留意外摆的车头。',start:{x:130,y:230,a:0},bay:{x:330,y:435,w:40,h:82,a:-Math.PI/2},obstacles:[{x:270,y:435,w:54,h:88},{x:383,y:435,w:40,h:88},{x:291,y:365,w:18,h:18},{x:370,y:365,w:18,h:18},{x:330,y:495,w:158,h:16},{x:150,y:110,w:170,h:40}],label:'海边最后一个车位 · 小心车头'}
];
export function corners(c){const l=c.length??c.w??CAR.length,w=c.width??c.h??CAR.width,a=c.a??0;return [[-l/2,-w/2],[l/2,-w/2],[l/2,w/2],[-l/2,w/2]].map(([x,y])=>({x:c.x+x*Math.cos(a)-y*Math.sin(a),y:c.y+x*Math.sin(a)+y*Math.cos(a)}));}
export function overlap(a,b){const p=corners(a),q=corners(b);for(const poly of [p,q])for(let i=0;i<4;i++){const u=poly[i],v=poly[(i+1)%4],axis={x:-(v.y-u.y),y:v.x-u.x};const pp=p.map(t=>t.x*axis.x+t.y*axis.y),qq=q.map(t=>t.x*axis.x+t.y*axis.y);if(Math.max(...pp)<=Math.min(...qq)||Math.max(...qq)<=Math.min(...pp))return false;}return true;}
export function move(car,steer,drive,dt){const v=drive*65,angle=Math.max(-1,Math.min(1,steer))*.58,da=v/CAR.wheelbase*Math.tan(angle)*dt;return {...car,x:car.x+v*Math.cos(car.a+da/2)*dt,y:car.y+v*Math.sin(car.a+da/2)*dt,a:car.a+da};}
export function collision(car,level){if(corners(car).some(p=>p.x<20||p.x>500||p.y<65||p.y>530))return '场地边界';const i=level.obstacles.findIndex(o=>overlap(car,o));return i<0?null:level.obstacles[i].w<25?'立柱':'障碍车辆 / 路沿';}
export function parking(car,bay){const angle=Math.abs(Math.atan2(Math.sin(car.a-bay.a),Math.cos(car.a-bay.a)));const inside=corners(car).every(p=>Math.abs(p.x-bay.x)<=bay.w/2&&Math.abs(p.y-bay.y)<=bay.h/2);return {inside,angle,ready:inside&&angle<.09};}
