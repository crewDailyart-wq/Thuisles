/**
 * Maakt FOUTTABEL-squla-klok-gouden.md uit de code (squla-klok-gouden-zinnen.ts), zodat de tabel altijd klopt met de les.
 *   npx tsx scripts/fouttabel-klok-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * 18 november 2026 (Sara: Bliepo klinkt als een warme juf; zelfde aanpak als de proefles Tellen): het script loopt nu
 * ELKE variant na, voor elke vraag en elk antwoord dat niet goed is:
 *   1. verklappen (15.17): geen eerste zin, hint of "vraag opnieuw" noemt het antwoord; "vlak naast" en "bijna" alleen
 *      als er dan nog 2 keuzes vlak naast liggen; "links" en "rechts" alleen als er aan die kant nog 2 keuzes staan;
 *   2. geen opdracht in de zinnen bij de 2e keer (keuzevragen), nooit het woord "fout", nooit het woord "vinkje";
 *   3. een getal staat nooit 2 keer in 1 zin en klinkt nooit in 2 zinnen vlak achter elkaar;
 *   4. altijd een vraag of opdracht (15.37, F16): elke vraag, elke "vraag opnieuw", elke hint bij zetten, het hulphandje
 *      en de kleine stap;
 *   5. elk stuk past in het tekstvak (de lengte van de langste oude stukken; een harde eis, dus in de lijst zelf);
 *   6. bij elke eerste zin passen minstens 2 hints, zodat Bliepo kan blijven wisselen;
 *   7. de kiezer wordt 20.000 lessen nagespeeld met dezelfde functies als de les: nooit 2 keer achter elkaar dezelfde
 *      zin, ook niet over vragen heen, en bij 1 vraag nooit 2 keer dezelfde zin.
 */
import { writeFileSync } from "node:fs";
import { deeltStuk, maakVorm } from "../src/components/les/lessen/nooit-dubbel";
import {
  EXTRAVRAGEN,
  KLOKKEN,
  KLOKREACTIE,
  KLOKVRAGEN,
  MAX,
  ONDUIDELIJK,
  ONDUIDELIJK_ANDERE,
  ONDUIDELIJK_NOG_1_KEER,
  SCHERM_TEKST,
  UITLEG,
  UITLEGVRAGEN,
  VAR,
  VOORDOEN,
  WISSEL,
  ZIN,
  foutReactie,
  getalDubbel,
  getallenIn,
  kaal,
  kiesStuk,
  kleineStap,
  losseZinnen,
  naastElkaar,
  nieuweKiezer,
  spiegel,
  vraagOpnieuw,
  zetFout,
  zetSamen,
  type Fout,
  type Vraag,
} from "../src/components/les/lessen/squla-klok-gouden-zinnen";

const vorm = maakVorm(WISSEL);
const ALLE_VRAGEN = [...UITLEGVRAGEN, ...KLOKVRAGEN, ...EXTRAVRAGEN];
const ZET_DOELEN = [2, 3, 6, 7];
const problemen: string[] = [];
let nagelopen = 0;

/* ------------------------------------------------------------------ hulpjes ------------------------------------ */

/** Een vraag of opdracht (zoals scripts/vraag-aanwezig-controle.mjs): een vraagteken, of een zin die zegt wat het kind doet. */
const DOE = /\?|(^|[.!:;,] |\ben |\bof |\bdan )(Tik|Kies|Sleep|Zet|Draai|Schuif)\b/i;
/** Een opdracht aan het begin van een zin (mag niet bij de 2e keer van een keuzevraag: daarna doet Bliepo het samen voor). */
const OPDRACHT = /(^|[.!?:] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Zoek|Zet|Volg|Ga|Schuif|Tik|Draai)\b/;
const VERKLAPT = /maar 1 getal verder|1 getal verder\. Volg|schuift de kleine wijzer 1 getal verder/i;
const BIJNA = /vlak naast|vlak ernaast|net naast|net ernaast|bijna|dichtbij|net niet|scheelt/i;

/** Elke zin apart: woorden die niet mogen, en een getal 2 keer in 1 zin of in 2 zinnen vlak achter elkaar. */
function keurTekst(waar: string, stukken: readonly string[]) {
  const zinnen = stukken.flatMap(losseZinnen);
  nagelopen += zinnen.length;
  for (const [i, z] of zinnen.entries()) {
    if (/\bfout\b/i.test(z)) problemen.push(`${waar}: het woord "fout" in "${z}"`);
    if (/vinkje/i.test(z)) problemen.push(`${waar}: het woord "vinkje" in "${z}" (zo'n zin wordt niet uitgesproken)`);
    const g = getallenIn(z);
    if (new Set(g).size !== g.length) problemen.push(`${waar}: een getal staat 2 keer in 1 zin: "${z}"`);
    if (i > 0 && getallenIn(zinnen[i - 1]).some((n) => g.includes(n))) problemen.push(`${waar}: een getal klinkt 2 keer vlak achter elkaar: "${zinnen[i - 1]}" + "${z}"`);
  }
}
const lang = (waar: string, z: string, max: number) => {
  if (kaal(z).length > max) problemen.push(`${waar}: te lang voor het tekstvak (${kaal(z).length} > ${max}): "${kaal(z)}"`);
};

/** Noemt een zin het goede antwoord? Getal: het getal zelf; woorden: het woord waar het om gaat. */
function noemtAntwoord(z: string, v: Vraag): boolean {
  const k = kaal(z).toLowerCase();
  const getal = /^\d+/.exec(v.goed)?.[0];
  if (getal) return getallenIn(k).includes(getal);
  const kern = v.goed.toLowerCase().replace(/^(een|de|het) /, "");
  return new RegExp(`\\b${kern}\\b`).test(k);
}
const getalVan = (antwoord: string) => (/^\d+/.test(antwoord) ? Number(/^\d+/.exec(antwoord)![0]) : null);

/* ------------------------------------------------------------------ 1. de vragen ------------------------------- */

