/**
 * Vakken beheren. Staat buiten de vak-schermen, omdat het over alle vakken
 * tegelijk gaat.
 */

import { Kop } from "@/components/beheer/Bouwstenen";
import { VakkenBeheer } from "@/components/beheer/VakkenBeheer";
import { OefensessieInstelling } from "@/components/beheer/OefensessieInstelling";
import { haalAlgemeenAantalVragen } from "@/lib/data/instellingen";
import { haalDomeinen, haalLeerdoelen, haalVakken } from "@/lib/data/structuur";

export default function VakkenPagina() {
  const vakken = haalVakken();
  const domeinenPerVak = Object.fromEntries(
    vakken.map((v) => [v.id, haalDomeinen(v.id).length]),
  );
  // Hoeveel leerdoelen wijken af van de algemene standaard?
  const afwijkend = haalLeerdoelen().filter((l) => l.vragenPerSessie !== null).length;

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Vakken" }]}
        titel="Vakken"
        bijschrift="Elk vak heeft eigen domeinen, onderwerpen, leerdoelen en vragen. Onderaan staan de instellingen die voor alles gelden."
      />
      <VakkenBeheer vakken={vakken} domeinenPerVak={domeinenPerVak} />

      <OefensessieInstelling
        huidig={haalAlgemeenAantalVragen()}
        afwijkend={afwijkend}
      />
    </div>
  );
}
