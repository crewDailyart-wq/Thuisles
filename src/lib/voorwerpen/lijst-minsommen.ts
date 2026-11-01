/**
 * Voorwerpen van de lessen "Minsommen" naar Squla groep 3 (31 oktober 2026).
 *
 * Geen mensen en geen dieren: de zeedieren van Squla zijn dingen uit de
 * ruimte en de lucht geworden (raketjes die wegvliegen, bellen die knappen,
 * sterren die vallen); de kinderen in de bus zijn pakjes die de bezorgbus
 * bezorgt. De min-machine, de stippen en de pijl zijn rekenmateriaal en
 * blijven in code getekend. Wat al in een andere lijst staat (bord, koekje,
 * bal, boek, vlieger, schoolbord) gebruiken de lessen onder die
 * naam; het staat hier dus niet nog eens.
 */
import type { Voorwerp } from "./soort";

export const MINSOMMEN: Voorwerp[] = [
  /* ruimte en lucht */
  {
    naam: "zeepbel",
    titel: "Zeepbel",
    groep: "speelgoed",
    onderwerp: "one round transparent soap bubble with a small white shine",
    schets: `<circle class="r" cx="100" cy="100" r="72" fill="#cfe8ff"/><path d="M58 76 q10 -24 34 -30" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  },
  {
    naam: "ufo",
    titel: "Ufo",
    groep: "ruimte",
    onderwerp: "a small purple flying saucer with a clear empty glass dome and colored lights",
    schets: `<path class="r" d="M66 96 a34 30 0 0 1 68 0z" fill="#cdeeff"/><ellipse class="r" cx="100" cy="112" rx="80" ry="26" fill="#a77bf0"/><circle cx="54" cy="114" r="7" fill="#ffd93b"/><circle cx="86" cy="118" r="7" fill="#7ee0a0"/><circle cx="118" cy="118" r="7" fill="#ff8fc8"/><circle cx="148" cy="114" r="7" fill="#ffd93b"/>`,
  },
  {
    naam: "satelliet",
    titel: "Satelliet",
    groep: "ruimte",
    onderwerp: "a small green satellite with two blue solar panels and a short antenna",
    schets: `<rect class="r" x="14" y="80" width="56" height="40" fill="#4da3ff"/><rect class="r" x="130" y="80" width="56" height="40" fill="#4da3ff"/><rect class="r" x="76" y="66" width="48" height="68" rx="8" fill="#6fd08f"/><path class="r" d="M100 66 v-30" fill="none"/><circle class="r" cx="100" cy="32" r="8" fill="#f4f7ff"/>`,
  },
  /* vervoer en winkel */
  {
    naam: "bezorgbus",
    titel: "Bezorgbus",
    groep: "vervoer",
    onderwerp: "a yellow delivery van seen from the side, with a long open empty cargo area and the driver cabin on the right, no driver",
    schets: `<rect class="r" x="8" y="56" width="148" height="92" rx="8" fill="#ffcf3f"/><rect x="18" y="66" width="128" height="64" rx="4" fill="#c99a2e"/><path class="r" d="M156 80 h22 q14 2 16 30 v38 h-38z" fill="#ffcf3f"/><path d="M162 88 h14 q8 2 10 22 h-24z" fill="#cdeaff"/><circle class="r" cx="48" cy="152" r="16" fill="#3a3f55"/><circle class="r" cx="164" cy="152" r="16" fill="#3a3f55"/>`,
  },
  /* in huis en op school */
  {
    naam: "beker-vol",
    titel: "Beker met limonade",
    groep: "eten",
    onderwerp: "a clear drinking glass full of orange lemonade with a pink straw",
    schets: `<path d="M52 70 h96 l-12 110 h-72z" fill="#ff9a3d"/><path class="r" d="M46 30 h108 l-14 150 h-80z" fill="none"/><path class="r" d="M118 80 l20 -70" fill="none" stroke="#ff6b9a"/>`,
  },
  {
    naam: "beker-leeg",
    titel: "Lege beker",
    groep: "eten",
    onderwerp: "an empty clear drinking glass",
    schets: `<path class="r" d="M46 30 h108 l-14 150 h-80z" fill="#e6f2ff"/><path d="M64 50 l8 110" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>`,
  },
  /* speelgoed en snoep om te kopen */
  {
    naam: "raketje",
    titel: "Raketje",
    groep: "ruimte",
    onderwerp: "a small red and white rocket standing upright, with one round window and a small flame below",
    schets: `<path class="r" d="M100 20 c34 26 30 100 22 140 h-44 c-8 -40 -12 -114 22 -140z" fill="#f4f7ff"/><path class="r" d="M100 20 c16 12 24 30 26 44 h-52 c2 -14 10 -32 26 -44z" fill="#e8454f"/><circle class="r" cx="100" cy="96" r="16" fill="#8fd3ff"/><path class="r" d="M78 128 l-24 40 l26 -6z M122 128 l24 40 l-26 -6z" fill="#e8454f"/><path d="M88 162 q12 34 24 0z" fill="#ffd34d"/>`,
  },
  {
    naam: "ster",
    titel: "Ster",
    groep: "ruimte",
    onderwerp: "a yellow five-pointed star with rounded points",
    schets: `<path class="r" d="M100 18 l24 52 l56 6 l-42 38 l12 56 l-50 -28 l-50 28 l12 -56 l-42 -38 l56 -6z" fill="#ffd93b" stroke-linejoin="round"/>`,
  },
  {
    naam: "komeet",
    titel: "Komeet",
    groep: "ruimte",
    onderwerp: "a small orange comet with a short yellow tail going up to the right",
    schets: `<path d="M70 120 L186 20 L100 150z" fill="#ffd93b"/><circle class="r" cx="76" cy="134" r="38" fill="#ff9a3d"/>`,
  },
  {
    naam: "pakje",
    titel: "Pakje",
    groep: "winkel",
    onderwerp: "a small brown cardboard parcel tied with a red ribbon and a bow on top",
    schets: `<rect class="r" x="36" y="60" width="128" height="112" rx="8" fill="#d9a866"/><rect x="92" y="60" width="16" height="112" fill="#e8454f"/><rect x="36" y="108" width="128" height="16" fill="#e8454f"/><path class="r" d="M100 60 q-36 -40 -40 -6 q4 10 40 6 q36 4 40 -6 q-4 -34 -40 6z" fill="#e8454f"/>`,
  },
  {
    naam: "portemonnee",
    titel: "Portemonnee",
    groep: "winkel",
    onderwerp: "a closed brown wallet with a round golden clasp, front view",
    schets: `<rect class="r" x="18" y="62" width="164" height="96" rx="18" fill="#b5653a"/><path class="r" d="M18 82 q82 -40 164 0" fill="none"/><circle class="r" cx="100" cy="84" r="10" fill="#ffd34d"/>`,
  },
  {
    naam: "ballon",
    titel: "Ballon",
    groep: "feest",
    onderwerp: "a pink party balloon with a short curly string",
    schets: `<ellipse class="r" cx="100" cy="80" rx="54" ry="64" fill="#ff8fc8"/><path class="r" d="M92 146 h16 l-8 -10z" fill="#ff8fc8"/><path class="r" d="M100 146 q-12 16 0 26 q10 10 0 22" fill="none"/>`,
  },
  {
    naam: "ijsje",
    titel: "IJsje",
    groep: "eten",
    onderwerp: "an ice cream cone with one pink scoop",
    schets: `<path class="r" d="M66 92 h68 l-34 96z" fill="#e0a85a"/><circle class="r" cx="100" cy="72" r="40" fill="#ff8fc8"/>`,
  },
];
