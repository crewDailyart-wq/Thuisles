"use client";

/**
 * Delen om zelf te doen: groepjes maken en eerlijk verdelen.
 *
 * Het kind doet eerst zelf wat er bij delen gebeurt, en ziet daarna pas de som
 * (ONTWERPREGELS.md, "Interactieve oefeningen"). Er staat nooit iets klaar:
 *
 *   groepjes  losse voorwerpen en één lege houder. Een tik op een voorwerp
 *             zet het in de houder; is die vol, dan komt er een nieuwe lege
 *             bij. Nooit alle houders vooraf, want dan verklap je het antwoord.
 *             Een voorwerp in de houder die nog niet vol is, tik je terug.
 *             Meer dan 30 voorwerpen: één tik vult meteen een hele houder.
 *   verdelen  een stapel en de houders. Een tik op een houder laat er één
 *             voorwerp van de stapel naartoe springen; een tik op een voorwerp
 *             legt het terug. Meer dan 30: ook een knop "Iedereen één".
 *
 * Er staat nergens een teller: het kind telt zelf. Het antwoordvakje verschijnt
 * pas als alles in groepjes zit of eerlijk verdeeld is (stap "bouwen"). Bij
 * stap "hulp" staat de kale som er met het vakje, en bouwt het kind alleen als
 * het op Hulp drukt.
 *
 * Elk voorwerp is een knop van minstens 44 bij 44 pixels; tikken werkt met
 * muis en vinger. Het vakje zelf komt uit `Keeropdracht`, zodat typen,
 * nakijken en meeschuiven met het toetsenbord hetzelfde blijven (HARDE REGEL 5).
 */

