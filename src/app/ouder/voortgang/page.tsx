/**
 * Voortgang — de vaardigheidskaart.
 *
 * Geen kale percentages. Alle leerdoelen van de groep van het kind, elk met
 * één van vier standen. Is er een methode gekozen, dan staan ze in de volgorde
 * van de methodeblokken met het huidige blok gemarkeerd — zo ziet een ouder in
 * één blik waar zijn kind staat ten opzichte van wat de klas doet.
 */

import {
  Blokmarkering,
  GeenKind,
  Kaart,
  Leeg,
  Pagina,
  Standlegenda,
  Vaardigheid,
} from "@/components/ouder/Bouwstenen";
import { ZetKlaar } from "@/components/ouder/Klaarzetten";
import { bekekenKind, vereisOuder } from "@/lib/auth/sessie";
import { haalVaardigheidskaart, haalWeekstatus } from "@/lib/data/dashboard";

export default async function VoortgangPagina() {
  const ouder = await vereisOuder();
  const kind = await bekekenKind(ouder.id);
  if (!kind) return <GeenKind />;

  const kaart = haalVaardigheidskaart(kind.id, kind.groep);
  const week = haalWeekstatus(kind.id, kind.groep);

  const leeg = kaart.groepen.every((g) => g.vaardigheden.length === 0);

  return (
    <Pagina
      titel="Voortgang"
      uitleg={
        kaart.volgtMethode
          ? `Per onderdeel zie je hoe ver ${kind.roepnaam} is. De volgorde volgt de blokken van ${kaart.methodenaam}, zodat je ziet waar ${kind.roepnaam} staat ten opzichte van wat de klas doet.`
          : `Per onderdeel zie je hoe ver ${kind.roepnaam} is. Stel je bij School & methode een methode in, dan volgt deze lijst de volgorde van de klas.`
      }
    >
      {/* De legenda hoort altijd zichtbaar te zijn bij de kaart. */}
      <Kaart>
        <Standlegenda />
      </Kaart>

      {leeg ? (
        <Leeg
          tekst={`Er zijn nog geen onderdelen voor groep ${kind.groep}.`}
        />
      ) : (
        kaart.groepen.map((groep, i) => (
          <Kaart
            key={`${groep.titel}-${i}`}
            titel={kaart.volgtMethode ? undefined : groep.titel}
          >
            {kaart.volgtMethode && (
              <Blokmarkering
                tekst={
                  groep.huidig ? `${groep.titel} — hier zit de klas nu` : groep.titel
                }
              />
            )}
            {groep.vaardigheden.length === 0 ? (
              <p className="py-2 text-sm text-beheer-zacht">
                Bij dit blok heeft Thuisles nog geen onderdelen. Vrij oefenen
                werkt gewoon.
              </p>
            ) : (
              groep.vaardigheden.map((v) => (
                <Vaardigheid
                  key={v.leerdoelId}
                  titel={v.titel}
                  stand={v.status}
                  bijschrift={v.aandacht ? "vraagt aandacht" : undefined}
                  href={`/ouder/voortgang/${v.domeinSlug}/${v.code}`}
                />
              ))
            )}
          </Kaart>
        ))
      )}

      <div className="border-t border-beheer-rand pt-5">
        {week.aanbevolen.length > 0 ? (
          <ZetKlaar
            kindId={kind.id}
            leerdoelIds={week.aanbevolen.map((r) => r.leerdoelId)}
            reden="Even herhalen — je ouder heeft dit klaargezet"
            label="Zet een korte herhaaloefening klaar"
          />
        ) : (
          <p className="text-sm text-beheer-zacht">
            Er staat niets in de weg. {kind.roepnaam} kan altijd vrij oefenen.
          </p>
        )}
      </div>
    </Pagina>
  );
}
