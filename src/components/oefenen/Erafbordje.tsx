"use client";

/**
 * Het bordje met de opdracht erop: "7 eraf", met een teller eronder.
 *
 * Onder het bordje staan evenveel lege rondjes als er weg moeten. Elk plaatje
 * of elke kraal die het kind wegdoet vult er één; zijn ze allemaal vol, dan
 * komt er een groen vinkje op het bordje. Doet het kind er te veel weg, dan
 * kleuren de rondjes even oranje — geen foutmelding, alleen een seintje dat
 * er eentje te veel weg is.
 *
 * De rondjes kunnen in groepjes staan. Bij het rekenrek past dat bij de
 * rijen: eerst zoveel rondjes als er kralen op de onderste rij staan, een
 * klein gat, en dan de rest. Zo laat de teller dezelfde weg zien als de
 * kralen zelf.
 *
 * Staat los van één oefentype, zodat Wegstrepen en het rekenrek hetzelfde
 * bordje gebruiken en het er voor een kind overal hetzelfde uitziet.
 */

export function Erafbordje({
  aantal,
  gevuld,
  teveel,
  groepen,
}: {
  aantal: number;
  gevuld: number;
  teveel: boolean;
  /** Hoe de rondjes verdeeld staan; weggelaten = één rij van `aantal`. */
  groepen?: number[];
}) {
  const compleet = gevuld === aantal;
  const verdeling = groepen && groepen.length > 0 ? groepen : [aantal];

  /*
    Waar elk groepje begint, doorgeteld over de groepjes heen: zo lopen de
    rondjes op volgorde vol, ook als ze in twee groepjes staan.
  */
  const beginnen = verdeling.map((_, i) =>
    verdeling.slice(0, i).reduce((op, n) => op + n, 0),
  );

  return (
    <span className="flex flex-col items-center gap-2">
      <span
        className={`flex items-center gap-2 rounded-2xl px-4 py-1.5 text-xl font-extrabold transition ${
          compleet ? "bg-groen text-white" : "bg-inkt text-white"
        }`}
      >
        {aantal} eraf
        {compleet && (
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex items-center gap-4">
        {verdeling.map((hoeveel, groep) => {
          const begin = beginnen[groep];
          return (
            <span key={groep} className="flex items-center gap-1.5">
              {Array.from({ length: hoeveel }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={`size-3.5 rounded-full border-2 transition ${
                    teveel
                      ? "border-huisstijl bg-huisstijl"
                      : begin + i < gevuld
                        ? "border-groen bg-groen"
                        : "border-rand bg-kaart"
                  }`}
                />
              ))}
            </span>
          );
        })}
      </span>
    </span>
  );
}
