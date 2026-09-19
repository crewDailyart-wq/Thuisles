/**
 * Zo pak je een telrij op stapstenen aan.
 *
 * Dit is wat een kind ziet als er geen denkfout wordt herkend: geen gok over
 * wat er misging, maar gewoon de werkwijze. Eerst de sprong aflezen uit twee
 * stenen die al ingevuld zijn, dan van links naar rechts doortellen.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

function sprongVan(som: Somgegevens): number {
  return som.extra?.sprong ?? 1;
}

function legePlekken(som: Somgegevens): number[] {
  const hoeveel = som.extra?.aantalLeeg ?? 0;
  return Array.from({ length: hoeveel }, (_, k) => som.extra?.[`leeg${k}`] ?? -1).filter(
    (p) => p >= 0,
  );
}

/**
 * Twee stenen die het kind ook echt ingevuld ziet staan, zo dicht mogelijk bij
 * elkaar.
 *
 * De stappen hieronder zeggen "kijk naar twee stenen die al ingevuld zijn" en
 * wijzen daar twee getallen bij aan. Dat waren altijd de eerste twee van de
 * rij, maar die staan er niet altijd: bij "om en om" is de tweede steen juist
 * leeg, en met het vinkje "Eerste steen mag ook leeg zijn" kan zelfs de eerste
 * weg zijn. Hetzelfde staat in de foutpatronen en in de uitleg-animatie.
 */
function ingevuldPaar(som: Somgegevens): { a: number; b: number } {
  const lege = legePlekken(som);
  const staan = som.getallen.map((_, i) => i).filter((i) => !lege.includes(i));
  let beste = { a: 0, b: Math.min(1, som.getallen.length - 1) };
  let afstand = Infinity;
  for (let k = 1; k < staan.length; k++) {
    const d = staan[k] - staan[k - 1];
    if (d < afstand) {
      afstand = d;
      beste = { a: staan[k - 1], b: staan[k] };
    }
  }
  return beste;
}

/** Het woord dat bij de richting hoort, zodat de zinnen vanzelf kloppen. */
function woorden(som: Somgegevens) {
  const terug = som.variant === "terug";
  return {
    terug,
    erbij: terug ? "eraf" : "erbij",
    richting: terug ? "terug" : "vooruit",
    teken: terug ? "−" : "+",
  };
}

export const stapstenenAanpak: Aanpak = {
  zin: (som) => {
    const sprong = sprongVan(som);
    const w = woorden(som);
    return {
      "34": `Doe er elke steen ${sprong} ${w.erbij}.`,
      "56": `Elke steen gaat ${sprong} ${w.erbij}. Tel van links naar rechts door.`,
      "78": `De rij loopt met sprongen van ${sprong} ${w.richting}. Lees de sprong af uit twee stenen die al ingevuld zijn en tel van links naar rechts door.`,
    };
  },

  stappen: (som) => {
    const r = som.getallen;
    const sprong = sprongVan(som);
    const w = woorden(som);
    const { a, b } = ingevuldPaar(som);
    const stappenTussen = b - a;
    return [
      {
        tekst: "Kijk naar twee stenen die al ingevuld zijn.",
        som: `${r[a]} en ${r[b]}`,
      },
      stappenTussen === 1
        ? { tekst: "Het verschil daartussen is de sprong.", som: `${sprong}` }
        : {
            tekst: `Daar liggen ${stappenTussen} sprongen tussen, dus deel het verschil.`,
            som: `${Math.abs(r[b] - r[a])} : ${stappenTussen} = ${sprong}`,
          },
      {
        tekst: `Doe die sprong er bij elke volgende steen ${w.erbij}.`,
        som: `${r[a]} ${w.teken} ${sprong} = ${r[a + 1]}`,
      },
      { tekst: "Zo loopt de hele rij af, van links naar rechts.", som: r.join(" → ") },
    ];
  },

  controle: (som) => {
    const r = som.getallen;
    const lege = legePlekken(som);
    const sprong = sprongVan(som);
    const w = woorden(som);
    const antwoorden = lege.map((p) => r[p]);

    if (antwoorden.length === 1) {
      const p = lege[0];
      /*
        Is de eerste steen de lege, dan is er geen steen ervóór om vanaf te
        tellen. Dan gaat het andersom: vanaf de eerste steen die wél een getal
        heeft terugrekenen naar het begin van de rij. Het teken draait daarbij
        om, want naar links toe gaat een oplopende rij juist omlaag.
      */
      if (p === 0) {
        const na = r.findIndex((_, i) => i > 0 && !lege.includes(i));
        if (na > 0) {
          const stap = na * sprong;
          return `Het goede antwoord is ${antwoorden[0]}, want ${r[na]} ${
            w.terug ? "+" : "−"
          } ${stap} = ${antwoorden[0]}.`;
        }
      }
      const vorige = p > 0 ? r[p - 1] : r[0];
      return `Het goede antwoord is ${antwoorden[0]}, want ${vorige} ${w.teken} ${sprong} = ${antwoorden[0]}.`;
    }
    return `De goede antwoorden zijn ${antwoorden.join(" en ")}, want de rij gaat met sprongen van ${sprong} ${w.richting}: ${r.join(" → ")}.`;
  },
};
