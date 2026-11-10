/**
 * Test van de verder-pijl in de gouden klokles (squla-klok-hoelaat-1-gouden), 10 november 2026.
 * Kijkt of tekst en pijl doen wat in SYNTHESIS-ANALYSE/PIJL-KLOK.md bij Synthesis is gezien.
 *
 *   node scripts/test-klok-gouden-pijl.mjs                 alle routes
 *   ROUTE=nee-fouten node scripts/test-klok-gouden-pijl.mjs
 *   FOTO=<map> node scripts/test-klok-gouden-pijl.mjs      ook schermfoto's
 *
 * Speelt de les in Chrome ZONDER VENSTER, met een LEEG profiel en `?naam=Testkind`, ZONDER koekje van een kind: de les
 * kan dan niets in de voortgang van een kind zetten. Na afloop kijkt het script of er in les_uitkomsten nieuwe regels
 * bijkwamen (de database wordt alleen gelezen); dan stopt het met een foutmelding.
 *
 * Bliepo "praat" met een nepstem (± 0,4 s + 25 ms per letter per zin), zodat er tijd is om tijdens het praten te tikken.
 * In de pagina noteert een klein script elke 50 ms: staat de pijl er, welke tekst staat er, en wat vraagt de les.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = "http://localhost:3000";
const LES = "squla-klok-hoelaat-1-gouden";
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const FOTO = process.env.FOTO ?? null;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));

const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();
const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));

const map = mkdtempSync(join(tmpdir(), "test-klok-pijl-"));
const poort = 9660 + (process.pid % 30);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
process.on("exit", () => {
  try {
    chrome.kill("SIGKILL");
  } catch {}
  try {
    rmSync(map, { recursive: true, force: true });
  } catch {}
});
let wsUrl = null;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    wsUrl = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl;
  } catch {
    await wacht(200);
  }
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
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

/* Nepstem + meetscript in de pagina. */
const IN_PAGINA = `
  const duur = (t) => 400 + String(t || "").length * 25;
  HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); setTimeout(() => t.dispatchEvent(new Event("ended")), 1200); }, 20); return Promise.resolve(); };
  if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, duur(u.text)); }, 20);
  window.__meet = []; const t0 = performance.now(); let vorige = "";
  setInterval(() => {
    const b = document.querySelector('[data-knop="verder"]');
    const pijl = !!b && b.getBoundingClientRect().width > 3;
    const tekst = [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean);
    const taak = window.__phaser?.klokTaak ?? null;
    const kaart = !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]');
    const s = JSON.stringify({ pijl, tekst, taak: taak ? taak.soort + ":" + (taak.opties ? taak.opties.length : "") : null, kaart });
    if (s !== vorige) { vorige = s; window.__meet.push({ t: Math.round(performance.now() - t0), pijl, tekst, taak: taak ? taak.soort + ":" + (taak.opties ? taak.opties.length : "") : null, kaart }); }
  }, 50);
`;

async function pagina() {
  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  await stuur("Page.enable", {}, s);
  await stuur("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, s);
  await stuur("Page.addScriptToEvaluateOnNewDocument", { source: IN_PAGINA }, s);
  await stuur("Network.enable", {}, s);
  await stuur("Network.clearBrowserCookies", {}, s);
  const ev = async (e) => {
    const r = await stuur("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }, s).catch(() => null);
    return r && !r.exceptionDetails ? r.result?.value : null;
  };
  const tik = async (p) => {
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y }, s);
    await stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", clickCount: 1, buttons: 1 }, s);
    await stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "left", clickCount: 1, buttons: 0 }, s);
  };
  const foto = async (naam) => {
    if (!FOTO) return;
    mkdirSync(FOTO, { recursive: true });
    const { data } = await stuur("Page.captureScreenshot", { format: "png" }, s);
    writeFileSync(join(FOTO, `${naam}.png`), Buffer.from(data, "base64"));
  };
  await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${LES}?naam=Testkind` }, s);
  const log = () => ev(`JSON.stringify(window.__gouden ?? [])`).then((x) => JSON.parse(x ?? "[]"));
  const nu = () => ev(`(() => { const b = document.querySelector('[data-knop="verder"]'); const taak = window.__phaser?.klokTaak ?? null; return { pijl: !!b && b.getBoundingClientRect().width > 3, tekst: [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean), taak, kaart: !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]'), t: Math.round(performance.now()) }; })()`);
  const klikTekst = (t) => ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === ${JSON.stringify(t)} && b.getBoundingClientRect().width > 3); if (!b) return false; b.click(); return true; })()`);
  const klikPijl = () => ev(`(() => { const b = document.querySelector('[data-knop="verder"]'); if (!b || b.getBoundingClientRect().width < 3) return false; b.click(); return true; })()`);
  const klikKaart = () => ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => /af te vinken|kaart/i.test(b.getAttribute("aria-label") || "")); if (!b) return false; b.click(); return true; })()`);
  const meet = () => ev(`JSON.stringify(window.__meet)`).then((x) => JSON.parse(x ?? "[]"));
  return { ev, tik, foto, log, nu, klikTekst, klikPijl, klikKaart, meet, sluit: () => stuur("Target.closeTarget", { targetId }).catch(() => {}) };
}

