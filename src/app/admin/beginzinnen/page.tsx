/**
 * Beginzinnen van de lessen (1 november 2026, vraag eigenaar): per les de
 * naam met een link, een schermfoto van de eerste vraag, één regel uitleg en
 * de twee nieuwe beginzinnen van Bliepo (met de huidige ter vergelijking).
 *
 * Alleen op de laptop: online geeft deze pagina "niet gevonden". De lijst
 * staat in public/beginzinnen/lijst.json, de schermfoto's maakt
 * `node scripts/beginzinnen-fotos.mjs` (public/beginzinnen/<id>.jpg, niet in
 * Git). Leest geen database. Niet indexeren: dat regelt de beheerlayout.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";

type Les = {
  id: string;
  onderwerp?: string;
  titel?: string;
  uitleg?: string;
  hulpmiddel?: string | null;
  zin1?: string;
  zin2?: string;
  huidig?: string;
};

function leesLijst(): { lijst: Les[]; fout: string | null } {
  const p = path.join(process.cwd(), "public/beginzinnen/lijst.json");
  if (!existsSync(p)) return { lijst: [], fout: "De lijst is er nog niet. Bouwhelper A is er nog mee bezig. Vernieuw de pagina over even." };
  try {
    const data = JSON.parse(readFileSync(p, "utf8"));
    if (!Array.isArray(data)) throw new Error("geen lijst");
    return { lijst: data.filter((l) => l && typeof l.id === "string"), fout: null };
  } catch {
    return { lijst: [], fout: "De lijst wordt nog geschreven en is nu niet leesbaar. Vernieuw de pagina over even." };
  }
}

export default function Beginzinnen() {
  if (process.env.NODE_ENV === "production") notFound();
  const { lijst, fout } = leesLijst();
  const heeftFoto = (id: string) => existsSync(path.join(process.cwd(), "public/beginzinnen", `${id}.jpg`));
  const onderwerpen = [...new Set(lijst.map((l) => l.onderwerp ?? "Overig"))];

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1 className="text-xl font-semibold">Beginzinnen van de lessen</h1>
      <p className="mt-1 text-sm opacity-80">
        {lijst.length} lessen. Per les: de eerste vraag, wat het kind doet, en Bliepo&apos;s twee nieuwe beginzinnen. Alleen op de laptop.
      </p>
      {fout && <p className="mt-4 rounded border border-black/10 bg-white p-3">{fout}</p>}
      {onderwerpen.map((o) => (
        <section key={o} className="mt-8">
          <h2 className="text-lg font-semibold">{o}</h2>
          {lijst
            .filter((l) => (l.onderwerp ?? "Overig") === o)
            .map((l) => (
              <article key={l.id} className="mt-4 rounded-lg border border-black/10 bg-white p-3 sm:p-4" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  {heeftFoto(l.id) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/beginzinnen/${l.id}.jpg`} alt={`Eerste vraag van ${l.titel ?? l.id}`} loading="lazy" className="w-full rounded border border-black/10" style={{ aspectRatio: "1280 / 800", objectFit: "cover" }} />
                  ) : (
                    <div className="flex w-full items-center justify-center rounded bg-black/5 text-sm" style={{ aspectRatio: "1280 / 800" }}>
                      nog geen schermfoto
                    </div>
                  )}
                </div>
                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  <h3 className="text-base font-semibold">
                    <a href={`/voorbeeld/les/${l.id}?naam=Testkind`} target="_blank" rel="noreferrer" className="underline" style={{ color: "#0b4fb3" }}>
                      {l.titel ?? l.id}
                    </a>
                  </h3>
                  <div className="text-xs opacity-60">{l.id}</div>
                  <p className="mt-2 text-sm">
                    {l.uitleg ?? "—"}
                    {l.hulpmiddel ? <span className="opacity-80"> Hulpmiddel: {l.hulpmiddel}.</span> : null}
                  </p>
                  <div className="mt-3 rounded p-3" style={{ background: "#eef5ff" }}>
                    <div className="text-xs font-semibold uppercase opacity-60">Zin 1</div>
                    <div className="text-lg font-semibold leading-snug">{l.zin1 || "—"}</div>
                    <div className="mt-2 text-xs font-semibold uppercase opacity-60">Zin 2</div>
                    <div className="text-lg font-semibold leading-snug">{l.zin2 || "—"}</div>
                  </div>
                  <div className="mt-2 text-xs opacity-70">Huidige beginzin: {l.huidig || "—"}</div>
                </div>
              </article>
            ))}
        </section>
      ))}
    </div>
  );
}
