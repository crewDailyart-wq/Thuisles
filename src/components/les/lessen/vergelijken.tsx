/**
 * Lessen van "Vergelijken", naar de Synthesis-unit "Compare the Pair"
 * (INSPIRATIE.md, ronde 1 en 2, en blok K). Groep 3.
 *
 * 1. Instaptoets: grootste groep, gelijk maken, een getal bij < en >.
 * 2. Meer of minder: grootste groep, hoeveel meer, één kleur tussen andere
 *    kleuren, gelijk maken.
 * 3. De tekens: =, < en > ontdekken en gebruiken bij groepen blokjes.
 * 4. Getallen vergelijken: dezelfde tekens bij losse getallen.
 * 5. Eindtoets: als de instaptoets, met andere getallen.
 *
 * Bij een fout helpt het beeld (blokjes netjes onderaan, andere kleuren weg,
 * het gele stipje bij de kleine kant, de getallen erbij) en komt de vraag
 * terug. De tekens heten altijd voluit: "is gelijk aan", "is kleiner dan",
 * "is groter dan".
 *
 * Vlakken: ../vlakken/vergelijken-kaarten.tsx en ../vlakken/vergelijken-getallen.tsx.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { VergelijkenGetallen, type Deel, type GetallenProps, type Teken } from "../vlakken/vergelijken-getallen";
import { VAKKLEUR, VergelijkenKaarten, type Kant, type KaartenProps, type Vakkleur } from "../vlakken/vergelijken-kaarten";

type Kleur = Exclude<Vakkleur, "">;

/* ---------- algemeen ---------- */

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/** `n` blokjes van één kleur, door elkaar over de kaart. */
function verspreid(n: number, kleur: Kleur, rijen: number): Vakkleur[] {
  const plekken = schud(Array.from({ length: rijen * 2 }, (_, i) => i)).slice(0, n);
  return Array.from({ length: rijen * 2 }, (_, i) => (plekken.includes(i) ? kleur : ""));
}

/** `n` blokjes van één kleur, netjes van onderen gevuld (links eerst). */
function onderaan(n: number, kleur: Kleur, rijen: number): Vakkleur[] {
  const uit: Vakkleur[] = Array(rijen * 2).fill("");
  let over = n;
  for (let r = rijen - 1; r >= 0 && over > 0; r--) {
    for (const k of [0, 1]) {
      if (over > 0) {
        uit[r * 2 + k] = kleur;
        over--;
      }
    }
  }
  return uit;
}

/** Een kaart met meer kleuren door elkaar. */
function gemengd(aantallen: Partial<Record<Kleur, number>>, rijen: number): Vakkleur[] {
  const kleuren: Vakkleur[] = [];
  for (const [k, n] of Object.entries(aantallen) as [Kleur, number][]) for (let i = 0; i < n; i++) kleuren.push(k);
  while (kleuren.length < rijen * 2) kleuren.push("");
  return schud(kleuren);
}

function tel(v: Vakkleur[], kleur?: Kleur): number {
  return v.filter((k) => (kleur ? k === kleur : k !== "")).length;
}

const WOORD: Record<Exclude<Teken, "?">, string> = { "=": "is gelijk aan", "<": "is kleiner dan", ">": "is groter dan" };

/** Het goede teken tussen a en b. */
function tekenVoor(a: number, b: number): Exclude<Teken, "?"> {
  return a === b ? "=" : a < b ? "<" : ">";
}

/** "{5} is groter dan {4}." */
function zin(a: number, t: Exclude<Teken, "?">, b: number): string {
  return `{${a}} ${WOORD[t]} {${b}}`;
}

function blokjes(n: number): string {
  return n === 1 ? "blokje" : "blokjes";
}

/** "Links zijn het er {4}, rechts {6}." (bij 1: "Links is er {1}, …") */
function linksRechts(a: number, b: number): string {
  return `${a === 1 ? "Links is er {1}" : `Links zijn het er {${a}}`}, rechts {${b}}.`;
}

/* ---------- de vlakken bedienen ---------- */

type Kaartmelding = { soort: string; kant?: Kant; links: number; rechts: number; teken?: Teken };
type Getalmelding = { soort: string; index: number; n?: number; s?: Teken; delen: Deel[] };

function kaarten(l: Lesgids) {
  let zet = 0;
  const leeg: Partial<KaartenProps> = {
    kies: false,
    tik: null,
    kader: null,
    telKleur: null,
    alleen: null,
    teken: null,
    tekenTik: false,
    stip: null,
    naam: null,
    aantallen: false,
    pijl: null,
    klaar: false,
  };
  return {
    toon(links: Vakkleur[], rechts: Vakkleur[], extra: Partial<KaartenProps> = {}) {
      zet++;
      l.vlak<KaartenProps>(VergelijkenKaarten, { ...leeg, ...extra, links, rechts, zet });
    },
    /** Nieuwe kaarten; alles wat niet in `extra` staat, gaat uit. */
    nieuw(links: Vakkleur[], rechts: Vakkleur[], extra: Partial<KaartenProps> = {}) {
      zet++;
      l.pasVlakAan<KaartenProps>({ ...leeg, ...extra, links, rechts, zet });
    },
    pas(p: Partial<KaartenProps>) {
      l.pasVlakAan<KaartenProps>(p);
    },
  };
}

function getallen(l: Lesgids) {
  let zet = 0;
  return {
    toon(delen: Deel[], extra: Partial<GetallenProps> = {}) {
      zet++;
      l.vlak<GetallenProps>(VergelijkenGetallen, { naam: null, stip: null, klaar: false, ...extra, delen, zet });
    },
    nieuw(delen: Deel[], extra: Partial<GetallenProps> = {}) {
      zet++;
      l.pasVlakAan<GetallenProps>({ naam: null, stip: null, klaar: false, ...extra, delen, zet });
    },
    pas(p: Partial<GetallenProps>) {
      l.pasVlakAan<GetallenProps>(p);
    },
  };
}

type K = ReturnType<typeof kaarten>;
type G = ReturnType<typeof getallen>;

/* ---------- opdrachten die vaker terugkomen ---------- */

/**
 * "Tik op de grootste groep." Bij een fout wordt het beeld makkelijker
 * (blokjes onderaan, of de andere kleuren weg) en komt de vraag terug.
 * Geeft terug: "goed" (meteen), "herkansing" (goed na de hulp) of
 * "uitgelegd" (de les heeft het antwoord al gezegd).
 */
