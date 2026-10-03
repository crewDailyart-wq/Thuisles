/**
 * De opdrachten met de wijzerklok, uit de onderwerpen 1, 2 en 4 van Tijd.
 *
 *   urenminuten        1 uur = ▢ minuten
 *   dagdeel            een digitale tijd; ochtend, middag, avond of nacht?
 *   klokaflezen        een klok; kies de tijd in woorden of digitaal
 *   klokkiezen         kies de goede klok uit vier
 *   klokzetten         zet zelf de wijzers
 *   klokkoppelen       sleep elke digitale tijd naar de goede klok
 *   klokkenvolgorde    sleep vier klokken van vroeg naar laat
 *   kloktypen          typ de tijd in twee vakjes
 *   wijzeraanwijzen    tik op de wijzer van de uren of van de minuten
 *   klokklopt          klopt de klok bij de zin? ja of nee
 *   klokduur           hoe lang duurt het? ▢ uur ▢ minuten
 *   klokvlek           een klok met een vlek erop; kies de tijd
 *
 * ---------------------------------------------------------------------------
 * Hoeveel verschillende opgaven er bestaan
 * ---------------------------------------------------------------------------
 * Een wijzerklok heeft twaalf standen per minutengroep. Bij "Hele uren
 * aflezen" bestaan er dus precies twaalf verschillende opgaven, en niet meer —
 * net zoals er bij "Aftrekken vanaf 10" negen sommen bestaan. Een ronde van
 * vijftien wordt dan door de opslag aangevuld met dubbele; zie
 * `vulAanMetDubbele` in `soort.ts`. `npm run opgaven` laat per titel zien
 * hoeveel verschillende er zijn.
 *
 * ---------------------------------------------------------------------------
 * De vraagzin
 * ---------------------------------------------------------------------------
 * Veel opdrachten hebben een zin die per opgave verschilt: "Je gaat om 3 uur
 * naar het zwembad. Om 5 uur ben je klaar." Die zin hoort in de grote vraagzin
 * en niet in een klein grijs tekstje eronder (ONTWERPREGELS.md), dus staat hij
 * op de plek van `{zin}` in de vraagtekst. Een beheerder kan die zin per
 * sjabloon aanpassen en `{zin}` laten staan waar hij hem wil hebben.
 */

