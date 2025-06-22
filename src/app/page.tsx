"use client";

import { Fragment } from "react";
import { Button } from "@/components/ui/button";

// Pentagon Logo Component
const PentagonLogo = ({ className }: { className?: string }) => (
	<div className={`flex items-center gap-3 ${className}`}>
		<div className="relative">
			<svg
				width="40"
				height="40"
				viewBox="0 0 40 40"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="text-white"
			>
				<path
					d="M20 2L37 14L31 34H9L3 14L20 2Z"
					fill="currentColor"
					stroke="currentColor"
					strokeWidth="1"
				/>
				{/* Inner design */}
				<path
					d="M20 8L30 16L26 28H14L10 16L20 8Z"
					fill="none"
					stroke="black"
					strokeWidth="1.5"
				/>
			</svg>
		</div>
		<span className="text-xl font-bold text-white">
			Pentagon<sup className="text-2xl">™</sup>
		</span>
	</div>
);

export default function App() {
	return (
		<Fragment>
			<div className="relative">

				<section className="relative min-h-screen bg-black flex flex-col">
					<header className="absolute top-0 left-0 right-0 z-10 p-6">
						<div className="max-w-7xl mx-auto flex justify-between items-center">
							<PentagonLogo />
							<Button
								variant="default"
								className="bg-white text-black rounded-none hover:bg-white/90"
							>
								Explore the research
							</Button>
						</div>
					</header>

					<div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
						<div className="max-w-4xl mx-auto space-y-8">
							<h1 className="text-4xl font-bold text-white leading-tight">
								Authentication for the{" "}
								<span className="text-gray-300">ASI era</span>
							</h1>
							
							<p className="text-lg text-gray-400 max-w-2xl mx-auto">Secret keys that are never exposed.</p>
							<p className="text-lg text-gray-400 max-w-2xl mx-auto">Imagine a malicious actor knowing a person's password, watching the person login, and never being able to compromise the account. This is the future of authentication.</p>
						</div>
					</div>
				</section>

				<section className="relative min-h-screen bg-black flex flex-col">
					<div className="flex-1 flex flex-col items-center justify-center px-6 text-left">
						<div className="max-w-4xl mx-auto space-y-12">
							<p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
								Exclusively engineered for entities that cannot afford compromise.
							</p>
							<p className="text-lg md:text-xl text-white font-bold leading-relaxed max-w-3xl mx-auto">
								White-glove onboarding only.
							</p>
						</div>
					</div>

				</section>

			</div>
		</Fragment>
	);
}
