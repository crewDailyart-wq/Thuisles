import type { Metadata } from "next";
import { HuisjesVoorbeeld } from "@/components/oefenen/HuisjesVoorbeeld";

export const metadata: Metadata = {
  title: "De huisjespost · Thuisles",
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return <HuisjesVoorbeeld />;
}
