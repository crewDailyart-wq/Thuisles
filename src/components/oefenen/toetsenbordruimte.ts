"use client";

/**
 * De oefening in beeld houden als het toetsenbord van het apparaat opengaat.
 *
 * Elk oefeningstype waar een getal getypt wordt, gebruikt hier hetzelfde
 * gedrag: het kind tikt op het invulvak, de steen of de deur, het
 * systeemtoetsenbord schuift omhoog over de onderste helft van het scherm, en
 * de oefening schuift precies genoeg mee dat het veld én de knop Controleer
 * eronder vrij blijven. Zie HARDE REGEL 5 in CLAUDE.md.
 *
 * ---------------------------------------------------------------------------
 * Waarom `visualViewport`
 * ---------------------------------------------------------------------------
 * Als dat toetsenbord opengaat, blijft de pagina even hoog: hij wordt er alleen
 * door bedekt. `window.innerHeight` merkt daar niets van, `visualViewport` wel
 * — dat is het stuk dat je écht ziet. Het verschil tussen die twee is precies
 * wat er weggeschoven moet worden. Kent een browser `visualViewport` niet, dan
 * is het hele venster zichtbaar en klopt dezelfde rekensom ook.
 *
 * ---------------------------------------------------------------------------
 * Er moet ook ruimte zijn om te schuiven
 * ---------------------------------------------------------------------------
 * Alleen schuiven is niet genoeg. Een oefening past meestal net op het scherm,
 * en dan is er onderaan niets om naartoe te schuiven: de pagina zit al aan zijn
 * eind en het veld blijft onder het toetsenbord staan. Daarom komt er zolang
 * het veld de aandacht heeft een stuk lucht onder de pagina, precies zoveel als
 * er tekortkomt. Zodra het kind ergens anders tikt gaat die lucht er weer af.
 *
 * Het schuiven gebeurt in één keer en niet vloeiend. Een vloeiende beweging
 * wordt door een deel van de apparaten stilletjes overgeslagen — onder andere
 * bij de instelling "verminder beweging" — en dan gebeurt er niets.
 */

import { useCallback, useEffect, useRef } from "react";

/**
 * Hoeveel ruimte er onder het veld vrij moet blijven als de knop niet gevonden
 * wordt: ruim drie centimeter, de hoogte van de knop Controleer met marge.
 *
 * Normaal wordt de knop zelf opgemeten. Dat moet ook wel: bij de stapstenen
 * en bij de straat staat het invulveld midden in een tekening, en dan ligt de
 * knop veel verder naar beneden dan een vaste afstand doet vermoeden. Met een
 * vaste 104 pixels bleef de knop daar onder het toetsenbord staan.
 */
const KNOPRUIMTE = 104;

/** Het merkteken op de knop Controleer; zie het antwoordscherm. */
const KNOPMERK = "[data-controleer]";

/** Een beetje lucht, zodat het veld niet tegen de rand van het toetsenbord plakt. */
const LUCHT = 12;

/** Wanneer er opnieuw gekeken wordt, in milliseconden na het tikken. */
const MOMENTEN = [150, 400, 750];

/**
 * De lucht onder de pagina zetten of weer weghalen.
 *
 * Op `document.body`, want de knop Controleer staat buiten het invulveld en er
 * moet ónder die knop ruimte bij. Wat er stond wordt onthouden en netjes
 * teruggezet.
 */
function zetOnderruimte(bewaar: { vorige: string | null }, px: number | null) {
  const body = document.body;
  if (px === null) {
    if (bewaar.vorige !== null) {
      body.style.paddingBottom = bewaar.vorige;
      bewaar.vorige = null;
    }
    return;
  }
  if (bewaar.vorige === null) bewaar.vorige = body.style.paddingBottom;
  body.style.paddingBottom = `${px}px`;
}

/**
 * Geeft twee handlers terug om aan een invoerveld te hangen:
 *
 *   onFocus={(e) => bijAandacht(e.currentTarget)}
 *   onBlur={bijWeggaan}
 *
 * Zonder open toetsenbord is er niets te kort en gebeurt er niets; op een
 * laptop komt dit dus wel langs maar doet het nooit iets.
 */
export function useInBeeld() {
  const bewaar = useRef<{ vorige: string | null }>({ vorige: null });
  /** Het veld dat nu de aandacht heeft; nodig als het toetsenbord later pas opengaat. */
  const volgen = useRef<HTMLElement | null>(null);

  const houdInBeeld = useCallback((el: HTMLElement | null) => {
    if (!el) return;

    const zicht = window.visualViewport;
    const bovenkant = zicht ? zicht.offsetTop : 0;
    const hoogte = zicht ? zicht.height : window.innerHeight;

    const doos = el.getBoundingClientRect();

    /*
      Tot waar het scherm vrij moet blijven: tot onder de knop Controleer, of —
      als die er niet is — tot een knoophoogte onder het veld.
    */
    const knop = document.querySelector<HTMLElement>(KNOPMERK)?.getBoundingClientRect();
    const onderkant =
      knop && knop.bottom > doos.bottom ? knop.bottom + LUCHT : doos.bottom + KNOPRUIMTE;

    const tekort = onderkant - (bovenkant + hoogte);
    if (tekort <= 0) return;

    /*
      Eerst kijken of er onderaan wel genoeg pagina is om naartoe te schuiven,
      en zo niet: net zoveel lucht bijzetten. Daarna pas schuiven — het opvragen
      van de hoogte dwingt de browser om die lucht meteen mee te rekenen.
    */
    /*
      Nooit zover schuiven dat het veld zelf boven het scherm uit loopt. Passen
      het veld en de knop samen niet in wat er zichtbaar is — een heel klein
      scherm in de breedte gedraaid — dan gaat het veld voor.
    */
    const ruimteBoven = Math.max(0, doos.top - bovenkant - LUCHT);
    const teSchuiven = Math.min(tekort + LUCHT, ruimteBoven);
    if (teSchuiven <= 0) return;
    const onder = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    if (onder < teSchuiven) zetOnderruimte(bewaar.current, teSchuiven - onder + LUCHT);
    void document.documentElement.scrollHeight;

    window.scrollBy({ top: teSchuiven, behavior: "auto" });
  }, []);

  /*
    Meekijken met het toetsenbord zolang een veld de aandacht heeft: dat gaat
    ook open en dicht zonder dat er opnieuw getikt wordt — denk aan een tablet
    die gedraaid wordt.
  */
  useEffect(() => {
    const zicht = window.visualViewport;
    if (!zicht) return;

    const kijk = () => {
      if (volgen.current && document.activeElement === volgen.current) {
        houdInBeeld(volgen.current);
      }
    };
    zicht.addEventListener("resize", kijk);
    return () => zicht.removeEventListener("resize", kijk);
  }, [houdInBeeld]);

  /* De lucht hoort nooit achter te blijven als de oefening van het scherm gaat. */
  useEffect(() => {
    const opgeslagen = bewaar.current;
    return () => zetOnderruimte(opgeslagen, null);
  }, []);

  const bijAandacht = useCallback(
    (el: HTMLElement | null) => {
      volgen.current = el;
      /* Het toetsenbord schuift omhoog; pas daarna klopt de maat. */
      for (const ms of MOMENTEN) setTimeout(() => houdInBeeld(el), ms);
    },
    [houdInBeeld],
  );

  const bijWeggaan = useCallback(() => {
    volgen.current = null;
    zetOnderruimte(bewaar.current, null);
  }, []);

  return { bijAandacht, bijWeggaan };
}
