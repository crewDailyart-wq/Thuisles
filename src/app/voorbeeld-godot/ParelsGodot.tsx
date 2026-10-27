"use client";

/**
 * Het Godot-proefje (godot/parels, export in public/godot/parels) in een
 * iframe, net als de andere Godot-spelletjes. Zodra Godot zijn eerste beeld
 * heeft getekend, meldt hij dat (postMessage); `window.__godot` geeft de
 * meetwaarde voor de laadtest.
 */

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __godot?: { eersteBeeldMs?: number };
  }
}

export function ParelsGodot() {
  const [stand, zetStand] = useState("Godot laden…");

  useEffect(() => {
    const t0 = performance.now();
    const opBericht = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || typeof e.data?.godotParels !== "number") return;
      window.__godot = { eersteBeeldMs: Math.round(performance.now() - t0) };
      zetStand(`Godot ${String(e.data.versie ?? "")}: sleep de parels`);
    };
    window.addEventListener("message", opBericht);
    return () => window.removeEventListener("message", opBericht);
  }, []);

  return (
    <main style={{ minHeight: "100dvh", background: "#0b1026", color: "#cfd8ff", display: "flex", flexDirection: "column" }}>
      <p style={{ margin: 0, padding: "12px 16px", fontSize: 14 }} data-godot-stand="">
        {stand}
      </p>
      <iframe src="/godot/parels/index.html" title="Drie gloeiende parels (Godot)" style={{ flex: 1, minHeight: 360, border: 0, width: "100%", display: "block" }} />
    </main>
  );
}