for (const v of ALLE_VRAGEN) {
  const vraag = v.vraag.join(" ");
  keurTekst(`${v.id} (vraag)`, v.vraag);
  if (!DOE.test(kaal(vraag))) problemen.push(`${v.id}: de vraag is geen vraag of opdracht: "${kaal(vraag)}"`);
  if (v.naGoed) keurTekst(`${v.id} (na goed)`, v.naGoed);
  if (v.samen) {
    keurTekst(`${v.id} (samen voordoen)`, v.samen);
    for (const stuk of v.samen.length >= 3 ? [v.samen.slice(0, -1).join(" "), v.samen.at(-1)!] : [v.samen.join(" ")]) if (v.id !== "stap18-strik") lang(`${v.id} (samen voordoen)`, stuk, MAX.klokVoordoen);
  }
  /* De vraag opnieuw: minstens 2 varianten, minstens 1 die niet de vraag zelf is, altijd een vraag, nooit het antwoord. */
  if (v.opnieuw.length < 2) problemen.push(`${v.id}: minder dan 2 varianten van de vraag opnieuw`);
  const andere = v.opnieuw.filter((z) => vorm(z) !== vorm(vraag));
  if (!andere.length) problemen.push(`${v.id}: de vraag opnieuw is altijd precies de vraag zelf`);
  for (const z of v.opnieuw) {
    keurTekst(`${v.id} (vraag opnieuw)`, [z]);
    lang(`${v.id} (vraag opnieuw)`, z, MAX.zin);
    if (!/\?/.test(z)) problemen.push(`${v.id}: de vraag opnieuw is geen vraag: "${z}"`);
    /* (Bij de bonus staat "over 1 uur" in de vraag zelf; dat is de vraag, niet het antwoord.) */
    if (noemtAntwoord(z, v) && !noemtAntwoord(vraag, v)) problemen.push(`${v.id}: de vraag opnieuw noemt het antwoord (${v.goed}): "${kaal(z)}"`);
  }
  const keuzes = v.opties.map(getalVan);
  const getallen = keuzes.every((n) => n !== null) ? (keuzes as number[]) : null;
  for (const [antw, f] of Object.entries(v.fouten)) {
    const waar = `${v.id}, keuze ${antw}`;
    if (!UITLEG[f.soort]) problemen.push(`${waar}: geen uitleg voor de soort ${f.soort}`);
    if (f.code !== "onduidelijk" && f.eerste.length < 2) problemen.push(`${waar}: minder dan 2 varianten van de eerste zin`);
    if (f.code === "onduidelijk" && f.eerste.length) problemen.push(`${waar}: onduidelijk, maar toch een eigen eerste zin (geen reden verzinnen)`);
    if (f.hint.length < 2) problemen.push(`${waar}: minder dan 2 varianten van de hint`);
    for (const e of f.eerste) {
      keurTekst(`${waar} (eerste zin)`, [e]);
      lang(`${waar} (eerste zin)`, e, MAX.eerste);
      if (OPDRACHT.test(kaal(e))) problemen.push(`${waar}: de eerste zin is een opdracht (kan ook bij de 2e keer komen): "${kaal(e)}"`);
      if (/\bweer\b/i.test(e)) problemen.push(`${waar}: "weer" in een eerste zin: "${kaal(e)}"`);
    }
    for (const h of f.hint) {
      keurTekst(`${waar} (hint)`, [h]);
      lang(`${waar} (hint)`, h, MAX.zin);
      if (VERKLAPT.test(h)) problemen.push(`${waar}: de hint zegt waar het antwoord staat: "${h}"`);
      if (/\bweer\b/i.test(h)) problemen.push(`${waar}: "weer" in een hint: "${kaal(h)}"`);
    }
    for (const z of [...f.eerste, ...f.hint]) {
      /* 15.17: het antwoord wordt niet genoemd. */
      if (noemtAntwoord(z, v)) problemen.push(`${waar}: de zin noemt het antwoord (${v.goed}): "${kaal(z)}"`);
      /* "Vlak naast" en "bijna": alleen als er dan nog minstens 2 keuzes vlak naast het gekozen getal liggen. */
      if (BIJNA.test(z)) {
        const x = getalVan(antw);
        const over = getallen && x !== null ? getallen.filter((n) => n !== x && naastElkaar(n, x)).length : 0;
        if (over < 2) problemen.push(`${waar}: "${kaal(z)}" verklapt het antwoord: er ligt maar ${over} keuze vlak naast ${antw}`);
      }
      /* "Links" en "rechts": alleen als er aan de genoemde kant nog minstens 2 keuzes staan, en alleen als het klopt. */
      const kant = /wijst naar (links|rechts)|staat (links|rechts)\b(?!, en)/.exec(kaal(z));
      if (kant && f.code === "spiegelbeeld" && getallen) {
        const goed = getalVan(v.goed)!;
        const echt = goed < 6 ? "rechts" : "links";
        const genoemd = /(wijst naar|punt van de wijzer staat) (links|rechts)/.exec(kaal(z))?.[2];
        if (genoemd && genoemd !== echt) problemen.push(`${waar}: de wijzer wijst naar ${echt}, niet naar ${genoemd}: "${kaal(z)}"`);
        const aanKant = getallen.filter((n) => n !== 12 && n !== 6 && (n < 6 ? "rechts" : "links") === echt).length;
        if (aanKant < 2) problemen.push(`${waar}: "${kaal(z)}" verklapt het antwoord: aan die kant staat maar ${aanKant} keuze`);
      }
    }
    /* Bij elke eerste zin passen minstens 2 hints (geen getal 2 keer achter elkaar), zodat Bliepo kan wisselen. */
    for (const e of f.eerste.length ? f.eerste : ONDUIDELIJK.zinnen) {
      const past = f.hint.filter((h) => !getalDubbel(e, h));
      if (past.length < 2) problemen.push(`${waar}: bij "${kaal(e)}" past maar ${past.length} hint`);
    }
    /* Na elke hint is er een vraag opnieuw die het getal van net niet herhaalt. */
    for (const h of f.hint) if (!andere.some((z) => !getalDubbel(h, z))) problemen.push(`${waar}: na de hint "${kaal(h)}" herhaalt elke vraag opnieuw hetzelfde getal`);
  }
}

/* ------------------------------------------------------------------ 2. zetten ---------------------------------- */

