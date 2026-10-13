/** Stop vóór bouwen wanneer een goedgekeurde afbeelding ontbreekt of beschadigd is. */
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import assert from "node:assert/strict";

const map = path.resolve("public/assets/zappie/illustraties");
const namen = ["eigen-wereld", "werkplaats", "atelier", "kust"];
try {
  const manifest = JSON.parse(await readFile(path.join(map, "manifest.json"), "utf8"));
  assert.equal(manifest.assets?.length, namen.length, "Het pakket moet vier illustraties bevatten.");
  let aantal = 0;
  let bytes = 0;
  for (const naam of namen) {
    const asset = manifest.assets.find((a) => a.naam === naam);
    assert.ok(asset, `Illustratie ontbreekt in manifest: ${naam}`);
    for (const breedte of [720, 1440]) {
      for (const formaat of ["avif", "webp"]) {
        const bestand = `${naam}-${breedte}.${formaat}`;
        const record = asset.bestanden.find((b) => b.file === bestand);
        assert.ok(record, `Bestand ontbreekt in manifest: ${bestand}`);
        const data = await readFile(path.join(map, bestand));
        assert.equal(data.length, record.bytes, `Onjuiste bestandsgrootte: ${bestand}`);
        assert.equal(createHash("sha256").update(data).digest("hex"), record.sha256, `Controlegetal klopt niet: ${bestand}`);
        assert.equal(record.width, breedte, `Onjuiste breedte in manifest: ${bestand}`);
        if (formaat === "webp") {
          assert.equal(data.toString("ascii", 0, 4), "RIFF", `Geen WebP: ${bestand}`);
          assert.equal(data.toString("ascii", 8, 12), "WEBP", `Geen WebP: ${bestand}`);
        } else {
          assert.equal(data.toString("ascii", 4, 8), "ftyp", `Geen AVIF: ${bestand}`);
          assert.match(data.toString("ascii", 8, 36), /avif/, `Geen AVIF: ${bestand}`);
        }
        aantal++;
        bytes += data.length;
      }
    }
  }
  console.log(`[Zappie] ${aantal} goedgekeurde beeldbestanden gecontroleerd (${(bytes / 1048576).toFixed(2)} MiB totaal; bezoekers laden alleen hun benodigde varianten).`);
} catch (fout) {
  console.error("[Zappie] De hoogwaardige illustraties ontbreken of zijn onvolledig. Plaats de volledige map illustraties in public/assets/zappie. De build stopt zodat geen kinderpagina met ontbrekende beelden wordt gepubliceerd.");
  console.error(fout instanceof Error ? fout.message : String(fout));
  process.exitCode = 1;
}
