/**
 * De uitleg-animaties bij de opdrachten met het rekenrek.
 *
 * Het rek speelt de som voor terwijl Vos vertelt: bij elke stap staan er
 * andere kralen weg, dus je ziet de som gebeuren in plaats van hem alleen te
 * lezen. De laatste stap zet de som in cijfers erbij, zodat het beeld en de
 * som aan elkaar geknoopt worden.
 *
 * Alle drie de groepsvormen krijgen dezelfde weg, in hun eigen tempo: groep
 * 3-4 in korte zinnen van hooguit zes woorden, groep 5-6 met iets meer uitleg,
 * groep 7-8 in één keer te lezen.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";
import { viaDeTien } from "@/lib/generatoren/aanpak/rekenrek";

/** Eén stap met het rekenrek erbij. */
function rek(
  aantal: number,
  weg: number,
  zin: string,
  bijschrift?: string,
  feest = false,
): Uitlegscript["stappen"][number] {
  return {
    model: { soort: "rekenrek", aantal, weg, bijschrift },
    zin,
    houding: feest ? "juichend" : "wijzend",
    ...(feest ? { feest: true, beweging: "juichen" as const } : {}),
  };
}

/** Een uitlegbron met één strategie en één script voor alle groepen. */
function bron(
  strategie: { waarde: string; label: string; uitleg: string },
  regels: (som: Somgegevens, kort: boolean) => Uitlegscript["stappen"],
  /* Flitsen heeft maar één getal: hoeveel kralen er stonden. */
  eenGetal = false,
): Uitlegbron {
  return {
    modellen: ["rekenrek"],
    strategieen: [strategie],
    standaardStrategie: () => strategie.waarde,
    script(som, vorm: Groepsvorm) {
      const [van, af] = som.getallen;
      if (!Number.isFinite(van) || (!eenGetal && !Number.isFinite(af))) return null;
      return {
        vorm,
        strategie: strategie.waarde,
        strategieNaam: strategie.label,
        stappen: regels(som, MANIER_VAN_VORM[vorm] === "34"),
      };
    },
    /* Een som van dezelfde soort met één getal anders. */
    vergelijkbaar(som) {
      const [van, af] = som.getallen;
      if (eenGetal && Number.isFinite(van)) {
        const nieuw = van > 1 ? van - 1 : van + 1;
        return { soort: som.soort, variant: som.variant, getallen: [nieuw], goed: nieuw };
      }
      if (!Number.isFinite(van) || !Number.isFinite(af)) return null;
      const nieuw = af > 2 ? af - 1 : af + 1;
      if (van - nieuw < 0) return null;
      return { soort: som.soort, variant: som.variant, getallen: [van, nieuw], goed: van - nieuw };
    },
  };
}

export const rekenrekflitsUitleg: Uitlegbron = bron(
  {
    waarde: "vijfstructuur",
    label: "Kijken met de vijfstructuur",
    uitleg: "Vijf rode en vijf witte kralen: tel met groepjes van vijf in plaats van één voor één.",
  },
  (som, kort) => {
    const aantal = som.getallen[0];
    return [
      rek(aantal, 0, kort ? "Zoveel kralen stonden er." : `${aantal === 1 ? "Er stond 1 kraal" : `Er stonden ${aantal} kralen`}.`, undefined),
      rek(
        aantal,
        0,
        kort ? "Vijf rood, vijf wit." : "Tel met de groepjes van vijf: vijf rood, vijf wit.",
        aantal >= 10 ? "10" : "5",
      ),
      rek(aantal, 0, kort ? "Samen zijn het er zoveel!" : `Samen zijn dat er ${aantal}.`, String(aantal), true),
    ];
  },
  true,
);

export const vanafTienUitleg: Uitlegbron = bron(
  {
    waarde: "wegschuiven",
    label: "Wegschuiven en tellen",
    uitleg: "Schuif er zoveel weg als er af moeten en tel wat er overblijft.",
  },
  (som, kort) => {
    const [van, af] = som.getallen;
    return [
      rek(van, 0, kort ? "Zoveel kralen staan er." : `Je begint met ${van} ${van === 1 ? "kraal" : "kralen"}.`, String(van)),
      rek(van, af, kort ? "Schuif er zoveel weg." : `Schuif er ${af} weg.`, `${van} − ${af}`),
      rek(van, af, kort ? "Zoveel blijven er over!" : `Er blijven er ${van - af} over.`, `${van} − ${af} = ${van - af}`, true),
    ];
  },
);

export const kleineSomUitleg: Uitlegbron = bron(
  {
    waarde: "binnen-het-tiental",
    label: "De tien blijft staan",
    uitleg: "Reken met de losse kralen; de volle bovenste rij blijft gewoon staan.",
  },
  (som, kort) => {
    const [van, af] = som.getallen;
    const eenheden = van % 10;
    return [
      rek(van, 0, kort ? "De tien is vol." : `Boven staan tien kralen, onder ${eenheden}.`, String(van)),
      rek(van, af, kort ? "Alleen onderaan gaat er wat af." : `Van de ${eenheden} gaan er ${af} af.`, `${eenheden} − ${af} = ${eenheden - af}`),
      rek(van, af, kort ? "De tien blijft staan!" : `De tien blijft staan, dus het zijn er ${van - af}.`, `${van} − ${af} = ${van - af}`, true),
    ];
  },
);

export const viaTienUitleg: Uitlegbron = bron(
  {
    waarde: "via-de-tien",
    label: "Eerst naar de tien",
    uitleg: "Haal er eerst zoveel af dat je op tien uitkomt, en daarna de rest.",
  },
  (som, kort) => {
    const { van, af, naarTien, rest, over } = viaDeTien(som);
    return [
      rek(van, 0, kort ? "Zoveel kralen staan er." : `Je begint met ${van} ${van === 1 ? "kraal" : "kralen"}.`, String(van)),
      rek(van, naarTien, kort ? "Eerst naar de tien." : `Haal er eerst ${naarTien} af; dan sta je op 10.`, `${van} − ${naarTien} = 10`),
      rek(van, af, kort ? "En dan de rest eraf." : `Daarna nog ${rest} eraf.`, `10 − ${rest} = ${over}`),
      rek(van, af, kort ? "Zoveel blijven er over!" : `Er blijven er ${over} over.`, `${van} − ${af} = ${over}`, true),
    ];
  },
);
