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
 * De hulp is de vaste hulp van Bliepo (squla-hulp.ts). Squla zegt bij tellen
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
import {
  KaartTellen,
  SqulaTelVlak,
  type Kleurnaam,
  type Memorykaartjes,
  type Plaatje,
  type Soort,
  type TelVlakProps,
  type Telopgave,
  type Telvorm,
} from "../vlakken/squla-tellen-holo";
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
  auto: ["auto", "auto's"],
  huisje: ["huisje", "huisjes"],
  raket: ["raket", "raketten"],
  bootje: ["bootje", "bootjes"],
  bal: ["bal", "ballen"],
  blok: ["blok", "blokken"],
  visje: ["visje", "visjes"],
  kwal: ["kwal", "kwallen"],
  schildpad: ["schildpad", "schildpadden"],
  vogel: ["vogel", "vogels"],
  vlinder: ["vlinder", "vlinders"],
  monster: ["monster", "monsters"],
  spookje: ["spookje", "spookjes"],
  knikker: ["knikker", "knikkers"],
  ster: ["ster", "sterren"],
};

/* Het-woorden: "elk monster", "elk los blok". */
const HET = new Set<Soort>(["monster", "spookje", "visje", "huisje", "bootje", "blok"]);
/** "elke appel", "elk monster". */
const elke = (v: Voorwerp) => `${v.het ? "elk" : "elke"} ${v.een}`;
const hoofd = (z: string) => z[0].toUpperCase() + z.slice(1);
/** "elke losse knikker", "elk los blok". */
const elkeLosse = (v: Voorwerp) => `${v.het ? "elk los" : "elke losse"} ${v.een}`;

/** Eén soort in één kleur. */
function een(soort: Soort, kleur: Kleurnaam): Voorwerp {
  return { naam: ENKEL[soort][1], een: ENKEL[soort][0], het: HET.has(soort), plaatjes: [{ soort, kleur }], kleur };
}
/** Eén soort, de rijen om en om in twee kleuren. */
function tweeKleuren(soort: Soort, a: Kleurnaam, b: Kleurnaam): Voorwerp {
  return { naam: ENKEL[soort][1], een: ENKEL[soort][0], het: HET.has(soort), plaatjes: [{ soort, kleur: a }, { soort, kleur: b }], kleur: "wit" };
}
/** Twee soorten, de rijen om en om. */
function tweeSoorten(a: Soort, ka: Kleurnaam, b: Soort, kb: Kleurnaam, naam: string): Voorwerp {
  return { naam, een: ENKEL[a][0], het: HET.has(a), plaatjes: [{ soort: a, kleur: ka }, { soort: b, kleur: kb }], kleur: "wit" };
}

/* Fruit */
const APPELS = een("appel", "rood");
const PEREN = een("peer", "groen");
const PRUIMEN = een("pruim", "paars");
const CITROENEN = een("citroen", "geel");
const AARDBEIEN = een("aardbei", "rood");
const BANANEN = een("banaan", "geel");

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
    await l.zeg("We tellen samen.", `In de zak zitten ${gk(z, k)} ${v.voorwerp.naam}.`, `${hoofd(elkeLosse(v.voorwerp))} is er één meer.`);
    zetTel(l, { zakLicht: false });
    if (tot > 0) {
      await telMee(l, v, 0, tot);
      await l.zeg(`${gk(z + tot, k)}.`);
    }
    await l.zeg(`Tel jij verder vanaf ${gk(z + tot, k)}?`);
    return;
  }
  if (v.vorm === "rijen5" || v.vorm === "rijen10") {
    const per = v.vorm === "rijen5" ? 5 : 10;
    await l.zeg("We tellen samen.", `In elke rij staan er ${gk(per, k)}.`);
    for (let t = per; t <= tot; t += per) {
      await telMee(l, v, t - per, t);
      await l.zeg(`${gk(t, k)}.`);
    }
    await l.zeg(`Tel jij verder vanaf ${gk(tot, k)}?`);
    return;
  }
  await l.zeg("We tellen samen.", `Bij ${elke(v.voorwerp)} zet ik een streepje.`);
  if (tot < 5) {
    await telMee(l, v, 0, tot);
    await l.zeg(`${Array.from({ length: tot }, (_, i) => gk(i + 1, k)).join(", ")}.`);
  } else
    for (let t = 5; t <= tot; t += 5) {
      await telMee(l, v, t - 5, t);
      await l.zeg(`${gk(t, k)}.`);
    }
  await l.zeg(`Tel jij verder vanaf ${gk(tot, k)}?`);
}

