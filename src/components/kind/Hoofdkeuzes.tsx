/**
 * De drie hoofdkaarten van het startscherm.
 *
 * Elke kaart heeft een rond icoon in een gekleurde cirkel, een titel, een
 * korte tekst en een opvallende knop onderaan in de eigen kleur van die kaart:
 * de huisstijlkleur voor zelf kiezen, groen voor het aanbevolen "Voor jou", en
 * wereld. "Voor jou" staat in het midden en is iets opgetild, zodat het oog
 * daar het eerst landt.
 */

import Link from "next/link";
import { Icoon, type IcoonNaam } from "@/components/kind/Icoon";
import type { Aanbeveling } from "@/lib/types";

type Kleur = "huisstijl" | "groen" | "oranje";

const CIRKEL: Record<Kleur, string> = {
  huisstijl: "bg-huisstijl-zacht text-huisstijl-diep",
  groen: "bg-groen-zacht text-groen",
  oranje: "bg-oranje-zacht text-oranje",
};

const KNOP: Record<Kleur, string> = {
  huisstijl: "bg-huisstijl-diep hover:bg-huisstijl-donker",
  groen: "bg-groen hover:bg-groen-diep",
  oranje: "bg-oranje hover:bg-oranje-diep",
};

function Kaart({
  href,
  icoon,
  kleur,
  titel,
  tekst,
  knop,
  uitgelicht = false,
  bovenlabel,
}: {
  href: "/oefenen" | "/wereld";
  icoon: IcoonNaam;
  kleur: Kleur;
  titel: string;
  tekst: string;
  knop: string;
  uitgelicht?: boolean;
  bovenlabel?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-groot border bg-kaart p-6 transition hover:-translate-y-1 ${
        uitgelicht
          ? "border-groen/30 shadow-op ring-4 ring-groen-zacht"
          : "border-rand shadow-zacht hover:shadow-op"
      }`}
    >
      {bovenlabel && (
        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-groen-zacht px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-groen-diep">
          <Icoon naam="ster" className="size-3.5" />
          {bovenlabel}
        </span>
      )}

      <span
        className={`grid size-16 place-items-center rounded-full ${CIRKEL[kleur]}`}
      >
        <Icoon naam={icoon} className="size-8" />
      </span>

      <span className="mt-4 block text-xl font-extrabold leading-tight">
        {titel}
      </span>
      <span className="mt-1.5 block text-sm font-semibold leading-snug text-inkt-zacht">
        {tekst}
      </span>

      <span
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-extrabold text-white transition-colors ${KNOP[kleur]}`}
      >
        {knop}
        <Icoon
          naam="pijl"
          className="size-5 transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

export function Hoofdkeuzes({ aanbeveling }: { aanbeveling: Aanbeveling | null }) {
  return (
    <section aria-labelledby="kop-hoofdkeuzes">
      <h2 id="kop-hoofdkeuzes" className="sr-only">
        Wat wil je doen?
      </h2>

      <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
        <div className="order-2 md:order-1">
          <Kaart
            href="/oefenen"
            icoon="oefenen"
            kleur="huisstijl"
            titel="Oefenen"
            tekst="Kies zelf een onderwerp waar je mee aan de slag gaat."
            knop="Kies zelf"
          />
        </div>

        {/* Hoofdactie: uitgelicht en op grotere schermen iets opgetild. */}
        <div className="order-1 md:order-2 md:-mt-4 md:-mb-4">
          <Kaart
            href="/oefenen"
            icoon="ster"
            kleur="groen"
            uitgelicht
            bovenlabel="Voor jou"
            titel={aanbeveling ? aanbeveling.leerdoel.titel : "Je bent helemaal bij!"}
            tekst={
              aanbeveling
                ? `${aanbeveling.subdomein.naam} — ${aanbeveling.waarom}`
                : "Kies zelf iets om te oefenen, of ga je wereld bekijken."
            }
            knop="Beginnen"
          />
        </div>

        <div className="order-3">
          <Kaart
            href="/wereld"
            icoon="wereld"
            kleur="oranje"
            titel="Mijn wereld"
            tekst="Bekijk de gebieden die je al hebt ontdekt."
            knop="Ontdekken"
          />
        </div>
      </div>
    </section>
  );
}
