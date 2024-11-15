import GuessSongGame from "@/components/game";

export default async function GamePage({ params }: { params: Promise<{ sessionId: string }> }) {
	return <GuessSongGame sessionId={(await params).sessionId} />;
}
