import {Skeleton} from "@/components/ui/skeleton";

const skeletonStyles = {
    background: "bg-emerald-400/30",
    container: "flex flex-col gap-6",
    card: "bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4",
    timer: "h-8 w-20 mx-auto",
    sequenceContainer: "flex gap-3 sm:gap-5 justify-center",
    sequenceBox: "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20",
    gridContainer: "flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 my-6 px-4",
    characterBox: "py-4 sm:py-6 md:py-8 px-6 sm:px-8 md:px-10 aspect-square",
    directionContainer: "grid grid-cols-3 gap-2 sm:gap-3 w-48 sm:w-56 md:w-64 mx-auto",
    directionPad: "w-14 sm:w-16 md:w-20 aspect-square"
};

export default function Loading() {
    return (
        <div className={skeletonStyles.container}>
            {/* Timer */}
            <div className="mx-6">
                <Skeleton className={`${skeletonStyles.card} ${skeletonStyles.timer}`} />
            </div>

            {/* Sequence boxes */}
            <div className={skeletonStyles.sequenceContainer}>
                {Array.from({length: 6}).map((_, i) => (
                    <Skeleton 
                        key={i} 
                        className={`${skeletonStyles.card} ${skeletonStyles.sequenceBox}`} 
                    />
                ))}
            </div>

            {/* Character grid */}
            <div className={skeletonStyles.gridContainer}>
                {Array.from({length: 40}).map((_, i) => (
                    <Skeleton 
                        key={i} 
                        className={`${skeletonStyles.card} ${skeletonStyles.characterBox}`} 
                    />
                ))}
            </div>

            {/* Direction pad */}
            <div className={skeletonStyles.directionContainer}>
                <div className="col-start-2">
                    <Skeleton className={`${skeletonStyles.card} ${skeletonStyles.directionPad}`} />
                </div>
                <div className="col-start-1 row-start-2">
                    <Skeleton className={`${skeletonStyles.card} ${skeletonStyles.directionPad}`} />
                </div>
                <div className="col-start-3 row-start-2">
                    <Skeleton className={`${skeletonStyles.card} ${skeletonStyles.directionPad}`} />
                </div>
                <div className="col-start-2 row-start-3">
                    <Skeleton className={`${skeletonStyles.card} ${skeletonStyles.directionPad}`} />
                </div>
            </div>
        </div>
    );
}