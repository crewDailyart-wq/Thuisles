/**
 * Wie gaat er oefenen?
 *
 * De ouder is ingelogd en geeft het apparaat aan een kind. Er wordt hier dus
 * geen nieuw account geopend: er wordt een profiel gekozen binnen het
 * ouderaccount.
 *
 * Heeft een profiel een kindcode, dan wordt daar eerst om gevraagd. Dat is een
 * drempel tussen broers en zussen, geen beveiliging — de echte grens ligt bij
 * het ouderaccount.
 */

import Link from "next/link";
import { kiesProfiel, openProfiel } from "@/app/(toegang)/acties";
import { Kaart, Toegangsformulier, Veld } from "@/app/(toegang)/Formulier";
import { Pictogram } from "@/components/kind/Pictogram";
import { vereisOuder } from "@/lib/auth/sessie";
import { haalKinderen } from "@/lib/data/kinderen";

export default async function KiesPagina({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const ouder = await vereisOuder();
  const kinderen = haalKinderen(ouder.id);
  const { kind: gevraagdId } = await searchParams;

  // Nog geen profielen: eerst een kind toevoegen in de ouderomgeving.
  if (kinderen.length === 0) {
    return (
      <Kaart
        titel="Nog geen profiel"
        uitleg="Voeg eerst een kind toe. Dat doe je in je eigen omgeving, bij Instellingen."
      >
        <Link
          href="/ouder/instellingen"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep"
        >
          Kind toevoegen
        </Link>
      </Kaart>
    );
  }

  // Om een kindcode gevraagd worden gebeurt op hetzelfde scherm.
  const wachtOpCode = kinderen.find((k) => k.id === gevraagdId && k.heeftKindcode);

  if (wachtOpCode) {
    return (
      <>
        <Kaart
          titel={`Hoi ${wachtOpCode.roepnaam}!`}
          uitleg="Typ je code van vier cijfers om verder te gaan."
        >
          <Toegangsformulier actie={kiesProfiel} knop="Verder">
            <input type="hidden" name="kindId" value={wachtOpCode.id} />
            <Veld
              label="Jouw code"
              naam="kindcode"
              soort="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              required
            />
          </Toegangsformulier>
        </Kaart>

        <p className="mt-4 text-center text-sm">
          <Link href="/kies" className="text-beheer-zacht hover:underline">
            Toch een ander profiel
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <Kaart titel="Wie gaat er oefenen?" uitleg="Kies je eigen profiel.">
        <ul className="flex flex-col gap-2">
          {kinderen.map((kind) => (
            <li key={kind.id}>
              {/*
                Een formulier per kind: zo gaat de keuze via de server, waar
                gecontroleerd wordt of dit profiel wel bij deze ouder hoort.
              */}
              <form action={openProfiel}>
                <input type="hidden" name="kindId" value={kind.id} />
                <button
                  type="submit"
                  className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-beheer-rand bg-white px-3 text-left transition hover:border-viool"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-viool-zacht">
                    <Pictogram naam={kind.avatar} className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block font-semibold leading-tight">
                      {kind.roepnaam}
                    </span>
                    <span className="block text-xs text-beheer-zacht">
                      Groep {kind.groep}
                      {kind.heeftKindcode ? " · met code" : ""}
                    </span>
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </Kaart>

      <p className="mt-4 text-center text-sm text-beheer-zacht">
        <Link href="/ouder/overzicht" className="hover:underline">
          Naar je eigen omgeving
        </Link>
      </p>
    </>
  );
}
