/**
 * Lessen "Tellen" naar Squla groep 3 Rekenen (30 oktober 2026, opdracht
 * eigenaar). Per Squla-oefening per level één les; elke les volgt hoe dat
 * level bij Squla is opgebouwd (zelfde soort vragen, zelfde volgorde, zelfde
 * getallenreeks), met eigen getallen, eigen zinnen en eigen tekeningen. De
 * analyse staat in SQULA-ANALYSE/tellen-*-volledig.md.
 *
 *   Tellen met fruit (15682)        squla-tellen-fruit-1/2/3
 *   Resultatief tellen 1 (10967)    squla-tellen-resultatief1-1/2/3
 *   Resultatief tellen 2 (10968)    squla-tellen-resultatief2-1/2/3
 *   Resultatief tellen 3 (10969)    squla-tellen-resultatief3-1/2/3/4
 *   Telrij (10977)                  squla-tellen-telrij-1/2
 *
 * De hulp is die van Synthesis (4 november 2026, BOUWREGELS 5.1 en 5.10): goed = kort
 * en door; eerste fout = een korte reactie op wat het kind koos (meer of minder dan het
 * antwoord, of een bekende denkfout) met de eerste voorwerpen alvast opgelicht; tweede
 * fout = Bliepo telt de rest voor en zegt het antwoord, het kind kijkt en luistert en
 * gaat door. Squla zegt bij tellen
 * niets bij een fout; Bliepo's uitleg is samen tellen zoals de voorwerpen in
 * beeld staan: per rij van 5 of per rij van 10, bij losse voorwerpen met
 * streepjes in groepjes van 5 (turven, het idee uit het filmpje "Tellen tot
 * 10"), en bij de telrij samen langs de buren lopen (het idee uit het filmpje
 * "Telrij"). Bliepo telt nooit tot het eind: het laatste stukje telt het kind
 * zelf.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { squlaBegin, squlaEind, squlaVraag } from "./squla-hulp";
import { bevestig, krijgtVervolgvraag, uitlegKeuze, zetSynthesisHulp } from "./squla-uitleg";
import {
  KaartTellen,
  indeling,
  SqulaTelVlak,
  type Kleurnaam,
  type Memorykaartjes,
  type Plaatje,
  type Soort,
  type TelVlakProps,
  type Telopgave,
  type Telvorm,
} from "../vlakken/squla-tellen-holo";
import { FOTO, VASTE_KLEUR } from "../vlakken/squla-tellen-tekenen";
import { KaartTelrij, SqulaTelrij, kaartKleur, type Rijopgave, type TelrijProps } from "../vlakken/squla-tellen-telrij";

/* =====================================================================
   Voorwerpen
   ===================================================================== */

type Voorwerp = {
  /** Meervoud, zoals in de vraag: "Hoeveel appels zie je?" */
  naam: string;
  /** Enkelvoud met "elk" of "elke": "Bij elke appel …", "Bij elk monster …". */
  een: string;
  /** Een het-woord (het monster): "elk" en "los" in plaats van "elke" en "losse". */
  het: boolean;
  plaatjes: Plaatje[];
  /** De kleur van het getal in de zin (één kleur in beeld = die kleur, twee = wit). */
  kleur: Kleurnaam;
};

const ENKEL: Record<Soort, [string, string]> = {
  appel: ["appel", "appels"],
  peer: ["peer", "peren"],
  pruim: ["pruim", "pruimen"],
  citroen: ["citroen", "citroenen"],
  aardbei: ["aardbei", "aardbeien"],
  banaan: ["banaan", "bananen"],
  speelgoedauto: ["auto", "auto's"],
  bus: ["bus", "bussen"],
  huis: ["huis", "huizen"],
  boom: ["boom", "bomen"],
  raketje: ["raketje", "raketjes"],
  ster: ["ster", "sterren"],
  planeet: ["planeet", "planeten"],
  satelliet: ["satelliet", "satellieten"],
  ufo: ["ufo", "ufo's"],
  komeet: ["komeet", "kometen"],
  ballon: ["ballon", "ballonnen"],
  bootje: ["bootje", "bootjes"],
  treintje: ["treintje", "treintjes"],
  bal: ["bal", "ballen"],
  speelblok: ["blok", "blokken"],
  knikker: ["knikker", "knikkers"],
};

/* Het-woorden: "elk huis", "elk los blok". */
const HET = new Set<Soort>(["huis", "raketje", "bootje", "treintje", "speelblok"]);
/** "elke appel", "elk huis". */
const elke = (v: Voorwerp) => `${v.het ? "elk" : "elke"} ${v.een}`;
const hoofd = (z: string) => z[0].toUpperCase() + z.slice(1);
/** "elke losse knikker", "elk los blok". */
const elkeLosse = (v: Voorwerp) => `${v.het ? "elk los" : "elke losse"} ${v.een}`;

/** Het plaatje van een ding, in zijn vaste kleur. */
const plaatje = (soort: Soort): Plaatje => ({ soort, kleur: VASTE_KLEUR[soort] });

/** Eén soort (in zijn vaste kleur). */
function een(soort: Soort): Voorwerp {
  return { naam: ENKEL[soort][1], een: ENKEL[soort][0], het: HET.has(soort), plaatjes: [plaatje(soort)], kleur: VASTE_KLEUR[soort] };
}
/** Twee soorten, de rijen om en om: "auto's en bussen". */
function tweeSoorten(a: Soort, b: Soort): Voorwerp {
  return { naam: `${ENKEL[a][1]} en ${ENKEL[b][1]}`, een: ENKEL[a][0], het: HET.has(a), plaatjes: [plaatje(a), plaatje(b)], kleur: "wit" };
}

/* Fruit */
const APPELS = een("appel");
const PEREN = een("peer");
const PRUIMEN = een("pruim");
const CITROENEN = een("citroen");
const AARDBEIEN = een("aardbei");
const BANANEN = een("banaan");

/* =====================================================================
   Telvragen
   ===================================================================== */

type Telvraag = { vorm: Telvorm; n: number; zak?: number; voorwerp: Voorwerp; keuzes: number[] };

const rij5 = (voorwerp: Voorwerp, n: number, keuzes: number[]): Telvraag => ({ vorm: "rijen5", n, voorwerp, keuzes });
const rij10 = (voorwerp: Voorwerp, n: number, keuzes: number[]): Telvraag => ({ vorm: "rijen10", n, voorwerp, keuzes });
const los = (voorwerp: Voorwerp, n: number, keuzes: number[]): Telvraag => ({ vorm: "verspreid", n, voorwerp, keuzes });
const zak = (voorwerp: Voorwerp, tiental: number, losse: number, keuzes: number[]): Telvraag => ({ vorm: "zak", n: losse, zak: tiental, voorwerp, keuzes });

const antwoordVan = (v: Telvraag) => (v.zak ?? 0) + v.n;
const opgaveVan = (id: string, v: Telvraag): Telopgave => ({ id, vorm: v.vorm, n: v.n, zak: v.zak, plaatjes: v.voorwerp.plaatjes });

/** Een getal in de zin, in de kleur van het voorwerp. */
const gk = (n: number, k: Kleurnaam) => `{${n}:${k}}`;

/** Hoe snel het vlak een voorwerp oplicht bij het samen tellen (zelfde als in het vlak). */
const STAP: Record<Telvorm, number> = { rijen5: 150, rijen10: 90, verspreid: 260, zak: 260 };

type Stand = { huidig: string; goed: number; fout: number };
const zetTel = (l: Lesgids, p: Partial<TelVlakProps>) => l.pasVlakAan<TelVlakProps>(p);

/** Bliepo telt mee tot `tot` (de voorwerpen lichten één voor één op) en wacht tot het vlak klaar is. */
async function telMee(l: Lesgids, v: Telvraag, van: number, tot: number) {
  zetTel(l, { geteld: tot });
  await l.wacht(Math.max(0, tot - van - 1) * STAP[v.vorm] + 350);
}

/** Tot waar Bliepo samen telt; het laatste stukje telt het kind zelf. */
function bliepoTelt(v: Telvraag): number {
  if (v.vorm === "rijen5" || v.vorm === "rijen10") {
    const per = v.vorm === "rijen5" ? 5 : 10;
    return (Math.ceil(v.n / per) - 1) * per;
  }
  if (v.vorm === "verspreid") return v.n > 5 ? Math.floor((v.n - 1) / 5) * 5 : Math.max(1, v.n - 3);
  return v.n >= 3 ? 1 : 0;
}

