/**
 * De vaste achtergrond van elke opdracht (23 oktober 2026, opdracht
 * eigenaar): een blauwe ruimte met een grote muur met ruitjes, een glanzende
 * vloer met een ronde cirkel rechts, en links een plantje, boeken en potloden.
 * Bron: ontwerp/achtergrond-opdracht/origineel.png.
 *
 * Hij vult het hele scherm, zonder uitrekken (object-fit: cover). Op een
 * liggend scherm de hele ruimte; op een staand scherm (telefoon, tablet
 * rechtop) een uitsnede van het midden van de muur en de vloer. Lichte
 * bestanden (AVIF, met WebP als reserve) in een paar maten.
 */

const MAP = "/assets/bliepo/achtergrond-opdracht";

export function OpdrachtDecor() {
  return (
    <div className="opdracht-decor" aria-hidden="true">
      <picture>
        <source media="(orientation: portrait)" type="image/avif" srcSet={`${MAP}/staand-480.avif 480w, ${MAP}/staand-720.avif 720w`} sizes="100vw" />
        <source media="(orientation: portrait)" type="image/webp" srcSet={`${MAP}/staand-480.webp 480w, ${MAP}/staand-720.webp 720w`} sizes="100vw" />
        <source type="image/avif" srcSet={`${MAP}/liggend-960.avif 960w, ${MAP}/liggend-1280.avif 1280w, ${MAP}/liggend-1672.avif 1672w`} sizes="100vw" />
        <img
          src={`${MAP}/liggend-1280.webp`}
          srcSet={`${MAP}/liggend-960.webp 960w, ${MAP}/liggend-1280.webp 1280w, ${MAP}/liggend-1672.webp 1672w`}
          sizes="100vw"
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
}
