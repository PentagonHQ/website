"use client";

import { Typography } from "@/components/ui/typography";
import { ChevronUp } from "lucide-react";

interface FinalSectionProps {
	scrollToTop: () => void;
}

export default function FinalSection({ scrollToTop }: FinalSectionProps) {
	return (
		<>
			<section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
				<div className="flex-1 flex flex-col items-center justify-center px-6 text-left">
					<div className="max-w-7xl mx-auto space-y-2">
						<p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
							Exclusively engineered for entities that cannot afford compromise.
						</p>
						<p className="text-lg md:text-xl text-white font-bold leading-relaxed max-w-4xl mx-auto">
							White-glove onboarding only.
						</p>
					</div>
				</div>
			</section>

			<div className="absolute bottom-20 right-20">
				<div
					className="w-10 h-10 border border-white/50 rounded-full flex items-center justify-center cursor-pointer"
					onClick={scrollToTop}
				>
					<ChevronUp className="w-6 h-6 text-white" />
				</div>
			</div>

			<footer className="absolute bottom-0 left-0 right-0 p-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-500">
					<Typography variant="small">© {new Date().getFullYear()}</Typography>
					<div className="flex-grow border-t border-gray-700 mx-4"></div>
					<Typography variant="small">Pentagon Research, Inc</Typography>
				</div>
			</footer>
		</>
	);
}
