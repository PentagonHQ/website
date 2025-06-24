"use client";

import { Button } from "@/components/ui/button";
import FullScreenScroller from "@/components/ui/full-screen-scroller";
import { Typography } from "@/components/ui/typography";

export default function InfoSection() {
	return (
		<section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
			<div className="max-w-3xl mx-auto space-y-6">
				<Typography variant="h3" className="text-white leading-loose font-normal tracking-wider">
					imagine a malicious actor knowing a person's password, watching the person login,
					<br />
					and never being able to compromise the account
				</Typography>
				<Button
					variant="default"
					onClick={() => {
						window.dispatchEvent(new CustomEvent('navigateToNextSection'));
					}}
					className="bg-black border border-white/10 text-white rounded-none hover:bg-white/10 px-8 py-6 text-lg font-normal"
				>
					Try Pentagon<sup className="text-xs ml-1">™</sup>
				</Button>
			</div>
		</section>
	);
}
