/**
 * Bliepo (het 3D-model) één keer laden, hoe vaak hij ook op de pagina staat
 * (18 oktober 2026, voor de snelheid).
 *
 * Het kleine model (zappie-klein.glb) is met meshopt gecomprimeerd; daarvoor
 * is de MeshoptDecoder nodig. Het model wordt één keer opgehaald en
 * uitgepakt; elke Bliepo op de pagina krijgt een kopie (er zijn geen
 * skeletten, dus een gewone kloon is genoeg). Three.js en de bewegingen komen
 * uit hetzelfde bestand als bij de grote versie (zappie.js).
 */

import type { Object3D } from "three";

export const KLEIN_MODEL = "/assets/zappie/3d/zappie-klein.glb";

let bron: Promise<Object3D> | null = null;

/** Het uitgepakte model, gedeeld; laad het hooguit één keer. */
function laadBron(): Promise<Object3D> {
  bron ??= (async () => {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import("three/examples/jsm/loaders/GLTFLoader.js"),
      import("three/examples/jsm/libs/meshopt_decoder.module.js"),
    ]);
    const lader = new GLTFLoader();
    lader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await lader.loadAsync(KLEIN_MODEL);
    return gltf.scene;
  })();
  bron.catch(() => {
    bron = null;
  });
  return bron;
}

/** Een eigen Bliepo, klaar voor de bewegingen uit zappie.js. */
export async function laadBliepoKlein() {
  const [scene, Z] = await Promise.all([laadBron(), import("@/lib/zappie3d/zappie")]);
  return Z.prepareZappie(scene.clone(true));
}
