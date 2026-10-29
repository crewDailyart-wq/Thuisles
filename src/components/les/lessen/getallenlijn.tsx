/**
 * Lessen van het onderdeel "Getallenlijn" (oktober 2026); zie ../soort.ts.
 *
 * Verschil: sprongen tellen (LESSENPLAN.md A8) — naar Synthesis "Subtract on
 * the Number Line · Difference Dash: Count the Jumps" (INSPIRATIE.md, ronde
 * 1, 2 en 3, blok M). Groep 3.
 *
 * Verloop zoals daar, in eigen woorden:
 * 1. Wil je eerst zien hoe de lantaarntjes werken? Zo ja: een rondleiding met
 *    7 en 3 (getallen aantikken, het vuurvliegje springt, terugspringen wist
 *    de boogjes, het verschil invullen).
 * 2. Wil je laten zien wat je al weet? Ja: meteen het spel. Nee:
 * 3. 3 − 2: aantikken, één sprong, "hoe ver liggen ze uit elkaar?" en het
 *    woord *verschil* (met de hulp van ronde 3).
 * 4. 4 − 2: zelf aantikken, springen, het verschil invullen. Daarna terug
 *    springen van 4 naar 2: het verschil blijft hetzelfde (uit ronde 1).
 * 5. Paren zoeken met een verschil van 2 (lijn 5–10).
 * 6. Het spel: tien sommen, voor elk goed antwoord gaat er een lampje aan.
 * Aan het eind de kaart.
 *
 * Sinds 27 oktober 2026 in Phaser (HARDE REGEL 7): de lantaarntjeslijn met
 * een springend vuurvliegje (../vlakken/aftrekken-holo-lijn.tsx, wereld
 * Aarde) in plaats van de getallenlijn met het sterretje. Ook "Verschil:
 * doortellen vanaf het kleinste getal" (A9). De andere lessen hieronder
 * (instaptoets, eindtoets, boven de 10) gebruiken nog de getallenlijn met
 * het sterretje (../vlakken/getallenlijn-sprongen.tsx).
 *
 * Bewust anders dan Synthesis: geen stippenmachine vooraf (INSPIRATIE: "bewust
 * niet overnemen"), en een vuurvliegje in plaats van het astronautje.
 *
 * Tweede bouwronde: de groep 3-delen van Assessment, Leaps Ahead, Into the
 * Thousands en Mastery Check (onderaan dit bestand).
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { GetallenlijnSprongen, type Boog, type GetallenlijnSprongenProps } from "../vlakken/getallenlijn-sprongen";
import { AftrekkenHoloLijn, type LantaarnlijnProps } from "../vlakken/aftrekken-holo-lijn";
import { metAanwijzen } from "./aftrekken-tot-10";

type P = GetallenlijnSprongenProps & Pick<LantaarnlijnProps, "lampjesTotaal">;
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
 * Een verkeerd getal doet niets (Synthesis ronde 3); pas na drie keer mis
 * zegt Bliepo de opdracht nog eens, zodat het kind nooit vastloopt.
 */
async function tikTwee(l: Lesgids, groot: number, klein: number, eerst: number | null, naEerste: string[]): Promise<void> {
  const gem: number[] = [];
  let mis = 0;
  minsom(l, null, null);
  while (gem.length < 2) {
    const n = await tikGetal(l);
    const nodig = eerst !== null && gem.length === 0 ? [eerst] : [groot, klein].filter((g) => !gem.includes(g));
    if (!nodig.includes(n)) {
      if (gem.includes(n)) continue;
      mis++;
      if (mis % 3 === 0) await l.zeg(nodig.length === 1 ? `Tik op de {${nodig[0]}}.` : `Tik op de {${groot}} en de {${klein}}.`);
      continue;
    }
    gem.push(n);
    zet(l, { gemarkeerd: [...gem] });
    minsom(l, gem.includes(groot) ? groot : null, gem.includes(klein) ? klein : null);
    if (gem.length === 1 && naEerste.length) await l.zeg(...naEerste);
  }
}

