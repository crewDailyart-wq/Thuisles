/**
 * Het raamwerk van elk scherm in de avontuurstijl: de sterrenhemel erachter,
 * witte letters, en een kolom over de volle hoogte van het scherm.
 *
 * Het startscherm, het rekenscherm, de domeinen en onderwerpen, "Meer" en
 * "Binnenkort!" gebruiken dit allemaal. Zo'n scherm heeft geen zijbalk en geen
 * balk onderaan; zie `isAvontuurscherm` in Kindschil.tsx.
 */

import { Hemel } from "@/components/avontuur/Hemel";

export function Sterrenscherm({
  children,
  className = "",
}: {
  children: React.ReactNode;
  /** extra klassen voor de kolom, bijv. voor de ruimte onderaan */
  className?: string;
}) {
  return (
    <div data-stijl="avontuur" className="relative isolate min-h-[100svh] overflow-x-hidden">
      <Hemel />
      <div
        className={`relative mx-auto flex min-h-[100svh] w-full max-w-[100rem] flex-col px-4 pb-6 pt-4 sm:px-8 sm:pt-6 lg:px-12 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
