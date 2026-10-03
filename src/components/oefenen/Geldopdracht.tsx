"use client";

/**
 * Het scherm van de opdrachten in het domein Geld.
 *
 * Eén component voor alle zestien figuren, net als `Tijdopdracht`:
 *
 *   geldkiezen       tik op het geldstuk dat het meest of minst waard is
 *   geldvolgorde     sleep vier geldstukken van weinig naar veel
 *   geldtellen       tel het geld en typ het bedrag
 *   geldleggen       leg zelf een bedrag door op munten te tikken
 *   muntenofeuros    ▢ munten en ▢ euro
 *   geldgroepen      tik op het goede vakje met geld
 *   welkegroepjes    tik de twee groepjes aan die kloppen
 *   evenveel         3 × 20 cent = ▢ × 10 cent
 *   geldontbreekt    welke munt ontbreekt, of hoeveel
 *   geldsom          twee groepjes met + of −
 *   geldverhaal      wisselgeld, wat blijft er over, wat kostte het
 *   kunjebetalen     per zin Ja of Nee
 *   bonnetje         het totaal, of de prijs die kwijt is
 *   geldafronden     afronden op hele en halve euro's
 *   geldschatten     samen ongeveer, of wat houd je over
 *   geldkorting      hoeveel korting, of de prijs na korting
 *   geldnotatie      een bedrag goed opschrijven, in één invoerveld
 *
 * ---------------------------------------------------------------------------
 * Een bedrag typen
 * ---------------------------------------------------------------------------
 * Twee echte invoervelden: € ▢ , ▢ — euro's en het stuk na de komma. Allebei
 * alleen cijfers, met het toetsenbord van het apparaat (HARDE REGEL 5). Typt
 * een kind op de laptop een komma of punt in het eerste vakje, dan springt de
 * cursor naar het tweede: zo werkt "41,50" en "41.50" gewoon. Een leeg tweede
 * vakje is nul centen, dus 26, 26,00 en 26,- zijn allemaal goed (WERKPLAN.md).
 *
 * Wat er doorgegeven wordt is altijd "euro's,centen" met twee cijfers centen:
 * precies wat de generator als antwoord opslaat. Zie `antwoordVan`.
 */

import { useEffect, useRef, useState } from "react";
import { Keuzeknoppen } from "@/components/oefenen/Tijdopdracht";
import { Sleepkaartjes } from "@/components/oefenen/Sleepkaartjes";
import { Geldgroep, Geldstuk, Prijskaartje } from "@/components/oefenen/Geld";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import {
  antwoordVan,
  bedrag,
  bedragKassa,
  leesBedragvakjes,
  leesEuroCent,
  naamVan,
  totaal,
} from "@/lib/geld";
import { isGeldfiguur, juistAntwoord, leesGeldnotatie, type Geldfiguur } from "@/lib/geldfiguren";

export type { Geldfiguur };
export { isGeldfiguur, juistAntwoord };

type Fase = "bezig" | "goed" | "fout";
type Uitslag = "goed" | "fout" | null;

/** Wat voor invoer er bij een figuur hoort: per veld wat erin komt. */
type Veldsoort = "bedrag" | "eurocent" | "euro" | "getal";

/**
 * De velden van deze figuur, of null bij een keuze, slepen, tikken of leggen.
 *
 * Elk bedrag is één veld van twee vakjes; een getal is één vakje.
 */
function veldenVan(figuur: Geldfiguur): Veldsoort[] | null {
  switch (figuur.soort) {
    case "geldtellen":
      return [figuur.invoer];
    case "geldsom":
      return [figuur.invoer];
    case "muntenofeuros":
      return ["getal", "getal"];
    case "evenveel":
      return ["getal"];
    case "geldontbreekt":
    case "geldverhaal":
    case "geldafronden":
    case "geldkorting":
      return figuur.keuzes ? null : ["bedrag"];
    case "bonnetje":
      return ["bedrag"];
    case "geldschatten":
      if (figuur.keuzes) return null;
      return figuur.stand === "samenstap" ? ["bedrag", "bedrag", "bedrag"] : ["bedrag"];
    default:
      return null;
  }
}

/** Hoeveel vakjes een veld heeft. */
const VAKJES: Record<Veldsoort, number> = { bedrag: 2, eurocent: 2, euro: 1, getal: 1 };

/** Wat er in één veld staat, als tekst zoals het antwoord hem verwacht, of null. */
function leesVeld(soort: Veldsoort, vakjes: string[]): string | null {
  if (soort === "getal") return vakjes[0] === "" ? null : String(Number(vakjes[0]));
  const cent =
    soort === "bedrag"
      ? leesBedragvakjes(vakjes[0], vakjes[1] ?? "")
      : soort === "eurocent"
        ? leesEuroCent(vakjes[0], vakjes[1] ?? "")
        : leesBedragvakjes(vakjes[0], "");
  return cent === null ? null : antwoordVan(cent);
}

