"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Lock, Settings} from "lucide-react";
import {useRouter} from "next/navigation";
import {Button} from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Tutorials() {
	const router = useRouter();
	const [hasCustomLevel, setHasCustomLevel] = useState(false);
	const [hasAuthData, setHasAuthData] = useState(false);

	useEffect(() => {
		const checkCredentials = () => {
			const hasCredentials = !!(
				localStorage.getItem("c1ph3r_encrypted_directions") &&
				localStorage.getItem("c1ph3r_encrypted_password")
			);
			setHasCustomLevel(hasCredentials);
		};

		// Check immediately
		checkCredentials();

		// Listen for credentials check event
		window.addEventListener("credentialsChecked", checkCredentials);

		return () => {
			window.removeEventListener("credentialsChecked", checkCredentials);
		};
	}, []);

	const handleLevel7Click = (e: React.MouseEvent) => {
		e.preventDefault();

		if (!hasCustomLevel) {
			router.push("/dashboard/setup");
			return;
		}

		router.push("/dashboard/game/7");
	};

	const isLevelLocked = (level: number) => {
		if (level === 1) return false;
		if (level === 7) return !hasCustomLevel;
		return true;
	};

	const tutorialLevels = [
		{
			level: 1,
			difficulty: "Beginner",
			description:
				"Learn the color-direction mapping with all visual aids",
			bestTime: "0:00",
			completions: 0,
			points: 0,
		},
		{
			level: 2,
			difficulty: "Beginner",
			description:
				"Match gray characters with their colored counterparts",
			bestTime: "0:00",
			completions: 0,
			points: 0,
		},
		{
			level: 3,
			difficulty: "Intermediate",
			description: "Adapt to colors rotating after each correct input",
			bestTime: "0:00",
			completions: 0,
			points: 0,
		},
		{
			level: 4,
			difficulty: "Intermediate",
			description:
				"Track characters as they change positions while colors rotate",
			bestTime: "0:00",
			completions: 0,
			points: 0,
		},
		{
			level: 5,
			difficulty: "Expert",
			description: "Remember color mappings with minimal visual aids",
			bestTime: "0:00",
			completions: 0,
			points: 0,
		},
		{
			level: 6,
			difficulty: "Expert",
			description:
				"Hidden sequence with no visual aids. The ultimate test!",
			bestTime: "0:00",
			completions: 0,
			points: 0,
		},
		{
			level: 7,
			difficulty: "Custom",
			description:
				"Earn the most points and get better with your own custom password and color bearings setup!",
			bestTime: "0:00",
			completions: 0,
			points: 0,
			isLocked: false,
		},
	];

	useEffect(() => {
		const hasEncryptedData = !!(
			localStorage.getItem("c1ph3r_encrypted_password") &&
			localStorage.getItem("c1ph3r_encrypted_directions")
		);
		setHasAuthData(hasEncryptedData);
	}, []);

	const handleDeleteAuthData = () => {
		localStorage.removeItem("encryptedPassKeyData");
		localStorage.removeItem("c1ph3r_encrypted_password");
		localStorage.removeItem("c1ph3r_encrypted_directions");
		setHasAuthData(false);
		window.location.href = "/dashboard/setup";
	};

	return (
		<div className="flex flex-col text-center w-full mx-auto gap-6 mb-32 px-4">
			<div className="flex flex-col gap-4 my-12">
				<p className="text-emerald-400/70 text-lg">
					This is a step-by-step guide to help learn the new quantum
					resistant authentication method.
				</p>
				<div className="w-full bg-emerald-400/10 rounded-full h-4 border border-emerald-400/20">
					<div
						className="bg-emerald-400 h-full rounded-full transition-all duration-300"
						style={{
							width: `${(tutorialLevels.reduce((acc, level) => acc + (level.completions > 0 ? 1 : 0), 0) / tutorialLevels.length) * 100}%`,
						}}
					/>
				</div>
				<p className="text-emerald-400/50 text-sm">
					{tutorialLevels.reduce(
						(acc, level) => acc + (level.completions > 0 ? 1 : 0),
						0
					)}{" "}
					of {tutorialLevels.length} levels completed
				</p>
			</div>
			<div className="grid grid-cols-1 gap-6">
				{/* Level 7 - Only show if previous levels are completed */}
				{!isLevelLocked(7) && (
					<Link
						className={`relative col-span-1 h-64 w-full text-3xl text-emerald-400 bg-transparent border-2 border-emerald-400/50 hover:bg-emerald-400/10 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black shadow-lg shadow-emerald-400/20`}
						href={`/dashboard/game/7`}
						onClick={handleLevel7Click}
					>
						<div className="relative flex flex-col h-full w-full text-3xl text-center text-emerald-400 bg-transparent hover:bg-emerald-400/10 transition-all duration-300 rounded">
							<span className="absolute top-0 left-4 text-[6rem] sm:text-[8rem] opacity-10 h-full flex items-center">
								Custom
							</span>
							<div className="z-10 p-6 flex flex-col h-full">
								<div className="flex justify-between items-center">
									<Badge
										variant="outline"
										className="text-sm text-blue-400/70 border-blue-400/50 bg-blue-400/10"
									>
										Custom
									</Badge>
									<div className="flex items-center gap-2">
										{isLevelLocked(7) && (
											<Lock className="w-4 h-4 text-emerald-400/70" />
										)}
										<p className="text-emerald-400/70 text-base">
											{tutorialLevels[6].points} pts
										</p>
										{hasAuthData && (
											<div
												className="relative"
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
														<Button
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
															}}
															variant="ghost"
															size="icon"
															className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-400/50 hover:bg-emerald-400/10"
														>
															<Settings className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className="w-40 bg-black/90 border border-emerald-400/30">
														<DropdownMenuItem
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																handleDeleteAuthData();
															}}
															className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:bg-red-500/20 focus:text-red-300"
														>
															Reset Auth Data
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										)}
									</div>
								</div>
								<p className="flex-1 flex mx-6 mt-4 text-center items-center text-emerald-400/70 text-lg font-medium">
									{tutorialLevels[6].description}
								</p>
								<div className="flex justify-between mt-4">
									<p className="text-emerald-400/70 text-sm">
										Best: {tutorialLevels[6].bestTime}
									</p>
									<p className="text-emerald-400/70 text-sm">
										Attempts:{" "}
										{tutorialLevels[6].completions}
									</p>
								</div>
							</div>
						</div>
					</Link>
				)}

				{/* Other levels in grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{tutorialLevels.slice(0, 6).map((level) => (
						<Link
							className={`relative h-64 w-full text-3xl text-emerald-400 bg-transparent border border-emerald-400/50 hover:bg-emerald-400/10 transition-all duration-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black ${isLevelLocked(level.level) ? "cursor-not-allowed opacity-70" : ""}`}
							key={level.level}
							href={
								isLevelLocked(level.level)
									? "#"
									: `/dashboard/game/${level.level}`
							}
							onClick={(e) => {
								if (isLevelLocked(level.level)) {
									e.preventDefault();
								}
							}}
						>
							<div className="relative flex flex-col h-full w-full text-3xl text-center text-emerald-400 bg-transparent border border-emerald-400/50 hover:bg-emerald-400/10 transition-all duration-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black">
								<span className="absolute top-0 left-4 text-[8rem] opacity-10 h-full flex items-center">
									{level.level}
								</span>
								<div className="z-10 p-4 flex flex-col h-full">
									<div className="flex justify-between items-center">
										<Badge
											variant="outline"
											className={`text-sm ${
												level.difficulty === "Beginner"
													? "text-green-400/70 border-green-400/50 bg-green-400/10"
													: level.difficulty ===
														  "Intermediate"
														? "text-yellow-400/70 border-yellow-400/50 bg-yellow-400/10"
														: "text-red-400/70 border-red-400/50 bg-red-400/10"
											}`}
										>
											{level.difficulty}
										</Badge>
										<div className="flex items-center gap-2">
											{isLevelLocked(level.level) && (
												<Lock className="w-4 h-4 text-emerald-400/70" />
											)}
											<p className="text-emerald-400/70 text-base">
												{level.points} pts
											</p>
										</div>
									</div>
									<p className="flex-1 flex mx-6 mt-4 text-center items-center text-emerald-400/70 text-base">
										{level.description}
									</p>
									<div className="flex justify-between mt-4">
										<p className="text-emerald-400/70 text-sm">
											Best: {level.bestTime}
										</p>
										<p className="text-emerald-400/70 text-sm">
											Attempts: {level.completions}
										</p>
									</div>
								</div>
							</div>
							{isLevelLocked(level.level) && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/50 h-full w-full rounded-lg">
									<Lock className="w-6 h-6 text-emerald-400/70" />
								</div>
							)}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