type Uitslag = "goed" | "herkansing" | "uitgelegd";

async function grootsteGroep(
  l: Lesgids,
  k: K,
  links: Vakkleur[],
  rechts: Vakkleur[],
  vraag: string,
  opties: { kleur?: Kleur; toets?: boolean } = {},
): Promise<Uitslag> {
  const { kleur, toets } = opties;
  const a = tel(links, kleur);
  const b = tel(rechts, kleur);
  const goed: Kant = a > b ? "links" : "rechts";
  const rijen = links.length / 2;
  k.nieuw(links, rechts, { telKleur: kleur ?? null });
  await l.zeg(vraag, "Tik dan op het vinkje.");
  k.pas({ kies: true });
  for (let poging = 0; ; poging++) {
    const g = await l.wachtOpVlak<Kaartmelding>("kaart");
    k.pas({ kies: false, kader: { kant: g.kant ?? goed, kleur } });
    if (g.kant === goed) return poging === 0 ? "goed" : "herkansing";
    if (poging >= 1) {
      k.pas({ kader: { kant: goed, kleur } });
      const naamKleur = kleur ? `${kleur === "groen" ? "groene" : kleur === "blauw" ? "blauwe" : "oranje"} ` : "";
      await l.zeg(`Links zijn het {${a}} ${naamKleur}blokjes.`, `Rechts zijn het er {${b}}.`, `De ${goed === "links" ? "linker" : "rechter"} groep heeft er meer.`);
      await l.verder();
      return "uitgelegd";
    }
    if (kleur && (links.some((x) => x !== "" && x !== kleur) || rechts.some((x) => x !== "" && x !== kleur))) {
      await l.zeg(toets ? "Hmm, kijk nog eens." : "Geen zorgen.", "Ik haal de andere kleuren even weg.");
      k.nieuw(links, rechts, { telKleur: kleur, alleen: kleur });
    } else {
      await l.zeg(toets ? "Hmm, kijk nog eens." : "Geen zorgen, ik help je even.", "Ik zet de blokjes netjes onderaan.");
      const kl = (links.find((x) => x !== "") || "blauw") as Kleur;
      const kr = (rechts.find((x) => x !== "") || "oranje") as Kleur;
      k.nieuw(onderaan(a, kl, rijen), onderaan(b, kr, rijen));
    }
    await l.zeg("Tik nu op de grootste groep.");
    k.pas({ kies: true });
  }
}

/**
 * "Maak de groepen gelijk": het kind zet blauwe blokjes aan of uit.
 * `uitleg`: bij de eerste fout eerst vragen wat "gelijk" betekent.
 */
async function gelijkMaken(
  l: Lesgids,
  k: K,
  links: Vakkleur[],
  rechts: Vakkleur[],
  zinnen: string[],
  opties: { toets?: boolean; uitleg?: boolean } = {},
): Promise<boolean> {
  const doel = tel(rechts);
  const start = tel(links);
  const rijen = links.length / 2;
  k.nieuw(links, rechts, { pijl: "links" });
  await l.zeg(...zinnen);
  k.pas({ tik: "links", klaar: true });
  for (let poging = 0; ; poging++) {
    const g = await l.wachtOpVlak<Kaartmelding>("klaar");
    if (g.links === doel) {
      k.pas({ tik: null, klaar: false, pijl: null, aantallen: true });
      return poging === 0;
    }
    k.pas({ tik: null, klaar: false });
    if (opties.toets) {
      k.pas({ aantallen: true });
      if (poging >= 1) {
        k.nieuw(onderaan(doel, "blauw", rijen), rechts, { aantallen: true });
        await l.zeg(`Kijk: zo zijn er aan elke kant {${doel}}.`, "Dan zijn de groepen gelijk.");
        await l.verder();
        return false;
      }
      await l.zeg(linksRechts(g.links, doel), "Dat is nog niet gelijk.", "Probeer het nog eens.");
    } else if (poging === 0 && opties.uitleg) {
      await l.zeg("Ik help je even.", "Weet je wat *gelijk* betekent?");
      const b = await l.kies(["Hetzelfde", "Anders"]);
      await l.zeg(b === "Hetzelfde" ? "Helemaal goed." : "Gelijk betekent hetzelfde.", "Gelijke groepen hebben evenveel blokjes.");
      await l.verder();
      k.nieuw(links, rechts, { pijl: "links" });
      await l.zeg("Zijn *deze* groepen gelijk?");
      const zijn = await l.kies(["Ja", "Nee"]);
      if (zijn === "Nee") {
        await l.zeg("Klopt, ze zijn nog niet gelijk.");
      } else {
        await l.zeg(`Kijk, links zijn het er {${start}}.`, `Rechts zijn het er {${doel}}.`, "Ze zijn nog niet gelijk.");
      }
      await l.zeg("Verander de blauwe kant tot ze gelijk zijn.");
    } else {
      k.pas({ aantallen: true });
      await l.zeg(
        linksRechts(g.links, doel),
        g.links < doel ? `Je hebt er nog {${doel - g.links}} nodig.` : `Er ${g.links - doel === 1 ? "is" : "zijn"} er {${g.links - doel}} te veel.`,
      );
    }
    k.pas({ tik: "links", klaar: true });
  }
}

/**
 * Een getal kiezen voor het vraagteken ("8 < ?"). Elk getal dat klopt is goed.
 * Bij een fout komt de bewering terug als vraag.
 */
async function vulIn(
  l: Lesgids,
  g: G,
  a: number | null,
  t: Exclude<Teken, "?">,
  b: number | null,
  voorbeeld: number,
  zinnen: string[],
): Promise<boolean> {
  const delen = (x: number | null): Deel[] => [
    a === null ? (x === null ? { t: "vraag" } : { t: "getal", n: x }) : { t: "getal", n: a },
    { t: "teken", s: t },
    b === null ? (x === null ? { t: "vraag" } : { t: "getal", n: x }) : { t: "getal", n: b },
  ];
  const klopt = (x: number) => {
    const p = a ?? x;
    const q = b ?? x;
    return tekenVoor(p, q) === t;
  };
  const bekend = (a ?? b) as number;
  const hint =
    t === "="
      ? `Zoek het getal dat gelijk is aan {${bekend}}.`
      : a === null
        ? `Zoek een getal dat ${t === "<" ? "kleiner" : "groter"} is dan {${bekend}}.`
        : `Zoek een getal dat ${t === "<" ? "groter" : "kleiner"} is dan {${bekend}}.`;
  g.nieuw(delen(null));
  await l.zeg(...zinnen);
  for (let poging = 0; ; poging++) {
    const x = await l.getal();
    if (x !== null && klopt(x)) {
      g.nieuw(delen(x));
      await l.zeg("Helemaal goed.", `${zin(a ?? x, t, b ?? x)}.`);
      return poging === 0;
    }
    if (poging >= 1) {
      g.nieuw(delen(voorbeeld));
      await l.zeg(`Bijvoorbeeld {${voorbeeld}}.`, `${zin(a ?? voorbeeld, t, b ?? voorbeeld)}.`);
      await l.verder();
      return false;
    }
    if (x === null) {
      await l.zeg("Geen zorgen.", hint);
    } else {
      g.nieuw(delen(x));
      await l.zeg(`${zin(a ?? x, t, b ?? x)}?`, "Dat klopt nog niet.", hint);
      g.nieuw(delen(null));
    }
  }
}

