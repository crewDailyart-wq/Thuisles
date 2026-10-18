// @ts-nocheck
/**
 * Zappie in 3D: model laden, gebaren en feedback (16 oktober 2026).
 *
 * Overgenomen uit het pakket "Zappie 3D — Blender-editie 02" van de eigenaar
 * (zappie.js). Alleen de imports zijn aangepast: Three.js komt uit het
 * project zelf (0.186.1, dezelfde versie als in het pakket) en het model staat
 * in public/assets/zappie/3d/zappie.glb. Het Blender-bestand en de studio staan
 * niet in de repo.
 */
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

export const ACTIONS={idle:'Rust',drive:'Rijden',reverse:'Achteruit',turn:'Rondje draaien',wave:'Zwaaien',point:'Wijzen',talk:'Praten',think:'Nadenken',celebrate:'Juichen',correct:'Goed antwoord',incorrect:'Nog eens proberen',wobble:'Klunzig wiebelen',nod:'Knikken',sleep:'Slapen',greet:'Begroeten',listen:'Luisteren',surprise:'Verrast',bow:'Bedanken'};
Object.assign(ACTIONS,{stop:'Klunzig afremmen',checkTail:'Stekker controleren'});
export const DURATIONS={wave:3,point:3,talk:4,think:4,celebrate:3,correct:3,incorrect:2.5,wobble:3,nod:2,greet:3,listen:4,surprise:2,bow:2.5,turn:4,drive:3,reverse:3,idle:4,sleep:4,stop:1.6,checkTail:2.8};
export const JOINTS=['Rig','Torso','Head','ArmLeft','ArmRight','ElbowLeft','ElbowRight','HandLeft','HandRight','AntennaLeft','AntennaRight','TailRoot',...Array.from({length:6},(_,i)=>'Tail'+(i+1)),...['Left','Right'].flatMap(s=>Array.from({length:4},(_,i)=>'Finger'+s+i)), 'SpeechWave'];

export async function loadZappie(url='/assets/zappie/3d/zappie.glb') {
  const gltf=await new GLTFLoader().loadAsync(url);return prepareZappie(gltf.scene);
}
JOINTS.push('Cap');
export function waveMood(action,t,reducedMotion=false,speechLevel=null){
  const modes={think:[.16,1.4,'#b2caff'],listen:[.12,1.9,'#7ddfff'],sleep:[.045,.7,'#6ba9dc'],celebrate:[.8,13,'#bbfff0'],correct:[.8,13,'#bbfff0'],incorrect:[.27,3,'#ffd3df'],surprise:[.8,9,'#fff0a0'],talk:[.65,11,'#b1faff'],drive:[.4,7,'#64edff'],reverse:[.4,7,'#64edff']};
  const [energy,rate,color]=modes[action]||[.2,3,'#80edff'];
  return {amplitude:action==='talk'&&speechLevel!==null?.08+.85*T.MathUtils.clamp(speechLevel,0,1):energy*(reducedMotion?.6:.45+.55*Math.abs(Math.sin(t*rate)*Math.cos(t*rate*.37))),rate,color};
}
export function prepareZappie(scene){
  const root=scene.getObjectByName('Zappie');if(!root)throw new Error('Zappie model missing');
  // Remove the wrapper without changing local axis conventions produced by glTF.
  const parts={};for(const name of [...JOINTS,'WheelLeft','WheelRight','Plug']){parts[name]=scene.getObjectByName(name);if(!parts[name])throw new Error('Missing joint '+name);}
  let screen,wave;
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material.name==='Zappie_Screen'){o.material=o.material.clone();screen=o;}if(o.material.name==='Zappie_Wave'){o.material=o.material.clone();wave=o;} }});
  if(!screen||!wave)throw new Error('Missing display');
  root.traverse(o=>{if(o.isMesh&&o.material.name==='Zappie_Pearl'){o.material.roughness=.24;if('clearcoat'in o.material){o.material.clearcoat=.65;o.material.clearcoatRoughness=.24;}}});
  return {root,parts,screen,wave,rest:Object.fromEntries(Object.entries(parts).map(([name,o])=>[name,{q:o.quaternion.clone(),p:o.position.clone(),s:o.scale.clone()}]))};
}

