import { Illustratie } from "@/components/zappie/reis/Illustratie";
import type { VoertuigId } from "@/components/zappie/reis/WerkplaatsBeeld";

const NAMEN: Record<VoertuigId, string> = {
  onderzeeer: "Onderzeeër",
  vliegtuig: "Vliegtuig",
  raket: "Raket",
};

/**
 * De goedgekeurde werkplaatsrender, niet een nagebouwde emoji/SVG-werkplaats.
 * De drie voertuigen staan al in de illustratie. Selectie licht alleen de
 * betreffende plek uit; dit suggereert geen ongebouwde 3D-besturing of bouwfase.
 */
export function WerkplaatsIllustratie({ voertuig }: { voertuig: VoertuigId }) {
  return (
    <div className="zr-hangar zi-hangar" data-voertuig={voertuig}>
      <Illustratie
        naam="werkplaats"
        alt="Zappies verlichte werkplaats: bouwrobots werken aan een gouden onderzeeër, links staat een vliegtuig en rechts een raket."
        sizes="(min-width: 1600px) 690px, (min-width: 900px) 48vw, 94vw"
      />
      <span className="zi-machine-kader" aria-hidden="true" />
      <span className="zi-lasgloed" aria-hidden="true" />
      <span className="zi-werklicht" aria-hidden="true" />
      <span className="zi-scene-label" aria-hidden="true">Bouwplan · {NAMEN[voertuig]}</span>
    </div>
  );
}
