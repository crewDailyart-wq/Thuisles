import { redirect } from "next/navigation";
import { huidigKind } from "@/lib/auth/sessie";

/**
 * De voordeur.
 *
 * Oefent er al een kind op dit apparaat, dan gaat het meteen naar zijn
 * startscherm. Anders komt de ouder in zijn eigen omgeving terecht, want daar
 * begint een ouder.
 */
export default async function Home() {
  const kind = await huidigKind();
  redirect(kind ? "/start" : "/ouder/overzicht");
}
