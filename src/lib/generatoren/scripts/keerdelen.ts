/**
 * De uitleg-animaties bij de keersommen en de deelsommen.
 *
 * Alle drie de groepsvormen krijgen dezelfde weg langs dezelfde som, in hun
 * eigen tempo: groep 3-4 in korte zinnen van hooguit zes woorden, groep 5-6 met
 * iets meer uitleg, groep 7-8 als lijstje dat je in één keer leest.
 *
 * Het model is overal de som op één regel. Dat is met opzet: de basisversie van
 * deze domeinen is kaal rekenen (zie WERKPLAN.md), en dan hoort de uitleg niet
 * ineens met blokjes te komen die in de opgave nergens stonden. Het beeld komt
 * later, en dan komt het in de opgave én in de uitleg tegelijk.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

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
  vergelijkbaar: (som: Somgegevens) => Somgegevens | null,
): Uitlegbron {
  return {
    modellen: ["som"],
    strategieen: [strategie],
    standaardStrategie: () => strategie.waarde,
    script(som, vorm: Groepsvorm) {
      const stappen = regels(som, MANIER_VAN_VORM[vorm] === "34");
      if (stappen.length === 0) return null;
      return {
        vorm,
        strategie: strategie.waarde,
        strategieNaam: strategie.label,
        stappen,
      };
    },
    vergelijkbaar,
  };
}

/** De drie getallen, ongeacht in welke vorm de vraag stond. */
function stukken(som: Somgegevens) {
  const tafel = som.extra?.tafel ?? som.getallen[0] ?? 0;
  const mee = som.extra?.mee ?? som.getallen[1] ?? 0;
  const product = som.extra?.product ?? tafel * mee;
  return { tafel, mee, product };
}

/** De tafel doortellen, ingekort als hij lang wordt. */
function rij(stapgrootte: number, aantal: number): string {
  const getallen = Array.from(
    { length: Math.min(Math.max(aantal, 1), 15) },
    (_, i) => stapgrootte * (i + 1),
  );
  return getallen.length > 4
    ? `${getallen.slice(0, 3).join(", ")} … ${getallen[getallen.length - 1]}`
    : getallen.join(", ");
}

/** Dezelfde soort som met één getal anders, om daarna te proberen. */
function buursom(som: Somgegevens, nieuweMee: (mee: number) => number): Somgegevens | null {
  const { tafel, mee } = stukken(som);
  if (!Number.isFinite(tafel) || !Number.isFinite(mee) || tafel < 1) return null;
  const nieuw = nieuweMee(mee);
  if (nieuw < 1 || nieuw > 10) return null;
  const product = tafel * nieuw;
  return {
    soort: som.soort,
    variant: som.variant,
    getallen: som.soort.startsWith("deel") ? [product, tafel] : [tafel, nieuw],
    goed: som.soort.startsWith("deel") ? nieuw : product,
    extra: { tafel, mee: nieuw, product },
  };
}

const anderMee = (som: Somgegevens) => buursom(som, (mee) => (mee > 2 ? mee - 1 : mee + 1));

// ---------------------------------------------------------------------------
// Delen
// ---------------------------------------------------------------------------

export const deelsomUitleg: Uitlegbron = bron(
  {
    waarde: "tafel-doortellen",
    label: "De tafel doortellen",
    uitleg: "Zoek hoe vaak het tweede getal in het eerste past door de tafel door te tellen.",
  },
  (som, kort) => {
    const { tafel, mee, product } = stukken(som);
    return [
      stap(`${product} : ${tafel}`, kort ? "Dit is de som." : `De som is ${product} : ${tafel}.`),
      stap(
        rij(tafel, mee),
        kort ? "Tel de tafel door." : `Tel de tafel van ${tafel} door tot je bij ${product} bent.`,
      ),
      stap(
        `${product} : ${tafel} = ${mee}`,
        kort ? "Tel de stappen!" : `Dat zijn ${mee} stappen, dus het antwoord is ${mee}.`,
        true,
      ),
    ];
  },
  anderMee,
);