/** Eén telvraag met de vaste hulp van Bliepo. */
function telVraag(l: Lesgids, id: string, v: Telvraag, st: Stand) {
  const k = v.voorwerp.kleur;
  const goed = antwoordVan(v);
  return squlaVraag<number>(l, {
    toon: () => {
      if (st.huidig === id) return;
      st.huidig = id;
      zetTel(l, { opgave: opgaveVan(id, v), geteld: 0, zakLicht: false, memory: null });
      speelLesgeluid("verschijn");
    },
    vraag: [v.vorm === "zak" ? `Hoeveel ${v.voorwerp.naam} zijn het samen?` : `Hoeveel ${v.voorwerp.naam} zie je?`],
    antwoord: async () => Number(await l.kies(v.keuzes.map(String), { weetniet: false, direct: true })),
    isGoed: (x) => x === goed,
    noem: (x) => gk(x, k),
    goed: async () => {
      zetTel(l, { goed: ++st.goed });
      if (v.vorm === "zak") await l.zeg(`Ja! ${gk(v.zak ?? 0, k)} en nog ${gk(v.n, k)} is ${gk(goed, k)}.`);
      else await l.zeg(`Ja! Het zijn er ${gk(goed, k)}.`);
      await l.wacht(400);
    },
    fout: () => zetTel(l, { fout: ++st.fout }),
    samen: () => samenTellen(l, v),
    tip:
      v.vorm === "zak"
        ? [`Begin bij ${gk((v.zak ?? 0) + bliepoTelt(v), k)}.`, `Tel de losse ${v.voorwerp.naam} erbij.`]
        : [`Begin bij ${gk(bliepoTelt(v), k)}.`, "Tel de rest één voor één."],
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
    await l.zeg(`In de zak zitten ${gk(z, k)} ${v.voorwerp.naam}.`, `${hoofd(elkeLosse(v.voorwerp))} is er één meer.`);
    zetTel(l, { zakLicht: false });
    await telMee(l, v, 0, v.n);
    await l.zeg(reeks(z, z + v.n), `Samen zijn het er ${gk(z + v.n, k)}.`);
  } else if (v.vorm === "verspreid") {
    await l.zeg("Ze staan door elkaar.", `Bij ${elke(v.voorwerp)} zet ik een streepje.`);
    await telMee(l, v, 0, 5);
    await l.zeg(reeks(0, 5), "Vijf streepjes zijn een groepje.");
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

/* ---------- memory (tussendoortje bij Resultatief tellen 3) ---------- */

async function memory(l: Lesgids, m: Memorykaartjes, st: Stand) {
  st.huidig = "";
  zetTel(l, { opgave: null, geteld: 0, zakLicht: false, memory: m });
  speelLesgeluid("verschijn");
  await l.zeg("Even een spelletje tussendoor!", "Kijk goed waar de plaatjes staan.");
  await l.zeg("Zoek steeds twee dezelfde.", "Tik op twee kaartjes.");
  await l.wachtOpVlak("memoryKlaar");
  zetTel(l, { memory: null });
  await l.zeg("Goed gedaan!", "Je hebt ze allemaal gevonden.", "We gaan weer tellen.");
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
};

function telles(t: Telles): Lesdraaiboek {
  return {
    id: t.id,
    titel: t.titel,
    synthesis: `Squla groep 3 · Tellen · ${t.oefening} · level ${t.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    kaarttekening: KaartTellen,
    async speel(l) {
      const st: Stand = { huidig: "", goed: 0, fout: 0 };
      const eerste = t.uitleg[0];
      st.huidig = `uitleg-${eerste.vorm}`;
      /* Alle plaatjes van de les, één keer (die worden vooruit gebakken). */
      const alle = new Map<string, Plaatje>();
      for (const v of [...t.uitleg, ...t.vragen]) if (v !== "memory") for (const p of v.voorwerp.plaatjes) alle.set(`${p.soort}-${p.kleur}`, p);
      for (const p of t.memory?.paren ?? []) alle.set(`${p.soort}-${p.kleur}`, p);
      const zakken = [...new Set([...t.uitleg, ...t.vragen].flatMap((v) => (v !== "memory" && v.zak ? [v.zak] : [])))];
      l.vlak<TelVlakProps>(SqulaTelVlak, { opgave: opgaveVan(st.huidig, eerste), geteld: 0, voorraad: { plaatjes: [...alle.values()], zakken } });
      speelLesgeluid("verschijn");
      await squlaBegin(l, {
        welkom: t.welkom,
        uitleg: async () => {
          for (const v of t.uitleg) await uitlegTellen(l, v, st);
        },
      });
      let fouten = 0;
      let nr = 0;
      for (const v of t.vragen) {
        if (v === "memory") {
          if (t.memory) await memory(l, t.memory, st);
          continue;
        }
        nr++;
        if (!(await telVraag(l, `${t.id}-${nr}`, v, st))) fouten++;
      }
      await squlaEind(l, fouten, t.eind);
    },
  };
}

/* =====================================================================
   Tellen met fruit (15682) — rijen van 5, kiezen uit 3 opeenvolgende getallen
   ===================================================================== */

const FRUIT_WELKOM = ["Hoi!", "Kijk eens, allemaal fruit.", "Hoeveel zijn het er?", "Tel goed en kies het getal."];

const fruit1 = telles({
  id: "squla-tellen-fruit-1",
  titel: "Fruit tellen",
  oefening: "Tellen met fruit",
  level: 1,
  welkom: FRUIT_WELKOM,
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
});

const fruit2 = telles({
  id: "squla-tellen-fruit-2",
  titel: "Fruit tellen (moeilijker)",
  oefening: "Tellen met fruit",
  level: 2,
  welkom: FRUIT_WELKOM,
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
  welkom: ["Hoi!", "Kijk eens, allemaal fruit.", "Nu ligt het door elkaar.", "Tel goed en kies het getal."],
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

const AUTOS_RB = tweeKleuren("auto", "rood", "blauw");
const AUTOS_RG = tweeKleuren("auto", "roze", "geel");
const HUISJES = tweeKleuren("huisje", "oranje", "groen");
const RAKETTEN = tweeKleuren("raket", "paars", "geel");
const BALLEN_BLOKKEN = tweeSoorten("bal", "rood", "blok", "blauw", "ballen en blokken");
const BOOTJES = tweeKleuren("bootje", "oranje", "blauw");

const RES1_WELKOM = ["Hoi!", "We gaan tellen hoeveel het er zijn.", "De rijen hebben om de beurt een andere kleur.", "Dat helpt bij het tellen."];

const res1a = telles({
  id: "squla-tellen-resultatief1-1",
  titel: "Tellen in rijtjes",
  oefening: "Resultatief tellen 1",
  level: 1,
  welkom: RES1_WELKOM,
  uitleg: [rij5(AUTOS_RB, 8, [])],
  /* Level 1: 11 t/m 17, rijen van 5 om en om in een andere kleur; de keuzes niet op volgorde. */
  vragen: [
    rij5(AUTOS_RB, 13, [14, 13, 12]),
    rij5(HUISJES, 12, [12, 14, 13]),
    rij5(RAKETTEN, 15, [16, 15, 14]),
    rij5(AUTOS_RG, 11, [10, 12, 11]),
    rij5(HUISJES, 16, [17, 15, 16]),
    rij5(RAKETTEN, 14, [15, 14, 12]),
    rij5(AUTOS_RB, 17, [16, 17, 15]),
    rij5(HUISJES, 13, [13, 15, 14]),
    rij5(RAKETTEN, 16, [16, 10, 15]),
    rij5(AUTOS_RG, 15, [14, 16, 15]),
    rij5(HUISJES, 14, [12, 14, 13]),
    rij5(RAKETTEN, 12, [13, 11, 12]),
    rij5(AUTOS_RB, 16, [15, 17, 16]),
    rij5(HUISJES, 17, [17, 15, 16]),
    rij5(RAKETTEN, 11, [12, 11, 13]),
  ],
  eind: "Je kunt tellen in rijtjes.",
});

const res1b = telles({
  id: "squla-tellen-resultatief1-2",
  titel: "Tellen in rijtjes (moeilijker)",
  oefening: "Resultatief tellen 1",
  level: 2,
  welkom: ["Hoi!", "We gaan weer tellen.", "Nu tot {20}."],
  uitleg: [rij5(BOOTJES, 8, [])],
  /* Level 2: 11 t/m 20, rijen van 5; twee reeksen om de beurt, elk oplopend; de keuzes op volgorde. */
  vragen: [
    rij5(BALLEN_BLOKKEN, 11, [11, 12, 13]),
    rij5(BOOTJES, 14, [14, 15, 16]),
    rij5(BALLEN_BLOKKEN, 12, [11, 12, 13]),
    rij5(BOOTJES, 15, [13, 14, 15]),
    rij5(BALLEN_BLOKKEN, 13, [13, 14, 15]),
    rij5(BOOTJES, 16, [16, 17, 18]),
    rij5(BALLEN_BLOKKEN, 14, [12, 13, 14]),
    rij5(BOOTJES, 17, [15, 16, 17]),
    rij5(BALLEN_BLOKKEN, 15, [14, 15, 16]),
    rij5(BOOTJES, 18, [18, 19, 20]),
    rij5(BALLEN_BLOKKEN, 16, [15, 16, 17]),
    rij5(BOOTJES, 19, [17, 18, 19]),
    rij5(BALLEN_BLOKKEN, 17, [17, 18, 19]),
    rij5(BOOTJES, 20, [18, 19, 20]),
    rij5(BALLEN_BLOKKEN, 18, [16, 17, 18]),
  ],
  eind: "Je kunt tellen tot {20}.",
});

const res1c = telles({
  id: "squla-tellen-resultatief1-3",
  titel: "Tellen in rijtjes (nog moeilijker)",
  oefening: "Resultatief tellen 1",
  level: 3,
  welkom: ["Hoi!", "Nu staat alles door elkaar.", "Er zijn geen rijtjes meer.", "Onthoud goed wat je al geteld hebt."],
  uitleg: [los(een("schildpad", "groen"), 8, [])],
  /* Level 3: 11 t/m 20, los door elkaar, één kleur; elke vraag een ander voorwerp of dier. */
  vragen: [
    los(een("schildpad", "groen"), 14, [14, 15, 16]),
    los(een("auto", "blauw"), 13, [11, 12, 13]),
    los(een("huisje", "rood"), 11, [11, 12, 13]),
    los(een("raket", "paars"), 15, [14, 15, 16]),
    los(een("visje", "oranje"), 12, [10, 11, 12]),
    los(een("kwal", "roze"), 18, [17, 18, 19]),
    los(een("vogel", "geel"), 19, [17, 18, 19]),
    los(een("vlinder", "blauw"), 20, [18, 19, 20]),
    los(een("bootje", "rood"), 17, [17, 18, 19]),
    los(een("monster", "groen"), 16, [15, 16, 17]),
    los(een("bal", "oranje"), 13, [12, 13, 14]),
    los(een("spookje", "paars"), 18, [16, 17, 18]),
    los(een("ster", "geel"), 15, [15, 16, 17]),
    los(een("knikker", "blauw"), 19, [18, 19, 20]),
    los(een("blok", "rood"), 12, [11, 12, 13]),
  ],
  eind: "Je telt goed, ook als alles door elkaar staat.",
});

/* =====================================================================
   Resultatief tellen 2 (10968)
   ===================================================================== */

const VISJES = een("visje", "oranje");
const SCHILDPADDEN = een("schildpad", "groen");
const VOGELS = een("vogel", "geel");
const KWALLEN = een("kwal", "roze");
const VLINDERS = een("vlinder", "blauw");
const RAKETTEN_PAARS = een("raket", "paars");

const res2a = telles({
  id: "squla-tellen-resultatief2-1",
  titel: "Hoeveel zie je?",
  oefening: "Resultatief tellen 2",
  level: 1,
  welkom: ["Hoi!", "Kijk, allemaal dieren.", "Hoeveel zijn het er?", "Tel goed en kies het getal."],
  uitleg: [rij5(VISJES, 8, [])],
  /* Level 1: 11 t/m 15, rijen van 5, één dier in één kleur; de keuzes op volgorde. */
  vragen: [
    rij5(VISJES, 13, [12, 13, 14]),
    rij5(SCHILDPADDEN, 12, [12, 13, 14]),
    rij5(VOGELS, 14, [13, 14, 15]),
    rij5(KWALLEN, 11, [11, 12, 13]),
    rij5(VLINDERS, 15, [13, 14, 15]),
    rij5(VISJES, 12, [11, 12, 13]),
    rij5(SCHILDPADDEN, 14, [12, 13, 14]),
    rij5(VOGELS, 13, [13, 14, 15]),
    rij5(KWALLEN, 15, [14, 15, 16]),
    rij5(VLINDERS, 11, [10, 11, 12]),
    rij5(VISJES, 14, [14, 15, 16]),
    rij5(SCHILDPADDEN, 15, [13, 14, 15]),
    rij5(VOGELS, 11, [11, 12, 13]),
    rij5(KWALLEN, 13, [11, 12, 13]),
    rij5(VLINDERS, 12, [12, 13, 14]),
  ],
  eind: "Je kunt dieren tellen.",
});

const res2b = telles({
  id: "squla-tellen-resultatief2-2",
  titel: "Hoeveel zie je? (moeilijker)",
  oefening: "Resultatief tellen 2",
  level: 2,
  welkom: ["Hoi!", "Nu gaan we verder tellen.", "Er komen meer rijen bij."],
  uitleg: [rij5(AUTOS_RB, 8, [])],
  /* Level 2: 16 t/m 20, rijen van 5, vaak om en om een andere kleur; de keuzes op volgorde. */
  vragen: [
    rij5(AUTOS_RB, 17, [16, 17, 18]),
    rij5(HUISJES, 16, [16, 17, 18]),
    rij5(RAKETTEN_PAARS, 18, [17, 18, 19]),
    rij5(BALLEN_BLOKKEN, 17, [15, 16, 17]),
    rij5(AUTOS_RG, 19, [18, 19, 20]),
    rij5(BOOTJES, 16, [14, 15, 16]),
    rij5(HUISJES, 20, [18, 19, 20]),
    rij5(RAKETTEN_PAARS, 19, [17, 18, 19]),
    rij5(AUTOS_RB, 18, [16, 17, 18]),
    rij5(BALLEN_BLOKKEN, 20, [18, 19, 20]),
    rij5(BOOTJES, 17, [17, 18, 19]),
    rij5(HUISJES, 18, [18, 19, 20]),
    rij5(AUTOS_RG, 16, [16, 17, 18]),
    rij5(RAKETTEN_PAARS, 20, [18, 19, 20]),
    rij5(BOOTJES, 19, [17, 18, 19]),
  ],
  eind: "Je kunt tellen tot {20}.",
});

const res2c = telles({
  id: "squla-tellen-resultatief2-3",
  titel: "Hoeveel zie je? (nog moeilijker)",
  oefening: "Resultatief tellen 2",
  level: 3,
  welkom: ["Hoi!", "Soms staat alles door elkaar.", "Soms staat het in rijen.", "Kijk goed hoe je het beste telt."],
  uitleg: [los(een("monster", "paars"), 8, []), rij5(AUTOS_RB, 8, [])],
  /* Level 3: om en om weinig monsters los door elkaar (5 t/m 13) en veel in rijen van 5 (16 t/m 20). */
  vragen: [
    los(een("monster", "paars"), 7, [6, 7, 8]),
    rij5(AUTOS_RB, 17, [16, 17, 18]),
    los(een("monster", "paars"), 9, [7, 8, 9]),
    rij5(BALLEN_BLOKKEN, 16, [16, 17, 18]),
    los(een("monster", "oranje"), 12, [10, 12, 14]),
    rij5(HUISJES, 19, [17, 18, 19]),
    los(een("monster", "oranje"), 8, [8, 9, 10]),
    rij5(BOOTJES, 18, [18, 19, 20]),
    los(een("monster", "blauw"), 6, [5, 6, 7]),
    rij5(AUTOS_RG, 20, [18, 19, 20]),
    los(een("monster", "blauw"), 11, [10, 11, 12]),
    rij5(RAKETTEN_PAARS, 17, [17, 18, 19]),
    los(een("monster", "groen"), 13, [11, 12, 13]),
    rij5(HUISJES, 18, [16, 17, 18]),
    los(een("monster", "groen"), 5, [5, 6, 7]),
  ],
  eind: "Je telt in rijen én door elkaar.",
});

/* =====================================================================
   Resultatief tellen 3 (10969)
   ===================================================================== */

const SPOOKJES = een("spookje", "wit");

const res3a = telles({
  id: "squla-tellen-resultatief3-1",
  titel: "Grote groepen tellen",
  oefening: "Resultatief tellen 3",
  level: 1,
  welkom: ["Hoi!", "Kijk, spookjes en monsters.", "Ze staan door elkaar.", "Hoeveel zijn het er?"],
  uitleg: [los(SPOOKJES, 8, [])],
  /* Level 1: 5 t/m 20, alles los door elkaar; spookjes en monsters om de beurt; de keuzes niet op volgorde; aan het eind memory. */
  vragen: [
    los(SPOOKJES, 6, [4, 8, 6]),
    los(een("monster", "groen"), 13, [12, 14, 13]),
    los(SPOOKJES, 9, [10, 8, 9]),
    los(een("monster", "groen"), 18, [19, 17, 18]),
    los(SPOOKJES, 14, [15, 13, 14]),
    los(een("monster", "oranje"), 10, [10, 11, 9]),
    los(SPOOKJES, 19, [20, 18, 19]),
    los(een("monster", "oranje"), 15, [16, 14, 15]),
    los(SPOOKJES, 11, [11, 13, 12]),
    los(een("monster", "roze"), 20, [19, 20, 18]),
    los(SPOOKJES, 7, [8, 6, 7]),
    los(een("monster", "roze"), 16, [17, 15, 16]),
    los(SPOOKJES, 12, [13, 11, 12]),
    los(een("monster", "paars"), 17, [16, 18, 17]),
    los(SPOOKJES, 5, [7, 5, 6]),
    "memory",
  ],
  memory: {
    id: "squla-tellen-resultatief3-1-memory",
    paren: (["rood", "oranje", "groen", "blauw", "paars"] as Kleurnaam[]).map((kleur) => ({ soort: "monster" as Soort, kleur })),
  },
  eind: "Je kunt grote groepen tellen.",
});

const res3b = telles({
  id: "squla-tellen-resultatief3-2",
  titel: "Grote groepen tellen (moeilijker)",
  oefening: "Resultatief tellen 3",
  level: 2,
  welkom: ["Hoi!", "Daar zijn de spookjes en monsters weer.", "Tel goed, ze lijken op elkaar."],
  uitleg: [los(een("monster", "oranje"), 8, [])],
  /* Level 2: 7 t/m 19, alles los door elkaar; de keuzes soms ver uit elkaar; memory tussendoor. */
  vragen: [
    los(SPOOKJES, 16, [16, 14, 17]),
    los(een("monster", "oranje"), 8, [7, 9, 8]),
    los(SPOOKJES, 12, [11, 12, 13]),
    los(een("monster", "oranje"), 10, [10, 9, 11]),
    los(SPOOKJES, 9, [10, 9, 8]),
    los(een("monster", "groen"), 15, [15, 16, 14]),
    los(SPOOKJES, 17, [17, 14, 19]),
    los(een("monster", "groen"), 11, [12, 11, 10]),
    los(SPOOKJES, 14, [13, 16, 14]),
    los(een("monster", "roze"), 19, [18, 19, 17]),
    "memory",
    los(SPOOKJES, 18, [15, 18, 19]),
    los(een("monster", "roze"), 13, [13, 12, 14]),
    los(SPOOKJES, 7, [9, 7, 8]),
    los(een("monster", "paars"), 16, [17, 15, 16]),
    los(SPOOKJES, 19, [18, 16, 19]),
  ],
  memory: {
    id: "squla-tellen-resultatief3-2-memory",
    paren: (["rood", "geel", "groen", "blauw", "paars"] as Kleurnaam[]).map((kleur) => ({ soort: "spookje" as Soort, kleur })),
  },
  eind: "Je kunt grote groepen tellen.",
});

const res3c = telles({
  id: "squla-tellen-resultatief3-3",
  titel: "Grote groepen tellen (nog moeilijker)",
  oefening: "Resultatief tellen 3",
  level: 3,
  welkom: ["Hoi!", "Nu worden het er veel.", "Ze staan in rijen van {10}.", "Tel per rij, dat gaat sneller."],
  uitleg: [rij10(tweeKleuren("visje", "geel", "blauw"), 23, [])],
  /* Level 3: 22 t/m 50, rijen van 10 om en om in een andere kleur of een ander dier; de keuzes ±1, niet op volgorde. */
  vragen: [
    rij10(tweeKleuren("visje", "geel", "blauw"), 24, [23, 24, 22]),
    rij10(tweeKleuren("kwal", "roze", "paars"), 29, [29, 28, 30]),
    rij10(tweeKleuren("schildpad", "groen", "oranje"), 36, [35, 37, 36]),
    rij10(tweeKleuren("vogel", "geel", "blauw"), 47, [46, 47, 37]),
    rij10(tweeKleuren("vlinder", "paars", "oranje"), 50, [49, 50, 48]),
    rij10(tweeSoorten("visje", "oranje", "kwal", "roze", "dieren"), 32, [31, 33, 32]),
    rij10(tweeSoorten("schildpad", "groen", "vogel", "geel", "dieren"), 35, [35, 36, 34]),
    rij10(tweeSoorten("vlinder", "blauw", "visje", "geel", "dieren"), 26, [27, 25, 26]),
    rij10(tweeSoorten("kwal", "paars", "schildpad", "groen", "dieren"), 43, [42, 44, 43]),
    rij10(tweeSoorten("vogel", "rood", "vlinder", "paars", "dieren"), 48, [49, 47, 48]),
    rij10(tweeKleuren("visje", "oranje", "groen"), 39, [40, 38, 39]),
    rij10(tweeSoorten("kwal", "roze", "visje", "blauw", "dieren"), 41, [41, 40, 42]),
    rij10(tweeKleuren("schildpad", "blauw", "geel"), 28, [29, 27, 28]),
    rij10(tweeSoorten("vlinder", "oranje", "vogel", "blauw", "dieren"), 45, [46, 44, 45]),
    rij10(tweeKleuren("vogel", "rood", "blauw"), 33, [33, 32, 34]),
  ],
  eind: "Je kunt tellen tot {50}.",
});

const KNIKKERS = een("knikker", "blauw");
const STERREN = een("ster", "geel");

const res3d = telles({
  id: "squla-tellen-resultatief3-4",
  titel: "Grote groepen tellen (heel moeilijk)",
  oefening: "Resultatief tellen 3",
  level: 4,
  welkom: ["Hoi!", "Kijk, een dichte zak.", "Op de zak staat hoeveel erin zitten.", "Tel de losse erbij."],
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
  return squlaVraag<number>(l, {
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
      await l.zeg(isNa ? `Ja! Na ${w(ijk)} komt ${w(v.goed)}.` : `Ja! Voor ${kc(ijk)} komt ${kc(v.goed)}.`);
      await l.wacht(500);
    },
    fout: (x) => zetRij(l, { fout: { n: x, keer: ++st.fout } }),
    samen: async () => {
      if (isNa) {
        await l.zeg("We lopen samen langs de huizen.");
        for (let i = 0; i < o.rij.length; i++) {
          zetRij(l, { licht: i });
          await l.zeg(`${w(o.rij[i])}.`);
        }
        zetRij(l, { licht: o.rij.length });
        await l.zeg(v.goed % 10 === 0 ? `Na ${w(ijk)} begint een nieuw tiental.` : "Elk huis is één verder.");
      } else {
        await l.zeg("We tellen samen terug.");
        for (let i = o.rij.length - 1; i >= 0; i--) {
          zetRij(l, { licht: i + 1 });
          await l.zeg(`${kc(o.rij[i])}.`);
        }
        zetRij(l, { licht: 0 });
        await l.zeg("Terug wordt het steeds één minder.");
      }
      zetRij(l, { licht: null });
    },
    tip: isNa ? [`Tel één verder dan ${w(ijk)}.`] : [`Tel één terug vanaf ${kc(ijk)}.`],
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
    async speel(l) {
      const st: Rijstand = { huidig: "", fout: 0, hand: false };
      /* Alle huisnummers en kaartjes van de les (die worden vooruit gemaakt). */
      const getallen = (s: "na" | "voor") => [...new Set(t.vragen.filter((v) => v.opgave.soort === s).flatMap((v) => [...v.opgave.rij, ...v.opgave.losse]))];
      l.vlak<TelrijProps>(SqulaTelrij, { opgave: { id: "welkom", soort: "na", rij: [41, 42], losse: [] }, voorraad: { huizen: getallen("na"), kaarten: getallen("voor") } });
      speelLesgeluid("verschijn");
      await squlaBegin(l, { welkom: t.welkom, uitleg: () => t.uitleg(l) });
      let fouten = 0;
      let nr = 0;
      for (const v of t.vragen) {
        nr++;
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
  welkom: ["Hoi!", "Kijk, een straat met huizen.", "De huisnummers staan op volgorde.", "Welk nummer komt erna?"],
  uitleg: async (l) => {
    await loopVoorbeeld(l, { id: "uitleg-1", soort: "na", rij: [41, 42], losse: [] }, 43, ["Elk huis is één verder.", `Dus na ${w(42)} komt ${w(43)}.`]);
    await loopVoorbeeld(l, { id: "uitleg-2", soort: "na", rij: [28, 29], losse: [] }, 30, [`Na ${w(29)} begint een nieuw tiental.`, `Dan komt ${w(30)}.`]);
  },
  /* Level 1: wat komt erna? 18 t/m 50, vaak over een tiental; afleiders: het getal ervoor, 2 verder, een tiental ernaast, omgedraaide cijfers. */
  vragen: [
    na(33, [32, 35, 53]),
    na(41, [44, 43, 40]),
    na(26, [28, 29, 25]),
    na(36, [83, 38, 35]),
    na(28, [30, 40, 27]),
    na(18, [21, 17, 20]),
    na(38, [41, 40, 30]),
    na(43, [54, 45, 42]),
    na(39, [14, 41, 38]),
    na(22, [25, 42, 24]),
    na(47, [49, 46, 50]),
    na(29, [13, 32, 31]),
    na(19, [12, 21, 18]),
    na(45, [74, 47, 44]),
    na(48, [40, 51, 50]),
  ],
  eind: "Je weet welk nummer erna komt.",
});

const telrij2 = rijles({
  id: "squla-tellen-telrij-2",
  titel: "De telrij (moeilijker)",
  level: 2,
  welkom: ["Hoi!", "We tellen verder, tot {100:wit}.", "En daarna tellen we terug."],
  uitleg: async (l) => {
    await loopVoorbeeld(l, { id: "uitleg-1", soort: "na", rij: [78, 79], losse: [] }, 80, [`Na ${w(79)} begint een nieuw tiental.`, `Dan komt ${w(80)}.`]);
    await l.zeg("We kunnen ook terugtellen.");
    await loopVoorbeeld(l, { id: "uitleg-2", soort: "voor", rij: [13, 14, 15], losse: [] }, 12, ["Terug wordt het steeds één minder.", `Dus voor ${kc(13)} komt ${kc(12)}.`]);
  },
  /* Level 2: eerst wat komt erna (58 t/m 100, over een tiental), dan wat komt ervoor (10 t/m 17, met kaartjes). */
  vragen: [
    na(68, [71, 67, 70]),
    na(86, [98, 88, 89]),
    na(88, [80, 91, 90]),
    na(69, [71, 72, 80]),
    na(98, [101, 90, 100]),
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

export const LESSEN_SQULA_TELLEN: Lesdraaiboek[] = [
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