const uitslag = [];
let fouten = 0;
const zie = (t) => {
  uitslag.push(`  ${t}`);
  console.log(`  ${t}`);
};
const fout = (t) => {
  fouten++;
  uitslag.push(`  FOUT: ${t}`);
  console.log(`  FOUT: ${t}`);
};

/**
 * Een speler: doet wat de les vraagt. `keuze(taak)` geeft het antwoord (standaard het goede). Bij een WACHT-pijl
 * (zegEnPijl: logregel "pijl" zonder "pijl-getikt" erna) eerst `wachtPijlMs` wachten en kijken dat er niets verandert.
 * Op een pijl die vanzelf doorgaat, wordt NIET getikt (tenzij `tikDoor`).
 */
async function speel(P, o = {}) {
  const keuze = o.keuze ?? ((taak) => taak.goed);
  const wachtPijlMs = o.wachtPijlMs ?? 2500;
  const tot = Date.now() + (o.maxMs ?? 25 * 60_000);
  let laatsteTaak = null;
  let wachtGecontroleerd = 0;
  while (Date.now() < tot) {
    const z = await P.nu();
    if (!z) {
      await wacht(150);
      continue;
    }
    if (z.kaart) {
      if (z.pijl) fout("pijl op de eindkaart");
      await P.foto?.(`${o.naam}-eindkaart`);
      await P.klikKaart();
      zie(`${o.naam}: ${wachtGecontroleerd} wacht-pijlen gecontroleerd (bleven staan tot de tik)`);
      return true;
    }
    const l = await P.log();
    const laatste = [...l].reverse().find((x) => /^pijl/.test(x.wat));
    const wachtPijl = laatste && laatste.wat === "pijl";
    if (z.pijl && wachtPijl && z.taak === null) {
      /* Een wacht-pijl: eerst de stem laten uitpraten (tekst 0,8 s gelijk), daarna mag er niets vanzelf gebeuren. */
      /* Eerst tot de laatste zin van dit stuk in beeld staat (zinnen komen 1 voor 1), dan nog tot de tekst 4 s gelijk blijft
         (ook de eventuele uitleg van de pijl erachter). */
      const laatsteZin = String(laatste.zin ?? "").replace(/\{(\d+)(:[a-z]+)?\}/g, "$1").split(/(?<=[.!?])\s+/).pop().slice(0, 25);
      for (let k = 0; k < 300 && laatsteZin && !(await P.nu()).tekst.join(" ").includes(laatsteZin); k++) await wacht(100);
      if (/met de klok mee/i.test(laatsteZin)) await P.foto(`${o.naam}-stapel-met-de-klok-mee`);
      let tekst = JSON.stringify((await P.nu()).tekst);
      for (let rust = 0, k = 0; rust < 4000 && k < 300; k++) {
        await wacht(100);
        const t = JSON.stringify((await P.nu()).tekst);
        const praat = await P.ev(`!!document.querySelector(".bliepo-tekst-nog")`);
        rust = t === tekst && !praat ? rust + 100 : 0;
        tekst = t;
      }
      const aantalLog = (await P.log()).length;
      await wacht(wachtPijlMs);
      const na = await P.nu();
      const nieuwLog = (await P.log()).slice(aantalLog).filter((x) => /^pijl|^vraag|^reactie/.test(x.wat));
      if (!na.pijl || JSON.stringify(na.tekst) !== tekst || nieuwLog.length) fout(`wacht-pijl ging vanzelf door: ${tekst}`);
      else wachtGecontroleerd++;
      await P.klikPijl();
      await wacht(150);
      continue;
    }
    const taak = z.taak;
    if (taak && taak.soort === "kies") {
      const sleutel = `${taak.vraag}:${taak.poging}:${taak.n}`;
      if (sleutel !== laatsteTaak) {
        /* Bij een vraag met keuzes nooit een pijl. Even wachten tot de knoppen er staan. */
        await wacht(250);
        const z2 = await P.nu();
        if (z2.pijl && z2.taak?.soort === "kies" && z2.taak.opties.length > 1) fout(`pijl bij een vraag (${taak.vraag})`);
        laatsteTaak = sleutel;
        const x = taak.opties.length === 1 ? taak.goed : keuze(taak);
        if (await P.klikTekst(x)) await wacht(200);
        else laatsteTaak = null;
      }
    } else if (taak && taak.soort === "getal") {
      const p = await P.ev(`window.__phaser?.klokGetal?.(3) ?? null`);
      if (p) await P.tik(p);
      await wacht(400);
    } else if (taak && (taak.soort === "uur")) {
      const sleutel = `uur:${taak.doel}:${taak.poging}:${taak.n}`;
      if (sleutel !== laatsteTaak) {
        laatsteTaak = sleutel;
        await wacht(o.opdrachtWacht ?? 300);
        await P.ev(`window.__phaser?.klokZet?.(${(taak.doel % 12) * 60})`);
        await wacht(300);
      }
    }
    await wacht(120);
  }
  fout(`${o.naam}: niet binnen de tijd bij de kaart`);
  return false;
}

