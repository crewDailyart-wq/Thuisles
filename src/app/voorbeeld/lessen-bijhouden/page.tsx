import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LESCATALOGUS } from "@/lib/lessen/catalogus";
import status from "./status.json";
import { LessenBijhouden } from "./LessenBijhouden";
import { RondjeControle } from "./RondjeControle";
import { Oplichten } from "./Oplichten";

export const metadata: Metadata = {
  title: "Lessen bijhouden · Thuisles",
  robots: { index: false, follow: false },
};

type Per = Partial<Record<"hulp" | "zinnen" | "controleur" | "speel", boolean>>;

export default function Pagina() {
  if (process.env.NODE_ENV === "production") notFound();
  const perLes = status.per_les as Record<string, Per>;
  const lessen = LESCATALOGUS.filter((l) => l.id.startsWith("squla-")).map((l) => ({
    id: l.id,
    titel: l.titel,
    onderwerp: l.synthesis.split(" · ")[1] ?? "Overig",
    stappen: { ...status.standaard, ...(perLes[l.id] ?? {}) },
  }));
  return (
    <>
      <div style={{ padding: "24px 24px 0", background: "#f3f5f8" }}>
        <RondjeControle />
        <Oplichten />
      </div>
      <LessenBijhouden lessen={lessen} uitleg={status.uitleg} bijgewerkt={status.bijgewerkt} />
    </>
  );
}