/**
 * Het vuurvliegje springt van `van` naar `naar`, één getal per tik.
 * `label`: dit staat boven elke boog (bijvoorbeeld "1"). Springt het kind
 * verkeerd: "Probeer opnieuw. Spring naar de …" (Synthesis ronde 3).
 */
async function springen(l: Lesgids, van: number, naar: number, label?: string): Promise<void> {
  const richting = naar > van ? 1 : -1;
  let plek = van;
  let bogen: Boog[] = [];
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
      await l.zeg("Probeer het opnieuw.", `Spring naar de {${plek + richting}}.`, "Het vuurvliegje springt één getal tegelijk.");
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

/**
 * Het verschil typen in het laatste vakje van de som. Geeft terug of het
 * meteen goed was. 1× fout: "… is het niet" en tel de sprongen; 2× fout:
 * het vuurvliegje springt het voor en Bliepo zegt het antwoord.
 */
async function vulVerschilIn(l: Lesgids, groot: number, klein: number, uitleg: string[]): Promise<boolean> {
  const d = groot - klein;
  minsom(l, groot, klein, true);
  await l.zeg(...uitleg);
  for (let fout = 0; ; ) {
    const x = await l.somVak(4);
    if (x === d) return fout === 0;
    fout++;
    if (fout === 1) {
      await l.zeg(`{${x}} is het niet.`, `Tel de sprongen van {${klein}} naar {${groot}}.`, "Probeer het opnieuw.");
    } else if (fout === 2) {
      await l.zeg("Kijk, het vuurvliegje springt het voor.");
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

/* ---------- de onderdelen van "Verschil: sprongen tellen" (A8) ---------- */

async function rondleiding(l: Lesgids): Promise<void> {
  await l.zeg("We kijken samen hoe de lantaarntjes werken.", "We zoeken het verschil tussen {7} en {3}.");
  minsom(l, null, null);
  await l.zeg("Tik eerst allebei de getallen aan.", "Eerst de {7}, dan de {3}.");
  await tikTwee(l, 7, 3, 7, ["Goed zo.", "Nu het andere getal."]);
  await l.zeg("Makkelijk, toch?", "Zo zetten we elke minsom klaar.", "Nu zie je allebei de getallen.", "Hun lantaarntjes branden.");
  await l.verder();

  zet(l, { springer: 3 });
  await l.zeg("En kijk, hier is het vuurvliegje.", "Het komt als allebei de getallen klaarstaan.");
  await l.verder();
  await l.zeg("Begin hier, bij de {3}.", "Spring steeds één getal verder.", "Tel de sprongen mee.");
  await springen(l, 3, 7);

  await l.zeg("Mooi, leuk hè?", "Nog één ding.", "Spring eens terug naar de {3}.");
  while ((await tikGetal(l)) !== 3) {
    /* een ander getal doet niets */
  }
  zet(l, { springer: 3, bogen: [] });
  await l.zeg("Je sprong terug naar het begin.", "Dan gaan de boogjes weg.", "Dat is handig als je opnieuw wilt beginnen.");
  await l.verder();

  /* Zoals Synthesis: bij een fout meteen "dat is het niet, probeer opnieuw". */
  minsom(l, 7, 3, true);
  await l.zeg("Nu vullen we het verschil in.", "Je telde van {3} naar {7}.", "Typ het in het vakje.");
  for (let fout = 0; ; fout++) {
    const x = await l.somVak(4);
    if (x === 4) break;
    if (fout === 0) await l.zeg(`Dat is geen {${x}}.`, "Probeer het opnieuw.");
    else {
      zet(l, { springer: 3, bogen: [] });
      await laatZien(l, 3, 7);
      await l.zeg("Het zijn {4} sprongen.", "Typ de {4}.");
    }
  }
  await l.zeg("Heel goed.", "Nu weet je hoe het werkt.");
  await l.verder();
}

/** 3 − 2: één sprong, en het woord verschil (met de hulp van Synthesis ronde 3). */
async function eenSprong(l: Lesgids, later: [number, number][]): Promise<void> {
  l.som(null);
  nieuweLijn(l, 0, 5);
  minsom(l, 3, 2, true);
  await l.zeg("Eerst tikken we op deze getallen.", "{3} en {2}.", "Begin met de {2}.");
  await tikTwee(l, 3, 2, 2, ["Goed!", "Tik nu het andere getal."]);
  minsom(l, 3, 2, true);
  await l.zeg("Hm, ze liggen dicht bij elkaar, hè?", "We zoeken uit hoe ver ze uit elkaar liggen.");
  await l.verder();
  await l.zeg("Het vuurvliegje helpt.", "Laat het springen van {2} naar {3}.");
  await springen(l, 2, 3);

  await l.zeg("Mooi.", "Hoe ver liggen ze uit elkaar?", "Hoe ver sprong het vuurvliegje?");
  const x = await l.getal();
  if (x === 1) {
    await l.zeg("Precies.", "Ze liggen naast elkaar.", "Ze liggen {1} uit elkaar.");
  } else if (x === null) {
    await l.zeg("Geen zorgen.", "Het sprong van {2} naar {3}.", "Dat is een sprong van {1}.", "Dat zien we later.");
    later.push([3, 2]);
  } else {
    /* 1× fout: de denkfout uitleggen, en dan maar twee knoppen (Synthesis ronde 3). */
    if (x === 2) {
      await l.zeg("Het vuurvliegje begon op de {2}.", "En het landde op de {3}.", "Dat zijn twee getallen.");
    } else {
      await l.zeg("Kijk naar het boogje.");
    }
    await l.zeg("Maar we willen weten hoe ver het sprong.", "Tik op de goede sprong.");
    const ander = x === 3 ? 2 : 3;
    const k = await l.kies([1, ander].sort((a, b) => a - b).map(String));
    if (k === "1") {
      await l.zeg("Ja!", "Een sprong van {1}.");
    } else {
      /* 2× fout (of weet ik niet): het antwoord. */
      await l.zeg(k === null ? "Geen zorgen." : "Hm, dat is het nog steeds niet.", "Het sprong van {2} naar {3}.", "Dat is een sprong van {1}.");
      await l.verder();
    }
  }
  await l.zeg("Hoe ver ze uit elkaar liggen, dat heet het *verschil*.", "Daarom zijn de lantaarntjes zo handig.");
  await l.verder();

  await vulVerschilIn(l, 3, 2, ["Typ het verschil in het vakje."]);
  await l.zeg("Dat klopt.", "Het verschil tussen {3} en {2} is {1}.");
  await l.verder();
}

/** 4 − 2: zelf aantikken en springen; daarna terug: het verschil blijft gelijk. */
async function tweeSprongen(l: Lesgids): Promise<void> {
  l.som(null);
  nieuweLijn(l, 0, 5);
  await l.zeg("Nu twee getallen die verder uit elkaar liggen.", "Wat is het verschil tussen {4} en {2}?", "Tik allebei de getallen aan.");
  await tikTwee(l, 4, 2, null, []);
  await l.zeg("Deze liggen verder uit elkaar.", "Help het vuurvliegje springen van {2} naar {4}.", "Eén getal tegelijk.");
  await springen(l, 2, 4);
  await vulVerschilIn(l, 4, 2, ["Tel de sprongen van {2} naar {4}.", "Het verschil is hoe ver ze uit elkaar liggen.", "Typ dan het verschil in het vakje."]);
  await l.zeg(l.naam ? `Ja, knap gedaan, ${l.naam}.` : "Ja, knap gedaan.", "Het verschil tussen {4} en {2} is {2}.", "Ze liggen {2} uit elkaar.");
  await l.verder();

  /* Terugspringen: het verschil blijft hetzelfde. */
  await l.zeg("We sprongen vooruit, van {2} naar {4}.", "Nu springt het vuurvliegje terug.", "Wordt het verschil dan anders?");
  const keuze = await l.kies(["Ja", "Nee"]);
  await l.zeg(keuze === null ? "Geen zorgen, we kijken samen." : "Kijk maar mee.", "Laat het vuurvliegje terugspringen naar de {2}.");
  zet(l, { bogen: [] });
  await springen(l, 4, 2);
  await l.zeg(keuze === "Nee" ? "Je had gelijk." : "Kijk eens.", "Het zijn nog steeds {2} sprongen.", "Vooruit of terug: het verschil blijft {2}.");
  await l.verder();
}

/** Paren zoeken met een verschil van 2, op de lijn van 5 tot 10 (minstens twee, een derde mag). */
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
    await l.zeg(paar === 1 ? "Kijk naar deze lantaarntjes." : "Zoek nog zo'n paar.", "Tik twee getallen aan met een verschil van {2}.");
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
          await l.zeg(paar === 1 ? "Heel goed." : "Een goed paar!", `{${b}} en {${a}} hebben een verschil van {2}!`);
          break;
        }
        fout++;
        await l.zeg("Hm, niet helemaal.", `{${a}} en {${b}} liggen {${d}} uit elkaar.`);
        if (fout < 2) {
          await l.zeg("Je krijgt nog een kans.", "Tik twee getallen aan met een verschil van {2}.");
          nieuweLijn(l, 5, 10);
          continue;
        }
        await l.verder();
      }

      /* "Weet ik niet", of twee keer mis: Bliepo laat een paar zien. */
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
    if (paar === 1) continue;
    await l.zeg("Je bent goed bezig.", "Wil je nog zo'n paar zoeken?");
    const verder = await l.kies(["Ja", "Nee"]);
    if (verder !== "Ja") break;
  }
  await l.zeg("Je snapt nu goed hoe je het verschil vindt.");
  await l.verder();
}

