/**
 * De uitleg-animaties bij het domein Tijd.
 *
 * Eén script per familie opdrachten, en alle drie de groepsvormen krijgen
 * dezelfde weg in hun eigen tempo: groep 3-4 in korte zinnen van hooguit zes
 * woorden, groep 5-6 met iets meer uitleg, groep 7-8 als lijstje dat je in één
 * keer leest.
 *
 * Het model is overal de som op één regel. Dat is met opzet: de basisversie van
 * dit domein is gewone opdrachten (zie WERKPLAN.md), en dan hoort de uitleg niet
 * ineens met een bewegende klok te komen. Het beeld komt later, en dan komt het
 * in de opgave én in de uitleg tegelijk.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";
import { DAGDEEL_LABEL, dagdeelVan, digitaal, inWoorden, metDagdeel, type Tijd } from "@/lib/tijd";

/** Eén stap: de som op een regel, met een zin van Vos erbij. */
function stap(tekst: string, zin: string, feest = false): Uitlegscript["stappen"][number] {
  return {
    model: { soort: "som", tekst },
    zin,
    houding: feest ? "juichend" : "wijzend",
    ...(feest ? { feest: true, beweging: "juichen" as const } : {}),
  };
}

/** Een uitlegbron met één strategie en één script voor alle groepen. */
function bron(
  strategie: { waarde: string; label: string; uitleg: string },
  regels: (som: Somgegevens, kort: boolean) => Uitlegscript["stappen"],
): Uitlegbron {
  return {
    modellen: ["som"],
    strategieen: [strategie],
    standaardStrategie: () => strategie.waarde,
    script(som, vorm: Groepsvorm) {
      const stappen = regels(som, MANIER_VAN_VORM[vorm] === "34");
      if (stappen.length === 0) return null;
      return { vorm, strategie: strategie.waarde, strategieNaam: strategie.label, stappen };
    },
    /*
      Een vergelijkbare opgave om daarna te proberen bestaat hier niet als los
      setje getallen: een tijd-opgave hangt aan een hele tekening met keuzes,
      een kalender of twee klokken. Die kan de uitlegspeler niet zelf opbouwen,
      dus wordt er niets aangeboden — en dan slaat de speler die stap over.
    */
    vergelijkbaar: () => null,
  };
}

function tijdVan(som: Somgegevens): Tijd {
  return { uur: som.getallen[0] ?? 0, minuut: som.getallen[1] ?? 0 };
}

function duur(som: Somgegevens): { uren: number; minuten: number } {
  return { uren: som.extra?.antwoordUur ?? som.goed, minuten: som.extra?.antwoordMinuut ?? 0 };
}

// ---------------------------------------------------------------------------

export const wijzerklokUitleg: Uitlegbron = bron(
  {
    waarde: "eerst-de-kleine-wijzer",
    label: "Eerst de kleine wijzer",
    uitleg: "Kijk eerst naar de kleine wijzer voor het uur, dan naar de grote voor de minuten.",
  },
  (som, kort) => {
    const t = tijdVan(som);
    return [
      stap("het uur", kort ? "Kijk naar de kleine wijzer." : "Kijk eerst naar de kleine wijzer."),
      stap("de minuten", kort ? "Dan naar de grote." : "Daarna naar de grote wijzer."),
      stap(inWoorden(t), kort ? "Zo laat is het!" : `Dus het is ${inWoorden(t)}.`, true),
    ];
  },
);

export const klokzettenUitleg: Uitlegbron = bron(
  {
    waarde: "grote-wijzer-eerst",
    label: "De grote wijzer eerst",
    uitleg: "Zet eerst de grote wijzer op de minuten; de kleine schuift dan vanzelf goed mee.",
  },
  (som, kort) => {
    const doel = {
      uur: som.extra?.antwoordUur ?? som.getallen[0] ?? 0,
      minuut: som.extra?.antwoordMinuut ?? 0,
    };
    return [
      stap(inWoorden(doel), kort ? "Zo laat moet het worden." : `Het moet ${inWoorden(doel)} worden.`),
      stap(`${doel.minuut} minuten`, kort ? "Zet de grote wijzer." : "Zet eerst de grote wijzer."),
      stap(
        `${((doel.uur + 11) % 12) + 1} uur`,
        kort ? "Dan de kleine. Klaar!" : "En dan de kleine op het uur.",
        true,
      ),
    ];
  },
);

export const wijzeraanwijzenUitleg: Uitlegbron = bron(
  {
    waarde: "kort-en-lang",
    label: "Kort en lang",
    uitleg: "De korte, dikke wijzer is van de uren; de lange, dunne van de minuten.",
  },
  (som, kort) => [
    stap("kort", kort ? "De korte is van de uren." : "De korte, dikke wijzer geeft het uur."),
    stap("lang", kort ? "De lange van de minuten." : "De lange, dunne geeft de minuten."),
    stap(
      som.extra?.uurwijzer === 1 ? "de korte" : "de lange",
      kort ? "Die moet je hebben!" : "Die wordt hier gevraagd.",
      true,
    ),
  ],
);