/** Samen tellen: de uitleg bij een fout (Squla zegt dan niets; zie de kop van dit bestand). */
async function samenTellen(l: Lesgids, v: Telvraag) {
  const k = v.voorwerp.kleur;
  const tot = bliepoTelt(v);
  zetTel(l, { geteld: 0, zakLicht: false });
  if (v.vorm === "zak") {
    const z = v.zak ?? 0;
    zetTel(l, { zakLicht: true });
    await l.zeg(`Op de zak staat het aantal: ${gk(z, k)} ${v.voorwerp.naam} zitten erin.`, `${hoofd(elkeLosse(v.voorwerp))} daarbij is er 1 meer.`);
    zetTel(l, { zakLicht: false });
    if (tot > 0) {
      await telMee(l, v, 0, tot);
      await l.zeg(`${gk(z + tot, k)}.`);
    }
    if (!krijgtVervolgvraag(l)) await l.zeg(`Tel jij verder vanaf ${gk(z + tot, k)}?`);
    return;
  }
  if (v.vorm === "rijen5" || v.vorm === "rijen10") {
    const per = v.vorm === "rijen5" ? 5 : 10;
    await l.zeg(`In elke volle rij liggen ${gk(per, k)} ${v.voorwerp.naam}. Ik tel per rij, dat gaat sneller.`);
    for (let t = per; t <= tot; t += per) {
      await telMee(l, v, t - per, t);
      await l.zeg(`${gk(t, k)}.`);
    }
    if (!krijgtVervolgvraag(l)) await l.zeg(`Tel jij verder vanaf ${gk(tot, k)}?`);
    return;
  }
  await l.zeg(`De ${v.voorwerp.naam} liggen door elkaar.`, `Bij ${elke(v.voorwerp)} zet ik een streepje, zo raak ik er geen kwijt.`);
  if (tot < 5) {
    await telMee(l, v, 0, tot);
    await l.zeg(`${Array.from({ length: tot }, (_, i) => gk(i + 1, k)).join(", ")}.`);
  } else
    for (let t = 5; t <= tot; t += 5) {
      await telMee(l, v, t - 5, t);
      await l.zeg(`${gk(t, k)}.`);
    }
  if (!krijgtVervolgvraag(l)) await l.zeg(`Tel jij verder vanaf ${gk(tot, k)}?`);
}

/** Een rij of rijen: 1 rij of 2 rijen (voor in de zin). */
function rijenTekst(v: Telvraag) {
  const k = v.voorwerp.kleur;
  const per = v.vorm === "rijen10" ? 10 : 5;
  const volle = Math.floor(v.n / per);
  const rest = v.n % per;
  return { k, per, volle, rest, vol: volle * per };
}

/** De getallen na elkaar, bijvoorbeeld "11, 12, 13." */
const reeksTekst = (van: number, tot: number, k: Kleurnaam) => `${Array.from({ length: tot - van }, (_, i) => gk(van + i + 1, k)).join(", ")}.`;

/** Tweede fout: Bliepo telt de rest voor (verder dan het stuk dat al geteld is) en zegt het antwoord. */
async function telRest(l: Lesgids, v: Telvraag) {
  const k = v.voorwerp.kleur;
  const tot = bliepoTelt(v);
  const z = v.zak ?? 0;
  zetTel(l, { zakLicht: false, geteld: tot });
  await l.wacht(300);
  if (v.vorm === "zak") {
    await telMee(l, v, tot, v.n);
    await l.zeg(reeksTekst(z + tot, z + v.n, k), `${gk(z, k)} in de zak en ${gk(v.n, k)} los. Dat maakt ${gk(antwoordVan(v), k)} ${v.voorwerp.naam}.`);
    return;
  }
  await telMee(l, v, tot, v.n);
  if (v.vorm === "verspreid") {
    await l.zeg(reeksTekst(tot, v.n, k), `Ik telde ${elke(v.voorwerp)} 1 keer. Er liggen ${gk(v.n, k)} ${v.voorwerp.naam}.`);
    return;
  }
  const r = rijenTekst(v);
  await l.zeg(reeksTekst(tot, v.n, k), r.rest === 0 ? `${gk(r.volle, k)} volle rijen van ${gk(r.per, k)} zijn ${gk(v.n, k)} ${v.voorwerp.naam}.` : `${gk(r.vol, k)} in de volle rijen, en nog ${gk(r.rest, k)} erbij: ${gk(v.n, k)} ${v.voorwerp.naam}.`);
}

/** Eerste fout: wat Bliepo zegt over het gekozen getal (voor deze soort vraag), en dan de hint. */
function telReactie(v: Telvraag, x: number, hint: string[]): string[] {
  const k = v.voorwerp.kleur;
  const naam = v.voorwerp.naam;
  const goed = antwoordVan(v);
  const eenZin = v.voorwerp.een;
  const X = gk(x, k);
  if (v.vorm === "zak") {
    const z = v.zak ?? 0;
    if (x === z) return [`Bij ${X} tel je alleen de ${naam} in de zak. De losse ${naam} tellen ook mee.`, ...hint];
    if (x === v.n) return [`Je telde alleen de losse ${naam}: ${X}. In de zak zitten er ook al ${gk(z, k)}.`, ...hint];
    if (Math.abs(x - goed) === 1) return [x < goed ? `Bij ${X} mist er 1. Misschien ligt er een losse ${eenZin} die je niet meetelde.` : `Bij ${X} heb je er 1 te veel. Misschien telde je 1 losse ${eenZin} 2 keer.`, ...hint];
    return [x < goed ? `Met ${X} ben je er nog niet: de zak en de losse ${naam} horen bij elkaar.` : `${X} is te veel: samen zijn het er minder.`, ...hint];
  }
  if (v.vorm === "verspreid") {
    if (Math.abs(x - goed) === 1) return [x < goed ? `Bij ${X} mist er 1. Misschien sloeg je 1 ${eenZin} over.` : `Bij ${X} heb je er 1 te veel. Misschien telde je 1 ${eenZin} 2 keer.`, ...hint];
    return [x < goed ? `Er liggen meer ${naam} dan ${X}.` : `Er liggen niet zo veel ${naam} als ${X}.`, ...hint];
  }
  const r = rijenTekst(v);
  if (x === r.vol) return [`Bij ${X} tel je alleen de volle rijen. Kijk ook naar de rij die niet vol is.`, ...hint];
  if (x === goed + 1) return [`Bij ${X} heb je er 1 te veel. Misschien telde je 1 ${eenZin} dubbel.`, ...hint];
  if (x === goed - 1) return [`Bij ${X} mist er 1. Misschien liet je 1 ${eenZin} staan.`, ...hint];
  return [x < goed ? `Er staan meer ${naam} dan ${X}.` : `Er staan niet zo veel ${naam} als ${X}. Tel de volle rijen van ${gk(r.per, k)} en dan de rest.`, ...hint];
}

/** Eén telvraag met de vaste hulp van Bliepo. */
function telVraag(l: Lesgids, id: string, v: Telvraag, st: Stand) {
  const k = v.voorwerp.kleur;
  /* Herstel 7 november (BOUWREGELS 1.23): de keuzes in een willekeurige volgorde; per vraag één keer, dus na een fout blijven ze staan. */
  const keuzes = [...v.keuzes];
  for (let i = keuzes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keuzes[i], keuzes[j]] = [keuzes[j], keuzes[i]];
  }
  const goed = antwoordVan(v);
  let nFout = 0;
  const tip =
    v.vorm === "zak"
      ? bliepoTelt(v) === 0
        ? [`Begin bij ${gk(v.zak ?? 0, k)}, want zo veel ${v.voorwerp.naam} zitten al in de zak.`, `Tel de losse ${v.n === 1 ? v.voorwerp.een : v.voorwerp.naam} erbij.`]
        : [`Het eerste losse ${v.voorwerp.een} is al geteld: dat is ${gk((v.zak ?? 0) + bliepoTelt(v), k)}.`, `Tel nu de andere losse ${v.voorwerp.naam} erbij.`]
      : v.vorm === "verspreid"
        ? [`Ik heb ${gk(bliepoTelt(v), k)} ${v.voorwerp.naam} al voor je geteld.`, `Tik met je vinger op de rest en tel verder.`]
        : [`De eerste rijen zijn samen ${gk(bliepoTelt(v), k)}.`, `Tel de ${v.voorwerp.naam} in de laatste rij erbij.`];
  return squlaVraag<number>(l, {
    synthesis: true,
    reactie: (x) => telReactie(v, x, tip),
    toonAntwoord: () => telRest(l, v),
    toon: () => {
      nFout = 0;
      if (st.huidig === id) return;
      st.huidig = id;
      zetTel(l, { opgave: opgaveVan(id, v), geteld: 0, zakLicht: false, memory: null });
      speelLesgeluid("verschijn");
    },
    vraag: [v.vorm === "zak" ? `Hoeveel ${v.voorwerp.naam} zijn het samen?` : `Hoeveel ${v.voorwerp.naam} zie je?`],
    antwoord: async () => Number(await l.kies(keuzes.map(String), { weetniet: false, direct: true })),
    isGoed: (x) => x === goed,
    noem: (x) => gk(x, k),
    goed: async () => {
      zetTel(l, { goed: ++st.goed });
      await l.zeg(bevestig());
      await l.wacht(400);
    },
    /* Eerste fout: de voorwerpen waar Bliepo "begin bij" over zegt lichten alvast op. */
    fout: () => zetTel(l, { fout: ++st.fout, ...(++nFout === 1 && bliepoTelt(v) > 0 ? { geteld: bliepoTelt(v) } : {}) }),
    samen: () => samenTellen(l, v),
    tip,
    testAntwoord: goed,
  });
}

