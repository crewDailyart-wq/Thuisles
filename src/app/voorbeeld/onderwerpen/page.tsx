import type { Metadata } from "next";
import { MERKNAAM } from "@/lib/merk";
import { LESCATALOGUS } from "@/lib/lessen/catalogus";
import { huidigKind } from "@/lib/auth/sessie";
import { haalResultaten } from "@/lib/data/lesresultaten";
import { haalSterren } from "@/lib/data/sterren";
import { haalTussenstanden } from "@/lib/data/lestussenstanden";
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
export default async function Onderwerpen({ searchParams }: { searchParams: Promise<{ demo?: string; dagen?: string; af?: string }> }) {
  const { demo, dagen, af } = await searchParams;
  const kind = await huidigKind();
  const lessen = LESCATALOGUS.filter((r) => /-gouden(-|$)/.test(r.id));
  const resultaten = new Map<string, { kleur: string; herhalen: boolean }>();
  const tussen = new Map<string, { af: number; kleur: string }>();
  let sterren = 0;
  if (kind) {
    for (const r of haalResultaten(kind.id)) resultaten.set(r.lesId, { kleur: r.kleur, herhalen: r.herhalen });
    sterren = haalSterren(kind.id).aantal;
    for (const t of haalTussenstanden(kind.id)) tussen.set(t.lesId, { af: t.af, kleur: kleurVoorPercentage(t.percentage).naam });
  }
  if (demo && /^\d{1,3}$/.test(demo)) {
    const k = kleurVoorPercentage(Number(demo));
    const geleden = new Date(Date.now() - (Number(dagen) || 0) * 24 * 3600 * 1000).toISOString();
    /* `&af=40` laat zien hoe het rondje staat als de les voor 40% gemaakt is. */
    if (af && /^\d{1,3}$/.test(af) && Number(af) < 100) {
      resultaten.delete("squla-tellen-fruit-1-gouden-extra");
      tussen.set("squla-tellen-fruit-1-gouden-extra", { af: Number(af), kleur: k.naam });
    } else {
      resultaten.set("squla-tellen-fruit-1-gouden-extra", { kleur: k.naam, herhalen: herhaalTekenNodig(k.naam, geleden) });
    }
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
          /* Klaar = vol in de kleur van het resultaat; halverwege gestopt = gevuld tot waar het kind was. */
          const half = r ? undefined : tussen.get(l.id);
          const k = r ? kleurOpNaam(r.kleur) : half ? kleurOpNaam(half.kleur) : undefined;
          const gevuld = r ? 100 : (half?.af ?? 0);
          return (
            <li key={l.id}>
              <a href={`/voorbeeld/les/${l.id}?naam=Testkind`} className={s.kaart} style={k ? ({ "--kaartkleur": kleurCss(k) } as React.CSSProperties) : undefined} data-kaart={l.id} data-kleur={k?.naam ?? ""} data-af={gevuld} data-herhalen={r?.herhalen ? "ja" : ""}>
                {/* Het rondje (27 nov 2026): alleen de ring, links van het onderwerp. Lichtblauw = nog niet gedaan; klaar = ring vol in de kleur van het resultaat; halverwege = gevuld tot waar het kind was. */}
                <span className={s.ring} aria-hidden="true">
                  <svg viewBox="0 0 60 60" width="56" height="56" style={{ overflow: "visible" }}>
                    <circle cx="30" cy="30" r="23" fill="none" stroke="#bfe0ee" strokeWidth="10" />
                    {k && gevuld > 0 && <circle cx="30" cy="30" r="23" fill="none" stroke="var(--kaartkleur)" strokeWidth="10" strokeDasharray={`${(2 * Math.PI * 23 * gevuld) / 100} ${2 * Math.PI * 23}`} transform="rotate(-90 30 30)" />}
                  </svg>
                </span>
                <span className={s.titel}>{l.titel}</span>
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
