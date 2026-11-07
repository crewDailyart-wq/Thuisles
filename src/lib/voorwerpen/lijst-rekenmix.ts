/**
 * Voorwerpen voor de lessen "Rekenmix" (Squla groep 3, 31 oktober 2026). De
 * meeste dingen (bal, appel, ster, raketje, doos, potlood, huis …) staan al in
 * een ander lijstbestand; hier alleen wat er nog niet was.
 */
import type { Voorwerp } from "./soort";

export const REKENMIX: Voorwerp[] = [
  /* Herstel 7 november 2026 (OVERZICHT-C mix1-2): platte tekeningen recht van voren of van boven, voor "Welke vorm lijkt erop?". */
  { naam: "pizzadoos-plat", titel: "Pizzadoos van boven", groep: "winkel", onderwerp: "a closed square pizza box seen straight from above, flat", schets: `<rect class="r" x="30" y="30" width="140" height="140" rx="10" fill="#d79a62"/>` },
  { naam: "speelblok-plat", titel: "Speelblok van voren", groep: "speelgoed", onderwerp: "one square blue toy block seen straight from the front, with a yellow star", schets: `<rect class="r" x="30" y="30" width="140" height="140" rx="12" fill="#4b8af5"/>` },
  { naam: "doos-plat", titel: "Doos van voren", groep: "winkel", onderwerp: "a square cardboard box seen straight from the front, with a strip of tape", schets: `<rect class="r" x="30" y="30" width="140" height="140" rx="6" fill="#d79a62"/>` },
  { naam: "boek-plat", titel: "Boek van voren", groep: "huis", onderwerp: "a red book seen straight from the front, standing, rectangular cover", schets: `<rect class="r" x="54" y="20" width="96" height="160" rx="8" fill="#e8453c"/>` },
  /* Herstel 7 november 2026 (OVERZICHT-C punt 6): de rode "bal" leek op een verbodsbord; in Rekenmix en Minsommen staat
     nu deze strandbal (in code getekend, stijl B). Het woord in de zinnen blijft "bal". */
  {
    naam: "speelbal",
    titel: "Strandbal",
    groep: "speelgoed",
    onderwerp: "a classic inflatable beach ball with red, white, yellow and blue panels meeting at a small white cap",
    schets: `<circle class="r" cx="100" cy="100" r="80" fill="#fff6e8"/><path class="r" d="M84 64 Q60 40 100 20 A80 80 0 0 1 169 60 Q120 60 84 64z" fill="#e8453c"/><path class="r" d="M84 64 Q70 120 100 180 A80 80 0 0 1 31 140 Q60 100 84 64z" fill="#ffd23f"/><path class="r" d="M84 64 Q120 120 169 140 A80 80 0 0 1 100 180 Q90 120 84 64z" fill="#3f8ff0"/>`,
  },
  {
    naam: "vlaggenlijn",
    titel: "Slinger met vlaggetjes",
    groep: "feest",
    onderwerp: "a short string of party bunting with five small triangular flags in different colors, hanging in a gentle curve",
    schets: `<path class="r" d="M14 50 Q100 96 186 50" fill="none"/><path class="r" d="M22 54 l26 10 l-17 34z" fill="#ff5c6e"/><path class="r" d="M58 68 l28 6 l-12 36z" fill="#ffd93d"/><path class="r" d="M96 76 l28 0 l-14 36z" fill="#5f9dff"/><path class="r" d="M134 72 l28 -6 l-14 36z" fill="#5fd877"/><path class="r" d="M170 62 l24 -12 l-8 36z" fill="#b47bff"/>`,
  },
  {
    naam: "doos-open",
    titel: "Open doos",
    groep: "winkel",
    onderwerp: "one empty open cardboard box with the top flaps folded outward, front view, seen slightly from above",
    schets: `<path class="r" d="M30 84 l-18 -34 h40 l8 34z" fill="#efc796"/><path class="r" d="M170 84 l18 -34 h-40 l-8 34z" fill="#efc796"/><path class="r" d="M30 84 l18 -22 h104 l18 22z" fill="#6e4a2a"/><rect class="r" x="30" y="84" width="140" height="92" rx="6" fill="#d79a62"/>`,
  },
  {
    naam: "kaars",
    titel: "Kaars",
    groep: "huis",
    onderwerp: "one cream-white pillar candle with a small lit yellow flame on top, side view, clearly a candle",
    schets: `<rect class="r" x="70" y="40" width="60" height="140" rx="8" fill="#e8454f"/><path class="r" d="M100 40 v-16" fill="none"/>`,
  },
];
