import { Kop } from "@/components/beheer/Bouwstenen";
import { Rekenrekproef } from "@/components/beheer/Rekenrekproef";

export default function RekenrekPagina() {
  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Rekenrek" }]}
        titel="Het rekenrek"
        bijschrift="De bouwsteen uitproberen: wegschuiven, flitsen en kijken. Er hangt nog geen oefening aan; dit is om te zien hoe het werkt."
      />
      <Rekenrekproef />
    </div>
  );
}
