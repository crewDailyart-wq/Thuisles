/**
 * Het ronde menuknopje naast het Hoi-vakje op het startscherm. Gaat naar
 * "Meer": het menu en alles wat vroeger onder het startscherm stond.
 */

import Link from "next/link";
import { TegelBezig } from "@/components/avontuur/TegelBezig";

export function Menuknop() {
  return (
    <Link
      href="/meer"
      className="av-rondje"
      aria-label="Menu en meer"
      title="Menu en meer"
      style={{ "--tegel": "var(--av-paars)", "--tegel-rand": "var(--av-paars-rand)" } as React.CSSProperties}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true" className="size-6">
        <path d="M5 7h14M5 12h14M5 17h14" />
      </svg>
      <TegelBezig />
    </Link>
  );
}
