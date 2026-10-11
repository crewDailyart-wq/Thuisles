"use client";

/**
 * Twee vakjeskaarten naast elkaar (Vergelijken), naar Synthesis "Compare the
 * Pair": 2 × 3 of 2 × 5 vakjes, links blauw en rechts oranje (of gemengd).
 *
 * Wat het kind kan doen, zet het draaiboek aan met props:
 * - `kies`: op een kaart tikken kiest die groep (gele rand), het vinkje
 *   bevestigt: `{ soort: "kaart", kant }`.
 * - `tik`: vakjes aan- en uitzetten aan die kant:
 *   `{ soort: "vakje", kant, links, rechts }` (de aantallen).
 * - `tekenTik`: het teken in het midden wisselt = → > → <:
 *   `{ soort: "teken", s }`.
 * - `klaar`: het blauwe vinkje: `{ soort: "klaar", links, rechts, teken }`.
 *
 * Een vakje is "" (leeg) of een kleur: "blauw", "oranje", "groen". Index 0 is
 * linksboven, dan rechtsboven, enzovoort. Nieuwe vakjes zet het draaiboek
 * neer met een nieuwe `zet`.
 */

import { useState, type CSSProperties } from "react";
import type { Vlakbasis } from "../soort";
import { stipPlekken, Tekenbeeld, Vinkje, WISSEL, type Teken } from "./vergelijken-getallen";
import s from "./vergelijken.module.css";

export type Kant = "links" | "rechts";
export type Vakkleur = "" | "blauw" | "oranje" | "groen";

export const VAKKLEUR: Record<Exclude<Vakkleur, "">, string> = {
  blauw: "#5b73d6",
  oranje: "#ef8c45",
  groen: "#3fb34f",
};

export type KaartenProps = {
  links: Vakkleur[];
  rechts: Vakkleur[];
  zet: number;
  /** Welke kleur een vakje krijgt als het kind het aanzet. */
  kleurLinks?: Exclude<Vakkleur, "">;
  kleurRechts?: Exclude<Vakkleur, "">;
  kies?: boolean;
  /** Aan welke kant het kind vakjes aan en uit mag zetten. */
  tik?: Kant | "beide" | null;
  /** Gele rand om de blokjes van deze kant (en eventueel alleen deze kleur). */
  kader?: { kant: Kant; kleur?: Vakkleur } | null;
  /** Bij `kies`: alleen de blokjes van deze kleur krijgen de gele rand. */
  telKleur?: Exclude<Vakkleur, ""> | null;
  /** Alleen deze kleur laten zien; de andere blokjes zijn even weg. */
  alleen?: Exclude<Vakkleur, ""> | null;
  teken?: Teken | null;
  tekenTik?: boolean;
  stip?: "klein" | "groot" | null;
  naam?: string | null;
  /** De aantallen groot boven de kaarten. */
  aantallen?: boolean;
  /** Een lichte pijl onder de kaart die het kind mag veranderen. */
  pijl?: Kant | null;
  klaar?: boolean;
};

/* Zoals Synthesis: twee grote kaarten dicht bij elkaar, met het teken in de smalle ruimte ertussen. */
const X: Record<Kant, number> = { links: 322, rechts: 658 };
const MIDDEN_Y = 392;

function telVol(v: Vakkleur[]) {
  return v.filter((k) => k !== "").length;
}

