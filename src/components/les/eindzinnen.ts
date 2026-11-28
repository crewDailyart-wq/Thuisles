/**
 * De standaard eindzinnen van alle gouden lessen (Sara, 27 november 2026: "standaardzinnen"). 1 zin (soms 2) van Bliepo aan het eind,
 * over HOE HET GING en nooit over de kleur van het rondje. De trap hangt af van het echte (niet afgeronde) percentage goed in 1 keer.
 * Door Fable gecontroleerd (27 nov 2026): geen lof bij een laag resultaat, geen belofte die niet klopt, geen "bijna" of "de meeste"
 * waar het niet waar is, hoeveelheden met cijfers (BOUWREGELS 3.20), geen cijfers over het resultaat zelf.
 * Per trap 3 varianten die wisselen (geen vaste zin, BLIEPO-KARAKTER.md). De les zelf voegt hier niets aan toe.
 */
export type Eindtrap = "alles" | "gewoon" | "moeite" | "weinig";

export const EINDZINNEN: Record<Eindtrap, readonly string[]> = {
  /* precies 100%: elke vraag in 1 keer goed */
  alles: ["Je had alles goed! Wat heb jij dat mooi gedaan.", "Elke vraag had je meteen goed. Knap!", "Je had alles goed! Dat heb je knap gedaan."],
  /* 70 tot 100% */
  gewoon: ["Dat ging goed! De meeste vragen had je meteen goed.", "Je had veel vragen meteen goed. Dat ging goed!", "Mooi! Dit lukt jou al goed."],
  /* 40 tot 70% */
  moeite: ["Een deel ging al goed. Van oefenen word je steeds beter.", "Een deel lukt al. De rest oefenen we nog.", "Je hebt de hele les gedaan. Een deel ging al goed. Oefen het nog 1 keer."],
  /* onder 40%, ook bij 0%: eerlijk en warm, geen lof */
  weinig: ["De les is af. Dit was nog lastig. Van oefenen word je steeds beter.", "Je hebt de les afgemaakt. Dit is nog moeilijk, en dat mag.", "Dit ga je nog leren. Van oefenen word je beter."],
};

/** De trap bij een percentage goed in 1 keer. Geef het echte getal mee, niet afgerond (69,5 is nog "moeite", 99,5 is nog "gewoon"). */
export function eindtrap(percentage: number): Eindtrap {
  if (percentage >= 100) return "alles";
  if (percentage >= 70) return "gewoon";
  if (percentage >= 40) return "moeite";
  return "weinig";
}

const laatste = new Map<Eindtrap, number>();

/** Kiest een variant van de trap en nooit 2 keer dezelfde achter elkaar. */
export function eindzin(percentage: number): string {
  const trap = eindtrap(percentage);
  const lijst = EINDZINNEN[trap];
  let i = Math.floor(Math.random() * lijst.length);
  if (lijst.length > 1 && i === laatste.get(trap)) i = (i + 1) % lijst.length;
  laatste.set(trap, i);
  return lijst[i];
}

/** De zin die Bliepo zegt als de kaart in beeld komt (voor alle lessen gelijk). */
export const EIND_TIK_KAART = "Tik op de kaart om hem af te vinken.";

/**
 * Wat Bliepo eerst zegt als het kind terugkomt (BOUWREGELS 15.53; zoals Synthesis: de tutor noemt dat het de les al eens deed).
 * verder = halverwege gestopt; opnieuw = al eens afgemaakt, nog niet de beste kleur; perfect = al eens met de beste kleur.
 */
export const TERUGZINNEN = {
  verder: ["Welkom terug! We gaan verder waar je was.", "Fijn dat je er weer bent. We gaan verder waar je was.", "Daar ben je weer! We gaan verder met de les."],
  /* Zonder groet: de les groet daarna zelf. Door Fable gecontroleerd (28 nov 2026). */
  opnieuw: ["Je hebt deze les al gedaan. We beginnen opnieuw.", "Je doet deze les nog 1 keer. We beginnen bij het begin.", "Deze les heb je al gedaan. We doen hem nog 1 keer."],
  /* Eerder met de beste kleur: de uitleg wordt overgeslagen (BOUWREGELS 15.60). De les groet eerst en zegt dan deze zin.
     Bewaard wordt de beste uitslag, niet de laatste: daarom niet "de vorige keer". Door Fable gecontroleerd (28 nov 2026). */
  perfect: ["Dit ken je al. We gaan meteen oefenen.", "Dit heb je al eens heel goed gedaan. We gaan meteen oefenen.", "Deze les ken je al. Kom, we gaan meteen oefenen!"],
} as const;

export const terugzin = (soort: keyof typeof TERUGZINNEN): string => TERUGZINNEN[soort][Math.floor(Math.random() * TERUGZINNEN[soort].length)];
