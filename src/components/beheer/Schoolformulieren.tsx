"use client";

/**
 * De formulieren van het scholenbeheer en de verificatiewachtrij.
 */

import { useActionState } from "react";
import {
  bevestigOpgave,
  importeerScholenbestand,
  vernieuwScholen,
} from "@/app/admin/schoolacties";
import { stijl } from "@/components/beheer/Bouwstenen";
import type { Rekenmethode } from "@/lib/types";

type Uitkomst = { fout: string } | { gelukt: string } | null;

function Melding({ uitkomst }: { uitkomst: Uitkomst }) {
  if (!uitkomst) return null;
  const fout = "fout" in uitkomst;
  return (
    <p
      role="status"
      className={`rounded-md border px-2.5 py-2 text-xs ${
        fout
          ? "border-oranje/40 bg-oranje-zacht text-oranje-diep"
          : "border-groen/40 bg-groen-zacht text-groen-diep"
      }`}
    >
      {fout ? uitkomst.fout : uitkomst.gelukt}
    </p>
  );
}

/**
 * De vernieuwknop.
 *
 * De lijst staat er al (hij wordt bij de eerste start automatisch ingeladen).
 * Deze knop haalt de nieuwste versie op en werkt bij: nieuwe scholen erbij,
 * adreswijzigingen door, en scholen die niet meer in de lijst staan worden
 * gemarkeerd als gesloten. Koppelingen van ouders blijven staan.
 *
 * Lukt het ophalen niet — geen internet, of DUO wijzigt het adres — dan kan
 * hetzelfde bestand met de hand worden gekozen.
 */
export function Scholenimport() {
  const [online, haalOp, bezigOnline] = useActionState<Uitkomst, FormData>(
    vernieuwScholen,
    null,
  );
  const [bestand, uploadBestand, bezigBestand] = useActionState<Uitkomst, FormData>(
    importeerScholenbestand,
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={haalOp} className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={bezigOnline}
          className={`${stijl.knopGroot} self-start`}
        >
          {bezigOnline ? "Bezig met vernieuwen…" : "Schoollijst vernieuwen bij DUO"}
        </button>
        <p className="text-xs text-beheer-zacht">
          Ruim zesduizend vestigingen; dit duurt ongeveer een halve minuut.
          Bestaande koppelingen van ouders blijven staan.
        </p>
        <Melding uitkomst={online} />
      </form>

      <details className="border-t border-beheer-rand-zacht pt-3">
        <summary className="cursor-pointer text-xs text-beheer-zacht">
          Lukt het ophalen niet? Bestand met de hand kiezen
        </summary>
        <form action={uploadBestand} className="mt-2 flex flex-col gap-2">
          <input
            type="file"
            name="bestand"
            accept=".csv,text/csv"
            className="text-xs"
            required
          />
          <Melding uitkomst={bestand} />
          <button
            type="submit"
            disabled={bezigBestand}
            className={`${stijl.knop} self-start`}
          >
            {bezigBestand ? "Bezig…" : "Bestand inlezen"}
          </button>
        </form>
      </details>
    </div>
  );
}

/**
 * Bevestigen dat een school met een bepaalde methode werkt.
 *
 * Bron is verplicht: pas met een controleerbare herkomst mag er
 * "Geverifieerd door Thuisles" bij een ouder op het scherm komen.
 */
export function Bevestigen({
  schoolId,
  methodes,
  voorgesteldeMethodeId,
}: {
  schoolId: string;
  methodes: Rekenmethode[];
  voorgesteldeMethodeId?: string;
}) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    bevestigOpgave,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-col gap-2.5">
      <input type="hidden" name="schoolId" value={schoolId} />

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Methode</span>
          <select
            name="methodeId"
            defaultValue={voorgesteldeMethodeId ?? ""}
            className={stijl.veld}
            required
          >
            <option value="" disabled>
              Kies een methode
            </option>
            {methodes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.naam}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium">
            Waar heb jij dit gecontroleerd?
          </span>
          <input
            name="bron"
            placeholder="Bijvoorbeeld: schoolgids 2026-2027, blz. 14"
            className={stijl.veld}
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium">
          Link <span className="font-normal text-beheer-zacht">(liefst de schoolgids)</span>
        </span>
        <input name="bronLink" type="url" className={stijl.veld} />
      </label>

      <Melding uitkomst={uitkomst} />
      <button type="submit" disabled={bezig} className={`${stijl.knop} self-start`}>
        {bezig ? "Bezig…" : "Bevestigen"}
      </button>
    </form>
  );
}
