import {newFlick,fire,tickFlick,parkedCount} from './flick-core.mjs';
export const ORDERS=[
 {title:'晚饭别凉了',place:'公司楼下',message:'先帮阿停停好两辆，再决定要不要接加急单。',level:0},
 {title:'借一点弹力',place:'商场停车场',message:'青色弹簧桩可以借力。保底拿到手，还冲吗？',level:1},
 {title:'海边最后一单',place:'海边餐厅',message:'留意车与车的碰撞。漂亮的双停还能多一发。',level:2}
];
export function newShift(seed=1){
 if(!Number.isSafeInteger(seed)||seed<1)throw new RangeError('seed must be a positive safe integer');
 return {seed,order:0,bank:0,history:[],phase:'play',risk:false,game:newFlick(seed,0)};
}
export function shootShift(s,id,vx,vy){return s.phase==='play'&&s.game.shots>0?fire(s.game,id,vx,vy):false;}
function settleOrder(s,kind){
 const count=parkedCount(s.game),comboBonus=kind!=='miss'&&s.game.bestCombo>=2?50:0;
 const earned=(kind==='full'?500:kind==='safe'?200:0)+comboBonus;
 s.bank+=earned;s.history.push({kind,earned,parked:count,combo:s.game.bestCombo,shots:s.game.shots});s.phase='result';
}
export function tickShift(s,dt){
 if(s.phase!=='play'||!Number.isFinite(dt)||dt<=0||dt>1/30)return;
 const moving=s.game.phase==='move';tickFlick(s.game,dt);
 if(!moving||s.game.phase==='move')return;
 const count=parkedCount(s.game);
 if(count===4)settleOrder(s,'full');
 else if(count>=2&&!s.risk)s.phase='offer';
 else if(s.game.phase==='end')settleOrder(s,'miss');
}
export function collect(s){if(s.phase!=='offer')return false;settleOrder(s,'safe');return true;}
export function riskOrder(s){if(s.phase!=='offer'||s.game.shots<=0)return false;s.risk=true;s.phase='play';return true;}
export function nextOrder(s){
 if(s.phase!=='result')return false;
 if(s.order===ORDERS.length-1){s.phase='complete';return true;}
 s.order++;s.risk=false;s.game=newFlick(s.seed,ORDERS[s.order].level);s.phase='play';return true;
}
