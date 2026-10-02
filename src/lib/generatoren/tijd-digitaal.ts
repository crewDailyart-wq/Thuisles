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
 *   - en, op verzoek van de eigenaar: is het verschil hele uren, dan typt het
 *     kind 0 bij de minuten — maar een leeg minutenvakje telt ook als 0 en is
 *     goed. Zie `minutenMagLeeg` in `tijdfiguren.ts`.
 */

import {
  getal,
  husselen,
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

/** Alle tijden van een etmaal die bij deze instellingen horen. */
function alleTijden(inst: Instellingen, terugval: string[]): Tijd[] {
  const minuten = new Set<number>();
  for (const g of groepen(inst, terugval)) for (const m of GROEPEN[g]) minuten.add(m);

  const uit: Tijd[] = [];
  for (let u = 0; u < 24; u++) {
    for (const m of [...minuten].sort((a, b) => a - b)) uit.push({ uur: u, minuut: m });
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
    TIJDENVELD,
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
const STANDAARD_MOMENTEN =
  "Sam staat op om, Sam gaat naar school om, Sam eet om, Sam gaat voetballen om, Sam gaat naar bed om";

function momenten(inst: Instellingen): string[] {
  return tekst(inst, "momenten", STANDAARD_MOMENTEN)
    .split(/[,\n;]+/)
    .map((m) => m.trim())
    .filter(Boolean);
}

export const digitaaldagdeelGenerator: Generator = {
  id: "digitaaldagdeel",
  naam: "Hele uren in de dag",
  uitleg:
    "Een korte situatie met een digitale klok, bijvoorbeeld \"Sam staat op om…\", en het kind kiest bijvoorbeeld \"zeven uur 's ochtends\". De keuzes hebben 's ochtends en 's avonds door elkaar, dus het dagdeel telt mee.",
  suggestie: "Groep 4: hele uren",
  velden: [
    TIJDENVELD,
    {
      soort: "tekst",
      sleutel: "momenten",
      label: "De momenten van de dag",
      plaatshouder: STANDAARD_MOMENTEN,
      hulp: "Per situatie een stukje tekst waar een tijd achter past, gescheiden door komma's.",
    },
    ...vraagtekstVelden(DAGZINNEN, {
      voorbeeldzinnen: {
        "34": "Sam staat op om…",
        "56": "Sam staat op om…",
        "78": "Sam staat op om…",
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

  maximum: (inst) => alleTijden(inst, ["heel"]).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const waar = momenten(inst);
    if (waar.length === 0) return [];
    const uit: Gegenereerd[] = [];

    for (const t of husselen(kans, alleTijden(inst, ["heel"]))) {
      if (uit.length >= aantal) break;
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
      const zin = `${kiesUit(kans, waar)}…`;

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
  velden: [TIJDENVELD, ...vraagtekstVelden(AFZINNEN)],
  vraagteksten: { standaard: AFZINNEN },
  standaard: { tijden: ["heel"] },
  foutpatronen: tijdPatronen,
  aanpak: digitaalAanpak,
  uitleganimatie: digitaalUitleg,

  maximum: (inst) => alleTijden(inst, ["heel"]).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const uit: Gegenereerd[] = [];

    for (const t of husselen(kans, alleTijden(inst, ["heel"]))) {
      if (uit.length >= aantal) break;
      const handtekening = `digitaalaflezen:${digitaal(t)}`;
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
      const valkuilen = [
        inWoorden({ uur: t.uur - 1, minuut: t.minuut }),
        inWoorden({ uur: t.uur, minuut: 0 }),
        inWoorden({ uur: t.uur, minuut: (60 - t.minuut) % 60 }),
        inWoorden({ uur: t.uur + 1, minuut: t.minuut }),
        inWoorden({ uur: t.uur, minuut: (t.minuut + 15) % 60 }),
      ];
      const { keuzes, goed } = keuzelijst(kans, inWoorden(t), valkuilen);

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

const VERSCHILZIN = "Hoeveel tijd zit ertussen?";
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
  switch (stand) {
    case "andereMinuten":
      /* Dezelfde minuten op beide klokken, dus een heel aantal uren ertussen. */
      return { beginMinuten: [5, 10, 15, 20, 25, 35, 40, 45, 50, 55], extra: [0] };
    case "halveUren":
      /* Een half uur erbij; het begin staat niet op een heel uur. */
      return { beginMinuten: [5, 10, 20, 25, 40, 50], extra: [30] };
    case "overHeelUur":
      /*
        Het verschil gaat over het hele uur heen: begin laat in het uur, en een
        halfuur erbij. 05:50 + 2 uur 30 = 08:20.
      */
      return { beginMinuten: [50, 55, 45], extra: [30, 25, 35] };
    case "kwartieren":
      return { beginMinuten: [0, 15, 30, 45], extra: [15, 30, 45] };
    default:
      return { beginMinuten: [0], extra: [0] };
  }
}

export const digitaalverschilGenerator: Generator = {
  id: "digitaalverschil",
  naam: "Tijd vooruit en tijd terug",
  uitleg:
    "Twee digitale klokken met een pijl ertussen; het kind typt hoeveel tijd ertussen zit: ▢ uur ▢ minuten. Bij een heel aantal uren mag het minutenvakje leeg blijven — leeg telt als 0 en is goed.",
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
        { waarde: "halveUren", label: "Halve uren — 05:10 en 07:40" },
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
    ...vraagtekstVelden(VERSCHILZINNEN),
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
    /* Elke begintijd binnen een etmaal, maal de verschillen die passen. */
    return 24 * regels.beginMinuten.length * uren * regels.extra.length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const richting = tekst(inst, "richting", "later") === "eerder" ? "eerder" : "later";
    const stand = STANDEN.includes(tekst(inst, "stand", "heleUren"))
      ? tekst(inst, "stand", "heleUren")
      : "heleUren";
    const regels = standregels(stand);
    const maxUren = Math.max(1, Math.min(6, getal(inst, "maxUren", 4)));

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const beginUur = Math.floor(kans() * 24);
      const beginMinuut = kiesUit(kans, regels.beginMinuten);
      const uren = 1 + Math.floor(kans() * maxUren);
      const erbij = kiesUit(kans, regels.extra);
      const stap = uren * 60 + erbij;
      if (stap <= 0) continue;

      const vroeg: Tijd = { uur: beginUur, minuut: beginMinuut };
      const laat = plusMinuten(vroeg, stap);
      /* Niet over middernacht: dan zou "later" ineens de volgende dag zijn. */
      if (laat.uur * 60 + laat.minuut <= vroeg.uur * 60 + vroeg.minuut) continue;

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
        vraagtekst: bepaalVraagtekst(digitaalverschilGenerator, inst, groep, gegevens),
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
