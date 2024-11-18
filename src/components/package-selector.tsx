import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface SongPackage {
	id: number;
	name: string;
	description: string;
}

interface PackageSelectorProps {
	onSelect: (packageId: number) => void;
	selectedPackageId?: number;
}

export function PackageSelector({ onSelect, selectedPackageId }: PackageSelectorProps) {
	const [packages, setPackages] = useState<SongPackage[]>([]);

	useEffect(() => {
		fetch("/api/packages")
			.then((res) => res.json())
			.then(setPackages);
	}, []);

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{packages.map((pkg) => (
				<Card
					key={pkg.id}
					className={`p-4 cursor-pointer transition-all ${
						selectedPackageId === pkg.id ? "ring-2 ring-primary" : ""
					}`}
					onClick={() => onSelect(pkg.id)}>
					<h3 className='font-bold mb-2'>{pkg.name}</h3>
					<p className='text-sm text-gray-600'>{pkg.description}</p>
				</Card>
			))}
		</div>
	);
}
