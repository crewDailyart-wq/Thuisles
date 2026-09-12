"use client";

/**
 * Snel een domein, onderwerp of leerdoel aanmaken zonder het vraagformulier te
 * verlaten.
 *
 * Klapt open onder de leerdoelkeuze. Je kiest waar het onder komt te hangen,
 * typt een naam, en het nieuwe leerdoel staat meteen in de lijst én is
 * geselecteerd. Handig als je tijdens het invoeren van vragen merkt dat er nog
 * iets ontbreekt.
 */

import { useState, useTransition } from "react";
import {
  nieuwDomein,
  nieuwLeerdoel,
  nieuwSubdomein,
} from "@/app/admin/structuuracties";
import type { LeerdoelRegel } from "@/lib/data/vragen";

const veld =
  "w-full rounded-md border border-beheer-rand bg-white px-2.5 py-1.5 text-sm outline-none transition placeholder:text-beheer-zacht/70 focus:border-viool focus:ring-2 focus:ring-viool/20";
/** Zelfde uiterlijk, maar zonder vaste breedte. */
const veldSmal =
  "rounded-md border border-beheer-rand bg-white px-2 py-1.5 text-sm outline-none transition focus:border-viool focus:ring-2 focus:ring-viool/20";

type Niveau = "leerdoel" | "onderwerp" | "domein";

