"use client";

import { Fragment, lazy, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import FullScreenScroller from "@/components/ui/full-screen-scroller";
import { useSectionNavigation } from "@/hooks/use-section-navigation";
import { Typography } from "../components/ui/typography";
import { ChevronDown } from "lucide-react";

const AuthFlow = lazy(() => import("../components/auth/auth-flow"));

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

// Loading component for AuthFlow - ensures consistent height
const AuthFlowLoading = () => (
	<section className="relative min-h-screen bg-black flex flex-col">
		<div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
				<p className="text-lg text-gray-400">Initializing secure authentication...</p>
			</div>
		</div>
	</section>
);

export default function App() {
	const { currentSection, scrollUp, scrollDown } = useSectionNavigation(4);

	// Listen for navigation events from auth component
	useEffect(() => {
		const handleNavigateToNextSection = () => {
			scrollDown();
		};

		window.addEventListener('navigateToNextSection', handleNavigateToNextSection);

		return () => {
			window.removeEventListener('navigateToNextSection', handleNavigateToNextSection);
		};
	}, [scrollDown]);

	const sections = [
		<FullScreenScroller key="hero" onScrollUp={scrollUp} onScrollDown={scrollDown}>
			<section className="relative min-h-screen bg-black flex flex-col">
				<header className="absolute top-0 left-0 right-0 z-10 p-4">
					<div className="max-w-7xl mx-auto flex justify-between items-center">
						<PentagonLogo />
						<Button
							variant="outline"
							className="bg-white text-black rounded-none hover:bg-white/90 px-6"
						>
							Explore the research
						</Button>
					</div>
				</header>

				<div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-20">
					<div className="max-w-4xl mx-auto space-y-6">
						<Typography variant="h1" className="text-white">
							Authentication for the ASI era
						</Typography>
						<Typography variant="lead" className="text-gray-400">
							secret keys that are never exposed.
						</Typography>
					</div>
				</div>

				<div className="absolute bottom-20 left-1/2 -translate-x-1/2">
					<div className="w-10 h-10 border border-white/50 rounded-full flex items-center justify-center">
						<ChevronDown className="w-6 h-6 text-white" />
					</div>
				</div>
			</section>
		</FullScreenScroller>,

		<FullScreenScroller key="info" onScrollUp={scrollUp} onScrollDown={scrollDown}>
			<section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
				<div className="max-w-3xl mx-auto space-y-6">
					<Typography variant="h3" className="text-white leading-loose font-normal tracking-wider">
						imagine a malicious actor knowing a person's password, watching the person login,
						<br />
						and never being able to compromise the account
					</Typography>
					<Button
						variant="default"
						onClick={scrollDown}
						className="bg-black border border-white/10 text-white rounded-none hover:bg-white/10 px-8 py-6 text-lg font-normal"
					>
						Try Pentagon<sup className="text-xs ml-1">™</sup>
					</Button>
				</div>
			</section>
		</FullScreenScroller>,

		<FullScreenScroller key="auth" onScrollUp={scrollUp} onScrollDown={scrollDown}>
			<div className="relative min-h-screen bg-black">
				{currentSection >= 1 ? (
					<Suspense fallback={<AuthFlowLoading />}>
						<AuthFlow />
					</Suspense>
				) : (
					<AuthFlowLoading />
				)}
			</div>
		</FullScreenScroller>,

		<FullScreenScroller key="final" onScrollUp={scrollUp} onScrollDown={scrollDown}>
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

			<footer className="absolute bottom-0 left-0 right-0 p-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-500">
					<Typography variant="small">© {new Date().getFullYear()}</Typography>
					<div className="flex-grow border-t border-gray-700 mx-4"></div>
					<Typography variant="small">Pentagon AI, Inc</Typography>
				</div>
			</footer>
		</FullScreenScroller>
	];

	return (
		<Fragment>
			<div className="relative w-full h-screen overflow-hidden">
				<div
					className="flex flex-col transition-transform duration-700 ease-in-out"
					style={{
						transform: `translateY(-${currentSection * 100}vh)`,
						height: `${sections.length * 100}vh`
					}}
				>
					{sections.map((section, index) => (
						<div
							key={index}
							className="w-full h-screen flex-shrink-0"
						>
							{section}
						</div>
					))}
				</div>
			</div>
		</Fragment>
	);
}
