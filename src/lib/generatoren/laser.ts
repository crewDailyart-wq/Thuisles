/**
 * De laser (oktober 2026): de derde Godot-bouwsteen, "rustig schieten".
 *
 * Acht zwevende stenen; het kind tikt alle goede stenen aan (elke tik is een
 * laserstraal met een vizier) en drukt op Vuur! of Controleer. Geen klok, geen
 * levens, goed of fout pas na Controleer (keuze van de eigenaar).
 *
 * Twee soorten, met dezelfde laser:
 *   lasertafel    raak alle getallen uit de tafel van … (Tafels oefenen)
 *   laserminsom   raak alle minsommen met uitkomst … (Aftrekken tot en met 20)
 *
 * Het antwoord is de lijst met plekken van de goede stenen, van klein naar
 * groot ("0,3,5"). Er zijn altijd precies drie goede stenen.
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
import { keerPatronen } from "@/lib/generatoren/patronen/keerdelen";
import { keersomAanpak } from "@/lib/generatoren/aanpak/keerdelen";
import { keersomUitleg } from "@/lib/generatoren/scripts/keerdelen";
import { erafPatronen } from "@/lib/generatoren/patronen/erafsommen";
import { minsomAanpak } from "@/lib/generatoren/aanpak/erafsommen";
import { laserminUitleg } from "@/lib/generatoren/scripts/erafsommen";

const STENEN = 8;
const GOED = 3;

const TAFELZIN = "Raak alle getallen uit de tafel van {som}.";
const MINZIN = "Raak alle sommen met uitkomst {som}.";
const zinnen = (z: string): Record<Leeftijdsgroep, string> => ({ "34": z, "56": z, "78": z });

/** Zet goede en foute stenen door elkaar en geeft de plekken van de goede. */
function schud(kans: () => number, goed: string[], fout: string[]) {
  const alle = husselen(kans, [...goed.map((t) => ({ t, g: true })), ...fout.map((t) => ({ t, g: false }))]);
  return {
    stenen: alle.map((s) => s.t),
    goed: alle.flatMap((s, i) => (s.g ? [i] : [])),
  };
}

// ---------------------------------------------------------------------------
// Tafels
// ---------------------------------------------------------------------------

const TAFELGROEPEN: Record<string, number[]> = {
  "2-5-10": [2, 5, 10],
  "3-4": [3, 4],
  "6-9": [6, 7, 8, 9],
};

function tafelsVan(inst: Instellingen): number[] {
  return TAFELGROEPEN[tekst(inst, "tafels", "2-5-10")] ?? TAFELGROEPEN["2-5-10"];
}

