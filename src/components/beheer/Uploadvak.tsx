"use client";

/**
 * Sleep-en-drop upload voor de bulk-import.
 *
 * Het bestand wordt in de browser als tekst gelezen en naar de server
 * gestuurd, die elke rij apart beoordeelt en opslaat. Daarna verschijnt per
 * rij of het gelukt is, en zo niet: waarom niet.
 */

import { useRef, useState, useTransition } from "react";
import { importeerBestand } from "@/app/admin/acties";
import type { ImportUitslag } from "@/lib/data/import";

export function Uploadvak() {
  const [uitslag, setUitslag] = useState<ImportUitslag | null>(null);
  const [bestandsnaam, setBestandsnaam] = useState("");
  const [sleept, setSleept] = useState(false);
  const [fout, setFout] = useState("");
  const [bezig, start] = useTransition();
  const invoer = useRef<HTMLInputElement>(null);

  async function verwerk(bestand: File) {
    setFout("");
    setUitslag(null);

    if (!/\.(csv|txt|tsv|xlsx)$/i.test(bestand.name)) {
      setFout(
        "Dit bestandstype kan ik niet lezen. Gebruik een Excel-bestand (.xlsx) of een CSV.",
      );
      return;
    }

    setBestandsnaam(bestand.name);
    const data = new FormData();
    data.set("bestand", bestand);

    start(async () => {
      setUitslag(await importeerBestand(data));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSleept(true);
        }}
        onDragLeave={() => setSleept(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSleept(false);
          const bestand = e.dataTransfer.files[0];
          if (bestand) void verwerk(bestand);
        }}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition ${
          sleept
            ? "border-viool bg-viool/6"
            : "border-beheer-rand bg-beheer-kaart"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto size-8 text-beheer-zacht"
          aria-hidden="true"
        >
          <path d="M12 16V4.5M7.5 9 12 4.5 16.5 9M4.5 19.5h15" />
        </svg>

        <p className="mt-3 text-sm font-medium">
          Sleep je bestand hierheen
        </p>
        <p className="mt-0.5 text-sm text-beheer-zacht">of</p>

        <button
          type="button"
          onClick={() => invoer.current?.click()}
          disabled={bezig}
          className="mt-2 inline-flex h-9 items-center rounded-md bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
        >
          {bezig ? "Bezig met verwerken…" : "Kies een bestand"}
        </button>

        <input
          ref={invoer}
          type="file"
          accept=".xlsx,.csv,.txt,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={(e) => {
            const bestand = e.target.files?.[0];
            if (bestand) void verwerk(bestand);
            e.target.value = "";
          }}
        />

        <p className="mt-3 text-xs text-beheer-zacht">
          Excel (.xlsx) of CSV. Bij een CSV mag het scheidingsteken een
          puntkomma of een komma zijn.
        </p>
      </div>

      {fout && (
        <p className="rounded-md border border-roze/40 bg-roze-zacht px-3 py-2 text-sm font-medium text-roze">
          {fout}
        </p>
      )}

      {uitslag && <Uitslagoverzicht uitslag={uitslag} bestandsnaam={bestandsnaam} />}
    </div>
  );
}

function Uitslagoverzicht({
  uitslag,
  bestandsnaam,
}: {
  uitslag: ImportUitslag;
  bestandsnaam: string;
}) {
  if (uitslag.bestandsfout) {
    return (
      <div className="rounded-lg border border-roze/40 bg-roze-zacht p-4">
        <p className="text-sm font-semibold text-roze">
          Het bestand kon niet worden gelezen
        </p>
        <p className="mt-1 text-sm text-roze">{uitslag.bestandsfout}</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-beheer-rand bg-beheer-kaart">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-beheer-rand bg-beheer-vlak px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Resultaat van {bestandsnaam}</h2>
          <p className="text-xs text-beheer-zacht">
            {uitslag.gelezen} {uitslag.gelezen === 1 ? "rij" : "rijen"} gelezen
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="rounded-full bg-groen-zacht px-2.5 py-1 text-groen-diep">
            {uitslag.gelukt} toegevoegd
          </span>
          <span
            className={`rounded-full px-2.5 py-1 ${
              uitslag.mislukt > 0
                ? "bg-roze-zacht text-roze"
                : "bg-beheer-vlak text-beheer-zacht"
            }`}
          >
            {uitslag.mislukt} mislukt
          </span>
        </div>
      </header>

      <ul className="divide-y divide-beheer-rand-zacht">
        {uitslag.rijen.map((rij) => (
          <li key={rij.regelnummer} className="flex items-start gap-3 px-4 py-2.5">
            <span
              aria-hidden="true"
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white ${
                rij.gelukt ? "bg-groen" : "bg-roze"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3">
                {rij.gelukt ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6 6 18" />}
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="mr-1.5 font-mono text-xs text-beheer-zacht">
                  regel {rij.regelnummer}
                </span>
                <span className={rij.gelukt ? "" : "text-beheer-zacht"}>
                  {rij.vraagtekst || <em>zonder vraagtekst</em>}
                </span>
              </p>
              {!rij.gelukt && (
                <ul className="mt-0.5 list-inside list-disc text-xs text-roze">
                  {rij.fouten.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </div>

            <span className="sr-only">{rij.gelukt ? "Gelukt" : "Mislukt"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
