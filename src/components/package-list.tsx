import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CreatePackageDialog } from "./create-package-dialog";

export interface Package {
	id: number;
	name: string;
	filters: {
		genre?: string;
		years?: { start: number; end: number };
		country?: string;
		artist?: string;
	};
	limit: number;
}

interface PackageListProps {
	packages: Package[];
	onSelect: (packageId: number) => void;
	sessionId: string;
	genres: string[];
	artists: string[];
	countries: string[];
}

export function PackageList({ packages, onSelect, sessionId, genres, artists, countries }: PackageListProps) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<h2 className='text-xl font-bold'>Song Packages</h2>
				<Button onClick={() => setIsCreateDialogOpen(true)}>Create New Package</Button>
			</div>

			<div className='grid gap-4'>
				{packages.map((package_) => (
					<Card
						key={package_.id}
						className={`p-4 hover:bg-accent cursor-pointer ${
							selectedPackage === package_.id ? "ring-2 ring-primary" : ""
						}`}
						onClick={() => {
							setSelectedPackage(package_.id);
							onSelect(package_.id);
						}}>
						<h3 className='font-semibold'>{package_.name}</h3>
						<p className='text-sm text-muted-foreground'>
							{[
								package_.filters.genre && `Genre: ${package_.filters.genre}`,
								package_.filters.years &&
									`Years: ${package_.filters.years.start}-${package_.filters.years.end}`,
								package_.filters.country && `Country: ${package_.filters.country}`,
								package_.filters.artist && `Artist: ${package_.filters.artist}`,
							]
								.filter(Boolean)
								.join(" | ")}
						</p>
					</Card>
				))}
			</div>

			<CreatePackageDialog
				isOpen={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onPackageCreated={onSelect}
				sessionId={sessionId}
				genres={genres}
				artists={artists}
				countries={countries}
			/>
		</div>
	);
}
