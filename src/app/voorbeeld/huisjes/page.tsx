import { MERKNAAM } from "@/lib/merk";
import type { Metadata } from "next";
import { HuisjesVoorbeeld } from "@/components/oefenen/HuisjesVoorbeeld";

export const metadata: Metadata = {
  title: `De huisjespost · ${MERKNAAM}`,
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return <HuisjesVoorbeeld />;
}
