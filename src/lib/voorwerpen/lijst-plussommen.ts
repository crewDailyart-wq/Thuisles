/**
 * Voorwerpen van de lessen "Plussommen" naar Squla (31 oktober 2026): de
 * bakkerij en de disco. Koekje, taart, pakje en bezorgbus bestaan al in
 * andere lijsten en worden daar vandaan gebruikt. Rekendingen (stippen, kaartjes met een getal, platen met een
 * getal) blijven in code getekend.
 */
import type { Voorwerp } from "./soort";

export const PLUSSOMMEN: Voorwerp[] = [
  {
    naam: "broodje",
    titel: "Broodje",
    groep: "eten",
    onderwerp: "a small round light-brown bread roll with three diagonal cuts on top, seen from the side",
    schets: `<ellipse class="r" cx="100" cy="112" rx="72" ry="50" fill="#f2c27b"/><path class="r" d="M66 92 l14 36 M94 86 l14 40 M122 92 l12 32" fill="none"/>`,
  },
  {
    naam: "brood",
    titel: "Wit brood",
    groep: "eten",
    onderwerp: "a whole light-brown loaf of white bread with a rounded top, seen from the side",
    schets: `<path class="r" d="M30 150 L30 100 C30 40 170 40 170 100 L170 150 Z" fill="#f0c98a"/><path class="r" d="M62 74 l14 22 M94 66 l14 24 M126 74 l14 22" fill="none"/>`,
  },
  {
    naam: "bruin-brood",
    titel: "Bruin brood",
    groep: "eten",
    onderwerp: "a whole dark-brown loaf of wholemeal bread with a rounded top, seen from the side",
    schets: `<path class="r" d="M30 150 L30 100 C30 40 170 40 170 100 L170 150 Z" fill="#a86a3a"/><path class="r" d="M62 74 l14 22 M94 66 l14 24 M126 74 l14 22" fill="none"/>`,
  },
  {
    naam: "stokbrood",
    titel: "Stokbrood",
    groep: "eten",
    onderwerp: "a long golden baguette lying diagonally, with diagonal cuts on top",
    schets: `<ellipse class="r" cx="100" cy="100" rx="88" ry="26" transform="rotate(-40 100 100)" fill="#e9b467"/><path class="r" d="M58 128 l14 10 M84 104 l14 10 M110 80 l14 10" fill="none"/>`,
  },
  {
    naam: "cupcake",
    titel: "Cupcake",
    groep: "eten",
    onderwerp: "a cupcake in a light-blue paper cup with white frosting and a red cherry on top, seen from the side",
    schets: `<path class="r" d="M50 104 L150 104 L136 168 L64 168 Z" fill="#7cc6ff"/><path class="r" d="M42 106 a28 28 0 0 1 40 -30 a30 30 0 0 1 52 2 a26 26 0 0 1 24 28 z" fill="#fff0f6"/><circle class="r" cx="100" cy="52" r="12" fill="#e23b4c"/>`,
  },
  {
    naam: "krentenbol",
    titel: "Krentenbol",
    groep: "eten",
    onderwerp: "a round shiny brown currant bun with dark raisins, flat bottom, seen from the side",
    schets: `<path class="r" d="M28 150 C24 30 176 30 172 150 Z" fill="#c8792f"/><ellipse cx="62" cy="120" rx="8" ry="6" fill="#3a1d0b"/><ellipse cx="100" cy="88" rx="8" ry="6" fill="#3a1d0b"/><ellipse cx="136" cy="112" rx="8" ry="6" fill="#3a1d0b"/><ellipse cx="88" cy="132" rx="8" ry="6" fill="#3a1d0b"/><ellipse cx="124" cy="140" rx="8" ry="6" fill="#3a1d0b"/>`,
  },
  {
    naam: "croissant",
    titel: "Croissant",
    groep: "eten",
    onderwerp: "a golden crescent-shaped croissant, seen from the side",
    schets: `<path class="r" d="M20 130 Q100 10 180 130 Q100 80 20 130 Z" fill="#f0b85e"/><path class="r" d="M66 76 l4 34 M100 62 l0 34 M134 76 l-4 34" fill="none"/>`,
  },
  {
    naam: "donut",
    titel: "Donut",
    groep: "eten",
    onderwerp: "a round donut with pink glaze and colourful sprinkles, seen from above",
    schets: `<circle class="r" cx="100" cy="100" r="72" fill="#e3a55e"/><circle cx="100" cy="100" r="58" fill="#ff8fbf"/><circle class="r" cx="100" cy="100" r="22" fill="#1d2340"/><rect x="62" y="64" width="6" height="14" fill="#ffffff"/><rect x="126" y="70" width="6" height="14" fill="#ffe066"/><rect x="140" y="112" width="6" height="14" fill="#7cc6ff"/><rect x="74" y="126" width="6" height="14" fill="#ffe066"/>`,
  },
  {
    naam: "discobal",
    titel: "Discobal",
    groep: "feest",
    onderwerp: "a silver mirror disco ball with small square mirror tiles",
    schets: `<circle class="r" cx="100" cy="100" r="78" fill="#c8d3e6"/><path d="M22 100 h156 M30 62 h140 M30 138 h140 M100 22 v156 M62 30 v140 M138 30 v140" stroke="#8fa0c8" stroke-width="5" fill="none"/>`,
  },
  {
    naam: "luidspreker",
    titel: "Luidspreker",
    groep: "huis",
    onderwerp: "a tall dark-grey loudspeaker box with two round speakers, seen from the front",
    schets: `<rect class="r" x="50" y="10" width="100" height="180" rx="12" fill="#3a3f5c"/><circle class="r" cx="100" cy="58" r="28" fill="#1b1f33"/><circle class="r" cx="100" cy="134" r="38" fill="#1b1f33"/>`,
  },
  {
    naam: "draaitafel",
    titel: "Draaitafel",
    groep: "huis",
    onderwerp: "a purple DJ table with a black turntable on top, seen from the front",
    schets: `<rect class="r" x="10" y="90" width="180" height="70" rx="12" fill="#8a5cf0"/><ellipse class="r" cx="100" cy="88" rx="60" ry="14" fill="#2b2f45"/><ellipse cx="100" cy="88" rx="12" ry="4" fill="#ffb347"/>`,
  },
];
