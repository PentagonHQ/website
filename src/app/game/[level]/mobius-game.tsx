"use client";

import {motion} from "framer-motion";
import {useEffect} from "react";
import {ArrowUp, ArrowDown, ArrowLeft, ArrowRight} from "lucide-react";
import {Button} from "@/ui/button";
// import {MobiusGameProps} from "@/src/types";
import {useGameStore} from "@/store/use-game-store";
import {DialogManager} from "./dialog-manager";
import {allChars} from "@/lib/utils";
import {useKeyboardControls} from "@/hooks/use-keys";
import {useData} from "@/context/data-provider";
import {useSupabase} from "@/hooks/use-supabase";
import React from "react";

interface MobiusGameProps {
	password: string;
	bearing: {
		up: {color: string; key: "w"};
		right: {color: string; key: "d"};
		down: {color: string; key: "s"};
		left: {color: string; key: "a"};
	};
	level: number;
	onVerifyDirection?: (direction: string) => Promise<boolean>;
}

export default function MobiusGame({
	password,
	bearing,
	level,
	onVerifyDirection,
}: MobiusGameProps) {
	const {user} = useData();
	const {insertGameRecord} = useSupabase();
	const recordSaved = React.useRef(false);
	const {
		isGameStarted,
		timer,
		sequence,
		currentIndex,
		currentLevel,
		shuffledChars,
		showSequence,
		showRememberText,
		revealIndex,
		handleDirectionClick,
		getCharacterColor,
		initializeGame,
		formatTime,
		handleSequenceReveal,
		isColorRotationEnabled,
		isCharacterShuffleEnabled,
		isSequenceHidden,
		areButtonsColorless,
		isTimerRunning,
		updateTimer,
		formatTimeSpent,
	} = useGameStore();

	// Setup keyboard controls
	useKeyboardControls();

	// Initialize game with level
	useEffect(() => {
		initializeGame(password, bearing, level);
	}, [password, bearing, level, initializeGame]);

	// Handle sequence reveal
	useEffect(() => {
		handleSequenceReveal();
	}, [handleSequenceReveal]);

	// Handle timer updates
	useEffect(() => {
		if (!isTimerRunning) return;

		const interval = setInterval(() => {
			updateTimer();
		}, 10);

		return () => clearInterval(interval);
	}, [isTimerRunning, updateTimer]);

	// Add effect to handle game completion and record saving
	useEffect(() => {
		const isLevelComplete = currentIndex === password.length - 1;
		if (
			isLevelComplete &&
			user &&
			!isTimerRunning &&
			!recordSaved.current
		) {
			recordSaved.current = true;
			const timeSpent = formatTimeSpent(timer);
			insertGameRecord({
				user_id: user.id,
				level: currentLevel,
				time_spent: timeSpent,
			}).catch((error) => {
				console.error("Failed to save game record:", error);
			});
		}

		// Reset the flag when starting a new level
		if (!isLevelComplete) {
			recordSaved.current = false;
		}
	}, [
		currentIndex,
		password.length,
		user,
		timer,
		currentLevel,
		isTimerRunning,
		insertGameRecord,
	]);

	// Handle direction click with verification for level 7
	const handleDirection = async (direction: "up" | "down" | "left" | "right") => {
		if (level === 7 && onVerifyDirection) {
			// For level 7, use the auth verification
			const isCorrect = await onVerifyDirection(direction);
			if (isCorrect) {
				handleDirectionClick(direction);
			} else {
				// Handle incorrect input
				handleDirectionClick("wrong" as any); // This will trigger the error handling
			}
		} else {
			// For other levels, use the normal game logic
			handleDirectionClick(direction);
		}
	};

	return (
		<div className="w-full h-full flex-1 items-center justify-center">
			<DialogManager />

			<div className="w-full flex flex-col items-center gap-3 sm:gap-5">
				{/* Timer */}
				<div className="flex flex-col w-full items-center gap-4 mb-4">
					<div
						className={`text-2xl font-mono font-bold ${
							timer.minutes === 0 && timer.seconds <= 10
								? "text-red-400 animate-pulse"
								: "text-emerald-400"
						}`}
					>
						{formatTime(timer)}
					</div>
				</div>

				{/* Sequence boxes */}
				<motion.div
					initial={{opacity: 0, y: -20}}
					animate={{opacity: 1, y: 0}}
					className="flex gap-3 sm:gap-5 mb-4 sm:mb-8 relative min-h-[3rem] sm:min-h-[4rem] md:min-h-[5rem]"
				>
					{!isSequenceHidden && showRememberText ? (
						<motion.div
							initial={{opacity: 0, scale: 0.9}}
							animate={{opacity: 1, scale: 1}}
							exit={{opacity: 0}}
							transition={{duration: 0.3}}
							className="text-emerald-400 text-lg font-bold whitespace-nowrap
									 bg-black/50 px-6 py-3 rounded-lg backdrop-blur-sm
									 w-[calc(6*3rem+5*0.75rem)] sm:w-[calc(6*4rem+5*1.25rem)] md:w-[calc(6*5rem+5*1.25rem)]
									 h-12 sm:h-16 md:h-20
									 flex items-center justify-center"
						>
							Remember this sequence
						</motion.div>
					) : (
						<>
							{[...Array(password.length)].map((_, i) => (
								<div
									key={i}
									style={{
										borderColor:
											i < sequence.length
												? "rgba(52, 211, 153, 0.4)"
												: "rgba(52, 211, 153, 0.1)",
										backgroundColor:
											i < sequence.length
												? "rgba(52, 211, 153, 0.05)"
												: "transparent",
										color: getCharacterColor(
											password[i],
											i
										),
									}}
									className={`
										w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2
										${i === currentIndex ? "ring-4 ring-white/30 scale-110" : ""}
										rounded-lg flex items-center justify-center 
										text-xl sm:text-2xl md:text-3xl font-bold
										transition-all duration-200
									`}
								>
									{((showSequence && i <= revealIndex) ||
										showRememberText) &&
									!isSequenceHidden
										? password[i]
										: i < sequence.length && (
												<motion.span
													initial={{
														scale: 0,
														opacity: 0,
													}}
													animate={{
														scale: 1,
														opacity: 1,
													}}
													transition={{duration: 0.1}}
													className="text-emerald-400"
												>
													*
												</motion.span>
											)}
								</div>
							))}
						</>
					)}
				</motion.div>

				{/* Character grid */}
				<div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 my-6 px-4">
					{(isCharacterShuffleEnabled ? shuffledChars : allChars).map(
						(char) => (
							<div
								key={char}
								style={{
									color: getCharacterColor(char, -1),
									borderColor: getCharacterColor(
										char,
										-1
									).replace("1)", "0.8)"),
									backgroundColor: getCharacterColor(
										char,
										-1
									).replace("1)", "0.2)"),
								}}
								className={`
								text-lg sm:text-2xl md:text-3xl lg:text-4xl
								font-bold flex items-center justify-center 
								py-2 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8
								rounded-lg shadow-lg border
								transition-colors duration-500
								bg-emerald-400/10 border-emerald-400/20
							`}
							>
								{char}
							</div>
						)
					)}
				</div>

				{/* Direction pad */}
				<div className="grid grid-cols-3 gap-2 sm:gap-3 w-48 sm:w-56 md:w-64">
					{[
						{direction: "up", col: "col-start-2", row: ""},
						{
							direction: "left",
							col: "col-start-1",
							row: "row-start-2",
						},
						{
							direction: "right",
							col: "col-start-3",
							row: "row-start-2",
						},
						{
							direction: "down",
							col: "col-start-2",
							row: "row-start-3",
						},
					].map(({direction, col, row}) => (
						<div key={direction} className={`${col} ${row} group`}>
							<Button
								variant="outline"
								onClick={(e) => {
									e.preventDefault();
									handleDirection(
										direction as
											| "up"
											| "down"
											| "left"
											| "right"
									);
								}}
								style={{
									backgroundColor: areButtonsColorless
										? "rgba(255, 255, 255, 0.05)"
										: bearing[
												direction as keyof typeof bearing
											].color.replace("1)", "0.2)"),
									color: areButtonsColorless
										? "rgba(255, 255, 255, 0.05)"
										: bearing[
												direction as keyof typeof bearing
											].color.replace("1)", "0.8)"),
									borderColor: areButtonsColorless
										? "rgba(255, 255, 255, 0.1)"
										: bearing[
												direction as keyof typeof bearing
											].color.replace("1)", "0.8)"),
								}}
								className={`w-full aspect-square active:scale-95 transition-all duration-200 group-hover:scale-105 ${
									areButtonsColorless
										? "hover:bg-white/10"
										: ""
								}`}
							>
								{direction === "up" && (
									<ArrowUp
										className={`h-10 w-10 ${areButtonsColorless ? "text-white" : ""} group-hover:animate-pulse`}
									/>
								)}
								{direction === "down" && (
									<ArrowDown
										className={`h-10 w-10 ${areButtonsColorless ? "text-white" : ""} group-hover:animate-pulse`}
									/>
								)}
								{direction === "left" && (
									<ArrowLeft
										className={`h-10 w-10 ${areButtonsColorless ? "text-white" : ""} group-hover:animate-pulse`}
									/>
								)}
								{direction === "right" && (
									<ArrowRight
										className={`h-10 w-10 ${areButtonsColorless ? "text-white" : ""} group-hover:animate-pulse`}
									/>
								)}
							</Button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
