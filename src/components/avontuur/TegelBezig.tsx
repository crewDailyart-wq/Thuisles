"use client";

/**
 * Meteen iets zien als je op een tegel of knop tikt.
 *
 * De schermen van het kind worden per kind op de server opgebouwd. Op een
 * trage verbinding kan het even duren voordat de volgende pagina er is, en
 * dan lijkt het alsof er niets gebeurt. Zolang de pagina laadt, licht de tegel
 * zacht op en neer. Altijd aanwezig en alleen de doorzichtigheid verandert,
 * zodat er niets verspringt.
 *
 * Moet binnen een `<Link>` staan (zie `useLinkStatus`).
 */

import { useLinkStatus } from "next/link";

export function TegelBezig() {
  const { pending } = useLinkStatus();
  return <span aria-hidden="true" className={`av-tegel__bezig ${pending ? "is-bezig" : ""}`} />;
}
