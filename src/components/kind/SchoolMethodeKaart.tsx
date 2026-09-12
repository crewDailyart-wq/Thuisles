/**
 * Kaart "School & methode" in de rechterkolom.
 *
 * Het label rechtsboven volgt STRIKT de herkomst van de gegevens en is dus
 * nooit een vaste tekst:
 *   geverifieerd        -> groen, gecontroleerde bron
 *   opgegeven_door_ouder-> oranje, uitdrukkelijk niet gecontroleerd
 *   onbekend            -> grijs, "Nog niet bekend" en geen methodenaam
 *
 * Voor de methode wordt een EIGEN getekend merkje gebruikt. Er worden nooit
 * boekomslagen, logo's of andere beeldmerken van uitgevers getoond.
 */

import { Icoon } from "@/components/kind/Icoon";
import type { MethodeHerkomst, MethodeKoppeling } from "@/lib/types";

/** Eigen beeldmerk voor een rekenmethode: kompasnaald met telkralen. */
function MethodeMerkje() {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-viool-zacht">
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <circle cx={16} cy={16} r={12} fill="none" stroke="#5b3fd6" strokeWidth={2.4} />
        <path d="M21 11 L18 18 L11 21 L14 14 Z" fill="#5b3fd6" />
        <circle cx={16} cy={4.6} r={2.2} fill="#f2bb2e" />
        <circle cx={27.4} cy={16} r={2.2} fill="#1f9d63" />
      </svg>
    </span>
  );
}

const LABEL: Record<MethodeHerkomst, { tekst: string; stijl: string }> = {
  geverifieerd: {
    tekst: "Geverifieerd",
    stijl: "bg-groen-zacht text-groen-diep",
  },
  opgegeven_door_ouder: {
    tekst: "Niet gecontroleerd",
    stijl: "bg-oranje-zacht text-oranje-diep",
  },
  onbekend: {
    tekst: "Nog niet bekend",
    stijl: "bg-rand text-inkt-zacht",
  },
};

function Regel({ label, waarde }: { label: string; waarde: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-rand py-2 first:border-t-0">
      <dt className="text-xs font-bold text-inkt-zacht">{label}</dt>
      <dd className="text-right text-sm font-extrabold">{waarde}</dd>
    </div>
  );
}

export function SchoolMethodeKaart({
  methode,
  groep,
}: {
  methode: MethodeKoppeling;
  groep: number;
}) {
  const label = LABEL[methode.herkomst];

  return (
    <section className="rounded-groot border border-rand bg-kaart p-5 shadow-zacht">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold">
          <Icoon naam="school" className="size-5 text-viool" />
          School &amp; methode
        </h2>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.66rem] font-extrabold uppercase tracking-wide ${label.stijl}`}
        >
          {methode.herkomst === "geverifieerd" && (
            <Icoon naam="vinkje" className="size-3" />
          )}
          {label.tekst}
        </span>
      </div>

      <dl className="mt-4">
        <Regel label="School" waarde={methode.school?.naam ?? "Nog niet ingesteld"} />
        <Regel label="Groep" waarde={`Groep ${groep}`} />
      </dl>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-room/60 p-3">
        <MethodeMerkje />
        <div className="min-w-0">
          <p className="text-xs font-bold text-inkt-zacht">Rekenmethode</p>
          <p className="text-sm font-extrabold leading-tight">
            {methode.methode?.naam ?? "Nog niet bekend"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[0.7rem] font-semibold leading-relaxed text-inkt-zacht">
        {methode.herkomst === "onbekend"
          ? "Je ouder kan de school instellen. Zonder school werkt vrij oefenen gewoon."
          : "Thuisles stemt de volgorde af op school. De oefeningen zelf zijn altijd van Thuisles."}
      </p>
    </section>
  );
}