export const lasertafelGenerator: Generator = {
  id: "lasertafel",
  naam: "De laser: tafels (raak de goede stenen)",
  uitleg:
    "Acht zwevende stenen met een getal. Het kind raakt met de laser alle getallen uit de tafel (drie stenen) en drukt op Vuur! of Controleer. Geen klok, geen levens.",
  suggestie: "Groep 4: tafels van 2, 5 en 10, daarna 3 en 4, daarna 6 tot en met 9",
  velden: [
    {
      soort: "keuze",
      sleutel: "tafels",
      label: "Tafels",
      opties: [
        { waarde: "2-5-10", label: "Tafels van 2, 5 en 10" },
        { waarde: "3-4", label: "Tafels van 3 en 4" },
        { waarde: "6-9", label: "Tafels van 6 tot en met 9" },
      ],
    },
    ...vraagtekstVelden(zinnen(TAFELZIN)),
  ],
  vraagteksten: { standaard: zinnen(TAFELZIN), som: (s) => String(s.getallen[0]) },
  standaard: { tafels: "2-5-10" },
  foutpatronen: keerPatronen,
  aanpak: keersomAanpak,
  uitleganimatie: keersomUitleg,

  maximum: () => 60,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const tafels = tafelsVan(inst);
    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const tafel = tafels[uit.length % tafels.length];
      const keer = husselen(kans, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, GOED);
      const goed = keer.map((k) => k * tafel);
      const max = tafel * 10;
      const fout: number[] = [];
      for (let r = 0; r < 200 && fout.length < STENEN - GOED; r++) {
        /* Vooral net naast een uitkomst: dat zijn de echte valkuilen. */
        const n = kans() < 0.6 ? heelGetal(kans, 1, 10) * tafel + (kans() < 0.5 ? 1 : -1) : heelGetal(kans, 2, max);
        if (n < 1 || n > max || n % tafel === 0 || fout.includes(n)) continue;
        fout.push(n);
      }
      if (fout.length < STENEN - GOED) continue;
      const { stenen, goed: plekken } = schud(kans, goed.map(String), fout.map(String));
      const handtekening = `lasertafel:${tafel}:${[...goed].sort((a, b) => a - b).join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);
      const gegevens = { soort: "lasertafel", variant: "laser", getallen: [tafel, ...goed], goed: GOED };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(lasertafelGenerator, inst, groep, gegevens),
        antwoord: plekken.join(","),
        figuur: { soort: "laser", stand: "tafel", stenen, goed: plekken, tafel, volgnummer: uit.length + 1 },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Minsommen
// ---------------------------------------------------------------------------

export const laserminsomGenerator: Generator = {
  id: "laserminsom",
  naam: "De laser: minsommen (raak de goede stenen)",
  uitleg:
    "Acht zwevende stenen met een minsom tot en met 20. Het kind raakt met de laser alle sommen met de gevraagde uitkomst (drie stenen) en drukt op Vuur! of Controleer. Geen klok, geen levens.",
  suggestie: "Groep 4: minsommen tot en met 20",
  velden: [...vraagtekstVelden(zinnen(MINZIN))],
  vraagteksten: { standaard: zinnen(MINZIN), som: (s) => String(s.goed) },
  standaard: {},
  foutpatronen: erafPatronen,
  aanpak: minsomAanpak,
  uitleganimatie: laserminUitleg,

  maximum: () => 60,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const uit: Gegenereerd[] = [];
    const som = (a: number, b: number) => `${a} − ${b}`;
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const doel = heelGetal(kans, 2, 10);
      const goed: string[] = [];
      for (let r = 0; r < 100 && goed.length < GOED; r++) {
        const b = heelGetal(kans, 1, 20 - doel);
        const t = som(doel + b, b);
        if (!goed.includes(t)) goed.push(t);
      }
      const fout: string[] = [];
      for (let r = 0; r < 300 && fout.length < STENEN - GOED; r++) {
        /* Vooral uitkomsten vlak naast het doel. */
        const uitkomst = doel + (kans() < 0.5 ? 1 : -1) * heelGetal(kans, 1, 2);
        if (uitkomst < 0) continue;
        const b = heelGetal(kans, 1, Math.max(1, 20 - uitkomst));
        if (uitkomst + b > 20) continue;
        const t = som(uitkomst + b, b);
        if (fout.includes(t) || goed.includes(t)) continue;
        fout.push(t);
      }
      if (goed.length < GOED || fout.length < STENEN - GOED) continue;
      const { stenen, goed: plekken } = schud(kans, goed, fout);
      const handtekening = `laserminsom:${doel}:${[...goed].sort().join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);
      /* Voor de uitleg na een fout: de eerste goede som, zoals een gewone minsom. */
      const [a, b] = goed[0].split(" − ").map(Number);
      const gegevens = { soort: "minsom", variant: "kaal", getallen: [a, b], goed: doel };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(laserminsomGenerator, inst, groep, gegevens),
        antwoord: plekken.join(","),
        figuur: { soort: "laser", stand: "minsom", stenen, goed: plekken, doel, volgnummer: uit.length + 1 },
        somgegevens: gegevens,
      });
    }
    uit.sort((x, y) => ((x.figuur as { doel: number }).doel - (y.figuur as { doel: number }).doel));
    uit.forEach((v, i) => ((v.figuur as { volgnummer: number }).volgnummer = i + 1));
    return uit;
  },
};
