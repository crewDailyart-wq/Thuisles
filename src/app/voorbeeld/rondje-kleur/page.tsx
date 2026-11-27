import type { Metadata } from "next";
import { LESCATALOGUS } from "@/lib/lessen/catalogus";
import { kleurCss, kleurVoorPercentage } from "@/lib/les-kleuren";
import s from "../kaart-vol/kaartvol.module.css";

export const metadata: Metadata = { title: "Voorbeeld rondje met kleur", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Voorbeeld (27 nov 2026), nog NIET in een les: versie B. Een rondje zoals bij Junior Einstein, in de kleur van de kleurtrap
 * (les-kleuren.ts), op het eindscherm én naast elke les op het onderwerpenscherm. De kaart zelf blijft gewoon.
 *   /voorbeeld/rondje-kleur?pct=72                          het eindscherm
 *   /voorbeeld/rondje-kleur?pct=72&scherm=onderwerpen       het overzicht
 * Er wordt niets bewaard. De zinnen van Bliepo zijn een voorstel en nog niet door Fable gecontroleerd.
 */
function zinVoor(p: number): string {
  if (p >= 80) return "Kijk, je rondje is groen! Dat komt door jouw goede antwoorden.";
  if (p >= 70) return "Kijk, je rondje is geel. Bijna groen! Nog een keer oefenen en het wordt groen.";
  if (p >= 40) return "Je rondje is oranje. Jij hebt flink geoefend! Als we nog eens oefenen, wordt het groener.";
  return "Je rondje is nog rood. Als we nog eens oefenen, wordt het groener!";
}

function Rondje({ pct, klaar }: { pct: number; klaar: boolean }) {
  const C = 2 * Math.PI * 19;
  const kleur = klaar ? kleurCss(kleurVoorPercentage(pct)) : "#bfe0ee";
  return (
    <svg className={s.rondje} viewBox="0 0 60 60" aria-hidden="true" style={{ "--omtrek": C, "--rest": 0 } as React.CSSProperties}>
      <circle cx="30" cy="30" r="28" fill="#ffffff" />
      <circle cx="30" cy="30" r="19" fill="none" stroke="#bfe0ee" strokeWidth="9" />
      {klaar && <circle cx="30" cy="30" r="19" fill="none" stroke={kleur} strokeWidth="9" strokeDasharray={C} className={s.boog} transform="rotate(-90 30 30)" />}
      {klaar && <circle cx="30" cy="30" r="10.5" fill={kleur} />}
      {klaar && <path d="M24 30.5 L28.5 35 L37 25" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={s.vinkje} />}
    </svg>
  );
}

function Kaart({ titel, pct, klaar }: { titel: string; pct: number; klaar: boolean }) {
  return (
    <div className={`${s.kaart} ${s.metRondje}`} data-rondje-kleur={klaar ? kleurVoorPercentage(pct).naam : ""}>
      <Rondje pct={pct} klaar={klaar} />
      <span className={s.titel}>{titel}</span>
    </div>
  );
}

export default async function RondjeKleur({ searchParams }: { searchParams: Promise<{ pct?: string; scherm?: string }> }) {
  const { pct, scherm } = await searchParams;
  const p = Math.max(0, Math.min(100, Number(pct ?? 72) || 0));
  if (scherm === "onderwerpen") {
    const lessen = LESCATALOGUS.filter((r) => /-gouden(-|$)/.test(r.id));
    return (
      <main className={s.pagina}>
        <h1 className={s.kop}>Onderwerpen</h1>
        <ul className={s.raster}>
          {lessen.map((l, i) => {
            const demo = [100, 88, 72, 55, 42, 25][i];
            const pr = l.id === "squla-tellen-fruit-1-gouden-extra" ? p : demo ?? -1;
            return (
              <li key={l.id}>
                <Kaart titel={l.titel} pct={Math.max(pr, 0)} klaar={pr >= 0} />
              </li>
            );
          })}
        </ul>
      </main>
    );
  }
  return (
    <main className={`${s.pagina} ${s.eind}`}>
      <Kaart titel="Fruit tellen" pct={p} klaar />
      <div className={s.bliepo}>
        <p className={s.zin} data-bliepo-zin="">{zinVoor(p)}</p>
      </div>
    </main>
  );
}
