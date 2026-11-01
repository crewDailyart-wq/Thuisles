/**
 * Voorwerpen voor de lessen "Getallenlijn" (Squla groep 3). De lampjes van de
 * lichtslinger zijn er in twee kleuren, omdat een vraag over het rode lampje
 * gaat ("Welk getal hoort bij het rode lampje?"). De andere dingen (ster,
 * diamant, planeet, raketje, ufo …) staan al in een ander lijstbestand.
 */
import type { Voorwerp } from "./soort";

export const GETALLENLIJN: Voorwerp[] = [
  {
    naam: "slingerlampje-geel",
    titel: "Geel lampje van een lichtslinger",
    groep: "feest",
    onderwerp: "one round yellow light bulb from a string of party lights, with a small grey cap on top, hanging down",
    schets: `<rect class="r" x="84" y="22" width="32" height="30" rx="6" fill="#c9d3e6"/><circle class="r" cx="100" cy="112" r="62" fill="#ffd84a"/>`,
  },
  {
    naam: "slingerlampje-rood",
    titel: "Rood lampje van een lichtslinger",
    groep: "feest",
    onderwerp: "one round red light bulb from a string of party lights, with a small grey cap on top, hanging down",
    schets: `<rect class="r" x="84" y="22" width="32" height="30" rx="6" fill="#c9d3e6"/><circle class="r" cx="100" cy="112" r="62" fill="#f0525f"/>`,
  },
];
