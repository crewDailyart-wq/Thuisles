import { Kop, Paneel } from "@/components/beheer/Bouwstenen";
import { Stemtest } from "@/components/beheer/Stemtest";

export default function StemtestPagina() {
  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Stemtest" }]}
        titel="Stem van Vos"
        bijschrift="Open deze pagina op elk apparaat waar kinderen op werken. Elk apparaat heeft eigen stemmen."
      />
      <Stemtest />
      <Paneel titel="Later: een echte kinderstem">
        <p className="text-sm text-beheer-zacht">
          Nu gebruikt Thuisles de stem die in de browser zit: gratis, werkt
          overal en er gaat niets naar buiten. Wil je later een vrolijke
          voorleesstem van een stemdienst, dan gaat dat via één schakelaar in{" "}
          <code className="font-mono text-xs">src/lib/stem.ts</code>. Elke unieke
          zin wordt dan één keer op de server gemaakt en bewaard, zodat het
          apparaat van een kind nooit zelf met die dienst praat en we per zin
          maar één keer betalen.
        </p>
      </Paneel>
    </div>
  );
}
