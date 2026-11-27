import type { Metadata } from "next";
import { LESCATALOGUS } from "@/lib/lessen/catalogus";
import { kleurCss, kleurVoorPercentage } from "@/lib/les-kleuren";
import s from "../kaart-vol/kaartvol.module.css";

export const metadata: Metadata = { title: "Voorbeeld rondje met kleur", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Voorbeeld (27 nov 2026), nog NIET in een les: versie B (aangepast: alleen de ring, geen wit vlak, geen vinkje; de ring is gevuld tot waar het kind de les heeft gemaakt, in de kleur van het resultaat). Een rondje zoals bij Junior Einstein, in de kleur van de kleurtrap
 * (les-kleuren.ts), op het eindscherm én naast elke les op het onderwerpenscherm. De kaart zelf blijft gewoon.
 *   /voorbeeld/rondje-kleur?pct=72                          het eindscherm
 *   /voorbeeld/rondje-kleur?pct=72&scherm=onderwerpen       het overzicht
 * Er wordt niets bewaard. Bliepo zegt niets over de kleur, alleen hoe het ging. De zinnen zijn een voorstel en nog niet door Fable gecontroleerd.
 */
function zinVoor(p: number): string {
  if (p >= 100) return "Alles goed! Wat heb jij dat mooi gedaan.";
  if (p >= 70) return "Kijk, dat ging goed! Dat komt door jouw goede antwoorden.";
  if (p >= 40) return "Jij hebt flink geoefend! Nog een keer oefenen en het gaat steeds beter.";
  return "De les is af. Van oefenen word je steeds beter! We doen het samen nog een keer.";
}

/** Alleen de ring: lichtblauw = nog niet gemaakt, de kleur loopt tot waar het kind het heeft gemaakt (af = % van de les). Geen wit vlak, geen vinkje. */
function Rondje({ pct, af, begonnen }: { pct: number; af: number; begonnen: boolean }) {
  const R = 23;
  const C = 2 * Math.PI * R;
  const kleur = kleurCss(kleurVoorPercentage(pct));
  return (
    <svg className={s.rondje} viewBox="0 0 60 60" aria-hidden="true" style={{ "--omtrek": C, "--rest": C * (1 - af / 100) } as React.CSSProperties}>
      <circle cx="30" cy="30" r={R} fill="none" stroke="#bfe0ee" strokeWidth="10" />
      {begonnen && af > 0 && <circle cx="30" cy="30" r={R} fill="none" stroke={kleur} strokeWidth="10" strokeDasharray={C} className={s.boog} transform="rotate(-90 30 30)" />}
    </svg>
  );
}

function Kaart({ titel, pct, af, begonnen }: { titel: string; pct: number; af: number; begonnen: boolean }) {
  return (
    <div className={`${s.kaart} ${s.metRondje}`} data-rondje-kleur={begonnen ? kleurVoorPercentage(pct).naam : ""} data-af={af}>
      <Rondje pct={pct} af={af} begonnen={begonnen} />
      <span className={s.titel}>{titel}</span>
    </div>
  );
}

export default async function RondjeKleur({ searchParams }: { searchParams: Promise<{ pct?: string; scherm?: string; af?: string }> }) {
  const { pct, scherm, af: afParam } = await searchParams;
  const af = Math.max(0, Math.min(100, Number(afParam ?? 100) || 0));
  const p = Math.max(0, Math.min(100, Number(pct ?? 72) || 0));
  if (scherm === "onderwerpen") {
    const lessen = LESCATALOGUS.filter((r) => /-gouden(-|$)/.test(r.id));
    return (
      <main className={s.pagina}>
        <h1 className={s.kop}>Onderwerpen</h1>
        <ul className={s.raster}>
          {lessen.map((l, i) => {
            // Voorbeeld: [percentage goed, hoever het kind is]. Fruit tellen, extra volgt de link (?pct=..&af=..).
            const demo: [number, number][] = [[100, 100], [88, 100], [72, 100], [70, 50], [55, 25], [90, 75], [42, 100]];
            const extra = l.id === "squla-tellen-fruit-1-gouden-extra";
            const d = extra ? ([p, af] as [number, number]) : demo[i];
            return (
              <li key={l.id}>
                <Kaart titel={l.titel} pct={d?.[0] ?? 0} af={d?.[1] ?? 0} begonnen={!!d && d[1] > 0} />
              </li>
            );
          })}
        </ul>
      </main>
    );
  }
  return (
    <main className={`${s.pagina} ${s.eind}`}>
      <Kaart titel="Fruit tellen" pct={p} af={af} begonnen={af > 0} />
      <div className={s.bliepo}>
        <p className={s.zin} data-bliepo-zin="">{zinVoor(p)}</p>
      </div>
    </main>
  );
}
