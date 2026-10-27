import type { Metadata } from "next";
import { ParelsProef } from "./ParelsProef";

/*
  Testpagina (27 oktober 2026, opdracht eigenaar): werkt Phaser in het
  project? Drie gloeiende parels op een donkere achtergrond die je kunt
  slepen, met de ingebouwde glow van Phaser. Staat in geen menu of
  navigatie. Blijft staan tot de eigenaar zegt dat hij weg mag.
*/
export const metadata: Metadata = {
  title: "Voorbeeld Phaser",
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return <ParelsProef />;
}
