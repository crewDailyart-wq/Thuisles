"use client";

/**
 * Een oefensessie bewaren, zodat een kind verdergaat waar het gebleven was.
 *
 * ---------------------------------------------------------------------------
 * Waarom de vragen zelf worden bewaard
 * ---------------------------------------------------------------------------
 * De vragen van een sessie worden bij elk bezoek opnieuw willekeurig getrokken
 * uit alles wat er bij het leerdoel staat. Zou hier alleen "ik was bij vraag 4"
 * worden onthouden, dan kwam het kind terug in een andere serie en klopte dat
 * getal nergens meer op.
 *
 * Daarom staat de hele serie erin, in volgorde. Dat heeft nog een voordeel: een
 * sessie verandert niet meer onder het kind vandaan als er intussen in het
 * beheer een vraag wordt aangepast of weggehaald.
 *
 * ---------------------------------------------------------------------------
 * Waarom in de browser en niet in de database
 * ---------------------------------------------------------------------------
 * Dit is geen voortgang die de ouder moet zien — dat zijn de antwoorden, en die
 * gaan aan het eind van de ronde gewoon naar de database. Dit is alleen "waar
 * was ik". Dat hoort bij het apparaat waarop je bezig was.
 *
 * Gevolg om te weten: begin je op de tablet en ga je verder op de laptop, dan
 * begin je daar opnieuw. Verdwijnt dat een keer, dan is er niets kapot: je
 * begint dan gewoon aan een nieuwe serie.
 */

import type { RondeAntwoord } from "@/app/oefenacties";
import type { OefenVraag } from "@/lib/vraagtypes";

const VOORVOEGSEL = "thuisles-oefensessie";

/**
 * Hoe lang een halve sessie blijft staan.
 *
 * Een week. Kom je na de zomervakantie terug op een som waar je halverwege in
 * bleef steken, dan is verdergaan raarder dan opnieuw beginnen.
 */
const HOUDBAAR_MS = 7 * 24 * 60 * 60 * 1000;

export type BewaardeSessie = {
  /** Hoort bij de sleutels die per goed antwoord zijn uitbetaald. */
  rondeId: string;
  /** De vragen van deze sessie, in volgorde. */
  vragen: OefenVraag[];
  /** De antwoorden die al gegeven zijn, in dezelfde volgorde. */
  gelogd: RondeAntwoord[];
  /** Bij welke vraag het kind was. */
  index: number;
  bewaardOp: number;
};

/**
 * De plek waar deze sessie onder hoort.
 *
 * Het kind-id zit erin omdat er meerdere kinderen op hetzelfde apparaat kunnen
 * oefenen; zonder dat zou het ene kind in de halve sessie van het andere
 * terechtkomen. Het pad met de zoekreeks onderscheidt de oefeningen onderling,
 * inclusief `?leerdoel=` en `?herhaal=1`.
 */
export function sessieSleutel(kindId: string, padMetZoek: string): string {
  return `${VOORVOEGSEL}:${kindId}:${padMetZoek}`;
}

/**
 * De bewaarde sessie, of `null`.
 *
 * Geeft ook `null` bij een sessie die af is, te oud is, of niet meer te lezen
 * valt. In al die gevallen hoort er gewoon een nieuwe serie te beginnen; een
 * halve sessie terughalen die nergens meer op slaat is erger dan opnieuw
 * beginnen.
 */
export function leesSessie(sleutel: string): BewaardeSessie | null {
  try {
    const rauw = window.localStorage.getItem(sleutel);
    if (!rauw) return null;

    const sessie = JSON.parse(rauw) as BewaardeSessie;
    if (!Array.isArray(sessie.vragen) || sessie.vragen.length === 0) return null;
    if (!Array.isArray(sessie.gelogd)) return null;
    if (typeof sessie.index !== "number") return null;

    // Af: dan hoort er een nieuwe serie te komen.
    if (sessie.gelogd.length >= sessie.vragen.length) {
      wisSessie(sleutel);
      return null;
    }

    if (Date.now() - (sessie.bewaardOp ?? 0) > HOUDBAAR_MS) {
      wisSessie(sleutel);
      return null;
    }

    return sessie;
  } catch {
    /* Privéstand, volle opslag of oude gegevens: dan gewoon opnieuw beginnen. */
    return null;
  }
}

export function bewaarSessie(sleutel: string, sessie: Omit<BewaardeSessie, "bewaardOp">): void {
  try {
    window.localStorage.setItem(
      sleutel,
      JSON.stringify({ ...sessie, bewaardOp: Date.now() } satisfies BewaardeSessie),
    );
  } catch {
    /*
      Opslag vol of geblokkeerd. Dan blijft alles werken zoals het altijd deed:
      er wordt alleen niets bewaard, en een volgende keer begint het kind een
      nieuwe serie.
    */
  }
}

export function wisSessie(sleutel: string): void {
  try {
    window.localStorage.removeItem(sleutel);
  } catch {
    /* Niets aan te doen; de houdbaarheidsdatum ruimt hem later alsnog op. */
  }
}
