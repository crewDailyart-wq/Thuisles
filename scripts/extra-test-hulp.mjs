/**
 * Gedeelde hulp voor de tests van de 3 EXTRA gouden lessen (12 november 2026): Tellen, Splitsen en Plussommen extra.
 * Gemaakt naar scripts/test-tellen-gouden.mjs (zelfde Chrome-opzet), maar klein: speelt een les van begin tot eind zoals
 * een kind (muisklikken op knoppen en op het vlak, NOOIT op de pijl) en maakt schermfoto's.
 *
 * Speelt met `?naam=Testkind` en een LEEG profiel (geen koekje van een kind): de les kan niets in de voortgang van een
 * kind zetten. Na afloop kijkt de test of er in les_uitkomsten nieuwe regels bijkwamen (de database wordt alleen gelezen).
 *
 * Een les meldt wat hij vraagt via window.__phaser.telTaak ({ soort: "kies" | "maak" | "tel" | ..., opties, goed, poging,
 * vraag, fout }) en wat een speler moet tikken via window.__phaser.antwoord (zoals scripts/speelcontrole.mjs).
 *
 * Routes (ROUTE=…): goed (alles goed), fout1 (elke vraag 1 keer fout, dan goed), allefout (elke vraag 2 keer fout: uitleg en
 * samen voordoen), stil (bij de eerste opdracht 9 s niets doen: het hulphandje moet vanzelf komen).
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const BASIS = "http://localhost:3000";
export const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();

const IN_PAGINA = `
  if (!${JSON.stringify(!!process.env.ECHTESTEM)}) {
    HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); setTimeout(() => t.dispatchEvent(new Event("ended")), 1200); }, 20); return Promise.resolve(); };
    if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, ${process.env.SNELSTEM ? "80" : '400 + String(u.text || "").length * 25'}); }, 20);
  }
  window.__zinnen = [];
  if (window.speechSynthesis) { const sp = window.speechSynthesis.speak.bind(window.speechSynthesis); window.speechSynthesis.speak = (u) => { window.__zinnen.push({ t: Math.round(performance.now()), z: u.text }); sp(u); }; }
  window.__tikken = [];
  document.addEventListener("pointerdown", () => window.__tikken.push(Math.round(performance.now())), true);
  window.__pijlTik = 0;
  document.addEventListener("click", (e) => { if (e.target && e.target.closest && e.target.closest('[data-knop="verder"]')) window.__pijlTik++; }, true);
`;

export async function start(les, { venster = [1440, 900], fotoMap = process.env.FOTO ?? null } = {}) {
  const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));
  const map = mkdtempSync(join(tmpdir(), "test-extra-"));
  const poort = 9400 + Math.floor(Math.random() * 380);
  const chrome = spawn(CHROME, [...(process.env.ZICHTBAAR ? ["--new-window", "--window-size=1440,960"] : ["--headless=new", "--mute-audio"]), `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--no-default-browser-check", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
  const opruimen = () => {
    try { chrome.kill("SIGKILL"); } catch {}
    try { rmSync(map, { recursive: true, force: true }); } catch {}
  };
  process.on("exit", opruimen);
  for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => process.exit(1));
  let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try { wsUrl = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl; } catch { await wacht(200); }
  }
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let n = 0;
  const wachtend = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && wachtend.has(m.id)) { wachtend.get(m.id)(m); wachtend.delete(m.id); }
  });
  const stuur = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; wachtend.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params, sessionId })); });

  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  await stuur("Page.enable", {}, s);
  if (!process.env.ZICHTBAAR) await stuur("Emulation.setDeviceMetricsOverride", { width: venster[0], height: venster[1], deviceScaleFactor: 1, mobile: false }, s);
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
    if (!fotoMap) return;
    mkdirSync(fotoMap, { recursive: true });
    const { data } = await stuur("Page.captureScreenshot", { format: "png" }, s);
    writeFileSync(join(fotoMap, `${naam}.png`), Buffer.from(data, "base64"));
  };
  await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${les}?naam=Testkind` }, s);
  for (let i = 0; i < 100 && !(await ev(`document.querySelectorAll(".bliepo-tekst").length`)); i++) await wacht(200);
  await wacht(400);
  const p0 = await ev(`(() => { const r = document.body.getBoundingClientRect(); return { x: r.width * 0.3, y: r.height * 0.1 }; })()`);
  if (p0) await tik(p0);

  /** Een echte muisklik midden op het eerste zichtbare ding dat bij de kiezer past. */
  const tikKiezer = async (sel, tekst) => {
    const p = await ev(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => !b.disabled && b.getBoundingClientRect().width > 3 && (${JSON.stringify(tekst ?? null)} === null || (b.textContent || "").trim() === ${JSON.stringify(tekst ?? null)})); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    if (!p) return false;
    await tik(p);
    return true;
  };
  /** Een tegel aantikken en dan het rooster (zoals een kind): window.__phaser.tegelPunt(n) en roosterPunt(). */
  const tikTegel = async (n) => {
    /* Een tegel heeft een vorm (een L heeft een leeg hoekje): probeer het midden en daarna punten ernaast, tot de les de tegel meldt. */
    const nr = () => ev(`window.__phaser?.telTaak?.n ?? -1`);
    const voor = await nr();
    for (const [dx, dy] of [[0, 0], [24, 24], [-24, 24], [24, -24], [-24, -24], [0, 24], [24, 0], [0, -24], [-24, 0]]) {
      const a = await ev(`window.__phaser?.tegelPunt?.(${n}) ?? null`);
      const r = await ev(`window.__phaser?.roosterPunt?.() ?? null`);
      if (!a || !r) return false;
      await tik({ x: a.x + dx, y: a.y + dy });
      await wacht(200);
      await tik(r);
      await wacht(300);
      if ((await nr()) !== voor) return true;
    }
    return false;
  };
  const nu = () => ev(`(() => { const ph = window.__phaser ?? {}; const taak = ph.telTaak ?? null; const knoppen = [...document.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width > 3).map((b) => (b.textContent || "").trim()); return { pijl: !!document.querySelector('[data-knop="verder"]') && document.querySelector('[data-knop="verder"]').getBoundingClientRect().width > 3, tekst: [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean), taak, antwoord: ph.antwoord ?? null, kaart: !!document.querySelector('button[aria-label$="af te vinken"]'), controleer: !!document.querySelector('[data-knop="controleer"]') && document.querySelector('[data-knop="controleer"]').getBoundingClientRect().width > 3, hand: !!document.querySelector("[data-hulphand]"), knoppen }; })()`);
  const gegevens = () => ev(`JSON.stringify({ d: window.__denkfouten ?? [], u: window.__uitkomsten ?? [], g: window.__gouden ?? [], zinnen: window.__zinnen ?? [], tikken: window.__tikken ?? [], pijlTik: window.__pijlTik ?? 0 })`).then((x) => JSON.parse(x ?? "{}"));
  const sluit = async () => {
    await stuur("Target.closeTarget", { targetId }).catch(() => {});
    opruimen();
  };
  const naAfloop = () => {
    const nieuw = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));
    return { startId, nieuw, ok: nieuw === startId };
  };
  return { ev, tik, foto, nu, tikKiezer, tikTegel, gegevens, sluit, naAfloop };
}

