"use client";

/**
 * De formulieren van "School & methode" in de ouderomgeving.
 *
 * Taalregel van de hele ouderkant: korte zinnen, gewone woorden, positief
 * geformuleerd. En bij alles wat over een methode gaat, geldt de harde regel:
 * onbekend blijft onbekend, en wat een ouder opgeeft heet ook zo.
 */

import { useActionState, useState } from "react";
import {
  bevestigJaarcontrole,
  geefMethodeOp,
  haalSchoolWeg,
  kiesHuidigBlok,
  kiesMethodeVoorKind,
  kiesSchool,
  zetMethodeAanUit,
} from "@/app/ouder/schoolacties";
import { Knop } from "@/components/ouder/Bouwstenen";
import { GEZIEN_WAAR, type MethodeBlok, type Rekenmethode, type School } from "@/lib/types";

type Uitkomst = { fout: string } | { gelukt: string } | null;

const VELD =
  "h-11 w-full rounded-lg border border-beheer-rand bg-white px-3 text-sm outline-none transition focus:border-viool focus:ring-2 focus:ring-viool/20";

function Melding({ uitkomst }: { uitkomst: Uitkomst }) {
  if (!uitkomst) return null;
  const fout = "fout" in uitkomst;
  return (
    <p
      role="status"
      className={`rounded-lg border px-3 py-2.5 text-sm leading-relaxed ${
        fout
          ? "border-oranje/40 bg-oranje-zacht text-oranje-diep"
          : "border-groen/40 bg-groen-zacht text-groen-diep"
      }`}
    >
      {fout ? uitkomst.fout : uitkomst.gelukt}
    </p>
  );
}

