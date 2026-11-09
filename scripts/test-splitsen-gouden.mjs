/**
 * Test van de gouden les Splitsen (squla-splits-splitsen1-1-gouden), 9 november 2026.
 *
 *   node scripts/test-splitsen-gouden.mjs            alle situaties
 *   SCENARIO=ja-proef node scripts/test-splitsen-gouden.mjs
 *   FOTO=<map> node scripts/test-splitsen-gouden.mjs   ook schermfoto's
 *
 * Speelt de les in Chrome ZONDER VENSTER, met een LEEG profiel en `?naam=Testkind`, ZONDER koekje van een kind: de les
 * kan dan niets in de voortgang van een kind zetten (bewaarUitkomst doet niets zonder gekozen kind). Na afloop kijkt het
 * script of er in de tabel les_uitkomsten nieuwe regels voor deze les bij kwamen die NIET van Testkind zijn; dan stopt het
 * met een foutmelding (de database wordt alleen gelezen).
 *
 * Situaties: goed in één keer (Nee-route met de uitleg), de proef na Ja (goed, en 2 fouten = uitleg), goed na een fout,
 * 1e en 2e fout (samen voordoen), dezelfde denkfout 2 keer, lang wachten (hulphandje; niets bij een keuzevraag), heel snel.
 * Raakt de lessen en de database niet aan.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = "http://localhost:3000";
const LES = process.env.LES ?? "squla-splits-splitsen1-1-gouden";
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const FOTO = process.env.FOTO ?? null;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));

/* ---------- bewaking: geen regels bij echte kinderen ---------- */
const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();
const testkind = sql("select id from kinderen where roepnaam = 'Testkind' limit 1;");
const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));

/* ---------- Chrome ---------- */
const map = mkdtempSync(join(tmpdir(), "test-splitsen-"));
const poort = 9620 + (process.pid % 30);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
const ruim = () => {
  try {
    chrome.kill("SIGKILL");
  } catch {}
  try {
    rmSync(map, { recursive: true, force: true });
  } catch {}
};
process.on("exit", ruim);
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

/* Bliepo praat versneld (elke zin ± 0,1 s), zodat de test niet uren duurt. */
const SNEL = `
  HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); t.dispatchEvent(new Event("ended")); }, 80); return Promise.resolve(); };
  if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 80); }, 20);
`;

