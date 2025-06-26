"use client";

import { Typography } from "@/components/ui/typography";
import { ChevronUp } from "lucide-react";
import Footer from "@/components/layout/footer";

interface FinalSectionProps {
	scrollToTop: () => void;
}

export default function FinalSection({ scrollToTop }: FinalSectionProps) {
	return (
		<div className="relative min-h-screen flex flex-col">
			<section className="flex-1 flex flex-col items-center justify-center">
				<div className="container mx-auto px-4">
					<div className="max-w-7xl mx-auto space-y-2 text-left">
						<p className="text-2xl md:text-3xl text-gray-300 leading-relaxed max-w-4xl">
						Exclusively engineered for entities that cannot afford compromise.
						</p>
						<p className="text-2xl md:text-3xl text-white font-bold leading-relaxed max-w-4xl">
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

			<Footer />
		</div>
	);
}
