/**
 * Rekencontrole (28 oktober 2026, opdracht eigenaar): klopt het goede antwoord
 * bij elke vraag in de nagebouwde Synthesis-lessen, zijn de foute antwoorden
 * echt fout, en klopt de hulp bij 1× en 2× fout?
 *
 *   npm run reken                       alle tien de lessen
 *   LESSEN=klok-halve-uren npm run reken
 *   UITGEBREID=1 npm run reken          ook elke vraag die niet na te rekenen was
 *
 * Lessen (alleen de nagebouwde, met indeling "synthesis"):
 *   verhaal-instaptoets, verhaal-kleine-verhalen, verhaal-grote-verhalen,
 *   verhaal-verstopte-getallen, verhaal-eindtoets,
 *   klok-urenwijzer, klok-hele-uren-zetten, klok-halve-uren, klok-kwart-over,
 *   klok-minuten-later.
 *
 * Hoe het werkt (zonder browser): de echte lessen worden in Node geladen en
 * gespeeld met een nagebootste lesgids (het Lesgids-contract uit
 * src/components/les/soort.ts). De speler is een kind dat alles goed doet, of
 * bij vraag nummer N 1× fout, 2× fout of "weet ik niet" zegt (elke foute optie
 * apart), in elke tak van de les ("Ja", "Nee", "Weet ik niet", toets, les).
 * Bij elke vraag rekent dit script het goede antwoord ZELF uit, los van wat
 * de code zegt:
 *   - verhaaltjes: uit de zinnen van het verhaal (getallen en woorden als
 *     "weg", "bij", "uit", "een paar"), ook de som die erbij hoort;
 *   - klok: uit de stand van de klok en de tekst (Nederlandse tijden: half 5 =
 *     4:30, kwart over 5 = 5:15, 10 over 3 = 3:10; minuten later, ook over het
 *     uur heen; waar een wijzer staat; te zetten tijden).
 * en vergelijkt dat met het antwoord dat de code als goed ziet, de keuzes
 * (het goede antwoord er precies één keer tussen, foute keuzes echt fout, geen
 * dubbele), de sommen op het scherm en de getallen en tijden in de zinnen van
 * Bliepo. Bij 1× en 2× fout wordt gecontroleerd dat de hulp het foute antwoord
 * niet goedkeurt, dat 2× fout het goede antwoord geeft (of de les stopt, zoals
 * besloten: SYNTHESIS-ANALYSE/BESLUITEN.md) en dat een toets bij 2× fout
 * stopt en de eerste les begint.
 *
 * Stopt met exitcode 1 bij een fout. "Twijfel" is geen fout: dat meldt het
 * alleen. Voegt geen content toe en raakt de database niet aan.
 */

import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const WORTEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const Module = require("node:module");
const ts = require(path.join(WORTEL, "node_modules/typescript"));

/* ------------------------------------------------------------------ */
/* De lessen laden (TypeScript in Node, zonder Next.js)                */
/* ------------------------------------------------------------------ */

globalThis.window = globalThis;
globalThis.document = { addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {} }) };

const leegModule = new Proxy(() => ({}), {
  get: (_, k) => (k === "__esModule" ? false : () => ({ className: "", style: {}, variable: "" })),
});
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === "phaser" || request.startsWith("next/font")) return leegModule;
  return origLoad.call(this, request, ...rest);
};
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(WORTEL, "src", request.slice(2));
  return origResolve.call(this, request, ...rest);
};
for (const ext of [".ts", ".tsx"]) {
  require.extensions[ext] = (m, f) => {
    const uit = ts.transpileModule(fs.readFileSync(f, "utf8"), {
      compilerOptions: { module: "commonjs", jsx: "react-jsx", target: "es2022", esModuleInterop: true },
      fileName: f,
    });
    m._compile(uit.outputText, f);
  };
}
require.extensions[".css"] = (m) => {
  m.exports = new Proxy({}, { get: (_, k) => String(k) });
};

const LESMAP = process.env.REKEN_LESMAP ? path.resolve(process.env.REKEN_LESMAP) : path.join(WORTEL, "src/components/les/lessen");
const VERHAAL_IDS = ["verhaal-instaptoets", "verhaal-kleine-verhalen", "verhaal-grote-verhalen", "verhaal-verstopte-getallen", "verhaal-eindtoets"];
const KLOK_IDS = ["klok-urenwijzer", "klok-hele-uren-zetten", "klok-halve-uren", "klok-kwart-over", "klok-minuten-later"];

const verhaalLessen = require(path.join(LESMAP, "verhaaltjessommen.tsx")).LESSEN_VERHAALTJESSOMMEN;
const klokLessen = require(path.join(LESMAP, "klokkijken.tsx")).LESSEN_KLOKKIJKEN;
const alle = [...verhaalLessen, ...klokLessen];
const lesVan = (id) => alle.find((x) => x.id === id);

/* ------------------------------------------------------------------ */
/* Kleine hulpjes                                                      */
/* ------------------------------------------------------------------ */

const mod = (n, m) => ((n % m) + m) % m;
const uurVan = (t) => Math.floor(mod(t, 720) / 60) || 12;
const volgend = (h) => (h % 12) + 1;
const digitaalLabel = (t) => `${uurVan(t)}:${String(mod(t, 60)).padStart(2, "0")}`;
const schoon = (s) => String(s).replace(/[[\]_*]/g, "").replace(/[{}]/g, "");
const getallenIn = (s) => (String(s).match(/\d+/g) || []).map(Number);
const accoladeGetallen = (s) => [...String(s).matchAll(/\{(\d+)\}/g)].map((m) => Number(m[1]));
const STOP = { stop: true };

/** Nederlandse tijd (label) naar minuten sinds 12 uur (modulo 12 uur); `null` als het geen tijd is. */
function labelNaarMin(label) {
  const s = String(label).trim().toLowerCase();
  let m;
  const h12 = (x) => mod(Number(x), 12) * 60;
  if ((m = s.match(/^(\d+) uur$/))) return Number(m[1]) > 12 ? null : h12(m[1]);
  if ((m = s.match(/^half (\d+)$/))) return mod(h12(m[1]) - 30, 720);
  if ((m = s.match(/^kwart over (\d+)$/))) return h12(m[1]) + 15;
  if ((m = s.match(/^kwart voor (\d+)$/))) return mod(h12(m[1]) - 15, 720);
  if ((m = s.match(/^(\d+) over half (\d+)$/))) return mod(h12(m[2]) - 30 + Number(m[1]), 720);
  if ((m = s.match(/^(\d+) voor half (\d+)$/))) return mod(h12(m[2]) - 30 - Number(m[1]), 720);
  if ((m = s.match(/^(\d+) over (\d+)$/))) return mod(h12(m[2]) + Number(m[1]), 720);
  if ((m = s.match(/^(\d+) voor (\d+)$/))) return mod(h12(m[2]) - Number(m[1]), 720);
  if ((m = s.match(/^(\d{1,2}):(\d\d)$/))) {
    if (Number(m[2]) >= 60 || Number(m[1]) > 12) return null; /* "6:60" en "13:00" bestaan niet op een wijzerklok */
    return mod(h12(m[1]) + Number(m[2]), 720);
  }
  return null;
}
const isTijdLabel = (s) => /^(\d+ uur|half \d+|kwart (over|voor) \d+|\d+ (over|voor) (half )?\d+|\d{1,2}:\d\d)$/.test(String(s).trim().toLowerCase());
/** Een digitale tijd die niet kan (6:60, 3:68, 5:77). */
const onmogelijkeTijd = (s) => /^\d{1,2}:\d\d$/.test(s) && Number(s.split(":")[1]) >= 60;
/** Een digitale tijd met een uur boven de 12 (13:00): op een 24-uursklok ook goed. */
const bovenTwaalf = (s) => (/^\d{1,2}:\d\d$/.test(s) && Number(s.split(":")[0]) > 12) || (/^\d+ uur$/.test(s) && Number(s.split(" ")[0]) > 12);
/** Zoals labelNaarMin, maar een uur boven de 12 telt als 24-uurstijd (voor de twijfelmelding). */
const labelNaarMin24 = (s) => (bovenTwaalf(s) ? labelNaarMin(s.replace(/^(\d+)(?=[: ])/, (x) => String(Number(x) - 12))) : null);

/* ------------------------------------------------------------------ */
/* Verhaaltjes: het antwoord uit de zinnen                             */
/* ------------------------------------------------------------------ */

const MIN_WOORDEN = /\b(weg|wegvliegen|vliegen|vlieg|knap|knappen|uit|uitgeven|uitgegeven|uitgedaan|dicht|eraf|kwijt)\b|geeft er .* uit|worden er .* uitgegeven/i;
const PLUS_WOORDEN = /\b(bij|erbij|aan|open|gloeien|geeft me|krijg|krijgt|kreeg|plant|plantte|toveren|tovert|toverde|komen)\b/i;