import {
  getal,
  husselen,
  metTweedeVariant,
  doorgeschoven,
  kansGenerator,
  kiesUit,
  lijst,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  type Veld,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import {
  DAGDEEL_ACHTER,
  DAGDEEL_LABEL,
  dagdeelVan,
  opDagdeelgrens,
  digitaal,
  inWoorden,
  plusMinuten,
  verschil,
  type Tijd,
} from "@/lib/tijd";
import { tijdPatronen } from "@/lib/generatoren/patronen/tijd";
import {
  dagdeelAanpak,
  duurAanpak,
  klokzettenAanpak,
  urenminutenAanpak,
  wijzeraanwijzenAanpak,
  wijzerklokAanpak,
} from "@/lib/generatoren/aanpak/tijd";
import {
  dagdeelUitleg,
  duurUitleg,
  klokzettenUitleg,
  urenminutenUitleg,
  wijzeraanwijzenUitleg,
  wijzerklokUitleg,
} from "@/lib/generatoren/scripts/tijd";

// ---------------------------------------------------------------------------
// Welke minuten er voorkomen
// ---------------------------------------------------------------------------

/**
 * De minutengroepen waaruit een opdracht kan kiezen.
 *
 * Dit is de leerlijn van de klok: eerst alleen het hele uur, dan het halve, dan
 * de kwartieren, dan de vijf minuten, en als laatste elke minuut. Elke titel in
 * WERKPLAN.md hoort bij één of een paar van deze groepen.
 */
const MINUTENGROEPEN: Record<string, number[]> = {
  heel: [0],
  half: [30],
  kwartier: [15, 45],
  vijf: [5, 10, 20, 25, 35, 40, 50, 55],
  minuut: Array.from({ length: 60 }, (_, i) => i).filter(
    (m) => ![0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55].includes(m),
  ),
};

const TIJDENVELD: Veld = {
  soort: "vinkjes",
  sleutel: "tijden",
  label: "Welke tijden",
  opties: [
    { waarde: "heel", label: "Hele uren — 6:00" },
    { waarde: "half", label: "Halve uren — 6:30" },
    { waarde: "kwartier", label: "Kwartieren — 6:15 en 6:45" },
    { waarde: "vijf", label: "Vijf en tien over en voor" },
    { waarde: "minuut", label: "Op de minuut" },
  ],
  hulp: "De minuten die in deze oefening voorkomen. Eén groep aanvinken geeft één soort tijd; meer groepen geeft ze door elkaar.",
};

function gekozenGroepen(inst: Instellingen, terugval: string[]): string[] {
  const gekozen = lijst(inst, "tijden", terugval).filter((g) => g in MINUTENGROEPEN);
  return gekozen.length ? gekozen : terugval;
}

/** Alle minuten die bij deze instellingen voorkomen. */
function minuten(inst: Instellingen, terugval: string[]): number[] {
  const uit = new Set<number>();
  for (const groep of gekozenGroepen(inst, terugval)) {
    for (const m of MINUTENGROEPEN[groep]) uit.add(m);
  }
  return [...uit].sort((a, b) => a - b);
}

/** Hoe fijn de grote wijzer mag staan bij deze instellingen. */
export function wijzerstap(inst: Instellingen, terugval: string[]): number {
  const m = minuten(inst, terugval);
  if (m.every((n) => n % 30 === 0)) return 30;
  if (m.every((n) => n % 15 === 0)) return 15;
  if (m.every((n) => n % 5 === 0)) return 5;
  return 1;
}

/** De zwaarste minutengroep die meedoet; de moeilijkheid volgt hieruit. */
export function groeppunten(
  inst: Instellingen,
  terugval: string[],
  tabel: Record<string, number>,
): number {
  return Math.max(...gekozenGroepen(inst, terugval).map((g) => tabel[g] ?? 0));
}

/** Alle tijdstippen die bij deze instellingen bestaan, binnen één etmaal. */
function alleTijden(inst: Instellingen, terugval: string[], urenVan24: boolean): Tijd[] {
  const uit: Tijd[] = [];
  const uren = urenVan24 ? 24 : 12;
  for (let u = 0; u < uren; u++) {
    for (const m of minuten(inst, terugval)) uit.push({ uur: urenVan24 ? u : u === 0 ? 12 : u, minuut: m });
  }
  return uit;
}

/**
 * De tijden waar een wijzerklok het antwoord op kan zijn.
 *
 * Een wijzerklok laat geen ochtend of avond zien: zes uur 's ochtends en zes
 * uur 's avonds zien er precies hetzelfde uit. Daarom alleen 12-uursnotatie,
 * 01:00 tot en met 12:59, tenzij er een zinnetje met het dagdeel bij staat
 * ("Het is 's avonds"). Alleen dan mogen het ook tijden van 13:00 en later
 * zijn. Nooit 00:xx: middernacht is op de klok twaalf uur.
 */
function wijzertijden(inst: Instellingen, terugval: string[], metDagdeel: boolean): Tijd[] {
  if (!metDagdeel) return alleTijden(inst, terugval, false);
  /*
    Met het dagdeel erbij nooit een tijd precies op de grens van twee
    dagdelen (06:00, 12:00, 18:00): is 18:00 nog middag of al avond? En
    eventueel alleen de tijden vóór of na twaalf uur; zie DAGBEREIKVELD.
  */
  const bereik = tekst(inst, "dagbereik", "heledag");
  return alleTijden(inst, terugval, true).filter(
    (t) =>
      t.uur !== 0 &&
      !opDagdeelgrens(t) &&
      (bereik === "voor12" ? t.uur < 12 : bereik === "na12" ? t.uur >= 12 : true),
  );
}

/** Welke tijden van de dag, als het dagdeel erbij staat. */
const DAGBEREIKVELD: Veld = {
  soort: "keuze",
  sleutel: "dagbereik",
  label: "Welke tijden van de dag (met het dagdeel erbij)",
  opties: [
    { waarde: "voor12", label: "Tot 12:00 — 's nachts en 's ochtends" },
    { waarde: "na12", label: "Na 12:00 — 's middags en 's avonds" },
    { waarde: "heledag", label: "De hele dag door elkaar" },
  ],
  hulp: "Nooit 00:00 en nooit precies op de grens van twee dagdelen (06:00, 12:00, 18:00).",
};

/** Het zinnetje met het dagdeel: "Het is 's avonds." */
export function dagdeelZin(t: Tijd): string {
  return `Het is ${DAGDEEL_ACHTER[dagdeelVan(t)]}.`;
}

/** Een tijd in minuten binnen een etmaal. */
function inMin(t: Tijd): number {
  return (((t.uur * 60 + t.minuut) % 1440) + 1440) % 1440;
}

/**
 * Foute digitale tijden bij een wijzerklok: een uur ernaast, een half uur
 * ernaast, een kwartier ernaast.
 *
 * Nooit de goede tijd plus of min twaalf uur: op een wijzerklok is dat
 * dezelfde stand, dus zou die keuze ook goed zijn. Zonder dagdeel blijven ook
 * de foute keuzes in 12-uursnotatie (01:00 tot en met 12:59), met dagdeel in
 * 24-uursnotatie maar nooit 00:xx. Altijd geldige tijden: nooit 27:00.
 */
function digitaleValkuilen(t: Tijd, metDagdeel: boolean): string[] {
  const goed = inMin(t);
  const uit: string[] = [];
  for (const schuif of [60, -60, 30, -30, 15, -15, 120, -120]) {
    const m = (goed + schuif + 1440) % 1440;
    if ((m - goed + 1440) % 720 === 0) continue;
    let uur = Math.floor(m / 60);
    const minuut = m % 60;
    if (metDagdeel) {
      if (uur === 0) continue;
    } else {
      uur = uur % 12 === 0 ? 12 : uur % 12;
    }
    const tekst = digitaal({ uur, minuut });
    if (tekst !== digitaal(t) && !uit.includes(tekst)) uit.push(tekst);
  }
  return uit;
}

/** De somgegevens zoals alle tijd-types ze opbouwen. */
function gegevensVan(
  soort: string,
  variant: string,
  t: Tijd,
  goed: number,
  extra: Record<string, number> = {},
) {
  return { soort, variant, getallen: [t.uur, t.minuut], goed, extra };
}

/**
 * Vier antwoorden met precies één goede, als tekst.
 *
 * De valkuilen komen van de generator en zijn echte valkuilen: bij 05:30 staan
 * er ook "half vijf" en "vijf uur" tussen (WERKPLAN.md). Dubbele antwoorden
 * vallen weg — twee keer hetzelfde zou de vraag onduidelijk maken.
 */
function keuzelijst(
  kans: () => number,
  goedeTekst: string,
  valkuilen: string[],
  hoeveel = 4,
): { keuzes: string[]; goed: number } {
  const uniek: string[] = [];
  for (const v of valkuilen) {
    if (v !== goedeTekst && !uniek.includes(v)) uniek.push(v);
  }
  const keuzes = husselen(kans, [goedeTekst, ...uniek.slice(0, hoeveel - 1)]);
  return { keuzes, goed: keuzes.indexOf(goedeTekst) };
}

/**
 * De valkuilen bij het aflezen van een tijd in woorden.
 *
 * Echte valkuilen — het uur ernaast, over en voor verwisseld, een kwartier
 * ernaast — maar alleen tijden van hetzelfde niveau als de oefening (de
 * minuten in `toegestaan`). Bij hele uren staat er dus nooit "kwart over" als
 * foute keuze; dat hoort bij een later niveau. Daarna nog het uur er twee
 * naast, zodat er altijd genoeg verschillende keuzes zijn.
 */
function tijdvalkuilen(t: Tijd, toegestaan: number[]): string[] {
  const kandidaten: Tijd[] = [
    /* Het uur ernaast: de klassieke fout bij "half". */
    { uur: t.uur + 1, minuut: t.minuut },
    { uur: t.uur + 11, minuut: t.minuut },
    /* Over en voor verwisseld. */
    { uur: t.uur, minuut: (60 - t.minuut) % 60 },
    /* Een kwartier ernaast. */
    { uur: t.uur, minuut: (t.minuut + 15) % 60 },
    { uur: t.uur, minuut: (t.minuut + 45) % 60 },
    { uur: t.uur + 2, minuut: t.minuut },
    { uur: t.uur + 10, minuut: t.minuut },
  ];
  const goed = inWoorden(t);
  const uit: string[] = [];
  for (const k of kandidaten) {
    if (!toegestaan.includes(k.minuut)) continue;
    const w = inWoorden(k);
    if (w !== goed && !uit.includes(w)) uit.push(w);
  }
  return uit;
}

// ---------------------------------------------------------------------------
// Uren en minuten
// ---------------------------------------------------------------------------

const UMZIN = "{zin}";
const UMZINNEN: Record<Leeftijdsgroep, string> = { "34": UMZIN, "56": UMZIN, "78": UMZIN };

/** De vragen van "Uren en minuten", per groep die je kunt aanvinken. */
function urenminutenVragen(groepen: string[]): { zin: string; uitkomst: number; eenheid: string }[] {
  const uit: { zin: string; uitkomst: number; eenheid: string }[] = [];

  if (groepen.includes("uren")) {
    for (let u = 1; u <= 5; u++) {
      uit.push({ zin: `${u} uur = ▢ minuten`, uitkomst: u * 60, eenheid: "minuten" });
    }
  }
  if (groepen.includes("half")) {
    uit.push({ zin: "een half uur = ▢ minuten", uitkomst: 30, eenheid: "minuten" });
    uit.push({ zin: "een kwartier = ▢ minuten", uitkomst: 15, eenheid: "minuten" });
    uit.push({ zin: "drie kwartier = ▢ minuten", uitkomst: 45, eenheid: "minuten" });
    for (let u = 1; u <= 3; u++) {
      uit.push({
        zin: `${u} en een half uur = ▢ minuten`,
        uitkomst: u * 60 + 30,
        eenheid: "minuten",
      });
    }
  }
  if (groepen.includes("helft")) {
    for (const m of [10, 20, 30, 40, 50, 60]) {
      uit.push({ zin: `de helft van ${m} minuten = ▢`, uitkomst: m / 2, eenheid: "minuten" });
    }
  }
  return uit;
}

export const urenminutenGenerator: Generator = {
  id: "urenminuten",
  naam: "Uren en minuten",
  uitleg:
    "Het kind vult in hoeveel minuten er in een tijd gaan: 1 uur = ▢ minuten, een half uur = ▢ minuten, de helft van 20 minuten = ▢.",
  suggestie: "Groep 4: alle drie de soorten aan",
  velden: [
    {
      soort: "vinkjes",
      sleutel: "soorten",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "uren", label: "Hele uren — 1 uur = ▢ minuten" },
        { waarde: "half", label: "Halve uren en kwartieren" },
        { waarde: "helft", label: "De helft van zoveel minuten" },
      ],
    },
    ...vraagtekstVelden(UMZINNEN, {
      voorbeeldzinnen: {
        "34": "1 uur = ▢ minuten",
        "56": "1 uur = ▢ minuten",
        "78": "1 uur = ▢ minuten",
      },
      extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: UMZINNEN },
  standaard: { soorten: ["uren", "half", "helft"] },
  foutpatronen: tijdPatronen,
  aanpak: urenminutenAanpak,
  uitleganimatie: urenminutenUitleg,

  maximum: (inst) => urenminutenVragen(lijst(inst, "soorten", ["uren", "half", "helft"])).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const vragen = urenminutenVragen(lijst(inst, "soorten", ["uren", "half", "helft"]));

    const uit: Gegenereerd[] = [];
    for (const vraag of husselen(kans, vragen)) {
      if (uit.length >= aantal) break;
      const handtekening = `urenminuten:${vraag.zin}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "urenminuten",
        variant: "minuten",
        getallen: [Math.floor(vraag.uitkomst / 60), vraag.uitkomst % 60],
        goed: vraag.uitkomst,
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(urenminutenGenerator, inst, groep, gegevens, {
          zin: vraag.zin,
        }),
        antwoord: String(vraag.uitkomst),
        figuur: { soort: "urenminuten", ...vraag },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Dagdelen
// ---------------------------------------------------------------------------

const DDZIN = "Welk deel van de dag is het?";
const DDZINNEN: Record<Leeftijdsgroep, string> = { "34": DDZIN, "56": DDZIN, "78": DDZIN };

/** De tijden voor "Dagdelen": het hele etmaal, maar nooit precies op een grens. */
function dagdeeltijden(inst: Instellingen): Tijd[] {
  return alleTijden(inst, ["heel"], true).filter((t) => !opDagdeelgrens(t));
}

export const dagdeelGenerator: Generator = {
  id: "dagdeel",
  naam: "Dagdelen",
  uitleg:
    "Een digitale tijd, bijvoorbeeld 14:00, en het kind kiest ochtend, middag, avond of nacht. Nacht loopt tot zes uur, ochtend tot twaalf, middag tot zes en avond tot middernacht.",
  suggestie: "Groep 4: hele uren",
  velden: [TIJDENVELD, ...vraagtekstVelden(DDZINNEN)],
  vraagteksten: { standaard: DDZINNEN },
  standaard: { tijden: ["heel"] },
  foutpatronen: tijdPatronen,
  aanpak: dagdeelAanpak,
  uitleganimatie: dagdeelUitleg,

  maximum: (inst) => dagdeeltijden(inst).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const uit: Gegenereerd[] = [];

    for (const t of husselen(kans, dagdeeltijden(inst))) {
      if (uit.length >= aantal) break;
      const handtekening = `dagdeel:${digitaal(t)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        De vier dagdelen staan er altijd alle vier, in vaste volgorde zoals de
        dag loopt; precies één is goed. Niet schudden: een kind vindt de knop
        dan blind terug.
      */
      const keuzes = ["ochtend", "middag", "avond", "nacht"];
      const goed = keuzes.indexOf(DAGDEEL_LABEL[dagdeelVan(t)]);

      const gegevens = gegevensVan("dagdeel", "kiezen", t, goed, { keuze: 1 });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(dagdeelGenerator, inst, groep, gegevens),
        antwoord: String(goed),
        figuur: { soort: "dagdeel", uur: t.uur, minuut: t.minuut, keuzes, goed },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Een klok aflezen
// ---------------------------------------------------------------------------

const AFZIN = "Hoe laat is het?";
const AFZINNEN: Record<Leeftijdsgroep, string> = { "34": AFZIN, "56": AFZIN, "78": AFZIN };

export const klokaflezenGenerator: Generator = {
  id: "klokaflezen",
  naam: "Wijzerklok aflezen",
  uitleg:
    "Een wijzerklok, en het kind kiest de tijd uit vier antwoorden — in woorden (\"half drie\") of als digitale tijd (\"14:30\"). Bij de digitale stand staat het dagdeel erbij, want anders valt acht uur 's ochtends niet van acht uur 's avonds te onderscheiden.",
  suggestie: "Groep 4: hele uren, in woorden · groep 5: kwartieren · groep 6: vijf over en voor",
  velden: [
    TIJDENVELD,
    {
      soort: "keuze",
      sleutel: "antwoordsoort",
      label: "Hoe het antwoord eruitziet",
      opties: [
        { waarde: "woorden", label: "In woorden — \"half drie\"" },
        { waarde: "digitaal", label: "Als digitale tijd — \"14:30\"" },
      ],
    },
    {
      soort: "vinkje",
      sleutel: "metDagdeel",
      label: "Zet het dagdeel erbij",
      hulp: "\"Het is avond.\" Nodig bij een digitaal antwoord in 24-uursnotatie; anders is 20:00 niet van 08:00 te onderscheiden.",
    },
    DAGBEREIKVELD,
    ...vraagtekstVelden(AFZINNEN),
  ],
  vraagteksten: { standaard: AFZINNEN },
  standaard: { tijden: ["heel"], antwoordsoort: "woorden", metDagdeel: false },
  foutpatronen: tijdPatronen,
  aanpak: wijzerklokAanpak,
  uitleganimatie: wijzerklokUitleg,

  /* Elke tijd twee keer: de tweede keer met andere foute keuzes. */
  maximum: (inst) =>
    wijzertijden(
      inst,
      ["heel"],
      tekst(inst, "antwoordsoort", "woorden") === "digitaal" && vinkje(inst, "metDagdeel"),
    ).length * 2,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const soort = tekst(inst, "antwoordsoort", "woorden");
    const metDeel = vinkje(inst, "metDagdeel");
    const uit: Gegenereerd[] = [];

    /* 24-uurstijden alleen als het dagdeel erbij staat; zie `wijzertijden`. */
    for (const { item: t, variant } of metTweedeVariant(
      kans,
      wijzertijden(inst, ["heel"], soort === "digitaal" && metDeel),
    )) {
      if (uit.length >= aantal) break;
      const handtekening = `klokaflezen:${soort}:${digitaal(t)}${variant ? ":2" : ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const alsTekst = (x: Tijd) => (soort === "digitaal" ? digitaal(x) : inWoorden(x));
      const valkuilen =
        soort === "digitaal" ? digitaleValkuilen(t, metDeel) : tijdvalkuilen(t, minuten(inst, ["heel"]));

      const { keuzes, goed } = keuzelijst(
        kans,
        alsTekst(t),
        doorgeschoven(
          valkuilen.filter((v, i) => v !== alsTekst(t) && valkuilen.indexOf(v) === i),
          variant,
        ),
      );

      const gegevens = gegevensVan("klokaflezen", soort, t, goed, { keuze: 1 });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(klokaflezenGenerator, inst, groep, gegevens, {
          zin: metDeel ? dagdeelZin(t) : "",
        }),
        antwoord: String(goed),
        figuur: {
          soort: "klokaflezen",
          uur: t.uur,
          minuut: t.minuut,
          antwoordsoort: soort,
          metDagdeel: metDeel,
          keuzes,
          goed,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Welke klok hoort erbij?
// ---------------------------------------------------------------------------

const KIESZIN = "{zin}";
const KIESZINNEN: Record<Leeftijdsgroep, string> = {
  "34": KIESZIN,
  "56": KIESZIN,
  "78": KIESZIN,
};

/**
 * De plekken waar een verschuiving over gaat.
 *
 * Een instelling en geen vaste lijst in de code: de eigenaar bepaalt welke
 * situaties erin komen, en de waarde staat per sjabloon in de database. De tekst
 * hieronder is alleen de stand waarmee een nieuw sjabloon begint.
 */
const STANDAARD_PLEKKEN = "ga je naar huis, begint het zwembad, komt opa, gaan we naar de speeltuin";

function plekken(inst: Instellingen): string[] {
  return tekst(inst, "plekken", STANDAARD_PLEKKEN)
    .split(/[,\n;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** De sprongen die een verschuiving kan maken, in minuten. */
function sprongen(inst: Instellingen): number[] {
  const uit: number[] = [];
  const uren = Math.max(1, Math.min(6, getal(inst, "maxUren", 5)));
  for (let u = 1; u <= uren; u++) uit.push(u * 60);
  if (vinkje(inst, "halveUren")) {
    for (let u = 0; u <= uren; u++) uit.push(u * 60 + 30);
  }
  return uit.filter((n) => n > 0);
}

/**
 * Hoeveel later of eerder, in woorden: "2 uur", "een half uur", "3 uur en 30
 * minuten".
 *
 * Eén plek, want deze zin staat in de vraag van drie verschillende opdrachten.
 * Zou hij per opdracht opnieuw geschreven worden, dan leest een kind bij de ene
 * oefening "een half uur" en bij de andere "0 uur en 30 minuten".
 */
export function schuifInWoorden(minuten: number): string {
  const m = Math.abs(minuten);
  const uren = Math.floor(m / 60);
  const rest = m % 60;
  if (uren === 0) return rest === 30 ? "een half uur" : `${rest} minuten`;
  if (rest === 0) return uren === 1 ? "1 uur" : `${uren} uur`;
  if (rest === 30) return `${uren} en een half uur`;
  return `${uren} uur en ${rest} minuten`;
}

/**
 * Elke begintijd met een sprong erbij, in een volgorde om af te lopen.
 *
 * Eerst elke tijd één keer met een willekeurige sprong, zodat een ronde zoveel
 * verschillende begintijden krijgt als er zijn. Pas daarna de overige
 * combinaties: met twaalf hele uren zou een ronde anders na twaalf opgaven
 * ophouden, terwijl er met de sprongen erbij veel meer bestaan.
 */
function tijdenMetSprong(
  kans: () => number,
  tijden: Tijd[],
  stappen: number[],
): { t: Tijd; sprong: number }[] {
  const eerst = husselen(kans, tijden).map((t) => ({ t, sprong: kiesUit(kans, stappen) }));
  const rest = husselen(
    kans,
    tijden.flatMap((t) =>
      stappen
        .filter((s) => !eerst.some((e) => e.t === t && e.sprong === s))
        .map((sprong) => ({ t, sprong })),
    ),
  );
  return [...eerst, ...rest];
}

export const klokkiezenGenerator: Generator = {
  id: "klokkiezen",
  naam: "Welke klok hoort erbij?",
  uitleg:
    "Vier wijzerklokken om uit te kiezen. Boven staat de tijd in woorden, een digitale tijd, of een klok met een zin als \"Over 2 uur ga je naar huis\".",
  suggestie: "Groep 4: hele en halve uren in woorden · groep 5: kwartieren",
  velden: [
    {
      soort: "keuze",
      sleutel: "vraag",
      label: "Wat er boven staat",
      opties: [
        { waarde: "woorden", label: "De tijd in woorden — \"Het is half één\"" },
        { waarde: "digitaal", label: "Een digitale tijd — \"6:30\"" },
        { waarde: "verschuiving", label: "Een klok met een zin — \"Over 2 uur …\"" },
      ],
    },
    TIJDENVELD,
    {
      soort: "getal",
      sleutel: "maxUren",
      label: "Hoogste aantal uren later",
      min: 1,
      max: 6,
      hulp: "Alleen bij een klok met een zin.",
    },
    {
      soort: "vinkje",
      sleutel: "halveUren",
      label: "Ook halve uren later",
      hulp: "Alleen bij een klok met een zin: \"Over een half uur …\".",
    },
    {
      soort: "tekst",
      sleutel: "plekken",
      label: "Wat er gebeurt",
      plaatshouder: STANDAARD_PLEKKEN,
      hulp: "Alleen bij een klok met een zin. Per situatie een stukje tekst dat achter \"Over 2 uur\" past, gescheiden door komma's.",
    },
    ...vraagtekstVelden(KIESZINNEN, {
      voorbeeldzinnen: {
        "34": "Het is half één.",
        "56": "Het is half één.",
        "78": "Het is half één.",
      },
      extraHulp: "Op de plek van {zin} komt de zin van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: KIESZINNEN },
  standaard: {
    vraag: "woorden",
    tijden: ["heel", "half"],
    maxUren: 5,
    halveUren: false,
    plekken: STANDAARD_PLEKKEN,
  },
  foutpatronen: tijdPatronen,
  aanpak: wijzerklokAanpak,
  uitleganimatie: wijzerklokUitleg,

  waarschuwing: (inst) => {
    if (tekst(inst, "vraag", "woorden") === "verschuiving" && plekken(inst).length === 0) {
      return "Er staat niets bij \"Wat er gebeurt\". Schrijf er een paar situaties neer, gescheiden door komma's.";
    }
    return null;
  },

  maximum: (inst) => {
    const vraag = tekst(inst, "vraag", "woorden");
    const tijden = alleTijden(inst, ["heel", "half"], false).length;
    return vraag === "verschuiving" ? tijden * sprongen(inst).length : tijden;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const vraag = tekst(inst, "vraag", "woorden");
    const waar = plekken(inst);
    const stappen = sprongen(inst);
    const stap = wijzerstap(inst, ["heel", "half"]);
    const uit: Gegenereerd[] = [];

    /* Ook de digitale tijd in de vraag in 12-uursnotatie: er staat geen dagdeel bij. */
    const tijden = alleTijden(inst, ["heel", "half"], false);
    const reeks = tijdenMetSprong(kans, tijden, vraag === "verschuiving" ? stappen : [0]);

    for (const { t, sprong: schuif } of reeks) {
      if (uit.length >= aantal) break;
      const handtekening = `klokkiezen:${vraag}:${digitaal(t)}:${schuif}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const doel = plusMinuten(t, schuif);
      /*
        Vier klokken: de goede en drie valkuilen die er echt op lijken. Een uur
        ernaast, een half uur ernaast en de minuten verwisseld — precies de
        fouten die een kind maakt. Dubbele vallen weg.
      */
      /*
        Bij alleen hele uren blijven ook de foute klokken op het hele uur (twee
        uur ernaast in plaats van een half uur): een halve-uurklok hoort bij een
        later niveau.
      */
      const fijn = minuten(inst, ["heel", "half"]).every((m) => m === 0)
        ? 120
        : stap === 30
          ? 30
          : stap === 15
            ? 15
            : 5;
      const kandidaten = [
        plusMinuten(doel, 60),
        plusMinuten(doel, -60),
        plusMinuten(doel, fijn),
        plusMinuten(doel, -fijn),
      ];
      const keuzes: Tijd[] = [doel];
      for (const k of kandidaten) {
        if (keuzes.length >= 4) break;
        if (!keuzes.some((x) => x.uur % 12 === k.uur % 12 && x.minuut === k.minuut)) {
          keuzes.push(k);
        }
      }
      /* Op een wijzerklok bestaat geen 13 uur: de klokken in 12-uursnotatie, 1 tot en met 12. */
      const gehusseld = husselen(kans, keuzes).map((k) => ({ uur: k.uur % 12 === 0 ? 12 : k.uur % 12, minuut: k.minuut }));
      const goed = gehusseld.findIndex((k) => k.uur % 12 === doel.uur % 12 && k.minuut === doel.minuut);

      const zin =
        vraag === "verschuiving"
          ? `Over ${schuifInWoorden(schuif)} ${kiesUit(kans, waar.length ? waar : ["ga je naar huis"])}.`
          : vraag === "digitaal"
            ? "Welke klok hoort hierbij?"
            : `Het is ${inWoorden(t)}.`;

      const gegevens = gegevensVan("klokkiezen", vraag, doel, goed, { keuze: 1 });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(klokkiezenGenerator, inst, groep, gegevens, { zin }),
        antwoord: String(goed),
        figuur: {
          soort: "klokkiezen",
          vraag,
          uur: t.uur,
          minuut: t.minuut,
          stap: schuif,
          zin,
          keuzes: gehusseld.map((k) => ({ uur: k.uur, minuut: k.minuut })),
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Zelf de wijzers zetten
// ---------------------------------------------------------------------------

const ZETZIN = "{zin}";
const ZETZINNEN: Record<Leeftijdsgroep, string> = { "34": ZETZIN, "56": ZETZIN, "78": ZETZIN };

export const klokzettenGenerator: Generator = {
  id: "klokzetten",
  naam: "Zet de klok",
  uitleg:
    "Het kind sleept zelf de grote en de kleine wijzer. In de stand \"een tijd\" staat er bijvoorbeeld \"Zet de klok op zes uur\"; in de stand \"zoveel later\" staat er een klok met een zin als \"2 uur later\". De kleine wijzer schuift vanzelf mee met de minuten.",
  suggestie: "Groep 4: hele uren · groep 5: halve uren en kwartieren",
  velden: [
    {
      soort: "keuze",
      sleutel: "opdracht",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "tijd", label: "Een tijd — \"Zet de klok op zes uur\"" },
        { waarde: "verschuiving", label: "Zoveel later of eerder — \"2 uur later\"" },
      ],
    },
    TIJDENVELD,
    {
      soort: "keuze",
      sleutel: "richting",
      label: "Vooruit of terug",
      opties: [
        { waarde: "vooruit", label: "Vooruit — later" },
        { waarde: "terug", label: "Terug — eerder" },
      ],
      hulp: "Alleen bij \"zoveel later of eerder\".",
    },
    {
      soort: "getal",
      sleutel: "maxUren",
      label: "Hoogste aantal uren",
      min: 1,
      max: 6,
      hulp: "Alleen bij \"zoveel later of eerder\".",
    },
    {
      soort: "vinkje",
      sleutel: "halveUren",
      label: "Ook halve uren",
      hulp: "Alleen bij \"zoveel later of eerder\": dan komt er ook \"een half uur later\" voor.",
    },
    ...vraagtekstVelden(ZETZINNEN, {
      voorbeeldzinnen: {
        "34": "Zet de klok op zes uur.",
        "56": "Zet de klok op zes uur.",
        "78": "Zet de klok op zes uur.",
      },
      extraHulp: "Op de plek van {zin} komt de opdracht van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: ZETZINNEN },
  standaard: {
    opdracht: "tijd",
    tijden: ["heel"],
    richting: "vooruit",
    maxUren: 3,
    halveUren: false,
  },
  foutpatronen: tijdPatronen,
  aanpak: klokzettenAanpak,
  uitleganimatie: klokzettenUitleg,

  /*
    Bij de stand "tijd" komt elke tijd twee keer: de tweede keer beginnen de
    wijzers ergens anders dan op twaalf uur.
  */
  maximum: (inst) => {
    const tijden = alleTijden(inst, ["heel"], false).length;
    return tekst(inst, "opdracht", "tijd") === "verschuiving"
      ? tijden * sprongen(inst).length
      : tijden * 2;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const opdracht = tekst(inst, "opdracht", "tijd");
    const terug = tekst(inst, "richting", "vooruit") === "terug";
    const stap = wijzerstap(inst, ["heel"]);
    const stappen = sprongen(inst);
    const uit: Gegenereerd[] = [];

    /*
      Bij een verschuiving zijn de sprongen de tweede variant; bij de stand
      "tijd" is dat de beginstand van de wijzers: sprong 1 betekent hier
      "begin niet op twaalf uur".
    */
    const reeks = tijdenMetSprong(
      kans,
      alleTijden(inst, ["heel"], false),
      opdracht === "verschuiving" ? stappen : [0, 1],
    );
    for (const { t, sprong } of reeks) {
      if (uit.length >= aantal) break;
      const minutenSchuif = opdracht === "verschuiving" ? (terug ? -1 : 1) * sprong : 0;
      const anderBegin = opdracht !== "verschuiving" && sprong === 1;
      const handtekening = `klokzetten:${opdracht}:${digitaal(t)}:${minutenSchuif}${anderBegin ? ":2" : ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const doel = plusMinuten(t, minutenSchuif);
      const zin =
        opdracht === "verschuiving"
          ? `Het is ${inWoorden(t)}. Zet de klok ${schuifInWoorden(minutenSchuif)} ${terug ? "eerder" : "later"}.`
          : `Zet de klok op ${inWoorden(t)}.`;

      const gegevens = gegevensVan("klokzetten", opdracht, t, doel.uur % 12, {
        antwoordUur: doel.uur % 12,
        antwoordMinuut: doel.minuut,
      });

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(klokzettenGenerator, inst, groep, gegevens, { zin }),
        antwoord: `${doel.uur % 12},${doel.minuut}`,
        figuur: {
          soort: "klokzetten",
          opdracht,
          uur: t.uur,
          minuut: t.minuut,
          schuif: minutenSchuif,
          zin,
          stap,
          /*
            Waar de wijzers beginnen. Normaal op twaalf uur, maar nooit al op
            het antwoord: dan zou er niets te zetten zijn.
          */
          begin: anderBegin
            ? { uur: (doel.uur + 6) % 12, minuut: 0 }
            : doel.uur % 12 === 0 && doel.minuut === 0
              ? { uur: 3, minuut: 0 }
              : { uur: 0, minuut: 0 },
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Klokken koppelen
// ---------------------------------------------------------------------------

const KOPPELZIN = "Sleep elke tijd naar de goede klok.";
const KOPPELZINNEN: Record<Leeftijdsgroep, string> = {
  "34": KOPPELZIN,
  "56": KOPPELZIN,
  "78": KOPPELZIN,
};

export const klokkoppelenGenerator: Generator = {
  id: "klokkoppelen",
  naam: "Klokken koppelen",
  uitleg:
    "Drie wijzerklokken met naast elke klok een leeg vakje; de digitale tijden liggen eronder klaar. Het kind sleept elke tijd naar de klok waar hij bij hoort; tikken werkt ook.",
  suggestie: "Groep 4: hele en halve uren door elkaar, drie klokken",
  velden: [
    TIJDENVELD,
    {
      soort: "getal",
      sleutel: "hoeveel",
      label: "Hoeveel klokken",
      min: 2,
      max: 4,
      hulp: "Alle tijden zijn verschillend, zodat er precies één goede indeling is.",
    },
    ...vraagtekstVelden(KOPPELZINNEN),
  ],
  vraagteksten: { standaard: KOPPELZINNEN },
  standaard: { tijden: ["heel", "half"], hoeveel: 3 },
  foutpatronen: tijdPatronen,
  aanpak: wijzerklokAanpak,
  uitleganimatie: wijzerklokUitleg,

  maximum: (inst) => {
    const n = alleTijden(inst, ["heel", "half"], false).length;
    const hoeveel = Math.max(2, Math.min(4, getal(inst, "hoeveel", 3)));
    return n < hoeveel ? 0 : n * 20;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const hoeveel = Math.max(2, Math.min(4, getal(inst, "hoeveel", 3)));
    const voorraad = alleTijden(inst, ["heel", "half"], false);
    if (voorraad.length < hoeveel) return [];
    const uit: Gegenereerd[] = [];

    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const klokken = husselen(kans, voorraad).slice(0, hoeveel);
      const handtekening = `klokkoppelen:${klokken.map(digitaal).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const keuzes = husselen(kans, klokken);
      const antwoord = klokken
        .map((k) => keuzes.findIndex((c) => c.uur === k.uur && c.minuut === k.minuut))
        .join(",");

      const gegevens = gegevensVan("klokkoppelen", "slepen", klokken[0], 0, { keuze: 1 });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(klokkoppelenGenerator, inst, groep, gegevens),
        antwoord,
        figuur: {
          soort: "klokkoppelen",
          klokken: klokken.map((k) => ({ uur: k.uur, minuut: k.minuut })),
          keuzes: keuzes.map((k) => ({ uur: k.uur, minuut: k.minuut })),
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Klokken op volgorde
// ---------------------------------------------------------------------------

const VOLGORDEZIN = "Het is ochtend. Zet de klokken op volgorde van vroeg naar laat.";
const VOLGORDEZINNEN: Record<Leeftijdsgroep, string> = {
  "34": VOLGORDEZIN,
  "56": VOLGORDEZIN,
  "78": VOLGORDEZIN,
};

/**
 * De tijden voor "Klokken op volgorde": alleen de ochtend, 06:00 tot en met
 * 11:59, en nooit over de 12 heen.
 *
 * Op een wijzerklok is acht uur 's ochtends hetzelfde als acht uur 's avonds,
 * en 12:00 komt ná 11:00 maar staat op de klok vooraan. Met alleen
 * ochtendtijden en "Het is ochtend" in de vraag is er precies één goede
 * volgorde.
 */
function ochtendtijden(inst: Instellingen): Tijd[] {
  return alleTijden(inst, ["heel", "half"], false).filter((t) => t.uur >= 6 && t.uur <= 11);
}

export const klokkenvolgordeGenerator: Generator = {
  id: "klokkenvolgorde",
  naam: "Klokken op volgorde",
  uitleg:
    "Vier wijzerklokken die het kind van vroeg naar laat sleept. Een wijzerklok laat geen ochtend of avond zien; daarom zijn het altijd ochtendtijden, van 06:00 tot en met 11:30, en zegt de vraag \"Het is ochtend\". Alle tijden zijn verschillend, dus er is precies één goede volgorde.",
  suggestie: "Groep 4: hele en halve uren, vier klokken",
  velden: [
    TIJDENVELD,
    {
      soort: "getal",
      sleutel: "hoeveel",
      label: "Hoeveel klokken",
      min: 3,
      max: 5,
    },
    ...vraagtekstVelden(VOLGORDEZINNEN),
  ],
  vraagteksten: { standaard: VOLGORDEZINNEN },
  standaard: { tijden: ["heel", "half"], hoeveel: 4 },
  foutpatronen: tijdPatronen,
  aanpak: wijzerklokAanpak,
  uitleganimatie: wijzerklokUitleg,

  maximum: (inst) => {
    const n = ochtendtijden(inst).length;
    const hoeveel = Math.max(3, Math.min(5, getal(inst, "hoeveel", 4)));
    return n < hoeveel ? 0 : n * 20;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const hoeveel = Math.max(3, Math.min(5, getal(inst, "hoeveel", 4)));
    const voorraad = ochtendtijden(inst);
    if (voorraad.length < hoeveel) return [];
    const uit: Gegenereerd[] = [];

    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const klokken = husselen(kans, voorraad).slice(0, hoeveel);
      const handtekening = `klokkenvolgorde:${klokken.map(digitaal).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /* Per plek van vroeg naar laat het nummer van de klok die daar hoort. */
      const antwoord = klokken
        .map((_, i) => i)
        .sort((a, b) => klokken[a].uur * 60 + klokken[a].minuut - (klokken[b].uur * 60 + klokken[b].minuut))
        .join(",");

      const gegevens = gegevensVan("klokkenvolgorde", "slepen", klokken[0], 0, { keuze: 1 });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(klokkenvolgordeGenerator, inst, groep, gegevens),
        antwoord,
        figuur: {
          soort: "klokkenvolgorde",
          klokken: klokken.map((k) => ({ uur: k.uur, minuut: k.minuut })),
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Schrijf de tijd digitaal
// ---------------------------------------------------------------------------

const TYPZIN = "{zin} Schrijf de tijd digitaal.";
const TYPZINNEN: Record<Leeftijdsgroep, string> = { "34": TYPZIN, "56": TYPZIN, "78": TYPZIN };

export const kloktypenGenerator: Generator = {
  id: "kloktypen",
  naam: "Schrijf de tijd digitaal",
  uitleg:
    "Een wijzerklok met het dagdeel erbij; het kind typt de tijd in twee vakjes: ▢ : ▢. In 24-uursnotatie, dus 's avonds wordt acht uur 20:00.",
  suggestie: "Groep 4: hele en halve uren, met het dagdeel erbij",
  velden: [
    TIJDENVELD,
    {
      soort: "vinkje",
      sleutel: "metDagdeel",
      label: "Zet het dagdeel erbij",
      hulp: "Nodig voor 24-uursnotatie: zonder \"Het is avond\" is 20:00 niet van 08:00 te onderscheiden.",
    },
    DAGBEREIKVELD,
    ...vraagtekstVelden(TYPZINNEN, {
      voorbeeldzinnen: {
        "34": "Het is avond. Schrijf de tijd digitaal.",
        "56": "Het is avond. Schrijf de tijd digitaal.",
        "78": "Het is avond. Schrijf de tijd digitaal.",
      },
      extraHulp: "Op de plek van {zin} komt het dagdeel te staan.",
    }),
  ],
  vraagteksten: { standaard: TYPZINNEN },
  standaard: { tijden: ["heel", "half"], metDagdeel: true },
  foutpatronen: tijdPatronen,
  aanpak: wijzerklokAanpak,
  uitleganimatie: wijzerklokUitleg,

  maximum: (inst) => wijzertijden(inst, ["heel", "half"], vinkje(inst, "metDagdeel", true)).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const metDeel = vinkje(inst, "metDagdeel", true);
    const uit: Gegenereerd[] = [];

    for (const t of husselen(kans, wijzertijden(inst, ["heel", "half"], metDeel))) {
      if (uit.length >= aantal) break;
      const handtekening = `kloktypen:${digitaal(t)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = gegevensVan("kloktypen", "typen", t, t.uur, {
        antwoordUur: t.uur,
        antwoordMinuut: t.minuut,
      });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(kloktypenGenerator, inst, groep, gegevens, {
          zin: metDeel ? dagdeelZin(t) : "",
        }),
        /*
          Zonder dagdeel is de tijd met twaalf uur verschil ook goed: op de
          wijzerklok is zes uur net zo goed 18:00. Met dagdeel hoort het in
          24-uursnotatie, want daar gaat de opdracht dan juist over.
        */
        antwoord: metDeel
          ? `${t.uur},${t.minuut}`
          : `${t.uur},${t.minuut}|${(t.uur + 12) % 24},${t.minuut}`,
        figuur: { soort: "kloktypen", uur: t.uur, minuut: t.minuut, metDagdeel: metDeel },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// De grote en de kleine wijzer
// ---------------------------------------------------------------------------

const WIJZERZIN = "{zin}";
const WIJZERZINNEN: Record<Leeftijdsgroep, string> = {
  "34": WIJZERZIN,
  "56": WIJZERZIN,
  "78": WIJZERZIN,
};

export const wijzeraanwijzenGenerator: Generator = {
  id: "wijzeraanwijzen",
  naam: "De grote en de kleine wijzer",
  uitleg:
    "Een wijzerklok, en het kind kiest de wijzer die gevraagd wordt: die van de uren (de korte) of die van de minuten (de lange).",
  suggestie: "Groep 4: hele en halve uren",
  velden: [TIJDENVELD, ...vraagtekstVelden(WIJZERZINNEN, {
    voorbeeldzinnen: {
      "34": "Tik op de wijzer van de uren.",
      "56": "Tik op de wijzer van de uren.",
      "78": "Tik op de wijzer van de uren.",
    },
    extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan.",
  })],
  vraagteksten: { standaard: WIJZERZINNEN },
  standaard: { tijden: ["heel", "half"] },
  foutpatronen: tijdPatronen,
  aanpak: wijzeraanwijzenAanpak,
  uitleganimatie: wijzeraanwijzenUitleg,

  maximum: (inst) => alleTijden(inst, ["heel", "half"], false).length * 2,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const uit: Gegenereerd[] = [];

    const alles = alleTijden(inst, ["heel", "half"], false).flatMap((t) => [
      { t, gevraagd: "uur" },
      { t, gevraagd: "minuut" },
    ]);

    for (const { t, gevraagd } of husselen(kans, alles)) {
      if (uit.length >= aantal) break;
      const handtekening = `wijzeraanwijzen:${digitaal(t)}:${gevraagd}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const zin =
        gevraagd === "uur" ? "Tik op de wijzer van de uren." : "Tik op de wijzer van de minuten.";
      const gegevens = gegevensVan("wijzeraanwijzen", gevraagd, t, gevraagd === "uur" ? 0 : 1, {
        keuze: 1,
        uurwijzer: gevraagd === "uur" ? 1 : 0,
      });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(wijzeraanwijzenGenerator, inst, groep, gegevens, { zin }),
        antwoord: gevraagd === "uur" ? "0" : "1",
        figuur: { soort: "wijzeraanwijzen", uur: t.uur, minuut: t.minuut, gevraagd },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Klopt de klok?
// ---------------------------------------------------------------------------

const KLOPTZIN = "Klopt dit?";
const KLOPTZINNEN: Record<Leeftijdsgroep, string> = {
  "34": KLOPTZIN,
  "56": KLOPTZIN,
  "78": KLOPTZIN,
};

export const klokkloptGenerator: Generator = {
  id: "klokklopt",
  naam: "Klopt de klok?",
  uitleg:
    "Een wijzerklok met een zin erbij, bijvoorbeeld \"Het is half drie\", en het kind kiest Ja of Nee. De helft van de opgaven klopt, de andere helft zit er net naast.",
  suggestie: "Groep 4: hele en halve uren",
  velden: [TIJDENVELD, ...vraagtekstVelden(KLOPTZINNEN)],
  vraagteksten: { standaard: KLOPTZINNEN },
  standaard: { tijden: ["heel", "half"] },
  foutpatronen: tijdPatronen,
  aanpak: wijzerklokAanpak,
  uitleganimatie: wijzerklokUitleg,

  maximum: (inst) => alleTijden(inst, ["heel", "half"], false).length * 2,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stap = wijzerstap(inst, ["heel", "half"]);
    const uit: Gegenereerd[] = [];

    const alles = alleTijden(inst, ["heel", "half"], false).flatMap((t) => [
      { t, klopt: true },
      { t, klopt: false },
    ]);

    for (const { t, klopt } of husselen(kans, alles)) {
      if (uit.length >= aantal) break;
      const handtekening = `klokklopt:${digitaal(t)}:${klopt ? "ja" : "nee"}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        Zit de bewering ernaast, dan is het net ernaast: een uur eroverheen of
        een half uur verschoven. Dat zijn de twee fouten die een kind zelf
        maakt, en dus precies wat het moet leren onderscheiden.
      */
      const scheef = plusMinuten(t, kans() < 0.5 ? 60 : stap === 30 ? 30 : 60);
      const bewering = `Het is ${inWoorden(klopt ? t : scheef)}.`;

      const gegevens = gegevensVan("klokklopt", klopt ? "klopt" : "scheef", t, klopt ? 0 : 1, {
        keuze: 1,
      });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(klokkloptGenerator, inst, groep, gegevens),
        antwoord: klopt ? "0" : "1",
        figuur: { soort: "klokklopt", uur: t.uur, minuut: t.minuut, bewering, klopt },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Hoe lang duurt het?
// ---------------------------------------------------------------------------

const DUURZIN = "{zin}";
const DUURZINNEN: Record<Leeftijdsgroep, string> = { "34": DUURZIN, "56": DUURZIN, "78": DUURZIN };

/**
 * De situaties waar de verhaaltjes over gaan.
 *
 * Een instelling en geen vaste lijst in de code: de eigenaar bepaalt waar het
 * over gaat, en de waarde staat per sjabloon in de database. De tekst hieronder
 * is alleen de stand waarmee een nieuw sjabloon begint.
 */
const STANDAARD_SITUATIES = "het zwembad, school, de film, opa en oma, de speeltuin";

function situaties(inst: Instellingen): string[] {
  return tekst(inst, "situaties", STANDAARD_SITUATIES)
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** De stappen die een duur kan hebben, in minuten. */
function duurstappen(inst: Instellingen): number[] {
  const soort = tekst(inst, "stap", "heel");
  const uren = Math.max(1, Math.min(6, getal(inst, "maxUren", 4)));
  const uit: number[] = [];
  for (let u = 1; u <= uren; u++) {
    if (soort === "heel" || soort === "gemengd") uit.push(u * 60);
    if (soort === "half" || soort === "gemengd") uit.push(u * 60 - 30);
    if (soort === "kwartier" || soort === "gemengd") {
      uit.push(u * 60 - 45, u * 60 - 15);
    }
  }
  if (soort === "half" || soort === "gemengd") uit.push(30);
  if (soort === "kwartier" || soort === "gemengd") uit.push(15, 45);
  return [...new Set(uit)].filter((n) => n > 0).sort((a, b) => a - b);
}

/**
 * De vier knoppen bij kiezen, in schooltaal en van kort naar lang. Ze staan
 * altijd in deze volgorde; alleen welke goed is verschilt.
 */
const DUURKNOPPEN: Record<string, { minuten: number; tekst: string }[]> = {
  heel: [
    { minuten: 60, tekst: "een uur" },
    { minuten: 120, tekst: "twee uur" },
    { minuten: 180, tekst: "drie uur" },
    { minuten: 240, tekst: "vier uur" },
  ],
  half: [
    { minuten: 30, tekst: "een half uur" },
    { minuten: 60, tekst: "een uur" },
    { minuten: 90, tekst: "anderhalf uur" },
    { minuten: 120, tekst: "twee uur" },
  ],
  kwartier: [
    { minuten: 15, tekst: "een kwartier" },
    { minuten: 30, tekst: "een half uur" },
    { minuten: 45, tekst: "drie kwartier" },
    { minuten: 60, tekst: "een uur" },
  ],
};

/** Kiezen uit vier knoppen? Alleen bij hele uren, halve uren of kwartieren apart. */
function duurKiezen(inst: Instellingen): boolean {
  return tekst(inst, "antwoord", "typen") === "kiezen" && !!DUURKNOPPEN[tekst(inst, "stap", "heel")];
}

export const klokduurGenerator: Generator = {
  id: "klokduur",
  naam: "Hoe lang duurt het?",
  uitleg:
    "Een wijzerklok die laat zien hoe laat het nu is, en een korte zin met de andere tijd. Dezelfde tijd staat nooit in de zin én op de klok. Het kind kiest het antwoord uit vier knoppen in schooltaal (\"een half uur\", \"anderhalf uur\"), of typt het in twee vakjes: ▢ uur ▢ minuten.",
  suggestie: "Groep 4: hele uren · groep 5: halve uren · groep 6: kwartieren en alles door elkaar",
  velden: [
    {
      soort: "keuze",
      sleutel: "richting",
      label: "Vooruit of terug",
      opties: [
        { waarde: "duur", label: "Hoe lang duurt het — vooruit" },
        { waarde: "geleden", label: "Hoe lang geleden — terug" },
        { waarde: "beide", label: "Allebei, door elkaar" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "stap",
      label: "Welke tijden",
      opties: [
        { waarde: "heel", label: "Hele uren" },
        { waarde: "half", label: "Halve uren" },
        { waarde: "kwartier", label: "Kwartieren" },
        { waarde: "gemengd", label: "Alles door elkaar" },
      ],
    },
    {
      soort: "getal",
      sleutel: "maxUren",
      label: "Hoogste aantal uren",
      min: 1,
      max: 6,
    },
    {
      soort: "keuze",
      sleutel: "antwoord",
      label: "Hoe het kind antwoordt",
      opties: [
        { waarde: "kiezen", label: "Kiezen uit vier knoppen — \"een uur\", \"anderhalf uur\" (alleen bij hele uren, halve uren of kwartieren)" },
        { waarde: "typen", label: "Typen in twee vakjes — ▢ uur ▢ minuten" },
      ],
    },
    {
      soort: "vinkje",
      sleutel: "over12",
      label: "Ook over twaalf uur heen",
      hulp: "Bijvoorbeeld van 11 uur 's ochtends tot 2 uur 's middags.",
    },
    {
      soort: "tekst",
      sleutel: "situaties",
      label: "Waar de verhaaltjes over gaan",
      plaatshouder: STANDAARD_SITUATIES,
      hulp: "Per situatie een paar woorden, gescheiden door komma's.",
    },
    ...vraagtekstVelden(DUURZINNEN, {
      voorbeeldzinnen: {
        "34": "Je gaat om 3 uur naar het zwembad. Kijk op de klok hoe laat je klaar bent. Hoe lang duurde het?",
        "56": "Je gaat om 3 uur naar het zwembad. Kijk op de klok hoe laat je klaar bent. Hoe lang duurde het?",
        "78": "Je gaat om 3 uur naar het zwembad. Kijk op de klok hoe laat je klaar bent. Hoe lang duurde het?",
      },
      extraHulp: "Op de plek van {zin} komt het verhaaltje van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: DUURZINNEN },
  standaard: {
    richting: "duur",
    stap: "heel",
    antwoord: "typen",
    maxUren: 4,
    over12: false,
    situaties: STANDAARD_SITUATIES,
  },
  foutpatronen: tijdPatronen,
  aanpak: duurAanpak,
  uitleganimatie: duurUitleg,

  waarschuwing: (inst) => {
    if (situaties(inst).length === 0) {
      return "Er staat geen enkele situatie. Schrijf er een paar neer, gescheiden door komma's.";
    }
    if (duurstappen(inst).length === 0) {
      return "Met deze instellingen bestaat er geen enkele duur. Zet het hoogste aantal uren hoger.";
    }
    return null;
  },

  maximum: (inst) => {
    const kanten = tekst(inst, "richting", "duur") === "beide" ? 2 : 1;
    /* Begintijden op het hele en halve uur binnen de dag, maal de stappen. */
    const begin = vinkje(inst, "over12") ? 24 * 2 : 12 * 2;
    const stappen = duurKiezen(inst) ? 4 : duurstappen(inst).length;
    return begin * stappen * kanten;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const richting = tekst(inst, "richting", "duur");
    const kiezen = duurKiezen(inst);
    const knoppen = kiezen ? DUURKNOPPEN[tekst(inst, "stap", "heel")] : null;
    const stappen = knoppen ? knoppen.map((k) => k.minuten) : duurstappen(inst);
    const waar = situaties(inst);
    const over12 = vinkje(inst, "over12");
    if (stappen.length === 0 || waar.length === 0) return [];

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /*
        De begintijd ligt op een heel of half uur, binnen de ochtend en de
        middag. Zonder "over twaalf heen" blijft de hele opgave aan één kant van
        de middag, zodat een kind niet over de twaalf hoeft te rekenen.
      */
      const beginUur = over12 ? 8 + Math.floor(kans() * 8) : 1 + Math.floor(kans() * 8);
      /*
        Bij hele uren beginnen de opgaven ook op het hele uur: een begin op half
        hoort bij het niveau van de halve uren (de leerlijn van school).
      */
      const beginMinuut = tekst(inst, "stap", "heel") === "heel" ? 0 : kans() < 0.5 ? 0 : 30;
      const stap = kiesUit(kans, stappen);
      const start: Tijd = { uur: beginUur, minuut: beginMinuut };
      const eind = plusMinuten(start, stap);
      /* Zonder "over twaalf heen" mag de eindtijd niet over het middaguur. */
      if (!over12 && eind.uur >= 12) continue;
      if (over12 && eind.uur >= 20) continue;

      const terug = richting === "geleden" || (richting === "beide" && kans() < 0.5);
      /*
        De klok laat altijd "nu" zien: de tijd dat je klaar bent, of de tijd
        van nu. De zin noemt alleen de andere tijd, zodat dezelfde tijd nooit
        twee keer in beeld staat en het kind echt op de klok moet kijken.
      */
      const opDeKlok = eind;
      const inDeZin = start;

      const handtekening = `klokduur:${terug ? "geleden" : "duur"}:${digitaal(start)}-${stap}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const plek = kiesUit(kans, waar);
      const zin = terug
        ? `Om ${inWoorden(inDeZin)} ging je naar ${plek}. Kijk hoe laat het nu is. Hoe lang geleden is dat?`
        : `Je gaat om ${inWoorden(inDeZin)} naar ${plek}. Kijk op de klok hoe laat je klaar bent. Hoe lang duurde het?`;

      const d = verschil(start, eind);
      const goedeKnop = knoppen ? knoppen.findIndex((k) => k.minuten === stap) : -1;
      const gegevens = gegevensVan(
        "klokduur",
        terug ? "geleden" : "duur",
        opDeKlok,
        d.uren,
        knoppen
          ? { antwoordUur: d.uren, antwoordMinuut: d.minuten, keuze: 1 }
          : { antwoordUur: d.uren, antwoordMinuut: d.minuten },
      );

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(klokduurGenerator, inst, groep, gegevens, { zin }),
        antwoord: knoppen ? String(goedeKnop) : `${d.uren},${d.minuten}`,
        figuur: {
          soort: "klokduur",
          uur: opDeKlok.uur,
          minuut: opDeKlok.minuut,
          andereUur: inDeZin.uur,
          andereMinuut: inDeZin.minuut,
          richting: terug ? "geleden" : "duur",
          zin,
          klokIsNu: true,
          keuzes: knoppen ? knoppen.map((k) => k.tekst) : null,
          goed: knoppen ? goedeKnop : undefined,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Wijzerklok met vlekken
// ---------------------------------------------------------------------------

const VLEKZIN = "Hoe laat is het?";
const VLEKZINNEN: Record<Leeftijdsgroep, string> = { "34": VLEKZIN, "56": VLEKZIN, "78": VLEKZIN };

/** De kleuren die een vlek kan hebben; rustig, en nooit de kleur van een wijzer. */
const VLEKKLEUREN = [
  "var(--color-lucht-zacht)",
  "var(--color-mint-zacht)",
  "var(--color-viool-zacht)",
  "var(--color-amber-zacht)",
];

export const klokvlekGenerator: Generator = {
  id: "klokvlek",
  naam: "Wijzerklok met een vlek",
  uitleg:
    "Een wijzerklok met een vlek erop; het kind kiest de tijd uit vier antwoorden in woorden. De vlek bedekt cijfers of een stukje wijzer, maar de tijd blijft altijd te bepalen: van de kleine wijzer blijft minstens het puntje zichtbaar.",
  suggestie: "Groep 4: hele uren met de cijfers bedekt · groep 6: gemengd met een grote vlek",
  velden: [
    TIJDENVELD,
    {
      soort: "keuze",
      sleutel: "vlek",
      label: "Waar de vlek ligt",
      opties: [
        { waarde: "cijfers", label: "Over een paar cijfers — de wijzers blijven heel" },
        { waarde: "wijzer", label: "Over een stukje van de kleine wijzer" },
        { waarde: "groot", label: "Over het midden — alleen de puntjes zichtbaar" },
      ],
    },
    {
      soort: "vinkje",
      sleutel: "metUitleg",
      label: "Begin met een korte uitleg",
      hulp: "Dan staat er boven de klok hoe je een tijd onder een vlek nog kunt bepalen.",
    },
    ...vraagtekstVelden(VLEKZINNEN),
  ],
  vraagteksten: { standaard: VLEKZINNEN },
  standaard: { tijden: ["heel"], vlek: "cijfers", metUitleg: false },
  foutpatronen: tijdPatronen,
  aanpak: wijzerklokAanpak,
  uitleganimatie: wijzerklokUitleg,

  /* Elke tijd twee keer: de tweede keer ligt de vlek ergens anders. */
  maximum: (inst) => alleTijden(inst, ["heel"], false).length * 2,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const waar = tekst(inst, "vlek", "cijfers");
    const uit: Gegenereerd[] = [];

    for (const { item: t, variant } of metTweedeVariant(kans, alleTijden(inst, ["heel"], false))) {
      if (uit.length >= aantal) break;
      const handtekening = `klokvlek:${waar}:${digitaal(t)}${variant ? ":2" : ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const { keuzes, goed } = keuzelijst(kans, inWoorden(t), tijdvalkuilen(t, minuten(inst, ["heel"])));

      /*
        Waar de vlek komt te liggen.

        De tijd moet altijd nog te bepalen zijn (WERKPLAN.md), en dat regelt
        de plek: bij "cijfers" ligt de vlek aan de rand, aan de kant waar géén
        wijzer staat; bij "wijzer" ligt hij halverwege de kleine wijzer, zodat
        het puntje vrij blijft; bij "groot" ligt hij op het midden, en dan zijn
        alleen de puntjes van de wijzers nog te zien.
      */
      const uurhoek = (t.uur % 12) * 30 + t.minuut * 0.5;
      const minuuthoek = t.minuut * 6;
      /*
        De tweede variant: bij "cijfers" schuift de vlek een stuk langs de rand,
        maar alleen naar een plek waar hij minstens 45 graden van beide wijzers
        af blijft; bij "wijzer" ligt hij dichter bij het midden, zodat het
        puntje van de kleine wijzer nog verder vrij is; bij "groot" is hij iets
        kleiner, met de puntjes nog altijd zichtbaar.
      */
      const verschil = (a: number, b: number) => {
        const d = Math.abs((((a - b) % 360) + 360) % 360);
        return Math.min(d, 360 - d);
      };
      const tegenover = (uurhoek + minuuthoek) / 2 + 180;
      const randhoek =
        variant === 0
          ? tegenover
          : ([60, -60, 90, -90, 120, -120]
              .map((d) => tegenover + d)
              .find((h) => verschil(h, uurhoek) >= 45 && verschil(h, minuuthoek) >= 45) ??
            tegenover + 180);
      const vlek =
        waar === "groot"
          ? {
              hoek: 0,
              afstand: 0,
              grootte: variant === 0 ? 0.32 : 0.28,
              kleur: kiesUit(kans, VLEKKLEUREN),
            }
          : waar === "wijzer"
            ? {
                hoek: uurhoek,
                afstand: variant === 0 ? 0.2 : 0.16,
                grootte: 0.12,
                kleur: kiesUit(kans, VLEKKLEUREN),
              }
            : {
                /* Aan de rand, uit de buurt van de twee wijzers. */
                hoek: randhoek,
                afstand: 0.72,
                grootte: 0.2,
                kleur: kiesUit(kans, VLEKKLEUREN),
              };

      const gegevens = gegevensVan("klokvlek", waar, t, goed, { keuze: 1 });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(klokvlekGenerator, inst, groep, gegevens),
        antwoord: String(goed),
        figuur: { soort: "klokvlek", uur: t.uur, minuut: t.minuut, keuzes, goed, vlek },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};
