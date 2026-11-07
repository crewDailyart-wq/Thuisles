import type { Lesdraaiboek, Lesgids } from "@/components/les/soort";

/** Alleen voor de controlepagina: open de echte Nee-route, zonder het welkom af te spelen. */
export function metUitlegVoorbeeld(les: Lesdraaiboek): Lesdraaiboek {
  if (!les.id.startsWith("squla-")) return les;
  return {
    ...les,
    async speel(gids) {
      let opening = true;
      const openingOverslaan: Pick<Lesgids, "zeg" | "kies"> = {
        zeg: async (...zinnen) => {
          if (!opening) await gids.zeg(...zinnen);
        },
        kies: async (opties, instel) => {
          if (opening) {
            opening = false;
            if (opties.length === 2 && opties[0] === "Ja" && opties[1] === "Nee") return "Nee";
          }
          return gids.kies(opties, instel);
        },
      };
      const voorbeeld = new Proxy(gids, {
        get: (doel, sleutel, ontvanger) => sleutel === "zeg" || sleutel === "kies"
          ? openingOverslaan[sleutel]
          : Reflect.get(doel, sleutel, ontvanger),
      });
      await les.speel(voorbeeld);
    },
  };
}