const zetGevallen: { doel: number; gekozen: number; f: Fout }[] = [];
for (const doel of ZET_DOELEN) for (let g = 1; g <= 12; g++) if (g !== doel) zetGevallen.push({ doel, gekozen: g, f: zetFout(g, doel) });
const onduidelijkBijOpdracht = (poging: 1 | 2) => ONDUIDELIJK.zinnen.filter((_, i) => i !== ONDUIDELIJK_ANDERE && !(poging === 2 && i === ONDUIDELIJK_NOG_1_KEER));
for (const { doel, gekozen, f } of zetGevallen) {
  const waar = `zet de kleine wijzer op de ${doel}, gezet op de ${gekozen}`;
  const uit = UITLEG[f.soort];
  if (!uit) {
    problemen.push(`${waar}: geen uitleg voor de soort ${f.soort}`);
    continue;
  }
  if (f.code !== "onduidelijk" && f.eerste.length < 2) problemen.push(`${waar}: minder dan 2 varianten van de eerste zin`);
  if (f.hint.length < 2) problemen.push(`${waar}: minder dan 2 varianten van de hint`);
  /* Klopt links en rechts? */
  for (const e of f.eerste) {
    const m = /staat (links|rechts)\.$/.exec(kaal(e));
    if (f.code === "spiegelbeeld" && m && m[1] !== (doel < 6 ? "rechts" : "links")) problemen.push(`${waar}: de ${doel} staat niet ${m[1]}: "${kaal(e)}"`);
    if (/\bweer\b/i.test(e)) problemen.push(`${waar}: "weer" in een eerste zin: "${kaal(e)}"`);
  }
  /* 1e keer: eerste zin + hint is 1 stuk; de hint is de opdracht voor de volgende poging (15.37). */
  for (const h of f.hint) if (!DOE.test(kaal(h))) problemen.push(`${waar}: de hint zegt niet wat het kind doet: "${kaal(h)}"`);
  for (const e of f.eerste.length ? f.eerste : onduidelijkBijOpdracht(1)) {
    const past = f.hint.filter((h) => !getalDubbel(e, h));
    if (past.length < 2) problemen.push(`${waar}: bij "${kaal(e)}" past maar ${past.length} hint`);
    for (const h of past) {
      keurTekst(`${waar} (1e keer)`, [e, h]);
      lang(`${waar} (1e keer)`, `${e} ${h}`, MAX.zetFout1);
    }
  }
  /* 2e keer: (eerste zin + uitleg) of (weer + anders), en dan samen doen; alles is 1 stuk. */
  const paren: [string, string][] = [];
  for (const e of f.eerste.length ? f.eerste : onduidelijkBijOpdracht(2)) for (const u of uit.uitleg) if (!getalDubbel(e, u)) paren.push([e, u]);
  for (const w of uit.weer.length ? uit.weer : [""]) for (const a of uit.anders) if (!getalDubbel(w, a)) paren.push([w, a]);
  const langsteTik = [...VAR.zetTik].sort((a, b) => b.length - a.length)[0];
  for (const [a, b] of paren) {
    const reactie = [a, b].filter(Boolean);
    const hier = VAR.zetHier(doel);
    const kandidaten = hier.metGetal.some((z) => getalDubbel(b, z)) ? hier.zonderGetal : [...hier.metGetal, ...hier.zonderGetal];
    for (const h of kandidaten) {
      keurTekst(`${waar} (2e keer)`, [...reactie, h, langsteTik]);
      lang(`${waar} (2e keer)`, [...reactie, h, langsteTik].join(" "), MAX.zetFout2);
    }
  }
}
for (const z of VAR.zetTik) if (!DOE.test(z)) problemen.push(`zetten, samen doen: "${z}" zegt niet wat het kind doet`);
for (const doel of ZET_DOELEN) {
  keurTekst(`zetten ${doel} (opdracht)`, [ZIN.zetOpdracht(doel)]);
  if (!DOE.test(kaal(ZIN.zetOpdracht(doel)))) problemen.push(`zetten ${doel}: de opdracht zegt niet wat het kind doet`);
  for (const z of VAR.zetHand(doel)) {
    keurTekst(`zetten ${doel} (hulphandje)`, [z]);
    if (!DOE.test(kaal(z))) problemen.push(`zetten ${doel}: het hulphandje zegt niet wat het kind doet: "${kaal(z)}"`);
    /* Samen met de langste aanmoediging uit het vaste rijtje (zo lang was het langste oude stuk: 79 tekens). */
    lang(`zetten ${doel} (hulphandje)`, `Ik sta klaar om na te kijken. ${z}`, 79);
  }
}

/* ------------------------------------------------------------------ 3. uitleg bij de 2e keer ------------------- */

const gebruikteSoorten = new Set([...ALLE_VRAGEN.flatMap((v) => Object.values(v.fouten).map((f) => f.soort)), ...zetGevallen.map((g) => g.f.soort)]);
for (const [k, u] of Object.entries(UITLEG)) {
  if (!gebruikteSoorten.has(k)) problemen.push(`uitleg ${k}: wordt door geen enkele vraag gebruikt`);
  if (u.uitleg.length < 2 || u.anders.length < 2) problemen.push(`uitleg ${k}: minder dan 2 varianten (uitleg ${u.uitleg.length}, anders ${u.anders.length})`);
  if (u.weer.length === 1) problemen.push(`uitleg ${k}: maar 1 variant van "weer"`);
  for (const [rol, lijst] of [["uitleg", u.uitleg], ["weer", u.weer], ["anders", u.anders]] as const) {
    if (new Set(lijst.map(vorm)).size !== lijst.length) problemen.push(`uitleg ${k} (${rol}): 2 keer dezelfde variant`);
    for (const z of lijst) {
      keurTekst(`uitleg ${k} (${rol})`, [z]);
      lang(`uitleg ${k} (${rol})`, z, MAX.zin);
      if (!k.startsWith("zet-") && OPDRACHT.test(kaal(z))) problemen.push(`${k}: opdracht in de zin bij de 2e fout: "${z}"`);
      if (rol !== "weer" && /\bweer\b/i.test(z) && !/weer opnieuw|begin weer/i.test(z)) problemen.push(`uitleg ${k} (${rol}): "weer" hoort alleen in het rijtje "weer": "${z}"`);
    }
  }
  /* "Weer" en de andere uitleg herhalen niet hetzelfde getal vlak achter elkaar. */
  for (const w of u.weer) if (!u.anders.some((a) => !getalDubbel(w, a))) problemen.push(`uitleg ${k}: na "${kaal(w)}" herhaalt elke andere uitleg hetzelfde getal`);
}

/* ------------------------------------------------------------------ 4. samen voordoen en de vaste zinnen ------- */

