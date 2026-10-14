export type Station = 'podium' | 'petjes' | 'kleuren' | 'extras';
export type ItemId = 'pet' | 'kroon' | 'oceaan' | 'goud' | 'bril' | 'antenne';
export type Outfit = Partial<Record<Exclude<Station, 'podium'>, ItemId>>;
export const STATIONS: { id: Station; naam: string; icoon: string; uitleg: string }[] = [
  { id: 'podium', naam: 'Het podium', icoon: '✦', uitleg: 'Kies een vitrine. Ontdek wat bij jouw Zappie past.' },
  { id: 'petjes', naam: 'Petjes', icoon: '♛', uitleg: 'Tik op een petje in de vitrine om het te passen.' },
  { id: 'kleuren', naam: 'Kleuren', icoon: '◈', uitleg: 'Kies een magische kleur voor Zappie.' },
  { id: 'extras', naam: 'Extra’s', icoon: '✧', uitleg: 'Geef Zappie iets bijzonders. Tik op een accessoire.' },
];
export const ITEMS: { id: ItemId; naam: string; station: Exclude<Station, 'podium'> }[] = [
  { id: 'pet', naam: 'Ontdekkerspet', station: 'petjes' },
  { id: 'kroon', naam: 'Sterrenkroon', station: 'petjes' },
  { id: 'oceaan', naam: 'Oceaanblauw', station: 'kleuren' },
  { id: 'goud', naam: 'Sterrengoud', station: 'kleuren' },
  { id: 'bril', naam: 'Ruimtebril', station: 'extras' },
  { id: 'antenne', naam: 'Sterrenantenne', station: 'extras' },
];
export type AtelierController = {
  station: (station: Station) => void;
  outfit: (outfit: Outfit) => void;
  dispose: () => void;
};