/** Het juiste antwoord per veld: een bedrag neemt twee stukken ("26,00"), een getal één. */
function juistPerVeld(velden: Veldsoort[], juist: string): string[] {
  const delen = juist.split(",");
  const uit: string[] = [];
  let i = 0;
  for (const v of velden) {
    if (v === "getal") {
      uit.push(delen[i] ?? "");
      i += 1;
    } else {
      uit.push(`${delen[i] ?? ""},${delen[i + 1] ?? ""}`);
      i += 2;
    }
  }
  return uit;
}

// ---------------------------------------------------------------------------
// Onderdelen
// ---------------------------------------------------------------------------

/** Een geldvakje: alleen cijfers, en bij een komma of punt door naar het volgende vakje. */
function Geldvak({
  waarde,
  uitslag,
  label,
  uit,
  breed = false,
  veldRef,
  onTyp,
  onKomma,
  onBevestig,
}: {
  waarde: string;
  uitslag: Uitslag;
  label: string;
  uit: boolean;
  breed?: boolean;
  veldRef?: (el: HTMLInputElement | null) => void;
  onTyp: (tekst: string) => void;
  onKomma?: (naKomma: string) => void;
  onBevestig: () => void;
}) {
  const { bijAandacht, bijWeggaan } = useInBeeld();
  const kleur =
    uitslag === "goed"
      ? "border-groen bg-groen-zacht text-groen-diep"
      : uitslag === "fout"
        ? "border-roze bg-roze-zacht text-roze"
        : "border-rand bg-kaart text-inkt focus-within:border-huisstijl";
  return (
    <span
      className={`grid h-16 place-items-center rounded-2xl border-2 text-2xl font-extrabold tabular-nums ${
        breed ? "w-20" : "w-16"
      } ${kleur}`}
    >
      <input
        ref={veldRef}
        type="text"
        aria-label={label}
        value={waarde}
        placeholder={uitslag === null ? "?" : undefined}
        readOnly={uit}
        disabled={uit}
        autoComplete="off"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        maxLength={breed ? 5 : 3}
        onFocus={(e) => bijAandacht(e.currentTarget)}
        onBlur={bijWeggaan}
        onChange={(e) => {
          const ruw = e.target.value;
          const komma = ruw.search(/[,.]/);
          if (komma >= 0 && onKomma) {
            onTyp(ruw.slice(0, komma).replace(/\D/g, "").slice(0, 3));
            onKomma(ruw.slice(komma + 1).replace(/\D/g, "").slice(0, 2));
            return;
          }
          onTyp(ruw.replace(/\D/g, "").slice(0, 3));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onBevestig();
          }
        }}
        className="size-full rounded-[inherit] bg-transparent text-center outline-none placeholder:text-rand"
      />
    </span>
  );
}