export function SnelLeerdoel({
  vakId,
  leerdoelen,
  onNieuwLeerdoel,
  onStructuurGewijzigd,
}: {
  vakId: string;
  /** De huidige lijst, om domein en onderwerp uit te kunnen kiezen. */
  leerdoelen: LeerdoelRegel[];
  /** Wordt aangeroepen met het nieuwe leerdoel, zodat het meteen gekozen wordt. */
  onNieuwLeerdoel: (regel: LeerdoelRegel) => void;
  /** Vraagt het scherm om de lijsten opnieuw op te halen. */
  onStructuurGewijzigd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [niveau, setNiveau] = useState<Niveau>("leerdoel");
  const [fout, setFout] = useState("");
  const [bezig, start] = useTransition();

  // Unieke domeinen en onderwerpen uit de bestaande leerdoelen.
  const domeinen = [...new Map(leerdoelen.map((l) => [l.domeinSlug, l])).values()];
  const [domeinSlug, setDomeinSlug] = useState(domeinen[0]?.domeinSlug ?? "");

  const onderwerpen = [
    ...new Map(
      leerdoelen
        .filter((l) => l.domeinSlug === domeinSlug)
        .map((l) => [l.subdomeinNaam, l]),
    ).values(),
  ];
  const [subdomeinId, setSubdomeinId] = useState("");

  const gekozenSub =
    subdomeinId ||
    leerdoelen.find((l) => l.subdomeinNaam === onderwerpen[0]?.subdomeinNaam)?.id;

  /** Zoekt het id van een onderwerp op via een leerdoel dat eronder hangt. */
  function subdomeinIdVan(naam: string): string | undefined {
    return leerdoelen.find(
      (l) => l.domeinSlug === domeinSlug && l.subdomeinNaam === naam,
    )?.subdomeinId;
  }


  function verstuur(data: FormData) {
    setFout("");
    start(async () => {
      if (niveau === "domein") {
        data.set("vakId", vakId);
        const u = await nieuwDomein(data);
        if (!u.ok) return setFout(u.fout);
        onStructuurGewijzigd();
        setOpen(false);
        return;
      }

      if (niveau === "onderwerp") {
        const u = await nieuwSubdomein(data);
        if (!u.ok) return setFout(u.fout);
        onStructuurGewijzigd();
        setOpen(false);
        return;
      }

      const u = await nieuwLeerdoel(data);
      if (!u.ok) return setFout(u.fout);

      const bron = leerdoelen.find((l) => l.subdomeinId === data.get("subdomeinId"));
      onNieuwLeerdoel({
        id: u.waarde.id,
        code: u.waarde.code,
        titel: u.waarde.titel,
        groepVan: u.waarde.groepVan,
        groepTot: u.waarde.groepTot,
        subdomeinNaam: bron?.subdomeinNaam ?? "",
        subdomeinSlug: bron?.subdomeinSlug ?? "",
        subdomeinId: String(data.get("subdomeinId")),
        domeinId: bron?.domeinId ?? "",
        domeinNaam: bron?.domeinNaam ?? "",
        domeinSlug: bron?.domeinSlug ?? "",
        vakNaam: bron?.vakNaam ?? "",
        vakSlug: bron?.vakSlug ?? "",
        aantalVragen: 0,
      });
      onStructuurGewijzigd();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 text-xs font-medium text-viool transition hover:underline"
      >
        + Staat het er niet bij? Maak het hier aan
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-viool/30 bg-viool/5 p-3">
      <div className="mb-2 flex flex-wrap gap-1">
        {(
          [
            ["leerdoel", "Leerdoel"],
            ["onderwerp", "Onderwerp"],
            ["domein", "Domein"],
          ] as const
        ).map(([sleutel, label]) => (
          <button
            key={sleutel}
            type="button"
            onClick={() => setNiveau(sleutel)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
              niveau === sleutel
                ? "bg-viool text-white"
                : "text-beheer-zacht hover:text-viool"
            }`}
          >
            Nieuw {label.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bewust geen <form>: dit staat binnen het vraagformulier. */}
      <div className="flex flex-col gap-2">
        {niveau !== "domein" && (
          <label className="block">
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              Domein
            </span>
            <select
              value={domeinSlug}
              onChange={(e) => {
                setDomeinSlug(e.target.value);
                setSubdomeinId("");
              }}
              className={veld}
            >
              {domeinen.map((d) => (
                <option key={d.domeinSlug} value={d.domeinSlug}>
                  {d.domeinNaam}
                </option>
              ))}
            </select>
          </label>
        )}

        {niveau === "leerdoel" && (
          <label className="block">
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              Onderwerp
            </span>
            <select
              value={gekozenSub ?? ""}
              onChange={(e) => setSubdomeinId(e.target.value)}
              className={veld}
            >
              {onderwerpen.map((o) => (
                <option
                  key={o.subdomeinNaam}
                  value={subdomeinIdVan(o.subdomeinNaam) ?? ""}
                >
                  {o.subdomeinNaam}
                </option>
              ))}
            </select>
          </label>
        )}

        <SnelVelden
          niveau={niveau}
          bezig={bezig}
          onVerstuur={(data) => {
            if (niveau === "leerdoel") {
              data.set("subdomeinId", subdomeinIdVan(
                onderwerpen.find((o) => subdomeinIdVan(o.subdomeinNaam) === gekozenSub)
                  ?.subdomeinNaam ?? "",
              ) ?? String(gekozenSub ?? ""));
            }
            if (niveau === "onderwerp") {
              const domeinId = leerdoelen.find((l) => l.domeinSlug === domeinSlug)
                ?.domeinId;
              data.set("domeinId", domeinId ?? "");
            }
            verstuur(data);
          }}
          onAnnuleer={() => setOpen(false)}
        />

        {fout && (
          <p className="rounded border border-roze/40 bg-roze-zacht px-2 py-1 text-xs font-medium text-roze">
            {fout}
          </p>
        )}
      </div>
    </div>
  );
}

function SnelVelden({
  niveau,
  bezig,
  onVerstuur,
  onAnnuleer,
}: {
  niveau: Niveau;
  bezig: boolean;
  onVerstuur: (data: FormData) => void;
  onAnnuleer: () => void;
}) {
  const [naam, setNaam] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [van, setVan] = useState(4);
  const [tot, setTot] = useState(5);

  function versturen() {
    const data = new FormData();
    if (niveau === "leerdoel") {
      data.set("titel", naam);
      data.set("groepVan", String(van));
      data.set("groepTot", String(tot));
    } else {
      data.set("naam", naam);
      data.set("omschrijving", omschrijving);
      if (niveau === "domein") data.set("actief", "aan");
    }
    onVerstuur(data);
  }

  return (
    <>
      <input
        autoFocus
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            versturen();
          }
        }}
        placeholder={niveau === "leerdoel" ? "Titel van het leerdoel" : "Naam"}
        className={veld}
      />

      {niveau !== "leerdoel" && (
        <input
          value={omschrijving}
          onChange={(e) => setOmschrijving(e.target.value)}
          placeholder="Korte omschrijving"
          className={veld}
        />
      )}

      {niveau === "leerdoel" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-beheer-zacht">groep</span>
          <select value={van} onChange={(e) => setVan(Number(e.target.value))} className={veldSmal}>
            {[3, 4, 5, 6, 7, 8].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <span className="text-xs text-beheer-zacht">t/m</span>
          <select value={tot} onChange={(e) => setTot(Number(e.target.value))} className={veldSmal}>
            {[3, 4, 5, 6, 7, 8].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      )}

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={versturen}
          disabled={bezig || naam.trim() === ""}
          className="inline-flex h-8 items-center rounded-md bg-viool px-3 text-xs font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
        >
          {bezig ? "Bezig…" : "Aanmaken"}
        </button>
        <button
          type="button"
          onClick={onAnnuleer}
          className="inline-flex h-8 items-center rounded-md border border-beheer-rand px-3 text-xs font-medium transition hover:border-viool hover:text-viool"
        >
          Annuleren
        </button>
      </div>
    </>
  );
}
