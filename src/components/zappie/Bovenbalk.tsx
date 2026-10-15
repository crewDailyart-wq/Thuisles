"use client";

/**
 * De blauwe bovenbalk van de startpagina (15 oktober 2026).
 *
 * Opdracht van de eigenaar: "Voeg op de startpagina van Thuisles alleen een
 * nieuwe blauwe bovenbalk toe." Van links naar rechts: het logo Thuisles, de
 * vier knoppen Start, Oefenen, Wereld en Beloningen, en een pil met het plaatje
 * en de naam van het kind, het menu en het tandwiel. De balk blijft bovenaan
 * staan bij het scrollen.
 *
 * Alleen op de startpagina (/zappie). Daar komt hij in de plaats van het
 * zwevende logo, menu en profiel uit Schil.tsx (keuze eigenaar: "verbergen,
 * alleen startpagina"). Die code blijft staan, en de andere Zappie-schermen
 * houden die bovenkant gewoon.
 *
 * Dezelfde knoppen en adressen als het oude menu (MENU in Schil.tsx). Het
 * menu-icoon gaat naar Meer (/meer) en het tandwiel naar /profiel, zoals
 * voorheen. Op telefoon en staande tablet passen de vier knoppen er niet naast;
 * daar zitten ze achter het menu-icoon, samen met Meer.
 *
 * De kleuren staan als variabelen bovenaan bovenbalk.css.
 */

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { IcoonMenu, IcoonTandwiel } from "@/components/zappie/Iconen";
import type { Speler } from "@/components/zappie/Schil";
import "@/components/zappie/bovenbalk.css";

/** De naam in het logo. Bewust niet MERKNAAM: de eigenaar wil hier "Thuisles". */
const LOGONAAM = "Thuisles";

export type Balkknop = {
  href: string;
  label: string;
  Icoon: (p: { className?: string }) => React.ReactNode;
  /** Is dit de pagina waar het kind nu is? Dan is de knop lichtblauw. */
  huidig: boolean;
};

export function Bovenbalk({ speler, knoppen }: { speler: Speler; knoppen: Balkknop[] }) {
  const [open, zetOpen] = useState(false);
  const balk = useRef<HTMLElement>(null);
  const menuknop = useRef<HTMLButtonElement>(null);
  const paneelId = useId();

  /* Het telefoonmenu sluit met Escape of met een tik ernaast. */
  useEffect(() => {
    if (!open) return;
    function opToets(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      zetOpen(false);
      menuknop.current?.focus();
    }
    function opTik(e: PointerEvent) {
      if (!balk.current?.contains(e.target as Node)) zetOpen(false);
    }
    document.addEventListener("keydown", opToets);
    document.addEventListener("pointerdown", opTik);
    return () => {
      document.removeEventListener("keydown", opToets);
      document.removeEventListener("pointerdown", opTik);
    };
  }, [open]);

  const sluit = () => zetOpen(false);

  return (
    <header ref={balk} className="bb" data-open={open ? "ja" : "nee"}>
      <div className="bb-binnen">
        <Link href="/zappie" className="bb-logo zp-titel" aria-label={`${LOGONAAM}, naar de start`}>
          <span className="bb-logo-tekst">{LOGONAAM}</span>
          <svg viewBox="0 0 48 48" className="bb-logo-ster" aria-hidden="true">
            <path
              d="m24 4.5 5.9 12.2 13.3 1.9-9.6 9.4 2.3 13.3L24 35l-11.9 6.3 2.3-13.3-9.6-9.4 13.3-1.9z"
              fill="#ffd447"
              stroke="#f29b11"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <nav className="bb-menu" aria-label="Menu">
          <ul>
            {knoppen.map(({ href, label, Icoon, huidig }) => (
              <li key={href}>
                <Link href={href} className="bb-knop zp-titel" aria-current={huidig ? "page" : undefined}>
                  <Icoon className="bb-knop-icoon" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="bb-pil">
          <span className="bb-plaatje">
            {speler.avatar ?? <span className="zp-titel">{(speler.naam ?? LOGONAAM).slice(0, 1)}</span>}
          </span>
          <span className="bb-groet zp-titel">{speler.naam ? `Hoi, ${speler.naam}!` : "Hoi, ontdekkingsreiziger!"}</span>
          {/* Groot scherm: naar Meer, zoals het menuknopje van het oude menu. */}
          <Link href="/meer" className="bb-rond bb-meer" aria-label="Menu en meer" title="Menu en meer">
            <IcoonMenu className="size-full" />
          </Link>
          {/* Telefoon: opent de vier knoppen en Meer. */}
          <button
            ref={menuknop}
            type="button"
            className="bb-rond bb-menuknop"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls={paneelId}
            onClick={() => zetOpen((o) => !o)}
          >
            <IcoonMenu className="size-full" />
          </button>
          <Link href="/profiel" className="bb-rond bb-instellingen" aria-label="Instellingen" title="Instellingen">
            <IcoonTandwiel className="size-full" />
          </Link>
        </div>
      </div>

      <nav id={paneelId} className="bb-paneel" aria-label="Menu" hidden={!open}>
        <ul>
          {knoppen.map(({ href, label, Icoon, huidig }) => (
            <li key={href}>
              <Link href={href} className="bb-knop zp-titel" aria-current={huidig ? "page" : undefined} onClick={sluit}>
                <Icoon className="bb-knop-icoon" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
          <li className="bb-paneel-meer">
            <Link href="/meer" className="bb-knop bb-knop-breed zp-titel" onClick={sluit}>
              <IcoonMenu className="bb-knop-icoon" />
              <span>Meer</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
