/**
 * Lessen van het onderdeel "Getallenlijn" (oktober 2026); zie ../soort.ts.
 *
 * Verschil: sprongen tellen — naar Synthesis "Subtract on the Number Line ·
 * Difference Dash: Count the Jumps" (INSPIRATIE.md, ronde 1 en 2, blok M).
 * Groep 3.
 *
 * Verloop zoals daar, in eigen woorden:
 * 1. Wil je eerst zien hoe de getallenlijn werkt? Zo ja: een rondleiding met
 *    7 en 3 (getallen aantikken, het sterretje springt, terugspringen wist de
 *    boogjes, het verschil invullen).
 * 2. 3 − 2: aantikken, één sprong, "hoe ver liggen ze uit elkaar?" en het
 *    woord *verschil*.
 * 3. 4 − 2: zelf aantikken, springen, het verschil invullen. Daarna terug
 *    springen van 4 naar 2: het verschil blijft hetzelfde (uit ronde 1).
 * 4. Paren zoeken met een verschil van 2 (lijn 5–10).
 * 5. Het spel: vijf sommen, voor elk goed antwoord een kristal.
 * Aan het eind de kaart.
 *
 * Bewust anders dan Synthesis: geen stippenmachine vooraf (INSPIRATIE: "bewust
 * niet overnemen"), en een sterretje in plaats van het astronautje.
 *
 * Tweede bouwronde: de groep 3-delen van Assessment, Leaps Ahead, Into the
 * Thousands en Mastery Check (onderaan dit bestand).
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { GetallenlijnSprongen, type Boog, type GetallenlijnSprongenProps } from "../vlakken/getallenlijn-sprongen";

type P = GetallenlijnSprongenProps;
type Tik = { soort: "getal"; n: number };

function zet(l: Lesgids, p: Partial<P>) {
  l.pasVlakAan<P>(p);
}

/** Het kind tikt een getal op de lijn aan. */
async function tikGetal(l: Lesgids): Promise<number> {
  zet(l, { actief: true });
  const g = await l.wachtOpVlak<Tik>("getal");
  zet(l, { actief: false });
  return g.n;
}

/**
 * Een getal op de lijn aantikken, met links de knop "Weet ik niet" (een keuze
 * zonder opties). Geeft het getal, of `null` bij "Weet ik niet". Na afloop
 * zegt de les altijd meteen iets, zodat de knop weer verdwijnt.
 */
async function tikOfWeetNiet(l: Lesgids): Promise<number | null> {
  zet(l, { actief: true });
  const uit = await Promise.race([l.wachtOpVlak<Tik>("getal").then((g) => g.n), l.kies([]).then(() => null)]);
  zet(l, { actief: false });
  return uit;
}

/** De som bovenaan: twee vakjes met een min ertussen, en eventueel "= ▢". */
function minsom(l: Lesgids, groot: number | null, klein: number | null, metIs = false) {
  const delen: Somdeel[] = [
    { t: "vak", waarde: groot === null ? undefined : String(groot) },
    { t: "teken", s: "−" },
    { t: "vak", waarde: klein === null ? undefined : String(klein) },
  ];
  if (metIs) delen.push({ t: "teken", s: "=" }, { t: "vak" });
  l.som(delen);
}

/**
 * Het kind tikt twee getallen aan; de vakjes bovenaan vullen zich mee.
 * `eerst`: dit getal moet eerst. `naEerste`: wat er na de eerste tik gezegd wordt.
 */
async function tikTwee(l: Lesgids, groot: number, klein: number, eerst: number | null, naEerste: string[]): Promise<void> {
  const gem: number[] = [];
  minsom(l, null, null);
  while (gem.length < 2) {
    const n = await tikGetal(l);
    const nodig = eerst !== null && gem.length === 0 ? [eerst] : [groot, klein].filter((g) => !gem.includes(g));
    if (!nodig.includes(n)) {
      if (gem.includes(n)) continue;
      await l.zeg(nodig.length === 1 ? `Tik op de {${nodig[0]}}.` : `Tik op de {${groot}} en de {${klein}}.`);
      continue;
    }
    gem.push(n);
    zet(l, { gemarkeerd: [...gem] });
    minsom(l, gem.includes(groot) ? groot : null, gem.includes(klein) ? klein : null);
    if (gem.length === 1 && naEerste.length) await l.zeg(...naEerste);
  }
}

