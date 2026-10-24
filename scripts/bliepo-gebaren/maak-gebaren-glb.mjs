// JSON met quaternions (Blender-assen) -> klein glb-bestand met alleen scharnieren en animatieclips.
// Gebruik: node maak-gebaren-glb.mjs <gebaren.json> <uit.glb> [fps-uit]
import { readFileSync } from "node:fs";
import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression } from "@gltf-transform/extensions";
import { resample, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";

const [, , IN, UIT, FPS_UIT = "20"] = process.argv;
const data = JSON.parse(readFileSync(IN, "utf8"));
const stap = Math.max(1, Math.round(data.fps / Number(FPS_UIT)));
const doc = new Document();
const buf = doc.createBuffer();
const scene = doc.createScene("gebaren");
const knopen = {};
const knoop = (naam) => {
  if (!knopen[naam]) {
    knopen[naam] = doc.createNode(naam);
    scene.addChild(knopen[naam]);
  }
  return knopen[naam];
};
for (const [clip, sporen] of Object.entries(data.clips)) {
  const anim = doc.createAnimation(clip);
  for (const [naam, qs] of Object.entries(sporen)) {
    const tijden = [];
    const waarden = [];
    for (let i = 0; i < qs.length; i += stap) {
      const [x, y, z, w] = qs[i];
      tijden.push(i / data.fps);
      // Blender (z omhoog) naar glTF (y omhoog): (x, y, z) -> (x, z, -y).
      waarden.push(x, z, -y, w);
    }
    const sampler = doc
      .createAnimationSampler()
      .setInput(doc.createAccessor().setArray(new Float32Array(tijden)).setType("SCALAR").setBuffer(buf))
      .setOutput(doc.createAccessor().setArray(new Float32Array(waarden)).setType("VEC4").setBuffer(buf))
      .setInterpolation("LINEAR");
    anim.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(knoop(naam)).setTargetPath("rotation").setSampler(sampler));
  }
}
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
await doc.transform(resample({ tolerance: Number(process.env.TOL || 2e-4) }), meshopt({ encoder: MeshoptEncoder, level: "high" }));
const io = new NodeIO().registerExtensions([EXTMeshoptCompression]).registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
await io.write(UIT, doc);
console.log("geschreven", UIT);
