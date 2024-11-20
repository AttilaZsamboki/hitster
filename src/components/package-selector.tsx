import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PackageConfig } from "@/types/music";

interface PackageSelectorProps {
	onSelect: (packageId: number) => void;
	sessionId: string;
}

export function PackageSelector({ onSelect, sessionId }: PackageSelectorProps) {
	const [config, setConfig] = useState<PackageConfig>({
		name: "",
		filters: {
			genre: [],
			years: {
				start: 1960,
				end: new Date().getFullYear(),
			},
		},
		limit: 50,
	});
	const [genres, setGenres] = useState<string[]>([]);
	const [countries, setCountries] = useState(["Hungary", "us", "United Kingdom", "Germany"]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Fetch available genres and countries
		Promise.all([fetch("/api/music/genres").then((res) => res.json())])
			.then(([genresData]) => {
				setGenres(genresData);
			})
			.catch((error) => {
				console.error("Error fetching genres and countries:", error);
			});
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch("/api/packages/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(config),
			});

			if (!response.ok) throw new Error("Failed to create package");
			const package_ = await response.json();

			// Lock the package to the session
			await fetch(`/api/sessions/${sessionId}/lock-package`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ packageId: package_.id }),
			});

			onSelect(package_.id);
		} catch (error) {
			console.error("Error creating package:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div className='space-y-2'>
				<label className='text-sm font-medium'>Package Name</label>
				<Input
					value={config.name}
					onChange={(e) => setConfig({ ...config, name: e.target.value })}
					placeholder='e.g., 90s Rock Hits'
					required
				/>
			</div>

			<div className='space-y-2'>
				<label className='text-sm font-medium'>Genres</label>
				<Select
					value={config.filters.genre?.[0] || ""}
					onValueChange={(selected) =>
						setConfig({
							...config,
							filters: { ...config.filters, genre: [selected] },
						})
					}>
					<SelectTrigger>
						<SelectValue placeholder='Select genre' />
					</SelectTrigger>
					<SelectContent>
						{genres.map((country) => (
							<SelectItem key={country} value={country}>
								{country}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-2'>
					<label className='text-sm font-medium'>Start Year</label>
					<Input
						type='number'
						min='1900'
						max={config.filters.years?.end}
						value={config.filters.years?.start}
						onChange={(e) =>
							setConfig({
								...config,
								filters: {
									...config.filters,
									years: {
										end: config.filters.years?.end ?? 0,
										start: parseInt(e.target.value),
									},
								},
							})
						}
					/>
				</div>
				<div className='space-y-2'>
					<label className='text-sm font-medium'>End Year</label>
					<Input
						type='number'
						min={config.filters.years?.start}
						max={new Date().getFullYear()}
						value={config.filters.years?.end}
						onChange={(e) =>
							setConfig({
								...config,
								filters: {
									...config.filters,
									years: {
										start: config.filters.years?.start ?? 0,
										end: parseInt(e.target.value),
									},
								},
							})
						}
					/>
				</div>
			</div>

			<div className='space-y-2'>
				<label className='text-sm font-medium'>Country</label>
				<Select
					value={config.filters.country}
					onValueChange={(value) =>
						setConfig({
							...config,
							filters: { ...config.filters, country: value },
						})
					}>
					<SelectTrigger>
						<SelectValue placeholder='Select country' />
					</SelectTrigger>
					<SelectContent>
						{countries.map((country) => (
							<SelectItem key={country} value={country}>
								{country}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Button type='submit' className='w-full' disabled={isLoading}>
				{isLoading ? "Creating Package..." : "Create Package"}
			</Button>
		</form>
	);
}
