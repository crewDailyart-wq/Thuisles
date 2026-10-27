import type { Metadata } from "next";
import { ParelsGodot } from "./ParelsGodot";

/*
  Testpagina (27 oktober 2026, opdracht eigenaar): precies hetzelfde proefje
  als /voorbeeld-phaser (drie gloeiende parels om te slepen), maar gebouwd in
  Godot (godot/parels), om te vergelijken welke er beter uitziet. Staat in
  geen menu of navigatie. Blijft staan tot de eigenaar zegt dat hij weg mag.
*/
export const metadata: Metadata = {
  title: "Voorbeeld Godot",
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return <ParelsGodot />;
}
