/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Rekenmix 2 (squla-rekenmix-mix2-1-gouden, 12 november 2026), op één plek, met de
 * FOUTTABEL. De les zelf (squla-rekenmix2-gouden.tsx) bevat geen eigen zinnen.
 *
 * Alle 15 vragen van Rekenmix 2 level 1 (squla-rekenmix-mix2-1) zijn vergelijkvragen: "Op welke boterham zit meer kaas?"
 * (meer, minder, evenveel, de meeste, de minste; een boterham of een spiesje, zonder getal). Ze volgen de GOUDEN LES
 * MEER-MINDER (squla-meer-minder-evenveel2-1-gouden): tik op een plaatje (alleen een vinkje erop) en dan op het vinkje van
 * het lesscherm; 1e fout = eerste zin + hint, 2e fout = uitleg en samen kijken (Bliepo wijst elk plaatje aan en zegt hoeveel
 * erop zit; het kind tikt het goede plaatje); goed = lof en een korte reactie; hulphandje alleen bij samen kijken; einde
 * met slotzin en kaart. De rijtjes (lof, bevestiging, onduidelijk, einde) komen uit squla-rekenmix-gouden-zinnen.ts.
 * EIGEN INVULLING, NIET VAN SYNTHESIS: de fouttabel, de hints en de zinnen bij het samen kijken (More or Less heeft geen
 * plaatjes zonder getal).
 * Inhoud (BOUWREGELS 15.22): dezelfde 15 vragen als squla-rekenmix-mix2-1, in dezelfde volgorde, met dezelfde boterhammen
 * en spiesjes (en beleg), dezelfde volgorde van de 3 plaatjes en dezelfde vraag (meer, minder, evenveel, meeste, minste).
 * "Plaatje" wordt in de zinnen "boterham" of "spiesje" (de gouden les Meer-minder zegt "kaart").
 *
 * Leesbare versie: FOUTTABEL-squla-rekenmix-mix2-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-rekenmix2-gouden.ts`).
 */

import { AANMOEDIG_TIKKEN } from "./squla-rekenmix-gouden-zinnen";
import { beginVan, deeltStuk, maakVorm } from "./nooit-dubbel";

export {
  AANMOEDIG_TIKKEN,
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  metNaam,
  type Rijtje,
} from "./squla-rekenmix-gouden-zinnen";

/* ---------- wat er op de plaatjes staat ---------- */

export type Wat = "meer" | "minder" | "evenveel" | "meest" | "minst";
export type Beleg = "banaan" | "komkommer" | "tomaat" | "ei";
export type Soort = "boterham" | "spies";

/** De woorden bij 1 soort plaatje (zelfde woorden als de oude les: HOEVEEL en BELEG in squla-rekenmix.tsx). */
export type Woorden = {
  /** De namen van de 3 plaatjes: weinig, veel, heel veel (bestanden in public/voorwerpen). */
  namen: [string, string, string];
  ding: string;
  /** Wat erop zit: kaas, fruit, banaan … */
  wat: string;
  /** "de" of "het" voor "meeste": de meeste kaas, het meeste fruit. */
  lw: "de" | "het";
  /** Het lidwoord van het ding zelf: de boterham, het spiesje. */
  het: "de" | "het";
  elk: "elke" | "elk";
  die: "die" | "dat";
  welk: string;
  /** "deze boterham", "dit spiesje" (18 nov). */
  deze: "deze" | "dit";
  /** "ik wijs hem aan" (boterham), "ik wijs het aan" (spiesje). */
  hem: "hem" | "het";
  /** "een andere boterham", "een ander spiesje". */
  ander: "andere" | "ander";
};

const BOTERHAM = (wat: string, lw: "de" | "het", namen: Woorden["namen"]): Woorden => ({ namen, ding: "boterham", wat, lw, het: "de", elk: "elke", die: "die", welk: "welke boterham", deze: "deze", hem: "hem", ander: "andere" });
const SPIES: Woorden = { namen: ["spies-leeg", "spies-twee", "spies-vol"], ding: "spiesje", wat: "fruit", lw: "het", het: "het", elk: "elk", die: "dat", welk: "welk spiesje", deze: "dit", hem: "het", ander: "ander" };
export const woordenVan = (v: Pick<Vraag2, "soort" | "beleg">): Woorden =>
  v.soort === "spies"
    ? SPIES
    : v.beleg
      ? BOTERHAM(v.beleg, v.beleg === "ei" ? "het" : "de", [`boterham-${v.beleg}-weinig`, `boterham-${v.beleg}-veel`, `boterham-${v.beleg}-heel-veel`])
      : BOTERHAM("kaas", "de", ["boterham-weinig-kaas", "boterham-veel-kaas", "boterham-heel-veel-kaas"]);

/* ---------- de 15 vragen van squla-rekenmix-mix2-1 ---------- */

/** `keuzes`: per plaatje (van links naar rechts) hoeveel erop zit: 0 = weinig, 1 = veel, 2 = heel veel. */
export type Vraag2 = { nr: number; id: string; soort: Soort; wat: Wat; keuzes: number[]; beleg?: Beleg };
const V = (nr: number, soort: Soort, keuzes: number[], wat: Wat, beleg?: Beleg): Vraag2 => ({ nr, id: `vraag${nr}-${soort}${beleg ? "-" + beleg : ""}-${wat}`, soort, wat, keuzes, beleg });

/* Squla level 1 van Rekenmix 2 (oude les: squla-rekenmix.tsx mix2_1): meer, meeste, minder, minste, evenveel. */
export const VRAGEN: Vraag2[] = [
  V(1, "boterham", [2, 1, 0], "meer"),
  V(2, "spies", [2, 0, 1], "meest"),
  V(3, "boterham", [1, 0, 2], "minder", "banaan"),
  V(4, "spies", [2, 0, 1], "minst"),
  V(5, "boterham", [2, 1, 0], "evenveel", "komkommer"),
  V(6, "boterham", [0, 2, 1], "meer", "tomaat"),
  V(7, "boterham", [1, 2, 0], "meest", "ei"),
  V(8, "boterham", [2, 0, 1], "minder"),
  V(9, "spies", [1, 2, 0], "minst"),
  V(10, "boterham", [0, 1, 2], "evenveel", "banaan"),
  V(11, "boterham", [1, 0, 2], "meer", "komkommer"),
  V(12, "spies", [0, 1, 2], "meest"),
  V(13, "boterham", [0, 2, 1], "minder", "tomaat"),
  V(14, "boterham", [2, 1, 0], "minst", "ei"),
  V(15, "boterham", [1, 2, 0], "evenveel"),
];

/** Met een plaatje bovenaan (meer, minder, evenveel) of zonder (de meeste, de minste). */
export const metVoorbeeld = (v: Vraag2) => v.wat === "meer" || v.wat === "minder" || v.wat === "evenveel";
/** Welk niveau is goed: 2 (heel veel) bij meer en de meeste, 0 bij minder en de minste, 1 bij evenveel. */
export const doelNiveau = (v: Vraag2) => (v.wat === "meer" || v.wat === "meest" ? 2 : v.wat === "minder" || v.wat === "minst" ? 0 : 1);
/** Het plaatje (0, 1 of 2 van links naar rechts) dat goed is. */
export const goedPlaatje = (v: Vraag2) => v.keuzes.indexOf(doelNiveau(v));


/* ---------- vaste zinnen van het verloop ----------
 *
 * Sara, 18 november 2026 (zoals de proefles Tellen en de lessen Meer-minder, Tijd, Dagen …): Bliepo klinkt als een warme
 * juf. Elke zin is nagelopen (kort, gewone woorden, lief, nooit "fout") en elke situatie die terugkomt heeft varianten.
 * Een lijst = varianten: de les kiest er 1 met de gedeelde kiezer (nooit-dubbel.ts), nooit 2 keer achter elkaar
 * dezelfde, ook niet over vragen heen. De vragen zelf ("Op welke boterham zit meer kaas?") zijn gelijk gebleven (3.11),
 * net als de eerste vraag van de les ("… Tik op de goede boterham."; F16). Oud naast nieuw: WIJZIGINGEN-ZINNEN-REKENMIX2.md.
 */

/** Een getal dat nergens naar verwijst: wit (14.20, 14.27). */
const w = (n: number) => `{${n}:wit}`;
const Hoofd = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const vergelijking = (v: Vraag2) => (v.wat === "meer" ? "meer" : v.wat === "minder" ? "minder" : "evenveel");
type Rel = "meer" | "minder" | "evenveel";
/** "meer kaas dan", "net zoveel kaas als" (zonder "bovenaan"). */
const relMet = (rel: Rel, h: Woorden) => (rel === "evenveel" ? `net zoveel ${h.wat} als` : `${rel} ${h.wat} dan`);
/** "meer kaas op dan bovenaan", "evenveel kaas op als bovenaan". */
const relOp = (rel: Rel, h: Woorden) => (rel === "evenveel" ? `evenveel ${h.wat} op als bovenaan` : `${rel} ${h.wat} op dan bovenaan`);
const meestWoord = (v: Vraag2) => (v.wat === "meest" ? "meeste" : "minste");
/** De vraagzin zelf (zoals de oude les). */
const vraagZin = (v: Vraag2) => {
  const h = woordenVan(v);
  return metVoorbeeld(v) ? `Op ${h.welk} zit ${vergelijking(v)} ${h.wat}?` : `Op ${h.welk} zit ${h.lw} ${meestWoord(v)} ${h.wat}?`;
};

/** Zonder kleurcode: {3:wit} wordt 3. */
export const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
/** Zo lang mag 1 stuk tekst zijn (1 stuk = wat Bliepo in 1 keer zegt): dan past het in het tekstvak (15.30). */
export const MAX_STUK = 110;
export const lengte = (...delen: string[]) => kaal(delen.filter(Boolean).join(" ")).length;
export const past = (...delen: string[]) => lengte(...delen) <= MAX_STUK;
/** Harde eis: alleen varianten die passen (samen met `ervoor` in 1 stuk). Past er geen, dan de kortste. */
export const passend = (zinnen: readonly string[], ...ervoor: string[]): string[] => {
  const over = zinnen.filter((z) => past(...ervoor, z));
  return over.length ? over : [[...zinnen].sort((a, b) => lengte(a) - lengte(b))[0]];
};
/** De wisselwoorden van de kiezer: "Daar zit minder kaas op." en "Daar zit meer fruit op." tellen als dezelfde zin. */
export const WISSEL = ["kaas", "fruit", "banaan", "komkommer", "tomaat", "ei", "boterham", "spiesje", "boterhammen", "spiesjes", "die", "dat", "deze", "dit", "de", "het", "hem", "welke", "welk", "andere", "ander", "meer", "minder", "evenveel", "meeste", "minste", "voller", "leger", "volst", "leegst", "meest", "minst"];

/** De kiezer van de les (nooit-dubbel.ts): kiest 1 zin uit een rijtje, nooit 2 keer achter elkaar dezelfde. */
export type Kies = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

export const ZIN = {
  /** Begin, samen met de groet. Geen vraag: het kind kan hier nog niets doen (de eerste vraag komt meteen erna). */
  begin: ["In deze les kijk je hoeveel er op een boterham of een spiesje zit.", "Vandaag kijken we hoeveel er op een boterham of een spiesje zit.", "We gaan samen kijken waar meer op zit, en waar minder."],
  /**
   * De vraag (zoals de oude les). De eerste keer met wat het kind moet doen (3.15).
   * F16 (Sara, 18 november 2026; BOUWREGELS 15.37): hier stond "Tik op de goede boterham en dan op het vinkje." Het
   * lesscherm laat elke zin met het woord "vinkje" weg (Lesscherm.tsx, opdracht eigenaar 30 oktober), en omdat de vraag
   * als 1 stuk wordt gezegd viel de HELE eerste vraag weg: de les wachtte op een tik zonder vraag. Daarom zonder "vinkje",
   * zoals de gouden les Meer-minder ("Tik op die kaart.").
   * `intro`: de kijkzin vóór de vraag (alleen bij meer, minder, evenveel). Leeg = de vaste zin van de oude les.
   */
  vraag: (v: Vraag2, eerste = false, intro = ""): string[] => {
    const h = woordenVan(v);
    const basis = metVoorbeeld(v) ? [intro || `Kijk naar ${h.het} ${h.ding} bovenaan.`, vraagZin(v)] : [vraagZin(v)];
    return eerste ? [...basis, `Tik op ${h.het} goede ${h.ding}.`] : basis;
  },
  /** De kijkzin vóór de vraag, in varianten (vanaf de 2e vraag; de 1e vraag houdt de zin van de oude les). */
  vraagIntro: (v: Vraag2): string[] => {
    const h = woordenVan(v);
    return [`Kijk naar ${h.het} ${h.ding} bovenaan.`, `Kijk eerst naar ${h.het} ${h.ding} bovenaan.`, `Bovenaan ligt een ${h.ding}.`];
  },
  /**
   * Na de hint bij de 1e fout komt de vraag terug (F16, Sara 18 november 2026; BOUWREGELS 15.37 en 14.32): een hint als
   * "Kijk hoeveel kaas er bovenaan zit." zegt niet wat het kind moet doen. Alleen de vraagzin, zonder "Kijk naar … bovenaan."
   * Sinds 18 november in varianten: nooit precies dezelfde zin als de eerste keer.
   */
  opnieuw: (v: Vraag2): string[] => {
    const h = woordenVan(v);
    if (metVoorbeeld(v)) {
      const vgl = vergelijking(v);
      return [`Op ${h.welk} zit ${vgl} ${h.wat}, denk je?`, `Kies nog een keer. Op ${h.welk} zit ${vgl} ${h.wat}?`, `${Hoofd(h.welk)} heeft ${relMet(vgl, h)} bovenaan?`];
    }
    const m = `${h.lw} ${meestWoord(v)} ${h.wat}`;
    return [`Op ${h.welk} zit ${m}, denk je?`, `Kies nog een keer. Op ${h.welk} zit ${m}?`, `${Hoofd(h.welk)} heeft ${m}?`];
  },
  /** 2e fout: daarna kijken we samen (Bliepo telt niet: hij wijst elk plaatje aan). Was: "Kom, we tellen ze samen." (van Tellen). */
  samenHelp: ["Kom, we kijken samen.", "Geeft niks. We kijken samen.", "Weet je wat? We kijken samen.", "Ik help je even. We kijken samen.", "Kom, we gaan ze samen langs."],
  /** Samen kijken na de 2e fout: Bliepo wijst elk plaatje aan. (Wordt niet gezegd; laten staan.) */
  samenKijk: (v: Vraag2) => `Kijk, we gaan ze samen langs.`,
  /** Wat Bliepo bij elk plaatje zegt (van weinig naar veel). Bij een plaatje bovenaan: vergeleken met bovenaan. */
  samenPlaatje: (v: Vraag2, niveau: number): string[] => {
    const h = woordenVan(v);
    const Deze = Hoofd(h.deze);
    if (metVoorbeeld(v)) {
      if (niveau === 1) return [`Hier zit evenveel ${h.wat} als bovenaan.`, `Op ${h.deze} ${h.ding} zit net zoveel ${h.wat} als bovenaan.`, `${Deze} ${h.ding} lijkt precies op ${h.die} bovenaan.`];
      const r = niveau === 0 ? "minder" : "meer";
      return [`Hier zit ${r} ${h.wat} dan bovenaan.`, `Op ${h.deze} ${h.ding} zit ${r} ${h.wat} dan bovenaan.`, `${Deze} ${h.ding} heeft ${r} ${h.wat} dan bovenaan.`];
    }
    if (niveau === 1) return [`Hier zit al wat meer ${h.wat}.`, `Op ${h.deze} ${h.ding} zit meer ${h.wat} dan net.`, `${Deze} ${h.ding} heeft al wat meer ${h.wat}.`];
    const m = `${h.lw} ${niveau === 0 ? "minste" : "meeste"} ${h.wat}`;
    return [`Hier zit ${m}.`, `Op ${h.deze} ${h.ding} zit ${m}.`, `${Deze} ${h.ding} heeft ${m}.`];
  },
  /** Nu het kind (de kleine stap): een opdracht. De precieze zin alleen als hij niet net zo klonk (mag-filter in de les). */
  samenTik: (v: Vraag2): string[] => {
    const h = woordenVan(v);
    const precies = metVoorbeeld(v) ? `Tik op ${h.het} ${h.ding} met ${relMet(vergelijking(v), h)} bovenaan.` : `Tik op ${h.het} ${h.ding} met ${h.lw} ${meestWoord(v)} ${h.wat}.`;
    return [precies, `Tik jij op ${h.het} goede ${h.ding}?`, `Nu mag jij tikken. ${Hoofd(h.welk)} is het?`, `Weet jij nu ${h.welk} het is? Tik erop.`];
  },
  /** Het hulphandje wijst het goede plaatje aan (na ± 6 s). */
  samenHand: (v: Vraag2): string[] => {
    const h = woordenVan(v);
    return [`Tik op ${h.deze} ${h.ding}.`, `Tik maar op ${h.deze} ${h.ding}.`, `${Hoofd(h.deze)} is het. Tik erop.`];
  },
  /** Het kind tikte het goede plaatje. Niet precies de zin die Bliepo bij dat plaatje al zei. */
  samenKlaar: (v: Vraag2): string[] => {
    const h = woordenVan(v);
    if (v.wat === "meest" || v.wat === "minst") {
      const m = `${h.lw} ${meestWoord(v)} ${h.wat}`;
      return [`Ja, daar zit ${m} op.`, `Goed zo! ${Hoofd(h.die)} ${h.ding} heeft ${m}.`, `Precies, ${h.die} ${h.ding} is het ${v.wat === "meest" ? "volst" : "leegst"}.`];
    }
    const vgl = vergelijking(v);
    const kort = vgl === "meer" ? "voller" : vgl === "minder" ? "leger" : "";
    return [
      `Ja, daar zit ${relOp(vgl, h)}.`,
      `Goed zo! ${Hoofd(h.die)} ${h.ding} heeft ${relMet(vgl, h)} bovenaan.`,
      kort ? `Precies, ${h.die} ${h.ding} is ${kort} dan bovenaan.` : `Precies, ${h.die} ${h.ding} ziet er net zo uit als bovenaan.`,
    ];
  },
  /** Vangnet: 20 s geen tik, dan wijst Bliepo zelf (geen "Ja": het kind tikte niet). */
  samenZelf: (v: Vraag2): string[] => {
    const h = woordenVan(v);
    /* Niet "Hier zit …": zo klonk het net bij dat plaatje. */
    const zin = v.wat === "meest" || v.wat === "minst" ? `Daar zit ${h.lw} ${meestWoord(v)} ${h.wat} op.` : `Daar zit ${relOp(vergelijking(v), h)}.`;
    return [`Kijk, ik wijs ${h.hem} aan. ${zin}`, `Kijk, ${h.deze} is het. ${zin}`, `Kijk, ik laat ${h.hem} zien. ${zin}`];
  },
  slot: ["Je zag waar meer en minder zit.", "Mooi gewerkt! Jij ziet goed waar meer of minder op zit.", "Je hebt goed gekeken vandaag! Je ziet nu waar het meeste op zit."],
  /** "Tik op de kaart." in varianten (dezelfde 3 als de gouden les Tellen). Was: alleen "Tik op de kaart." (van Rekenmix 1). */
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** Aanmoediging bij het hulphandje (zelfde als Tellen). */
export const AANMOEDIG = AANMOEDIG_TIKKEN as readonly string[];

/**
 * De reactie bij goed (na de lofzin), in varianten. Zegt wat er goed was; de les kiest er 1 die niet hetzelfde woord
 * herhaalt als de lofzin ("Precies goed!" en dan "Precies, …"): `goedReactie`.
 */
export const GOEDREACTIE = (v: Vraag2) => {
  const h = woordenVan(v);
  const D = Hoofd(h.die);
  if (v.wat === "meest" || v.wat === "minst") {
    const m = `${h.lw} ${meestWoord(v)} ${h.wat}`;
    const st = v.wat === "meest" ? "volst" : "leegst";
    const zinnen = [`Daar zit ${m} op.`, `${D} ${h.ding} heeft ${m}.`, `Je koos ${h.het} ${h.ding} met ${m}.`, `Precies, ${h.die} ${h.ding} is het ${st}.`, `Dat klopt, hier zit het ${v.wat} op.`];
    return { zinnen, robot: [] as number[] };
  }
  const vgl = vergelijking(v);
  const zinnen =
    vgl === "evenveel"
      ? [`Daar zit evenveel ${h.wat} op als bovenaan.`, `${D} ${h.ding} heeft net zoveel ${h.wat} als bovenaan.`, `Je zag dat het evenveel is.`, `Precies, ${h.die} ${h.ding} ziet er net zo uit als bovenaan.`, `Dat klopt, ${h.die} lijkt precies op ${h.die} bovenaan.`]
      : [`Daar zit ${vgl} ${h.wat} op dan bovenaan.`, `${D} ${h.ding} heeft ${vgl} ${h.wat} dan bovenaan.`, `Je koos ${h.het} ${h.ding} met ${vgl} ${h.wat}.`, `Precies, ${h.die} ${h.ding} is ${vgl === "meer" ? "voller" : "leger"} dan bovenaan.`, `Dat klopt, daar zit ${vgl} ${h.wat} op.`];
  return { zinnen, robot: [] as number[] };
};

/** Woorden die in lof en reactie niet allebei mogen staan ("Precies goed!" en dan "Precies, …"; nooit 2 keer "Ja"). */
const LOFWOORD = /\b(ja|precies|klopt|goed|zo|knap)\b/gi;
const lofWoorden = (z: string) => new Set((kaal(z).match(LOFWOORD) ?? []).map((x) => x.toLowerCase()));
/** Harde eis: alleen reacties die geen lofwoord delen met de lofzin en niet met hetzelfde woord beginnen. */
export function goedReacties(v: Vraag2, lof: string): string[] {
  const L = lofWoorden(lof);
  const eerste = (z: string) => kaal(z).split(/[\s,:!.]/)[0].toLowerCase();
  const alle = GOEDREACTIE(v).zinnen;
  const over = alle.filter((z) => ![...lofWoorden(z)].some((x) => L.has(x)) && eerste(z) !== eerste(lof));
  return over.length ? over : alle.filter((z) => eerste(z) !== eerste(lof));
}
/** De reactie bij goed, met de kiezer (de les en het fouttabel-script gebruiken allebei deze functie). */
export const goedReactie = (kies: Kies, v: Vraag2, lof: string) => kies("goed", goedReacties(v, lof));

/* ---------- denkfouten ---------- */

export const DENKFOUTEN = ["koos-evenveel", "koos-meer", "koos-minder", "koos-het-tegenovergestelde", "koos-het-middelste", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/**
 * Alle varianten bij 1 fout plaatje; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde).
 *   eerste      wat er klopt van het gekozen plaatje (sluit alleen dat plaatje uit, 15.17);
 *   nuEerste    hetzelfde, bij de 2e keer met een ander plaatje ("Nu koos je …");
 *   hint        1e keer: waar het kind moet kijken, zonder richting (de vraag komt erachter terug);
 *   uitleg      2e keer: wat we zoeken (daarna kijken we samen);
 *   weerEerste / weerUitleg   hetzelfde plaatje 2 keer.
 */
export type Varianten = { eerste: string[]; nuEerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };

export type Fout = {
  code: Denkfoutnaam;
  soort: string;
  denkfout: string;
  eerste: string;
  hint: string;
  uitleg: string;
  weer: string[];
  scherm: string;
  noot?: string;
  /** Alle varianten (18 november 2026); `eerste`, `hint`, `uitleg` en `weer` hierboven zijn er 1 van (voor de fouttabel). */
  v: Varianten;
};

const SCHERM = "vraag en plaatjes even weg; de plaatjes blijven staan; Bliepo's scherm 1,5 s rood; met de hint komen de plaatjes meteen terug (geen pijl)";

/**
 * De fouttabel van 1 fout plaatje (het niveau van het plaatje dat het kind koos). Bliepo zegt wat er klopt van het
 * gekozen plaatje ("Daar zit evenveel kaas op als bovenaan"): dat sluit alleen dat plaatje uit, nooit het goede (15.17).
 * De hint is neutraal: kijk wat erop zit, zonder "voller" of "leger".
 */
export function vergelijkFout(c: number, v: Vraag2): Fout {
  const h = woordenVan(v);
  const i = v.nr % 3;
  const D = Hoofd(h.die);
  const meervoud = h.ding === "boterham" ? "boterhammen" : "spiesjes";
  const zelfde = h.het === "de" ? "dezelfde" : "hetzelfde";
  const weerEerste = [`Je koos weer ${zelfde} ${h.ding}.`, `Weer ${h.deze} ${h.ding}, zie ik.`, `Je tikte weer op ${zelfde} ${h.ding}.`];
  const maak = (d: Omit<Fout, "eerste" | "hint" | "uitleg" | "weer" | "scherm">): Fout => ({
    ...d,
    eerste: d.v.eerste[i % d.v.eerste.length],
    hint: d.v.hint[i % d.v.hint.length],
    uitleg: d.v.uitleg[i % d.v.uitleg.length],
    weer: [d.v.weerEerste[i % d.v.weerEerste.length], d.v.weerUitleg[i % d.v.weerUitleg.length]],
    scherm: SCHERM,
  });
  if (metVoorbeeld(v)) {
    const rel: Rel = c < 1 ? "minder" : c > 1 ? "meer" : "evenveel";
    const vgl = vergelijking(v);
    const eerste =
      rel === "evenveel"
        ? [`Daar zit evenveel ${h.wat} op als bovenaan.`, `${D} ${h.ding} heeft net zoveel ${h.wat} als ${h.die} bovenaan.`, `Jouw ${h.ding} lijkt precies op ${h.die} bovenaan.`, `Op jouw ${h.ding} zit net zoveel ${h.wat} als bovenaan.`]
        : [`Daar zit ${rel} ${h.wat} op dan bovenaan.`, `${D} ${h.ding} heeft ${rel} ${h.wat} dan ${h.die} bovenaan.`, `Jouw ${h.ding} heeft ${rel} ${h.wat} dan bovenaan.`, `Op jouw ${h.ding} zit ${rel} ${h.wat} dan bovenaan.`];
    const nuEerste = [`Nu koos je een ${h.ding} met ${relMet(rel, h)} bovenaan.`, `Deze keer zit er ${relOp(rel, h).replace(" op ", " ")}.`];
    const hint =
      vgl === "evenveel"
        ? [`Kijk hoeveel ${h.wat} er bovenaan zit.`, `Kijk goed naar ${h.het} ${h.ding} bovenaan.`, `Kijk eerst bovenaan, en dan naar de rest.`]
        : [`Kijk hoeveel ${h.wat} er bovenaan zit.`, `Kijk wat er anders is dan bovenaan.`, `Kijk goed naar ${h.het} ${h.ding} bovenaan.`, `Kijk eerst bovenaan, en dan naar de rest.`];
    const uitleg = {
      meer: [`Je zoekt ${h.het} ${h.ding} ${h.die} voller is dan bovenaan.`, `We zoeken een ${h.ding} met nog meer ${h.wat} dan bovenaan.`, `Meer ${h.wat} betekent: voller dan ${h.het} ${h.ding} bovenaan.`],
      minder: [`Je zoekt ${h.het} ${h.ding} ${h.die} leger is dan bovenaan.`, `We zoeken een ${h.ding} met nog minder ${h.wat} dan bovenaan.`, `Minder ${h.wat} betekent: leger dan ${h.het} ${h.ding} bovenaan.`],
      evenveel: [`Je zoekt ${h.het} ${h.ding} ${h.die} er precies zo uitziet als bovenaan.`, `Evenveel betekent: net zoveel ${h.wat} als bovenaan.`, `We zoeken een ${h.ding} ${h.die} lijkt op ${h.die} bovenaan.`],
    }[vgl];
    const weerUitleg = {
      meer: [`Er is een ${h.ding} met nog meer ${h.wat}.`, `Op een ${h.ander} ${h.ding} zit meer ${h.wat} dan bovenaan.`],
      minder: [`Er is een ${h.ding} met nog minder ${h.wat}.`, `Op een ${h.ander} ${h.ding} zit minder ${h.wat} dan bovenaan.`],
      evenveel: [`Er is een ${h.ding} ${h.die} net zo vol is als bovenaan.`, `Een ${h.ander} ${h.ding} lijkt precies op ${h.die} bovenaan.`],
    }[vgl];
    return maak({
      code: rel === "evenveel" ? "koos-evenveel" : rel === "meer" ? "koos-meer" : "koos-minder",
      soort: `koos-${rel}`,
      denkfout: rel === "evenveel" ? "koos het plaatje met evenveel" : rel === "meer" ? "koos het plaatje met meer" : "koos het plaatje met minder",
      v: { eerste, nuEerste, hint, uitleg, weerEerste, weerUitleg },
    });
  }
  const meest = v.wat === "meest";
  const tegen = meest ? c === 0 : c === 2;
  const m = `${h.lw} ${meestWoord(v)} ${h.wat}`;
  const hint = [`Kijk hoeveel ${h.wat} er op ${h.elk} ${h.ding} zit.`, `Kijk naar ${h.elk} ${h.ding} en kies dan.`, `Kijk nog eens goed naar alle ${w(3)} ${meervoud}.`, `Bekijk de ${meervoud} een voor een.`];
  const uitleg = meest
    ? [`Je zoekt ${h.het} ${h.ding} met ${m}.`, `De meeste betekent: meer dan op alle andere.`, `We zoeken ${h.het} ${h.ding} ${h.die} het volst is.`]
    : [`Je zoekt ${h.het} ${h.ding} met ${m}.`, `De minste betekent: minder dan op alle andere.`, `We zoeken ${h.het} ${h.ding} ${h.die} het leegst is.`];
  const weerUitleg = meest ? [`Er is een ${h.ding} met nog meer ${h.wat}.`, `Op een ${h.ander} ${h.ding} zit nog meer ${h.wat}.`] : [`Er is een ${h.ding} met nog minder ${h.wat}.`, `Op een ${h.ander} ${h.ding} zit nog minder ${h.wat}.`];
  if (tegen) {
    const t = `${h.lw} ${meest ? "minste" : "meeste"} ${h.wat}`;
    const tk = meest ? "minst" : "meest";
    return maak({
      code: "koos-het-tegenovergestelde",
      soort: "koos-het-tegenovergestelde",
      denkfout: meest ? "koos juist het plaatje met het minste" : "koos juist het plaatje met het meeste",
      v: {
        eerste: [`Daar zit juist ${t} op.`, `${D} ${h.ding} heeft juist ${t}.`, `Op jouw ${h.ding} zit juist het ${tk}.`, `Jouw ${h.ding} heeft juist ${t}.`],
        nuEerste: [`Nu koos je juist ${h.het} ${h.ding} met ${t}.`, `Deze keer zit er juist het ${tk} op.`],
        hint,
        uitleg,
        weerEerste,
        weerUitleg,
      },
    });
  }
  return maak({
    code: "koos-het-middelste",
    soort: "koos-het-middelste",
    denkfout: meest ? "koos het plaatje dat niet het meeste heeft (en ook niet het minste)" : "koos het plaatje dat niet het minste heeft (en ook niet het meeste)",
    v: {
      eerste: meest
        ? [`Daar zit niet ${m} op.`, `${D} ${h.ding} heeft niet ${m}.`, `Op jouw ${h.ding} zit veel ${h.wat}, maar niet ${h.lw} meeste.`, `Jouw ${h.ding} heeft niet ${m}.`]
        : [`Daar zit niet ${m} op.`, `${D} ${h.ding} heeft niet ${m}.`, `Op jouw ${h.ding} zit niet ${m}.`, `Jouw ${h.ding} heeft niet ${m}.`],
      nuEerste: [`Nu koos je ook niet ${h.het} ${h.ding} met ${m}.`, `Deze keer zit er niet ${m} op.`],
      hint,
      uitleg,
      weerEerste,
      weerUitleg,
    },
  });
}

/** Er is geen "dichtbij" bij plaatjes zonder getal; deze twee bestaan alleen omdat de gedeelde les ze kent. */
export const dichtbijAnders = (c: number, v: Vraag2) => vergelijkFout(c, v).eerste;
export const zonderDichtbij = (c: number, v: Vraag2) => vergelijkFout(c, v).eerste;
/** Hetzelfde foute plaatje 2 keer: niet 2 keer dezelfde eerste zin (de eerste van de varianten). */
export const weerGekozen = (v: Vraag2) => vergelijkFout(v.keuzes.find((n) => n !== doelNiveau(v)) ?? 0, v).v.weerEerste[0];

/** De fouttabel van een vraag: per fout plaatje (sleutel = plaats 0, 1 of 2 van links naar rechts). */
export const foutenVan = (v: Vraag2): Record<string, Fout> => Object.fromEntries(v.keuzes.map((niv, plek) => [String(plek), niv === doelNiveau(v) ? null : vergelijkFout(niv, v)]).filter(([, f]) => f)) as Record<string, Fout>;

/* ---------- wat Bliepo zegt bij een fout: 1 functie voor de les én het fouttabel-script ---------- */

/** Woordstukken: hebben 2 zinnen 3 woorden achter elkaar gemeen? Dan niet vlak achter elkaar. */
const deelt = (a: string, b: string) => deeltStuk(a, b, 3);
const hasKies = (z: string) => /\bkies\b/i.test(kaal(z));

/** Hints waar minstens 2 versies van de vraag achter passen (harde eis voor het tekstvak). */
export const hintsDiePassen = (v: Vraag2, hints: readonly string[]) => hints.filter((hi) => opnieuwVoor(v, hi).length >= 2);
/** De versies van de vraag die na deze hint mogen: passen in 1 stuk, niet 2 keer "kies", niet de vraag van de eerste keer. */
export const opnieuwVoor = (v: Vraag2, hint: string) => ZIN.opnieuw(v).filter((z) => past(hint, z) && !(hasKies(hint) && hasKies(z)) && z !== vraagZin(v));

/**
 * Wat Bliepo zegt bij een plaatje dat niet goed is. De les en het fouttabel-script gebruiken allebei deze functie.
 *   1e keer: eerste zin + hint (de vraag komt erachter terug: `opnieuwZin`).
 *   2e keer, hetzelfde plaatje: "Je koos weer …" + een andere uitleg; een ander plaatje: een eerste zin met een ander
 *   begin dan de 1e keer + de uitleg.
 */
export function foutReactie(kies: Kies, f: Fout, poging: 1 | 2, o: { zelfdePlaatje: boolean; eersteZin: string }): string[] {
  const V = f.v;
  if (poging === 1) {
    const e = kies("eerste", passend(V.eerste));
    return [e, kies("hint", passend(V.hint), (z) => !deelt(e, z))];
  }
  if (o.zelfdePlaatje) {
    const w = kies("weer", V.weerEerste);
    return [w, kies("weerUitleg", passend(V.weerUitleg), (z) => !deelt(w, z))];
  }
  const anders = [...V.eerste, ...V.nuEerste].filter((z) => beginVan(z) !== beginVan(o.eersteZin));
  const e = kies("eerste", passend(anders.length ? anders : V.nuEerste));
  return [e, kies("uitleg", passend(V.uitleg), (z) => !deelt(e, z))];
}

/** De vraag na de hint: steeds in andere woorden, nooit precies de vraag van de eerste keer (F16, 15.37). */
export function opnieuwZin(kies: Kies, v: Vraag2, hint: string): string {
  const over = opnieuwVoor(v, hint);
  return kies("opnieuw", over.length ? over : ZIN.opnieuw(v), (z) => !deelt(hint, z));
}

/** De zinnen bij samen kijken (zonder de tik van het kind): wat Bliepo bij elk plaatje zegt, en dan de opdracht. */
export function samenZinnen(kies: Kies, v: Vraag2): { plaatjes: string[]; tik: string } {
  const volgorde = [...v.keuzes].sort((a, b) => a - b);
  /* Bij de 3 plaatjes steeds een andere zinsvorm ("Hier zit …", "Op deze …", "Deze … heeft …"). */
  const vorm = maakVorm(WISSEL);
  const gebruikt = new Set<string>();
  const plaatjes = volgorde.map((niv) => {
    const z = kies("samenPlaatje", ZIN.samenPlaatje(v, niv), (x) => !gebruikt.has(vorm(x)));
    gebruikt.add(vorm(z));
    return z;
  });
  /* De zin over het goede plaatje: de opdracht herhaalt die niet. */
  const overGoed = plaatjes[volgorde.indexOf(doelNiveau(v))];
  const tik = kies("samenTik", ZIN.samenTik(v), (z) => !deelt(overGoed, z) && !deelt(plaatjes.at(-1) ?? "", z));
  return { plaatjes, tik };
}
/** Na de tik van het kind (of het vangnet): niet weer de zin die Bliepo bij dat plaatje of in de opdracht zei. */
export const samenKlaarZin = (kies: Kies, v: Vraag2, zelf: boolean, eerder: string[]) =>
  kies(zelf ? "samenZelf" : "samenKlaar", zelf ? ZIN.samenZelf(v) : ZIN.samenKlaar(v), (z) => !eerder.some((e) => deelt(e, z)));
/** Het hulphandje: aanmoediging + wat te doen, in 1 stuk. */
export const handZin = (kies: Kies, v: Vraag2) => {
  const zin = kies("samenHand", ZIN.samenHand(v));
  return `${kies("aanmoedig", passend(AANMOEDIG, zin))} ${zin}`;
};
