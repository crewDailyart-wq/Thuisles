"use client";

/**
 * De formulieren van het methodebeheer.
 *
 * LEGAL REVIEW REQUIRED — hier wordt vastgelegd wat er over een methode en een
 * uitgever wordt opgeslagen. Alleen namen als tekst; nooit inhoud, beeld of
 * huisstijl van een uitgever.
 */

import { useActionState, useState } from "react";
import {
  bewerkBlok,
  bewerkMethode,
  nieuwBlok,
  nieuweMethode,
  wegMetMethode,
} from "@/app/admin/schoolacties";
import { stijl } from "@/components/beheer/Bouwstenen";
import type { Blok } from "@/lib/data/methodes";
import type { Leerdoel, Rekenmethode } from "@/lib/types";

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

// ---------------------------------------------------------------------------
// Methode aanmaken en bewerken
// ---------------------------------------------------------------------------

export function NieuweMethode() {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    nieuweMethode,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-col gap-2.5">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Naam van de methode</span>
          <input name="naam" className={stijl.veld} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">
            Uitgever <span className="font-normal text-beheer-zacht">(alleen tekst)</span>
          </span>
          <input name="uitgever" className={stijl.veld} />
        </label>
      </div>
      <Melding uitkomst={uitkomst} />
      <button type="submit" disabled={bezig} className={`${stijl.knop} self-start`}>
        {bezig ? "Bezig…" : "Methode toevoegen"}
      </button>
    </form>
  );
}

export function MethodeGegevens({ methode }: { methode: Rekenmethode }) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    bewerkMethode,
    null,
  );
  const [weg, setWeg] = useActionState<Uitkomst, FormData>(wegMetMethode, null);

  return (
    <div className="flex flex-col gap-3">
      <form action={verstuur} className="flex flex-col gap-2.5">
        <input type="hidden" name="methodeId" value={methode.id} />
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Naam</span>
            <input name="naam" defaultValue={methode.naam} className={stijl.veld} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">
              Uitgever <span className="font-normal text-beheer-zacht">(alleen tekst)</span>
            </span>
            <input name="uitgever" defaultValue={methode.uitgever} className={stijl.veld} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            name="actief"
            value="ja"
            defaultChecked={methode.actief}
            className="size-3.5 accent-[#5b3fd6]"
          />
          Ouders kunnen deze methode kiezen
        </label>
        <Melding uitkomst={uitkomst} />
        <button type="submit" disabled={bezig} className={`${stijl.knop} self-start`}>
          {bezig ? "Bezig…" : "Opslaan"}
        </button>
      </form>

      <details className="border-t border-beheer-rand-zacht pt-3">
        <summary className="cursor-pointer text-xs text-beheer-zacht">
          Methode verwijderen
        </summary>
        <form action={setWeg} className="mt-2 flex flex-col gap-2">
          <input type="hidden" name="methodeId" value={methode.id} />
          <p className="text-xs text-beheer-zacht">
            Kan alleen als er geen kinderen en geen geverifieerde scholen aan
            hangen.
          </p>
          <Melding uitkomst={weg} />
          <button type="submit" className={`${stijl.knopStil} self-start`}>
            Verwijderen
          </button>
        </form>
      </details>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blokken
// ---------------------------------------------------------------------------

export function NieuwBlok({ methodeId, groep }: { methodeId: string; groep: number }) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    nieuwBlok,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="methodeId" value={methodeId} />
      <input type="hidden" name="groep" value={groep} />
      <label className="min-w-[14rem] flex-1">
        <span className="mb-1 block text-xs font-medium">Nieuw blok in groep {groep}</span>
        <input
          name="titel"
          placeholder="Bijvoorbeeld: Optellen tot 100"
          className={stijl.veld}
          required
        />
      </label>
      <button type="submit" disabled={bezig} className={stijl.knop}>
        {bezig ? "Bezig…" : "Toevoegen"}
      </button>
      <div className="w-full">
        <Melding uitkomst={uitkomst} />
      </div>
    </form>
  );
}

/**
 * Eén blok bewerken: de titel en welke leerdoelen erbij horen.
 *
 * De leerdoelen zijn EIGEN Thuisles-leerdoelen. Dit is de afstemming — welk
 * blok van school gaat over welk leerdoel van ons — en niets meer.
 */
export function BlokBewerken({
  blok,
  leerdoelen,
}: {
  blok: Blok;
  leerdoelen: (Leerdoel & { pad: string })[];
}) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    bewerkBlok,
    null,
  );
  const [gekozen, setGekozen] = useState<string[]>(blok.leerdoelIds);

  function wissel(id: string) {
    setGekozen((lijst) =>
      lijst.includes(id) ? lijst.filter((x) => x !== id) : [...lijst, id],
    );
  }

  return (
    <form action={verstuur} className="flex flex-col gap-3">
      <input type="hidden" name="blokId" value={blok.id} />
      {gekozen.map((id) => (
        <input key={id} type="hidden" name="leerdoelen" value={id} />
      ))}

      <label className="block">
        <span className="mb-1 block text-xs font-medium">Titel van het blok</span>
        <input name="titel" defaultValue={blok.titel} className={stijl.veld} required />
      </label>

      <fieldset>
        <legend className="text-xs font-medium">
          Welke Thuisles-leerdoelen horen bij dit blok?
        </legend>
        <p className="mb-1.5 text-xs text-beheer-zacht">
          {gekozen.length} gekozen. Alleen leerdoelen die bij groep {blok.groep}{" "}
          passen.
        </p>
        <div className="max-h-64 overflow-y-auto rounded-md border border-beheer-rand">
          {leerdoelen.length === 0 ? (
            <p className="px-3 py-4 text-xs text-beheer-zacht">
              Er zijn nog geen leerdoelen voor groep {blok.groep}.
            </p>
          ) : (
            <ul>
              {leerdoelen.map((ld) => (
                <li key={ld.id} className="border-b border-beheer-rand-zacht last:border-b-0">
                  <label className="flex cursor-pointer items-start gap-2 px-3 py-2 text-xs hover:bg-beheer-vlak">
                    <input
                      type="checkbox"
                      checked={gekozen.includes(ld.id)}
                      onChange={() => wissel(ld.id)}
                      className="mt-0.5 size-3.5 shrink-0 accent-[#5b3fd6]"
                    />
                    <span>
                      <span className="block font-medium">{ld.titel}</span>
                      <span className="block text-beheer-zacht">
                        {ld.pad} · groep {ld.groepVan}
                        {ld.groepTot !== ld.groepVan ? `-${ld.groepTot}` : ""}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      <Melding uitkomst={uitkomst} />
      <button type="submit" disabled={bezig} className={`${stijl.knop} self-start`}>
        {bezig ? "Bezig…" : "Blok opslaan"}
      </button>
    </form>
  );
}