/**
 * Het sterretje springt van `van` naar `naar`, één getal per tik.
 * `label`: dit staat boven elke boog (bijvoorbeeld "1").
 */
async function springen(l: Lesgids, van: number, naar: number, label?: string): Promise<void> {
  const richting = naar > van ? 1 : -1;
  let plek = van;
  let bogen: Boog[] = [];
  let hulp = 0;
  zet(l, { springer: van, bogen });
  while (plek !== naar) {
    const n = await tikGetal(l);
    if (n === plek + richting) {
      bogen = [...bogen, { van: plek, naar: n, label }];
      plek = n;
      zet(l, { springer: plek, bogen });
    } else if (n === van && plek !== van) {
      /* Terug naar het begin: de boogjes gaan weg. */
      bogen = [];
      plek = van;
      zet(l, { springer: plek, bogen });
    } else if (n !== plek) {
      hulp++;
      await l.zeg(hulp === 1 ? "Het sterretje springt maar één getal tegelijk." : `Tik op de {${plek + richting}}.`);
    }
  }
  await l.wacht(500);
}

/** De les laat zelf de sprongen zien, van `van` naar `naar` (met eventueel een `label` boven elke boog). */
async function laatZien(l: Lesgids, van: number, naar: number, label?: string): Promise<void> {
  const richting = naar > van ? 1 : -1;
  const bogen: Boog[] = [];
  zet(l, { springer: van, bogen: [] });
  await l.wacht(400);
  for (let n = van; n !== naar; n += richting) {
    bogen.push({ van: n, naar: n + richting, label });
    zet(l, { springer: n + richting, bogen: [...bogen] });
    await l.wacht(550);
  }
}

/** Het verschil typen in het laatste vakje van de som. Geeft terug of het meteen goed was. */
async function vulVerschilIn(l: Lesgids, groot: number, klein: number, uitleg: string[]): Promise<boolean> {
  const d = groot - klein;
  minsom(l, groot, klein, true);
  await l.zeg(...uitleg);
  for (let fout = 0; ; ) {
    const x = await l.somVak(4);
    if (x === d) return fout === 0;
    fout++;
    if (fout === 1) {
      await l.zeg(`Hm, tel de sprongen van {${klein}} naar {${groot}}.`, "Typ dan het verschil in het vakje.");
    } else if (fout === 2) {
      await l.zeg("Kijk, ik laat de sprongen zien.");
      zet(l, { gemarkeerd: [groot, klein] });
      await laatZien(l, klein, groot);
      await l.zeg(d === 1 ? "Het is {1} sprong." : `Het zijn {${d}} sprongen.`, `Typ de {${d}}.`);
    } else {
      await l.zeg(`Typ de {${d}}.`);
    }
  }
}

/** Een schone lijn. */
function nieuweLijn(l: Lesgids, van: number, tot: number, extra: Partial<P> = {}) {
  zet(l, { van, tot, gemarkeerd: [], springer: null, bogen: [], actief: false, ...extra });
}

/* ---------- de onderdelen van de les ---------- */

async function rondleiding(l: Lesgids): Promise<void> {
  await l.zeg("We kijken samen hoe de getallenlijn werkt.", "Stel, we zoeken het verschil tussen {7} en {3}.");
  minsom(l, null, null);
  await l.zeg("Tik eerst allebei de getallen aan.", "Eerst de {7}, dan de {3}.");
  await tikTwee(l, 7, 3, 7, ["Goed zo.", "Nu het andere getal."]);
  await l.zeg("Makkelijk, toch?", "Zo zetten we elke minsom klaar.", "Nu zie je allebei de getallen op de lijn.", "Ze zijn rood gekleurd.");
  await l.verder();

  zet(l, { springer: 3 });
  await l.zeg("En kijk, hier is het sterretje.", "Het komt als allebei de getallen klaarstaan.");
  await l.verder();
  await l.zeg("Begin hier, bij de {3}.", "Spring steeds één getal verder.", "Tel de sprongen mee.");
  await springen(l, 3, 7);

  await l.zeg("Mooi, leuk hè?", "Nog één ding.", "Spring eens terug naar de {3}.");
  while ((await tikGetal(l)) !== 3) {
    await l.zeg("Tik op de {3}.");
  }
  zet(l, { springer: 3, bogen: [] });
  await l.zeg("Spring je terug naar het begin?", "Dan gaan de boogjes weg.", "Dat is handig als je opnieuw wilt beginnen.");
  await l.verder();

  await vulVerschilIn(l, 7, 3, ["Nu vullen we het verschil in.", "Je telde van {3} naar {7}.", "Typ het in het vakje."]);
  await l.zeg("Heel goed.", "Nu weet je hoe het werkt.");
  await l.verder();
}

