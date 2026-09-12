"use client";

/**
 * De knoppen van de methodezoeker en de verificatiewachtrij.
 */

import { useActionState } from "react";
import { bevestigVoorstel } from "@/app/admin/schoolacties";
import { stijl } from "@/components/beheer/Bouwstenen";

type Uitkomst = { fout: string } | { gelukt: string } | null;

/**
 * Eén klik om een voorstel van de zoeker te bevestigen.
 *
 * Bron en datum komen automatisch mee van wat de zoeker vond; er valt hier
 * niets in te vullen. Dit is het enige moment waarop een vondst van de zoeker
 * "geverifieerd" wordt, en dat gebeurt altijd met de hand.
 */
export function BevestigVoorstel({
  voorstelId,
  methodenaam,
}: {
  voorstelId: string;
  methodenaam: string;
}) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    bevestigVoorstel,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-col gap-1.5">
      <input type="hidden" name="voorstelId" value={voorstelId} />
      <button type="submit" disabled={bezig} className={stijl.knop}>
        {bezig ? "Bezig…" : `Bevestigen: ${methodenaam}`}
      </button>
      {uitkomst && (
        <p
          role="status"
          className={`text-xs ${
            "fout" in uitkomst ? "text-oranje-diep" : "text-groen-diep"
          }`}
        >
          {"fout" in uitkomst ? uitkomst.fout : uitkomst.gelukt}
        </p>
      )}
    </form>
  );
}
