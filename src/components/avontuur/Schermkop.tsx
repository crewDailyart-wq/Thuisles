/**
 * De kop van een scherm in de avontuurstijl: links een rond terugknopje,
 * in het midden de titel groot en wit met een gloed erachter, en daaronder
 * een handgeschreven zinnetje.
 */

import Link from "next/link";
import { Glitter } from "@/components/avontuur/Glitter";
import { TegelBezig } from "@/components/avontuur/TegelBezig";

export function Terugknop({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="av-rondje" aria-label={label} title={label}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-7"
      >
        <path d="M19 12H6" />
        <path d="m11.5 5.5-6.5 6.5 6.5 6.5" />
      </svg>
      <TegelBezig />
    </Link>
  );
}

export function Schermkop({
  terug,
  titel,
  onder,
  rechts,
}: {
  terug: { href: string; label: string };
  titel: string;
  /** het handgeschreven zinnetje onder de titel */
  onder?: string;
  /** iets kleins rechtsboven, bijv. het Hoi-vakje */
  rechts?: React.ReactNode;
}) {
  return (
    <header className="grid grid-cols-[3.25rem_1fr_3.25rem] items-start gap-x-3 sm:grid-cols-[minmax(3.25rem,1fr)_auto_minmax(3.25rem,1fr)]">
      <div className="pt-1">
        <Terugknop {...terug} />
      </div>

      <div className="av-gloed min-w-0 text-center">
        <h1
          className={`av-titel inline-flex items-center gap-[0.35em] leading-tight drop-shadow-[0_5px_0_rgba(10,20,90,0.35)] ${
            /* een lange titel (een onderwerp) iets kleiner, zodat hij op één of twee regels past */
            titel.length > 18 ? "text-[clamp(1.7rem,3.6vw,3.2rem)]" : "text-[clamp(2.1rem,5vw,4.2rem)]"
          }`}
        >
          <Glitter kant="links" className="hidden size-[0.55em] shrink-0 sm:block" />
          <span className="min-w-0 [overflow-wrap:anywhere]">{titel}</span>
          <Glitter className="hidden size-[0.55em] shrink-0 sm:block" kleur="var(--av-vonk)" />
        </h1>
        {onder && (
          <p className="av-hand mt-1 -rotate-1 text-[clamp(1.2rem,2.1vw,1.9rem)] text-white/90">
            {onder}
          </p>
        )}
      </div>

      <div className="justify-self-end pt-1">{rechts}</div>
    </header>
  );
}