for (let uur = 1; uur <= 12; uur++) {
  const stukken = VOORDOEN.klok(uur);
  if (stukken.length < 2) problemen.push(`samen voordoen, klok ${uur} uur: minder dan 2 varianten`);
  for (const s of stukken) {
    keurTekst(`samen voordoen, klok ${uur} uur`, s);
    lang(`samen voordoen, klok ${uur} uur`, s.join(" "), MAX.klokVoordoen);
    if (!new RegExp(`\\b${uur} uur\\b`).test(kaal(s.join(" ")))) problemen.push(`samen voordoen, klok ${uur} uur: het antwoord staat er niet in: "${kaal(s.join(" "))}"`);
  }
  for (const z of VOORDOEN.getal(uur)) {
    keurTekst(`samen voordoen, getal ${uur}`, [z]);
    lang(`samen voordoen, getal ${uur}`, z, MAX.zin);
    if (getallenIn(z).join() !== String(uur)) problemen.push(`samen voordoen, getal ${uur}: het getal staat er niet precies 1 keer in: "${kaal(z)}"`);
  }
  keurTekst(`reactie bij de klok ${uur}`, KLOKREACTIE(uur).zinnen.flatMap((z) => [z, "x."]));
}
for (const z of VOORDOEN.tik) {
  if (!DOE.test(z)) problemen.push(`de kleine stap "${z}" zegt niet wat het kind doet`);
  if (getallenIn(z).length) problemen.push(`de kleine stap "${z}" noemt een getal (het antwoord klonk net al)`);
}
for (const z of VAR.start) {
  keurTekst("begin", [z]);
  lang("begin", z, MAX.start);
  if (!/\?$/.test(z)) problemen.push(`begin: eindigt niet met de vraag voor Ja of Nee: "${z}"`);
}
for (const [naam, lijst] of Object.entries({ proefBegin: VAR.proefBegin, proefGoed: VAR.proefGoed, samenBeginnen: VAR.samenBeginnen, oefenBegin: VAR.oefenBegin, oefenVerder: VAR.oefenVerder, terugLastig: VAR.terugLastig, slot: VAR.slot, proefLastig: VAR.proefLastig.map((s) => s.join(" ")), ...Object.fromEntries([1, 2, 3].flatMap((n) => [[`terug${n}`, VAR.terug(n)], [`extra${n}`, VAR.extra(n)]])) })) {
  if (lijst.length < 2) problemen.push(`${naam}: minder dan 2 varianten`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) problemen.push(`${naam}: 2 keer dezelfde variant`);
  for (const z of lijst) {
    keurTekst(naam, [z]);
    lang(naam, z, MAX.zin);
  }
}
keurTekst("vaste zinnen", [ZIN.lijnKijk, "x.", ZIN.tikGetal, "x.", ZIN.tikGetalHand, "x.", ZIN.metDeKlokMee, "x.", ZIN.tweeWijzers, "x.", ...ZIN.urenUitleg, "x.", ZIN.urenKlaar, "x.", ZIN.groteWijzerKijk, "x.", ZIN.na2, "x.", ZIN.na3, "x.", ...ZIN.heelUur]);
for (const z of [ZIN.tikGetal, ZIN.tikGetalHand]) if (!DOE.test(z)) problemen.push(`"${z}" zegt niet wat het kind doet`);

/* ------------------------------------------------------------------ 5. de kiezer naspelen ---------------------- */