export const digitaalUitleg: Uitlegbron = bron(
  {
    waarde: "voor-en-na-de-punt",
    label: "Voor en na de dubbele punt",
    uitleg: "Vóór de dubbele punt staan de uren, erachter de minuten.",
  },
  (som, kort) => {
    const t = tijdVan(som);
    return [
      stap(
        String(t.uur).padStart(2, "0"),
        kort ? "Voor de punt: de uren." : "Vóór de dubbele punt staan de uren.",
      ),
      stap(
        String(t.minuut).padStart(2, "0"),
        kort ? "Erachter: de minuten." : "Daarachter staan de minuten.",
      ),
      stap(inWoorden(t), kort ? "Zo laat is het!" : `Samen is dat ${inWoorden(t)}.`, true),
    ];
  },
);

export const dagdeelUitleg: Uitlegbron = bron(
  {
    waarde: "vier-delen",
    label: "De vier delen van de dag",
    uitleg: "Nacht tot zes, ochtend tot twaalf, middag tot zes, daarna avond.",
  },
  (som, kort) => {
    const t = tijdVan(som);
    return [
      stap(digitaal(t), kort ? "Kijk naar het uur." : `Het is ${digitaal(t)}.`),
      stap("0 · 6 · 12 · 18", kort ? "De dag heeft vier delen." : "Een dag heeft vier delen."),
      som.soort === "digitaaldagdeel"
        ? stap(metDagdeel(t), kort ? "Dit hoort erbij!" : `Dus ${digitaal(t)} is ${metDagdeel(t)}.`, true)
        : stap(DAGDEEL_LABEL[dagdeelVan(t)], kort ? "Dit hoort erbij!" : `Dus om ${digitaal(t)} is het ${DAGDEEL_LABEL[dagdeelVan(t)]}.`, true),
    ];
  },
);

export const duurUitleg: Uitlegbron = bron(
  {
    waarde: "van-uur-naar-uur",
    label: "Van uur naar uur springen",
    uitleg: "Spring eerst naar het hele uur, dan de hele uren, en als laatste de minuten.",
  },
  (som, kort) => {
    const d = duur(som);
    const t = tijdVan(som);
    return [
      stap(digitaal(t), kort ? "Begin bij de eerste tijd." : `Begin bij ${digitaal(t)}.`),
      stap(`${d.uren} uur`, kort ? "Tel de hele uren." : `Dat zijn ${d.uren} hele uren.`),
      stap(
        d.minuten === 0 ? `${d.uren} uur` : `${d.uren} uur en ${d.minuten} minuten`,
        kort ? "En de minuten erbij!" : `En er komen ${d.minuten} minuten bij.`,
        true,
      ),
    ];
  },
);

export const urenminutenUitleg: Uitlegbron = bron(
  {
    waarde: "alles-in-minuten",
    label: "Alles in minuten",
    uitleg: "Reken alles terug naar minuten: een uur is 60, een half uur 30, een kwartier 15.",
  },
  (som, kort) => [
    stap("1 uur = 60 min", kort ? "Een uur is zestig minuten." : "Een uur is zestig minuten."),
    stap("30 min", kort ? "Een half uur de helft." : "Een half uur is dus dertig."),
    stap(String(som.goed), kort ? "Daar is het antwoord!" : `Het antwoord is ${som.goed}.`, true),
  ],
);

export const dagenUitleg: Uitlegbron = bron(
  {
    waarde: "de-week-opzeggen",
    label: "De week opzeggen",
    uitleg: "Zeg de week op vanaf maandag en tel verder vanaf de dag in de vraag.",
  },
  (som, kort) => [
    stap("ma di wo do vr za zo", kort ? "Zeg de week op." : "Zeg de week op vanaf maandag."),
    stap("→", kort ? "Tel verder vanaf de dag." : "Tel verder vanaf de dag in de vraag."),
    stap("zo → ma", kort ? "Na zondag weer maandag!" : "Na zondag begint de week opnieuw.", true),
  ],
);

export const maandenUitleg: Uitlegbron = bron(
  {
    waarde: "het-jaar-opzeggen",
    label: "Het jaar opzeggen",
    uitleg: "Zeg de maanden op vanaf januari en tel verder vanaf de maand in de vraag.",
  },
  (som, kort) => [
    stap("jan feb mrt apr mei jun", kort ? "Zeg het jaar op." : "Zeg de maanden op vanaf januari."),
    stap("jul aug sep okt nov dec", kort ? "En zo verder." : "En zo verder tot december."),
    stap("dec → jan", kort ? "Na december weer januari!" : "Na december komt weer januari.", true),
  ],
);

export const kalenderUitleg: Uitlegbron = bron(
  {
    waarde: "kolom-en-rij",
    label: "Kolom en rij",
    uitleg: "Zoek de datum op, lees de weekdag erboven af en tel per vakje verder.",
  },
  (som, kort) => [
    stap("📅", kort ? "Zoek de datum op." : "Zoek de datum op in de kalender."),
    stap("ma di wo do vr za zo", kort ? "Kijk boven de kolom." : "Lees de weekdag erboven af."),
    stap("→", kort ? "Tel per vakje verder!" : "Tel daarna per vakje verder.", true),
  ],
);

export const kalendertellenUitleg: Uitlegbron = bron(
  {
    waarde: "vakjes-tellen",
    label: "De vakjes tellen",
    uitleg: "Tel de vakjes vanaf de dag ná vandaag; vandaag telt niet mee.",
  },
  (som, kort) => [
    stap("morgen = 1", kort ? "Begin bij de dag erna." : "Begin bij de dag ná vandaag."),
    stap("→", kort ? "Tel de vakjes door." : "Tel de vakjes één voor één door."),
    stap(String(som.goed), kort ? "Zoveel zijn het!" : `Het zijn er ${som.goed}.`, true),
  ],
);