/** Leest een verhaal: begin, verandering, eind en welk deel gevraagd wordt. */
function leesVerhaal(zinnen) {
  if (!zinnen || zinnen.length < 2) return null;
  const z = zinnen.map(schoon);
  const vraagZin = z[z.length - 1];
  const body = z.slice(0, -1);
  if (!/\?\s*$/.test(vraagZin) || body.length < 2) return null;
  const onbekend = (s) => !/\d/.test(s) && /\b(een paar|nog wat|wat)\b/i.test(s);
  const get = (s) => (getallenIn(s).length === 1 ? getallenIn(s)[0] : onbekend(s) ? null : undefined);
  const a = get(body[0]);
  const b = get(body[1]);
  const c = body.length > 2 ? get(body[2]) : undefined;
  if (a === undefined || b === undefined || (body.length > 2 && c === undefined)) return { fout: `kan de getallen niet lezen: ${z.join(" / ")}` };
  const min = MIN_WOORDEN.test(body[1]);
  const plus = PLUS_WOORDEN.test(body[1]);
  let op = min && !plus ? "−" : plus && !min ? "+" : null;
  if (!op && a != null && c != null) op = c > a ? "+" : "−";
  if (!op) return { fout: `kan niet zien of het erbij of eraf is: ${body[1]}` };
  const eindOp = a != null && c != null ? (c > a ? "+" : c < a ? "−" : null) : null;
  const notities = [];
  if (eindOp && eindOp !== op) notities.push(`de woorden zeggen "${op}" maar het begin ${a} en het eind ${c} horen bij "${eindOp}"`);
  let oplossing;
  let gevraagd;
  if (a == null) {
    gevraagd = "begin";
    oplossing = op === "+" ? c - b : c + b;
  } else if (b == null) {
    gevraagd = "verandering";
    oplossing = op === "+" ? c - a : a - c;
  } else {
    gevraagd = "uitkomst";
    oplossing = op === "+" ? a + b : a - b;
    if (c != null && c !== oplossing) notities.push(`${a} ${op} ${b} = ${oplossing}, maar het verhaal zegt ${c}`);
  }
  if (c != null && a != null && b != null && c !== oplossing) {
    /* al gemeld */
  } else if (a != null && b == null && oplossing < 0) notities.push(`negatieve verandering (${oplossing})`);
  /* Wat de laatste zin vraagt, moet kloppen met wat onbekend is (alleen een waarschuwing). */
  const vz = vraagZin.toLowerCase();
  const vraagtBegin = /\beerst\b|begin/.test(vz);
  const vraagtVerandering = !vraagtBegin && /(erbij|\bbij\b|\buit\b|\bweg\b|kreeg|plantte|toverde|gaf|knapten|deed)/.test(vz);
  const wordingType = vraagtBegin ? "begin" : vraagtVerandering ? "verandering" : "uitkomst";
  if (wordingType !== gevraagd) notities.push(`de vraag "${vraagZin}" past niet bij wat onbekend is (${gevraagd})`);
  return { a, b, c, op, oplossing, gevraagd, notities, delen: [a, b, c ?? oplossing] };
}

/** Een som als tekst ("7 + ? = 15", "10 − 3"): is hij waar voor dit verhaal? */
function somWaarheid(optie, v) {
  const m = String(optie).trim().match(/^(\?|\d+) ([+−-]) (\?|\d+)(?: = (\?|\d+))?$/);
  if (!m) return null;
  const op = m[2] === "-" ? "−" : m[2];
  const val = (x) => (x === "?" ? v.oplossing : Number(x));
  if (m[4] === undefined) {
    /* "10 − 3": de som die bij het verhaal hoort (zelfde teken, zelfde getallen; plus mag omgewisseld). */
    if (m[1] === "?" || m[3] === "?") return null;
    const p = Number(m[1]);
    const q = Number(m[3]);
    if (v.a == null || v.b == null) return { waar: false, uitkomstGelijk: false };
    const zelf = op === v.op && ((p === v.a && q === v.b) || (op === "+" && p === v.b && q === v.a));
    const waarde = op === "+" ? p + q : p - q;
    return { waar: zelf, uitkomstGelijk: !zelf && waarde === v.oplossing };
  }
  const links = op === "+" ? val(m[1]) + val(m[3]) : val(m[1]) - val(m[3]);
  return { waar: links === val(m[4]), uitkomstGelijk: false };
}

/* ------------------------------------------------------------------ */
/* Het orakel: wat is het goede antwoord op deze vraag?                */
/* ------------------------------------------------------------------ */

const TAKVRAAG = /Denk je dat|Weet je hoe je|Wil je in een toets|Kun je deze meteen|alleen kunt|Denk je dat je het kunt/i;

/**
 * Rekent het goede antwoord uit. Geeft { soort, ... } of null (niet na te rekenen).
 *   soort "tak": een keuze die niets met rekenen te maken heeft (Ja/Nee: weet je dit al?)
 *   soort "tekst": een tekstantwoord  { ant: "Nee" }
 *   soort "getal": { ant: "8" }
 *   soort "tijd": { min }  (minuten sinds 12 uur, modulo 12 uur)
 *   soort "som": { goede: [..] }
 *   soort "lijst": { ant, uitleg } een label uit opties
 * Voegt `notities` (zachte meldingen) toe.
 */
