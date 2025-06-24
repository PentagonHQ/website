"use client";

import { Fragment, useEffect } from "react";
import { useSectionNavigation } from "@/hooks/use-section-navigation";

interface SectionScrollerProps {
	sections: React.ReactNode[];
}

export default function SectionScroller({ sections }: SectionScrollerProps) {
	const { currentSection, scrollUp, scrollDown, scrollToTop } = useSectionNavigation(sections.length);

	useEffect(() => {
		const handleNavigateToNextSection = () => {
			scrollDown();
		};

		const handleScrollToTop = () => {
			scrollToTop();
		};

		window.addEventListener('navigateToNextSection', handleNavigateToNextSection);
		window.addEventListener('scrollToTop', handleScrollToTop);

		return () => {
			window.removeEventListener('navigateToNextSection', handleNavigateToNextSection);
			window.removeEventListener('scrollToTop', handleScrollToTop);
		};
	}, [scrollDown, scrollToTop]);

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
