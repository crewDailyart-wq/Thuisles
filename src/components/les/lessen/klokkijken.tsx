/**
 * Lessen Klokkijken (groep 3) — naar Synthesis "Telling Time": Hour Hand Hunt,
 * Set the Hour, Halfway Around en Quarter Past (INSPIRATIE.md, ronde 1 en 2).
 *
 * Tweede bouwronde (10 oktober 2026): ook de groep 3-delen van The Counting
 * Clock, de Assessment (instaptoets), de Mastery Check (eindtoets), Beat the
 * Alarm, The Five-Minute Secret, en uit "How Long It Takes" Five en Ten
 * Minutes Later en Start to Finish. Van die lessen staan alleen de opdrachten
 * met het label groep 3 (of "3 en 4") erin; de rest is groep 4 of hoger.
 *
 * Alles gebeurt op de wijzerklok uit `../vlakken/klok-wijzerklok.tsx`.
 *
 * Nederlandse tijdtaal, niet vertaald uit het Engels:
 * - "3 uur" (Engels: three o'clock);
 * - "half 4" = 3:30. In het Engels heet dat "half past three": daar noem je
 *   het uur dat voorbij is, wij noemen het uur dat eraan komt. Synthesis laat
 *   het kind kijken naar het getal dat de urenwijzer al voorbij is; wij laten
 *   het kind dáárna kijken waar de urenwijzer naartoe onderweg is. "Half 6"
 *   is: halverwege op weg naar 6 uur. Zie ook vragen-voor-later.
 * - "kwart over 3" (gelijk aan het Engels "quarter past three").
 *
 * Getallen in de zinnen staan niet tussen accolades: dan zouden ze de kleur
 * van een getaltegel krijgen (de 3 geel, de 7 blauw), en dat heeft hier niets
 * met de klok te maken.
 */

import type { ReactNode } from "react";
import type { Lesdraaiboek, Lesgids, Vlakgebeurtenis } from "../soort";
import { draaiduur, MINUUTKLEUR, UURKLEUR, Wijzerklok, type KlokProps } from "../vlakken/klok-wijzerklok";
import { Wekker, type WekkerProps } from "../vlakken/klok-wekker";
import { Wekkerrace, type WekkerraceProps } from "../vlakken/klok-wekkerrace";

/* ---------- tijd ---------- */

/** Minuten vanaf 12 uur: u(3, 30) = half 4. */
const u = (uur: number, minuut = 0) => uur * 60 + minuut;
const mod = (n: number, m: number) => ((n % m) + m) % m;
/** Het uur dat de klok aanwijst, van 1 tot en met 12 (half 4 → 3). */
const uurVan = (t: number) => Math.floor(mod(t, 720) / 60) || 12;
const volgend = (uur: number) => (uur % 12) + 1;
const vorig = (uur: number) => ((uur + 10) % 12) + 1;
const zelfde = (a: number, b: number) => mod(a, 720) === mod(b, 720);

/* ---------- de klok in beeld ---------- */

class Klok {
  nu: number;
  constructor(
    private l: Lesgids,
    tijd: number,
    extra: Partial<KlokProps> = {},
  ) {
    this.nu = tijd;
    l.vlak<KlokProps>(Wijzerklok, { stand: { tijd }, ...extra });
  }
  pas(p: Partial<KlokProps>) {
    this.l.pasVlakAan<KlokProps>(p);
  }
  /** Meteen naar deze tijd (elke wijzer de kortste weg). */
  zet(tijd: number) {
    this.nu = tijd;
    this.pas({ stand: { tijd } });
  }
  /** Rustig meedraaien, zoals een echte klok; klaar als de wijzers stilstaan. */
  async draai(tijd: number) {
    const verschil = tijd - this.nu;
    this.nu = tijd;
    this.pas({ stand: { tijd, draai: true } });
    await this.l.wacht(draaiduur(verschil) + 250);
  }
}

type Klokmelding = Vlakgebeurtenis & { tijd: number };

/* ---------- vragen ---------- */

type Vraag = {
  /** Wat er in beeld komt als het antwoord bekend is (goed, of na de uitleg). */
  toon?: () => void;
  goedZin?: string[];
  /** Na goed nog even op de pijl wachten, zodat het kind kan kijken. */
  verder?: boolean;
  /**
   * Bij een fout of "weet ik niet" (`null`): de uitleg. Geeft de keuzes voor
   * een tweede poging, of `null` om meteen het antwoord te geven.
   */
  fout: (keuze: string | null) => Promise<string[] | null>;
  /** Het antwoord met de reden, als het ook de tweede keer niet lukt. */
  antwoord: string[];
};

/** Een keuzevraag. Geeft terug of het meteen goed was. */
async function vraag(l: Lesgids, opties: string[], goed: string, v: Vraag): Promise<boolean> {
  const keuze = await l.kies(opties);
  if (keuze === goed) {
    v.toon?.();
    if (v.goedZin) await l.zeg(...v.goedZin);
    if (v.verder) await l.verder();
    return true;
  }
  const tweede = await v.fout(keuze);
  if (tweede) {
    const opnieuw = await l.kies(tweede);
    if (opnieuw === goed) {
      v.toon?.();
      await l.zeg(...(v.goedZin ?? ["Ja."]));
      if (v.verder) await l.verder();
      return false;
    }
  }
  v.toon?.();
  await l.zeg(...v.antwoord);
  await l.verder();
  return false;
}

/** De opties zonder de foute keuze, in dezelfde volgorde. */
const zonder = (opties: string[], weg: string | null) => opties.filter((o) => o !== weg);

/** Bij "weet ik niet" alleen "Geen zorgen", daarna meteen het antwoord. */
async function geenZorgen(l: Lesgids, keuze: string | null): Promise<null> {
  if (keuze === null) await l.zeg("Geen zorgen.");
  return null;
}

async function weetJeHet(l: Lesgids, ...zinnen: string[]) {
  await l.zeg(...zinnen, "Denk je dat je dit al weet?");
  const k = await l.kies(["Ja", "Nee"]);
  if (k === "Ja") await l.zeg("Mooi.", "We lopen het toch even samen door.");
  else await l.zeg("Geen probleem.", "We doen het samen.");
}

/** Een vraag uit het toetsdeel: kort, bij een fout meteen het antwoord. */
async function toetsvraag(l: Lesgids, opties: string[], goed: string, goedZin: string, uitleg: () => Promise<void>): Promise<boolean> {
  const keuze = await l.kies(opties);
  if (keuze === goed) {
    await l.zeg(goedZin);
    return true;
  }
  await uitleg();
  await l.verder();
  return false;
}

async function kaartEinde(l: Lesgids, fouten: number, slot: string) {
  const tik = l.kaart();
  await l.zeg(
    fouten === 0
      ? l.naam
        ? `Alles goed, ${l.naam}!`
        : "Alles goed!"
      : l.naam
        ? `Goed gewerkt, ${l.naam}!`
        : "Goed gewerkt!",
    fouten === 0 ? slot : fouten === 1 ? "Je miste er maar één." : "Je hebt goed geoefend.",
    fouten === 1 ? "Dat was vast pech." : "",
    fouten > 0 ? "Volgende keer lukt het helemaal." : "",
    "Tik op de kaart om hem af te vinken.",
  );
  await tik;
}

/* ---------- zelf de klok zetten ---------- */

/** "Ga naar de 2": alleen de urenwijzer, alleen het getal met het ringetje. */
async function gaNaar(l: Lesgids, k: Klok, n: number) {
  k.pas({ ring: n, alleenGetal: n, beweegbaar: "uur", actief: true });
  for (;;) {
    const g = await l.wachtOpVlak<Klokmelding>(["gezet", "mis"]);
    k.nu = g.tijd;
    if (g.soort === "gezet" && zelfde(g.tijd, u(n))) break;
    k.pas({ actief: false });
    await l.zeg(`Tik op de ${n}.`, "Of sleep de oranje urenwijzer erheen.");
    k.pas({ actief: true });
  }
  k.pas({ ring: null, alleenGetal: null, beweegbaar: null, actief: false });
}

/** De minutenwijzer zelf laten draaien tot `doel` (een rondje, een half rondje). */
async function draaiMinuut(l: Lesgids, k: Klok, doel: number, hint: string[]) {
  k.pas({ actief: true, beweegbaar: "minuut", grens: { van: k.nu, tot: doel } });
  for (;;) {
    const g = await l.wachtOpVlak<Klokmelding>("gezet");
    k.nu = g.tijd;
    if (g.tijd === doel) break;
    k.pas({ actief: false });
    await l.zeg(...hint);
    k.pas({ actief: true });
  }
  k.pas({ actief: false, beweegbaar: null, grens: null });
}

type Zetten = {
  modus: "uur" | "beide";
  /** Wat het handje zegt, en welk getal dan een ringetje krijgt. */
  hulp: string[];
  hulpring: number;
  /** De uitleg bij een verkeerde stand (de klok staat op `t`). */
  fout: (t: number) => Promise<void>;
  /** Na drie keer zet de klok het zelf goed en zegt dit. */
  uitleg: string[];
};

/** Het kind zet de klok en tikt op het vinkje. Geeft terug of het meteen en zonder hulp lukte. */
async function laatZien(l: Lesgids, k: Klok, doel: number, z: Zetten): Promise<boolean> {
  k.pas({ actief: true, beweegbaar: z.modus, controle: true });
  let zonderHulp = true;
  for (let fouten = 0; ; ) {
    const g = await l.wachtOpVlak<Klokmelding>(["controle", "hulp"]);
    k.nu = g.tijd;
    k.pas({ actief: false, pijl: null, pil: null });
    if (g.soort === "hulp") {
      zonderHulp = false;
      k.pas({ ring: z.hulpring });
      await l.zeg(...z.hulp);
      k.pas({ actief: true });
      continue;
    }
    if (zelfde(g.tijd, doel)) break;
    zonderHulp = false;
    fouten++;
    if (fouten >= 3) {
      k.pas({ ring: null });
      await l.zeg("Kijk, zo.");
      k.zet(doel);
      await l.wacht(700);
      await l.zeg(...z.uitleg);
      await l.verder();
      break;
    }
    await z.fout(g.tijd);
    k.pas({ actief: true });
  }
  k.pas({ actief: false, beweegbaar: null, controle: false, ring: null, pijl: null, pil: null });
  return zonderHulp;
}

/** Een heel uur zetten met alleen de urenwijzer (Set the Hour). */
function heelUur(l: Lesgids, k: Klok, uur: number): Promise<boolean> {
  return laatZien(l, k, u(uur), {
    modus: "uur",
    hulp: [`Tik op de ${uur}.`, "Of sleep de oranje urenwijzer erheen."],
    hulpring: uur,
    fout: async (t) => {
      const nu = uurVan(t);
      const vooruit = mod(uur - nu, 12) <= 6;
      k.pas({ pijl: { van: nu, naar: vooruit ? volgend(nu) : vorig(nu) } });
      await l.zeg(`Dat is de ${nu}.`, `Je zoekt de ${uur}.`, vooruit ? "Draai dus verder." : "Draai dus een stukje terug.");
    },
    uitleg: [`De urenwijzer wijst naar de ${uur}.`, `Het is ${uur} uur.`],
  });
}

/** Half of kwart over zetten met beide wijzers. `doel` is bijvoorbeeld u(8, 30) voor half 9. */
function halfOfKwart(l: Lesgids, k: Klok, doel: number): Promise<boolean> {
  const half = mod(doel, 60) === 30;
  const uur = uurVan(doel);
  const na = volgend(uur);
  return laatZien(l, k, doel, {
    modus: "beide",
    hulp: half
      ? ["Bij half staat de minutenwijzer op de 6.", `De urenwijzer is op weg naar de ${na}.`]
      : ["Bij kwart over staat de minutenwijzer op de 3.", `De urenwijzer staat net na de ${uur}.`],
    hulpring: half ? 6 : 3,
    fout: async (t) => {
      if (mod(t, 60) !== mod(doel, 60)) {
        k.pas({ pil: "minuut" });
        await l.zeg(half ? "Bij half staat de minutenwijzer op de 6." : "Bij kwart over staat de minutenwijzer op de 3.");
        return;
      }
      k.pas({ pil: "uur" });
      if (half && uurVan(t) === na) {
        await l.zeg(`Half ${na} komt vóór ${na} uur.`, `De urenwijzer is nog op weg naar de ${na}.`, `Hij hoort tussen de ${uur} en de ${na}.`);
      } else if (half) {
        await l.zeg(`De urenwijzer hoort tussen de ${uur} en de ${na}.`);
      } else {
        await l.zeg(`De urenwijzer hoort net na de ${uur}.`);
      }
    },
    uitleg: half
      ? ["De minutenwijzer staat op de 6.", `De urenwijzer staat tussen de ${uur} en de ${na}.`, `Het is half ${na}.`]
      : ["De minutenwijzer staat op de 3.", `De urenwijzer staat net na de ${uur}.`, `Het is kwart over ${uur}.`],
  });
}

