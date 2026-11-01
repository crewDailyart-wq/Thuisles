/**
 * Voorwerpen van de lessen Klokkijken naar Squla groep 3 (31 oktober 2026).
 * De klokken zelf (wijzerklok en digitale klok) zijn rekenmateriaal en
 * blijven in code getekend; hier staan alleen de echte dingen eromheen.
 *
 * Bij de telefoon, de laptop en de oven tekent de les zelf een klein
 * digitaal klokje op het scherm; het plaatje heeft daarom een leeg, zwart
 * schermpje.
 *
 * Bed, gieter, raketje, treintje en voetbal staan al in lijst-geld.ts; die
 * namen gebruiken deze lessen ook (hetzelfde ding ziet er overal hetzelfde uit).
 */
import type { Voorwerp } from "./soort";

export const KLOK: Voorwerp[] = [
  {
    naam: "telefoon",
    titel: "Mobiele telefoon",
    groep: "huis",
    onderwerp: "a black smartphone seen from the front, standing upright, with a large empty dark screen",
    schets: `<rect class="r" x="60" y="20" width="80" height="160" rx="14" fill="#2b2f3a"/><rect x="68" y="36" width="64" height="124" rx="4" fill="#0b0f1a"/><circle cx="100" cy="170" r="4" fill="#5a6070"/>`,
  },
  {
    naam: "laptop",
    titel: "Laptop",
    groep: "huis",
    onderwerp: "an open grey laptop seen from the front, with an empty dark screen",
    schets: `<rect class="r" x="36" y="34" width="128" height="94" rx="8" fill="#9aa3b5"/><rect x="46" y="44" width="108" height="74" rx="3" fill="#0b0f1a"/><path class="r" d="M20 136 h160 l-10 22 h-140z" fill="#c4cad6"/>`,
  },
  {
    naam: "oven",
    titel: "Oven",
    groep: "huis",
    onderwerp: "a white kitchen oven seen from the front, with a glass door and a small empty black display panel above the door",
    schets: `<rect class="r" x="30" y="24" width="140" height="152" rx="10" fill="#f1f2f5"/><rect x="66" y="34" width="68" height="26" rx="4" fill="#0b0f1a"/><rect class="r" x="46" y="72" width="108" height="88" rx="8" fill="#ffb066"/><path class="r" d="M60 72 h80" fill="none"/>`,
  },
  {
    naam: "wekker",
    titel: "Wekker",
    groep: "huis",
    onderwerp: "a round wake-up clock with two small bells on top, standing on two little feet, blank white dial with no numbers and no pointers",
    schets: `<circle class="r" cx="100" cy="106" r="62" fill="#ffd36e"/><circle cx="100" cy="106" r="48" fill="#ffffff"/><circle class="r" cx="62" cy="48" r="16" fill="#ef4f5a"/><circle class="r" cx="138" cy="48" r="16" fill="#ef4f5a"/><path d="M64 164 l-10 16 M136 164 l10 16" stroke="#7a5b2e" stroke-width="8" stroke-linecap="round"/>`,
  },
  {
    naam: "zandloper",
    titel: "Zandloper",
    groep: "huis",
    onderwerp: "a wooden hourglass with yellow sand, standing upright",
    schets: `<rect class="r" x="52" y="20" width="96" height="16" rx="4" fill="#b07a45"/><rect class="r" x="52" y="164" width="96" height="16" rx="4" fill="#b07a45"/><path class="r" d="M64 36 h72 c0 40 -30 50 -30 64 c0 14 30 24 30 64 h-72 c0 -40 30 -50 30 -64 c0 -14 -30 -24 -30 -64z" fill="#e6f4ff"/><path d="M76 164 c4 -26 18 -34 24 -40 c6 6 20 14 24 40z" fill="#f2c94c"/>`,
  },
  {
    naam: "bakkerij",
    titel: "Bakkerij",
    groep: "winkel",
    onderwerp: "a small bakery shop building seen from the front, with a striped awning, a big window and a door",
    schets: `<rect class="r" x="30" y="70" width="140" height="110" fill="#f6dfb8"/><path class="r" d="M22 72 l12 -30 h132 l12 30z" fill="#e8454f"/><path d="M52 42 l-6 30 M80 42 l-4 30 M120 42 l4 30 M148 42 l6 30" stroke="#ffffff" stroke-width="10"/><rect class="r" x="42" y="96" width="64" height="48" fill="#bfe6ff"/><rect class="r" x="120" y="96" width="38" height="84" fill="#b07a45"/>`,
  },
  {
    naam: "maan",
    titel: "Maan",
    groep: "ruimte",
    onderwerp: "a yellow crescent moon",
    schets: `<path class="r" d="M128 30 a74 74 0 1 0 40 120 a60 60 0 1 1 -40 -120z" fill="#ffe066"/>`,
  },
  {
    naam: "zon",
    titel: "Zon",
    groep: "natuur",
    onderwerp: "a bright yellow sun with short straight rays",
    schets: `<g class="r"><path d="M100 14 v26 M100 160 v26 M14 100 h26 M160 100 h26 M39 39 l18 18 M143 143 l18 18 M39 161 l18 -18 M143 57 l18 -18" fill="none"/></g><circle class="r" cx="100" cy="100" r="46" fill="#ffd23f"/>`,
  },
  {
    naam: "deegkom",
    titel: "Kom met deeg",
    groep: "eten",
    onderwerp: "a blue mixing bowl filled with a round ball of bread dough",
    schets: `<ellipse class="r" cx="100" cy="92" rx="54" ry="34" fill="#f3dcb0"/><path class="r" d="M24 100 h152 c-6 50 -40 74 -76 74 c-36 0 -70 -24 -76 -74z" fill="#4b8af5"/>`,
  },
  {
    naam: "bus",
    titel: "Bus",
    groep: "vervoer",
    onderwerp: "a modern yellow city bus seen exactly from the side, with a row of large light-blue windows and two black wheels, rounded friendly shapes, nobody inside",
    schets: `<rect class="r" x="14" y="54" width="172" height="96" rx="14" fill="#ffd23f"/><rect x="30" y="68" width="32" height="30" fill="#bfe6ff"/><rect x="72" y="68" width="32" height="30" fill="#bfe6ff"/><rect x="114" y="68" width="32" height="30" fill="#bfe6ff"/><rect x="156" y="68" width="22" height="30" fill="#bfe6ff"/><circle class="r" cx="54" cy="152" r="16" fill="#2b2f3a"/><circle class="r" cx="146" cy="152" r="16" fill="#2b2f3a"/>`,
  },
  {
    naam: "taart",
    titel: "Taart",
    groep: "eten",
    onderwerp: "a round cake with pink icing and one red cherry on top, seen from the side",
    schets: `<rect class="r" x="34" y="84" width="132" height="76" rx="10" fill="#f6dfb8"/><path class="r" d="M34 96 c0 -20 132 -20 132 0 v14 c-12 10 -22 0 -33 10 c-11 -10 -22 0 -33 -10 c-11 10 -22 0 -33 10 c-11 -10 -22 0 -33 -10z" fill="#ff9fd2"/><circle class="r" cx="100" cy="66" r="12" fill="#e8454f"/>`,
  },
  {
    naam: "koekje",
    titel: "Koekje",
    groep: "eten",
    onderwerp: "a round golden brown cookie with chocolate chips",
    schets: `<circle class="r" cx="100" cy="100" r="66" fill="#d9a066"/><circle cx="76" cy="80" r="8" fill="#5a3418"/><circle cx="120" cy="74" r="7" fill="#5a3418"/><circle cx="110" cy="118" r="8" fill="#5a3418"/><circle cx="74" cy="124" r="7" fill="#5a3418"/>`,
  },
  {
    naam: "lampje",
    titel: "Lampje",
    groep: "huis",
    onderwerp: "a small desk lamp with a yellow lampshade, switched on",
    schets: `<path class="r" d="M60 40 h80 l20 60 h-120z" fill="#ffd23f"/><path class="r" d="M100 100 v58" fill="none"/><rect class="r" x="62" y="158" width="76" height="18" rx="6" fill="#9aa3b5"/>`,
  },
  {
    naam: "plant",
    titel: "Plantje in een pot",
    groep: "natuur",
    onderwerp: "a small green plant with a few leaves in an orange flower pot",
    schets: `<path class="r" d="M100 120 v-60" fill="none"/><path class="r" d="M100 92 c-34 -6 -46 -30 -40 -44 c22 0 40 16 40 44z" fill="#4fbf5a"/><path class="r" d="M100 78 c30 -4 44 -26 40 -40 c-22 0 -40 14 -40 40z" fill="#4fbf5a"/><path class="r" d="M58 120 h84 l-10 58 h-64z" fill="#e8743b"/>`,
  },
  {
    naam: "bloem",
    titel: "Bloem",
    groep: "natuur",
    onderwerp: "a single open red flower with a yellow centre on a green stem",
    schets: `<path class="r" d="M100 104 v76" fill="none"/><g class="r" fill="#e8454f"><circle cx="100" cy="58" r="22"/><circle cx="134" cy="80" r="22"/><circle cx="122" cy="118" r="22"/><circle cx="78" cy="118" r="22"/><circle cx="66" cy="80" r="22"/></g><circle class="r" cx="100" cy="92" r="18" fill="#ffd23f"/>`,
  },
  {
    naam: "mand",
    titel: "Mand",
    groep: "winkel",
    onderwerp: "an empty brown woven basket with a handle",
    schets: `<path class="r" d="M58 92 c0 -60 84 -60 84 0" fill="none"/><path class="r" d="M28 92 h144 l-18 82 h-108z" fill="#c98a4b"/><path d="M42 118 h116 M48 146 h104" stroke="#8a5a2b" stroke-width="5"/>`,
  },
  {
    naam: "schoolbord",
    titel: "Schoolbord",
    groep: "huis",
    onderwerp: "an empty dark green school chalkboard with a wooden frame and a small chalk tray at the bottom, front view, completely empty, no writing",
    schets: `<rect class="r" x="20" y="36" width="160" height="112" rx="6" fill="#b07a45"/><rect x="32" y="48" width="136" height="88" fill="#2f6b4f"/><path class="r" d="M60 148 l-14 34 M140 148 l14 34" fill="none"/>`,
  },
  {
    naam: "kampvuur",
    titel: "Kampvuur",
    groep: "natuur",
    onderwerp: "a small campfire with orange flames on crossed wooden logs",
    schets: `<path class="r" d="M40 170 l120 -30 M40 140 l120 30" fill="none" stroke-width="16"/><path class="r" d="M100 30 c30 34 46 60 30 100 c-10 20 -50 20 -60 0 c-12 -26 0 -46 14 -60 c2 16 8 22 16 24 c-6 -24 -4 -46 0 -64z" fill="#ff8a1f"/>`,
  },
];
