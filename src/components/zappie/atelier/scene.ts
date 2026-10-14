import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ITEMS, type AtelierController, type ItemId, type Outfit, type Station } from './model';

type Options = {
  host: HTMLDivElement;
  mascot: SVGSVGElement;
  anchors: Map<string, HTMLButtonElement>;
  onPick: (id: ItemId) => void;
  onReady: () => void;
  onError: () => void;
};
const V = (x: number, y: number, z: number) => new T.Vector3(x, y, z);
const PLACES = { petjes: V(-4.4, 0, -1.7), kleuren: V(0, 0, -4.3), extras: V(4.4, 0, -1.7) };
const VIEWS: Record<Station, { eye: T.Vector3; aim: T.Vector3 }> = {
  podium: { eye: V(0, 5.2, 13.8), aim: V(0, 2.05, -1.1) },
  petjes: { eye: V(-3.8, 3.6, 5.1), aim: V(-4.15, 2.15, -1.7) },
  kleuren: { eye: V(0.2, 4.4, 3.4), aim: V(0, 2.3, -4.3) },
  extras: { eye: V(3.8, 3.6, 5.1), aim: V(4.15, 2.15, -1.7) },
};

/** The room, podium, accessories and coastline are geometry, with a temporary SVG mascot sprite. */
export function createAtelier({ host, mascot, anchors, onPick, onReady, onError }: Options): AtelierController {
  const scene = new T.Scene();
  scene.background = new T.Color('#bde8f1');
  scene.fog = new T.Fog('#bde8f1', 35, 125);
  const camera = new T.PerspectiveCamera(45, 1, 0.1, 180);
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.setAttribute('aria-label', 'Driedimensionaal atelier met podium en drie vitrines');
  renderer.domElement.setAttribute('role', 'img');
  host.prepend(renderer.domElement);
  const pmrem = new T.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const envTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.6;
  environment.dispose();
  pmrem.dispose();
  const hemi = new T.HemisphereLight('#d8f5ff', '#697681', 2.0);
  scene.add(hemi);
  const sun = new T.DirectionalLight('#fff0c8', 3.2);
  sun.position.set(-8, 15, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 45 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const fill = new T.DirectionalLight('#7ddaff', 1.8);
  fill.position.set(7, 5, -6);
  scene.add(fill);

  const materials: T.Material[] = [];
  function mat(color: string, metalness = 0, roughness = 0.5, glow?: string) {
    const m = new T.MeshStandardMaterial({ color, metalness, roughness, ...(glow ? { emissive: glow, emissiveIntensity: 1.2 } : {}) });
    materials.push(m);
    return m;
  }
  const ivory = mat('#eae0c7', 0.18, 0.29), gold = mat('#d9a34b', 0.78, 0.24);
  const blue = mat('#103455', 0.3, 0.32), deep = mat('#0a2038', 0.2, 0.4);
  const cyan = mat('#64dfff', 0.35, 0.22, '#26b2d3'), warm = mat('#ffe7a3', 0.4, 0.23, '#ffc45d');
  const teal = mat('#147e86', 0.4, 0.35), leaf = mat('#327c69', 0.08, 0.85);
  const stone = mat('#92b6b5', 0.05, 0.8), cream = mat('#f9f0db', 0.05, 0.65);
  function mesh(geo: T.BufferGeometry, material: T.Material, parent: T.Object3D = scene, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geo, material);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  const box = (w: number, h: number, d: number, m: T.Material, p: T.Object3D, x = 0, y = 0, z = 0, r = 0.06) =>
    mesh(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const cyl = (rt: number, rb: number, h: number, m: T.Material, p: T.Object3D, x = 0, y = 0, z = 0, sides = 48) =>
    mesh(new T.CylinderGeometry(rt, rb, h, sides), m, p, x, y, z);
  function ring(r: number, tube: number, m: T.Material, p: T.Object3D, x = 0, y = 0, z = 0) {
    const a = mesh(new T.TorusGeometry(r, tube, 8, 80), m, p, x, y, z); a.rotation.x = Math.PI / 2; return a;
  }
  function orb(r: number, m: T.Material, p: T.Object3D, x = 0, y = 0, z = 0) {
    return mesh(new T.SphereGeometry(r, 20, 14), m, p, x, y, z);
  }
  function star(r: number, depth: number, m: T.Material, p: T.Object3D, x = 0, y = 0, z = 0) {
    const shape = new T.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + i * Math.PI / 5, radius = i % 2 ? r * 0.46 : r;
      const px = Math.cos(a) * radius, py = Math.sin(a) * radius;
      if (i === 0) shape.moveTo(px, py); else shape.lineTo(px, py);
    }
    shape.closePath();
    return mesh(new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.02 }), m, p, x, y, z);
  }
  function arch(width: number, spring: number, tube: number, p: T.Object3D, material: T.Material) {
    const points = [V(-width / 2, 0, 0), V(-width / 2, spring, 0)];
    for (let i = 0; i <= 32; i++) {
      const a = Math.PI - i * Math.PI / 32;
      points.push(V(Math.cos(a) * width / 2, spring + Math.sin(a) * width / 2, 0));
    }
    points.push(V(width / 2, 0, 0));
    for (let i = 1; i < points.length; i++) {
      const diff = points[i].clone().sub(points[i - 1]);
      const part = cyl(tube, tube, diff.length(), material, p);
      part.position.copy(points[i]).add(points[i - 1]).multiplyScalar(0.5);
      part.quaternion.setFromUnitVectors(V(0, 1, 0), diff.normalize());
    }
  }

  // Marble terrace, inlaid rings and gold radial seams.
  const room = new T.Group(); scene.add(room);
  cyl(9.1, 9.35, 0.45, ivory, room, 0, -0.3, 0, 96);
  ring(8.7, 0.07, gold, room, 0, -0.04);
  ring(6.9, 0.026, gold, room, 0, -0.06);
  ring(4.1, 0.02, gold, room, 0, -0.06);
  for (let i = 0; i < 24; i++) {
    const angle = i * Math.PI / 12;
    const seam = box(0.015, 0.012, 4.5, gold, room, Math.sin(angle) * 6.5, -0.065, Math.cos(angle) * 6.5, 0.002);
    seam.rotation.y = angle;
  }
  // A tall open arcade frames the view, with fluted pillars and glowing lanterns.
  for (const x of [-7.3, -3.65, 0, 3.65, 7.3]) {
    cyl(0.22, 0.29, 6.3, ivory, room, x, 3.1, -6.2);
    cyl(0.39, 0.4, 0.25, gold, room, x, 0.1, -6.2);
    cyl(0.39, 0.3, 0.25, gold, room, x, 5.2, -6.2);
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      cyl(0.025, 0.025, 4.8, gold, room, x + Math.cos(a) * 0.255, 2.6, -6.2 + Math.sin(a) * 0.255, 8);
    }
  }
  for (const x of [-5.475, -1.825, 1.825, 5.475]) {
    const a = new T.Group(); a.position.set(x, 0, -6.2); room.add(a); arch(3.65, 5.2, 0.16, a, ivory); arch(3.3, 5.2, 0.035, a, gold);
  }
  // Low balustrade with real openings, leaving the sea visible between columns.
  for (let i = -14; i <= 14; i++) cyl(0.048, 0.07, 0.85, ivory, room, i * 0.5, 0.5, -6.35, 8);
  box(14.8, 0.16, 0.28, gold, room, 0, 1.02, -6.35);

  // True 3D water and a distant fantasy coastline, no image backdrop.
  const water = mat('#289ea8', 0.45, 0.24);
  const sea = mesh(new T.PlaneGeometry(260, 230), water, scene, 0, -2.1, -70);
  sea.rotation.x = -Math.PI / 2; sea.receiveShadow = false;
  const ripples = new T.Group(); scene.add(ripples);
  const rippleMat = new T.MeshBasicMaterial({ color: '#b8f7ee', transparent: true, opacity: 0.22 }); materials.push(rippleMat);
  let seed = 17;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 90; i++) {
    const r = mesh(new T.PlaneGeometry(0.7 + random() * 3.2, 0.055), rippleMat, ripples, (random() - 0.5) * 90, -2.07, -8 - random() * 75);
    r.rotation.x = -Math.PI / 2; r.castShadow = false;
  }
  function tree(p: T.Object3D, x: number, y: number, z: number, s: number) {
    const g = new T.Group(); g.position.set(x, y, z); g.scale.setScalar(s); p.add(g);
    cyl(0.07, 0.13, 1.7, gold, g, 0, 0.8, 0, 8);
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4;
      const crown = orb(0.48, leaf, g, Math.sin(a) * 0.3, 1.55 + i * 0.12, Math.cos(a) * 0.3);
      crown.scale.set(0.8, 1.6, 0.8);
    }
  }
  function island(x: number, z: number, scale: number) {
    const g = new T.Group(); g.position.set(x, -2, z); g.scale.setScalar(scale); scene.add(g);
    const cliff = mesh(new T.CylinderGeometry(3.8, 2.9, 3.6, 9), stone, g, 0, 1.1, 0);
    cliff.rotation.y = random();
    cyl(3.9, 3.8, 0.2, leaf, g, 0, 2.9, 0, 16);
    for (let i = 0; i < 5; i++) {
      const bx = (random() - 0.5) * 5, bz = (random() - 0.5) * 4;
      const h = 1.7 + random() * 3.1, radius = 0.35 + random() * 0.28;
      cyl(radius, radius * 1.05, h, cream, g, bx, 3 + h / 2, bz, 12);
      cyl(radius * 1.3, radius * 1.3, 0.15, gold, g, bx, 3 + h, bz, 16);
      const dome = orb(radius * 1.23, teal, g, bx, 3 + h + 0.08, bz); dome.scale.y = 1.4;
      cyl(0.025, 0.025, 0.65, gold, g, bx, 3 + h + radius * 1.5, bz, 6);
      for (let j = 0; j < 3; j++) box(0.1, 0.36, 0.08, blue, g, bx + (j - 1) * 0.22, 3 + h * 0.64, bz + radius, 0.015);
    }
    for (let i = 0; i < 8; i++) tree(g, (random() - 0.5) * 5.5, 3, (random() - 0.5) * 5.5, 0.5 + random() * 0.4);
    const fall = mat('#a4f1ef', 0.25, 0.28, '#388d9c');
    box(0.55, 4.6, 0.1, fall, g, 1.0, 0.7, 3.0, 0.03);
  }
  island(-16, -25, 1.7); island(16, -34, 2); island(-3, -48, 2.6); island(31, -62, 2.6);
  const cloudMat = mat('#f4fbf7', 0, 1);
  for (let i = 0; i < 8; i++) {
    const g = new T.Group(); g.position.set(-65 + i * 19, 16 + random() * 8, -75); scene.add(g);
    for (let j = 0; j < 4; j++) { const c = orb(3 + random() * 2, cloudMat, g, j * 3, random(), 0); c.scale.y = 0.45; c.castShadow = false; }
  }

  // Plants and a velvet seat establish scale around the central pedestal.
  for (const x of [-6.9, 6.9]) {
    cyl(0.55, 0.38, 0.9, blue, room, x, 0.43, 0.3);
    ring(0.54, 0.045, gold, room, x, 0.88, 0.3);
    tree(room, x, 0.9, 0.3, 1.35);
  }
  cyl(0.8, 0.9, 0.18, gold, room, -3.5, 0.2, 3);
  cyl(0.78, 0.78, 0.65, blue, room, -3.5, 0.61, 3);
  cyl(0.8, 0.78, 0.18, teal, room, -3.5, 0.99, 3);

  const podium = new T.Group(); podium.position.set(0, 0, 1.5); scene.add(podium);
  cyl(2.12, 2.28, 0.22, gold, podium, 0, 0.09);
  cyl(1.98, 2.1, 0.5, blue, podium, 0, 0.41);
  cyl(1.97, 1.97, 0.15, gold, podium, 0, 0.72);
  cyl(1.82, 1.82, 0.08, deep, podium, 0, 0.82);
  ring(1.82, 0.033, cyan, podium, 0, 0.89);
  ring(1.54, 0.018, cyan, podium, 0, 0.89);
  ring(1.04, 0.013, gold, podium, 0, 0.9);
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    box(0.11, 0.31, 0.11, i % 2 ? gold : cyan, podium, Math.sin(a) * 2.03, 0.4, Math.cos(a) * 2.03, 0.035);
  }
  star(0.23, 0.08, warm, podium, 0, 0.42, 2.07);

  // Display cases and actual selectable objects, plus accessible DOM anchors.
  const pickables: T.Object3D[] = [], itemObjects = new Map<ItemId, T.Group>();
  const anchorPositions = new Map<string, T.Vector3>();
  function accessory(id: ItemId) {
    const g = new T.Group();
    if (id === 'pet') {
      const cap = mesh(new T.SphereGeometry(0.44, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), teal, g, 0, 0.06);
      cap.scale.y = 0.85;
      const brim = cyl(0.46, 0.46, 0.075, teal, g, 0, 0.02, 0.17); brim.scale.set(1.2, 1, 1);
      ring(0.44, 0.025, gold, g, 0, 0.06);
      star(0.12, 0.025, warm, g, 0, 0.21, 0.4);
    } else if (id === 'kroon') {
      cyl(0.4, 0.32, 0.19, gold, g, 0, 0.05);
      for (let i = 0; i < 7; i++) {
        const a = i * Math.PI * 2 / 7;
        const x = Math.sin(a) * 0.34, z = Math.cos(a) * 0.34;
        const point = mesh(new T.ConeGeometry(0.14, 0.46, 4), gold, g, x, 0.32, z);
        point.rotation.y = a;
        orb(0.055, warm, g, x, 0.55, z);
      }
      orb(0.075, cyan, g, 0, 0.08, 0.37);
    } else if (id === 'oceaan' || id === 'goud') {
      const potion = mesh(new T.IcosahedronGeometry(0.38, 1), id === 'oceaan' ? cyan : warm, g, 0, 0.2);
      potion.scale.y = 1.4;
      ring(0.44, 0.026, gold, g, 0, 0.1);
      orb(0.045, warm, g, 0.34, 0.68, 0);
    } else if (id === 'bril') {
      const glass = new T.MeshPhysicalMaterial({ color: '#39c4e7', metalness: 0.3, roughness: 0.15, transparent: true, opacity: 0.65 }); materials.push(glass);
      for (const x of [-0.24, 0.24]) {
        const rim = mesh(new T.TorusGeometry(0.21, 0.046, 8, 4), gold, g, x, 0.1); rim.rotation.z = Math.PI / 4;
        const lens = mesh(new T.CircleGeometry(0.19, 4), glass, g, x, 0.1, 0.005); lens.rotation.z = Math.PI / 4;
        box(0.04, 0.045, 0.3, gold, g, x * 1.8, 0.17, -0.12, 0.015);
      }
      box(0.16, 0.045, 0.05, gold, g, 0, 0.15, 0, 0.01);
    } else {
      cyl(0.045, 0.08, 0.5, gold, g, 0, 0.15);
      star(0.27, 0.07, warm, g, 0, 0.49);
      orb(0.095, cyan, g, 0, -0.12);
    }
    return g;
  }
  for (const station of ['petjes', 'kleuren', 'extras'] as const) {
    const p = PLACES[station];
    const cabinet = new T.Group(); cabinet.position.copy(p); scene.add(cabinet);
    // Deep blue niche; each arch, shelf and fitting is a separate mesh.
    box(2.95, 4.15, 0.5, deep, cabinet, 0, 2.05, -0.38, 0.2);
    const top = mesh(new T.SphereGeometry(1.45, 32, 16, 0, Math.PI, 0, Math.PI / 2), deep, cabinet, 0, 3.65, -0.38);
    top.scale.z = 0.2;
    const frame = new T.Group(); frame.position.z = 0.12; cabinet.add(frame);
    arch(2.8, 3.5, 0.07, frame, gold);
    arch(2.59, 3.5, 0.017, frame, warm);
    cyl(1.7, 1.8, 0.22, gold, cabinet, 0, 0.1, 0, 64).scale.z = 0.48;
    for (const y of [0.7, 2.5]) {
      box(2.6, 0.12, 1.05, gold, cabinet, 0, y, 0.15);
      box(2.4, 0.035, 0.06, warm, cabinet, 0, y - 0.075, 0.66, 0.01);
    }
    star(0.16, 0.04, gold, cabinet, 0, 4.15, 0.08);
    const stationItems = ITEMS.filter(i => i.station === station);
    stationItems.forEach((item, i) => {
      const obj = accessory(item.id); obj.position.set(0, i === 0 ? 3.03 : 1.22, 0.35); cabinet.add(obj);
      obj.userData.item = item.id; itemObjects.set(item.id, obj); pickables.push(obj);
      cyl(0.65, 0.72, 0.13, blue, cabinet, 0, i === 0 ? 2.64 : 0.84, 0.32);
      ring(0.66, 0.018, cyan, cabinet, 0, i === 0 ? 2.72 : 0.92, 0.32);
      anchorPositions.set(item.id, V(p.x, (i === 0 ? 2.53 : 0.73), p.z + 0.95));
    });
    anchorPositions.set(station, V(p.x, 4.95, p.z + 0.2));
  }

  // Existing mascot rendered onto a sprite in 3D space, replaceable by a GLB later.
  const mascotGroup = new T.Group(); mascotGroup.position.set(0, 0, 1.5); scene.add(mascotGroup);
  const svgCopy = mascot.cloneNode(true) as SVGSVGElement;
  svgCopy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgCopy.setAttribute('width', '504'); svgCopy.setAttribute('height', '592');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = '.zp-ogen-open,.zp-praat-golf{display:none}.zp-ogen-blij{display:block}';
  svgCopy.prepend(style);
  const texture = new T.Texture(); texture.colorSpace = T.SRGBColorSpace;
  const spriteMat = new T.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }); materials.push(spriteMat);
  const sprite = new T.Sprite(spriteMat); sprite.position.set(0, 2.06, 0); sprite.scale.set(1.99, 2.34, 1); mascotGroup.add(sprite);
  let disposed = false;
  const image = new Image();
  image.onload = () => { if (!disposed) { texture.image = image; texture.needsUpdate = true; dirty = true; } };
  image.onerror = () => { if (!disposed) onError(); };
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svgCopy))}`;
  const worn = new Map<ItemId, T.Group>();
  for (const id of ['pet', 'kroon', 'bril', 'antenne'] as const) {
    const a = accessory(id); a.visible = false;
    if (id === 'bril') { a.position.set(0, 2.52, 0.34); a.scale.setScalar(1.25); }
    else { a.position.set(0, 3.03, 0); a.scale.setScalar(id === 'antenne' ? 0.9 : 1.25); }
    mascotGroup.add(a); worn.set(id, a);
  }
  // Small rising motes around the glowing podium.
  const particlePositions = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) { const a = random() * Math.PI * 2; particlePositions.set([Math.sin(a) * (1.3 + random() * 0.5), 1 + random() * 2.5, 1.5 + Math.cos(a) * 1.7], i * 3); }
  const particleGeo = new T.BufferGeometry(); particleGeo.setAttribute('position', new T.BufferAttribute(particlePositions, 3));
  const particleMat = new T.PointsMaterial({ color: '#ffdea0', size: 0.035, transparent: true, opacity: 0.75 }); materials.push(particleMat);
  const particles = new T.Points(particleGeo, particleMat); scene.add(particles);

  // Batch static architecture by material: dozens of draw calls instead of hundreds.
  const batches = new Map<T.Material, { meshes: T.Mesh[]; geometry: T.BufferGeometry[] }>();
  const movingRoots = new Set<T.Object3D>([mascotGroup, ripples, ...itemObjects.values()]);
  scene.updateMatrixWorld(true);
  scene.traverse(object => {
    if (!(object instanceof T.Mesh) || Array.isArray(object.material)) return;
    let parent: T.Object3D | null = object;
    while (parent) { if (movingRoots.has(parent)) return; parent = parent.parent; }
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    const batch = batches.get(object.material) ?? { meshes: [], geometry: [] };
    batch.meshes.push(object); batch.geometry.push(geometry); batches.set(object.material, batch);
  });
  for (const [material, batch] of batches) {
    const combined = mergeGeometries(batch.geometry);
    if (combined) {
      const merged = mesh(combined, material);
      merged.castShadow = material !== water && material !== cloudMat;
      batch.meshes.forEach(m => { m.removeFromParent(); m.geometry.dispose(); });
    }
    batch.geometry.forEach(g => g.dispose());
  }
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  let dirty = true, previousRender = 0;
  let active: Station = 'podium', currentOutfit: Outfit = {}, inView = true;
  let width = 1, height = 1, last = 0, elapsed = 0, hovered: ItemId | null = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const aim = VIEWS.podium.aim.clone(), goalEye = VIEWS.podium.eye.clone(), goalAim = aim.clone();
  const point = new T.Vector3(), raycaster = new T.Raycaster(), pointer = new T.Vector2();
  function updateCameraGoal() {
    goalEye.copy(VIEWS[active].eye); goalAim.copy(VIEWS[active].aim);
    if (width / height < 1.1) {
      const factor = active === 'podium' ? Math.min(2.25, 1.08 / (width / height)) : 1.16;
      goalEye.sub(goalAim).multiplyScalar(factor).add(goalAim);
    }
  }
  const resize = () => {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.setSize(width, height, false); updateCameraGoal(); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  camera.position.copy(goalEye); camera.lookAt(aim);
  const intersection = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }, { rootMargin: '100px' });
  intersection.observe(host);
  function pick(event: PointerEvent): ItemId | null {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const found = raycaster.intersectObjects(pickables, true)[0];
    if (!found) return null;
    let object: T.Object3D | null = found.object;
    while (object && !object.userData.item) object = object.parent;
    return object?.userData.item ?? null;
  }
  const move = (e: PointerEvent) => { hovered = pick(e); dirty = true; renderer.domElement.style.cursor = hovered ? 'pointer' : 'default'; };
  const leave = () => { hovered = null; dirty = true; };
  const click = (e: PointerEvent) => { const id = pick(e); if (id) onPick(id); };
  const lost = (e: Event) => { e.preventDefault(); renderer.setAnimationLoop(null); onError(); };
  renderer.domElement.addEventListener('pointermove', move);
  renderer.domElement.addEventListener('pointerleave', leave);
  renderer.domElement.addEventListener('pointerup', click);
  renderer.domElement.addEventListener('webglcontextlost', lost);
  let ready = false;
  renderer.setAnimationLoop((time) => {
    if (disposed || document.hidden || !inView) { last = time; return; }
    if ((reducedMotion.matches && !dirty) || time - previousRender < 32) return;
    previousRender = time;
    const dt = Math.min((time - last) / 1000 || 0.016, 0.05); last = time; elapsed += dt;
    const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 4.5);
    camera.position.lerp(goalEye, blend); aim.lerp(goalAim, blend); camera.lookAt(aim);
    for (const [id, obj] of itemObjects) {
      const selected = Object.values(currentOutfit).includes(id);
      const scale = selected || hovered === id ? 1.14 : 1;
      obj.scale.lerp(V(scale, scale, scale), reducedMotion.matches ? 1 : 0.15);
      obj.rotation.y = reducedMotion.matches ? 0 : Math.sin(elapsed * 0.65) * 0.18;
    }
    if (!reducedMotion.matches) { particles.rotation.y = elapsed * 0.06; ripples.position.x = Math.sin(elapsed * 0.2) * 0.5; }
    for (const [id, pos] of anchorPositions) {
      const element = anchors.get(id); if (!element) continue;
      point.copy(pos).project(camera);
      const item = ITEMS.find(i => i.id === id);
      const visible = item ? item.station === active : active === 'podium';
      element.hidden = !visible || point.z > 1 || Math.abs(point.x) > 1.1 || Math.abs(point.y) > 1.1;
      element.style.transform = `translate(-50%,-50%) translate(${(point.x * 0.5 + 0.5) * width}px,${(-point.y * 0.5 + 0.5) * height}px)`;
    }
    renderer.render(scene, camera); dirty = false;
    if (!ready) { ready = true; onReady(); }
  });
  return {
    station(next) { active = next; updateCameraGoal(); dirty = true; },
    outfit(next) {
      currentOutfit = next; dirty = true; renderer.shadowMap.needsUpdate = true;
      for (const [id, obj] of worn) obj.visible = Object.values(next).includes(id);
      spriteMat.color.set(next.kleuren === 'oceaan' ? '#72d9ff' : next.kleuren === 'goud' ? '#ffe083' : '#ffffff');
    },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null); observer.disconnect(); intersection.disconnect();
      renderer.domElement.removeEventListener('pointermove', move); renderer.domElement.removeEventListener('pointerleave', leave);
      renderer.domElement.removeEventListener('pointerup', click); renderer.domElement.removeEventListener('webglcontextlost', lost);
      image.onload = null; image.onerror = null;
      const geometries = new Set<T.BufferGeometry>();
      scene.traverse(o => { if (o instanceof T.Mesh || o instanceof T.Points) geometries.add(o.geometry); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      texture.dispose(); envTarget.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