/** Controles op het hele meetlogboek van een route. */
async function controleer(P, naam) {
  const m = await P.meet();
  const l = await P.log();
  /* 1. Elke "pijl-door" eindigt met "pijl-weg" of "pijl-getikt" (de pijl blijft nooit hangen). */
  const doors = l.filter((x) => x.wat === "pijl-door").length;
  const weg = l.filter((x) => x.wat === "pijl-weg").length;
  const opdr = l.filter((x) => x.wat === "pijl-opdracht").length;
  const getikt = l.filter((x) => x.wat === "pijl-getikt").length;
  const wachten = l.filter((x) => x.wat === "pijl").length;
  zie(`${naam}: ${doors} stukken die vanzelf doorgaan, ${opdr} opdrachtzinnen met pijl, ${wachten} stukken die op de pijl wachten, ${getikt} keer op de pijl getikt, ${weg} keer pijl vanzelf weg`);
  if (doors + opdr > weg + getikt - wachten + 0 && doors + opdr - weg > getikt) fout(`${naam}: een pijl is niet weggegaan`);
  /* 2. Hoe lang staat de pijl er na het einde van een stuk dat vanzelf doorgaat? Meet in het logboek van de pagina. */
  let langste = 0;
  let aan = null;
  for (const r of m) {
    if (r.pijl && aan === null) aan = r.t;
    if (!r.pijl && aan !== null) {
      langste = Math.max(langste, r.t - aan);
      aan = null;
    }
  }
  /* 3. Nooit pijl en keuzevraag tegelijk. */
  const samen = m.filter((r) => r.pijl && r.taak && r.taak.startsWith("kies:") && !r.taak.endsWith(":1"));
  if (samen.length) fout(`${naam}: ${samen.length} keer pijl en keuzevraag tegelijk`);
  /* 4. Meer dan 1 zin tegelijk in beeld (stapel). */
  const stapel = m.filter((r) => r.tekst.length > 1);
  zie(`${naam}: ${stapel.length} momenten met meer zinnen onder elkaar (voorbeeld: ${JSON.stringify(stapel[0]?.tekst ?? []).slice(0, 160)})`);
  return { m, l };
}

