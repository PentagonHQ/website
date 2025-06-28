"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Typography } from "@/components/ui/typography";
import { ContactSheet } from "@/components/contact/contact-sheet";
import { ChevronDown } from "lucide-react";

const PentagonLogo = ({ className }: { className?: string }) => (
	<div className={`flex items-center gap-3 ${className}`}>
		<Image
			src="/pentagon_logo_white.svg"
			alt="Pentagon Logo"
			width={240}
			height={240}
		/>
	</div>
);

export default function HeroSection({ scrollDown }: { scrollDown: () => void }) {
	const terms = ["ASI", "AGI", "ML", "LLMs", "AI", "autonomy", "superintelligence"];
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFading, setIsFading] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setIsFading(true);
			setTimeout(() => {
				setCurrentIndex((prevIndex) => (prevIndex + 1) % terms.length);
				setIsFading(false);
			}, 500); // Half a second for the fade-out
		}, 2200); // Change word every 2.2 seconds

		return () => clearInterval(interval);
	}, []);

	return (
		<section className="relative min-h-screen bg-black flex flex-col">
			<div className="container mx-auto px-4 flex flex-col h-screen">
				<header className="p-4 z-10">
					<div className="flex justify-between items-center">
						<PentagonLogo />
						<ContactSheet>
							<Button
								variant="outline"
								className="btn-liquid-glass text-white rounded-none px-4 py-2 text-sm md:px-6 md:py-2 md:text-base"
							>
								Get Started
							</Button>
						</ContactSheet>
					</div>
				</header>

				<div className="flex-1 flex items-center justify-center text-center">
					<div className="mx-auto space-y-6">
						<Typography variant="h1" className="text-white">
							Authentication for the era of <span className={`transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>{terms[currentIndex]}</span>
						</Typography>
						<Typography variant="lead" className="text-gray-400">
							secret keys that are never exposed.
						</Typography>
					</div>
				</div>

				<div className="absolute bottom-20 left-1/2 -translate-x-1/2">
					<div
						className="w-10 h-10 border border-white/50 rounded-full flex items-center justify-center cursor-pointer animate-pulse"
						onClick={scrollDown}
					>
						<ChevronDown className="w-6 h-6 text-white" />
					</div>
				</div>
			</div>
		</section>
	);
}
