/**
 * De opdrachten van onderwerp 3 van Tijd: de digitale klok.
 *
 *   digitaaldelen      tik op het urendeel of het minutendeel
 *   digitaaldagdeel    een korte situatie; kies "zeven uur 's ochtends"
 *   digitaalaflezen    een digitale tijd; kies de tijd in woorden
 *   digitaalverschil   twee klokken; hoeveel tijd zit ertussen?
 *
 * ---------------------------------------------------------------------------
 * De afspraken van dit onderwerp
 * ---------------------------------------------------------------------------
 * Uit WERKPLAN.md, en ze gelden voor alle vier:
 *
 *   - tijden staan als digitale klok, uren:minuten, altijd twee cijfers;
 *   - bij aflezen kiest het kind uit vier antwoorden in woorden, en de foute
 *     keuzes zijn echte valkuilen: bij 05:30 staan er ook "half vijf" en "vijf
 *     uur" tussen;
 *   - bij Tijd vooruit en Tijd terug ziet het kind twee klokken en typt het
 *     antwoord in twee vakjes: ▢ uur ▢ minuten. Gewoon typen, geen getallenpad
 *     op het scherm (HARDE REGEL 5);
 *   - daar mogen 24-uurstijden voorkomen, bijvoorbeeld 18:30;
 *   - en, op verzoek van de eigenaar: het kind vult beide vakjes in; is het
 *     verschil hele uren, dan typt het 0 bij de minuten. Een leeg vakje telt
 *     niet als 0. Zie `minutenMagLeeg` in `tijdfiguren.ts`.
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
  DAGDEEL_LABEL,
  dagdeelVan,
  digitaal,
  inWoorden,
  metDagdeel,
  plusMinuten,
  uitMinuten,
  verschil,
  type Tijd,
} from "@/lib/tijd";
import { tijdPatronen } from "@/lib/generatoren/patronen/tijd";
import { dagdeelAanpak, digitaalAanpak, duurAanpak } from "@/lib/generatoren/aanpak/tijd";
import { dagdeelUitleg, digitaalUitleg, duurUitleg } from "@/lib/generatoren/scripts/tijd";

/**
 * De minutengroepen van dit onderwerp.
 *
 * Dezelfde leerlijn als bij de wijzerklok, want het is dezelfde klok: eerst het
 * hele uur, dan het halve, dan de kwartieren, dan vijf over en voor, en als
 * laatste elke minuut.
 */
const GROEPEN: Record<string, number[]> = {
  heel: [0],
  half: [30],
  kwartier: [15, 45],
  vijf: [5, 10, 20, 25, 35, 40, 50, 55],
  minuut: Array.from({ length: 60 }, (_, i) => i).filter(
    (m) => m % 5 !== 0,
  ),
};

const TIJDENVELD: Veld = {
  soort: "vinkjes",
  sleutel: "tijden",
  label: "Welke tijden",
  opties: [
    { waarde: "heel", label: "Hele uren — 08:00" },
    { waarde: "half", label: "Halve uren — 05:30" },
    { waarde: "kwartier", label: "Kwartieren — 03:15 en 03:45" },
    { waarde: "vijf", label: "Vijf en tien over en voor — 07:10" },
    { waarde: "minuut", label: "Op de minuut — 05:43" },
  ],
  hulp: "De minuten die in deze oefening voorkomen. Eén groep aanvinken geeft één soort tijd; meer groepen geeft ze door elkaar.",
};

function groepen(inst: Instellingen, terugval: string[]): string[] {
  const gekozen = lijst(inst, "tijden", terugval).filter((g) => g in GROEPEN);
  return gekozen.length ? gekozen : terugval;
}

/**
 * Alle tijden die bij deze instellingen horen.
 *
 * Standaard in 12-uursnotatie: 01:00 tot en met 12:59. Dat is de leerlijn van
 * school — 24-uurstijden komen pas met het dagdeel erbij (niveau 4) of zonder
 * hulp (niveau 5). Met `uren24` alle uren van het etmaal, 00 tot en met 23.
 */
function alleTijden(inst: Instellingen, terugval: string[], uren24 = vinkje(inst, "uren24")): Tijd[] {
  const minuten = new Set<number>();
  for (const g of groepen(inst, terugval)) for (const m of GROEPEN[g]) minuten.add(m);

  const uren = uren24
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);
  const uit: Tijd[] = [];
  for (const u of uren) {
    for (const m of [...minuten].sort((a, b) => a - b)) uit.push({ uur: u, minuut: m });
  }
  return uit;
}

