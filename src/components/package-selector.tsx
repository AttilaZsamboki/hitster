import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PackageConfig } from "@/types/music";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronsUpDown } from "lucide-react";

interface PackageSelectorProps {
	onSelect: (packageId: number) => void;
	sessionId: string;
	genres: string[];
	artists: string[];
	countries: string[];
}

export function PackageSelector({ onSelect, sessionId, genres, artists, countries }: PackageSelectorProps) {
	const [config, setConfig] = useState<PackageConfig>({
		name: "",
		filters: {
			genre: "",
			years: {
				start: 1960,
				end: new Date().getFullYear(),
			},
			artist: "",
			country: "",
		},
		limit: 50,
	});
	const [isLoading, setIsLoading] = useState(false);

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
					disabled={!!config.filters.artist}
					value={config.filters.genre || ""}
					onValueChange={(selected) => {
						if (selected === "all") {
							setConfig({
								...config,
								filters: { ...config.filters, genre: undefined },
							});
						} else {
							setConfig({
								...config,
								filters: { ...config.filters, genre: selected },
							});
						}
					}}>
					<SelectTrigger>
						<SelectValue placeholder='Select genre' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All</SelectItem>
						{genres.map((genre) => (
							<SelectItem key={genre} value={genre}>
								{genre}
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
					disabled={!!config.filters.artist}
					value={config.filters.country}
					onValueChange={(value) => {
						if (value === "all") {
							setConfig({
								...config,
								filters: { ...config.filters, country: undefined },
							});
						} else {
							setConfig({
								...config,
								filters: { ...config.filters, country: value },
							});
						}
					}}>
					<SelectTrigger>
						<SelectValue placeholder='Select country' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All</SelectItem>
						{countries.map((country) => (
							<SelectItem key={country} value={country}>
								{country}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className='space-y-2'>
				<label className='text-sm font-medium'>Artist</label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							className='w-full justify-between'
							disabled={!!config.filters.genre || !!config.filters.country}>
							{config.filters.artist === "" ? "Select artist..." : config.filters.artist}
							<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-full p-0'>
						<Command>
							<CommandInput placeholder='Search artist...' />
							<CommandList>
								<CommandEmpty>No artist found.</CommandEmpty>
								<CommandGroup>
									<CommandItem
										onSelect={() =>
											setConfig({
												...config,
												filters: { ...config.filters, artist: "" },
											})
										}
										className='text-muted-foreground'
										value='all'>
										All
									</CommandItem>
									{artists.map((artist) => (
										<CommandItem
											key={artist}
											value={artist}
											onSelect={(value) =>
												setConfig({
													...config,
													filters: {
														...config.filters,
														artist: value,
													},
												})
											}>
											{artist}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
			<div className='space-y-2'>
				<label className='text-sm font-medium'>Limit</label>
				<Input
					type='number'
					value={config.limit}
					onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
					max={1000}
					min={20}
				/>
			</div>

			<Button type='submit' className='w-full' disabled={isLoading}>
				{isLoading ? "Creating Package..." : "Create Package"}
			</Button>
		</form>
	);
}
