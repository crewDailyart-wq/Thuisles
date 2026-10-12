"use client";

/**
 * De schil om de Zappie-schermen: ruimteachtergrond, logo, menu, punten en
 * profiel.
 *
 * Op een groot scherm staat het menu als smalle balk links en staan de punten en
 * het profiel rechtsboven. Op telefoon en staande tablet staat het menu als balk
 * onderaan. Tijdens een missie valt de schil weg, op de achtergrond na: het
 * kind houdt dan alleen de sommen over.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  IcoonController,
  IcoonHuis,
  IcoonSter,
  IcoonWereldbol,
} from "@/components/zappie/Iconen";
import { Ruimte, ZappieLogo } from "@/components/zappie/Onderdelen";
import { onthoudGetoond, useVoortgang, zetSpeler } from "@/lib/zappie/opslag";
import { puntenTekst, volgendeMissie } from "@/lib/zappie/voortgang";

export type Speler = {
  id: string | null;
  naam: string | null;
  /** Het plaatje van het kind, al getekend op de server. */
  avatar?: React.ReactNode;
};

/** De vier onderdelen van het menu. Een onderdeel erbij is één regel. */
export const MENU = [
  { href: "/zappie", label: "Start", Icoon: IcoonHuis },
  { href: "/zappie/oefenen", label: "Oefenen", Icoon: IcoonController },
  { href: "/zappie/wereld", label: "Wereld", Icoon: IcoonWereldbol },
  { href: "/zappie/beloningen", label: "Beloningen", Icoon: IcoonSter },
] as const;

const geenAbonnement = () => () => {};

function isActief(pad: string, href: string) {
  return href === "/zappie" ? pad === "/zappie" || pad === "/zappie/mijn-wereld" : pad.startsWith(href);
}

export function Schil({ speler, children }: { speler: Speler; children: React.ReactNode }) {
  /* Voor de eerste tekening: de voortgang staat onder de sleutel van dit kind. */
  if (typeof window !== "undefined") zetSpeler(speler.id);

  const pad = usePathname();
  const focus = pad.startsWith("/zappie/oefenen");
  const volgende = volgendeMissie(useVoortgang());
  const oefenAdres = `/zappie/oefenen?wereld=${volgende.wereld}&missie=${volgende.nummer}`;

  return (
    <div className="zp" data-focus={focus ? "ja" : "nee"}>
      <Ruimte />
      {!focus && (
        <div className="zp-schil">
          <ZappieLogo />
          <nav className="zp-menu" aria-label="Menu">
            <ul>
              {MENU.map(({ href, label, Icoon }) => {
                const actief = isActief(pad, href);
                return (
                  <li key={href}>
                    <Link href={href === "/zappie/oefenen" ? oefenAdres : href} className="zp-menu-knop" aria-current={actief ? "page" : undefined}>
                      <Icoon className="zp-menu-icoon" />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="zp-bovenbalk">
            <Puntenteller />
            <div className="zp-profiel">
              <span className="zp-profiel-plaatje">{speler.avatar ?? <span className="zp-titel">{(speler.naam ?? "Z").slice(0, 1)}</span>}</span>
              <span className="zp-titel">{speler.naam ? `Hoi ${speler.naam}!` : "Hoi!"}</span>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * De Zappie-punten. Komen er punten bij, dan telt de teller op vanaf wat hij het
 * laatst liet zien en maakt de ster een sprongetje. Bij "minder beweging"
 * springt het getal meteen naar het nieuwe aantal.
 */
export function Puntenteller({ klein = false }: { klein?: boolean }) {
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
  return (
    <div className={`zp-punten ${klein ? "zp-punten-klein" : ""}`}>
      <span key={wip} className={wip ? "zp-punten-ster zp-wip" : "zp-punten-ster"}>
        <IcoonSter className="size-full" />
      </span>
      <span className="zp-punten-tekst">
        <span className="zp-titel zp-punten-getal" aria-live="polite">
          {puntenTekst(waarde)}
        </span>
        <span className="zp-punten-label">Zappie-punten</span>
      </span>
    </div>
  );
}