import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Gegeven } from "@/components/oefenen/Splitsopdracht";
import { DEELWOORDEN, bouwOpdracht, bouwVraag, deelZin } from "@/lib/deelthema";
import type { Deelthema, Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
type Deelfiguur = Extract<Figuur, { soort: "deelsom" }>;

/** Boven dit aantal helpt het scherm: een hele houder per tik, of "Iedereen één". */
const VEEL = 30;

// ---------------------------------------------------------------------------
// Tekeningen: rustig, duidelijk, één kleur per voorwerp
// ---------------------------------------------------------------------------

function Voorwerp({ thema, className = "size-9" }: { thema: Deelthema; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {thema === "appels" && (
        <>
          <path d="M20 12c-3-3-13-3-13 9 0 8 6 14 10 14 2 0 2-1 3-1s1 1 3 1c4 0 10-6 10-14 0-12-10-12-13-9z" fill="var(--color-fout)" />
          <path d="M20 12c0-3 1-6 3-7" stroke="#6b3d1f" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M22 9c3-4 8-4 9-2-2 3-6 4-9 2z" fill="var(--color-groen)" />
          <ellipse cx="13" cy="19" rx="2.4" ry="4" fill="#fff" opacity="0.35" />
        </>
      )}
      {thema === "knikkers" && (
        <>
          <circle cx="20" cy="20" r="14" fill="var(--color-lucht)" />
          <path d="M10 24c6-2 10-10 20-8" stroke="var(--color-geel)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="15" cy="14" r="3.5" fill="#fff" opacity="0.6" />
        </>
      )}
      {thema === "eieren" && (
        <>
          <ellipse cx="20" cy="21" rx="11" ry="14" fill="#fbe8c8" stroke="#b98a4e" strokeWidth="2.2" />
          <ellipse cx="16" cy="15" rx="2.5" ry="4" fill="#fff" />
        </>
      )}
      {thema === "koekjes" && (
        <>
          <circle cx="20" cy="20" r="14" fill="var(--color-amber)" stroke="var(--color-oranje-diep)" strokeWidth="2" />
          <circle cx="15" cy="15" r="2.2" fill="#6b3d1f" />
          <circle cx="25" cy="17" r="2.2" fill="#6b3d1f" />
          <circle cx="18" cy="26" r="2.2" fill="#6b3d1f" />
          <circle cx="26" cy="25" r="1.8" fill="#6b3d1f" />
        </>
      )}
      {thema === "snoepjes" && (
        <>
          <path d="M4 13l8 7-8 7zM36 13l-8 7 8 7z" fill="var(--color-roze)" />
          <circle cx="20" cy="20" r="9" fill="var(--color-roze)" />
          <path d="M15 16c3-2 7-2 10 1" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {thema === "visjes" && (
        <>
          <path d="M6 20c5-9 17-10 24 0-7 10-19 9-24 0z" fill="var(--color-huisstijl)" />
          <path d="M28 20l8-7v14z" fill="var(--color-huisstijl)" />
          <circle cx="12" cy="18" r="2" fill="var(--color-inkt)" />
        </>
      )}
    </svg>
  );
}

/** Een volle houder, klein: alleen om te tellen, niet meer om aan te tikken. */
function VolleHouder({ thema, inhoud }: { thema: Deelthema; inhoud: number }) {
  const kolommen = thema === "eieren" ? Math.ceil(inhoud / 2) : Math.min(inhoud, 5);
  const voorwerpen = (
    <span className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${kolommen}, 0.9rem)` }}>
      {Array.from({ length: inhoud }, (_, i) => (
        <Voorwerp key={i} thema={thema} className="size-[0.9rem]" />
      ))}
    </span>
  );
  const vorm =
    thema === "appels"
      ? "rounded-b-3xl rounded-t-md border-2 border-amber bg-amber-zacht px-2 pb-2 pt-3"
      : thema === "knikkers"
        ? "rounded-2xl border-2 border-lucht bg-lucht-zacht px-2 pb-2 pt-2 border-t-8"
        : "rounded-xl border-2 border-geel bg-geel-zacht p-1.5";
  return (
    <span className={`motion-safe:animate-teller-pop inline-flex items-center justify-center ${vorm}`}>
      {voorwerpen}
    </span>
  );
}

/** De houders bij verdelen: een bordje, een kind of een kom. */
function Houdertekening({ thema, nummer }: { thema: Deelthema; nummer: number }) {
  const shirt = ["var(--color-lucht)", "var(--color-groen)", "var(--color-viool)", "var(--color-roze)", "var(--color-huisstijl)"][
    nummer % 5
  ];
  return (
    <svg viewBox="0 0 80 48" className="h-16 w-[6.5rem]" aria-hidden="true">
      {thema === "koekjes" && (
        <>
          <ellipse cx="40" cy="30" rx="36" ry="14" fill="#fff" stroke="var(--color-tabellijn)" strokeWidth="2.5" />
          <ellipse cx="40" cy="30" rx="24" ry="8" fill="none" stroke="var(--color-rand)" strokeWidth="2" />
        </>
      )}
      {thema === "snoepjes" && (
        <>
          <circle cx="40" cy="13" r="10" fill="#f6d2b8" />
          <path d="M31 9c3-6 15-6 18 0" fill="#6b3d1f" />
          <circle cx="36.5" cy="14" r="1.4" fill="var(--color-inkt)" />
          <circle cx="43.5" cy="14" r="1.4" fill="var(--color-inkt)" />
          <path d="M37 18c2 1.5 4 1.5 6 0" stroke="var(--color-inkt)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M26 48c0-14 6-21 14-21s14 7 14 21z" fill={shirt} />
        </>
      )}
      {thema === "visjes" && (
        <>
          <path d="M8 14h64c0 20-12 32-32 32S8 34 8 14z" fill="var(--color-lucht-zacht)" stroke="var(--color-lucht)" strokeWidth="2.5" />
          <path d="M12 22c9 3 19-3 28 0s19 3 28 0" stroke="var(--color-lucht)" strokeWidth="1.5" fill="none" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

/** Knop met een voorwerp erin: minstens 44 bij 44, ook op een tablet. */
function Voorwerpknop({
  thema,
  label,
  uit,
  nieuw = false,
  onTik,
}: {
  thema: Deelthema;
  label: string;
  uit: boolean;
  nieuw?: boolean;
  onTik: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={uit}
      onClick={onTik}
      className={`grid size-11 touch-manipulation place-items-center rounded-xl transition-transform enabled:hover:scale-110 enabled:active:scale-95 disabled:cursor-default ${
        nieuw ? "motion-safe:animate-teller-pop" : ""
      }`}
    >
      <Voorwerp thema={thema} />
    </button>
  );
}

/** Rijtjes van vijf, met ruimte tussen de rijtjes: zo is het te tellen. */
function InRijtjes({ children }: { children: ReactNode[] }) {
  const rijtjes: ReactNode[][] = [];
  children.forEach((kind, i) => {
    if (i % 5 === 0) rijtjes.push([]);
    rijtjes[rijtjes.length - 1].push(kind);
  });
  return (
    <div className="flex max-w-[34rem] flex-wrap justify-center gap-x-4 gap-y-1">
      {rijtjes.map((rij, i) => (
        <div key={i} className="flex">
          {rij}
        </div>
      ))}
    </div>
  );
}

function Knop({ children, onClick, uit }: { children: ReactNode; onClick: () => void; uit: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={uit}
      className="min-h-11 rounded-2xl border-2 border-huisstijl bg-kaart px-4 text-lg font-extrabold text-huisstijl transition enabled:hover:bg-huisstijl-zacht disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Groepjes maken
// ---------------------------------------------------------------------------

function Groepjes({
  figuur,
  thema,
  uit,
  geplaatst,
  zet,
}: {
  figuur: Deelfiguur;
  thema: Deelthema;
  uit: boolean;
  geplaatst: number;
  zet: Dispatch<SetStateAction<number>>;
}) {
  const { geheel, deler } = figuur;
  const woorden = DEELWOORDEN[thema];
  const vol = Math.floor(geplaatst / deler);
  const inHouder = geplaatst % deler;
  const los = geheel - geplaatst;
  const veel = geheel > VEEL;

  /* Een tik op een los voorwerp: één erbij, of bij veel meteen de hele houder. */
  /* Met de stand van dat moment, zodat ook snel achter elkaar tikken telt. */
  const pak = () =>
    zet((p) => Math.min(geheel, veel ? (Math.floor(p / deler) + 1) * deler : p + 1));
  const terug = () => zet((p) => (p % deler > 0 ? p - 1 : p));

  const kolommen = thema === "eieren" ? Math.ceil(deler / 2) : Math.min(deler, 5);
  const huidigeVorm =
    thema === "appels"
      ? "rounded-b-[2rem] rounded-t-lg border-2 border-amber bg-amber-zacht px-3 pb-4 pt-5"
      : thema === "knikkers"
        ? "rounded-3xl border-2 border-t-[10px] border-lucht bg-lucht-zacht p-3"
        : "rounded-2xl border-2 border-geel bg-geel-zacht p-2";

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* De houders: de volle klein, de huidige groot en open. */}
      <div className="flex flex-wrap items-end justify-center gap-3">
        {Array.from({ length: vol }, (_, i) => (
          <VolleHouder key={i} thema={thema} inhoud={deler} />
        ))}
        {los > 0 && (
          <div
            aria-label={`Een ${woorden.houder} dat je vult`}
            className={`grid gap-1 ${huidigeVorm}`}
            style={{ gridTemplateColumns: `repeat(${kolommen}, 2.75rem)` }}
          >
            {Array.from({ length: deler }, (_, i) =>
              i < inHouder ? (
                <Voorwerpknop
                  key={`${vol}-${i}`}
                  thema={thema}
                  label={`Haal een ${woorden.voorwerp} terug`}
                  uit={uit}
                  nieuw
                  onTik={terug}
                />
              ) : (
                <span
                  key={`${vol}-${i}`}
                  className={`size-11 border-2 border-dashed ${
                    thema === "eieren" ? "rounded-full border-geel" : "rounded-xl border-rand"
                  } bg-kaart/60`}
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* De losse voorwerpen, in rijtjes van vijf. */}
      {los > 0 && (
        <InRijtjes>
          {Array.from({ length: los }, (_, i) => (
            <Voorwerpknop
              key={i}
              thema={thema}
              label={veel ? `Vul een ${woorden.houder}` : `Doe een ${woorden.voorwerp} in het ${woorden.houder}`}
              uit={uit}
              onTik={pak}
            />
          ))}
        </InRijtjes>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Eerlijk verdelen
// ---------------------------------------------------------------------------

function Verdelen({
  figuur,
  thema,
  uit,
  verdeling,
  zet,
}: {
  figuur: Deelfiguur;
  thema: Deelthema;
  uit: boolean;
  verdeling: number[];
  zet: Dispatch<SetStateAction<number[]>>;
}) {
  const { geheel } = figuur;
  const woorden = DEELWOORDEN[thema];
  const verdeeld = verdeling.reduce((n, x) => n + x, 0);
  const stapel = geheel - verdeeld;

  const geef = (i: number) =>
    zet((v) => (v.reduce((n, x) => n + x, 0) >= geheel ? v : v.map((n, j) => (j === i ? n + 1 : n))));
  const terug = (i: number) => zet((v) => v.map((n, j) => (j === i && n > 0 ? n - 1 : n)));

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* De stapel: klein en dicht op elkaar; je tikt niet hierop maar op een houder. */}
      <div
        aria-label={stapel > 0 ? `De stapel ${woorden.voorwerpen}` : "De stapel is leeg"}
        className="flex min-h-12 max-w-[22rem] flex-wrap items-center justify-center gap-0.5 rounded-2xl border-2 border-dashed border-rand px-3 py-2"
      >
        {Array.from({ length: stapel }, (_, i) => (
          <Voorwerp key={i} thema={thema} className="size-6" />
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-center gap-3">
        {verdeling.map((aantal, i) => (
          <div key={i} className="flex flex-col items-center gap-1 rounded-2xl bg-room/60 p-2">
            <div className="grid min-h-11 grid-cols-[repeat(3,2.75rem)] justify-center gap-0.5">
              {Array.from({ length: aantal }, (_, j) => (
                <Voorwerpknop
                  key={j}
                  thema={thema}
                  label={`Leg een ${woorden.voorwerp} terug op de stapel`}
                  uit={uit}
                  nieuw
                  onTik={() => terug(i)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label={`Geef ${thema === "visjes" ? "kom" : woorden.houder} ${i + 1} een ${woorden.voorwerp}`}
              disabled={uit}
              onClick={() => geef(i)}
              className="grid min-h-11 touch-manipulation place-items-center rounded-xl px-1 transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-default"
            >
              <Houdertekening thema={thema} nummer={i} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Het geheel
// ---------------------------------------------------------------------------

export function Deelbouwer({
  figuur,
  fase,
  vakje,
  onOpnieuw,
  onKlaar,
  onGezien,
}: {
  figuur: Deelfiguur;
  fase: Fase;
  /** Het invulvak uit `Keeropdracht`. */
  vakje: ReactNode;
  /** Ook het getypte antwoord weer leeg. */
  onOpnieuw: () => void;
  /** Alles gebouwd: het vakje is er nu, en mag de aandacht krijgen. */
  onKlaar: () => void;
  /** Na een goed antwoord: de deelsom heeft even gestaan, het feest mag komen. */
  onGezien?: () => void;
}) {
  const uit = fase !== "bezig";
  const bouw = figuur.bouw ?? "groepjes";
  const thema: Deelthema = figuur.thema ?? (bouw === "groepjes" ? "appels" : "koekjes");
  const hulpstap = figuur.stap === "hulp";

  const leeg = () => Array.from({ length: figuur.deler }, () => 0);
  const [geplaatst, setGeplaatst] = useState(0);
  const [verdeling, setVerdeling] = useState<number[]>(leeg);
  const [hulpOpen, setHulpOpen] = useState(false);

  function opnieuw() {
    setGeplaatst(0);
    setVerdeling(leeg());
    onOpnieuw();
  }

  /* Na nakijken en opnieuw proberen: weer van voren af aan. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setGeplaatst(0);
      setVerdeling(leeg());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  /* Na een goed antwoord blijft de deelsom even staan; daarna pas het feest. */
  useEffect(() => {
    if (fase !== "goed" || hulpstap) return;
    const klokje = window.setTimeout(() => onGezien?.(), 2400);
    return () => window.clearTimeout(klokje);
  }, [fase, hulpstap, onGezien]);

  const verdeeld = verdeling.reduce((n, x) => n + x, 0);
  const stapelLeeg = verdeeld === figuur.geheel;
  const evenveel = verdeling.every((n) => n === verdeling[0]);
  const klaar = bouw === "groepjes" ? geplaatst === figuur.geheel : stapelLeeg && evenveel;

  /* Zodra het vakje verschijnt, mag de cursor erin. */
  const wasGebouwd = useRef(klaar);
  useEffect(() => {
    if (klaar && !wasGebouwd.current && !hulpstap) onKlaar();
    wasGebouwd.current = klaar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klaar]);

  const bouwer =
    bouw === "groepjes" ? (
      <Groepjes figuur={figuur} thema={thema} uit={uit} geplaatst={geplaatst} zet={setGeplaatst} />
    ) : (
      <Verdelen figuur={figuur} thema={thema} uit={uit} verdeling={verdeling} zet={setVerdeling} />
    );

  const knoppen = !uit && (
    <div className="flex flex-wrap justify-center gap-3">
      {bouw === "verdelen" && figuur.geheel > VEEL && (
        <Knop
          uit={figuur.geheel - verdeeld <= 0}
          onClick={() =>
            setVerdeling((v) => {
              let over = figuur.geheel - v.reduce((n, x) => n + x, 0);
              return v.map((n) => {
                if (over <= 0) return n;
                over--;
                return n + 1;
              });
            })
          }
        >
          Iedereen één
        </Knop>
      )}
      <Knop uit={false} onClick={opnieuw}>
        Opnieuw
      </Knop>
    </div>
  );

  const deelteken = (
    <span aria-hidden="true" className="text-4xl font-extrabold text-huisstijl sm:text-5xl">
      :
    </span>
  );
  const isteken = (
    <span aria-hidden="true" className="text-4xl font-extrabold text-inkt-zacht sm:text-5xl">
      =
    </span>
  );

  /*
    Na een fout antwoord het goede antwoord in gewone woorden: "Het zijn 7
    zakjes van 5, want 35 : 5 = 7." Bij groep 3 en 4 laat het oefenscherm zelf
    alleen het getal zien, dus staat de zin hier.
  */
  const uitleg = fase === "fout" && (
    <p className="rounded-2xl bg-lucht-zacht px-4 py-3 text-center text-lg font-extrabold text-lucht">
      {deelZin(figuur.geheel, figuur.deler, bouw, thema, !hulpstap)}
    </p>
  );

  /* De kale som met een knop Hulp. */
  if (hulpstap) {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          <Gegeven waarde={figuur.geheel} maat="groot" breed />
          {deelteken}
          <Gegeven waarde={figuur.deler} maat="groot" />
          {isteken}
          {vakje}
        </div>
        {!hulpOpen ? (
          !uit && (
            <Knop uit={false} onClick={() => setHulpOpen(true)}>
              Hulp
            </Knop>
          )
        ) : (
          <>
            <p className="text-center text-xl font-extrabold text-inkt">
              {bouwOpdracht(bouw, figuur.deler, thema)}
            </p>
            {bouwer}
            {bouw === "verdelen" && stapelLeeg && !evenveel && (
              <p className="text-center text-xl font-extrabold text-huisstijl-diep">Kijk goed: heeft iedereen evenveel?</p>
            )}
            {knoppen}
          </>
        )}
        {uitleg}
      </div>
    );
  }

  /* Eerst bouwen, dan de vraag en het vakje, en na een goed antwoord de som. */
  return (
    <div className="flex w-full flex-col items-center gap-5">
      {bouwer}
      {bouw === "verdelen" && stapelLeeg && !evenveel && (
        <p className="text-center text-xl font-extrabold text-huisstijl-diep">Kijk goed: heeft iedereen evenveel?</p>
      )}
      {knoppen}
      {klaar && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="text-center text-2xl font-extrabold text-inkt">{bouwVraag(thema)}</p>
          {vakje}
        </div>
      )}
      {uitleg}
      {klaar && fase === "goed" && (
        <div className="flex flex-wrap items-center justify-center gap-3" aria-label="De deelsom">
          <Gegeven waarde={figuur.geheel} maat="groot" breed />
          {deelteken}
          <Gegeven waarde={figuur.deler} maat="groot" />
          {isteken}
          <Gegeven waarde={figuur.geheel / figuur.deler} maat="groot" />
        </div>
      )}
    </div>
  );
}