function orakel(ev, c) {
  const opties = ev.opties;
  const q = c.vraag; /* alles wat Bliepo zei sinds de vorige vraag */
  const laatste = c.regels.length ? c.regels[c.regels.length - 1] : "";
  const qs = schoon(q);
  const stand = ev.props.stand?.tijd;
  const heeftStand = typeof stand === "number";

  if (opties.length === 2 && opties.includes("Ja") && opties.includes("Nee") && TAKVRAAG.test(qs)) return { soort: "tak" };
  if (opties.includes("Toets") && opties.includes("Les")) return { soort: "tak" };

  /* ----- verhaaltjes ----- */
  const v = leesVerhaal(ev.props.zinnen);
  if (v && v.fout) return { soort: "onleesbaar", uitleg: v.fout };
  if (v) {
    if (opties.every((o) => /^(\?|\d+) [+−-] (\?|\d+)( = (\?|\d+))?$/.test(o))) {
      const goede = [];
      const uitkomstGelijk = [];
      for (const o of opties) {
        const w = somWaarheid(o, v);
        if (w?.waar) goede.push(o);
        else if (w?.uitkomstGelijk) uitkomstGelijk.push(o);
      }
      return { soort: "som", goede, uitkomstGelijk, v };
    }
    if (opties.includes("+ Erbij")) return { soort: "tekst", ant: v.op === "+" ? "+ Erbij" : "− Eraf", v };
    if (opties.includes("Erbij doen") || opties.includes("Erbij planten") || opties.includes("Erbij")) {
      const erbij = opties.find((o) => /^Erbij/.test(o));
      const eraf = opties.find((o) => /^Weghalen/.test(o));
      return { soort: "tekst", ant: v.op === "+" ? erbij : eraf, v };
    }
    if (opties.includes("Groter") || opties.includes("Kleiner")) return { soort: "tekst", ant: v.op === "+" ? "Groter" : "Kleiner", v };
    if (opties.includes("Meer") && opties.includes("Minder") && !opties.includes("Ja")) return { soort: "tekst", ant: v.op === "+" ? "Meer" : "Minder", v };
    if (opties.includes("Minder") && opties.includes("Meer")) return { soort: "tekst", ant: v.op === "+" ? "Meer" : "Minder", v };
    if (/hetzelfde antwoord/.test(qs) && opties.includes("Ja")) return { soort: "tekst", ant: "Ja", v };
    /* "?" of (sinds 28 okt 2026, gedrag Synthesis Mixed Problems) de knop "Dat weten we nog niet" / "Een paar": het onbekende deel. */
    const ONB = ["?", "Dat weten we nog niet", "Een paar"];
    const onbKnop = opties.find((o) => ONB.includes(o));
    if (opties.every((o) => /^\d+$/.test(o) || ONB.includes(o))) {
      let doel = "oplossing";
      const paar = v.a != null && v.b != null && opties.length === 2 && opties.every((o) => [String(v.a), String(v.b)].includes(o));
      if (/Welk getal zetten we eerst/.test(qs) || (paar && /\beerst\b/.test(laatste))) doel = "a";
      else if (/welk getal (halen we eraf|tellen we erbij op|doen we erbij)|welk getal zegt hoeveel|zegt hoeveel/i.test(laatste) || /welk getal (halen we eraf|tellen we erbij op|doen we erbij)/i.test(qs)) doel = "b";
      else if (onbKnop) {
        const l = laatste.toLowerCase();
        if (/Luister naar deze zin/.test(qs) && c.stapDoel) doel = c.stapDoel;
        else doel = /eerst|begonnen/.test(l) ? "a" : /(plant|plantte|kreeg|deed|uit\b|erbij|weg|geef)/.test(l) ? "b" : "c";
        c.stapDoel = doel;
      }
      let waarde;
      if (doel === "a") waarde = v.a;
      else if (doel === "b") waarde = v.b;
      else if (doel === "c") waarde = v.c ?? v.oplossing;
      else waarde = v.oplossing;
      if (onbKnop) return { soort: "getal", ant: waarde == null ? onbKnop : String(waarde), v, doel };
      /* Bij onbekend begin/verandering is de waarde de oplossing */
      if (waarde == null) waarde = v.oplossing;
      return { soort: "getal", ant: String(waarde), v, doel };
    }
  }

  /* ----- klok ----- */
  /* Sam: heeft Sam gelijk? */
  let m;
  if (opties.includes("Ja") && opties.includes("Nee") && (m = qs.match(/Het is (\d+:\d\d), en Sam zegt dat het over (\d+) minuten (\d+:\d\d) is/))) {
    const basis = labelNaarMin(m[1]);
    const verwacht = digitaalLabel(basis + Number(m[2]));
    return { soort: "tekst", ant: m[3] === verwacht ? "Ja" : "Nee" };
  }
  if (opties.includes("Ja") && opties.includes("Nee") && (m = qs.match(/Is dit (\d+) uur\?/))) {
    if (!heeftStand) return null;
    return { soort: "tekst", ant: mod(stand, 60) === 0 && uurVan(stand) === Number(m[1]) ? "Ja" : "Nee" };
  }
  if (opties.includes("Ja") && opties.includes("Nee") && TAKVRAAG.test(qs)) return { soort: "tak" };

  /* Minuten later */
  const call = schoon((c.laatsteCall ?? []).join(" "));
  const mNMin = call.match(/(?:Hoe laat is het|Wat zegt (?:hij|de klok)(?: dan)?|En)[^?]*?(?:over )?(\d+) minuten(?: later| daarna)?\?|En nog eens (\d+) minuten\?/);
  if (mNMin && opties.every((o) => /^\d+:\d\d$/.test(o))) {
    const N = Number(mNMin[1] ?? mNMin[2]);
    let basisMin;
    const expl = [...call.matchAll(/(?:Het is(?: nu)?|De klok zegt nu|zegt nu) (\d{1,2}:\d\d)/g)];
    const notities = [];
    if (expl.length) basisMin = labelNaarMin(expl[0][1]);
    else if (/daarna|nog eens/.test(call)) {
      basisMin = c.vorigAnt;
      if (basisMin != null && heeftStand && mod(stand, 720) !== basisMin) notities.push(`de klok staat op ${digitaalLabel(stand)}, het vorige antwoord was ${digitaalLabel(basisMin)}`);
    } else basisMin = heeftStand ? mod(stand, 720) : c.basis;
    if (basisMin == null) return null;
    if (expl.length && heeftStand && mod(stand, 720) !== basisMin) notities.push(`de tekst zegt ${expl[0][1]} maar de klok staat op ${digitaalLabel(stand)}`);
    return { soort: "tijd", min: mod(basisMin + N, 720), basis: basisMin, N, bijwerken: true, notities };
  }
  if (/bij de 12 bovenaan komt/.test(qs) && c.basis != null) {
    return { soort: "tijd", min: (Math.floor(c.basis / 60) + 1) * 60 % 720 };
  }
  if (/Hoe laat is het over een uur\?/.test(qs) && heeftStand) return { soort: "tijd", min: mod(stand + 60, 720) };

  /* Een klok aflezen */
  if (opties.filter(isTijdLabel).length >= 2 && opties.every((o) => isTijdLabel(o) || onmogelijkeTijd(o) || /^\d+ minuten$/.test(o)) && /Hoe laat|Wat zegt de klok|En deze\?|En nu\?/.test(qs) && heeftStand) {
    return { soort: "tijd", min: mod(stand, 720) };
  }
  /* Hoe noemen we deze tijd? */
  if (/Hoe noemen we deze tijd/.test(qs) && heeftStand) {
    const lab = `${uurVan(stand)} uur`;
    return { soort: "lijst", ant: opties.find((o) => o === lab), uitleg: `klok staat op ${lab}` };
  }
  /* De urenwijzer wijst naar ... */
  if (/(Naar welk getal wijst de urenwijzer|Waar wijst hij nu|waar wijst de urenwijzer nu naartoe)/i.test(qs) && heeftStand) {
    return { soort: "getal", ant: String(uurVan(stand)) };
  }
  if (/(Waar wijst de minutenwijzer naar|Waar moet de minutenwijzer dan wijzen|Naar welk getal wijst hij)/.test(qs) && heeftStand) {
    return { soort: "getal", ant: String(mod(stand, 60) / 5 || 12) };
  }
  if (/Waar wees de minutenwijzer elke keer/.test(qs)) return { soort: "getal", ant: "12" };
  if (/Welk getal zie je daar/.test(qs)) return { soort: "getal", ant: "12" };
  if (/Welk getal staat helemaal onderaan/.test(qs)) return { soort: "getal", ant: "6" };
  if ((m = qs.match(/Welk getal komt (?:direct|meteen) na de (\d+)/))) return { soort: "getal", ant: String(volgend(Number(m[1]))) };
  if (/Welk uur is hij al voorbij/.test(qs) && heeftStand) return { soort: "getal", ant: String(uurVan(stand)) };
  if (/Tussen welke twee getallen staat de urenwijzer/.test(qs) && heeftStand) {
    const h = uurVan(stand);
    return { soort: "lijst", ant: opties.find((o) => o === `${h} en ${volgend(h)}`), uitleg: `urenwijzer staat tussen ${h} en ${volgend(h)}` };
  }
  if (/Waar wees de minutenwijzer/.test(qs)) return { soort: "getal", ant: "12" };
  if (/Hoe heet hij/.test(qs) && /lange blauwgroene wijzer telt de minuten/.test(qs)) return { soort: "tekst", ant: "de minutenwijzer" };
  if (/Hoe noemen we die\?/.test(qs) && /korte oranje wijzer/.test(qs)) return { soort: "tekst", ant: "de urenwijzer" };
  if (/Weet je hoe dit heet/.test(qs) && opties.includes("een getallenlijn")) return { soort: "tekst", ant: "een getallenlijn" };
  if (/Hoe noemen we dit\?/.test(qs) && opties.includes("een klok")) return { soort: "tekst", ant: "een klok" };
  if (/Welke wijzer (vertelde je|laat) het uur/.test(qs)) return { soort: "tekst", ant: "de korte" };
  if (/Wat telt de lange wijzer/.test(qs)) return { soort: "tekst", ant: "de minuten" };
  if (/Wat deed Sam fout/.test(qs)) {
    const t = ev.props.tweede;
    if (!t) return null;
    return { soort: "tekst", ant: t.uurTijd !== t.tijd ? "de urenwijzer" : "niets" };
  }
  if (/Wat deed de urenwijzer/.test(qs) && /helemaal rond/.test(qs)) return { soort: "tekst", ant: "ging één getal verder" };
  if (/Hoeveel (van (het|een) uur|tijd) is er voorbij/.test(qs)) {
    if (/half rondje/.test(qs)) return { soort: "tekst", ant: "een half uur" };
    if (/kwart van zijn reis/.test(qs)) return { soort: "tekst", ant: "een kwartier" };
    if (/Eerst was het (\d+) uur, en nu is het (\d+) uur/.test(qs)) {
      const mm = qs.match(/Eerst was het (\d+) uur, en nu is het (\d+) uur/);
      return { soort: "tekst", ant: mod(Number(mm[2]) - Number(mm[1]), 12) === 1 ? "een uur" : null };
    }
    return null;
  }
  /* Waar staat de urenwijzer (op / tussen / voorbij)? */
  if (/(Waar wijst zijn punt naar|Waar staat de urenwijzer|Waar staat hij|Maar waar staat de urenwijzer nu)/.test(qs) && opties.some((o) => /\bde \d+\b/.test(o))) {
    let t;
    const mk = qs.match(/om kwart over (\d+)/);
    const mh = qs.match(/Half (\d+) is nog maar een half uur weg/);
    if (mk) t = mod(Number(mk[1]) * 60 + 15, 720);
    else if (mh) t = mod((Number(mh[1]) - 1) * 60 + 30, 720);
    else if (heeftStand) t = stand;
    if (t == null) return null;
    const h = uurVan(t);
    const mm = mod(t, 60);
    const zoek = (re) => opties.find((o) => re.test(o));
    let ant = null;
    if (mm === 0) ant = zoek(new RegExp(`^(op )?de ${h}$`));
    else if (mm < 30) ant = zoek(new RegExp(`voorbij de ${h}$`));
    else if (mm === 30) ant = zoek(new RegExp(`^(tussen de ${h} en de ${volgend(h)}|halverwege de ${h} en de ${volgend(h)})$`));
    return { soort: "lijst", ant: ant ?? undefined, uitleg: `urenwijzer bij ${digitaalLabel(t)}` };
  }
  return null;
}

/** Gedeelde speelstand van één run: wat Bliepo zei, de laatste tijden, de teller. */
function nieuweContext() {
  return { regels: [], vraag: "", basis: null, vorigAnt: null, laatsteN: null, nr: 0, huidig: null, vragen: [], laatsteVE: null, laatsteCall: [], calls: [] };
}

/* ------------------------------------------------------------------ */
/* De nagebootste lesgids en de speler                                 */
/* ------------------------------------------------------------------ */

const TAKKEN = [
  { naam: "Ja/Toets", ja: "Ja", toets: "Toets" },
  { naam: "Nee", ja: "Nee", toets: "Toets" },
  { naam: "Weet ik niet", ja: null, toets: "Toets" },
  { naam: "Ja/Les", ja: "Ja", toets: "Les" },
];

/**
 * Speelt één les. `plan.scenario` = { q, soort: "fout"|"weet", aantal, d } of null (alles goed).
 */
