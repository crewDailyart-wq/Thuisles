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

/** Het rondje (zoals bij Junior Einstein): wit cirkeltje, lichtblauwe ring = nog niet gedaan, de ring loopt vol tot het percentage, vinkje in het midden zodra de les klaar is. */
function Rondje({ pct, klaar }: { pct: number; klaar: boolean }) {
  const C = 2 * Math.PI * 20;
  return (
    <svg className={s.rondje} viewBox="0 0 60 60" aria-hidden="true" style={{ "--omtrek": C, "--rest": C * (1 - pct / 100) } as React.CSSProperties}>
      <circle cx="30" cy="30" r="28" fill="#ffffff" />
      <circle cx="30" cy="30" r="19" fill="none" stroke="#bfe0ee" strokeWidth="9" />
      {klaar && pct > 0 && <circle cx="30" cy="30" r="19" fill="none" stroke="#2fa9e6" strokeWidth="9" strokeDasharray={C} className={s.boog} transform="rotate(-90 30 30)" />}
      {klaar && <path d="M22 31 L28 37 L39 24" fill="none" stroke="#1b86c4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className={s.vinkje} />}
    </svg>
  );
}

function Kaart({ titel, pct, klaar, vul, rondje }: { titel: string; pct: number; klaar: boolean; vul: boolean; rondje: boolean }) {
  return (
    <div className={`${s.kaart} ${pct >= 100 ? s.vol : ""} ${rondje ? s.metRondje : ""}`} style={{ "--vol": `${vul ? pct : 0}%` } as React.CSSProperties} data-kaart-vol={pct}>
      {vul && <div className={s.vulling} />}
      {rondje && <Rondje pct={pct} klaar={klaar} />}
      <span className={s.titel}>{titel}</span>
      {!rondje && (
        <svg className={s.ring} viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="6" />
          <path d="M13 23 L20 30 L32 15" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className={s.vinkje} />
        </svg>
      )}
    </div>
  );
}

export default async function KaartVol({ searchParams }: { searchParams: Promise<{ pct?: string; scherm?: string; rondje?: string; vul?: string }> }) {
  const { pct, scherm, rondje: r, vul: v } = await searchParams;
  const rondje = r !== "0";
  const vul = v !== "0";
  const p = Math.max(0, Math.min(100, Number(pct ?? 85) || 0));
  if (scherm === "onderwerpen") {
    const lessen = LESCATALOGUS.filter((r) => /-gouden(-|$)/.test(r.id));
    return (
      <main className={s.pagina}>
        <h1 className={s.kop}>Onderwerpen</h1>
        <ul className={s.raster}>
          {lessen.map((l, i) => {
            const demo = [100, 85, 60, 30][i];
            const pr = l.id === "squla-tellen-fruit-1-gouden-extra" ? p : demo ?? -1;
            return (
              <li key={l.id}>
                <Kaart titel={l.titel} pct={Math.max(pr, 0)} klaar={pr >= 0} vul={vul} rondje={rondje} />
              </li>
            );
          })}
        </ul>
      </main>
    );
  }
  return (
    <main className={`${s.pagina} ${s.eind}`}>
      <Kaart titel="Fruit tellen" pct={p} klaar vul={vul} rondje={rondje} />
      <div className={s.bliepo}>
        <p className={s.zin} data-bliepo-zin="">{zinVoor(p)}</p>
      </div>
    </main>
  );
}
