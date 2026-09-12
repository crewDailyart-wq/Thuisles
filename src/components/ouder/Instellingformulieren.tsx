"use client";

/**
 * De formulieren van het instellingenscherm.
 *
 * Allemaal dezelfde vorm: velden onder elkaar, één knop, en daarboven een
 * melding in gewone taal — groen als het gelukt is, oranje als er iets mis is.
 * Nooit een technische foutcode.
 */

import { useActionState, useState } from "react";
import {
  verwijderJeAccount,
  verwijderKindprofiel,
  voegKindToe,
  wijzigInstellingen,
  wijzigKindprofiel,
} from "@/app/ouder/acties";
import { Knop } from "@/components/ouder/Bouwstenen";
import { Pictogram } from "@/components/kind/Pictogram";
import { AVATARS, STANDAARD_AVATAR } from "@/lib/avatars";
import { TALEN, type Kind, type Ouder } from "@/lib/types";

type Uitkomst = { fout: string } | { gelukt: string } | null;

const GROEPEN = [3, 4, 5, 6, 7, 8];

// ---------------------------------------------------------------------------
// Gedeelde onderdelen
// ---------------------------------------------------------------------------

const VELD =
  "h-11 w-full rounded-lg border border-beheer-rand bg-white px-3 text-sm outline-none transition focus:border-viool focus:ring-2 focus:ring-viool/20";

function Melding({ uitkomst }: { uitkomst: Uitkomst }) {
  if (!uitkomst) return null;

  const fout = "fout" in uitkomst;
  return (
    <p
      role="status"
      className={`rounded-lg border px-3 py-2.5 text-sm ${
        fout
          ? "border-oranje/40 bg-oranje-zacht text-oranje-diep"
          : "border-groen/40 bg-groen-zacht text-groen-diep"
      }`}
    >
      {fout ? uitkomst.fout : uitkomst.gelukt}
    </p>
  );
}

