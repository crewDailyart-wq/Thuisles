/**
 * De verificatiewachtrij.
 *
 * Wat ouders opgeven over de methode van hun school komt hier binnen. Het
 * wordt PAS "Geverifieerd door Thuisles" als het hier bevestigd wordt, met een
 * bron en een datum erbij. Tot die tijd zien alle ouders de stand "opgegeven
 * door een ouder, nog niet geverifieerd".
 *
 * De volgorde is niet willekeurig: scholen met de meeste kinderen staan
 * bovenaan, want daar raakt een bevestiging de meeste gezinnen.
 */

import Link from "next/link";
import { Kop, Leeg, Paneel, stijl } from "@/components/beheer/Bouwstenen";
import { Bevestigen } from "@/components/beheer/Schoolformulieren";
import { BevestigVoorstel } from "@/components/beheer/Zoekerformulieren";
import { laterVoorstel, wijsAf, wijsVoorstelAf } from "@/app/admin/schoolacties";
import { haalMethodes } from "@/lib/data/methodes";
import { haalWachtrij } from "@/lib/data/scholen";
import { haalVoorstellen } from "@/lib/data/zoeker";
import { GEZIEN_WAAR } from "@/lib/types";

function gezienLabel(code: string) {
  return GEZIEN_WAAR.find((g) => g.code === code)?.label ?? code;
}