/** 3 − 2: één sprong, en het woord verschil. */
async function eenSprong(l: Lesgids): Promise<void> {
  l.som(null);
  nieuweLijn(l, 0, 5);
  await l.zeg("We beginnen met iets makkelijks.", "Tik deze getallen aan: {3} en {2}.", "Begin met de {2}.");
  await tikTwee(l, 3, 2, 2, ["Goed!", "Tik nu het andere getal."]);
  await l.zeg("Hm, ze liggen dicht bij elkaar, hè?", "We zoeken uit hoe ver ze uit elkaar liggen.");
  await l.verder();
  await l.zeg("Het sterretje helpt.", "Laat het springen van {2} naar {3}.");
  await springen(l, 2, 3);

  await l.zeg("Mooi.", "Hoe ver liggen ze uit elkaar?", "Hoe vaak sprong het sterretje?");
  const x = await l.getal();
  if (x === 1) {
    await l.zeg("Precies.", "Ze liggen naast elkaar op de lijn.", "Ze liggen {1} uit elkaar.");
  } else {
    await l.zeg(x === null ? "Geen zorgen." : "Kijk naar de boogjes.", "Het sterretje sprong maar {1} keer.", "Ze liggen {1} uit elkaar.");
  }
  await l.verder();
  await l.zeg("Hoe ver ze uit elkaar liggen, dat heet het *verschil*.", "Daarom is de getallenlijn zo handig.");
  await l.verder();

  await vulVerschilIn(l, 3, 2, ["Typ het verschil in het vakje."]);
  await l.zeg("Dat klopt.", "Het verschil tussen {3} en {2} is {1}.");
  await l.verder();
}

/** 4 − 2: zelf aantikken en springen; daarna terug: het verschil blijft gelijk. */
async function tweeSprongen(l: Lesgids): Promise<void> {
  l.som(null);
  nieuweLijn(l, 0, 5);
  await l.zeg("Nu {2} getallen die verder uit elkaar liggen.", "Wat is het verschil tussen {4} en {2}?", "Tik allebei de getallen aan.");
  await tikTwee(l, 4, 2, null, []);
  await l.zeg("Deze liggen verder uit elkaar.", "Help het sterretje springen van {2} naar {4}.", "Eén getal tegelijk.");
  await springen(l, 2, 4);
  await vulVerschilIn(l, 4, 2, ["Tel de sprongen van {2} naar {4}.", "Het verschil is hoe ver ze uit elkaar liggen.", "Typ dan het verschil in het vakje."]);
  await l.zeg(
    l.naam ? `Ja, knap gedaan, ${l.naam}.` : "Ja, knap gedaan.",
    "Het verschil tussen {4} en {2} is {2}.",
    "Ze liggen {2} uit elkaar.",
  );
  await l.verder();

  /* Terugspringen: het verschil blijft hetzelfde. */
  await l.zeg("We sprongen vooruit, van {2} naar {4}.", "Nu springt het sterretje terug.", "Is het verschil dan anders?");
  const keuze = await l.kies(["Ja", "Nee"]);
  await l.zeg(keuze === null ? "Geen zorgen, we kijken samen." : "Kijk maar mee.", "Laat het sterretje terugspringen naar de {2}.");
  zet(l, { bogen: [] });
  await springen(l, 4, 2);
  await l.zeg(
    keuze === "Nee" ? "Je had gelijk." : "Kijk eens.",
    "Het zijn nog steeds {2} sprongen.",
    "Vooruit of terug: het verschil blijft {2}.",
  );
  await l.verder();
}

