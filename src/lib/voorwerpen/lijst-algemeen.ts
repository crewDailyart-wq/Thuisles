/**
 * Voorwerpen die in meerdere onderwerpen terugkomen. Een bouwer die een ding
 * nodig heeft dat hier al staat, gebruikt deze naam (niet een eigen kopie).
 */
import type { Voorwerp } from "./soort";

export const ALGEMEEN: Voorwerp[] = [
  {
    naam: "appel",
    titel: "Appel",
    groep: "fruit",
    onderwerp: "a red apple with a short brown stem and one green leaf",
    schets: `<circle class="r" cx="100" cy="112" r="64" fill="#e8454f"/><path class="r" d="M100 52 L106 26" fill="none"/><path class="r" d="M108 40 q28 -22 44 -6 q-22 18 -44 6z" fill="#4fbf5a"/>`,
  },
  {
    naam: "peer",
    titel: "Peer",
    groep: "fruit",
    onderwerp: "a green pear with a short brown stem",
    schets: `<path class="r" d="M100 40 c-22 0 -24 34 -36 54 c-20 30 -10 78 36 78 c46 0 56 -48 36 -78 c-12 -20 -14 -54 -36 -54z" fill="#9fd44e"/><path class="r" d="M100 40 L104 18" fill="none"/>`,
  },
  {
    naam: "pruim",
    titel: "Pruim",
    groep: "fruit",
    onderwerp: "a purple plum with a short brown stem",
    schets: `<ellipse class="r" cx="100" cy="112" rx="58" ry="66" fill="#8a4fd0"/><path class="r" d="M100 46 L104 24" fill="none"/>`,
  },
  {
    naam: "banaan",
    titel: "Banaan",
    groep: "fruit",
    onderwerp: "a single yellow banana, gently curved",
    schets: `<path class="r" d="M40 70 q10 90 120 70 q-90 -10 -100 -80z" fill="#ffd93b"/><path class="r" d="M36 70 l4 -14 l10 6" fill="#7a5a2e"/>`,
  },
];
