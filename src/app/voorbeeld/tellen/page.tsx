import type { Metadata } from "next";
import { BosOverzicht } from "@/components/oefenen/BosOverzicht";

export const metadata: Metadata = { title: "Tellen tot 20 · Thuisles", robots: { index: false, follow: false } };
export default async function Pagina({ searchParams }: { searchParams: Promise<{ spel?: string }> }) { const { spel } = await searchParams; return <BosOverzicht spel={spel} />; }