/** Paren zoeken met een verschil van 2, op de lijn van 5 tot 10. */
async function parenZoeken(l: Lesgids): Promise<void> {
  l.som(null);
  nieuweLijn(l, 5, 10);
  const alle: [number, number][] = [
    [5, 7],
    [6, 8],
    [7, 9],
    [8, 10],
  ];
  const gevonden: string[] = [];
  const nogOver = () => alle.filter(([a, b]) => !gevonden.includes(`${a}-${b}`));

  await l.zeg("Dus {4} en {2} hebben een verschil van {2}.", "Kun je nog zo'n paar vinden?", "Met een verschil van {2}?");
  for (let paar = 1; paar <= 3; paar++) {
    nieuweLijn(l, 5, 10);
    await l.zeg(paar === 1 ? "Kijk naar deze getallenlijn." : "Zoek nog zo'n paar.", "Tik {2} getallen aan met een verschil van {2}.");
    for (let fout = 0; ; ) {
      /* Twee getallen aantikken; nog eens op hetzelfde getal tikken zet het uit. */
      const gem: number[] = [];
      let weetNiet = false;
      while (gem.length < 2) {
        const n = await tikOfWeetNiet(l);
        if (n === null) {
          weetNiet = true;
          break;
        }
        if (gem.includes(n)) gem.splice(gem.indexOf(n), 1);
        else gem.push(n);
        zet(l, { gemarkeerd: [...gem] });
      }

      if (!weetNiet) {
        const [a, b] = [Math.min(...gem), Math.max(...gem)];
        const d = b - a;
        if (d === 2 && gevonden.includes(`${a}-${b}`)) {
          await l.zeg("Dat paar hadden we al.", "Zoek een ander paar.");
          nieuweLijn(l, 5, 10);
          continue;
        }
        await laatZien(l, a, b);
        if (d === 2) {
          gevonden.push(`${a}-${b}`);
          await l.zeg(paar === 1 ? "Heel goed." : "Goed gevonden!", `{${b}} en {${a}} hebben een verschil van {2}!`);
          break;
        }
        fout++;
        await l.zeg("Hm, niet helemaal.", `{${a}} en {${b}} liggen {${d}} uit elkaar.`);
        if (fout < 2) {
          await l.zeg("Ik geef je nog een kans.", "Tik {2} getallen aan met een verschil van {2}.");
          nieuweLijn(l, 5, 10);
          continue;
        }
        await l.verder();
      }

      /* "Weet ik niet", of twee keer mis: de les laat een paar zien. */
      const [a, b] = nogOver()[0];
      nieuweLijn(l, 5, 10, { gemarkeerd: [a, b] });
      await l.zeg(weetNiet ? "Geen zorgen." : "Ik help je even.", `Kijk: van {${a}} naar {${b}}.`);
      await laatZien(l, a, b);
      await l.zeg("Dat zijn {2} sprongen.", `Dus {${a}} en {${b}} hebben een verschil van {2}.`);
      gevonden.push(`${a}-${b}`);
      await l.verder();
      break;
    }

    if (paar === 3 || nogOver().length === 0) break;
    await l.zeg("Je bent goed bezig.", "Wil je nog zo'n paar zoeken?");
    const verder = await l.kies(["Nog zo'n paar", "Ik wil verder"]);
    if (verder !== "Nog zo'n paar") break;
  }
  await l.zeg("Je snapt nu goed hoe je het verschil vindt.");
  await l.verder();
}

/**
 * Eén som van het spel. Het kind mag de getallen op de lijn aantikken en het
 * sterretje laten springen, of meteen het antwoord typen. Het aantikken loopt
 * op de achtergrond mee terwijl het vakje bovenaan wacht.
 */
type Somopties = {
  /** Het stuk getallenlijn (standaard 0 tot 10). */
  van?: number;
  tot?: number;
  /** Of het sterretje ook in één keer naar het grootste getal mag springen. */
  groteSprong?: boolean;
  /** Wat de les zegt na de eerste fout. */
  fout1?: string[];
};

