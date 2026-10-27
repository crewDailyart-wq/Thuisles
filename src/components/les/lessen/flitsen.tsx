/**
 * Lessen: Flitskaarten — naar Synthesis "Flashcards 1" en "Flashcards 2"
 * (INSPIRATIE.md, ronde 1 en 2). Flashcards 1: groep 3. Flashcards 2:
 * groep 3/4 (dubbelen, plus en min tot 20, 10 erbij en 10 eraf) en de twee
 * toetsen met alles door elkaar.
 *
 * Elke les is hetzelfde spel met een andere stapel kaarten:
 * startscherm (Race of Oefenen) → tien kaarten oefenen met tien bolletjes →
 * uitslag ("9 van de 10") met Nog een keer oefenen / Race / Klaar → race
 * tegen de haas → Klaar → de kaart.
 *
 * Bewust anders dan Synthesis:
 * - Het kind typt het antwoord in een echt invulvak (HARDE REGEL 5) in plaats
 *   van uit vier knoppen te kiezen.
 * - De haas is mild voor groep 3: hij doet er 60 seconden over (Synthesis: zo
 *   snel dat 8 à 10 seconden nodig was). Na elke verloren race wordt hij
 *   10 seconden langzamer, tot hoogstens 90 seconden.
 * - Bij het oefenen loopt er geen klok; alleen de race heeft een tijd.
 * - De mascotte zegt kort wat je moet doen, want groep 3 kan de knoppen nog
 *   niet lezen.
 * - De beste tijd blijft alleen in deze browser bewaard (per les en per
 *   naam), niet in de database.
 *
 * Tweede bouwronde (10 oktober 2026), aangevuld naar de aantekeningen:
 * de race begint met een Start-knop (Synthesis: Play), de kaart krijgt het
 * plus- of minteken in de hoeken en een groene rand bij goed, de eindtoets
 * heeft de trofee op het startscherm, en na drie keer oefenen zegt de mascotte
 * "Dat is genoeg geoefend voor vandaag" (zoals bij de Mastery Check).
 */

import type { ComponentType } from "react";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { FlitsKaart, FlitsStapel, tijdTekst, type Flitskaart, type FlitsProps } from "../vlakken/flitsen-kaart";
import { FlitsHologram } from "../vlakken/flitsen-hologram";

/* ---------- stapels ---------- */

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

const plus = (a: number, b: number): Flitskaart => ({ soort: "som", a, op: "+", b });
const min = (a: number, b: number): Flitskaart => ({ soort: "som", a, op: "−", b });
const gat = (a: number): Flitskaart => ({ soort: "gat", a, doel: 10 });
const stip = (n: number): Flitskaart => ({ soort: "stippen", n });

/** Alle plussommen a + b met a, b ≥ 1 en een uitkomst van `van` tot en met `tot`. */
function plussommen(van: number, tot: number): Flitskaart[] {
  const uit: Flitskaart[] = [];
  for (let a = 1; a < tot; a++) for (let b = 1; a + b <= tot; b++) if (a + b >= van) uit.push(plus(a, b));
  return uit;
}

/** Alle minsommen a − b met a ≤ `tot`, b ≥ 1 en een uitkomst van minstens 1; a vanaf `van`. */
function minsommen(van: number, tot: number): Flitskaart[] {
  const uit: Flitskaart[] = [];
  for (let a = van; a <= tot; a++) for (let b = 1; a - b >= 1; b++) uit.push(min(a, b));
  return uit;
}

/** Plussommen tot 20: een getal van 10 of meer erbij (zonder over het tiental), of over het tiental. */
function plus20(over: boolean): Flitskaart[] {
  const uit: Flitskaart[] = [];
  for (let a = 1; a < 20; a++)
    for (let b = 1; a + b <= 20; b++) {
      const som = a + b;
      if (som < 11) continue;
      const kruist = a < 10 && b < 10;
      if (kruist === over) uit.push(plus(a, b));
    }
  return uit;
}