/* ZINNEN_UIT=bestand: alle zinnen die Bliepo uitspreekt (per les) bewaren, voor de stem (npm run stemlessen). */
const ZINNEN = new Map();
let huidigeLes = "";
const verzamel = (zinnen) => {
  if (!process.env.ZINNEN_UIT) return;
  const set = ZINNEN.get(huidigeLes) ?? new Set();
  for (const z of zinnen) if (z && /\p{L}/u.test(z)) set.add(z);
  ZINNEN.set(huidigeLes, set);
};

async function speelLes(les, tak, scenario) {
  huidigeLes = les.id;
  globalThis.__phaser = {};
  const log = [];
  const c = nieuweContext();
  let props = {};
  let stappen = 0;
  const tik = async () => {
    if (++stappen > 30000) throw new Error("De les loopt vast (meer dan 30000 stappen)");
    await Promise.resolve();
  };

  const nieuweZeg = (regels) => {
    c.laatsteCall = regels;
    c.calls.push(regels);
    if (c.calls.length > 4) c.calls.shift();
    for (const r of regels) {
      c.regels.push(r);
      const m = schoon(r).match(/(?:Het is(?: nu)?|De klok zegt nu|zegt nu) (\d{1,2}:\d\d)/);
      if (m) c.basis = labelNaarMin(m[1]);
    }
  };

  /* Welke tijd kiest het kind, wat is goed? */
  const speler = {
    kies(ev) {
      c.vraag = c.regels.slice(-5).join(" ");
      const o = orakel(ev, c);
      ev.orakel = o;
      const codeGoed = ev.goed == null ? null : String(ev.goed);
      /* Wat is het goede antwoord voor de speler? */
      let goed = null;
      if (o?.soort === "tak") {
        if (ev.opties.includes("Toets")) return tak.toets;
        return tak.ja;
      }
      if (o?.soort === "tijd") {
        const juist = ev.opties.filter((x) => labelNaarMin(x) === o.min);
        goed = juist.includes(codeGoed) ? codeGoed : juist[0] ?? codeGoed;
        if (o.bijwerken) {
          c.vorigAnt = o.min;
          c.laatsteN = o.N;
          c.basis = o.basis;
        }
      } else if (o?.soort === "som") goed = o.goede.includes(codeGoed) ? codeGoed : o.goede[0] ?? codeGoed;
      else if (o?.soort === "tekst" || o?.soort === "getal" || o?.soort === "lijst") goed = o.ant ?? codeGoed;
      else goed = codeGoed;
      ev.verwacht = goed;
      if (goed == null) {
        /* een vraag zonder te kennen antwoord (bijvoorbeeld "Weet je hoe dit heet?"): de eerste optie */
        ev.zonderAntwoord = true;
        c.regels = [];
        return ev.opties[0];
      }
      const keuze = beslis(ev, goed, "kies");
      c.regels = [];
      return keuze;
    },
    vlak(soort, taak) {
      const s = [].concat(soort);
      if (taak && ["uur", "tijd", "minuut"].includes(taak.soort)) return klokTaak(s, taak);
      if (s.includes("plaatje")) {
        const pl = props.plaatjes;
        const wil = props.tikPlaatje === "weg" ? "aan" : "uit";
        /* Alleen de voorwerpen die aan te tikken zijn (tikAlleen, 28 okt 2026: bijvoorbeeld alleen de bloemen die erbij kwamen). */
        const i = pl ? pl.plekken.findIndex((st, j) => st === wil && (!props.tikAlleen || props.tikAlleen.includes(j))) : -1;
        return { soort: "plaatje", i };
      }
      if (s.includes("zin") && props.tik === "zin") return { soort: "zin", i: (props.zinnen?.length ?? 1) - 1 };
      if (s.includes("weetniet")) return { soort: "weetniet" };
      if (s.includes("getal")) return { soort: "getal" };
      if (s.includes("uur")) return { soort: "uur", tijd: 0 };
      throw new Error(`onbekende melding van het vlak: ${s.join(",")}`);
    },
  };

  /* Identiteit van de vraag: nieuw of een herhaling van dezelfde. */
  function beslis(ev, goed, bron, poging, forceer) {
    const h = c.huidig;
    const herhaling =
      h && h.goed === goed && h.laatsteFout && (forceer || h.laatsteEv === c.laatsteVE) && (poging >= 2 || (ev.opties.length <= h.opties.length && ev.opties.every((x) => h.opties.includes(x) || x === goed)));
    if (!herhaling) {
      c.huidig = { nr: c.nr++, goed, opties: [...ev.opties], pogingen: 0, laatsteFout: false, gekozen: [], bron };
      c.vragen.push(c.huidig);
    } else {
      c.huidig.opties = [...new Set([...c.huidig.opties, ...ev.opties])];
    }
    const hh = c.huidig;
    ev.vraagNr = hh.nr;
    ev.poging = hh.pogingen + 1;
    const sc = scenario && scenario.q === hh.nr ? scenario : null;
    let keuze = goed;
    if (sc) {
      const wil = sc.aantal;
      if (hh.pogingen < wil) {
        if (sc.soort === "weet" && hh.pogingen === 0) keuze = null;
        else {
          const alleFout = ev.opties.filter((x) => x !== goed && !(o2min(x) != null && o2min(x) === o2min(goed)));
          const nieuweFout = alleFout.filter((x) => !hh.gekozen.includes(x));
          const fout = nieuweFout.length ? nieuweFout : alleFout;
          if (fout.length) keuze = fout[(sc.d + hh.pogingen) % fout.length];
          else {
            keuze = goed; /* er is geen foute knop meer over */
            hh.onmogelijk = true;
            ev.onmogelijk = true;
          }
        }
      }
    }
    hh.pogingen++;
    hh.laatsteFout = keuze !== goed;
    if (keuze != null && keuze !== goed) hh.gekozen.push(keuze);
    ev.gekozenDoorSpeler = keuze;
    hh.laatsteEv = ev;
    c.laatsteVE = ev;
    return keuze;
  }
  const o2min = (x) => (isTijdLabel(x) ? labelNaarMin(x) : null);

  /* Klok zetten: een tijd doorgeven (goed of fout). */
  function klokTaak(soorten, taak) {
    const nieuw = taak.poging === 1 || !c.huidigTaak || c.huidigTaak.v !== taak.v;
    const doelTekst = taak.soort === "uur" ? `${taak.doel} uur` : digitaalLabel(taak.doel);
    const goed = `zet:${taak.soort}:${taak.doel}`;
    const h = c.huidig;
    const herhaling = h && h.goed === goed && h.laatsteEv === c.laatsteVE && (!nieuw || taak.poging === 99);
    if (!herhaling) {
      c.huidig = { nr: c.nr++, goed, opties: [], pogingen: 0, laatsteFout: false, gekozen: [], bron: "zet", doelTekst };
      c.vragen.push(c.huidig);
    }
    c.huidigTaak = { v: taak.v };
    const hh = c.huidig;
    const sc = scenario && scenario.q === hh.nr ? scenario : null;
    const goedTijd = taak.soort === "uur" ? u(taak.doel) : taak.doel;
    let tijd = goedTijd;
    let soort = soorten.includes("controle") ? "controle" : "gezet";
    if (sc && hh.pogingen < sc.aantal) {
      if (sc.soort === "weet" && hh.pogingen === 0 && soorten.includes("hulp")) soort = "hulp";
      else if (sc.soort === "weet" && hh.pogingen === 0) tijd = goedTijd; /* geen hulpknop: niets te doen */
      else if (taak.soort === "uur") tijd = (((taak.doel + (sc.d % 2 ? 9 : 0)) % 12) + 1) * 60;
      else if (taak.soort === "tijd") tijd = sc.d % 2 ? goedTijd - mod(goedTijd, 60) + (mod(goedTijd, 60) === 30 ? 0 : 30) : goedTijd + 60;
      else tijd = goedTijd - (sc.d % 2 ? 10 : 5);
      if (tijd === goedTijd && soort !== "hulp") tijd = goedTijd + 60;
    }
    hh.pogingen++;
    hh.laatsteFout = tijd !== goedTijd || soort === "hulp";
    if (hh.pogingen === 1) hh.startStand = props.stand?.tijd;
    const ev = {
      t: "zet",
      taak: { ...taak },
      soort,
      tijd,
      goedTijd,
      vraagNr: hh.nr,
      poging: hh.pogingen,
      gekozenDoorSpeler: soort === "hulp" ? "hulp" : tijd === goedTijd ? "goed" : "fout",
      regelsVoor: c.calls.flat(),
      startStand: hh.startStand,
      propsDoel: props.doel ?? null,
    };
    log.push(ev);
    hh.laatsteEv = ev;
    c.laatsteVE = ev;
    props = { ...props, stand: { tijd } };
    return { soort, tijd };
  }

  const u = (uur) => uur * 60;

  const l = {
    naam: process.env.RK_NAAM ?? "",
    async zeg(...z) {
      await tik();
      /* Kleurnotatie van het lesscherm ([[g:eraf]]) is geen tekst. */
      const regels = z.filter(Boolean).map((r) => String(r).replace(/\[\[[bgrum]:([^\]]+)\]\]/g, "$1"));
      verzamel(regels);
      nieuweZeg(regels);
      log.push({ t: "zeg", z: regels, stand: props.stand?.tijd, tweede: props.tweede, doel: props.doel, zinnen: props.zinnen, som: props.som });
    },
    async wijsAan(k, ...z) {
      await tik();
      verzamel(z.filter(Boolean));
      log.push({ t: "wijs", k, z });
    },
    async kies(opties, instel) {
      await tik();
      /* Een keuze met een woord leest Bliepo voor als het kind erop tikt. */
      verzamel(opties.map(String).filter((o) => /[a-z]/i.test(o)));
      /* Een som als keuze leest Bliepo voor de eerste keer voor ("7 min 2 is 5"; zie leesKeuze in Lesscherm.tsx). */
      verzamel(opties.map(String).filter((o) => /[=+−]/.test(o)).map((o) => o.replace(/\[\[[a-z]:([^\]]+)\]\]/g, "$1").replace(/[{}*]/g, "").replace(/−/g, " min ").replace(/\s*=\s*/g, " is ").replace(/\s*\+\s*/g, " plus ").replace(/\?/g, "hoeveel").replace(/\s+/g, " ").trim()));
      const taak = globalThis.__phaser?.klokTaak;
      const goedCode = globalThis.__phaser?.antwoord ?? (taak && taak.soort === "kies" ? taak.goed : null);
      const ev = { t: "kies", opties: [...opties], instel, goed: goedCode ?? null, props: { ...props }, regelsVoor: [...c.regels] };
      log.push(ev);
      let k;
      const eerder =
        taak && taak.soort === "kies" && taak.poging >= 2
          ? [...c.vragen].reverse().find((x) => x.laatsteFout && x.goed != null && ev.opties.includes(x.goed) && ev.opties.filter((o) => x.opties.includes(o)).length >= Math.min(2, ev.opties.length - 1))
          : null;
      if (eerder) {
        /* tweede poging bij de klok-vragen: dezelfde vraag als eerder (er kan een tussenvraag tussen zitten) */
        c.huidig = eerder;
        ev.orakel = eerder.orakel ?? null;
        ev.verwacht = eerder.goed;
        k = beslis(ev, eerder.goed, "kies", taak.poging, true);
        c.regels = [];
      } else {
        k = speler.kies(ev);
        if (c.huidig && ev.orakel) c.huidig.orakel = ev.orakel;
      }
      ev.keuze = k;
      globalThis.__phaser = { ...globalThis.__phaser, antwoord: undefined };
      log.push({ t: "gekozen", keuze: k });
      return k;
    },
    async knoppen() {
      return new Promise(() => {});
    },
    async verder() {
      await tik();
    },
    async wacht() {
      await tik();
    },
    async kaart() {
      log.push({ t: "kaart" });
    },
    async stopLes() {
      log.push({ t: "stop" });
      throw STOP;
    },
    vlak(comp, p) {
      props = { ...(p || {}) };
      log.push({ t: "vlak", naam: comp && (comp.name || comp.displayName) });
    },
    pasVlakAan(p) {
      if (p && "zinnen" in p && p.zinnen) log.push({ t: "nieuw", zinnen: [...p.zinnen] });
      props = { ...props, ...p };
      if (p && p.som && p.som.every((d) => d && d.t !== "leeg" && d.t !== "vraag" && d.t !== "vak")) log.push({ t: "som", som: p.som });
    },
    async wachtOpVlak(soort) {
      await tik();
      const taak = globalThis.__phaser?.klokTaak;
      const r = speler.vlak(soort, taak);
      log.push({ t: "vlakwacht", soort: [].concat(soort), antwoord: r });
      return r;
    },
    async getal() {
      await tik();
      return 5;
    },
    bak() {},
    uitBak() {},
    slot() {},
    som() {},
    async somVak() {
      return 0;
    },
  };

  let uitkomst = "klaar";
  let fout = null;
  try {
    await les.speel(l);
  } catch (e) {
    if (e === STOP) uitkomst = "stop";
    else {
      uitkomst = "fout";
      fout = e;
    }
  }
  const gekozenGetallen = new Set(log.filter((x) => x.t === "kies" && x.keuze != null && /^\d+$/.test(String(x.keuze))).map((x) => Number(x.keuze)));
  return { log, uitkomst, fout, vragen: c.nr, gekozenGetallen };
}

