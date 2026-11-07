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
  /* Ronde 4, 7 november 2026 (Sara: in squla-rekenmix-mix2-1 waren alle boterhammen dezelfde 3). Brood en plakjes uit 1 Magnific-vel
     (stijl B), in code samengezet met precies 1, 3 of 6 plakjes. Wit brood: banaan, tomaat; bruin brood: komkommer, ei. */
  { naam: "boterham-banaan-weinig", titel: "Boterham (wit) met weinig banaan (1)", groep: "eten", onderwerp: "a slice of white bread seen from above with one round yellow banana slice on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#f3d9a8"/><circle class="r" cx="100" cy="110" r="18" fill="#ffe27a"/>` },
  { naam: "boterham-banaan-veel", titel: "Boterham (wit) met veel banaan (3)", groep: "eten", onderwerp: "a slice of white bread seen from above with 3 round yellow banana slices on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#f3d9a8"/><circle class="r" cx="70" cy="90" r="18" fill="#ffe27a"/><circle class="r" cx="130" cy="90" r="18" fill="#ffe27a"/><circle class="r" cx="100" cy="140" r="18" fill="#ffe27a"/>` },
  { naam: "boterham-banaan-heel-veel", titel: "Boterham (wit) met heel veel banaan (6)", groep: "eten", onderwerp: "a slice of white bread seen from above with 6 round yellow banana slices on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#f3d9a8"/><circle class="r" cx="60" cy="90" r="18" fill="#ffe27a"/><circle class="r" cx="100" cy="90" r="18" fill="#ffe27a"/><circle class="r" cx="140" cy="90" r="18" fill="#ffe27a"/><circle class="r" cx="60" cy="140" r="18" fill="#ffe27a"/><circle class="r" cx="100" cy="140" r="18" fill="#ffe27a"/><circle class="r" cx="140" cy="140" r="18" fill="#ffe27a"/>` },
  { naam: "boterham-komkommer-weinig", titel: "Boterham (bruin) met weinig komkommer (1)", groep: "eten", onderwerp: "a slice of brown wholemeal bread seen from above with one round green cucumber slice on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#b98a5a"/><circle class="r" cx="100" cy="110" r="18" fill="#9ed37a"/>` },
  { naam: "boterham-komkommer-veel", titel: "Boterham (bruin) met veel komkommer (3)", groep: "eten", onderwerp: "a slice of brown wholemeal bread seen from above with 3 round green cucumber slices on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#b98a5a"/><circle class="r" cx="70" cy="90" r="18" fill="#9ed37a"/><circle class="r" cx="130" cy="90" r="18" fill="#9ed37a"/><circle class="r" cx="100" cy="140" r="18" fill="#9ed37a"/>` },
  { naam: "boterham-komkommer-heel-veel", titel: "Boterham (bruin) met heel veel komkommer (6)", groep: "eten", onderwerp: "a slice of brown wholemeal bread seen from above with 6 round green cucumber slices on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#b98a5a"/><circle class="r" cx="60" cy="90" r="18" fill="#9ed37a"/><circle class="r" cx="100" cy="90" r="18" fill="#9ed37a"/><circle class="r" cx="140" cy="90" r="18" fill="#9ed37a"/><circle class="r" cx="60" cy="140" r="18" fill="#9ed37a"/><circle class="r" cx="100" cy="140" r="18" fill="#9ed37a"/><circle class="r" cx="140" cy="140" r="18" fill="#9ed37a"/>` },
  { naam: "boterham-tomaat-weinig", titel: "Boterham (wit) met weinig tomaat (1)", groep: "eten", onderwerp: "a slice of white bread seen from above with one round red tomato slice on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#f3d9a8"/><circle class="r" cx="100" cy="110" r="18" fill="#e8453c"/>` },
  { naam: "boterham-tomaat-veel", titel: "Boterham (wit) met veel tomaat (3)", groep: "eten", onderwerp: "a slice of white bread seen from above with 3 round red tomato slices on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#f3d9a8"/><circle class="r" cx="70" cy="90" r="18" fill="#e8453c"/><circle class="r" cx="130" cy="90" r="18" fill="#e8453c"/><circle class="r" cx="100" cy="140" r="18" fill="#e8453c"/>` },
  { naam: "boterham-tomaat-heel-veel", titel: "Boterham (wit) met heel veel tomaat (6)", groep: "eten", onderwerp: "a slice of white bread seen from above with 6 round red tomato slices on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#f3d9a8"/><circle class="r" cx="60" cy="90" r="18" fill="#e8453c"/><circle class="r" cx="100" cy="90" r="18" fill="#e8453c"/><circle class="r" cx="140" cy="90" r="18" fill="#e8453c"/><circle class="r" cx="60" cy="140" r="18" fill="#e8453c"/><circle class="r" cx="100" cy="140" r="18" fill="#e8453c"/><circle class="r" cx="140" cy="140" r="18" fill="#e8453c"/>` },
  { naam: "boterham-ei-weinig", titel: "Boterham (bruin) met weinig ei (1)", groep: "eten", onderwerp: "a slice of brown wholemeal bread seen from above with one round slice of hard-boiled egg on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#b98a5a"/><circle class="r" cx="100" cy="110" r="18" fill="#fff6e0"/>` },
  { naam: "boterham-ei-veel", titel: "Boterham (bruin) met veel ei (3)", groep: "eten", onderwerp: "a slice of brown wholemeal bread seen from above with 3 round slices of hard-boiled egg on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#b98a5a"/><circle class="r" cx="70" cy="90" r="18" fill="#fff6e0"/><circle class="r" cx="130" cy="90" r="18" fill="#fff6e0"/><circle class="r" cx="100" cy="140" r="18" fill="#fff6e0"/>` },
  { naam: "boterham-ei-heel-veel", titel: "Boterham (bruin) met heel veel ei (6)", groep: "eten", onderwerp: "a slice of brown wholemeal bread seen from above with 6 round slices of hard-boiled egg on it", schets: `<path class="r" d="M24 186 V70 Q24 20 70 26 Q100 2 130 26 Q176 20 176 70 V186 Z" fill="#b98a5a"/><circle class="r" cx="60" cy="90" r="18" fill="#fff6e0"/><circle class="r" cx="100" cy="90" r="18" fill="#fff6e0"/><circle class="r" cx="140" cy="90" r="18" fill="#fff6e0"/><circle class="r" cx="60" cy="140" r="18" fill="#fff6e0"/><circle class="r" cx="100" cy="140" r="18" fill="#fff6e0"/><circle class="r" cx="140" cy="140" r="18" fill="#fff6e0"/>` },
  /* Ronde 4, 7 november 2026 (Sara: de plaatjes in squla-rekenmix-mix3-1 waren niet mooi). Nieuwe Magnific-plaatjes (stijl B),
     ALLEEN voor mix3-1 ("klein, kleiner, kleinst" enz.). De oude bal, appel, ster … in andere lessen blijven zoals ze waren.
     De kaars heeft geen vlam: het vlammetje is een los plaatje, zodat een dikke kaars dik wordt zonder dat de vlam uitrekt. */
  { naam: "bal-maat", titel: "Voetbal (op volgorde)", groep: "speelgoed", onderwerp: "one classic soccer ball with black pentagons and white hexagons, round and shiny", schets: `<circle class="r" cx="100" cy="100" r="80" fill="#ffffff"/><path class="r" d="M100 70 l28 20 -10 32 h-36 l-10 -32z" fill="#2a2a33"/>` },
  { naam: "kaars-maat", titel: "Kaars zonder vlam (op volgorde)", groep: "huis", onderwerp: "one unlit red pillar candle standing upright, a straight cylinder seen from the front, short black wick, no flame, a few small wax drips at the top edge", schets: `<rect class="r" x="70" y="40" width="60" height="140" rx="8" fill="#e8453c"/><path class="r" d="M100 40 v-16" fill="none"/>` },
  { naam: "vlammetje", titel: "Vlammetje van een kaars", groep: "huis", onderwerp: "one small candle flame on its own, a teardrop shape, yellow inside and orange outside", schets: `<path class="r" d="M100 30 Q150 110 100 170 Q50 110 100 30z" fill="#ffa04d"/>` },
  { naam: "huis-maat", titel: "Huis (op volgorde)", groep: "huis", onderwerp: "one cute little house seen from the front, yellow walls, red pointed roof with a small chimney, a blue front door and two square windows", schets: `<path class="r" d="M30 96 L100 30 L170 96z" fill="#e8453c"/><rect class="r" x="44" y="96" width="112" height="84" fill="#ffd93d"/><rect class="r" x="88" y="126" width="26" height="54" fill="#3f8ff0"/>` },
  { naam: "potlood-maat", titel: "Potlood (op volgorde)", groep: "huis", onderwerp: "one yellow wooden pencil standing perfectly upright and straight, sharpened point at the top, pink eraser with a silver band at the bottom", schets: `<path class="r" d="M100 16 L118 56 V170 H82 V56z" fill="#ffd93d"/><rect class="r" x="82" y="160" width="36" height="24" rx="6" fill="#f59ab0"/>` },
  { naam: "blok-maat-rood", titel: "Rood speelblok van voren (toren)", groep: "speelgoed", onderwerp: "one red square toy building block seen straight from the front, slightly rounded corners, with a small raised yellow star on the front", schets: `<rect class="r" x="30" y="30" width="140" height="140" rx="14" fill="#e8453c"/>` },
  { naam: "blok-maat-blauw", titel: "Blauw speelblok van voren (toren)", groep: "speelgoed", onderwerp: "one blue square toy building block seen straight from the front, slightly rounded corners, with a small raised yellow star on the front", schets: `<rect class="r" x="30" y="30" width="140" height="140" rx="14" fill="#3f8ff0"/>` },
  { naam: "blok-maat-groen", titel: "Groen speelblok van voren (toren)", groep: "speelgoed", onderwerp: "one green square toy building block seen straight from the front, slightly rounded corners, with a small raised yellow star on the front", schets: `<rect class="r" x="30" y="30" width="140" height="140" rx="14" fill="#38c060"/>` },
  { naam: "blok-maat-paars", titel: "Paars speelblok van voren (toren)", groep: "speelgoed", onderwerp: "one purple square toy building block seen straight from the front, slightly rounded corners, with a small raised yellow star on the front", schets: `<rect class="r" x="30" y="30" width="140" height="140" rx="14" fill="#a54be0"/>` },
  { naam: "appel-maat", titel: "Appel (op volgorde)", groep: "fruit", onderwerp: "one shiny red apple with a short brown stem and one green leaf", schets: `<circle class="r" cx="100" cy="110" r="70" fill="#e8453c"/><path class="r" d="M100 44 q4 -20 14 -26" fill="none"/>` },
  { naam: "boom-maat", titel: "Boom (op volgorde)", groep: "natuur", onderwerp: "one leafy tree with a big fluffy round green crown and a straight brown trunk, no fruit", schets: `<rect class="r" x="88" y="110" width="24" height="76" fill="#8a5a33"/><circle class="r" cx="100" cy="80" r="64" fill="#5fb84a"/>` },
  { naam: "ster-maat", titel: "Ster (op volgorde)", groep: "ruimte", onderwerp: "one shiny golden yellow five-pointed star with softly rounded points", schets: `<path class="r" d="M100 20 L122 76 L182 78 L134 114 L152 172 L100 138 L48 172 L66 114 L18 78 L78 76z" fill="#ffd23f"/>` },
  { naam: "raket-maat", titel: "Raketje (op volgorde)", groep: "ruimte", onderwerp: "one toy space rocket standing upright, white body with a red pointed nose cone, a round blue window, three red fins and a small orange flame at the bottom", schets: `<path class="r" d="M100 16 Q140 60 136 150 H64 Q60 60 100 16z" fill="#f3efe4"/><circle class="r" cx="100" cy="86" r="18" fill="#3f8ff0"/>` },
];
