/**
 * "Zo los je het op" bij de keersommen en de deelsommen.
 *
 * Eén per opdrachtsoort, want de weg naar het antwoord verschilt: bij een
 * raster tel je rij voor rij, bij een kale keersom tel je de tafel door, bij
 * een deelsom zoek je hoe vaak het erin past, en bij het koppelen reken je som
 * voor som uit.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `extra.tafel` is het getal van
 * de tafel, `extra.mee` hoe vaak, `extra.product` wat er samen uitkomt. `goed`
 * is wat er gevraagd wordt — bij een keersom het product, bij een deelsom de
 * `mee`.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

function stukken(som: Somgegevens) {
  const tafel = som.extra?.tafel ?? som.getallen[0] ?? 0;
  const mee = som.extra?.mee ?? som.getallen[1] ?? 0;
  const product = som.extra?.product ?? tafel * mee;
  return { tafel, mee, product };
}

/** De tafel doortellen, ingekort als hij lang wordt: 7, 14, 21 … 63 */
function rij(stap: number, aantal: number): string {
  const getallen = Array.from(
    { length: Math.min(Math.max(aantal, 1), 15) },
    (_, i) => stap * (i + 1),
  );
  return getallen.length > 4
    ? `${getallen.slice(0, 3).join(", ")} … ${getallen[getallen.length - 1]}`
    : getallen.join(", ");
}

// ---------------------------------------------------------------------------
// Delen
// ---------------------------------------------------------------------------

export const deelsomAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product } = stukken(som);
    return {
      "34": `Hoe vaak past ${tafel} in ${product}? Tel de tafel: ${rij(tafel, mee)}.`,
      "56": `Zoek hoe vaak ${tafel} in ${product} past. Tel de tafel van ${tafel} door: ${rij(tafel, mee)}.`,
      "78": `Delen is de omgekeerde keersom: je zoekt het getal dat met ${tafel} vermenigvuldigd ${product} geeft. Tel de tafel door: ${rij(tafel, mee)}.`,
    };
  },
  stappen: (som) => {
    const { tafel, mee, product } = stukken(som);
    return [
      { tekst: "Dit is de som.", som: `${product} : ${tafel}` },
      { tekst: `Hoe vaak past ${tafel} in ${product}?`, som: rij(tafel, mee) },
      { tekst: "Dat zijn zoveel stappen.", som: String(mee) },
    ];
  },
  controle: (som) => {
    const { tafel, mee, product } = stukken(som);
    return `Het goede antwoord is ${mee}, want ${tafel} × ${mee} = ${product}.`;
  },
};

export const deelkoppelenAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product } = stukken(som);
    return {
      "34": "Reken een som uit en zoek dat getal.",
      "56": `Reken elke som uit en sleep de uitkomst ernaartoe: ${product} : ${tafel} is ${mee}.`,
      "78": "Werk de sommen van boven naar beneden af. Weet je er een niet, sla die dan over: aan het eind blijft het goede getal vanzelf over.",
    };
  },
  stappen: (som) => {
    const { tafel, mee, product } = stukken(som);
    return [
      { tekst: "Reken de eerste som uit.", som: `${product} : ${tafel} = ${mee}` },
      { tekst: "Zoek dat getal.", som: String(mee) },
      { tekst: "Sleep het naar de som.", som: "→" },
    ];
  },
  controle: (som) => {
    const { tafel, mee, product } = stukken(som);
    return `Bij de eerste som hoort ${mee}, want ${product} : ${tafel} = ${mee}.`;
  },
};

export const welkedeelsomAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product } = stukken(som);
    return {
      "34": `Kies een tafel. ${tafel} keer ${mee} is ${product}.`,
      "56": `Kies zelf een tafel. Neem bijvoorbeeld de tafel van ${tafel}: ${tafel} × ${mee} = ${product}, dus ${product} : ${tafel} = ${mee}.`,
      "78": `Begin bij de uitkomst en kies zelf een tafel. Elke deelsom die uitkomt is goed: ${product} : ${tafel} = ${mee} bijvoorbeeld. Reken de keersom uit en draai hem om.`,
    };
  },
  stappen: (som) => {
    const { tafel, mee, product } = stukken(som);
    return [
      { tekst: "Dit moet eruit komen.", som: String(mee) },
      { tekst: "Kies een tafel, bijvoorbeeld:", som: `${tafel} × ${mee} = ${product}` },
      { tekst: "Draai hem om.", som: `${product} : ${tafel} = ${mee}` },
    ];
  },
  controle: (som) => {
    const { tafel, mee, product } = stukken(som);
    return `${product} : ${tafel} = ${mee} is bijvoorbeeld goed. Elke deelsom die op ${mee} uitkomt mag.`;
  },
};

