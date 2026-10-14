import type { Metadata } from 'next';
import { AtelierStudy } from '@/components/zappie/atelier/AtelierStudy';
export const metadata:Metadata={title:'Zappies atelier · Licht & materiaal',robots:{index:false,follow:false}};
export default function Page(){return <AtelierStudy/>;}
