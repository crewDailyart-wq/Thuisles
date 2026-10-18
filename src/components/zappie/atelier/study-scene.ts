import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type StudyView = 'samen' | 'podium' | 'vitrine' | 'koepel' | 'lintjes';
export type StudyController = { view: (v: StudyView) => void; glow: (v: boolean) => void; badge: (index: number, unlocked: boolean) => void; dispose: () => void; foto?: (glow: boolean) => string | null };
/**
 * De weerspiegeling in de vloer (18 oktober 2026). Eerst als proef op
 * /voorbeeld-bliepo?atelier=1; de eigenaar koos versie C, die het atelier op
 * de startpagina nu gebruikt (EmbeddedAtelier). Zonder keuze blijft de oude
 * weerspiegeling (1024 bij 1024, zonder anti-aliasing):
 *   a: scherp, in de resolutie van het scherm en met anti-aliasing;
 *   b: zoals a, met een heel lichte vervaging;
 *   c: zoals b, en verder van het podium zachter en vager.
 * Op een smal scherm (telefoon) wordt de weerspiegeling in een lagere resolutie
 * getekend; de anti-aliasing en de vervaging houden de randen vloeiend.
 */
export type Reflectie = 'a' | 'b' | 'c';
const zachteReflectie = {
  name: 'ZachteReflectie',
  uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, texel: { value: new T.Vector2(1/1024,1/1024) }, zacht: { value: 1.4 }, rand: { value: 0 } },
  vertexShader: `uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vPlek;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){vUv=textureMatrix*vec4(position,1.0);vPlek=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    #include <logdepthbuf_vertex>
    }`,
  fragmentShader: `uniform vec3 color;uniform sampler2D tDiffuse;uniform vec2 texel;uniform float zacht;uniform float rand;varying vec4 vUv;varying vec3 vPlek;
    #include <logdepthbuf_pars_fragment>
    float blendOverlay(float b,float c){return b<0.5?(2.0*b*c):(1.0-2.0*(1.0-b)*(1.0-c));}
    vec3 blendOverlay(vec3 b,vec3 c){return vec3(blendOverlay(b.r,c.r),blendOverlay(b.g,c.g),blendOverlay(b.b,c.b));}
    void main(){
      #include <logdepthbuf_fragment>
      vec2 uv=vUv.xy/vUv.w;
      float f=rand*smoothstep(3.0,15.0,length(vPlek.xz-vec2(1.65,1.2)));
      float r=zacht*(1.0+f*6.0);
      vec2 p[12];p[0]=vec2(-.326,-.406);p[1]=vec2(-.840,-.074);p[2]=vec2(-.696,.457);p[3]=vec2(-.203,.621);p[4]=vec2(.962,-.195);p[5]=vec2(.473,-.480);p[6]=vec2(.519,.767);p[7]=vec2(.185,-.893);p[8]=vec2(.507,.064);p[9]=vec2(.896,.412);p[10]=vec2(-.322,-.933);p[11]=vec2(-.792,-.598);
      vec3 som=texture2D(tDiffuse,uv).rgb;
      for(int i=0;i<12;i++)som+=texture2D(tDiffuse,uv+p[i]*texel*r).rgb;
      som/=13.0;
      som*=1.0-f*0.7;
      gl_FragColor=vec4(blendOverlay(som,color),1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
};
const V = (x:number,y:number,z:number) => new T.Vector3(x,y,z);

/** First art-direction slice: modeled objects, physical materials, HDR glow and planar reflections. */
/*
  Snelheid (18 oktober 2026): het atelier werd in één keer gebouwd, en dat hield
  de pagina op een trage telefoon meer dan een seconde vast. Nu bouwt
  bouwStudy dezelfde onderdelen in dezelfde volgorde, maar geeft de browser
  tussendoor steeds even de beurt (doorgaan()), zodat de pagina blijft
  bewegen. Wat er gebouwd wordt en hoe het eruitziet, is niet veranderd.
  createStudy geeft meteen een besturing terug; wat daar intussen mee gedaan
  wordt, gebeurt zodra het atelier klaar is.
*/
/*
  Het vooraf gebouwde atelier (optie 1): alle vaste delen, per materiaal
  samengevoegd, precies zoals de code hieronder ze bouwt. Verander je iets aan
  de vaste delen, maak het bestand dan opnieuw: open een pagina met het atelier,
  zet in de console `window.__atelierVast = null` vóórdat het atelier start
  (dan bouwt hij alles zelf en zet het resultaat in window.__atelierVast), en
  draai `node scripts/maak-atelier-vast.mjs`. Verhoog daarbij het nummer in de
  bestandsnaam, zodat niemand een oud bestand uit de cache krijgt.
*/
const VAST_BESTAND='/atelier/sterrenwerkplaats-vast-1.glb';
type VastDeel={vorm:T.BufferGeometry;materiaal:number;plek:T.Matrix4};
async function laadVast():Promise<VastDeel[]|null>{
  if((window as {__atelierVast?:unknown}).__atelierVast!==undefined)return null;
  try{
    const [{GLTFLoader},{MeshoptDecoder}]=await Promise.all([import('three/examples/jsm/loaders/GLTFLoader.js'),import('three/examples/jsm/libs/meshopt_decoder.module.js')]);
    const lader=new GLTFLoader();lader.setMeshoptDecoder(MeshoptDecoder);
    const gltf=await lader.loadAsync(VAST_BESTAND);
    gltf.scene.updateMatrixWorld(true);
    const delen:VastDeel[]=[];
    gltf.scene.traverse(o=>{const n=/^m(\d+)$/.exec(o.name);if(n&&o instanceof T.Mesh)delen.push({vorm:o.geometry,materiaal:+n[1],plek:o.matrixWorld.clone()});});
    return delen.length?delen:null;
  }catch(fout){
    console.warn('[atelier] vooraf gebouwd bestand niet geladen; alles wordt hier gebouwd:',fout);
    return null;
  }
}
/** Voor het opnieuw maken van VAST_BESTAND (zie hierboven); draait alleen als daarom gevraagd is. */
async function bewaarVast(delen:T.Mesh[],materials:T.Material[]){
  const {GLTFExporter}=await import('three/examples/jsm/exporters/GLTFExporter.js');
  const s=new T.Scene();
  for(const d of delen){
    const i=materials.indexOf(d.material as T.Material);
    if(i<0){console.warn('[atelier] materiaal hoort niet bij de lijst; dit deel ontbreekt in het bestand');continue;}
    const g=d.geometry.clone();if(g.getAttribute('uv'))g.deleteAttribute('uv');
    const o=new T.Mesh(g,new T.MeshBasicMaterial());o.name='m'+i;s.add(o);
  }
  (window as {__atelierVast?:unknown}).__atelierVast=await new GLTFExporter().parseAsync(s,{binary:true});
}
const pauze=()=>new Promise<void>(r=>{const s=(globalThis as {scheduler?:{yield?:()=>Promise<void>}}).scheduler;if(s?.yield)s.yield().then(r);else setTimeout(r,0);});
export function createStudy(host: HTMLDivElement, ready: () => void, failed: () => void, selected: (index: number) => void, mascotAnchor: HTMLDivElement | null = null, reflectie: Reflectie | null = null): StudyController {
  let inner:StudyController|null=null,stopped=false;const waiting:((c:StudyController)=>void)[]=[];
  const later=(f:(c:StudyController)=>void)=>{if(inner)f(inner);else waiting.push(f);};
  bouwStudy(host,ready,failed,selected,mascotAnchor,reflectie).then(c=>{if(stopped){c.dispose();return;}inner=c;waiting.splice(0).forEach(f=>f(c));}).catch(()=>{if(!stopped)failed();});
  return {view:v=>later(c=>c.view(v)),glow:v=>later(c=>c.glow(v)),badge:(i,u)=>later(c=>c.badge(i,u)),foto:on=>inner?.foto?.(on)??null,dispose(){stopped=true;inner?.dispose();inner=null;}};
}

async function bouwStudy(host: HTMLDivElement, ready: () => void, failed: () => void, selected: (index: number) => void, mascotAnchor: HTMLDivElement | null, reflectie: Reflectie | null): Promise<StudyController> {
  let lastPause=performance.now();
  const vast=await laadVast();
  const leeg=new T.BufferGeometry();
  const doorgaan=async()=>{if(performance.now()-lastPause<30)return;await pauze();lastPause=performance.now();};
  let dirty=true,disposed=false,first=true,panoramaReady=false;
  const renderer = new T.WebGLRenderer({ antialias: true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  /*
    PCFShadowMap (18 oktober 2026): deze versie van three.js kent
    PCFSoftShadowMap niet meer en tekende bij de eerste tekening toch al met
    PCFShadowMap. Nu staat dat er meteen, zodat de shaders vooraf in de
    achtergrond klaargezet kunnen worden (zie compileAsync hieronder). Het beeld
    is daardoor niet veranderd.
  */
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.domElement.setAttribute('role','img');
  renderer.domElement.setAttribute('aria-label','Sterrenwerkplaats: 3D-podium en vitrine in een glazen koepel met uitzicht op een ondergrondse energiekern');
  host.append(renderer.domElement);
  const scene = new T.Scene(); scene.background = new T.Color('#071731');
  scene.fog = new T.Fog('#071731',35,100);
  const camera = new T.PerspectiveCamera(43,1,0.1,130);
  const pmrem = new T.PMREMGenerator(renderer), room = new RoomEnvironment();
  const env = pmrem.fromScene(room,0.04); scene.environment = env.texture; scene.environmentIntensity = 0.5;
  room.dispose(); pmrem.dispose();
  const materials: T.Material[] = [];
  const physical = (color:string,metalness:number,roughness:number,coat=0) => {
    const m = new T.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:coat,clearcoatRoughness:0.16}); materials.push(m); return m;
  };
  const gold=physical('#e7ae47',0.88,0.21), paleGold=physical('#ffe3a1',0.8,0.18);
  const blue=physical('#043b9f',0.22,0.24,0.55), navy=physical('#061832',0.18,0.28,0.45);
  const inset=physical('#031026',0,0.8), velvet=physical('#0d3683',0.05,0.88);
  const lightMaterial=(color:string,intensity:number)=>{
    const m=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:0.23}); materials.push(m); return m;
  };
  const cyan=lightMaterial('#00aaff',2.8), amber=lightMaterial('#ffac26',2.4), pearl=lightMaterial('#ffdc9c',1.8);
  /*
    Snelheid (18 oktober 2026, optie 1): alles wat niet beweegt, staat vooraf
    gebouwd in VAST_BESTAND. Is dat bestand geladen (vast), dan maakt mesh()
    voor die vaste delen geen vorm meer aan: het geeft een leeg stukje terug
    dat niet in de scène komt. Alleen wat beweegt (de lintjes met medailles en
    slotjes), de achterwand en de koepel worden nog hier gebouwd. Zonder het
    bestand wordt alles zoals altijd hier gebouwd.
  */
  const dynamisch=new Set<T.Object3D>();
  const beweegt=(o:T.Object3D|null):boolean=>!!o&&(dynamisch.has(o)||beweegt(o.parent));
  function mesh(g:T.BufferGeometry|(()=>T.BufferGeometry),m:T.Material,p:T.Object3D,x=0,y=0,z=0,los=false){if(vast&&!los&&!beweegt(p)){const o=new T.Mesh(leeg,m);o.position.set(x,y,z);return o;}const o=new T.Mesh(typeof g==='function'?g():g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
  const box=(w:number,h:number,d:number,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>mesh(()=>new RoundedBoxGeometry(w,h,d,3,Math.min(.05,h/3)),m,p,x,y,z);
  const cyl=(a:number,b:number,h:number,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>mesh(()=>new T.CylinderGeometry(a,b,h,96),m,p,x,y,z);
  const orb=(r:number,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>mesh(()=>new T.SphereGeometry(r,24,16),m,p,x,y,z);
  const ring=(r:number,t:number,m:T.Material,p:T.Object3D,y:number)=>{const o=mesh(()=>new T.TorusGeometry(r,t,12,128),m,p,0,y,0);o.rotation.x=Math.PI/2;return o;};
  function star(r:number,m:T.Material,p:T.Object3D,x:number,y:number,z:number){
    const s=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,rr=i%2?r*.46:r;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;if(i===0)s.moveTo(px,py);else s.lineTo(px,py);}s.closePath();
    return mesh(()=>new T.ExtrudeGeometry(s,{depth:.065,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,steps:1}),m,p,x,y,z);
  }
  await doorgaan();
  // Warm key, cool rim and localized pools of light; deliberately restrained ambient light.
  scene.add(new T.HemisphereLight('#91caff','#07122c',0.65));
  const key=new T.DirectionalLight('#ffdea3',2.6);key.position.set(-3,9,6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:30});key.shadow.normalBias=.035;scene.add(key);
  const rim=new T.DirectionalLight('#4da5ff',2.1);rim.position.set(4,7,-4);scene.add(rim);
  const lights:T.PointLight[]=[];
  function pool(color:string,intensity:number,x:number,y:number,z:number,distance=7){const l=new T.PointLight(color,intensity,distance,2);l.position.set(x,y,z);scene.add(l);lights.push(l);return l;}
  pool('#10cfff',5,1.65,1.5,1.2);pool('#ffbb50',2.5,-2.5,3,-.5);pool('#4e99ff',12,1,5,-4,14);

  await doorgaan();
  // A real reflected floor, with independent gold inlays and a stone foundation.
  const floor=reflectie
    ?new Reflector(new T.CircleGeometry(18.8,128),{color:0x38485e,textureWidth:1024,textureHeight:1024,clipBias:.003,multisample:4,shader:reflectie==='a'?undefined:zachteReflectie})
    :new Reflector(new T.CircleGeometry(18.8,128),{color:0x38485e,textureWidth:1024,textureHeight:1024,clipBias:.003,multisample:0});
  if(reflectie==='c')(floor.material as T.ShaderMaterial).uniforms.rand.value=1;
  // Proef: de weerspiegeling krijgt de resolutie van het scherm (op een telefoon iets minder).
  const reflectieMaat=(w:number,h:number)=>{
    if(!reflectie)return;
    const schaal=renderer.getPixelRatio()*(w<700?(reflectie==='a'?.75:.6):(reflectie==='a'?1:.8));
    const b=Math.max(2,Math.round(w*schaal)),hh=Math.max(2,Math.round(h*schaal));
    floor.getRenderTarget().setSize(b,hh);
    const u=(floor.material as T.ShaderMaterial).uniforms;if(u.texel)u.texel.value.set(1/b,1/hh);
  };
  floor.rotation.x=-Math.PI/2;floor.position.y=-.025;scene.add(floor);
  cyl(18.8,18.8,.25,navy,scene,0,-.17);
  const inlays=new T.Group();scene.add(inlays);
  for(const r of [3.7,5.8,8.1,14.8,18.5])ring(r,.013,gold,inlays,.005);

  await doorgaan();
  // Approved panorama on a cylindrical backdrop, separate from the modeled interior.
  /*
    Snelheid (18 oktober 2026, optie 3): de achtergrondfoto wordt buiten de
    pagina om uitgepakt (createImageBitmap) en meteen klaargezet op de
    videokaart, in plaats van bij de eerste tekening. Dezelfde foto, even
    scherp. Kan de browser dat niet, dan gaat het zoals voorheen.
  */
  const PANORAMA='/atelier/sterrenwerkplaats-panorama.webp';
  const panoramaTexture=new T.Texture();
  const panoramaKlaar=()=>{if(disposed)return;panoramaTexture.needsUpdate=true;renderer.initTexture(panoramaTexture);panoramaReady=true;dirty=true;host.dataset.panorama='ready';};
  const panoramaOudeManier=()=>{new T.ImageLoader().load(PANORAMA,img=>{panoramaTexture.image=img;panoramaTexture.flipY=true;panoramaKlaar();},undefined,()=>{if(!disposed)failed();});};
  if(typeof createImageBitmap==='function')new T.ImageBitmapLoader().setOptions({imageOrientation:'flipY',premultiplyAlpha:'none'}).load(PANORAMA,bmp=>{if(disposed){bmp.close();return;}panoramaTexture.image=bmp;panoramaTexture.flipY=false;panoramaKlaar();},undefined,panoramaOudeManier);
  else panoramaOudeManier();
  panoramaTexture.colorSpace=T.SRGBColorSpace;
  panoramaTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const backdropMaterial=new T.MeshBasicMaterial({map:panoramaTexture,side:T.DoubleSide,fog:false,toneMapped:false});
  // Continue the top into cavern darkness instead of exposing the panorama rectangle.
  backdropMaterial.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.00212, 0.00857, 0.03071), smoothstep(0.78, 0.995, vMapUv.y));`);
  };
  backdropMaterial.customProgramCacheKey=()=> 'atelier-cavern-ceiling-v2';
  materials.push(backdropMaterial);
  const backdropGeometry=new T.BufferGeometry(),bp:number[]=[],bu:number[]=[],bi:number[]=[];
  const radius=55,span=2,backdropHeight=radius*span/3;
  for(let i=0;i<=128;i++){
    const u=i/128,a=(u-.5)*span-.12;
    for(const v of [0,2.6]){bp.push(Math.sin(a)*radius,5+(v-.5)*backdropHeight,-Math.cos(a)*radius);bu.push(u,v);}
    if(i<128){const n=i*2;bi.push(n,n+1,n+2,n+1,n+3,n+2);}
  }
  backdropGeometry.setAttribute('position',new T.Float32BufferAttribute(bp,3));
  backdropGeometry.setAttribute('uv',new T.Float32BufferAttribute(bu,2));backdropGeometry.setIndex(bi);backdropGeometry.computeVertexNormals();
  const backdrop=mesh(backdropGeometry,backdropMaterial,scene,0,0,0,true);backdrop.castShadow=false;backdrop.receiveShadow=false;

  await doorgaan();
  // Clear ellipsoidal shell, modeled brass ribs, perimeter light and a small crown oculus.
  const dome=new T.Group();scene.add(dome);
  const domeRadius=18.5,domeHeight=13.5;
  const glassMaterial=new T.MeshPhysicalMaterial({color:'#b2dfff',metalness:0,roughness:.12,clearcoat:1,clearcoatRoughness:.1,transparent:true,opacity:.065,side:T.BackSide,depthWrite:false,envMapIntensity:.6});
  materials.push(glassMaterial);
  const glass=mesh(()=>new T.SphereGeometry(1,96,48,0,Math.PI*2,0,Math.PI/2),glassMaterial,dome,0,.25,0,true);
  glass.scale.set(domeRadius,domeHeight,domeRadius);glass.castShadow=false;glass.receiveShadow=false;glass.renderOrder=3;
  const structuralGold=physical('#b98531',.8,.28);
  ring(domeRadius,.13,structuralGold,dome,.18);
  ring(domeRadius-.16,.022,cyan,dome,.28);
  for(let i=0;i<12;i++){
    await doorgaan();
    const a=(i+.5)*Math.PI/6,points:T.Vector3[]=[];
    for(let j=0;j<=64;j++){const t=j/64*Math.PI/2;points.push(V(Math.sin(a)*domeRadius*Math.cos(t),.25+domeHeight*Math.sin(t),Math.cos(a)*domeRadius*Math.cos(t)));}
    mesh(()=>new T.TubeGeometry(new T.CatmullRomCurve3(points),96,.055,8,false),structuralGold,dome);
    // Low brass sockets make the ribs read as real supporting architecture.
    cyl(.2,.28,.42,navy,dome,Math.sin(a)*domeRadius,.26,Math.cos(a)*domeRadius);
    cyl(.23,.23,.075,paleGold,dome,Math.sin(a)*domeRadius,.48,Math.cos(a)*domeRadius);
  }
  const latitude=.43;
  ring(domeRadius*Math.cos(latitude),.032,structuralGold,dome,.25+domeHeight*Math.sin(latitude));
  ring(1.15,.08,structuralGold,dome,13.72);
  ring(1.05,.018,cyan,dome,13.7);
  pool('#9060ff',5,7,3,-8,16);

  await doorgaan();
  // Hero pedestal: turned profiles, inset curved panels, machined seams and glowing portholes.
  const podium=new T.Group();podium.position.set(1.65,0,1.2);scene.add(podium);
  const profile=[[0,0],[2.72,0],[2.83,.07],[2.83,.15],[2.73,.23],[2.58,.25],[2.5,.34],[2.37,.93],[2.32,1.01],[0,1.01]].map(([x,y])=>new T.Vector2(x,y));
  mesh(()=>new T.LatheGeometry(profile,128),blue,podium);
  cyl(2.76,2.79,.07,gold,podium,0,.13);
  ring(2.72,.026,cyan,podium,.26);
  cyl(2.38,2.43,.1,paleGold,podium,0,.96);
  cyl(2.28,2.28,.075,navy,podium,0,1.035);
  ring(2.14,.052,cyan,podium,1.083);
  ring(1.72,.022,cyan,podium,1.085);
  ring(1.27,.012,paleGold,podium,1.085);
  cyl(1.18,1.18,.025,blue,podium,0,1.085);
  for(let i=0;i<18;i++){
    await doorgaan();
    const a=i*Math.PI*2/18;
    const panel=new T.Group();panel.position.set(Math.sin(a)*2.46,.62,Math.cos(a)*2.46);panel.rotation.y=a;panel.rotation.x=-.23;podium.add(panel);
    box(.62,.46,.045,navy,panel);
    for(const x of [-.32,.32]){box(.014,.53,.055,gold,panel,x,0,0);for(const y of [-.22,.22])orb(.024,paleGold,panel,x,y,.045);}
    const bezel=mesh(()=>new T.TorusGeometry(.115,.035,12,32),gold,panel,0,0,.06);
    bezel.scale.y=1.15;
    mesh(()=>new T.SphereGeometry(.095,24,16),amber,panel,0,0,.072).scale.set(1,1.15,.4);
  }
  const crest=new T.Group();crest.position.set(0,.63,2.53);podium.add(crest);
  mesh(()=>new T.TorusGeometry(.3,.035,12,48),gold,crest);
  mesh(()=>new T.CircleGeometry(.28,48),inset,crest,0,0,.002);
  star(.22,amber,crest,0,0,.025);
  await doorgaan();
  // Fine engraved radial markers on the luminous deck.
  for(let i=0;i<48;i++){const a=i*Math.PI/24;const tick=box(.012,.01,i%4===0?.18:.07,paleGold,podium,Math.sin(a)*1.93,1.085,Math.cos(a)*1.93);tick.rotation.y=a;}

  await doorgaan();
  // One finished cabinet, with a continuous curved arch and lit shelf recesses.
  const cabinet=new T.Group();cabinet.position.set(-2.55,0,-1.5);scene.add(cabinet);
  function archShape(r:number,spring:number){const s=new T.Shape();s.moveTo(-r,0);s.lineTo(-r,spring);s.absarc(0,spring,r,Math.PI,0,true);s.lineTo(r,0);s.closePath();return s;}
  const extrude=(shape:T.Shape,depth:number,m:T.Material,z:number)=>mesh(()=>new T.ExtrudeGeometry(shape,{depth,curveSegments:48,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:3,steps:1}),m,cabinet,0,.2,z);
  extrude(archShape(1.5,3.7),.42,blue,-.54);
  extrude(archShape(1.31,3.68),.035,inset,-.065);
  function archTrim(r:number,spring:number,thickness:number,m:T.Material,z:number){
    const path=new T.CurvePath<T.Vector3>();path.add(new T.LineCurve3(V(-r,0,z),V(-r,spring,z)));
    for(let i=0;i<64;i++){const a=Math.PI-i*Math.PI/64,b=Math.PI-(i+1)*Math.PI/64;path.add(new T.LineCurve3(V(Math.cos(a)*r,spring+Math.sin(a)*r,z),V(Math.cos(b)*r,spring+Math.sin(b)*r,z)));}
    path.add(new T.LineCurve3(V(r,spring,z),V(r,0,z)));
    mesh(()=>new T.TubeGeometry(path,180,thickness,10,false),m,cabinet,0,.2,0);
  }
  archTrim(1.47,3.7,.07,gold,.04);archTrim(1.36,3.7,.025,amber,.085);archTrim(1.28,3.7,.012,paleGold,.09);
  box(3.15,.22,1.15,gold,cabinet,0,.11,.05);
  box(3.02,.14,1.05,blue,cabinet,0,.29,.07);
  for(const y of [.65,2.1,3.55]){
    box(2.64,.12,1.05,blue,cabinet,0,y,.23);
    box(2.67,.065,.09,paleGold,cabinet,0,y,.75);
    box(2.48,.024,.04,pearl,cabinet,0,y-.055,.72);
    pool('#ffc36b',1.8,-2.55,y+.36,-1.2,3);
  }
  star(.19,gold,cabinet,0,4.67,.08);
  await doorgaan();
  // Upper shelf: a blue enamel explorer helmet with gold rim and a raised crest.
  const helmet=new T.Group();helmet.position.set(0,3.76,.27);cabinet.add(helmet);
  cyl(.6,.62,.09,velvet,helmet,0,-.12);
  mesh(()=>new T.SphereGeometry(.47,48,24,0,Math.PI*2,0,Math.PI/2),blue,helmet,0,.02).scale.y=.86;
  cyl(.48,.5,.07,gold,helmet,0,.04);
  const brim=cyl(.5,.51,.04,blue,helmet,0,0,.2);brim.scale.z=1.15;
  star(.13,paleGold,helmet,0,.23,.42);
  await doorgaan();
  // Middle shelf: a smooth cut gold crown with turquoise gemstones.
  const crown=new T.Group();crown.position.set(0,2.42,.3);cabinet.add(crown);
  cyl(.62,.65,.11,velvet,crown,0,-.2);
  const vertices:number[]=[];
  for(let i=0;i<96;i++){
    const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2;
    const top=(t:number)=>.26+.34*Math.pow((Math.cos(t*6)+1)/2,3);
    const pos=(t:number,y:number)=>[Math.sin(t)*(.4+y*.17),y,Math.cos(t)*(.4+y*.17)];
    vertices.push(...pos(a,0),...pos(b,0),...pos(a,top(a)),...pos(b,0),...pos(b,top(b)),...pos(a,top(a)));
  }
  const crownGeometry=new T.BufferGeometry();crownGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));crownGeometry.computeVertexNormals();
  const crownGold=gold.clone();crownGold.side=T.DoubleSide;materials.push(crownGold);mesh(crownGeometry,crownGold,crown);
  ring(.41,.04,paleGold,crown,.04);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;orb(.055,paleGold,crown,Math.sin(a)*.5,.6,Math.cos(a)*.5);const jewel=orb(.065,cyan,crown,Math.sin(a)*.445,.2,Math.cos(a)*.445);jewel.scale.y=1.4;}
  await doorgaan();
  // Lower shelf: star wand and luminous crystal, each with its own display base.
  for(const x of [-.58,.58]){cyl(.3,.33,.07,gold,cabinet,x,.78,.32);cyl(.24,.27,.17,velvet,cabinet,x,.9,.32);}
  cyl(.03,.04,.48,gold,cabinet,-.58,1.2,.32);star(.2,amber,cabinet,-.58,1.54,.32);
  mesh(()=>new T.OctahedronGeometry(.23),cyan,cabinet,.58,1.32,.32).scale.y=1.55;
  ring(.24,.016,paleGold,cabinet,1.15).position.x=.58;

  await doorgaan();
  // A freestanding ribbon treasury: enamel shell, six velvet niches and individual medals.
  const treasury=new T.Group();treasury.position.set(4.75,0,-2.8);treasury.rotation.y=-.13;scene.add(treasury);
  box(3.5,.23,1.1,gold,treasury,0,.18);box(3.35,.18,1.03,blue,treasury,0,.37);
  box(3.18,4.35,.42,blue,treasury,0,2.6,-.3);
  box(2.91,4.05,.1,inset,treasury,0,2.6,-.04);
  for(const x of [-1.51,1.51]){
    box(.11,4.2,.15,gold,treasury,x,2.61,.02);
    box(.025,3.95,.035,cyan,treasury,x*.93,2.6,.11);
    orb(.11,paleGold,treasury,x,4.77,.03);
    for(const y of [.65,4.55])box(.21,.13,.28,paleGold,treasury,x,y,.05);
  }
  await doorgaan();
  // Sweeping crown and central star identify the cabinet even at the wide camera angle.
  const crestPath=new T.CatmullRomCurve3([V(-1.6,4.78,0),V(-.9,5.02,0),V(0,5.26,0),V(.9,5.02,0),V(1.6,4.78,0)]);
  mesh(()=>new T.TubeGeometry(crestPath,64,.08,12,false),gold,treasury);
  mesh(()=>new T.TorusGeometry(.28,.027,12,48),paleGold,treasury,0,5.04,.1);
  star(.19,amber,treasury,0,5.04,.11);
  for(const y of [.55,1.9,3.25,4.6]){box(2.95,.065,.46,gold,treasury,0,y,.13);box(2.7,.018,.025,pearl,treasury,0,y-.05,.34);}
  box(.055,3.95,.16,gold,treasury,0,2.6,.08);
  pool('#ffcd80',5,4.75,3.3,-.8,7);
  await doorgaan();
  // Dynamic parts remain independent of the static geometry batches.
  const badgeRoots:T.Group[]=[],locks:T.Group[]=[],medals:T.Group[]=[],halos:T.Mesh[]=[],hitTargets:T.Mesh[]=[];
  const ribbonColors=['#167bd2','#693cc4','#11877f','#b34272','#3452ae','#7b4ec6'];
  const darkMetal=physical('#526582',.64,.36), ribbonSeam=physical('#caa25b',.45,.48);
  function faceDisk(r:number,h:number,m:T.Material,p:T.Object3D,y:number,z:number){const o=cyl(r,r,h,m,p,0,y,z);o.rotation.x=Math.PI/2;return o;}
  for(let i=0;i<6;i++){
    await doorgaan();
    const x=i%2===0?-.74:.74,y=3.88-Math.floor(i/2)*1.35;
    box(1.28,1.2,.07,velvet,treasury,x,y,-.005);
    const root=new T.Group();root.position.set(x,y,.12);treasury.add(root);badgeRoots.push(root);dynamisch.add(root);
    const ribbon=physical(ribbonColors[i],.08,.8);ribbon.sheen=1;ribbon.sheenColor.set(ribbonColors[i]);ribbon.sheenRoughness=.7;
    // Split, folded cloth tails, with real depth and gold stitching along each edge.
    for(const side of [-1,1]){
      const tail=new T.Group();tail.position.set(side*.12,-.2,0);tail.rotation.z=side*.16;root.add(tail);
      const shape=new T.Shape();shape.moveTo(-.13,.44);shape.lineTo(.13,.44);shape.lineTo(.13,-.32);shape.lineTo(0,-.22);shape.lineTo(-.13,-.32);shape.closePath();
      mesh(()=>new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,steps:1}),ribbon,tail);
      for(const edge of [-.105,.105])box(.008,.58,.01,ribbonSeam,tail,edge,.09,.035);
    }
    box(.6,.07,.11,gold,root,0,.43,.04);orb(.035,paleGold,root,-.23,.43,.11);orb(.035,paleGold,root,.23,.43,.11);
    const halo=mesh(()=>new T.TorusGeometry(.375,.016,10,64),cyan,root,0,.025,.06);halos.push(halo);halo.visible=i===0;
    const medal=new T.Group();medal.position.set(0,.025,.12);root.add(medal);medals.push(medal);
    faceDisk(.32,.075,gold,medal,0,0);faceDisk(.277,.03,blue,medal,0,.05);
    mesh(()=>new T.TorusGeometry(.294,.02,12,64),paleGold,medal,0,0,.065);
    for(let j=0;j<24;j++){const a=j*Math.PI/12;orb(.009,paleGold,medal,Math.sin(a)*.26,Math.cos(a)*.26,.078);}
    // Six reliefs: guiding star, lightning, open book, compass, growing sprout, planet.
    if(i===0)star(.17,paleGold,medal,0,0,.075);
    if(i===1){const sh=new T.Shape();sh.moveTo(.05,.2);sh.lineTo(-.14,-.025);sh.lineTo(-.015,-.025);sh.lineTo(-.05,-.2);sh.lineTo(.14,.03);sh.lineTo(.015,.03);sh.closePath();mesh(()=>new T.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2}),paleGold,medal,0,0,.08);}
    if(i===2){for(const side of [-1,1]){const page=box(.145,.24,.035,paleGold,medal,side*.082,0,.1);page.rotation.y=side*-.16;for(const yy of [-.06,0,.06])box(.09,.009,.01,navy,medal,side*.082,yy,.126);}box(.012,.27,.04,gold,medal,0,0,.11);}
    if(i===3){const compass=star(.19,paleGold,medal,0,0,.08);compass.scale.x=.65;mesh(()=>new T.TorusGeometry(.16,.009,8,48),gold,medal,0,0,.09);orb(.035,cyan,medal,0,0,.14);}
    if(i===4){box(.023,.25,.04,paleGold,medal,0,-.025,.1);for(const side of [-1,1]){const leaf=orb(.09,paleGold,medal,side*.07,.04,.1);leaf.scale.set(.55,1,.3);leaf.rotation.z=side*-.65;}mesh(()=>new T.TorusGeometry(.13,.012,8,32,Math.PI),gold,medal,0,-.12,.1).rotation.z=Math.PI;}
    if(i===5){orb(.12,paleGold,medal,0,0,.1);const orbit=mesh(()=>new T.TorusGeometry(.2,.015,10,64),cyan,medal,0,0,.1);orbit.rotation.set(.65,.25,-.4);}
    const lock=new T.Group();lock.position.set(.22,-.25,.23);root.add(lock);locks.push(lock);lock.visible=i>=3;
    box(.19,.16,.07,darkMetal,lock);mesh(()=>new T.TorusGeometry(.065,.018,10,32,Math.PI),paleGold,lock,0,.075,0);orb(.018,amber,lock,0,.01,.045);
    const target=mesh(()=>new T.PlaneGeometry(1.25,1.2),new T.MeshBasicMaterial({visible:false}),root,0,0,.4);materials.push(target.material);target.userData.badge=i;hitTargets.push(target);
    if(i>=3)medal.scale.setScalar(.85);
  }
  function setBadge(index:number,unlocked:boolean){if(index<0||index>=6)return;halos.forEach((h,i)=>{h.visible=i===index;});locks[index].visible=!unlocked;medals[index].scale.setScalar(unlocked?1:.85);renderer.shadowMap.needsUpdate=true;dirty=true;}
  const raycaster=new T.Raycaster();
  const pick=(event:PointerEvent)=>{const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);const hit=raycaster.intersectObjects(hitTargets)[0];if(hit)selected(hit.object.userData.badge);};
  renderer.domElement.addEventListener('pointerup',pick);

  await doorgaan();
  // Batch opaque static geometry to make high-detail fittings affordable on the web.
  scene.updateMatrixWorld(true);
  if(vast){
    // De vaste delen uit het bestand, elk met zijn eigen materiaal (op volgorde van `materials`).
    for(const o of vast){const m=materials[o.materiaal];if(!m)continue;const v=mesh(o.vorm,m,scene,0,0,0,true);o.plek.decompose(v.position,v.quaternion,v.scale);}
  }else{
    const vasteDelen:T.Mesh[]=[];
    const batches=new Map<T.Material,{objects:T.Mesh[];geometries:T.BufferGeometry[]}>();
    const isBadge=(o:T.Object3D):boolean=>badgeRoots.includes(o as T.Group)||(o.parent!==null&&isBadge(o.parent));
    const toBatch:T.Mesh<T.BufferGeometry,T.Material>[]=[];
    scene.traverse(o=>{if(isBadge(o)||!(o instanceof T.Mesh)||o===floor||o===backdrop||o===glass||Array.isArray(o.material))return;toBatch.push(o as T.Mesh<T.BufferGeometry,T.Material>);});
    for(const o of toBatch){await doorgaan();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);const b=batches.get(o.material)??{objects:[],geometries:[]};b.objects.push(o);b.geometries.push(g);batches.set(o.material,b);}
    for(const [m,b] of batches){await doorgaan();const g=mergeGeometries(b.geometries);if(g){vasteDelen.push(mesh(g,m,scene));b.objects.forEach(o=>{o.removeFromParent();o.geometry.dispose();});}b.geometries.forEach(g=>g.dispose());}
    if((window as {__atelierVast?:unknown}).__atelierVast===null)void bewaarVast(vasteDelen,materials);
  }
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  await doorgaan();
  const renderTarget=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:4});
  const composer=new EffectComposer(renderer,renderTarget);composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new T.Vector2(1,1),.2,.12,1.5);composer.addPass(bloom);
  const output=new OutputPass();composer.addPass(output);
  const views:Record<StudyView,{eye:T.Vector3;target:T.Vector3;fov:number}>={
    samen:{eye:V(4,5.3,16),target:V(.8,2.6,0),fov:46},
    podium:{eye:V(5.9,4.7,9.2),target:V(1.65,.65,1.2),fov:39},
    vitrine:{eye:V(-.4,3.2,7.8),target:V(-2.55,2.7,-1.25),fov:39},
    lintjes:{eye:V(5.5,3.4,6.5),target:V(4.75,2.75,-2.8),fov:39},
    koepel:{eye:V(0,5.5,15.7),target:V(0,4,-1),fov:62},
  };
  let active:StudyView='samen';
  const resize=()=>{
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    const v=views[active],factor=w/h<1?(active==='samen'?1.95:active==='koepel'?1.7:active==='lintjes'?1.65:1.3):1;
    // Widen the lens on narrow screens instead of moving the camera outside the shell.
    camera.aspect=w/h;camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.fov/2))*factor));
    camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);reflectieMaat(w,h);
    camera.position.copy(v.eye);camera.lookAt(v.target);camera.updateMatrixWorld();
    if(mascotAnchor){
      const feet=V(1.65,1.12,1.2).project(camera),head=V(1.65,3.35,1.2).project(camera);
      mascotAnchor.style.left=`${(feet.x+1)*w/2+host.offsetLeft}px`;
      mascotAnchor.style.top=`${(1-feet.y)*h/2+host.offsetTop}px`;
      mascotAnchor.style.height=`${Math.abs(head.y-feet.y)*h/2}px`;
      mascotAnchor.style.visibility=active==='samen'||active==='podium'||active==='koepel'?'visible':'hidden';
    }
    dirty=true;
  };
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const lost=(e:Event)=>{e.preventDefault();renderer.setAnimationLoop(null);failed();};renderer.domElement.addEventListener('webglcontextlost',lost);
  /*
    Snelheid (18 oktober 2026): de shaders van het atelier worden eerst in de
    achtergrond klaargezet (compileAsync), in plaats van bij de eerste
    tekening. Dat klaarzetten hield de pagina anders bijna een halve seconde
    vast. Het beeld zelf verandert niet. De render target staat er even bij,
    zodat precies dezelfde shaders klaarstaan als de composer straks gebruikt.
  */
  let compiled=false;
  // De shaders van de gloed (bloom) gaan op dezelfde manier mee, via een losse hulpscène.
  const postScene=new T.Scene(),postQuad=new T.PlaneGeometry(2,2).deleteAttribute('normal'); // zonder normalen, net als het vlak van de composer
  for(const m of [bloom.materialHighPassFilter,...bloom.separableBlurMaterials,bloom.compositeMaterial,bloom.blendMaterial]){const o=new T.Mesh(postQuad,m);o.frustumCulled=false;postScene.add(o);}
  renderer.setRenderTarget(composer.readBuffer);
  Promise.all([renderer.compileAsync(scene,camera),renderer.compileAsync(postScene,camera)]).catch(()=>{}).finally(()=>{postQuad.dispose();compiled=true;dirty=true;});
  renderer.setRenderTarget(null);
  // This design study only renders when changed, avoiding an idle animation/GPU loop.
  renderer.setAnimationLoop(()=>{if(disposed||!dirty||!panoramaReady||!compiled||document.hidden)return;composer.render();dirty=false;if(first){first=false;ready();}});
  return {badge:setBadge,view(v){active=v;resize();},glow(on){bloom.enabled=on;dirty=true;},foto(on){if(!panoramaReady||!compiled)return null;const was=bloom.enabled;bloom.enabled=on;composer.render();const url=renderer.domElement.toDataURL('image/jpeg',.9);bloom.enabled=was;dirty=true;return url;},dispose(){disposed=true;renderer.setAnimationLoop(null);observer.disconnect();renderer.domElement.removeEventListener('pointerup',pick);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set<T.BufferGeometry>();scene.traverse(o=>{if(o instanceof T.Mesh)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());floor.dispose();bloom.dispose();output.dispose();composer.dispose();env.dispose();panoramaTexture.dispose();renderer.dispose();renderer.domElement.remove();}};
}
