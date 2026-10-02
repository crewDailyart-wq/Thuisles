/**
 * De uitleg-animatie bij het domein Geld.
 *
 * Eén script voor heel Geld, opgebouwd uit dezelfde stappen als "zo los je het
 * op" (`geldStappen` in `aanpak/geld.ts`). Zo vertelt de animatie nooit iets
 * anders dan de lijst. Groep 3-4 krijgt de korte zin van elke stap, groep 5-6
 * en 7-8 de gewone.
 *
 * Het model is overal de som op één regel, net als bij Tijd: de basisversie is
 * gewone opdrachten (WERKPLAN.md). Het beeld komt later, in de opgave én in de
 * uitleg tegelijk.
 */

import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Uitlegbron } from "@/lib/generatoren/uitlegscript";
import { geldStappen } from "@/lib/generatoren/aanpak/geld";

const STRATEGIE = {
  waarde: "tel-vanaf-het-grootste",
  label: "Tel vanaf het grootste",
  uitleg: "Begin bij het grootste briefje of de grootste munt en tel steeds verder.",
};

export const geldUitleg: Uitlegbron = {
  modellen: ["som"],
  strategieen: [STRATEGIE],
  standaardStrategie: () => STRATEGIE.waarde,
  script(som, vorm: Groepsvorm) {
    const kort = MANIER_VAN_VORM[vorm] === "34";
    const stappen = geldStappen(som);
    if (stappen.length === 0) return null;
    return {
      vorm,
      strategie: STRATEGIE.waarde,
      strategieNaam: STRATEGIE.label,
      stappen: stappen.map((s, i) => {
        const laatste = i === stappen.length - 1;
        return {
          model: { soort: "som" as const, tekst: s.som },
          zin: kort ? s.kort : s.zin,
          houding: laatste ? ("juichend" as const) : ("wijzend" as const),
          ...(laatste ? { feest: true, beweging: "juichen" as const } : {}),
        };
      }),
    };
  },
  /*
    Een vergelijkbare opgave om daarna te proberen bestaat hier niet als los
    setje getallen: een geld-opgave hangt aan munten, briefjes en vakjes. Die
    kan de uitlegspeler niet zelf opbouwen; dan slaat hij die stap over.
  */
  vergelijkbaar: () => null,
};
