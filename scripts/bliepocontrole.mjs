/**
 * Bliepo-controle (26 oktober 2026, opdracht eigenaar): faalt als Bliepo of
 * zijn tekst in het gedeelde opdrachtscherm niet helemaal zichtbaar is, of
 * achter de bovenbalk valt.
 *
 * Waarom: in de instaptoets stond Bliepo achter de bovenbalk (alleen zijn
 * wielen waren te zien). Een regel van het oude donkere thema van de
 * Godot-spellen zette hem op 20% van boven, en het nieuwe ontwerp schoof hem
 * daarna nog eens zijn eigen hoogte omhoog. Niemand zag het, want er faalde
 * niets. Nu wel.
 *
 * Hoe: opent /voorbeeld/stijl (dezelfde onderdelen als elke opdracht:
 * bovenbalk, bord, BliepoVloer) in Chrome zonder venster, op vier
 * schermmaten, met een korte en een heel lange opdracht, en ook zoals een
 * opdracht met een Godot-spel. Per keer: Bliepo en zijn tekst moeten
 * helemaal in beeld staan (op telefoon en tablet na naar beneden schuiven,
 * daar staat hij onder het bord), en nergens onder de bovenbalk.
 *
 *   npm run bliepo                       tegen http://localhost:3000
 *   BASIS=https://… WW=… npm run bliepo  tegen een andere site (met slot)
 *
 * Draait er geen site, dan stopt hij met een melding (in de bewaking vóór
 * een commit wordt hij dan overgeslagen, met een duidelijke waarschuwing).
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const IN_BEWAKING = process.env.BEWAAK === "1";

const SCHERMEN = [
  { naam: "grote laptop", b: 1920, h: 1080, mobiel: false },
  { naam: "kleine laptop", b: 1280, h: 720, mobiel: false },
  { naam: "tablet", b: 820, h: 1180, mobiel: true },
  { naam: "telefoon", b: 390, h: 844, mobiel: true },
];
const OPDRACHTEN = [
  { naam: "korte opdracht", query: "" },
  { naam: "heel lange opdracht, 6 lange zinnen", query: "?opdracht=lang&tekst=lang&zinnen=6" },
  { naam: "lange opdracht met Godot-spel", query: "?opdracht=lang&tekst=lang&ronde=godot" },
  { naam: "praten uit (grijze microfoonknop)", query: "?praten=uit&zinnen=6" },
  /* Ook een echte opdracht en een echte les (als Testkind), met de echte onderdelen. */
  { naam: "echte opdracht (Testkind)", pad: "/oefenen/rekenen/getallen/tellen-sprongen/oefening", kind: true },
  { naam: "echte les", pad: "/voorbeeld/les/optellen-onder-10?naam=Testkind", kind: true },
];

/* Het profiel "Testkind" (HARDE REGEL: testen als kind alleen met Testkind): uit de database van de laptop, of KIND=<id>. */
async function testkind() {
  if (process.env.KIND) return process.env.KIND;
  try {
    const { DatabaseSync } = await import("node:sqlite");
    const db = new DatabaseSync(new URL("../data/thuisles.db", import.meta.url).pathname, { readOnly: true });
    const rij = db.prepare("select id from kinderen where roepnaam = 'Testkind' limit 1").get();
    db.close();
    return rij?.id ?? null;
  } catch {
    return null;
  }
}

const CHROME = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

async function siteDraait() {
  try {
    const kop = process.env.WW ? { Authorization: "Basic " + Buffer.from("thuisles:" + process.env.WW).toString("base64") } : {};
    const r = await fetch(BASIS + "/voorbeeld/stijl", { headers: kop, signal: AbortSignal.timeout(60000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function startChrome() {
  const map = mkdtempSync(join(tmpdir(), "bliepocontrole-"));
  const poort = 9400 + Math.floor(Math.random() * 400);
  const proces = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try {
      const v = await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json());
      return { url: v.webSocketDebuggerUrl, stop: () => {
          proces.kill();
          /* Chrome schrijft soms nog even na; de tijdelijke map opruimen mag mislukken. */
          setTimeout(() => {
            try {
              rmSync(map, { recursive: true, force: true });
            } catch {}
          }, 500);
        },
      };
    } catch {
      await wacht(200);
    }
  }
  proces.kill();
  throw new Error("Chrome start niet.");
}

function verbind(url) {
  const ws = new WebSocket(url);
  let n = 0;
  const wachtend = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && wachtend.has(m.id)) {
      wachtend.get(m.id)(m);
      wachtend.delete(m.id);
    }
  });
  const stuur = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const id = ++n;
      wachtend.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  return new Promise((res) => ws.addEventListener("open", () => res({ stuur, sluit: () => ws.close() })));
}

