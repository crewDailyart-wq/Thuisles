"use client";

/**
 * De schil om de Zappie-schermen: het levende heelal op de achtergrond, het
 * logo, het menu en het profiel.
 *
 * Tweede ontwerp (oktober 2026, ontwerp/zappie/voorbeeld-startpagina-2.webp):
 * op een groot scherm staan vier losse menuknoppen bovenaan in het midden, het
 * logo linksboven en het profiel rechtsboven. Op telefoon en staande tablet
 * staat het menu als balk onderaan. Tijdens een missie valt de schil weg, op de
 * achtergrond na: het kind houdt dan alleen de sommen over.
 */

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  IcoonController,
  IcoonHuis,
  IcoonMenu,
  IcoonMunt,
  IcoonSter,
  IcoonTandwiel,
  IcoonWereldbol,
} from "@/components/zappie/Iconen";
import { ZappieLogo } from "@/components/zappie/Onderdelen";
import { Heelal } from "@/components/zappie/Heelal";
import { PopupBoek } from "@/components/zappie/PopupBoek";
import { onthoudGetoond, useVoortgang, zetSpeler } from "@/lib/zappie/opslag";
import { puntenTekst } from "@/lib/zappie/voortgang";

export type Speler = {
  id: string | null;
  naam: string | null;
  /** Het plaatje van het kind, al getekend op de server. */
  avatar?: React.ReactNode;
};

/**
 * De vier menuknoppen. Een knop erbij is één regel.
 *
 * Oefenen gaat naar het rekenscherm in sterrenstijl (/rekenen, uit de nieuwe
 * layout; keuze eigenaar 13 oktober 2026). "Wereld" heette in het tweede
 * ontwerp "Werelden"; de bouwopdracht van het derde ontwerp noemt hem weer
 * "Wereld". Daar staan alle rekenoefeningen per
 * domein en onderwerp. De Zappie-missies zitten achter "Begin je missie" op de
 * startpagina.
 */
export const MENU = [
  { href: "/zappie", label: "Start", Icoon: IcoonHuis, actief: ["/zappie", "/zappie/mijn-wereld"] },
  { href: "/rekenen", label: "Oefenen", Icoon: IcoonController, actief: ["/rekenen", "/oefenen"] },
  { href: "/zappie/wereld", label: "Wereld", Icoon: IcoonWereldbol, actief: ["/zappie/wereld"] },
  { href: "/zappie/beloningen", label: "Beloningen", Icoon: IcoonSter, actief: ["/zappie/beloningen"] },
] as const;

const geenAbonnement = () => () => {};

function isActief(pad: string, paden: readonly string[]) {
  return paden.some((p) => (p === "/zappie" ? pad === p : pad === p || pad.startsWith(`${p}/`)));
}

