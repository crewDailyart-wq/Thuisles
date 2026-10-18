/**
 * Eén 3D-motor voor alle Bliepo's op een pagina (18 oktober 2026, voor de
 * snelheid).
 *
 * Elke Bliepo had een eigen WebGL-motor. Elke motor zet zijn eigen
 * belichting en shaders klaar, en dat houdt de pagina bij het opstarten even
 * vast; met drie robots drie keer. Hier is er één motor, die buiten beeld
 * tekent. Elke Bliepo heeft een gewoon (2D-)tekenvlak op de pagina; de motor
 * tekent zijn plaatje en zet het daar in één keer neer (drawImage). Zo worden
 * belichting en shaders maar één keer klaargezet, hoeveel robots er ook zijn.
 */

import type { Camera, Scene, Texture, WebGLRenderer } from "three";

type Motor = {
  T: typeof import("three");
  renderer: WebGLRenderer;
  omgeving: Texture;
};

let motor: Promise<Motor> | null = null;

export function haalMotor(): Promise<Motor> {
  motor ??= (async () => {
    const [T, { RoomEnvironment }] = await Promise.all([
      import("three"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
    ]);
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(1);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.setScissorTest(true);
    const pmrem = new T.PMREMGenerator(renderer);
    const kamer = new RoomEnvironment();
    const omgeving = pmrem.fromScene(kamer, 0.04).texture;
    pmrem.dispose();
    kamer.dispose();
    return { T, renderer, omgeving };
  })();
  motor.catch(() => {
    motor = null;
  });
  return motor;
}

/**
 * Teken een scène in het 2D-tekenvlak `doel` (in pixels van dat vlak).
 * De motor groeit mee met het grootste vlak en tekent linksonder in zijn
 * eigen beeld; dat stukje gaat naar het doel.
 */
export function teken(m: Motor, scene: Scene, camera: Camera, doel: HTMLCanvasElement) {
  const b = doel.width;
  const h = doel.height;
  if (!b || !h) return;
  const huidig = m.renderer.domElement;
  if (huidig.width < b || huidig.height < h) {
    m.renderer.setSize(Math.max(huidig.width, b), Math.max(huidig.height, h), false);
  }
  m.renderer.setViewport(0, 0, b, h);
  m.renderer.setScissor(0, 0, b, h);
  m.renderer.clear();
  m.renderer.render(scene, camera);
  const ctx = doel.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, b, h);
  ctx.drawImage(huidig, 0, huidig.height - h, b, h, 0, 0, b, h);
}
