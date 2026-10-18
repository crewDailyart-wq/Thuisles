/**
 * Maakt public/assets/zappie/3d/zappie-klein.glb: Bliepo (het 3D-model) kleiner,
 * zonder dat hij er anders uitziet (18 oktober 2026).
 *
 *   - de UV-coördinaten gaan eruit: het model heeft geen textures, ze werden
 *     nergens gebruikt;
 *   - meshopt-compressie met quantisatie (niveau "medium": verliesloos genoeg
 *     dat je geen verschil ziet). Namen van delen en materialen blijven, want
 *     de bewegingen in src/lib/zappie3d/zappie.js zoeken ze op naam.
 *
 * 1,81 MB → 0,52 MB (over het netwerk 0,61 → 0,24 MB).
 *
 * De gereedschappen zitten niet in het project; installeer ze los:
 *   npm i --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
 *   node scripts/maak-bliepo-klein.mjs public/assets/zappie/3d/zappie.glb public/assets/zappie/3d/zappie-klein.glb
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, prune } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const [bron, uit] = process.argv.slice(2);
const doc = await io.read(bron);
// Geen textures in dit model: de UV-coördinaten worden nergens gebruikt.
let weg = 0;
for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) { const uv = p.getAttribute('TEXCOORD_0'); if (uv) { p.setAttribute('TEXCOORD_0', null); weg++; } }
await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await io.write(uit, doc);
console.log('UV weg uit', weg, 'delen');
