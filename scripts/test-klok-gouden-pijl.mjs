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
const LES = process.env.LES ?? "squla-klok-hoelaat-1-gouden";
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const FOTO = process.env.FOTO ?? null;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));

const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();
const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));

const map = mkdtempSync(join(tmpdir(), "test-klok-pijl-"));
const poort = 9660 + (process.pid % 30);
const chrome = spawn(CHROME, [...(process.env.ZICHTBAAR ? ["--new-window", "--window-size=1440,960", "--no-default-browser-check"] : ["--headless=new", "--mute-audio"]), `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", ...(process.env.ECHTESTEM ? ["--autoplay-policy=document-user-activation-required"] : []), "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
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
  if (!${JSON.stringify(!!process.env.ECHTESTEM)}) HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); setTimeout(() => t.dispatchEvent(new Event("ended")), 1200); }, 20); return Promise.resolve(); };
  if (window.speechSynthesis && !${JSON.stringify(!!process.env.ECHTESTEM)}) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, duur(u.text)); }, 20);
  window.__stem = [];
  /* Stem-logboek (altijd): elke speak/start/end/error/cancel, en elk geluid dat start (bestand van Ruth via Web Audio of <audio>). */
  try {
    const n0 = () => Math.round(performance.now());
    const AB = window.AudioBufferSourceNode && AudioBufferSourceNode.prototype;
    if (AB) { const st = AB.start; AB.start = function (...a) { window.__stem.push({ t: n0(), wat: "geluid", z: window.__laatsteStemZin || "" }); return st.apply(this, a); }; }
    const HP = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...a) { window.__stem.push({ t: n0(), wat: "geluid", z: window.__laatsteStemZin || "" }); return HP.apply(this, a); };
    const F = window.fetch;
    window.fetch = function (u, ...r) { try { const url = String(u && u.url ? u.url : u); if (url.includes("/api/stem?zin=")) window.__laatsteStemZin = decodeURIComponent(new URL(url, location.href).searchParams.get("zin") || ""); } catch {} return F.call(this, u, ...r); };
  } catch {}
  if (window.speechSynthesis) {
    const ss = window.speechSynthesis; const spreek = ss.speak.bind(ss); const stop = ss.cancel.bind(ss);
    const n = () => Math.round(performance.now());
    ss.speak = (u) => { window.__stem.push({ t: n(), wat: "speak", z: u.text }); for (const e of ["start", "end", "error"]) u.addEventListener(e, (ev) => window.__stem.push({ t: n(), wat: e, z: u.text, fout: ev.error })); spreek(u); };
    ss.cancel = () => { window.__stem.push({ t: n(), wat: "cancel", door: (new Error().stack || "").split(String.fromCharCode(10)).slice(2, 4).join(" ").slice(0, 160) }); stop(); };
  }
  window.__meet = []; const t0 = performance.now(); let vorige = "";
  setInterval(() => {
    const b = document.querySelector('[data-knop="verder"]');
    const pijl = !!b && b.getBoundingClientRect().width > 3;
    const tekst = [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean);
    const taak = window.__phaser?.klokTaak ?? null;
    const kaart = !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]');
    /* Gedimd of wit (meelezen): hoeveel woorden nog gedimd zijn, en of Bliepo meeleest. */
    const nog = document.querySelectorAll(".bliepo-tekst-nog, .bliepo-tekst-later").length;
    const leest = !!document.querySelector(".bliepo-tekst-leest");
    /* Plek van het tekstvak, de eerste regel, de pijl en Bliepo (ontwerp Sara 10 nov: niets mag verspringen). */
    const rect = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width < 2 ? null : [Math.round(r.left), Math.round(r.top), Math.round(r.height)]; };
    const vak = document.querySelector(".bliepo-vloer-ballon");
    /* De tekst zelf: van de bovenkant van de eerste tot de onderkant van de laatste zin of knop in het vak. */
    const delen = [...document.querySelectorAll(".bliepo-vloer .bliepo-tekst, .bliepo-vloer .les-tekst button")].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 2);
    const inhoud = delen.length ? [Math.round(Math.min(...delen.map((r) => r.left))), Math.round(Math.min(...delen.map((r) => r.top))), Math.round(Math.max(...delen.map((r) => r.bottom)) - Math.min(...delen.map((r) => r.top))), Math.round(Math.max(...delen.map((r) => r.right)) - Math.min(...delen.map((r) => r.left)))] : null;
    const robotEl = document.querySelector(".bliepo-vloer-robot");
    const plek = { vak: rect(vak), regel: rect(document.querySelector(".bliepo-tekst")), pijl: pijl ? rect(b) : null, robot: rect(robotEl), robotB: robotEl ? Math.round(robotEl.getBoundingClientRect().width) : 0, inhoud, over: vak ? vak.scrollHeight - vak.clientHeight : 0 };
    const s = JSON.stringify({ pijl, tekst, taak: taak ? taak.soort + ":" + (taak.opties ? taak.opties.length : "") : null, kaart, dim: nog > 0, leest, plek });
    if (s !== vorige) { vorige = s; window.__meet.push({ t: Math.round(performance.now()), pijl, tekst, taak: taak ? taak.soort + ":" + (taak.opties ? taak.opties.length : "") : null, kaart, dim: nog > 0, leest, plek }); }
  }, 50);
`;

async function pagina() {
  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  await stuur("Page.enable", {}, s);
  if (!process.env.ZICHTBAAR) await stuur("Emulation.setDeviceMetricsOverride", { width: Number(process.env.VENSTER?.split("x")[0] ?? 1440), height: Number(process.env.VENSTER?.split("x")[1] ?? 900), deviceScaleFactor: 1, mobile: false }, s);
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
  if (process.env.ZICHTBAAR) await stuur("Target.activateTarget", { targetId }).catch(() => {});
  if (process.env.VIAOVERZICHT) {
    /* Zoals Sara: het lesoverzicht openen en echt op de les klikken (de app wisselt van pagina zonder te herladen). */
    await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les` }, s);
    let p = null;
    for (let i = 0; i < 100 && !p; i++) {
      await wacht(200);
      const r = await stuur("Runtime.evaluate", { expression: `(() => { const a = document.querySelector('a[href^="/voorbeeld/les/${LES}?"]'); if (!a) return null; a.scrollIntoView({ block: "center" }); return true; })()`, returnByValue: true }, s).catch(() => null);
      p = r?.result?.value ?? null;
    }
    await wacht(800);
    /* Na het scrollen opnieuw de plek bepalen en nagaan dat precies deze link onder de muis ligt. */
    const q = await stuur("Runtime.evaluate", { expression: `(() => { const a = document.querySelector('a[href^="/voorbeeld/les/${LES}?"]'); const r = a.getBoundingClientRect(); const x = r.left + Math.min(20, r.width / 2), y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, raak: !!e && (e === a || a.contains(e)) }; })()`, returnByValue: true }, s);
    p = q.result.value;
    if (!p.raak) throw new Error("de link naar de les ligt niet onder de muis");
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await stuur("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", clickCount: 1, buttons: type === "mousePressed" ? 1 : 0 }, s);
  } else
  await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${LES}?naam=Testkind` }, s);
  const log = () => ev(`JSON.stringify(window.__gouden ?? [])`).then((x) => JSON.parse(x ?? "[]"));
  const nu = () => ev(`(() => { const b = document.querySelector('[data-knop="verder"]'); const taak = window.__phaser?.klokTaak ?? null; return { pijl: !!b && b.getBoundingClientRect().width > 3, tekst: [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean), taak, kaart: !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]'), t: Math.round(performance.now()) }; })()`);
  const klikTekst = (t) => ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === ${JSON.stringify(t)} && b.getBoundingClientRect().width > 3); if (!b) return false; b.click(); return true; })()`);
  /* Zoals een kind: een echte muisklik op de plek waar de pijl staat (geen b.click()). Meldt als er iets anders boven de pijl ligt. */
  const klikPijl = async () => {
    const p = await ev(`(() => { const b = document.querySelector('[data-knop="verder"]'); if (!b) return null; const r = b.getBoundingClientRect(); if (r.width < 3) return null; const x = r.left + r.width / 2, y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, raak: !!e && (e === b || b.contains(e)), wat: e ? (e.getAttribute("aria-label") || e.className || e.tagName) : null }; })()`);
    if (!p) return false;
    if (!p.raak) fout(`iets anders ligt boven de pijl: ${p.wat}`);
    await tik(p);
    return true;
  };
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
 * Een speler (regel 15.27, 10 nov 2026): doet wat de les vraagt en tikt NOOIT op de pijl (de les moet vanzelf doorgaan).
 * `keuze(taak)` geeft het antwoord (standaard het goede).
 */
async function speel(P, o = {}) {
  const keuze = o.keuze ?? ((taak) => taak.goed);
  const tot = Date.now() + (o.maxMs ?? 25 * 60_000);
  let laatsteTaak = null;
  let langste = 0;
  let fotoNr = 0;
  while (Date.now() < tot) {
    const z = await P.nu();
    if (!z) {
      await wacht(150);
      continue;
    }
    /* Schermfoto's: het langste stuk tekst tot nu toe, en een paar gewone momenten. */
    const lengte = z.tekst.join(" ").length;
    if (lengte > langste + 20) {
      langste = lengte;
      await P.foto?.(`${o.naam}-langste-stuk`);
    }
    if (z.taak?.soort === "kies" && fotoNr < 2 && Math.random() < 0.05) await P.foto?.(`${o.naam}-moment-${++fotoNr}`);
    if (z.kaart) {
      await wacht(500);
      if ((await P.nu()).pijl) fout("pijl op de eindkaart");
      await P.foto?.(`${o.naam}-eindkaart`);
      await P.klikKaart();
      zie(`${o.naam}: tot de eindkaart gekomen zonder ooit op de pijl te tikken`);
      return true;
    }
    /* Alleen voor een oude versie (voor-meting): daar wachtten sommige stukken op de pijl; dan na 1,5 s tikken. */
    if (process.env.TIKWACHT && z.pijl && !z.taak) {
      const l = await P.log();
      const laatste = [...l].reverse().find((x) => /^pijl/.test(x.wat));
      if (laatste?.wat === "pijl") {
        await wacht(1500);
        await P.klikPijl();
        await wacht(300);
        continue;
      }
    }
    const taak = z.taak;
    if (taak && taak.soort === "kies") {
      const sleutel = `${taak.vraag}:${taak.poging}:${taak.n}`;
      if (sleutel !== laatsteTaak) {
        await wacht(250);
        const z2 = await P.nu();
        if (z2.pijl && z2.taak?.soort === "kies") fout(`pijl bij een vraag (${taak.vraag})`);
        laatsteTaak = sleutel;
        const x = taak.opties.length === 1 ? taak.goed : keuze(taak);
        if (await P.klikTekst(x)) await wacht(200);
        else laatsteTaak = null;
      }
    } else if (taak && taak.soort === "getal") {
      await wacht(300);
      if ((await P.nu()).pijl) fout("pijl bij de opdracht 'tik op een getal'");
      const p = await P.ev(`window.__phaser?.klokGetal?.(3) ?? null`);
      if (p) await P.tik(p);
      await wacht(400);
    } else if (taak && taak.soort === "uur") {
      const sleutel = `uur:${taak.doel}:${taak.poging}:${taak.n}`;
      if (sleutel !== laatsteTaak) {
        laatsteTaak = sleutel;
        await wacht(o.opdrachtWacht ?? 300);
        if ((await P.nu()).pijl) fout(`pijl bij de opdracht 'zet de kleine wijzer' (${taak.doel})`);
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
  const tel = (w) => l.filter((x) => x.wat === w).length;
  zie(`${naam}: ${tel("pijl-door")} stukken met pijl (allemaal vanzelf door), ${tel("opdrachtzin")} opdrachtzinnen zonder pijl, ${tel("pijl-getikt")} keer op de pijl getikt, ${l.filter((x) => x.wat === "pijl").length} stukken die op een tik wachten (moet 0)`);
  if (l.some((x) => x.wat === "pijl")) fout(`${naam}: er wacht nog een stuk op een tik`);
  /* Tijd van het einde van de zin tot het volgende stuk. "zin-klaar" komt 0,3 s na het einde van de stem (Lesscherm). */
  const tijden = [];
  for (let k = 0; k < l.length; k++) {
    if (l[k].wat !== "zin-klaar") continue;
    const stuk = [...l.slice(0, k)].reverse().find((x) => x.wat === "pijl-door");
    const volgende = l.slice(k + 1).find((x) => ["pijl-door", "vraag", "opdrachtzin", "kaart", "pijl-getikt"].includes(x.wat));
    if (!volgende || volgende.wat === "pijl-getikt") continue;
    tijden.push({ stuk: stuk?.zin ?? "", ms: volgende.t - l[k].t + 300, naar: volgende.wat });
  }
  const afwijkend = tijden.filter((x) => x.ms < 550 || x.ms > 950);
  const gem = tijden.length ? Math.round(tijden.reduce((a, x) => a + x.ms, 0) / tijden.length) : 0;
  zie(`${naam}: einde zin → volgend stuk: ${tijden.length} keer gemeten, gemiddeld ${gem} ms (doel ±700), kleinste ${Math.min(...tijden.map((x) => x.ms))} ms, grootste ${Math.max(...tijden.map((x) => x.ms))} ms; buiten 550–950 ms: ${afwijkend.length}`);
  for (const a of afwijkend.slice(0, 8)) zie(`   afwijkend: ${a.ms} ms na "${a.stuk.slice(0, 70)}" → ${a.naar}`);
  /* Echte stem: elke zin helemaal uitgesproken? (stem-logboek, alleen met ECHTESTEM=1) */
  const stemlog = await P.ev(`JSON.stringify(window.__stem ?? [])`).then((x) => JSON.parse(x ?? "[]"));
  if (stemlog.length) {
    const c = (w) => stemlog.filter((x) => x.wat === w).length;
    const fouten = {};
    for (const x of stemlog.filter((x) => x.wat === "error")) fouten[x.fout] = (fouten[x.fout] ?? 0) + 1;
    const kort = [];
    for (const x of stemlog.filter((x) => x.wat === "start")) {
      const e = stemlog.find((y) => y.t >= x.t && y.z === x.z && (y.wat === "end" || y.wat === "error"));
      if (e && e.wat === "error") kort.push(`${e.t - x.t} ms: ${x.z.slice(0, 50)} (${e.fout})`);
    }
    zie(`${naam}: stem: ${c("speak")} zinnen gestart, ${c("start")} begonnen, ${c("end")} helemaal uitgesproken, fouten ${JSON.stringify(fouten)}, ${c("cancel")} keer cancel`);
    for (const k of kort.slice(0, 5)) zie(`   afgebroken na ${k}`);
  }
  /* Dubbel uitgesproken (Sara 10 nov, F8): dezelfde uiting 2 keer gestart binnen 20 s zonder actie van het kind ertussen. */
  {
    const acties = l.filter((x) => ["tik", "pijl-getikt"].includes(x.wat)).map((x) => x.t);
    const starts = stemlog.filter((x) => x.wat === "speak" && x.z);
    let dubbel = 0;
    for (let i = 0; i < starts.length; i++)
      for (let j = i - 1; j >= 0 && starts[i].t - starts[j].t < 20000; j--)
        if (starts[j].z === starts[i].z) {
          if (!acties.some((t) => t > starts[j].t && t <= starts[i].t)) {
            dubbel++;
            if (dubbel <= 3) fout(`${naam}: F8 dezelfde uiting 2 keer gestart zonder actie (${starts[i].t - starts[j].t} ms): ${starts[i].z.slice(0, 70)}`);
          }
          break;
        }
    zie(`${naam}: F8-controle: ${dubbel} keer dezelfde uiting 2 keer gestart; ${stemlog.filter((x) => x.wat === "geluid").length} keer een geluidsbestand gestart`);
  }
  /* Gedimd/wit: komt een tekst die al wit was, weer gedimd terug zonder actie (F7 in gedimd/wit)? */
  let dimTerug = 0;
  for (let i = 1; i < m.length; i++) if (m[i].dim && !m[i - 1].dim && JSON.stringify(m[i].tekst) === JSON.stringify(m[i - 1].tekst)) dimTerug++;
  zie(`${naam}: ${dimTerug} keer werd dezelfde tekst weer gedimd (moet 0)`);
  if (dimTerug) fout(`${naam}: F7 gedimd/wit: dezelfde tekst werd ${dimTerug} keer weer gedimd`);
  /* Ontwerp (Sara 10 nov): verspringen > 2 px van tekstvak, eerste regel, pijl en Bliepo; pijl aan/uit tussen stukken. */
  const sprong = (sleutel) => {
    let vorig = null;
    let n = 0;
    const voorbeelden = [];
    /* Pas meten vanaf de eerste tekst (daarvoor laadt de pagina nog). */
    const begin = m.findIndex((r) => r.tekst.length > 0);
    for (const r of m.slice(Math.max(0, begin))) {
      const p = r.plek?.[sleutel];
      if (!p) continue;
      if (vorig && (Math.abs(p[0] - vorig[0]) > 2 || Math.abs(p[1] - vorig[1]) > 2 || (sleutel !== "regel" && Math.abs(p[2] - vorig[2]) > 2))) {
        n++;
        if (voorbeelden.length < 3) voorbeelden.push(`${JSON.stringify(vorig)}→${JSON.stringify(p)} bij "${(r.tekst[0] ?? "").slice(0, 40)}"`);
      }
      vorig = p;
    }
    return { n, voorbeelden };
  };
  const sprongen = {};
  for (const k of ["vak", "regel", "pijl", "robot"]) sprongen[k] = sprong(k);
  let knipper = 0;
  for (let i = 1; i < m.length; i++) {
    if (!m[i].pijl || m[i - 1].pijl) continue;
    /* De pijl kwam (terug). Was hij er kort daarvoor ook, zonder vraag/opdracht ertussen? Dan knippert hij. */
    let j = i - 1;
    while (j >= 0 && !m[j].pijl && !m[j].taak && !m[j].kaart) j--;
    if (j >= 0 && m[j].pijl) knipper++;
  }
  const over = Math.max(0, ...m.map((r) => r.plek?.over ?? 0));
  /* Overlap (Sara 10 nov): Bliepo mag nooit over de tekst, de knoppen of de pijl vallen; tekst nooit buiten het vak. */
  const doos = (r, b) => (r ? { l: r[0], t: r[1], r: r[0] + (b ?? 0), o: r[1] + r[2] } : null);
  const raakt = (a, c) => a && c && a.l < c.r - 1 && c.l < a.r - 1 && a.t < c.o - 1 && c.t < a.o - 1;
  let overlap = 0;
  let buiten = 0;
  const overVb = [];
  for (const r of m) {
    const p = r.plek;
    if (!p?.robot) continue;
    const robot = doos(p.robot, p.robotB);
    const tekst = p.inhoud ? { l: p.inhoud[0], t: p.inhoud[1], r: p.inhoud[0] + p.inhoud[3], o: p.inhoud[1] + p.inhoud[2] } : null;
    const pijlD = p.pijl ? doos(p.pijl, p.pijl[2]) : null;
    if (raakt(robot, tekst) || raakt(robot, pijlD)) {
      overlap++;
      if (overVb.length < 3) overVb.push(`Bliepo ${JSON.stringify(robot)} raakt tekst ${JSON.stringify(tekst)} bij "${(r.tekst.at(-1) ?? "").slice(0, 40)}"`);
    }
    if (p.vak && tekst && tekst.o > p.vak[1] + p.vak[2] + 1) buiten++;
  }
  zie(`${naam}: overlap Bliepo met tekst/knoppen/pijl: ${overlap}; tekst onder het vak uit: ${buiten}`);
  for (const v of overVb) zie(`   ${v}`);
  if (process.env.ONTWERP && (overlap || buiten)) fout(`${naam}: Bliepo overlapt de tekst (${overlap}) of tekst loopt uit het vak (${buiten})`);
  zie(`${naam}: sprongen > 2 px: tekstvak ${sprongen.vak.n}, eerste regel ${sprongen.regel.n}, pijl ${sprongen.pijl.n}, Bliepo ${sprongen.robot.n}; pijl weg en terug tussen stukken: ${knipper}; tekst te lang voor het vak: ${over > 2 ? over + " px" : "nee"}`);
  for (const k of ["vak", "regel", "pijl", "robot"]) for (const v of sprongen[k].voorbeelden) zie(`   sprong ${k}: ${v}`);
  if (process.env.ONTWERP) {
    if (sprongen.vak.n || sprongen.regel.n || sprongen.pijl.n || sprongen.robot.n) fout(`${naam}: er verspringt iets (> 2 px)`);
    if (knipper) fout(`${naam}: de pijl ging ${knipper} keer weg en kwam terug tussen stukken`);
    if (over > 2) fout(`${naam}: tekst past niet in het vak (${over} px te lang)`);
  }
  /* Nooit pijl en keuzevraag tegelijk. */
  /* Langer dan 1 meting (een enkele meting van 50 ms is het moment dat de knoppen net verschijnen). */
  const pk = (r) => r && r.pijl && r.taak && r.taak.startsWith("kies:") && !r.taak.endsWith(":1");
  const samen = m.filter((r, i) => pk(r) && pk(m[i + 1]));
  if (samen.length) fout(`${naam}: ${samen.length} keer pijl en keuzevraag tegelijk`);
  /* F7 (Sara, 10 nov 2026): dezelfde tekst verdwijnt en komt terug zonder dat het kind iets deed. */
  const actie = l.filter((x) => ["tik", "pijl-getikt"].includes(x.wat)).map((x) => x.t);
  const sleutel = (r) => r.tekst.join(" | ");
  let f7 = 0;
  for (let i = 1; i < m.length; i++) {
    const k = sleutel(m[i]);
    /* Een vraag die na de hint opnieuw komt, is een nieuwe poging (geen F7). */
    if (!k || k === sleutel(m[i - 1]) || (m[i].taak && m[i].taak.startsWith("kies:"))) continue;
    for (let j = i - 2; j >= 0 && m[i].t - m[j].t < 15000; j--) {
      if (sleutel(m[j]) !== k) continue;
      if (!actie.some((t) => t > m[j].t && t <= m[i].t)) {
        f7++;
        if (f7 <= 5) fout(`${naam}: F7 dezelfde tekst kwam terug zonder actie: ${k.slice(0, 100)}`);
      }
      break;
    }
  }
  zie(`${naam}: F7-controle: ${f7} keer dezelfde tekst terug zonder actie`);
  if (process.env.TABEL) {
    mkdirSync(process.env.TABEL, { recursive: true });
    const stem = await P.ev(`JSON.stringify(window.__stem ?? [])`).then((x) => JSON.parse(x ?? "[]"));
    writeFileSync(join(process.env.TABEL, `${naam}.json`), JSON.stringify({ log: l, meet: m, tijden, stem }, null, 1));
  }
  return { m, l, tijden };
}

const ROUTES = {
  /** Alleen het stem-logboek meten in een andere les (LES=…): 60 s spelen met echte tikken op knoppen en de pijl. Verandert niets. */
  async "stem-meting"(P) {
    const tot = Date.now() + 60_000;
    while (Date.now() < tot) {
      const p = await P.ev(`(() => { const b = [...document.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.height > 20 && !b.disabled && !/Pauze|Geluidjes|Praten|Nog eens|Stem/i.test(b.getAttribute("aria-label") || ""); }); const k = b.find((x) => x.getAttribute("data-knop") === "verder") || b.find((x) => x.closest('[class*="bediening"]')); if (!k) return null; const r = k.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
      if (p) await P.tik(p);
      await wacht(1500);
    }
    const stemlog = await P.ev(`JSON.stringify(window.__stem ?? [])`).then((x) => JSON.parse(x ?? "[]"));
    const c = (w) => stemlog.filter((x) => x.wat === w).length;
    const f = {};
    for (const x of stemlog.filter((x) => x.wat === "error")) f[x.fout] = (f[x.fout] ?? 0) + 1;
    const snel = stemlog.filter((x) => x.wat === "start").filter((x) => stemlog.some((y) => y.wat === "error" && y.z === x.z && y.t >= x.t && y.t - x.t < 20)).length;
    zie(`stem ${LES}: ${c("speak")} gestart, ${c("start")} begonnen, ${c("end")} helemaal uitgesproken, fouten ${JSON.stringify(f)}, ${snel} keer afgebroken binnen 20 ms na de start`);
    /* Ook overlap, verspringen, pijl aan/uit en dubbel uitspreken meten (alleen meten). */
    await controleer(P, `ander-${LES}`);
    return true;
  },
  /** Rechtstreekse link, nog geen tik: het startstuk (groet + startvraag) staat er en wacht; bij de eerste tik (naast de knoppen) zegt Bliepo het hele stuk 1 keer. */
  async "groet-zonder-tik"(P) {
    for (let i = 0; i < 300 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await wacht(8000);
    const z = await P.nu();
    const voor = await P.ev(`JSON.stringify(window.__stem ?? [])`).then((x) => JSON.parse(x ?? "[]"));
    zie(`zonder tik, na 8 s: tekst ${JSON.stringify(z.tekst)}; nog bij de startvraag ${z.taak?.vraag === "start"}; pijl ${z.pijl}; stem: ${voor.map((x) => x.wat + (x.fout ? "(" + x.fout + ")" : "")).join(", ") || "niets"}`);
    if (z.taak?.vraag !== "start") fout("de les ging verder zonder tik");
    if (z.pijl) fout("pijl bij de startvraag");
    await P.foto("startstuk");
    const tikPunt = await P.ev(`(() => { const r = document.body.getBoundingClientRect(); return { x: r.width * 0.3, y: r.height * 0.5 }; })()`);
    await P.tik(tikPunt);
    await wacht(12000);
    const na = await P.ev(`JSON.stringify(window.__stem ?? [])`).then((x) => JSON.parse(x ?? "[]"));
    const nieuw = na.slice(voor.length);
    zie(`na de eerste tik: ${nieuw.map((x) => x.wat + (x.fout ? "(" + x.fout + ")" : "") + (x.z ? ' "' + x.z.slice(0, 25) + '"' : "")).join(", ") || "niets"}`);
    const groet = na.filter((x) => x.wat === "speak" && /Fijn dat je er bent/.test(x.z ?? "")).length;
    if (groet > 1) fout(`de groet werd ${groet} keer gestart`);
    return true;
  },
  /** Nee, alles goed, nooit op de pijl tikken. */
  async "nee-goed"(P) {
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await wacht(400);
    if ((await P.nu()).pijl) fout("pijl bij de startvraag");
    await P.klikTekst("Nee");
    const ok = await speel(P, { naam: "nee-goed" });
    await controleer(P, "nee-goed");
    return ok;
  },
  /** Nee, steeds eerst fout en dan goed: de hint na de 1e fout gaat vanzelf door naar dezelfde vraag. */
  async "nee-fouten"(P) {
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await P.klikTekst("Nee");
    let k = 0;
    const ok = await speel(P, { naam: "nee-fouten", keuze: (t) => (t.poging === 1 && k++ % 2 === 0 ? t.opties.find((x) => x !== t.goed) : t.goed), maxMs: 30 * 60_000 });
    const l = await P.log();
    const hints = l.filter((x) => x.wat === "reactie" && x.soort === "fout1").length;
    zie(`nee-fouten: ${hints} hints na een 1e fout, allemaal vanzelf door (er is nooit getikt)`);
    await controleer(P, "nee-fouten");
    return ok;
  },
  /** Ja, proef met fouten en daarna alles fout (2e fout = uitleg en samen voordoen, vanzelf door). */
  async "ja-fout"(P) {
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await P.klikTekst("Ja");
    const ok = await speel(P, { naam: "ja-fout", keuze: (t) => t.opties.find((x) => x !== t.goed), maxMs: 40 * 60_000 });
    await controleer(P, "ja-fout");
    return ok;
  },
  /** Tik op de pijl tijdens het praten: de stem stopt en het volgende stuk komt meteen; met een echte muisklik. */
  async "tik-door"(P) {
    for (let i = 0; i < 2000 && (await P.nu())?.taak?.vraag !== "start"; i++) await wacht(100);
    await P.klikTekst("Nee");
    const metingen = [];
    for (let n = 0; n < 5; n++) {
      for (let i = 0; i < 400 && !((await P.nu())?.pijl && (await P.ev(`!!document.querySelector(".bliepo-tekst-nog")`))); i++) {
        const z = await P.nu();
        if (z?.taak?.soort === "kies") await P.klikTekst(z.taak.goed);
        if (z?.taak?.soort === "getal") {
          const p = await P.ev(`window.__phaser?.klokGetal?.(3) ?? null`);
          if (p) await P.tik(p);
        }
        await wacht(80);
      }
      const voor = await P.nu();
      const t0 = Date.now();
      await P.klikPijl();
      let na = voor;
      for (let i = 0; i < 100 && JSON.stringify(na.tekst) === JSON.stringify(voor.tekst) && na.taak === voor.taak; i++) {
        await wacht(20);
        na = await P.nu();
      }
      metingen.push(Date.now() - t0);
      zie(`tik op de pijl tijdens "${(voor.tekst.at(-1) ?? "").slice(0, 50)}" → na ${Date.now() - t0} ms iets nieuws`);
      await wacht(300);
    }
    /* Na een tik is de stem meteen stil; de volgende tekst kan wachten op een animatie van de les (de klok draait). */
    if (metingen.some((x) => x > 2500)) fout("na een tik op de pijl duurde het te lang");
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
