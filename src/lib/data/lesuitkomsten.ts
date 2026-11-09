import "server-only";

/**
 * Hoe een vraag in een les ging, met de denkfout erbij (besluit Sara, 9 november 2026).
 * De tabel `les_uitkomsten` staat in src/lib/db/sqlite.ts. Alleen wat daar genoemd wordt, wordt bewaard.
 */

import { verbinding } from "@/lib/db/sqlite";

export const UITKOMSTEN = ["goed in één keer", "goed na een fout", "samen gedaan"] as const;
export type LesUitkomst = (typeof UITKOMSTEN)[number];

export type UitkomstInvoer = {
  kindId: string;
  lesId: string;
  vraagId: string;
  uitkomst: LesUitkomst;
  /** Namen uit de fouttabel van de les; 'onduidelijk' wordt 'onbekend'. Leeg bij 'goed in één keer'. */
  denkfouten: string[];
  pogingen: number;
};

const ID = /^[a-z0-9-]{1,80}$/;
const NAAM = /^[a-z-]{1,40}$/;
/** Meer dan dit per kind per dag is geen echte les meer; dan stoppen we met bewaren. */
const MAX_PER_DAG = 500;

/** Bewaart 1 regel. Geeft false als de invoer niet klopt (dan wordt er niets bewaard). */
export function bewaarLesUitkomst(i: UitkomstInvoer): boolean {
  if (!ID.test(i.lesId) || !ID.test(i.vraagId)) return false;
  if (!(UITKOMSTEN as readonly string[]).includes(i.uitkomst)) return false;
  if (!Number.isInteger(i.pogingen) || i.pogingen < 1 || i.pogingen > 9) return false;
  const namen = [...new Set(i.denkfouten.map((n) => (n === "onduidelijk" ? "onbekend" : n)))].slice(0, 6);
  if (namen.some((n) => !NAAM.test(n))) return false;
  if (i.uitkomst === "goed in één keer" && namen.length) return false;

  const d = verbinding();
  const vandaag = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { n } = d.prepare("select count(*) as n from les_uitkomsten where kind_id = ? and gemaakt_op > ?").get(i.kindId, vandaag) as { n: number };
  if (n >= MAX_PER_DAG) return false;

  d.prepare("insert into les_uitkomsten (kind_id, les_id, vraag_id, uitkomst, denkfout, pogingen, gemaakt_op) values (?, ?, ?, ?, ?, ?, ?)").run(
    i.kindId,
    i.lesId,
    i.vraagId,
    i.uitkomst,
    namen.length ? namen.join(",") : null,
    i.pogingen,
    new Date().toISOString(),
  );
  return true;
}
