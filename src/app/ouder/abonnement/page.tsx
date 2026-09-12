/**
 * Abonnement — bewust nog een lege plek.
 *
 * Abonnementen en betalen bouwen we later apart. Het menu-item staat er wel
 * al, zodat de navigatie vanaf het begin vastligt en later niet verandert.
 * Ook een lege pagina is netjes: geen leeg scherm, wel uitleg.
 */

import { Leeg, Pagina } from "@/components/ouder/Bouwstenen";

export default function AbonnementPagina() {
  return (
    <Pagina
      titel="Abonnement"
      uitleg="Hier komt straks je abonnement te staan: wat je hebt, wat het kost en hoe je het wijzigt."
    >
      <Leeg tekst="Nog niet beschikbaar. Je kunt Thuisles gewoon gebruiken." />
    </Pagina>
  );
}