/* ---------- de korte uitleg (bij "Kun je dit al?" → Nee) ---------- */

async function uitlegTellen(l: Lesgids, v: Telvraag, st: Stand) {
  const k = v.voorwerp.kleur;
  st.huidig = `uitleg-${v.vorm}`;
  zetTel(l, { opgave: opgaveVan(st.huidig, v), geteld: 0, zakLicht: false, memory: null });
  speelLesgeluid("verschijn");
  await l.wacht(600);
  const reeks = (van: number, tot: number) => `${Array.from({ length: tot - van }, (_, i) => gk(van + i + 1, k)).join(", ")}.`;
  if (v.vorm === "zak") {
    const z = v.zak ?? 0;
    zetTel(l, { zakLicht: true });
    await l.zeg(`In de zak zitten ${gk(z, k)} ${v.voorwerp.naam}.`, `${hoofd(elkeLosse(v.voorwerp))} is er 1 meer.`);
    zetTel(l, { zakLicht: false });
    await telMee(l, v, 0, v.n);
    await l.zeg(reeks(z, z + v.n), `Samen zijn het er ${gk(z + v.n, k)}.`);
  } else if (v.vorm === "verspreid") {
    await l.zeg("Ze staan door elkaar.", `Bij ${elke(v.voorwerp)} zet ik een streepje.`);
    await telMee(l, v, 0, 5);
    await l.zeg(reeks(0, 5), "5 streepjes zijn een groepje.");
    await telMee(l, v, 5, v.n);
    await l.zeg(reeks(5, v.n), `Het zijn er ${gk(v.n, k)}.`);
  } else {
    const per = v.vorm === "rijen5" ? 5 : 10;
    await l.zeg(`Ze staan in rijen van ${gk(per, k)}.`);
    let t = 0;
    for (; t + per <= v.n; t += per) {
      await telMee(l, v, t, t + per);
      await l.zeg(`${gk(t + per, k)}.`);
    }
    await l.zeg("Dan tel ik verder.");
    await telMee(l, v, t, v.n);
    await l.zeg(reeks(t, v.n), `Het zijn er ${gk(v.n, k)}.`);
  }
  await l.wacht(500);
}

/** Hetzelfde voorbeeld als het beginscherm: voordoen, aantikken, antwoord geven. */
async function samenTellenBijBegin(l: Lesgids, v: Telvraag, st: Stand) {
  const k = v.voorwerp.kleur;
  const zak = v.zak ?? 0;
  const totaal = antwoordVan(v);
  const per = v.vorm === "rijen5" ? 5 : 10;
  const begin = v.vorm === "zak" ? 0 : v.vorm === "verspreid" ? Math.max(1, v.n - 3) : Math.floor((v.n - 1) / per) * per;
  st.huidig = `${l.lesId}-samen`;
  const opgave = opgaveVan(st.huidig, v);
  const beeld = indeling(opgave);
  const naamBij = (n: number) => {
    const soort = beeld.plekken[beeld.volgorde[n]].p.soort;
    return `${HET.has(soort) ? "het" : "de"} ${ENKEL[soort][0]}`;
  };
  zetTel(l, { opgave, geteld: 0, telActief: false, memory: null, zakLicht: v.vorm === "zak" });
  if (v.vorm === "zak") {
    await l.zeg(`Op de zak staat ${gk(zak, k)}. Er zitten dus ${gk(zak, k)} ${v.voorwerp.naam} in.`, `Als je de losse ${v.voorwerp.naam} erbij telt, weet je hoeveel het er samen zijn.`);
  } else if (v.vorm === "verspreid") {
    await l.zeg(`De ${v.voorwerp.naam} liggen door elkaar. Eerst ga ik ze één voor één tellen, de streepjes helpen me onthouden hoeveel ik al heb.`);
    await telMee(l, v, 0, begin);
    await l.zeg(`Ik heb er ${gk(begin, k)} geteld.`);
  } else {
    await l.zeg(`De ${v.voorwerp.naam} staan in rijtjes. Een volle rij telt ${gk(per, k)}, dus ik begin met de volle rijen.`);
    for (let n = per; n <= begin; n += per) {
      await telMee(l, v, n - per, n);
      await l.zeg(`${gk(n, k)}.`);
    }
  }
  zetTel(l, { zakLicht: false });
  await l.zeg(`Begin bij ${gk(zak + begin, k)}. Tik steeds op ${naamBij(begin)} met de kring en tel verder.`);
  try {
    for (let n = begin; n < v.n; n++) {
      if (typeof window !== "undefined") window.__phaser = { ...window.__phaser, antwoord: `tel-${n}` };
      const tik = l.wachtOpVlak<{ soort: string; index: number }>("uitlegTel");
      zetTel(l, { telActief: true, telNaam: naamBij(n) });
      const antwoord = await tik;
      if (antwoord.index !== n) { n--; continue; }
      zetTel(l, { telActief: false, geteld: n + 1 });
      await l.zeg(`${gk(zak + n + 1, k)}.`);
    }
    await uitlegKeuze(l, {
      vraag: `Hoeveel ${v.voorwerp.naam} zijn het samen?`,
      keuzes: [String(totaal + 1), String(totaal), String(totaal - 1)],
      antwoord: String(totaal),
      hint: `Denk aan het getal dat je het laatst zei. Zoveel ${v.voorwerp.naam} heb je geteld.`,
      reactie: (x) => [Number(x) > totaal ? `${gk(Number(x), k)} is 1 meer dan het laatste getal dat je zei.` : `${gk(Number(x), k)} is 1 minder dan het laatste getal dat je zei.`],
      laatZien: `Het laatste getal dat je zei was ${gk(totaal, k)}. Dus zijn het er ${gk(totaal, k)} ${v.voorwerp.naam}.`,
      goed: `Ja, ${gk(totaal, k)} ${v.voorwerp.naam}! Het getal dat je het laatst zei, vertelt hoeveel het er samen zijn.`,
      hulp: async () => { await l.zeg(`Je begon bij ${gk(zak + begin, k)} en telde verder tot ${gk(totaal, k)}.`); },
    });
  } finally {
    zetTel(l, { telActief: false });
    st.huidig = "";
  }
}

/* ---------- memory (tussendoortje bij Resultatief tellen 3) ---------- */

async function memory(l: Lesgids, m: Memorykaartjes, st: Stand, laatste = false) {
  st.huidig = "";
  zetTel(l, { opgave: null, geteld: 0, zakLicht: false, memory: m });
  speelLesgeluid("verschijn");
  await l.zeg(laatste ? "Nog een spelletje!" : "Even een spelletje tussendoor!", "Kijk goed waar de plaatjes staan.");
  await l.zeg("Zoek steeds 2 dezelfde.", "Tik op 2 kaartjes.");
  await l.wachtOpVlak("memoryKlaar");
  zetTel(l, { memory: null });
  await l.zeg("Goed gedaan!", "Je hebt ze allemaal gevonden.", ...(laatste ? [] : ["We gaan weer tellen."]));
}

/* ---------- een hele telles ---------- */

