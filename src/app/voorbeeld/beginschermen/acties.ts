"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { bewaarControle, bewaarLeszin, leesControle } from "./bewaren";
import { leesbareLesTekst } from "@/lib/lessen/tekstbewerking";
import { cijfersInTekst } from "@/lib/lessen/cijfertaal";
import { vereisLesbeheer, zetLesbeheer } from "@/lib/lessen/lokaal-beheer";

async function alleenLokaal() {
  await vereisLesbeheer();
}

export async function schakelBeheer(form: FormData) {
  await zetLesbeheer(form.get("aan") === "ja");
  redirect("/voorbeeld/beginschermen");
}

export async function bewaarTekst(form: FormData) {
  await alleenLokaal();
  const waarde = (naam: string) => typeof form.get(naam) === "string" ? String(form.get(naam)) : "";
  const id = waarde("id");
  const veld = waarde("veld");
  if (veld !== "zin1" && veld !== "zin2" && veld !== "wens") throw new Error("Onbekend tekstveld.");
  const tekst = waarde("tekst").trim();
  const geldig = tekst.length <= (veld === "wens" ? 5000 : 700) && (veld === "wens" || tekst.length > 0);
  const melding = geldig ? bewaarControle(id, veld, tekst, waarde("verwacht")) : "ongeldig";
  revalidatePath("/voorbeeld/beginschermen");
  const params = new URLSearchParams({ zoek: waarde("zoek"), onderwerp: waarde("onderwerp"), les: id, stap: waarde("stap") === "nee" ? "nee" : "begin", melding, veld });
  redirect(`/voorbeeld/beginschermen?${params}#${id}`);
}

export async function laadLesBewerking(id: string, bron: string) {
  await alleenLokaal();
  const { zinnen, wensen, teksten } = leesControle();
  if (!id.startsWith("squla-") || !Object.hasOwn(zinnen, id)) throw new Error("Onbekende les.");
  const regels = Object.hasOwn(teksten, id) ? teksten[id] : {};
  return { zin1: cijfersInTekst(zinnen[id].zin1), zin2: cijfersInTekst(zinnen[id].zin2), wens: wensen[id]?.tekst ?? "", zin: cijfersInTekst(leesbareLesTekst(Object.hasOwn(regels, bron) ? regels[bron] : bron)) };
}

export async function bewaarInLes(data: { id: string; veld: "zin1" | "zin2" | "zin" | "wens"; bron: string; tekst: string; verwacht: string }) {
  await alleenLokaal();
  if (!["zin1", "zin2", "zin", "wens"].includes(data.veld)) throw new Error("Onbekend tekstveld.");
  if (typeof data.tekst !== "string" || typeof data.verwacht !== "string" || typeof data.bron !== "string") throw new Error("Ongeldige tekst.");
  const tekst = data.veld === "wens" ? data.tekst.trim() : cijfersInTekst(data.tekst.trim());
  if (tekst.length > (data.veld === "wens" ? 5000 : 1500) || (data.veld !== "wens" && !tekst) || data.bron.length > 5000 || (data.veld === "zin" && !data.bron.trim())) return { fout: "Vul een tekst in. Een zin mag maximaal 1500 tekens bevatten; een wens maximaal 5000." };
  const resultaat = data.veld === "zin"
    ? bewaarLeszin(data.id, data.bron, tekst, data.verwacht)
    : bewaarControle(data.id, data.veld, tekst, data.verwacht, data.bron);
  if (resultaat === "conflict") return { fout: "Deze tekst is intussen in een ander venster aangepast. Sluit dit venster en open de bewerking opnieuw. Kopieer eerst jouw tekst." };
  revalidatePath("/voorbeeld/beginschermen");
  return { tekst };
}
