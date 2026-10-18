/**
 * Maakt public/atelier/sterrenwerkplaats-vast-<nummer>.glb: alle vaste delen
 * van het atelier, vooraf gebouwd (18 oktober 2026, snelheid, optie 1). Het
 * atelier laadt dit bestand in plaats van honderden vormen zelf uit te rekenen;
 * het ziet er precies hetzelfde uit.
 *
 * Opnieuw maken (alleen nodig als je de vaste delen in
 * src/components/zappie/atelier/study-scene.ts verandert):
 *   1. open de startpagina, zet in de console `window.__atelierVast = null` en
 *      herlaad niet; scroll dan pas naar het atelier (hij bouwt nu alles zelf);
 *   2. download het resultaat in de console met:
 *      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([window.__atelierVast]));a.download='atelier-vast-ruw.glb';a.click()
 *   3. installeer de gereedschappen los (ze zitten niet in het project):
 *      npm i --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
 *   4. node scripts/maak-atelier-vast.mjs ~/Downloads/atelier-vast-ruw.glb public/atelier/sterrenwerkplaats-vast-<nieuw nummer>.glb
 *   5. zet dat nummer ook in VAST_BESTAND in study-scene.ts.
 *
 * Wat het doet: gelijke hoekpunten samenvoegen (weld, verliesloos) en
 * meshopt-compressie met fijne quantisatie (posities 16 bits, normalen 12
 * bits): veel kleiner, zonder zichtbaar verschil. De normalen moeten blijven
 * (keepAttributes): het hulpmateriaal in het bestand is onverlicht, dus prune
 * zou ze anders weggooien. De namen (m<nummer> = welk
 * materiaal) blijven staan.
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, prune, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const [bron, uit] = process.argv.slice(2);
const doc = await io.read(bron);
await doc.transform(prune({ keepAttributes: true }), weld(), meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12 }));
await io.write(uit, doc);
console.log(uit);