/** Minsommen tot 20 vanaf 11: zonder of met lenen over het tiental. */
function min20(over: boolean): Flitskaart[] {
  const uit: Flitskaart[] = [];
  for (let a = 11; a <= 20; a++)
    for (let b = 1; a - b >= 1; b++) {
      const kruist = a % 10 < b % 10;
      if (kruist === over) uit.push(min(a, b));
    }
  return uit;
}

/** 10 erbij of 10 eraf; alle uitkomsten tussen 1 en 99 (past in het invulvak). */
function tienErbij(): Flitskaart[] {
  const uit: Flitskaart[] = [];
  for (let a = 10; a <= 89; a++) uit.push(plus(a, 10));
  return uit;
}
function tienEraf(): Flitskaart[] {
  const uit: Flitskaart[] = [];
  for (let a = 11; a <= 99; a++) uit.push(min(a, 10));
  return uit;
}

/** 10 erbij of 10 eraf binnen de 20, voor de toetsen "tot 20". */
function tienBinnen20(): Flitskaart[] {
  const uit: Flitskaart[] = [];
  for (let a = 1; a <= 10; a++) uit.push(plus(a, 10));
  for (let a = 11; a <= 20; a++) uit.push(min(a, 10));
  return uit;
}

const sleutelVan = (k: Flitskaart) => (k.soort === "som" ? `${k.a}${k.op}${k.b}` : k.soort === "gat" ? `${k.a}+_=${k.doel}` : `s${k.n}`);

/** Kaarten uit een paar stapels samen, zonder dubbele kaart, door elkaar. */
function mix(...delen: [Flitskaart[], number][]): Flitskaart[] {
  const gezien = new Set<string>();
  const uit: Flitskaart[] = [];
  for (const [stapel, aantal] of delen) {
    let n = 0;
    for (const k of schud(stapel)) {
      if (n >= aantal) break;
      if (gezien.has(sleutelVan(k))) continue;
      gezien.add(sleutelVan(k));
      uit.push(k);
      n++;
    }
  }
  return schud(uit);
}

const DUBBELEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => plus(n, n));