/* In de pagina: waar staan de bovenbalk, Bliepo en zijn tekst? */
const MEET = `(() => {
  const vak = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, b: r.width, h: r.height }; };
  return { vw: innerWidth, vh: innerHeight, balk: vak('.vk'), robot: vak('.bliepo-vloer .bliepo-vloer-robot'), tekst: vak('.bliepo-vloer .bliepo-vloer-ballon'), knop: vak('.bliepo-vloer .gs-praatknop'), bord: vak('[data-oefenkaart]'), oranje: [...document.querySelectorAll('button')].some((b) => /Vraag het Bliepo/.test(b.textContent)) };
})()`;

function fouten(m, scherm) {
  const uit = [];
  const marge = 1;
  if (!m.robot) return ["Bliepo staat niet op het scherm."];
  if (!m.tekst) uit.push("de tekst van Bliepo staat niet op het scherm");
  if (m.robot.h < 80) uit.push(`Bliepo is te klein (${Math.round(m.robot.h)} px hoog)`);
  /* De microfoonknop naast Bliepo moet er altijd staan (26 oktober 2026, opdracht eigenaar). */
  if (!m.knop) uit.push("de microfoonknop staat niet naast Bliepo");
  if (m.oranje) uit.push('de oranje knop "Vraag het Bliepo" staat er nog');
  else if (m.knop.b < 40) uit.push(`de microfoonknop is te klein (${Math.round(m.knop.b)} px)`);
  for (const [naam, r] of [["Bliepo", m.robot], ["zijn tekst", m.tekst], ["de microfoonknop", m.knop]]) {
    if (!r) continue;
    if (r.top < -marge || r.left < -marge || r.right > m.vw + marge || r.bottom > m.vh + marge)
      uit.push(`${naam} valt (deels) buiten beeld (boven ${Math.round(r.top)}, onder ${Math.round(r.bottom)}, links ${Math.round(r.left)}, rechts ${Math.round(r.right)}; scherm ${m.vw} x ${m.vh})`);
    /* De bovenbalk: niets van Bliepo of zijn tekst mag eronder vallen, zolang de balk in beeld is. */
    if (m.balk && m.balk.bottom > 0 && r.top < m.balk.bottom - marge && r.bottom > m.balk.top && r.right > m.balk.left && r.left < m.balk.right)
      uit.push(`${naam} valt achter de bovenbalk (bovenkant ${Math.round(r.top)}, balk tot ${Math.round(m.balk.bottom)})`);
  }
  if (m.tekst && m.robot && m.tekst.bottom > m.robot.top + 24) uit.push("de tekst staat over Bliepo heen");
  /* De zinnen mogen niet over het bord vallen. */
  const overlapt = (a, b) => a && b && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
  if (overlapt(m.tekst, m.bord)) uit.push("de tekst van Bliepo valt over het bord");
  if (overlapt(m.knop, m.bord)) uit.push("de microfoonknop valt over het bord");
  if (!scherm.mobiel && m.robot && m.robot.bottom < m.vh * 0.6) uit.push(`Bliepo staat niet op de vloer (onderkant op ${Math.round(m.robot.bottom)} van ${m.vh})`);
  return uit;
}

/*
  De oranje knop "Vraag het Bliepo" hoort nergens meer aan de kindkant (26
  oktober 2026, opdracht eigenaar): praten gaat met de ronde microfoonknop naast
  Bliepo. Eerst in de code: geen enkel bestand van de kindkant gebruikt nog
  VraagBliepo. Alleen de demo op /voorbeeld-bliepo (TutorDemo) en het onderdeel
  zelf mogen het nog hebben.
*/
function oranjeInCode() {
  const wortel = new URL("..", import.meta.url).pathname;
  const toegestaan = new Set(["src/components/tutor/VraagBliepo.tsx", "src/app/voorbeeld-bliepo/TutorDemo.tsx"]);
  const fout = [];
  const loop = (map) => {
    for (const naam of readdirSync(map)) {
      const pad = map + "/" + naam;
      if (statSync(pad).isDirectory()) loop(pad);
      else if (/\.(tsx?|jsx?)$/.test(naam)) {
        const rel = pad.slice(wortel.length);
        if (toegestaan.has(rel)) continue;
        const tekst = readFileSync(pad, "utf8");
        if (/<VraagBliepo\b|from "@\/components\/tutor\/VraagBliepo"/.test(tekst)) fout.push(rel);
      }
    }
  };
  loop(wortel + "src");
  return fout;
}

