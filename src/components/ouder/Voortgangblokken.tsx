/**
 * De losse blokken van het voortgangsdashboard.
 *
 * Alle drie houden zich aan dezelfde regels: gewone taal, geen oordeel, geen
 * vergelijking met andere kinderen, en cijfers alleen waar ze iets betekenen.
 */

import Link from "next/link";
import { Icoon } from "@/components/ouder/Icoon";
import type { Oefenritme as Ritme, Signaal } from "@/lib/data/dashboard";

function datum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
  });
}

/** Maandag t/m zondag, één letter, voor onder de staafjes. */
function dagletter(datumTekst: string) {
  return ["zo", "ma", "di", "wo", "do", "vr", "za"][
    new Date(datumTekst).getDay()
  ];
}

// ---------------------------------------------------------------------------
// C6 — Signalen van je kind
// ---------------------------------------------------------------------------

export function Signalen({
  signalen,
  roepnaam,
}: {
  signalen: Signaal[];
  roepnaam: string;
}) {
  const lastig = signalen.filter((s) => s.soort === "zelf_lastig");
  const comeback = signalen.filter((s) => s.soort === "comeback");

  if (signalen.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-beheer-zacht">
        Nog geen signalen. Als {roepnaam} tijdens het oefenen op &ldquo;Dit
        snapte ik niet&rdquo; drukt, zie je dat hier. Ook wat er weer lukt komt
        hier te staan.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
          Dit snapte ik niet
        </p>
        {lastig.length === 0 ? (
          <p className="mt-1.5 text-sm text-beheer-zacht">
            {roepnaam} heeft niets aangegeven.
          </p>
        ) : (
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {lastig.map((s, i) => (
              <li key={i} className="text-sm">
                <Link
                  href={`/ouder/voortgang/${s.domeinSlug}/${s.code}`}
                  className="font-medium hover:underline"
                >
                  {s.leerdoelTitel}
                </Link>
                <span className="block text-xs text-beheer-zacht">
                  Aangegeven op {datum(s.gemaaktOp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-beheer-rand-zacht pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
          Weer gelukt
        </p>
        {comeback.length === 0 ? (
          <p className="mt-1.5 text-sm text-beheer-zacht">
            Nog niets om te vieren, maar dat komt.
          </p>
        ) : (
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {comeback.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Icoon naam="sterk" className="mt-0.5 size-4 shrink-0 text-groen" />
                <span>
                  <span className="block">
                    {roepnaam} heeft{" "}
                    <Link
                      href={`/ouder/voortgang/${s.domeinSlug}/${s.code}`}
                      className="font-medium hover:underline"
                    >
                      {s.leerdoelTitel.toLowerCase()}
                    </Link>{" "}
                    weer onder de knie.
                  </span>
                  <span className="block text-xs text-beheer-zacht">
                    {datum(s.gemaaktOp)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// C7 — Oefenritme
// ---------------------------------------------------------------------------

export function Oefenritme({
  ritme,
  roepnaam,
}: {
  ritme: Ritme;
  roepnaam: string;
}) {
  const hoogste = Math.max(...ritme.perDag.map((d) => d.minuten), 1);

  if (ritme.aantalSommen === 0) {
    return (
      <p className="text-sm leading-relaxed text-beheer-zacht">
        {roepnaam} heeft deze week nog niet geoefend. Zet een korte oefening
        klaar, dan staat die klaar bij &ldquo;Voor jou&rdquo;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          ["Dagen geoefend", `${ritme.dagenDezeWeek} van de 7`],
          ["Minuten", String(ritme.minutenDezeWeek)],
          ["Sommen gemaakt", String(ritme.aantalSommen)],
        ].map(([label, waarde]) => (
          <div key={label} className="rounded-lg border border-beheer-rand p-3">
            <dt className="text-xs text-beheer-zacht">{label}</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">{waarde}</dd>
          </div>
        ))}
      </dl>

      {/* Zeven rustige staafjes. Geen doel, geen streak, geen oordeel. */}
      <div>
        <ul className="flex items-end gap-1.5" aria-hidden="true">
          {ritme.perDag.map((dag) => (
            <li key={dag.datum} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={`w-full rounded-t ${dag.minuten > 0 ? "bg-viool" : "bg-beheer-rand"}`}
                style={{
                  height: `${Math.max(4, Math.round((dag.minuten / hoogste) * 48))}px`,
                }}
              />
              <span className="text-[0.62rem] text-beheer-zacht">
                {dagletter(dag.datum)}
              </span>
            </li>
          ))}
        </ul>
        <p className="sr-only">
          {ritme.perDag
            .map((d) => `${dagletter(d.datum)}: ${d.minuten} minuten`)
            .join(", ")}
        </p>
      </div>

      <p className="text-xs leading-relaxed text-beheer-zacht">
        Alleen ter informatie. Er wordt niets vergeleken met andere kinderen, en
        er hoort geen doel bij.
      </p>
    </div>
  );
}