type Telles = {
  id: string;
  titel: string;
  oefening: string;
  level: number;
  welkom: string[];
  /** Wat Bliepo laat zien bij de korte uitleg (één of twee voorbeelden). */
  uitleg: Telvraag[];
  vragen: (Telvraag | "memory")[];
  memory?: Memorykaartjes;
  eind: string;
  /** Alleen voor de proeflessen: ze houden hun oude beginscherm (zonder voorbeeld). */
  zonderVoorbeeld?: boolean;
  /** Proef (31 oktober 2026): echte plaatjes uit /proef-plaatjes, met of zonder gloed. */
  foto?: { gloed: "altijd" | "nooit" | "moment"; plaatjes: Partial<Record<Soort, string>> };
};

/** Laadt de echte plaatjes van een proefles (of zet ze uit voor een gewone les). */
async function zetFotos(foto: Telles["foto"]) {
  FOTO.plaatjes = {};
  FOTO.gloed = foto?.gloed ?? "moment";
  if (!foto) return;
  await Promise.all(
    Object.entries(foto.plaatjes).map(async ([soort, src]) => {
      const img = new Image();
      img.src = src!;
      await img.decode();
      FOTO.plaatjes[soort as Soort] = img;
    }),
  );
}

/** Alle vaste plaatjes die een telles tekent (het lesscherm laadt ze vooraf). */
function voorwerpenVan(t: Telles): string[] {
  const namen = new Set<string>();
  for (const v of [...t.uitleg, ...t.vragen]) if (v !== "memory") for (const p of v.voorwerp.plaatjes) namen.add(p.soort);
  for (const p of t.memory?.paren ?? []) namen.add(p.soort);
  if ([...t.uitleg, ...t.vragen].some((v) => v !== "memory" && v.vorm === "zak")) namen.add("zak");
  /* De knikker wordt getekend als de glazen knikker (herstel 7 november). */
  if (namen.has("knikker")) namen.add("knikker-glas");
  /* De bal wordt getekend als de strandbal "speelbal" (herstel ronde 2, 7 november). */
  if (namen.has("bal")) namen.add("speelbal");
  return [...namen];
}