/* ------------------------------------------------------------------ */
/* De controles op een gespeelde les                                   */
/* ------------------------------------------------------------------ */

class Rapport {
  constructor(id) {
    this.id = id;
    this.fouten = new Map();
    this.twijfels = new Map();
    this.vragen = new Set();
    this.nagerekend = new Set();
    this.nietNagerekend = new Map();
    this.runs = 0;
    this.hulpControles = 0;
    this.pauzeUitkomsten = new Map();
  }
  fout(sleutel, tekst) {
    if (!this.fouten.has(sleutel)) this.fouten.set(sleutel, tekst);
  }
  twijfel(sleutel, tekst) {
    if (!this.twijfels.has(sleutel)) this.twijfels.set(sleutel, tekst);
  }
}

const regelsTekst = (r) => r.map((x) => schoon(x)).join(" | ");

/** Controles op één gespeelde run. */
function controleer(rap, run, plan) {
  const { log } = run;

  /* ----- run-fouten ----- */
  if (run.uitkomst === "fout") rap.fout(`crash:${plan.naam}:${String(run.fout?.message)}`, `De les crasht of loopt vast (${plan.naam}): ${String(run.fout?.message ?? run.fout)}`);

  /* ----- per vraag ----- */
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    if (e.t === "som") controleerSom(rap, e.som);
    if (e.t === "zet") controleerZet(rap, e, plan, log, i);
    if (e.t === "zeg") controleerZin(rap, e, log, i, run);
    if (e.t !== "kies") continue;
    const o = e.orakel;
    const vraagRegel = [...e.regelsVoor].reverse().find((r) => /\?/.test(r)) ?? e.regelsVoor[e.regelsVoor.length - 1] ?? "";
    const sig = `${[...e.opties].sort().join("/")}|${(e.props.zinnen || []).join("/")}|${e.props.stand?.tijd ?? ""}|${schoon(vraagRegel)}`;
    const telt = plan.basis && (e.poging ?? 1) === 1;
    if (o?.soort === "tak" || o == null) {
      if (e.goed != null || o == null) {
        if (telt) rap.vragen.add(sig);
        if (o == null && telt) rap.nietNagerekend.set(sig, `${regelsTekst(e.regelsVoor.slice(-2))} ${JSON.stringify(e.opties)} (code: ${e.goed})`);
      }
      if (o == null && e.goed != null) {
        /* Alleen de algemene controles (dubbel, goed erbij) */
        algemeneKeuzeControles(rap, e, e.goed);
      }
      continue;
    }
    if (telt) rap.vragen.add(sig);
    if (o.soort === "onleesbaar") {
      rap.nietNagerekend.set(sig, `${o.uitleg}`);
      rap.twijfel(`onleesbaar:${o.uitleg}`, `Kon een verhaal niet lezen: ${o.uitleg}`);
      continue;
    }
    if (telt) rap.nagerekend.add(sig);
    controleerKeuze(rap, e, o);
  }

  /* ----- hulp bij fout ----- */
  controleerHulp(rap, run, plan);
}

/** Opties: dubbele, goede erbij (precies één keer). */
function algemeneKeuzeControles(rap, e, goed) {
  const opts = e.opties;
  const ctx = `"${regelsTekst(e.regelsVoor.slice(-2))}" ${JSON.stringify(opts)}`;
  const gezien = new Set();
  for (const x of opts) {
    if (gezien.has(x)) rap.fout(`dubbel:${ctx}`, `Dubbele keuze "${x}": ${ctx}`);
    gezien.add(x);
  }
  /* Als tekst vergelijken: de code geeft een getal (4), de knoppen zijn tekst ("4"); dat zie je bij vragen zonder verhaal in beeld (Verstopte getallen: hulp met plaatjes, 28 okt 2026). */
  if (goed != null && opts.filter((x) => String(x) === String(goed)).length !== 1) rap.fout(`geengoed:${ctx}:${goed}`, `Het goede antwoord "${goed}" staat niet precies één keer tussen de keuzes: ${ctx}`);
}

