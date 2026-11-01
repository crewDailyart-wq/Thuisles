/**
 * Overzicht van de Squla-lessen (1 november 2026, vraag eigenaar): per les een
 * schermfoto, de status (gebouwd, gekeurd, afgekeurd) en een link.
 *
 * Alleen op de laptop: online geeft deze pagina "niet gevonden". De
 * schermfoto's en de lijst maakt `node scripts/squla-overzicht.mjs`
 * (public/squla-overzicht/, staat niet in Git). De status komt live uit
 * CONTROLE-SQULA.md (het verslag van de controleur). Niet indexeren: dat
 * regelt de beheerlayout.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";

type Les = { id: string; titel: string; onderwerp: string; foto: string | null; gemaakt: string | null };
type Status = { oordeel: "GOEDGEKEURD" | "AFGEKEURD"; ronde: string; wanneer: string };

function lees(bestand: string): string {
  const p = path.join(process.cwd(), bestand);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

/** De laatste keuring per les uit CONTROLE-SQULA.md ("### <id> — … — GOEDGEKEURD/AFGEKEURD (…)"). */
function keuringen(): Map<string, Status> {
  const m = new Map<string, Status>();
  for (const r of lees("CONTROLE-SQULA.md").matchAll(/^###\s+(squla-[a-z0-9-]+)\b(.*?)\b(GOEDGEKEURD|AFGEKEURD)\b(.*)$/gm)) {
    const ronde = /ronde\s*(\d+)/i.exec(r[2])?.[1] ?? "";
    m.set(r[1], { oordeel: r[3] as Status["oordeel"], ronde, wanneer: r[4].replace(/[()]/g, "").trim() });
  }
  return m;
}

export default function OverzichtSqula() {
  if (process.env.NODE_ENV === "production") notFound();
  const lijst: Les[] = (() => {
    try {
      return JSON.parse(lees("public/squla-overzicht/overzicht.json")).lessen;
    } catch {
      return [];
    }
  })();
  const status = keuringen();
  const onderwerpen = [...new Set(lijst.map((l) => l.onderwerp))];
  const tel = (o: Status["oordeel"]) => lijst.filter((l) => status.get(l.id)?.oordeel === o).length;

  return (
    <div>
      <h1 className="text-xl font-semibold">Overzicht Squla-lessen</h1>
      <p className="mt-1 text-sm opacity-80">
        {lijst.length} lessen gebouwd · {tel("GOEDGEKEURD")} goedgekeurd · {tel("AFGEKEURD")} afgekeurd · {lijst.length - tel("GOEDGEKEURD") - tel("AFGEKEURD")} nog niet gekeurd. Alleen op de laptop.
      </p>
      {!lijst.length && <p className="mt-4">Nog geen overzicht: draai node scripts/squla-overzicht.mjs.</p>}
      {onderwerpen.map((o) => (
        <section key={o} className="mt-6">
          <h2 className="text-lg font-semibold">{o}</h2>
          <div className="mt-2 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {lijst
              .filter((l) => l.onderwerp === o)
              .map((l) => {
                const s = status.get(l.id);
                const kleur = s?.oordeel === "GOEDGEKEURD" ? "#0a7a32" : s?.oordeel === "AFGEKEURD" ? "#b00020" : "#6b6b6b";
                const tekst = s ? `${s.oordeel === "GOEDGEKEURD" ? "Gekeurd" : "Afgekeurd"}${s.ronde ? ` (ronde ${s.ronde})` : ""}` : "Gebouwd, nog niet gekeurd";
                return (
                  <a key={l.id} href={`/voorbeeld/les/${l.id}?naam=Testkind`} target="_blank" rel="noreferrer" className="block rounded border border-black/10 bg-white p-2 hover:shadow">
                    {l.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/squla-overzicht/${l.foto}`} alt="" loading="lazy" className="aspect-[16/10] w-full rounded object-cover" />
                    ) : (
                      <div className="flex aspect-[16/10] w-full items-center justify-center rounded bg-black/5 text-xs">nog geen schermfoto</div>
                    )}
                    <div className="mt-1 text-sm font-medium">{l.titel}</div>
                    <div className="text-xs opacity-70">{l.id}</div>
                    <div className="mt-1 text-xs font-semibold" style={{ color: kleur }}>
                      {tekst}
                    </div>
                  </a>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