async function spelSom(l: Lesgids, groot: number, klein: number, vraag: string[], opties: Somopties = {}): Promise<boolean> {
  const { van = 0, tot = 10, groteSprong = false, fout1 = ["Tel de sprongen tussen de getallen.", "Probeer het nog eens."] } = opties;
  const d = groot - klein;
  nieuweLijn(l, van, tot);
  minsom(l, groot, klein, true);

  let klaar = false;
  let gem: number[] = [];
  let plek: number | null = null;
  let bogen: Boog[] = [];
  const vrij = async () => {
    try {
      zet(l, { actief: true });
      while (!klaar) {
        const { n } = await l.wachtOpVlak<Tik>("getal");
        if (klaar) return;
        if (gem.length < 2) {
          if ((n === groot || n === klein) && !gem.includes(n)) {
            gem = [...gem, n];
            if (gem.length === 2) {
              plek = klein;
              bogen = [];
            }
            zet(l, { gemarkeerd: gem, springer: plek, bogen });
          }
        } else if (plek !== null && n === plek + 1 && plek < groot) {
          bogen = [...bogen, { van: plek, naar: n }];
          plek = n;
          zet(l, { springer: plek, bogen });
        } else if (groteSprong && plek !== null && n === groot && plek < groot) {
          bogen = [...bogen, { van: plek, naar: n }];
          plek = n;
          zet(l, { springer: plek, bogen });
        } else if (n === klein) {
          bogen = [];
          plek = klein;
          zet(l, { springer: plek, bogen });
        }
      }
    } catch {
      /* de les is gestopt */
    }
  };
  void vrij();

  await l.zeg(...vraag);
  let fout = 0;
  for (;;) {
    const x = await l.somVak(4);
    if (x === d) break;
    fout++;
    if (fout === 1) {
      await l.zeg(...fout1);
    } else {
      klaar = true;
      zet(l, { actief: false });
      await l.zeg("Kijk, ik laat de sprongen zien.");
      gem = [groot, klein];
      zet(l, { gemarkeerd: gem });
      await laatZien(l, klein, groot);
      await l.zeg(`Van {${klein}} naar {${groot}} ${d === 1 ? "is {1} sprong" : `zijn {${d}} sprongen`}.`, `Typ de {${d}}.`);
    }
  }
  klaar = true;
  zet(l, { actief: false });
  return fout === 0;
}

async function spel(l: Lesgids): Promise<void> {
  l.som(null);
  nieuweLijn(l, 0, 10, { kristallen: 0 });
  await l.zeg("Nu gaan we spelen!", "Voor elk goed antwoord krijg je een kristal.");
  await l.verder();

  const sommen: [number, number][] = [
    [6, 1],
    [7, 3],
    [8, 3],
    [4, 1],
    [9, 4],
  ];
  const inleiding = [
    ["Hier is de eerste.", "Je mag de getallen aantikken.", "Of je typt meteen het antwoord."],
    ["Probeer deze eens."],
    ["Hier is er nog een."],
    ["Ga zo door."],
    ["Nog één."],
  ];
  const goed = [
    ["Ja!"],
    [l.naam ? `Je begint het echt te snappen, ${l.naam}.` : "Je begint het echt te snappen."],
    ["Goed zo."],
    ["Precies."],
    ["Knap gedaan!"],
  ];
  /* Alleen een kristal voor een antwoord dat meteen goed was, zoals de les belooft. */
  let kristallen = 0;
  for (let i = 0; i < sommen.length; i++) {
    const [a, b] = sommen[i];
    const meteen = await spelSom(l, a, b, [...inleiding[i], `Wat is het verschil tussen {${a}} en {${b}}?`]);
    if (meteen) {
      kristallen++;
      zet(l, { kristallen });
      await l.zeg(...goed[i], `Het verschil is {${a - b}}.`);
    } else {
      await l.zeg(`Het verschil is {${a - b}}.`, "Die tellen we de volgende keer meteen goed.");
    }
    await l.wacht(400);
  }
  await l.zeg(kristallen === 0 ? "Je hebt nog geen kristallen." : kristallen === 1 ? "Je hebt {1} kristal." : `Je hebt {${kristallen}} kristallen.`);
  await l.verder();
}