const STAPELS = {
  /** Tellen: 1 t/m 10 stippen, elk één keer. */
  tellen: () => schud([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(stip)),
  /**
   * Parels tellen (hologramles): 15 kaarten per ronde (vaste regel: minstens
   * 15 opgaven): 1 t/m 10 elk één keer, en vijf keer de lastigere 6 t/m 10
   * nog eens. Nooit twee keer hetzelfde getal na elkaar.
   */
  parels15: () => {
    for (;;) {
      const getallen = schud([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...schud([6, 7, 8, 9, 10]).slice(0, 5)]);
      if (getallen.every((n, i) => i === 0 || n !== getallen[i - 1])) return getallen.map(stip);
    }
  },
  /** Precies de tien plussommen tot 5. */
  plus5: () => schud(plussommen(2, 5)),
  /** Precies de tien minsommen tot 5 (zonder 0 als uitkomst, zoals Synthesis). */
  min5: () => schud(minsommen(2, 5)),
  /** Tien plussommen tot 10, vooral in het bovenste deel. */
  plus10: () => schud(plussommen(6, 10)).slice(0, 10),
  min10: () => schud(minsommen(6, 10)).slice(0, 10),
  /** Vriendjes van 10: 1 t/m 9, en één nog een keer. */
  maak10: () => {
    const negen = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return schud([...negen, negen[Math.floor(Math.random() * 9)]].map(gat));
  },
  /** De toets: 3 keer stippen, 3 plus, 2 min en 2 keer aanvullen tot 10. */
  gemengd: () =>
    schud([
      ...schud([2, 3, 4, 5, 6, 7, 8, 9, 10].map(stip)).slice(0, 3),
      ...schud(plussommen(3, 10)).slice(0, 3),
      ...schud(minsommen(3, 10)).slice(0, 2),
      ...schud([1, 2, 3, 4, 5, 6, 7, 8, 9].map(gat)).slice(0, 2),
    ]),

  /* Flashcards 2 */
  /** Precies de tien dubbelen, 1 + 1 tot en met 10 + 10. */
  dubbel: () => schud(DUBBELEN),
  /** Plus tot 20: zeven zonder over het tiental (zoals 5 + 14), drie eroverheen (zoals 4 + 7). */
  plus20: () => mix([plus20(false), 7], [plus20(true), 3]),
  /** Min tot 20: zeven zonder lenen (zoals 19 − 14), drie met (zoals 12 − 8). */
  min20: () => mix([min20(false), 7], [min20(true), 3]),
  /** Vijf keer 10 erbij en vijf keer 10 eraf. */
  meerMinder: () => mix([tienErbij(), 5], [tienEraf(), 5]),
  /** De toets: 3 plus en 3 min tot 20, 2 dubbelen, 2 keer 10 erbij of eraf (binnen de 20). */
  gemengd20: () =>
    mix([[...plus20(false), ...plus20(true)], 3], [[...min20(false), ...min20(true)], 3], [DUBBELEN, 2], [tienBinnen20(), 2]),
};

/* ---------- beste tijd (alleen in deze browser) ---------- */

const sleutel = (id: string, naam: string) => `thuisles-flitsen-best:${id}:${naam || "-"}`;

function leesBest(id: string, naam: string): number | null {
  try {
    const v = window.localStorage.getItem(sleutel(id, naam));
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function schrijfBest(id: string, naam: string, sec: number) {
  try {
    window.localStorage.setItem(sleutel(id, naam), String(Math.round(sec * 10) / 10));
  } catch {
    /* Geen opslag: dan onthouden we de tijd alleen tijdens deze les. */
  }
}

/* ---------- het verloop, voor elke les hetzelfde ---------- */

const HAAS_START = 60;
const HAAS_MAX = 90;

type Flitsles = {
  id: string;
  titel: string;
  synthesis: string;
  /** Titel op het startscherm. */
  kop: string;
  stapel: () => Flitskaart[];
  voorbeeld: Flitskaart;
  /** Wat de mascotte eerst zegt. */
  uitleg: string[];
  /** Onder welke naam de beste tijd bewaard wordt; de twee toetsen delen er één, zoals bij Synthesis. */
  record?: string;
  /** De trofee op het startscherm (eindtoets). */
  trofee?: boolean;
  /**
   * In Phaser, met hologrammen in Bliepo's ruimte (27 oktober 2026,
   * LESSENPLAN.md; eerst alleen de voorbeeldles). Zonder: het oude venster.
   */
  hologram?: {
    /** Waar het kind tegen racet, en wat het zelf laat bewegen. */
    tegenstander: string;
    pion: string;
    finish: string;
  };
};

function maakTekening(kaart: Flitskaart): ComponentType {
  function Tekening() {
    return <FlitsStapel kaart={kaart} />;
  }
  return Tekening;
}

/** Eerste letter een hoofdletter ("het lichtvisje" → "Het lichtvisje"). */
const hoofd = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function flitsles(o: Flitsles): Lesdraaiboek {
  return {
    id: o.id,
    titel: o.titel,
    synthesis: o.synthesis,
    kaarttekening: maakTekening(o.voorbeeld),

    async speel(l: Lesgids) {
      const record = o.record ?? o.id;
      let best = leesBest(record, l.naam);
      let haasTijd = HAAS_START;
      let ronde = 0;
      let oefenrondes = 0;
      const zet = (p: Partial<FlitsProps>) => l.pasVlakAan<FlitsProps>(p);

      l.vlak(o.hologram ? FlitsHologram : FlitsKaart, {
        titel: o.kop,
        stapel: o.stapel(),
        voorbeeld: o.voorbeeld,
        fase: "start",
        ronde,
        actief: false,
        best,
        haasTijd,
        knoppen: ["race", "oefenen"],
        trofee: o.trofee,
      });
      await l.zeg(...o.uitleg, "Wil je eerst oefenen?", "Tik dan op de oranje knop.", "De groene knop is de race.");

      for (;;) {
        zet({ actief: true });
        const { keuze } = await l.wachtOpVlak<{ soort: string; keuze: string }>("keuze");
        zet({ actief: false });
        if (keuze === "klaar") break;

        if (keuze === "oefenen" || keuze === "verder") {
          await l.zeg(
            keuze === "verder" ? "We oefenen nog een rondje." : "We gaan oefenen.",
            "Typ het antwoord.",
            "Tik dan op het vinkje.",
          );
          zet({ fase: "oefenen", ronde: ++ronde, stapel: o.stapel() });
          const u = await l.wachtOpVlak<{ soort: string; goed: number; van: number }>("oefenKlaar");
          oefenrondes++;
          /* Naar verhouding (de hologramles heeft 15 kaarten per ronde, de andere 10). */
          const deel = u.van ? u.goed / u.van : 0;
          const oordeel =
            oefenrondes >= 3
              ? ["Dat is genoeg geoefend voor vandaag.", "Je mag racen, of op Klaar tikken."]
              : deel >= 0.8
                ? ["Knap gedaan.", "Je bent snel genoeg voor de race."]
                : deel >= 0.5
                  ? ["Goed gewerkt.", `Blijf oefenen, dan word je sneller dan ${o.hologram ? o.hologram.tegenstander : "de haas"}.`]
                  : ["Goed geprobeerd.", "Nog een rondje oefenen helpt."];
          zet({
            fase: "uitslag",
            uitslag: { kop: `${u.goed} van de ${u.van}.`, tekst: oordeel.join(" ") },
            knoppen: ["verder", "race", "klaar"],
          });
          await l.zeg(`{${u.goed}} van de {${u.van}}.`, ...oordeel);
          /* Groep 3 kan de knoppen nog niet lezen: zeg wat de kleuren doen. */
          await l.zeg("Oranje is nog een keer oefenen.", "Groen is de race.", "Roze is klaar.");
          continue;
        }

        /* De race. */
        await l.zeg(
          "Klaar voor de race?",
          o.hologram ? `Elk goed antwoord laat ${o.hologram.pion} verder rollen.` : "Elk goed antwoord brengt de schildpad verder.",
          o.hologram ? `Ben jij eerder bij ${o.hologram.finish} dan ${o.hologram.tegenstander}?` : "Ben jij eerder bij de vlag dan de haas?",
          "Tik op *Start* als je klaar bent.",
        );
        zet({ fase: "race", ronde: ++ronde, stapel: o.stapel(), haasTijd });
        const r = await l.wachtOpVlak<{ soort: string; gewonnen: boolean; tijd: number }>("raceKlaar");
        if (r.gewonnen) {
          const nieuw = best === null || r.tijd < best;
          if (nieuw) {
            best = r.tijd;
            schrijfBest(record, l.naam, r.tijd);
          }
          zet({
            fase: "uitslag",
            best,
            uitslag: {
              kop: "Jij wint!",
              tekst: `Je tijd: ${tijdTekst(r.tijd)} s. Beste tijd: ${tijdTekst(best ?? r.tijd)} s.`,
              ...(o.hologram ? {} : { dier: "schildpad" as const }),
            },
            knoppen: ["opnieuw", "klaar"],
          });
          await l.zeg(
            "Jij wint!",
            `Je deed er ${tijdTekst(r.tijd)} seconden over.`,
            nieuw ? "Dat is je beste tijd." : `Je beste tijd is ${tijdTekst(best ?? r.tijd)} seconden.`,
          );
          await l.zeg("Groen is nog een keer racen.", "Roze is klaar.");
        } else {
          haasTijd = Math.min(HAAS_MAX, haasTijd + 10);
          zet({
            fase: "uitslag",
            uitslag: o.hologram
              ? { kop: `${hoofd(o.hologram.tegenstander)} wint.`, tekst: "Je was heel dichtbij. Probeer het nog eens, of oefen eerst." }
              : { kop: "De haas wint.", tekst: "Je was heel dichtbij. Probeer het nog eens, of oefen eerst.", dier: "haas" },
            knoppen: ["opnieuw", "oefenen", "klaar"],
          });
          await l.zeg(
            o.hologram ? `${hoofd(o.hologram.tegenstander)} wint deze keer.` : "De haas wint deze keer.",
            "Je was heel dichtbij.",
            "Wil je nog een keer racen?",
            "Of eerst oefenen?",
          );
          await l.zeg("Groen is nog een keer racen.", "Oranje is oefenen.", "Roze is klaar.");
        }
      }

      l.vlak(null);
      l.bak([]);
      const tik = l.kaart();
      await l.zeg(l.naam ? `Goed gedaan, ${l.naam}!` : "Goed gedaan!", "Tik op de kaart om hem af te vinken.");
      await tik;
    },
  };
}

/* ---------- de lessen ---------- */

export const LESSEN_FLITSEN: Lesdraaiboek[] = [
  flitsles({
    id: "flitsen-instaptoets",
    titel: "Instaptoets: flitskaarten",
    synthesis: "Flashcards 1 · Assessment",
    kop: "Tellen, plus en min tot 10",
    stapel: STAPELS.gemengd,
    voorbeeld: stip(5),
    record: "flitsen-toets",
    uitleg: ["Dit zijn flitskaarten.", "Op een kaart staan stippen of een som.", "Typ het antwoord zo snel als je kunt."],
  }),
  flitsles({
    id: "flitsen-tellen-tot-10",
    titel: "Stippen tot 10",
    synthesis: "Flashcards 1 · Count to 10",
    /* De voorbeeldles in Phaser met Oceaan-hologrammen (27 oktober 2026). De oude stapel en tekst staan hieronder bij de andere lessen. */
    kop: "Parels tot 10",
    stapel: STAPELS.parels15,
    voorbeeld: stip(10),
    hologram: { tegenstander: "het lichtvisje", pion: "jouw parel", finish: "de schelp" },
    uitleg: [
      "Kijk, ik tover een schelp tevoorschijn.",
      "Er liggen parels in.",
      "Hoeveel parels zijn het?",
      "Kijk goed naar het patroon.",
      "Dan hoef je niet te tellen.",
    ],
  }),
  flitsles({
    id: "flitsen-plus-tot-5",
    titel: "Plussommen tot 5",
    synthesis: "Flashcards 1 · Add to 5",
    kop: "Plussommen tot 5",
    stapel: STAPELS.plus5,
    voorbeeld: plus(2, 3),
    uitleg: ["Op deze kaarten staan plussommen.", "Ze komen niet boven de {5}."],
  }),
  flitsles({
    id: "flitsen-min-tot-5",
    titel: "Minsommen tot 5",
    synthesis: "Flashcards 1 · Subtract to 5",
    kop: "Minsommen tot 5",
    stapel: STAPELS.min5,
    voorbeeld: min(5, 2),
    uitleg: ["Op deze kaarten staan minsommen.", "Ze beginnen nooit boven de {5}."],
  }),
  flitsles({
    id: "flitsen-plus-tot-10",
    titel: "Plussommen tot 10",
    synthesis: "Flashcards 1 · Add to 10",
    kop: "Plussommen tot 10",
    stapel: STAPELS.plus10,
    voorbeeld: plus(4, 6),
    uitleg: ["Op deze kaarten staan plussommen.", "Ze komen niet boven de {10}."],
  }),
  flitsles({
    id: "flitsen-min-tot-10",
    titel: "Minsommen tot 10",
    synthesis: "Flashcards 1 · Subtract to 10",
    kop: "Minsommen tot 10",
    stapel: STAPELS.min10,
    voorbeeld: min(10, 5),
    uitleg: ["Op deze kaarten staan minsommen.", "Ze beginnen nooit boven de {10}."],
  }),
  flitsles({
    id: "flitsen-maak-10",
    titel: "Maak 10",
    synthesis: "Flashcards 1 · Make 10",
    kop: "Maak 10",
    stapel: STAPELS.maak10,
    voorbeeld: gat(7),
    uitleg: ["Op deze kaarten mist een getal.", "Samen moet het {10} zijn.", "Typ het getal dat ontbreekt."],
  }),
  flitsles({
    id: "flitsen-eindtoets",
    titel: "Eindtoets: flitskaarten",
    synthesis: "Flashcards 1 · Mastery Check",
    kop: "Tellen, plus en min tot 10",
    stapel: STAPELS.gemengd,
    voorbeeld: stip(5),
    record: "flitsen-toets",
    trofee: true,
    uitleg: ["Weet je nog hoe de flitskaarten werken?", "Typ het antwoord zo snel als je kunt.", "Kun je je beste tijd verbeteren?"],
  }),

  /* ---------- Flashcards 2 ---------- */
  flitsles({
    id: "flitsen-instaptoets-20",
    titel: "Instaptoets: flitskaarten tot 20",
    synthesis: "Flashcards 2 · Assessment",
    kop: "Plus en min tot 20",
    stapel: STAPELS.gemengd20,
    voorbeeld: plus(5, 15),
    record: "flitsen-toets-20",
    uitleg: [
      "Dit zijn flitskaarten.",
      "Er staan plussommen en minsommen tot {20} op.",
      "Soms komt er {10} bij, of gaat er {10} af.",
      "Typ het antwoord zo snel als je kunt.",
    ],
  }),
  flitsles({
    id: "flitsen-dubbelen",
    titel: "Dubbelen",
    synthesis: "Flashcards 2 · Doubles",
    kop: "Dubbelen",
    stapel: STAPELS.dubbel,
    voorbeeld: plus(5, 5),
    uitleg: ["Op deze kaarten staan dubbelen.", "Daarin staat twee keer hetzelfde getal.", "Zoals {5} + {5}."],
  }),
  flitsles({
    id: "flitsen-plus-tot-20",
    titel: "Plussommen tot 20",
    synthesis: "Flashcards 2 · Add to 20",
    kop: "Plussommen tot 20",
    stapel: STAPELS.plus20,
    voorbeeld: plus(14, 4),
    uitleg: ["Op deze kaarten staan plussommen.", "Ze komen niet boven de {20}."],
  }),
  flitsles({
    id: "flitsen-min-tot-20",
    titel: "Minsommen tot 20",
    synthesis: "Flashcards 2 · Subtract to 20",
    kop: "Minsommen tot 20",
    stapel: STAPELS.min20,
    voorbeeld: min(18, 8),
    uitleg: ["Op deze kaarten staan minsommen.", "Ze beginnen nooit boven de {20}."],
  }),
  flitsles({
    id: "flitsen-tien-erbij-eraf",
    titel: "10 erbij, 10 eraf",
    synthesis: "Flashcards 2 · 10 More, 10 Less",
    kop: "10 erbij, 10 eraf",
    stapel: STAPELS.meerMinder,
    voorbeeld: plus(23, 10),
    uitleg: [
      "Op deze kaarten komt er {10} bij.",
      "Of er gaat {10} af.",
      "Kijk goed naar het teken.",
      "Alleen de tientallen veranderen.",
    ],
  }),
  flitsles({
    id: "flitsen-eindtoets-20",
    titel: "Eindtoets: flitskaarten tot 20",
    synthesis: "Flashcards 2 · Mastery Check",
    kop: "Plus en min tot 20",
    stapel: STAPELS.gemengd20,
    voorbeeld: plus(5, 15),
    record: "flitsen-toets-20",
    trofee: true,
    uitleg: [
      "Weet je nog hoe de flitskaarten werken?",
      "Alle soorten kaarten komen door elkaar.",
      "Typ het antwoord zo snel als je kunt.",
      "Kun je je beste tijd verbeteren?",
    ],
  }),
];
