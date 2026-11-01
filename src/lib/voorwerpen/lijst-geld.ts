/**
 * Voorwerpen van de lessen Geld naar Squla (31 oktober 2026): de spaarpot, de
 * portemonnee, het speelgoed in de winkel en op de rommelmarkt, en de klusjes
 * waarmee je zakgeld verdient. Wat al in een andere lijst staat
 * (portemonnee, bal, boek, vlieger, bord, raketje: lijst-minsommen.ts;
 * voetbal: lijst-splitsen.ts) wordt daarvandaan gebruikt, niet nog eens hier. Geld zelf is GEEN voorwerp: munten komen uit
 * public/geld/los/, briefjes uit public/geld/ (officieel, ECB).
 */
import type { Voorwerp } from "./soort";

export const GELD: Voorwerp[] = [
  {
    naam: "spaarpot",
    titel: "Spaarpot (glazen pot)",
    groep: "huis",
    onderwerp: "a round glass money jar with a red lid that has a coin slot, with a few gold coins inside at the bottom",
    schets: `<path class="r" d="M58 70 q-30 24 -30 64 q0 54 72 54 q72 0 72 -54 q0 -40 -30 -64z" fill="#cfeaf7"/><rect class="r" x="46" y="40" width="108" height="32" rx="10" fill="#f2715e"/><rect x="78" y="50" width="44" height="9" rx="4" fill="#1d2340"/>`,
  },
  {
    naam: "skateboard",
    titel: "Skateboard",
    groep: "speelgoed",
    onderwerp: "a red skateboard with yellow wheels, side view",
    schets: `<path class="r" d="M20 92 q0 -16 18 -14 l28 6 h68 l28 -6 q18 -2 18 14 q0 14 -18 14 h-124 q-18 0 -18 -14z" fill="#f2715e"/><circle class="r" cx="62" cy="128" r="15" fill="#ffc845"/><circle class="r" cx="138" cy="128" r="15" fill="#ffc845"/>`,
  },
  {
    naam: "springtouw",
    titel: "Springtouw",
    groep: "speelgoed",
    onderwerp: "a jump rope with two wooden handles",
    schets: `<path class="r" d="M58 82 c-14 70 30 104 46 98 c30 -10 58 -44 40 -98" fill="none" stroke="#127c86" stroke-width="10"/><path class="r" d="M44 22 l22 -4 l4 64 l-18 2z" fill="#d79a62"/><path class="r" d="M156 22 l-22 -4 l-4 64 l18 2z" fill="#d79a62"/>`,
  },
  {
    naam: "speelgoedauto",
    titel: "Speelgoedauto",
    groep: "speelgoed",
    onderwerp: "a small red toy car, side view",
    schets: `<path class="r" d="M22 130 v-24 q0 -12 14 -14 l22 -2 l20 -28 q4 -6 14 -6 h36 q10 0 14 8 l16 26 q12 4 12 16 v24z" fill="#f2715e"/><circle class="r" cx="60" cy="134" r="17" fill="#1d2340"/><circle class="r" cx="144" cy="134" r="17" fill="#1d2340"/>`,
  },
  {
    naam: "bootje",
    titel: "Speelgoedbootje",
    groep: "speelgoed",
    onderwerp: "a small toy sailing boat with a red hull and a white sail",
    schets: `<path class="r" d="M100 140 V30" fill="none"/><path class="r" d="M106 36 v90 h52z" fill="#fff7ea"/><path class="r" d="M26 140 h148 l-22 32 h-104z" fill="#f2715e"/>`,
  },
  {
    naam: "knoop",
    titel: "Knoop",
    groep: "huis",
    onderwerp: "a round blue button with four holes",
    schets: `<circle class="r" cx="100" cy="100" r="62" fill="#127c86"/><circle cx="86" cy="86" r="8" fill="#1d2340"/><circle cx="114" cy="86" r="8" fill="#1d2340"/><circle cx="86" cy="114" r="8" fill="#1d2340"/><circle cx="114" cy="114" r="8" fill="#1d2340"/>`,
  },
  {
    naam: "schelp",
    titel: "Schelp",
    groep: "natuur",
    onderwerp: "a light pink scallop seashell",
    schets: `<path class="r" d="M40 116 q-4 -76 60 -78 q64 2 60 78 l-40 34 h-40z" fill="#ffd6cc"/><path class="r" d="M100 148 V44 M88 148 L64 52 M112 148 L136 52" fill="none"/>`,
  },
  {
    naam: "bezem",
    titel: "Bezem",
    groep: "huis",
    onderwerp: "a broom with a wooden stick and yellow bristles",
    schets: `<path class="r" d="M100 14 V120" fill="none" stroke-width="12"/><path class="r" d="M74 118 h52 l26 66 h-104z" fill="#ffc845"/>`,
  },
  {
    naam: "emmer",
    titel: "Emmer met sop",
    groep: "huis",
    onderwerp: "a light blue bucket with white soap foam on top",
    schets: `<path class="r" d="M50 70 q50 -60 100 0" fill="none"/><circle class="r" cx="76" cy="66" r="16" fill="#ffffff"/><circle class="r" cx="104" cy="58" r="18" fill="#ffffff"/><circle class="r" cx="130" cy="66" r="15" fill="#ffffff"/><path class="r" d="M40 72 h120 l-14 98 h-92z" fill="#bfe6e3"/>`,
  },
  {
    naam: "doos",
    titel: "Doos",
    groep: "winkel",
    onderwerp: "one closed cardboard box",
    schets: `<rect class="r" x="30" y="60" width="140" height="110" rx="6" fill="#d79a62"/><path class="r" d="M30 60 l20 -26 h100 l20 26" fill="#efc796"/>`,
  },
  {
    naam: "jas",
    titel: "Jas",
    groep: "huis",
    onderwerp: "a teal coat with yellow buttons, front view",
    schets: `<path class="r" d="M72 26 l-34 24 l-12 76 l24 2 l6 -50 v104 h88 v-104 l6 50 l24 -2 l-12 -76 l-34 -24 q-28 18 -56 0z" fill="#127c86"/>`,
  },
  {
    naam: "schoen",
    titel: "Schoen",
    groep: "huis",
    onderwerp: "one red sneaker with white sole, side view",
    schets: `<path class="r" d="M24 64 h56 l14 36 q76 6 82 34 v14 h-152z" fill="#f2715e"/><path class="r" d="M24 136 h152" fill="none" stroke="#fff7ea"/>`,
  },
  {
    naam: "marktkraam",
    titel: "Marktkraam",
    groep: "winkel",
    onderwerp: "one market stall with a red and white striped roof, empty, nobody there",
    schets: `<path class="r" d="M40 70 V180 M160 70 V180" fill="none"/><rect class="r" x="26" y="120" width="148" height="22" rx="5" fill="#d79a62"/><path class="r" d="M18 72 l18 -46 h128 l18 46z" fill="#f2715e"/><path d="M60 26 h20 l-6 46 h-20z M120 26 h20 l14 46 h-20z" fill="#fff7ea"/>`,
  },
  {
    naam: "treintje",
    titel: "Speelgoedtreintje",
    groep: "speelgoed",
    onderwerp: "a small teal toy train engine, side view",
    schets: `<rect class="r" x="112" y="50" width="56" height="56" rx="8" fill="#127c86"/><rect class="r" x="28" y="80" width="140" height="54" rx="10" fill="#127c86"/><circle class="r" cx="58" cy="140" r="17" fill="#1d2340"/><circle class="r" cx="140" cy="140" r="17" fill="#1d2340"/>`,
  },
  {
    naam: "gieter",
    titel: "Gieter",
    groep: "huis",
    onderwerp: "a teal watering can, side view",
    schets: `<path class="r" d="M46 76 q30 -44 60 0" fill="none"/><path class="r" d="M130 106 L170 66" fill="none" stroke-width="12"/><rect class="r" x="30" y="72" width="104" height="84" rx="14" fill="#127c86"/>`,
  },
  {
    naam: "bed",
    titel: "Bed",
    groep: "huis",
    onderwerp: "a single bed with a blue blanket and a white pillow, side view, empty",
    schets: `<rect class="r" x="20" y="50" width="22" height="110" rx="6" fill="#d79a62"/><rect class="r" x="158" y="90" width="22" height="70" rx="6" fill="#d79a62"/><rect class="r" x="36" y="96" width="130" height="40" rx="8" fill="#4b7be0"/><rect class="r" x="44" y="76" width="50" height="24" rx="10" fill="#fff7ea"/>`,
  },
];
