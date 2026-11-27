import type { Metadata } from "next";
import { LESCATALOGUS } from "@/lib/lessen/catalogus";
import s from "./kaartvol.module.css";

export const metadata: Metadata = { title: "Voorbeeld kaart die vol loopt", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Voorbeeld (27 nov 2026), nog NIET in een les: de kaart loopt vol als een glas. Alle kaarten vullen in dezelfde kleur,
 * hoe vol de kaart is laat zien hoe het ging. Bliepo zegt alleen hoe vol de kaart is.
 *   /voorbeeld/kaart-vol?pct=85              het eindscherm met een kaart van 85%
 *   /voorbeeld/kaart-vol?pct=85&scherm=onderwerpen    de kaarten op het onderwerpenscherm
 * Er wordt niets bewaard.
 */
function zinVoor(p: number): string {
  if (p >= 100) return "Kijk, je kaart is helemaal vol! Dat komt door jouw goede antwoorden.";
  if (p >= 70) return "Kijk, je kaart is bijna vol! Dat komt door jouw goede antwoorden.";
  if (p >= 40) return "Kijk, je kaart is half vol. Jij hebt flink geoefend!";
  return "Je kaart is nog bijna leeg. Als we nog eens oefenen, wordt hij voller!";
}

function Kaart({ titel, pct }: { titel: string; pct: number }) {
  return (
    <div className={`${s.kaart} ${pct >= 100 ? s.vol : ""} ${pct <= 0 ? s.leeg : ""}`} style={{ "--vol": `${pct}%` } as React.CSSProperties} data-kaart-vol={pct}>
      <div className={s.vulling} />
      <span className={s.titel}>{titel}</span>
      <svg className={s.ring} viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="6" />
        <path d="M13 23 L20 30 L32 15" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className={s.vinkje} />
      </svg>
    </div>
  );
}

export default async function KaartVol({ searchParams }: { searchParams: Promise<{ pct?: string; scherm?: string }> }) {
  const { pct, scherm } = await searchParams;
  const p = Math.max(0, Math.min(100, Number(pct ?? 85) || 0));
  if (scherm === "onderwerpen") {
    const lessen = LESCATALOGUS.filter((r) => /-gouden(-|$)/.test(r.id));
    return (
      <main className={s.pagina}>
        <h1 className={s.kop}>Onderwerpen</h1>
        <ul className={s.raster}>
          {lessen.map((l) => (
            <li key={l.id}>
              <Kaart titel={l.titel} pct={l.id === "squla-tellen-fruit-1-gouden-extra" ? p : 0} />
            </li>
          ))}
        </ul>
      </main>
    );
  }
  return (
    <main className={`${s.pagina} ${s.eind}`}>
      <Kaart titel="Fruit tellen" pct={p} />
      <div className={s.bliepo}>
        <p className={s.zin} data-bliepo-zin="">{zinVoor(p)}</p>
      </div>
    </main>
  );
}
