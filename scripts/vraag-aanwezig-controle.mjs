/**
 * F16 "de les wacht op het kind, maar er staat geen vraag of opdracht" (Sara, 18 november 2026; BOUWREGELS 15.37,
 * FOUTEN-VOORBEELDEN F16). Gedeeld door speelcontrole.mjs (en elk ander testscript dat het wil).
 *
 * Voorbeeld van de fout: in de gouden les Rekenmix 2 stond na een niet-goede keuze alleen nog "Kijk hoeveel kaas er
 * bovenaan zit." in beeld, terwijl de les op een tik op een boterham wachtte. Het kind wist niet wát het moest doen en
 * wáár het moest tikken.
 *
 * De meter draait in de pagina (elke 200 ms):
 *   - "de les wacht op het kind" = er is iets om mee te antwoorden (een keuzeknop, een tikbaar ding in het vlak, een
 *     invoerveld, het vinkje, of alleen een tekening/canvas), er staat GEEN verder-pijl (dan gaat de les vanzelf door),
 *     het is niet de eindkaart, en er is 3 seconden lang niets gebeurd (Bliepo praat niet, de tekst en de knoppen
 *     veranderden niet, er is niet getikt of getypt); bij alleen een canvas zonder knoppen: 6 seconden;
 *   - dan moet er in de DOM een zichtbare vraag of opdracht staan: een zin met een vraagteken, of een zin met een
 *     gebiedende wijs die zegt wat het kind doet ("Tik", "Kies", "Sleep", "Tel", "Zet", "Leg", "Typ", "Vul" enz.).
 *     "Kijk …" en "Probeer het nog eens." tellen NIET: die zeggen niet wat of waar het kind moet tikken.
 *   - staat die er niet, dan komt het in window.__f16 (met de tekst die er wel stond en wat er te tikken was);
 *   - uitzondering: midden in een opdracht van meer tikken (samen tellen: het kind tikt en Bliepo zegt alleen "3.")
 *     telt het niet als fout, zolang er alleen zulke korte woorden staan (hooguit 2 woorden) en de opdracht korter dan
 *     30 seconden geleden in beeld stond.
 *
 * De speler in speelcontrole.mjs werkt mee: staat er geen opdracht in beeld, dan wacht hij met tikken tot de meter het
 * moment beoordeeld heeft. Met RUSTIG=1 wacht hij bij ELKE antwoordstap 3 seconden (trager, maar dan ziet de meter ook
 * een opdracht die er eerst wel stond en tijdens het wachten verdwijnt).
 *
 * HET BEGIN VAN DE LES (los te draaien): `node scripts/vraag-aanwezig-controle.mjs` opent elke gouden les uit
 * public/alle-lessen.html met een rechtstreekse link in een zichtbare Chrome met de echte geluidsregels, en tikt NIET.
 * Chrome laat dan geen geluid toe en Bliepo's eerste zin wacht op de eerste tik. Na 12 seconden moet er een vraag of
 * opdracht in beeld staan (bijvoorbeeld de start-aanwijzing "Tik op het scherm. Dan begint Bliepo."), anders F16.
 *   LESSEN=id1,id2 node scripts/vraag-aanwezig-controle.mjs     alleen deze lessen
 *   FOTO=<map> …                                                een schermfoto per les
 * Het ophalen van Ruth (/api/stem) is in deze controle geblokkeerd: er wordt nooit een stem gemaakt.
 *
 * WAT DEZE CONTROLE NIET KAN ZIEN (eerlijk):
 *   - of de opdracht inhoudelijk klopt of duidelijk genoeg is (alleen óf er een vraag/opdracht staat);
 *   - tekst die in een canvas (Phaser) getekend is: alleen DOM-tekst (ook SVG-tekst) telt;
 *   - een opdracht die alleen gesproken is en niet in beeld staat: dat telt hier als fout (de laatste gesproken zinnen
 *     staan wel in de melding);
 *   - zonder RUSTIG=1: een opdracht die er bij het begin van de stap staat en pas na een paar seconden wachten verdwijnt
 *     (bijvoorbeeld als het hulphandje komt), want de speler tikt dan al eerder.
 */