// All gestures stay in a restricted outward arm envelope. No reach through the monitor.
export function samplePose(action,t,{speed=0,turnRate=0,acceleration=0,speechLevel=null,reducedMotion=false}={}) {
  const p={};const rot=(n,x=0,y=0,z=0)=>p[n]={r:[x,y,z]};
  rot('ArmLeft',0,0,.26);rot('ArmRight',0,0,-.26);
  rot('ElbowLeft',0,0,-.18);rot('ElbowRight',0,0,.18);
  rot('Head',0,0,reducedMotion?0:Math.sin(t*1.4)*.022);
  rot('Torso',Math.max(-.07,Math.min(.07,-acceleration*.008)),0,Math.max(-.06,Math.min(.06,-turnRate*.012)));
  if(action==='idle'&&!reducedMotion){
    const breath=Math.sin(t*Math.PI/2),sway=Math.sin(t*Math.PI);
    rot('Torso',breath*.035,0,sway*.035);p.Torso.dy=breath*.025;
    rot('Head',Math.sin(t*Math.PI)*.055,breath*.16,-sway*.075);
    rot('ArmLeft',breath*.04,0,.26-sway*.02);rot('ArmRight',-breath*.04,0,-.26-sway*.02);
    rot('ElbowLeft',0,0,-.18-Math.sin(t*Math.PI/2+.4)*.035);
    rot('ElbowRight',0,0,.18+Math.sin(t*Math.PI/2+.4)*.035);
    rot('HandLeft',breath*.045);rot('HandRight',-breath*.045);
  }
  if(action==='drive'||action==='reverse'){
    const direction=action==='reverse'?-1:1;
    const bounce=Math.sin(t*Math.PI*4),sway=Math.sin(t*Math.PI*2);
    const lean=reducedMotion?0:direction*(.17+.065*Math.min(Math.abs(speed)/7,1))+Math.max(-.10,Math.min(.10,acceleration*.004))+bounce*.028;
    rot('Torso',lean,0,reducedMotion?0:sway*.065+Math.max(-.08,Math.min(.08,-turnRate*.012)));
    p.Torso.dy=reducedMotion?0:bounce*.045;
    rot('Head',reducedMotion?0:-lean*.35-bounce*.035,reducedMotion?0:sway*.06,reducedMotion?0:-sway*.075);
    rot('ArmLeft',reducedMotion?0:-.12+bounce*.11,0,-.31-(reducedMotion?0:sway*.09));
    rot('ArmRight',reducedMotion?0:-.12-bounce*.11,0,.31-(reducedMotion?0:sway*.09));
    rot('ElbowLeft',0,0,-.12-(reducedMotion?0:bounce*.08));rot('ElbowRight',0,0,.12+(reducedMotion?0:bounce*.08));
  }
  let amplitude=.08+(reducedMotion?0:.04*(1+Math.sin(t*3)));
  if(action==='wave'||action==='greet'){rot('ArmRight',0,0,.95);rot('ElbowRight',0,0,1.1+Math.sin(t*6)*.13);rot('HandRight',0,0,1.0+Math.sin(t*6)*.1);}
  if(action==='point'){rot('ArmRight',0,0,.88);rot('ElbowRight',0,0,.13);rot('Head',0,-.12,0);for(let i=0;i<4;i++)if(i!==1)rot('FingerRight'+i,-1.15);}
  if(action==='think'){rot('Head',.07,-.12,.11);rot('ArmLeft',0,0,-.8);rot('ElbowLeft',0,0,-.70);}
  if(action==='celebrate'||action==='correct'){
    rot('ArmLeft',0,0,-.95);rot('ArmRight',0,0,.95);rot('ElbowLeft',0,0,-.9);rot('ElbowRight',0,0,.9);
    p.Torso.dy=reducedMotion?0:Math.pow(Math.sin(t*4),2)*.045;
  }
  if(action==='wobble'){rot('Head',0,0,-Math.sin(t*4)*.07);rot('Torso',0,0,Math.sin(t*4)*.055);rot('ArmLeft',0,0,-.72);rot('ArmRight',0,0,.72);}
  if(action==='nod'||action==='incorrect')rot('Head',Math.sin(t*3)*.10,0,0);
  if(action==='sleep'){rot('Head',.12);amplitude=.035;}
  if(action==='listen'){rot('Head',0,.1,.07);amplitude=.11;}
  if(action==='surprise'){rot('Head',-.09);rot('ArmLeft',0,0,-.6);rot('ArmRight',0,0,.6);amplitude=.5;}
  if(action==='bow'){rot('Torso',Math.sin(Math.min(t/2.5,1)*Math.PI)*.14);rot('Head',.08);}
  if(action==='talk')amplitude=speechLevel===null?.22+.65*Math.abs(Math.sin(t*9)*Math.cos(t*4)):.08+.85*T.MathUtils.clamp(speechLevel,0,1);
  amplitude=waveMood(action,t,reducedMotion,speechLevel).amplitude;
  p.SpeechWave={s:[1,amplitude,1]};
  const driving=action==='drive'||action==='reverse';
  for(const [i,name] of ['AntennaLeft','AntennaRight'].entries())rot(name,reducedMotion?0:Math.sin(t*(driving?11:2)+i)*(driving?.045:.025),0,reducedMotion?0:Math.sin(t*(driving?9:3)+i)*(driving?.07:.055));
  const sway=reducedMotion?0:Math.sin(t*3)*.022+Math.max(-.10,Math.min(.10,-turnRate*.022));
  rot('TailRoot',Math.max(-.08,Math.min(.08,-acceleration*.012)),sway,0);
  for(let i=1;i<=6;i++)rot('Tail'+i,0,reducedMotion?0:Math.sin(t*(driving?7:3)-i*.65)*(driving?.045:.03)+Math.max(-.055,Math.min(.055,-turnRate*.012)),0);
  if(action==='stop'&&!reducedMotion){
    const u=Math.min(t,DURATIONS.stop),recoil=Math.exp(-3.2*u)*Math.cos(10*u),after=Math.exp(-3*u)*Math.sin(12*u);
    rot('Torso',-.24*recoil,0,.04*after);p.Torso.dy=-.025*Math.abs(recoil);
    rot('Head',.11*recoil,0,-.035*after);rot('Cap',.10*after,0,.07*after);
    rot('ArmLeft',-.12*recoil,0,.18);rot('ArmRight',-.12*recoil,0,-.18);
    for(const name of ['AntennaLeft','AntennaRight'])rot(name,.14*after,0,.08*after);
  }
  if(action==='checkTail'&&!reducedMotion){const look=Math.sin(Math.PI*Math.min(t/DURATIONS.checkTail,1))**2;rot('Head',.09*look,-1.45*look,-.06*look);p.Torso.r[1]=-.23*look;}
  if(action==='talk'){p.Head.s=[1.4,1.4,1.4];p.Head.dy=.20;}
  p.Torso.dy=(p.Torso.dy||0)+.075;
  return p;
}
function createTalkDisplay(){
  let pages=[];
  return {text:'',set(text){pages=[];let page='';for(const word of String(text).trim().split(/\s+/)){if(page.length+word.length>160){pages.push(page);page='';}page+=(page?' ':'')+word;}if(page)pages.push(page);this.text=pages[0]||'';},
    draw(time){this.text=pages[Math.min(pages.length-1,Math.floor(time/7))]||'';},
    get duration(){return Math.max(4,pages.length*7);}};
}
export function createSpeechBubble(container){
  const bubble=document.createElement('div');bubble.hidden=true;bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');
  Object.assign(bubble.style,{position:'absolute',width:'min(280px, calc(100vw - 32px))',boxSizing:'border-box',padding:'16px 18px',border:'2px solid #74e5ff',borderRadius:'22px',background:'linear-gradient(145deg,#103b68,#061c38)',boxShadow:'0 0 18px #36c8ff66, inset 0 0 12px #36c8ff22',color:'#eaffff',fontFamily:'Consolas, "Courier New", monospace',fontSize:'16px',fontWeight:'600',lineHeight:'1.5',overflowWrap:'anywhere',pointerEvents:'none',zIndex:'1001'});
  const text=document.createElement('span');bubble.append(text);
  const tip=document.createElement('span');Object.assign(tip.style,{position:'absolute',bottom:'-8px',left:'50%',width:'13px',height:'13px',transform:'rotate(45deg)',background:'#082440',borderRight:'2px solid #74e5ff',borderBottom:'2px solid #74e5ff'});bubble.append(tip);container.append(bubble);
  return {element:bubble,update(controller){bubble.hidden=controller.action!=='talk';const value=controller.talkDisplay.text;if(text.textContent!==value)text.textContent=value;},dispose(){bubble.remove();}};
}
const tempQ=new T.Quaternion(),tempE=new T.Euler();
export function applyPose(model,pose,blend=1){
  for(const name of JOINTS){const o=model.parts[name],rest=model.rest[name],v=pose[name]||{};
    tempE.set(...(v.r||[0,0,0]));tempQ.setFromEuler(tempE).premultiply(rest.q);o.quaternion.slerp(tempQ,blend);
    const targetY=rest.p.y+(v.dy||0);o.position.y=T.MathUtils.lerp(o.position.y,targetY,blend);
    const sc=v.s||[1,1,1];o.scale.x=T.MathUtils.lerp(o.scale.x,rest.s.x*sc[0],blend);o.scale.y=T.MathUtils.lerp(o.scale.y,rest.s.y*sc[1],blend);o.scale.z=T.MathUtils.lerp(o.scale.z,rest.s.z*sc[2],blend);
  }
}
export class ZappieController {
  constructor(model,{reducedMotion=false,onAction=()=>{}}={}) {this.model=model;this.action='idle';this.time=0;this.duration=Infinity;this.feedback='neutral';this.feedbackTime=0;this.speechLevel=null;this.reducedMotion=reducedMotion;this.onAction=onAction;this.wheelL=0;this.wheelR=0;this.paused=false;this.feedbackColor=new T.Color();this.feedbackEmission=new T.Color();this.talkDisplay=createTalkDisplay(model);this.setTalkText('Hoi! Ik ben Bliepo.');}
  setTalkText(text){this.talkDisplay?.set(text);}
  showText(text){this.setTalkText(text);this.play('talk');this.duration=this.talkDisplay?.duration||4;}
  play(action,{loop=false}={}){if(!ACTIONS[action])throw new Error('Unknown action '+action);this.action=action;this.time=0;this.duration=loop||['idle','sleep','drive','reverse'].includes(action)?Infinity:DURATIONS[action];if(action==='correct'||action==='incorrect')this.setFeedback(action,DURATIONS[action]);this.onAction(action);}
  setFeedback(result='neutral',duration=3){if(!['neutral','correct','incorrect'].includes(result))throw new Error('Unknown feedback');this.feedback=result;this.feedbackTime=result==='neutral'?0:Math.max(0,duration);}
  setSpeechLevel(level){this.speechLevel=level===null?null:T.MathUtils.clamp(Number(level)||0,0,1);}
  update(dt,motion={}){
    if(this.paused)return;dt=T.MathUtils.clamp(dt,0,.05);this.time+=dt;
    if(this.time>this.duration){this.play('idle');}
    this.feedbackTime=Math.max(0,this.feedbackTime-dt);if(this.feedbackTime===0)this.feedback='neutral';
    const pose=samplePose(this.action,this.time,{...motion,speechLevel:this.speechLevel,reducedMotion:this.reducedMotion});
    this.tailYaw??=0;this.tailVelocity??=0;const target=this.reducedMotion?0:T.MathUtils.clamp(-(motion.turnRate||0)*.08,-.48,.48);
    this.tailVelocity+=((target-this.tailYaw)*45-this.tailVelocity*10)*dt;this.tailYaw=T.MathUtils.clamp(this.tailYaw+this.tailVelocity*dt,-.55,.55);
    pose.TailRoot.r[1]+=this.reducedMotion?0:this.tailYaw;
    applyPose(this.model,pose,1-Math.exp(-12*dt));
    this.model.wave.visible=true;if(this.action==='talk')this.talkDisplay.draw(this.time);
    this.wheelL+=((motion.distance||0)+(motion.turn||0)*.85)/.48;this.wheelR+=((motion.distance||0)-(motion.turn||0)*.85)/.48;
    for(const [name,angle] of [['WheelLeft',this.wheelL],['WheelRight',this.wheelR]])this.model.parts[name].quaternion.copy(this.model.rest[name].q).multiply(tempQ.setFromAxisAngle(new T.Vector3(1,0,0),angle));
    const colors={neutral:['#061a36','#061a36',.12],correct:['#087d3c','#25de70',.6],incorrect:['#a21a32','#f32c4c',.55]};const [color,emission,intensity]=colors[this.feedback];
    const mat=this.model.screen.material;mat.color.lerp(this.feedbackColor.set(color),1-Math.exp(-14*dt));mat.emissive.lerp(this.feedbackEmission.set(emission),1-Math.exp(-14*dt));mat.emissiveIntensity=T.MathUtils.lerp(mat.emissiveIntensity,intensity,1-Math.exp(-14*dt));
    const mood=waveMood(this.feedback==='neutral'?this.action:this.feedback,this.time,this.reducedMotion,this.speechLevel);
    this.model.wave.material.color.set(mood.color);this.model.wave.material.emissive.set(mood.color);this.model.wave.material.emissiveIntensity=2.2+mood.amplitude*1.4;
  }
  reset(){this.play('idle');this.setFeedback('neutral');this.wheelL=this.wheelR=0;applyPose(this.model,samplePose('idle',0),1);}
}

