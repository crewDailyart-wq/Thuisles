/**
 * Voorwerpen van de schattenjacht ("Rekenen met getallen", naar Squla's
 * piratenschat; 31 oktober 2026). Geen piraten, geen papegaai, geen
 * doodshoofden: alleen dingen die je bij een schattenjacht in de ruimte vindt.
 */
import type { Voorwerp } from "./soort";

export const PIRAAT: Voorwerp[] = [
  {
    naam: "schatkaart",
    titel: "Schatkaart",
    groep: "huis",
    onderwerp: "an old paper treasure map with a dotted path and a red cross, no text",
    schets: `<path class="r" d="M30 40 l46 -12 l48 12 l46 -12 v132 l-46 12 l-48 -12 l-46 12z" fill="#f3dfae"/><path d="M50 140 q30 -40 60 -20 q30 20 40 -50" stroke="#8a6a3a" stroke-width="6" stroke-dasharray="10 10" fill="none"/><path d="M138 54 l20 20 M158 54 l-20 20" stroke="#e8454f" stroke-width="8"/>`,
  },
  {
    naam: "goudstuk",
    titel: "Goudstuk",
    groep: "winkel",
    onderwerp: "a round shiny gold coin with a star stamped on it",
    schets: `<circle class="r" cx="100" cy="100" r="66" fill="#ffc83b"/><circle cx="100" cy="100" r="48" fill="none" stroke="#d99a1a" stroke-width="6"/><path d="M100 70 l9 20 h21 l-17 13 l7 21 l-20 -13 l-20 13 l7 -21 l-17 -13 h21z" fill="#d99a1a"/>`,
  },
  {
    naam: "kopermunt",
    titel: "Kopermunt",
    groep: "winkel",
    onderwerp: "a round copper coin with a simple ring pattern",
    schets: `<circle class="r" cx="100" cy="100" r="64" fill="#d1814a"/><circle cx="100" cy="100" r="42" fill="none" stroke="#a65a2a" stroke-width="8"/>`,
  },
  {
    naam: "diamant",
    titel: "Diamant",
    groep: "winkel",
    onderwerp: "a light blue cut diamond gemstone, side view",
    schets: `<path class="r" d="M56 50 h88 l34 40 l-78 82 l-78 -82z" fill="#7fd7ff"/><path d="M22 90 h156 M80 50 l20 122 l20 -122" stroke="#1d2340" stroke-width="5" fill="none"/>`,
  },
  {
    naam: "parel",
    titel: "Parel",
    groep: "natuur",
    onderwerp: "a single round white pearl with a soft shine",
    schets: `<circle class="r" cx="100" cy="100" r="58" fill="#f4eef8"/><circle cx="80" cy="80" r="14" fill="#ffffff"/>`,
  },
  {
    naam: "maansteen",
    titel: "Maansteen",
    groep: "ruimte",
    onderwerp: "a small grey moon rock with a few round craters",
    schets: `<path class="r" d="M40 110 q-6 -50 50 -64 q70 -10 78 50 q6 56 -64 62 q-58 4 -64 -48z" fill="#b8bccb"/><circle cx="84" cy="90" r="12" fill="#8f94a6"/><circle cx="128" cy="122" r="9" fill="#8f94a6"/>`,
  },
  {
    naam: "sleutel",
    titel: "Sleutel",
    groep: "huis",
    onderwerp: "an old golden key, lying sideways",
    schets: `<circle class="r" cx="58" cy="100" r="32" fill="#ffc83b"/><circle cx="58" cy="100" r="12" fill="#1d2340"/><rect class="r" x="88" y="92" width="88" height="16" fill="#ffc83b"/><rect class="r" x="150" y="108" width="12" height="22" fill="#ffc83b"/>`,
  },
  {
    naam: "kistje",
    titel: "Kistje",
    groep: "huis",
    onderwerp: "a small closed wooden chest with a gold lock",
    schets: `<rect class="r" x="30" y="80" width="140" height="84" rx="8" fill="#a8693a"/><path class="r" d="M30 80 q0 -44 70 -44 q70 0 70 44z" fill="#c07d46"/><rect class="r" x="88" y="74" width="24" height="30" fill="#ffc83b"/>`,
  },
  {
    naam: "schatkist",
    titel: "Schatkist vol sterren",
    groep: "huis",
    onderwerp: "an open wooden treasure chest full of shiny golden stars",
    schets: `<path class="r" d="M30 60 q0 -40 70 -40 q70 0 70 40z" fill="#c07d46"/><path d="M40 90 l16 -24 l16 24 l16 -24 l16 24 l16 -24 l16 24 l16 -24 l16 24z" fill="#ffd93b" stroke="#1d2340" stroke-width="5"/><rect class="r" x="30" y="90" width="140" height="80" rx="8" fill="#a8693a"/>`,
  },
  {
    naam: "oude-raket",
    titel: "Oude raket",
    groep: "ruimte",
    onderwerp: "a big old silver-grey rocket with rivets and a small round door, standing upright, slightly worn",
    schets: `<path class="r" d="M100 14 q46 40 40 140 h-80 q-6 -100 40 -140z" fill="#c3c8d4"/><circle class="r" cx="100" cy="74" r="18" fill="#8fb8d8"/><rect class="r" x="86" y="110" width="28" height="40" rx="10" fill="#8f94a6"/><path class="r" d="M60 150 l-28 34 h36z M140 150 l28 34 h-36z" fill="#8f94a6"/>`,
  },
  {
    naam: "rode-rots",
    titel: "Rode rots",
    groep: "natuur",
    onderwerp: "a big red-brown rock with a few crack lines and a flat top, clearly a stone",
    schets: `<path class="r" d="M20 170 l20 -80 l40 -40 h50 l36 50 l14 70z" fill="#c8533a"/><path d="M70 90 l20 30 M130 110 l-14 26" stroke="#8a3424" stroke-width="6"/>`,
  },
  {
    naam: "planeet",
    titel: "Planeet",
    groep: "ruimte",
    onderwerp: "a small round planet with blue oceans and green land and a few white clouds, clearly a planet",
    schets: `<circle class="r" cx="100" cy="100" r="66" fill="#4f8fe8"/><circle cx="76" cy="80" r="14" fill="#9fc6ff"/><circle cx="128" cy="124" r="10" fill="#9fc6ff"/>`,
  },
  {
    naam: "zak-chips",
    titel: "Zak chips",
    groep: "eten",
    onderwerp: "a closed bag of crisps, no text",
    schets: `<path class="r" d="M50 30 h100 l-6 14 q14 60 0 112 l6 14 h-100 l6 -14 q-14 -52 0 -112z" fill="#ffc83b"/><ellipse cx="100" cy="100" rx="28" ry="20" fill="#f3e2a0" stroke="#1d2340" stroke-width="5"/>`,
  },
  {
    naam: "kom-soep",
    titel: "Kom soep",
    groep: "eten",
    onderwerp: "a bowl of orange tomato soup, side view",
    schets: `<path class="r" d="M20 86 h160 q-8 76 -80 80 q-72 -4 -80 -80z" fill="#ffffff"/><ellipse class="r" cx="100" cy="86" rx="80" ry="14" fill="#f07a3a"/>`,
  },
  {
    naam: "mandarijn",
    titel: "Mandarijn",
    groep: "fruit",
    onderwerp: "an orange tangerine with one small green leaf",
    schets: `<circle class="r" cx="100" cy="110" r="60" fill="#ff9a2c"/><path class="r" d="M100 50 q22 -24 40 -10 q-18 18 -40 10z" fill="#4fbf5a"/>`,
  },
];
