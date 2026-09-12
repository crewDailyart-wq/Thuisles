import { redirect } from "next/navigation";
import { haalVakken } from "@/lib/data/structuur";

/** Stuurt door naar het overzicht van het eerste actieve vak. */
export default function BeheerHome() {
  const vakken = haalVakken();
  const vak = vakken.find((v) => v.actief) ?? vakken[0];
  redirect(vak ? `/admin/${vak.slug}/overzicht` : "/admin/vakken");
}
