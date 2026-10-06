/**
 * De kern voor plus- en minsommen: de uitleg volgens de schoolstrategie en de
 * bekende fouten uit hoofdstuk 6 en 7 van MAATJE-HANDLEIDING.md.
 *
 * Alle getallen komen uit de som zelf; wat hier gerekend wordt, zijn alleen de
 * tussenstappen van de strategie (de 10 vol maken, staven en losse).
 */

import { zin, type Fout } from "@/lib/maatje/bouw";
import { getalWoord, hoofd, stuks } from "@/lib/maatje/taal";
import { GEEN_PLAATJE, type Zin } from "@/lib/maatje/types";

/** Welk plaatje er bij de opgave staat; daarop volgen de plaatje-stappen. */
export type Plaatje = "rekenrek" | "pootjes" | "strook" | "plaatjes" | "weegschaal" | "geen";

/** De plaatje-stappen, in woorden. Zonder plaatje: "geen plaatje". */
export function stap(p: Plaatje, wat: string): string {
  return p === "geen" ? GEEN_PLAATJE : wat;
}

const kralen = (n: number) => stuks(n, "kraal", "kralen");

export type Kern = {
  goed: Zin[];
  uitleg: Zin[];
  tip: Zin;
  fouten: Fout[];
  tussen: number[];
};

function omgedraaid(c: number): Fout | null {
  if (c < 10 || c > 99) return null;
  const t = Math.floor(c / 10);
  const e = c % 10;
  if (t === e || e === 0) return null;
  return {
    code: "cijfers-omgedraaid",
    antwoorden: [`${e}${t}`],
    zinnen: [zin(`${hoofd(getalWoord(c))} schrijf je als ${c}.`), zin(`Eerst de ${t}, dan de ${e}.`)],
    getallen: [t, e],
  };
}

// ---------------------------------------------------------------------------
// Plus
// ---------------------------------------------------------------------------