function datum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function VerificatiesPagina() {
  const wachtrij = haalWachtrij();
  const voorstellen = haalVoorstellen();
  const methodes = haalMethodes(true);

  return (
    <div className="flex flex-col gap-5">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Verificaties" }]}
        titel="Verificatiewachtrij"
        bijschrift={`${wachtrij.length} school${wachtrij.length === 1 ? "" : "en"} met opgaven van ouders en ${voorstellen.length} met een voorstel van de zoeker, de belangrijkste eerst.`}
      />

      {/*
        Voorstellen van de zoeker. Deze status is intern: ouders zien er niets
        van en blijven "Rekenmethode nog niet bekend" zien tot hier bevestigd
        wordt.
      */}
      {voorstellen.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">
              Voorstel van de zoeker ({voorstellen.length})
            </h2>
            <Link href="/admin/zoeker" className={stijl.link}>
              Naar de zoeker
            </Link>
          </div>

          <p className="rounded-lg border border-beheer-rand bg-beheer-kaart px-3 py-2 text-xs leading-relaxed text-beheer-zacht">
            Automatisch gevonden op de website van de school. Dit is een
            voorstel, geen verificatie: <strong>ouders zien hier niets van</strong>{" "}
            en blijven &ldquo;Rekenmethode nog niet bekend&rdquo; zien totdat jij
            bevestigt.
          </p>

          {voorstellen.map(({ school, aantalKinderen, voorstellen: lijst }) => (
            <Paneel
              key={school.id}
              titel={school.naam}
              bijschrift={`${school.plaats} · ${school.postcode} · BRIN ${school.brin}`}
              acties={
                <span className="flex items-center gap-2 text-xs text-beheer-zacht">
                  <span className="rounded bg-beheer-vlak px-1.5 py-0.5 font-medium">
                    {aantalKinderen} kind{aantalKinderen === 1 ? "" : "eren"}
                  </span>
                  {school.website && (
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-viool"
                    >
                      website
                    </a>
                  )}
                </span>
              }
            >
              {/*
                Meerdere vondsten op één site (bijvoorbeeld een oude en een
                nieuwe schoolgids) staan allemaal onder elkaar, met jaartal.
                De beheerder kiest.
              */}
              <ul className="flex flex-col gap-2.5">
                {lijst.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-md border border-beheer-rand bg-beheer-vlak/60 p-3"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-medium">
                        {v.methode?.naam ?? "Onbekende methode"}
                      </p>
                      {v.jaartal && (
                        <span className="rounded bg-white px-1.5 py-0.5 text-[0.68rem] tabular-nums text-beheer-zacht">
                          {v.jaartal}
                        </span>
                      )}
                      <span className="rounded bg-white px-1.5 py-0.5 text-[0.68rem] text-beheer-zacht">
                        {v.bronSoort === "schoolgids" ? "schoolgids" : "pagina"}
                      </span>
                      {v.status === "later" && (
                        <span className="rounded bg-white px-1.5 py-0.5 text-[0.68rem] text-beheer-zacht">
                          voor later
                        </span>
                      )}
                    </div>

                    {/* De gevonden zin. Dit is het enige dat bewaard is. */}
                    <blockquote className="mt-1.5 border-l-2 border-beheer-rand pl-2.5 text-xs italic leading-relaxed">
                      {v.zin}
                    </blockquote>

                    <a
                      href={v.bronLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 block break-all text-xs text-viool hover:underline"
                    >
                      {v.bronLink}
                    </a>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {v.methode && (
                        <BevestigVoorstel
                          voorstelId={v.id}
                          methodenaam={v.methode.naam}
                        />
                      )}
                      <form action={wijsVoorstelAf}>
                        <input type="hidden" name="voorstelId" value={v.id} />
                        <button type="submit" className={stijl.knopStil}>
                          Afwijzen
                        </button>
                      </form>
                      {v.status !== "later" && (
                        <form action={laterVoorstel}>
                          <input type="hidden" name="voorstelId" value={v.id} />
                          <button type="submit" className={stijl.knopStil}>
                            Later
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Paneel>
          ))}
        </section>
      )}

      {voorstellen.length > 0 && wachtrij.length > 0 && (
        <h2 className="text-sm font-semibold">Opgegeven door ouders ({wachtrij.length})</h2>
      )}

      {wachtrij.length === 0 && voorstellen.length === 0 ? (
        <Leeg
          tekst="Niets te doen."
          hint="Zodra een ouder een rekenmethode opgeeft of de zoeker iets vindt, verschijnt die school hier."
        />
      ) : wachtrij.length === 0 ? (
        <p className="text-sm text-beheer-zacht">
          Geen openstaande opgaven van ouders.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {wachtrij.map(({ school, status, aantalKinderen, opgaven }) => {
            const totaal = opgaven.reduce((n, o) => n + o.aantal, 0);
            const leidend = opgaven[0];

            return (
              <Paneel
                key={school.id}
                titel={school.naam}
                bijschrift={`${school.plaats} · ${school.postcode} · BRIN ${school.brin}`}
                acties={
                  <span className="flex items-center gap-2 text-xs text-beheer-zacht">
                    <span className="rounded bg-beheer-vlak px-1.5 py-0.5 font-medium">
                      {aantalKinderen} kind{aantalKinderen === 1 ? "" : "eren"}
                    </span>
                    <span className="rounded bg-beheer-vlak px-1.5 py-0.5 font-medium">
                      {totaal} opgave{totaal === 1 ? "" : "n"}
                    </span>
                  </span>
                }
              >
                <div className="flex flex-col gap-4">
                  {status.herkomst === "geverifieerd" && (
                    <p className="rounded-md border border-groen/40 bg-groen-zacht px-2.5 py-2 text-xs text-groen-diep">
                      Deze school staat al geverifieerd op{" "}
                      <strong>{status.methode?.naam}</strong>. Bevestigen
                      overschrijft dat.
                    </p>
                  )}

                  {/* Wat ouders hebben opgegeven, met de teller per methode. */}
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
                      Opgegeven door ouders
                    </p>
                    <ul className="flex flex-col gap-2">
                      {opgaven.map((o, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-beheer-rand bg-beheer-vlak/60 p-2.5"
                        >
                          <p className="text-sm font-medium">
                            {o.methode?.naam ?? (
                              <span className="text-beheer-zacht">
                                Anders / weet ik niet
                                {o.andersTekst ? `: ${o.andersTekst}` : ""}
                              </span>
                            )}
                            <span className="ml-1.5 rounded bg-white px-1.5 py-0.5 text-[0.68rem] tabular-nums text-beheer-zacht">
                              {o.aantal}×
                            </span>
                          </p>
                          <ul className="mt-1.5 flex flex-col gap-1">
                            {o.bewijzen.map((b, j) => (
                              <li key={j} className="text-xs text-beheer-zacht">
                                {gezienLabel(b.gezienWaar)}
                                {b.gezienLink && (
                                  <>
                                    {" — "}
                                    {b.gezienLink.startsWith("http") ? (
                                      <a
                                        href={b.gezienLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-viool hover:underline"
                                      >
                                        {b.gezienLink}
                                      </a>
                                    ) : (
                                      b.gezienLink
                                    )}
                                  </>
                                )}
                                {" · "}
                                {datum(b.gemaaktOp)}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bevestigen, met bron. */}
                  <div className="border-t border-beheer-rand-zacht pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
                      Bevestigen
                    </p>
                    <Bevestigen
                      schoolId={school.id}
                      methodes={methodes}
                      voorgesteldeMethodeId={leidend?.methode?.id}
                    />
                  </div>

                  {/* Afwijzen of laten staan. */}
                  <div className="flex flex-wrap items-center gap-3 border-t border-beheer-rand-zacht pt-3">
                    <form action={wijsAf}>
                      <input type="hidden" name="schoolId" value={school.id} />
                      <button type="submit" className={stijl.knopStil}>
                        Afwijzen
                      </button>
                    </form>
                    <p className="text-xs text-beheer-zacht">
                      Niets doen mag ook: de school blijft dan in de wachtrij
                      staan en ouders zien &lsquo;nog niet geverifieerd&rsquo;.
                    </p>
                  </div>
                </div>
              </Paneel>
            );
          })}
        </div>
      )}
    </div>
  );
}