export function createAnimationClips(model){
  const clips=[];
  for(const name of Object.keys(ACTIONS)){
    const duration=DURATIONS[name],count=Math.round(duration*30),times=[];
    const tracksByJoint=Object.fromEntries([...JOINTS,'WheelLeft','WheelRight'].map(n=>[n,{q:[],p:[],s:[]}])) ;const rootQ=[],rootP=[];
    for(let i=0;i<=count;i++){
      const t=i/30;times.push(t);applyPose(model,samplePose(name,t),1);
      for(const [n,angle] of [['WheelLeft',name==='turn'?t/duration*Math.PI*2*.85/.48:t*(name==='drive'?1:name==='reverse'?-1:0)/.48],['WheelRight',name==='turn'?-t/duration*Math.PI*2*.85/.48:t*(name==='drive'?1:name==='reverse'?-1:0)/.48]])model.parts[n].quaternion.copy(model.rest[n].q).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),angle));
      for(const [n,v] of Object.entries(tracksByJoint)){const o=model.parts[n];v.q.push(...o.quaternion.toArray());v.p.push(...o.position.toArray());v.s.push(...o.scale.toArray());}
      rootQ.push(...new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),name==='turn'?t/duration*Math.PI*2:0).toArray());rootP.push(0,0,name==='drive'?t:name==='reverse'?-t:0);
    }
    const tracks=[];
    for(const [n,v] of Object.entries(tracksByJoint)){tracks.push(new T.QuaternionKeyframeTrack(n+'.quaternion',times,v.q));if(n==='Torso'||n==='Head')tracks.push(new T.VectorKeyframeTrack(n+'.position',times,v.p));if(n==='SpeechWave'||n==='Head')tracks.push(new T.VectorKeyframeTrack(n+'.scale',times,v.s));}
    if(name==='turn')tracks.push(new T.QuaternionKeyframeTrack('Zappie.quaternion',times,rootQ));
    if(name==='drive'||name==='reverse')tracks.push(new T.VectorKeyframeTrack('Zappie.position',times,rootP));
    clips.push(new T.AnimationClip(name,duration,tracks).optimize());
  }
  applyPose(model,samplePose('idle',0),1);return clips;
}
