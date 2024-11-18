import SessionsList from "@/components/sessions-list";

export default function Home() {
	return (
		<main className='container mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-8'>Music Timeline Game</h1>
			<SessionsList />
		</main>
	);
}