/**
 * Eén som op de lantaarntjeslijn (A8 en A9): het kind mag de getallen
 * aantikken en het vuurvliegje laten springen, of meteen het antwoord in
 * het vakje typen. Geeft het aantal fouten (0 = meteen goed).
 *
 * `opKlein`: de getallen branden al en het vuurvliegje staat al op het
 * kleinste getal (doortellen, A9). `label`: wat er boven elk boogje komt.
 * 1× fout: `fout1`; 2× fout: het vuurvliegje springt het voor en Bliepo
 * zegt het antwoord (het kind typt het dan zelf).
 */
async function lijnSom(
  l: Lesgids,
  groot: number,
  klein: number,
  vraag: string[],
  opties: { van?: number; tot?: number; opKlein?: boolean; label?: string; fout1?: string[]; extra?: Partial<LantaarnlijnProps> } = {},
): Promise<number> {
  const { van = 0, tot = 10, opKlein = false, label, fout1 = ["Tel de sprongen tussen de getallen.", "Probeer het nog eens."], extra = {} } = opties;
  const d = groot - klein;
  let gem: number[] = opKlein ? [groot, klein] : [];
  let plek: number | null = opKlein ? klein : null;
  let bogen: Boog[] = [];
  nieuweLijn(l, van, tot, { ...extra, gemarkeerd: gem, springer: plek });
  minsom(l, groot, klein, true);

  let klaar = false;
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
        } else if (plek !== null && plek < groot && (n === plek + 1 || n === groot)) {
          /* Eén getal verder, of in één sprong naar het grootste getal. */
          bogen = [...bogen, { van: plek, naar: n, label: n === plek + 1 ? label : undefined }];
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
      await l.zeg(`{${groot}} − {${klein}} = {${x}}?`, ...fout1);
    } else {
      klaar = true;
      zet(l, { actief: false });
      await l.zeg("Kijk, het vuurvliegje springt het voor.");
      gem = [groot, klein];
      zet(l, { gemarkeerd: gem, springer: klein, bogen: [] });
      await laatZien(l, klein, groot, label);
      await l.zeg(`Van {${klein}} naar {${groot}} ${d === 1 ? "is {1} sprong" : `zijn {${d}} sprongen`}.`, `Typ de {${d}}.`);
    }
  }
  klaar = true;
  zet(l, { actief: false });
  return fout;
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