async function pagina() {
  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  await stuur("Page.enable", {}, s);
  await stuur("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, s);
  await stuur("Page.addScriptToEvaluateOnNewDocument", { source: SNEL }, s);
  /* Geen koekje: leeg profiel. Voor de zekerheid alle koekjes van localhost weg. */
  await stuur("Network.enable", {}, s);
  await stuur("Network.clearBrowserCookies", {}, s);
  const ev = async (e) => {
    const r = await stuur("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }, s).catch(() => null);
    return r && !r.exceptionDetails ? r.result?.value : null;
  };
  const muis = (type, p) => stuur("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", clickCount: 1, buttons: type === "mouseReleased" ? 0 : 1 }, s);
  /** `traag`: zoals een kind van 6: ± 1 s slepen en daarna 1 s stil (de proef mag dan niet tussendoor nakijken). */
  const sleep = async (van, naar, traag = false) => {
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x, y: van.y }, s);
    await muis("mousePressed", van);
    const n = traag ? 30 : 10;
    for (let i = 1; i <= n; i++) {
      await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x + ((naar.x - van.x) * i) / n, y: van.y + ((naar.y - van.y) * i) / n, button: "left", buttons: 1 }, s);
      await wacht(traag ? 30 : 15);
    }
    await muis("mouseReleased", naar);
    await wacht(traag ? 1000 : 120);
  };
  /** Tik op een punt van het vlak (een pion in een vak gaat dan terug naar boven). */
  const tikVlak = async (x, y) => {
    const q = await punt(x, y);
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: q.x, y: q.y }, s);
    await muis("mousePressed", q);
    await muis("mouseReleased", q);
    await wacht(300);
  };
  /* Een punt van het vlak (980 × 720) op de pagina. */
  const punt = (x, y) => ev(`(() => { const c = [...document.querySelectorAll("canvas")].filter((c) => { const r = c.getBoundingClientRect(); return r.width > 300 && Math.abs(r.width / r.height - 980 / 720) < 0.05; })[0]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + ${x} * r.width / 980, y: r.top + ${y} * r.height / 720 }; })()`);
  const log = () => ev(`JSON.stringify(window.__gouden ?? [])`).then((x) => JSON.parse(x ?? "[]"));
  const foto = async (naam) => {
    if (!FOTO) return;
    mkdirSync(FOTO, { recursive: true });
    const { data } = await stuur("Page.captureScreenshot", { format: "png" }, s);
    writeFileSync(join(FOTO, `${naam}.png`), Buffer.from(data, "base64"));
  };
  await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${LES}?naam=Testkind` }, s);
  let gezien = 0;
  /** Wacht tot er een nieuwe logregel `wat` is (na de vorige die we gezien hebben). */
  const wachtOp = async (wat, max = 30000, filter = () => true) => {
    const t0 = Date.now();
    for (;;) {
      const l = await log();
      const i = l.findIndex((x, k) => k >= gezien && (Array.isArray(wat) ? wat.includes(x.wat) : x.wat === wat) && filter(x));
      if (i >= 0) {
        gezien = i + 1;
        return l[i];
      }
      if (Date.now() - t0 > max) throw new Error(`wachtte vergeefs op "${wat}" (laatste: ${JSON.stringify(l.slice(-3))})`);
      await wacht(150);
    }
  };
  const klikTekst = async (t) => {
    for (let k = 0; k < 60; k++) {
      const ok = await ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === ${JSON.stringify(t)} && b.getBoundingClientRect().width > 3 && !b.disabled); if (!b) return false; b.click(); return true; })()`);
      if (ok) return;
      await wacht(150);
    }
    throw new Error(`knop "${t}" niet gevonden`);
  };
  const klikKnop = async (k) => {
    for (let i = 0; i < 80; i++) {
      const ok = await ev(`(() => { const b = document.querySelector('[data-knop="${k}"]'); if (!b || b.disabled || b.getBoundingClientRect().width < 3) return false; b.click(); return true; })()`);
      if (ok) return;
      await wacht(150);
    }
    throw new Error(`knop ${k} niet gevonden`);
  };
  const pijl = () => klikKnop("verder");
  /** `aantal` dingen uit het hoopje naar het vak op (x, y) van het vlak. */
  const leg = async (aantal, x, y, traag = false) => {
    for (let i = 0; i < aantal; i++) {
      const van = await ev(`window.__phaser?.s1Punt?.() ?? null`);
      const naar = await punt(x, y);
      await sleep(van, naar, traag);
    }
  };
  /** Van punt naar punt (beide in punten van het vlak), bijvoorbeeld van het paarse naar het oranje vak. */
  const verschuif = async (x0, y0, x1, y1, traag = false) => sleep(await punt(x0, y0), await punt(x1, y1), traag);
  const goedSleep = async () => {
    /* Eerst wachten tot het kind mag slepen (bij samen voordoen legt Bliepo eerst zelf). */
    for (let k = 0; k < 80 && !(await ev(`window.__phaser?.s1Stap?.("goed") ?? null`)); k++) await wacht(150);
    for (let k = 0; k < 30; k++) {
      const st = await ev(`window.__phaser?.s1Stap?.("goed") ?? null`);
      if (!st) return;
      await sleep(st.van, st.naar);
    }
  };
  /** De kleur van de getallen in Bliepo's tekst (gemeten op het scherm). */
  const getalKleuren = () => ev(`[...document.querySelectorAll('[class*="getal"]')].filter((e) => e.closest('[class*="tekst"], .bliepo-tekst')).map((e) => e.textContent.trim() + "=" + getComputedStyle(e).color).join(" ")`);
  const hand = () => ev(`!!document.querySelector("[data-hulphand]")`);
  const tekst = () => ev(`[...document.querySelectorAll(".bliepo-tekst, [class*='tekst'] p")].map((e) => e.textContent).join(" ").replace(/\\s+/g, " ").trim()`);
  const sluit = () => stuur("Target.closeTarget", { targetId }).catch(() => {});
  /** 3 s een pion rondslepen en de beelden tellen (HARDE REGEL 7). `traag` = 4× tragere processor (telefoon). */
  const meetSlepen = async (traag) => {
    if (traag) await stuur("Emulation.setCPUThrottlingRate", { rate: 4 }, s);
    const van = await ev(`window.__phaser?.s1Punt?.() ?? null`);
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x, y: van.y }, s);
    await muis("mousePressed", van);
    const telling = ev(`new Promise((r) => { const t = []; let t0 = performance.now(); const stap = (n) => { t.push(n); if (n - t0 < 3000) requestAnimationFrame(stap); else { const d = t.slice(1).map((x, i) => x - t[i]); r({ fps: Math.round((t.length - 1) / ((t[t.length - 1] - t[0]) / 1000)), max: Math.round(Math.max(...d)) }); } }; requestAnimationFrame(stap); })`);
    const t0 = Date.now();
    let i = 0;
    while (Date.now() - t0 < 3000) {
      i++;
      await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x + Math.sin(i / 9) * 120, y: van.y + 80 + Math.sin(i / 13) * 60, button: "left", buttons: 1 }, s);
      await wacht(16);
    }
    const r = await telling;
    await muis("mouseReleased", { x: van.x, y: van.y });
    if (traag) await stuur("Emulation.setCPUThrottlingRate", { rate: 1 }, s);
    return r;
  };
  return { tikVlak, verschuif, meetSlepen, ev, wachtOp, klikTekst, klikKnop, pijl, leg, goedSleep, punt, log, foto, getalKleuren, hand, tekst, sluit };
}

