"use client";

/**
 * Het maatje op het oefenscherm: Vos of de robot, met een tekstwolkje.
 *
 * Krijgt een bericht (een paar zinnen) en zegt die één voor één. Het wolkje
 * loopt mee: de zin die nu klinkt staat er vet, de zinnen ervoor gewoon. Staat
 * de stem uit, dan verschijnen de zinnen in hetzelfde tempo, zonder geluid.
 *
 * Bij elke zin gaat de plaatje-stap mee naar `zetMaatjeStap`, zodat een plaatje
 * dat wil meelopen weet wat het maatje op dat moment uitlegt.
 *
 * Er zit met opzet geen knop "Hulp" op (MAATJE-HANDLEIDING.md, wachtrij 02).
 * Alleen de knop om de stem uit en aan te zetten.
 */

import { useEffect, useRef, useState } from "react";
import { VosFiguur } from "@/components/oefenen/VosFiguur";
import { Luidspreker, LuidsprekerUit } from "@/components/oefenen/Symbolen";
import { POPPETJE, POPPETJE_GODOT, type MaatjeHouding } from "@/lib/maatje/poppetje";
import { TijdelijkMaatje } from "@/components/oefenen/TijdelijkMaatje";
import { BliepoVloer } from "@/components/oefenen/BliepoVloer";
import { BliepoZinnen, MAX_REGELS, type BliepoRegel } from "@/components/oefenen/BliepoTekst";
import { Praatknop, type TutorAntwoord, type TutorOnderwerp } from "@/components/gesprek/Gesprek";
import { PRATEN_UIT } from "@/components/gesprek/teksten";
import { meldVoorlezen, spraakGrenzen, stopVoorlezen } from "@/lib/voorlezen";
import { zetMaatjeStap } from "@/lib/maatje/stap";
import { kiesGebaar, vraagOfUitleg, type Zinsoort } from "@/lib/bliepo-gebaren";
import { spreekbaar } from "@/lib/maatje/taal";
import type { Zin } from "@/lib/maatje/types";
import { speelAntwoord, stopPraten, zegEnWacht, zegNaElkaar } from "@/lib/stem";

export type MaatjeBericht = {
  /** Uniek per bericht; een nieuw id laat het maatje opnieuw beginnen. */
  id: string;
  zinnen: Zin[];
  houding: MaatjeHouding;
};