let lessen = 0;
let reacties = 0;
{
  let zaad = 20261118;
  const toeval = () => ((zaad = (zaad * 1664525 + 1013904223) % 4294967296), zaad / 4294967296);
  const uit = <T,>(l: readonly T[]) => l[Math.floor(toeval() * l.length)];
  const vorige = new Map<string, string>();
  const zie = (rol: string, z: string, waar: string) => {
    if (vorige.get(rol) === vorm(z)) problemen.push(`naspelen: 2 keer achter elkaar dezelfde zin (${rol}) bij ${waar}: "${kaal(z)}"`);
    vorige.set(rol, vorm(z));
  };
  const stukGoed = (waar: string, zinnen: string[]) => {
    const los = zinnen.flatMap(losseZinnen);
    for (let i = 1; i < los.length; i++) if (getallenIn(los[i - 1]).some((n) => getallenIn(los[i]).includes(n))) problemen.push(`naspelen: een getal klinkt 2 keer vlak achter elkaar bij ${waar}: "${los[i - 1]}" + "${los[i]}"`);
    if (new Set(zinnen.map(vorm)).size !== zinnen.length) problemen.push(`naspelen: 2 keer dezelfde zin in 1 reactie bij ${waar}: "${zinnen.map(kaal).join(" | ")}"`);
  };
  while (lessen < 20000) {
    lessen++;
    const k = nieuweKiezer(toeval);
    /* Het vaste rijtje (denkfout niet duidelijk) kiest de les zelf: nooit 2 keer achter elkaar dezelfde. */
    let vorigeOnd = -1;
    const onduidelijk = (poging: 1 | 2, opdracht: boolean) => () => {
      const mag = ONDUIDELIJK.zinnen.map((_, i) => i).filter((i) => i !== vorigeOnd && !(poging === 2 && i === ONDUIDELIJK_NOG_1_KEER) && !(opdracht && i === ONDUIDELIJK_ANDERE));
      vorigeOnd = uit(mag);
      return ONDUIDELIJK.zinnen[vorigeOnd];
    };
    vorige.clear();
    const speelKeuze = (v: Vraag) => {
      const soort = toeval();
      if (soort < 0.45) return;
      const fouten = Object.keys(v.fouten);
      const al: string[] = [];
      const x1 = uit(fouten);
      const f1 = v.fouten[x1];
      const r1 = foutReactie(k, f1, 1, null, al, onduidelijk(1, false));
      al.push(...r1);
      reacties++;
      stukGoed(`${v.id} (${x1})`, r1);
      if (f1.eerste.length) zie("eerste", r1[0], v.id);
      zie("hint", r1[1], v.id);
      for (const z of r1) lang(`naspelen ${v.id}`, z, MAX.zin);
      const opn = vraagOpnieuw(k, v, al);
      zie("opnieuw", opn, v.id);
      if (vorm(opn) === vorm(v.vraag.join(" "))) problemen.push(`naspelen: de vraag opnieuw is precies de vraag zelf bij ${v.id}`);
      if (getalDubbel(r1[1], opn)) problemen.push(`naspelen: een getal klinkt 2 keer vlak achter elkaar bij ${v.id}: "${kaal(r1[1])}" + "${kaal(opn)}"`);
      if (soort < 0.75) return;
      const x2 = toeval() < 0.5 ? x1 : uit(fouten);
      const f2 = v.fouten[x2];
      const r2 = foutReactie(k, f2, 2, f1, al, onduidelijk(2, false));
      reacties++;
      stukGoed(`${v.id} (${x1}, dan ${x2})`, r2);
      for (const z of r2) {
        lang(`naspelen ${v.id}`, z, MAX.zin);
        if (al.map(vorm).includes(vorm(z))) problemen.push(`naspelen: dezelfde zin 2 keer bij 1 vraag (${v.id}, ${x1} dan ${x2}): "${kaal(z)}"`);
        if (OPDRACHT.test(kaal(z)) && !ONDUIDELIJK.zinnen.includes(z)) problemen.push(`naspelen: opdracht bij de 2e keer (${v.id}): "${kaal(z)}"`);
      }
      if (/\bweer\b/i.test(kaal(r2[0])) && f1.soort !== f2.soort && !ONDUIDELIJK.zinnen.includes(r2[0])) problemen.push(`naspelen: "weer" zonder dat het klopt (${v.id}, ${x1} dan ${x2}): "${kaal(r2[0])}"`);
      if (f1.soort === f2.soort) {
        if (r2.length === 2) zie("weer", r2[0], v.id);
        zie("anders", r2.at(-1)!, v.id);
      } else {
        if (f2.eerste.length) zie("eerste", r2[0], v.id);
        zie("uitleg", r2[1], v.id);
      }
      /* Samen voordoen en de kleine stap. */
      const uur = getalVan(v.goed);
      const samen = v.id.startsWith("klok") || v.id === "stap16-hoe-laat" || v.id === "stap17-6-uur" ? kiesStuk(k, "voordoenKlok", VOORDOEN.klok(uur!)) : v.id.startsWith("stap13") || v.id === "stap16-wijst-3" ? [k.kies("voordoenGetal", VOORDOEN.getal(uur!))] : (v.samen ?? []);
      if (v.id.startsWith("klok") || v.id.startsWith("stap16-hoe") || v.id.startsWith("stap17")) zie("voordoenKlok", samen.join(" "), v.id);
      if (v.id.startsWith("stap13") || v.id === "stap16-wijst-3") zie("voordoenGetal", samen[0], v.id);
      const stap = kleineStap(k, samen.at(-1) ?? "");
      zie("kleineStap", stap, v.id);
      stukGoed(`${v.id} (samen)`, [...samen, stap]);
    };
    const speelZet = (doel: number) => {
      const soort = toeval();
      if (soort < 0.45) return;
      const al: string[] = [];
      const g1 = uit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((n) => n !== doel));
      const f1 = zetFout(g1, doel);
      const r1 = foutReactie(k, f1, 1, null, al, onduidelijk(1, true));
      al.push(...r1);
      reacties++;
      stukGoed(`zet ${doel} (${g1})`, r1);
      lang(`naspelen zet ${doel}`, r1.join(" "), MAX.zetFout1);
      if (f1.eerste.length) zie("eerste", r1[0], `zet ${doel}`);
      zie("hint", r1[1], `zet ${doel}`);
      if (!DOE.test(kaal(r1.join(" ")))) problemen.push(`naspelen: geen opdracht na de 1e keer bij zet ${doel}: "${kaal(r1.join(" "))}"`);
      if (soort < 0.75) return;
      const g2 = toeval() < 0.5 ? g1 : uit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((n) => n !== doel));
      const f2 = zetFout(g2, doel);
      const r2 = foutReactie(k, f2, 2, f1, al, onduidelijk(2, true));
      const stuk = [...r2, ...zetSamen(k, doel, r2)];
      reacties++;
      stukGoed(`zet ${doel} (${g1}, dan ${g2})`, stuk);
      lang(`naspelen zet ${doel}`, stuk.join(" "), MAX.zetFout2);
      for (const z of r2) if (al.map(vorm).includes(vorm(z))) problemen.push(`naspelen: dezelfde zin 2 keer bij 1 opdracht (zet ${doel}, ${g1} dan ${g2}): "${kaal(z)}"`);
      if (/^weer\b|\bweer\b/i.test(kaal(r2[0])) && f1.soort !== f2.soort && !ONDUIDELIJK.zinnen.includes(r2[0])) problemen.push(`naspelen: "weer" zonder dat het klopt (zet ${doel}): "${kaal(r2[0])}"`);
      if (f1.soort === f2.soort) {
        if (r2.length === 2) zie("weer", r2[0], `zet ${doel}`);
        zie("anders", r2.at(-1)!, `zet ${doel}`);
      } else {
        if (f2.eerste.length) zie("eerste", r2[0], `zet ${doel}`);
        zie("uitleg", r2[1], `zet ${doel}`);
      }
      zie("zetHier", stuk.at(-2)!, `zet ${doel}`);
      zie("zetTik", stuk.at(-1)!, `zet ${doel}`);
      if (!DOE.test(kaal(stuk.join(" ")))) problemen.push(`naspelen: geen opdracht na de 2e keer bij zet ${doel}`);
    };
    /* De les: soms met de uitleg (Nee), dan het oefenblok met de vragen tussendoor, de klokken die terugkomen en de bonus. */
    if (toeval() < 0.6) {
      for (const v of UITLEGVRAGEN) {
        if (v.id === "stap15-grote-steeds") for (const d of [2, 3, 6]) speelZet(d);
        speelKeuze(v);
        if (v.id === "stap15-grote-steeds" && toeval() < 0.3) speelZet(7);
      }
    }
    let tussen = 0;
    for (const [i, v] of KLOKVRAGEN.entries()) {
      speelKeuze(v);
      if (tussen === 0) {
        tussen = 1;
        speelKeuze(EXTRAVRAGEN[0]);
      } else if (tussen === 1 && KLOKKEN[i].uur !== 12) {
        tussen = 2;
        speelKeuze(EXTRAVRAGEN.find((x) => x.id === `tussendoor-grote-${KLOKKEN[i].uur}uur`)!);
      }
    }
    for (const i of [0, 2, 6]) speelKeuze(KLOKVRAGEN[i]);
    if (toeval() < 0.3) speelKeuze(EXTRAVRAGEN.at(-1)!);
    /* Het begin, de proef en het slot wisselen per les (1 keer per les; hier alleen: de kiezer geeft altijd een zin). */
    for (const [naam, l] of Object.entries({ start: VAR.start, slot: VAR.slot, terug: VAR.terug(2) })) if (!k.kies(naam, l)) problemen.push(`naspelen: geen zin voor ${naam}`);
  }
}

