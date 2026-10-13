/**
 * De gratis niveautest samenstellen, per groep.
 *
 * Een toets is een rijtje onderdelen: elk een bestaand leerdoel met een aantal
 * vragen en eventueel het referentieniveau waar het bij hoort. De vragen zijn
 * de gepubliceerde vragen van dat leerdoel; hier wordt niets nieuws gemaakt.
 * Een groep zonder onderdelen heeft geen toets, en zolang geen enkele groep er
 * een heeft, staat de niveautest nergens op de site.
 */

import Link from "next/link";
import { Kop, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Niveautestformulier, OnderdeelWeghalen } from "@/components/beheer/Niveautestformulier";
import {
  verschuifToetsonderdeel,
  verwijderToetsonderdeelActie,
  wijzigToetsonderdeel,
} from "@/app/admin/niveautestacties";
import {
  alleOnderdelen,
  groepenMetToets,
  leerdoelenVoorToets,
  MAX_AANTAL,
  MIN_AANTAL,
  TOETSGROEPEN,
  TOETSNIVEAUS,
} from "@/lib/data/niveautest";
import { GRENS_BEHEERST, GRENS_BIJNA, GRENS_NIVEAU } from "@/lib/niveautest-uitslag";

export const dynamic = "force-dynamic";

const procent = (n: number) => `${Math.round(n * 100)}%`;