/* ---------- kaarttekeningen ---------- */

function Lijnkaart({ x, n, kleur, vol }: { x: number; n: number; kleur: string; vol: number[] }) {
  return (
    <g stroke={kleur} strokeWidth="3" fill="none" strokeLinejoin="round">
      {Array.from({ length: n }, (_, i) => {
        const cx = x + (i % 2) * 34;
        const cy = 30 + Math.floor(i / 2) * 34;
        return (
          <g key={i} transform={`rotate(${i % 3 === 0 ? -2 : 2} ${cx + 14} ${cy + 14})`}>
            <rect x={cx} y={cy} width="28" height="28" rx="5" />
            {vol.includes(i) && <path d={`M${cx + 7} ${cy + 21} L${cx + 21} ${cy + 7}`} />}
          </g>
        );
      })}
    </g>
  );
}

function KaartGroepen() {
  return (
    <g>
      <Lijnkaart x={44} n={8} kleur={VAKKLEUR.blauw} vol={[1, 3, 4, 5, 6, 7]} />
      <Lijnkaart x={140} n={8} kleur={VAKKLEUR.oranje} vol={[3, 5, 6, 7]} />
    </g>
  );
}

function KaartTekens() {
  return (
    <g>
      <Lijnkaart x={30} n={6} kleur={VAKKLEUR.blauw} vol={[3, 4, 5]} />
      <polyline points="134,80 110,96 134,112" fill="none" stroke="#f3ecdf" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <Lijnkaart x={152} n={6} kleur={VAKKLEUR.groen} vol={[0, 1, 2, 3, 4, 5]} />
    </g>
  );
}

function KaartGetallen() {
  return (
    <g fontFamily="var(--font-les), sans-serif" fontWeight="700" fontSize="78" textAnchor="middle">
      <text x="56" y="126" fill="none" stroke="#3bbfe6" strokeWidth="3">
        6
      </text>
      <polyline points="104,72 140,96 104,120" fill="none" stroke="#f3ecdf" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="190" y="126" fill="none" stroke="#fde01a" strokeWidth="3">
        3
      </text>
    </g>
  );
}

/* ---------- de toets (instap en eind) ---------- */

type Toetsgetallen = {
  groot: [number, number];
  gelijk: [number, number];
  kleinerDan: number;
  groterDan: number;
};

async function toets(l: Lesgids, t: Toetsgetallen) {
  const k = kaarten(l);
  k.toon(verspreid(7, "blauw", 5), verspreid(7, "oranje", 5));
  await l.zeg("In dit onderdeel gaan we groepen en getallen vergelijken.", "Denk je dat je hier al goed in bent?");
  const al = await l.kies(["Ja", "Nee"]);
  if (al === "Ja") {
    /* Zoals Synthesis: na "ja" kiest het kind tussen de toets en de eerste les. */
    await l.zeg("Goed.", "Wil je een korte toets doen?", "Of begin je liever bij de eerste les?");
    const keuze = await l.kies(["Toets", "Eerste les"]);
    if (keuze === "Eerste les") {
      await l.zeg("Prima.", 'Begin dan met de les "Meer of minder".', "Daar oefenen we het samen.");
      return;
    }
    await l.zeg("Mooi.", "Laat maar zien wat je kunt.");
  } else {
    await l.zeg("Geen probleem.", "We kijken gewoon wat je al weet.");
  }

  /* Vraag 1: de grootste groep. */
  const [gb, go] = t.groot;
  const g1 = await grootsteGroep(l, k, verspreid(gb, "blauw", 5), verspreid(go, "oranje", 5), "Tik op de grootste groep.", { toets: true });
  if (g1 !== "uitgelegd") await l.zeg(g1 === "goed" ? "Ja." : "Goed zo.", `De blauwe groep heeft er {${gb}}.`);
  await l.wacht(600);

  /* Vraag 2: gelijk maken. */
  const [eb, eo] = t.gelijk;
  const g2 = await gelijkMaken(l, k, verspreid(eb, "blauw", 5), verspreid(eo, "oranje", 5), ["Zet blauwe blokjes erbij of haal ze weg.", "Maak de groepen gelijk.", "Tik dan op het vinkje."], {
    toets: true,
  });
  if (g2) await l.zeg("Netjes gedaan.", `{${eo}} blokjes aan elke kant.`, "De groepen zijn gelijk.");
  await l.verder();

  /* Vraag 3 en 4: een getal bij een teken. */
  const g = getallen(l);
  g.toon([{ t: "getal", n: t.kleinerDan }, { t: "teken", s: "<" }, { t: "vraag" }]);
  await vulIn(l, g, t.kleinerDan, "<", null, Math.min(9, t.kleinerDan + 1), ["Nu vergelijken we getallen met tekens.", "Welk getal past op het vraagteken?"]);
  await l.wacht(600);
  await vulIn(l, g, null, ">", t.groterDan, Math.min(9, t.groterDan + 3), ["Nog één, dan zijn we klaar.", "Welk getal past op het vraagteken?"]);
  await l.wacht(600);

  const tik = l.kaart();
  await l.zeg(l.naam ? `Knap gedaan, ${l.naam}!` : "Knap gedaan!", "Je kunt groepen en getallen vergelijken.", "Tik op de kaart om hem af te vinken.");
  await tik;
}

/* ---------- les 1: instaptoets ---------- */

