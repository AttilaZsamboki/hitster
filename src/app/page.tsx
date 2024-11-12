import { getSongs } from '@/lib/songs';
import Game from '@/components/game';

export default async function Home() {
  const songs = await getSongs();

  return (
    <main className="container mx-auto p-4">
      <Game songsData={songs} />
    </main>
  );
}