const ROUTES = {
  /** Nee, alles goed; op een wacht-pijl 2,5 s wachten (er mag niets gebeuren), nooit tikken op een pijl die vanzelf gaat. */
  async "nee-goed"(P) {
    for (let i = 0; i < 2000 && !(await P.nu())?.pijl; i++) await wacht(100);
    const begin = await P.nu();
    zie(`begin: pijl bij de groet = ${begin.pijl}, tekst ${JSON.stringify(begin.tekst)}`);
    if (!begin.pijl) fout("geen pijl tijdens de groet");
    await P.foto("nee-goed-01-groet-met-pijl");
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    const sv = await P.nu();
    await wacht(400);
    const sv2 = await P.nu();
    if (sv2.pijl) fout("pijl bij de startvraag");
    zie(`startvraag: pijl = ${sv2.pijl}, ${JSON.stringify(sv.tekst)}`);
    await P.foto("nee-goed-02-startvraag-zonder-pijl");
    await P.klikTekst("Nee");
    let fotoStapel = false;
    const fotoKlaar = (async () => {
      for (let i = 0; i < 8000 && !fotoStapel; i++) {
        const z = await P.nu();
        if (z?.tekst?.length > 1 && z.tekst.some((t) => /met de klok mee/i.test(t))) {
          await P.foto("nee-goed-03-stapel-met-de-klok-mee");
          fotoStapel = true;
        }
        await wacht(100);
      }
    })();
    const ok = await speel(P, { naam: "nee-goed" });
    await fotoKlaar;
    if (!fotoStapel) fout("geen 2 zinnen onder elkaar gezien bij 'met de klok mee'");
    await controleer(P, "nee-goed");
    return ok;
  },
  /** Nee, met fouten: 1e fout = wacht-pijl (8 s), tik tijdens het praten, 2e fout = vanzelf door; opdracht + hulphandje. */
  async "nee-fouten"(P) {
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await P.klikTekst("Nee");
    /* Stap 4 fout: "Een klok". */
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "stap4-hoe-heet"; i++) await wacht(100);
    await wacht(300);
    const t4 = (await P.nu()).taak;
    const fout4 = t4.opties.find((x) => x !== t4.goed);
    await P.klikTekst(fout4);
    for (let i = 0; i < 2000 && !(await P.nu()).pijl; i++) await wacht(100);
    await wacht(300);
    const hint = await P.nu();
    await P.foto("nee-fouten-01-hint-met-pijl");
    /* Wacht tot de stem klaar is en dan nog 8 s. */
    for (let i = 0; i < 2000 && !(await P.log()).some((x) => x.wat === "pijl"); i++) await wacht(100);
    await wacht(9000);
    const hint2 = await P.nu();
    if (!hint2.pijl || JSON.stringify(hint2.tekst) !== JSON.stringify(hint.tekst).replace(/\]$/, "") + "]" && hint2.tekst[0] !== hint.tekst[0]) fout("hint na 1e fout wachtte niet op de pijl");
    zie(`1e fout: na 9 s staat de pijl er nog = ${hint2.pijl}; tekst ${JSON.stringify(hint2.tekst)}`);
    await P.foto("nee-fouten-02-hint-na-9s");
    await P.klikPijl();
    /* 2e fout: dezelfde foute keuze. */
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.poging !== 2; i++) await wacht(100);
    await wacht(300);
    await P.klikTekst(fout4);
    const t0 = Date.now();
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.poging !== 3; i++) await wacht(100);
    zie(`2e fout: na ${((Date.now() - t0) / 1000).toFixed(1)} s vanzelf bij de kleine stap (zonder tik)`);
    const ks = await P.nu();
    if (ks.taak?.poging !== 3) fout("2e fout: kwam niet vanzelf bij de kleine stap");
    if (ks.pijl) fout("pijl bij de kleine stap");
    await P.foto("nee-fouten-03-kleine-stap");
    await P.klikTekst(ks.taak.goed);
    /* Stap 5: de opdrachtzin met pijl, daarna geen pijl; het hulphandje komt na ± 6 s. */
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.soort !== "getal"; i++) await wacht(100);
    const o1 = await P.nu();
    zie(`opdracht: pijl tijdens de zin = ${o1.pijl}`);
    if (!o1.pijl) fout("geen pijl tijdens de opdrachtzin");
    await P.foto("nee-fouten-04-opdracht-met-pijl");
    for (let i = 0; i < 2000 && !(await P.log()).some((x) => x.wat === "vraag-klaar" && x.t > 0) ; i++) await wacht(100);
    await wacht(1500);
    const o2 = await P.nu();
    if (o2.pijl) fout("pijl bleef staan na de opdrachtzin");
    zie(`opdracht: 1,5 s na de zin pijl = ${o2.pijl}, de les wacht op tikken = ${o2.taak?.soort === "getal"}`);
    await wacht(6000);
    const o3 = await P.nu();
    const hand = (await P.log()).some((x) => x.wat === "aanwijzing");
    zie(`opdracht: na 7,5 s hulphandje = ${hand}, pijl = ${o3.pijl}, nog steeds opdracht = ${o3.taak?.soort === "getal"}`);
    if (!hand) fout("geen hulphandje bij de opdracht");
    await P.foto("nee-fouten-05-hulphandje");
    const p = await P.ev(`window.__phaser?.klokGetal?.(3) ?? null`);
    await P.tik(p);
    /* Stap 7: fout, en dan TIJDENS de hint op de pijl tikken. */
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "stap7-hoogste"; i++) await wacht(100);
    await wacht(400);
    const t7 = (await P.nu()).taak;
    await P.klikTekst(t7.opties.find((x) => x !== t7.goed));
    for (let i = 0; i < 2000 && !(await P.nu()).pijl; i++) await wacht(50);
    await wacht(400);
    const voor = await P.nu();
    const praatVoor = await P.ev(`!!document.querySelector(".bliepo-tekst-nog")`);
    await P.klikPijl();
    const tTik = Date.now();
    let na = voor;
    for (let i = 0; i < 60; i++) {
      na = await P.nu();
      if (JSON.stringify(na.tekst) !== JSON.stringify(voor.tekst)) break;
      await wacht(30);
    }
    zie(`tik tijdens het praten (nog grijze woorden: ${praatVoor}): na ${Date.now() - tTik} ms nieuwe tekst ${JSON.stringify(na.tekst).slice(0, 90)}`);
    if (JSON.stringify(na.tekst) === JSON.stringify(voor.tekst)) fout("tik tijdens het praten: tekst bleef staan");
    /* Daarna gewoon goed spelen tot het eind. */
    const ok = await speel(P, { naam: "nee-fouten" });
    await controleer(P, "nee-fouten");
    return ok;
  },
  /** Ja, proef goed, daarna alles goed. */
  async "ja-goed"(P) {
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await P.klikTekst("Ja");
    const ok = await speel(P, { naam: "ja-goed" });
    await controleer(P, "ja-goed");
    return ok;
  },
  /** Ja, 2 fouten in de proef (= uitleg), daarna steeds eerst fout en dan goed (veel wacht-pijlen), tot het eind. */
  async "ja-fout"(P) {
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await P.klikTekst("Ja");
    let k = 0;
    const ok = await speel(P, { naam: "ja-fout", wachtPijlMs: 1200, keuze: (t) => (t.poging === 1 && k++ % 2 === 0 ? t.opties.find((x) => x !== t.goed) : t.goed), maxMs: 30 * 60_000 });
    await controleer(P, "ja-fout");
    return ok;
  },
  /** Tik op de pijl tijdens de opdrachtzin: de stem stopt, de pijl is weg, de les wacht nog op de opdracht. */
  async "opdracht-tik"(P) {
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await P.klikTekst("Nee");
    /* Snel door de uitleg tot stap 14 (eerste "zet de kleine wijzer"). */
    const klaar = speel(P, { naam: "opdracht-tik", wachtPijlMs: 300, opdrachtWacht: 60_000, maxMs: 20 * 60_000 });
    for (let i = 0; i < 2400 && (await P.nu())?.taak?.soort !== "uur"; i++) await wacht(100);
    for (let i = 0; i < 2000 && !(await P.nu()).pijl; i++) await wacht(50);
    const voor = await P.nu();
    await P.klikPijl();
    await wacht(400);
    const na = await P.nu();
    zie(`opdracht-tik: voor de tik pijl = ${voor.pijl}; 0,4 s na de tik pijl = ${na.pijl}, nog opdracht = ${na.taak?.soort === "uur"}`);
    if (!voor.pijl) fout("geen pijl tijdens de opdrachtzin (stap 14)");
    if (na.pijl || na.taak?.soort !== "uur") fout("na tik op de pijl bij een opdracht: pijl bleef of de opdracht verdween");
    await wacht(3000);
    const later = await P.nu();
    if (later.taak?.soort !== "uur") fout("opdracht ging vanzelf door");
    /* De speler zet de wijzer na 60 s; hier niet afwachten: zet hem nu zelf. */
    await P.ev(`window.__phaser?.klokZet?.(${(later.taak.doel % 12) * 60})`);
    void klaar;
    return true;
  },
};

const kies = process.env.ROUTE ? process.env.ROUTE.split(",") : Object.keys(ROUTES);
for (const r of kies) {
  console.log(`\n${r}`);
  uitslag.push(`\n${r}`);
  const P = await pagina();
  try {
    await ROUTES[r](P);
  } catch (e) {
    fout(`${r}: ${e.message}`);
  }
  await P.sluit();
}

const nieuw = sql(`select count(*) from les_uitkomsten where id > ${startId};`);
console.log(`\nNieuwe regels in les_uitkomsten: ${nieuw} (hoogste id was ${startId})`);
if (Number(nieuw) > 0) fout("er kwamen regels bij in les_uitkomsten");
console.log(fouten ? `\n${fouten} FOUT(EN)` : "\nAlles in orde.");
process.exit(fouten ? 1 : 0);