/**
 * Speelt de les van begin tot eind. `o.foto(taak, z)` mag een schermfoto-naam teruggeven (1 keer per naam).
 * `o.route`: "goed" | "fout1" | "allefout" | "stil".
 */
export async function speel(P, o = {}) {
  const route = o.route ?? "goed";
  const tot = Date.now() + (o.maxMs ?? 9 * 60_000);
  const uit = { fouten: [], kiesTaken: 0, opdrachten: 0, handGezien: new Set(), foto: new Set() };
  let stilGedaan = false;
  let laatsteTaakNr = -1;
  let vast = 0;
  let vorigeSleutel = "";
  while (Date.now() < tot) {
    const z = await P.nu();
    if (!z) { await wacht(150); continue; }
    const sleutel = JSON.stringify([z.taak?.n, z.antwoord, z.tekst.at(-1)?.slice(0, 40), z.kaart, z.controleer]);
    vast = sleutel === vorigeSleutel ? vast + 150 : 0;
    vorigeSleutel = sleutel;
    if (vast > 40_000) { uit.fouten.push(`de les staat 40 s stil: ${JSON.stringify(z).slice(0, 300)}`); return uit; }
    const naam = o.foto?.(z.taak, z);
    if (naam && !uit.foto.has(naam)) { uit.foto.add(naam); await P.foto(naam); }
    if (z.kaart) {
      await P.foto("eindkaart");
      await P.tikKiezer('button[aria-label$="af te vinken"]');
      uit.klaar = true;
      return uit;
    }
    const taak = z.taak;
    if (taak?.n !== undefined && taak.n !== laatsteTaakNr) {
      laatsteTaakNr = taak.n;
      if (taak.soort === "kies") {
        uit.kiesTaken++;
        if (z.hand) uit.fouten.push(`hulphandje bij een keuzevraag (${taak.vraag}, 15.19)`);
      }
    }
    if (taak?.soort === "kies") {
      const fouteKeuzes = taak.fout ?? [];
      const fout = route === "allefout" || (route === "fout1" && taak.poging === 1);
      const x = fout && fouteKeuzes.length ? fouteKeuzes[((taak.poging ?? 1) - 1) % fouteKeuzes.length] : taak.goed;
      if (await P.tikKiezer("button", String(x))) await wacht(350);
      else await wacht(150);
      continue;
    }
    if (taak?.soort === "maak" || taak?.soort === "tel") {
      if (taak.soort === "maak" && !z.hand) { /* wacht: vinkje of tikken */ }
      if (route === "stil" && !stilGedaan && taak.soort === "maak") {
        const t0 = Date.now();
        while (Date.now() - t0 < 9500 && !(await P.nu())?.hand) await wacht(250);
        const h = (await P.nu())?.hand;
        uit.stil = `hulphandje na ${Math.round((Date.now() - t0) / 100) / 10} s stilte: ${h ? "ja" : "NEE"}`;
        if (!h) uit.fouten.push("geen hulphandje na lange stilte bij een opdracht");
        await P.foto("hulphandje");
        stilGedaan = true;
        continue;
      }
      const wilFout = taak.soort === "maak" && (route === "allefout" || (route === "fout1" && taak.poging === 1));
      if (wilFout) {
        /* Meteen het vinkje zonder iets te maken (fout). */
        if (z.controleer && (await P.tikKiezer('[data-knop="controleer"]'))) { await wacht(400); continue; }
        await wacht(150);
        continue;
      }
      if (z.antwoord && (await tikAntwoord(P, z.antwoord))) { await wacht(250); continue; }
      if (!z.antwoord && z.controleer && (await P.tikKiezer('[data-knop="controleer"]'))) { await wacht(400); continue; }
      await wacht(150);
      continue;
    }
    /* Stilte bij een tegel-opdracht (Plussommen): het hulphandje moet vanzelf komen (logboek "aanwijzing"). */
    if (route === "stil" && !stilGedaan && taak?.soort === "pak") {
      const t0 = Date.now();
      const vanaf = await P.ev("performance.now()");
      let h = false;
      while (!h && Date.now() - t0 < 10000) {
        h = ((await P.gegevens()).g ?? []).some((x) => x.wat === "aanwijzing" && x.t > vanaf);
        if (!h) await wacht(250);
      }
      uit.stil = `hulphandje na ${Math.round((Date.now() - t0) / 100) / 10} s stilte: ${h ? "ja" : "NEE"}`;
      if (!h) uit.fouten.push("geen hulphandje na lange stilte bij een opdracht");
      await P.foto("hulphandje");
      stilGedaan = true;
      continue;
    }
    /* Tegels (Plussommen): bij het aanvullen in de test eerst een foute tegel zetten (1 of 2 keer, naar de route). */
    if (taak?.soort === "pak" && taak.goed && /^(samen7|samen10|manier10)-/.test(taak.vraag ?? "") && (route === "allefout" || (route === "fout1" && taak.poging === 1))) {
      const fout = taak.goed === 1 ? 2 : 1;
      if (await P.tikTegel(fout)) { await wacht(500); continue; }
    }
    /* Geen taak: een tikbaar ding in het vlak of een knop die de speler moet tikken. */
    if (z.antwoord && (await tikAntwoord(P, z.antwoord))) { await wacht(250); continue; }
    if (z.controleer && !z.antwoord && (await P.tikKiezer('[data-knop="controleer"]'))) { await wacht(400); continue; }
    await wacht(150);
  }
  uit.fouten.push("niet binnen de tijd tot de eindkaart gekomen");
  return uit;
}