/** De instelling voor 24-uurstijden, voor de types van de digitale klok. */
const URENVELD: Veld = {
  soort: "vinkje",
  sleutel: "uren24",
  label: "Ook tijden van 13:00 en later",
  hulp: "Uit = alleen 12-uursnotatie, 01:00 tot en met 12:59. Aan = alle uren, zonder dagdeel erbij (het hoogste niveau).",
};

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

/** Vier antwoorden met precies één goede; dubbele vallen weg. */
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

// ---------------------------------------------------------------------------
// Uren en minuten op de digitale klok
// ---------------------------------------------------------------------------

const DELENZIN = "{zin}";
const DELENZINNEN: Record<Leeftijdsgroep, string> = {
  "34": DELENZIN,
  "56": DELENZIN,
  "78": DELENZIN,
};

export const digitaaldelenGenerator: Generator = {
  id: "digitaaldelen",
  naam: "Uren en minuten op de digitale klok",
  uitleg:
    "Een digitale klok; het kind tikt op het urendeel of het minutendeel. Met de uitleg erbij staat er eerst kort wat waar staat: vóór de dubbele punt de uren, erachter de minuten.",
  suggestie: "Groep 4: hele en halve uren, met de uitleg erbij",
  velden: [
    TIJDENVELD, URENVELD,
    {
      soort: "vinkje",
      sleutel: "metUitleg",
      label: "Begin met een korte uitleg",
      hulp: "Dan staat er boven de klok: vóór de dubbele punt staan de uren, erachter de minuten.",
    },
    ...vraagtekstVelden(DELENZINNEN, {
      voorbeeldzinnen: {
        "34": "Tik op het urendeel.",
        "56": "Tik op het urendeel.",
        "78": "Tik op het urendeel.",
      },
      extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: DELENZINNEN },
  standaard: { tijden: ["heel", "half"], metUitleg: true },
  foutpatronen: tijdPatronen,
  aanpak: digitaalAanpak,
  uitleganimatie: digitaalUitleg,

  maximum: (inst) => alleTijden(inst, ["heel", "half"]).length * 2,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const metUitleg = vinkje(inst, "metUitleg", true);
    const uit: Gegenereerd[] = [];

    const alles = alleTijden(inst, ["heel", "half"]).flatMap((t) => [
      { t, gevraagd: "uur" },
      { t, gevraagd: "minuut" },
    ]);

    for (const { t, gevraagd } of husselen(kans, alles)) {
      if (uit.length >= aantal) break;
      const handtekening = `digitaaldelen:${digitaal(t)}:${gevraagd}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const zin = gevraagd === "uur" ? "Tik op het urendeel." : "Tik op het minutendeel.";
      const gegevens = gegevensVan("digitaaldelen", gevraagd, t, gevraagd === "uur" ? 0 : 1, {
        keuze: 1,
      });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(digitaaldelenGenerator, inst, groep, gegevens, { zin }),
        antwoord: gevraagd === "uur" ? "0" : "1",
        figuur: {
          soort: "digitaaldelen",
          uur: t.uur,
          minuut: t.minuut,
          gevraagd,
          metUitleg,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Hele uren in de dag
// ---------------------------------------------------------------------------

const DAGZIN = "{zin}";
const DAGZINNEN: Record<Leeftijdsgroep, string> = { "34": DAGZIN, "56": DAGZIN, "78": DAGZIN };

/**
 * De korte situaties waar een opgave over gaat.
 *
 * Een instelling en geen vaste lijst in de code: de eigenaar bepaalt wat erin
 * komt, en de waarde staat per sjabloon in de database. De tekst hieronder is
 * alleen de stand waarmee een nieuw sjabloon begint.
 */
const STANDAARD_MOMENTEN = [
  "{naam} wordt wakker van het onweer om 1-5",
  "{naam} wordt wakker van een enge droom om 1-5",
  "{naam} staat op om 7-8",
  "{naam} eet een boterham met kaas om 7-8",
  "{naam} fietst naar school om 8-8",
  "{naam} eet een appel in de kleine pauze om 10-10",
  "{naam} heeft gym om 9-11",
  "{naam} speelt na het eten op het schoolplein om 13-13",
  "{naam} heeft tekenles om 14-14",
  "{naam} komt thuis van school om 15-15",
  "{naam} gaat buiten spelen om 15-16",
  "{naam} gaat naar voetbal om 16-17",
  "{naam} eet aardappels met groente om 17-17",
  "{naam} gaat in bad om 19-19",
  "{naam} leest een boekje in bed om 19-20",
  "{naam} gaat naar bed om 19-21",
].join(", ");

/** Namen die om de beurt terugkomen, uit verschillende culturen. */
const NAMEN = ["Sam", "Noor", "Daan", "Aya", "Milan", "Lina", "Finn", "Yara", "Bilal", "Mila", "Ravi", "Zoë"];

/** Eén situatie met de uren waarop hij logisch is, beide meegeteld. */
type Moment = { tekst: string; van: number; tot: number };

/**
 * De situaties uit het tekstveld, elk met de uren waarop ze passen.
 *
 * Per situatie de tekst en daarachter van-tot in hele uren: "{naam} staat op
 * om 7-8". Zo staat er nooit "Sam gaat naar bed om 13:00". `{naam}` wordt per
 * opgave een andere naam. Een situatie zonder uren wordt overgeslagen, want
 * dan valt niet te zeggen of hij past; staat er geen enkele mét uren, dan
 * gelden de standaardsituaties.
 */
function momenten(inst: Instellingen): Moment[] {
  const lees = (waarde: string) =>
    waarde
      .split(/[,\n;]+/)
      .map((m) => m.trim())
      .filter(Boolean)
      .map((regel) => {
        const m = regel.match(/^(.*?)\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*$/);
        if (!m || m[1].trim() === "") return null;
        const a = Math.max(0, Math.min(23, Number(m[2])));
        const b = Math.max(0, Math.min(23, Number(m[3])));
        return { tekst: m[1].trim(), van: Math.min(a, b), tot: Math.max(a, b) };
      })
      .filter((m): m is Moment => m !== null);
  const eigen = lees(tekst(inst, "momenten", STANDAARD_MOMENTEN));
  return eigen.length > 0 ? eigen : lees(STANDAARD_MOMENTEN);
}

/**
 * De hele uren waar een situatie bij past. Nooit 00:00 en nooit precies op
 * de grens van twee dagdelen (06:00, 12:00, 18:00).
 */
function urenMetMoment(waar: Moment[]): number[] {
  const uren = new Set<number>();
  for (const m of waar) for (let u = m.van; u <= m.tot; u++) uren.add(u);
  return [...uren].filter((u) => u !== 0 && u % 6 !== 0).sort((a, b) => a - b);
}

export const digitaaldagdeelGenerator: Generator = {
  id: "digitaaldagdeel",
  naam: "Hele uren in de dag",
  uitleg:
    "Een korte situatie met een digitale klok, bijvoorbeeld \"Noor staat op om…\" bij 07:00, en het kind kiest \"zeven uur 's ochtends\". De situatie past altijd bij de tijd. De foute keuzes zijn hetzelfde uur in een ander dagdeel en het uur ervoor of erna.",
  suggestie: "Groep 4: hele uren",
  velden: [
    TIJDENVELD,
    {
      soort: "tekst",
      sleutel: "momenten",
      label: "De momenten van de dag",
      plaatshouder: STANDAARD_MOMENTEN,
      hulp: "Per situatie een stukje tekst waar een tijd achter past, met daarachter de hele uren waarop hij logisch is: \"{naam} staat op om 7-8\". Gescheiden door komma's. {naam} wordt elke keer een andere naam.",
    },
    ...vraagtekstVelden(DAGZINNEN, {
      voorbeeldzinnen: {
        "34": "Noor staat op om…",
        "56": "Noor staat op om…",
        "78": "Noor staat op om…",
      },
      extraHulp: "Op de plek van {zin} komt de situatie van deze opgave te staan.",
    }),
  ],
  vraagteksten: { standaard: DAGZINNEN },
  standaard: { tijden: ["heel"], momenten: STANDAARD_MOMENTEN },
  foutpatronen: tijdPatronen,
  aanpak: dagdeelAanpak,
  uitleganimatie: dagdeelUitleg,

  waarschuwing: (inst) =>
    momenten(inst).length === 0
      ? "Er staat geen enkel moment. Schrijf er een paar neer, gescheiden door komma's."
      : null,

  /* Alleen de uren waar een situatie bij past; het dagdeel staat erbij. */
  maximum: (inst) => urenMetMoment(momenten(inst)).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const waar = momenten(inst);
    if (waar.length === 0) return [];
    const uit: Gegenereerd[] = [];

    const uren = urenMetMoment(waar);
    for (const uur of husselen(kans, uren)) {
      if (uit.length >= aantal) break;
      const t: Tijd = { uur, minuut: 0 };
      const handtekening = `digitaaldagdeel:${digitaal(t)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        De valkuilen: hetzelfde uur in een ander dagdeel, en het uur ernaast.
        Daarmee gaat de vraag echt over het dagdeel en niet over het uur.
      */
      const valkuilen = [
        metDagdeel({ uur: (t.uur + 12) % 24, minuut: t.minuut }),
        metDagdeel({ uur: (t.uur + 1) % 24, minuut: t.minuut }),
        metDagdeel({ uur: (t.uur + 23) % 24, minuut: t.minuut }),
      ];
      const { keuzes, goed } = keuzelijst(kans, metDagdeel(t), valkuilen);
      /* Een situatie die bij dit uur past, met een naam die afwisselt. */
      const passend = waar.filter((m) => m.van <= uur && uur <= m.tot);
      const naam = NAMEN[uit.length % NAMEN.length];
      const zin = `${kiesUit(kans, passend).tekst.replace(/\{naam\}/g, naam)}…`;

      const gegevens = gegevensVan("digitaaldagdeel", "kiezen", t, goed, { keuze: 1 });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(digitaaldagdeelGenerator, inst, groep, gegevens, { zin }),
        antwoord: String(goed),
        figuur: {
          soort: "digitaaldagdeel",
          uur: t.uur,
          minuut: t.minuut,
          zin,
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
// Een digitale tijd aflezen
// ---------------------------------------------------------------------------

const AFZIN = "Hoe laat is het?";
const AFZINNEN: Record<Leeftijdsgroep, string> = { "34": AFZIN, "56": AFZIN, "78": AFZIN };

export const digitaalaflezenGenerator: Generator = {
  id: "digitaalaflezen",
  naam: "Digitale klok aflezen",
  uitleg:
    "Een digitale tijd, bijvoorbeeld 05:30, en het kind kiest de tijd in woorden uit vier antwoorden. De foute keuzes zijn echte valkuilen: bij 05:30 staan er ook \"half vijf\" en \"vijf uur\" tussen.",
  suggestie: "Groep 4: hele uren, dan hele en halve · groep 5: kwartieren · groep 6: op de minuut",
  velden: [TIJDENVELD, URENVELD, ...vraagtekstVelden(AFZINNEN)],
  vraagteksten: { standaard: AFZINNEN },
  standaard: { tijden: ["heel"] },
  foutpatronen: tijdPatronen,
  aanpak: digitaalAanpak,
  uitleganimatie: digitaalUitleg,

  /* Elke tijd twee keer: de tweede keer met andere foute keuzes. */
  maximum: (inst) => alleTijden(inst, ["heel"]).length * 2,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const uit: Gegenereerd[] = [];

    for (const { item: t, variant } of metTweedeVariant(kans, alleTijden(inst, ["heel"]))) {
      if (uit.length >= aantal) break;
      const handtekening = `digitaalaflezen:${digitaal(t)}${variant ? ":2" : ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        De valkuilen, in de volgorde waarin ze de beste valkuil zijn:

          het uur ernaast       bij 05:30 geeft dat "half vijf" — precies de
                                fout die een kind maakt dat het uur op de klok
                                overneemt in plaats van het uur dat komt;
          het hele uur          "vijf uur", de minuten vergeten;
          over en voor om       "half zes" wordt "half zeven"-achtig;
          een kwartier ernaast.
      */
      /*
        Alleen valkuilen van hetzelfde niveau als de oefening: bij hele uren
        nooit "kwart over" als foute keuze. Daarna het uur er twee naast, zodat
        er altijd genoeg keuzes zijn.
      */
      const toegestaan = new Set(alleTijden(inst, ["heel"]).map((x) => x.minuut));
      const valkuilen = [
        { uur: t.uur - 1, minuut: t.minuut },
        { uur: t.uur, minuut: 0 },
        { uur: t.uur, minuut: (60 - t.minuut) % 60 },
        { uur: t.uur + 1, minuut: t.minuut },
        { uur: t.uur, minuut: (t.minuut + 15) % 60 },
        { uur: t.uur + 2, minuut: t.minuut },
        { uur: t.uur - 2, minuut: t.minuut },
      ]
        .filter((x) => toegestaan.has(x.minuut))
        .map(inWoorden);
      const goedeTekst = inWoorden(t);
      const { keuzes, goed } = keuzelijst(
        kans,
        goedeTekst,
        doorgeschoven(
          valkuilen.filter((v, i) => v !== goedeTekst && valkuilen.indexOf(v) === i),
          variant,
        ),
      );

      const gegevens = gegevensVan("digitaalaflezen", "kiezen", t, goed, { keuze: 1 });
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(digitaalaflezenGenerator, inst, groep, gegevens),
        antwoord: String(goed),
        figuur: { soort: "digitaalaflezen", uur: t.uur, minuut: t.minuut, keuzes, goed },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Tijd vooruit en tijd terug
// ---------------------------------------------------------------------------

/**
 * De vraag zegt altijd welke kant op: "Het is 14:00. Hoeveel later is het om
 * 17:00?" of "Het is 14:00. Hoeveel eerder was het om 11:00?". Nooit alleen
 * "Hoeveel tijd zit ertussen?": dan weet een kind niet of het vooruit of terug
 * moet tellen.
 */
const VERSCHILZIN = "{zin}";

/** De zin bij een opgave: vanaf nu, de andere tijd later of eerder. */
export function verschilzin(richting: string, nu: Tijd, ander: Tijd): string {
  return richting === "eerder"
    ? `Het is ${digitaal(nu)}. Hoeveel eerder was het om ${digitaal(ander)}?`
    : `Het is ${digitaal(nu)}. Hoeveel later is het om ${digitaal(ander)}?`;
}
const VERSCHILZINNEN: Record<Leeftijdsgroep, string> = {
  "34": VERSCHILZIN,
  "56": VERSCHILZIN,
  "78": VERSCHILZIN,
};

/**
 * De vijf standen van Tijd vooruit en Tijd terug, uit WERKPLAN.md.
 *
 *   heleUren        18:00 en 21:00 — allebei op het hele uur
 *   andereMinuten   06:45 en 08:45 — dezelfde minuten, hele uren ertussen
 *   halveUren       05:10 en 07:40 — een half uur erbij
 *   overHeelUur     05:50 en 08:20 — het verschil gaat over het hele uur heen
 *   kwartieren      04:15 en 07:45 — kwartieren erbij
 */
const STANDEN = ["heleUren", "andereMinuten", "halveUren", "overHeelUur", "kwartieren"];

/** Welke beginminuten en welke verschillen er bij een stand horen. */
function standregels(stand: string): { beginMinuten: number[]; extra: number[] } {
  /*
    Elke stand blijft binnen zijn niveau (de leerlijn van school): hele uren
    alleen op het hele uur, halve uren alleen op :00 en :30, kwartieren op de
    kwartieren. Pas "over het hele uur heen" gebruikt tijden per vijf minuten.
  */
  switch (stand) {
    case "andereMinuten":
      /* Dezelfde minuten op beide klokken (kwart over of kwart voor), hele uren ertussen. */
      return { beginMinuten: [15, 45], extra: [0] };
    case "halveUren":
      /* Een half uur erbij, op hele en halve uren: 05:00 en 07:30. */
      return { beginMinuten: [0, 30], extra: [30] };
    case "overHeelUur":
      /*
        Het verschil gaat over het hele uur heen: begin laat in het uur, en een
        halfuur erbij. 05:50 + 2 uur 30 = 08:20.
      */
      return { beginMinuten: [50, 55, 45], extra: [30, 25, 35] };
    case "kwartieren":
      return { beginMinuten: [0, 15, 30, 45], extra: [15, 45] };
    default:
      return { beginMinuten: [0], extra: [0] };
  }
}

export const digitaalverschilGenerator: Generator = {
  id: "digitaalverschil",
  naam: "Tijd vooruit en tijd terug",
  uitleg:
    "Twee digitale klokken, NU en LATER of EERDER en NU, met een pijl die de goede kant op wijst. De vraag zegt welke kant op: \"Het is 14:00. Hoeveel later is het om 17:00?\" Het kind typt het antwoord: ▢ uur ▢ minuten.",
  suggestie: "Groep 4: hele uren · groep 5: halve uren · groep 6: over het hele uur en kwartieren",
  velden: [
    {
      soort: "keuze",
      sleutel: "richting",
      label: "Vooruit of terug",
      opties: [
        { waarde: "later", label: "Tijd vooruit — de eerste klok is de vroegste" },
        { waarde: "eerder", label: "Tijd terug — de eerste klok is de latere" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat voor tijden",
      opties: [
        { waarde: "heleUren", label: "Hele uren — 18:00 en 21:00" },
        { waarde: "andereMinuten", label: "Hele uren, andere minuten — 06:45 en 08:45" },
        { waarde: "halveUren", label: "Halve uren — 05:00 en 07:30" },
        { waarde: "overHeelUur", label: "Over het hele uur heen — 05:50 en 08:20" },
        { waarde: "kwartieren", label: "Kwartieren — 04:15 en 07:45" },
      ],
    },
    {
      soort: "getal",
      sleutel: "maxUren",
      label: "Hoogste aantal uren ertussen",
      min: 1,
      max: 6,
    },
    URENVELD,
    ...vraagtekstVelden(VERSCHILZINNEN, {
      voorbeeldzinnen: {
        "34": "Het is 14:00. Hoeveel later is het om 17:00?",
        "56": "Het is 14:00. Hoeveel later is het om 17:00?",
        "78": "Het is 14:00. Hoeveel later is het om 17:00?",
      },
      extraHulp: "Op de plek van {zin} komt de vraag van deze opgave te staan, met de twee tijden erin.",
    }),
  ],
  vraagteksten: { standaard: VERSCHILZINNEN },
  standaard: { richting: "later", stand: "heleUren", maxUren: 4 },
  foutpatronen: tijdPatronen,
  aanpak: duurAanpak,
  uitleganimatie: duurUitleg,

  maximum: (inst) => {
    const stand = tekst(inst, "stand", "heleUren");
    const regels = standregels(STANDEN.includes(stand) ? stand : "heleUren");
    const uren = Math.max(1, Math.min(6, getal(inst, "maxUren", 4)));
    /* Elke begintijd, maal de verschillen die passen. */
    return (vinkje(inst, "uren24") ? 24 : 12) * regels.beginMinuten.length * uren * regels.extra.length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const richting = tekst(inst, "richting", "later") === "eerder" ? "eerder" : "later";
    const stand = STANDEN.includes(tekst(inst, "stand", "heleUren"))
      ? tekst(inst, "stand", "heleUren")
      : "heleUren";
    const regels = standregels(stand);
    const maxUren = Math.max(1, Math.min(6, getal(inst, "maxUren", 4)));

    const uren24 = vinkje(inst, "uren24");
    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /* Zonder 24-uurstijden alles tussen 01:00 en 12:59. */
      const beginUur = uren24 ? Math.floor(kans() * 24) : 1 + Math.floor(kans() * 12);
      const beginMinuut = kiesUit(kans, regels.beginMinuten);
      const uren = 1 + Math.floor(kans() * maxUren);
      const erbij = kiesUit(kans, regels.extra);
      const stap = uren * 60 + erbij;
      if (stap <= 0) continue;

      const vroeg: Tijd = { uur: beginUur, minuut: beginMinuut };
      const laat = plusMinuten(vroeg, stap);
      /* Niet over middernacht: dan zou "later" ineens de volgende dag zijn. */
      if (laat.uur * 60 + laat.minuut <= vroeg.uur * 60 + vroeg.minuut) continue;
      /* En zonder 24-uurstijden niet voorbij 12:59. */
      if (!uren24 && laat.uur > 12) continue;

      /* Bij "terug" staat de latere tijd vooraan. */
      const eerste = richting === "eerder" ? laat : vroeg;
      const tweede = richting === "eerder" ? vroeg : laat;

      const handtekening = `digitaalverschil:${richting}:${digitaal(eerste)}-${digitaal(tweede)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const d = verschil(vroeg, laat);
      const gegevens = gegevensVan("digitaalverschil", `${richting}-${stand}`, eerste, d.uren, {
        antwoordUur: d.uren,
        antwoordMinuut: d.minuten,
      });

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(digitaalverschilGenerator, inst, groep, gegevens, {
          zin: verschilzin(richting, eerste, tweede),
        }),
        antwoord: `${d.uren},${d.minuten}`,
        figuur: {
          soort: "digitaalverschil",
          eersteUur: eerste.uur,
          eersteMinuut: eerste.minuut,
          tweedeUur: tweede.uur,
          tweedeMinuut: tweede.minuut,
          richting,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

/* Hulpje dat alleen hier nodig is; blijft bij de rest van het onderwerp staan. */
export function tijdUitMinuten(totaal: number): Tijd {
  return uitMinuten(totaal);
}

/** Het dagdeel van een tijd, als woord. Handig voor de schermen van dit onderwerp. */
export function dagdeelwoord(t: Tijd): string {
  return DAGDEEL_LABEL[dagdeelVan(t)];
}
