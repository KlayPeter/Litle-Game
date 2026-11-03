export function joystickVector(x:number,y:number,radius:number){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(radius)||radius<=0)return{x:0,y:0};
 const length=Math.hypot(x,y);
 if(length<radius*.08)return{x:0,y:0};
 const divisor=Math.max(radius,length);
 return{x:x/divisor,y:y/divisor};
}