// ---------------------------------------------------------------------------
// Tafels
// ---------------------------------------------------------------------------

export const keersomAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product } = stukken(som);
    return {
      "34": `${tafel} × ${mee} is ${tafel} keer ${mee}: ${rij(mee, tafel)}.`,
      "56": `${tafel} × ${mee} betekent ${tafel} keer ${mee} erbij: ${rij(mee, tafel)}.`,
      "78": `${tafel} × ${mee} betekent ${tafel} keer ${mee} erbij: ${rij(mee, tafel)}. Je mag ook omdraaien: ${mee} × ${tafel} geeft hetzelfde, en soms is die tafel makkelijker.`,
    };
  },
  stappen: (som) => {
    const { tafel, mee, product } = stukken(som);
    return [
      { tekst: "Dit is de som.", som: `${tafel} × ${mee}` },
      { tekst: "Tel de tafel door.", som: rij(mee, tafel) },
      { tekst: "Je komt uit op:", som: String(product) },
    ];
  },
  controle: (som) => {
    const { tafel, mee, product } = stukken(som);
    return `Het goede antwoord is ${product}, want ${tafel} × ${mee} = ${product}.`;
  },
};

export const keerkoppelenAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product } = stukken(som);
    return {
      "34": "Reken een som uit en zoek dat getal.",
      "56": `Reken elke som uit en sleep de uitkomst ernaartoe: ${tafel} × ${mee} is ${product}.`,
      "78": "Werk de sommen van boven naar beneden af. Begin met de tafels die je zeker weet; aan het eind blijft het goede getal vanzelf over.",
    };
  },
  stappen: (som) => {
    const { tafel, mee, product } = stukken(som);
    return [
      { tekst: "Reken de eerste som uit.", som: `${tafel} × ${mee} = ${product}` },
      { tekst: "Zoek dat getal.", som: String(product) },
      { tekst: "Sleep het naar de som.", som: "→" },
    ];
  },
  controle: (som) => {
    const { tafel, mee, product } = stukken(som);
    return `Bij de eerste som hoort ${product}, want ${tafel} × ${mee} = ${product}.`;
  },
};

export const welkekeersomAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product } = stukken(som);
    return {
      "34": `Zoek twee getallen. ${tafel} keer ${mee} is ${product}.`,
      "56": `Zoek twee getallen die samen ${product} maken: ${tafel} × ${mee} = ${product} bijvoorbeeld.`,
      "78": `Loop de tafels langs die je kent en kijk welke op ${product} uitkomt. Elke keersom die klopt is goed, dus ${tafel} × ${mee} mag net zo goed als ${mee} × ${tafel}.`,
    };
  },
  stappen: (som) => {
    const { tafel, mee, product } = stukken(som);
    return [
      { tekst: "Dit moet eruit komen.", som: String(product) },
      { tekst: "Zoek een tafel die erop uitkomt.", som: rij(tafel, mee) },
      { tekst: "Dus:", som: `${tafel} × ${mee} = ${product}` },
    ];
  },
  controle: (som) => {
    const { tafel, mee, product } = stukken(som);
    return `${tafel} × ${mee} = ${product} is bijvoorbeeld goed. Elke keersom die op ${product} uitkomt mag.`;
  },
};

export const keerrasterAanpak: Aanpak = {
  zin: (som) => {
    const [rijen, kolommen] = som.getallen;
    const totaal = rijen * kolommen;
    return {
      "34": `Tel per rij: ${rij(kolommen, rijen)}.`,
      "56": `Er zijn ${rijen} rijen van ${kolommen}. Tel per rij met sprongen: ${rij(kolommen, rijen)}.`,
      "78": `${rijen} rijen van ${kolommen} is ${rijen} × ${kolommen} = ${totaal}. Tellen met sprongen van ${kolommen} gaat sneller dan blokje voor blokje.`,
    };
  },
  stappen: (som) => {
    const [rijen, kolommen] = som.getallen;
    return [
      { tekst: "Kijk hoeveel er in één rij staan.", som: String(kolommen) },
      { tekst: "En hoeveel rijen er zijn.", som: String(rijen) },
      { tekst: "Tel per rij met sprongen.", som: rij(kolommen, rijen) },
      { tekst: "Samen is dat:", som: `${rijen} × ${kolommen} = ${rijen * kolommen}` },
    ];
  },
  controle: (som) => {
    const [rijen, kolommen] = som.getallen;
    return `Het zijn er ${rijen * kolommen}, want ${rijen} × ${kolommen} = ${rijen * kolommen}.`;
  },
};

