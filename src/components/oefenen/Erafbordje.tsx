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
 * Met `splitsbeen` komen er twee dunne lijntjes tussen het bordje en de
 * rondjes, zoals het splitsbeen in het domein Splitsen: dan zie je dat het
 * getal dat eraf gaat uit die twee groepjes bestaat. Onder elk groepje staat
 * dan klein het getal erbij.
 *
 * Staat los van één oefentype, zodat Wegstrepen en het rekenrek hetzelfde
 * bordje gebruiken en het er voor een kind overal hetzelfde uitziet.
 */

/* De maten van de rondjes, in pixels: nodig om de lijntjes te laten kloppen. */
const RONDJE = 14;
const TUSSEN = 6;
/** Het gat tussen twee groepjes; ruim, zodat het echt twee groepjes zijn. */
const GROEPSGAT = 32;

export function Erafbordje({
  aantal,
  gevuld,
  teveel,
  groepen,
  splitsbeen = false,
}: {
  aantal: number;
  gevuld: number;
  teveel: boolean;
  /** Hoe de rondjes verdeeld staan; weggelaten = één rij van `aantal`. */
  groepen?: number[];
  /**
   * Twee lijntjes van het bordje naar de twee groepjes, met het getal eronder.
   *
   * Alleen zinvol bij twee groepjes: dan laat het zien dat het getal dat eraf
   * gaat gesplitst wordt, bijvoorbeeld 8 is 3 en 5.
   */
  splitsbeen?: boolean;
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

  /* De breedte van elk groepje en het midden ervan, in pixels. */
  const toonBeen = splitsbeen && verdeling.length === 2;
  const breedtes = verdeling.map((n) => n * RONDJE + (n - 1) * TUSSEN);
  const totaleBreedte = breedtes.reduce((op, b) => op + b, 0) + GROEPSGAT * (verdeling.length - 1);
  const middens = breedtes.map(
    (b, i) => breedtes.slice(0, i).reduce((op, x) => op + x, 0) + GROEPSGAT * i + b / 2,
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
      {/*
        De twee lijntjes van het bordje naar de twee groepjes. Ze worden in
        pixels uitgerekend uit de groepjes zelf, zodat ze precies boven het
        midden van elk groepje uitkomen, hoe groot die ook zijn.
      */}
      {toonBeen && (
        <svg
          aria-hidden="true"
          width={totaleBreedte}
          height={22}
          viewBox={`0 0 ${totaleBreedte} 22`}
          className="-mb-1 text-eraf"
        >
          {middens.map((midden, i) => (
            <path
              key={i}
              d={`M${totaleBreedte / 2} 0 C ${totaleBreedte / 2} 10, ${midden} 10, ${midden} 20`}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </svg>
      )}

      <span className="flex items-start" style={{ gap: GROEPSGAT }}>
        {verdeling.map((hoeveel, groep) => {
          const begin = beginnen[groep];
          return (
            <span key={groep} className="flex flex-col items-center gap-1">
              <span className="flex items-center" style={{ gap: TUSSEN }}>
                {Array.from({ length: hoeveel }, (_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    style={{ width: RONDJE, height: RONDJE }}
                    className={`rounded-full border-2 transition ${
                      teveel
                        ? "border-huisstijl bg-huisstijl"
                        : begin + i < gevuld
                          ? "border-groen bg-groen"
                          : "border-rand bg-kaart"
                    }`}
                  />
                ))}
              </span>
              {/* Klein het getal eronder: zoveel gaan er in deze stap af. */}
              {toonBeen && (
                <span className="text-sm font-extrabold tabular-nums text-eraf">{hoeveel}</span>
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}
