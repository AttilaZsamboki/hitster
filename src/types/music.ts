export interface PackageConfig {
	name: string;
	filters: {
		genre?: string;
		years?: {
			start: number;
			end: number;
		};
		country?: string;
		artist?: string;
	};
	limit?: number;
}

export interface TrackInfo {
	title: string;
	artist: string;
	year?: number;
	tags?: string[];
}