/** Een stuk van de klok inkleuren met de minutenwijzer: de helft (30) of een kwart (15). */
async function kleurIn(l: Lesgids, k: Klok, minuten: 30 | 15) {
  const start = k.nu;
  const getal = minuten / 5;
  k.pas({ inkleur: true, actief: true, beweegbaar: "minuut", controle: true, grens: { van: start, tot: start + 55 } });
  for (let fouten = 0; ; ) {
    const g = await l.wachtOpVlak<Klokmelding>(["controle", "hulp"]);
    k.nu = g.tijd;
    k.pas({ actief: false });
    if (g.soort === "hulp") {
      k.pas({ ring: getal });
      await l.zeg(`Tik op de ${getal}.`, "Kijk dan naar het gekleurde stuk.");
      k.pas({ actief: true });
      continue;
    }
    const m = g.tijd - start;
    if (m === minuten) break;
    fouten++;
    if (fouten >= 3) {
      await l.zeg("Kijk, zo.");
      k.zet(start + minuten);
      await l.wacht(700);
      break;
    }
    if (m === 0) await l.zeg("Er is nog niets gekleurd.", "Tik op een getal.");
    else if (minuten === 30) {
      await l.zeg(
        m < 30 ? "Het gekleurde stuk is kleiner dan het witte stuk." : "Het gekleurde stuk is groter dan het witte stuk.",
        "Bij de helft zijn ze even groot.",
      );
    } else if (m === 30) await l.zeg("Dit is de helft.", "Een kwart is de helft van de helft.");
    else await l.zeg(m < 15 ? "Dit is minder dan een kwart." : "Dit is meer dan een kwart.", "Een kwart is de helft van de helft.");
    k.pas({ actief: true });
  }
  k.pas({ actief: false, beweegbaar: null, controle: false, grens: null, ring: null });
}

/* ---------- de kaarten aan het eind (lijntekeningen, 244 × 190) ---------- */

const KM = { x: 112, y: 95, r: 68 };

function Kaartklok({ children }: { children?: ReactNode }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={KM.x} cy={KM.y} r={KM.r} stroke="#e6e8ee" strokeWidth={3.2} />
      {children}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r1 = KM.r - 4;
        const r2 = KM.r - (i % 3 === 0 ? 14 : 9);
        return (
          <line
            key={i}
            x1={Math.round((KM.x + Math.sin(a) * r1) * 10) / 10}
            y1={Math.round((KM.y - Math.cos(a) * r1) * 10) / 10}
            x2={Math.round((KM.x + Math.sin(a) * r2) * 10) / 10}
            y2={Math.round((KM.y - Math.cos(a) * r2) * 10) / 10}
            stroke="#e6e8ee"
            strokeWidth={2.6}
          />
        );
      })}
      <circle cx={KM.x} cy={KM.y} r={4} stroke="#e6e8ee" strokeWidth={3} />
    </g>
  );
}

function Arcering({ id, pad, kleuren }: { id: string; pad: string; kleuren: string[] }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={pad} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} strokeWidth={4} strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={20 + i * 12} y1={190} x2={80 + i * 12} y2={0} stroke={kleuren[i % kleuren.length]} />
        ))}
      </g>
      <path d={pad} fill="none" stroke={kleuren[0]} strokeWidth={3.2} strokeLinejoin="round" />
    </>
  );
}

function KaartUrenwijzer() {
  return (
    <>
      <Kaartklok>
        <line x1={KM.x} y1={KM.y} x2={KM.x + 32} y2={KM.y - 18} stroke={UURKLEUR} strokeWidth={8} />
      </Kaartklok>
      <path d="M196 52c0-12 18-14 18-2 0 9-10 10-10 20" fill="none" stroke="#ef5d8a" strokeWidth={5} strokeLinecap="round" />
      <circle cx={204} cy={84} r={3.5} fill="#ef5d8a" />
    </>
  );
}

