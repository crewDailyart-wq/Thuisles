/**
 * Wat er bij een tijd-opdracht in de vakjes hoort.
 *
 * Net als `keerfiguren.ts`: een gewoon bestand zonder React, zodat `npm run
 * opgaven` van élke gemaakte opgave kan nakijken dat het antwoord van de
 * generator precies past op de vakjes die het scherm tekent. Dat is de fout die
 * je anders pas merkt als een kind een goed antwoord rood ziet worden.
 */

import type { Figuur } from "@/lib/generatoren/soort";
import { inMinuten, verschil } from "@/lib/tijd";

/** De figuren van het domein Tijd. */
export type Tijdfiguur = Extract<
  Figuur,
  {
    soort:
      | "urenminuten"
      | "dagdeel"
      | "klokaflezen"
      | "klokkiezen"
      | "klokzetten"
      | "klokkoppelen"
      | "klokkenvolgorde"
      | "kloktypen"
      | "wijzeraanwijzen"
      | "klokklopt"
      | "klokduur"
      | "digitaaldelen"
      | "digitaaldagdeel"
      | "digitaalaflezen"
      | "digitaalverschil"
      | "klokvlek"
      | "dagvraag"
      | "dagenaanvullen"
      | "maandvraag"
      | "maandenaanvullen"
      | "kalenderdag"
      | "kalenderzoek"
      | "kalenderaantal"
      | "kalenderdatum"
      | "kalendernachtjes";
  }
>;

export const TIJDSOORTEN = [
  "urenminuten",
  "dagdeel",
  "klokaflezen",
  "klokkiezen",
  "klokzetten",
  "klokkoppelen",
  "klokkenvolgorde",
  "kloktypen",
  "wijzeraanwijzen",
  "klokklopt",
  "klokduur",
  "digitaaldelen",
  "digitaaldagdeel",
  "digitaalaflezen",
  "digitaalverschil",
  "klokvlek",
  "dagvraag",
  "dagenaanvullen",
  "maandvraag",
  "maandenaanvullen",
  "kalenderdag",
  "kalenderzoek",
  "kalenderaantal",
  "kalenderdatum",
  "kalendernachtjes",
];

export function isTijdfiguur(figuur: Figuur | null | undefined): figuur is Tijdfiguur {
  return figuur !== null && figuur !== undefined && TIJDSOORTEN.includes(figuur.soort);
}

/**
 * Het antwoord dat bij deze tekening hoort, als tekst.
 *
 * Eén tekst, precies zoals de generator hem opslaat en zoals het scherm hem
 * doorgeeft: bij meerdere vakjes met komma's ertussen, bij een keuze het nummer
 * van de knop, en bij woorden het woord zelf.
 */