async function main() {
  const inCode = oranjeInCode();
  if (inCode.length) {
    console.error(`✗ De oranje knop "Vraag het Bliepo" wordt nog gebruikt in: ${inCode.join(", ")}`);
    process.exit(1);
  }
  console.log('✓ De oranje knop "Vraag het Bliepo" staat nergens meer in de code van de kindkant.');
  if (!CHROME) {
    console.error("Bliepo-controle: geen Chrome gevonden (zet CHROME=/pad/naar/chrome).");
    process.exit(IN_BEWAKING ? 0 : 1);
  }
  if (!(await siteDraait())) {
    const tekst = `Bliepo-controle: de site draait niet op ${BASIS}. Start eerst \`npm run dev\`.`;
    if (IN_BEWAKING) {
      console.warn(`\n⚠️  ${tekst} De Bliepo-controle is NU OVERGESLAGEN.\n`);
      process.exit(0);
    }
    console.error(tekst);
    process.exit(1);
  }
  const kindId = await testkind();
  const chrome = await startChrome();
  const { stuur, sluit } = await verbind(chrome.url);
  let mis = 0;
  let getest = 0;
  try {
    for (const scherm of SCHERMEN) {
      for (const opdracht of OPDRACHTEN) {
        if (opdracht.kind && !kindId) {
          console.warn(`⚠️  ${opdracht.naam} overgeslagen: geen Testkind gevonden (zet KIND=<id>).`);
          continue;
        }
        const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
        const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
        await stuur("Page.enable", {}, s);
        await stuur("Network.enable", {}, s);
        if (process.env.WW) await stuur("Network.setExtraHTTPHeaders", { headers: { Authorization: "Basic " + Buffer.from("thuisles:" + process.env.WW).toString("base64") } }, s);
        await stuur("Emulation.setDeviceMetricsOverride", { width: scherm.b, height: scherm.h, deviceScaleFactor: 1, mobile: scherm.mobiel }, s);
        const adres = BASIS + (opdracht.pad ?? "/voorbeeld/stijl" + opdracht.query);
        if (opdracht.kind) await stuur("Network.setCookie", { name: "thuisles_kind", value: kindId, url: adres }, s);
        await stuur("Page.navigate", { url: adres }, s);
        /* Wachten tot Bliepo er staat (en de lettertypes geladen zijn). */
        let m = null;
        for (let i = 0; i < 60; i++) {
          await wacht(250);
          const r = await stuur("Runtime.evaluate", { expression: `document.fonts.status === 'loaded' && !!document.querySelector('.bliepo-vloer-robot')`, returnByValue: true }, s);
          if (r.result?.value) break;
        }
        await wacht(600);
        if (scherm.mobiel) {
          /* Op telefoon en tablet staat Bliepo onder het bord: naar hem toe schuiven, zoals een kind dat doet. */
          await stuur("Runtime.evaluate", { expression: `document.querySelector('.bliepo-vloer')?.scrollIntoView({ block: 'end' })` }, s);
          await wacht(400);
        }
        m = (await stuur("Runtime.evaluate", { expression: MEET, returnByValue: true }, s)).result?.value;
        const f = fouten(m, scherm);
        getest++;
        if (f.length) {
          mis++;
          console.error(`✗ ${scherm.naam} (${scherm.b} x ${scherm.h}), ${opdracht.naam}:\n    - ${f.join("\n    - ")}`);
        } else {
          console.log(`✓ ${scherm.naam} (${scherm.b} x ${scherm.h}), ${opdracht.naam}`);
        }
        await stuur("Target.closeTarget", { targetId });
      }
    }
  } finally {
    sluit();
    chrome.stop();
  }
  if (mis) {
    console.error(`\nBliepo-controle: ${mis} van de ${getest} schermen kloppen niet. Bliepo of zijn tekst is niet helemaal zichtbaar.`);
    process.exit(1);
  }
  console.log(`\nBliepo-controle: alle ${getest} schermen goed. Bliepo en zijn tekst staan overal helemaal in beeld.`);
}

await main();