/** Een rij knoppen met een geldstuk erop, om er één te kiezen. */
function Geldkeuze({
  stukken,
  gekozen,
  juist,
  uit,
  onKies,
}: {
  stukken: number[];
  gekozen: number | null;
  juist: number;
  uit: boolean;
  onKies: (nummer: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-3">
      {stukken.map((s, i) => {
        const isGekozen = gekozen === i;
        const kleur = !uit
          ? isGekozen
            ? "border-huisstijl bg-huisstijl-zacht"
            : "border-rand bg-kaart hover:border-huisstijl/50"
          : i === juist
            ? "border-groen bg-groen-zacht"
            : isGekozen
              ? "border-roze bg-roze-zacht"
              : "border-rand bg-kaart opacity-60";
        return (
          <button
            key={i}
            type="button"
            disabled={uit}
            aria-pressed={isGekozen}
            aria-label={naamVan(s)}
            onClick={() => onKies(i)}
            className={`grid min-h-20 min-w-20 place-items-center rounded-2xl border-2 p-2 transition disabled:cursor-not-allowed ${kleur}`}
          >
            <Geldstuk cent={s} />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Vakjes met geld om aan te tikken, met een letter erboven.
 *
 * Onder elkaar zolang het smal is, twee naast elkaar als er plek is. Elk vakje
 * is een eigen kaart, zodat nooit onduidelijk is welke munt bij welk vakje
 * hoort.
 */
function Groepkeuze({
  groepen,
  gekozen,
  juist,
  uit,
  onTik,
  letters = true,
}: {
  groepen: number[][];
  gekozen: number[];
  juist: number[];
  uit: boolean;
  onTik: (nummer: number) => void;
  /** Zonder letters (Geld wisselen): het kind tikt op het kaartje zelf. */
  letters?: boolean;
}) {
  return (
    <div className="@container w-full">
      <div className="grid w-full gap-3 @md:grid-cols-2">
        {groepen.map((g, i) => {
          const isGekozen = gekozen.includes(i);
          const kleur = !uit
            ? isGekozen
              ? "border-huisstijl bg-huisstijl-zacht"
              : "border-rand bg-kaart hover:border-huisstijl/50"
            : juist.includes(i)
              ? "border-groen bg-groen-zacht"
              : isGekozen
                ? "border-roze bg-roze-zacht"
                : "border-rand bg-kaart opacity-60";
          const letter = String.fromCharCode(65 + i);
          return (
            <button
              key={i}
              type="button"
              disabled={uit}
              aria-pressed={isGekozen}
              aria-label={letters ? `Vakje ${letter}` : `Kaartje ${i + 1}`}
              onClick={() => onTik(i)}
              className={`flex min-h-20 items-center gap-3 rounded-2xl border-2 p-3 text-left transition disabled:cursor-not-allowed ${kleur}`}
            >
              {letters && (
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-inkt/10 text-base font-extrabold text-inkt">
                  {letter}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <Geldgroep stukken={g} maat="klein" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Het ene invoerveld van Geldnotatie: € ▢▢▢▢ — het kind typt zelf de komma.
 *
 * Bij hele euro's staat ",-" er al achter en komen er alleen cijfers in. Met
 * centen mag er een komma in; een punt is niet fout maar geeft de hint
 * "Gebruik een komma", en zolang die er staat blijft Controleer uit. Zo telt
 * het niet als fout en probeert het kind het gewoon opnieuw (WERKPLAN.md).
 *
 * Met centen is het toetsenbord `decimal`: cijfers plus het decimaalteken
 * (een komma op een Nederlands apparaat). Bij hele euro's `numeric` met het
 * patroon voor oudere iPads, zoals HARDE REGEL 5 voorschrijft.
 */
function Notatieveld({
  heel,
  juist,
  fase,
  metCursor,
  onWijzig,
  onBevestig,
}: {
  heel: boolean;
  juist: number;
  fase: Fase;
  metCursor: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";
  const [waarde, setWaarde] = useState("");
  const veld = useRef<HTMLInputElement | null>(null);
  const { bijAandacht, bijWeggaan } = useInBeeld();

  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") setWaarde("");
  }, [fase]);

  useEffect(() => {
    if (metCursor && fase === "bezig") veld.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  const gelezen = heel ? (waarde === "" ? null : Number(waarde) * 100) : leesGeldnotatie(waarde);
  const punt = gelezen === "punt";
  const uitslag: Uitslag = !uit ? null : gelezen === juist ? "goed" : "fout";
  const kleur =
    uitslag === "goed"
      ? "border-groen bg-groen-zacht text-groen-diep"
      : uitslag === "fout"
        ? "border-roze bg-roze-zacht text-roze"
        : "border-rand bg-kaart text-inkt focus-within:border-huisstijl";

  function typ(ruw: string) {
    if (uit) return;
    const schoon = heel ? ruw.replace(/\D/g, "").slice(0, 3) : ruw.replace(/[^\d,.\-]/g, "").slice(0, 6);
    setWaarde(schoon);
    const g = heel ? (schoon === "" ? null : Number(schoon) * 100) : leesGeldnotatie(schoon);
    onWijzig(typeof g === "number" ? antwoordVan(g) : "");
  }

  const tekst = "text-2xl font-extrabold text-inkt-zacht";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Het bedrag">
        <span className={tekst}>€</span>
        <span className={`grid h-16 place-items-center rounded-2xl border-2 text-2xl font-extrabold tabular-nums ${heel ? "w-24" : "w-32"} ${kleur}`}>
          <input
            ref={veld}
            type="text"
            aria-label={heel ? "Het bedrag: hoeveel euro" : "Het bedrag, met een komma"}
            aria-describedby={punt ? "geldnotatie-hint" : undefined}
            value={waarde}
            placeholder={uitslag === null ? "?" : undefined}
            readOnly={uit}
            disabled={uit}
            autoComplete="off"
            inputMode={heel ? "numeric" : "decimal"}
            pattern={heel ? "[0-9]*" : undefined}
            enterKeyHint="done"
            maxLength={heel ? 3 : 6}
            onFocus={(e) => bijAandacht(e.currentTarget)}
            onBlur={bijWeggaan}
            onChange={(e) => typ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onBevestig();
              }
            }}
            className="size-full rounded-[inherit] bg-transparent text-center outline-none placeholder:text-rand"
          />
        </span>
        {heel && <span className={tekst}>,-</span>}
      </div>
      {punt && !uit && (
        <p id="geldnotatie-hint" role="status" className="text-base font-extrabold text-huisstijl">
          Gebruik een komma.
        </p>
      )}
      {uit && fase !== "goed" && (
        <p className="text-base font-extrabold text-groen-diep">Het goede antwoord is {bedrag(juist)}.</p>
      )}
    </div>
  );
}

/** Een plus of min tussen twee groepjes, groot genoeg om niet te missen. */
function Teken({ teken }: { teken: string }) {
  return (
    <span aria-hidden="true" className="text-3xl font-extrabold leading-none text-huisstijl">
      {teken === "-" ? "−" : teken}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Het scherm zelf
// ---------------------------------------------------------------------------

export function Geldopdracht({
  figuur,
  antwoord,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
}: {
  figuur: Geldfiguur;
  antwoord: string;
  fase: Fase;
  metCursor?: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";
  const juist = juistAntwoord(figuur);
  const velden = veldenVan(figuur);
  const aantalVakjes = velden ? velden.reduce((s, v) => s + VAKJES[v], 0) : 0;

  const [vakjes, setVakjes] = useState<string[]>(() => Array.from({ length: aantalVakjes }, () => ""));
  /** Bij keuzes, slepen en tikken: wat er gekozen is, als lijst nummers. */
  const [gekozen, setGekozen] = useState<number[]>(() =>
    velden === null && antwoord !== "" && figuur.soort !== "geldleggen"
      ? antwoord.split(",").map(Number)
      : [],
  );
  /** Bij leggen: de munten en briefjes die er liggen. */
  const [gelegd, setGelegd] = useState<number[]>([]);
  /*
    Wat er ligt, ook meteen na een tik. Tikt een kind heel snel twee keer, dan
    is de tweede tik er al voordat het scherm opnieuw getekend is; zonder dit
    zou die tweede munt verdwijnen.
  */
  const gelegdNu = useRef<number[]>([]);
  const invoer = useRef<(HTMLInputElement | null)[]>([]);

  /* Opnieuw beginnen: alleen bij de overgang van nagekeken terug naar bezig. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setVakjes(Array.from({ length: aantalVakjes }, () => ""));
      setGekozen([]);
      setGelegd([]);
      gelegdNu.current = [];
    }
  }, [fase, aantalVakjes]);

  /* Bij een nieuwe vraag staat de cursor meteen in het eerste vakje. */
  useEffect(() => {
    if (!metCursor || fase !== "bezig") return;
    invoer.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  // -------------------------------------------------------------------------
  // Typen
  // -------------------------------------------------------------------------

  /** Begin van elk veld in de rij vakjes. */
  const begin: number[] = [];
  if (velden) velden.reduce((s, v, i) => ((begin[i] = s), s + VAKJES[v]), 0);

  const perVeld = velden
    ? velden.map((v, i) => leesVeld(v, vakjes.slice(begin[i], begin[i] + VAKJES[v])))
    : [];
  const juistVeld = velden ? juistPerVeld(velden, juist) : [];
  const veldUitslag = (i: number): Uitslag =>
    !uit ? null : perVeld[i] === juistVeld[i] ? "goed" : "fout";

  function meldVakjes(nieuw: string[]) {
    setVakjes(nieuw);
    if (!velden) return;
    const gelezen = velden.map((v, i) => leesVeld(v, nieuw.slice(begin[i], begin[i] + VAKJES[v])));
    onWijzig(gelezen.every((g) => g !== null) ? gelezen.join(",") : "");
  }

  function typ(nummer: number, waarde: string) {
    if (uit) return;
    const nieuw = [...vakjes];
    nieuw[nummer] = waarde;
    meldVakjes(nieuw);
  }

  /** Een komma in het euro-vakje: de rest gaat naar het vakje erna, met de cursor erbij. */
  function komma(nummer: number, voor: string, na: string) {
    if (uit) return;
    const nieuw = [...vakjes];
    nieuw[nummer] = voor;
    nieuw[nummer + 1] = na;
    meldVakjes(nieuw);
    invoer.current[nummer + 1]?.focus();
  }

  /** Eén vakje met alles erom. */
  function vak(nummer: number, label: string, uitslag: Uitslag, opties: { komma?: boolean; breed?: boolean } = {}) {
    return (
      <Geldvak
        waarde={vakjes[nummer] ?? ""}
        uitslag={uitslag}
        label={label}
        uit={uit}
        breed={opties.breed}
        veldRef={(el) => {
          invoer.current[nummer] = el;
        }}
        onTyp={(w) => typ(nummer, w)}
        onKomma={opties.komma ? (na) => komma(nummer, vakjes[nummer] ?? "", na) : undefined}
        onBevestig={onBevestig}
      />
    );
  }

  /** Eén veld: een bedrag, euro en cent, alleen euro's, of een getal. */
  function veld(i: number, label = "Het bedrag") {
    if (!velden) return null;
    const soort = velden[i];
    const b = begin[i];
    const uitslag = veldUitslag(i);
    const tekst = "text-2xl font-extrabold text-inkt-zacht";

    if (soort === "bedrag") {
      return (
        <div className="flex items-center justify-center gap-1.5" role="group" aria-label={label}>
          <span className={tekst}>€</span>
          {vak(b, `${label}: hoeveel euro`, uitslag, { komma: true })}
          <span className={`${tekst} w-2 text-center`}>,</span>
          {vak(b + 1, `${label}: het stuk na de komma`, uitslag)}
        </div>
      );
    }
    if (soort === "eurocent") {
      return (
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label={label}>
          {vak(b, `${label}: hoeveel euro`, uitslag)}
          <span className="text-base font-extrabold text-inkt-zacht">euro</span>
          {vak(b + 1, `${label}: hoeveel cent`, uitslag)}
          <span className="text-base font-extrabold text-inkt-zacht">cent</span>
        </div>
      );
    }
    if (soort === "euro") {
      return (
        <div className="flex items-center justify-center gap-2" role="group" aria-label={label}>
          {vak(b, `${label}: hoeveel euro`, uitslag)}
          <span className="text-base font-extrabold text-inkt-zacht">euro</span>
        </div>
      );
    }
    return vak(b, label, uitslag);
  }

  /** Onder het invullen: zo hoorde het, als het fout was. */
  function goedeBedrag(cent: number) {
    if (!uit || fase === "goed") return null;
    return <p className="text-base font-extrabold text-groen-diep">Het goede antwoord is {bedrag(cent)}.</p>;
  }

  // -------------------------------------------------------------------------
  // Kiezen
  // -------------------------------------------------------------------------

  function kies(nummer: number) {
    if (uit) return;
    setGekozen([nummer]);
    onWijzig(String(nummer));
  }

  const eenKeuze = gekozen.length ? gekozen[0] : null;

  /** Vier of drie bedragen als knoppen. */
  function bedragknoppen(keuzes: number[], goed: number) {
    return (
      <Keuzeknoppen keuzes={keuzes.map(bedrag)} gekozen={eenKeuze} juist={goed} uit={uit} onKies={kies} />
    );
  }

  const kolom = "flex w-full flex-col items-center gap-5";

  // -------------------------------------------------------------------------
  // Per figuur
  // -------------------------------------------------------------------------

  switch (figuur.soort) {
    case "geldkiezen":
      return (
        <div className={kolom}>
          <Geldkeuze stukken={figuur.stukken} gekozen={eenKeuze} juist={figuur.goed} uit={uit} onKies={kies} />
        </div>
      );

    case "geldvolgorde":
      return (
        <Sleepkaartjes
          regels={figuur.stukken.map((_, i) => (
            <span key={i} className="text-base font-extrabold text-inkt">
              {i + 1}e
            </span>
          ))}
          keuzes={figuur.stukken.map((s, i) => (
            <Geldstuk key={i} cent={s} maat="klein" />
          ))}
          keuzeLabels={figuur.stukken.map(naamVan)}
          fase={fase}
          uit={uit}
          uitslagen={juist.split(",").map((j, i) => (!uit ? null : String(gekozen[i]) === j ? "goed" : "fout"))}
          goedeKeuzes={juist.split(",").map(Number)}
          onWijzig={(waarde) => {
            setGekozen(waarde === "" ? [] : waarde.split(",").map(Number));
            onWijzig(waarde);
          }}
        />
      );

    case "geldtellen":
      return (
        <div className={kolom}>
          <Geldgroep stukken={figuur.stukken} />
          {veld(0, "Hoeveel geld is het")}
          {goedeBedrag(totaal(figuur.stukken))}
        </div>
      );

    case "geldleggen": {
      const som = totaal(gelegd);
      const leg = (stuk: number) => {
        if (uit || gelegd.length >= 30) return;
        if (gelegdNu.current.length >= 30) return;
        const nieuw = [...gelegdNu.current, stuk];
        gelegdNu.current = nieuw;
        setGelegd(nieuw);
        onWijzig(antwoordVan(totaal(nieuw)));
      };
      const pak = (plek: number) => {
        if (uit) return;
        const nieuw = gelegdNu.current.filter((_, i) => i !== plek);
        gelegdNu.current = nieuw;
        setGelegd(nieuw);
        onWijzig(nieuw.length ? antwoordVan(totaal(nieuw)) : "");
      };
      return (
        <div className={kolom}>
          {figuur.voorwerp && <Prijskaartje voorwerp={figuur.voorwerp} prijs={figuur.doel} />}
          {/* De voorraad: tik om te leggen. Er is altijd genoeg van. */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {figuur.voorraad.map((s) => (
              <button
                key={s}
                type="button"
                disabled={uit}
                aria-label={`Leg ${naamVan(s)}`}
                onClick={() => leg(s)}
                className="grid min-h-14 min-w-14 place-items-center rounded-2xl border-2 border-rand bg-kaart p-1.5 transition hover:border-huisstijl/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Geldstuk cent={s} maat="klein" />
              </button>
            ))}
          </div>
          {/* Wat er ligt: tik nog een keer om weg te halen. */}
          <div
            aria-label="Wat je hebt gelegd"
            className={`flex min-h-24 w-full flex-wrap content-start items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 ${
              !uit ? "border-rand" : fase === "goed" ? "border-groen bg-groen-zacht" : "border-roze bg-roze-zacht"
            }`}
          >
            {gelegd.length === 0 && <span className="self-center text-sm font-semibold text-inkt-zacht">Tik op het geld hierboven.</span>}
            {gelegd.map((s, i) => (
              <button
                key={i}
                type="button"
                disabled={uit}
                aria-label={`Haal ${naamVan(s)} weg`}
                onClick={() => pak(i)}
                className="grid place-items-center rounded-xl p-0.5 transition disabled:cursor-not-allowed"
              >
                <Geldstuk cent={s} maat="klein" />
              </button>
            ))}
          </div>
          {uit && fase !== "goed" && (
            <p className="text-center text-base font-extrabold text-roze">
              Je legde {bedrag(som)}. Het moest {bedrag(figuur.doel)} zijn.
            </p>
          )}
        </div>
      );
    }

    case "muntenofeuros":
      return (
        <div className={kolom}>
          <Geldgroep stukken={Array.from({ length: figuur.aantal }, () => figuur.munt)} />
          <div className="flex flex-wrap items-center justify-center gap-2">
            {veld(0, "Hoeveel munten")}
            <span className="text-base font-extrabold text-inkt-zacht">munten en</span>
            {veld(1, "Hoeveel euro")}
            <span className="text-base font-extrabold text-inkt-zacht">euro</span>
          </div>
        </div>
      );

    case "geldgroepen":
      return (
        <div className={kolom}>
          {figuur.stand === "precies" && figuur.prijs !== null && (
            <Prijskaartje voorwerp={figuur.voorwerp} prijs={figuur.prijs} />
          )}
          {figuur.stand === "wisselgeld" && figuur.prijs !== null && figuur.betaald !== null && (
            <div className="flex flex-col items-center gap-2">
              <Prijskaartje voorwerp={figuur.voorwerp} prijs={figuur.prijs} />
              <div className="flex items-center gap-2 text-base font-extrabold text-inkt">
                <span>Je betaalt met</span>
                <Geldstuk cent={figuur.betaald} maat="klein" />
              </div>
            </div>
          )}
          {figuur.stand === "wisselen" && figuur.wissel != null && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-inkt/5 px-6 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-inkt-zacht">Dit wissel je</span>
              <Geldstuk cent={figuur.wissel} />
            </div>
          )}
          <Groepkeuze
            groepen={figuur.groepen}
            gekozen={gekozen}
            juist={[figuur.goed]}
            uit={uit}
            onTik={kies}
            letters={figuur.stand !== "wisselen"}
          />
        </div>
      );

    case "geldnotatie":
      return (
        <div className={kolom}>
          {figuur.stukken && <Geldgroep stukken={figuur.stukken} />}
          {figuur.stand === "woorden" && figuur.woorden && (
            <p className="rounded-2xl bg-inkt/5 px-5 py-3 text-center text-2xl font-extrabold text-inkt">
              {figuur.woorden}
            </p>
          )}
          {figuur.keuzes ? (
            <Keuzeknoppen keuzes={figuur.keuzes} gekozen={eenKeuze} juist={figuur.goed} uit={uit} onKies={kies} />
          ) : (
            <Notatieveld
              heel={figuur.heel}
              juist={figuur.bedrag}
              fase={fase}
              metCursor={metCursor}
              onWijzig={onWijzig}
              onBevestig={onBevestig}
            />
          )}
        </div>
      );

    case "welkegroepjes":
      return (
        <div className={kolom}>
          <Prijskaartje voorwerp={figuur.voorwerp} prijs={figuur.prijs} />
          <Groepkeuze
            groepen={figuur.groepen}
            gekozen={gekozen}
            juist={juist.split(",").map(Number)}
            uit={uit}
            onTik={(i) => {
              if (uit) return;
              const nieuw = gekozen.includes(i) ? gekozen.filter((g) => g !== i) : [...gekozen, i].sort((a, b) => a - b);
              setGekozen(nieuw);
              onWijzig(nieuw.join(","));
            }}
          />
          <p className="text-sm font-semibold text-inkt-zacht">Tik twee groepjes aan.</p>
        </div>
      );

    case "evenveel":
      /*
        De som op één regel, en nooit afgebroken: links en rechts van het
        isgelijkteken horen bij elkaar. Past hij niet, dan schuift hij in zijn
        eigen vakje.
      */
      return (
        <div className="w-full overflow-x-auto">
          <div className="mx-auto flex w-fit items-center gap-2 text-2xl font-extrabold text-inkt">
            <span>{figuur.aantal}</span>
            <span className="text-inkt-zacht">×</span>
            <Geldstuk cent={figuur.van} maat="klein" />
            <span className="px-1 text-inkt-zacht">=</span>
            {veld(0, `Hoeveel keer ${naamVan(figuur.naar)}`)}
            <span className="text-inkt-zacht">×</span>
            <Geldstuk cent={figuur.naar} maat="klein" />
          </div>
        </div>
      );

    case "geldontbreekt":
      return (
        <div className={kolom}>
          <Prijskaartje voorwerp={figuur.voorwerp} prijs={figuur.prijs} />
          <div className="flex w-full flex-col items-center gap-2 rounded-2xl bg-inkt/5 p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-inkt-zacht">Dit ligt er al</span>
            <Geldgroep stukken={figuur.liggend} maat="klein" />
          </div>
          {figuur.keuzes ? (
            <Geldkeuze stukken={figuur.keuzes} gekozen={eenKeuze} juist={figuur.goed} uit={uit} onKies={kies} />
          ) : (
            <>
              {veld(0, "Wat er nog ontbreekt")}
              {goedeBedrag(figuur.prijs - totaal(figuur.liggend))}
            </>
          )}
        </div>
      );

    case "geldsom": {
      const uitkomst =
        figuur.teken === "+" ? totaal(figuur.links) + totaal(figuur.rechts) : totaal(figuur.links) - totaal(figuur.rechts);
      return (
        <div className={kolom}>
          {/*
            Twee groepjes met het teken ertussen. Naast elkaar alleen als ze
            allebei passen, anders onder elkaar met het teken in het midden:
            nooit een groepje dat half naar de volgende regel valt.
          */}
          <div className="@container w-full">
            <div className="flex flex-col items-center justify-center gap-3 @lg:flex-row">
              <Geldgroep stukken={figuur.links} maat="klein" />
              <Teken teken={figuur.teken} />
              <Geldgroep stukken={figuur.rechts} maat="klein" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-inkt-zacht">=</span>
            {veld(0, "De uitkomst")}
          </div>
          {goedeBedrag(uitkomst)}
        </div>
      );
    }

    case "geldverhaal":
      return (
        <div className={kolom}>
          {figuur.keuzes ? (
            bedragknoppen(figuur.keuzes, figuur.goed)
          ) : (
            <>
              {veld(0, "Het bedrag")}
              {goedeBedrag(figuur.uitkomst)}
            </>
          )}
        </div>
      );

    case "kunjebetalen": {
      const per = juist.split(",");
      return (
        <div className="flex w-full flex-col gap-2">
          {figuur.regels.map((r, i) => {
            const keuze = gekozen[i];
            return (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-2 border-rand bg-kaart px-3 py-2"
              >
                {/*
                  Twee vaste kolommen: de zin mag over twee regels lopen, de
                  knoppen staan altijd rechts, bij elke zin op dezelfde plek.
                */}
                <span className="text-base font-extrabold text-inkt">
                  {r.aantal} {r.ding} van {bedrag(r.prijs)}
                </span>
                <span className="flex gap-2" role="group" aria-label={`${r.aantal} ${r.ding} van ${bedrag(r.prijs)}`}>
                  {["Ja", "Nee"].map((woord, k) => {
                    const isGekozen = keuze === k;
                    const kleur = !uit
                      ? isGekozen
                        ? "border-huisstijl bg-huisstijl-zacht text-inkt"
                        : "border-rand bg-kaart text-inkt"
                      : String(k) === per[i]
                        ? "border-groen bg-groen-zacht text-groen-diep"
                        : isGekozen
                          ? "border-roze bg-roze-zacht text-roze"
                          : "border-rand bg-kaart text-inkt-zacht";
                    return (
                      <button
                        key={woord}
                        type="button"
                        disabled={uit}
                        aria-pressed={isGekozen}
                        onClick={() => {
                          if (uit) return;
                          const nieuw = Array.from({ length: figuur.regels.length }, (_, j) =>
                            j === i ? k : (gekozen[j] ?? -1),
                          );
                          setGekozen(nieuw);
                          onWijzig(nieuw.every((n) => n >= 0) ? nieuw.join(",") : "");
                        }}
                        className={`min-h-11 min-w-16 rounded-xl border-2 px-3 text-base font-extrabold transition disabled:cursor-not-allowed ${kleur}`}
                      >
                        {woord}
                      </button>
                    );
                  })}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    case "bonnetje": {
      const som = totaal(figuur.regels.map((r) => r.prijs));
      const goed = figuur.kwijt === null ? som : figuur.regels[figuur.kwijt].prijs;
      return (
        <div className={kolom}>
          {/* Een echte tabel met border-collapse: de lijnen vallen nooit dubbel of weg. */}
          <table className="w-full max-w-xs border-collapse rounded-lg bg-kaart text-base tabular-nums text-inkt shadow-sm">
            <caption className="pb-1 text-sm font-extrabold uppercase tracking-wide text-inkt-zacht">{figuur.plek}</caption>
            <tbody>
              {figuur.regels.map((r, i) => (
                <tr key={i} className="border-b border-dashed border-tabellijn">
                  <td className="px-3 py-2 font-semibold">{r.ding}</td>
                  <td className="px-3 py-2 text-right font-extrabold">
                    {figuur.kwijt === i ? (
                      <span className="rounded-md bg-inkt/15 px-2 text-inkt/40" aria-label="onleesbaar">
                        € ??,??
                      </span>
                    ) : (
                      bedragKassa(r.prijs)
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-inkt/40">
                <td className="px-3 py-2 font-extrabold">Totaal</td>
                <td className="px-3 py-2 text-right font-extrabold">{figuur.kwijt === null ? "?" : bedragKassa(som)}</td>
              </tr>
            </tbody>
          </table>
          {veld(0, figuur.kwijt === null ? "Het totaal" : "De prijs die kwijt is")}
          {goedeBedrag(goed)}
        </div>
      );
    }

    case "geldafronden":
      return (
        <div className={kolom}>
          <Prijskaartje voorwerp={null} prijs={figuur.prijs} />
          {figuur.keuzes ? bedragknoppen(figuur.keuzes, figuur.goed) : veld(0, "Het afgeronde bedrag")}
        </div>
      );

    case "geldschatten": {
      if (figuur.keuzes) {
        return <div className={kolom}>{bedragknoppen(figuur.keuzes, figuur.goed)}</div>;
      }
      if (figuur.stand !== "samenstap") {
        return <div className={kolom}>{veld(0, "Ongeveer")}</div>;
      }
      /*
        Drie regels onder elkaar in een raster met vaste kolommen: de prijs, het
        teken ≈, en het afgeronde bedrag. Zo staan de vakjes recht onder elkaar.
      */
      return (
        <div className="w-full overflow-x-auto">
          <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center justify-items-center gap-x-3 gap-y-3 text-xl font-extrabold tabular-nums text-inkt">
            <span className="justify-self-end">{bedrag(figuur.prijzen[0])}</span>
            <span className="text-inkt-zacht">≈</span>
            {veld(0, "De eerste prijs afgerond")}
            <span className="justify-self-end">{bedrag(figuur.prijzen[1])}</span>
            <span className="text-inkt-zacht">≈</span>
            {veld(1, "De tweede prijs afgerond")}
            <span className="justify-self-end text-base">Samen ongeveer</span>
            <span className="text-inkt-zacht">=</span>
            {veld(2, "Samen ongeveer")}
          </div>
        </div>
      );
    }

    case "geldkorting":
      return (
        <div className={kolom}>
          {figuur.stand === "korting" ? (
            <div className="flex items-center gap-4 rounded-2xl border-2 border-rand bg-kaart px-5 py-3 text-xl font-extrabold tabular-nums">
              <span className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wide text-inkt-zacht">Was</span>
                <span className="text-inkt-zacht line-through">{bedrag(figuur.was)}</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wide text-roze">Nu</span>
                <span className="text-roze">{bedrag(figuur.was - figuur.korting)}</span>
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Prijskaartje voorwerp={null} prijs={figuur.was} />
              <span className="rounded-full bg-roze px-3 py-2 text-base font-extrabold text-white">
                {bedrag(figuur.korting)} korting
              </span>
            </div>
          )}
          {figuur.keuzes ? bedragknoppen(figuur.keuzes, figuur.goed) : veld(0, "Het bedrag")}
        </div>
      );
  }
}