export function juistAntwoord(figuur: Tijdfiguur): string {
  switch (figuur.soort) {
    case "urenminuten":
      return String(figuur.uitkomst);

    case "kalenderaantal":
      return String(figuur.uitkomst);

    case "kalenderzoek":
      return String(figuur.juisteDag);

    case "kalendernachtjes":
      return String(figuur.doel - figuur.dag);

    /*
      De keuze-opdrachten: het nummer van de knop die goed is.

      Dat nummer staat in de figuur. De keuzes worden gehusseld, en welke er dan
      goed is valt uit de tekening alleen af te leiden door de hele vraag opnieuw
      uit te rekenen — bij "Welke maand komt 2 maanden voor maart?" is dat een
      andere som dan het tekenen van het scherm. Eén getal in de figuur houdt het
      simpel én controleerbaar: het script kan nakijken dat het antwoord van de
      generator en de knop van het scherm hetzelfde zijn.
    */
    case "dagdeel":
    case "klokaflezen":
    case "digitaaldagdeel":
    case "digitaalaflezen":
    case "klokvlek":
    case "dagvraag":
    case "maandvraag":
    case "kalenderdag":
    case "kalenderdatum":
      return String(figuur.goed);

    case "klokkiezen": {
      const doel = doeltijd(figuur);
      const welke = figuur.keuzes.findIndex(
        (k) => k.uur === doel.uur && k.minuut === doel.minuut,
      );
      return String(welke);
    }

    case "klokzetten": {
      /*
        Een wijzerklok kent geen 18 uur: de kleine wijzer staat daar gewoon op
        de 6. Daarom telt alleen het uur op de wijzerplaat, 0 tot en met 11.
      */
      const doel = doeltijd(figuur);
      return `${doel.uur % 12},${doel.minuut}`;
    }

    case "kloktypen":
      return `${figuur.uur},${figuur.minuut}`;

    case "wijzeraanwijzen":
      return figuur.gevraagd === "uur" ? "0" : "1";

    case "digitaaldelen":
      return figuur.gevraagd === "uur" ? "0" : "1";

    case "klokklopt":
      return figuur.klopt ? "0" : "1";

    case "klokkoppelen":
      /* Per klok het nummer van de digitale tijd die eronder hoort. */
      return figuur.klokken
        .map((k) =>
          figuur.keuzes.findIndex((c) => c.uur === k.uur && c.minuut === k.minuut),
        )
        .join(",");

    case "klokkenvolgorde":
      /* Per plek van vroeg naar laat het nummer van de klok die daar hoort. */
      return figuur.klokken
        .map((_, i) => i)
        .sort(
          (a, b) =>
            inMinuten(figuur.klokken[a]) - inMinuten(figuur.klokken[b]),
        )
        .map((i) => String(i))
        .join(",");

    case "klokduur": {
      const stap =
        figuur.richting === "geleden"
          ? verschil(
              { uur: figuur.andereUur, minuut: figuur.andereMinuut },
              { uur: figuur.uur, minuut: figuur.minuut },
            )
          : verschil(
              { uur: figuur.uur, minuut: figuur.minuut },
              { uur: figuur.andereUur, minuut: figuur.andereMinuut },
            );
      return `${stap.uren},${stap.minuten}`;
    }

    case "digitaalverschil": {
      const eerste = { uur: figuur.eersteUur, minuut: figuur.eersteMinuut };
      const tweede = { uur: figuur.tweedeUur, minuut: figuur.tweedeMinuut };
      const stap =
        figuur.richting === "eerder" ? verschil(tweede, eerste) : verschil(eerste, tweede);
      return `${stap.uren},${stap.minuten}`;
    }

    case "dagenaanvullen":
    case "maandenaanvullen":
      /* De ontbrekende woorden, van links naar rechts. */
      return figuur.ontbreekt.join(",");
  }
}

/** Bij een verschuiving: de tijd waar het naartoe moet. */
export function doeltijd(figuur: Tijdfiguur): { uur: number; minuut: number } {
  if (figuur.soort === "klokkiezen") {
    const totaal = (figuur.uur * 60 + figuur.minuut + figuur.stap + 1440) % 1440;
    return { uur: Math.floor(totaal / 60), minuut: totaal % 60 };
  }
  if (figuur.soort === "klokzetten") {
    const totaal = (figuur.uur * 60 + figuur.minuut + figuur.schuif + 1440) % 1440;
    return { uur: Math.floor(totaal / 60), minuut: totaal % 60 };
  }
  return { uur: 0, minuut: 0 };
}

/**
 * Hoeveel vakjes of knoppen er zijn, en wat er in hoort.
 *
 * Voor de opdrachten waar het kind getallen typt. Bij een keuze-opdracht is er
 * één knop en is het antwoord het nummer daarvan; bij "hoe lang duurt het"
 * zijn er twee vakjes (uren en minuten).
 */
export function aantalVakjes(figuur: Tijdfiguur): number {
  switch (figuur.soort) {
    case "kloktypen":
    case "klokzetten":
    case "klokduur":
    case "digitaalverschil":
      return 2;
    case "klokkoppelen":
      return figuur.klokken.length;
    case "klokkenvolgorde":
      return figuur.klokken.length;
    case "dagenaanvullen":
      return figuur.rij.filter((d) => d === null).length;
    case "maandenaanvullen":
      return figuur.rij.filter((d) => d === null).length;
    default:
      return 1;
  }
}

/**
 * Mag het tweede vakje leeg blijven?
 *
 * Bij "hoeveel tijd later" en "hoe lang duurt het" typt het kind uren én
 * minuten. Is het verschil hele uren, dan hoort er 0 bij de minuten — en een
 * leeg minutenvakje telt dan net zo goed. Dat is een afspraak met de eigenaar:
 * een kind dat "3" bij de uren typt en het tweede vakje overslaat, heeft het
 * goed.
 */
export function minutenMagLeeg(figuur: Tijdfiguur): boolean {
  return figuur.soort === "digitaalverschil" || figuur.soort === "klokduur";
}