export const VRAAG_METER = `
  window.__f16 = []; window.__f16Beoordeeld = 0; window.__f16Gesproken = [];
  (() => {
    const nu = () => Math.round(performance.now());
    const WERKWOORD = "tik|kies|sleep|tel|zet|leg|maak|typ|vul|zoek|wijs|druk|klik|pak|schuif|draai|geef|kleur|verdeel|splits|bouw|meet|weeg|noem|schrijf|trek|hang|ruim|vink|verplaats|breng|plak|knip|reken|vergelijk|verbind|stapel|spring|loop|tril|schud|gooi|sorteer|begin";
    const BEGIN = new RegExp("^(?:(?:nu|en|dan|maar|oké|ok|kom|toe maar|eerst|daarna|ja|nee)[,:]?\\\\s+)*(?:" + WERKWOORD + ")\\\\b", "i");
    const MIDDEN = new RegExp("(?:\\\\ben|\\\\bdan|\\\\bof|,|:)\\\\s+(?:" + WERKWOORD + ")\\\\b", "i");
    /** Staat er in deze tekst een vraag of een opdracht die zegt wat het kind doet? */
    const heeftOpdracht = (tekst) => {
      if (/\\?/.test(tekst)) return true;
      return tekst.split(/(?<=[.!:;])\\s+/).some((z) => { const k = z.replace(/^[^A-Za-zÀ-ɏ0-9]+/, ""); return BEGIN.test(k) || MIDDEN.test(k); });
    };
    window.__f16HeeftOpdracht = heeftOpdracht;
    const zichtbaar = (e) => {
      const r = e.getBoundingClientRect();
      if (r.width < 3 || r.height < 3 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return false;
      for (let x = e; x && x !== document.body; x = x.parentElement) {
        const cs = getComputedStyle(x);
        if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.15) return false;
      }
      return true;
    };
    /** Alle zichtbare tekst in de DOM (Bliepo's tekstvak, opdracht, kop in het vlak, labels), zonder knopteksten. */
    const teksten = () => {
      const uit = [];
      for (const e of document.querySelectorAll(".bliepo-tekst")) {
        if (e.closest(".bliepo-tekst-later, nextjs-portal") || !zichtbaar(e)) continue;
        const t = (e.textContent || "").replace(/\\s+/g, " ").trim();
        if (t) uit.push(t);
      }
      for (const e of document.body.querySelectorAll("*")) {
        const tag = e.tagName.toUpperCase();
        if (["SCRIPT", "STYLE", "NOSCRIPT", "BUTTON", "INPUT", "TEXTAREA", "A"].includes(tag)) continue;
        /* De start-aanwijzing ("Tik op het scherm. Dan begint Bliepo.") telt niet als vraag of opdracht van de les: anders zou hij in een test zonder echte tik elke ontbrekende vraag verbergen. De begincontrole kijkt er apart naar (stand().start). */
        if (e.closest(".bliepo-tekst, button, a, nextjs-portal, [aria-hidden='true'], .bliepo-tekst-later, script, style, [data-start-tik]")) continue;
        if (![...e.childNodes].some((k) => k.nodeType === 3 && /[A-Za-zÀ-ɏ]{2}/.test(k.textContent || ""))) continue;
        if (!zichtbaar(e)) continue;
        const t = (e.textContent || "").replace(/\\s+/g, " ").trim();
        if (t) uit.push(t);
      }
      return [...new Set(uit)];
    };
    const NIET = /^(Pauze|Nog eens horen|Stem van Bliepo|Praten met Bliepo|Houd ingedrukt|Open Next|Geluidjes aan|Lees de keuzes voor|Terug|Stoppen|Menu)/i;
    /** Waar het kind mee kan antwoorden. */
    const invoer = () => {
      const lijst = [];
      for (const b of document.querySelectorAll("button, input, [data-plek], [data-zin], [data-getal], [data-signaal], [data-ding]")) {
        if (b.disabled || b.getAttribute("aria-disabled") === "true" || b.closest("nextjs-portal") || !zichtbaar(b)) continue;
        const k = b.getAttribute("data-knop") || "";
        const t = (b.getAttribute("aria-label") || b.textContent || b.tagName).replace(/\\s+/g, " ").trim().slice(0, 30);
        if (NIET.test(t) || /mic|praat|terug|opnieuw|pauze|geluid|stem/i.test(k) || b.querySelector(".bliepo-tekst")) continue;
        lijst.push(k || t);
      }
      return lijst;
    };
    const stand = () => {
      const pijl = [...document.querySelectorAll('[data-knop="verder"]')].some(zichtbaar);
      const einde = !!document.querySelector('[data-knop="opnieuw"], button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]');
      const praat = !!document.querySelector('[data-praat="true"]') || [...document.querySelectorAll(".bliepo-tekst-nog")].some((e) => !e.closest(".bliepo-tekst-later"));
      const canvas = [...document.querySelectorAll("canvas")].some((c) => c.width > 200 && zichtbaar(c));
      const t = teksten();
      const k = invoer();
      const start = [...document.querySelectorAll("[data-start-tik]")].some(zichtbaar);
      return { pijl, einde, praat, canvas, t, k, start, wacht: !pijl && !einde && (k.length > 0 || canvas) && t.length + k.length > 0 };
    };
    /* Voor de begincontrole (zie onderaan dit bestand): wat staat er nu, en staat er een vraag of opdracht bij? */
    window.__f16Stand = () => { const s = stand(); return { tekst: s.t, knoppen: s.k, pijl: s.pijl, einde: s.einde, praat: s.praat, opdracht: s.t.some(heeftOpdracht), start: s.start, getikt: !!(navigator.userActivation && navigator.userActivation.hasBeenActive) }; };
    let sleutel = "", sinds = nu(), beoordeeld = false, laatste = null, opdrachtGezien = 0;
    const actie = () => { sinds = nu(); beoordeeld = false; };
    for (const soort of ["pointerdown", "click", "keydown", "input"]) document.addEventListener(soort, actie, true);
    /* Wat Bliepo zei (voor de melding): de browserstem en de zinnen die bij Ruth worden opgehaald. */
    try {
      if (window.speechSynthesis) { const sp = window.speechSynthesis.speak.bind(window.speechSynthesis); window.speechSynthesis.speak = (u) => { window.__f16Gesproken.push({ t: nu(), z: u.text }); return sp(u); }; }
      const F = window.fetch;
      window.fetch = function (u, ...r) { try { const url = String(u && u.url ? u.url : u); if (url.includes("/api/stem?zin=")) window.__f16Gesproken.push({ t: nu(), z: decodeURIComponent(new URL(url, location.href).searchParams.get("zin") || "") }); } catch {} return F.call(this, u, ...r); };
    } catch {}
    setInterval(() => {
      const s = stand();
      laatste = s;
      const k = JSON.stringify([s.pijl, s.einde, s.t, s.k]);
      if (k !== sleutel) { sleutel = k; actie(); }
      if (s.t.some(heeftOpdracht)) opdrachtGezien = nu();
      if (s.praat) { sinds = nu(); return; }
      /* Alleen een tekening (canvas) en geen knop of tikbaar ding in de DOM: dan kan het ook een animatie zijn; pas na 6 s stilte telt het als wachten. */
      if (beoordeeld || !s.wacht || nu() - sinds < (s.k.length ? 3000 : 6000)) return;
      beoordeeld = true;
      window.__f16Beoordeeld++;
      if (s.t.some(heeftOpdracht)) return;
      /* Midden in een opdracht van meer tikken (samen tellen: het kind tikt, Bliepo zegt alleen "3."): staat er alleen nog
         zo'n kort woord (hooguit 2 woorden per tekst) en stond de opdracht korter dan 30 s geleden in beeld, dan weet het
         kind nog wat het doet. Zolang het kind doortikt (elk wachtmoment binnen 30 s na het vorige) blijft dat zo. */
      if (opdrachtGezien && nu() - opdrachtGezien < 30000 && s.t.every((t) => t.split(" ").length <= 2)) { window.__f16Bezig = (window.__f16Bezig || 0) + 1; opdrachtGezien = nu(); return; }
      const t0 = nu();
      window.__f16.push({ t: t0, tekst: s.t.join(" | ").slice(0, 240), knoppen: [...new Set(s.k)].join(", ").slice(0, 120) || "(alleen de tekening)", gezegd: window.__f16Gesproken.filter((g) => t0 - g.t < 20000).map((g) => g.z).slice(-3).join(" / ").slice(0, 240) });
    }, 200);
    /**
     * Voor de speler: mag ik tikken? rustig = wacht altijd tot dit moment beoordeeld is; anders alleen als er nu geen
     * vraag of opdracht in beeld staat. Na 9 s in dezelfde stand mag het altijd (dan praat Bliepo eindeloos of de meter
     * ziet het niet als wachten).
     */
    window.__f16Klaar = (rustig) => {
      const s = laatste ?? stand();
      if (!s.wacht || beoordeeld) return true;
      if (!rustig && s.t.some(heeftOpdracht)) return true;
      return nu() - sinds > 9000;
    };
  })();
`;

