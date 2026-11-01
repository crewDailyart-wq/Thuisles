/**
 * Voorwerpen van de lessen "Vormen en figuren" naar Squla (31 oktober 2026):
 * patronen, opruimen, links/rechts/boven/onder en puzzelen met kleuren.
 *
 * De vormen zelf (cirkel, driehoek, vierkant, kubus, bol …), de kralen, de
 * blokjes in een rooster, het grasveld, de plattegrond, de hinkelbaan en de
 * huisjes van boven/voren/onder zijn rekenmateriaal: die blijven in code
 * getekend (squla-vormen-tekenen.ts). Hier staan alleen de echte dingen.
 *
 * Kleurvarianten (ballon-geel, ballon-blauw …) alleen omdat de vraag over de
 * kleur gaat ("Welke kleur heeft de ballon helemaal rechts?"). De roze ballon
 * is het bestaande voorwerp "ballon".
 */
import type { Voorwerp } from "./soort";

const R = `class="r"`;
const ballon = (kleur: string) =>
  `<path ${R} d="M100 150 Q92 172 104 192" fill="none"/><ellipse ${R} cx="100" cy="82" rx="58" ry="70" fill="${kleur}"/><path ${R} d="M92 150 L108 150 L100 140 Z" fill="${kleur}"/>`;

export const VORMEN: Voorwerp[] = [
  /* --- ballonnen in kleuren (de vraag gaat over de kleur) --- */
  { naam: "ballon-geel", titel: "Gele ballon", groep: "feest", onderwerp: "a yellow party balloon with a short curly string", schets: ballon("#ffd93b") },
  { naam: "ballon-oranje", titel: "Oranje ballon", groep: "feest", onderwerp: "an orange party balloon with a short curly string", schets: ballon("#ff9a3c") },
  { naam: "ballon-paars", titel: "Paarse ballon", groep: "feest", onderwerp: "a purple party balloon with a short curly string", schets: ballon("#9b6be0") },
  { naam: "ballon-blauw", titel: "Blauwe ballon", groep: "feest", onderwerp: "a blue party balloon with a short curly string", schets: ballon("#4b8af5") },
  { naam: "ballon-groen", titel: "Groene ballon", groep: "feest", onderwerp: "a green party balloon with a short curly string", schets: ballon("#55c26f") },
  { naam: "ballon-rood", titel: "Rode ballon", groep: "feest", onderwerp: "a red party balloon with a short curly string", schets: ballon("#e8453c") },
  /* --- opruimen: kleren en plekken --- */
  {
    naam: "broek",
    titel: "Lange broek",
    groep: "huis",
    onderwerp: "one pair of long blue jeans lying flat, front view",
    schets: `<path ${R} d="M58 18 H142 L156 186 H112 L100 74 L88 186 H44 Z" fill="#4b7fd0"/><path d="M58 40 H142" stroke="#2f5aa0" stroke-width="6"/>`,
  },
  {
    naam: "t-shirt",
    titel: "T-shirt",
    groep: "huis",
    onderwerp: "one plain yellow short-sleeved t-shirt lying flat, front view",
    schets: `<path ${R} d="M70 26 Q100 44 130 26 L176 52 L158 88 L140 80 V178 H60 V80 L42 88 L24 52 Z" fill="#ffd93b"/>`,
  },
  {
    naam: "wandplank",
    titel: "Wandplank",
    groep: "huis",
    onderwerp: "one empty long wooden wall shelf, front view",
    schets: `<rect ${R} x="8" y="96" width="184" height="18" rx="4" fill="#d39b62"/><path ${R} d="M34 114 V140 H54 M166 114 V140 H146" fill="none"/>`,
  },
  {
    naam: "kledingkast",
    titel: "Kledingkast",
    groep: "huis",
    onderwerp: "an empty wooden wardrobe with both doors wide open and one shelf inside, front view",
    schets: `<rect ${R} x="40" y="14" width="120" height="176" rx="6" fill="#c98a52"/><rect x="52" y="26" width="96" height="152" fill="#8a5a32"/><path ${R} d="M52 100 H148" fill="none"/><path ${R} d="M40 18 L14 30 V176 L40 188 Z M160 18 L186 30 V176 L160 188 Z" fill="#d9a066"/>`,
  },
  {
    naam: "tekendoos",
    titel: "Tekendoos",
    groep: "huis",
    onderwerp: "an open empty wooden drawing box without a lid, seen from the front and a little from above",
    schets: `<path ${R} d="M20 88 L40 66 H160 L180 88 Z" fill="#8a5a32"/><rect ${R} x="20" y="88" width="160" height="90" rx="6" fill="#d39b62"/>`,
  },
  /* --- de bloembak (patronen) --- */
  {
    naam: "tulp",
    titel: "Tulp",
    groep: "natuur",
    onderwerp: "a single pink tulip on a green stem with one leaf",
    schets: `<path ${R} d="M100 190 V90" fill="none"/><path ${R} d="M100 160 Q70 140 66 110 Q92 120 100 150" fill="#55c26f"/><path ${R} d="M64 40 L82 58 L100 34 L118 58 L136 40 Q140 96 100 100 Q60 96 64 40 Z" fill="#f48fb1"/>`,
  },
  {
    naam: "zonnebloem",
    titel: "Zonnebloem",
    groep: "natuur",
    onderwerp: "a single yellow sunflower with a brown centre on a green stem",
    schets: `<path ${R} d="M100 190 V110" fill="none"/><circle ${R} cx="100" cy="70" r="56" fill="#ffd93b"/><circle ${R} cx="100" cy="70" r="26" fill="#8a5a32"/>`,
  },
  {
    naam: "bloembak",
    titel: "Bloembak",
    groep: "natuur",
    onderwerp: "one long empty rectangular wooden flower box filled with brown soil, front view",
    schets: `<rect ${R} x="6" y="96" width="188" height="16" rx="4" fill="#7a5233"/><rect ${R} x="14" y="108" width="172" height="62" rx="6" fill="#c98a52"/>`,
  },
];
