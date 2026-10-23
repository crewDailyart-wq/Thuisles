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
/* Levendiger (23 oktober 2026, opdracht eigenaar): petje rechtzetten. */
Object.assign(ACTIONS,{cap:'Petje rechtzetten'});
export const DURATIONS={cap:2.4,wave:3,point:3,talk:4,think:4,celebrate:3,correct:3,incorrect:2.5,wobble:3,nod:2,greet:3,listen:4,surprise:2,bow:2.5,turn:4,drive:3,reverse:3,idle:4,sleep:4,stop:1.6,checkTail:2.8};
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
/** Het rondje op zijn wielen bij een goed antwoord: 0 tot 2π, zacht op gang en zacht tot stilstand. */
export function rondje(action,t){
  if(action!=='celebrate'&&action!=='correct')return 0;
  const u=T.MathUtils.clamp((t-.45)/1.6,0,1);
  return u*u*(3-2*u)*Math.PI*2;
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
  /*
    Rust (23 oktober 2026, opdracht eigenaar): het lijf en de wielen staan
    stevig en ademen alleen zacht; niet meer het hele bovenlijf heen en weer.
    Rondkijken, de antennes en de gebaren komen uit de Levendig-laag
    (hieronder), op willekeurige momenten.
  */
  if(action==='idle'&&!reducedMotion){
    const breath=Math.sin(t*Math.PI/2.2);
    rot('Torso',breath*.012,0,0);p.Torso.dy=breath*.012;
    rot('Head',-breath*.01,0,0);
    rot('ArmLeft',breath*.025,0,.26);rot('ArmRight',-breath*.025,0,-.26);
    rot('ElbowLeft',0,0,-.18-Math.sin(t*Math.PI/2.2+.4)*.025);
    rot('ElbowRight',0,0,.18+Math.sin(t*Math.PI/2.2+.4)*.025);
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
  /* Nadenken: hoofd scheef, hand onder zijn kin (23 oktober 2026; de hoeken zijn uitgerekend zodat de hand precies bij de kin komt). */
  if(action==='think'){const k=reducedMotion?1:Math.min(1,t/.5);rot('Head',.08*k,-.12*k,.2*k);rot('ArmRight',-2.26*k,2.59*k,-.26+.43*k);rot('ElbowRight',.52*k,.32*k,.18+.17*k);}
  /*
    Goed antwoord: een sprongetje, armen omhoog en een rondje op zijn wielen
    (23 oktober 2026). Het rondje zelf staat in rondje(); de wielen draaien mee.
  */
  if(action==='celebrate'||action==='correct'){
    rot('ArmLeft',0,0,-.95);rot('ArmRight',0,0,.95);rot('ElbowLeft',0,0,-.9);rot('ElbowRight',0,0,.9);
    p.Torso.dy=reducedMotion?0:Math.pow(Math.sin(t*4),2)*.03;
    if(!reducedMotion){const u=Math.min(1,t/.5);p.Rig={r:[0,rondje(action,t),0],dy:t<.5?Math.sin(u*Math.PI)*.32:0};}
  }
  if(action==='wobble'){rot('Head',0,0,-Math.sin(t*4)*.07);rot('Torso',0,0,Math.sin(t*4)*.055);rot('ArmLeft',0,0,-.72);rot('ArmRight',0,0,.72);}
  if(action==='nod')rot('Head',Math.sin(t*3)*.10,0,0);
  /* Fout: bemoedigend knikken, met open handen (23 oktober 2026). */
  if(action==='incorrect'){const k=Math.min(1,t/.4);rot('Head',(reducedMotion?.06:Math.sin(t*5.5)*.13*Math.exp(-t*.5))+.04,0,.08*k);rot('ArmLeft',-.25*k,0,-.5*k);rot('ArmRight',-.25*k,0,.5*k);rot('ElbowLeft',0,0,-.45*k);rot('ElbowRight',0,0,.45*k);}
  /* Petje rechtzetten: zijn armen zijn te kort om bij de klep te komen (gemeten); de hand gaat naar de zijkant van zijn hoofd, het hoofd buigt ernaartoe en het petje wiebelt recht. */
  if(action==='cap'){const k=Math.sin(Math.PI*Math.min(1,t/DURATIONS.cap));const tik=t>.8&&t<1.6?Math.sin((t-.8)/.8*Math.PI*2):0;rot('ArmRight',.18*k,-.04*k,-.26+1.91*k);rot('ElbowRight',.23*k,.01*k,.18+1.04*k);rot('Head',.07*k,0,-.15*k);rot('Cap',.08*tik,0,-.12*tik);}
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
  return {element:bubble,update(controller){const verborgen=controller.action!=='talk';if(bubble.hidden!==verborgen)bubble.hidden=verborgen;const value=controller.talkDisplay.text;if(text.textContent!==value)text.textContent=value;},dispose(){bubble.remove();}};
}
const tempQ=new T.Quaternion(),tempE=new T.Euler();
export function applyPose(model,pose,blend=1,schaalBlend=blend){
  for(const name of JOINTS){const o=model.parts[name],rest=model.rest[name],v=pose[name]||{};
    tempE.set(...(v.r||[0,0,0]));tempQ.setFromEuler(tempE).premultiply(rest.q);o.quaternion.slerp(tempQ,blend);
    const targetY=rest.p.y+(v.dy||0);o.position.y=T.MathUtils.lerp(o.position.y,targetY,blend);
    const sc=v.s||[1,1,1];o.scale.x=T.MathUtils.lerp(o.scale.x,rest.s.x*sc[0],schaalBlend);o.scale.y=T.MathUtils.lerp(o.scale.y,rest.s.y*sc[1],schaalBlend);o.scale.z=T.MathUtils.lerp(o.scale.z,rest.s.z*sc[2],schaalBlend);
  }
}
export class ZappieController {
  constructor(model,{reducedMotion=false,onAction=()=>{}}={}) {this.model=model;this.action='idle';this.time=0;this.duration=Infinity;this.feedback='neutral';this.feedbackTime=0;this.speechLevel=null;this.reducedMotion=reducedMotion;this.onAction=onAction;this.wheelL=0;this.wheelR=0;this.paused=false;this.feedbackColor=new T.Color();this.feedbackEmission=new T.Color();this.talkDisplay=createTalkDisplay(model);this.levendig=new Levendig();this.setTalkText('Hoi! Ik ben Bliepo.');}
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
    /* Levendig (23 oktober 2026): veren, rondkijken, antennes die na-veren. Bij "Beweging uit" de oude, rustige overgang. */
    if(this.levendig&&!this.reducedMotion){this.levendig.pas(pose,dt,this,motion);applyPose(this.model,pose,1,1-Math.exp(-12*dt));}
    else applyPose(this.model,pose,1-Math.exp(-12*dt));
    this.model.wave.visible=true;if(this.action==='talk')this.talkDisplay.draw(this.time);
    this.wheelL+=((motion.distance||0)+(motion.turn||0)*.85)/.48;this.wheelR+=((motion.distance||0)-(motion.turn||0)*.85)/.48;
    const draai=this.reducedMotion?0:rondje(this.action,this.time)*.85/.48;
    for(const [name,angle] of [['WheelLeft',this.wheelL+draai],['WheelRight',this.wheelR-draai]])this.model.parts[name].quaternion.copy(this.model.rest[name].q).multiply(tempQ.setFromAxisAngle(new T.Vector3(1,0,0),angle));
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

/*
  Levendig (23 oktober 2026, opdracht eigenaar): Bliepo als een robot uit een
  animatiefilm. Het model had al losse onderdelen met scharnieren (hoofd,
  armen, ellebogen, handen, vingers, antennes, petje, wielen, staart); deze
  laag laat ze apart en vloeiend bewegen:
    - elk scharnier volgt zijn doelhouding met een veer: zacht op gang, een
      klein beetje doorschieten en na-veren, in plaats van stijf erheen;
    - in rust kijkt het hoofd af en toe rond (of naar de muis, of naar de
      kant waar hij heen kijkt), op willekeurige tijden, nooit een rondje;
    - de antennes en het petje veren na als het hoofd beweegt;
    - af en toe zwaait hij, zet hij zijn petje recht of kijkt hij naar zijn
      stekker, op willekeurige tijden;
    - als hij praat knikt het hoofd licht mee op de stem (dezelfde
      geluidsmeter als het lijntje) en maakt hij kleine handgebaren.
  Bij "Beweging uit" doet deze laag niets (zie ZappieController.update).
*/
const willekeurig=(a,b)=>a+Math.random()*(b-a);
/* Zachte ruis: een paar sinussen met vreemde verhoudingen, zodat het nooit precies herhaalt. */
const ruis=(t,z)=>Math.sin(t*1.13+z)*.5+Math.sin(t*2.71+z*1.7)*.3+Math.sin(t*.47+z*2.3)*.2;
export class Levendig{
  constructor(){
    this.veren=new Map();
    this.t=0;
    this.blik={yaw:0,pitch:0,vy:0,vp:0};
    this.blikDoel={yaw:0,pitch:0};
    this.volgendeBlik=willekeurig(1.2,3);
    this.volgendGebaar=willekeurig(9,18);
    this.ant={x:0,v:0,y:0,w:0};
    this.vorigeYaw=0;
    this.spraak=0;
    /** Waar de muis (of iets anders) is, van -1 tot 1; null = zelf rondkijken. */
    this.kijk=null;
    /** Een voorkeurskant om naar te kijken (bijvoorbeeld de vakken), in radialen. */
    this.voorkeur=0;
    this.zelf=Math.random()*100;
  }
  /** Eén waarde met een veer naar zijn doel; k = stijfheid, z = demping (onder 1 = na-veren). */
  veer(sleutel,doel,dt,k=95,z=.62){
    let v=this.veren.get(sleutel);
    if(!v){v={x:doel,v:0};this.veren.set(sleutel,v);return doel;}
    const c=2*z*Math.sqrt(k);
    /* In kleine stapjes, zodat een haperend beeldje de veer niet laat ontsporen. */
    let rest=dt;
    while(rest>0){const h=Math.min(rest,1/120);v.v+=(k*(doel-v.x)-c*v.v)*h;v.x+=v.v*h;rest-=h;}
    return v.x;
  }
  pas(pose,dt,c,motion={}){
    this.t+=dt;
    const t=this.t,actie=c.action,rustig=actie==='idle'||actie==='listen';
    const zet=(naam)=>pose[naam]??={r:[0,0,0]};

    /* 1. Rondkijken: nieuwe blik op willekeurige momenten, of de muis volgen. */
    if(this.kijk){this.blikDoel.yaw=T.MathUtils.clamp(this.kijk.x,-1,1)*.42;this.blikDoel.pitch=T.MathUtils.clamp(this.kijk.y,-.2,1)*.14;}
    else if(t>=this.volgendeBlik){
      const terug=Math.random()<.35;
      this.blikDoel.yaw=terug?this.voorkeur*.5:T.MathUtils.clamp(this.voorkeur+willekeurig(-.4,.35),-.45,.4);
      this.blikDoel.pitch=terug?0:willekeurig(0,.1);/* Niet omhoog kijken: dan weerspiegelt het scherm licht en ziet het er niet meer donker uit. */
      this.volgendeBlik=t+willekeurig(1.6,4.8);
    }
    const doelYaw=rustig||actie==='talk'?this.blikDoel.yaw:0,doelPitch=rustig||actie==='talk'?this.blikDoel.pitch:0;
    const yaw=this.veer('blik:yaw',doelYaw,dt,38,.58),pitch=this.veer('blik:pitch',doelPitch,dt,38,.6);
    const kop=zet('Head');kop.r[1]+=yaw;kop.r[0]+=pitch;
    /* Het lijf draait een klein beetje mee, later en trager: dat voelt levend. */
    const lijf=zet('Torso');lijf.r[1]+=this.veer('lijf:yaw',yaw*.22,dt,10,.9);

    /* 2. Praten: knikken op de stem en kleine handgebaren. */
    this.spraak=this.veer('spraak',actie==='talk'||c.speechLevel!==null?(c.speechLevel??.4):0,dt,60,.9);
    if(this.spraak>.01){
      kop.r[0]+=this.spraak*(.05+.05*Math.sin(t*7.3+this.zelf));
      kop.r[2]+=this.spraak*.04*ruis(t*1.7,this.zelf);
      const g1=Math.max(0,ruis(t*1.3,this.zelf+1)),g2=Math.max(0,ruis(t*1.1,this.zelf+5));
      if(actie==='idle'||actie==='talk'){
        const ar=zet('ArmRight'),er=zet('ElbowRight'),al=zet('ArmLeft'),el=zet('ElbowLeft');
        ar.r[0]-=.25*g1*this.spraak;ar.r[2]+=.2*g1*this.spraak;er.r[2]+=.45*g1*this.spraak;
        al.r[0]-=.25*g2*this.spraak;al.r[2]-=.2*g2*this.spraak;el.r[2]-=.45*g2*this.spraak;
      }
    }

    /* 3. Gebaren op willekeurige tijden, alleen in rust. */
    if(actie==='idle'&&t>=this.volgendGebaar){
      const kans=Math.random();
      c.play(kans<.4?'wave':kans<.8?'cap':'checkTail');
      this.volgendGebaar=t+willekeurig(14,30);
    }
    if(actie!=='idle'&&this.volgendGebaar<t+6)this.volgendGebaar=t+willekeurig(8,14);

    /* 4. Alle scharnieren met een veer naar hun doel (het rondje en de schermgolf niet). */
    for(const [naam,v] of Object.entries(pose)){
      if(naam==='SpeechWave'||!v.r)continue;
      const stijf=naam.startsWith('Finger')||naam==='Thumb'?140:naam==='Rig'?160:naam==='Torso'?70:95;
      const demp=naam==='Rig'?.5:naam.startsWith('Arm')||naam.startsWith('Elbow')||naam.startsWith('Hand')?.58:.68;
      for(let i=0;i<3;i++){if(naam==='Rig'&&i===1)continue;v.r[i]=this.veer(naam+':'+i,v.r[i],dt,stijf,demp);}
      if(v.dy!==undefined||this.veren.has(naam+':dy'))v.dy=this.veer(naam+':dy',v.dy||0,dt,naam==='Rig'?180:90,naam==='Rig'?.45:.6);
    }

    /* 5. Antennes en petje veren na op hoe snel het hoofd draait (zwaar gedempt, licht doorschietend). */
    const snel=dt>0?(yaw-this.vorigeYaw)/dt:0;this.vorigeYaw=yaw;
    const sprong=pose.Rig?.dy?(pose.Rig.dy*2):0;
    this.ant.v+=((-snel*.09-this.ant.x)*85-this.ant.v*4.2)*dt;this.ant.x=T.MathUtils.clamp(this.ant.x+this.ant.v*dt,-.35,.35);
    this.ant.w+=((-sprong-pitch*.6-this.ant.y)*85-this.ant.w*4.2)*dt;this.ant.y=T.MathUtils.clamp(this.ant.y+this.ant.w*dt,-.35,.35);
    for(const naam of ['AntennaLeft','AntennaRight']){const a=zet(naam);a.r[2]+=this.ant.x;a.r[0]+=this.ant.y;}
    const pet=zet('Cap');pet.r[2]+=this.ant.x*.18;pet.r[0]+=this.ant.y*.15;
  }
}
