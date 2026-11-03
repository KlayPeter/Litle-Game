export function newActions(){return {civil:100,charges:3,pullCooldown:0,dashCooldown:0,dashLeft:0,quiet:0,adUsed:false}}
export type Actions=ReturnType<typeof newActions>;
export function advanceActions(a:Actions,dt:number){
 if(!Number.isFinite(dt)||dt<=0||dt>.05)return;
 a.pullCooldown=Math.max(0,a.pullCooldown-dt);a.dashCooldown=Math.max(0,a.dashCooldown-dt);a.dashLeft=Math.max(0,a.dashLeft-dt);a.quiet+=dt;
 if(a.quiet>3&&a.civil>0)a.civil=Math.min(100,a.civil+dt*2);
}
export function pullBlocked(a:Actions,stamina:number){return a.civil<=0?'文明度已耗尽':a.charges<=0?'本班扒拉次数用完':a.pullCooldown>0?'扒拉冷却中':stamina<24?'体力不足，需要 24 点':''}
export function usePull(a:Actions,stamina:number,exiting:number,elders:number){
 if(pullBlocked(a,stamina))return false;
 a.charges--;a.pullCooldown=1.8;a.quiet=0;a.civil=Math.max(0,a.civil-20-exiting*8-elders*12);return true;
}
export function useDash(a:Actions,stamina:number){if(a.dashCooldown>0||stamina<22||a.civil<=0)return false;a.dashCooldown=2.6;a.dashLeft=.32;return true}
export function rewardAd(a:Actions){if(a.adUsed||a.civil<=0)return false;a.adUsed=true;a.charges++;return true}
// A body must pass through the physical doorway, including after crowd collision.
export function constrainBody(p:{x:number;y:number;vx:number;vy:number;r:number},wasInside:boolean,open:boolean,door:number,width:number,bottom:number){
 p.x=Math.max(p.r,Math.min(width-p.r,p.x));p.y=Math.max(48,Math.min(bottom,p.y));
 const gap=Math.abs(p.x-door)<=66-p.r;
 if(!open){p.y=Math.max(265,p.y);return false;}
 if(wasInside&&p.y>230&&!gap){p.y=230-p.r;p.vy=Math.min(0,p.vy);}
 if(!wasInside&&p.y<230&&!gap){p.y=230+p.r;p.vy=Math.max(0,p.vy);}
 return gap?p.y<230:wasInside;
}