/* Plekken van de vakken (punten van het vlak), zoals in squla-splitsen-gouden.tsx. */
const PAARS = (links = true) => (links ? { x: 330, y: 424 } : { x: 650, y: 424 });
const ORANJE = (links = true) => (links ? { x: 650, y: 424 } : { x: 330, y: 424 });
const VRAGEN = [
  [5, 2, true], [9, 6, true], [7, 3, true], [6, 4, true], [10, 8, true], [7, 4, true], [6, 5, true], [9, 6, false], [8, 3, false],
];
const uitslag = [];
const fout = (t) => {
  uitslag.push(`  FOUT: ${t}`);
  console.log(`  FOUT: ${t}`);
};
const zie = (t) => {
  uitslag.push(`  ${t}`);
  console.log(`  ${t}`);
};

/** Een huisje met `p` in het paarse vak (de rest in het andere). */
async function huis(P, nr, p) {
  const [tot, , links] = VRAGEN[nr - 1];
  await P.leg(p, PAARS(links).x, PAARS(links).y);
  await P.leg(tot - p, ORANJE(links).x, ORANJE(links).y);
}
async function reactie(P) {
  const r = await P.wachtOp("reactie");
  zie(`${r.vraag} · ${r.soort}${r.denkfout ? ` (${r.denkfout})` : ""}: "${r.zin}"`);
  return r;
}
/** Door na een reactie: na een fout de pijl (draaiboek), na goed gaat het vanzelf. */
async function opdracht(P) {
  return P.wachtOp("opdracht");
}

/* ---------- de situaties ---------- */

