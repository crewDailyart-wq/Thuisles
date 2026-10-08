/**
 * De raket (Optellen, oktober 2026): de tweede Godot-bouwsteen.
 *
 * Een raketje, zes zwevende stenen met een getal en een planeet met het
 * doelgetal. Het kind tikt twee stenen aan die samen het doelgetal maken; er
 * tekent zich een route. Met Controleer (of een tik op de planeet) vliegt de
 * raket. Goed: hij landt. Fout: hij schiet langs de planeet, daarna lichten de
 * goede stenen groen op en vliegt hij die route.
 *
 * Er is altijd precies één paar dat samen het doelgetal maakt; dat wordt hier
 * echt nagerekend, net als bij "Kies twee getallen". Het antwoord is het paar,
 * van klein naar groot, dus de volgorde van kiezen telt niet.
 *
 * Standen:
 *   tot10      doelgetal 5 tot en met 10
 *   tot20      doelgetal 11 tot en met 20
 *   aanvullen  één steen is al gekozen; het kind zoekt de steen die erbij moet
 *              (doelgetal 10, of 11 tot en met 20)
 *
 * Alle 15 opgaven met de raket (ONTWERPREGELS.md: oefeningen met een bouwsteen).
 */

import {
  heelGetal,
  husselen,
  kansGenerator,
  tekst,
  bepaalVraagtekst,
  vraagtekstVelden,
  type Generator,
  type Gegenereerd,
  type Instellingen,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { optelPatronen } from "@/lib/generatoren/patronen/optelopdrachten";
import { tweegetallenAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { tweegetallenUitleg } from "@/lib/generatoren/scripts/optelopdrachten";

export type RaketStand = "tot10" | "tot20" | "aanvullen";
const STANDEN: RaketStand[] = ["tot10", "tot20", "aanvullen"];
const STENEN = 6;

const ZIN = "Welke twee maken samen {som}?";
const ZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };
const AANVULZIN = "Welke steen moet erbij om {som} te maken?";

function standVan(inst: Instellingen): RaketStand {
  const s = tekst(inst, "stand", "tot10") as RaketStand;
  return STANDEN.includes(s) ? s : "tot10";
}

/** Hoeveel paren uit deze getallen samen het doelgetal maken. */
function paren(getallen: number[], doel: number): number {
  let aantal = 0;
  for (let i = 0; i < getallen.length; i++) {
    for (let j = i + 1; j < getallen.length; j++) if (getallen[i] + getallen[j] === doel) aantal++;
  }
  return aantal;
}

/** Bij aanvullen: hoeveel stenen samen met de vaste steen het doelgetal maken. */
function aanvullers(getallen: number[], vast: number, doel: number): number {
  return getallen.filter((n, i) => i !== vast && getallen[vast] + n === doel).length;
}

export const raketsomGenerator: Generator = {
  id: "raketsom",
  naam: "De raket (twee stenen samen)",
  uitleg:
    "Zes zwevende stenen met een getal en een planeet met het doelgetal. Het kind tikt twee stenen aan die samen het doelgetal maken; met Controleer (of een tik op de planeet) vliegt de raket. Er is altijd precies één goed paar. Bij aanvullen is één steen al gekozen.",
  suggestie: "Groep 4: naar 10, naar 20, en wat moet erbij",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Soort som",
      opties: [
        { waarde: "tot10", label: "Twee stenen die samen 5 tot en met 10 maken" },
        { waarde: "tot20", label: "Twee stenen die samen 11 tot en met 20 maken" },
        { waarde: "aanvullen", label: "Eén steen staat al: wat moet erbij?" },
      ],
    },
    ...vraagtekstVelden(ZINNEN),
  ],
  vraagteksten: { standaard: ZINNEN, som: (s) => String(s.goed) },
  standaard: { stand: "tot10" },
  foutpatronen: optelPatronen,
  aanpak: tweegetallenAanpak,
  uitleganimatie: tweegetallenUitleg,

  maximum: (inst) => (standVan(inst) === "tot10" ? 21 : 60),

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = standVan(inst);
    const uit: Gegenereerd[] = [];

    for (let poging = 0; poging < aantal * 600 && uit.length < aantal; poging++) {
      const doel =
        stand === "tot10"
          ? heelGetal(kans, 5, 10)
          : stand === "tot20"
            ? heelGetal(kans, 11, 20)
            : kans() < 0.4
              ? 10
              : heelGetal(kans, 11, 20);
      const eerste = heelGetal(kans, Math.max(1, doel - 10), Math.floor(doel / 2));
      const tweede = doel - eerste;
      if (eerste < 1 || tweede > 10 + (stand === "tot10" ? 0 : 2)) continue;

      /* Vier vullers erbij; daarna nakijken dat er precies één goed paar is. */
      const maxGetal = stand === "tot10" ? 9 : 12;
      const getallen = [eerste, tweede];
      for (let ronde = 0; ronde < 150 && getallen.length < STENEN; ronde++) {
        const n = heelGetal(kans, 1, maxGetal);
        if (getallen.includes(n)) continue;
        if (paren([...getallen, n], doel) > 1) continue;
        getallen.push(n);
      }
      if (getallen.length < STENEN || paren(getallen, doel) !== 1) continue;

      const gehusseld = husselen(kans, getallen);
      /* Bij aanvullen staat de grootste van het paar al vast. */
      const vast = stand === "aanvullen" ? gehusseld.indexOf(Math.max(eerste, tweede)) : -1;
      if (stand === "aanvullen" && aanvullers(gehusseld, vast, doel) !== 1) continue;

      const handtekening = `raketsom:${stand}:${doel}:${Math.min(eerste, tweede)}+${Math.max(eerste, tweede)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "tweegetallen",
        variant: "raket",
        getallen: [doel, Math.min(eerste, tweede)],
        goed: doel,
        extra: { stenen: STENEN },
      };
      const zin = stand === "aanvullen" ? { "34": AANVULZIN, "56": AANVULZIN, "78": AANVULZIN } : ZINNEN;
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst({ vraagteksten: { standaard: zin, som: (s) => String(s.goed) } }, inst, groep, gegevens),
        /* Het paar, altijd van klein naar groot. */
        antwoord: `${Math.min(eerste, tweede)},${Math.max(eerste, tweede)}`,
        figuur: { soort: "raketsom", stand, doel, stenen: gehusseld, vast, volgnummer: uit.length + 1 },
        somgegevens: gegevens,
      });
    }
    /* Van makkelijk naar moeilijk: op doelgetal. */
    uit.sort((x, y) => (x.figuur as { doel: number }).doel - (y.figuur as { doel: number }).doel);
    uit.forEach((v, i) => ((v.figuur as { volgnummer: number }).volgnummer = i + 1));
    return uit;
  },
};