function KaartUrenZetten() {
  return (
    <>
      <Kaartklok>
        <line x1={KM.x} y1={KM.y} x2={KM.x} y2={KM.y - 52} stroke={MINUUTKLEUR} strokeWidth={5} />
        <line x1={KM.x} y1={KM.y} x2={KM.x + 18} y2={KM.y + 31} stroke={UURKLEUR} strokeWidth={8} />
      </Kaartklok>
      <path d="M30 128a88 88 0 0 1 0-66" fill="none" stroke="#3fb34f" strokeWidth={5} strokeLinecap="round" />
      <path d="M22 70l8-12 10 10" fill="none" stroke="#3fb34f" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function KaartHalf() {
  return (
    <>
      <Arcering id="klok-kaart-half" pad={`M${KM.x} ${KM.y} V${KM.y - KM.r + 6} A${KM.r - 6} ${KM.r - 6} 0 0 1 ${KM.x} ${KM.y + KM.r - 6} Z`} kleuren={["#3fb34f", "#b9e83f"]} />
      <Kaartklok />
    </>
  );
}

function KaartKwart() {
  return (
    <>
      <Arcering id="klok-kaart-kwart" pad={`M${KM.x} ${KM.y} V${KM.y - KM.r + 6} A${KM.r - 6} ${KM.r - 6} 0 0 1 ${KM.x + KM.r - 6} ${KM.y} Z`} kleuren={["#4561dc", "#8a2fb0"]} />
      <Kaartklok />
    </>
  );
}

/* =====================================================================
   Les 1 — De urenwijzer (Hour Hand Hunt)
   ===================================================================== */

/** "Waar wijst de urenwijzer naar?" */
function wijstNaar(l: Lesgids, opties: string[], n: number): Promise<boolean> {
  return vraag(l, opties, String(n), {
    goedZin: [`Ja, naar de ${n}.`],
    fout: async (x) => {
      if (x === null) {
        await l.zeg("Geen zorgen.", "Volg de korte wijzer tot het puntje.");
        return null;
      }
      await l.zeg("Volg de urenwijzer tot het puntje.", "Waar wijst hij naar?");
      return opties.filter((o) => o === String(n) || o === x);
    },
    antwoord: [`De urenwijzer wijst naar de ${n}.`],
  });
}

/** Een heel uur aflezen in het toetsdeel. */
function toetsHeelUur(l: Lesgids, k: Klok, uur: number, opties: string[]): Promise<boolean> {
  return toetsvraag(l, opties, `${uur} uur`, "Klopt.", async () => {
    k.pas({ pil: "uur" });
    await l.zeg(`De korte wijzer wijst naar de ${uur}.`, `Het is ${uur} uur.`);
    k.pas({ pil: null });
  });
}

const urenwijzer: Lesdraaiboek = {
  id: "klok-urenwijzer",
  titel: "De urenwijzer",
  synthesis: "Telling Time · Hour Hand Hunt",
  kaarttekening: KaartUrenwijzer,

  async speel(l) {
    const k = new Klok(l, u(3));
    await weetJeHet(l, "We gaan het uur lezen op een klok.", "Een klok met wijzers, zoals deze.");

    /* 1. De klok is een opgerolde getallenlijn. */
    k.pas({ vorm: "lijn", wijzers: false });
    await l.wacht(1200);
    await l.zeg("Weet je hoe dit heet?");
    const lijn = await l.kies(["een getallenlijn", "een klok"]);
    if (lijn === "een getallenlijn") await l.zeg("Ja, een getallenlijn.");
    else if (lijn === "een klok") await l.zeg("Het is nog geen klok.", "Maar je bent me een stapje voor!");
    else await l.zeg("Geen zorgen.", "Dit heet een getallenlijn.");
    await l.zeg("Tik op een van de getallen.");
    k.pas({ actief: true, tikGetal: true });
    await l.wachtOpVlak("getal");
    k.pas({ actief: false, tikGetal: false, vorm: "klok" });
    await l.wacht(1400);
    await l.zeg("Zo kun je een getallenlijn ook oprollen!", "Hoe noemen we dit?");
    const rond = await l.kies(["een klok", "een getallenlijn"]);
    if (rond === "een klok") await l.zeg("Een klok, precies.");
    else {
      await l.zeg(rond ? "Het is nog steeds een getallenlijn." : "Geen zorgen.", "Maar dan in een rondje.", "Zo'n rondje noemen we een klok.");
      await l.verder();
    }

    /* 2. Boven, onder en de draairichting. */
    k.pas({ driehoek: 12 });
    await l.zeg("Kijk naar het hoogste punt van de klok.", "Welk getal staat daar?");
    await vraag(l, ["1", "6", "12"], "12", {
      toon: () => k.pas({ ring: 12 }),
      goedZin: ["De 12, helemaal bovenaan."],
      fout: async (x) => {
        await l.zeg(x ? `De ${x} staat niet bovenaan.` : "Geen zorgen.", "Kijk waar het driehoekje wijst.");
        return x ? zonder(["1", "6", "12"], x) : null;
      },
      antwoord: ["Helemaal bovenaan staat de 12."],
    });

    k.pas({ driehoek: 6, ring: null });
    await l.zeg("Volg de klok rond, naar beneden.", "Welk getal staat helemaal onderaan?");
    await vraag(l, ["3", "6", "12"], "6", {
      toon: () => k.pas({ ring: 6 }),
      goedZin: ["Ja, de 6 staat onderaan."],
      fout: async (x) => {
        await l.zeg(x ? `De ${x} staat niet onderaan.` : "Geen zorgen.", "Kijk waar het driehoekje wijst.");
        return x ? zonder(["3", "6", "12"], x) : null;
      },
      antwoord: ["Helemaal onderaan staat de 6."],
    });
    k.pas({ driehoek: null });

    await l.zeg("Kijk naar de 6.", "Welk getal komt direct na de 6?");
    await vraag(l, ["5", "7", "8"], "7", {
      toon: () => k.pas({ pijl: { van: 6, naar: 7 } }),
      goedZin: ["Van de 6 gaan we naar de 7.", "Die kant op heet *met de klok mee*."],
      verder: true,
      fout: async (x) => {
        if (x === "5") {
          k.pas({ pijl: { van: 6, naar: 5, rood: true } });
          await l.zeg("Ik snap waarom je de 5 kiest.", "Een getallenlijn lees je vaak zo.");
          await l.verder();
        } else if (x === "8") {
          await l.zeg("De 8 komt wel na de 6.", "Maar er zit nog een getal tussen.");
          await l.verder();
        }
        k.pas({ pijl: { van: 6, naar: 7 } });
        if (x === null) {
          await l.zeg("Geen zorgen.", "Een klok draait deze kant op.");
          return null;
        }
        await l.zeg("Maar een klok draait deze kant op.", "Welk getal komt direct na de 6?");
        return zonder(["5", "7", "8"], x);
      },
      antwoord: ["Na de 6 komt de 7.", "Die kant op heet *met de klok mee*."],
    });
    k.pas({ pijl: null, ring: null });

    await l.zeg("Nu een lastige.", "Welk getal komt direct na de 12?");
    await vraag(l, ["1", "11", "13"], "1", {
      toon: () => k.pas({ pijl: { van: 12, naar: 1 } }),
      goedZin: ["De 1!", "Na de 12 begint de klok weer bij de 1."],
      verder: true,
      fout: async (x) => {
        if (x === "13") {
          await l.zeg("De 13?", "Op een getallenlijn klopt dat.");
          await l.verder();
          k.pas({ pijl: { van: 12, naar: 1 } });
          await l.zeg("Maar op de klok staat geen 13.", "Ga met de klok mee vanaf de 12.", "Welk getal komt dan?");
          return ["1", "2"];
        }
        if (x === "11") {
          k.pas({ pijl: { van: 12, naar: 11, rood: true } });
          await l.zeg("De 11 komt vóór de 12.");
          await l.verder();
          k.pas({ pijl: { van: 12, naar: 1 } });
          await l.zeg("Ga met de klok mee vanaf de 12.", "Welk getal komt dan?");
          return ["1", "11"];
        }
        await l.zeg("Geen zorgen.");
        return null;
      },
      antwoord: ["Ga met de klok mee vanaf de 12.", "Dan kom je bij de 1.", "De klok begint weer opnieuw."],
    });
    k.pas({ pijl: null });

    /* 3. De twee wijzers. */
    k.zet(u(1));
    await l.wacht(500);
    k.pas({ wijzers: true });
    await l.wacht(600);
    await l.zeg("Er staan nu twee wijzers op de klok.", "Een lange en een korte.", "Welke telt de uren, denk je?");
    const welke = await l.kies(["de lange", "de korte"]);
    if (welke === "de korte") await l.zeg("Goed gedacht!");
    else if (welke === "de lange") await l.zeg("Dat klinkt logisch.", "Een uur duurt langer dan een minuut.", "Maar op de klok is het andersom.");
    else await l.zeg("Geen zorgen.", "We kijken samen.");
    await l.verder();

    k.pas({ pil: "minuut", uurwijzer: "flets" });
    await l.zeg("De lange paarse wijzer telt de minuten.", "Hoe heet hij, denk je?");
    await vraag(l, ["de minutenwijzer", "de urenwijzer", "de secondewijzer"], "de minutenwijzer", {
      goedZin: ["De minutenwijzer, precies."],
      fout: async (x) => {
        if (x === "de secondewijzer") {
          await l.zeg("Een secondewijzer is heel dun.", "Die zit niet op deze klok.", "Deze wijzer telt de minuten.");
          return ["de minutenwijzer", "de urenwijzer"];
        }
        return geenZorgen(l, x);
      },
      antwoord: ["Hij telt de minuten.", "Dus heet hij de minutenwijzer."],
    });
    k.pas({ pil: "uur", uurwijzer: "fel", minuutwijzer: "flets" });
    await l.zeg("En de korte oranje wijzer?", "Hoe heet die?");
    await vraag(l, ["de urenwijzer", "de minutenwijzer", "de secondewijzer"], "de urenwijzer", {
      goedZin: ["De urenwijzer, ja."],
      fout: async (x) => {
        if (x === "de minutenwijzer") {
          await l.zeg("De minutenwijzer is de lange.", "Deze is kort.", "Hij telt de uren.");
          return ["de urenwijzer", "de secondewijzer"];
        }
        if (x === "de secondewijzer") {
          await l.zeg("Een secondewijzer is heel dun.", "Die zit niet op deze klok.", "Deze korte wijzer telt de uren.");
          return ["de urenwijzer", "de minutenwijzer"];
        }
        return geenZorgen(l, x);
      },
      antwoord: ["Hij telt de uren.", "Dus heet hij de urenwijzer."],
    });
    await l.zeg("Met de urenwijzer lees je het uur.", "We kijken hoe hij werkt.");
    await l.verder();

    /* 4. Waar wijst de urenwijzer? De klok draait door. */
    await k.draai(u(3));
    await l.zeg("Waar wijst de urenwijzer naar?");
    await vraag(l, ["3", "9", "12"], "3", {
      goedZin: ["Ja, naar de 3."],
      fout: async (x) => {
        if (x === "12") {
          k.pas({ pil: "minuut", minuutwijzer: "fel", uurwijzer: "flets" });
          await l.zeg("Ah, ik snap het.", "Naar de 12 wijst de minutenwijzer.");
          await l.verder();
          k.pas({ pil: "uur", uurwijzer: "fel", minuutwijzer: "flets" });
          await l.zeg("Waar wijst de urenwijzer naar?");
          return ["3", "12"];
        }
        if (x === null) {
          await l.zeg("Geen zorgen.", "Volg de korte wijzer tot het puntje.");
          return null;
        }
        await l.zeg("Volg de urenwijzer tot het puntje.", "Waar wijst hij naar?");
        return ["3", "9"];
      },
      antwoord: ["De urenwijzer wijst naar de 3."],
    });
    k.pas({ pil: "uur", uurwijzer: "fel", minuutwijzer: "flets" });

    await k.draai(u(7));
    await l.zeg("De urenwijzer draait weer.", "Waar wijst hij nu naar?");
    await wijstNaar(l, ["6", "7", "12"], 7);
    await k.draai(u(11));
    await l.zeg("Nog eentje.", "Waar wijst hij nu naar?");
    await wijstNaar(l, ["1", "11", "12"], 11);

    /* 5. Zelf de urenwijzer zetten: de minutenwijzer blijft op de 12. */
    k.pas({ pil: null, minuutwijzer: "fel" });
    await l.zeg("Nu mag jij de urenwijzer draaien.", "Kijk goed wat de minutenwijzer doet.");
    await l.verder();
    await l.zeg("Zet de urenwijzer op de 2.", "Tik op de wijzer en dan op de 2.", "Je mag hem ook slepen.");
    await gaNaar(l, k, 2);
    k.pas({ pil: "minuut" });
    await l.zeg("Kijk eens naar de minutenwijzer.", "Hij wijst recht omhoog, naar de 12.");
    await l.verder();
    k.pas({ pil: null });
    await l.zeg("Zet de urenwijzer nu op de 3.");
    await gaNaar(l, k, 3);
    await l.zeg("Nu staat hij op de 3.", "De minutenwijzer wijst nog steeds naar de 12.");
    await l.verder();
    await l.zeg("Zet hem nu op de 6.");
    await gaNaar(l, k, 6);
    await l.zeg("Elke keer stond de urenwijzer op een heel uur.", "Waar wees de minutenwijzer dan?");
    await vraag(l, ["6", "12"], "12", {
      toon: () => k.pas({ pil: "minuut" }),
      goedZin: ["Recht omhoog, naar de 12.", "Elke keer."],
      fout: async (x) => {
        if (x === "6") {
          k.pas({ pil: "minuut" });
          await l.zeg("Op de 6 staat nu de urenwijzer.", "Kijk naar de lange wijzer.", "Waar wijst die naar?");
          return ["6", "12"];
        }
        return geenZorgen(l, x);
      },
      antwoord: ["De minutenwijzer wees steeds naar de 12."],
    });
    k.pas({ pil: "minuut" });
    await l.zeg("Bij een heel uur wijst de minutenwijzer altijd naar de 12.");
    await l.verder();
    k.pas({ pil: null });

    /* 6. Hoe heet deze tijd? */
    k.zet(u(3));
    await l.wacht(600);
    await l.zeg("En waar wijst de urenwijzer nu?");
    await wijstNaar(l, ["3", "9", "12"], 3);
    await l.zeg("Hoe noemen we deze tijd, denk je?");
    await vraag(l, ["3 uur", "12 uur", "9 uur", "4 uur"], "3 uur", {
      goedZin: ["Ja, het is 3 uur."],
      fout: async (x) => {
        if (x === "4 uur") {
          await l.zeg("De 4 komt na de 3.", "De korte wijzer is nog niet bij de 4.");
          await l.verder();
        } else if (x === "9 uur") {
          await l.zeg("De 9 staat aan de andere kant.", "Kijk goed waar de korte wijzer wijst.");
          await l.verder();
        } else if (x === "12 uur") {
          k.pas({ pil: "minuut" });
          await l.zeg("Naar de 12 wijst de minutenwijzer.", "Die zegt niet welk uur het is.");
          await l.verder();
        }
        k.pas({ pil: "uur", ring: 3 });
        if (x === null) {
          await l.zeg("Geen zorgen.", "De korte wijzer zegt het uur.");
          return null;
        }
        await l.zeg("De korte wijzer zegt het uur.", "Hoe heet deze tijd?");
        return x === "12 uur" ? ["3 uur", "9 uur"] : ["3 uur", "12 uur"];
      },
      antwoord: ["De korte wijzer wijst naar de 3.", "Het is 3 uur."],
    });
    k.pas({ pil: null, ring: null });

    await k.draai(u(6));
    await l.zeg("Hoe laat is het nu?");
    await vraag(l, ["6 uur", "12 uur", "5 uur"], "6 uur", {
      goedZin: ["Klopt, het is 6 uur."],
      fout: async (x) => {
        k.pas({ pil: "uur", minuutwijzer: "flets" });
        if (x === "5 uur") await l.zeg("De 5 komt vóór de 6.", "Kijk goed waar de korte wijzer wijst.", "Hoe laat is het?");
        else if (x === "12 uur") await l.zeg("De 12 is van de minutenwijzer.", "De korte wijzer zegt het uur.", "Hoe laat is het?");
        else {
          await l.zeg("Geen zorgen.", "De korte wijzer zegt het uur.");
          return null;
        }
        return zonder(["6 uur", "12 uur", "5 uur"], x);
      },
      antwoord: ["De korte wijzer wijst naar de 6.", "Het is 6 uur."],
    });
    k.pas({ pil: null, minuutwijzer: "fel" });

    /* 7. Een stiekeme: half 8 is geen 7 uur. */
    await k.draai(u(7, 30));
    await l.zeg("Nu een lastige.", "Is dit 7 uur?");
    const strik = await l.kies(["Ja", "Nee"]);
    k.pas({ pil: "minuut" });
    if (strik === "Nee") {
      await l.zeg("Goed gezien!", "Bij een heel uur wijst de minutenwijzer naar de 12.", "Deze staat beneden, bij de 6.");
    } else {
      await l.zeg(
        strik ? "Kijk naar de minutenwijzer." : "Geen zorgen.",
        "Bij een heel uur wijst hij naar de 12.",
        "Deze staat beneden, bij de 6.",
        "Dus het is geen 7 uur.",
      );
    }
    await l.verder();
    k.pas({ pil: null });

    /* 8. Toetsdeel: drie klokken. */
    await l.zeg("Nu een paar klokken voor jou.");
    await l.verder();
    let fouten = 0;

    k.zet(u(9));
    await l.zeg("Hoe laat is het?");
    if (!(await toetsHeelUur(l, k, 9, ["9 uur", "12 uur", "10 uur"]))) fouten++;
    await l.zeg("Welke wijzer vertelde je het uur?");
    const wijzer = await toetsvraag(l, ["de korte", "de lange"], "de korte", "Ja, de korte urenwijzer.", async () => {
      k.pas({ pil: "uur" });
      await l.zeg("De korte wijzer vertelt het uur.", "Dat is de urenwijzer.");
      k.pas({ pil: null });
    });
    if (!wijzer) fouten++;

    await l.zeg("Nog twee, om zeker te weten dat je het snapt.");
    await l.verder();
    k.zet(u(4));
    await l.zeg("En deze?", "Hoe laat is het?");
    if (!(await toetsHeelUur(l, k, 4, ["4 uur", "5 uur", "12 uur"]))) fouten++;
    await l.zeg("Waar wijst de minutenwijzer naar?");
    const minuut = await toetsvraag(l, ["4", "12"], "12", "Ja, naar de 12.", async () => {
      k.pas({ pil: "minuut" });
      await l.zeg("Hij wijst recht omhoog, naar de 12.");
      k.pas({ pil: null });
    });
    if (!minuut) fouten++;

    await l.zeg("Nog één, dan is de les klaar.");
    await l.verder();
    await k.draai(u(14));
    await l.zeg("Hoe laat is het?");
    if (!(await toetsHeelUur(l, k, 2, ["2 uur", "3 uur", "12 uur"]))) fouten++;

    /* 9. Om af te sluiten: een uur later. */
    k.zet(u(12));
    await l.wacht(500);
    await l.zeg(fouten === 0 ? "Je had ze allemaal goed." : "Goed gewerkt.", "Nog één om mee af te sluiten.", "Hoe laat is het over een uur?");
    const later = await l.kies(["1 uur", "11 uur", "2 uur"]);
    if (later === "1 uur") await l.zeg("Ja! We kijken even.");
    else if (later === "11 uur") await l.zeg("11 uur is een uur *eerder*.", "We kijken even.");
    else await l.zeg(later ? "Hmm, we kijken even." : "Geen zorgen, we kijken even.");
    await k.draai(u(13));
    await l.zeg("De minutenwijzer ging één keer rond.", "De urenwijzer ging van de 12 naar de 1.", "Het is 1 uur.");
    await l.verder();
    await l.zeg("Nu kun je het uur lezen met de urenwijzer.");
    await l.verder();

    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* =====================================================================
   Les 2 — Hele uren zetten (Set the Hour)
   ===================================================================== */

const heleUrenZetten: Lesdraaiboek = {
  id: "klok-hele-uren-zetten",
  titel: "Hele uren zetten",
  synthesis: "Telling Time · Set the Hour",
  kaarttekening: KaartUrenZetten,

  async speel(l) {
    const k = new Klok(l, u(3));
    await l.zeg("Je kunt al een heel uur lezen.", "Nu ga je er zelf een zetten.", "Denk je dat je dat al kunt?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(...(al === "Ja" ? ["Mooi, dan gaan we kijken."] : ["Geen probleem.", "We doen het samen."]));
    k.pas({ pil: "uur", minuutwijzer: "flets" });
    await l.zeg("De urenwijzer vertelt ons het uur.", "Alleen die mag jij draaien.");
    await l.verder();
    k.pas({ pil: null });

    await l.zeg("Laat 5 uur zien.", "Tik op de urenwijzer en dan op de 5.", "Je mag hem ook slepen.");
    await heelUur(l, k, 5);
    await l.zeg("Ja.", "Laat nu 9 uur zien.");
    await heelUur(l, k, 9);
    await l.zeg("Goed zo.", "Laat 12 uur zien.");
    await heelUur(l, k, 12);
    await l.zeg("Klopt.", "De 12 staat helemaal bovenaan.");
    await l.verder();
    await l.zeg("Laat 7 uur zien.");
    await heelUur(l, k, 7);
    await l.zeg("Precies goed.");

    k.pas({ minuutwijzer: "fel" });
    await l.zeg("Waar wijst de minutenwijzer naar?");
    const minuut = await l.kies(["7", "12"]);
    k.pas({ pil: "minuut" });
    if (minuut === "12") await l.zeg("Ja, recht omhoog naar de 12.", "Bij elk heel uur.");
    else await l.zeg(minuut === null ? "Geen zorgen." : "Op de 7 staat de urenwijzer.", "De minutenwijzer wijst recht omhoog, naar de 12.");
    await l.verder();
    k.pas({ pil: null, minuutwijzer: "flets" });

    /* Toetsdeel. Bij een fout komt er nog een klok bij, zoals bij Synthesis. */
    await l.zeg("Nog twee, om zeker te weten dat je het snapt.", "Laat 11 uur zien.");
    let fouten = 0;
    if (!(await heelUur(l, k, 11))) fouten++;
    await l.zeg("Laat 4 uur zien.");
    if (!(await heelUur(l, k, 4))) fouten++;
    if (fouten > 0) {
      await l.zeg("Nog eentje.", "Laat 2 uur zien.");
      if (!(await heelUur(l, k, 2))) fouten++;
    }
    /* Elke fout in het toetsdeel geeft nog een klok erbij, hoogstens twee. */
    for (const extra of [9, 6].slice(0, Math.max(0, Math.min(2, fouten - 1)))) {
      await l.zeg("Probeer deze.", `Laat ${extra} uur zien.`);
      if (!(await heelUur(l, k, extra))) fouten++;
    }
    await l.zeg("Goed zo.", "Nu kun je zelf een heel uur zetten.");
    await l.verder();

    await kaartEinde(l, fouten, "Je hebt het zonder hulp gedaan.");
  },
};

/* =====================================================================
   Les 3 — Halve uren (Halfway Around)
   ===================================================================== */

/** Een halve tijd aflezen in het toetsdeel, met de Nederlandse valkuil. */
async function toetsHalf(l: Lesgids, k: Klok, t: number, opties: string[]): Promise<boolean> {
  const uur = uurVan(t);
  const na = volgend(uur);
  const goed = await vraag(l, opties, `half ${na}`, {
    goedZin: ["Klopt."],
    fout: async (x) => {
      k.pas({ pil: "uur" });
      if (x === `half ${uur}`) {
        await l.zeg(`Ik snap waarom: hij is de ${uur} voorbij.`, "Maar bij half noemen we het uur dat eraan komt.", "Hoe laat is het dan?");
      } else if (x === `${na} uur`) {
        await l.zeg(`Hij is dicht bij de ${na}.`, "Maar hij is er nog niet.", "Hoe laat is het dan?");
      } else if (x !== null) {
        await l.zeg("Kijk naar de urenwijzer.", "Waar is hij naar op weg?");
      } else {
        await l.zeg("Geen zorgen.");
        return null;
      }
      return zonder(opties, x);
    },
    antwoord: [`De urenwijzer is de ${uur} voorbij.`, `Hij is op weg naar de ${na}.`, `Dus het is half ${na}.`],
  });
  k.pas({ pil: null });
  return goed;
}

const halveUren: Lesdraaiboek = {
  id: "klok-halve-uren",
  titel: "Halve uren",
  synthesis: "Telling Time · Halfway Around",
  kaarttekening: KaartHalf,

  async speel(l) {
    const k = new Klok(l, u(4, 30));
    await weetJeHet(l, "We lezen de klok bij een half rondje.");

    /* 1. De urenwijzer staat tussen twee getallen. */
    k.pas({ pil: "uur", minuutwijzer: "flets" });
    await l.zeg("De urenwijzer staat op een vreemde plek.", "Waar wijst zijn punt naar?");
    const tussenOpties = ["de 4", "tussen de 4 en de 5", "de 5", "tussen de 5 en de 6", "de 6"];
    await vraag(l, tussenOpties, "tussen de 4 en de 5", {
      goedZin: ["Tussen de 4 en de 5.", "Helemaal niet op een getal."],
      fout: async (x) => {
        if (x === null) return geenZorgen(l, x);
        if (x === "de 4" || x === "de 5" || x === "de 6") await l.zeg(`De punt raakt ${x} niet.`, "Volg de urenwijzer tot het puntje.");
        else await l.zeg("Volg de urenwijzer tot het puntje.", "Waar komt hij uit?");
        return zonder(tussenOpties, x);
      },
      antwoord: ["Hij staat tussen de 4 en de 5.", "Helemaal niet op een getal."],
    });

    await l.zeg("Welk getal is hij al voorbij?");
    const voorbij = await l.kies(["4", "5"]);
    if (voorbij === "4") {
      k.pas({ pijl: { van: 4, naar: 5 } });
      await l.zeg("Ja, de 4.", "Een klok draait met de klok mee.", "Nu is hij op weg naar de 5.");
    } else {
      if (voorbij === "5") {
        await l.zeg("Ik snap wat je denkt.", "De punt wijst wel die kant op.");
        await l.verder();
      }
      k.pas({ pijl: { van: 4, naar: 5 } });
      await l.zeg(voorbij ? "Een klok draait deze kant op." : "Geen zorgen. Een klok draait deze kant op.", "Hij kwam eerst langs de 4.", "Nu is hij op weg naar de 5.");
    }
    await l.verder();
    k.pas({ pijl: null, pil: "minuut", minuutwijzer: "fel" });
    await l.zeg("Het is dus tussen 4 uur en 5 uur.", "De minutenwijzer weet precies waar.");
    await l.verder();
    k.pas({ pil: null });
    await l.zeg("We beginnen bij een tijd die je kent.");
    await l.verder();

    /* 2. Eén rondje van de minutenwijzer is een uur. */
    k.zet(u(3));
    await l.wacht(600);
    await l.zeg("Hoe laat is het?");
    await vraag(l, ["3 uur", "9 uur", "12 uur"], "3 uur", {
      goedZin: ["3 uur.", "Je weet het nog."],
      fout: async (x) => {
        k.pas({ pil: "uur" });
        if (x === null) return geenZorgen(l, x);
        await l.zeg("De korte wijzer zegt het uur.", "Hoe laat is het?");
        return zonder(["3 uur", "9 uur", "12 uur"], x);
      },
      antwoord: ["De urenwijzer wijst naar de 3.", "Het is 3 uur."],
    });
    k.pas({ pil: null });

    await l.zeg("Vandaag mag jij de minutenwijzer draaien.", "Draai hem één keer helemaal rond.", "Tik op de 12, of sleep hem rond.");
    await draaiMinuut(l, k, u(4), ["Draai verder.", "Helemaal rond, tot de 12."]);
    await l.zeg("De minutenwijzer ging helemaal rond.", "Wat deed de urenwijzer?");
    const deed = await l.kies(["ging één getal verder", "bleef stilstaan", "ging ook helemaal rond"]);
    let van = 3;
    if (deed === "ging één getal verder") {
      await l.zeg("Ja, van de 3 naar de 4.");
    } else {
      if (deed === "ging ook helemaal rond") await l.zeg("Hij bewoog wel.", "Maar lang niet helemaal rond.");
      else if (deed === "bleef stilstaan") await l.zeg("Hij bewoog wel een stukje.");
      else await l.zeg("Geen zorgen.", "We kijken nog een keer.");
      k.pas({ pil: "uur" });
      await l.zeg("Kijk nu goed naar de urenwijzer.", "Draai de minutenwijzer nog een keer rond.");
      await draaiMinuut(l, k, u(5), ["Draai verder.", "Helemaal rond, tot de 12."]);
      await l.zeg("De urenwijzer begon bij de 4.", "Waar staat hij nu?");
      await vraag(l, ["4", "5", "6"], "5", {
        goedZin: ["De 5.", "Hij ging één getal verder."],
        fout: (x) => geenZorgen(l, x),
        antwoord: ["Hij staat nu op de 5.", "Eén getal verder."],
      });
      k.pas({ pil: null });
      van = 4;
    }
    await l.zeg(`Eerst was het ${van} uur.`, `Nu is het ${van + 1} uur.`, "Hoeveel tijd is er voorbij?");
    await vraag(l, ["een uur", "een minuut", "een dag"], "een uur", {
      goedZin: ["Een uur.", "Eén rondje van de minutenwijzer is een heel uur."],
      verder: true,
      fout: (x) => geenZorgen(l, x),
      antwoord: ["Er is een uur voorbij.", "Eén rondje van de minutenwijzer is een heel uur."],
    });

    /* 3. Een half rondje is een half uur. */
    await l.zeg("En als de minutenwijzer maar half rond gaat?");
    await l.verder();
    k.zet(u(5));
    await l.wacht(500);
    await l.zeg("Kleur de helft van de klok in.", "Tik op een getal.", "Kijk dan naar het gekleurde stuk.");
    await kleurIn(l, k, 30);
    await l.zeg("Dat is de helft!", "De minutenwijzer ging half rond.", "Hoeveel tijd is er voorbij?");
    await vraag(l, ["een uur", "een half uur", "geen tijd"], "een half uur", {
      goedZin: ["Een half uur.", "Een half rondje is een half uur."],
      fout: async (x) => {
        if (x === "een uur") {
          await l.zeg("Een heel rondje is een uur.", "Dit is maar een half rondje.", "Hoeveel tijd is dat?");
          return ["een half uur", "een uur"];
        }
        if (x === "geen tijd") {
          await l.zeg("De minutenwijzer heeft wel bewogen.", "Er is dus tijd voorbij.", "Hoeveel tijd is dat?");
          return ["een half uur", "geen tijd"];
        }
        return geenZorgen(l, x);
      },
      antwoord: ["Een half rondje is een half uur."],
    });

    k.pas({ pil: "uur" });
    await l.zeg("Kijk nu naar de urenwijzer.", "Waar staat hij?");
    const plekHalf = ["op de 5", "tussen de 5 en de 6", "op de 6", "tussen de 6 en de 7"];
    await vraag(l, plekHalf, "tussen de 5 en de 6", {
      goedZin: ["Ja, halverwege de 5 en de 6."],
      fout: async (x) => {
        if (x === null) return geenZorgen(l, x);
        await l.zeg(
          x === "op de 5" ? "Om 5 uur stond hij op de 5." : x === "op de 6" ? "Hij is dicht bij de 6, maar staat er nog niet op." : "Zo ver is hij nog niet.",
          "Er is een half uur voorbij.",
          "Waar staat hij nu?",
        );
        return zonder(plekHalf, x);
      },
      antwoord: ["Hij staat halverwege de 5 en de 6."],
    });

    /* Het Nederlands: we noemen het uur dat eraan komt. */
    k.pas({ pijl: { van: 5, naar: 6 } });
    await l.zeg("Het is een half uur na 5 uur.", "De urenwijzer is op weg naar de 6.", "Hij is al halverwege.");
    await l.verder();
    await l.zeg("Daarom heet deze tijd *half 6*.", "Half op weg naar 6 uur.");
    await l.verder();
    await l.zeg("Bij half noemen we altijd het uur dat eraan komt.");
    await l.verder();
    k.pas({ pijl: null, pil: null });

    /* 4. Alleen de urenwijzer. */
    k.pas({ inkleur: false, minuutwijzer: "weg" });
    await l.zeg("Nu verstopt de minutenwijzer zich.", "Hoe laat is het, met alleen de urenwijzer?");
    const alleenUur = ["5 uur", "half 5", "half 6", "6 uur"];
    await vraag(l, alleenUur, "half 6", {
      toon: () => k.pas({ minuutwijzer: "fel" }),
      goedZin: ["Half 6.", "Je kunt het lezen met alleen de urenwijzer!"],
      verder: true,
      fout: async (x) => {
        k.pas({ pil: "uur" });
        if (x === "half 5") {
          await l.zeg("Ik snap waarom: hij is de 5 voorbij.", "Maar bij half noemen we het uur dat eraan komt.", "Hoe laat is het dan?");
        } else if (x === "6 uur") {
          await l.zeg("Hij is dicht bij de 6.", "Maar hij is er nog niet.", "Hoe laat is het dan?");
        } else if (x === "5 uur") {
          await l.zeg("Om 5 uur staat hij precies op de 5.", "Deze is de 5 al voorbij.", "Hoe laat is het dan?");
        } else {
          await l.zeg("Geen zorgen.", "Hij staat halverwege de 5 en de 6.");
          return null;
        }
        return zonder(alleenUur, x);
      },
      antwoord: ["Hij is halverwege op weg naar de 6.", "Het is half 6."],
    });
    k.pas({ pil: null });

    k.zet(u(4, 30));
    await l.wacht(600);
    await l.zeg("Nu snap je ook de klok van het begin.", "Het was half 5.");
    await l.verder();

    /* 5. De klok van Vos: zoek de fout. */
    k.zet(u(5, 30));
    k.pas({ tweede: { tijd: u(6, 30), naam: "De klok van Bliepo" } });
    await l.zeg("Dit is de klok van Bliepo.", "Bliepo wilde half 6 laten zien.", "Maar er ging iets mis.");
    await l.verder();
    await l.zeg("Links staat jouw klok.", "Wat deed Bliepo fout?");
    await vraag(l, ["de urenwijzer", "de minutenwijzer", "niets"], "de urenwijzer", {
      goedZin: ["Ja, de urenwijzer!"],
      fout: async (x) => {
        if (x === null) return geenZorgen(l, x);
        await l.zeg("Kijk naar elke wijzer op jouw klok.", "Zoek dan dezelfde wijzer bij Bliepo.", "Welke staat anders?");
        return ["de urenwijzer", "de minutenwijzer"];
      },
      antwoord: ["Het was de urenwijzer."],
    });
    await l.zeg("Bliepo zette hem tussen de 6 en de 7.", "Maar half 6 komt vóór 6 uur.", "Hij hoort tussen de 5 en de 6.");
    await l.verder();
    k.pas({ tweede: { tijd: u(5, 30), naam: "De klok van Bliepo" } });
    await l.zeg("Bliepo zet hem goed.");
    await l.wacht(1500);
    k.pas({ tweede: null });

    /* 6. Toetsdeel. */
    await l.zeg("Nu weet je hoe half werkt.", "Een paar klokken voor jou.");
    await l.verder();
    let fouten = 0;

    k.zet(u(7, 30));
    await l.wacht(500);
    await l.zeg("Tussen welke getallen staat de urenwijzer?");
    const tussen = await toetsvraag(l, ["6 en 7", "7 en 8", "8 en 9"], "7 en 8", "Tussen de 7 en de 8.", async () => {
      k.pas({ pil: "uur" });
      await l.zeg("Hij staat tussen de 7 en de 8.");
      k.pas({ pil: null });
    });
    if (!tussen) fouten++;
    await l.zeg("Hoe laat is het?");
    if (!(await toetsHalf(l, k, u(7, 30), ["half 7", "half 8", "half 9"]))) fouten++;

    await l.zeg("Nog wat halve uren.", "Hier is een stiekeme.");
    k.zet(u(11, 30));
    await l.wacht(500);
    await l.zeg("Hoe laat is het?");
    if (!(await toetsHalf(l, k, u(11, 30), ["half 11", "half 12", "12 uur"]))) fouten++;

    k.pas({ minuutwijzer: "weg" });
    await l.zeg("Kijk waar de urenwijzer staat.", "Waar moet de minutenwijzer dan staan?");
    const waar = await toetsvraag(l, ["6", "11", "12"], "6", "Dat klopt.", async () => {
      k.pas({ minuutwijzer: "fel", pil: "minuut" });
      await l.zeg("Bij half staat de minutenwijzer op de 6.");
      k.pas({ pil: null });
    });
    if (!waar) fouten++;
    k.pas({ minuutwijzer: "fel" });

    await l.zeg("Nog twee, om zeker te weten dat je het snapt.");
    await l.verder();
    k.zet(u(2, 30));
    await l.wacht(500);
    await l.zeg("Hoe laat is het?");
    if (!(await toetsHalf(l, k, u(2, 30), ["half 2", "half 3", "3 uur"]))) fouten++;
    k.zet(u(10, 30));
    await l.wacht(500);
    await l.zeg("En nu?");
    if (!(await toetsHalf(l, k, u(10, 30), ["half 10", "half 11", "11 uur"]))) fouten++;
    if (fouten > 0) {
      /* Een fout in het toetsdeel geeft nog een klok erbij, zoals bij Synthesis. */
      k.zet(u(9, 30));
      await l.wacht(500);
      await l.zeg("Probeer deze.", "Hoe laat is het?");
      if (!(await toetsHalf(l, k, u(9, 30), ["half 9", "half 10", "10 uur"]))) fouten++;
    }

    await l.zeg("Deze is het moeilijkst.", "Nu zet jij allebei de wijzers.");
    await l.verder();
    k.zet(u(12));
    await l.wacht(500);
    await l.zeg("Laat half 9 zien.", "Tik op een wijzer om hem te kiezen.", "Tik dan waar hij heen moet.");
    if (!(await halfOfKwart(l, k, u(8, 30)))) fouten++;
    await l.zeg("Mooi.");

    /* Vooruitkijken: eerst zeggen waar de urenwijzer komt, dan zelf draaien. */
    k.zet(u(9));
    await l.wacht(500);
    await l.zeg("Het is nu 9 uur.", "Over een half uur is het half 10.", "Waar staat de urenwijzer dan?");
    const voorspel = await l.kies(["op de 9", "tussen de 9 en de 10", "op de 10"]);
    await l.zeg("Draai de minutenwijzer half rond.", "Kijk goed naar de urenwijzer.");
    k.pas({ inkleur: true });
    await draaiMinuut(l, k, u(9, 30), ["Half rond is tot de 6.", "Tik op de 6."]);
    k.pas({ pil: "uur" });
    if (voorspel === "tussen de 9 en de 10") await l.zeg("Precies.", "Dat zei jij al!");
    else {
      fouten++;
      await l.zeg("Kijk, hij staat tussen de 9 en de 10.", "Halverwege op weg naar de 10.");
    }
    await l.verder();
    k.pas({ pil: null, inkleur: false });

    /* Om af te sluiten. */
    k.zet(u(12, 30));
    await l.wacht(500);
    await l.zeg(fouten === 0 ? "Je had ze allemaal goed." : "Goed gewerkt.", "Nog één om af te sluiten.", "Hoe laat is dit?");
    const slot = await l.kies(["half 12", "half 1", "1 uur"]);
    if (slot === "half 1") await l.zeg("Klopt.", "Na de 12 begint de klok weer bij de 1.");
    else {
      k.pas({ pil: "uur" });
      await l.zeg("Hij is de 12 voorbij.", "Hij is op weg naar de 1.", "Het is half 1.");
    }
    await l.verder();
    k.pas({ pil: null });
    await l.zeg("Nu kun je halve uren lezen en zetten.");
    await l.verder();

    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* =====================================================================
   Les 4 — Kwart over (Quarter Past)
   ===================================================================== */

/** Kwart over aflezen in het toetsdeel; vangt "kwart over 3" (de 3 van de minutenwijzer). */
async function toetsKwart(l: Lesgids, k: Klok, t: number, opties: string[]): Promise<boolean> {
  const uur = uurVan(t);
  const goed = await vraag(l, opties, `kwart over ${uur}`, {
    goedZin: ["Klopt."],
    fout: async (x) => {
      if (x === "kwart over 3") {
        k.pas({ pil: "minuut" });
        await l.zeg("Ik snap het: de minutenwijzer staat op de 3.");
        await l.verder();
        k.pas({ pil: "uur" });
        await l.zeg("Maar de 3 hoort bij de minutenwijzer.", "Kijk naar de korte wijzer.", "Hoe laat is het?");
      } else if (x?.startsWith("half")) {
        k.pas({ pil: "minuut" });
        await l.zeg("Bij half staat de minutenwijzer op de 6.", "Deze staat op de 3.", "Hoe laat is het?");
      } else if (x !== null) {
        k.pas({ pil: "uur" });
        await l.zeg("Kijk naar de korte wijzer.", "Welk uur is hij net voorbij?");
      } else {
        await l.zeg("Geen zorgen.");
        return null;
      }
      return zonder(opties, x);
    },
    antwoord: ["De 3 hoort bij de minutenwijzer.", `De urenwijzer staat net na de ${uur}.`, `Het is kwart over ${uur}.`],
  });
  k.pas({ pil: null });
  return goed;
}

const kwartOver: Lesdraaiboek = {
  id: "klok-kwart-over",
  titel: "Kwart over",
  synthesis: "Telling Time · Quarter Past",
  kaarttekening: KaartKwart,

  async speel(l) {
    const k = new Klok(l, u(7, 15));
    await weetJeHet(l, "We lezen de klok bij een kwart rondje.", "Dat heet *kwart over*.");

    /* 1. Opwarmer: een tijd die je al kent. */
    k.zet(u(4, 30));
    await l.wacht(600);
    await l.zeg("Hier is een tijd die je al kent.", "Hoe laat is het?");
    await vraag(l, ["4 uur", "half 4", "half 5"], "half 5", {
      goedZin: ["Half 5.", "Je weet het nog."],
      fout: async (x) => {
        k.pas({ pil: "uur" });
        if (x === "half 4") await l.zeg("Hij is de 4 voorbij.", "Bij half noemen we het uur dat eraan komt.", "Hoe laat is het dan?");
        else if (x === "4 uur") await l.zeg("Bij 4 uur staat de minutenwijzer op de 12.", "Deze staat op de 6.", "Hoe laat is het dan?");
        else return geenZorgen(l, x);
        return zonder(["4 uur", "half 4", "half 5"], x);
      },
      antwoord: ["De urenwijzer is op weg naar de 5.", "Het is half 5."],
    });
    k.pas({ pil: null });

    /* 2. Een kwart inkleuren. */
    await l.zeg("We zetten de klok terug op 4 uur.");
    k.zet(u(4));
    await l.wacht(700);
    await l.zeg("Kleur een kwart van de klok in.", "Tik op een getal.", "Kijk dan naar het gekleurde stuk.");
    await kleurIn(l, k, 15);
    await l.zeg("Hier is een kwart.", "Dat is de helft van de helft.", "Met 4 kwarten is de klok vol.");
    await l.verder();

    await l.zeg("De minutenwijzer ging een kwart rond.", "Hoeveel tijd is er voorbij?");
    await vraag(l, ["een kwartier", "een half uur", "een heel uur"], "een kwartier", {
      goedZin: ["Een kwartier.", "Een heel rondje duurt een uur."],
      fout: async (x) => {
        if (x === "een half uur") {
          await l.zeg("Ik snap wat je denkt.", "Een half uur is een half rondje.");
          await l.verder();
          await l.zeg("Dit was maar een kwart rondje.", "Hoeveel tijd is dat?");
          return ["een kwartier", "een heel uur"];
        }
        if (x === "een heel uur") {
          await l.zeg("Een heel uur is een heel rondje.", "Dit was maar een kwart rondje.", "Hoeveel tijd is dat?");
          return ["een kwartier", "een half uur"];
        }
        return geenZorgen(l, x);
      },
      antwoord: ["Een kwart rondje is een kwartier."],
    });
    await l.zeg("Het is dus een kwartier na 4 uur.", "Dat noemen we *kwart over 4*.");
    await l.verder();

    /* 3. De minutenwijzer op de 3, de urenwijzer net na het uur. */
    await l.zeg("Bij kwart over staat de minutenwijzer altijd op dezelfde plek.", "Naar welk getal wijst hij?");
    await vraag(l, ["3", "6", "12"], "3", {
      toon: () => k.pas({ pil: "minuut" }),
      goedZin: ["De 3.", "Bij kwart over staat hij altijd op de 3."],
      fout: async (x) => {
        k.pas({ pil: "minuut" });
        if (x === "6") await l.zeg("Op de 6 staat hij bij half.", "Kijk naar de lange wijzer.", "Waar wijst hij nu naar?");
        else if (x === "12") await l.zeg("Op de 12 staat hij bij een heel uur.", "Kijk naar de lange wijzer.", "Waar wijst hij nu naar?");
        else return geenZorgen(l, x);
        return zonder(["3", "6", "12"], x);
      },
      antwoord: ["De minutenwijzer wijst naar de 3."],
    });
    k.pas({ pil: "uur" });
    await l.zeg("Kijk nu naar de urenwijzer.", "Waar staat hij?");
    const plekken = ["op de 4", "een beetje na de 4", "halverwege de 4 en de 5"];
    await vraag(l, plekken, "een beetje na de 4", {
      goedZin: ["Ja, een klein stukje na de 4."],
      fout: async (x) => {
        if (x === "op de 4") {
          await l.zeg("Ik snap waarom.", "Om 4 uur stond hij precies op de 4.");
          await l.verder();
          await l.zeg("Maar er is een kwartier voorbij.", "Dus is hij een stukje verder.", "Waar staat hij nu?");
        } else if (x === "halverwege de 4 en de 5") {
          await l.zeg("Halverwege staat hij bij half 5.", "Er is pas een kwartier voorbij.", "Waar staat hij nu?");
        } else return geenZorgen(l, x);
        return zonder(plekken, x);
      },
      antwoord: ["Hij staat een klein stukje na de 4."],
    });
    k.pas({ pil: null, inkleur: false });

    /* 4. Toetsdeel. */
    await l.zeg("Nu een paar klokken voor jou.");
    await l.verder();
    let fouten = 0;

    k.zet(u(9, 15));
    await l.wacht(500);
    await l.zeg("Hoe laat is dit?");
    if (!(await toetsKwart(l, k, u(9, 15), ["kwart over 3", "kwart over 9", "half 10"]))) fouten++;

    k.zet(u(5, 15));
    k.pas({ minuutwijzer: "weg" });
    await l.wacht(500);
    await l.zeg("De urenwijzer staat net na de 5.", "Waar moet de minutenwijzer dan staan?");
    const waar = await vraag(l, ["3", "6", "12"], "3", {
      toon: () => k.pas({ minuutwijzer: "fel", pil: "minuut" }),
      goedZin: ["Dat klopt."],
      fout: async (x) => {
        if (x === "6") {
          await l.zeg("Veel kinderen kiezen die.", "Op de 6 stopt de minutenwijzer bij half.");
          await l.verder();
          await l.zeg("Maar deze urenwijzer heeft nog maar net bewogen.", "Er is pas een kwartier voorbij.", "Waar staat de minutenwijzer dan?");
          return ["3", "12"];
        }
        if (x === "12") {
          await l.zeg("Op de 12 staat hij bij een heel uur.", "Maar de urenwijzer is de 5 al voorbij.", "Waar staat de minutenwijzer dan?");
          return ["3", "6"];
        }
        await l.zeg("Geen zorgen.");
        return null;
      },
      antwoord: ["Er is pas een kwartier voorbij.", "Bij kwart over staat de minutenwijzer op de 3."],
    });
    if (!waar) fouten++;
    k.pas({ minuutwijzer: "fel", pil: null });

    await l.zeg("Nog twee, om zeker te weten dat je het snapt.");
    await l.verder();
    k.zet(u(7, 15));
    await l.wacht(500);
    await l.zeg("Hoe laat is het nu?");
    if (!(await toetsKwart(l, k, u(7, 15), ["kwart over 6", "kwart over 7", "kwart over 3"]))) fouten++;
    k.zet(u(2, 15));
    await l.wacht(500);
    await l.zeg("En deze?");
    if (!(await toetsKwart(l, k, u(2, 15), ["kwart over 2", "kwart over 3", "half 3"]))) fouten++;

    await l.zeg("Deze is het moeilijkst.", "Nu zet jij allebei de wijzers.");
    await l.verder();
    k.zet(u(12));
    await l.wacht(500);
    await l.zeg("Laat kwart over 8 zien.", "Tik op een wijzer om hem te kiezen.", "Tik dan waar hij heen moet.");
    if (!(await halfOfKwart(l, k, u(8, 15)))) fouten++;
    await l.zeg("Mooi.");

    /* Vooruitkijken. */
    k.zet(u(11));
    await l.wacht(500);
    await l.zeg("We kijken een beetje vooruit.", "Het is nu 11 uur.", "Waar staat de urenwijzer om kwart over 11?");
    const voorspel = await l.kies(["op de 11", "een beetje na de 11", "halverwege de 11 en de 12"]);
    await l.zeg("Zet de minutenwijzer op de 3.", "Kijk goed naar de urenwijzer.");
    k.pas({ inkleur: true });
    await draaiMinuut(l, k, u(11, 15), ["Tik op de 3.", "Of sleep de paarse wijzer erheen."]);
    k.pas({ pil: "uur" });
    if (voorspel === "een beetje na de 11") await l.zeg("Precies.", "Dat zei jij al!");
    else {
      fouten++;
      await l.zeg("Kijk, hij is een klein stukje verder.", "Net na de 11.");
    }
    await l.verder();
    k.pas({ pil: null, inkleur: false });

    /* Om af te sluiten. */
    k.zet(u(12, 15));
    await l.wacht(500);
    await l.zeg(fouten === 0 ? "Je had ze allemaal goed." : "Goed gewerkt.", "Nog één om af te sluiten.", "Hoe laat is het op deze klok?");
    const slot = await l.kies(["kwart over 1", "kwart over 3", "kwart over 12"]);
    k.pas({ pil: "uur" });
    if (slot === "kwart over 12") await l.zeg("Klopt.", "Net een stukje na de 12.");
    else await l.zeg("De urenwijzer staat net na de 12.", "Het is kwart over 12.");
    await l.verder();
    k.pas({ pil: null });
    await l.zeg("Nu kun je kwart over lezen en zetten.");
    await l.verder();

    await kaartEinde(l, fouten, "Heel knap gedaan.");
  },
};

/* =====================================================================
   Tweede bouwronde — hulpjes voor de nieuwe lessen
   ===================================================================== */

/** De digitale tijd: "2:35". */
const digitaal = (t: number) => `${uurVan(t)}:${String(mod(t, 60)).padStart(2, "0")}`;

/** Hoe je de tijd in het Nederlands zegt: "3 uur", "half 4", "10 over half 8". */
function tijdnaam(t: number): string {
  const m = mod(t, 60);
  const h = uurVan(t);
  const n = volgend(h);
  const namen: Record<number, string> = {
    0: `${h} uur`,
    5: `5 over ${h}`,
    10: `10 over ${h}`,
    15: `kwart over ${h}`,
    20: `10 voor half ${n}`,
    25: `5 voor half ${n}`,
    30: `half ${n}`,
    35: `5 over half ${n}`,
    40: `10 over half ${n}`,
    45: `kwart voor ${n}`,
    50: `10 voor ${n}`,
    55: `5 voor ${n}`,
  };
  return namen[m] ?? digitaal(t);
}

/**
 * De minutenwijzer verder zetten tot `doel`. Hij kan niet verder dan het doel
 * (zoals bij Synthesis). Met `tussenstap` mag het kind in stapjes gaan: een
 * stap die nog niet ver genoeg is krijgt de eerste keer geen reactie.
 */
async function minuutVerder(
  l: Lesgids,
  k: Klok,
  doel: number,
  o: { hint: string[]; ring?: number | null; alleenGetal?: boolean; tussenstap?: boolean },
) {
  const start = k.nu;
  k.pas({
    actief: true,
    beweegbaar: "minuut",
    grens: { van: start, tot: doel },
    klem: true,
    pil: "minuut",
    ring: o.ring ?? null,
    alleenGetal: o.alleenGetal ? (o.ring ?? null) : null,
  });
  let stil = !!o.tussenstap;
  for (;;) {
    const g = await l.wachtOpVlak<Klokmelding>(["gezet", "mis"]);
    k.nu = g.tijd;
    if (g.soort === "gezet" && g.tijd === doel) break;
    if (g.soort === "gezet" && stil && g.tijd > start) {
      stil = false;
      continue;
    }
    k.pas({ actief: false });
    await l.zeg(...o.hint);
    k.pas({ actief: true });
  }
  k.pas({ actief: false, beweegbaar: null, grens: null, klem: false, pil: null, ring: null, alleenGetal: null });
}

/** Zo beweeg je de wijzers (uitleg uit de toets van Synthesis). */
async function uitlegWijzers(l: Lesgids) {
  await l.zeg("Er zijn twee manieren om de wijzers te bewegen.", "Tik op een wijzer om hem te kiezen.", "Tik dan waar hij heen moet.");
  await l.verder();
  await l.zeg("Je mag een wijzer ook slepen.", "Sleep je de minutenwijzer, dan draait de urenwijzer mee.");
  await l.verder();
}

/** Een toetsvraag: de klok aflezen. Geen uitleg; geeft terug of het goed was en wat er gekozen is. */
async function leesToets(l: Lesgids, k: Klok, t: number, vraagzin: string[], opties: string[], goedZin: string): Promise<{ goed: boolean; keuze: string | null }> {
  k.zet(t);
  await l.wacht(500);
  await l.zeg(...vraagzin);
  const keuze = await l.kies(opties);
  const goed = keuze === tijdnaam(t);
  if (goed) await l.zeg(goedZin);
  return { goed, keuze };
}

/** Een toetsvraag: de klok zelf zetten met beide wijzers, en dan het vinkje. */
async function zetToets(l: Lesgids, k: Klok, doel: number, opdracht: string[], hulp: string[], goedZin: string): Promise<{ goed: boolean; tijd: number }> {
  await l.zeg(...opdracht);
  k.pas({ actief: true, beweegbaar: "beide", controle: true });
  for (;;) {
    const g = await l.wachtOpVlak<Klokmelding>(["controle", "hulp"]);
    k.nu = g.tijd;
    if (g.soort === "hulp") {
      k.pas({ actief: false });
      await l.zeg(...hulp);
      k.pas({ actief: true });
      continue;
    }
    k.pas({ actief: false, beweegbaar: null, controle: false });
    const goed = zelfde(g.tijd, doel);
    if (goed) await l.zeg(goedZin);
    return { goed, tijd: g.tijd };
  }
}

const HULP_HEEL = ["Tik op de urenwijzer.", "Tik dan op een getal.", "Of sleep de oranje urenwijzer erheen."];
const HULP_HALF = ["Tik op een wijzer om hem te kiezen.", "Tik dan waar hij heen moet.", "Bij half staat de minutenwijzer op de 6."];

/* ---------- kaarten voor de nieuwe lessen ---------- */

function Kaarttekst({ x, y, kleur, maat, children }: { x: number; y: number; kleur: string; maat: number; children: ReactNode }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={maat} fontWeight={800} fill={kleur} style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
      {children}
    </text>
  );
}

function KaartWekker() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x={42} y={56} width={160} height={92} rx={22} stroke="#e6e8ee" strokeWidth={3.2} />
      <rect x={56} y={68} width={132} height={68} rx={12} stroke="#e6e8ee" strokeWidth={2.4} />
      <path d="M70 160h22M152 160h22" stroke="#e6e8ee" strokeWidth={5} />
      <Kaarttekst x={98} y={103} kleur="#4b8af5" maat={40}>
        9
      </Kaarttekst>
      <circle cx={122} cy={93} r={3.5} fill="#e6e8ee" />
      <circle cx={122} cy={113} r={3.5} fill="#e6e8ee" />
      <Kaarttekst x={156} y={103} kleur="#ef5d8a" maat={40}>
        00
      </Kaarttekst>
    </g>
  );
}

function KaartToets() {
  return (
    <>
      <Kaartklok>
        <line x1={KM.x} y1={KM.y} x2={KM.x} y2={KM.y - 50} stroke={MINUUTKLEUR} strokeWidth={5} />
        <line x1={KM.x} y1={KM.y} x2={KM.x + 30} y2={KM.y - 6} stroke={UURKLEUR} strokeWidth={8} />
      </Kaartklok>
      <path d="M170 128l14 14 28-34" fill="none" stroke="#3fb34f" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function KaartRace() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M70 48a26 26 0 0 1 38-8M174 48a26 26 0 0 0-38-8" stroke="#f4bb3a" strokeWidth={6} />
      <circle cx={122} cy={100} r={58} stroke="#e6e8ee" strokeWidth={3.2} />
      <circle cx={122} cy={100} r={44} stroke="#b98cf5" strokeWidth={5} strokeDasharray="200 90" transform="rotate(-90 122 100)" />
      <path d="M86 152l-10 14M158 152l10 14" stroke="#e6e8ee" strokeWidth={5} />
      <Kaarttekst x={122} y={102} kleur="#cfe2ff" maat={30}>
        1:00
      </Kaarttekst>
    </g>
  );
}

function KaartVijven() {
  return (
    <>
      <Kaartklok>
        <line x1={KM.x} y1={KM.y} x2={KM.x - 26} y2={KM.y + 44} stroke={MINUUTKLEUR} strokeWidth={5} />
      </Kaartklok>
      <Kaarttekst x={200} y={60} kleur="#ef5d8a" maat={44}>
        5
      </Kaarttekst>
    </>
  );
}

function KaartLater() {
  return (
    <>
      <Arcering id="klok-kaart-later" pad={`M${KM.x} ${KM.y} V${KM.y - KM.r + 6} A${KM.r - 6} ${KM.r - 6} 0 0 1 ${KM.x + 30} ${KM.y - KM.r + 13} Z`} kleuren={["#4561dc", "#8a2fb0"]} />
      <Kaartklok />
      <Kaarttekst x={200} y={60} kleur="#ef5d8a" maat={36}>
        +5
      </Kaarttekst>
    </>
  );
}

function KaartSamen() {
  return (
    <>
      <Arcering
        id="klok-kaart-samen"
        pad={`M${KM.x} ${KM.y} V${KM.y - KM.r + 6} A${KM.r - 6} ${KM.r - 6} 0 1 1 ${KM.x - KM.r + 6} ${KM.y} Z`}
        kleuren={["#8a2fb0", "#4561dc"]}
      />
      <Kaartklok />
      <Kaarttekst x={204} y={60} kleur="#ef5d8a" maat={34}>
        45
      </Kaarttekst>
    </>
  );
}

/* =====================================================================
   Instaptoets: klokkijken (Assessment, groep 3-deel)
   ===================================================================== */

const instaptoets: Lesdraaiboek = {
  id: "klok-instaptoets",
  titel: "Instaptoets: klokkijken",
  synthesis: "Telling Time · Assessment (groep 3-deel)",
  kaarttekening: KaartToets,

  async speel(l) {
    const k = new Klok(l, u(3));
    await l.zeg("In deze lessen leer je klokkijken.", "Op een klok met wijzers.", "Kun je dat al?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Goed." : "Geen probleem.", "We kijken eerst wat je al weet.", "Doe maar wat je kunt.");
    await l.verder();
    let fouten = 0;

    /* Een heel uur aflezen. Bij een fout nog een van dezelfde soort. */
    let r = await leesToets(l, k, u(1), ["Hoe laat is het?"], ["half 2", "12 uur", "2 uur", "1 uur"], "Klopt.");
    if (!r.goed) {
      fouten++;
      await l.zeg("Oké.", "Nog eentje zo.");
      if (!(await leesToets(l, k, u(10), ["Hoe laat is het?"], ["half 11", "12 uur", "11 uur", "10 uur"], "Klopt.")).goed) fouten++;
    }

    /* Een heel uur zetten. */
    await uitlegWijzers(l);
    let z = await zetToets(l, k, u(2), ["Laat 2 uur zien."], HULP_HEEL, "Zo is het goed.");
    if (!z.goed) {
      fouten++;
      await l.zeg("Oké.", "Nog eentje zo.");
      if (!(await zetToets(l, k, u(7), ["Laat 7 uur zien."], HULP_HEEL, "Zo is het goed.")).goed) fouten++;
    }

    /* Half aflezen. De afleiders zijn de Nederlandse valkuilen. */
    r = await leesToets(l, k, u(1, 30), ["Hoe laat is het nu?"], ["half 1", "half 2", "1 uur", "6 uur"], "Mooi.");
    if (!r.goed) {
      fouten++;
      await l.zeg("Oké.", "Nog eentje zo.");
      if (!(await leesToets(l, k, u(7, 30), ["Hoe laat is het nu?"], ["half 7", "half 8", "7 uur", "6 uur"], "Mooi.")).goed) fouten++;
    }

    /* Half zetten. */
    z = await zetToets(l, k, u(4, 30), ["Laat half 5 zien."], HULP_HALF, "Klopt.");
    if (!z.goed) {
      fouten++;
      await l.zeg("Oké.", "Nog eentje zo.");
      if (!(await zetToets(l, k, u(10, 30), ["Laat half 11 zien."], HULP_HALF, "Klopt.")).goed) fouten++;
    }

    const tik = l.kaart();
    if (fouten === 0) {
      await l.zeg(l.naam ? `Mooi gedaan, ${l.naam}!` : "Mooi gedaan!", "Je kunt al hele en halve uren lezen.", "Tik op de kaart om hem af te vinken.");
    } else {
      await l.zeg(l.naam ? `Goed gewerkt, ${l.naam}!` : "Goed gewerkt!", "In de lessen oefenen we samen verder.", "Tik op de kaart om hem af te vinken.");
    }
    await tik;
  },
};

/* =====================================================================
   De digitale klok (The Counting Clock, groep 3-deel)
   ===================================================================== */

/** Wachten tot de wekker op `doel` staat (het kind drukt op de uurknop). */
async function wachtOpWekker(l: Lesgids, doel: number) {
  for (;;) {
    const g = await l.wachtOpVlak<Klokmelding>("uur");
    if (g.tijd >= doel) return;
  }
}

/** "Hoe laat is het?" bij een heel uur op de wekker. Bij een fout geen tweede poging, maar het antwoord met de reden. */
async function wekkerLezen(l: Lesgids, uur: number, opties: string[]): Promise<boolean> {
  const keuze = await l.kies(opties);
  if (keuze === `${uur} uur`) {
    await l.zeg("Ja.", `Het is ${uur} uur.`);
    return true;
  }
  l.pasVlakAan<WekkerProps>({ rand: "uur" });
  if (keuze) await l.zeg("Kijk goed naar de urenkant.", `Daar staat geen ${keuze.replace(" uur", "")}.`);
  else await l.zeg("Geen zorgen.");
  await l.zeg(`Het is ${uur} uur.`, `De urenkant zegt ${uur}.`, "De minutenkant zegt: nul minuten erbij.");
  await l.verder();
  l.pasVlakAan<WekkerProps>({ rand: null });
  return false;
}

const digitaleKlok: Lesdraaiboek = {
  id: "klok-digitale-klok",
  titel: "De digitale klok",
  synthesis: "Telling Time · The Counting Clock (groep 3-deel)",
  kaarttekening: KaartWekker,

  async speel(l) {
    const w = (p: Partial<WekkerProps>) => l.pasVlakAan<WekkerProps>(p);
    l.vlak<WekkerProps>(Wekker, { stand: { tijd: u(7) }, kiezen: true, actief: false });
    await l.zeg("Tik op de klok die je wilt.", "Het maakt niet uit welke.");
    w({ actief: true });
    const { keuze } = await l.wachtOpVlak<Vlakgebeurtenis & { keuze: number }>("gekozen");
    w({ kiezen: false, keuze, actief: false });
    await l.wacht(500);
    await weetJeHet(l, "We gaan leren hoe je een klok als deze leest.", "Zo'n klok zit in een magnetron of in een auto.");

    /* 1. Wat duurt een minuut? */
    await l.zeg("Eén minuut is een korte tijd.", "Ongeveer zo lang als een liedje zingen.");
    await l.verder();
    await l.zeg("Welke duurt ongeveer een minuut?");
    await vraag(l, ["één keer knipperen", "een liedje zingen", "een hele nacht slapen"], "een liedje zingen", {
      goedZin: ["Klopt.", "Dat duurt ongeveer een minuut."],
      fout: async (x) => {
        if (x === "één keer knipperen") await l.zeg("Knipperen gaat veel sneller dan een minuut.");
        else if (x === "een hele nacht slapen") await l.zeg("Slapen duurt veel langer dan een minuut.");
        else await l.zeg("Geen zorgen.");
        return null;
      },
      antwoord: ["Een liedje zingen duurt ongeveer een minuut."],
    });

    /* 2. De urenkant en de minutenkant. */
    w({ rand: "uur" });
    await l.zeg("Kijk naar de klok.", "Links staat het uur, in oranje.", "Dat is de urenkant.");
    await l.verder();
    w({ rand: "minuut" });
    await l.zeg("Rechts staan de minuten, in paars.", "Dat is de minutenkant.");
    await l.verder();

    /* 3. De oranje knop: elke druk een heel uur. */
    w({ rand: null, uurknop: true, tot: u(8) });
    await l.zeg("Hier is een ronde oranje knop.", "Elke druk telt er een heel uur bij.", "Druk één keer.");
    w({ actief: true });
    await wachtOpWekker(l, u(8));
    w({ actief: false, rand: "minuut" });
    await l.zeg("Eén druk, en er ging een heel uur voorbij.", "De minutenkant zegt nog steeds 00.", "Dus is het weer een heel uur.");
    await l.verder();
    await l.zeg("De minutenkant zegt 00.", "Nul minuten: precies het uur.", "Dus hoe laat is het?");
    w({ rand: null });
    let fouten = 0;
    if (!(await wekkerLezen(l, 8, ["7 uur", "8 uur", "9 uur"]))) fouten++;

    w({ tot: u(9) });
    await l.zeg("Druk nog een keer.");
    w({ actief: true });
    await wachtOpWekker(l, u(9));
    w({ actief: false });
    await l.zeg("Hoe laat is het nu?");
    if (!(await wekkerLezen(l, 9, ["8 uur", "9 uur", "10 uur"]))) fouten++;

    w({ tot: u(12) });
    await l.zeg("Houd de knop nu ingedrukt.", "Hij gaat steeds sneller.", "Hij stopt vanzelf bij 12 uur.");
    w({ actief: true });
    await wachtOpWekker(l, u(12));
    w({ actief: false });
    await l.wacht(400);
    await l.zeg("Hoe laat is het?");
    if (!(await wekkerLezen(l, 12, ["11 uur", "12 uur", "1 uur"]))) fouten++;

    w({ uurknop: false, stand: { tijd: u(3) } });
    await l.wacht(500);
    await l.zeg("Probeer deze.", "Hoe laat is het op deze klok?");
    if (!(await wekkerLezen(l, 3, ["4 uur", "2 uur", "3 uur"]))) fouten++;

    await l.zeg("Klokken als deze heten *digitale klokken*.", "En jij kunt nu elk heel uur lezen.");
    await l.verder();
    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* =====================================================================
   Tellen in vijven (The Five-Minute Secret, groep 3-deel)
   ===================================================================== */

/** Welk minuutgetal komt er buiten de klok bij, als de minutenwijzer op getal `n` staat. */
const totGetal = (n: number) => Array.from({ length: n }, (_, i) => (i + 1) * 5);

const tellenInVijven: Lesdraaiboek = {
  id: "klok-tellen-in-vijven",
  titel: "Tellen in vijven",
  synthesis: "Telling Time · The Five-Minute Secret (groep 3-deel)",
  kaarttekening: KaartVijven,

  async speel(l) {
    const k = new Klok(l, u(7, 35));
    await weetJeHet(l, "We gaan tellen in vijven, op de klok.");

    /* 1. Elk streepje is één minuut. */
    k.zet(u(7));
    await l.wacht(600);
    k.pas({ uurwijzer: "flets" });
    await l.zeg("Kijk naar de kleine streepjes rond de klok.", "Elk streepje is één minuut.");
    await l.verder();

    /* 2. Naar de 1: dat is 5 minuten. */
    await l.zeg("Zet de minutenwijzer op de 1.");
    await minuutVerder(l, k, u(7, 5), { hint: ["Tik op de 1.", "Of sleep de minutenwijzer erheen."], ring: 1, alleenGetal: true });
    await l.zeg("Mooi.", "Hoeveel minuten is de minutenwijzer net verschoven?");
    const x = await l.getal();
    if (x === 5) {
      k.pas({ streepjes: { van: 1, tot: 4 } });
      await l.zeg("Ja, 5 minuten.", "5 streepjes, dus 5 minuten.");
    } else {
      if (x === 1) {
        await l.zeg("Ik snap wat je denkt.", "Je zette hem op de 1, dat klopt.");
        await l.verder();
      } else if (x !== null) {
        await l.zeg(`Hmm, het is niet ${x}.`);
      }
      k.pas({ streepjes: { van: 1, tot: 4 } });
      await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "Maar elk paars streepje is één minuut.", "Tel de streepjes van de 12 tot de 1.", "Hoeveel minuten zijn het?");
      const y = await l.getal();
      if (y === 5) await l.zeg("Ja, goed geteld.", "5 streepjes, dus 5 minuten.");
      else await l.zeg("Het zijn 5 streepjes.", "Dus 5 minuten.");
    }
    await l.zeg("Staat de minutenwijzer op de 1?", "Dan betekent de 1 dus 5 minuten.");
    k.pas({ labels: totGetal(1) });
    await l.verder();
    k.pas({ streepjes: null });

    /* 3. Naar de 2: 10 minuten. */
    await l.zeg("Zet de minutenwijzer op de 2.");
    await minuutVerder(l, k, u(7, 10), { hint: ["Tik op de 2.", "Of sleep de minutenwijzer erheen."], ring: 2, alleenGetal: true });
    await l.zeg("Hoeveel minuten is hij vanaf de 12 verschoven?");
    await vraag(l, ["2", "6", "10"], "10", {
      toon: () => k.pas({ labels: totGetal(2), streepjes: null }),
      goedZin: ["Ja, 10 minuten."],
      fout: async (keuze) => {
        k.pas({ streepjes: { van: 1, tot: 9 } });
        if (keuze === "2") {
          await l.zeg("Ik snap waarom: hij wijst naar de 2.");
          await l.verder();
          await l.zeg("Maar elk paars streepje is één minuut.", "Tel de minuten van de 12 tot de 2.", "Hoeveel tel je?");
          return ["6", "10"];
        }
        if (keuze === "6") {
          await l.zeg("Tel de streepjes nog eens.", "Van de 12 tot de 2.", "Hoeveel tel je?");
          return ["2", "10"];
        }
        await l.zeg("Geen zorgen.", "We tellen de streepjes samen.");
        return null;
      },
      antwoord: ["5 tot de 1, en nog 5 tot de 2.", "Samen 10 minuten."],
    });

    /* 4. Nu de rest zelf: 15, 20, 25, 30. */
    await l.zeg("Nu doe jij de rest.", "Zet de minutenwijzer steeds verder.", "En vertel hoeveel minuten het zijn.");
    await l.verder();
    const stappen: { n: number; opties: string[]; vraagzin: string; goedZin: string[] }[] = [
      { n: 3, opties: ["3", "11", "15"], vraagzin: "Hoeveel minuten zijn het nu?", goedZin: ["15.", "Dat is kwart over 7."] },
      { n: 4, opties: ["4", "16", "20"], vraagzin: "Hoeveel minuten na 7 uur is het nu?", goedZin: ["Ja, 20."] },
      { n: 5, opties: ["5", "21", "25"], vraagzin: "En hoeveel minuten nu?", goedZin: ["Klopt, 25."] },
      { n: 6, opties: ["6", "26", "30"], vraagzin: "En nu?", goedZin: ["30.", "Dat is half 8."] },
    ];
    for (const st of stappen) {
      await l.zeg(`Zet de minutenwijzer op de ${st.n}.`);
      await minuutVerder(l, k, u(7, st.n * 5), { hint: [`Tik op de ${st.n}.`, "Of sleep de minutenwijzer erheen."], ring: st.n, alleenGetal: true });
      await l.zeg(st.vraagzin);
      const goed = String(st.n * 5);
      await vraag(l, st.opties, goed, {
        toon: () => k.pas({ labels: totGetal(st.n) }),
        goedZin: st.goedZin,
        fout: async (keuze) => {
          if (keuze === String(st.n)) {
            await l.zeg(`Hij wijst wel naar de ${st.n}.`, "Maar elk getal is 5 minuten.", `Tel in vijven verder vanaf ${st.n * 5 - 5}.`);
          } else if (keuze !== null) {
            await l.zeg("Elk getal is 5 minuten.", `Tel in vijven verder vanaf ${st.n * 5 - 5}.`);
          } else {
            await l.zeg("Geen zorgen.");
            return null;
          }
          return zonder(st.opties, keuze);
        },
        antwoord: [`${st.n * 5 - 5}, en nog 5 erbij.`, `Dat is ${goed}.`],
      });
    }

    /* 5. Welk getal komt er steeds bij? */
    await l.zeg(l.naam ? `Hé ${l.naam}, je doet het goed!` : "Hé, je doet het goed!", "We doen er steeds hetzelfde getal bij.", "Welk getal?");
    await vraag(l, ["1", "5", "10"], "5", {
      goedZin: ["Dat klopt.", "Rond de klok tellen we in vijven."],
      verder: true,
      fout: async (keuze) => {
        if (keuze === null) return geenZorgen(l, keuze);
        await l.zeg("Kijk naar de getallen buiten de klok.", "5, 10, 15, 20, 25, 30.", "Wat komt er steeds bij?");
        return zonder(["1", "5", "10"], keuze);
      },
      antwoord: ["Er komt steeds 5 bij.", "Rond de klok tellen we in vijven."],
    });

    /* 6. Een sprong naar de 9: tel in vijven door. */
    await k.draai(u(7, 45));
    await l.zeg("De minutenwijzer sprong naar de 9.", "Tel in vijven verder vanaf de 6.", "Hoeveel minuten zijn het nu?");
    await vraag(l, ["9", "35", "45"], "45", {
      toon: () => k.pas({ labels: totGetal(9) }),
      goedZin: ["Ja, 45.", "Dat is kwart voor 8."],
      verder: true,
      fout: async (keuze) => {
        if (keuze === "35") {
          await l.zeg("Veel kinderen kiezen die.", "Je telde er maar één keer 5 bij.");
          await l.verder();
          await l.zeg("Maar de 9 is 3 getallen na de 6.", "Dus 3 keer 5 erbij: 35, 40, 45.", "Hoeveel minuten zijn het nu?");
          return ["35", "45"];
        }
        if (keuze === "9") {
          await l.zeg("Hij wijst wel naar de 9.", "Maar elk getal is 5 minuten.", "Tel in vijven: 30, 35, 40, 45.", "Hoeveel minuten zijn het?");
          return ["9", "45"];
        }
        return geenZorgen(l, keuze);
      },
      antwoord: ["Vanaf 30 tellen we door: 35, 40, 45.", "Het zijn 45 minuten."],
    });

    /* 7. Terug bij de 12: een heel uur. */
    await k.draai(u(8));
    await l.zeg("De minutenwijzer is terug bij de 12.", "Hoeveel minuten duurt de hele ronde?");
    await vraag(l, ["0", "12", "60"], "60", {
      toon: () => k.pas({ labels: [0, ...totGetal(11)] }),
      goedZin: ["60.", "Een heel uur.", "Bij de 12 staat 00, want daar begint het tellen opnieuw."],
      verder: true,
      fout: async (keuze) => {
        if (keuze === "12") await l.zeg("Er staan 12 getallen op de klok.", "Maar elk getal is 5 minuten.", "Tel door in vijven: 50, 55 …");
        else if (keuze === "0") await l.zeg("Bij de 12 begint het tellen opnieuw.", "Maar hoeveel minuten waren het helemaal rond?");
        else return geenZorgen(l, keuze);
        return zonder(["0", "12", "60"], keuze);
      },
      antwoord: ["Na 55 komt 60.", "Een hele ronde is 60 minuten: een heel uur."],
    });

    /* 8. De klok is een getallenlijn die in vijven telt, rondgebogen. */
    k.pas({ uurwijzer: "fel", vorm: "lijn", lijnMinuten: true });
    await l.wacht(1300);
    await l.zeg("Kijk, een getallenlijn die in vijven telt.", "Een klok is zo'n lijn, maar dan rondgebogen.");
    await l.verder();
    k.pas({ vorm: "klok" });
    await l.wacht(1300);
    await l.zeg("Nu kun je op de klok tellen in vijven.");
    await l.verder();

    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gedaan, ${l.naam}!` : "Goed gedaan!", "5, 10, 15 … tot 60.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* =====================================================================
   Eindtoets: klokkijken (Mastery Check, groep 3-deel)
   ===================================================================== */

const eindtoets: Lesdraaiboek = {
  id: "klok-eindtoets",
  titel: "Eindtoets: klokkijken",
  synthesis: "Telling Time · Mastery Check (groep 3-deel)",
  kaarttekening: KaartToets,

  async speel(l) {
    const k = new Klok(l, u(3));
    await l.zeg("In deze lessen leer je klokkijken.", "Op een klok met wijzers.", "Kun je dat al?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Goed." : "Geen probleem.", "We doen een korte toets.", "Dan zien we wat je al kunt.");
    await l.verder();

    /* Bij één fout komt er een herkansing van dezelfde soort; bij de tweede fout stopt de toets. */
    let fouten = 0;
    const mis: string[] = [];
    let gestopt = false;

    type Stap = () => Promise<{ goed: boolean; reactie: string }>;
    const met = async (soort: string, eerste: Stap, herkansing: Stap) => {
      if (gestopt) return;
      let r = await eerste();
      if (r.goed) return;
      fouten++;
      if (!mis.includes(soort)) mis.push(soort);
      if (fouten >= 2) {
        gestopt = true;
        await l.zeg(r.reactie);
        return;
      }
      await l.zeg(r.reactie, "Nog eentje zo.");
      r = await herkansing();
      if (r.goed) return;
      fouten++;
      gestopt = true;
      await l.zeg(r.reactie);
    };

    const lees = (t: number, opties: string[], goedZin: string): Stap => async () => {
      const r = await leesToets(l, k, t, ["Hoe laat is het?"], opties, goedZin);
      return { goed: r.goed, reactie: r.keuze ? `${r.keuze.charAt(0).toUpperCase()}${r.keuze.slice(1)}?` : "Hmm." };
    };
    const zet = (doel: number, hulp: string[], goedZin: string): Stap => async () => {
      const r = await zetToets(l, k, doel, [`Laat ${tijdnaam(doel)} zien.`], hulp, goedZin);
      return { goed: r.goed, reactie: `Dat is ${tijdnaam(r.tijd)}.` };
    };

    await l.zeg("Nu een klok met wijzers.");
    await met("heel", lees(u(8), ["8 uur", "12 uur", "9 uur", "half 9"], "Klopt."), lees(u(2), ["half 3", "12 uur", "2 uur", "3 uur"], "Goed."));
    if (!gestopt) await uitlegWijzers(l);
    await met("heel", zet(u(5), HULP_HEEL, "Zo is het goed."), zet(u(10), HULP_HEEL, "Zo is het goed."));
    await met("half", lees(u(4, 30), ["half 4", "half 5", "4 uur", "6 uur"], "Mooi."), lees(u(8, 30), ["half 8", "half 9", "8 uur", "6 uur"], "Mooi."));
    await met("half", zet(u(5, 30), HULP_HALF, "Klopt."), zet(u(2, 30), HULP_HALF, "Klopt."));

    const tik = l.kaart();
    if (!gestopt && fouten === 0) {
      await l.zeg(l.naam ? `Mooi gedaan, ${l.naam}!` : "Mooi gedaan!", "Je kunt hele en halve uren lezen en zetten.", "Tik op de kaart om hem af te vinken.");
    } else if (!gestopt) {
      await l.zeg(l.naam ? `Goed gewerkt, ${l.naam}!` : "Goed gewerkt!", "Je miste er maar één.", "Tik op de kaart om hem af te vinken.");
    } else {
      const namen = [...(mis.includes("heel") ? ["De urenwijzer", "Hele uren zetten"] : []), ...(mis.includes("half") ? ["Halve uren"] : [])];
      const lessen = namen.length > 1 ? `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}` : namen[0];
      await l.zeg(
        "We doen eerst een stapje terug.",
        namen.length > 1 ? "Oefen nog even met deze lessen:" : "Oefen nog even met deze les:",
        `${lessen}.`,
        "Daarna doe je de toets opnieuw.",
      );
      await l.verder();
      await l.zeg("Tik op de kaart om voor nu te stoppen.");
    }
    await tik;
  },
};

/* =====================================================================
   Versla de wekker (Beat the Alarm, groep 3-deel)
   ===================================================================== */

const verslaDeWekker: Lesdraaiboek = {
  id: "klok-versla-de-wekker",
  titel: "Versla de wekker",
  synthesis: "Telling Time · Beat the Alarm (groep 3-deel)",
  kaarttekening: KaartRace,

  async speel(l) {
    l.vlak<WekkerraceProps>(Wekkerrace, { naam: l.naam, actief: false });
    await l.zeg("Hoeveel klokken kun je lezen voordat de wekker afgaat?", "Je hebt één minuut.", "Tik op Start.");
    l.pasVlakAan<WekkerraceProps>({ actief: true });
    await l.wachtOpVlak("start");
    /* Tijdens de race geen oude zin in beeld. */
    await l.zeg();
    for (;;) {
      l.pasVlakAan<WekkerraceProps>({ actief: false });
      const uit = await l.wachtOpVlak<Vlakgebeurtenis & { goed: number; nieuw: boolean }>("klaar");
      await l.zeg(
        "De tijd is om!",
        uit.goed === 0 ? "Je had er nog geen goed." : uit.goed === 1 ? "Je had er 1 goed." : `Je had er ${uit.goed} goed.`,
        uit.nieuw ? "Dat is een nieuw record!" : "",
        "Nog een keer, of ben je klaar?",
      );
      l.pasVlakAan<WekkerraceProps>({ actief: true });
      const keuze = await l.wachtOpVlak(["opnieuw", "stop"]);
      if (keuze.soort === "stop") break;
      await l.zeg();
    }
    l.pasVlakAan<WekkerraceProps>({ actief: false });
    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gespeeld, ${l.naam}!` : "Goed gespeeld!", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* =====================================================================
   5 en 10 minuten later (How Long It Takes: Five en Ten Minutes Later, groep 3-deel)
   ===================================================================== */

/** "Hoe laat is het 5 minuten later?" De klok loopt daarna mee, de boog groeit. Geeft terug of het meteen goed was. */
async function vijfLater(l: Lesgids, k: Klok, van: number, opties: string[], goedZin: string): Promise<boolean> {
  const doel = van + 5;
  const goed = digitaal(doel);
  return vraag(l, opties, goed, {
    toon: () => void k.draai(doel),
    goedZin: [goedZin],
    fout: async (x) => {
      if (x === digitaal(van + 1)) {
        await l.zeg("Ik snap wat je denkt.", "Eén klein streepje is 1 minuut, dat klopt.");
        await l.verder();
        await l.zeg("Maar 5 minuten later is 5 streepjes verder, niet 1.", `Het is ${digitaal(van)} en er gaan 5 minuten voorbij.`, "Hoe laat is het dan?");
      } else if (x === digitaal(van + 10)) {
        await l.zeg("Dat is 10 minuten later.", "We gaan maar 5 minuten verder: één getal.", "Hoe laat is het dan?");
      } else if (x !== null) {
        await l.zeg("Elk getal op de klok is 5 minuten.", "De minutenwijzer gaat één getal verder.", "Hoe laat is het dan?");
      } else {
        await l.zeg("Geen zorgen.");
        return null;
      }
      return zonder(opties, x);
    },
    antwoord: [`${mod(van, 60)} minuten, en 5 erbij, is ${mod(doel, 60)}.`, `Het is ${goed}.`],
  });
}

const minutenLater: Lesdraaiboek = {
  id: "klok-minuten-later",
  titel: "5 en 10 minuten later",
  synthesis: "How Long It Takes · Five Minutes Later + Ten Minutes Later (groep 3-deel)",
  kaarttekening: KaartLater,

  async speel(l) {
    const k = new Klok(l, u(2, 35), { digitaal: true });
    await weetJeHet(l, "We kijken hoe laat het een paar minuten later is.", "We tellen verder met vijven.");

    /* 1. De koekjes: de minutenwijzer 5 minuten verder. */
    k.pas({ vlag: u(2, 35), boog: { van: u(2, 35), stap: 5 } });
    await l.zeg("Het is nu 2:35.", "De koekjes van Bliepo zijn over 5 minuten klaar.", "Zet de minutenwijzer 5 minuten verder.");
    await minuutVerder(l, k, u(2, 40), { hint: ["Elk getal op de klok is 5 minuten.", "Tik dus op het volgende getal: de 8."] });
    await l.zeg("De minutenwijzer schoof één getal op.", "Dat is 5 minuten.", "Om 2:40 zijn de koekjes klaar.");
    await l.verder();

    /* 2. Verder tellen met vijven. */
    let fouten = 0;
    await l.zeg("We tellen verder met vijven.", "Hoe laat is het 5 minuten later?");
    if (!(await vijfLater(l, k, u(2, 40), ["2:09", "2:41", "2:45", "2:50"], "Ja, goed zo."))) fouten++;
    await l.wacht(300);
    await l.zeg("En 5 minuten daarna?");
    if (!(await vijfLater(l, k, u(2, 45), ["2:10", "2:46", "2:50", "2:55"], "Goed."))) fouten++;
    await l.wacht(300);
    await l.zeg("En nog 5 minuten?");
    if (!(await vijfLater(l, k, u(2, 50), ["2:11", "2:51", "2:55", "3:00"], "Dat klopt."))) fouten++;
    await l.wacht(500);
    await l.zeg("De minuten gingen van 40 naar 45.", "Toen naar 50 en daarna naar 55.", "Steeds 5 erbij.");
    await l.verder();

    /* 3. Nog eentje, vanaf een nieuwe tijd. */
    k.pas({ boog: null, vlag: null });
    k.zet(u(3, 40));
    await l.wacht(600);
    k.pas({ vlag: u(3, 40), boog: { van: u(3, 40), stap: 5 } });
    await l.zeg("Nog eentje.", "Het is nu 3:40.", "Hoe laat is het 5 minuten later?");
    if (!(await vijfLater(l, k, u(3, 40), ["3:09", "3:41", "3:45", "3:50"], "Goed, die had je snel!"))) fouten++;
    await l.wacht(500);

    /* 4. 10 minuten verder: twee getallen. */
    k.pas({ boog: null, vlag: null });
    k.zet(u(1, 15));
    await l.wacht(600);
    k.pas({ vlag: u(1, 15), boog: { van: u(1, 15), stap: 10 } });
    await l.zeg("Nu ga je 10 minuten verder.", "Het is 1:15.", "De pannenkoeken van Bliepo zijn over 10 minuten klaar.");
    await l.verder();
    await l.zeg("Zet de minutenwijzer 10 minuten verder.");
    await minuutVerder(l, k, u(1, 25), {
      hint: ["Elk getal op de klok is 5 minuten.", "10 minuten is 2 getallen.", "Tik dus op de 5."],
      tussenstap: true,
    });
    await l.zeg("De minutenwijzer schoof 2 getallen op.", "Dat is 10 minuten.", "Om 1:25 zijn de pannenkoeken klaar.");
    await l.verder();
    k.pas({ boog: null, vlag: null });
    await l.zeg("Nu kun je verder tellen met vijven.", "En je weet: 10 minuten is 2 getallen verder.");
    await l.verder();

    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* =====================================================================
   Hoe lang samen? (How Long It Takes · Start to Finish, groep 3-deel)
   ===================================================================== */

/** Twee dingen na elkaar: de boog groeit eerst `a`, dan `b` minuten. Vraag hoeveel minuten samen. */
async function tweeNaElkaar(
  l: Lesgids,
  k: Klok,
  begin: number,
  a: number,
  b: number,
  zinnen: { eerst: string; dan: string },
  opties: string[],
): Promise<boolean> {
  k.pas({ boog: null, vlag: null });
  k.zet(begin);
  await l.wacht(600);
  k.pas({ vlag: begin, boog: { van: begin, delen: [a] } });
  await l.zeg(zinnen.eerst);
  await k.draai(begin + a);
  await l.zeg(zinnen.dan);
  await k.draai(begin + a + b);
  await l.zeg("Hoeveel minuten was dat samen?");
  const som = a + b;
  return vraag(l, opties, String(som), {
    goedZin: ["Goed.", `${a} en ${b} minuten is samen ${som} minuten.`],
    verder: true,
    fout: async (x) => {
      if (x === String(Math.abs(a - b))) {
        await l.zeg(`Dat is het verschil tussen ${a} en ${b}.`, "Maar Bliepo deed allebei, het ene na het andere.", "We tellen ze bij elkaar.");
      } else if (x === String(a) || x === String(b)) {
        await l.zeg("Dat is maar één van de twee.", "Bliepo deed daarna nog iets.", "We tellen ze bij elkaar.");
      } else if (x !== null) {
        await l.zeg("Kijk naar de boog.", "Die laat zien hoe lang het samen duurde.");
      } else {
        await l.zeg("Geen zorgen.", "We tellen langs de boog.");
      }
      await l.verder();
      k.pas({ boog: { van: begin, stap: 5 } });
      await l.zeg("Kijk, we tellen langs de boog in vijven.", "Hoeveel minuten samen?");
      return x === null ? opties : zonder(opties, x);
    },
    antwoord: [`${a} en ${b} minuten is samen ${som} minuten.`],
  });
}

const samenHoeLang: Lesdraaiboek = {
  id: "klok-samen-hoe-lang",
  titel: "Hoe lang samen?",
  synthesis: "How Long It Takes · Start to Finish (groep 3-deel)",
  kaarttekening: KaartSamen,

  async speel(l) {
    const k = new Klok(l, u(3), { digitaal: true, uurwijzer: "flets" });
    await weetJeHet(l, "We gaan zeggen hoe lang iets duurt, in minuten.");
    await l.zeg("Bliepo doet twee dingen, het ene na het andere.", "Het blauwe vlaggetje laat zien waar hij begint.");
    await l.verder();

    let fouten = 0;
    if (
      !(await tweeNaElkaar(l, k, u(3), 25, 20, { eerst: "Eerst leest Bliepo 25 minuten.", dan: "Daarna tekent hij 20 minuten." }, ["5", "20", "25", "45"]))
    ) {
      fouten++;
    }
    await l.zeg("Nog eentje.");
    if (
      !(await tweeNaElkaar(l, k, u(4), 15, 10, { eerst: "Eerst speelt Bliepo 15 minuten buiten.", dan: "Daarna eet hij 10 minuten." }, ["5", "10", "15", "25"]))
    ) {
      fouten++;
    }
    await l.zeg("De laatste.");
    if (
      !(await tweeNaElkaar(l, k, u(5), 30, 20, { eerst: "Eerst fietst Bliepo 30 minuten.", dan: "Daarna zwemt hij 20 minuten." }, ["10", "20", "30", "50"]))
    ) {
      fouten++;
    }
    k.pas({ boog: null, vlag: null });
    await l.zeg("Nu kun je zeggen hoe lang twee dingen samen duren.");
    await l.verder();

    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* De volgorde van Synthesis: instaptoets, de lessen, de eindtoets, het spel; daarna "How Long It Takes". */
export const LESSEN_KLOKKIJKEN: Lesdraaiboek[] = [
  instaptoets,
  digitaleKlok,
  urenwijzer,
  heleUrenZetten,
  halveUren,
  kwartOver,
  tellenInVijven,
  eindtoets,
  verslaDeWekker,
  minutenLater,
  samenHoeLang,
];