export function Schil({ speler, children }: { speler: Speler; children: React.ReactNode }) {
  /* Voor de eerste tekening: de voortgang staat onder de sleutel van dit kind. */
  if (typeof window !== "undefined") zetSpeler(speler.id);

  const pad = usePathname();
  const zoek = useSearchParams();
  const focus = pad.startsWith("/zappie/oefenen") || pad.startsWith("/zappie/leerpad");
  const start = pad === "/zappie";
  /*
    Proeven van 16 oktober 2026, alleen te zien met een stukje achter het
    adres. Zonder dat stukje blijft alles zoals het is.
    - /zappie?achtergrond=rustig: een rustige, lichte daglucht;
    - /zappie?achtergrond=schrift: een bladzijde uit een rekenschrift met
      potloodkrabbels van Zappie (startpagina.css, onderaan);
    - /zappie?achtergrond=popup: een opengeslagen pop-upboek (PopupBoek.tsx).
  */
  const gevraagd = zoek.get("achtergrond");
  const proef = start && (gevraagd === "rustig" || gevraagd === "schrift" || gevraagd === "popup") ? gevraagd : undefined;

  return (
    <div
      className="zp"
      data-focus={focus ? "ja" : "nee"}
      data-start={start ? "ja" : "nee"}
      data-achtergrond={proef}
    >
      <Heelal rustig={focus} />
      {proef === "schrift" && (
        /* Drie bijna gelijke vervormingen: om beurten gebruikt laten ze de potloodlijnen licht trillen. */
        <svg className="zp-kriebelfilters" aria-hidden="true" width="0" height="0">
          {[1, 2, 3].map((n) => (
            <filter key={n} id={`zp-kriebel-${n}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={n * 7} />
              <feDisplacementMap in="SourceGraphic" scale="2.6" />
            </filter>
          ))}
        </svg>
      )}
      {!focus && (
        <div className="zp-schil">
          <div className="zp-logoplek">
            <ZappieLogo />
          </div>
          <nav className="zp-menu" aria-label="Menu">
            <ul>
              {MENU.map(({ href, label, Icoon, actief }) => (
                <li key={href}>
                  <Link href={href} className="zp-menu-knop zp-titel" aria-current={isActief(pad, actief) ? "page" : undefined}>
                    <Icoon className="zp-menu-icoon" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="zp-profiel">
            <span className="zp-profiel-plaatje">
              {speler.avatar ?? <span className="zp-titel">{(speler.naam ?? "Z").slice(0, 1)}</span>}
            </span>
            <span className="zp-profiel-groet">{speler.naam ? `Hoi, ${speler.naam}!` : "Hoi, ontdekkingsreiziger!"}</span>
            {/* Naar "Meer": het menu en alles wat vroeger onder het startscherm stond. */}
            <Link href="/meer" className="zp-profiel-knop zp-profiel-meer" aria-label="Menu en meer" title="Menu en meer">
              <IcoonMenu className="size-full" />
            </Link>
            <Link href="/profiel" className="zp-profiel-knop zp-profiel-instellingen" aria-label="Instellingen">
              <IcoonTandwiel className="size-full" />
            </Link>
          </div>
        </div>
      )}
      {proef === "popup" && <PopupBoek />}
      {children}
    </div>
  );
}

/**
 * De tokens. Komen er tokens bij, dan telt de teller op vanaf wat hij het
 * laatst liet zien en maakt de munt een sprongetje. Bij "minder beweging"
 * springt het getal meteen naar het nieuwe aantal.
 *
 * - `soort="strook"`: de munt groot met "Jouw tokens" erboven (startpagina);
 * - `soort="klein"`: een klein pilletje (tijdens een missie);
 * - `soort="los"`: munt met getal en "tokens" (na een missie).
 */
export function Tokenteller({ soort = "los" }: { soort?: "strook" | "klein" | "los" }) {
  const v = useVoortgang();
  /* Pas na het laden in de browser is de echte voortgang bekend. */
  const inBrowser = useSyncExternalStore(geenAbonnement, () => true, () => false);
  const [tussenstand, zetTussenstand] = useState<number | null>(null);
  const [wip, zetWip] = useState(0);
  const verwerkt = useRef<number | null>(null);

  useEffect(() => {
    if (!inBrowser) return;
    const van = verwerkt.current ?? v.getoond;
    const naar = v.punten;
    verwerkt.current = naar;
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (naar <= van || rustig) {
      onthoudGetoond(naar);
      return;
    }
    const duur = Math.min(1600, 500 + (naar - van) * 6);
    let begin = 0;
    let frame = requestAnimationFrame(function stap(nu) {
      if (!begin) {
        begin = nu;
        zetWip((n) => n + 1);
      }
      const t = Math.min(1, (nu - begin) / duur);
      const glad = 1 - Math.pow(1 - t, 3);
      if (t < 1) {
        zetTussenstand(Math.round(van + (naar - van) * glad));
        frame = requestAnimationFrame(stap);
      } else {
        zetTussenstand(null);
        onthoudGetoond(naar);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [inBrowser, v.punten, v.getoond]);

  /* Tot de teller begint te tellen: wat hij het laatst liet zien. */
  const waarde = tussenstand ?? Math.min(v.punten, v.getoond);
  const munt = (
    <span key={wip} className={wip ? "zp-tokens-munt zp-wip" : "zp-tokens-munt"} data-tokenmunt>
      <IcoonMunt className="size-full" />
    </span>
  );

  if (soort === "strook") {
    return (
      <span className="zp-tokenteller zp-tokenteller-strook">
        {munt}
        <span className="zp-tokenteller-tekst">
          <span className="zp-tokenteller-label">Jouw tokens</span>
          <span className="zp-titel zp-tokenteller-getal" aria-live="polite">
            {puntenTekst(waarde)}
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className={`zp-tokenteller zp-tokenteller-${soort}`}>
      {munt}
      <span className="zp-titel zp-tokenteller-getal" aria-live="polite">
        {puntenTekst(waarde)}
      </span>
      <span className="zp-tokenteller-label">tokens</span>
    </span>
  );
}