/** lijst: window.__f16; geeft foutmeldingen (elke tekst 1 keer, hooguit 8). */
export function vraagFouten(lijst) {
  const gezien = new Set();
  const fouten = [];
  for (const x of lijst ?? []) {
    const k = x.tekst + "|" + x.knoppen;
    if (gezien.has(k)) continue;
    gezien.add(k);
    fouten.push(`F16: de les wacht op het kind zonder vraag of opdracht in beeld. In beeld: "${x.tekst.slice(0, 110) || "(geen tekst)"}"; te tikken: ${x.knoppen}${x.gezegd ? `; net gezegd: "${x.gezegd.slice(0, 110)}"` : ""}`);
  }
  return fouten.slice(0, 8);
}

/* ---------- los draaien: het begin van elke gouden les, zonder tik ---------- */
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const { spawn } = await import("node:child_process");
  const { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync, readFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
  const FOTO = process.env.FOTO ?? null;
  const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
  const ids = process.env.LESSEN
    ? process.env.LESSEN.split(",").filter(Boolean)
    : [...new Set(readFileSync(new URL("../public/alle-lessen.html", import.meta.url), "utf8").match(/squla-[a-z0-9-]*gouden[a-z-]*/g) ?? [])].sort();
  const CHROME = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));
  const map = mkdtempSync(join(tmpdir(), "vraag-aanwezig-"));
  const poort = 9360 + (process.pid % 40);
  const chrome = spawn(CHROME, [...(process.env.ZONDERVENSTER ? ["--headless=new"] : ["--new-window", "--window-size=1440,1000", "--no-default-browser-check"]), `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "--autoplay-policy=document-user-activation-required", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
  const ruimOp = () => { try { chrome.kill("SIGKILL"); } catch {} try { rmSync(map, { recursive: true, force: true }); } catch {} };
  process.on("exit", ruimOp);
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => process.exit(130));
  let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try { wsUrl = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl; } catch { await wacht(200); }
  }
  if (!wsUrl) { console.log("Chrome start niet."); process.exit(1); }
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let n = 0;
  const wachtend = new Map();
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && wachtend.has(m.id)) { wachtend.get(m.id)(m); wachtend.delete(m.id); } });
  const stuur = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; wachtend.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params, sessionId })); });
  let fout = 0;
  for (const id of ids) {
    const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
    const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
    const ev = async (e) => (await stuur("Runtime.evaluate", { expression: e, returnByValue: true }, s).catch(() => null))?.result?.value ?? null;
    await stuur("Page.enable", {}, s);
    await stuur("Network.enable", {}, s);
    await stuur("Network.setBlockedURLs", { urls: ["*/api/stem*"] }, s);
    await stuur("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, s);
    await stuur("Page.addScriptToEvaluateOnNewDocument", { source: VRAAG_METER }, s);
    await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${id}?naam=Testkind` }, s);
    /* Wachten tot de les er staat (de ontwikkelversie compileert soms lang), dan 12 seconden niets doen. */
    let st = null;
    for (let i = 0; i < 150; i++) { await wacht(400); st = await ev(`window.__f16Stand ? window.__f16Stand() : null`); if (st && st.tekst.length) break; }
    await wacht(12000);
    st = await ev(`window.__f16Stand ? window.__f16Stand() : null`);
    if (FOTO) {
      mkdirSync(FOTO, { recursive: true });
      const { data } = await stuur("Page.captureScreenshot", { format: "jpeg", quality: 75 }, s);
      writeFileSync(join(FOTO, `begin-${id}.jpg`), Buffer.from(data, "base64"));
    }
    await stuur("Target.closeTarget", { targetId }).catch(() => {});
    if (!st || !st.tekst.length) { fout++; console.log(`✗ ${id}: de les kwam niet in beeld`); continue; }
    if (st.start) console.log(`✓ ${id}: na 12 s zonder tik staat de start-aanwijzing in beeld ("Tik op het scherm. Dan begint Bliepo.")`);
    else if (st.opdracht) console.log(`✓ ${id}: na 12 s zonder tik staat er een vraag of opdracht ("${st.tekst.find((t) => /\?|^Tik|[.!] Tik/.test(t)) ?? st.tekst[0]}")`);
    else { fout++; console.log(`✗ ${id}: F16 bij het begin: na 12 s zonder tik wacht de les, zonder vraag of opdracht. In beeld: "${st.tekst.join(" | ").slice(0, 160)}"; pijl: ${st.pijl ? "ja" : "nee"}; te tikken: ${st.knoppen.join(", ") || "(niets)"}`); }
  }
  console.log(`\nBegincontrole (F16): ${ids.length} gouden lessen, ${fout} met een begin zonder vraag of opdracht.`);
  process.exit(fout ? 1 : 0);
}
