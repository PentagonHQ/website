"use client";

import { useSectionNavigation } from "@/hooks/use-section-navigation";
import HeroSection from "./hero-section";
import InfoSection from "./info-section";
import AuthSection from "./auth-section";
import FinalSection from "./final-section";
import FullScreenScroller from "../ui/full-screen-scroller";
import { Fragment } from "react";

export default function HomePage() {
	const { currentSection, scrollUp, scrollDown, scrollToTop } = useSectionNavigation(4);

	const sections = [
		<HeroSection key="hero" scrollDown={scrollDown} />,
		<InfoSection key="info" scrollDown={scrollDown} currentSection={currentSection} />,
		<AuthSection key="auth" />,
		<FinalSection key="final" scrollToTop={scrollToTop} />,
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
						<FullScreenScroller
							key={index}
							onScrollUp={scrollUp}
							onScrollDown={scrollDown}
						>
							{section}
						</FullScreenScroller>
					))}
				</div>
			</div>
		</Fragment>
	);
}
