import type { Metadata } from "next";
import Link from "next/link";
import { LESSEN } from "@/components/les/lessen";

export const metadata: Metadata = { title: "Lessen · Thuisles", robots: { index: false, follow: false } };

/** Overzicht van alle uitleglessen, om ze los te bekijken. Schrijft niets naar de database. */
export default function Pagina() {
  return (
    <main style={{ minHeight: "100dvh", background: "#0b1731", color: "#fff", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Uitleglessen ({LESSEN.length})</h1>
      <ol style={{ display: "grid", gap: 8, paddingLeft: 24 }}>
        {LESSEN.map((l) => (
          <li key={l.id}>
            <Link href={`/voorbeeld/les/${l.id}?naam=Testkind`} style={{ color: "#9cc2ff", textDecoration: "underline" }}>
              {l.titel}
            </Link>{" "}
            <span style={{ color: "#8892a6" }}>· {l.synthesis}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
