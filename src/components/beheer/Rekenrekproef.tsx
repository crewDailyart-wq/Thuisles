"use client";

/**
 * Het rekenrek uitproberen in het beheer.
 *
 * Alle drie de standen naast elkaar, met de knoppen erbij om de getallen te
 * veranderen. Zo kun je zien wat een kind straks ziet zonder dat er al een
 * oefening met het rekenrek bestaat: de kralen die wegschuiven, de kaart die
 * over het rek valt, en de som die zichzelf afspeelt.
 */

import { useState } from "react";
import { Paneel } from "@/components/beheer/Bouwstenen";
import { Rekenrek, FLITS_SECONDEN } from "@/components/oefenen/Rekenrek";

/** Een getal bijstellen met twee knopjes; geen schuifbalk, dat tikt lastig. */
function Teller({
  label,
  waarde,
  van,
  tot,
  onZet,
}: {
  label: string;
  waarde: number;
  van: number;
  tot: number;
  onZet: (n: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-beheer-inkt">
      <span className="w-40">{label}</span>
      <button
        type="button"
        onClick={() => onZet(Math.max(van, waarde - 1))}
        className="size-7 rounded-md border border-beheer-rand bg-beheer-kaart font-bold hover:bg-beheer-vlak"
      >
        −
      </button>
      <span className="w-8 text-center tabular-nums">{waarde}</span>
      <button
        type="button"
        onClick={() => onZet(Math.min(tot, waarde + 1))}
        className="size-7 rounded-md border border-beheer-rand bg-beheer-kaart font-bold hover:bg-beheer-vlak"
      >
        +
      </button>
    </label>
  );
}

export function Rekenrekproef() {
  const [aantal, setAantal] = useState(15);
  const [eraf, setEraf] = useState(7);
  const [seconden, setSeconden] = useState(FLITS_SECONDEN);
  /* Verandert bij elke klik op "Nog eens", zodat een stand opnieuw begint. */
  const [ronde, setRonde] = useState(0);
  const [weg, setWeg] = useState(0);

  const veilig = Math.min(eraf, aantal);

  return (
    <div className="flex flex-col gap-4">
      <Paneel
        titel="Instellingen"
        bijschrift="Geldt voor alle drie de standen hieronder."
      >
        <div className="flex flex-col gap-2">
          <Teller label="Kralen op het rek" waarde={aantal} van={1} tot={20} onZet={setAantal} />
          <Teller label="Hoeveel eraf" waarde={eraf} van={0} tot={20} onZet={setEraf} />
          <Teller
            label="Flitsen: na hoeveel tellen"
            waarde={seconden}
            van={1}
            tot={10}
            onZet={setSeconden}
          />
          <button
            type="button"
            onClick={() => setRonde((r) => r + 1)}
            className="mt-1 w-fit rounded-md bg-beheer-balk px-3 py-1.5 text-sm font-semibold text-white hover:bg-beheer-balk-op"
          >
            Nog eens afspelen
          </button>
        </div>
      </Paneel>

      <Paneel
        titel="Wegschuiven — het kind doet het zelf"
        bijschrift="Tik of sleep over de kralen. Er gaat altijd de laatste kraal weg: eerst de onderste rij van rechts naar links, daarna de bovenste. Tikken op een weggeschoven kraal zet de laatste terug. Blijven er precies tien over, dan licht de bovenste rij even op."
      >
        <div className="mx-auto max-w-md">
          <Rekenrek
            key={`weg-${ronde}-${aantal}-${veilig}`}
            aantal={aantal}
            eraf={veilig}
            modus="wegschuiven"
            onWeg={setWeg}
          />
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-beheer-zacht">
          Weggeschoven: {weg} · Blijft over: {Math.max(0, aantal - weg)}
        </p>
      </Paneel>

      <Paneel
        titel="Flitsen — even kijken, dan gaat de kaart erover"
        bijschrift="Het rek staat er een paar tellen en wordt dan afgedekt. Hoelang dat duurt stel je per oefening in."
      >
        <div className="mx-auto max-w-md">
          <Rekenrek
            key={`flits-${ronde}-${aantal}-${seconden}`}
            aantal={aantal}
            modus="flitsen"
            seconden={seconden}
            toonBordje={false}
          />
        </div>
      </Paneel>

      <Paneel
        titel="Kijken — het rek speelt de som zelf af"
        bijschrift="Kraal voor kraal, met hetzelfde bordje en hetzelfde moment bij de tien. Dit is wat een kind te zien krijgt bij de uitleg na een fout antwoord."
      >
        <div className="mx-auto max-w-md">
          <Rekenrek
            key={`kijk-${ronde}-${aantal}-${veilig}`}
            aantal={aantal}
            eraf={veilig}
            modus="kijken"
          />
        </div>
      </Paneel>
    </div>
  );
}
