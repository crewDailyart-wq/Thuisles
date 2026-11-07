import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import s from "./rondjecontrole.module.css";

/**
 * Rondje-controle (BOUWREGELS 7.8 en 12.13): schermfoto's van `npm run rondjecontrole`, per les per zin
 * van Bliepo, met het oordeel uit rondje-oordelen.json. Alleen op de laptop (deze pagina is er niet online).
 */
type Foto = { bestand: string; label: string; na_ms: number };
type Opname = { nr?: number; route?: string; tekst?: string; fotos?: Foto[]; fout?: string };
type Oordeel = { onderwerp?: string; oordeel?: "goed" | "fout" | "open"; opmerking?: string };

const MAP = join(process.cwd(), "public", "rondje-controle");

export function RondjeControle() {
  if (!existsSync(MAP)) return null;
  /* Alle bestanden rondje-oordelen*.json worden samengevoegd (elke controleur schrijft zijn eigen bestand). */
  let oordelen: Record<string, Oordeel> = {};
  const hier = join(process.cwd(), "src/app/voorbeeld/lessen-bijhouden");
  for (const f of readdirSync(hier).filter((n) => /^rondje-oordelen.*\.json$/.test(n)).sort()) {
    try {
      oordelen = { ...oordelen, ...JSON.parse(readFileSync(join(hier, f), "utf8")) };
    } catch {}
  }
  const lessen = readdirSync(MAP, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(MAP, d.name, "opnames.json")))
    .map((d) => {
      const data = JSON.parse(readFileSync(join(MAP, d.name, "opnames.json"), "utf8")) as { id: string; gemaakt: string; opnames: Opname[] };
      return { id: d.name, gemaakt: data.gemaakt, opnames: data.opnames, ...oordelen[d.name] };
    })
    .sort((a, b) => (a.onderwerp ?? "").localeCompare(b.onderwerp ?? "") || a.id.localeCompare(b.id));
  if (!lessen.length) return null;
  const tel = (o: string) => lessen.filter((l) => (l.oordeel ?? "open") === o).length;
  return (
    <section className={s.sectie} aria-labelledby="rondje-kop">
      <h2 id="rondje-kop">Rondje-controle</h2>
      <p>
        Het rondje moet precies volgen wat Bliepo zegt: één rondje tegelijk, op het ding waar Bliepo het over heeft, op het moment dat hij het noemt. Per les per zin van Bliepo: een foto kort na het begin, daarna elke 1,5 seconde, en vlak voor het einde.
        {" "}
        <strong>{lessen.length}</strong> lessen bekeken: <strong>{tel("goed")}</strong> goed, <strong>{tel("fout")}</strong> niet goed, <strong>{tel("open")}</strong> nog niet beoordeeld.
      </p>
      <ul className={s.lessen}>
        {lessen.map((l) => (
          <li key={l.id} className={`${s.les} ${l.oordeel === "goed" ? s.goed : l.oordeel === "fout" ? s.fout : ""}`}>
            <details>
              <summary>
                <span className={s.titel}>{l.onderwerp ? `${l.onderwerp} · ` : ""}{l.id}</span>
                <span className={s.badge}>{l.oordeel === "goed" ? "goed" : l.oordeel === "fout" ? "niet goed" : "nog niet beoordeeld"}</span>
              </summary>
              {l.opmerking && <p className={s.opmerking}>{l.opmerking}</p>}
              <p className={s.link}>
                <a href={`/voorbeeld/les/${l.id}?naam=Testkind`}>Open de les</a> · gemaakt {new Date(l.gemaakt).toLocaleString("nl-NL")}
              </p>
              <ol className={s.zinnen}>
                {l.opnames.map((o, i) =>
                  o.fout ? (
                    <li key={i} className={s.opnameFout}>Fout bij opnemen: {o.fout}</li>
                  ) : (
                    <li key={i}>
                      <p className={s.zin}>
                        <b>{o.route === "fout" ? "Na een fout antwoord, zin" : "Zin"} {o.nr}:</b> {o.tekst}
                      </p>
                      <div className={s.fotos}>
                        {(o.fotos ?? []).map((f) => (
                          <figure key={f.bestand}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/rondje-controle/${l.id}/${f.bestand}`} alt={`Zin ${o.nr}, ${f.label}`} loading="lazy" />
                            <figcaption>{f.label === "begin" ? "begin van de zin" : f.label === "einde" ? "einde van de zin (voor Verder)" : `${f.label.replace("na-", "na ").replace("fijn-", "na ").replace("voor-antwoord", "net voor het antwoord").replace("-antwoord", " antwoord gegeven")}`}</figcaption>
                          </figure>
                        ))}
                      </div>
                    </li>
                  ),
                )}
              </ol>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