const instaptoets: Lesdraaiboek = {
  id: "vergelijken-instaptoets",
  titel: "Instaptoets: vergelijken",
  synthesis: "Compare the Pair · Assessment",
  kaarttekening: KaartGroepen,
  async speel(l) {
    await toets(l, { groot: [7, 6], gelijk: [8, 6], kleinerDan: 8, groterDan: 8 });
  },
};

/* ---------- les 2: meer of minder ---------- */

const meerOfMinder: Lesdraaiboek = {
  id: "vergelijken-meer-of-minder",
  titel: "Meer of minder",
  synthesis: "Compare the Pair · More or Less",
  kaarttekening: KaartGroepen,

  async speel(l) {
    const k = kaarten(l);
    k.toon(Array(6).fill(""), Array(6).fill(""));
    await l.zeg("Vandaag gaan we groepen vergelijken.");
    await l.verder();

    /* 1. De grootste groep. Na de hulp (blokjes onderaan) ook gewoon "dat klopt". */
    let foutloos = true;
    let r = await grootsteGroep(l, k, verspreid(3, "blauw", 3), verspreid(5, "oranje", 3), "Tik op de grootste groep.");
    if (r !== "uitgelegd") await l.zeg("Dat klopt.", "De oranje groep is hier de grootste.");
    foutloos &&= r === "goed";
    await l.wacht(500);
    r = await grootsteGroep(l, k, verspreid(2, "blauw", 3), verspreid(4, "oranje", 3), "Tik op de groep met de meeste blokjes.");
    if (r !== "uitgelegd") await l.zeg("Dat klopt.", "De oranje groep heeft meer blokjes.");
    foutloos &&= r === "goed";
    await l.wacht(500);

    /* 2. Hoeveel meer? */
    const b8 = verspreid(8, "blauw", 5);
    const o9 = verspreid(9, "oranje", 5);
    r = await grootsteGroep(l, k, b8, o9, "Tik op de grootste groep.");
    if (r !== "uitgelegd") await l.zeg("Precies.");
    foutloos &&= r === "goed";
    await l.zeg("Maar weet je ook hoeveel *meer*?", "Hoeveel oranje blokjes zijn er meer?");
    for (let poging = 0; ; poging++) {
      const x = await l.getal();
      if (x === 1) {
        await l.zeg("Dat klopt.", "Er is {1} oranje blokje meer.");
        break;
      }
      foutloos = false;
      if (poging >= 1) {
        await l.zeg("Kijk, er steekt {1} oranje blokje boven de blauwe uit.", "Er is {1} oranje blokje meer.");
        await l.verder();
        break;
      }
      await l.zeg(x === null ? "Geen zorgen." : `{${x}} oranje blokjes meer?`, x === null ? "Ik help je." : "Niet helemaal.");
      k.nieuw(onderaan(8, "blauw", 5), onderaan(9, "oranje", 5), { kader: { kant: "rechts" } });
      await l.zeg("Ik heb de blokjes netjes neergezet.", "Nu vergelijk je ze makkelijker.", "Hoeveel oranje blokjes zijn er meer?");
    }
    /* Synthesis maakt het moeilijker omdat het goed gaat; anders zegt hij gewoon dat er iets nieuws komt. */
    if (foutloos) await l.zeg(l.naam ? `${l.naam}, dit gaat je makkelijk af.` : "Dit gaat je makkelijk af.", "De volgende wordt iets moeilijker.");
    else await l.zeg("Goed geoefend.", "Nu komt er iets nieuws.");
    await l.verder();

    /* 3. Eén kleur tussen andere kleuren. */
    r = await grootsteGroep(l, k, gemengd({ groen: 4, blauw: 1, oranje: 1 }, 3), gemengd({ groen: 3, oranje: 2, blauw: 1 }, 3), "Tik op het rooster met de meeste groene blokjes.", { kleur: "groen" });
    if (r !== "uitgelegd") await l.zeg("Ja.", "Die groep heeft meer groen.");
    await l.wacht(500);
    r = await grootsteGroep(l, k, gemengd({ blauw: 3, groen: 2, oranje: 1 }, 3), gemengd({ blauw: 2, oranje: 2, groen: 2 }, 3), "Tik op het rooster met de meeste blauwe blokjes.", { kleur: "blauw" });
    if (r !== "uitgelegd") await l.zeg(l.naam ? `Goed zo, ${l.naam}.` : "Goed zo.", "De linker groep heeft het meeste blauw.");
    await l.wacht(500);
    r = await grootsteGroep(l, k, gemengd({ groen: 8, blauw: 1, oranje: 1 }, 5), gemengd({ groen: 6, oranje: 2, blauw: 2 }, 5), "Tik op het rooster met de meeste groene blokjes.", { kleur: "groen" });
    if (r !== "uitgelegd") await l.zeg("Dat klopt.", "De linker groep heeft meer groen.");
    await l.zeg(l.naam ? `${l.naam}, je doet het heel goed.` : "Je doet het heel goed.", "We oefenen nog één ding.");
    await l.verder();

    /* 4. Gelijk maken. */
    const zinnen = ["Zet blauwe blokjes erbij of haal ze weg.", "Maak de groepen *gelijk*.", "Tik dan op het vinkje."];
    if (await gelijkMaken(l, k, verspreid(3, "blauw", 3), verspreid(4, "oranje", 3), zinnen, { uitleg: true })) {
      await l.zeg("Goed zo.", "De groepen zijn gelijk.", "{4} blokjes aan elke kant.");
    } else {
      await l.zeg("Ja!", "De groepen zijn gelijk.", "{4} blokjes aan elke kant.");
    }
    await l.verder();
    await gelijkMaken(l, k, verspreid(5, "blauw", 3), verspreid(4, "oranje", 3), ["Maak de groepen weer gelijk.", "Verander alleen de blauwe kant."]);
    await l.zeg("Netjes gedaan.", "{4} blokjes aan elke kant.", "De groepen zijn gelijk.");
    await l.verder();
    await gelijkMaken(l, k, verspreid(7, "blauw", 5), verspreid(9, "oranje", 5), ["Nog één keer.", "Maak de groepen gelijk."]);
    await l.zeg("Heel goed.", "De groepen zijn gelijk.", "{9} blokjes aan elke kant.");
    await l.verder();

    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}!` : "Knap gedaan!", "Groepen vergelijken lukt je al goed.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- les 3: de tekens ---------- */

/** Het kind tikt `n` vakjes aan aan één kant; andere tikken worden uitgelegd. */
async function tikVakjes(l: Lesgids, k: K, kant: Kant, n: number, stand: { links: number; rechts: number }) {
  k.pas({ tik: kant });
  for (;;) {
    const g = await l.wachtOpVlak<Kaartmelding>("vakje");
    stand.links = g.links;
    stand.rechts = g.rechts;
    if (g[kant] === n) break;
    if (g[kant] > n) {
      k.pas({ tik: null });
      await l.zeg("Dat zijn er te veel.", "Tik op een blokje om het weg te halen.");
      k.pas({ tik: kant });
    }
  }
  k.pas({ tik: null });
}

/** Kaarten waarop `n` vakjes aan staan, voor de herhaling. */
function vol(n: number, kleur: Kleur): Vakkleur[] {
  return onderaan(n, kleur, 3);
}

const tekens: Lesdraaiboek = {
  id: "vergelijken-tekens",
  titel: "De tekens =, < en >",
  synthesis: "Compare the Pair · Comparison Symbols",
  kaarttekening: KaartTekens,

  async speel(l) {
    /* 1. Drie verstopte tekens. */
    const g = getallen(l);
    g.toon([
      { t: "teken", s: "?", tik: true },
      { t: "teken", s: "?", tik: true },
      { t: "teken", s: "?", tik: true },
    ]);
    await l.zeg("Kijk eens naar deze vraagtekens.", "Tik ze alle drie aan.", "Er zitten belangrijke tekens achter.");
    let eerste = true;
    let blijf = false;
    let gevonden: Teken[] = ["?", "?", "?"];
    for (;;) {
      const m = await l.wachtOpVlak<Getalmelding>("teken");
      gevonden = m.delen.map((d) => (d.t === "teken" ? d.s : "?"));
      if (new Set(gevonden).size === 3 && !gevonden.includes("?")) break;
      if (eerste && gevonden.includes("?")) {
        eerste = false;
        await l.zeg("Geef elk vraagteken een tik.");
      } else if (!blijf && !gevonden.includes("?")) {
        blijf = true;
        await l.zeg("Blijf erop tikken.", "Er zijn drie verschillende tekens.");
      }
    }
    g.nieuw(gevonden.map((s) => ({ t: "teken" as const, s })));
    await l.zeg("Uitstekend.", "Vandaag oefenen we met deze tekens.", "Heb je ze al eens gebruikt?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi, dan herhalen we ze even." : "Geen probleem, we leren ze nu.");
    await l.verder();

    /* 2. Is gelijk aan. */
    g.nieuw([{ t: "teken", s: "=" }]);
    await l.zeg("Dit teken zie je vaak bij rekenen.", "Weet je hoe het heet?");
    const naam = await l.kies(["Is gelijk aan", "Plus", "Min"]);
    if (naam === "Is gelijk aan") {
      await l.zeg("Ja.", "Dit is het is-gelijkteken.");
    } else {
      await l.zeg(naam === null ? "Geen zorgen." : naam === "Plus" ? "Een plusteken? Niet helemaal." : "Een minteken? Niet helemaal.", "Dit is het is-gelijkteken.");
    }
    await l.verder();

    const k = kaarten(l);
    const stand = { links: 0, rechts: 0 };
    k.toon(Array(6).fill(""), Array(6).fill(""), { teken: "=", naam: "is gelijk aan" });
    await l.zeg("Tik vakjes aan.", "Zorg dat er aan elke kant {3} blokjes zijn.");
    await tikVakjes(l, k, "links", 3, stand);
    await l.zeg("Mooi.", "Nu {3} in het andere rooster.");
    await tikVakjes(l, k, "rechts", 3, stand);
    await l.zeg("Goed zo.", "Aan elke kant {3}.", "Het is-gelijkteken laat zien dat ze evenveel hebben.");
    await l.verder();

    /* 3. Kleiner dan. */
    await l.zeg("Dat was het eerste teken.", "Nu het volgende.");
    k.nieuw(Array(6).fill(""), Array(6).fill(""), { teken: "<", naam: "is kleiner dan" });
    await l.zeg("Dit teken heet *is kleiner dan*.", "Je gebruikt het als links minder is dan rechts.");
    await l.verder();
    await l.zeg("Dat kan lastig zijn.", "Daarom heb ik een trucje.");
    await l.verder();
    k.pas({ stip: "klein" });
    await l.zeg("Ik wijs de kleine kant van het teken aan.", "Aan deze kant zet je de kleinste groep.");
    await l.verder();
    await l.zeg("Zet hier een kleine groep neer.", "Tik {2} vakjes aan.");
    await tikVakjes(l, k, "links", 2, stand);
    await l.zeg("Goed zo.", "Dat is een kleine groep.");
    await l.verder();
    k.pas({ stip: "groot" });
    await l.zeg("Aan deze kant is het teken wijd open.", "Dit is de grote kant.");
    await l.verder();
    await l.zeg("Maak hier een grotere groep dan {2}.", "Tik {5} vakjes aan.");
    await tikVakjes(l, k, "rechts", 5, stand);
    await l.zeg("Goed zo.", `Je liet zien: ${zin(2, "<", 5)}.`);
    await l.verder();

    /* 4. Groter dan. */
    k.nieuw(Array(6).fill(""), Array(6).fill(""), { teken: ">", naam: "is groter dan" });
    await l.zeg("En als laatste dit teken.", "Het heet *is groter dan*.", "Je gebruikt het als links meer is dan rechts.");
    await l.verder();
    k.pas({ stip: "groot" });
    await l.zeg("Ik wijs de grote kant aan.", "Zet hier een grotere groep neer.", "Tik {3} vakjes aan.");
    k.pas({ tik: "beide" });
    for (;;) {
      const m = await l.wachtOpVlak<Kaartmelding>("vakje");
      if (m.rechts > 0) {
        k.nieuw(onderaan(m.links, "blauw", 3), Array(6).fill(""), { teken: ">", naam: "is groter dan", stip: "groot" });
        await l.zeg("Ah, je tikte aan de andere kant.", "We kijken nu alleen naar de grote kant.", "Tik aan deze kant {3} vakjes aan.");
        if (m.links === 3) break;
        k.pas({ tik: "beide" });
        continue;
      }
      if (m.links === 3) break;
      if (m.links > 3) {
        k.pas({ tik: null });
        await l.zeg("Dat zijn er te veel.", "Tik op een blokje om het weg te halen.");
        k.pas({ tik: "beide" });
      }
    }
    k.pas({ tik: null, stip: "klein" });
    await l.zeg("Aan de kleine kant zet je de kleinste groep.", "Tik hier {1} vakje aan.");
    await tikVakjes(l, k, "rechts", 1, stand);
    await l.zeg("Heel goed.", `Je liet zien: ${zin(3, ">", 1)}.`);
    await l.verder();

    /* 5. Zelf of nog eens? */
    await l.zeg("Je doet het heel goed.", "Wil je de tekens zelf gebruiken?", "Of wil je nog wat oefenen?");
    const keuze = await l.kies(["Zelf doen", "Nog eens oefenen"]);
    if (keuze !== "Zelf doen") {
      await l.zeg("Goed, we kijken nog één keer.");
      k.nieuw(vol(3, "blauw"), vol(3, "oranje"), { teken: "=", naam: "is gelijk aan" });
      await l.zeg(`${zin(3, "=", 3)}.`, "Aan beide kanten evenveel.");
      await l.verder();
      k.nieuw(vol(2, "blauw"), vol(5, "oranje"), { teken: "<", naam: "is kleiner dan", stip: "klein" });
      await l.zeg(`${zin(2, "<", 5)}.`, "De kleine kant wijst naar de kleinste groep.");
      await l.verder();
      k.nieuw(vol(3, "blauw"), vol(1, "oranje"), { teken: ">", naam: "is groter dan", stip: "klein" });
      await l.zeg(`${zin(3, ">", 1)}.`, "De kleine kant wijst weer naar de kleinste groep.");
      await l.verder();
      await l.zeg("Nu probeer je het zelf.");
    } else {
      await l.zeg("Goed zo.", "Laat maar zien wat je kunt.");
    }

    /* 6. Zelf het teken kiezen. */
    const opgaven: [Vakkleur[], Vakkleur[], string][] = [
      [verspreid(5, "groen", 3), verspreid(4, "blauw", 3), "Dat klopt helemaal."],
      [verspreid(3, "oranje", 3), verspreid(5, "groen", 3), "Ja, goed zo."],
      [verspreid(4, "blauw", 3), verspreid(4, "oranje", 3), "Helemaal goed."],
      [verspreid(8, "blauw", 5), verspreid(7, "oranje", 5), l.naam ? `Netjes gedaan, ${l.naam}.` : "Netjes gedaan."],
    ];
    let eersteOpgave = true;
    for (const [li, re, lof] of opgaven) {
      const a = tel(li);
      const b = tel(re);
      const goed = tekenVoor(a, b);
      k.nieuw(li, re, { teken: "?" });
      await l.zeg(eersteOpgave ? "Kies het goede teken tussen de groepen." : "Welk teken hoort hier?", "Tik op het vraagteken om te wisselen.");
      eersteOpgave = false;
      k.pas({ tekenTik: true, klaar: true });
      for (let poging = 0; ; poging++) {
        const m = await l.wachtOpVlak<Kaartmelding>("klaar");
        if (m.teken === "?") {
          await l.zeg("Tik eerst op het vraagteken.");
          poging--;
          continue;
        }
        if (m.teken === goed) {
          k.pas({ tekenTik: false, klaar: false, stip: null });
          await l.zeg(lof, `${zin(a, goed, b)}.`);
          break;
        }
        if (poging >= 1) {
          k.nieuw(li, re, { teken: goed, aantallen: true, stip: goed === "=" ? null : "klein" });
          await l.zeg(`Het hoort zo: ${zin(a, goed, b)}.`, goed === "=" ? "Ze zijn even groot." : "De kleine kant wijst naar de kleinste groep.");
          await l.verder();
          break;
        }
        const fout = m.teken as Exclude<Teken, "?">;
        if (goed === "=") {
          await l.zeg(`${zin(a, fout, b)}?`, "Kijk goed: ze zijn even groot.", "Dan hoort daar het is-gelijkteken.");
        } else {
          k.pas({ stip: "klein" });
          await l.zeg(fout === "=" ? `{${a}} en {${b}} zijn gelijk?` : "Hmm.", "De kleinste groep hoort aan de kleine kant van het teken.", "Probeer het nog eens.");
        }
      }
      await l.wacht(500);
    }

    /* 7. Omgekeerd: het teken staat er al, het kind maakt de groepen. */
    await l.zeg(l.naam ? `${l.naam}, je kent ze goed.` : "Je kent ze goed.", "We doen het nu een beetje anders.");
    await l.verder();
    const bouw: [Exclude<Teken, "?">, number][] = [
      [">", 3],
      ["<", 3],
      ["<", 5],
    ];
    let eersteBouw = true;
    let laatste = { links: 0, rechts: 0 };
    for (const [tk, rijen] of bouw) {
      k.nieuw(Array(rijen * 2).fill(""), Array(rijen * 2).fill(""), { teken: tk });
      await l.zeg(
        eersteBouw ? "Zet aan beide kanten blokjes." : "Maak weer twee groepen.",
        "Zorg dat het teken klopt.",
        ...(eersteBouw ? ["Tik op een leeg vakje voor een blokje.", "Tik op een blokje om het weg te halen."] : []),
      );
      eersteBouw = false;
      k.pas({ tik: "beide", klaar: true });
      let fouten = 0;
      for (;;) {
        const m = await l.wachtOpVlak<Kaartmelding>("klaar");
        if (tekenVoor(m.links, m.rechts) === tk && m.links + m.rechts > 0) {
          laatste = { links: m.links, rechts: m.rechts };
          k.pas({ tik: null, klaar: false, aantallen: true, stip: null });
          await l.zeg("Precies.", `${zin(m.links, tk, m.rechts)}.`);
          break;
        }
        fouten++;
        k.pas({ tik: null, klaar: false, aantallen: true });
        if (fouten === 1) {
          await l.zeg("Hmm, dat past nog niet bij het teken.", "Ik zet de getallen erbij.");
        } else {
          k.pas({ stip: "klein" });
          await l.zeg("De kleinste groep hoort aan de kleine kant.");
        }
        k.pas({ tik: "beide", klaar: true });
      }
      await l.wacht(500);
    }
    /* Hoeveel erbij om gelijk te maken? */
    const nodig = laatste.rechts - laatste.links;
    await l.zeg("Nu maken we de groepen gelijk.", "Hoeveel blauwe blokjes moeten erbij?");
    const x = await l.getal();
    let zelfGoed = x === nodig;
    if (x !== nodig) {
      await l.zeg(linksRechts(laatste.links, laatste.rechts), x === null ? "Tel wat er links nog mist." : "Kijk nog eens hoeveel er links mist.");
      const y = await l.getal();
      zelfGoed = y === nodig;
      if (y !== nodig) {
        await l.zeg(`Er ${nodig === 1 ? "moet" : "moeten"} er {${nodig}} bij.`, `{${laatste.links}} en {${nodig}} is samen {${laatste.rechts}}.`);
      }
    }
    k.nieuw(onderaan(laatste.rechts, "blauw", 5), onderaan(laatste.rechts, "oranje", 5), { teken: "=", aantallen: true });
    await l.zeg(zelfGoed ? "Goed zo!" : "Kijk maar.", `Met {${nodig}} ${blokjes(nodig)} erbij zijn de groepen gelijk.`);
    await l.verder();

    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}!` : "Knap gedaan!", "Je kent deze tekens nu.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- les 4: getallen vergelijken ---------- */

/** Het kind kiest het teken tussen twee getallen. Geeft terug of het meteen goed was. */
async function kiesTeken(l: Lesgids, g: G, a: number, b: number, vraag: string[], lof: string): Promise<boolean> {
  const goed = tekenVoor(a, b);
  const delen = (s: Teken, hulp = false): Deel[] => [
    { t: "getal", n: a, maat: hulp && a !== b ? (a > b ? 1.3 : 0.75) : 1 },
    { t: "teken", s, tik: true },
    { t: "getal", n: b, maat: hulp && a !== b ? (b > a ? 1.3 : 0.75) : 1 },
  ];
  g.nieuw(delen("?"));
  await l.zeg(...vraag);
  g.pas({ klaar: true });
  for (let poging = 0; ; poging++) {
    const m = await l.wachtOpVlak<Getalmelding>("klaar");
    const t = m.delen[1].t === "teken" ? m.delen[1].s : "?";
    if (t === "?") {
      await l.zeg("Tik eerst op het vraagteken.");
      poging--;
      continue;
    }
    if (t === goed) {
      g.nieuw([{ t: "getal", n: a }, { t: "teken", s: goed }, { t: "getal", n: b }]);
      await l.zeg(lof, `${zin(a, goed, b)}.`);
      return poging === 0;
    }
    if (poging >= 1) {
      g.nieuw([{ t: "getal", n: a }, { t: "teken", s: goed }, { t: "getal", n: b }], { stip: goed === "=" ? null : "klein" });
      await l.zeg(`Het hoort zo: ${zin(a, goed, b)}.`, goed === "=" ? "Ze zijn hetzelfde." : "De kleine kant wijst naar het kleinste getal.");
      await l.verder();
      return false;
    }
    g.pas({ klaar: false });
    await l.zeg(t === "=" ? `{${a}} en {${b}} zijn gelijk?` : `${zin(a, t, b)}?`, "Dat klopt nog niet.");
    g.nieuw(delen("?", true), { stip: goed === "=" ? null : "klein", klaar: true });
    await l.zeg(goed === "=" ? "Kijk: het zijn dezelfde getallen." : "De kleine kant wijst naar het kleinste getal.", "Probeer het nog eens.");
  }
}

const getallenVergelijken: Lesdraaiboek = {
  id: "vergelijken-getallen",
  titel: "Getallen vergelijken",
  synthesis: "Compare the Pair · Comparing Numbers",
  kaarttekening: KaartGetallen,

  async speel(l) {
    const g = getallen(l);
    g.toon([{ t: "getal", n: 6 }, { t: "teken", s: "?" }, { t: "getal", n: 3 }]);
    await l.zeg("We gaan getallen vergelijken met tekens.", "Kun je dat al?");
    const kan = await l.kies(["Ja", "Nee"]);

    if (kan !== "Ja") {
      /* Herhaling van de tekens. */
      await l.zeg("Geen probleem.", "We herhalen wat de tekens betekenen.");
      await l.verder();
      g.nieuw([{ t: "teken", s: "=" }]);
      await l.zeg("Dit teken zie je vaak bij rekenen.", "Weet je hoe het heet?");
      const naam = await l.kies(["Is gelijk aan", "Plus", "Min"]);
      if (naam === "Is gelijk aan") {
        await l.zeg("Ja.", "Het heet het is-gelijkteken.");
      } else {
        await l.zeg(naam === null ? "Geen zorgen." : naam === "Plus" ? "Een plusteken? Niet helemaal." : "Een minteken? Niet helemaal.", "Het heet het is-gelijkteken.");
      }
      await l.verder();
      g.pas({ naam: "is gelijk aan" });
      await l.zeg("Het is-gelijkteken zegt: beide kanten zijn hetzelfde.", "We proberen het met getallen.");
      await l.verder();

      g.nieuw([{ t: "getal", n: 1, rol: true }, { t: "teken", s: "=" }, { t: "getal", n: 7 }], { naam: "is gelijk aan" });
      await l.zeg("Tik op dit getal tot het gelijk is aan {7}.");
      let gezegd = false;
      for (;;) {
        const m = await l.wachtOpVlak<Getalmelding>("rol");
        if (m.n === 7) break;
        if (!gezegd) {
          gezegd = true;
          await l.zeg("Blijf tikken tot je bij de {7} bent.");
        }
      }
      g.nieuw([{ t: "getal", n: 7 }, { t: "teken", s: "=" }, { t: "getal", n: 7 }], { naam: "is gelijk aan" });
      await l.zeg("Goed zo.", `${zin(7, "=", 7)}.`, "Het teken in het midden zegt dat ze hetzelfde zijn.");
      await l.verder();

      /* Kleiner dan. */
      g.nieuw([{ t: "teken", s: "<" }], { naam: "is kleiner dan" });
      await l.zeg("Dit teken heet *is kleiner dan*.", "Je gebruikt het als het linker getal het kleinste is.", "Ik heb een trucje voor je.");
      await l.verder();
      g.pas({ stip: "klein" });
      await l.zeg("Ik wijs de kleine kant van het teken aan.", "Die kant wijst naar het kleinste getal.");
      await l.verder();
      g.nieuw([{ t: "getal", n: 8, rol: true }, { t: "teken", s: "<" }, { t: "getal", n: 5 }], { naam: "is kleiner dan", stip: "klein" });
      await l.zeg("Maar {8} is niet kleiner dan {5}.", "Maak van de {8} een getal onder de {5}.", "Tik erop om het te veranderen.");
      let kl = 8;
      for (;;) {
        const m = await l.wachtOpVlak<Getalmelding>("rol");
        kl = m.n ?? kl;
        if (kl < 5) break;
      }
      g.nieuw([{ t: "getal", n: kl }, { t: "teken", s: "<" }, { t: "getal", n: 5 }], { naam: "is kleiner dan", stip: "klein" });
      await l.zeg("Goed zo.", `Nu zegt het teken: ${zin(kl, "<", 5)}.`);
      await l.verder();

      /* Groter dan. */
      g.nieuw([{ t: "teken", s: ">" }], { naam: "is groter dan" });
      await l.zeg("Het laatste teken heet *is groter dan*.", "Je gebruikt het als het linker getal het grootste is.");
      await l.verder();
      g.pas({ stip: "groot" });
      await l.zeg("Ik wijs de grote kant aan.", "Daar komt het grootste getal.");
      await l.verder();
      g.nieuw([{ t: "getal", n: 1, rol: true }, { t: "teken", s: ">" }, { t: "getal", n: 4 }], { naam: "is groter dan", stip: "groot" });
      await l.zeg("Maar {1} is niet groter dan {4}.", "Maak van de {1} een getal boven de {4}.");
      let gr = 1;
      let bijVier = false;
      for (;;) {
        const m = await l.wachtOpVlak<Getalmelding>("rol");
        gr = m.n ?? gr;
        if (gr > 4) break;
        if (gr === 4 && !bijVier) {
          bijVier = true;
          await l.zeg("Nu zijn ze gelijk.", "Maak er een getal *boven* de {4} van.");
        }
      }
      g.nieuw([{ t: "getal", n: gr }, { t: "teken", s: ">" }, { t: "getal", n: 4 }], { naam: "is groter dan", stip: "groot" });
      await l.zeg("Goed zo.", `Nu zegt het teken: ${zin(gr, ">", 4)}.`);
      await l.verder();

      await l.zeg(l.naam ? `Je snapt het al, ${l.naam}.` : "Je snapt het al.", "Wil je zelf een som proberen?", "Of de tekens nog eens bekijken?");
      const verder = await l.kies(["Zelf een som", "Nog eens bekijken"]);
      if (verder !== "Zelf een som") {
        g.nieuw([{ t: "getal", n: 7 }, { t: "teken", s: "=" }, { t: "getal", n: 7 }], { naam: "is gelijk aan" });
        await l.zeg(`${zin(7, "=", 7)}.`, "Beide kanten zijn hetzelfde.");
        await l.verder();
        g.nieuw([{ t: "getal", n: 3 }, { t: "teken", s: "<" }, { t: "getal", n: 5 }], { naam: "is kleiner dan", stip: "klein" });
        await l.zeg(`${zin(3, "<", 5)}.`, "De kleine kant wijst naar het kleinste getal.");
        await l.verder();
        g.nieuw([{ t: "getal", n: 6 }, { t: "teken", s: ">" }, { t: "getal", n: 2 }], { naam: "is groter dan", stip: "klein" });
        await l.zeg(`${zin(6, ">", 2)}.`, "Ook hier wijst de kleine kant naar het kleinste getal.");
        await l.verder();
        await l.zeg("Nu probeer je het zelf.");
      } else {
        await l.zeg("Prima.", "We beginnen meteen.");
      }
    } else {
      await l.zeg("Mooi.", "Dan beginnen we meteen.");
    }

    /* Zelf het teken kiezen. */
    let zonderHulp = 0;
    const opgaven: [number, number, string][] = [
      [7, 5, "Dat klopt helemaal."],
      [5, 8, "Ja, goed zo."],
      [5, 5, "Helemaal goed."],
      [9, 6, "Netjes."],
    ];
    let eerste = true;
    let gedaan = 0;
    let gestopt = false;
    for (const [a, b, lof] of opgaven) {
      const vraag = eerste ? ["Kies het goede teken tussen de getallen.", "Tik op het vraagteken om te wisselen."] : ["Welk teken hoort hier?"];
      if (await kiesTeken(l, g, a, b, vraag, lof)) zonderHulp++;
      gedaan++;
      await l.wacht(500);
      /* Zoals Synthesis: tussendoor vragen of het kind wil doorgaan. "Nee" rondt netjes af. */
      if (gedaan < opgaven.length) {
        await l.zeg(eerste ? "Even een vraag." : "", eerste ? "Wil je doorgaan met deze les?" : "Zullen we doorgaan?");
        const door = await l.kies(["Ja", "Nee"]);
        if (door === "Nee") {
          await l.zeg("Oké.", "Dan ronden we af.");
          gestopt = true;
          break;
        }
        await l.zeg(eerste ? "Mooi." : "Oké.");
      }
      eerste = false;
    }

    let nog: string | null = "Afronden";
    if (!gestopt) {
      await l.zeg("Wil je nog wat oefenen?", "Of zullen we afronden?");
      nog = await l.kies(["Nog wat oefenen", "Afronden"]);
    }
    let totaal = gedaan;
    if (nog !== "Afronden") {
      await l.zeg("Goed, nu kies jij het getal.");
      if (await vulIn(l, g, 5, ">", null, 3, ["Welk getal past op het vraagteken?"])) zonderHulp++;
      await l.wacht(500);
      if (await vulIn(l, g, null, "<", 4, 2, ["Welk getal past op het vraagteken?"])) zonderHulp++;
      await l.wacht(500);
      if (await vulIn(l, g, null, "=", 5, 5, ["Welk getal past op het vraagteken?"])) zonderHulp++;
      totaal += 3;
      await l.wacht(500);
    }
    if (zonderHulp === totaal) {
      await l.zeg(`Je had er {${totaal}} van de {${totaal}} goed, zonder hulp.`, "Misschien moet jij de juf zijn!");
    } else {
      await l.zeg("Je hebt goed geoefend.");
    }
    await l.verder();

    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}!` : "Knap gedaan!", "Je kunt getallen vergelijken met tekens.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- les 5: eindtoets ---------- */

const eindtoets: Lesdraaiboek = {
  id: "vergelijken-eindtoets",
  titel: "Eindtoets: vergelijken",
  synthesis: "Compare the Pair · Mastery Check",
  kaarttekening: KaartGroepen,
  async speel(l) {
    await toets(l, { groot: [9, 7], gelijk: [9, 7], kleinerDan: 8, groterDan: 5 });
  },
};

export const LESSEN_VERGELIJKEN: Lesdraaiboek[] = [instaptoets, meerOfMinder, tekens, getallenVergelijken, eindtoets];
