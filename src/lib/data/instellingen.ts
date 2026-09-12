import "server-only";

/**
 * Instellingen die voor de hele app gelden.
 *
 * Een kleine sleutel-waardetabel. Bewust in de database en niet in code: zo is
 * het ook na livegang aan te passen zonder opnieuw uit te rollen, en het
 * verhuist mee naar Postgres.
 *
 * Elke instelling heeft hier een eigen functiepaar met een eigen grens, zodat
 * er nooit een onmogelijke waarde in belandt — ook niet als er ooit iets
 * rechtstreeks in de tabel wordt gezet.
 */

import { verbinding } from "@/lib/db/sqlite";

/** Wat een oefensessie telt als er niets is ingesteld. */
export const STANDAARD_VRAGEN_PER_SESSIE = 10;

/** Grenzen van het aantal vragen per sessie, overal hetzelfde. */
export const MIN_VRAGEN_PER_SESSIE = 1;
export const MAX_VRAGEN_PER_SESSIE = 50;

function lees(sleutel: string): string | null {
  const rij = verbinding()
    .prepare("select waarde from app_instellingen where sleutel = ?")
    .get(sleutel) as { waarde: string } | undefined;
  return rij?.waarde ?? null;
}

function schrijf(sleutel: string, waarde: string): void {
  verbinding()
    .prepare(
      `insert into app_instellingen (sleutel, waarde, bijgewerkt_op)
       values (?, ?, ?)
       on conflict (sleutel) do update set waarde = excluded.waarde,
                                           bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(sleutel, waarde, new Date().toISOString());
}

/** Binnen de grenzen houden; buiten bereik valt terug op de standaard. */
export function begrensAantal(waarde: unknown): number {
  const n = Math.round(Number(waarde));
  if (!Number.isFinite(n)) return STANDAARD_VRAGEN_PER_SESSIE;
  return Math.min(MAX_VRAGEN_PER_SESSIE, Math.max(MIN_VRAGEN_PER_SESSIE, n));
}

/**
 * Het algemene aantal vragen per oefensessie.
 *
 * Geldt voor elk leerdoel dat zelf geen eigen aantal heeft.
 */
export function haalAlgemeenAantalVragen(): number {
  const waarde = lees("vragen_per_sessie");
  return waarde === null ? STANDAARD_VRAGEN_PER_SESSIE : begrensAantal(waarde);
}

export function zetAlgemeenAantalVragen(aantal: number): number {
  const veilig = begrensAantal(aantal);
  schrijf("vragen_per_sessie", String(veilig));
  return veilig;
}
