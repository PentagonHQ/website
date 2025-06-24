"use client";

import { lazy, Suspense } from "react";
import FullScreenScroller from "@/components/ui/full-screen-scroller";

const AuthFlow = lazy(() => import("../auth/auth-flow"));

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

export default function AuthSection() {
	return (
		<div className="relative min-h-screen bg-black">
			<Suspense fallback={<AuthFlowLoading />}>
				<AuthFlow />
			</Suspense>
		</div>
	);
}
