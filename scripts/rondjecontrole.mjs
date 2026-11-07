/**
 * Rondjescontrole (BOUWREGELS 7.8 en 12.13, 6 november 2026): kijkt echt op het scherm of het rondje
 * precies volgt wat Bliepo zegt. Per les: kiest "Nee" (de uitleg), volgt de zin van Bliepo en maakt
 * schermfoto's per zin: kort na het begin van de zin, daarna elke 1,5 s en vlak voor het einde (voordat er op
 * "Verder" wordt getikt). De foto's en de zinnen komen in public/rondje-controle/<les>/ en worden
 * op de statuspagina (/voorbeeld/lessen-bijhouden) getoond.
 *
 *   LESSEN=squla-geld-geldmachine-1,squla-splits-splitsen2-1 npm run rondjecontrole
 *   (MAXZINNEN=8 voor de oude korte opname; ROUTE=nee, standaard)
 *
 * Uitbreiding (6 november 2026, H3):
 *   ROUTE=nee   kiest "Nee", volgt de uitleg en alle latere stappen; beantwoordt de eerste vraag goed
 *               en gaat door tot er geen nieuwe zin meer komt (hooguit 25 zinnen, klikt "Verder").
 *   ROUTE=fout  kiest "Ja" en geeft op de eerste vragen een FOUT antwoord (het moment na een fout).
 *   ROUTE=nee,fout  beide achter elkaar. Alles komt in dezelfde opnames.json; een opname krijgt het veld
 *               "route" (de routes die je niet opnieuw draait blijven staan). Foto's van "fout" beginnen met "fout-".
 *   MAXANTW=2   hoeveel antwoorden hij geeft (standaard 2 bij nee, 3 bij fout)
 *   FIJN=1      extra foto's elke 0,3 s in de eerste 3 s van elke zin (voor korte rondjes van 0,4 s)
 *   (MAXZINNEN=25 en een duurgrens van 4 minuten per route gelden bij ROUTE=...; zonder ROUTE blijft 8 zinnen gelden.)
 *
 * Alleen kijken en fotograferen: er wordt niets in de database gezet; getest wordt als Testkind.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const LESSEN = (process.env.LESSEN ?? process.argv[2] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const MAXZINNEN = Number(process.env.MAXZINNEN ?? 8);
const UIT = new URL("../public/rondje-controle/", import.meta.url).pathname;
const CHROME = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

if (!CHROME) {
  console.log("Geen Chrome gevonden.");
  process.exit(1);
}
if (!LESSEN.length) {
  console.log("Zet LESSEN=<id,id,...> (bijvoorbeeld LESSEN=squla-geld-geldmachine-1).");
  process.exit(1);
}

const map = mkdtempSync(join(tmpdir(), "rondjecontrole-"));
const poort = 9500 + Math.floor(Math.random() * 90);
const proces = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
const sluit = () => {
  proces.kill();
  setTimeout(() => {
    try {
      rmSync(map, { recursive: true, force: true });
    } catch {}
  }, 800);
};
let v;
for (let i = 0; i < 50 && !v; i++) {
  try {
    v = await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json());
  } catch {
    await wacht(200);
  }
}
if (!v) {
  sluit();
  console.log("Chrome start niet.");
  process.exit(1);
}
const ws = new WebSocket(v.webSocketDebuggerUrl);
let n = 0;
const wachtend = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && wachtend.has(m.id)) {
    wachtend.get(m.id)(m);
    wachtend.delete(m.id);
  }
});
await new Promise((r) => ws.addEventListener("open", r));
const stuur = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const id = ++n;
    wachtend.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

const ROUTES = (process.env.ROUTE ?? "").split(",").map((r) => r.trim()).filter(Boolean);
const UITGEBREID = ROUTES.length > 0;
if (!UITGEBREID) ROUTES.push("nee");
const FIJN = !!process.env.FIJN;

/* Wat er nu in beeld staat; de velden na "verder" zijn voor het beantwoorden van een vraag (zoals in speelcontrole.mjs). */
const TOESTAND = `(() => {
  const t = [...document.querySelectorAll('.les-tekst, [data-opdracht]')].map((e) => e.innerText.trim()).filter(Boolean).join(' | ');
  const ja = [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Nee');
  const verder = document.querySelector('[data-knop="verder"]');
  const zichtbaar = (el) => { const r = el.getBoundingClientRect(); return r.width > 3 && r.height > 3; };
  const mijden = /^(Pauze|Nog eens horen|Stem van Bliepo|Praten met Bliepo|Houd ingedrukt|Open Next|Geluidjes aan|Lees de keuzes voor|Ja|Nee)$/i;
  const knoppen = [...document.querySelectorAll('button, [data-zin], [data-getal], [data-signaal], [data-ding]')]
    .filter((b) => zichtbaar(b) && !b.disabled && !b.closest('nextjs-portal'))
    .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30))
    .filter((x) => x && !mijden.test(x));
  return {
    t, nee: ja, verder: !!(verder && verder.getBoundingClientRect().width > 2),
    praat: !!document.querySelector('[data-praat="true"]') || document.querySelectorAll('.bliepo-tekst-nog').length > 0,
    klaar: !!document.querySelector('[data-knop="opnieuw"]'),
    knoppen: knoppen.length,
    invoer: [...document.querySelectorAll('input')].some((i) => zichtbaar(i) && !i.disabled),
    antwoord: window.__phaser?.antwoord ?? null,
  };
})()`;