if (problemen.length) {
  const uniek = [...new Set(problemen)];
  console.error(`FOUTEN (${uniek.length}):\n` + uniek.slice(0, 80).join("\n"));
  process.exit(1);
}
console.log(`Controle: ${nagelopen} zinnen nagelopen (alle varianten). Geen hint of vraag die het antwoord verklapt (ook "vlak naast", "bijna", "links" en "rechts" niet); geen opdracht in de zinnen bij de 2e fout (keuzevragen); geen getal 2 keer vlak achter elkaar; altijd een vraag of opdracht; alles past in het tekstvak.`);
console.log(`Naspelen: ${lessen} lessen, ${reacties} reacties: nooit 2 keer achter elkaar dezelfde zin, nooit 2 keer dezelfde zin bij 1 vraag.`);

/* ------------------------------------------------------------------ 6. de tabel schrijven ---------------------- */

const ONDUIDELIJK_TEKST = '(zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.")';
const rij = (kop: string, antwoord: string, f: Fout) =>
  `| ${kop} | ${antwoord} | \`${f.code}\` — ${f.denkfout} | ${f.eerste[0] || ONDUIDELIJK_TEKST} | ${f.hint[0]} | ${SCHERM_TEKST[f.scherm]} |`;
const KOP = "| Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |\n|---|---|---|---|---|";
const KOP_V = "| Stap en vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |\n|---|---|---|---|---|---|";
const vraagKop = (v: Vraag) => `${v.waar}: "${v.vraag.join(" ")}" (${v.goed})`;
const rijenVan = (lijst: Vraag[]) => lijst.flatMap((v) => Object.entries(v.fouten).map(([antw, f]) => rij(vraagKop(v), antw, f))).join("\n");

const klok = KLOKVRAGEN.map((v) => {
  const rijen = Object.entries(v.fouten).map(([a, f]) => `| ${v.waar.replace("oefenblok, ", "")} | ${a} | \`${f.code}\` — ${f.denkfout} | ${f.eerste[0] || ONDUIDELIJK_TEKST} | ${f.hint[0]} | ${SCHERM_TEKST[f.scherm]} |`);
  return rijen.join("\n");
}).join("\n");

const zetRijen = ZET_DOELEN
  .flatMap((doel) => {
    const kandidaten: [number, string][] = [[doel + 1 > 12 ? 1 : doel + 1, "getal ernaast"], [doel - 1 < 1 ? 12 : doel - 1, "getal ernaast"], [((doel + 5) % 12) + 1, "andere kant"], [spiegel(doel), "spiegelbeeld"], [12, "de 12"], [doel === 5 ? 10 : 5, "een ander getal"]];
    const gezien = new Set<number>();
    return kandidaten
      .filter(([n]) => n !== doel && !gezien.has(n) && gezien.add(n))
      .map(([n, naam]) => rij(`${doel === 7 ? "stap 15 (extra keer zetten)" : "stap 14"}: "Zet de kleine wijzer op de ${doel}."`, `${n} (${naam})`, zetFout(n, doel)));
  })
  .join("\n");

const uitleg = Object.entries(UITLEG).map(([k, u]) => `| ${k} | ${u.uitleg[0]} | ${[u.weer[0], u.anders[0]].filter(Boolean).join(" ")} |`).join("\n");

/* §7: alle varianten op een rij. */
const schoon = (z: string) => kaal(z).replace(/\|/g, "\\|");
const var1 = (naam: string, lijst: readonly string[]) => `| ${naam} | ${[...new Set(lijst.map(schoon))].join(" / ")} |`;
const perDenkfout = new Map<string, { eerste: Set<string>; hint: Set<string> }>();
const voegFout = (naam: string, f: Fout) => {
  const p = perDenkfout.get(naam) ?? { eerste: new Set<string>(), hint: new Set<string>() };
  f.eerste.forEach((z) => p.eerste.add(schoon(z)));
  f.hint.forEach((z) => p.hint.add(schoon(z)));
  perDenkfout.set(naam, p);
};
/* Een klok lezen: per soort denkfout 1 voorbeeld (het uur wisselt, de zin niet). */
const klokVoorbeeld = new Map<string, Fout>();
for (const v of [...KLOKVRAGEN, ...UITLEGVRAGEN.filter((x) => /^stap1[36]/.test(x.id))]) for (const f of Object.values(v.fouten)) {
  const sleutel = `klok lezen: ${f.soort}${f.soort === "ernaast" ? (BIJNA.test(f.eerste[0]) ? " (er liggen 2 keuzes vlak naast)" : " (anders zou \"vlak naast\" het antwoord verklappen)") : ""}${f.hint === Object.values(KLOKVRAGEN[1].fouten)[0].hint ? " (klok op 12 uur)" : ""}${f.soort === "onduidelijk" && !f.hint.some((h) => /uur/.test(h)) ? " (kale getallen)" : ""}`;
  if (!klokVoorbeeld.has(sleutel)) klokVoorbeeld.set(sleutel, f);
}
for (const [s, f] of klokVoorbeeld) voegFout(s, f);
for (const v of [...UITLEGVRAGEN.filter((x) => !/^stap1[36]/.test(x.id)), ...EXTRAVRAGEN.filter((x) => !/^tussendoor-grote-(?!3uur)/.test(x.id))]) for (const [a, f] of Object.entries(v.fouten)) if (f.soort !== "lange-wijzer") voegFout(`${v.id}, keuze ${a}`, f);
const zetVoorbeeld = new Map<string, Fout>();
for (const g of zetGevallen.filter((x) => x.doel === 2)) if (!zetVoorbeeld.has(g.f.soort)) zetVoorbeeld.set(g.f.soort, g.f);
for (const [s, f] of zetVoorbeeld) voegFout(`zetten (voorbeeld: op de 2): ${s}`, f);
const variantenFout = [...perDenkfout].map(([naam, p]) => `| ${naam} | ${[...p.eerste].join(" / ") || "(vast rijtje, BLIEPO-KARAKTER.md §10)"} | ${[...p.hint].join(" / ")} |`).join("\n");
const variantenUitleg = Object.entries(UITLEG).map(([k, u]) => `| ${k} | ${u.uitleg.map(schoon).join(" / ")} | ${u.weer.map(schoon).join(" / ") || "(niets)"} | ${u.anders.map(schoon).join(" / ")} |`).join("\n");
const opnieuwRijen = [...new Map(ALLE_VRAGEN.filter((v) => !/^tussendoor-grote-(?!3uur)/.test(v.id)).map((v) => [v.opnieuw.join("|"), v])).values()].map((v) => var1(`de vraag opnieuw na de hint (${v.id.startsWith("klok") ? "elke klok" : v.id})`, v.opnieuw)).join("\n");
const variantenVast = [
  var1("begin (met de vraag voor Ja of Nee)", VAR.start),
  var1("na Ja: de proef begint", VAR.proefBegin),
  var1("de proef lukt nog niet", VAR.proefLastig.map((s) => s.join(" "))),
  var1("de proef lukt", VAR.proefGoed),
  var1("na Nee: samen beginnen", VAR.samenBeginnen),
  var1("het oefenblok begint", VAR.oefenBegin),
  var1("het oefenblok begint (na de proef)", VAR.oefenVerder),
  var1("klokken van net komen terug (1)", VAR.terug(1)),
  var1("klokken van net komen terug (voorbeeld: 3)", VAR.terug(3)),
  var1("extra klokken, niets gemist (1)", VAR.extra(1)),
  var1("extra klokken, niets gemist (voorbeeld: 2)", VAR.extra(2)),
  var1("de klokken die terugkwamen gingen weer mis", VAR.terugLastig),
  var1("slot", VAR.slot),
  var1("hulphandje bij zetten (voorbeeld: de 2; na een aanmoediging uit het vaste rijtje)", VAR.zetHand(2)),
  var1("zetten, samen doen: waar het getal staat (voorbeeld: de 2)", [...VAR.zetHier(2).metGetal, ...VAR.zetHier(2).zonderGetal]),
  var1("zetten, samen doen: het kind tikt zelf", VAR.zetTik),
  var1("samen voordoen bij een klok (voorbeeld: 3 uur)", VOORDOEN.klok(3).map((s) => s.join(" "))),
  var1("samen voordoen bij de klok op 12 uur", VOORDOEN.klok(12).map((s) => s.join(" "))),
  var1("samen voordoen: naar welk getal wijst de kleine wijzer (voorbeeld: de 3)", VOORDOEN.getal(3)),
  var1("de kleine stap: het kind tikt zelf op het antwoord", VOORDOEN.tik),
  var1("reactie bij de klok na lof (voorbeeld: 3 uur)", KLOKREACTIE(3).zinnen),
  opnieuwRijen,
].join("\n");

