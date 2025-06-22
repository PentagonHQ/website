import {Skeleton} from "@/components/ui/skeleton";

const skeletonStyles = {
    background: "bg-emerald-400/30",
	container: "flex flex-col gap-6 mb-32 px-4",
	card: "bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4",
	progressBar:
		"w-full bg-emerald-400/10 my-4 rounded-full h-4 border border-emerald-400/20",
};

export default function Loading() {
	return (
		<div className={skeletonStyles.container}>
            <div className="h-[8.25rem] my-12 mx-6">
                <Skeleton className={`${skeletonStyles.card} h-6 w-full mx-auto mb-2`} />
                <Skeleton className={`block md:hidden ${skeletonStyles.card} h-6 w-4/5 mx-auto`} />
                <Skeleton className={skeletonStyles.progressBar} />
                <Skeleton className={`${skeletonStyles.card} h-6 w-1/3 mx-auto`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({length: 6}).map((_, i) => (
                    <Skeleton key={i} className={`${skeletonStyles.card} h-64 w-full`} />
                ))}
            </div>
		</div>
	);
}