export const deelkoppelenUitleg: Uitlegbron = bron(
  {
    waarde: "som-voor-som",
    label: "Som voor som uitrekenen",
    uitleg: "Reken elke deelsom uit en sleep de uitkomst die erbij hoort ernaartoe.",
  },
  (som, kort) => {
    const { tafel, mee, product } = stukken(som);
    return [
      stap(`${product} : ${tafel}`, kort ? "Pak de eerste som." : `Begin bij ${product} : ${tafel}.`),
      stap(String(mee), kort ? "Reken hem uit." : `Die komt uit op ${mee}.`),
      stap(`${product} : ${tafel} = ${mee}`, kort ? "Sleep het getal erheen!" : `Sleep de ${mee} naar die som.`, true),
    ];
  },
  anderMee,
);

export const welkedeelsomUitleg: Uitlegbron = bron(
  {
    waarde: "zelf-een-tafel-kiezen",
    label: "Zelf een tafel kiezen",
    uitleg: "Kies zelf een tafel, reken de keersom uit en draai hem om tot een deelsom.",
  },
  (som, kort) => {
    const { tafel, mee, product } = stukken(som);
    return [
      stap(String(mee), kort ? "Dit moet eruit komen." : `Je antwoord moet ${mee} zijn.`),
      stap(
        `${tafel} × ${mee} = ${product}`,
        kort ? "Kies zelf een tafel." : `Kies een tafel, bijvoorbeeld ${tafel} × ${mee} = ${product}.`,
      ),
      stap(
        `${product} : ${tafel} = ${mee}`,
        kort ? "Draai hem om!" : `Omgedraaid is dat ${product} : ${tafel} = ${mee}.`,
        true,
      ),
    ];
  },
  anderMee,
);

// ---------------------------------------------------------------------------
// Tafels
// ---------------------------------------------------------------------------

export const keersomUitleg: Uitlegbron = bron(
  {
    waarde: "tafel-doortellen",
    label: "De tafel doortellen",
    uitleg: "Tel de tafel door met sprongen tot je bij het goede aantal stappen bent.",
  },
  (som, kort) => {
    const { tafel, mee, product } = stukken(som);
    return [
      stap(`${tafel} × ${mee}`, kort ? "Dit is de som." : `De som is ${tafel} × ${mee}.`),
      stap(rij(mee, tafel), kort ? "Tel met sprongen mee." : `Tel ${tafel} keer ${mee} erbij.`),
      stap(
        `${tafel} × ${mee} = ${product}`,
        kort ? "Daar is het antwoord!" : `Je komt uit op ${product}.`,
        true,
      ),
    ];
  },
  anderMee,
);

export const keerkoppelenUitleg: Uitlegbron = bron(
  {
    waarde: "som-voor-som",
    label: "Som voor som uitrekenen",
    uitleg: "Reken elke keersom uit en sleep de uitkomst die erbij hoort ernaartoe.",
  },
  (som, kort) => {
    const { tafel, mee, product } = stukken(som);
    return [
      stap(`${tafel} × ${mee}`, kort ? "Pak de eerste som." : `Begin bij ${tafel} × ${mee}.`),
      stap(String(product), kort ? "Reken hem uit." : `Die komt uit op ${product}.`),
      stap(
        `${tafel} × ${mee} = ${product}`,
        kort ? "Sleep het getal erheen!" : `Sleep de ${product} naar die som.`,
        true,
      ),
    ];
  },
  anderMee,
);

export const welkekeersomUitleg: Uitlegbron = bron(
  {
    waarde: "tafels-langslopen",
    label: "De tafels langslopen",
    uitleg: "Loop de tafels langs die je kent en kijk welke op dit getal uitkomt.",
  },
  (som, kort) => {
    const { tafel, mee, product } = stukken(som);
    return [
      stap(String(product), kort ? "Dit moet eruit komen." : `Je moet op ${product} uitkomen.`),
      stap(rij(tafel, mee), kort ? "Loop een tafel langs." : `De tafel van ${tafel} komt erop uit.`),
      stap(
        `${tafel} × ${mee} = ${product}`,
        kort ? "Dat past!" : `Dus ${tafel} × ${mee} = ${product}.`,
        true,
      ),
    ];
  },
  anderMee,
);