for (const route of ROUTES) {
for (const id of LESSEN) {
  const map1 = join(UIT, id);
  mkdirSync(map1, { recursive: true });
  const voorvoegsel = route === "fout" ? "fout-" : "";
  const maxZinnen = UITGEBREID ? 25 : MAXZINNEN;
  const maxAntw = Number(process.env.MAXANTW ?? (route === "fout" ? 3 : 2));
  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  const ev = async (e) => (await stuur("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }, s)).result?.value;
  const foto = async (naam) => {
    const r = await stuur("Page.captureScreenshot", { format: "jpeg", quality: 62 }, s);
    writeFileSync(join(map1, `${naam}.jpg`), Buffer.from(r.data, "base64"));
  };
  const klik = (filter) => ev(`(() => { const b = [...document.querySelectorAll("button, [data-zin], [data-getal], [data-signaal], [data-ding], button[data-plek]")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !b.disabled && !/^(Pauze|Nog eens horen|Stem van Bliepo|Praten met Bliepo|Geluidjes aan|Lees de keuzes voor|Ja|Nee)$/i.test((b.getAttribute("aria-label") || b.textContent).trim()); }).find(${filter}); if (!b) return false; b.click(); return true; })()`);
  const sleep = async (van, naar) => {
    await stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: van.x, y: van.y, button: "left", clickCount: 1 }, s);
    for (let i = 1; i <= 14; i++) {
      await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x + ((naar.x - van.x) * i) / 14, y: van.y + ((naar.y - van.y) * i) / 14, button: "left", buttons: 1 }, s);
      await wacht(25);
    }
    await stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: naar.x, y: naar.y, button: "left", clickCount: 1 }, s);
  };
  /* Een antwoord geven (goed of fout), met de slimmigheid van speelcontrole.mjs in het kort: slepen via de haakjes van het vlak, invoerveld, keuzeknop. */
  const beantwoord = async (soort, t) => {
    let gedaan = false;
    for (let k = 0; k < 40; k++) {
      const stap = await ev(`window.__phaser?.s1Stap?.(${JSON.stringify(soort)}) ?? null`);
      if (!stap) break;
      await sleep(stap.van, stap.naar);
      await wacht(150);
      gedaan = true;
    }
    if (gedaan) return true;
    const s2 = await ev(`window.__phaser?.s2Stap?.(${JSON.stringify(soort)}) ?? null`);
    if (s2) {
      await sleep(s2.van, s2.naar);
      await wacht(150);
      return true;
    }
    const verdeel = await ev(`window.__phaser?.sleepKlaar?.() ?? null`);
    if (verdeel?.los?.length) {
      const k = verdeel.bakken.length;
      for (let i = 0; i < verdeel.los.length; i++) {
        const nu = await ev(`window.__phaser?.sleepKlaar?.() ?? null`);
        if (!nu?.los?.length) break;
        await sleep(nu.los[0], nu.bakken[soort === "fout" ? 0 : i % k]);
        await wacht(120);
      }
      return true;
    }
    const controleer = `(b) => b.hasAttribute("data-controleer") || b.getAttribute("data-knop") === "controleer"`;
    if (t.invoer) {
      const goed = t.antwoord != null ? String(t.antwoord) : "5";
      const waarde = soort === "goed" ? goed : String((Number(goed) + 3) % 10);
      await ev(`(() => { const i = [...document.querySelectorAll("input")].find((i) => i.getBoundingClientRect().width > 3 && !i.disabled); const zet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; zet.call(i, ${JSON.stringify(waarde)}); i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); return true; })()`);
      await wacht(200);
      await klik(controleer);
      return true;
    }
    if (await klik(controleer)) return true;
    const goed = t.antwoord != null ? String(t.antwoord) : null;
    if (soort === "goed" && goed && (await klik(`(b) => (b.textContent || "").trim() === ${JSON.stringify(goed)} || b.getAttribute("data-ding") === ${JSON.stringify(goed)} || b.getAttribute("data-getal") === ${JSON.stringify(goed)}`))) return true;
    if (soort === "fout" && goed && (await klik(`(b) => b.closest('[data-knop="keuzes"], [class*="bediening"]') && (b.textContent || "").trim() !== ${JSON.stringify(goed)} && b.getAttribute("data-knop") !== "weetniet" && b.getAttribute("data-knop") !== "verder"`))) return true;
    if (await klik(`(b) => b.tagName === "BUTTON" && b.hasAttribute("data-plek")`)) return true;
    if (await klik(`(b) => b.closest('[data-knop="keuzes"], [class*="bediening"], [class*="raster3"]') && !b.querySelector(".bliepo-tekst") && b.getAttribute("data-knop") !== "weetniet" && b.getAttribute("data-knop") !== "verder" && b.getAttribute("aria-pressed") !== "true"`)) return true;
    return await ev(`(() => { const lijst = [...document.querySelectorAll("[data-zin], [data-getal], [data-signaal]")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !b.disabled; }); if (!lijst.length) return false; lijst[${soort === "fout" ? "lijst.length - 1" : "0"}].click(); return true; })()`);
  };
  /* Bestaande opnames van de andere routes blijven staan. */
  const bestand = join(map1, "opnames.json");
  let oudeOpnames = [];
  if (UITGEBREID && existsSync(bestand)) {
    try {
      oudeOpnames = (JSON.parse(readFileSync(bestand, "utf8")).opnames ?? []).filter((o) => (o.route ?? "nee") !== route);
    } catch {}
  }
  const opnames = [];
  try {
    await stuur("Page.enable", {}, s);
    await stuur("Runtime.enable", {}, s);
    await stuur("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, s);
    await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${id}?naam=Testkind` }, s);
    let klaar = false;
    for (let i = 0; i < 300 && !klaar; i++) {
      klaar = !!(await ev(TOESTAND))?.nee;
      if (!klaar) await wacht(250);
    }
    if (!klaar) {
      console.log(`✗ ${id}: Ja/Nee kwam niet in beeld`);
      opnames.push({ route, fout: "Ja/Nee kwam niet in beeld" });
    } else {
      await ev(`[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === ${JSON.stringify(route === "fout" ? "Ja" : "Nee")})?.click()`);
      let vorige = "";
      let nr = 0;
      let fotoNr = 0;
      let laatsteFoto = 0;
      let teller = 0;
      let nuZin = null;
      let antwoorden = 0;
      let laatsteActie = 0;
      let nieuweZinSinds = Date.now();
      const begin = Date.now();
      const neem = async (label) => {
        fotoNr++;
        const naam = `${voorvoegsel}${String(nr).padStart(2, "0")}-${String(fotoNr).padStart(2, "0")}-${label}`;
        await foto(naam);
        laatsteFoto = Date.now();
        nuZin.fotos.push({ bestand: `${naam}.jpg`, label, na_ms: Date.now() - nuZin.start });
      };
      while (nr < maxZinnen && Date.now() - begin < (UITGEBREID ? 240_000 : 150_000)) {
        const t = await ev(TOESTAND);
        if (t?.klaar) break;
        if (t?.t && t.t !== vorige) {
          vorige = t.t;
          nr++;
          fotoNr = 0;
          teller = 0;
          nieuweZinSinds = Date.now();
          nuZin = { nr, route, tekst: t.t, start: Date.now(), fotos: [] };
          opnames.push(nuZin);
          if (FIJN) await neem("fijn-0.0s");
          else await wacht(700);
          if (!FIJN) await neem("begin");
          continue;
        }
        if (nuZin) {
          /* FIJN: de eerste 3 s elke 0,3 s een foto (voor rondjes van 0,4 s). */
          if (FIJN && Date.now() - nuZin.start < 3000 && Date.now() - laatsteFoto >= 300 && fotoNr < 12) {
            await neem(`fijn-${Math.round((Date.now() - nuZin.start) / 100) / 10}s`);
          } else if (!FIJN && teller < 3 && Date.now() - laatsteFoto >= 1500) {
            /* Tijdens dezelfde zin: elke 1,5 s een foto (hoogstens 3 extra), zodat ook het einde van de zin te zien is. */
            teller++;
            await neem(`na-${Math.round((Date.now() - nuZin.start) / 100) / 10}s`);
          }
          if (t?.verder && Date.now() - laatsteFoto >= 1200) {
            await neem("einde");
            await ev(`document.querySelector('[data-knop="verder"]')?.click()`);
            await wacht(400);
            laatsteActie = Date.now();
          } else if (UITGEBREID && !t?.verder && !t?.praat && (t?.knoppen || t?.invoer) && antwoorden < maxAntw && (nuZin.pogingen ?? 0) < 2 && Date.now() - nuZin.start > 1500 && Date.now() - laatsteActie > 2000) {
            /* Een echte vraag, Bliepo is uitgesproken: eerst een foto, dan antwoorden, dan nog een foto kort erna. */
            if (!nuZin.voorFoto) {
              nuZin.voorFoto = true;
              await neem("voor-antwoord");
            }
            nuZin.pogingen = (nuZin.pogingen ?? 0) + 1;
            const soort = route === "fout" ? "fout" : "goed";
            if (await beantwoord(soort, t)) {
              antwoorden++;
              nuZin.antwoord = soort;
              laatsteActie = Date.now();
              await wacht(450);
              const nu = await ev(TOESTAND);
              if (nu?.t === vorige) await neem(`na-${soort}-antwoord`);
            } else {
              laatsteActie = Date.now();
              nuZin.opmerking = "kon geen antwoord geven (script)";
            }
          }
        }
        /* Geen nieuwe zin meer en niets te doen: klaar. */
        if (UITGEBREID && nr > 0 && Date.now() - nieuweZinSinds > 20_000 && !t?.verder && (antwoorden >= maxAntw || !(t?.knoppen || t?.invoer))) break;
        await wacht(FIJN ? 100 : 200);
      }
    }
  } catch (e) {
    opnames.push({ route, fout: String(e?.message ?? e) });
  } finally {
    const alle = UITGEBREID ? [...oudeOpnames.map((o) => ({ route: "nee", ...o })), ...opnames] : opnames.map((o) => ({ ...o, route }));
    alle.sort((a, b) => (a.route === b.route ? 0 : a.route === "nee" ? -1 : 1));
    writeFileSync(bestand, JSON.stringify({ id, gemaakt: new Date().toISOString(), opnames: alle }, null, 1));
    await stuur("Target.closeTarget", { targetId }).catch(() => {});
  }
  console.log(`${id} (${route}): ${opnames.filter((o) => o.nr).length} zinnen vastgelegd in public/rondje-controle/${id}/`);
}
}
ws.close();
sluit();
