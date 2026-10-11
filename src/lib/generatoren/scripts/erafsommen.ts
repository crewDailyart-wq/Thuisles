/**
 * De uitleg-animaties bij de opdrachten van het domein Erafsommen.
 *
 * Alle drie de groepsvormen krijgen dezelfde weg langs dezelfde som, in hun
 * eigen tempo: groep 3-4 in korte zinnen van hooguit zes woorden, groep 5-6
 * met iets meer uitleg, groep 7-8 als lijstje dat je in één keer leest. Het
 * model is overal de som op één regel; de opgave zelf staat al in beeld.
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

/**
 * Het plaatje waarmee de kale minsom wordt voorgedaan.
 *
 * Eén soort voor alle sommen van dit type: de appel kent elk kind, en een
 * vaste keuze houdt de uitleg rustig. De kale som zelf heeft geen voorwerp,
 * dus die moet hier gekozen worden.
 */
const UITLEGPLAATJE = "appel";

/** Eén stap met de som in plaatjes: grijs is wat eraf gaat. */
function beeldstap(
  totaal: number,
  eraf: number,
  zin: string,
  bijschrift?: string,
  feest = false,
): Uitlegscript["stappen"][number] {
  return {
    model: { soort: "erafplaatjes", totaal, eraf, plaatje: UITLEGPLAATJE, bijschrift },
    zin,
    houding: feest ? "juichend" : "wijzend",
    ...(feest ? { feest: true, beweging: "juichen" as const } : {}),
  };
}

/** Een uitlegbron met één strategie en één script voor alle groepen. */
function bron(
  strategie: { waarde: string; label: string; uitleg: string },
  regels: (som: Somgegevens, kort: boolean) => Uitlegscript["stappen"],
  modellen: string[] = ["som"],
): Uitlegbron {
  return {
    modellen,
    strategieen: [strategie],
    standaardStrategie: () => strategie.waarde,
    script(som, vorm: Groepsvorm) {
      const [van, af] = som.getallen;
      if (!Number.isFinite(van) || !Number.isFinite(af)) return null;
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
      if (!Number.isFinite(van) || !Number.isFinite(af)) return null;
      const nieuw = af > 2 ? af - 1 : af + 1;
      if (van - nieuw < 0) return null;
      return { soort: som.soort, variant: som.variant, getallen: [van, nieuw], goed: van - nieuw };
    },
  };
}

/**
 * De kale som alsnog in plaatjes.
 *
 * Ging het mis, dan helpt het beeld meer dan nog eens dezelfde cijfers. Eerst
 * staat de hele groep er fel, dan worden de plaatjes die eraf gaan grijs, en
 * daarna telt Vos wat er overblijft — dezelfde beeldtaal als bij de andere
 * opdrachten van het onderwerp.
 */
function terugtellen(som: Somgegevens, kort: boolean): Uitlegscript["stappen"] {
  const [van, af] = som.getallen;
  return [
    beeldstap(van, 0, kort ? "Zoveel had je." : `Je begint met ${van}.`, String(van)),
    beeldstap(van, af, kort ? "Deze gaan eraf." : `Er gaan er ${af} af.`, `${van} − ${af}`),
    beeldstap(
      van,
      af,
      kort ? "Tel wat er fel blijft!" : `Er blijft ${van - af} over.`,
      `${van} − ${af} = ${van - af}`,
      true,
    ),
  ];
}

export const wegstrepenUitleg: Uitlegbron = bron(
  {
    waarde: "wegstrepen-en-tellen",
    label: "Wegstrepen en tellen",
    uitleg: "Streep er zoveel weg als er af moeten, en tel daarna wat er nog staat.",
  },
  (som, kort) => {
    const [van, af] = som.getallen;
    return [
      stap(String(van), kort ? "Zoveel staan er." : `Er staan er ${van}.`),
      stap(String(af), kort ? "Streep er zoveel weg." : `Streep er ${af} weg.`),
      stap(
        `${van} − ${af} = ${van - af}`,
        kort ? "Tel wat er nog staat!" : `Er staan er nog ${van - af}.`,
        true,
      ),
    ];
  },
);

export const minsomplaatjeUitleg: Uitlegbron = bron(
  {
    waarde: "som-opschrijven",
    label: "De som opschrijven",
    uitleg: "Schrijf op hoeveel er eerst waren, hoeveel er weggingen, en wat er overblijft.",
  },
  (som, kort) => {
    const [van, af] = som.getallen;
    return [
      stap(String(van), kort ? "Zoveel waren er eerst." : `Eerst waren er ${van}.`),
      stap(`${van} − ${af}`, kort ? "Zoveel gingen er weg." : `Er gingen er ${af} weg.`),
      stap(
        `${van} − ${af} = ${van - af}`,
        kort ? "Dit is de hele som!" : `De hele som is ${van} min ${af} is ${van - af}.`,
        true,
      ),
    ];
  },
);

export const plaatjesminsomUitleg: Uitlegbron = bron(
  {
    waarde: "tellen-en-aftrekken",
    label: "Tellen en aftrekken",
    uitleg: "Tel eerst het grote groepje, haal daar het kleine groepje vanaf.",
  },
  (som, kort) => {
    const [van, af] = som.getallen;
    return [
      stap(String(van), kort ? "Tel het eerste groepje." : `Het eerste groepje is ${van}.`),
      stap(String(af), kort ? "Zoveel gaan eraf." : `Er gaan er ${af} af.`),
      stap(
        `${van} − ${af} = ${van - af}`,
        kort ? "Zoveel blijven er over!" : `Er blijven er ${van - af} over.`,
        true,
      ),
    ];
  },
);

export const minsomUitleg: Uitlegbron = bron(
  {
    waarde: "terugtellen",
    label: "Terugtellen vanaf het grootste getal",
    uitleg: "Begin bij het grootste getal en tel het andere eraf.",
  },
  terugtellen,
  ["erafplaatjes"],
);

/** De laser (Godot): reken elke som uit; de goede sommen geven het doelgetal. */
export const laserminUitleg: Uitlegbron = bron(
  {
    waarde: "som-voor-som",
    label: "Som voor som",
    uitleg: "Reken elke som uit en kijk of het doelgetal eruit komt.",
  },
  (som, kort) => {
    const [van, af] = som.getallen;
    return [
      stap(`${van} − ${af}`, kort ? "Reken deze som uit." : "Reken elke som uit."),
      stap(String(van - af), kort ? "Dit komt eruit." : `${van} − ${af} is ${van - af}.`, true),
    ];
  },
);

export const minkoppelenUitleg: Uitlegbron = bron(
  {
    waarde: "som-voor-som",
    label: "Som voor som",
    uitleg: "Reken een som uit en zoek het getal dat erbij hoort.",
  },
  (som, kort) => {
    const [van, af] = som.getallen;
    return [
      stap(`${van} − ${af}`, kort ? "Neem de eerste som." : "Begin bij de eerste som."),
      stap(String(van - af), kort ? "Dit komt eruit." : `Die is ${van - af}.`),
      stap("→", kort ? "Sleep het getal erheen!" : "Sleep dat getal ernaartoe.", true),
    ];
  },
);
