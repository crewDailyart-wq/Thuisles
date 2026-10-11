/**
 * Een vaktegel in de avontuurstijl: groot afgerond vierkant met 3D-rand, een
 * groot wit icoon en de naam wit en dik onderaan.
 *
 * Het uiterlijk zit in `.av-tegel` (app/avontuur.css); hier komen alleen de
 * kleur, de scheve hoek en de inhoud bij elkaar.
 */

import Link from "next/link";

export function VakTegel({
  href,
  naam,
  kleur,
  rand,
  scheef,
  licht = false,
  children,
}: {
  href: string;
  naam: string;
  /** de kleur van de tegel, bijv. "var(--av-paars)" */
  kleur: string;
  /** de donkerdere onderkant, bijv. "var(--av-paars-rand)" */
  rand: string;
  /** hoe scheef de tegel staat, bijv. "-2deg" */
  scheef: string;
  /** lichte tegel (geel): de naam krijgt een donkere rand om de letters */
  licht?: boolean;
  /** het icoon */
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`av-tegel ${licht ? "av-tegel--licht" : ""}`}
      style={
        {
          "--tegel": kleur,
          "--tegel-rand": rand,
          "--scheef": scheef,
          color: "#ffffff",
        } as React.CSSProperties
      }
    >
      <span className="av-tegel__icoon" style={{ color: rand }}>
        {children}
      </span>
      <span className="av-tegel__naam">{naam}</span>
    </Link>
  );
}
