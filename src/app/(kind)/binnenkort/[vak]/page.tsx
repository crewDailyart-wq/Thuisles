/**
 * "Binnenkort!" — voor de vakken op het startscherm die er nog niet zijn
 * (Taal, Spelling, Begrijpend lezen). In de avontuurstijl, net als het
 * startscherm. Er wordt geen datum beloofd.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Glitter } from "@/components/avontuur/Glitter";
import { HoofdMascotte } from "@/components/avontuur/HoofdMascotte";
import { Logo } from "@/components/avontuur/Logo";
import { Hemel } from "@/components/avontuur/Hemel";
import { IcoonLezen, IcoonSpelling, IcoonTaal } from "@/components/avontuur/VakIconen";

const VAKKEN = {
  taal: { naam: "Taal", kleur: "roze", Icoon: IcoonTaal },
  spelling: { naam: "Spelling", kleur: "oranje", Icoon: IcoonSpelling },
  lezen: { naam: "Begrijpend lezen", kleur: "geel", Icoon: IcoonLezen },
} as const;

export default async function BinnenkortVak({ params }: PageProps<"/binnenkort/[vak]">) {
  const { vak } = await params;
  const v = VAKKEN[vak as keyof typeof VAKKEN];
  if (!v) notFound();

  return (
    <div data-stijl="avontuur" className="relative isolate min-h-[100svh] overflow-hidden">
      <Hemel />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[100rem] flex-col px-4 pb-8 pt-4 sm:px-8 sm:pt-6 lg:px-12">
        <div>
          <Logo />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
          <span
            className="grid size-36 place-items-center rounded-[1.75rem] p-5 sm:size-44"
            style={{
              background: `linear-gradient(160deg, rgba(255,255,255,.28), rgba(255,255,255,0) 45%), var(--av-${v.kleur})`,
              boxShadow: `inset 0 2px 0 rgba(255,255,255,.35), 0 10px 0 var(--av-${v.kleur}-rand), 0 22px 30px rgba(8,14,70,.45)`,
              color: `var(--av-${v.kleur}-rand)`,
              transform: "rotate(-2deg)",
            }}
          >
            <v.Icoon />
          </span>

          <h1 className="av-titel av-gloed inline-flex items-center gap-[0.35em] text-[clamp(2.4rem,6vw,4.4rem)] drop-shadow-[0_5px_0_rgba(10,20,90,0.35)]">
            <Glitter kant="links" className="size-[0.6em]" />
            Binnenkort!
            <Glitter className="size-[0.6em]" kleur="var(--av-vonk)" />
          </h1>

          <div className="flex items-end gap-3">
            <HoofdMascotte className="w-24 shrink-0 drop-shadow-[0_10px_16px_rgba(8,14,70,0.45)] sm:w-28" />
            <p className="av-wolkje mb-10 max-w-xs text-left text-lg">
              {v.naam} komt er nog aan. Kies nu eerst iets anders.
            </p>
          </div>

          <Link href="/start" className="av-knop mt-2">
            Terug naar het begin
          </Link>
        </div>
      </div>
    </div>
  );
}
