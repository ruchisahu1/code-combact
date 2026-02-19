 import { getAllLevels } from '@/lib/game/levels';
 
 export default function Layout({ children }: { children: React.ReactNode }) {
   return children;
 }
 
 export function generateStaticParams() {
   return getAllLevels().map((level) => ({ levelId: level.id }));
 }