export function VergelijkenKaarten({
  links,
  rechts,
  zet,
  kleurLinks = "blauw",
  kleurRechts = "oranje",
  kies = false,
  tik = null,
  kader = null,
  telKleur = null,
  alleen = null,
  teken = null,
  tekenTik = false,
  stip = null,
  naam = null,
  aantallen = false,
  pijl = null,
  klaar = false,
  meld,
}: KaartenProps & Vlakbasis) {
  const [vakjes, setVakjes] = useState({ links, rechts });
  const [tk, setTk] = useState<Teken | null>(teken);
  const [gekozen, setGekozen] = useState<Kant | null>(null);
  const [vorigeZet, setVorigeZet] = useState(zet);
  if (zet !== vorigeZet) {
    setVorigeZet(zet);
    setVakjes({ links, rechts });
    setTk(teken);
    setGekozen(null);
  }

  const rijen = Math.ceil(Math.max(vakjes.links.length, vakjes.rechts.length) / 2);
  const cel = rijen > 3 ? 96 : 104;
  const hoog = rijen * cel + (rijen - 1) * 14;
  const breed = 2 * cel + 14;
  const top = MIDDEN_Y - hoog / 2;

  const zetVakje = (kant: Kant, i: number) => {
    const lijst = [...vakjes[kant]];
    lijst[i] = lijst[i] ? "" : kant === "links" ? kleurLinks : kleurRechts;
    const nieuw = { ...vakjes, [kant]: lijst };
    setVakjes(nieuw);
    meld({ soort: "vakje", kant, links: telVol(nieuw.links), rechts: telVol(nieuw.rechts) });
  };

  const getoondKader = kies ? (gekozen ? { kant: gekozen, kleur: telKleur ?? undefined } : null) : kader;

  return (
    <div className={s.vlak}>
      {naam && (
        <div key={naam} className={s.naam}>
          {naam}
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        Links {telVol(vakjes.links)} {telVol(vakjes.links) === 1 ? "blokje" : "blokjes"}, rechts {telVol(vakjes.rechts)} {telVol(vakjes.rechts) === 1 ? "blokje" : "blokjes"}
      </span>

      {(["links", "rechts"] as Kant[]).map((kant) => {
        const magTik = tik === kant || tik === "beide";
        const kanKies = kies;
        return (
          <div
            key={kant}
            className={s.kaart}
            data-kies={kanKies}
            role={kanKies ? "button" : undefined}
            tabIndex={kanKies ? 0 : undefined}
            aria-label={kanKies ? `Kies de groep ${kant}` : undefined}
            aria-pressed={kanKies ? gekozen === kant : undefined}
            style={{ left: X[kant] - breed / 2, top, "--cel": `${cel}px` } as CSSProperties}
            onClick={() => kanKies && setGekozen(kant)}
            onKeyDown={(e) => {
              if (kanKies && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setGekozen(kant);
              }
            }}
          >
            {vakjes[kant].map((kleur, i) => {
              const zichtbaar = kleur !== "" && (!alleen || kleur === alleen);
              const metKader = !!getoondKader && getoondKader.kant === kant && zichtbaar && (!getoondKader.kleur || getoondKader.kleur === kleur);
              return (
                <button
                  key={`${i}-${kleur}`}
                  type="button"
                  className={`${s.vakje} ${zichtbaar ? s.vol : ""} ${metKader ? s.kader : ""} ${kleur !== "" && !zichtbaar ? s.verborgen : ""}`}
                  data-tik={magTik}
                  tabIndex={magTik ? 0 : -1}
                  aria-label={magTik ? (kleur ? "Blokje, tik om weg te halen" : "Leeg vakje, tik om een blokje te zetten") : undefined}
                  aria-hidden={magTik || kanKies ? undefined : true}
                  style={{ background: zichtbaar ? VAKKLEUR[kleur as Exclude<Vakkleur, "">] : "transparent", cursor: magTik || kanKies ? "pointer" : "default" }}
                  onClick={(e) => {
                    if (!magTik) return;
                    e.stopPropagation();
                    zetVakje(kant, i);
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {aantallen &&
        (["links", "rechts"] as Kant[]).map((kant) => {
          const n = telVol(vakjes[kant]);
          const kleur = vakjes[kant].find((k) => k !== "") || (kant === "links" ? kleurLinks : kleurRechts);
          return (
            <div key={`a${kant}-${n}`} className={s.aantal} style={{ left: X[kant], top: top - 78, color: VAKKLEUR[kleur as Exclude<Vakkleur, "">] }}>
              {n}
            </div>
          );
        })}

      {pijl && (
        <svg className={s.pijl} style={{ left: X[pijl], top: top + hoog + 12 }} width="40" height="44" viewBox="0 0 40 44" aria-hidden>
          <path d="M20 4 6 20h9v20h10V20h9z" fill="rgba(214,216,225,0.55)" />
        </svg>
      )}

      {tk && (
        <button
          type="button"
          className={s.deel}
          data-tik={tekenTik}
          tabIndex={tekenTik ? 0 : -1}
          aria-label={tekenTik ? "Teken, tik om te wisselen" : undefined}
          aria-hidden={tekenTik ? undefined : true}
          style={{ left: 490, top: MIDDEN_Y, cursor: tekenTik ? "pointer" : "default" }}
          onClick={() => {
            if (!tekenTik) return;
            const nieuw = WISSEL[tk];
            setTk(nieuw);
            meld({ soort: "teken", s: nieuw });
          }}
        >
          <span key={tk} className={tekenTik ? s.wissel : undefined} style={{ display: "grid", placeItems: "center" }}>
            <Tekenbeeld teken={tk} maat={76} />
          </span>
        </button>
      )}
      {tk &&
        stip &&
        stipPlekken(tk, stip, 490, MIDDEN_Y, 76).map((p, k) => <div key={`${stip}-${tk}-${k}`} className={s.stip} style={{ left: p.x, top: p.y }} />)}

      {(klaar || (kies && gekozen)) && (
        <button
          type="button"
          className={s.klaar}
          style={{ left: 490, top: Math.min(640, top + hoog - 56) }}
          aria-label="Controleer"
          onClick={() => {
            if (kies) {
              if (gekozen) meld({ soort: "kaart", kant: gekozen });
              return;
            }
            meld({ soort: "klaar", links: telVol(vakjes.links), rechts: telVol(vakjes.rechts), teken: tk });
          }}
        >
          <Vinkje />
        </button>
      )}
    </div>
  );
}