export const keerrasterUitleg: Uitlegbron = bron(
  {
    waarde: "per-rij-tellen",
    label: "Per rij tellen",
    uitleg: "Tel hoeveel er in één rij staan en spring daarna per rij door.",
  },
  (som, kort) => {
    const [rijen, kolommen] = som.getallen;
    if (!rijen || !kolommen) return [];
    return [
      stap(String(kolommen), kort ? "Zoveel staan er in een rij." : `In één rij staan er ${kolommen}.`),
      stap(String(rijen), kort ? "Zoveel rijen zijn er." : `En er zijn ${rijen} rijen.`),
      stap(rij(kolommen, rijen), kort ? "Tel per rij mee." : `Tel met sprongen van ${kolommen}.`),
      stap(
        `${rijen} × ${kolommen} = ${rijen * kolommen}`,
        kort ? "Samen zoveel!" : `Samen zijn het er ${rijen * kolommen}.`,
        true,
      ),
    ];
  },
  (som) => {
    const [rijen, kolommen] = som.getallen;
    if (!rijen || !kolommen) return null;
    const nieuw = rijen > 2 ? rijen - 1 : rijen + 1;
    return {
      soort: som.soort,
      variant: som.variant,
      getallen: [nieuw, kolommen],
      goed: nieuw * kolommen,
      extra: { tafel: nieuw, mee: kolommen, product: nieuw * kolommen },
    };
  },
);

export const keerplaatjesUitleg: Uitlegbron = bron(
  {
    waarde: "som-opschrijven",
    label: "De som opschrijven",
    uitleg: "Schrijf op wat je ziet: zoveel rijen van zoveel. Dat is de keersom.",
  },
  (som, kort) => {
    const [rijen, kolommen] = som.getallen;
    if (!rijen || !kolommen) return [];
    return [
      stap(String(rijen), kort ? "Zoveel rijen zijn er." : `Er zijn ${rijen} rijen.`),
      stap(String(kolommen), kort ? "Zoveel staan er in een rij." : `In elke rij staan er ${kolommen}.`),
      stap(
        `${rijen} × ${kolommen} = ${rijen * kolommen}`,
        kort ? "Dat is de som!" : `De som is dus ${rijen} × ${kolommen} = ${rijen * kolommen}.`,
        true,
      ),
    ];
  },
  (som) => {
    const [rijen, kolommen] = som.getallen;
    if (!rijen || !kolommen) return null;
    const nieuw = rijen > 2 ? rijen - 1 : rijen + 1;
    return {
      soort: som.soort,
      variant: som.variant,
      getallen: [nieuw, kolommen],
      goed: nieuw * kolommen,
      extra: { tafel: nieuw, mee: kolommen, product: nieuw * kolommen },
    };
  },
);

export const handigkeerUitleg: Uitlegbron = bron(
  {
    waarde: "som-die-je-kent",
    label: "De som die je al kent",
    uitleg: "Gebruik de som die je al kent en maak daar de nieuwe som mee.",
  },
  (som, kort) => {
    const { tafel, mee } = stukken(som);
    const nieuw = som.extra?.nieuweMee ?? mee * 2;
    if (!mee || !nieuw) return [];
    const keer = nieuw / mee;
    return [
      stap(`${tafel} × ${mee} = ${tafel * mee}`, kort ? "Deze ken je al." : `Je weet al dat ${tafel} × ${mee} = ${tafel * mee}.`),
      stap(`${mee} × ${keer} = ${nieuw}`, kort ? `${nieuw} is ${keer} keer zoveel.` : `En ${nieuw} is ${keer} keer ${mee}.`),
      stap(
        `${tafel} × ${nieuw} = ${tafel * nieuw}`,
        kort ? "Dus de uitkomst ook!" : `Dan is de uitkomst ook ${keer} keer zo groot: ${tafel * nieuw}.`,
        true,
      ),
    ];
  },
  anderMee,
);

