"use client";

/**
 * Vos naast een vak, binnen het witte kaartje van de oefening.
 *
 * Twee dingen die elk oefeningstype met een eigen vak nodig heeft:
 *
 *   `useVosplek`   waar hij mag staan, in gemeten pixels;
 *   `Vosbeeld`     de tekening zelf, uit de afbeeldingen van het sjabloon.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit gemeten wordt en niet vastligt
 * ---------------------------------------------------------------------------
 * Zijn hoge plek hangt aan de ónderkant van het vak, en hoe hoog dat vak is
 * hangt af van de inhoud — hoeveel blokken, hoeveel plaatjes — en van de
 * breedte van het scherm. Dat valt niet in een vast getal te vangen.
 *
 * `hoog` is de afstand van de onderkant van het vak tot de onderkant van het
 * witte kaartje; `zijkant` is de afstand van de rand van het kaartje tot de
 * strook die naast het vak voor hem is vrijgehouden. Hij staat `absolute`
 * binnen dat kaartje — het dichtstbijzijnde vlak met een eigen plaatsing — dus
 * hij kan er nooit buiten vallen.
 */

import { useEffect, useState, type RefObject } from "react";
import type { Voshoudingen } from "@/components/oefenen/Plaatjesraster";

export type { Voshoudingen };

export type Punt = { x: number; y: number };

export type Vosplek = {
  hoog: number;
  /** De afstand tot de rand van het kaartje aan de kant waar hij staat. */
  zijkant: number;
  /**
   * Waar zijn handen zijn, in procenten van de BREEDTE van het vak, gerekend
   * vanaf de linkerbovenhoek daarvan. Negatief dus: hij staat ernaast.
   *
   * Hiermee kan een blokje of plaatje precies bij hém vandaan komen in plaats
   * van ergens in de buurt — en juist dat maakt zichtbaar dat hij het neerlegt.
   * `null` zolang zijn plaatje nog laadt en er niets te meten valt.
   */
  handen: Punt | null;
};

/**
 * Waar zijn handen zitten in zijn plaatje, als deel van dat plaatje.
 *
 * `x` telt vanaf de kant waar het vak is: staat hij rechts van het vak, dan is
 * dat zijn linkerkant. `y` telt vanaf zijn voeten omhoog.
 */
const HANDEN_IN_PLAATJE = { x: 0.22, y: 0.18 };

/**
 * De plek van Vos opmeten, en blijven volgen.
 *
 * Er wordt opnieuw gemeten als het vak of het kaartje van maat verandert, als
 * het venster verandert, en zodra zijn plaatje binnen is — zolang dat laadt is
 * zijn hoogte nul en klopt er niets.
 */
export function useVosplek(
  vakRef: RefObject<HTMLDivElement | null>,
  buitenRef: RefObject<HTMLDivElement | null>,
  vosRef: RefObject<HTMLDivElement | null>,
  vlakRef: RefObject<HTMLDivElement | null>,
  actief: boolean,
): Vosplek | null {
  const [plek, setPlek] = useState<Vosplek | null>(null);

  useEffect(() => {
    const vak = vakRef.current;
    const buiten = buitenRef.current;
    if (!vak || !buiten || !actief) return;

    function meet() {
      if (!vak || !buiten) return;
      const kaart = buiten.offsetParent as HTMLElement | null;
      if (!kaart) return;
      const hoog = Math.max(0, kaart.clientHeight - (vak.offsetTop + vak.offsetHeight));
      const zijkant = Math.max(
        0,
        kaart.clientWidth - (buiten.offsetLeft + buiten.offsetWidth),
      );

      /*
        En waar zijn handen dan hangen, omgerekend naar het stelsel van het vak.

        Niet geschat maar uitgerekend uit wat er staat: op zijn hoge plek staan
        zijn voeten op de onderkant van het vak, en zijn handen zitten
        rechtsonder in zijn plaatje. Daarmee ligt het punt vast.
      */
      const vlak = vlakRef.current;
      const vosvak = vosRef.current;
      let handen: Punt | null = null;
      if (vlak && vosvak) {
        const r = vlak.getBoundingClientRect();
        const v = vosvak.getBoundingClientRect();
        const k = vak.getBoundingClientRect();
        if (r.width > 0 && v.height > 0) {
          /*
            Hij staat rechts van het vak, tegen de rechterrand van de strook.
            Zijn handen zitten aan de kant die naar het vak wijst, dus links in
            zijn plaatje — daarom wordt er vanaf die rand teruggerekend.
          */
          const x =
            buiten.getBoundingClientRect().right - v.width * (1 - HANDEN_IN_PLAATJE.x);
          const y = k.bottom - v.height * HANDEN_IN_PLAATJE.y;
          handen = { x: ((x - r.left) / r.width) * 100, y: ((y - r.top) / r.width) * 100 };
        }
      }
      /*
        Alleen bijwerken als het écht anders is. Zonder die vergelijking geeft
        elke meting een nieuw object, tekent React opnieuw, merkt de
        `ResizeObserver` dat als een wijziging en meet hij weer — een molen die
        niet meer stopt en de pagina laat vastlopen.
      */
      setPlek((vorig) =>
        vorig &&
        vorig.hoog === hoog &&
        vorig.zijkant === zijkant &&
        vorig.handen?.x === handen?.x &&
        vorig.handen?.y === handen?.y
          ? vorig
          : { hoog, zijkant, handen },
      );
    }

    meet();

    const beeld = vosRef.current?.querySelector("img") ?? null;
    if (beeld && !beeld.complete) beeld.addEventListener("load", meet);

    const kijker = new ResizeObserver(meet);
    kijker.observe(vak);
    const kaart = buiten.offsetParent;
    if (kaart instanceof HTMLElement) kijker.observe(kaart);
    if (vosRef.current) kijker.observe(vosRef.current);
    window.addEventListener("resize", meet);

    return () => {
      kijker.disconnect();
      if (beeld) beeld.removeEventListener("load", meet);
      window.removeEventListener("resize", meet);
    };
  }, [vakRef, buitenRef, vosRef, vlakRef, actief]);

  return plek;
}

/**
 * De tekening van Vos, uit de afbeeldingen van het sjabloon.
 *
 * Zonder tekstballon: deze kinderen lezen nog nauwelijks. Wat hij bedoelt,
 * zegt hij met beweging.
 *
 * Ontbreekt een houding, dan wordt de vangende genomen — liever dezelfde vos in
 * elke stand dan geen vos. Is er helemaal geen afbeelding ingesteld, dan staat
 * er ook niets.
 *
 * Alleen de tekening; waar hij staat bepaalt degene die hem plaatst.
 */
export function Vosbeeld({
  houdingen,
  stand,
  stil = false,
}: {
  houdingen: Voshoudingen;
  stand: "vangend" | "wachtend" | "blij";
  /**
   * Helemaal stil blijven staan.
   *
   * Voor de plekken waar hij naast de opgave staat terwijl het kind nadenkt.
   * Een wippende vos trekt daar de aandacht weg van de som; hij hoort er dan
   * gewoon te staan.
   */
  stil?: boolean;
}) {
  const bestand =
    (stand === "blij" ? houdingen.blij : stand === "wachtend" ? houdingen.wachtend : null) ??
    houdingen.vangend;

  if (!bestand) return null;

  const beweging = stil
    ? ""
    : stand === "blij"
      ? "motion-safe:animate-vos-springt"
      : "motion-safe:animate-vos-trappel";

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/vragen/${bestand}`}
      alt=""
      draggable={false}
      className={`h-auto w-full select-none ${beweging}`}
    />
  );
}
