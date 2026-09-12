/**
 * Alles onder /admin/<vak>/ hoort bij één vak. Bestaat dat vak niet, dan
 * stopt het hier meteen met een nette 404 in plaats van een half scherm.
 */

import { notFound } from "next/navigation";
import { haalVak } from "@/lib/data/structuur";

export default async function VakLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ vak: string }>;
}) {
  const { vak } = await params;
  if (!haalVak(vak)) notFound();
  return <>{children}</>;
}