export const keernullenUitleg: Uitlegbron = bron(
  {
    waarde: "nul-erbij",
    label: "Een nul erbij",
    uitleg: "Reken de eerste som uit; komt er een nul bij de uitkomst, dan ook bij het antwoord.",
  },
  (som, kort) => {
    const { tafel, mee } = stukken(som);
    if (!tafel || !mee) return [];
    return [
      stap(`${tafel} × ${mee} = ${tafel * mee}`, kort ? "Reken de eerste uit." : `De eerste som is ${tafel} × ${mee} = ${tafel * mee}.`),
      stap(
        `${tafel} × ${mee * 10} = ${tafel * mee * 10}`,
        kort ? "Een nul erbij." : `Komt er een nul bij, dan hier ook: ${mee * 10}.`,
      ),
      stap(
        `${tafel} × ${mee * 100} = ${tafel * mee * 100}`,
        kort ? "En nog een nul!" : `En nog een nul: ${mee * 100}.`,
        true,
      ),
    ];
  },
  anderMee,
);

export const keerdeelkoppelenUitleg: Uitlegbron = bron(
  {
    waarde: "dezelfde-getallen",
    label: "Dezelfde getallen zoeken",
    uitleg: "Reken de deelsom uit en zoek de keersom met dezelfde drie getallen.",
  },
  (som, kort) => {
    const { tafel, mee, product } = stukken(som);
    return [
      stap(`${product} : ${tafel} = ${mee}`, kort ? "Reken de deelsom uit." : `${product} : ${tafel} is ${mee}.`),
      stap(`${tafel} en ${mee}`, kort ? "Zoek die getallen." : `Zoek nu de keersom met ${tafel} en ${mee}.`),
      stap(
        `${tafel} × ${mee} = ${product}`,
        kort ? "Die hoort erbij!" : `Dat is ${tafel} × ${mee} = ${product}.`,
        true,
      ),
    ];
  },
  anderMee,
);

export const keerdeelsamenUitleg: Uitlegbron = bron(
  {
    waarde: "twee-kanten",
    label: "Twee kanten van dezelfde som",
    uitleg: "Reken de deelsom uit; datzelfde getal past ook in de keersom eronder.",
  },
  (som, kort) => {
    const { tafel, mee, product } = stukken(som);
    return [
      stap(`${product} : ${tafel} = ${mee}`, kort ? "Reken de deelsom uit." : `${product} : ${tafel} is ${mee}.`),
      stap(`${mee} × ${tafel} = ${product}`, kort ? "Hetzelfde getal past hier." : `Datzelfde getal past ook hier.`),
      stap(String(mee), kort ? "Twee keer hetzelfde!" : `In beide vakjes komt dus ${mee}.`, true),
    ];
  },
  anderMee,
);

export const marktkraamUitleg: Uitlegbron = bron(
  {
    waarde: "per-soort-dan-samen",
    label: "Per soort, dan samen",
    uitleg: "Reken per soort een keersom uit en tel die bedragen daarna bij elkaar op.",
  },
  (som, kort) => {
    const totaal = som.extra?.totaal ?? som.goed;
    const betaald = som.extra?.betaald ?? 0;
    const stappen = [
      stap("aantal × prijs", kort ? "Reken per soort." : "Reken per soort het aantal keer de prijs."),
      stap(`€ ${totaal}`, kort ? "Tel de bedragen op." : `Samen kost het € ${totaal}.`),
    ];
    if (betaald) {
      stappen.push(
        stap(
          `${betaald} − ${totaal} = ${betaald - totaal}`,
          kort ? "Haal het van je geld af!" : `Van € ${betaald} blijft € ${betaald - totaal} over.`,
          true,
        ),
      );
    } else {
      stappen.push(stap(`€ ${totaal}`, kort ? "Dat is het totaal!" : `Dat is het antwoord.`, true));
    }
    return stappen;
  },
  () => null,
);