/**
 * Het spel (A8): tien sommen; bij elk antwoord dat meteen goed is, gaat er
 * bovenaan een lampje aan. Wat twee keer mis ging (of "weet ik niet" eerder
 * in de les), komt aan het eind nog één keer terug.
 */
async function spel(l: Lesgids, later: [number, number][]): Promise<void> {
  l.som(null);
  const totaal = 10;
  nieuweLijn(l, 0, 10, { kristallen: 0, lampjesTotaal: totaal });
  await l.zeg("Nu gaan we spelen!", "Bij elk goed antwoord gaat er bovenaan een lampje aan.");
  await l.verder();

  const sommen: [number, number][] = [
    [6, 1],
    [7, 3],
    [8, 3],
    [4, 1],
    [9, 4],
    [10, 6],
    [9, 7],
    [8, 5],
    [6, 4],
    [10, 3],
  ];
  const inleiding = [
    ["Hier is de eerste.", "Je mag de getallen aantikken.", "Of je typt meteen het antwoord."],
    ["Probeer deze eens."],
    ["Hier is er nog een."],
    ["Ga zo door."],
    ["Deze dan?"],
    ["Hier is er weer een."],
    ["Nog een."],
    ["Je bent al ver."],
    ["Bijna klaar."],
    ["De laatste."],
  ];
  const goed = [["Ja!"], [l.naam ? `Je begint het echt te snappen, ${l.naam}.` : "Je begint het echt te snappen."], ["Goed zo."], ["Precies."], ["Knap gedaan!"], ["Ja!"], ["Mooi."], ["Klopt."], ["Heel goed."], ["Super!"]];
  let lampjes = 0;
  const nogEens: [number, number][] = [...later];
  for (let i = 0; i < sommen.length; i++) {
    const [a, b] = sommen[i];
    const fout = await lijnSom(l, a, b, [...inleiding[i], `Wat is het verschil tussen {${a}} en {${b}}?`], { extra: { kristallen: lampjes, lampjesTotaal: totaal } });
    if (fout === 0) {
      lampjes++;
      zet(l, { kristallen: lampjes });
      await l.zeg(...goed[i], `Het verschil is {${a - b}}.`);
    } else {
      await l.zeg(`Het verschil is {${a - b}}.`, ...(fout >= 2 ? ["Dat zien we straks."] : []));
      if (fout >= 2) nogEens.push([a, b]);
    }
    await l.wacht(400);
  }
  for (const [a, b] of nogEens) {
    await lijnSom(l, a, b, ["Deze kwam net al.", `Wat is het verschil tussen {${a}} en {${b}}?`], { van: 0, tot: Math.max(5, a), extra: { kristallen: lampjes, lampjesTotaal: totaal } });
    await l.zeg("Ja.", `Het verschil is {${a - b}}.`);
  }
  await l.zeg(lampjes === totaal ? "Alle lampjes branden!" : lampjes === 1 ? "Er brandt {1} lampje." : `Er branden {${lampjes}} lampjes.`);
  await l.verder();
}

