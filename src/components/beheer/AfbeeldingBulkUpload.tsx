"use client";

/**
 * Meerdere afbeeldingen tegelijk uploaden.
 *
 * Drie manieren om bestanden aan te leveren, allemaal zonder Finder:
 *   - meerdere bestanden tegelijk kiezen;
 *   - een hele map kiezen;
 *   - bestanden of een map hierheen slepen (mappen worden uitgeplozen).
 *
 * Ze gaan één voor één naar de server. Dat duurt iets langer dan alles in één
 * keer, maar je ziet per bestand of het gelukt is en waarom niet — en een
 * enkel te groot bestand laat de rest niet stranden.
 */

import { useRef, useState } from "react";
import { uploadAfbeelding } from "@/app/admin/acties";
import { ACCEPT, controleerVooraf } from "@/lib/afbeeldingregels";

type Regel = { origineel: string; gelukt: boolean; naam?: string; fout?: string };

/** Haalt bestanden uit een gesleepte selectie, inclusief die in mappen. */
async function bestandenUitSleep(items: DataTransferItemList): Promise<File[]> {
  const ingangen = Array.from(items)
    .map((i) => (i.kind === "file" ? i.webkitGetAsEntry?.() : null))
    .filter(Boolean) as FileSystemEntry[];

  if (ingangen.length === 0) return [];

  const uit: File[] = [];

  async function loop(ingang: FileSystemEntry): Promise<void> {
    if (ingang.isFile) {
      const bestand = await new Promise<File | null>((res) =>
        (ingang as FileSystemFileEntry).file(res, () => res(null)),
      );
      if (bestand) uit.push(bestand);
      return;
    }
    if (ingang.isDirectory) {
      const lezer = (ingang as FileSystemDirectoryEntry).createReader();
      // readEntries geeft per keer hoogstens 100 items terug.
      for (;;) {
        const deel = await new Promise<FileSystemEntry[]>((res) =>
          lezer.readEntries(res, () => res([])),
        );
        if (deel.length === 0) break;
        for (const k of deel) await loop(k);
      }
    }
  }

  for (const i of ingangen) await loop(i);
  return uit;
}

export function AfbeeldingBulkUpload({
  onKlaar,
}: {
  /** Wordt aangeroepen als er iets is toegevoegd, om het overzicht te verversen. */
  onKlaar: () => void;
}) {
  const [regels, setRegels] = useState<Regel[]>([]);
  const [bezig, setBezig] = useState(false);
  const [voortgang, setVoortgang] = useState({ gedaan: 0, totaal: 0 });
  const [sleept, setSleept] = useState(false);

  const bestandenKiezer = useRef<HTMLInputElement>(null);
  const mapKiezer = useRef<HTMLInputElement>(null);

  async function verwerk(bestanden: File[]) {
    if (bestanden.length === 0) return;

    setBezig(true);
    setRegels([]);
    setVoortgang({ gedaan: 0, totaal: bestanden.length });

    const uitslagen: Regel[] = [];

    for (const bestand of bestanden) {
      const vooraf = controleerVooraf(bestand.name, bestand.size);
      if (vooraf) {
        uitslagen.push({ origineel: bestand.name, gelukt: false, fout: vooraf });
      } else {
        const data = new FormData();
        data.set("bestand", bestand);
        const uitslag = await uploadAfbeelding(data);
        uitslagen.push(
          uitslag.ok
            ? { origineel: bestand.name, gelukt: true, naam: uitslag.naam }
            : { origineel: bestand.name, gelukt: false, fout: uitslag.fout },
        );
      }

      setVoortgang((v) => ({ ...v, gedaan: v.gedaan + 1 }));
      setRegels([...uitslagen]);
    }

    setBezig(false);
    if (uitslagen.some((r) => r.gelukt)) onKlaar();
  }

  const gelukt = regels.filter((r) => r.gelukt).length;
  const mislukt = regels.length - gelukt;

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSleept(true);
        }}
        onDragLeave={() => setSleept(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setSleept(false);
          const uitMappen = await bestandenUitSleep(e.dataTransfer.items);
          await verwerk(uitMappen.length ? uitMappen : Array.from(e.dataTransfer.files));
        }}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition ${
          sleept ? "border-viool bg-viool/6" : "border-beheer-rand bg-beheer-kaart"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="mx-auto size-7 text-beheer-zacht" aria-hidden="true">
          <path d="M12 16V4.5M7.5 9 12 4.5 16.5 9M4.5 19.5h15" />
        </svg>

        <p className="mt-2.5 text-sm font-medium">
          Sleep hier je afbeeldingen of een hele map naartoe
        </p>
        <p className="mt-0.5 text-xs text-beheer-zacht">of</p>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={bezig}
            onClick={() => bestandenKiezer.current?.click()}
            className="inline-flex h-9 items-center rounded-md bg-viool px-3.5 text-sm font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
          >
            Bestanden kiezen
          </button>
          <button
            type="button"
            disabled={bezig}
            onClick={() => mapKiezer.current?.click()}
            className="inline-flex h-9 items-center rounded-md border border-beheer-rand px-3.5 text-sm font-semibold transition hover:border-viool hover:text-viool disabled:opacity-60"
          >
            Hele map kiezen
          </button>
        </div>

        <input
          ref={bestandenKiezer}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            void verwerk(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        {/* webkitdirectory laat het bestandsvenster een map kiezen. */}
        <input
          ref={mapKiezer}
          type="file"
          multiple
          {...{ webkitdirectory: "" }}
          className="sr-only"
          onChange={(e) => {
            void verwerk(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />

        <p className="mt-3 text-xs text-beheer-zacht">
          png, jpg, svg of webp — hoogstens 5 MB per afbeelding.
        </p>
      </div>

      {bezig && (
        <p className="text-sm text-beheer-zacht">
          Bezig… {voortgang.gedaan} van de {voortgang.totaal}
        </p>
      )}

      {regels.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-beheer-rand bg-beheer-kaart">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-beheer-rand bg-beheer-vlak px-4 py-2.5">
            <h3 className="text-sm font-semibold">Resultaat</h3>
            <div className="flex gap-2 text-xs font-semibold">
              <span className="rounded-full bg-groen-zacht px-2.5 py-1 text-groen-diep">
                {gelukt} toegevoegd
              </span>
              <span
                className={`rounded-full px-2.5 py-1 ${
                  mislukt > 0 ? "bg-roze-zacht text-roze" : "bg-beheer-vlak text-beheer-zacht"
                }`}
              >
                {mislukt} mislukt
              </span>
            </div>
          </header>

          <ul className="divide-y divide-beheer-rand-zacht">
            {regels.map((r, i) => (
              <li key={`${r.origineel}-${i}`} className="flex items-start gap-3 px-4 py-2">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white ${r.gelukt ? "bg-groen" : "bg-roze"}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3">
                    {r.gelukt ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6 6 18" />}
                  </svg>
                </span>

                {r.gelukt && r.naam && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/vragen/${r.naam}`}
                    alt=""
                    className="size-8 shrink-0 rounded border border-beheer-rand bg-white object-contain p-0.5"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {r.gelukt ? (
                      <>
                        <span className="font-mono text-xs">{r.naam}</span>
                        {r.naam !== r.origineel && (
                          <span className="ml-1.5 text-xs text-beheer-zacht">
                            (hernoemd van {r.origineel})
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-beheer-zacht">{r.origineel}</span>
                    )}
                  </p>
                  {r.fout && <p className="text-xs text-roze">{r.fout}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