export function Maatje({
  bericht,
  geluid,
  onGeluid,
  onKlaar,
  poppetje = "vos",
  vloer = false,
  praten = null,
}: {
  /**
   * De ronde microfoonknop naast Bliepo (nieuw ontwerp, 26 oktober 2026,
   * opdracht eigenaar). `aan`: "Praten met Bliepo" staat aan voor dit kind.
   * Staat het uit, dan staat de knop er grijs en zegt Bliepo bij een tik dat
   * papa of mama het kan aanzetten. `onderwerp`: waar de vraag over gaat.
   */
  praten?: { aan: boolean; onderwerp: () => TutorOnderwerp } | null;
  /**
   * Nieuw ontwerp van de opdrachten (23 oktober 2026): Bliepo staat rechts op
   * de ronde cirkel op de vloer, met zijn tekstballon naast zijn hoofd; op een
   * staand scherm kleiner onder het bord (zie opdracht-nieuw.css).
   */
  vloer?: boolean;
  bericht: MaatjeBericht | null;
  /**
   * "tijdelijk": het bolletje, geen vos. "geen": alleen het wolkje, omdat het
   * maatje al in de Godot-bouwsteen zelf staat (één maatje in beeld).
   */
  poppetje?: "vos" | "tijdelijk" | "geen";
  geluid: boolean;
  onGeluid: (aan: boolean) => void;
  /** Na de laatste zin van een bericht, met het id erbij. */
  onKlaar?: (id: string) => void;
}) {
  /* Hoeveel zinnen er al te zien zijn, bij welk bericht. */
  const [stand, setStand] = useState<{ id: string; tot: number; klaar: boolean }>({ id: "", tot: 0, klaar: false });
  /* "Nog eens horen" (23 oktober 2026): hetzelfde bericht nog een keer voorlezen. */
  const [herhaal, setHerhaal] = useState(0);
  /*
    De zinnen onder elkaar (26 oktober 2026, opdracht eigenaar): elke zin die
    hij zegt, komt er onderaan bij, ook wat het kind via de microfoon vraagt
    en zijn antwoord. Hoeveel er te zien zijn, bepaalt de stijlkiezer.
  */
  const [regels, zetRegels] = useState<BliepoRegel[]>([]);
  const voegToe = (r: BliepoRegel) => zetRegels((l) => (l.some((x) => x.id === r.id) ? l : [...l, r].slice(-MAX_REGELS)));
  const extra = useRef(0);
  const klaarRef = useRef(onKlaar);
  useEffect(() => {
    klaarRef.current = onKlaar;
  }, [onKlaar]);

  useEffect(() => {
    if (!bericht) return;
    const stop = zegNaElkaar(
      bericht.zinnen.map((z) => spreekbaar(z.tekst)),
      (i) => {
        setStand({ id: bericht.id, tot: i + 1, klaar: false });
        zetMaatjeStap(bericht.zinnen[i]?.stap ?? null);
      },
      () => {
        setStand({ id: bericht.id, tot: bericht.zinnen.length, klaar: true });
        zetMaatjeStap(null);
        klaarRef.current?.(bericht.id);
      },
      geluid,
    );
    return () => {
      stop();
      stopPraten();
      zetMaatjeStap(null);
    };
    /*
      Opnieuw beginnen bij een nieuw bericht, of als de stem aan of uit gaat —
      niet bij elke nieuwe render.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bericht?.id, geluid, herhaal]);

  /* De zin die hij nu zegt komt bij de zinnen (in het nieuwe ontwerp). */
  const nuTot = bericht && stand.id === bericht.id ? stand.tot : 0;
  const nuZin = bericht ? Math.max(0, Math.min(bericht.zinnen.length - 1, nuTot - 1)) : -1;
  const nuTekst = bericht?.zinnen[nuZin]?.tekst ?? "";
  useEffect(() => {
    if (!vloer || !bericht || !nuTekst) return;
    const t = window.setTimeout(() => voegToe({ id: `${bericht.id}:${nuZin}`, tekst: nuTekst, gesproken: spreekbaar(nuTekst) }), 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij een nieuwe zin
  }, [vloer, bericht?.id, nuZin, nuTekst]);

  /* Het antwoord van de tutor: zijn stem, met meelezen, als nieuwe zin onderaan. */
  const zegAntwoord = async (a: TutorAntwoord) => {
    if (a.gehoord) voegToe({ id: `kind:${++extra.current}`, tekst: a.gehoord, van: "kind" });
    if (a.audio && a.zinnen.length) {
      const tekst = a.zinnen.join(" ");
      voegToe({ id: `tutor:${++extra.current}`, tekst, gesproken: tekst });
      let grenzen: { begin: number; eind: number } | null = null;
      await speelAntwoord(a.audio, {
        metGeluid: (b) => (grenzen = spraakGrenzen(b.getChannelData(0), b.sampleRate)),
        gestart: () => meldVoorlezen(tekst, grenzen ?? { begin: 0.05, eind: 2 }),
      });
      stopVoorlezen();
    } else {
      for (const zin of a.zinnen) {
        voegToe({ id: `tutor:${++extra.current}`, tekst: zin, gesproken: spreekbaar(zin) });
        await zegEnWacht([spreekbaar(zin)]);
      }
    }
  };
  const pratenUit = async () => {
    stopPraten();
    voegToe({ id: `uit:${++extra.current}`, tekst: PRATEN_UIT, gesproken: PRATEN_UIT });
    await zegEnWacht([PRATEN_UIT]);
  };

  if (!bericht) return null;

  const tot = stand.id === bericht.id ? stand.tot : 0;
  const bezig = stand.id === bericht.id && !stand.klaar;
  const zichtbaar = bericht.zinnen.slice(0, Math.max(1, tot));
  const pop = POPPETJE.houdingen[bezig && bericht.houding === "rustig" ? "praat" : bericht.houding];

  const naam = poppetje === "vos" ? POPPETJE.naam : POPPETJE_GODOT.naam;

  function wisselGeluid() {
    const aan = !geluid;
    if (!aan) stopPraten();
    onGeluid(aan);
  }

  if (vloer) {
    /* De zin die hij nu zegt (of de laatste als hij klaar is). */
    const huidigeZin = Math.max(0, Math.min(bericht.zinnen.length - 1, (bezig ? tot : zichtbaar.length) - 1));
    /*
      Een gebaar bij elke zin, passend bij de soort zin (23 oktober 2026,
      opdracht eigenaar; lib/bliepo-gebaren.ts). De eerste zin na een goed
      antwoord: duim, klappen of juichen; na een fout: bemoedigend knikken of
      een vuistje (ook bij de laatste zin, de aanmoediging); bij een tip: een
      idee. De andere zinnen: een vraag (open handen) of uitleg (wijzen naar
      de opdracht of iets laten zien).
    */
    const zin = bericht.zinnen[huidigeZin]?.tekst ?? "";
    const laatste = huidigeZin === bericht.zinnen.length - 1 && bericht.zinnen.length > 1;
    const bouw = bericht.id.startsWith("bouw:");
    const soort: Zinsoort =
      bericht.houding === "blij" && huidigeZin === 0
        ? "goed"
        : bericht.houding === "troost" && !bouw && (huidigeZin === 0 || laatste)
          ? "fout"
          : bericht.houding === "denkt" && huidigeZin === 0
            ? "hint"
            : vraagOfUitleg(zin);
    const naam = kiesGebaar(soort, bericht.id, huidigeZin);
    return (
      <BliepoVloer
        naast={
          praten ? (
            <Praatknop
              dicht={!praten.aan}
              onDicht={() => void pratenUit()}
              onderwerp={praten.onderwerp}
              onBegin={() => stopPraten()}
              onAntwoord={zegAntwoord}
            />
          ) : undefined
        }
        gebaar={{ naam, n: `${bericht.id}:${huidigeZin}:${herhaal}`, opStem: true }}
        onNogEens={() => setHerhaal((n) => n + 1)}
        geluid={geluid}
        onGeluid={(aan) => {
          if (!aan) stopPraten();
          onGeluid(aan);
        }}
      >
        {/*
          Tekst boven Bliepo: zijn zinnen onder elkaar, zoals een gesprek
          (26 oktober 2026); de nieuwste leest mee (BliepoZinnen).
        */}
        <BliepoZinnen
          regels={
            regels.length
              ? regels
              : [{ id: `${bericht.id}:${huidigeZin}`, tekst: bericht.zinnen[huidigeZin]?.tekst ?? "", gesproken: spreekbaar(bericht.zinnen[huidigeZin]?.tekst ?? "") }]
          }
        />
      </BliepoVloer>
    );
  }

  return (
    <div className="mt-6 flex items-end gap-2 sm:gap-3" data-maatje="">
      {poppetje === "geen" ? null : poppetje === "tijdelijk" ? (
        <TijdelijkMaatje houding={bericht.houding} praat={bezig} className="h-28 shrink-0 sm:h-36" />
      ) : (
        <VosFiguur houding={pop.houding} beweging={pop.beweging} className="size-16 shrink-0 sm:size-20" />
      )}
      <div
        className="relative min-w-0 flex-1 rounded-2xl border-2 border-rand bg-white px-4 py-3 text-base font-semibold leading-snug text-inkt shadow-op"
        aria-live="polite"
      >
        {/* Het puntje van het wolkje, naar Vos toe. */}
        <span
          aria-hidden="true"
          className="absolute -left-2 bottom-4 size-4 rotate-45 border-b-2 border-l-2 border-rand bg-white"
        />
        <p className="relative">
          {zichtbaar.map((z, i) => (
            <span key={i} className={bezig && i === tot - 1 ? "font-extrabold" : ""}>
              {i > 0 ? " " : ""}
              {z.tekst}
            </span>
          ))}
        </p>
      </div>
      <button
        type="button"
        onClick={wisselGeluid}
        aria-pressed={geluid}
        aria-label={geluid ? `Stem van ${naam} uitzetten` : `Stem van ${naam} aanzetten`}
        title={geluid ? `Stem van ${naam} uit` : `Stem van ${naam} aan`}
        className="grid size-11 shrink-0 place-items-center self-center rounded-full border border-rand bg-white/80 text-inkt-zacht transition hover:text-huisstijl"
      >
        {geluid ? <Luidspreker className="size-6" /> : <LuidsprekerUit className="size-6" />}
      </button>
    </div>
  );
}
