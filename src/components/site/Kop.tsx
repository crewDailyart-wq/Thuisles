"use client";

/**
 * De kop van de openbare site: logo, menu, Inloggen en de hoofdknop.
 *
 * Op een smal scherm klapt het menu uit onder een knop. Bij scrollen krijgt de
 * kop een donkere glazen achtergrond, zodat hij leesbaar blijft boven de
 * inhoud.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IcoonKruis, IcoonMenu, LogoSter } from "@/components/site/Iconen";
import { MERKNAAM } from "@/lib/merk";

export type Menupunt = { href: string; label: string };

export function Logo() {
  return (
    <Link href="/" className="st-logo" aria-label={`${MERKNAAM}, naar de homepagina`}>
      <span className="st-logo-woord">
        {MERKNAAM}
        <LogoSter className="st-logo-ster" />
      </span>
    </Link>
  );
}

export function Kop({ menu }: { menu: Menupunt[] }) {
  const pad = usePathname();
  const [gescrold, zetGescrold] = useState(false);
  const [open, zetOpen] = useState(false);
  const [vorigPad, zetVorigPad] = useState(pad);

  /* Naar een andere pagina: het uitklapmenu gaat dicht. */
  if (pad !== vorigPad) {
    zetVorigPad(pad);
    zetOpen(false);
  }

  useEffect(() => {
    const kijk = () => zetGescrold(window.scrollY > 8);
    kijk();
    window.addEventListener("scroll", kijk, { passive: true });
    return () => window.removeEventListener("scroll", kijk);
  }, []);

  useEffect(() => {
    if (!open) return;
    const toets = (e: KeyboardEvent) => e.key === "Escape" && zetOpen(false);
    window.addEventListener("keydown", toets);
    return () => window.removeEventListener("keydown", toets);
  }, [open]);

  const actief = (href: string) => !href.includes("#") && href !== "/" && pad.startsWith(href);

  return (
    <header className="st-kop" data-gescrold={gescrold || open ? "ja" : "nee"}>
      <div className="st-binnen st-kop-binnen">
        <Logo />
        <nav className="st-menu" aria-label="Hoofdmenu">
          <ul>
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} aria-current={actief(m.href) ? "page" : undefined}>
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="st-kop-acties">
          <Link href="/ouder/overzicht" prefetch={false} className="st-inloggen">
            Inloggen
          </Link>
          <Link href="/ouder/overzicht" prefetch={false} className="st-knop st-knop-goud st-knop-klein">
            Begin gratis
          </Link>
          <button
            type="button"
            className="st-menuknop"
            aria-expanded={open}
            aria-controls="st-uitklapmenu"
            aria-label={open ? "Menu sluiten" : "Menu openen"}
            onClick={() => zetOpen((o) => !o)}
          >
            {open ? <IcoonKruis /> : <IcoonMenu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="st-uitklapmenu" className="st-uitklap" aria-label="Hoofdmenu">
          <ul>
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} onClick={() => zetOpen(false)}>
                  {m.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/ouder/overzicht" prefetch={false} onClick={() => zetOpen(false)}>
                Inloggen
              </Link>
            </li>
          </ul>
          <Link href="/ouder/overzicht" prefetch={false} className="st-knop st-knop-goud" onClick={() => zetOpen(false)}>
            Begin gratis
          </Link>
        </nav>
      )}
    </header>
  );
}