function Verstuurknop({ label, bezig }: { label: string; bezig: boolean }) {
  return (
    <button
      type="submit"
      disabled={bezig}
      className="inline-flex min-h-11 items-center justify-center self-start rounded-lg bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
    >
      {bezig ? "Even geduld…" : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// School zoeken en kiezen
// ---------------------------------------------------------------------------

export function SchoolZoeken({
  kindId,
  gevonden,
  zoekterm,
}: {
  kindId: string;
  gevonden: School[];
  zoekterm: string;
}) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    kiesSchool,
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Zoeken gaat via het webadres, zodat je de lijst kunt delen en terug kunt. */}
      <form method="get" className="flex flex-col gap-2 sm:flex-row">
        <input
          name="zoek"
          defaultValue={zoekterm}
          placeholder="Naam van de school, plaats of postcode"
          className={VELD}
          aria-label="Zoek een school"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-beheer-rand bg-white px-4 text-sm font-medium transition hover:border-viool hover:text-viool"
        >
          Zoeken
        </button>
      </form>

      {zoekterm && gevonden.length === 0 && (
        <p className="text-sm text-beheer-zacht">
          Geen school gevonden. Probeer een deel van de naam, of de postcode.
        </p>
      )}

      {gevonden.length > 0 && (
        <form action={verstuur}>
          <input type="hidden" name="kindId" value={kindId} />
          <ul className="flex flex-col">
            {gevonden.map((school) => (
              <li key={school.id} className="border-t border-beheer-rand-zacht first:border-t-0">
                <button
                  type="submit"
                  name="schoolId"
                  value={school.id}
                  disabled={bezig}
                  className="flex min-h-14 w-full flex-col items-start justify-center gap-0.5 py-3 text-left transition hover:text-viool disabled:opacity-60"
                >
                  <span className="text-sm font-medium">{school.naam}</span>
                  <span className="text-xs text-beheer-zacht">
                    {school.plaats} · {school.postcode}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </form>
      )}

      <Melding uitkomst={uitkomst} />
    </div>
  );
}

export function SchoolWeghalen({ kindId }: { kindId: string }) {
  return (
    <form action={haalSchoolWeg}>
      <input type="hidden" name="kindId" value={kindId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-lg border border-beheer-rand bg-white px-4 text-sm font-medium transition hover:border-viool hover:text-viool"
      >
        Andere school kiezen
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// De methode van het kind
// ---------------------------------------------------------------------------

/**
 * De methode voor dit kind instellen.
 *
 * Twee situaties, maar één formulier: is er een geverifieerde methode bij de
 * school, dan staat die voorgesteld en bevestigt de ouder hem. Anders kiest de
 * ouder er zelf een voor het eigen kind — en dat is geen bewering over school.
 */
export function MethodeVoorKind({
  kindId,
  roepnaam,
  methodes,
  huidigeMethodeId,
  voorstelId,
}: {
  kindId: string;
  roepnaam: string;
  methodes: Rekenmethode[];
  huidigeMethodeId: string | null;
  /** De geverifieerde methode van de school, als die er is. */
  voorstelId: string | null;
}) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    kiesMethodeVoorKind,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-col gap-4">
      <input type="hidden" name="kindId" value={kindId} />
      <input
        type="hidden"
        name="herkomst"
        value={voorstelId && voorstelId === huidigeMethodeId ? "school" : "eigen"}
      />

      <label className="block">
        <span className="block text-sm font-medium">
          Met welke methode werkt {roepnaam}?
        </span>
        <span className="block text-xs text-beheer-zacht">
          {voorstelId
            ? "Van deze school weten we welke methode er wordt gebruikt. Klopt dat voor jouw kind?"
            : "Weet je het van je eigen kind? Stel het hier in. Dat is geen uitspraak over de school."}
        </span>
        <select
          name="methodeId"
          defaultValue={huidigeMethodeId ?? voorstelId ?? ""}
          className={`${VELD} mt-1.5`}
        >
          <option value="">Geen methode — alleen vrij oefenen</option>
          {methodes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.naam}
              {m.uitgever ? ` (${m.uitgever})` : ""}
            </option>
          ))}
        </select>
      </label>

      <Melding uitkomst={uitkomst} />
      <Verstuurknop label="Opslaan" bezig={bezig} />
    </form>
  );
}

/** B9: oefenen volgens methode aan of uit. */
export function MethodeSchakelaar({
  kindId,
  aan,
}: {
  kindId: string;
  aan: boolean;
}) {
  return (
    <form action={zetMethodeAanUit} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="kindId" value={kindId} />
      <input type="hidden" name="aan" value={aan ? "nee" : "ja"} />
      <span className="min-w-0 flex-1 text-sm">
        <span className="block font-medium">Oefenen volgens de methode</span>
        <span className="block text-xs text-beheer-zacht">
          {aan
            ? "Staat aan. Je kind ziet de blokken van school."
            : "Staat uit. Je kind ziet alleen vrij oefenen en Voor jou."}
        </span>
      </span>
      <button
        type="submit"
        className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-beheer-rand bg-white px-4 text-sm font-medium transition hover:border-viool hover:text-viool"
      >
        {aan ? "Uitzetten" : "Aanzetten"}
      </button>
    </form>
  );
}

/** B8: waar zit de klas nu? Dit schatten wij nooit zelf in. */
export function HuidigBlok({
  kindId,
  blokken,
  huidigBlokId,
}: {
  kindId: string;
  blokken: MethodeBlok[];
  huidigBlokId: string | null;
}) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    kiesHuidigBlok,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-col gap-4">
      <input type="hidden" name="kindId" value={kindId} />

      <label className="block">
        <span className="block text-sm font-medium">Waar is de klas nu?</span>
        <span className="block text-xs text-beheer-zacht">
          Dit vullen wij nooit zelf in. Weet je het niet? Laat het dan staan.
        </span>
        <select
          name="blokId"
          defaultValue={huidigBlokId ?? ""}
          className={`${VELD} mt-1.5`}
        >
          <option value="">Bij het begin</option>
          {blokken.map((b) => (
            <option key={b.id} value={b.id}>
              Blok {b.nummer} — {b.titel}
            </option>
          ))}
        </select>
      </label>

      <Melding uitkomst={uitkomst} />
      <Verstuurknop label="Opslaan" bezig={bezig} />
    </form>
  );
}