export function plusKern(a: number, b: number, p: Plaatje): Kern {
  const c = a + b;
  const plus = `${a} plus ${b}`;
  const dus = (s: string) => zin(`Dus ${plus} is ${c}.`, stap(p, s));
  const fouten: Fout[] = [];
  const voeg = (f: Fout | null) => f && fouten.push(f);

  const ea = a % 10;
  const eb = b % 10;
  const ta = a - ea;
  const tb = b - eb;

  /* Tot en met 10. */
  if (c <= 10) {
    const goed = [zin(`${a} en ${b} is samen ${c}.`, stap(p, "alle kralen lichten op"))];
    const uitleg =
      p === "rekenrek"
        ? [
            zin(`Kijk op het rekenrek: ${kralen(a)} en ${kralen(b)}.`, `${kralen(a)} en ${kralen(b)} lichten op`),
            zin(`Dat is samen ${c}.`, "alle kralen lichten op"),
          ]
        : [
            zin("Kijk, zo doe je het."),
            zin(`Begin bij ${a} en tel er ${b} bij.`, stap(p, `${b} erbij`)),
            dus("alles licht op"),
          ];
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`${a} en ${b} is samen ${c}.`, stap(p, "alle kralen lichten op"))] });
    voeg({ code: "getal-overgeschreven", antwoorden: [`${a}`], zinnen: [zin(`Je schreef ${a}.`), zin(`Daar moet nog ${b} bij: ${c}.`, stap(p, `${b} schuiven erbij`))] });
    voeg({ code: "getal-overgeschreven-2", antwoorden: [`${b}`], zinnen: [zin(`Je schreef ${b}.`), zin(`Daar moet nog ${a} bij: ${c}.`, stap(p, `${a} schuiven erbij`))] });
    voeg({ code: "min-gedaan", antwoorden: [`${Math.abs(a - b)}`], zinnen: [zin("Het is plus."), zin(`Er komt iets bij, dus het wordt meer dan ${Math.max(a, b)}.`, stap(p, `${b} schuiven erbij`))] });
    return { goed, uitleg, tip: zin(`Begin bij ${a} en tel er ${b} bij.`), fouten, tussen: [] };
  }

  /* Via de 10: twee getallen onder de 10, samen over de 10. */
  if (a < 10 && b < 10) {
    const n = 10 - a;
    const r = b - n;
    const goed = [zin(`${a} en ${n} is 10, en nog ${r} erbij: ${c}.`, stap(p, p === "pootjes" ? "pootjes lichten op" : "bovenste rij licht op, dan de onderste"))];
    const vol = p === "pootjes" ? "linker pootje en hartje lichten op" : "bovenste rij vult zich";
    const rest = p === "pootjes" ? "rechter pootje springt naar de uitkomst" : `${kralen(r)} op de onderste rij`;
    const uitleg = [
      zin("Kijk, zo doe je het."),
      zin(`Maak eerst de 10 vol: ${a} en ${n} is 10.`, stap(p, vol)),
      zin(`Dan nog ${r} erbij: ${c}.`, stap(p, rest)),
      dus("alles licht op"),
    ];
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Eerst de 10 vol, dan nog ${r}: ${c}.`, stap(p, vol))] });
    voeg({ code: "tien-vergeten", antwoorden: [`${r}`], zinnen: [zin("Je bent de 10 vergeten."), zin(`10 en nog ${r} is ${c}.`, stap(p, "bovenste rij licht op als 10, dan de rest"))] });
    voeg({
      code: "tien-te-veel",
      antwoorden: [`${c + 10}`],
      zinnen:
        p === "rekenrek"
          ? [zin("Eén volle rij is 10."), zin(`Er is maar 1 rij vol: ${c}.`, "bovenste rij licht op, onderste rij met de rest")]
          : [zin("Je hebt een 10 te veel."), zin(`10 en nog ${r} is ${c}.`, stap(p, "de 10 licht op"))],
      getallen: [1],
    });
    voeg({ code: "getal-overgeschreven", antwoorden: [`${a}`], zinnen: [zin(`Je schreef ${a}.`), zin(`Daar moet nog ${b} bij: ${c}.`, stap(p, `${b} schuiven erbij`))] });
    voeg({ code: "getal-overgeschreven-2", antwoorden: [`${b}`], zinnen: [zin(`Je schreef ${b}.`), zin(`Daar moet nog ${a} bij: ${c}.`, stap(p, `${a} schuiven erbij`))] });
    voeg({ code: "min-gedaan", antwoorden: [`${Math.abs(a - b)}`], zinnen: [zin("Het is plus."), zin(`Er komt iets bij, dus het wordt meer dan ${a}.`, stap(p, `${b} schuiven erbij`))] });
    voeg(omgedraaid(c));
    return { goed, uitleg, tip: zin("Maak eerst de 10 vol.", stap(p, "bovenste rij knippert zacht")), fouten, tussen: [n, r, 10] };
  }

  /* Eén getal onder de 10, en daarmee over een tiental heen: via dat tiental. */
  if ((b < 10 || a < 10) && Math.floor(c / 10) !== Math.floor(Math.max(a, b) / 10) && c % 10 !== 0) {
    const groot = Math.max(a, b);
    const klein = Math.min(a, b);
    const tiental = Math.ceil(groot / 10) * 10;
    const n = tiental - groot;
    const r = klein - n;
    const goed = [zin(`${groot} en ${n} is ${tiental}, en nog ${r} erbij: ${c}.`, stap(p, "eerst het tiental, dan de rest"))];
    const uitleg = [
      zin("Kijk, zo doe je het."),
      zin(`Eerst naar ${tiental}: ${groot} en ${n} is ${tiental}.`, stap(p, "het tiental wordt vol")),
      zin(`Dan nog ${r} erbij: ${c}.`, stap(p, `${r} erbij`)),
      dus("alles licht op"),
    ];
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Eerst naar ${tiental}, dan nog ${r}: ${c}.`, stap(p, "het tiental wordt vol"))] });
    voeg({ code: "tiental-vergeten", antwoorden: [`${c - 10}`], zinnen: [zin(`Je bent over de ${tiental} heen gegaan.`), zin(`${groot} en ${n} is ${tiental}, en nog ${r}: ${c}.`, stap(p, "het tiental wordt vol"))] });
    voeg({ code: "tiental-te-veel", antwoorden: [`${c + 10}`], zinnen: [zin("Je zit er 10 naast."), zin(`${groot} en ${klein} is ${c}.`, stap(p, "alles licht op"))] });
    voeg({ code: "min-gedaan", antwoorden: [`${Math.abs(a - b)}`], zinnen: [zin("Het is plus."), zin(`Er komt iets bij, dus het wordt meer dan ${groot}.`, stap(p, `${klein} erbij`))] });
    voeg(omgedraaid(c));
    return { goed, uitleg, tip: zin(`Ga eerst naar ${tiental}.`), fouten, tussen: [n, r, tiental] };
  }

  /* Tot 100: staven bij staven, losse bij losse. */
  const T = ta + tb;
  const E = ea + eb;
  const staven = (n: number) => stuks(n / 10, "staaf", "staven");

  /* Een tiental en losse: 10 + 1, 40 + 7. */
  if ((ea === 0 && tb === 0 && b > 0) || (eb === 0 && ta === 0 && a > 0)) {
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`${T} en nog ${E} erbij is ${c}.`, stap(p, "de losse komen erbij"))] });
    voeg({ code: "achter-elkaar", antwoorden: [`${a}${b}`], zinnen: [zin("Je zette de getallen achter elkaar."), zin(`${T} en ${E} schrijf je samen als ${c}.`, stap(p, "staven en losse lichten op"))] });
    voeg({ code: "min-gedaan", antwoorden: [`${Math.abs(a - b)}`], zinnen: [zin("Het is plus."), zin(`Er komt iets bij, dus het wordt meer dan ${Math.max(a, b)}.`, stap(p, "het tweede getal komt erbij"))] });
    voeg(omgedraaid(c));
    return {
      goed: [zin(`${T} en nog ${E} erbij is ${c}.`, stap(p, "staven en losse lichten op"))],
      uitleg:
        p === "rekenrek" && T === 10
          ? [zin("Kijk op het rekenrek: de bovenste rij is 10.", "bovenste rij licht op"), zin(`Er komen ${kralen(E)} bij: ${c}.`, `${kralen(E)} op de onderste rij`), dus("alle kralen lichten op")]
          : [zin("Kijk, zo doe je het."), zin(`Je hebt ${T}, en er komen ${E} losse bij.`, stap(p, "de losse komen erbij")), dus("alles licht op")],
      tip: zin(p === "rekenrek" ? "Kijk eerst naar de volle rij." : "Kijk eerst naar de staven, dan naar de losse."),
      fouten,
      tussen: [T, E, T / 10],
    };
  }

  if (E < 10) {
    const goed =
      tb === 0
        ? [zin(`${ea} en ${b} is ${E}, dus ${c}.`, stap(p, "de losse lichten op"))]
        : ta === 0
          ? [zin(`${a} en ${eb} is ${E}, dus ${c}.`, stap(p, "de losse lichten op"))]
          : eb === 0 && ea === 0
            ? [zin(`${ta} en ${tb} is ${c}.`, stap(p, "de staven lichten op"))]
            : [zin(`${ta} en ${tb} is ${T}.`, stap(p, "de staven lichten op")), zin(`Met ${E} losse erbij is het ${c}.`, stap(p, "de losse lichten op"))];
    const uitleg =
      tb === 0 || ta === 0
        ? [
            zin("Kijk, zo doe je het."),
            zin(tb === 0 ? `De losse: ${ea} en ${b} is ${E}.` : `De losse: ${a} en ${eb} is ${E}.`, stap(p, "de losse lichten op")),
            zin(`De ${tb === 0 ? ta : tb} blijft staan.`, stap(p, "de staven lichten op")),
            dus("alles licht op"),
          ]
        : [
            zin(`Eerst de staven: ${ta} en ${tb} is ${T}.`, stap(p, "de staven lichten op")),
            ...(E === 0 ? [] : [zin(ea === 0 || eb === 0 ? `Dan nog ${E} losse erbij.` : `Dan de losse: ${ea} en ${eb} is ${E}.`, stap(p, "de losse lichten op"))]),
            dus("alles licht op"),
          ];
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Tel de staven en de losse nog eens: ${c}.`, stap(p, "staven en losse lichten op"))] });
    if (tb > 0) {
      voeg({
        code: "staven-als-losse",
        antwoorden: [`${a + tb / 10 + eb}`],
        zinnen:
          eb === 0
            ? [
                zin(`${b} is ${staven(tb)}.`, stap(p, "de staven lichten op")),
                ta === 0
                  ? zin(`Er komen ${staven(tb)} bij: ${c}.`, stap(p, "de staven schuiven samen"))
                  : zin(`${staven(ta)} en ${staven(tb)} is ${staven(T)}: ${c}.`, stap(p, "de staven schuiven samen")),
              ]
            : [zin(`${b} is ${staven(tb)} en ${eb} losse.`, stap(p, "de staven lichten op")), zin(`Eerst de staven, dan de losse: ${c}.`, stap(p, "staven en losse lichten op"))],
        getallen: [tb / 10, ta / 10, T / 10],
      });
      voeg({ code: "tiental-ernaast", antwoorden: [`${c - 10}`, `${c + 10}`], zinnen: [zin("Je zit er 10 naast."), zin(`Tel de staven nog eens: ${ta} en ${tb} is ${T}.`, stap(p, "de staven lichten op"))] });
    }
    voeg({ code: "min-gedaan", antwoorden: [`${Math.abs(a - b)}`], zinnen: [zin("Het is plus."), zin(`Er komt iets bij, dus het wordt meer dan ${Math.max(a, b)}.`, stap(p, "het tweede getal komt erbij"))] });
    voeg(omgedraaid(c));
    return {
      goed,
      uitleg,
      tip: zin(tb === 0 || ta === 0 ? "Kijk eerst naar de losse." : "Tel eerst de staven, dan de losse."),
      fouten,
      tussen: [ta, tb, T, ea, eb, E, ta / 10, tb / 10, T / 10],
    };
  }

  /* Tot 100 met inwisselen: 10 losse worden een nieuwe staaf. */
  const R = E - 10;
  const goed = [zin(`${ea} en ${eb} is ${E}: weer een staaf erbij.`, stap(p, "10 losse klikken samen tot een staaf")), zin(`Dus ${c}.`, stap(p, "alles licht op"))];
  const uitleg = [
    zin(`Eerst de staven: ${ta} en ${tb} is ${T}.`, stap(p, "de staven lichten op")),
    zin(`Dan de losse: ${ea} en ${eb} is ${E}.`, stap(p, "de losse lichten op")),
    zin(`Dat is nog een staaf en ${R} losse.`, stap(p, "10 losse klikken samen tot een staaf")),
    dus("alles licht op"),
  ];
  voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Tel de staven en de losse nog eens: ${c}.`, stap(p, "staven en losse lichten op"))] });
  voeg({ code: "inwisselen-vergeten", antwoorden: [`${c - 10}`], zinnen: [zin(`${ea} en ${eb} is ${E}.`, stap(p, "de losse lichten op")), zin(`Dat is een nieuwe staaf, dus ${c}.`, stap(p, "10 losse klikken samen tot een staaf"))] });
  voeg({
    code: "losse-apart-opgeschreven",
    antwoorden: [`${T / 10}${E}`],
    zinnen: [zin(`${E} losse is 1 staaf en ${R} losse.`, stap(p, "10 losse klikken samen tot een staaf")), zin(`Dan heb je ${staven(T + 10)} en ${R} losse: ${c}.`, stap(p, "alles licht op"))],
    getallen: [E, R, T / 10 + 1],
  });
  if (tb > 0) {
    voeg({
      code: "staven-als-losse",
      antwoorden: [`${a + tb / 10 + eb}`],
      zinnen: [zin(`${b} is ${staven(tb)} en ${eb} losse.`, stap(p, "de staven lichten op")), zin(`Eerst de staven, dan de losse: ${c}.`, stap(p, "staven en losse lichten op"))],
      getallen: [tb / 10],
    });
  }
  voeg({ code: "tiental-te-veel", antwoorden: [`${c + 10}`], zinnen: [zin("Je zit er 10 naast."), zin(`Er komt maar één nieuwe staaf bij: ${c}.`, stap(p, "10 losse klikken samen tot een staaf"))] });
  voeg({ code: "min-gedaan", antwoorden: [`${Math.abs(a - b)}`], zinnen: [zin("Het is plus."), zin(`Er komt iets bij, dus het wordt meer dan ${Math.max(a, b)}.`, stap(p, "het tweede getal komt erbij"))] });
  voeg(omgedraaid(c));
  return {
    goed,
    uitleg,
    tip: zin("Tel eerst de losse bij elkaar."),
    fouten,
    tussen: [ta, tb, T, ea, eb, E, R, ta / 10, tb / 10, T / 10, T / 10 + 1, 1],
  };
}