function controleerKeuze(rap, e, o) {
  const opts = e.opties;
  const code = e.goed == null ? null : String(e.goed);
  const ctx = `"${regelsTekst(e.regelsVoor.slice(-2))}" ${JSON.stringify(opts)}${e.props.zinnen?.length ? ` verhaal: ${e.props.zinnen.map(schoon).join(" / ")}` : ""}`;
  if (o.soort === "tijd") {
    const juist = opts.filter((x) => labelNaarMin(x) === o.min);
    const naam = digitaalLabel(o.min);
    if (juist.length === 0) rap.fout(`tijd-geen:${ctx}`, `Geen enkele keuze is ${naam}, dat is het goede antwoord: ${ctx}`);
    if (juist.length > 1) rap.fout(`tijd-dubbel:${ctx}`, `Meer dan één keuze is ${naam} (${juist.join(", ")}): ${ctx}`);
    for (const n of o.notities ?? []) rap.fout(`tijd-notitie:${n}:${ctx}`, `Tijd en klok kloppen niet bij elkaar: ${n}: ${ctx}`);
    if (code != null && labelNaarMin(code) !== o.min) rap.fout(`tijd-code:${ctx}`, `De code ziet "${code}" als goed, maar nagerekend is het ${naam}: ${ctx}`);
    for (const x of opts) if (bovenTwaalf(x) && labelNaarMin24(x) === o.min) rap.twijfel(`24u:${x}:${naam}`, `Twijfel: keuze "${x}" is op een 24-uursklok ook ${naam} (de les gebruikt een 12-uursklok, dus als fout bedoeld): ${ctx}`);
    algemeneKeuzeControles(rap, e, code ?? juist[0]);
    /* de klok in beeld moet bij de tekst passen */
    return;
  }
  if (o.soort === "som") {
    const doel = o.goede;
    if (doel.length === 0) rap.fout(`som-geen:${ctx}`, `Geen enkele som past bij het verhaal: ${ctx}`);
    if (doel.length > 1) {
      const verhaalTekst = (e.props.zinnen || []).map(schoon).join(" / ");
      rap.twijfel(
        `som-meer:${[...doel].sort().join("|")}:${verhaalTekst}`,
        `Twijfel: bij "${verhaalTekst}" klopt meer dan één som (${[...doel].sort().join(" en ")}; een foute keuze is wiskundig ook waar, alleen in een andere volgorde), keuzes: ${JSON.stringify(opts)}`,
      );
    }
    if (code != null && !doel.includes(code)) rap.fout(`som-code:${ctx}`, `De code ziet "${code}" als goede som, maar die klopt niet bij het verhaal: ${ctx}`);
    for (const x of o.uitkomstGelijk) rap.twijfel(`som-gelijk:${x}:${ctx}`, `Twijfel: foute som "${x}" geeft hetzelfde antwoord als de goede: ${ctx}`);
    algemeneKeuzeControles(rap, e, code ?? doel[0]);
    return;
  }
  /* tekst, getal, lijst */
  const ant = o.ant;
  if (ant == null) {
    rap.fout(`ant-geen:${ctx}`, `Het goede antwoord${o.uitleg ? ` (${o.uitleg})` : ""} staat niet tussen de keuzes: ${ctx}`);
    return;
  }
  if (!opts.includes(ant)) rap.fout(`ant-niet:${ctx}`, `Het nagerekende goede antwoord "${ant}" staat niet tussen de keuzes: ${ctx}`);
  if (code != null && code !== ant) rap.fout(`ant-code:${ctx}`, `De code ziet "${code}" als goed, maar nagerekend is het "${ant}": ${ctx}`);
  if (o.v) for (const n of o.v.notities) rap.fout(`verhaal-notitie:${n}`, `Verhaal klopt niet in zichzelf: ${n} (${o.v ? [o.v.a, o.v.op, o.v.b, o.v.c].join(" ") : ""})`);
  algemeneKeuzeControles(rap, e, code ?? ant);
  /* Foute getalkeuzes die per ongeluk hetzelfde getal zijn */
}

/** Een som op het scherm (volledig ingevuld) moet kloppen. */
function controleerSom(rap, som) {
  const delen = som.map((d) => (d.t === "getal" ? d.n : d.t === "teken" ? d.s : null));
  if (delen.length !== 5 || delen[1] == null) return;
  const [p, op, q, , r] = delen;
  if (typeof p !== "number" || typeof q !== "number" || typeof r !== "number") return;
  const w = op === "+" ? p + q : p - q;
  if (w !== r) rap.fout(`som-reken:${p}${op}${q}=${r}`, `Een som op het scherm klopt niet: ${p} ${op} ${q} = ${r} (moet ${w} zijn)`);
}

/** Een zin van Bliepo: sommen in de tekst, tijden bij de klok, getallen in samenvattende zinnen. */
function controleerZin(rap, e, log, i, run) {
  const verhaal = e.zinnen && e.zinnen.length > 1 ? leesVerhaal(e.zinnen) : null;
  if (verhaal && !verhaal.fout) {
    /* Getallen in de zinnen van Bliepo: uit het verhaal, het antwoord, de som of een telwoord. */
    const toegestaan = new Set([verhaal.a, verhaal.b, verhaal.c, verhaal.oplossing, ...getallenIn(e.zinnen.map(schoon).join(" "))].filter((x) => x != null));
    if (verhaal.a != null && verhaal.b != null) {
      toegestaan.add(verhaal.a + verhaal.b);
      toegestaan.add(Math.abs(verhaal.a - verhaal.b));
    }
    for (const regel of e.z) {
      const s = schoon(regel);
      if (/^\d+$/.test(s.trim())) continue; /* Bliepo telt: "Eén." "Twee." */
      for (const n of accoladeGetallen(regel)) {
        /* een gekozen getal mag Bliepo herhalen als vraag ("{7}? Niet helemaal.") */
        if (!toegestaan.has(n) && !(/\?/.test(s) && run.gekozenGetallen.has(n))) rap.fout(`zin-getal:${s}:${[...toegestaan].sort().join(",")}`, `Bliepo noemt {${n}} in "${s}", maar dat getal hoort niet bij het verhaal (${e.zinnen.map(schoon).join(" / ")})`);
      }
    }
  }
  for (const regel of e.z) {
    const s = schoon(regel);
    /* "{7} − {2} = {5}" en "5 + 3 = 8" */
    for (const m of regel.matchAll(/\{?(\d+)\}? ([+−-]) \{?(\d+)\}? = \{?(\d+)\}?/g)) {
      const p = Number(m[1]);
      const q = Number(m[3]);
      const r = Number(m[4]);
      const w = m[2] === "+" ? p + q : p - q;
      if (w !== r) rap.fout(`zin-som:${s}`, `Een som in een zin van Bliepo klopt niet: "${s}" (${p} ${m[2]} ${q} is ${w})`);
    }
    /* "Het is 5:40." moet kloppen met de klok in beeld */
    const mt = s.match(/^(?:Het is(?: nu)?|De klok zegt nu) (\d{1,2}:\d\d)\b/);
    const vraagCall = e.z.some((r) => /\?/.test(r)) && !e.z.some((r) => /minuten later is het/.test(r));
    if (mt && vraagCall && typeof e.stand === "number" && !/Sam zegt/.test(s)) {
      const tekst = labelNaarMin(mt[1]);
      if (tekst != null && tekst !== mod(e.stand, 720)) rap.fout(`klok-tekst:${s}:${e.stand}`, `Bliepo zegt "${s}" maar de klok staat op ${digitaalLabel(e.stand)}`);
    }
    const mu = s.match(/^Het is (\d+) uur\.?$/);
    if (mu && typeof e.stand === "number" && mod(e.stand, 60) === 0 && uurVan(e.stand) !== Number(mu[1]) && !/over een uur/.test(s)) {
      /* tekst "Het is 9 uur." in een vooruitkijk-vraag: de klok staat dan op dat uur */
      rap.twijfel(`klok-uur:${s}:${e.stand}`, `Bliepo zegt "${s}" maar de klok staat op ${digitaalLabel(e.stand)} (kan een andere klok zijn)`);
    }
  }
}

/** Een klok zetten: is het doel in de code gelijk aan wat de tekst vraagt, en kloppen de getallen in de hulp? */
function zetVerwacht(e) {
  const t = schoon(e.regelsVoor.join(" "));
  const start = e.startStand;
  const delen = [];
  const re = [
    [/Laat (?:nu )?(\d+) uur zien/g, (m) => ({ min: (Number(m[1]) % 12) * 60, uur: Number(m[1]) })],
    [/Laat (?:nu )?half (\d+) zien/g, (m) => ({ min: mod((Number(m[1]) % 12) * 60 - 30, 720) })],
    [/Laat (?:nu )?kwart over (\d+) zien/g, (m) => ({ min: (Number(m[1]) % 12) * 60 + 15 })],
    [/(?:Ga naar de|Urenwijzer naar de) (\d+)\b/g, (m) => ({ min: (Number(m[1]) % 12) * 60, uur: Number(m[1]) })],
  ];
  for (const [r, f] of re) for (const m of t.matchAll(r)) delen.push({ pos: m.index, ...f(m) });
  const basis = [...t.matchAll(/(?:Het is(?: nu)?|De klok zegt nu) (\d{1,2}:\d\d)/g)].pop();
  const bm = basis ? labelNaarMin(basis[1]) : null;
  for (const m of t.matchAll(/Laat (\d+) minuten later zien/g)) if (bm != null) delen.push({ pos: m.index, min: mod(bm + Number(m[1]), 720) });
  for (const m of t.matchAll(/Zet de minutenwijzer (\d+) minuten verder/g)) if (bm != null) delen.push({ pos: m.index, min: mod(bm + Number(m[1]), 720) });
  if (typeof start === "number") {
    for (const m of t.matchAll(/(?:Zet de minutenwijzer op de|Minutenwijzer naar de) (\d+)\b/g)) delen.push({ pos: m.index, min: mod(start - mod(start, 60) + (Number(m[1]) % 12) * 5, 720) });
    for (const m of t.matchAll(/Draai hem één keer helemaal rond|Draai de minutenwijzer een half rondje|Kleur de helft|Kleur een kwart|Tik op het volgende getal|En nog 5\.|Tik op het getal (?:dat )?(?:twee|2) (?:getallen )?verder(?: staat)?|En nog 10\./g)) {
      const w = m[0];
      const plus = /helemaal rond/.test(w) ? 60 : /half rondje|helft/.test(w) ? 30 : /kwart/.test(w) ? 15 : /(twee|2)[^.]*verder|En nog 10/.test(w) ? 10 : 5;
      delen.push({ pos: m.index, min: mod(start + plus, 720) });
    }
  }
  if (!delen.length) return null;
  delen.sort((a, b) => a.pos - b.pos);
  return delen[delen.length - 1];
}

