import jaar from './groep3.json';

export const STAPPEN = jaar.stappen;
export type Leerstap = (typeof STAPPEN)[number];
export type Bewijs = 'zelfstandig' | 'met_hulp';
export type StapResultaat = { bewijs: Bewijs; datum: string; geoefendeStap: string; toetsvoorbereiding: boolean };
export type Toetsperiode = { vanWeek: number; totWeek: number; aanbieder: string };
export type LeerpadStand = { versie: 1; resultaten: Record<string, StapResultaat>; toetsperiodes: Toetsperiode[] };
export const LEEG_LEERPAD: LeerpadStand = { versie: 1, resultaten: {}, toetsperiodes: [] };
const ids = new Set(STAPPEN.map(s => s.id));

export function normaliseerLeerpad(invoer: unknown): LeerpadStand {
  if (!invoer || typeof invoer !== 'object') return LEEG_LEERPAD;
  const v = invoer as Partial<LeerpadStand>;
  const resultaten: Record<string, StapResultaat> = {};
  for (const [id,r] of Object.entries(v.resultaten ?? {})) {
    if (ids.has(id) && r && (r.bewijs === 'zelfstandig' || r.bewijs === 'met_hulp') && typeof r.datum === 'string' && ids.has(r.geoefendeStap)) resultaten[id] = r;
  }
  const toetsperiodes = Array.isArray(v.toetsperiodes) ? v.toetsperiodes.filter(p => p && Number.isInteger(p.vanWeek) && Number.isInteger(p.totWeek) && p.vanWeek >= 1 && p.totWeek <= 40 && p.vanWeek <= p.totWeek && typeof p.aanbieder === 'string').map(p=>({...p,aanbieder:p.aanbieder.slice(0,50)})) : [];
  return {versie:1,resultaten,toetsperiodes};
}
export function volgendeIndex(stand: LeerpadStand) {
  const i = STAPPEN.findIndex(s=>!stand.resultaten[s.id]);
  return i === -1 ? STAPPEN.length : i;
}
export function toetsvariant(stap: Leerstap, stand: LeerpadStand): Leerstap {
  const periode=stand.toetsperiodes.find(p=>stap.week>=p.vanWeek && stap.week<=p.totWeek);
  if (!periode) return stap;
  // Alleen eerdere, daadwerkelijk geoefende leerstof uit dezelfde dagbaan.
  const eerder=STAPPEN.filter(s=>s.week<periode.vanWeek && s.lane===stap.lane && stand.resultaten[s.id]);
  if(!eerder.length) return stap;
  return eerder[(stap.nummer-1)%eerder.length];
}
export function rondStapAf(stand: LeerpadStand, id: string, bewijs: Bewijs, tijd: string): LeerpadStand {
  const i=volgendeIndex(stand);
  if(i>=STAPPEN.length || STAPPEN[i].id!==id || !['zelfstandig','met_hulp'].includes(bewijs)) return stand;
  const doel=STAPPEN[i];
  const geoefend=toetsvariant(doel,stand);
  return {...stand,resultaten:{...stand.resultaten,[id]:{bewijs,datum:tijd,geoefendeStap:geoefend.id,toetsvoorbereiding:geoefend.id!==id}}};
}

/** Een voorbereidingsstap vervangt geen nieuw leerdoel: zichtbaar in het ouderoverzicht. */
export function uitgesteldeStappen(stand: LeerpadStand) {
  return STAPPEN.filter(s=>stand.resultaten[s.id]?.toetsvoorbereiding);
}
