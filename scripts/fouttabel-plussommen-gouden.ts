/**
 * Maakt FOUTTABEL-squla-plus-bakkerij-1-gouden.md uit de code (squla-plussommen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de VERKLAPCONTROLE (BOUWREGELS 15.17; LESRECEPT "geleerd bij Tellen").
 *   npx tsx scripts/fouttabel-plussommen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel keuzes er na de eerste zin + de hint
 * logisch nog over zijn (de "beperking" in de fouttabel: meer dan, minder dan, een plussom, beide getallen). Blijft er
 * maar 1 over, dan verklapt de hint het antwoord en stopt het script. Noemt Bliepo geen richting, dan mag de hint ook
 * geen richtingwoord hebben. En: elke rekensom en elk goed antwoord wordt nagerekend (11.9).
 */
import { writeFileSync } from "node:fs";
import { PLUSREACTIE, VERBINDREACTIE, VRAGEN, WISSELWOORDEN, ZIN, foutenVan, kiesFoutZinnen, kleurenVan, overNa, somTekst, sommenOver, tweedeEerste, verbindFout, verbindKaal, zelfdeKern, type Fout, type Plusvraag, type Verhaal } from "../src/components/les/lessen/squla-plussommen-gouden-zinnen";
import { deeltStuk, maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
/** Woorden die een richting geven; verboden in een hint of eerste zin als Bliepo de richting niet noemt. */
const RICHTING = /sla (er )?geen|\bmeer\b|minder|maar 1 keer|1 keer aan|2 keer|te veel|te weinig|niet meer|precies \{?\d|alle \{?\d|alle \w+ (\w+ )?daar erbij|ook de laatste|alleen|staat al in|zit zelf al in|nog iets bij|afhaalt|afgehaald|\bweg\b|groter|kleiner|zo veel/i;
/** Wat een zin zegt: het goede antwoord is MEER dan wat het kind koos, of MINDER. (Alle varianten, 18 nov 2026.) */
const ZEGT_MEER = /te weinig|samen is meer dan|dat is minder dan|het zijn er meer|het is meer|sla (er )?geen|ook de laatste|alleen (het|de|hier|daar)|staat al in|zit zelf al in|nog iets bij|tel ook|hier én daar|hier en daar|de andere erbij|afhaalt|afgehaald|\bweg\b|die som is meer|alle \w+ (\w+ )?daar erbij/i;
const ZEGT_MINDER = /te veel|samen is minder dan|dat is meer dan|zo veel (zijn het er|is het) niet|niet meer\b|precies \d|maar 1 keer|1 keer aan|2 keer|die som is minder/i;
const BIJNA = /dichtbij|bijna|scheelt|net niet|net iets/i;

const fouten: string[] = [];

/* 1. Rekenen (11.9): elke vraag heeft precies 1 goed antwoord tussen de keuzes, of rekent alle goede antwoorden goed (14.30). */
for (const v of VRAGEN) {
  if (v.soort === "verhaal") {
    const n = v.keuzes.filter((k) => k === v.a + v.b).length;
    if (n !== 1) fouten.push(`${v.id}: ${n} goede keuzes`);
  } else if (v.soort === "toonbank") {
    const n = v.kaarten.filter((k) => k === v.a + v.b).length;
    if (n !== 1) fouten.push(`${v.id}: ${n} goede kaartjes`);
  } else if (v.soort === "som") {
    const n = v.opties.filter((o) => o === somTekst(v.a, v.b)).length;
    if (n !== 1) fouten.push(`${v.id}: ${n} goede sommen`);
    /* Elke som op een knop klopt zelf ook (een fout antwoord is een andere som, geen rekenfout). */
    for (const o of v.opties) {
      const m = o.match(/^(\d+) (.) (\d+) = (\d+)$/);
      if (!m) fouten.push(`${v.id}: "${o}" is geen som`);
      else if ((m[2] === "+" ? +m[1] + +m[3] : +m[1] - +m[3]) !== +m[4]) fouten.push(`${v.id}: "${o}" klopt niet`);
    }
  } else {
    const uit = v.sommen.map(([x, y]) => x + y).sort().join(",");
    if (uit !== [...v.antwoorden].sort().join(",")) fouten.push(`${v.id}: antwoorden passen niet 1 op 1 bij de sommen`);
  }
}
if (VRAGEN.length !== 16) fouten.push(`${VRAGEN.length} vragen in plaats van 16 (squla-plus-bakkerij-1)`);

/** Alle varianten van 1 rij (of de vaste zinnen als er geen varianten zijn). */
const V = (f: Fout) => f.v ?? { eerste: [f.eerste], hint: [f.hint], uitleg: [f.uitleg], weerEerste: f.weer.slice(0, 1), weerUitleg: f.weer.slice(1) };
const alleZinnen = (f: Fout) => [...V(f).eerste, ...V(f).hint, ...V(f).uitleg, ...V(f).weerEerste, ...V(f).weerUitleg];

/*
 * 2. Fouttabel compleet en VERKLAPCONTROLE over ALLE varianten (15.17): voor elke eerste zin met elke hint rekent het
 * script na welke keuzes er logisch nog over zijn (de beperking van de rij, plus wat de zinnen zelf zeggen: meer, minder,
 * "bijna"). Blijft er maar 1 over, dan verklapt de hint het antwoord en stopt het script.
 */
let telling = 0;
let combinaties = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = v.soort === "verhaal" ? v.keuzes.length - 1 : v.soort === "toonbank" ? v.kaarten.length - 1 : v.soort === "som" ? v.opties.length - 1 : v.sommen.length * (v.antwoorden.length - 1);
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    const waar = `${v.id} ${a}`;
    if (f.code !== "onduidelijk" && !f.eerste) fouten.push(`${waar}: geen eerste zin`);
    if (!f.hint) fouten.push(`${waar}: geen hint`);
    if (!f.v) fouten.push(`${waar}: geen varianten`);
    for (const z of alleZinnen(f)) {
      if (/\bfout/i.test(z)) fouten.push(`${waar}: het woord "fout" in "${kaal(z)}"`);
      /* Geen getal 2 keer in 1 variant (Sara, 18 nov 2026); alleen een getal dat in de som zelf 2 keer staat (4 + 4) mag. */
      const dubbelMag = v.soort !== "verbind" ? (v.a === v.b ? [String(v.a)] : []) : a.split(" → ")[0].split(" + ").includes(a.split(" → ")[1]) ? [a.split(" → ")[1]] : [];
      const g2 = (kaal(z).match(/\d+/g) ?? []).filter((n) => !dubbelMag.includes(n));
      if (new Set(g2).size !== g2.length) fouten.push(`${waar}: een getal staat 2 keer in "${kaal(z)}"`);
    }
    if (V(f).eerste.length < 3) fouten.push(`${waar}: maar ${V(f).eerste.length} varianten van de eerste zin (moet minstens 3)`);
    if (V(f).hint.length < 2) fouten.push(`${waar}: maar ${V(f).hint.length} varianten van de hint (moet minstens 2)`);
    if (V(f).uitleg.length < 2) fouten.push(`${waar}: maar ${V(f).uitleg.length} varianten van de uitleg (moet minstens 2)`);
    /* De vaste variant in de tabel is er 1 van. */
    if (f.v && (!f.v.eerste.includes(f.eerste) || !f.v.hint.includes(f.hint) || !f.v.uitleg.includes(f.uitleg))) fouten.push(`${waar}: de vaste variant staat niet in de varianten`);
    for (const e of V(f).eerste)
      for (const h of V(f).hint) {
        combinaties++;
        const tekst = kaal(`${e} ${h}`);
        if (f.noot && RICHTING.test(tekst)) fouten.push(`${waar}: richting niet genoemd, maar de zin geeft er toch een: "${tekst}"`);
        if (v.soort === "som") {
          const over = sommenOver(v, a, f.beperking);
          if (over.length <= 1) fouten.push(`${waar}: na "${tekst}" blijft alleen ${over.join("")} over`);
          continue;
        }
        const keuzes = v.soort === "verhaal" ? v.keuzes : v.soort === "toonbank" ? v.kaarten : v.antwoorden;
        const x = v.soort === "verbind" ? Number(a.split("→")[1]) : Number(a);
        const goed = v.soort === "verbind" ? a.split(" → ")[0].split(" + ").map(Number).reduce((p, q) => p + q, 0) : v.a + v.b;
        const meer = ZEGT_MEER.test(tekst);
        const minder = ZEGT_MINDER.test(tekst);
        const bijna = BIJNA.test(tekst);
        if (meer && minder) fouten.push(`${waar}: "${tekst}" zegt meer en minder tegelijk`);
        if ((meer && goed < x) || (minder && goed > x)) fouten.push(`${waar}: verkeerde richting in "${tekst}"`);
        if (bijna && Math.abs(goed - x) > 2) fouten.push(`${waar}: "bijna", maar het scheelt meer dan 2: "${tekst}"`);
        const over = overNa(keuzes, x, f.beperking).filter((k) => (meer ? k > x : true) && (minder ? k < x : true) && (bijna ? Math.abs(k - x) <= 2 : true));
        if (!over.includes(goed)) fouten.push(`${waar}: na "${tekst}" valt het goede antwoord af`);
        if (over.length <= 1) fouten.push(`${waar}: na "${tekst}" blijft alleen ${over.join("")} over`);
        /* Zonder noot noemt Bliepo de richting: dan heeft elke eerste zin er ook echt een ("weer" rekent daarop). */
        if (!f.noot && v.soort !== "verbind" && !ZEGT_MEER.test(kaal(e)) && !ZEGT_MINDER.test(kaal(e))) fouten.push(`${waar}: eerste zin zonder richting terwijl "weer" daarop rekent: "${kaal(e)}"`);
      }
  }
}
/*
 * 3. Waarheidscontrole (keuring Huisnummers, 10 nov 2026; alle varianten sinds 18 nov 2026): elke bewering in de eerste
 * zin, de hint, de uitleg en de "weer"-zinnen moet kloppen voor DIT antwoord bij DEZE vraag. Het kind kan in deze les
 * alleen uit vaste keuzes kiezen; de tabel heeft een rij voor elk fout antwoord, dus zo is elk mogelijk antwoord
 * nagelopen. En (keuring Getallenlijn): de zinnen bij de 2e fout zijn uitleg, geen opdracht (meteen daarna doen we het samen).
 */
const OPDRACHT = /(^|[.!?:] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Reken|Verbind|Probeer)\b/;
let beweringen = 0;
for (const v of VRAGEN)
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const waar = `${v.id} ${a}`;
    const zinnen = [f.eerste, f.hint, f.uitleg, f.kort ?? "", ...f.weer, ...alleZinnen(f)].map(kaal);
    const klopt = (zin: RegExp, ok: boolean, wat: string) => {
      for (const z of zinnen) {
        if (!zin.test(z)) continue;
        beweringen++;
        if (!ok) fouten.push(`${waar}: niet waar: ${wat} ("${z}")`);
      }
    };
    for (const z of [f.uitleg, ...f.weer, ...V(f).uitleg, ...V(f).weerEerste, ...V(f).weerUitleg]) if (OPDRACHT.test(kaal(z))) fouten.push(`${waar}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
    /* De eerste zin kan ook bij de 2e fout komen (met de uitleg): ook daar geen opdracht. */
    for (const z of V(f).eerste) if (OPDRACHT.test(kaal(z))) fouten.push(`${waar}: opdracht in de eerste zin: "${kaal(z)}"`);
    if (v.soort === "verhaal" || v.soort === "toonbank") {
      const x = Number(a);
      const s = v.a + v.b;
      const g2 = (n: number) => `\\b${n}\\b`;
      klopt(new RegExp(`\\b${v.a} en ${v.b} samen is minder dan ${x}\\b`), s < x, "samen is minder dan het gekozen getal");
      klopt(new RegExp(`\\b${v.a} en ${v.b} samen is meer dan ${x}\\b`), s > x, "samen is meer dan het gekozen getal");
      klopt(new RegExp(`${g2(x)}\\? Dat is meer dan ${v.a} en ${v.b} samen`), x > s, "meer dan samen");
      klopt(new RegExp(`${g2(x)}\\? Dat is minder dan ${v.a} en ${v.b} samen`), x < s, "minder dan samen");
      klopt(/te veel|zo veel (zijn het er|is het) niet|(?<!niet )\bminder\./, x > s, "te veel");
      klopt(/te weinig|het zijn er meer|het is meer\.|(?<!niet )\bmeer\.$/, x < s, "te weinig");
      klopt(/\b1 te veel|\b1 minder|net iets te veel|iets te veel/, x === s + 1, "precies 1 te veel");
      klopt(/\b1 te weinig|\b1 meer|net iets te weinig|iets te weinig/, x === s - 1, "precies 1 te weinig");
      klopt(/een paar/, Math.abs(x - s) >= 2, "een paar, maar het scheelt er maar 1");
      klopt(/dichtbij|bijna|scheelt|net niet/i, Math.abs(x - s) <= 2, "dichtbij, maar het scheelt meer dan 2");
      klopt(new RegExp(`(Je koos|Je tikte op) ${x}\\b|^${x}\\?|^${x} (staat|krijg|is)|Bijna! ${x}\\b`), true, "");
      klopt(/krijg je als je (\d+) van (\d+) afhaalt/, (() => { const m = zinnen.join(" ").match(/krijg je als je (\d+) van (\d+) afhaalt/); return !!m && Number(m[2]) - Number(m[1]) === x && [v.a, v.b].includes(Number(m[1])) && [v.a, v.b].includes(Number(m[2])); })(), "het verschil klopt niet");
      klopt(/Dan heb je er (\d+) afgehaald|Dan gaa[nt] er (\d+) weg/, x === Math.max(v.a, v.b) - Math.min(v.a, v.b), "afgehaald, maar dat is het verschil niet");
      klopt(/staat al in de som/, x === v.a || x === v.b, "staat al in de som");
      klopt(/weer een getal uit de som/, x === v.a || x === v.b, "weer een getal uit de som");
      if (v.soort === "verhaal") {
        klopt(/alleen (het|de) [^.]* hier\.|alleen hier\./, x === v.a, "alleen ... hier: dat is niet het 1e groepje");
        klopt(/alleen (het|de) [^.]* daar\.|alleen daar\./, x === v.b && x !== v.a, "alleen ... daar: dat is niet het 2e groepje");
        klopt(/Er komen er|stip|in de som/, false, "zin van de toonbank bij een verhaaltje");
      } else {
        klopt(new RegExp(`Er komen er ${v.b} bij, niet meer`), x > s, "niet meer");
        klopt(new RegExp(`Er komen er ${v.b} bij, niet minder`), x < s, "niet minder");
        klopt(/\bhier\b|\bdaar\b|taart|brood|cupcake|krentenbol|koekje|donut|croissant|Dat zijn er/, false, "lekkers bij de toonbank (daar is geen lekkers)");
      }
    } else if (v.soort === "som") {
      const m = a.match(/^(\d+) (.) (\d+) = (\d+)$/)!;
      const [p, t, q] = [Number(m[1]), m[2], Number(m[3])];
      klopt(/gaan er .* weg|minsom|haal je er .* af/, t === "−", "minsom, maar het kind koos een plussom");
      klopt(/2 keer de|2 keer hetzelfde getal/, p === q, "2 keer hetzelfde getal, maar dat is niet zo");
      klopt(new RegExp(`2 keer de ${p}\\b`), p === q, "2 keer de …: dat getal staat er niet 2 keer");
      void kleurenVan(v);
      klopt(new RegExp(`Hier liggen er ${v.a}, daar ${v.b}`), true, "");
    } else {
      const [sx, z] = a.split(" → ");
      const [x, y] = sx.split(" + ").map(Number);
      const zz = Number(z);
      const s = x + y;
      klopt(/te veel|Die som is minder|kleiner getal|van die som is minder/, zz > s, "te veel bij deze som");
      klopt(/te weinig|Die som is meer|van die som is meer/, zz < s, "te weinig bij deze som");
      klopt(/groter getal|Het wordt meer/, zz < s, "groter getal");
      klopt(/staat al in die som|zit zelf al in de som/, zz === x || zz === y, "staat al in die som");
      klopt(new RegExp(`(Je verbond|Bij) ${x} \\+ ${y} (met|koos je) ${zz}\\b|^${x} \\+ ${y} en ${zz} horen`), true, "");
      /* De som staat in 1 zin maar 1 keer. */
      for (const zin of zinnen) if ((zin.match(new RegExp(`${x} \\+ ${y}`, "g")) ?? []).length > 1) fouten.push(`${waar}: de som staat 2 keer in "${zin}"`);
    }
  }

/*
 * 4. Paren van 1e en 2e fout bij dezelfde vraag (geleerd bij Tellen, keuring 11 nov): nooit 2 keer dezelfde eerste zin,
 * nooit 2 keer "dichtbij"/"bijna", en er is altijd een uitleg die geen stuk herhaalt uit de zin ervoor.
 */
let paren = 0;
for (const v of VRAGEN) {
  const F = foutenVan(v);
  for (const [a, e] of Object.entries(F))
    for (const [b, f] of Object.entries(F)) {
      if (a === b) continue;
      const zelfde = e.soort === f.soort && !e.noot && !f.noot && V(f).weerEerste.length > 0;
      for (const z1 of V(e).eerste) {
        const kaalB = v.soort === "verbind" ? verbindKaal(v, v.sommen.findIndex(([x, y]) => `${x} + ${y}` === b.split(" → ")[0]), Number(b.split("→")[1])) : V(f).eerste;
        const kandidaten = zelfde ? V(f).weerEerste : tweedeEerste(kaalB, z1);
        if (!kandidaten.length) fouten.push(`${v.id} ${a} dan ${b}: geen eerste zin over voor de 2e fout`);
        for (const z2 of kandidaten) {
          paren++;
          if (zelfdeKern(z1, z2) && kandidaten.some((k) => !zelfdeKern(z1, k))) fouten.push(`${v.id} ${a} dan ${b}: 2 keer hetzelfde woord ("${kaal(z1)}" en dan "${kaal(z2)}")`);
          if (z1 === z2) fouten.push(`${v.id} ${a} dan ${b}: 2 keer dezelfde zin`);
          const uit = zelfde ? V(f).weerUitleg : V(f).uitleg;
          if (uit.length && !uit.some((u) => !deeltStuk(z2, u))) fouten.push(`${v.id} ${a} dan ${b}: elke uitleg herhaalt een stuk uit "${kaal(z2)}"`);
        }
      }
    }
}

/*
 * 5. NOOIT 2 KEER HETZELFDE (Sara, 18 nov 2026): speel de kiezer 20.000 keer na met willekeurige vragen en foute keuzes
 * (dezelfde functie als de les: kiesFoutZinnen) en kijk of er ooit 2 keer achter elkaar dezelfde zin komt (getallen en
 * lekkers weggedacht), ook over vragen heen. En: in 1 reactie staat nooit 2 keer dezelfde zin.
 */
{
  const vorm = maakVorm(WISSELWOORDEN);
  const K0 = maakKiezer({ wissel: WISSELWOORDEN });
  const laatste = new Map<string, string>();
  let dubbel = 0;
  let keer = 0;
  const K = {
    kies(sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) {
      const z = K0.kies(sleutel, zinnen, mag);
      keer++;
      if (laatste.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) {
        dubbel++;
        if (dubbel <= 5) console.error(`   dubbel bij "${sleutel}": ${kaal(z)} (keuze uit: ${zinnen.map(kaal).join(" | ")})`);
      }
      laatste.set(sleutel, vorm(z));
      return z;
    },
  };
  let zelfdeInReactie = 0;
  for (let i = 0; i < 20000; i++) {
    const v = VRAGEN[Math.floor(Math.random() * VRAGEN.length)];
    const rijen = Object.entries(foutenVan(v));
    const [a, f] = rijen[Math.floor(Math.random() * rijen.length)];
    const weerG = (x: string) => (v.soort === "verbind" ? ZIN.weerVerbonden(x.split(" → ")[0], x.split(" → ")[1]) : ZIN.weerGekozen(x));
    const kaalVan = (x: string) => (v.soort === "verbind" ? verbindKaal(v, v.sommen.findIndex(([p, q]) => `${p} + ${q}` === x.split(" → ")[0]), Number(x.split("→")[1])) : undefined);
    const r1 = kiesFoutZinnen(K, f, { poging: 1, eerder: null, zelfdeX: false, weerGekozen: weerG(a), eersteZin: "", onduidelijk: () => "" });
    if (r1[0] === r1[1]) zelfdeInReactie++;
    if (Math.random() < 0.5) continue;
    const [b, f2] = rijen[Math.floor(Math.random() * rijen.length)];
    const r2 = kiesFoutZinnen(K, f2, { poging: 2, eerder: f, zelfdeX: a === b, weerGekozen: weerG(b), eersteZin: r1[0], onduidelijk: () => "", kaal: kaalVan(b) });
    if (r2[0] === r2[1] || r2[0] === r1[0]) zelfdeInReactie++;
    if (OPDRACHT.test(kaal(r2.join(" ")))) fouten.push(`${v.id} ${a} dan ${b}: opdracht in de zinnen bij de 2e fout: "${kaal(r2.join(" "))}"`);
    if (/\bweer\b/.test(r2[0]) && a !== b && (f.noot || f.soort !== f2.soort)) fouten.push(`${v.id} ${a} dan ${b}: "weer" terwijl Bliepo dat de 1e keer niet zei: "${kaal(r2[0])}"`);
    if (v.soort === "verhaal") {
      const [ka, kb] = kleurenVan(v);
      K.kies("samenHelp", ZIN.samenHelp);
      K.kies("samenHier", ZIN.samenHier(v.a, v.namen[0], ka));
      K.kies("samenVerder", ZIN.samenVerder(v.a, ka, v.namen[1]));
      K.kies("aanmoedigTikken", ZIN.aanmoedigTikken);
      K.kies("samenHand", ZIN.samenHand(v.namen[1]));
      K.kies("samenKlaar", ZIN.samenKlaar(v.a + v.b, v.wat, v.a, v.b, ka, kb));
    } else if (v.soort === "som") {
      const [ka, kb] = kleurenVan(v);
      K.kies("samenKijk", ZIN.samenKijk);
      K.kies("somEerst", ZIN.somEerst(v.a, v.namen[0], ka));
      K.kies("somErbij", ZIN.somErbij(v.b, v.namen[1], kb));
      K.kies("somTik", ZIN.somTik);
      K.kies("somKlaar", ZIN.somKlaar(v.a, v.b, ka, kb));
    } else {
      const [p, q] = v.soort === "toonbank" ? [v.a, v.b] : v.sommen[0];
      K.kies("samenHelp", v.soort === "toonbank" ? ZIN.samenHelp : ZIN.verbindSamen);
      K.kies("stippen", ZIN.stippen(p, q));
      K.kies("samenVerder", ZIN.stippenVerder(p));
      K.kies("aanmoedigTikken", ZIN.aanmoedigTikken);
      K.kies("samenHand", ZIN.stippenHand);
      K.kies("samenKlaar", ZIN.stippenKlaar(p, q));
      if (v.soort === "toonbank") K.kies("toonbankKlaar", ZIN.toonbankKlaar);
      else K.kies("verbindAlles", ZIN.verbindAlles(v.sommen));
    }
  }
  console.log(`Nooit 2 keer hetzelfde: ${keer} keer gekozen, ${dubbel} keer 2 keer achter elkaar dezelfde zin (moet 0); ${zelfdeInReactie} keer dezelfde zin 2 keer in 1 reactie (moet 0).`);
  if (dubbel) fouten.push(`de kiezer gaf ${dubbel} keer 2 keer achter elkaar dezelfde zin`);
  if (zelfdeInReactie) fouten.push(`${zelfdeInReactie} keer stond dezelfde zin 2 keer in 1 reactie`);
}


/*
 * F16 (Sara, 18 november 2026; BOUWREGELS 15.37): wacht de les op het kind, dan staat er een vraag of een opdracht in
 * beeld. Na de 1e fout staat alleen de hint in beeld, dus ELKE hint heeft een vraagteken of een opdracht die zegt wat het
 * kind doet ("Tel …", "Begin …", "Kies …"). "Kijk …" en "Probeer het nog eens." tellen niet. Zelfde regel als de meter in
 * scripts/vraag-aanwezig-controle.mjs.
 */
const F16_WERKWOORD = "tik|kies|sleep|tel|zet|leg|maak|typ|vul|zoek|wijs|druk|klik|pak|schuif|draai|geef|kleur|verdeel|splits|bouw|meet|weeg|noem|schrijf|trek|hang|ruim|vink|verplaats|breng|plak|knip|reken|vergelijk|verbind|stapel|spring|loop|tril|schud|gooi|sorteer|begin";
const F16_BEGIN = new RegExp(`^(?:(?:nu|en|dan|maar|oké|ok|kom|toe maar|eerst|daarna|ja|nee)[,:]?\\s+)*(?:${F16_WERKWOORD})\\b`, "i");
const F16_MIDDEN = new RegExp(`(?:\\ben|\\bdan|\\bof|,|:)\\s+(?:${F16_WERKWOORD})\\b`, "i");
const heeftOpdracht = (tekst: string) => /\?/.test(tekst) || tekst.split(/(?<=[.!:;])\s+/).some((z) => F16_BEGIN.test(z.replace(/^[^A-Za-zÀ-ɏ0-9]+/, "")) || F16_MIDDEN.test(z));
for (const v of VRAGEN) for (const [a, f] of Object.entries(foutenVan(v))) for (const h of V(f).hint) if (!heeftOpdracht(kaal(h))) fouten.push(`${v.id} ${a}: F16: de hint heeft geen vraag of opdracht: "${kaal(h)}"`);

/* 6. De vaste zinnen van het verloop (ZIN): nooit "fout", geen getal 2 keer in 1 zin, en genoeg varianten per situatie. */
const V1 = VRAGEN[0] as Verhaal;
const [KA, KB] = kleurenVan(V1);
const VERLOOP: [string, string[], number][] = [
  ["Begin van de les", ZIN.begin.map((z) => `${z} ${ZIN.beginNaam}`), 2],
  ["Verbinden: de opdracht (2e keer en later)", ZIN.verbindKort, 2],
  ["Verbinden: het hulphandje", ZIN.verbindHand, 2],
  ["Verbinden: het hulphandje bij een gekozen som", ZIN.verbindHandGekozen(3, 4), 2],
  ["2e fout: we gaan samen tellen", ZIN.samenHelp, 3],
  ["2e fout bij 'welke som': we kijken samen", ZIN.samenKijk, 3],
  ["Samen tellen: het 1e groepje", ZIN.samenHier(V1.b, V1.namen[0], KA), 2],
  ["Samen tellen: de opdracht", ZIN.samenVerder(V1.b, KA, V1.namen[1]), 3],
  ["Samen tellen: het hulphandje (aanmoediging)", ZIN.aanmoedigTikken, 5],
  ["Samen tellen: het hulphandje (wat te doen)", ZIN.samenHand(V1.namen[1]), 3],
  ["Samen tellen: klaar", ZIN.samenKlaar(5, V1.wat, 1, 4, KA, KB), 3],
  ["Samen tellen: 20 s niets, Bliepo telt de rest", ZIN.samenZelf(5, V1.wat, 1, 4, KA, KB), 2],
  ["Stippen: wat je ziet", ZIN.stippen(5, 3), 2],
  ["Stippen: de opdracht", ZIN.stippenVerder(5), 3],
  ["Stippen: het hulphandje", ZIN.stippenHand, 3],
  ["Stippen: klaar", ZIN.stippenKlaar(5, 3), 3],
  ["Stippen: 20 s niets, Bliepo telt de rest", ZIN.stippenZelf(5, 3), 2],
  ["Toonbank: het goede kaartje na de stippen", ZIN.toonbankKlaar, 2],
  ["Verbinden: samen 1 som uitrekenen", ZIN.verbindSamen, 3],
  ["Verbinden: alle lijnen goed", ZIN.verbindAlles([[3, 4], [5, 3], [2, 7]]), 2],
  ["Welke som: het 1e groepje", ZIN.somEerst(3, V1.namen[0], KA), 2],
  ["Welke som: wat erbij komt", ZIN.somErbij(7, V1.namen[1], KB), 2],
  ["Welke som: de goede som aantikken", ZIN.somTik, 2],
  ["Welke som: klaar", ZIN.somKlaar(3, 7, KA, KB), 2],
  ["Hetzelfde antwoord 2 keer", ZIN.weerGekozen("4"), 3],
  ["Verbinden: dezelfde lijn 2 keer", ZIN.weerVerbonden("3 + 4", "9"), 2],
  ["Slotzin", ZIN.slot, 3],
  ["De kaart", ZIN.kaartTik, 3],
  ["Zin met de som na lof", PLUSREACTIE(1, 4, KA, KB).zinnen, 5],
  ["Zin na lof bij het verbinden", VERBINDREACTIE.zinnen, 3],
];
for (const [naam, zinnen, min] of VERLOOP) {
  if (new Set(zinnen).size < min) fouten.push(`${naam}: maar ${new Set(zinnen).size} variant(en), moet minstens ${min}`);
  for (const z of zinnen) {
    if (/\bfout/i.test(z)) fouten.push(`${naam}: het woord "fout" in "${kaal(z)}"`);
    /* Een getal niet 2 keer, behalve in een rijtje met meer sommen ("3 + 4 = 7, 5 + 3 = 8, …"). */
    const g2 = kaal(z).match(/\d+/g) ?? [];
    if (!/horen ze bij elkaar|zo hoort het: \d+ \+ \d+ = \d+,/.test(kaal(z)) && new Set(g2).size !== g2.length) fouten.push(`${naam}: een getal staat 2 keer in "${kaal(z)}"`);
  }
}
/* F16: elke zin waarna de les op het kind wacht, heeft een vraag of opdracht. */
for (const [naam, zinnen] of VERLOOP) if (/de opdracht|hulphandje \(wat|het hulphandje$|hulphandje bij|aantikken/.test(naam)) for (const z of zinnen) if (!heeftOpdracht(kaal(z))) fouten.push(`${naam}: F16: geen vraag of opdracht in "${kaal(z)}"`);
for (const z of [ZIN.verbind.join(" "), ZIN.toonbank(5, 3), ...VRAGEN.flatMap((v) => (v.soort === "verhaal" || v.soort === "som" ? [v.zinnen("wit", "wit")[2]] : []))]) if (!heeftOpdracht(kaal(z))) fouten.push(`F16: geen vraag of opdracht in "${kaal(z)}"`);
if (![...ZIN.samenZelf(5, "taartjes", 1, 4, KA, KB), ...ZIN.stippenZelf(5, 3)].every((z) => /^Kijk, /.test(z))) fouten.push('samenZelf/stippenZelf: elke variant begint met "Kijk, " (geen "Ja", geen "samen doen")');
/* De eerste zin zonder richting niet steeds dezelfde zin (keuring Meer-minder): minstens 3 versies in de les. */
const zonderRichting = new Set(VRAGEN.filter((v) => v.soort !== "verbind").flatMap((v) => Object.values(foutenVan(v)).filter((f) => f.noot).flatMap((f) => V(f).eerste.map((z) => kaal(z).replace(/\d+/g, "#")))));
if (zonderRichting.size < 3) fouten.push(`eerste zin zonder richting heeft maar ${zonderRichting.size} versie(s): ${[...zonderRichting].join(" | ")}`);
void verbindFout;

if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole en verklapcontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden, ${combinaties} combinaties van eerste zin en hint: nergens blijft maar 1 keuze over).`);
console.log(`Waarheidscontrole: ${beweringen} beweringen nagelopen (alle varianten); ${paren} paren van 1e en 2e fout; ${zonderRichting.size} versies van de eerste zin zonder richting; geen opdracht in de zinnen bij de 2e fout; nergens het woord "fout"; geen getal 2 keer in 1 zin.`);

/* Voorbeelden van elke soort rij, voor §4 van de tabel. */
const rij = (nr: number, a: string): Fout => foutenVan(VRAGEN[nr - 1])[a];
const VOORBEELDEN: [string, Fout][] = [
  ["Verhaal: 1 kant gekozen (vraag 1, 1 + 4, keuze 4)", rij(1, "4")],
  ["Verhaal: te veel (vraag 1, keuze 6)", rij(1, "6")],
  ["Verhaal: te weinig (vraag 2, 5 + 2, keuze 6)", rij(2, "6")],
  ["Verhaal: eraf in plaats van erbij (vraag 2, keuze 3)", rij(2, "3")],
  ["Toonbank: richting niet genoemd, wel dichtbij (vraag 7, 6 + 4, keuze 9)", rij(7, "9")],
  ["Verhaal: richting niet genoemd, 'dichtbij' zou verklappen (vraag 9, 4 + 4, keuze 7)", rij(9, "7")],
  ["Toonbank: te veel (vraag 6, 5 + 3, keuze 9)", rij(6, "9")],
  ["Toonbank: te weinig (vraag 6, keuze 7)", rij(6, "7")],
  ["Welke som: een minsom (vraag 5, 7 − 3 = 4)", rij(5, "7 − 3 = 4")],
  ["Welke som: 2 keer hetzelfde getal (vraag 5, 3 + 3 = 6)", rij(5, "3 + 3 = 6")],
  ["Verbinden: te veel (vraag 8, 3 + 4 → 9)", rij(8, "3 + 4 → 9")],
  ["Verbinden: te weinig (vraag 8, 2 + 7 → 8: richting niet genoemd)", rij(8, "2 + 7 → 8")],
  ["Verbinden: getal uit de som (vraag 8, 2 + 7 → 7)", rij(8, "2 + 7 → 7")],
];
for (const [naam, f] of VOORBEELDEN) if (!f) fouten.push(`voorbeeld bestaat niet: ${naam}`);

/* 3. De tabel. */
const vraagNaam = (v: Plusvraag) =>
  v.soort === "verhaal"
    ? `${v.nr}. verhaal ${v.a} + ${v.b} ${v.wat} (keuzes ${v.keuzes.join(" / ")})`
    : v.soort === "som"
      ? `${v.nr}. welke som? ${v.a} ${v.wat} en ${v.b} erbij (${v.opties.join(" / ")})`
      : v.soort === "toonbank"
        ? `${v.nr}. toonbank ${v.a} + ${v.b} (kaartjes ${v.kaarten.join(" / ")})`
        : `${v.nr}. verbinden ${v.sommen.map(([x, y]) => `${x} + ${y}`).join(", ")} ↔ ${v.antwoorden.join(", ")}`;
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} |`,
  ),
).join("\n");
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${a} (\`${f.code}\`) | ${kaal(f.kort ?? f.eerste)} ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} |`),
).join("\n");