function Label({
  tekst,
  hulp,
  children,
}: {
  tekst: string;
  hulp?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{tekst}</span>
      {hulp && <span className="block text-xs text-beheer-zacht">{hulp}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
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

/** De avatarkeuze: zes vaste plaatjes, geen upload en geen foto. */
function Avatarkeuze({ standaard }: { standaard: string }) {
  const [gekozen, setGekozen] = useState(standaard);

  return (
    <fieldset>
      <legend className="text-sm font-medium">Avatar</legend>
      <input type="hidden" name="avatar" value={gekozen} />
      <div className="mt-1.5 flex flex-wrap gap-2">
        {AVATARS.map((a) => {
          const actief = a.naam === gekozen;
          return (
            <button
              key={a.naam}
              type="button"
              onClick={() => setGekozen(a.naam)}
              aria-pressed={actief}
              title={a.label}
              className={`grid size-12 place-items-center rounded-lg border transition ${
                actief
                  ? "border-viool bg-viool-zacht"
                  : "border-beheer-rand bg-white hover:border-viool"
              }`}
            >
              <Pictogram naam={a.naam} className="size-7" />
              <span className="sr-only">{a.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Kind toevoegen
// ---------------------------------------------------------------------------

/**
 * `altijdOpen` staat aan zolang er nog geen enkel kind is: dan is dit het enige
 * dat er te doen valt en hoeft er niet eerst op een knop geklikt te worden.
 */
export function KindToevoegen({ altijdOpen = false }: { altijdOpen?: boolean }) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    voegKindToe,
    null,
  );
  const [open, setOpen] = useState(altijdOpen);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-beheer-rand bg-white px-4 text-sm font-medium transition hover:border-viool hover:text-viool"
      >
        Kind toevoegen
      </button>
    );
  }

  return (
    <form action={verstuur} className="flex flex-col gap-4">
      <Label tekst="Roepnaam" hulp="Alleen de naam waarmee je je kind aanspreekt.">
        <input name="roepnaam" className={VELD} maxLength={40} required />
      </Label>

      <Label tekst="Groep" hulp="Bepaalt wat je kind te zien krijgt.">
        <select name="groep" defaultValue="" className={VELD} required>
          <option value="" disabled>
            Kies een groep
          </option>
          {GROEPEN.map((g) => (
            <option key={g} value={g}>
              Groep {g}
            </option>
          ))}
        </select>
      </Label>

      <Avatarkeuze standaard={STANDAARD_AVATAR} />

      <Label
        tekst="Kindcode (mag je leeg laten)"
        hulp="Vier cijfers, zodat broers en zussen niet in elkaars profiel komen."
      >
        <input
          name="kindcode"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          className={`${VELD} max-w-[8rem]`}
        />
      </Label>

      <Melding uitkomst={uitkomst} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Verstuurknop label="Kind toevoegen" bezig={bezig} />
        {!altijdOpen && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-beheer-rand bg-white px-4 text-sm font-medium transition hover:border-viool"
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Kind wijzigen en verwijderen
// ---------------------------------------------------------------------------

export function KindWijzigen({ kind }: { kind: Kind }) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    wijzigKindprofiel,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-col gap-4">
      <input type="hidden" name="kindId" value={kind.id} />

      <Label tekst="Roepnaam">
        <input
          name="roepnaam"
          defaultValue={kind.roepnaam}
          className={VELD}
          maxLength={40}
          required
        />
      </Label>

      <Label
        tekst="Groep"
        hulp="Wijzigen kan altijd. De voortgang blijft bewaard."
      >
        <select name="groep" defaultValue={String(kind.groep)} className={VELD}>
          {GROEPEN.map((g) => (
            <option key={g} value={g}>
              Groep {g}
            </option>
          ))}
        </select>
      </Label>

      <Avatarkeuze standaard={kind.avatar} />

      <Label
        tekst={kind.heeftKindcode ? "Nieuwe kindcode" : "Kindcode instellen"}
        hulp={
          kind.heeftKindcode
            ? "Laat leeg om de huidige code te houden."
            : "Vier cijfers. Mag je leeg laten."
        }
      >
        <input
          name="kindcode"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          className={`${VELD} max-w-[8rem]`}
        />
      </Label>

      {kind.heeftKindcode && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="kindcodeWeg"
            value="ja"
            className="size-4 accent-[#5b3fd6]"
          />
          Code helemaal weghalen
        </label>
      )}

      <Melding uitkomst={uitkomst} />
      <Verstuurknop label="Opslaan" bezig={bezig} />
    </form>
  );
}

export function KindVerwijderen({ kind }: { kind: Kind }) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    verwijderKindprofiel,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-col gap-3">
      <input type="hidden" name="kindId" value={kind.id} />
      <input type="hidden" name="roepnaam" value={kind.roepnaam} />

      <p className="text-sm leading-relaxed">
        Hiermee verdwijnt het profiel van {kind.roepnaam} met alle antwoorden en
        voortgang. Dit kan niet ongedaan worden gemaakt.
      </p>

      <Label tekst={`Typ ${kind.roepnaam} over om te bevestigen`}>
        <input name="bevestiging" className={`${VELD} max-w-xs`} required />
      </Label>

      <Melding uitkomst={uitkomst} />
      <button
        type="submit"
        disabled={bezig}
        className="inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-oranje/50 bg-white px-4 text-sm font-semibold text-oranje-diep transition hover:bg-oranje-zacht disabled:opacity-60"
      >
        {bezig ? "Even geduld…" : `Profiel van ${kind.roepnaam} verwijderen`}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export function AccountInstellingen({ ouder }: { ouder: Ouder }) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    wijzigInstellingen,
    null,
  );

  return (
    <form action={verstuur} className="flex flex-col gap-4">
      <Label tekst="Je naam" hulp="Mag leeg blijven.">
        <input
          name="weergavenaam"
          defaultValue={ouder.weergavenaam ?? ""}
          className={VELD}
        />
      </Label>

      <Label
        tekst="E-mailadres"
        hulp="Mag leeg blijven. Nodig zodra er ingelogd wordt, en later voor de weekbrief."
      >
        <input
          name="email"
          type="email"
          defaultValue={ouder.email ?? ""}
          className={VELD}
        />
      </Label>

      <Label
        tekst="Taal van de uitleg voor jou"
        hulp="Alleen voor wat jij leest. Je kind blijft Nederlands zien — dat is de taal van school."
      >
        <select name="taal" defaultValue={ouder.taal} className={VELD}>
          {TALEN.map((t) => (
            <option key={t.code} value={t.code}>
              {t.naam}
            </option>
          ))}
        </select>
      </Label>

      <p className="text-xs leading-relaxed text-beheer-zacht">
        De vertalingen zelf komen in een volgende fase. Je keuze wordt nu al
        bewaard.
      </p>

      <Melding uitkomst={uitkomst} />
      <Verstuurknop label="Opslaan" bezig={bezig} />
    </form>
  );
}

export function AccountVerwijderen() {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    verwijderJeAccount,
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        {/*
          Een gewone link, geen knop: het downloaden gebeurt op de server, waar
          opnieuw wordt gecontroleerd wie er is ingelogd.
        */}
        <Knop label="Gegevens downloaden" href="/ouder/gegevens" stil />
      </div>

      <form action={verstuur} className="flex flex-col gap-3 border-t border-beheer-rand-zacht pt-4">
        <p className="text-sm leading-relaxed">
          Je account verwijderen haalt alles weg: jouw gegevens, alle
          kindprofielen en alle antwoorden. Dit kan niet ongedaan worden
          gemaakt.
        </p>

        <Label tekst="Typ het woord verwijderen over om te bevestigen">
          <input name="bevestiging" className={`${VELD} max-w-xs`} required />
        </Label>

        <Melding uitkomst={uitkomst} />
        <button
          type="submit"
          disabled={bezig}
          className="inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-oranje/50 bg-white px-4 text-sm font-semibold text-oranje-diep transition hover:bg-oranje-zacht disabled:opacity-60"
        >
          {bezig ? "Even geduld…" : "Account verwijderen"}
        </button>
      </form>
    </div>
  );
}