/** Lijntekening voor op de kaart: een getallenlijn met twee sprongen en het sterretje. */
function KaartSprongen() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16" y1="150" x2="228" y2="150" stroke="#d6dbe8" strokeWidth="3" />
      {[30, 80, 130, 180, 214].map((x) => (
        <line key={x} x1={x} y1="142" x2={x} y2="158" stroke="#d6dbe8" strokeWidth="3" />
      ))}
      <path d="M80 150 C 80 95, 130 95, 130 150" stroke="#ffb15a" strokeWidth="3.4" />
      <path d="M130 150 C 130 95, 180 95, 180 150" stroke="#ff7a5a" strokeWidth="3.4" />
      <path
        d="M80 52l6 12.4 13.6 2-9.8 9.6 2.3 13.6L80 83.2l-12.1 6.4 2.3-13.6-9.8-9.6 13.6-2z"
        stroke="#ffd84a"
        strokeWidth="3.2"
        transform="translate(0 40)"
      />
    </g>
  );
}

export const verschilSprongenTellen: Lesdraaiboek = {
  id: "getallenlijn-sprongen-tellen",
  titel: "Verschil: sprongen tellen",
  synthesis: "Subtract on the Number Line · Difference Dash: Count the Jumps",
  kaarttekening: KaartSprongen,

  async speel(l) {
    l.vlak(GetallenlijnSprongen, { van: 0, tot: 10 });
    await l.zeg(l.naam ? `Hoi ${l.naam}.` : "Hoi.", "Vandaag zoeken we het verschil tussen {2} getallen.");
    await l.verder();
    await l.zeg("Zal ik eerst laten zien hoe de getallenlijn werkt?");
    const uitleg = await l.kies(["Ja, graag", "Nee, ik weet het al"]);
    if (uitleg !== "Nee, ik weet het al") {
      await l.zeg("Mooi.", "Ik help je graag.");
      await rondleiding(l);
    } else {
      await l.zeg("Fijn.");
    }

    /* Zoals ronde 2: wil je laten zien wat je nog weet? Ja: meteen het spel. */
    l.som(null);
    nieuweLijn(l, 0, 10);
    await l.zeg("Wil je laten zien wat je al weet?");
    const laten = await l.kies(["Ja, ik laat zien wat ik kan", "Nee, we beginnen samen"]);
    if (laten === "Ja, ik laat zien wat ik kan") {
      await l.zeg("Oké, laat maar zien.");
      await l.verder();
    } else {
      await l.zeg("Goed.", "We beginnen makkelijk.", "Daarna wordt het wat moeilijker.");
      await l.verder();
      await eenSprong(l);
      await tweeSprongen(l);
      await parenZoeken(l);
    }
    await spel(l);

    /* Einde: de kaart. */
    l.som(null);
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(
      l.naam ? `Goed gewerkt vandaag, ${l.naam}.` : "Goed gewerkt vandaag.",
      "Je kunt het verschil vinden met sprongen.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

/* ======================================================================
 * Tweede bouwronde (10 oktober 2026): de groep 3-delen van de andere
 * lessen uit "Subtract on the Number Line".
 * ====================================================================== */

/**
 * De toets (instap en eind), groep 3-deel: alleen 13 − 8 op de lijn van 0
 * tot 15. Het sterretje staat op de 8 en moet naar de 13; begint het kind met
 * sprongen van één, dan zegt de les dat het meteen op de 13 mag tikken (zoals
 * ronde 1 en de Mastery Check van ronde 2). De andere vragen van Synthesis
 * (192 − 184, 130 − 80, 900 − 600) zijn groep 4 en 5.
 */
async function lijnToets(l: Lesgids, klein: number, groot: number): Promise<void> {
  const d = groot - klein;
  l.vlak(GetallenlijnSprongen, { van: 0, tot: 15, gemarkeerd: [klein, groot] });
  minsom(l, groot, klein, true);
  await l.zeg("We zoeken het verschil met de getallenlijn.", "Kun je dat al?");
  const al = await l.kies(["Ja", "Nee"]);
  await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", al === "Ja" ? "Laat maar zien wat je kunt." : "We kijken eerst wat je al weet.");
  l.som(null);

  /* Springen van klein naar groot. */
  nieuweLijn(l, 0, 15, { gemarkeerd: [klein], springer: klein });
  await l.zeg("We beginnen.", `Help het sterretje springen van {${klein}} naar {${groot}}.`);
  let plek = klein;
  let gezegd = false;
  for (;;) {
    const n = await tikGetal(l);
    if (n === groot) {
      zet(l, { gemarkeerd: [klein, groot], springer: groot, bogen: [{ van: klein, naar: groot }] });
      break;
    }
    if (n === plek + 1 && n < groot) {
      zet(l, { springer: n, bogen: [{ van: plek, naar: n }] });
      plek = n;
      if (!gezegd) {
        gezegd = true;
        await l.zeg("Oh, ik zie dat je met sprongen van één begint.", `Tik meteen op de {${groot}}.`);
      }
      continue;
    }
    if (n !== plek) await l.zeg(`Tik op de {${groot}}.`);
  }
  await l.wacht(500);

  /* Het verschil. */
  await l.zeg("Mooie sprong.", `Wat is het verschil tussen {${groot}} en {${klein}}?`);
  for (let poging = 0; ; poging++) {
    const x = await l.getal();
    if (x === d) {
      await l.zeg(poging === 0 ? "Precies." : "Ja.", `Een verschil van {${d}}.`);
      break;
    }
    if (poging === 0) {
      await l.zeg(x === null ? "Geen zorgen." : `{${groot}} min {${klein}} is {${x}}?`, "Kijk nog eens goed.", `Wat is het verschil tussen {${groot}} en {${klein}}?`);
      continue;
    }
    await laatZien(l, klein, groot);
    await l.zeg(`Van {${klein}} naar {${groot}} ${d === 1 ? "is {1} sprong" : `zijn {${d}} sprongen`}.`, `Het verschil is {${d}}.`);
    await l.verder();
    break;
  }
  await l.wacht(400);

  /* De kaart. */
  l.vlak(null);
  const tik = l.kaart();
  await l.zeg(
    l.naam ? `Mooi gedaan, ${l.naam}.` : "Mooi gedaan.",
    "Je kunt het verschil vinden op de getallenlijn.",
    "Tik op de kaart om hem af te vinken.",
  );
  await tik;
}

const lijnInstaptoets: Lesdraaiboek = {
  id: "getallenlijn-instaptoets",
  titel: "Instaptoets: verschil op de getallenlijn",
  synthesis: "Subtract on the Number Line · Assessment (groep 3-deel)",
  kaarttekening: KaartSprongen,
  async speel(l) {
    await lijnToets(l, 8, 13);
  },
};

const lijnEindtoets: Lesdraaiboek = {
  id: "getallenlijn-eindtoets",
  titel: "Eindtoets: verschil op de getallenlijn",
  synthesis: "Subtract on the Number Line · Mastery Check (groep 3-deel)",
  kaarttekening: KaartSprongen,
  async speel(l) {
    /* Synthesis gebruikt in de Mastery Check voor dit deel dezelfde getallen als in de Assessment. */
    await lijnToets(l, 8, 13);
  },
};

/**
 * Verschil: doortellen vanaf het kleinste getal — groep 3-deel van "Difference
 * Dash: Leaps Ahead" (alleen 8 − 5; in één keer springen per 5 en de rest van
 * de les zijn groep 4).
 */
const doortellenVanafKleinste: Lesdraaiboek = {
  id: "getallenlijn-doortellen",
  titel: "Verschil: doortellen vanaf het kleinste getal",
  synthesis: "Subtract on the Number Line · Difference Dash: Leaps Ahead (groep 3-deel)",
  kaarttekening: KaartSprongen,

  async speel(l) {
    l.vlak(GetallenlijnSprongen, { van: 0, tot: 8 });
    await l.zeg(l.naam ? `Welkom terug, ${l.naam}.` : "Welkom terug.", "We leren een snellere manier om het verschil te vinden.");
    await l.verder();
    await l.zeg("We vonden het verschil al met de getallenlijn.");
    await l.verder();

    nieuweLijn(l, 0, 13, { gemarkeerd: [5, 8], springer: 5 });
    minsom(l, 8, 5, true);
    await l.zeg(
      "Stel, we zoeken het verschil tussen {8} en {5}.",
      "Wat kunnen we doen?",
      "Doortellen van {5} tot {8}?",
      "{5} plus {8} uitrekenen?",
      "Of doortellen van {0} tot {8}?",
    );
    const goed = "Doortellen van 5 tot 8";
    const optellen = "5 plus 8 uitrekenen";
    const keuze = await l.kies([goed, optellen, "Doortellen van 0 tot 8"]);

    if (keuze === goed) {
      await l.zeg("Ja.", "We tellen door vanaf het kleinste getal, de {5}.", "Help het sterretje springen naar de {8}.", "Eén getal tegelijk.");
      await springen(l, 5, 8, "1");
    } else {
      if (keuze === optellen) {
        await l.zeg("Dat klopt niet helemaal.", "{5} plus {8} is iets anders.");
        await l.verder();
        await l.zeg("{5} plus {8} is {13}.", "Tik op de {13} om het te zien.");
        while ((await tikGetal(l)) !== 13) {
          await l.zeg("Tik op de {13}.");
        }
        zet(l, { gemarkeerd: [5, 8, 13], springer: 13, bogen: [{ van: 5, naar: 13 }] });
        await l.wacht(700);
        await l.zeg("Hm, zo zie je het verschil niet.", "We tellen door vanaf de {5}.");
      } else if (keuze === null) {
        await l.zeg("Geen zorgen.", "We tellen door vanaf het kleinste getal, de {5}.");
      } else {
        await l.zeg("Vanaf {0} tel je alle getallen tot de {8}.", "Maar we beginnen bij de {5}.", "We tellen door vanaf de {5}.");
      }
      await l.verder();
      zet(l, { gemarkeerd: [5, 8] });
      await laatZien(l, 5, 8, "1");
    }

    await l.zeg("Gelukt.", "We telden {3} sprongen tussen {5} en {8}.");
    await l.verder();
    await vulVerschilIn(l, 8, 5, ["Vul het verschil in het vakje in."]);
    await l.zeg("Goed zo.", "Het verschil is {3}.");
    await l.verder();
    await l.zeg("Elk getal tellen is soms het beste.", "Vooral als je iets voor het eerst leert.");
    await l.verder();

    l.som(null);
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg("Mooi gedaan.", "Deze les is klaar.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/**
 * Verschil: ook boven de 10 — groep 3-deel van "Difference Dash: Into the
 * Thousands" (8 − 5 en 18 − 15; vanaf 118 − 115 is het groep 4 en hoger).
 */
const verschilBoven10: Lesdraaiboek = {
  id: "getallenlijn-boven-de-10",
  titel: "Verschil: ook boven de 10",
  synthesis: "Subtract on the Number Line · Difference Dash: Into the Thousands (groep 3-deel)",
  kaarttekening: KaartSprongen,

  async speel(l) {
    l.vlak(GetallenlijnSprongen, { van: 0, tot: 10 });
    await l.zeg(l.naam ? `Welkom terug, ${l.naam}.` : "Welkom terug.", "We zoeken het verschil tussen grotere getallen.");
    await l.verder();
    await l.zeg("We beginnen met kleine getallen.", "Worden de getallen groter?", "Dan blijft het idee hetzelfde.");
    await l.verder();

    const eerst = await spelSom(l, 8, 5, ["Wat is het verschil tussen {8} en {5}?", "Spring op de lijn als dat helpt."], {
      groteSprong: true,
      fout1: ["Dat is het niet helemaal.", "We proberen het nog eens.", "Wat is het verschil?", "Gebruik nu de getallenlijn."],
    });
    await l.zeg(eerst ? "Goed zo!" : "Ja, zo is het.", "Het verschil is {3}.");
    await l.verder();

    const tweede = await spelSom(l, 18, 15, ["We gaan een tandje hoger.", "{18} en {15}.", "Wat is het verschil?"], {
      van: 10,
      tot: 20,
      groteSprong: true,
      fout1: ["Dat is het niet helemaal.", "Kijk naar de lijn.", "Tel de sprongen van {15} naar {18}."],
    });
    await l.zeg(tweede ? "Precies!" : "Ja.", "Het verschil is weer {3}.");
    await l.verder();
    await l.zeg("{8} en {5} verschillen {3}.", "{18} en {15} ook.", "De getallen zijn groter, maar het idee blijft hetzelfde.");
    await l.verder();

    l.som(null);
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(
      l.naam ? `Wauw, ${l.naam}.` : "Wauw.",
      "Je begon met sprongen tussen kleine getallen.",
      "Nu vind je het verschil ook boven de {10}.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

export const LESSEN_GETALLENLIJN: Lesdraaiboek[] = [
  lijnInstaptoets,
  verschilSprongenTellen,
  doortellenVanafKleinste,
  verschilBoven10,
  lijnEindtoets,
];
