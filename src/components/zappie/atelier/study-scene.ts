import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type StudyView = 'samen' | 'podium' | 'vitrine' | 'koepel';
export type StudyController = { view: (v: StudyView) => void; glow: (v: boolean) => void; dispose: () => void };
const V = (x:number,y:number,z:number) => new T.Vector3(x,y,z);

/** First art-direction slice: modeled objects, physical materials, HDR glow and planar reflections. */
export function createStudy(host: HTMLDivElement, ready: () => void, failed: () => void): StudyController {
  let dirty=true,disposed=false,first=true,panoramaReady=false;
  const renderer = new T.WebGLRenderer({ antialias: true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
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
  function mesh(g:T.BufferGeometry,m:T.Material,p:T.Object3D,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
  const box=(w:number,h:number,d:number,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(.05,h/3)),m,p,x,y,z);
  const cyl=(a:number,b:number,h:number,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>mesh(new T.CylinderGeometry(a,b,h,96),m,p,x,y,z);
  const orb=(r:number,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>mesh(new T.SphereGeometry(r,24,16),m,p,x,y,z);
  const ring=(r:number,t:number,m:T.Material,p:T.Object3D,y:number)=>{const o=mesh(new T.TorusGeometry(r,t,12,128),m,p,0,y,0);o.rotation.x=Math.PI/2;return o;};
  function star(r:number,m:T.Material,p:T.Object3D,x:number,y:number,z:number){
    const s=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,rr=i%2?r*.46:r;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;if(i===0)s.moveTo(px,py);else s.lineTo(px,py);}s.closePath();
    return mesh(new T.ExtrudeGeometry(s,{depth:.065,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,steps:1}),m,p,x,y,z);
  }
  // Warm key, cool rim and localized pools of light; deliberately restrained ambient light.
  scene.add(new T.HemisphereLight('#91caff','#07122c',0.65));
  const key=new T.DirectionalLight('#ffdea3',2.6);key.position.set(-3,9,6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:30});key.shadow.normalBias=.035;scene.add(key);
  const rim=new T.DirectionalLight('#4da5ff',2.1);rim.position.set(4,7,-4);scene.add(rim);
  const lights:T.PointLight[]=[];
  function pool(color:string,intensity:number,x:number,y:number,z:number,distance=7){const l=new T.PointLight(color,intensity,distance,2);l.position.set(x,y,z);scene.add(l);lights.push(l);return l;}
  pool('#10cfff',5,1.65,1.5,1.2);pool('#ffbb50',2.5,-2.5,3,-.5);pool('#4e99ff',12,1,5,-4,14);

  // A real reflected floor, with independent gold inlays and a stone foundation.
  const floor=new Reflector(new T.CircleGeometry(18.8,128),{color:0x38485e,textureWidth:1024,textureHeight:1024,clipBias:.003,multisample:0});
  floor.rotation.x=-Math.PI/2;floor.position.y=-.025;scene.add(floor);
  cyl(18.8,18.8,.25,navy,scene,0,-.17);
  const inlays=new T.Group();scene.add(inlays);
  for(const r of [3.7,5.8,8.1,14.8,18.5])ring(r,.013,gold,inlays,.005);

  // Approved panorama on a cylindrical backdrop, separate from the modeled interior.
  const panoramaTexture=new T.TextureLoader().load('/atelier/sterrenwerkplaats-panorama.webp',()=>{
    if(disposed)return;
    panoramaReady=true;dirty=true;host.dataset.panorama='ready';
  },undefined,()=>{if(!disposed)failed();});
  panoramaTexture.colorSpace=T.SRGBColorSpace;
  panoramaTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const backdropMaterial=new T.MeshBasicMaterial({map:panoramaTexture,side:T.DoubleSide,fog:false,toneMapped:false});
  materials.push(backdropMaterial);
  const backdropGeometry=new T.BufferGeometry(),bp:number[]=[],bu:number[]=[],bi:number[]=[];
  const radius=55,span=2,backdropHeight=radius*span/3;
  for(let i=0;i<=128;i++){
    const u=i/128,a=(u-.5)*span-.12;
    for(const v of [0,1]){bp.push(Math.sin(a)*radius,5+(v-.5)*backdropHeight,-Math.cos(a)*radius);bu.push(u,v);}
    if(i<128){const n=i*2;bi.push(n,n+1,n+2,n+1,n+3,n+2);}
  }
  backdropGeometry.setAttribute('position',new T.Float32BufferAttribute(bp,3));
  backdropGeometry.setAttribute('uv',new T.Float32BufferAttribute(bu,2));backdropGeometry.setIndex(bi);backdropGeometry.computeVertexNormals();
  const backdrop=mesh(backdropGeometry,backdropMaterial,scene);backdrop.castShadow=false;backdrop.receiveShadow=false;

  // Clear ellipsoidal shell, modeled brass ribs, perimeter light and a small crown oculus.
  const dome=new T.Group();scene.add(dome);
  const domeRadius=18.5,domeHeight=13.5;
  const glassMaterial=new T.MeshPhysicalMaterial({color:'#b2dfff',metalness:0,roughness:.12,clearcoat:1,clearcoatRoughness:.1,transparent:true,opacity:.065,side:T.BackSide,depthWrite:false,envMapIntensity:.6});
  materials.push(glassMaterial);
  const glass=mesh(new T.SphereGeometry(1,96,48,0,Math.PI*2,0,Math.PI/2),glassMaterial,dome,0,.25,0);
  glass.scale.set(domeRadius,domeHeight,domeRadius);glass.castShadow=false;glass.receiveShadow=false;glass.renderOrder=3;
  const structuralGold=physical('#b98531',.8,.28);
  ring(domeRadius,.13,structuralGold,dome,.18);
  ring(domeRadius-.16,.022,cyan,dome,.28);
  for(let i=0;i<12;i++){
    const a=(i+.5)*Math.PI/6,points:T.Vector3[]=[];
    for(let j=0;j<=64;j++){const t=j/64*Math.PI/2;points.push(V(Math.sin(a)*domeRadius*Math.cos(t),.25+domeHeight*Math.sin(t),Math.cos(a)*domeRadius*Math.cos(t)));}
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),96,.055,8,false),structuralGold,dome);
    // Low brass sockets make the ribs read as real supporting architecture.
    cyl(.2,.28,.42,navy,dome,Math.sin(a)*domeRadius,.26,Math.cos(a)*domeRadius);
    cyl(.23,.23,.075,paleGold,dome,Math.sin(a)*domeRadius,.48,Math.cos(a)*domeRadius);
  }
  const latitude=.43;
  ring(domeRadius*Math.cos(latitude),.032,structuralGold,dome,.25+domeHeight*Math.sin(latitude));
  ring(1.15,.08,structuralGold,dome,13.72);
  ring(1.05,.018,cyan,dome,13.7);
  pool('#9060ff',5,7,3,-8,16);

  // Hero pedestal: turned profiles, inset curved panels, machined seams and glowing portholes.
  const podium=new T.Group();podium.position.set(1.65,0,1.2);scene.add(podium);
  const profile=[[0,0],[2.72,0],[2.83,.07],[2.83,.15],[2.73,.23],[2.58,.25],[2.5,.34],[2.37,.93],[2.32,1.01],[0,1.01]].map(([x,y])=>new T.Vector2(x,y));
  mesh(new T.LatheGeometry(profile,128),blue,podium);
  cyl(2.76,2.79,.07,gold,podium,0,.13);
  ring(2.72,.026,cyan,podium,.26);
  cyl(2.38,2.43,.1,paleGold,podium,0,.96);
  cyl(2.28,2.28,.075,navy,podium,0,1.035);
  ring(2.14,.052,cyan,podium,1.083);
  ring(1.72,.022,cyan,podium,1.085);
  ring(1.27,.012,paleGold,podium,1.085);
  cyl(1.18,1.18,.025,blue,podium,0,1.085);
  for(let i=0;i<18;i++){
    const a=i*Math.PI*2/18;
    const panel=new T.Group();panel.position.set(Math.sin(a)*2.46,.62,Math.cos(a)*2.46);panel.rotation.y=a;panel.rotation.x=-.23;podium.add(panel);
    box(.62,.46,.045,navy,panel);
    for(const x of [-.32,.32]){box(.014,.53,.055,gold,panel,x,0,0);for(const y of [-.22,.22])orb(.024,paleGold,panel,x,y,.045);}
    const bezel=mesh(new T.TorusGeometry(.115,.035,12,32),gold,panel,0,0,.06);
    bezel.scale.y=1.15;
    mesh(new T.SphereGeometry(.095,24,16),amber,panel,0,0,.072).scale.set(1,1.15,.4);
  }
  const crest=new T.Group();crest.position.set(0,.63,2.53);podium.add(crest);
  mesh(new T.TorusGeometry(.3,.035,12,48),gold,crest);
  mesh(new T.CircleGeometry(.28,48),inset,crest,0,0,.002);
  star(.22,amber,crest,0,0,.025);
  // Fine engraved radial markers on the luminous deck.
  for(let i=0;i<48;i++){const a=i*Math.PI/24;const tick=box(.012,.01,i%4===0?.18:.07,paleGold,podium,Math.sin(a)*1.93,1.085,Math.cos(a)*1.93);tick.rotation.y=a;}

  // One finished cabinet, with a continuous curved arch and lit shelf recesses.
  const cabinet=new T.Group();cabinet.position.set(-2.55,0,-1.5);scene.add(cabinet);
  function archShape(r:number,spring:number){const s=new T.Shape();s.moveTo(-r,0);s.lineTo(-r,spring);s.absarc(0,spring,r,Math.PI,0,true);s.lineTo(r,0);s.closePath();return s;}
  const extrude=(shape:T.Shape,depth:number,m:T.Material,z:number)=>mesh(new T.ExtrudeGeometry(shape,{depth,curveSegments:48,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:3,steps:1}),m,cabinet,0,.2,z);
  extrude(archShape(1.5,3.7),.42,blue,-.54);
  extrude(archShape(1.31,3.68),.035,inset,-.065);
  function archTrim(r:number,spring:number,thickness:number,m:T.Material,z:number){
    const path=new T.CurvePath<T.Vector3>();path.add(new T.LineCurve3(V(-r,0,z),V(-r,spring,z)));
    for(let i=0;i<64;i++){const a=Math.PI-i*Math.PI/64,b=Math.PI-(i+1)*Math.PI/64;path.add(new T.LineCurve3(V(Math.cos(a)*r,spring+Math.sin(a)*r,z),V(Math.cos(b)*r,spring+Math.sin(b)*r,z)));}
    path.add(new T.LineCurve3(V(r,spring,z),V(r,0,z)));
    mesh(new T.TubeGeometry(path,180,thickness,10,false),m,cabinet,0,.2,0);
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
  // Upper shelf: a blue enamel explorer helmet with gold rim and a raised crest.
  const helmet=new T.Group();helmet.position.set(0,3.76,.27);cabinet.add(helmet);
  cyl(.6,.62,.09,velvet,helmet,0,-.12);
  mesh(new T.SphereGeometry(.47,48,24,0,Math.PI*2,0,Math.PI/2),blue,helmet,0,.02).scale.y=.86;
  cyl(.48,.5,.07,gold,helmet,0,.04);
  const brim=cyl(.5,.51,.04,blue,helmet,0,0,.2);brim.scale.z=1.15;
  star(.13,paleGold,helmet,0,.23,.42);
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
  // Lower shelf: star wand and luminous crystal, each with its own display base.
  for(const x of [-.58,.58]){cyl(.3,.33,.07,gold,cabinet,x,.78,.32);cyl(.24,.27,.17,velvet,cabinet,x,.9,.32);}
  cyl(.03,.04,.48,gold,cabinet,-.58,1.2,.32);star(.2,amber,cabinet,-.58,1.54,.32);
  mesh(new T.OctahedronGeometry(.23),cyan,cabinet,.58,1.32,.32).scale.y=1.55;
  ring(.24,.016,paleGold,cabinet,1.15).position.x=.58;

  // Batch opaque static geometry to make high-detail fittings affordable on the web.
  scene.updateMatrixWorld(true);
  const batches=new Map<T.Material,{objects:T.Mesh[];geometries:T.BufferGeometry[]}>();
  scene.traverse(o=>{if(!(o instanceof T.Mesh)||o===floor||o===backdrop||o===glass||Array.isArray(o.material))return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);const b=batches.get(o.material)??{objects:[],geometries:[]};b.objects.push(o);b.geometries.push(g);batches.set(o.material,b);});
  for(const [m,b] of batches){const g=mergeGeometries(b.geometries);if(g){mesh(g,m,scene);b.objects.forEach(o=>{o.removeFromParent();o.geometry.dispose();});}b.geometries.forEach(g=>g.dispose());}
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const renderTarget=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:4});
  const composer=new EffectComposer(renderer,renderTarget);composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new T.Vector2(1,1),.2,.12,1.5);composer.addPass(bloom);
  const output=new OutputPass();composer.addPass(output);
  const views:Record<StudyView,{eye:T.Vector3;target:T.Vector3;fov:number}>={
    samen:{eye:V(4,5.3,14),target:V(0,2.6,0),fov:43},
    podium:{eye:V(5.9,4.7,9.2),target:V(1.65,.65,1.2),fov:39},
    vitrine:{eye:V(-.4,3.2,7.8),target:V(-2.55,2.7,-1.25),fov:39},
    koepel:{eye:V(0,5.5,15.7),target:V(0,4,-1),fov:62},
  };
  let active:StudyView='samen';
  const resize=()=>{
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    const v=views[active],factor=w/h<1?(active==='samen'?1.95:active==='koepel'?1.7:1.3):1;
    // Widen the lens on narrow screens instead of moving the camera outside the shell.
    camera.aspect=w/h;camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(v.fov/2))*factor));
    camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);
    camera.position.copy(v.eye);camera.lookAt(v.target);camera.updateMatrixWorld();dirty=true;
  };
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const lost=(e:Event)=>{e.preventDefault();renderer.setAnimationLoop(null);failed();};renderer.domElement.addEventListener('webglcontextlost',lost);
  // This design study only renders when changed, avoiding an idle animation/GPU loop.
  renderer.setAnimationLoop(()=>{if(disposed||!dirty||!panoramaReady||document.hidden)return;composer.render();dirty=false;if(first){first=false;ready();}});
  return {view(v){active=v;resize();},glow(on){bloom.enabled=on;dirty=true;},dispose(){disposed=true;renderer.setAnimationLoop(null);observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set<T.BufferGeometry>();scene.traverse(o=>{if(o instanceof T.Mesh)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());floor.dispose();bloom.dispose();output.dispose();composer.dispose();env.dispose();panoramaTexture.dispose();renderer.dispose();renderer.domElement.remove();}};
}