export const keerplaatjesAanpak: Aanpak = {
  zin: (som) => {
    const [rijen, kolommen] = som.getallen;
    const totaal = rijen * kolommen;
    return {
      "34": `Tel de rijen. Tel er één rij.`,
      "56": `Tel eerst hoeveel rijen er zijn (${rijen}) en hoeveel er in een rij staan (${kolommen}). Dat wordt de som: ${rijen} × ${kolommen} = ${totaal}.`,
      "78": `Schrijf op wat je ziet: ${rijen} rijen van ${kolommen}. Dat is de som ${rijen} × ${kolommen} = ${totaal}.`,
    };
  },
  stappen: (som) => {
    const [rijen, kolommen] = som.getallen;
    return [
      { tekst: "Zoveel rijen zijn er.", som: String(rijen) },
      { tekst: "Zoveel staan er in een rij.", som: String(kolommen) },
      { tekst: "Samen is dat de som:", som: `${rijen} × ${kolommen} = ${rijen * kolommen}` },
    ];
  },
  controle: (som) => {
    const [rijen, kolommen] = som.getallen;
    return `De som is ${rijen} × ${kolommen} = ${rijen * kolommen}.`;
  },
};

export const handigkeerAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee } = stukken(som);
    /* `extra.nieuweMee` is het tweede getal van de nieuwe som. */
    const nieuw = som.extra?.nieuweMee ?? mee * 2;
    const keer = nieuw / mee;
    return {
      "34": `De som eronder is ${keer} keer zo groot.`,
      "56": `${tafel} × ${mee} weet je al. ${nieuw} is ${keer} keer ${mee}, dus de uitkomst wordt ook ${keer} keer zo groot.`,
      "78": `Gebruik de som die je al kent. ${nieuw} is ${keer} × ${mee}, dus het antwoord van ${tafel} × ${nieuw} is ${keer} keer het antwoord van ${tafel} × ${mee}.`,
    };
  },
  stappen: (som) => {
    const { tafel, mee } = stukken(som);
    const nieuw = som.extra?.nieuweMee ?? mee * 2;
    const keer = nieuw / mee;
    return [
      { tekst: "Deze som ken je al.", som: `${tafel} × ${mee} = ${tafel * mee}` },
      { tekst: `${nieuw} is ${keer} keer ${mee}.`, som: `${mee} × ${keer} = ${nieuw}` },
      { tekst: "Dus de uitkomst ook:", som: `${tafel} × ${nieuw} = ${tafel * nieuw}` },
    ];
  },
  controle: (som) => {
    const { tafel, mee } = stukken(som);
    const nieuw = som.extra?.nieuweMee ?? mee * 2;
    return `Het goede antwoord is ${tafel * nieuw}, want ${tafel} × ${nieuw} = ${tafel * nieuw}.`;
  },
};

export const keernullenAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee } = stukken(som);
    return {
      "34": "Elke regel krijgt er een nul bij.",
      "56": `De eerste som is ${tafel} × ${mee} = ${tafel * mee}. De uitkomst krijgt er elke regel een nul bij, dus het antwoord ook.`,
      "78": `Reken de eerste som uit: ${tafel} × ${mee} = ${tafel * mee}. Komt er bij de uitkomst een nul bij, dan komt er bij het ontbrekende getal ook een nul bij — de tafel blijft dezelfde.`,
    };
  },
  stappen: (som) => {
    const { tafel, mee } = stukken(som);
    return [
      { tekst: "Reken de eerste som uit.", som: `${tafel} × ${mee} = ${tafel * mee}` },
      { tekst: "Een nul erbij in de uitkomst:", som: `${tafel} × ${mee * 10} = ${tafel * mee * 10}` },
      { tekst: "En nog een nul erbij:", som: `${tafel} × ${mee * 100} = ${tafel * mee * 100}` },
    ];
  },
  controle: (som) => {
    const { tafel, mee } = stukken(som);
    return `De antwoorden zijn ${mee}, ${mee * 10} en ${mee * 100}, want ${tafel} × ${mee} = ${tafel * mee}.`;
  },
};

