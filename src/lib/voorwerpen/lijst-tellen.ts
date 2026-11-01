/**
 * Voorwerpen voor de lessen "Tellen" (Squla groep 3). De meeste dingen die
 * deze lessen tellen, staan al in een ander lijstbestand (raketje, ster, ufo,
 * bus, huis …) en worden daar vandaan gebruikt. Hier alleen wat nog ontbrak.
 */
import type { Voorwerp } from "./soort";

export const TELLEN: Voorwerp[] = [
  {
    naam: "citroen",
    titel: "Citroen",
    groep: "fruit",
    onderwerp: "a yellow lemon lying on its side, with one small green leaf",
    schets: `<path class="r" d="M22 108 q10 -22 26 -32 q52 -34 104 0 q16 10 26 32 q-10 22 -26 32 q-52 34 -104 0 q-16 -10 -26 -32z" fill="#ffe14a"/><path class="r" d="M112 70 q22 -24 46 -12 q-20 22 -46 12z" fill="#4fbf5a"/>`,
  },
  {
    naam: "aardbei",
    titel: "Aardbei",
    groep: "fruit",
    onderwerp: "a red strawberry with small yellow seeds and a green leafy top",
    schets: `<path class="r" d="M100 180 c-40 -14 -74 -64 -64 -104 c8 -26 44 -26 64 -14 c20 -12 56 -12 64 14 c10 40 -24 90 -64 104z" fill="#e8454f"/><g fill="#ffe27a"><ellipse cx="70" cy="96" rx="4" ry="6"/><ellipse cx="100" cy="92" rx="4" ry="6"/><ellipse cx="130" cy="96" rx="4" ry="6"/><ellipse cx="84" cy="122" rx="4" ry="6"/><ellipse cx="116" cy="122" rx="4" ry="6"/><ellipse cx="100" cy="150" rx="4" ry="6"/></g><path class="r" d="M100 62 l-30 -16 l20 -2 l-6 -18 l16 12 l16 -12 l-6 18 l20 2z" fill="#4fbf5a"/>`,
  },
];
