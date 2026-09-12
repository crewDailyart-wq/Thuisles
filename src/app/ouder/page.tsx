import { redirect } from "next/navigation";

/** De ouderomgeving begint altijd bij het Overzicht. */
export default function OuderHome() {
  redirect("/ouder/overzicht");
}
