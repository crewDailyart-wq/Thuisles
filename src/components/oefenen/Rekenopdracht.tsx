"use client";

/**
 * Het scherm van de erbij- en erafsommen tot en met 100 (type `rekensom`).
 *
 *   som          14 + 7 = ▢, of een vakje ergens anders; met een vlek erover
 *                ("Wat zit er onder de vlek?") tikt het kind op de vlek en
 *                typt het getal
 *   stippen      twee groepjes stippen in rijen van vijf; ▢ + ▢ = ▢
 *   kaarten      vier sommen om uit te kiezen
 *   handig       zes getallen in een vak; samen ▢
 *   tweegetallen zes getallen; ▢ + ▢ = 26
 *   balans       a ± b = c ± d met één leeg vakje
 *
 * Alle vakjes zijn echte invoervelden met alleen cijfers en het toetsenbord
 * van het apparaat (HARDE REGEL 5). Wat er doorgegeven wordt, zijn de getallen
 * met komma's ertussen, in de volgorde van links naar rechts.
 */

import { useEffect, useRef, useState } from "react";
import { Keuzeknoppen } from "@/components/oefenen/Tijdopdracht";
import { Inktvlek } from "@/components/oefenen/Klok";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import type { Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
export type Rekenfiguur = Extract<Figuur, { soort: "rekensom" }>;

export function isRekenfiguur(figuur: Figuur | null | undefined): figuur is Rekenfiguur {
  return figuur !== null && figuur !== undefined && figuur.soort === "rekensom";
}

/** Eén cijfervakje. */
function Vak({
  waarde,
  label,
  uitslag,
  uit,
  veldRef,
  opVlek = false,
  onTyp,
  onBevestig,
}: {
  waarde: string;
  label: string;
  uitslag: "goed" | "fout" | null;
  uit: boolean;
  veldRef?: (el: HTMLInputElement | null) => void;
  /** Over een vlek heen: geen eigen rand of achtergrond, witte cijfers. */
  opVlek?: boolean;
  onTyp: (tekst: string) => void;
  onBevestig: () => void;
}) {
  const { bijAandacht, bijWeggaan } = useInBeeld();
  const kleur = opVlek
    ? uitslag === "fout"
      ? "text-roze-zacht"
      : "text-white"
    : uitslag === "goed"
      ? "border-2 border-groen bg-groen-zacht text-groen-diep"
      : uitslag === "fout"
        ? "border-2 border-roze bg-roze-zacht text-roze"
        : "border-2 border-rand bg-kaart text-inkt focus-within:border-huisstijl";
  return (
    <span className={`grid h-16 w-20 place-items-center rounded-2xl text-3xl font-extrabold tabular-nums ${kleur}`}>
      <input
        ref={veldRef}
        type="text"
        aria-label={label}
        value={waarde}
        placeholder={uitslag === null && !opVlek ? "?" : undefined}
        readOnly={uit}
        disabled={uit}
        autoComplete="off"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        maxLength={3}
        onFocus={(e) => bijAandacht(e.currentTarget)}
        onBlur={bijWeggaan}
        onChange={(e) => onTyp(e.target.value.replace(/\D/g, "").slice(0, 3))}
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

/** Een groepje stippen in rijen van vijf. */
function Stippen({ aantal, kleur }: { aantal: number; kleur: string }) {
  const rijen = Math.ceil(aantal / 5);
  return (
    <svg
      viewBox={`0 0 ${5 * 22} ${rijen * 22}`}
      className="w-28 shrink-0 sm:w-32"
      role="img"
      aria-label={`${aantal} stippen`}
    >
      {Array.from({ length: aantal }, (_, i) => (
        <circle key={i} cx={11 + (i % 5) * 22} cy={11 + Math.floor(i / 5) * 22} r={8} fill={kleur} />
      ))}
    </svg>
  );
}

const Teken = ({ t }: { t: string }) => (
  <span aria-hidden="true" className="text-4xl font-extrabold text-huisstijl">
    {t}
  </span>
);
const Getal = ({ n }: { n: number | string }) => (
  <span className="text-4xl font-extrabold tabular-nums text-inkt">{n}</span>
);

export function Rekenopdracht({
  figuur,
  antwoord,
  juist,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
}: {
  figuur: Rekenfiguur;
  antwoord: string;
  /** Het goede antwoord zoals het in de vraag staat. */
  juist: string;
  fase: Fase;
  metCursor?: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";
  const aantal = figuur.weergave === "stippen" ? 3 : figuur.weergave === "tweegetallen" ? 2 : figuur.weergave === "kaarten" ? 0 : 1;
  const [vakjes, setVakjes] = useState<string[]>(() => Array.from({ length: aantal }, () => ""));
  const [gekozen, setGekozen] = useState<number | null>(antwoord !== "" && figuur.weergave === "kaarten" ? Number(antwoord) : null);
  const velden = useRef<(HTMLInputElement | null)[]>([]);

  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setVakjes(Array.from({ length: aantal }, () => ""));
      setGekozen(null);
    }
  }, [fase, aantal]);

  useEffect(() => {
    if (metCursor && fase === "bezig" && !figuur.vlek) velden.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  /* Na het nakijken: per vakje goed of fout. Bij twee getallen telt elke volgorde. */
  const goedeSets = juist.split("|").map((w) => w.split(","));
  const passend = goedeSets.find((set) => set.every((w, i) => String(Number(vakjes[i])) === w && vakjes[i] !== "")) ?? goedeSets[0];
  const uitslag = (i: number): "goed" | "fout" | null =>
    !uit ? null : vakjes[i] !== "" && String(Number(vakjes[i])) === passend[i] ? "goed" : "fout";

  function typ(i: number, w: string) {
    if (uit) return;
    const nieuw = [...vakjes];
    nieuw[i] = w;
    setVakjes(nieuw);
    onWijzig(nieuw.every((x) => x !== "") ? nieuw.map((x) => String(Number(x))).join(",") : "");
  }

  const vak = (i: number, label: string, opVlek = false) => (
    <Vak
      key={i}
      waarde={vakjes[i] ?? ""}
      label={label}
      uitslag={uitslag(i)}
      uit={uit}
      opVlek={opVlek}
      veldRef={(el) => {
        velden.current[i] = el;
      }}
      onTyp={(w) => typ(i, w)}
      onBevestig={onBevestig}
    />
  );

  const rij = "flex flex-wrap items-center justify-center gap-3";

  if (figuur.weergave === "kaarten") {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        {figuur.boven && (
          <p className="rounded-2xl bg-room px-5 py-2 text-3xl font-extrabold tabular-nums text-inkt">{figuur.boven}</p>
        )}
        <Keuzeknoppen
          keuzes={figuur.kaarten ?? []}
          gekozen={gekozen}
          juist={figuur.goed ?? 0}
          uit={uit}
          onKies={(n) => {
            if (uit) return;
            setGekozen(n);
            onWijzig(String(n));
          }}
          tweeKolommen
        />
      </div>
    );
  }

  if (figuur.weergave === "stippen") {
    const [a, b] = figuur.getallen;
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex items-start justify-center gap-4">
          <Stippen aantal={a} kleur="var(--color-huisstijl)" />
          <Teken t="+" />
          <Stippen aantal={b} kleur="var(--color-lucht, #4b8fd6)" />
        </div>
        <div className={rij}>
          {vak(0, "Het eerste getal")}
          <Teken t="+" />
          {vak(1, "Het tweede getal")}
          <Teken t="=" />
          {vak(2, "De uitkomst")}
        </div>
      </div>
    );
  }

  if (figuur.weergave === "handig") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="grid grid-cols-3 gap-3 rounded-2xl border-2 border-rand bg-room/50 p-4">
          {(figuur.lijst ?? []).map((n, i) => (
            <span key={i} className="grid min-w-16 place-items-center rounded-xl bg-kaart px-3 py-2 text-3xl font-extrabold tabular-nums text-inkt">
              {n}
            </span>
          ))}
        </div>
        <div className={rij}>
          <span className="text-2xl font-extrabold text-inkt-zacht">Samen:</span>
          {vak(0, "Alle getallen samen")}
        </div>
      </div>
    );
  }

  if (figuur.weergave === "tweegetallen") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex flex-wrap justify-center gap-2">
          {(figuur.lijst ?? []).map((n, i) => (
            <span key={i} className="grid min-w-14 place-items-center rounded-xl border-2 border-geel bg-geel-zacht px-3 py-2 text-2xl font-extrabold tabular-nums text-inkt">
              {n}
            </span>
          ))}
        </div>
        <div className={rij}>
          {vak(0, "Het eerste getal")}
          <Teken t="+" />
          {vak(1, "Het tweede getal")}
          <Teken t="=" />
          <Getal n={figuur.getallen[2]} />
        </div>
      </div>
    );
  }

  if (figuur.weergave === "balans") {
    const g = figuur.getallen;
    const deel = (i: number) => (i === figuur.leeg ? vak(0, "Het ontbrekende getal") : <Getal key={i} n={g[i]} />);
    return (
      <div className="@container w-full">
        <div className={rij}>
          {deel(0)}
          <Teken t={figuur.linksTeken ?? "+"} />
          {deel(1)}
          <Teken t="=" />
          {deel(2)}
          <Teken t={figuur.rechtsTeken ?? "+"} />
          {deel(3)}
        </div>
      </div>
    );
  }

  /* De som: één leeg vakje, of een vlek waar het kind op tikt. */
  const [a, b, r] = figuur.getallen;
  const deel = (i: number) => {
    if (i !== figuur.leeg) return <Getal key={i} n={[a, b, r][i]} />;
    if (!figuur.vlek) return vak(0, "Het ontbrekende getal");
    return (
      <span key={i} className="relative grid size-24 place-items-center">
        <Inktvlek zaad={a * 97 + b * 13 + r} className="pointer-events-none absolute inset-0 size-full" />
        <span className="relative">{vak(0, "Het getal onder de vlek", true)}</span>
      </span>
    );
  };
  return (
    <div className={rij}>
      {deel(0)}
      <Teken t={figuur.teken} />
      {deel(1)}
      <Teken t="=" />
      {deel(2)}
    </div>
  );
}