export default function NiveautestBeheer() {
  const onderdelen = alleOnderdelen();
  const metToets = groepenMetToets();
  const leerdoelen = leerdoelenVoorToets().map((l) => ({
    id: l.id,
    label: `${l.code} · ${l.titel} (groep ${l.groepVan === l.groepTot ? l.groepVan : `${l.groepVan}–${l.groepTot}`})`,
    groep: `${l.vakNaam} · ${l.domeinNaam}`,
  }));

  return (
    <div className="flex flex-col gap-5">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Niveautest" }]}
        titel="Niveautest"
        bijschrift={
          metToets.length > 0
            ? `Gratis op de openbare site. Groepen met een toets: ${metToets.join(", ")}.`
            : "Gratis op de openbare site. Nog geen enkele groep heeft een toets, dus de niveautest staat nergens op de site."
        }
        acties={
          metToets.length > 0 ? (
            <Link href="/niveautest" className={stijl.knopStil} target="_blank">
              Bekijken op de site
            </Link>
          ) : undefined
        }
      />

      <Paneel
        titel="Onderdeel toevoegen"
        bijschrift="Kies een bestaand leerdoel. De toets neemt willekeurig het aantal vragen dat je kiest uit de gepubliceerde vragen; vragen voor de gekozen groep gaan voor."
      >
        {leerdoelen.length === 0 ? (
          <Leeg tekst="Er zijn nog geen leerdoelen." hint="Maak eerst leerdoelen en vragen aan; daarna kun je ze hier in een toets zetten." />
        ) : (
          <Niveautestformulier leerdoelen={leerdoelen} groepen={TOETSGROEPEN} niveaus={TOETSNIVEAUS} max={MAX_AANTAL} />
        )}
      </Paneel>

      <Paneel titel="Zo wordt de uitslag bepaald">
        <ul className="list-disc space-y-1 pl-5 text-sm text-beheer-zacht">
          <li>
            Per onderdeel: {procent(GRENS_BEHEERST)} of meer goed is <strong>beheerst</strong>, {procent(GRENS_BIJNA)} of meer
            is <strong>bijna</strong>, minder is <strong>nog oefenen</strong>.
          </li>
          <li>
            Per referentieniveau (alle onderdelen met dat niveau samen): {procent(GRENS_NIVEAU)} of meer goed is{" "}
            <strong>beheerst</strong>. Onderdelen zonder niveau tellen alleen per onderdeel mee.
          </li>
          <li>
            Er wordt niets bewaard: geen antwoorden en geen uitslag. Vragen waarbij Vos meebeweegt, de bus, de
            kralenrij, een Godot-spel, een bosspel of een uitleg-les doen niet mee in de toets; in de oefeningen blijven
            ze gewoon staan.
          </li>
        </ul>
      </Paneel>

      {TOETSGROEPEN.map((groep) => {
        const rij = onderdelen.filter((o) => o.groep === groep);
        const totaal = rij.reduce((n, o) => n + Math.min(o.aantal, o.bruikbaar), 0);
        return (
          <Paneel
            key={groep}
            titel={`Groep ${groep}`}
            bijschrift={
              rij.length === 0
                ? "Geen toets."
                : `${rij.length} ${rij.length === 1 ? "onderdeel" : "onderdelen"}, ${totaal} ${totaal === 1 ? "vraag" : "vragen"}.`
            }
            acties={
              metToets.includes(groep) ? (
                <Link href={`/niveautest/${groep}`} className={stijl.link} target="_blank">
                  Toets maken
                </Link>
              ) : undefined
            }
            geenVulling
          >
            {rij.length === 0 ? (
              <Leeg tekst={`Groep ${groep} heeft nog geen toets.`} hint="Voeg hierboven een onderdeel toe." />
            ) : (
              <table className="w-full text-sm">
                <Tabelkop kolommen={["", "Leerdoel", "Vragen en niveau", "Volgorde", ""]} />
                <tbody>
                  {rij.map((o, i) => (
                    <tr key={o.id} className="border-b border-beheer-rand align-top last:border-0">
                      <td className="w-8 px-3 py-2 text-beheer-zacht">{i + 1}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium">{o.leerdoelTitel}</span>
                        <span className="block text-xs text-beheer-zacht">
                          {o.leerdoelCode} · {o.vakNaam} › {o.domeinNaam} › {o.subdomeinNaam}
                        </span>
                        {o.bruikbaar < o.aantal && (
                          <span className="mt-0.5 block text-xs text-roze">
                            {o.bruikbaar === 0
                              ? "Geen vragen die in de toets passen; dit onderdeel wordt overgeslagen."
                              : `Maar ${o.bruikbaar} ${o.bruikbaar === 1 ? "vraag past" : "vragen passen"} in de toets; het onderdeel krijgt er zoveel.`}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <form action={wijzigToetsonderdeel} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="id" value={o.id} />
                          <label className="flex items-center gap-1.5">
                            <span className="sr-only">Aantal vragen</span>
                            <input
                              name="aantal"
                              type="number"
                              min={MIN_AANTAL}
                              max={MAX_AANTAL}
                              defaultValue={o.aantal}
                              required
                              className={`${stijl.veldSmal} w-16`}
                            />
                            <span className="text-xs text-beheer-zacht">vragen</span>
                          </label>
                          <label>
                            <span className="sr-only">Referentieniveau</span>
                            <select name="niveau" defaultValue={o.niveau} className={stijl.veldSmal}>
                              <option value="">Geen niveau</option>
                              {TOETSNIVEAUS.map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button type="submit" className={stijl.knopStil}>
                            Opslaan
                          </button>
                        </form>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {(["op", "neer"] as const).map((richting) => (
                            <form key={richting} action={verschuifToetsonderdeel}>
                              <input type="hidden" name="id" value={o.id} />
                              <input type="hidden" name="richting" value={richting} />
                              <button
                                type="submit"
                                className={`${stijl.knopStil} disabled:opacity-40`}
                                disabled={richting === "op" ? i === 0 : i === rij.length - 1}
                                aria-label={richting === "op" ? "Eén plek omhoog" : "Eén plek omlaag"}
                              >
                                {richting === "op" ? "↑" : "↓"}
                              </button>
                            </form>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <OnderdeelWeghalen id={o.id} titel={o.leerdoelTitel} groep={groep} actie={verwijderToetsonderdeelActie} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Paneel>
        );
      })}
    </div>
  );
}
