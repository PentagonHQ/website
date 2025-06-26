"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useState, useEffect } from "react";

export default function InfoSection({ scrollDown, currentSection }: { scrollDown: () => void, currentSection: number }) {
	const [isAnimating, setIsAnimating] = useState(false);
	const [showButton, setShowButton] = useState(false);
	const textLines = [
		"imagine a malicious actor knowing a person's password,",
		"watching the person login,",
		"and never being able to compromise the account"
	];

	useEffect(() => {
		if (currentSection === 1 && !isAnimating) {
			setIsAnimating(true);
			const totalDuration = textLines.join(" ").length * 25 + 500;
			setTimeout(() => setShowButton(true), totalDuration);
		}
	}, [currentSection, isAnimating]);

	let charCount = 0;

	return (
		<section className="relative min-h-screen flex flex-col items-center justify-center text-center">
			<div className="container mx-auto px-4">
				<div className="mx-auto space-y-6">
					<Typography variant="h3" className="text-white leading-loose font-normal tracking-wider">
						{textLines.map((line, lineIndex) => (
							<div key={lineIndex}>
								{line.split(" ").map((word, wordIndex) => {
									const isNever = word === "never";
									return (
										<span key={wordIndex} className="inline-block">
											{(word).split("").map((char, charIndex) => {
												const overallIndex = charCount++;
												return (
													<span
														key={charIndex}
														className={`transition-opacity duration-500 ${isAnimating ? "opacity-100" : "opacity-0"} ${isNever ? "font-bold" : ""}`}
														style={{ transitionDelay: `${overallIndex * 25}ms` }}
													>
														{char}
													</span>
												);
											})}
											<span
												className={`transition-opacity duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`}
												style={{ transitionDelay: `${charCount++ * 25}ms` }}
											>
												&nbsp;
											</span>
										</span>
									);
								})}
							</div>
						))}
					</Typography>
					<Button
						variant="default"
						onClick={scrollDown}
						className={`bg-black border border-white/10 text-white rounded-none hover:bg-white/10 px-8 py-6 text-lg font-normal transition-opacity duration-1000 ${showButton ? "opacity-100" : "opacity-0"}`}
					>
						<span className="shimmer">Try&nbsp;<strong>Pentagon</strong><sup className="text-xs ml-1">™</sup></span>
					</Button>
				</div>
			</div>
		</section>
	);
}
