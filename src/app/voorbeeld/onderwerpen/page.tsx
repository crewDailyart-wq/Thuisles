import type { Metadata } from "next";
import { MERKNAAM } from "@/lib/merk";
import { LESCATALOGUS } from "@/lib/lessen/catalogus";
import { huidigKind } from "@/lib/auth/sessie";
import { haalResultaten } from "@/lib/data/lesresultaten";
import { haalSterren } from "@/lib/data/sterren";
import { herhaalTekenNodig, kleurCss, kleurOpNaam, kleurVoorPercentage } from "@/lib/les-kleuren";
import s from "./onderwerpen.module.css";

export const metadata: Metadata = { title: `Onderwerpen · ${MERKNAAM}`, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Het onderwerpenscherm (26 november 2026): daar komt het kind terug na het afvinken van de kaart aan het eind van een les.
 * Een kaart met resultaat heeft het vinkje en de kleur (les-kleuren.ts); een kaart zonder de beste kleur krijgt na 2 dagen
 * een herhaal-teken, waar het kind zelf op kan tikken. Een herhaling komt nooit vanzelf tussendoor.
 * Voorlopig alleen voor de gouden lessen, en alleen met kleuren in Tellen extra (de proef).
 * `?demo=72` laat voor Tellen extra een voorbeeldresultaat zien (72%), `&dagen=3` hoe lang geleden; er wordt niets bewaard.
 */
export default async function Onderwerpen({ searchParams }: { searchParams: Promise<{ demo?: string; dagen?: string }> }) {
  const { demo, dagen } = await searchParams;
  const kind = await huidigKind();
  const lessen = LESCATALOGUS.filter((r) => /-gouden(-|$)/.test(r.id));
  const resultaten = new Map<string, { kleur: string; herhalen: boolean }>();
  let sterren = 0;
  if (kind) {
    for (const r of haalResultaten(kind.id)) resultaten.set(r.lesId, { kleur: r.kleur, herhalen: r.herhalen });
    sterren = haalSterren(kind.id).aantal;
  }
  if (demo && /^\d{1,3}$/.test(demo)) {
    const k = kleurVoorPercentage(Number(demo));
    const geleden = new Date(Date.now() - (Number(dagen) || 0) * 24 * 3600 * 1000).toISOString();
    resultaten.set("squla-tellen-fruit-1-gouden-extra", { kleur: k.naam, herhalen: herhaalTekenNodig(k.naam, geleden) });
  }
  return (
    <main className={s.pagina}>
      <header className={s.kop}>
        <h1>Onderwerpen</h1>
        <div className={s.sterren} aria-label={`${sterren} sterren`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/beloning/ster-goud-400.png" alt="" width={44} height={44} />
          <span>{sterren}</span>
        </div>
      </header>
      <ul className={s.raster}>
        {lessen.map((l) => {
          const r = resultaten.get(l.id);
          const k = r ? kleurOpNaam(r.kleur) : undefined;
          return (
            <li key={l.id}>
              <a href={`/voorbeeld/les/${l.id}?naam=Testkind`} className={s.kaart} style={k ? ({ "--kaartkleur": kleurCss(k) } as React.CSSProperties) : undefined} data-kaart={l.id} data-kleur={k?.naam ?? ""} data-herhalen={r?.herhalen ? "ja" : ""}>
                <span className={s.titel}>{l.titel}</span>
                {k && (
                  <span className={s.ring} aria-hidden="true">
                    <svg viewBox="0 0 44 44" width="44" height="44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="var(--kaartkleur)" strokeWidth="6" />
                      <path d="M13 23 L20 30 L32 15" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                {r?.herhalen && (
                  <span className={s.herhaal} role="img" aria-label="Nog een keer oefenen">
                    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                      <path d="M19 8 A8 8 0 0 0 5.5 7 M5 4 V8 H9 M5 16 A8 8 0 0 0 18.5 17 M19 20 V16 H15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