/** Tikt wat de les van de speler vraagt: een ding in het vlak (data-ding) of een tegel (tegel-N). */
async function tikAntwoord(P, antwoord) {
  if (!antwoord) return false;
  if (String(antwoord).startsWith("tegel-")) return P.tikTegel(Number(String(antwoord).slice(6)));
  return P.tikKiezer(`[data-ding="${antwoord}"]`);
}

/** Uitslag afdrukken en afsluiten (exitcode 1 bij een fout). */
export async function rapport(naam, P, uit) {
  const g = await P.gegevens();
  const db = P.naAfloop();
  const fouten = [...uit.fouten];
  if (g.pijlTik) fouten.push(`er is ${g.pijlTik} keer op de pijl getikt (de test tikt nooit op de pijl)`);
  if (!db.ok) fouten.push(`de database kreeg nieuwe regels in les_uitkomsten (${db.startId} -> ${db.nieuw})`);
  if (!uit.klaar) fouten.push("de eindkaart is niet bereikt");
  const dubbel = {};
  for (const z of g.zinnen ?? []) {
    const k = z.z;
    (dubbel[k] ??= []).push(z.t);
  }
  /* Alleen als het kind er niets tussendoor deed (geen tik tussen de 2 starts): 15.29. */
  const tikken = g.tikken ?? [];
  const herhaald = Object.entries(dubbel).filter(([, ts]) => ts.some((t, i) => i > 0 && t - ts[i - 1] < 20000 && !tikken.some((k) => k > ts[i - 1] && k < t)));
  for (const [z] of herhaald) fouten.push(`dezelfde uiting binnen 20 s 2 keer gestart (F8): "${z.slice(0, 60)}"`);
  console.log(`${naam}: ${uit.klaar ? "tot de eindkaart" : "NIET klaar"}; ${uit.kiesTaken} keuzevragen; ${g.d?.length ?? 0} denkfouten vastgelegd; ${g.u?.length ?? 0} uitkomsten (${(g.u ?? []).map((x) => x.uitkomst).join(", ")})`);
  if (uit.stil) console.log(`${naam}: ${uit.stil}`);
  console.log(`${naam}: denkfouten: ${(g.d ?? []).map((x) => `${x.vraag}:${x.denkfout}`).join(" | ") || "geen"}`);
  console.log(`${naam}: database: ${db.ok ? "niets bijgekomen (max id " + db.nieuw + ")" : "NIEUWE REGELS"}`);
  for (const f of fouten) console.log(`  FOUT: ${f}`);
  await P.sluit();
  return fouten.length;
}
