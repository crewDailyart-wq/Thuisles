/**
 * Schermfoto van de EERSTE VRAAG van elke les uit public/beginzinnen/lijst.json
 * (1 november 2026, voor /admin/beginzinnen): public/beginzinnen/<id>.jpg,
 * 1280 px breed. De dev-server moet draaien. Speelt als Testkind via
 * scripts/speelcontrole.mjs (één les tegelijk). Bestaande foto's worden
 * overgeslagen tenzij FORCE=1. ALLEEN=id1,id2 beperkt tot die lessen.
 * De jpg's staan niet in Git (zie .gitignore).
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const MAP = path.join(WORTEL, "public/beginzinnen");
mkdirSync(MAP, { recursive: true });

const NOODLIJST = "squla-tellen-fruit-1,squla-tellen-resultatief2-1,squla-getallenlijn-rangschikken-1,squla-getallenlijn-dieren-2,squla-getallenlijn-terugtellen-1,squla-klok-hoelaat-1,squla-klok-klokkijken2-1,squla-meer-minder-evenveel1-1,squla-meer-minder-evenveel3-1,squla-meten-pizza-1,squla-meten-oppervlakte-1,squla-geld-geldmachine-1,squla-geld-zakgeld-1,squla-vormen-patronen-1,squla-vormen-kleuren-1,squla-splits-splitsen1-1,squla-splits-delen-1,squla-piraat-2,squla-rekenmix-mix1-1,squla-rekenmix-mix3-2,squla-tijd-dagen-1,squla-tijd-kalender-1,squla-plus-bakkerij-1,squla-plus-bus1-1,squla-min-machine-1,squla-min-ruimte-1,squla-dagen-van-de-week,squla-huisnummers,squla-klok-digitaal-1,squla-tellen-fruit-3".split(",");
let ids;
try {
  ids = JSON.parse(readFileSync(path.join(MAP, "lijst.json"), "utf8")).map((l) => l.id);
} catch {
  ids = NOODLIJST;
  console.log("Geen leesbare lijst.json: de noodlijst van 30 lessen wordt gebruikt.");
}
if (process.env.ALLEEN) ids = ids.filter((id) => process.env.ALLEEN.split(",").includes(id));

/* Het beginscherm ("Kun je dit al?", Ja/Nee, "Mooi.") telt niet mee. */
const isBegin = (tekst, knoppen) => /kun je dit al/i.test(tekst) || /^\s*mooi\b/i.test(tekst.replace(/^Bliepo:\s*/, "")) || /^ja \| nee$/i.test(knoppen.trim());
function kiesFoto(map) {
  const bestand = path.join(map, "schermen.txt");
  if (!existsSync(bestand)) return null;
  const regels = readFileSync(bestand, "utf8").split("\n").filter(Boolean).map((r) => {
    const [naam, tekst = "", knoppen = ""] = r.split("\t");
    return { naam, tekst: tekst.replace(/^Bliepo:\s*/, ""), knoppen: knoppen.replace(/^knoppen:\s*/, "") };
  });
  const rest = regels.filter((r) => !isBegin(r.tekst, r.knoppen));
  if (!rest.length) return null;
  const eerste = rest[0];
  /* Staat er zo meteen hetzelfde scherm mét keuzeknoppen, neem dan die. */
  const met = rest.slice(0, 3).find((r) => r.tekst === eerste.tekst && !/alleen in de tekening/.test(r.knoppen));
  return path.join(map, (met ?? eerste).naam);
}

let gelukt = 0;
const mislukt = [];
for (const id of ids) {
  const doel = path.join(MAP, `${id}.jpg`);
  if (existsSync(doel) && !process.env.FORCE) { gelukt++; continue; }
  let foto = null;
  for (let poging = 1; poging <= 2 && !foto; poging++) {
    const tmp = mkdtempSync(path.join(tmpdir(), "beginfoto-"));
    /* De speelcontrole speelt de hele les; wij hebben alleen de eerste vraag nodig en stoppen zodra die er is. */
    const proces = spawn("node", ["scripts/speelcontrole.mjs"], { cwd: WORTEL, env: { ...process.env, GOED: "1", LESSEN: id, MAXMIN: "2", SCHERMFOTO: tmp }, stdio: "ignore" });
    let klaar = false;
    proces.on("exit", () => (klaar = true));
    const begin = Date.now();
    while (!klaar && Date.now() - begin < 150_000) {
      await new Promise((r) => setTimeout(r, 1500));
      const lijstje = path.join(tmp, id, "schermen.txt");
      const n = existsSync(lijstje) ? readFileSync(lijstje, "utf8").split("\n").filter(Boolean).length : 0;
      if (n >= 5) break; /* genoeg schermen om de eerste vraag te kiezen */
    }
    proces.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 1500));
    const sub = path.join(tmp, id);
    const gekozen = existsSync(sub) ? kiesFoto(sub) : null;
    if (gekozen) {
      spawnSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "80", "--resampleWidth", "1280", gekozen, "--out", doel], { stdio: "ignore" });
      foto = existsSync(doel);
    }
    rmSync(tmp, { recursive: true, force: true });
  }
  if (foto) { gelukt++; console.log("ok   ", id); } else { mislukt.push(id); console.log("MISLUKT", id); }
}
console.log(`${gelukt} van ${ids.length} gelukt.${mislukt.length ? " Mislukt: " + mislukt.join(", ") : ""}`);