function controleerZet(rap, e, plan, log, i) {
  const taak = e.taak;
  const doelMin = taak.soort === "uur" ? mod(taak.doel * 60, 720) : mod(taak.doel, 720);
  const sleutel = `${rap.id}:${e.regelsVoor.slice(-2).join("|")}:${taak.soort}:${taak.doel}`;
  const telt = plan.basis && e.poging === 1;
  const v = zetVerwacht(e);
  if (!v) {
    if (telt) {
      rap.vragen.add(sleutel);
      rap.nietNagerekend.set(sleutel, `zet ${taak.soort} ${taak.doel}: ${regelsTekst(e.regelsVoor.slice(-2))}`);
    }
  } else {
    if (telt) {
      rap.vragen.add(sleutel);
      rap.nagerekend.add(sleutel);
    }
    if (v.min !== doelMin) rap.fout(`zet-doel:${sleutel}`, `De klok moet gezet worden op ${digitaalLabel(doelMin)} (code), maar de tekst vraagt ${digitaalLabel(v.min)}: ${regelsTekst(e.regelsVoor.slice(-2))}`);
  }
  /* de tijd die groot boven de klok staat ("half 9") */
  if (e.propsDoel && typeof e.propsDoel === "string" && !taak.alleen) {
    const lab = labelNaarMin(e.propsDoel);
    if (lab != null && lab !== doelMin) rap.fout(`zet-bordtekst:${sleutel}:${e.propsDoel}`, `Boven de klok staat "${e.propsDoel}" maar het doel is ${digitaalLabel(doelMin)}`);
  }
  /* de hulp na een foute stand of het hulpknopje */
  if (e.gekozenDoorSpeler !== "goed") {
    const venster = [];
    for (let j = i + 1; j < log.length; j++) {
      const f = log[j];
      if (f.t === "zet" || f.t === "kies" || f.t === "nieuw" || f.t === "kaart" || f.t === "stop") break;
      if (f.t === "zeg") venster.push(...f.z);
    }
    const uurDoel = uurVan(doelMin);
    const minGetal = mod(doelMin, 60) / 5 || 12;
    const toegestaan = new Set([uurDoel, volgend(uurDoel), ((uurDoel + 10) % 12) + 1, minGetal, 3, 6, 12, uurVan(e.tijd)]);
    for (const regel of venster) {
      const sr = schoon(regel);
      for (const m of sr.matchAll(/(?:Tik(?: dus)? op de|We willen de|Je zoekt de|Dat is de) (\d+)\b/g)) {
        if (!toegestaan.has(Number(m[1]))) rap.fout(`zet-hulp:${sr}:${taak.doel}`, `Hulp noemt de ${m[1]}, maar het doel is ${digitaalLabel(doelMin)} (uur ${uurDoel}, minutenwijzer op de ${minGetal}): "${sr}"`);
      }
      const nu = sr.match(/Nu staat de klok op (\d{1,2}:\d\d)/);
      if (nu && labelNaarMin(nu[1]) !== mod(e.tijd, 720)) rap.fout(`zet-nu:${sr}`, `Hulp zegt "${sr}" maar de klok stond op ${digitaalLabel(e.tijd)}`);
      const zoek = sr.match(/Je zoekt (\d{1,2}:\d\d)/);
      if (zoek && labelNaarMin(zoek[1]) !== doelMin) rap.fout(`zet-zoekt:${sr}`, `Hulp zegt "${sr}" maar het doel is ${digitaalLabel(doelMin)}`);
      const dat = sr.match(/^Dat is de (\d+)\./);
      if (dat && taak.soort === "uur" && Number(dat[1]) !== uurVan(e.tijd)) rap.fout(`zet-datis:${sr}`, `Hulp zegt "${sr}" maar de urenwijzer staat op de ${uurVan(e.tijd)}`);
    }
  }
}

/* ---------- hulp bij 1× en 2× fout ---------- */

const BEVESTIGT = /^(Ja|Precies|Klopt|Goed zo|Goed gedaan|Dat klopt|Natuurlijk|Mooi|Knap|Goed)\b/;