const SITUATIES = {
  /** Vloeiend tijdens echt slepen (de vloeiendcontrole meet op het beginscherm, waar nog niet gesleept kan worden). */
  async sleepmeting(P) {
    /* LES=<andere les> meet ter vergelijking een andere les (bijvoorbeeld de oude squla-splits-splitsen1-1). */
    if (process.env.LES) await P.klikTekst("Ja");
    else {
      await P.wachtOp("vraag");
      await P.klikTekst("Ja");
      await P.wachtOp("opdracht");
    }
    for (let k = 0; k < 100 && !(await P.ev(`window.__phaser?.s1Stap?.("goed") ?? null`)); k++) await new Promise((r) => setTimeout(r, 200));
    await new Promise((r) => setTimeout(r, 1500));
    for (const traag of [false, true, false, true]) {
      const r = await P.meetSlepen(traag);
      zie(`slepen ${traag ? "trage telefoon (4× trager)" : "laptop"}: ${r.fps} beelden/s, langste beeld ${r.max} ms`);
      await new Promise((r2) => setTimeout(r2, 1000));
    }
  },

  /** Nee → de uitleg (stap 7–10) → alle 15 vragen in één keer goed; kleuren en tempo meten. */
  async "nee-alles-goed"(P) {
    await P.wachtOp("vraag");
    await P.foto("01-start");
    await P.klikTekst("Nee");
    await P.wachtOp("door");
    await opdracht(P);
    await P.foto("02-uitleg");
    await P.leg(1, 330, 424);
    await opdracht(P);
    await P.leg(4, 650, 424);
    await P.wachtOp("door");
    await P.wachtOp("vraag");
    /* Lang wachten bij de keuzevraag: geen hulphandje en geen aanwijzing (draaiboek §4, 15.19). */
    await new Promise((r) => setTimeout(r, 8000));
    const l = await P.log();
    if (l.slice(-3).some((x) => x.wat === "aanwijzing")) fout("bij de keuzevraag kwam een aanwijzing");
    else zie("keuzevraag 8 s gewacht: geen aanwijzing, geen handje (goed)");
    await P.foto("03-totaalvraag");
    await P.klikTekst("5");
    await reactie(P).catch(() => {});
    await opdracht(P);
    await P.foto("04-anders");
    await P.leg(2, 330, 424);
    await P.leg(3, 650, 424);
    await reactie(P);
    for (let nr = 1; nr <= 9; nr++) {
      await opdracht(P);
      const t0 = await P.ev("performance.now()");
      await P.goedSleep();
      const t1 = await P.ev("performance.now()");
      const r = await reactie(P);
      zie(`   reactie ${Math.round(r.t - t1)} ms na de laatste neerleg (incl. 400 ms rust); sleep ${Math.round(t1 - t0)} ms`);
      if (nr === 1) {
        await new Promise((r2) => setTimeout(r2, 250));
        zie(`   getalkleur na goed: ${await P.getalKleuren()}`);
        await P.foto("05-goed-vraag1");
      }
    }
    await opdracht(P);
    await P.foto("06-paren");
    await P.goedSleep();
    await reactie(P);
    for (let nr = 11; nr <= 15; nr++) {
      await opdracht(P);
      if (nr === 11) {
        await P.foto("07-tienvak");
        /* 1 bal in het vak: het vinkje komt en wordt 1 keer uitgelegd (door het lesscherm; keuring punt 2). */
        await P.leg(1, 490, 412);
        await new Promise((r) => setTimeout(r, 1500));
        const t = await P.tekst();
        zie(`doos, 1 bal: Bliepo "${t}"`);
        if (/deze knop/.test(t)) fout("vinkje 2 keer uitgelegd");
        await P.foto("07b-vinkje");
      }
      await P.goedSleep();
      await P.klikKnop("controleer");
      await reactie(P);
    }
    await P.wachtOp("kaart");
    await P.foto("08-kaart");
    zie(`einde: "${await P.tekst()}"`);
  },

  /** Ja → proef goed → daarna fouten: goed na een fout, 2 fouten (samen), dezelfde denkfout 2 keer, lang wachten. */
  async "ja-proef"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Ja");
    await opdracht(P);
    zie(`opdracht 1: "${await P.tekst()}"`);
    await huis(P, 1, 2);
    await reactie(P);
    await opdracht(P);
    await huis(P, 2, 6);
    await reactie(P);
    await P.wachtOp("door", 30000, (x) => /verder oefenen/.test(x.zin));
    /* Vraag 3 (7, 3): 1 te veel (4 = ook omgedraaid!) → kies 5 (te veel), dan goed. */
    await opdracht(P);
    await huis(P, 3, 5);
    await reactie(P);
    await P.foto("10-fout1");
    zie(`   getalkleur bij fout: ${await P.getalKleuren()}`);
    await P.pijl();
    await opdracht(P);
    await huis(P, 3, 3);
    await reactie(P);
    /* Vraag 4 (6, 4): omgedraaid (2) twee keer → samen voordoen. */
    await opdracht(P);
    await huis(P, 4, 2);
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    await huis(P, 4, 2);
    await reactie(P);
    await P.wachtOp("samen");
    await P.wachtOp("opdracht", 30000).catch(() => {});
    await P.foto("11-samen");
    /* Lang wachten tijdens samen voordoen: het hulphandje komt vanzelf. */
    await new Promise((r) => setTimeout(r, 7500));
    zie(`samen voordoen, 7,5 s stil: hulphandje ${(await P.hand()) ? "ja" : "NEE"}`);
    await P.foto("12-hand");
    await P.goedSleep();
    await P.wachtOp("pijl");
    await P.pijl();
    /* Vraag 5 (10, 8): 2 keer te weinig (5) → "weer" + andere uitleg, dan samen. */
    await opdracht(P);
    await huis(P, 5, 5);
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    await huis(P, 5, 5);
    await reactie(P);
    await P.wachtOp("samen");
    await P.goedSleep();
    await P.wachtOp("pijl");
    await P.pijl();
    /* Vraag 6 (7, 4, zak): alles in het paarse vak, dan 1 te weinig (3). */
    await opdracht(P);
    await huis(P, 6, 7);
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    await huis(P, 6, 3);
    await reactie(P);
    await P.wachtOp("samen");
    await P.goedSleep();
    await P.wachtOp("pijl");
    await P.pijl();
    /* Vraag 7 (6, 5, zak): lang wachten bij de opdracht → hulphandje met 1 zin; dan heel snel goed. */
    await opdracht(P);
    await new Promise((r) => setTimeout(r, 7000));
    const l = await P.log();
    const a = l.filter((x) => x.wat === "aanwijzing").pop();
    zie(`opdracht 7 s stil: hulphandje ${(await P.hand()) ? "ja" : "NEE"}, aanwijzing ${a ? JSON.stringify(a) : "geen"}; Bliepo: "${await P.tekst()}"`);
    await P.foto("13-hand-opdracht");
    await huis(P, 7, 5);
    await reactie(P);
    /* Vraag 8 en 9: heel snel (tijdens de zin) en goed: Bliepo zegt niets over snel. */
    await opdracht(P);
    await huis(P, 8, 6);
    const r8 = await reactie(P);
    if (/snel/i.test(r8.zin)) fout("Bliepo zei iets over snel");
    await opdracht(P);
    await huis(P, 9, 0);
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    await huis(P, 9, 8);
    await reactie(P);
    await P.wachtOp("samen");
    await P.goedSleep();
    await P.wachtOp("pijl");
    await P.pijl();
    /* Vraag 10: de huisjes: 3-3-3, dan goed. */
    await opdracht(P);
    for (const [x, k] of [[555, 3], [875, 3], [235, 3]]) await P.leg(k, x, 350);
    await reactie(P);
    await P.foto("14-paren-fout");
    await P.pijl();
    await opdracht(P);
    await P.goedSleep();
    await reactie(P);
    /* Vraag 11 (7 zichtbaar, 3 onder de doek): 10 (totaal), dan 7 (zichtbaar) → samen. */
    await opdracht(P);
    await P.leg(10, 490, 412);
    await P.klikKnop("controleer");
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    await P.leg(7, 490, 412);
    await P.klikKnop("controleer");
    await reactie(P);
    await P.wachtOp("samen");
    await new Promise((r) => setTimeout(r, 2500));
    await P.foto("15-tien-samen");
    await P.goedSleep();
    await P.wachtOp("pijl");
    await P.pijl();
    /* Vraag 12 (9 zichtbaar, 1 onder): 2 (1 te veel → dichtbij), dan goed. */
    await opdracht(P);
    await P.leg(2, 490, 412);
    await P.klikKnop("controleer");
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    await P.goedSleep();
    await P.klikKnop("controleer");
    await reactie(P);
    /* Vraag 13–15 goed. */
    for (let k = 0; k < 3; k++) {
      await opdracht(P);
      await P.goedSleep();
      await P.klikKnop("controleer");
      await reactie(P);
    }
    await P.wachtOp("kaart");
    zie(`einde: "${await P.tekst()}"`);
    const d = await P.ev(`JSON.stringify(window.__uitkomsten ?? [])`);
    for (const u of JSON.parse(d)) zie(`   uitkomst ${u.vraag}: ${u.uitkomst} ${u.denkfouten.join(",")}`);
  },

  /** Uitleg na Nee: vastlopen kan niet (kind-test punt 2). Stap a: eerst in het oranje vak, 3 keer verkeerd = voordoen. Stap b: 2 en 3, herstellen door te tikken. */
  async "uitleg-vast"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Nee");
    await opdracht(P);
    await P.leg(1, 650, 424);
    const m1 = await P.wachtOp("uitleg-mis");
    zie(`stap a, pion in het oranje vak: "${m1.zin}"`);
    await new Promise((r) => setTimeout(r, 7000));
    zie(`   7 s stil: handje ${(await P.hand()) ? "ja" : "NEE"} (wijst naar het oranje vak); Bliepo: "${await P.tekst()}"`);
    await P.foto("20-uitleg-mis");
    await P.tikVlak(650, 424);
    await P.leg(2, 330, 424);
    await P.tikVlak(293, 424);
    await P.leg(1, 650, 424);
    const v = await P.wachtOp("uitleg-voordoen", 20000).catch(() => null);
    zie(v ? `stap a: na 3 keer verkeerd doet Bliepo het voor (${JSON.stringify(v.tel)} → 1 en 0)` : "FOUT: geen vangnet in stap a");
    if (!v) fout("geen vangnet in stap a");
    await opdracht(P);
    /* Stap b: 2 in paars, 3 in oranje (alles ligt, maar het klopt niet). */
    await P.leg(1, 330, 424);
    await P.leg(3, 650, 424);
    const m2 = await P.wachtOp("uitleg-mis");
    zie(`stap b, 2 en 3: "${m2.zin}"`);
    await new Promise((r) => setTimeout(r, 7000));
    zie(`   7 s stil: handje ${(await P.hand()) ? "ja" : "NEE"}`);
    await P.tikVlak(293, 424);
    await P.leg(1, 650, 424);
    await P.wachtOp("door", 20000);
    zie("stap b hersteld door te tikken: uitleg gaat door");
  },

  /** Uitleg stap b: 0 en 5 en dan niets meer doen → na 30 s doet Bliepo het voor. */
  async "uitleg-vast-2"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Nee");
    await opdracht(P);
    await P.leg(1, 330, 424);
    await opdracht(P);
    await P.tikVlak(330, 424);
    await P.leg(5, 650, 424);
    const m = await P.wachtOp("uitleg-mis");
    zie(`stap b, 0 en 5: "${m.zin}"`);
    const v = await P.wachtOp("uitleg-voordoen", 40000).catch(() => null);
    zie(v ? "na 20 s stil in een verkeerde stand doet Bliepo het voor" : "FOUT: geen vangnet na 20 s");
    if (!v) fout("geen vangnet na 20 s");
    await P.wachtOp("door", 20000);
  },

  /** Proef na Ja, 1e fout, 9 s stil: het handje leest de echte stand (keuring punt 1). */
  async "proef-hand"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Ja");
    await opdracht(P);
    await P.leg(4, 330, 424);
    await P.leg(1, 650, 424);
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    await new Promise((r) => setTimeout(r, 9000));
    const l = await P.log();
    const a = l.filter((x) => x.wat === "aanwijzing").pop();
    const t = await P.tekst();
    zie(`proef, 4 en 1, 9 s stil: handje ${(await P.hand()) ? "ja" : "NEE"} (${a ? a.hand : "geen"}); Bliepo: "${t}"`);
    if (!/Schuif een pion uit het paarse vak/.test(t) || /goed bezig|Jij kunt|Geen haast/.test(t)) fout("proef: handje-zin past niet bij de stand");
    if (a?.hand !== "sleep") fout("proef: handje wijst niet van vak naar vak");
    await P.foto("21-proef-hand");
  },

  /** Proef met een langzame, kinderlijke verbetering: 2 pionnen schuiven met 1 s ertussen (kind-test punt 3). */
  async "proef-traag"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Ja");
    await opdracht(P);
    await P.leg(4, 330, 424, true);
    await P.leg(1, 650, 424, true);
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    /* 4 pionnen op 1 rij in het paarse vak: x = 330 + (k − 1,5) × 73,4. Schuif de rechtse 2 naar het oranje vak. */
    await P.verschuif(440, 424, 650, 424, true);
    await P.verschuif(367, 424, 650, 424, true);
    const r = await reactie(P);
    if (r.soort !== "goed-na-fout") fout(`langzaam verbeteren in de proef gaf ${r.soort}`);
    else zie("langzaam 2 pionnen geschoven: pas daarna nagekeken, goed na een fout");
  },

  /** Ja → 2 fouten in de proef → alsnog de uitleg (draaiboek §3 A.4). */
  async "ja-proef-mislukt"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Ja");
    await opdracht(P);
    await huis(P, 1, 4);
    await reactie(P);
    await P.pijl();
    await opdracht(P);
    zie(`na de 1e fout in de proef: "${await P.tekst()}"`);
    /* De pionnen blijven liggen (draaiboek §3 A.2); het kind schuift er 1 heen en weer: weer fout. */
    const van = await P.punt(330, 424);
    const naar = await P.punt(650, 424);
    void van;
    void naar;
    await P.goedSleep();
    const r = await reactie(P);
    if (r.soort === "goed-na-fout") zie("proef: goed na een fout");
    await opdracht(P);
    await huis(P, 2, 9);
    const r2 = await reactie(P);
    if (r2.soort !== "proef-stop") fout(`2e fout in de proef gaf geen uitleg maar ${r2.soort}`);
    await P.wachtOp("opdracht");
    zie(`na de mislukte proef: "${await P.tekst()}"`);
  },
};