const tekst = `# FOUTTABEL — gouden les Plussommen (squla-plus-bakkerij-1-gouden, "Plussommen in de bakkerij")

Gemaakt op 9 november 2026, bijgewerkt op 11 november 2026 (omzetting naar 15.27, KEUZES-VOOR-SARA.md Ronde 30) en op 18 november 2026 (warmere zinnen in varianten, zoals de proefles Tellen; oud naast nieuw in WIJZIGINGEN-ZINNEN-PLUSSOMMEN.md), **uit de code** met \`npx tsx scripts/fouttabel-plussommen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-plussommen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (16 vragen, getallen, keuzes, lekkers) is die van squla-plus-bakkerij-1 en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** het draaiboek Plussommen (Adding below 10), §3 D (totaal), §3 E (welke som) en §7 (denkfouten). Synthesis zegt bij een fout totaal in welke richting het goede antwoord ligt ("iets meer dan 4", "iets minder dan 8") en laat het kind meteen opnieuw kiezen. Bliepo doet dat ook ("1 en 4 samen is meer dan 4.", de zin van Synthesis in het Nederlands; besluit Sara 17 november 2026), en noemt erbij wat de keuze is (een getal van 1 groepje, het verschil). **Het verbinden (vraag 8 en 14) heeft Synthesis niet: die rijen zijn EIGEN INVULLING, NIET VAN SYNTHESIS** (15.22 punt 5), met dezelfde soort reactie als een totaal.

In de les staan de getallen in de kleur van het lekkers (of van de stippen); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de knoppen weg, de som en het lekkers blijven staan. Bliepo zegt de eerste zin (vanzelf door, pijl rechts als snelkoppeling; BOUWREGELS 15.27); daarna komen dezelfde keuzes terug met de hint (een vraag: geen pijl, zoals het draaiboek §3 D.2). Bij het verbinden is de hint de nieuwe opdrachtzin.
- **Richting en verklappen (15.17):** zou "meer dan" of "minder dan" maar 1 keuze overlaten, dan noemt Bliepo de richting niet ("Je koos 9. Je zit er dichtbij." of, als ook "dichtbij" iets zou verklappen, "Je koos 7. Ik kom op een ander getal.") en wijst hij naar de manier van tellen. Het script rekent dat voor ELKE variant van eerste zin + hint na en stopt bij een verklapper.
- **2e fout:** een korte uitleg bij de denkfout (§3; uitleg, geen opdracht), "Kom, we tellen samen." (5 varianten; alles vanzelf door). Dan telt het kind zelf verder: het tikt elk stuk lekkers van het 2e groepje aan (bij de toonbank en het verbinden: elke blauwe stip in de rij van 10) en Bliepo zegt het getal. Daarna staat de som met het antwoord bovenaan en gaat de les vanzelf door. Na ± 6 s stilte komt vanzelf het hulphandje; na 20 s zonder tik telt Bliepo de rest zelf ("Kijk, ik tel de rest. …", geen "Ja"). Bij "welke som?" wijst Bliepo de 2 groepjes aan ("Erbij is plus.") en tikt het kind de goede som (alleen die staat er nog, zoals de hulproute van het draaiboek §3 C.5).
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (laatste kolom van §3). Alleen als hij de 1e keer al zei wat er mis was.
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …" (3 varianten; bij het verbinden "Je verbond 3 + 4 weer met 9.").
- **Varianten (18 november 2026):** elke zin bij een fout bestaat in varianten (§4). De les kiest willekeurig, maar nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer \`nooit-dubbel.ts\`; "Je koos 4." en "Je koos 6." tellen als dezelfde zin). In §2 en §3 staat per fout antwoord 1 vaste variant als voorbeeld; het script loopt ALLE varianten na (verklappen, waarheid, geen opdracht bij de 2e fout, geen getal 2 keer in 1 zin, nooit het woord "fout") en speelt de kiezer 20.000 keer na.
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (elk fout antwoord valt onder een denkfout); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`deel-als-antwoord\` | koos het getal van 1 groepje (of 1 getal uit de som) | draaiboek §7 (gezien bij Synthesis) |
| \`min-in-plaats-van-plus\` | trok het kleine getal van het grote af, of koos een minsom | draaiboek §7 (gezien bij Synthesis) |
| \`een-te-veel\` / \`te-veel\` | het totaal 1 of meer te hoog | draaiboek §7 (gezien bij Synthesis: \`een-te-veel\`) |
| \`een-te-weinig\` / \`te-weinig\` | het totaal 1 of meer te laag | draaiboek §7 (gezien bij Synthesis: \`een-te-weinig\`) |
| \`getal-herhalen\` | koos een som met 2 keer hetzelfde getal (keek naar 1 groepje) | draaiboek §7 \`getal-herhalen\` (bij Synthesis bij aanvullen) |
| \`onduidelijk\` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

Let op vraag 11 (3 + 6, keuze 3): 3 is het getal van het 1e groepje én 6 − 3. Bliepo noemt het feit dat zeker is ("Dat zijn alleen de broodjes hier."), denkfout \`deel-als-antwoord\`.

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg en anders uitleggen

Bij de 2e fout zegt Bliepo een eerste zin van dát antwoord met de uitleg (middelste kolom; een variant die geen stuk en geen getal herhaalt), of, als het dezelfde denkfout is als bij de 1e fout (en hij die toen al benoemde), de "weer"-zinnen (rechts). Daarna altijd samen voordoen (zie boven).

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer |
|---|---|---|---|
${uitleg}

## 4. Alle varianten (18 november 2026)

De les kiest uit elk rijtje steeds een andere zin dan de vorige keer.

### Bij een fout (per soort; voorbeelden uit de les)

| Situatie | Eerste zin | Hint | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer |
|---|---|---|---|---|
${VOORBEELDEN.map(([naam, f]) => `| ${naam} | ${V(f).eerste.map(kaal).join(" / ")} | ${V(f).hint.map(kaal).join(" / ")} | ${V(f).uitleg.map(kaal).join(" / ")} | ${V(f).weerEerste.length ? `${V(f).weerEerste.map(kaal).join(" / ")} + ${V(f).weerUitleg.map(kaal).join(" / ")}` : "—"} |`).join("\n")}

### Het verloop

| Situatie | Varianten |
|---|---|
${VERLOOP.map(([naam, z]) => `| ${naam} | ${z.map(kaal).join(" / ")} |`).join("\n")}
`;
writeFileSync(new URL("../FOUTTABEL-squla-plus-bakkerij-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-plus-bakkerij-1-gouden.md geschreven.");
