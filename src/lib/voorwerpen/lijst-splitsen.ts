/**
 * Voorwerpen van de lessen "Splitsen" naar Squla groep 3 (Splitsen 1, Splitsen 2
 * en Delen; 31 oktober 2026). Rekenmateriaal (splitshuisje, splitspaal, het
 * tienvak, staafjes) is geen voorwerp: dat wordt in code getekend.
 */
import type { Voorwerp } from "./soort";

export const SPLITSEN: Voorwerp[] = [
  {
    naam: "pion",
    titel: "Pion",
    groep: "speelgoed",
    onderwerp: "an orange board game pawn, side view",
    schets: `<circle class="r" cx="100" cy="58" r="30" fill="#ff9a3c"/><path class="r" d="M78 92 h44 l18 70 h-80z" fill="#ff9a3c"/><rect class="r" x="50" y="160" width="100" height="22" rx="8" fill="#ff9a3c"/>`,
  },
  {
    naam: "voetbal",
    titel: "Voetbal",
    groep: "speelgoed",
    onderwerp: "a round black and white soccer ball with classic pentagon pattern",
    schets: `<circle class="r" cx="100" cy="100" r="74" fill="#ffffff"/><path d="M100 72 l26 19 l-10 30 h-32 l-10 -30z" fill="#1d2340"/><path d="M100 26 v18 M30 84 l20 6 M170 84 l-20 6 M56 160 l12 -16 M144 160 l-12 -16" stroke="#1d2340" stroke-width="6"/>`,
  },
  {
    naam: "zak",
    titel: "Dichte zak",
    groep: "winkel",
    onderwerp: "a closed brown burlap sack tied with a rope at the top",
    schets: `<path class="r" d="M70 52 c-40 30 -50 80 -40 112 c6 18 134 18 140 0 c10 -32 0 -82 -40 -112z" fill="#c9965a"/><path class="r" d="M70 52 l-14 -22 h88 l-14 22z" fill="#c9965a"/><path class="r" d="M66 54 h68" fill="none"/>`,
  },
  {
    naam: "pingpongbal",
    titel: "Pingpongbal",
    groep: "speelgoed",
    onderwerp: "a small yellow ping pong ball",
    schets: `<circle class="r" cx="100" cy="100" r="62" fill="#ffd93b"/><path d="M70 74 q14 -16 32 -18" stroke="#fff3a8" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  },
  {
    naam: "doek",
    titel: "Rode doek",
    groep: "huis",
    onderwerp: "a soft red cloth napkin neatly folded in a square, lying flat, seen from slightly above",
    schets: `<path class="r" d="M24 40 q76 -16 152 0 q8 60 0 120 q-76 16 -152 0 q-8 -60 0 -120z" fill="#e8454f"/><path d="M60 50 q10 50 0 100 M120 48 q-8 52 4 104" stroke="#b72f3a" stroke-width="6" fill="none"/>`,
  },
  {
    naam: "tennisbal",
    titel: "Tennisbal",
    groep: "speelgoed",
    onderwerp: "a yellow-green tennis ball with a white curved line",
    schets: `<circle class="r" cx="100" cy="100" r="70" fill="#d6ee3a"/><path d="M46 52 q40 48 0 96 M154 52 q-40 48 0 96" stroke="#ffffff" stroke-width="8" fill="none"/>`,
  },
  {
    naam: "splitsmachine",
    titel: "Splitsmachine",
    groep: "huis",
    onderwerp: "a simple box-shaped toy machine with a funnel on top and two chutes at the bottom, one to the left and one to the right",
    schets: `<path class="r" d="M60 20 h80 l-20 36 h-40z" fill="#9fb4d8"/><rect class="r" x="40" y="56" width="120" height="86" rx="14" fill="#5a8be0"/><circle class="r" cx="100" cy="98" r="16" fill="#ffd93b"/><path class="r" d="M52 142 l-28 34 h30 l18 -34z M148 142 l28 34 h-30 l-18 -34z" fill="#9fb4d8"/>`,
  },
  {
    naam: "bakje",
    titel: "Bakje",
    groep: "huis",
    onderwerp: "an empty light blue plastic bowl, side view",
    schets: `<path class="r" d="M20 80 h160 q-6 80 -80 86 q-74 -6 -80 -86z" fill="#7cc6f0"/><ellipse class="r" cx="100" cy="80" rx="80" ry="14" fill="#bfe6fb"/>`,
  },
  {
    naam: "voetbalshirt",
    titel: "Voetbalshirt",
    groep: "speelgoed",
    onderwerp: "a red short-sleeved football shirt, front view, no text, no number",
    schets: `<path class="r" d="M70 28 q30 18 60 0 l44 26 l-18 36 l-18 -8 v94 h-76 v-94 l-18 8 l-18 -36z" fill="#e8454f"/>`,
  },
  {
    naam: "basketbal",
    titel: "Basketbal",
    groep: "speelgoed",
    onderwerp: "an orange basketball with black lines",
    schets: `<circle class="r" cx="100" cy="100" r="72" fill="#f08a2c"/><path d="M28 100 h144 M100 28 v144 M50 46 q40 54 0 108 M150 46 q-40 54 0 108" stroke="#1d2340" stroke-width="6" fill="none"/>`,
  },
  {
    naam: "knikker",
    titel: "Knikker",
    groep: "speelgoed",
    onderwerp: "a blue glass marble with a swirl inside",
    schets: `<circle class="r" cx="100" cy="100" r="64" fill="#4f8fe8"/><path d="M62 112 q30 -50 76 -18" stroke="#bfe0ff" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  },
  {
    naam: "stuiterbal",
    titel: "Stuiterbal",
    groep: "speelgoed",
    onderwerp: "a small shiny green bouncy ball with a yellow stripe",
    schets: `<circle class="r" cx="100" cy="100" r="62" fill="#3fc06a"/><path d="M40 112 q60 -40 120 0" stroke="#ffd93b" stroke-width="14" fill="none"/>`,
  },
  {
    naam: "pennenbeker",
    titel: "Pennenbeker",
    groep: "huis",
    onderwerp: "an empty round yellow pencil cup with a thin white stripe, side view",
    schets: `<path class="r" d="M50 60 h100 l-10 120 h-80z" fill="#ffc83b"/><ellipse class="r" cx="100" cy="60" rx="50" ry="10" fill="#ffe38a"/>`,
  },
  {
    naam: "potlood",
    titel: "Potlood",
    groep: "huis",
    onderwerp: "a single green pencil with a sharpened tip, standing upright",
    schets: `<rect class="r" x="84" y="40" width="32" height="120" fill="#3fb36a"/><path class="r" d="M84 40 l16 -28 l16 28z" fill="#f2d2a0"/><rect class="r" x="84" y="160" width="32" height="18" fill="#f29aa8"/>`,
  },
];