// ---------------------------------------------------------------------------
// Min
// ---------------------------------------------------------------------------

export function minKern(a: number, b: number, p: Plaatje): Kern {
  const c = a - b;
  const min = `${a} min ${b}`;
  const dus = (s: string) => zin(`Dus ${min} is ${c}.`, stap(p, s));
  const fouten: Fout[] = [];
  const voeg = (f: Fout | null) => f && fouten.push(f);
  const plusGedaan: Fout = { code: "plus-gedaan", antwoorden: [`${a + b}`], zinnen: [zin("Het is min."), zin(`Er gaat iets af, dus het wordt minder dan ${a}.`, stap(p, `${b} gaan eraf`))] };

  const ea = a % 10;
  const eb = b % 10;
  const ta = a - ea;
  const tb = b - eb;

  /* Tot en met 10. */
  if (a <= 10) {
    const goed = [zin(`Van ${a} gaan er ${b} af: er blijven ${c} over.`, stap(p, `${b} gaan terug`))];
    const uitleg =
      p === "rekenrek"
        ? [
            zin(`Kijk op het rekenrek: ${kralen(a)}, en ${b} gaan terug.`, `${kralen(b)} schuiven terug`),
            zin(`Er blijven er ${c} over.`, "de kralen die over zijn lichten op"),
          ]
        : [
            zin("Kijk, zo doe je het."),
            zin(`Begin bij ${a} en tel ${b} terug.`, stap(p, `${b} gaan eraf`)),
            dus("wat over is licht op"),
          ];
    voeg(plusGedaan);
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`${a} min ${b} is ${c}.`, stap(p, `${b} gaan terug`))] });
    voeg({ code: "getal-overgeschreven", antwoorden: [`${a}`], zinnen: [zin(`Je schreef ${a}.`), zin(`Daar gaan nog ${b} af: ${c}.`, stap(p, `${b} gaan terug`))] });
    return { goed, uitleg, tip: zin(`Begin bij ${a} en tel ${b} terug.`), fouten, tussen: [] };
  }

  /* Terug via de 10: van boven de 10 naar onder de 10. */
  if (a <= 20 && c < 10 && b < 10) {
    const n = a - 10;
    const r = b - n;
    const goed = [zin(`${a} min ${n} is 10, en nog ${r} eraf: ${c}.`, stap(p, "eerst terug naar 10, dan de rest eraf"))];
    const terug = p === "pootjes" ? "linker pootje licht op" : "de kralen op de onderste rij gaan terug";
    const uitleg = [
      zin(`Eerst terug naar de 10: ${a} min ${n} is 10.`, stap(p, terug)),
      zin(`Dan nog ${r} eraf: ${c}.`, stap(p, `${kralen(r)} gaan terug`)),
      dus("wat over is licht op"),
    ];
    voeg(plusGedaan);
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Eerst terug naar de 10, dan nog ${r} eraf.`, stap(p, terug))] });
    voeg({ code: "alleen-laatste-stap", antwoorden: [`${r}`], zinnen: [zin(`Eerst ${a} min ${n} is 10.`, stap(p, terug)), zin(`Dan nog ${r} eraf: ${c}.`, stap(p, `${kralen(r)} gaan terug`))] });
    voeg({ code: "getal-overgeschreven", antwoorden: [`${a}`], zinnen: [zin(`Je schreef ${a}.`), zin(`Daar gaan nog ${b} af: ${c}.`, stap(p, `${b} gaan terug`))] });
    return { goed, uitleg, tip: zin("Ga eerst terug naar de 10.", stap(p, "de 10 knippert zacht")), fouten, tussen: [n, r, 10] };
  }

  /* Eén getal onder de 10 eraf, terug over een tiental heen: via dat tiental. */
  if (b < 10 && eb > ea) {
    const tiental = ta;
    const n = ea;
    const r = b - n;
    const goed = [zin(`${a} min ${n} is ${tiental}, en nog ${r} eraf: ${c}.`, stap(p, "eerst terug naar het tiental"))];
    const uitleg = [
      zin(`Eerst terug naar ${tiental}: ${a} min ${n} is ${tiental}.`, stap(p, "de losse gaan eraf")),
      zin(`Dan nog ${r} eraf: ${c}.`, stap(p, "een staaf valt uit elkaar, er gaan er nog af")),
      dus("wat over is licht op"),
    ];
    voeg(plusGedaan);
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Eerst terug naar ${tiental}, dan nog ${r} eraf.`, stap(p, "de losse gaan eraf"))] });
    voeg({
      code: "klein-van-groot",
      antwoorden: [`${tiental + (eb - ea)}`],
      zinnen: [zin(`Je hebt ${eb} min ${ea} gedaan.`), zin(`Maar je haalt ${b} van ${a} af: ${c}.`, stap(p, "een staaf valt uit elkaar in 10 blokjes"))],
      getallen: [eb - ea],
    });
    voeg({ code: "tiental-niet-minder", antwoorden: [`${c + 10}`], zinnen: [zin(`Je komt onder de ${tiental}.`), zin(`Dan heb je één staaf minder: ${c}.`, stap(p, "een staaf valt uit elkaar"))] });
    voeg(omgedraaid(c));
    return { goed, uitleg, tip: zin(`Ga eerst terug naar ${tiental}.`), fouten, tussen: [n, r, tiental] };
  }

  /* Tot 100: staven van staven, losse van losse. */
  const T = ta - tb;
  const staven = (n: number) => stuks(n / 10, "staaf", "staven");
  if (ea >= eb) {
    const E = ea - eb;
    const goed =
      tb === 0
        ? [zin(`${ea} min ${b} is ${E}, dus ${c}.`, stap(p, "de losse gaan eraf"))]
        : eb === 0
          ? [zin(T === 0 ? `${a} min ${b}: er blijven ${c} over.` : ea === 0 ? `${ta} min ${tb} is ${c}.` : `${ta} min ${tb} is ${T}, dus ${c}.`, stap(p, "de staven gaan eraf"))]
          : [zin(`${ta} min ${tb} is ${T}.`, stap(p, "de staven gaan eraf")), zin(`En ${ea} min ${eb} is ${E}: samen ${c}.`, stap(p, "de losse gaan eraf"))];
    const uitleg =
      tb === 0
        ? [zin("Kijk, zo doe je het."), zin(`De losse: ${ea} min ${b} is ${E}.`, stap(p, "de losse gaan eraf")), zin(`De ${ta} blijft staan.`, stap(p, "de staven lichten op")), dus("wat over is licht op")]
        : [
            zin(`Eerst de staven: ${ta} min ${tb} is ${T}.`, stap(p, "de staven gaan eraf")),
            ...(ea === 0 && eb === 0 ? [] : [zin(eb === 0 ? `De ${ea} losse blijven liggen.` : `Dan de losse: ${ea} min ${eb} is ${E}.`, stap(p, "de losse gaan eraf"))]),
            dus("wat over is licht op"),
          ];
    voeg(plusGedaan);
    voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Tel de staven en de losse nog eens: ${c}.`, stap(p, "wat over is licht op"))] });
    if (tb > 0) {
      voeg({
        code: "staven-vergeten",
        antwoorden: [`${a - eb}`],
        zinnen: [zin(eb === 0 ? `${b} is ${staven(tb)}.` : `${b} is ${staven(tb)} en ${eb} losse.`), zin(`Haal ook de ${staven(tb)} eraf: ${c}.`, stap(p, "de staven gaan eraf"))],
        getallen: [tb / 10],
      });
      voeg({ code: "tiental-ernaast", antwoorden: [`${c - 10}`, `${c + 10}`], zinnen: [zin("Je zit er 10 naast."), zin(`Tel de staven nog eens: ${ta} min ${tb} is ${T}.`, stap(p, "de staven gaan eraf"))] });
    }
    if (b > c && a - b < 10) {
      /* Dicht bij elkaar: aanvullen gaat sneller (61 − 58). */
      voeg({ code: "dicht-bij-elkaar", antwoorden: ["0"], zinnen: [zin("Deze getallen liggen dicht bij elkaar."), zin(`Van ${b} naar ${a} is maar ${c}.`, stap(p, "van het kleine naar het grote getal"))] });
    }
    voeg(omgedraaid(c));
    return { goed, uitleg, tip: zin(tb === 0 ? "Kijk eerst naar de losse." : "Haal eerst de staven eraf, dan de losse."), fouten, tussen: [ta, tb, T, ea, eb, E, ta / 10, tb / 10] };
  }

  /* Tot 100 met inwisselen: een staaf valt uit elkaar in 10 losse. */
  const losse = ea + 10;
  const E = losse - eb;
  const goed = [zin(`Je wisselt een staaf in: ${losse} min ${eb} is ${E}.`, stap(p, "een staaf valt uit elkaar in 10 blokjes")), zin(`Dus ${c}.`, stap(p, "wat over is licht op"))];
  const uitleg = [
    zin(`Je hebt ${staven(ta)} en ${ea} losse.`, stap(p, "staven en losse lichten op")),
    zin(`Wissel een staaf in: ${staven(ta - 10)} en ${losse} losse.`, stap(p, "een staaf valt uit elkaar in 10 blokjes")),
    zin(`${losse} min ${eb} is ${E}.`, stap(p, `${eb} losse gaan eraf`)),
    dus("wat over is licht op"),
  ];
  voeg(plusGedaan);
  voeg({ code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Wissel eerst een staaf in: ${losse} losse.`, stap(p, "een staaf valt uit elkaar in 10 blokjes"))] });
  voeg({
    code: "klein-van-groot",
    antwoorden: [`${T + (eb - ea)}`],
    zinnen: [zin(`Je hebt ${eb} min ${ea} gedaan.`), zin(`Wissel eerst een staaf in, dan ${losse} min ${eb}.`, stap(p, "een staaf valt uit elkaar in 10 blokjes"))],
    getallen: [eb - ea],
  });
  voeg({ code: "tiental-niet-minder", antwoorden: [`${c + 10}`], zinnen: [zin("Je wisselde een staaf in."), zin(`Dan heb je nog ${staven(ta - 10)}: ${c}.`, stap(p, "een staaf valt uit elkaar"))] });
  if (tb > 0) {
    voeg({ code: "staven-vergeten", antwoorden: [`${a - eb}`], zinnen: [zin(`${b} is ${staven(tb)} en ${eb} losse.`), zin(`Haal ook de ${staven(tb)} eraf: ${c}.`, stap(p, "de staven gaan eraf"))], getallen: [tb / 10] });
  }
  voeg(omgedraaid(c));
  return {
    goed,
    uitleg,
    tip: zin("Kijk eerst: heb je genoeg losse?"),
    fouten,
    tussen: [ta, tb, T, ea, eb, E, losse, ta / 10, (ta - 10) / 10, tb / 10, 10],
  };
}
