import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { PackageSelector } from "./package-selector";

interface CreatePackageDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onPackageCreated: (packageId: number) => void;
	sessionId: string;
	genres: string[];
	artists: string[];
	countries: string[];
}

export function CreatePackageDialog({
	isOpen,
	onClose,
	onPackageCreated,
	sessionId,
	genres,
	artists,
	countries,
}: CreatePackageDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Create New Song Package</DialogTitle>
				</DialogHeader>
				<PackageSelector
					onSelect={(packageId) => {
						onPackageCreated(packageId);
						onClose();
					}}
					sessionId={sessionId}
					genres={genres}
					artists={artists}
					countries={countries}
				/>
			</DialogContent>
		</Dialog>
	);
}