const kies = process.env.SCENARIO ? process.env.SCENARIO.split(",") : Object.keys(SITUATIES).filter((x) => x !== "sleepmeting");
for (const naam of kies) {
  console.log(`\n== ${naam}`);
  uitslag.push(`== ${naam}`);
  const P = await pagina();
  try {
    await SITUATIES[naam](P);
  } catch (e) {
    fout(`${naam}: ${e.message}`);
    await P.foto(`fout-${naam}`);
  } finally {
    await P.sluit();
  }
}

/* ---------- bewaking na afloop ---------- */
const nieuw = sql(`select count(*) from les_uitkomsten where id > ${startId} and les_id = '${LES}' and kind_id <> '${testkind}';`);
if (Number(nieuw) > 0) {
  console.error(`\nSTOP: ${nieuw} nieuwe regels in les_uitkomsten voor deze les die NIET van Testkind zijn!`);
  process.exit(2);
}
console.log(`\nBewaking: geen nieuwe regels bij een echt kind (les_uitkomsten: ${sql(`select count(*) from les_uitkomsten where id > ${startId} and les_id = '${LES}';`)} nieuwe regels voor deze les).`);
if (process.env.UITSLAG) writeFileSync(process.env.UITSLAG, uitslag.join("\n"));
ws.close();
ruim();
process.exit(uitslag.some((x) => x.includes("FOUT:")) ? 1 : 0);