function controleerHulp(rap, run, plan) {
  const { log } = run;
  /* Zoek de keuzes waarbij de speler fout koos. */
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    if (!((e.t === "kies" && e.keuze != null && e.verwacht != null && e.keuze !== e.verwacht) || (e.t === "kies" && e.keuze === null && plan.scenario?.soort === "weet" && e.vraagNr === plan.scenario.q))) continue;
    rap.hulpControles++;
    const w = e.keuze;
    const goed = e.verwacht;
    /* Het venster: tot de volgende vraag (of herhaling), het volgende verhaal of het eind. */
    const venster = [];
    let eind = log.length;
    for (let j = i + 1; j < log.length; j++) {
      const f = log[j];
      if (f.t === "kies" || f.t === "stop" || f.t === "kaart" || f.t === "nieuw" || f.t === "zet") {
        eind = j;
        break;
      }
      if (f.t === "zeg") venster.push(...f.z);
    }
    const ctx = `(vraag "${regelsTekst(e.regelsVoor.slice(-2))}", gekozen "${w}", goed "${goed}")`;
    if (w != null) {
      const wTekst = String(w);
      for (const regel of venster) {
        const s = schoon(regel);
        const zinnetjes = s.split(/(?<=[.?!])\s+/);
        const hit = new RegExp(`(^|[^\\d:])${wTekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\d:]|$)`);
        const i0 = zinnetjes.findIndex((z) => hit.test(z));
        if (i0 < 0 || wTekst === goed) continue;
        const verhaalGetal = /^\d+$/.test(wTekst) && (e.props.zinnen || []).some((z) => getallenIn(schoon(z)).includes(Number(wTekst)));
        if (verhaalGetal) continue;
        for (let j = i0; j < zinnetjes.length; j++) {
          const z = zinnetjes[j];
          if (!BEVESTIGT.test(z) || /\?\s*$/.test(z) || /\b(niet|geen|maar|toch)\b/i.test(z)) continue;
          if (j > i0 || hit.test(z)) {
            rap.fout(`hulp-bevestigt:${s}:${wTekst}`, `De hulp keurt een fout antwoord goed: "${s}" ${ctx}`);
            break;
          }
        }
      }
    }
    void eind;
  }

  /* 2× fout of "weet ik niet": het goede antwoord moet genoemd worden, of de les stopt. */
  const sc = plan.scenario;
  if (!sc) return;
  const vraagEvents = log.filter((e) => (e.t === "kies" || e.t === "zet") && e.vraagNr === sc.q);
  const eerste = vraagEvents[0];
  if (!eerste) return;
  const idx = log.indexOf(eerste);
  const goedWaarde = eerste.t === "kies" ? eerste.verwacht : null;
  const isGoed = (e) => (e.t === "kies" ? e.gekozenDoorSpeler === e.verwacht : e.gekozenDoorSpeler === "goed");
  const laatste = vraagEvents[vraagEvents.length - 1];
  const laatsteFout = [...vraagEvents].reverse().find((e) => !isGoed(e)) ?? laatste;
  const laatsteFoutIdx = log.indexOf(laatsteFout);
  const vraagTekst = eerste.t === "kies" ? regelsTekst(eerste.regelsVoor.slice(-2)) : `zet ${eerste.taak.soort} ${eerste.taak.doel}`;
  const wat = sc.soort === "weet" ? (sc.aantal >= 2 ? `"weet ik niet" en daarna fout` : `"weet ik niet"`) : `${sc.aantal}× fout`;

  /* de zinnen vanaf de laatste foute poging tot het einde van de vraag */
  const zinnen = [];
  let gestopt = false;
  let toetsStop = false;
  for (let j = laatsteFoutIdx + 1; j < log.length; j++) {
    const f = log[j];
    if (f.t === "stop") {
      gestopt = true;
      break;
    }
    if (f.t === "nieuw" || f.t === "kaart") break;
    if (f.t === "zeg") {
      zinnen.push(...f.z);
      if (f.z.some((z) => /toets hier stoppen|We bekijken dit samen in een les/.test(z))) toetsStop = true; /* sinds 28 okt: ook de zin van Synthesis ("let's explore this … in a lesson") */
    }
    if ((f.t === "kies" || f.t === "zet") && f.vraagNr !== sc.q && f.vraagNr != null) break;
  }
  const uitkomst = gestopt ? "pauze/stop" : toetsStop ? "toets stopt" : "gaat door";
  rap.pauzeUitkomsten.set(`${vraagTekst}|${wat}`, uitkomst);

  const heeftPauzeZin = zinnen.some((z) => /pauze/.test(z));
  if (heeftPauzeZin && !gestopt) rap.fout(`pauze-zonder-stop:${vraagTekst}`, `Bliepo zegt "pauze" maar de les stopt niet (l.stopLes): ${vraagTekst}`);
  if (gestopt && !heeftPauzeZin) rap.fout(`stop-zonder-pauze:${vraagTekst}`, `De les stopt zonder dat Bliepo "pauze" zegt: ${vraagTekst}`);
  if (toetsStop) {
    /* in een toets: daarna begint de eerste les */
    const eersteLes = log.slice(laatsteFoutIdx).some((f) => f.t === "zeg" && f.z.some((z) => /We gaan verhaaltjessommen maken|is een mooie volgende stap/.test(z))); /* of Bliepo stelt de volgende les voor (Synthesis, na een goede eerste vraag) */
    if (!eersteLes) rap.fout(`toets-stop-zonder-les:${vraagTekst}`, `Een toets stopt, maar de eerste les begint niet: ${vraagTekst}`);
  }
  const voorStop = !log.slice(0, idx).some((f) => f.t === "zeg" && f.z.some((z) => /toets hier stoppen|beginnen we met de eerste les|We beginnen met de eerste les|We bekijken dit samen in een les/.test(z)));
  const onmogelijk = vraagEvents.some((e) => e.onmogelijk);
  if (onmogelijk) rap.twijfel(`een-knop:${vraagTekst}`, `Bij "${vraagTekst}" zijn er maar twee knoppen: na 1× fout is er geen foute knop meer over, 2× fout kan daar niet`);
  const tweeKeerFout = vraagEvents.filter((e) => !isGoed(e)).length >= 2;
  if (rap.id.endsWith("toets") && voorStop && !onmogelijk && tweeKeerFout && eerste.t === "kies" && eerste.orakel && eerste.orakel.soort !== "tak") {
    if (!(toetsStop || gestopt)) rap.fout(`toets-geen-stop:${vraagTekst}:${wat}`, `In een toets moet 2× fout de toets laten stoppen en de eerste les laten beginnen: ${vraagTekst}`);
  }
  /* 1× fout in een toets: "kijk nog eens" en dezelfde vraag, niet stoppen. */
  if (rap.id.endsWith("toets") && voorStop && sc.soort === "fout" && sc.aantal === 1 && (toetsStop || gestopt) && eerste.t === "kies" && !onmogelijk) {
    rap.fout(`toets-1x-stopt:${vraagTekst}`, `In een toets stopt al 1× fout de toets (moet bij de 2e fout): ${vraagTekst}`);
  }

  /* Het goede antwoord noemen als de vraag niet goed afliep (alleen als de les niet stopt). */
  const goedTekst = goedWaarde != null ? String(goedWaarde) : null;
  const isGetal = goedTekst != null && /^\d+$/.test(goedTekst);
  const isTijd = goedTekst != null && isTijdLabel(goedTekst);
  /* een proefvraag aan het begin heeft met opzet geen uitleg: "Geen probleem. We leren het samen." */
  const proef = zinnen.some((z) => /We leren het samen\./.test(z)) && /^Geen probleem/.test(zinnen[0] ?? "");
  if (!gestopt && !toetsStop && !proef && !isGoed(laatste) && (isGetal || isTijd)) {
    const venster = [];
    if (verhaalGeldt(rap)) {
      for (let j = laatsteFoutIdx + 1; j < log.length; j++) {
        const f = log[j];
        if (f.t === "nieuw" || f.t === "kaart" || f.t === "stop") break;
        if (f.t === "zeg") venster.push(...f.z);
      }
    } else venster.push(...zinnen);
    const noemt = (z) => {
      const t = schoon(z);
      if (isGetal) return accoladeGetallen(z).includes(Number(goedTekst)) || new RegExp(`(^|[^\\d:])${goedTekst}([^\\d:]|$)`).test(t);
      return t.toLowerCase().includes(goedTekst.toLowerCase());
    };
    /* Klokles, samen tellen (Synthesis: "Let's count it on the clock."): het kind tikt eerst zelf, Bliepo noemt de tijd pas daarna ("Dan is het dus 2:45."). */
    const samenTellen =
      venster.some((z) => /We tellen het samen op de klok\./.test(z)) &&
      log.slice(laatsteFoutIdx + 1, laatsteFoutIdx + 40).some((f) => f.t === "zeg" && f.z.some((z) => schoon(z).includes(`Dan is het dus ${goedTekst}.`)));
    if (!venster.some(noemt) && !samenTellen) {
      rap.fout(`geen-antwoord:${vraagTekst}:${goedTekst}:${wat}`, `Na ${wat} noemt Bliepo het goede antwoord "${goedTekst}" niet (${vraagTekst}); hij zegt: ${venster.map(schoon).join(" | ").slice(0, 200)}`);
    }
  }
}
function verhaalGeldt(rap) {
  return rap.id.startsWith("verhaal-");
}

/* ------------------------------------------------------------------ */
/* Alles draaien                                                       */
/* ------------------------------------------------------------------ */

async function controleerLes(id) {
  const les = lesVan(id);
  const rap = new Rapport(id);
  if (!les) {
    rap.fout("bestaat-niet", `Les ${id} bestaat niet`);
    return rap;
  }
  if (les.indeling !== "synthesis") rap.fout("indeling", `Les ${id} heeft geen indeling "synthesis"`);
  for (const tak of TAKKEN) {
    /* eerst alles goed: dat geeft het aantal vragen */
    const basis = await speelLes(les, tak, null);
    rap.runs++;
    controleer(rap, basis, { naam: `${tak.naam} · alles goed`, scenario: null, basis: true });
    if (basis.uitkomst === "stop") rap.fout(`basis-stop:${tak.naam}`, `De les stopt terwijl alles goed gaat (${tak.naam})`);
    const N = basis.vragen;
    for (let q = 0; q < N; q++) {
      const scenarios = [
        { q, soort: "weet", aantal: 1, d: 0 },
        { q, soort: "weet", aantal: 2, d: 0 },
        { q, soort: "fout", aantal: 2, d: 0 },
        { q, soort: "fout", aantal: 2, d: 1 },
      ];
      /* 1× fout met elke foute keuze apart */
      const optieAantal = Math.max(2, ...basis.log.filter((e) => e.t === "kies" && e.vraagNr === q).map((e) => e.opties.length));
      for (let d = 0; d < Math.min(optieAantal - 1, 6); d++) scenarios.push({ q, soort: "fout", aantal: 1, d });
      for (const sc of scenarios) {
        const run = await speelLes(les, tak, sc);
        rap.runs++;
        controleer(rap, run, { naam: `${tak.naam} · vraag ${q + 1}: ${sc.soort === "weet" ? "weet ik niet" : sc.aantal + "× fout"} (d=${sc.d})`, scenario: sc });
      }
    }
  }
  return rap;
}

function toonRapport(rap, uitgebreid) {
  const nagerekend = rap.nagerekend.size;
  const totaal = rap.vragen.size;
  console.log(`\n${rap.id}`);
  console.log(`  vragen gecontroleerd: ${totaal} (daarvan zelf nagerekend: ${nagerekend}; niet na te rekenen: ${rap.nietNagerekend.size}); runs: ${rap.runs}; hulp-controles: ${rap.hulpControles}`);
  if (uitgebreid) for (const [, t] of rap.nietNagerekend) console.log(`    - niet nagerekend: ${t}`);
  for (const [, t] of rap.fouten) console.log(`  FOUT: ${t}`);
  for (const [, t] of rap.twijfels) console.log(`  twijfel: ${t}`);
  if (!rap.fouten.size && !rap.twijfels.size) console.log("  geen afwijkingen");
  if (uitgebreid) {
    const uit = new Map();
    for (const v of rap.pauzeUitkomsten.values()) uit.set(v, (uit.get(v) ?? 0) + 1);
    console.log(`  uitkomsten bij 2× fout / weet ik niet: ${[...uit].map(([k, v]) => `${k}: ${v}`).join(", ")}`);
  }
}

async function main() {
  const uitgebreid = !!process.env.UITGEBREID;
  const gevraagd = (process.env.LESSEN ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const ids = [...VERHAAL_IDS, ...KLOK_IDS].filter((id) => !gevraagd.length || gevraagd.includes(id));
  let fouten = 0;
  let twijfels = 0;
  let vragen = 0;
  console.log("Rekencontrole: antwoorden, keuzes en hulp van de nagebouwde Synthesis-lessen");
  for (const id of ids) {
    const rap = await controleerLes(id);
    toonRapport(rap, uitgebreid);
    fouten += rap.fouten.size;
    twijfels += rap.twijfels.size;
    vragen += rap.vragen.size;
  }
  if (process.env.ZINNEN_UIT) fs.writeFileSync(process.env.ZINNEN_UIT, JSON.stringify(Object.fromEntries([...ZINNEN].map(([k, v]) => [k, [...v]])), null, 1));
  console.log(`\nKlaar: ${vragen} vragen in ${ids.length} lessen, ${fouten} fouten, ${twijfels} twijfelgevallen.`);
  if (fouten) {
    console.error("De rekencontrole faalt: zie de FOUT-regels hierboven.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