const tekst = `# FOUTTABEL — gouden klokles (squla-klok-hoelaat-1-gouden, "Hoe laat is het?")

Opnieuw gemaakt op 9 november 2026 (zesde ronde), bijgewerkt op 11 november 2026 (Ronde 30: 2 hints volgens 15.17, uitleg bij de 2e fout zonder opdracht) en op 18 november 2026 (Sara: Bliepo klinkt als een warme juf; elke zin nagelopen, varianten met de gedeelde kiezer "nooit 2 keer hetzelfde"; zie WIJZIGINGEN-ZINNEN-KLOK.md), **uit de code** met \`npx tsx scripts/fouttabel-klok-gouden.ts\`; pas zinnen dus aan in \`src/components/les/lessen/squla-klok-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (vragen, keuzes, tijden) is die van de les squla-klok-hoelaat-1 en blijft gelijk (15.8). Sinds 9 november staan ook de vragen tussendoor en de bonus erin (alleen hele uren; besluit Sara, ronde 14).

**In §2, §3 en §4 staat steeds de eerste variant van een zin. Alle varianten staan in §7.** Het script keurt ELKE variant (verklappen, ook "vlak naast" en "bijna"; geen getal 2 keer vlak achter elkaar; altijd een vraag of opdracht; past in het tekstvak) en speelt de kiezer ${lessen.toLocaleString("nl-NL")} lessen na (${reacties.toLocaleString("nl-NL")} reacties).

Sara mag elke zin aanpassen. In de les krijgt het uur de kleur van de kleine wijzer (oranje) en de 12 bij de grote wijzer de kleur van de grote wijzer (paars) (14.16); hier staan de getallen zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11; de 3e poging is vervangen):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood, vraag en knoppen even weg, Bliepo zegt de eerste zin en de hint uit de tabel, met het beeld uit de tabel; dat gaat vanzelf door (BOUWREGELS 15.27, pijl rechts als snelkoppeling), dan komt de vraag terug (in een variant, nooit precies dezelfde zin). Het kind mag nog 1 keer.
- **2e fout:** Bliepo legt het uit (§4, bij de denkfout van deze keuze) **en doet het samen met het kind voor**: nu pas de oranje ring om het goede antwoord en het antwoord in woorden; alleen de goede knop blijft, het kind tikt hem zelf ("Tik nu zelf op het antwoord."); de les gaat verder. (Oude regel met een 3e poging: vervangen.)
- **Twee keer dezelfde denkfout** bij dezelfde vraag: Bliepo zegt dat vriendelijk ("weer") en legt het op een andere manier uit (§4, laatste kolom).
- **Niet duidelijk (\`onduidelijk\`):** eerste zin uit BLIEPO-KARAKTER.md §10 (wisselt, nooit 2 keer dezelfde achter elkaar); "Probeer het nog 1 keer, met een tip." alleen na de 1e fout (na de 2e is er geen poging meer) en "Ik bedoelde een andere." alleen bij een keuzevraag, niet bij tikken of zetten en een algemene hint. Geen reden verzonnen.
- **"Vlak naast" en "bijna"** zegt Bliepo alleen als er dan nog 2 keuzes vlak naast liggen. Anders zou het woord het antwoord verklappen (15.17); dan zegt hij alleen wat het kind koos ("Je koos 6 uur. Ik lees een andere tijd.").
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst (voorlopig alleen op het apparaat; zie §5).

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk dacht | Voor een ouder later (dashboard, nu niet bouwen) |
|---|---|---|
| \`verkeerde-wijzer\` | keek naar de grote (lange) wijzer in plaats van de kleine | kijkt vaak naar de verkeerde wijzer |
| \`andere-kant\` | nam het getal aan de andere kant (tegenover) van de klok, bijvoorbeeld 8 bij 2 | leest de wijzer van de verkeerde kant |
| \`spiegelbeeld\` | **nieuw (ronde 15):** koos het getal links in plaats van rechts van de klok, of andersom, bijvoorbeeld 10 bij 2 of 2 bij 10. Bij 3 en 9 is dat hetzelfde als \`andere-kant\`; daar blijft het \`andere-kant\` | draait links en rechts om bij het lezen van de klok |
| \`getal-ernaast\` | nam het getal vlak naast het goede | kijkt niet precies waar de wijzer staat |
| \`een-te-veel\` / \`een-te-weinig\` | telde 1 te veel of 1 te weinig | telt nog niet precies |
| \`plus-min-verwisseld\` | deed plus waar min moest, of andersom (bijvoorbeeld 1 uur terug in plaats van vooruit) | haalt plus en min door elkaar |
| \`groter-kleiner-verwisseld\` | koos het kleinste waar het grootste moest, of andersom | haalt meer en minder door elkaar |
| \`verkeerde-richting\` | ging tegen de klok in, of nam "ervoor" in plaats van "erna" | weet nog niet welke kant "met de klok mee" is |
| \`doortellen-na-12\` | telde door zoals op een getallenlijn (13 na 12) | weet nog niet dat de klok na 12 opnieuw begint |
| \`boven-onder-verwisseld\` | haalde bovenaan en onderaan door elkaar | |
| \`wijzers-verwisseld\` | haalde de namen of de taak van de wijzers door elkaar | haalt de wijzers door elkaar |
| \`uur-minuten-verwisseld\` | zag het goede getal, maar zei minuten in plaats van uur | |
| \`geen-heel-uur\` | lette niet op de grote wijzer bij "is het een heel uur?" | |
| \`beeld-van-net\` | noemde wat er net nog op het scherm stond | |
| \`onduidelijk\` | niet duidelijk: **geen reden verzonnen** | |

Bij \`onduidelijk\` zegt Bliepo een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.

---

## 2. Het oefenblok: de 13 klokken ("Hoe laat is het?")

Bij elke klok staat de grote wijzer op de 12 en de kleine wijzer op het uur. Een kind dat de wijzer op de 2 ziet en 10 kiest (of andersom), krijgt nu \`spiegelbeeld\` en niet meer \`onduidelijk\`.

${KOP}
${klok}

**Samen voordoen na de 2e fout bij een klok:** "Kijk, de kleine wijzer wijst naar de {uur}, in het oranje rondje. De grote wijzer staat op de 12. Dus het is {uur} uur." (of een andere variant, §7). Oranje ring om het uur. Dan: "Tik nu zelf op het antwoord." (het uur wordt niet nog een keer genoemd).
Bij klok 2 (12 uur) staan beide wijzers op de 12; daar is de hint: "${HINT12()}"

## 2b. Vragen tussendoor en de bonus (draaiboek stap 19 en 20; aan sinds 9 november 2026, alleen hele uren)

${KOP_V}
${rijenVan(EXTRAVRAGEN)}

## 3. De uitleg (route na "Nee" of na een mislukte proef)

${KOP_V}
${rijenVan(UITLEGVRAGEN)}
${zetRijen}

**2e fout in de uitleg:** uitleg (§4), dan oranje ring om het goede getal, Bliepo zegt het antwoord, het kind tikt zelf (zie \`samen\` per vraag in de code). Bij zetten: "Hier is de {doel}, in het oranje rondje. Tik er maar op." (of een andere variant, §7) en alleen het doel werkt nog.

## 4. Uitleg bij de 2e fout (daarna samen voordoen)

| Soort denkfout | Uitleg bij de 2e fout | Andere uitleg als dezelfde denkfout nog eens komt |
|---|---|---|
${uitleg}

Bij een nieuwe denkfout bij de 2e fout zegt Bliepo eerst een eerste zin van die denkfout (een andere dan de 1e keer) en dan de uitleg.

## 5. Bewaren voor de voortgang

- **Denkfout:** elke fout wordt vastgelegd met: les, vraag, gekozen antwoord, naam van de denkfout (§1), poging en tijd (functie \`legDenkfoutVast\`).
- **Uitkomst (nieuw, 9 november 2026, BOUWREGELS 15.11):** elke vraag krijgt 1 van drie uitkomsten: **goed in één keer**, **goed na een fout** of **samen gedaan** (functie \`legUitkomstVast\`). Alleen **goed in één keer** telt mee voor beheersing.
- Het bestaande voortgangsmechanisme heeft daar nog geen plek voor zonder nieuwe databasekolom. Daarom bewaart de les het nu alleen op het apparaat zelf (\`window.__denkfouten\` en \`window.__uitkomsten\`; op /voorbeeld ook in de browser onder "thuisles-denkfouten-test" en "thuisles-uitkomsten-test"). Niets gaat naar de server of de database (harde regel 2). Voor echte opslag is een nieuwe tabel of kolom nodig en Sara's akkoord.

## 6. Wat de code nu doet

1. 1e fout: reactie en hint uit deze tabel, wachten op de pijl, dan komt de vraag terug. — gebouwd.
2. 2e fout: uitleg (bij de nieuwe denkfout, of de andere uitleg bij dezelfde denkfout) en samen voordoen. — gebouwd (9 november 2026).
3. Eerste zin per denkfout gelijk aan deze tabel; \`onduidelijk\`: een zin uit BLIEPO-KARAKTER.md §10 plus de algemene hint. — gebouwd.
4. Spiegelbeeld is een eigen denkfout. — gebouwd (9 november 2026).
5. Aanmoediging samen met het hulphandje bij opdrachten, niets bij keuzevragen. — gebouwd (9 november 2026).
6. Varianten met de gedeelde kiezer (\`nooit-dubbel.ts\`): nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen; bij 1 vraag komt geen zin 2 keer. — gebouwd (18 november 2026).

## 7. Alle varianten (18 november 2026: Bliepo als warme juf; nooit 2 keer achter elkaar dezelfde zin)

De les kiest uit elk rijtje steeds 1 zin met de gedeelde kiezer (\`nooit-dubbel.ts\`). Het script loopt ELKE variant na.

### 7a. Eerste zin en hint, per denkfout

| Vraag en denkfout | Bliepo's eerste zin (varianten) | Hint (varianten) |
|---|---|---|
${variantenFout}

### 7b. Uitleg bij de 2e fout

| Soort denkfout | Uitleg (varianten) | "Weer" (varianten) | Andere uitleg (varianten) |
|---|---|---|---|
${variantenUitleg}

### 7c. Het verloop van de les

| Situatie | Varianten |
|---|---|
${variantenVast}

De vaste rijtjes van alle gouden lessen (lof, "nu is het goed", eindzinnen, groet, aanmoediging bij het hulphandje, de zin als de denkfout niet duidelijk is) staan in BLIEPO-KARAKTER.md; die wisselen al zonder herhaling en zijn niet veranderd.
`;
function HINT12() {
  return Object.values(KLOKVRAGEN[1].fouten)[0].hint.map(kaal).join(" / ");
}
writeFileSync(new URL("../FOUTTABEL-squla-klok-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-klok-gouden.md geschreven");
void deeltStuk;
