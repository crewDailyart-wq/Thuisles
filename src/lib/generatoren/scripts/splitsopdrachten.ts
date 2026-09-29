/**
 * De uitleg-animaties bij de vijf opdrachten van het domein Splitsen.
 *
 * Alle drie de groepsvormen krijgen dezelfde weg langs dezelfde sommen, maar in
 * hun eigen tempo: groep 3-4 in korte zinnen van hooguit zes woorden, groep 5-6
 * met iets meer uitleg, groep 7-8 als lijstje dat je in één keer leest. Het
 * model is overal de som op één regel — bij deze opdrachten ís de som al een
 * plaatje, dus er hoeft er geen tweede naast.
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
 * Een uitlegbron met één strategie en één script voor alle groepen.
 *
 * `regels` levert de stappen bij een som. Korter kan het niet: elk type heeft
 * zijn eigen zinnen, maar verder is de opbouw hetzelfde.
 */
function bron(
  strategie: { waarde: string; label: string; uitleg: string },
  regels: (som: Somgegevens, kort: boolean) => Uitlegscript["stappen"],
  nieuweSom: (som: Somgegevens) => Somgegevens | null,
): Uitlegbron {
  return {
    modellen: ["som"],
    strategieen: [strategie],
    standaardStrategie: () => strategie.waarde,
    script(som, vorm: Groepsvorm) {
      const [geheel, deel] = som.getallen;
      if (!Number.isFinite(geheel) || !Number.isFinite(deel)) return null;
      return {
        vorm,
        strategie: strategie.waarde,
        strategieNaam: strategie.label,
        stappen: regels(som, MANIER_VAN_VORM[vorm] === "34"),
      };
    },
    vergelijkbaar: nieuweSom,
  };
}

/** Een nieuwe som van dezelfde soort, eentje groter of kleiner. */
function anderePoging(som: Somgegevens, ruimte: number): Somgegevens | null {
  const [geheel, deel] = som.getallen;
  if (!Number.isFinite(geheel) || !Number.isFinite(deel)) return null;
  const nieuwDeel = deel > ruimte ? deel - 1 : deel + 1;
  if (nieuwDeel < 0 || nieuwDeel > geheel) return null;
  return {
    soort: som.soort,
    variant: som.variant,
    getallen: [geheel, nieuwDeel],
    goed: geheel - nieuwDeel,
  };
}

export const splitstabelUitleg: Uitlegbron = bron(
  {
    waarde: "aanvullen-tot",
    label: "Aanvullen tot het getal bovenaan",
    uitleg: "Kijk wat er staat en tel door tot het getal bovenaan.",
  },
  (som, kort) => {
    const [geheel, deel] = som.getallen;
    return [
      stap(String(geheel), kort ? "Zoveel moet het samen zijn." : `Elke rij is samen ${geheel}.`),
      stap(String(deel), kort ? "Dit staat er al." : `In deze rij staat al ${deel}.`),
      stap(`${deel} + ? = ${geheel}`, kort ? "Hoeveel moet erbij?" : "Hoeveel moet er nog bij?"),
      stap(`${deel} + ${som.goed} = ${geheel}`, kort ? "Deze hoort erbij!" : `Er hoort ${som.goed} bij.`, true),
    ];
  },
  (som) => anderePoging(som, 3),
);

export const aanvullenUitleg: Uitlegbron = bron(
  {
    waarde: "doortellen",
    label: "Doortellen tot het doelgetal",
    uitleg: "Begin bij het getal dat er staat en tel door.",
  },
  (som, kort) => {
    const [geheel, deel] = som.getallen;
    return [
      stap(String(deel), kort ? "Hier begin je." : `Je begint bij ${deel}.`),
      stap(`${deel} → ${geheel}`, kort ? "Tel door tot het doel." : `Tel door tot ${geheel}.`),
      stap(`${deel} + ${som.goed} = ${geheel}`, kort ? "Zoveel kwam erbij!" : `Er kwam ${som.goed} bij.`, true),
    ];
  },
  (som) => anderePoging(som, 3),
);

export const splitsschemaUitleg: Uitlegbron = bron(
  {
    waarde: "eraf-halen",
    label: "Het bekende deel eraf halen",
    uitleg: "Begin bij het hele getal en haal het deel eraf dat er al staat.",
  },
  (som, kort) => {
    const [geheel, deel] = som.getallen;
    return [
      stap(String(geheel), kort ? "Bovenaan staat het hele getal." : `Bovenaan staat ${geheel}.`),
      stap(String(deel), kort ? "Eén vakje is ingevuld." : `Eén vakje is al ${deel}.`),
      stap(`${geheel} − ${deel} = ${som.goed}`, kort ? "Haal dat deel eraf." : "Haal dat deel eraf."),
      stap(`${deel} + ${som.goed} = ${geheel}`, kort ? "Samen weer het hele getal!" : "Samen weer het hele getal.", true),
    ];
  },
  (som) => anderePoging(som, 3),
);

export const verdelenUitleg: Uitlegbron = bron(
  {
    waarde: "eerlijk-dan-schuiven",
    label: "Eerst eerlijk delen, dan schuiven",
    uitleg: "Verdeel eerst evenveel en schuif daarna het verschil naar links.",
  },
  (som, kort) => {
    const [aantal, links] = som.getallen;
    return [
      stap(String(aantal), kort ? "Zoveel kralen zijn er." : `Er zijn ${aantal} kralen.`),
      stap(`${aantal} : 2`, kort ? "Verdeel ze eerst eerlijk." : "Verdeel ze eerst eerlijk."),
      stap(`${links} en ${som.goed}`, kort ? "Schuif het verschil naar links." : "Schuif het verschil naar links."),
      stap(`${links} + ${som.goed} = ${aantal}`, kort ? "Samen weer alles!" : "Samen zijn het er weer evenveel.", true),
    ];
  },
  () => null,
);

export const splitsdriehoekUitleg: Uitlegbron = bron(
  {
    waarde: "zijde-eerst",
    label: "Eerst de zijde met twee bekende getallen",
    uitleg: "Zoek de zijde waar twee van de drie getallen bekend zijn.",
  },
  (som, kort) => {
    const [geheel, deel] = som.getallen;
    return [
      stap(`${geheel}`, kort ? "Dit is een zijde samen." : `Deze zijde is samen ${geheel}.`),
      stap(`${deel}`, kort ? "Eén vak ken je al." : `Eén vak is ${deel}.`),
      stap(`${geheel} − ${deel} = ${som.goed}`, kort ? "Het andere vak is dit." : "Het andere vak volgt eruit."),
      stap("vak + vak", kort ? "Tel nu de zijkanten op!" : "Tel daarna de zijkanten op.", true),
    ];
  },
  () => null,
);