// ---------------------------------------------------------------------------
// De methode van de school opgeven
// ---------------------------------------------------------------------------

export function MethodeOpgeven({
  kindId,
  methodes,
}: {
  kindId: string;
  methodes: Rekenmethode[];
}) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    geefMethodeOp,
    null,
  );
  const [methodeId, setMethodeId] = useState("");
  const [gezien, setGezien] = useState<string>("");

  return (
    <form action={verstuur} className="flex flex-col gap-4">
      <input type="hidden" name="kindId" value={kindId} />

      <label className="block">
        <span className="block text-sm font-medium">
          Welke rekenmethode gebruikt de klas?
        </span>
        <select
          name="methodeId"
          value={methodeId}
          onChange={(e) => setMethodeId(e.target.value)}
          className={`${VELD} mt-1.5`}
        >
          <option value="">Anders / weet ik niet</option>
          {methodes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.naam}
              {m.uitgever ? ` (${m.uitgever})` : ""}
            </option>
          ))}
        </select>
      </label>

      {methodeId === "" && (
        <label className="block">
          <span className="block text-sm font-medium">
            Weet je de naam wel? Schrijf hem hier op.
          </span>
          <span className="block text-xs text-beheer-zacht">
            Mag leeg blijven als je het echt niet weet.
          </span>
          <input name="andersTekst" className={`${VELD} mt-1.5`} />
        </label>
      )}

      <fieldset>
        <legend className="text-sm font-medium">Waar heb je dit gezien?</legend>
        <p className="text-xs text-beheer-zacht">
          Dit vragen we altijd, zodat we het kunnen controleren.
        </p>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {GEZIEN_WAAR.map((g) => (
            <label key={g.code} className="flex min-h-11 items-center gap-2.5 text-sm">
              <input
                type="radio"
                name="gezienWaar"
                value={g.code}
                checked={gezien === g.code}
                onChange={(e) => setGezien(e.target.value)}
                className="size-4 shrink-0 accent-[#5b3fd6]"
                required
              />
              {g.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="block text-sm font-medium">
          {gezien === "schoolgids"
            ? "Link naar de schoolgids, of het paginanummer"
            : "Toelichting (mag leeg blijven)"}
        </span>
        <input
          name="gezienLink"
          className={`${VELD} mt-1.5`}
          required={gezien === "schoolgids"}
        />
      </label>

      <p className="rounded-lg bg-beheer-vlak p-3 text-xs leading-relaxed text-beheer-zacht">
        Weet je het niet zeker? Kijk in de schoolgids (meestal op de website van
        de school onder &lsquo;documenten&rsquo;), op de kaft van het
        rekenwerkboek van je kind, of vraag het de leerkracht.
      </p>

      <p className="text-xs leading-relaxed text-beheer-zacht">
        We vragen geen foto. Op een kaft staat vaak de naam van je kind, en het
        omslag zelf is beschermd materiaal.
      </p>

      <Melding uitkomst={uitkomst} />
      <Verstuurknop label="Doorgeven" bezig={bezig} />
    </form>
  );
}

/** B5: de jaarlijkse vraag aan het begin van het schooljaar. */
export function Jaarcontrole({
  kindId,
  roepnaam,
}: {
  kindId: string;
  roepnaam: string;
}) {
  return (
    <section className="rounded-xl border border-viool/30 bg-viool-zacht p-4">
      <h2 className="text-sm font-semibold text-viool-diep">
        Klopt de groep en de methode nog?
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed">
        Er is een nieuw schooljaar begonnen. Kijk even of de groep en de
        rekenmethode van {roepnaam} nog kloppen.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <form action={bevestigJaarcontrole}>
          <input type="hidden" name="kindId" value={kindId} />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep"
          >
            Ja, dit klopt nog
          </button>
        </form>
        <Knop label="Groep wijzigen" href="/ouder/instellingen" stil />
      </div>
    </section>
  );
}