export const keerdeelkoppelenAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product } = stukken(som);
    return {
      "34": `${product} : ${tafel} hoort bij ${tafel} × ${mee}.`,
      "56": `Reken de deelsom uit: ${product} : ${tafel} = ${mee}. Zoek dan de keersom met dezelfde getallen: ${tafel} × ${mee}.`,
      "78": `Een deelsom en een keersom met dezelfde drie getallen horen bij elkaar: ${product} : ${tafel} = ${mee} hoort bij ${tafel} × ${mee} = ${product}.`,
    };
  },
  stappen: (som) => {
    const { tafel, mee, product } = stukken(som);
    return [
      { tekst: "Reken de deelsom uit.", som: `${product} : ${tafel} = ${mee}` },
      { tekst: "Zoek dezelfde getallen terug.", som: `${tafel} × ${mee}` },
      { tekst: "Die hoort erbij.", som: `${tafel} × ${mee} = ${product}` },
    ];
  },
  controle: (som) => {
    const { tafel, mee, product } = stukken(som);
    return `Bij ${product} : ${tafel} hoort ${tafel} × ${mee}, want die komt ook op ${product} uit.`;
  },
};

export const keerdeelsamenAanpak: Aanpak = {
  zin: (som) => {
    const { tafel, mee, product } = stukken(som);
    return {
      "34": "Twee keer hetzelfde antwoord.",
      "56": `In beide vakjes komt hetzelfde getal: ${product} : ${tafel} = ${mee} en ${mee} × ${tafel} = ${product}.`,
      "78": `De twee sommen zijn twee kanten van dezelfde som. Reken de deelsom uit (${product} : ${tafel} = ${mee}); dat getal past ook in de keersom eronder.`,
    };
  },
  stappen: (som) => {
    const { tafel, mee, product } = stukken(som);
    return [
      { tekst: "Reken de deelsom uit.", som: `${product} : ${tafel} = ${mee}` },
      { tekst: "Datzelfde getal past hier ook.", som: `${mee} × ${tafel} = ${product}` },
    ];
  },
  controle: (som) => {
    const { tafel, mee, product } = stukken(som);
    return `In beide vakjes komt ${mee}, want ${tafel} × ${mee} = ${product}.`;
  },
};

export const marktkraamAanpak: Aanpak = {
  zin: (som) => {
    /*
      `getallen` zijn de prijzen en aantallen om en om; `extra.totaal` is wat het
      samen kost en `extra.betaald` waarmee er betaald wordt (0 = niet).
    */
    const totaal = som.extra?.totaal ?? som.goed;
    const betaald = som.extra?.betaald ?? 0;
    return {
      "34": betaald ? "Haal de prijs van je geld af." : "Reken per soort, dan samen.",
      "56": betaald
        ? `Reken eerst uit wat het samen kost (€ ${totaal}). Haal dat van € ${betaald} af.`
        : `Reken per soort uit wat het kost, met een keersom. Tel die bedragen daarna bij elkaar op: € ${totaal}.`,
      "78": betaald
        ? `Eerst de keersommen per soort, dan het totaal (€ ${totaal}), en daarna € ${betaald} − € ${totaal}.`
        : `Per soort een keersom (aantal × prijs), en die bedragen bij elkaar: € ${totaal}.`,
    };
  },
  stappen: (som) => {
    const totaal = som.extra?.totaal ?? som.goed;
    const betaald = som.extra?.betaald ?? 0;
    const stappen = [
      { tekst: "Reken per soort: aantal keer de prijs.", som: "aantal × prijs" },
      { tekst: "Tel die bedragen op.", som: `€ ${totaal}` },
    ];
    if (betaald) {
      stappen.push({ tekst: "Haal dat van je geld af.", som: `${betaald} − ${totaal} = ${betaald - totaal}` });
    }
    return stappen;
  },
  controle: (som) => {
    const totaal = som.extra?.totaal ?? som.goed;
    const betaald = som.extra?.betaald ?? 0;
    return betaald
      ? `Je krijgt € ${betaald - totaal} terug, want het kost € ${totaal} en ${betaald} − ${totaal} = ${betaald - totaal}.`
      : `Het kost samen € ${totaal}.`;
  },
};