function telles(t: Telles): Lesdraaiboek {
  return {
    id: t.id,
    titel: t.titel,
    synthesis: `Squla groep 3 · Tellen · ${t.oefening} · level ${t.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    kaarttekening: KaartTellen,
    voorwerpen: voorwerpenVan(t),
    /* Alle lessen in de donkere stijl (31 oktober 2026); alleen de proef "zonder glow" blijft zoals hij was. */
    ...(t.foto?.gloed !== "nooit" ? { nacht: true as const } : {}),
    async speel(l) {
      await zetFotos(t.foto);
      zetSynthesisHulp(l);
      const st: Stand = { huidig: "", goed: 0, fout: 0 };
      const eerste = t.uitleg[0];
      st.huidig = `uitleg-${eerste.vorm}`;
      /* Alle plaatjes van de les, één keer (die worden vooruit gebakken). */
      const alle = new Map<string, Plaatje>();
      for (const v of [...t.uitleg, ...t.vragen]) if (v !== "memory") for (const p of v.voorwerp.plaatjes) alle.set(p.soort, p);
      for (const p of t.memory?.paren ?? []) alle.set(p.soort, p);
      const zakken = [...new Set([...t.uitleg, ...t.vragen].flatMap((v) => (v !== "memory" && v.zak ? [v.zak] : [])))];
      l.vlak<TelVlakProps>(SqulaTelVlak, { opgave: opgaveVan(st.huidig, eerste), geteld: 0, voorraad: { plaatjes: [...alle.values()], zakken } });
      speelLesgeluid("verschijn");
      /* Het beginscherm laat de eerste vraag van de les zien (BOUWREGELS 4.1). */
      const v0 = t.vragen.find((v): v is Telvraag => v !== "memory")!;
      const voorbeeldAfgerond = await squlaBegin(l, {
        welkom: t.welkom,
        samen: () => samenTellenBijBegin(l, v0, st),
        uitleg: async () => {
          for (const v of t.uitleg) await uitlegTellen(l, v, st);
        },
        ...(t.zonderVoorbeeld
          ? {}
          : {
              voorbeeld: () => {
                st.huidig = `${t.id}-1`;
                zetTel(l, { opgave: opgaveVan(st.huidig, v0), geteld: 0, zakLicht: false, memory: null });
              },
            }),
      });
      /* Na het voorbeeld tekent de eerste vraag zijn beeld zelf weer opnieuw. */
      st.huidig = "";
      let fouten = 0;
      let nr = 0;
      for (const v of t.vragen) {
        if (v === "memory") {
          if (t.memory) await memory(l, t.memory, st, v === t.vragen[t.vragen.length - 1]);
          continue;
        }
        nr++;
        if (voorbeeldAfgerond && nr === 1) continue;
        if (!(await telVraag(l, `${t.id}-${nr}`, v, st))) fouten++;
      }
      await squlaEind(l, fouten, t.eind);
    },
  };
}

/* =====================================================================
   Tellen met fruit (15682) — rijen van 5, kiezen uit 3 opeenvolgende getallen
   ===================================================================== */

/* Het welkom van de lessen fruit-1 en fruit-2. (De oude zin van fruit-1 staat nu bij de proeflessen.) */
const FRUIT_WELKOM = [
  ["De appels liggen netjes in rijtjes.", "Hoeveel appels zie je?"],
  ["De citroenen liggen weer in rijen van {5:geel}.", "Hoeveel citroenen zie je?"],
];

const FRUIT1: Telles = {
  id: "squla-tellen-fruit-1",
  titel: "Fruit tellen",
  oefening: "Tellen met fruit",
  level: 1,
  welkom: FRUIT_WELKOM[0],
  uitleg: [rij5(APPELS, 8, [])],
  /* Level 1: 11 t/m 17, rijen van 5, drie soorten fruit om de beurt. */
  vragen: [
    rij5(APPELS, 12, [10, 11, 12]),
    rij5(PEREN, 11, [11, 12, 13]),
    rij5(PRUIMEN, 13, [12, 13, 14]),
    rij5(APPELS, 14, [14, 15, 16]),
    rij5(PEREN, 12, [11, 12, 13]),
    rij5(PRUIMEN, 15, [13, 14, 15]),
    rij5(APPELS, 16, [15, 16, 17]),
    rij5(PEREN, 13, [13, 14, 15]),
    rij5(PRUIMEN, 17, [15, 16, 17]),
    rij5(PEREN, 14, [13, 14, 15]),
    rij5(APPELS, 13, [12, 13, 14]),
    rij5(PRUIMEN, 16, [16, 17, 18]),
    rij5(PEREN, 15, [14, 15, 16]),
    rij5(APPELS, 17, [16, 17, 18]),
    rij5(PRUIMEN, 11, [9, 10, 11]),
  ],
  eind: "Je kunt fruit tellen.",
};
const fruit1 = telles(FRUIT1);

const fruit2 = telles({
  id: "squla-tellen-fruit-2",
  titel: "Fruit tellen (moeilijker)",
  oefening: "Tellen met fruit",
  level: 2,
  welkom: FRUIT_WELKOM[1],
  uitleg: [rij5(CITROENEN, 8, [])],
  /* Level 2: 11 t/m 20, rijen van 5; twee soorten fruit om de beurt, elk oplopend. */
  vragen: [
    rij5(CITROENEN, 11, [11, 12, 13]),
    rij5(AARDBEIEN, 14, [12, 13, 14]),
    rij5(CITROENEN, 12, [12, 13, 14]),
    rij5(AARDBEIEN, 15, [14, 15, 16]),
    rij5(CITROENEN, 13, [11, 12, 13]),
    rij5(AARDBEIEN, 16, [16, 17, 18]),
    rij5(CITROENEN, 14, [13, 14, 15]),
    rij5(AARDBEIEN, 17, [15, 16, 17]),
    rij5(CITROENEN, 15, [15, 16, 17]),
    rij5(AARDBEIEN, 18, [17, 18, 19]),
    rij5(CITROENEN, 16, [14, 15, 16]),
    rij5(AARDBEIEN, 19, [18, 19, 20]),
    rij5(CITROENEN, 17, [16, 17, 18]),
    rij5(AARDBEIEN, 20, [18, 19, 20]),
    rij5(CITROENEN, 18, [17, 18, 19]),
  ],
  eind: "Je kunt fruit tellen tot {20}.",
});

const fruit3 = telles({
  id: "squla-tellen-fruit-3",
  titel: "Fruit tellen (nog moeilijker)",
  oefening: "Tellen met fruit",
  level: 3,
  welkom: ["Nu liggen de bananen door elkaar.", "Hoeveel bananen zie je?"],
  uitleg: [los(BANANEN, 8, [])],
  /* Level 3: 11 t/m 20, los door elkaar, door elkaar in grootte. */
  vragen: [
    los(BANANEN, 15, [15, 16, 17]),
    los(APPELS, 12, [10, 11, 12]),
    los(PEREN, 13, [12, 13, 14]),
    los(BANANEN, 17, [16, 17, 18]),
    los(AARDBEIEN, 11, [11, 12, 13]),
    los(PRUIMEN, 19, [17, 18, 19]),
    los(CITROENEN, 14, [13, 14, 15]),
    los(BANANEN, 20, [18, 19, 20]),
    los(APPELS, 16, [16, 17, 18]),
    los(PEREN, 18, [17, 18, 19]),
    los(AARDBEIEN, 13, [13, 14, 15]),
    los(PRUIMEN, 17, [15, 16, 17]),
    los(CITROENEN, 19, [18, 19, 20]),
    los(BANANEN, 12, [11, 12, 13]),
    los(APPELS, 18, [16, 17, 18]),
  ],
  eind: "Je telt fruit, ook als het door elkaar ligt.",
});

/* =====================================================================
   Resultatief tellen 1 (10967)
   ===================================================================== */

/*
  31 oktober 2026 (besluit eigenaar): geen dieren, monsters of spookjes meer,
  en elk ding heeft één vaste kleur. Squla wisselt de rijen om en om van
  "kleur/vorm"; hier wisselen de rijen van ding (auto's en bussen, huizen en
  bomen …), en elk ding heeft zijn eigen kleur.
*/
const AUTOS_BUSSEN = tweeSoorten("speelgoedauto", "bus");
const BUSSEN_AUTOS = tweeSoorten("bus", "speelgoedauto");
const HUIZEN_BOMEN = tweeSoorten("huis", "boom");
const RAKETJES_STERREN = tweeSoorten("raketje", "ster");
const BALLEN_BLOKKEN = tweeSoorten("bal", "speelblok");
const BOOTJES_TREINTJES = tweeSoorten("bootje", "treintje");

const RES1_WELKOM = ["Auto's en bussen staan om en om in rijen.", "Hoeveel auto's en bussen zie je?"];

const res1a = telles({
  id: "squla-tellen-resultatief1-1",
  titel: "Tellen in rijtjes",
  oefening: "Resultatief tellen 1",
  level: 1,
  welkom: RES1_WELKOM,
  uitleg: [rij5(AUTOS_BUSSEN, 8, [])],
  /* Level 1: 11 t/m 17, rijen van 5, om en om een ander ding; de keuzes niet op volgorde. */
  vragen: [
    rij5(AUTOS_BUSSEN, 13, [14, 13, 12]),
    rij5(HUIZEN_BOMEN, 12, [12, 14, 13]),
    rij5(RAKETJES_STERREN, 15, [16, 15, 14]),
    rij5(BUSSEN_AUTOS, 11, [10, 12, 11]),
    rij5(HUIZEN_BOMEN, 16, [17, 15, 16]),
    rij5(RAKETJES_STERREN, 14, [15, 14, 12]),
    rij5(AUTOS_BUSSEN, 17, [16, 17, 15]),
    rij5(HUIZEN_BOMEN, 13, [13, 15, 14]),
    rij5(RAKETJES_STERREN, 16, [16, 10, 15]),
    rij5(BUSSEN_AUTOS, 15, [14, 16, 15]),
    rij5(HUIZEN_BOMEN, 14, [12, 14, 13]),
    rij5(RAKETJES_STERREN, 12, [13, 11, 12]),
    rij5(AUTOS_BUSSEN, 16, [15, 17, 16]),
    rij5(HUIZEN_BOMEN, 17, [17, 15, 16]),
    rij5(RAKETJES_STERREN, 11, [12, 11, 13]),
  ],
  eind: "Je kunt tellen in rijtjes.",
});

const res1b = telles({
  id: "squla-tellen-resultatief1-2",
  titel: "Tellen in rijtjes (moeilijker)",
  oefening: "Resultatief tellen 1",
  level: 2,
  welkom: ["We tellen verder, tot {20}.", "Hoeveel ballen en blokken zie je?"],
  uitleg: [rij5(BALLEN_BLOKKEN, 8, [])],
  /* Level 2: 11 t/m 20, rijen van 5; twee reeksen om de beurt, elk oplopend; de keuzes op volgorde. */
  vragen: [
    rij5(BALLEN_BLOKKEN, 11, [11, 12, 13]),
    rij5(BOOTJES_TREINTJES, 14, [14, 15, 16]),
    rij5(BALLEN_BLOKKEN, 12, [11, 12, 13]),
    rij5(BOOTJES_TREINTJES, 15, [13, 14, 15]),
    rij5(BALLEN_BLOKKEN, 13, [13, 14, 15]),
    rij5(BOOTJES_TREINTJES, 16, [16, 17, 18]),
    rij5(BALLEN_BLOKKEN, 14, [12, 13, 14]),
    rij5(BOOTJES_TREINTJES, 17, [15, 16, 17]),
    rij5(BALLEN_BLOKKEN, 15, [14, 15, 16]),
    rij5(BOOTJES_TREINTJES, 18, [18, 19, 20]),
    rij5(BALLEN_BLOKKEN, 16, [15, 16, 17]),
    rij5(BOOTJES_TREINTJES, 19, [17, 18, 19]),
    rij5(BALLEN_BLOKKEN, 17, [17, 18, 19]),
    rij5(BOOTJES_TREINTJES, 20, [18, 19, 20]),
    rij5(BALLEN_BLOKKEN, 18, [16, 17, 18]),
  ],
  eind: "Je kunt tellen tot {20}.",
});

const res1c = telles({
  id: "squla-tellen-resultatief1-3",
  titel: "Tellen in rijtjes (nog moeilijker)",
  oefening: "Resultatief tellen 1",
  level: 3,
  welkom: ["De planeten staan door elkaar.", "Hoeveel planeten zie je?"],
  uitleg: [los(een("planeet"), 8, [])],
  /* Level 3: 11 t/m 20, los door elkaar, één kleur; elke vraag een ander ding. */
  vragen: [
    los(een("planeet"), 14, [14, 15, 16]),
    los(een("speelgoedauto"), 13, [11, 12, 13]),
    los(een("huis"), 11, [11, 12, 13]),
    los(een("raketje"), 15, [14, 15, 16]),
    los(een("satelliet"), 12, [10, 11, 12]),
    los(een("boom"), 18, [17, 18, 19]),
    los(een("komeet"), 19, [17, 18, 19]),
    los(een("ballon"), 20, [18, 19, 20]),
    los(een("bootje"), 17, [17, 18, 19]),
    los(een("ufo"), 16, [15, 16, 17]),
    los(een("bal"), 13, [12, 13, 14]),
    los(een("bus"), 18, [16, 17, 18]),
    los(een("ster"), 15, [15, 16, 17]),
    los(een("knikker"), 19, [18, 19, 20]),
    los(een("speelblok"), 12, [11, 12, 13]),
  ],
  eind: "Je telt goed, ook als alles door elkaar staat.",
});

/* =====================================================================
   Resultatief tellen 2 (10968)
   ===================================================================== */

/* Squla telt hier dieren; Bliepo telt dingen uit de ruimte (31 oktober 2026: liever geen dieren). */
const RAKETJES = een("raketje");
const STERREN = een("ster");
const PLANETEN = een("planeet");
const SATELLIETEN = een("satelliet");
const UFOS = een("ufo");

const res2a = telles({
  id: "squla-tellen-resultatief2-1",
  titel: "Hoeveel zie je?",
  oefening: "Resultatief tellen 2",
  level: 1,
  welkom: ["De raketjes staan in rijen.", "Hoeveel raketjes zie je?"],
  uitleg: [rij5(RAKETJES, 8, [])],
  /* Level 1: 11 t/m 15, rijen van 5, één ding in één kleur; de keuzes op volgorde. */
  vragen: [
    rij5(RAKETJES, 13, [12, 13, 14]),
    rij5(STERREN, 12, [12, 13, 14]),
    rij5(PLANETEN, 14, [13, 14, 15]),
    rij5(SATELLIETEN, 11, [11, 12, 13]),
    rij5(UFOS, 15, [13, 14, 15]),
    rij5(RAKETJES, 12, [11, 12, 13]),
    rij5(STERREN, 14, [12, 13, 14]),
    rij5(PLANETEN, 13, [13, 14, 15]),
    rij5(SATELLIETEN, 15, [14, 15, 16]),
    rij5(UFOS, 11, [10, 11, 12]),
    rij5(RAKETJES, 14, [14, 15, 16]),
    rij5(STERREN, 15, [13, 14, 15]),
    rij5(PLANETEN, 11, [11, 12, 13]),
    rij5(SATELLIETEN, 13, [11, 12, 13]),
    rij5(UFOS, 12, [12, 13, 14]),
  ],
  eind: "Je kunt tellen tot {15}.",
});

const res2b = telles({
  id: "squla-tellen-resultatief2-2",
  titel: "Hoeveel zie je? (moeilijker)",
  oefening: "Resultatief tellen 2",
  level: 2,
  welkom: ["Nu zijn het meer auto's en bussen.", "Hoeveel auto's en bussen zie je?"],
  uitleg: [rij5(AUTOS_BUSSEN, 8, [])],
  /* Level 2: 16 t/m 20, rijen van 5, vaak om en om een ander ding; de keuzes op volgorde. */
  vragen: [
    rij5(AUTOS_BUSSEN, 17, [16, 17, 18]),
    rij5(HUIZEN_BOMEN, 16, [16, 17, 18]),
    rij5(RAKETJES, 18, [17, 18, 19]),
    rij5(BALLEN_BLOKKEN, 17, [15, 16, 17]),
    rij5(BUSSEN_AUTOS, 19, [18, 19, 20]),
    rij5(BOOTJES_TREINTJES, 16, [14, 15, 16]),
    rij5(HUIZEN_BOMEN, 20, [18, 19, 20]),
    rij5(RAKETJES, 19, [17, 18, 19]),
    rij5(AUTOS_BUSSEN, 18, [16, 17, 18]),
    rij5(BALLEN_BLOKKEN, 20, [18, 19, 20]),
    rij5(BOOTJES_TREINTJES, 17, [17, 18, 19]),
    rij5(HUIZEN_BOMEN, 18, [18, 19, 20]),
    rij5(BUSSEN_AUTOS, 16, [16, 17, 18]),
    rij5(RAKETJES, 20, [18, 19, 20]),
    rij5(BOOTJES_TREINTJES, 19, [17, 18, 19]),
  ],
  eind: "Je kunt tellen tot {20}.",
});

const res2c = telles({
  id: "squla-tellen-resultatief2-3",
  titel: "Hoeveel zie je? (nog moeilijker)",
  oefening: "Resultatief tellen 2",
  level: 3,
  welkom: ["De ufo's zweven door elkaar.", "Hoeveel ufo's zie je?"],
  uitleg: [los(UFOS, 8, []), rij5(AUTOS_BUSSEN, 8, [])],
  /* Level 3: om en om weinig ufo's los door elkaar (5 t/m 13) en veel in rijen van 5 (16 t/m 20). */
  vragen: [
    los(UFOS, 7, [6, 7, 8]),
    rij5(AUTOS_BUSSEN, 17, [16, 17, 18]),
    los(UFOS, 9, [7, 8, 9]),
    rij5(BALLEN_BLOKKEN, 16, [16, 17, 18]),
    los(UFOS, 12, [10, 12, 14]),
    rij5(HUIZEN_BOMEN, 19, [17, 18, 19]),
    los(UFOS, 8, [8, 9, 10]),
    rij5(BOOTJES_TREINTJES, 18, [18, 19, 20]),
    los(UFOS, 6, [5, 6, 7]),
    rij5(BUSSEN_AUTOS, 20, [18, 19, 20]),
    los(UFOS, 11, [10, 11, 12]),
    rij5(RAKETJES, 17, [17, 18, 19]),
    los(UFOS, 13, [11, 12, 13]),
    rij5(HUIZEN_BOMEN, 18, [16, 17, 18]),
    los(UFOS, 5, [5, 6, 7]),
  ],
  eind: "Je telt in rijen én door elkaar.",
});

/* =====================================================================
   Resultatief tellen 3 (10969)
   ===================================================================== */

/* Squla telt hier spookjes en monsters; Bliepo telt planeten en ufo's (31 oktober 2026: geen gezichtjes). */
const res3a = telles({
  id: "squla-tellen-resultatief3-1",
  titel: "Grote groepen tellen",
  oefening: "Resultatief tellen 3",
  level: 1,
  welkom: ["De planeten zweven door de ruimte.", "Hoeveel planeten zie je?"],
  uitleg: [los(PLANETEN, 8, [])],
  /* Level 1: 5 t/m 20, alles los door elkaar; planeten en ufo's om de beurt; de keuzes niet op volgorde; aan het eind memory. */
  vragen: [
    los(PLANETEN, 6, [4, 8, 6]),
    los(UFOS, 13, [12, 14, 13]),
    los(PLANETEN, 9, [10, 8, 9]),
    los(UFOS, 18, [19, 17, 18]),
    los(PLANETEN, 14, [15, 13, 14]),
    los(UFOS, 10, [10, 11, 9]),
    los(PLANETEN, 19, [20, 18, 19]),
    los(UFOS, 15, [16, 14, 15]),
    los(PLANETEN, 11, [11, 13, 12]),
    los(UFOS, 20, [19, 20, 18]),
    los(PLANETEN, 7, [8, 6, 7]),
    los(UFOS, 16, [17, 15, 16]),
    los(PLANETEN, 12, [13, 11, 12]),
    los(UFOS, 17, [16, 18, 17]),
    los(PLANETEN, 5, [7, 5, 6]),
    "memory",
  ],
  memory: {
    id: "squla-tellen-resultatief3-1-memory",
    paren: (["raketje", "ufo", "planeet", "ster", "satelliet"] as Soort[]).map(plaatje),
  },
  eind: "Je kunt grote groepen tellen.",
});

const res3b = telles({
  id: "squla-tellen-resultatief3-2",
  titel: "Grote groepen tellen (moeilijker)",
  oefening: "Resultatief tellen 3",
  level: 2,
  welkom: ["Weer planeten en ufo's, door elkaar.", "Hoeveel planeten zie je?"],
  uitleg: [los(PLANETEN, 8, [])],
  /* Level 2: 7 t/m 19, alles los door elkaar; de keuzes soms ver uit elkaar; memory tussendoor. */
  vragen: [
    los(PLANETEN, 16, [16, 14, 17]),
    los(UFOS, 8, [7, 9, 8]),
    los(PLANETEN, 12, [11, 12, 13]),
    los(UFOS, 10, [10, 9, 11]),
    los(PLANETEN, 9, [10, 9, 8]),
    los(UFOS, 15, [15, 16, 14]),
    los(PLANETEN, 17, [17, 14, 19]),
    los(UFOS, 11, [12, 11, 10]),
    los(PLANETEN, 14, [13, 16, 14]),
    los(UFOS, 19, [18, 19, 17]),
    "memory",
    los(PLANETEN, 18, [15, 18, 19]),
    los(UFOS, 13, [13, 12, 14]),
    los(PLANETEN, 7, [9, 7, 8]),
    los(UFOS, 16, [17, 15, 16]),
    los(PLANETEN, 19, [18, 16, 19]),
  ],
  memory: {
    id: "squla-tellen-resultatief3-2-memory",
    paren: (["bal", "speelgoedauto", "bootje", "ballon", "treintje"] as Soort[]).map(plaatje),
  },
  eind: "Je kunt grote groepen tellen.",
});

const res3c = telles({
  id: "squla-tellen-resultatief3-3",
  titel: "Grote groepen tellen (nog moeilijker)",
  oefening: "Resultatief tellen 3",
  level: 3,
  welkom: ["Raketjes en sterren staan in rijen van {10}.", "Hoeveel raketjes en sterren zie je?"],
  uitleg: [rij10(RAKETJES_STERREN, 23, [])],
  /* Level 3: 22 t/m 50, rijen van 10, om en om een ander ding; de keuzes ±1, niet op volgorde. */
  vragen: [
    rij10(RAKETJES_STERREN, 24, [23, 24, 22]),
    rij10(tweeSoorten("planeet", "komeet"), 29, [29, 28, 30]),
    rij10(HUIZEN_BOMEN, 36, [35, 37, 36]),
    rij10(tweeSoorten("ufo", "satelliet"), 47, [46, 47, 37]),
    rij10(BALLEN_BLOKKEN, 50, [49, 50, 48]),
    rij10(AUTOS_BUSSEN, 32, [31, 33, 32]),
    rij10(BOOTJES_TREINTJES, 35, [35, 36, 34]),
    rij10(tweeSoorten("knikker", "ballon"), 26, [27, 25, 26]),
    rij10(tweeSoorten("ster", "planeet"), 43, [42, 44, 43]),
    rij10(tweeSoorten("satelliet", "raketje"), 48, [49, 47, 48]),
    rij10(BUSSEN_AUTOS, 39, [40, 38, 39]),
    rij10(tweeSoorten("komeet", "ufo"), 41, [41, 40, 42]),
    rij10(tweeSoorten("speelblok", "bal"), 28, [29, 27, 28]),
    rij10(tweeSoorten("ballon", "knikker"), 45, [46, 44, 45]),
    rij10(tweeSoorten("boom", "huis"), 33, [33, 32, 34]),
  ],
  eind: "Je kunt tellen tot {50}.",
});

const KNIKKERS = een("knikker");

const res3d = telles({
  id: "squla-tellen-resultatief3-4",
  titel: "Grote groepen tellen (heel moeilijk)",
  oefening: "Resultatief tellen 3",
  level: 4,
  welkom: ["Op de zak staat {40:blauw}: zoveel knikkers zitten erin.", "Hoeveel knikkers zijn het samen?"],
  uitleg: [zak(KNIKKERS, 30, 3, [])],
  /* Level 4: een zak met een tiental (40 t/m 90) en 1 t/m 9 losse; 47 t/m 98; de keuzes ±1, niet op volgorde. */
  vragen: [
    zak(KNIKKERS, 40, 7, [47, 48, 46]),
    zak(KNIKKERS, 50, 2, [53, 52, 51]),
    zak(KNIKKERS, 50, 8, [57, 59, 58]),
    zak(KNIKKERS, 60, 4, [64, 63, 65]),
    zak(KNIKKERS, 70, 1, [72, 70, 71]),
    zak(APPELS, 70, 5, [76, 75, 74]),
    zak(APPELS, 80, 2, [81, 83, 82]),
    zak(APPELS, 80, 7, [87, 88, 86]),
    zak(APPELS, 90, 3, [92, 94, 93]),
    zak(APPELS, 90, 8, [99, 97, 98]),
    zak(STERREN, 50, 6, [55, 57, 56]),
    zak(STERREN, 60, 9, [70, 68, 69]),
    zak(STERREN, 70, 3, [74, 73, 72]),
    zak(STERREN, 40, 8, [48, 47, 49]),
    zak(STERREN, 90, 6, [95, 97, 96]),
  ],
  eind: "Je kunt verder tellen vanaf een tiental.",
});

/* =====================================================================
   Telrij (10977) — slepen naar de lege plek
   ===================================================================== */

type Rijvraag = { opgave: Rijopgave; goed: number };
type Rijstand = { huidig: string; fout: number; hand: boolean };

/** Huisnummers staan wit op een donker bordje. */
const w = (n: number) => `{${n}:wit}`;
/** Een getal op een kaartje, in de kleur van dat kaartje. */
const kc = (n: number) => `{${n}:${kaartKleur(n)}}`;

const na = (a: number, losse: number[]): Omit<Rijvraag, "opgave"> & { opgave: Omit<Rijopgave, "id"> } => ({ opgave: { soort: "na", rij: [a, a + 1], losse }, goed: a + 2 });
const voor = (a: number, losse: number[]): Omit<Rijvraag, "opgave"> & { opgave: Omit<Rijopgave, "id"> } => ({ opgave: { soort: "voor", rij: [a, a + 1, a + 2], losse }, goed: a - 1 });

const zetRij = (l: Lesgids, p: Partial<TelrijProps>) => l.pasVlakAan<TelrijProps>(p);

function rijVraag(l: Lesgids, v: Rijvraag, st: Rijstand) {
  const o = v.opgave;
  const isNa = o.soort === "na";
  const ijk = isNa ? o.rij[o.rij.length - 1] : o.rij[0];
  const noem = isNa ? w : kc;
  const kern = isNa
    ? v.goed % 10 === 0 ? `Na ${w(ijk)} is het tiental vol, dus nu begint ${w(v.goed)}.` : `${w(ijk)} plus 1 is ${w(v.goed)}. Dat huis komt erna.`
    : `Terug is het 1 minder dan ${kc(ijk)}: dat is ${kc(v.goed)}.`;
  const omgedraaid = (n: number) => Number([...String(n)].reverse().join(""));
  const tiental = isNa ? v.goed % 10 === 0 : false;
  const tipRij = isNa
    ? tiental ? [`Na ${w(ijk)} is dit tiental vol. Er begint een nieuw tiental.`] : [`Je staat bij ${w(ijk)}. Tel 1 verder.`]
    : [`Je staat bij ${kc(ijk)}. Tel 1 terug.`];
  const reactie = (x: number): string[] => {
    let zin: string;
    if (o.rij.includes(x)) zin = `${isNa ? "Het huis" : "Het kaartje"} met ${noem(x)} staat er al.`;
    else if (x > 9 && x % 11 !== 0 && omgedraaid(x) === v.goed) zin = `Je koos ${noem(x)}. Staan de cijfers wel in de goede volgorde?`;
    else if (x === (isNa ? v.goed + 1 : v.goed - 1)) zin = isNa ? `${w(x)} is 1 huis te ver.` : `${kc(x)} is 1 kaartje te ver terug.`;
    else if (isNa) zin = x < ijk ? `${w(x)} is kleiner dan ${w(ijk)}, maar er hoort een groter nummer.` : `Zo ver als ${w(x)} is het volgende huis niet.`;
    else zin = x > ijk ? `${kc(x)} is groter dan ${kc(ijk)}, maar er hoort een kleiner getal.` : `Zo ver terug als ${kc(x)} hoef je niet.`;
    return [zin, ...tipRij];
  };
  return squlaVraag<number>(l, {
    synthesis: true,
    reactie,
    toonAntwoord: async () => {
      zetRij(l, { ingevuld: v.goed, licht: null, fout: null });
      await l.zeg(kern);
      await l.wacht(500);
    },
    toon: () => {
      if (st.huidig === o.id) return;
      st.huidig = o.id;
      zetRij(l, { opgave: o, actief: false, licht: null, ingevuld: null, fout: null, hand: false });
      speelLesgeluid("verschijn");
    },
    vraag: isNa ? [`Welk huisnummer komt na ${w(ijk)}?`, "Sleep het goede huis naar de lege plek."] : [`Welk getal komt voor ${kc(ijk)}?`, "Sleep het goede kaartje naar de lege plek."],
    antwoord: async () => {
      zetRij(l, { actief: true, hand: !st.hand });
      st.hand = true;
      const g = await l.wachtOpVlak<{ soort: string; n: number }>("gelegd");
      zetRij(l, { actief: false, hand: false });
      return g.n;
    },
    isGoed: (x) => x === v.goed,
    noem,
    goed: async () => {
      zetRij(l, { ingevuld: v.goed, licht: null });
      await l.zeg(bevestig());
      await l.wacht(500);
    },
    fout: (x) => zetRij(l, { fout: { n: x, keer: ++st.fout } }),
    samen: async () => {
      if (isNa) {
        await l.zeg("Ik loop langs de huizen tot aan de lege plek.");
        for (let i = 0; i < o.rij.length; i++) {
          zetRij(l, { licht: i });
          await l.zeg(`${w(o.rij[i])}.`);
        }
        zetRij(l, { licht: o.rij.length });
        await l.zeg(v.goed % 10 === 0 ? `Na ${w(ijk)} is het tiental vol en begint een nieuw tiental.` : `Het volgende huis na ${w(ijk)} is 1 verder.`);
      } else {
        await l.zeg("Ik tel terug, kaartje voor kaartje, tot aan de lege plek.");
        for (let i = o.rij.length - 1; i >= 0; i--) {
          zetRij(l, { licht: i + 1 });
          await l.zeg(`${kc(o.rij[i])}.`);
        }
        zetRij(l, { licht: 0 });
        await l.zeg(`Het kaartje voor ${kc(ijk)} is 1 minder.`);
      }
      zetRij(l, { licht: null });
    },
    tip: tipRij,
    testAntwoord: v.goed,
  });
}

type Rijles = {
  id: string;
  titel: string;
  level: number;
  welkom: string[];
  uitleg: (l: Lesgids) => Promise<void>;
  vragen: ReturnType<typeof na>[];
  eind: string;
};

/** Een voorbeeldrij zonder losse; `ingevuld` zet het goede getal op de lege plek. */
async function loopVoorbeeld(l: Lesgids, o: Rijopgave, goed: number, zinnen: string[]) {
  zetRij(l, { opgave: o, licht: null, ingevuld: null, actief: false, fout: null, hand: false });
  await l.wacht(500);
  const isNa = o.soort === "na";
  const volgorde = isNa ? o.rij.map((_, i) => i) : o.rij.map((_, i) => o.rij.length - 1 - i);
  for (const i of volgorde) {
    zetRij(l, { licht: isNa ? i : i + 1 });
    await l.zeg(`${isNa ? w(o.rij[i]) : kc(o.rij[i])}.`);
  }
  zetRij(l, { licht: null });
  await l.zeg(zinnen[0]);
  speelLesgeluid("goed");
  zetRij(l, { ingevuld: goed });
  await l.zeg(...zinnen.slice(1));
  await l.wacht(400);
}

function rijles(t: Rijles): Lesdraaiboek {
  return {
    nacht: true,
    id: t.id,
    titel: t.titel,
    synthesis: `Squla groep 3 · Tellen · Telrij · level ${t.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    kaarttekening: KaartTelrij,
    voorwerpen: ["huis"],
    async speel(l) {
      zetSynthesisHulp(l);
      const st: Rijstand = { huidig: "", fout: 0, hand: false };
      /* Alle huisnummers en kaartjes van de les (die worden vooruit gemaakt). */
      const getallen = (s: "na" | "voor") => [...new Set(t.vragen.filter((v) => v.opgave.soort === s).flatMap((v) => [...v.opgave.rij, ...v.opgave.losse]))];
      l.vlak<TelrijProps>(SqulaTelrij, { opgave: { id: "welkom", soort: "na", rij: [41, 42], losse: [] }, voorraad: { huizen: getallen("na"), kaarten: getallen("voor") } });
      speelLesgeluid("verschijn");
      const voorbeeldAfgerond = await squlaBegin(l, {
        welkom: t.welkom,
        /* Bij "Nee" eerst voordoen (Bliepo loopt langs de huizen), dan het kind een stap laten doen (BOUWREGELS 4.4; Sara 6 november 2026). */
        voordoen: true,
        samen: () => rijVraag(l, { goed: t.vragen[0].goed, opgave: { ...t.vragen[0].opgave, id: `${t.id}-uitleg` } }, st),
        uitleg: async () => {
          /* De uitleg zet zijn eigen huizen neer: de eerste vraag moet daarna zijn beeld weer opnieuw tekenen. */
          st.huidig = "";
          await t.uitleg(l);
        },
        /* Het beginscherm laat de eerste vraag van de les zien (BOUWREGELS 4.1). */
        voorbeeld: () => {
          st.huidig = `${t.id}-1`;
          zetRij(l, { opgave: { ...t.vragen[0].opgave, id: st.huidig }, actief: false, licht: null, ingevuld: null, fout: null, hand: false });
        },
      });
      /* Na het voorbeeld tekent de eerste vraag zijn beeld zelf weer opnieuw. */
      st.huidig = "";
      let fouten = 0;
      let nr = 0;
      for (const v of t.vragen) {
        nr++;
        if (voorbeeldAfgerond && nr === 1) continue;
        const vraag: Rijvraag = { goed: v.goed, opgave: { ...v.opgave, id: `${t.id}-${nr}` } };
        if (!(await rijVraag(l, vraag, st))) fouten++;
      }
      await squlaEind(l, fouten, t.eind);
    },
  };
}

const telrij1 = rijles({
  id: "squla-tellen-telrij-1",
  titel: "De telrij",
  level: 1,
  welkom: ["De huizen in de straat staan op volgorde.", `Welk huisnummer komt na ${w(34)}?`],
  uitleg: async (l) => {
    await loopVoorbeeld(l, { id: "uitleg-1", soort: "na", rij: [41, 42], losse: [] }, 43, ["Elk huis is 1 verder.", `Dus na ${w(42)} komt ${w(43)}.`]);
    await loopVoorbeeld(l, { id: "uitleg-2", soort: "na", rij: [28, 29], losse: [] }, 30, [`Na ${w(29)} begint een nieuw tiental.`, `Dan komt ${w(30)}.`]);
  },
  /* Level 1: wat komt erna? 18 t/m 50, vaak over een tiental; afleiders: het getal ervoor, 2 verder, een tiental ernaast, omgedraaide cijfers. */
  vragen: [
    na(33, [32, 35, 43]),
    na(41, [44, 43, 40]),
    na(26, [28, 29, 25]),
    na(36, [38, 35, 47]),
    na(28, [30, 40, 27]),
    na(18, [21, 17, 20]),
    na(38, [41, 40, 30]),
    na(43, [45, 42, 34]),
    na(39, [14, 41, 38]),
    na(22, [25, 42, 24]),
    na(47, [49, 46, 50]),
    na(29, [13, 32, 31]),
    na(19, [12, 21, 18]),
    na(45, [47, 44, 36]),
    na(48, [40, 47, 50]),
  ],
  eind: "Je weet welk nummer erna komt.",
});

const telrij2 = rijles({
  id: "squla-tellen-telrij-2",
  titel: "De telrij (moeilijker)",
  level: 2,
  welkom: ["Nu tellen we verder, tot {100:wit}.", `Welk huisnummer komt na ${w(69)}?`],
  uitleg: async (l) => {
    await loopVoorbeeld(l, { id: "uitleg-1", soort: "na", rij: [78, 79], losse: [] }, 80, [`Na ${w(79)} begint een nieuw tiental.`, `Dan komt ${w(80)}.`]);
    await l.zeg("We kunnen ook terugtellen.");
    await loopVoorbeeld(l, { id: "uitleg-2", soort: "voor", rij: [13, 14, 15], losse: [] }, 12, ["Terug wordt het steeds 1 minder.", `Dus voor ${kc(13)} komt ${kc(12)}.`]);
  },
  /* Level 2: eerst wat komt erna (58 t/m 100, over een tiental), dan wat komt ervoor (10 t/m 17, met kaartjes). */
  vragen: [
    na(68, [71, 67, 70]),
    na(86, [98, 88, 89]),
    na(88, [80, 91, 90]),
    na(69, [71, 72, 80]),
    na(98, [99, 90, 100]),
    na(78, [70, 80, 81]),
    na(59, [61, 16, 62]),
    na(96, [89, 98, 99]),
    voor(15, [12, 14, 13]),
    voor(12, [12, 11, 10]),
    voor(17, [15, 17, 16]),
    voor(11, [10, 12, 11]),
    voor(16, [17, 15, 14]),
    voor(14, [15, 13, 12]),
    voor(18, [18, 16, 17]),
  ],
  eind: "Je kunt verder tellen en terugtellen.",
});

/* Proef (31 oktober 2026, Sara): Fruit tellen met echte plaatjes uit Magnific, in twee stijlen. */
const PROEF_FRUIT = { appel: "/proef-plaatjes/appel.png", peer: "/proef-plaatjes/peer.png", pruim: "/proef-plaatjes/pruim.png" };
const proefGlow = telles({
  ...FRUIT1,
  id: "proef-fruit-glow",
  welkom: ["Kijk eens naar al dat fruit!", "Hoeveel stuks zie je?"],
  zonderVoorbeeld: true,
  titel: "Proef: Fruit tellen (glow in the dark)",
  foto: { gloed: "altijd", plaatjes: PROEF_FRUIT },
});
const proefPlat = telles({
  ...FRUIT1,
  id: "proef-fruit-plat",
  welkom: ["Kijk eens naar al dat fruit!", "Hoeveel stuks zie je?"],
  zonderVoorbeeld: true,
  titel: "Proef: Fruit tellen (zonder glow)",
  foto: { gloed: "nooit", plaatjes: PROEF_FRUIT },
});
const proefMoment = telles({
  ...FRUIT1,
  id: "proef-fruit-moment",
  welkom: ["Kijk eens naar al dat fruit!", "Hoeveel stuks zie je?"],
  zonderVoorbeeld: true,
  titel: "Proef: Fruit tellen (gloed alleen als het iets betekent)",
  foto: { gloed: "moment", plaatjes: PROEF_FRUIT },
});

export const LESSEN_SQULA_TELLEN: Lesdraaiboek[] = [
  proefGlow,
  proefPlat,
  proefMoment,
  fruit1,
  fruit2,
  fruit3,
  res1a,
  res1b,
  res1c,
  res2a,
  res2b,
  res2c,
  res3a,
  res3b,
  res3c,
  res3d,
  telrij1,
  telrij2,
];
