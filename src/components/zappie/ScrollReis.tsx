"use client";

/**
 * De reis van de ruimte naar de kust, terwijl je naar beneden scrollt.
 *
 * Gewoon scrollen blijft gewoon scrollen: niets neemt het scrollen over en er
 * rijdt geen camera vanzelf. Alleen de achtergrond reageert, en die volgt de
 * plek van de secties op de pagina (niet een percentage van de hele hoogte),
 * zodat het ook klopt als alles op telefoon onder elkaar staat:
 *
 * - afdaling: van boven tot de vakken in beeld zijn. De ruimtefoto zoomt iets
 *   in en de lucht wordt blauwer. (`reisStand.positie` werd ook gelezen door de
 *   draaiende aarde; die is op verzoek van de eigenaar weggehaald.)
 * - wolken: het sterkst als de wolkenband midden in beeld staat;
 * - land: na de wolken komt de kust tevoorschijn, helemaal bij het atelier.
 *
 * Omhoog scrollen speelt dezelfde reis terug. Bij "minder beweging" (apparaat
 * of de knop hieronder) zoomt en schuift er niets meer; de kust verschijnt dan
 * alleen door rustig over te vloeien.
 */

import { useEffect, useState } from "react";
import { Illustratie } from "@/components/zappie/reis/Illustratie";
import { reisStand, useBewegingsstand, zetOmgevingRustig } from "@/components/zappie/reis/beweging";

const begrens = (n: number) => Math.max(0, Math.min(1, n));
const glad = (n: number) => {
  const t = begrens(n);
  return t * t * (3 - 2 * t);
};

export function ScrollReis() {
  const stand = useBewegingsstand();
  const rustig = stand !== "aan";
  /* De kust achter de reis pas laden als hij bijna nodig is. */
  const [kustNodig, zetKustNodig] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.zp[data-start="ja"]');
    const leren = document.getElementById("vrij-oefenen");
    const wolken = document.querySelector<HTMLElement>(".zs-wolken");
    const atelier = document.getElementById("zappies-atelier");
    if (!root || !leren || !wolken || !atelier) return;
    root.dataset.beweging = rustig ? "rustig" : "aan";

    /* Waar de secties staan, in pixels vanaf de bovenkant van de pagina. */
    let plek = { leren: 1, wolken: 1, atelier: 1 };
    let frame = 0;

    const teken = () => {
      frame = 0;
      const h = window.innerHeight;
      const y = window.scrollY;
      const kijkpunt = y + h * 0.6;
      const afdaling = glad(y / Math.max(1, plek.leren - h * 0.2));
      const wolk = glad(1 - Math.abs(kijkpunt - plek.wolken) / (h * 0.85));
      const land = glad((kijkpunt - plek.wolken) / Math.max(1, plek.atelier + h * 0.25 - plek.wolken));
      if (land > 0 || afdaling > 0.6) zetKustNodig(true);

      reisStand.positie = rustig ? 0 : afdaling;
      root.style.setProperty("--zr-scroll", (rustig ? 0 : afdaling).toFixed(4));
      root.style.setProperty("--zr-wolken", (rustig ? 0 : wolk).toFixed(4));
      root.style.setProperty("--zr-land", land.toFixed(4));
      root.dataset.reisfase = land > 0.5 ? "kust" : afdaling > 0.35 ? "atmosfeer" : "ruimte";
      /* Een donkere band achter het menu zodra de pagina onder het menu door schuift. */
      root.dataset.gescrold = y > 24 ? "ja" : "nee";
    };
    const plan = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(teken);
    };
    const meet = () => {
      const y = window.scrollY;
      const top = (el: HTMLElement) => el.getBoundingClientRect().top + y;
      plek = {
        leren: top(leren),
        wolken: top(wolken) + wolken.offsetHeight / 2,
        atelier: top(atelier),
      };
      plan();
    };

    /* Opnieuw meten als de pagina van maat verandert: beelden die laden, draaien, zoomen. */
    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(root);
    meet();
    window.addEventListener("scroll", plan, { passive: true });
    window.addEventListener("resize", meet);
    document.addEventListener("visibilitychange", plan);
    return () => {
      cancelAnimationFrame(frame);
      waarnemer.disconnect();
      window.removeEventListener("scroll", plan);
      window.removeEventListener("resize", meet);
      document.removeEventListener("visibilitychange", plan);
      for (const naam of ["--zr-scroll", "--zr-wolken", "--zr-land"]) root.style.removeProperty(naam);
      delete root.dataset.reisfase;
      delete root.dataset.beweging;
      delete root.dataset.gescrold;
      reisStand.positie = 0;
    };
  }, [rustig]);

  return (
    <>
      <div className="zs-camera" aria-hidden="true">
        <div className="zs-lucht" />
        <div className="zs-camera-kust">{kustNodig && <Illustratie naam="kust" sizes="100vw" />}</div>
        <div className="zs-mist zs-mist-links" />
        <div className="zs-mist zs-mist-rechts" />
      </div>
      <a href="#vrij-oefenen" className="zs-overslaan">
        Direct naar de vakken
      </a>
    </>
  );
}

/**
 * Beweging uit of aan: zet de bewegende omgeving stil (CSS en canvas). Staat in
 * de ruimte-scène bovenaan, niet zwevend over de pagina, zodat hij nooit een
 * tegel of knop afdekt. Staat het apparaat al op minder beweging, dan valt er
 * niets aan of uit te zetten en is hij er niet.
 */
export function Bewegingsknop() {
  const stand = useBewegingsstand();
  if (stand === "systeem") return null;
  const rustig = stand === "rustig";
  return (
    <button type="button" className="zs-bewegingsknop" onClick={() => zetOmgevingRustig(!rustig)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {rustig ? <path d="m8 5 11 7-11 7z" /> : <path d="M7 5h3v14H7zm7 0h3v14h-3z" />}
      </svg>
      <span>{rustig ? "Beweging aan" : "Beweging uit"}</span>
    </button>
  );
}