/** Lijntekening voor op de kaart: een rij lantaarntjes met twee boogjes en een vuurvliegje. */
function KaartLantaarns() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16" y1="160" x2="228" y2="160" stroke="#d6dbe8" strokeWidth="3" />
      {[30, 80, 130, 180, 214].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 8} 136 L${x} 128 L${x + 8} 136`} stroke="#f2c94c" strokeWidth="2.4" />
          <rect x={x - 7} y="137" width="14" height="17" rx="3" stroke="#f2c94c" strokeWidth="2.4" fill={i === 1 || i === 3 ? "#f2c94c" : "none"} />
        </g>
      ))}
      <path d="M80 126 C 80 76, 130 76, 130 126" stroke="#ffb15a" strokeWidth="3.4" />
      <path d="M130 126 C 130 76, 180 76, 180 126" stroke="#ffb15a" strokeWidth="3.4" />
      <ellipse cx="173" cy="40" rx="7" ry="4.5" stroke="#cfe9ff" strokeWidth="2" />
      <ellipse cx="187" cy="40" rx="7" ry="4.5" stroke="#cfe9ff" strokeWidth="2" />
      <circle cx="180" cy="50" r="8" fill="#f2f79a" stroke="#c9d84a" strokeWidth="2" />
    </g>
  );
}

export const verschilSprongenTellen: Lesdraaiboek = {
  id: "getallenlijn-sprongen-tellen",
  titel: "Verschil: sprongen tellen",
  synthesis: "Subtract on the Number Line · Difference Dash: Count the Jumps",
  kaarttekening: KaartLantaarns,

  async speel(ruw) {
    const l = metAanwijzen(ruw);
    l.vlak(AftrekkenHoloLijn, { van: 0, tot: 10 });
    await l.zeg(l.naam ? `Hoi ${l.naam}.` : "Hoi.", "Vandaag zoeken we het verschil tussen twee getallen.");
    await l.verder();
    await l.zeg("Zal ik eerst laten zien hoe de lantaarntjes werken?");
    const uitleg = await l.kies(["Ja", "Nee"]);
    if (uitleg === "Ja") {
      await l.zeg("Mooi.", "Ik help je graag.");
      await rondleiding(l);
    } else {
      await l.zeg(uitleg === null ? "Geen zorgen." : "Fijn.", uitleg === null ? "Je ziet het vanzelf." : "Je weet het nog.");
    }

    /* Zoals Synthesis: wil je laten zien wat je al weet? Ja: meteen het spel. */
    l.som(null);
    nieuweLijn(l, 0, 10);
    await l.zeg("Wil je laten zien wat je al weet?");
    const laten = await l.kies(["Ja", "Nee"]);
    const later: [number, number][] = [];
    if (laten === "Ja") {
      await l.zeg("Oké, laat maar zien.");
      await l.verder();
    } else {
      await l.zeg("Goed.", "We beginnen makkelijk.", "Daarna wordt het wat moeilijker.");
      await l.verder();
      await eenSprong(l, later);
      await tweeSprongen(l);
      await parenZoeken(l);
    }
    await spel(l, later);

    /* Einde: de kaart. */
    l.som(null);
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gewerkt vandaag, ${l.naam}.` : "Goed gewerkt vandaag.", "Je kunt het verschil vinden met sprongen.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};


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
 * Verschil: doortellen vanaf het kleinste getal (A9) — groep 3-deel van
 * "Difference Dash: Leaps Ahead": 8 − 5 (wat kunnen we doen?), dan "ben je
 * zeker? dan in één sprong" (10 − 5), en daarna twaalf sommen met een
 * verschil tot 10 op de lantaarntjeslijn 0–13 (het vuurvliegje staat al op
 * het kleinste getal). 17 − 14, 25 − 22 en de paren tot 30 zijn groep 4.
 */
