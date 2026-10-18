import type { Metadata } from 'next';
import { Atelier3D } from '@/components/zappie/atelier/Atelier3D';

export const metadata: Metadata = {
  title: 'Bliepo’s atelier · 3D-prototype',
  robots: { index: false, follow: false },
};

export default function AtelierPrototype() {
  return <Atelier3D />;
}