const doortellenVanafKleinste: Lesdraaiboek = {
  id: "getallenlijn-doortellen",
  titel: "Verschil: doortellen vanaf het kleinste getal",
  synthesis: "Subtract on the Number Line · Difference Dash: Leaps Ahead (groep 3-deel)",
  kaarttekening: KaartLantaarns,

  async speel(ruw) {
    const l = metAanwijzen(ruw);
    l.vlak(AftrekkenHoloLijn, { van: 0, tot: 8 });
    await l.zeg(l.naam ? `Welkom terug, ${l.naam}.` : "Welkom terug.", "We leren een snellere manier om het verschil te vinden.");
    await l.verder();
    await l.zeg("We vonden het verschil al met de lantaarntjes.");
    await l.verder();

    /* 1. 8 − 5: wat kunnen we doen? */
    nieuweLijn(l, 0, 13, { gemarkeerd: [5, 8], springer: 5 });
    minsom(l, 8, 5, true);
    await l.zeg("We zoeken het verschil tussen {8} en {5}.", "Wat kunnen we doen?", "Optellen van {5} tot {8}?", "{5} en {8} optellen?", "Of optellen van {0} tot {8}?");
    const goed = "Van 5 tot 8";
    const optellen = "5 en 8 optellen";
    const keuze = await l.kies([goed, optellen, "Van 0 tot 8"]);

    if (keuze === goed) {
      await l.zeg("Ja.", "We tellen op vanaf het kleinste getal, de {5}.", "Help het vuurvliegje springen naar de {8}.", "Eén getal tegelijk.");
      await springen(l, 5, 8, "1");
    } else {
      if (keuze === optellen) {
        await l.zeg("Dat klopt niet helemaal.", "Als je {5} en {8} optelt, is het antwoord anders.");
        await l.verder();
        await l.zeg("{5} en {8} samen is {13}.", "Tik op de {13} om het te zien.");
        while ((await tikGetal(l)) !== 13) {
          /* een ander getal doet niets */
        }
        zet(l, { gemarkeerd: [5, 8, 13], springer: 13, bogen: [{ van: 5, naar: 13 }] });
        await l.wacht(900);
        await l.zeg("Hm, zo zien we het verschil tussen {5} en {8} niet.", "We tellen op vanaf de {5}.");
      } else if (keuze === null) {
        await l.zeg("Geen zorgen.", "We tellen op vanaf het kleinste getal, de {5}.");
      } else {
        await l.zeg("Vanaf {0} tel je alle getallen tot de {8}.", "Maar we beginnen bij de {5}.", "We tellen op vanaf de {5}.");
      }
      await l.verder();
      /* Het vuurvliegje doet het voor, met een 1 boven elk boogje. */
      zet(l, { gemarkeerd: [5, 8], springer: 5, bogen: [] });
      await laatZien(l, 5, 8, "1");
    }

    await l.zeg("Daar zijn we.", "We telden {3} sprongen tussen {5} en {8}.");
    await l.verder();
    await vulVerschilIn(l, 8, 5, ["Vul het verschil in het vakje in."]);
    await l.zeg("Perfect.", "Het verschil is {3}.");
    await l.verder();

    /* 2. Ben je zeker? Dan in één sprong. */
    await l.zeg("Soms is het best om elk getal te tellen.", "Vooral als je iets voor het eerst leert.");
    await l.verder();
    l.som(null);
    nieuweLijn(l, 0, 10, { gemarkeerd: [5, 10], springer: 5 });
    minsom(l, 10, 5, true);
    await l.zeg("Maar soms weet je het zeker.", "Hier zoeken we het verschil tussen {10} en {5}.", "Weet je het zeker? Dan in één sprong.", "Tik maar op de {10}.");
    let plek = 5;
    let bogen: Boog[] = [];
    let gezegd = false;
    while (plek !== 10) {
      const n = await tikGetal(l);
      if (n === 10) {
        bogen = [...bogen, { van: plek, naar: 10, label: String(10 - plek) }];
        plek = 10;
      } else if (n === plek + 1) {
        bogen = [...bogen, { van: plek, naar: n, label: "1" }];
        plek = n;
        if (!gezegd) {
          gezegd = true;
          zet(l, { springer: plek, bogen });
          await l.zeg("Je telt per één; dat mag.", "Je mag ook meteen op de {10} tikken.");
          continue;
        }
      } else continue;
      zet(l, { springer: plek, bogen });
    }
    await l.wacht(500);
    await vulVerschilIn(l, 10, 5, ["Mooi gedaan.", "Hoe ver was dat?", "Vul het verschil in."]);
    await l.zeg("Precies.", "Het verschil is {5}.");
    await l.verder();
    await l.zeg("Weet je het zeker? Spring dan in één keer.", "Anders tel je elk getal.", "Je krijgt hetzelfde antwoord.");
    await l.verder();

    /* 3. Oefenen: twaalf sommen; het vuurvliegje staat al op het kleinste getal. */
    const sommen: [number, number][] = [
      [9, 6],
      [12, 8],
      [7, 5],
      [11, 7],
      [10, 7],
      [13, 8],
      [9, 4],
      [12, 9],
      [11, 9],
      [13, 7],
      [8, 2],
      [10, 3],
    ];
    const totaal = sommen.length;
    let lampjes = 0;
    await l.zeg("Nu jij.", "Het vuurvliegje staat steeds op het kleinste getal.", "Tel op tot het grootste getal.", "Bij elk goed antwoord gaat er een lampje aan.");
    await l.verder();
    const later: [number, number][] = [];
    const lof = ["Ja!", "Goed zo.", "Precies.", "Klopt.", "Knap!", "Mooi."];
    for (let i = 0; i < sommen.length; i++) {
      const [a, b] = sommen[i];
      const fout = await lijnSom(l, a, b, [i === 0 ? "Hier is de eerste." : i === sommen.length - 1 ? "De laatste." : "", `Wat is het verschil tussen {${a}} en {${b}}?`], {
        van: 0,
        tot: 13,
        opKlein: true,
        label: "1",
        fout1: [`Tel op vanaf de {${b}}.`, "Probeer het nog eens."],
        extra: { kristallen: lampjes, lampjesTotaal: totaal },
      });
      if (fout === 0) {
        lampjes++;
        zet(l, { kristallen: lampjes });
        await l.zeg(lof[i % lof.length], `Van {${b}} tot {${a}} is {${a - b}}.`);
      } else {
        await l.zeg(`Het verschil is {${a - b}}.`, ...(fout >= 2 ? ["Dat zien we straks."] : []));
        if (fout >= 2) later.push([a, b]);
      }
      await l.wacht(300);
    }
    for (const [a, b] of later) {
      await lijnSom(l, a, b, ["Deze kwam net al.", `Wat is het verschil tussen {${a}} en {${b}}?`], { van: 0, tot: 13, opKlein: true, label: "1", extra: { kristallen: lampjes, lampjesTotaal: totaal } });
      await l.zeg("Ja.", `Het verschil is {${a - b}}.`);
    }

    l.som(null);
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Mooi gedaan, ${l.naam}.` : "Mooi gedaan.", "Je telt op vanaf het kleinste getal.", "Tik op de kaart om hem af te vinken.");
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
    await l.zeg("We beginnen met kleine getallen.", "Worden de getallen groter?", "Dan blijft het hetzelfde.");
    await l.verder();

    const eerst = await spelSom(l, 8, 5, ["Wat is het verschil tussen {8} en {5}?", "Spring op de lijn als dat helpt."], {
      groteSprong: true,
      fout1: ["Dat is het niet helemaal.", "We proberen het nog eens.", "Wat is het verschil?", "Gebruik nu de getallenlijn."],
    });
    await l.zeg(eerst ? "Goed zo!" : "Ja, zo is het.", "Het verschil is {3}.");
    await l.verder();

    const tweede = await spelSom(l, 18, 15, ["Nu wordt het iets moeilijker.", "{18} en {15}.", "Wat is het verschil?"], {
      van: 10,
      tot: 20,
      groteSprong: true,
      fout1: ["Dat is het niet helemaal.", "Kijk naar de lijn.", "Tel de sprongen van {15} naar {18}."],
    });
    await l.zeg(tweede ? "Precies!" : "Ja.", "Het verschil is weer {3}.");
    await l.verder();
    await l.zeg("{8} en {5} verschillen {3}.", "{18} en {15} ook.", "De getallen zijn groter, maar het blijft hetzelfde.");
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
