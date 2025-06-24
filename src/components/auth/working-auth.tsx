"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuthHook } from "@/src/hooks/use-auth-hook";
import { COLORS } from "@/src/constants/auth";
import { PentagonAuth } from "penta-auth-sdk";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/ui/dialog";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle, XCircle, CircleUser } from "lucide-react";

// Add keyboard mapping constant
const KEYBOARD_TO_DIRECTION = {
	'ArrowUp': 'UP',
	'ArrowDown': 'DOWN',
	'ArrowLeft': 'LEFT',
	'ArrowRight': 'RIGHT',
	'KeyW': 'UP',
	'KeyS': 'DOWN',
	'KeyA': 'LEFT',
	'KeyD': 'RIGHT'
} as const;

// Define the fixed layout - pre-sorted to avoid runtime sorting
const FIXED_LAYOUT = {
	numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], // Already sorted
	letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], // Already sorted
	symbols: ['!', '#', '$', '@']
};

interface ColorAssignment {
	color_mapping: Record<string, string>;
	offset: number;
	rotated_alphabet: string;
	round: number;
}

interface ProverState {
  commitments: string[];
  entropy_layers: number[];
  eth_address: string;
  holy_primes: Array<{
    attempt: number;
    candidate_prime: number;
    holy_prime: number;
  }>;
  nonce: string;
  public_key: string;
  root_commitment: string;
}

interface AuthRound {
  colorAssignment: ColorAssignment;
  currentRound: number;
  proverState: ProverState;
}

// Pre-compute color mapping to avoid repeated lookups
const COLOR_NAME_TO_KEY: Record<string, keyof typeof COLORS> = {
	'Red': 'Red',
	'Green': 'Green',
	'Blue': 'Blue',
	'Yellow': 'Yellow'
};

export default function WorkingAuth() {
	const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
	const [currentRound, setCurrentRound] = useState(0);
	const [roundData, setRoundData] = useState<AuthRound | null>(null);

	const [isLoading, setIsLoading] = useState(false);
	const [characters, setCharacters] = useState<{ char: string; color: keyof typeof COLORS }[]>([]);
	const [sdk, setSdk] = useState<PentagonAuth | null>(null);
	const { getAuthRound, resolveCurrentRound, resetAuthState } = useAuthHook();
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [authState, setAuthState] = useState<'idle' | 'initializing' | 'playing' | 'completed'>('idle');
	const [resultMessage, setResultMessage] = useState({
		title: "",
		description: "",
		status: "" as "success" | "error" | "",
	});
	const [showResultDialog, setShowResultDialog] = useState(false);

	// Reset auth state when component unmounts
	useEffect(() => {
		return () => {
			resetAuthState();
		};
	}, []);

	// Memoized character generation to avoid recalculation
	const generateNewChallenge = useCallback((roundData: ColorAssignment) => {
		if (!roundData?.color_mapping || !roundData?.rotated_alphabet) return;

		const colorMapping = roundData.color_mapping;
		const rotatedAlphabet = roundData.rotated_alphabet;

		const charToColor: Record<string, keyof typeof COLORS> = {};
		// Use for...of for better performance than forEach
		for (const char of rotatedAlphabet) {
			charToColor[char] = COLOR_NAME_TO_KEY[colorMapping[char]];
		}

		// Create characters without sorting since FIXED_LAYOUT is pre-sorted
		const numbers = FIXED_LAYOUT.numbers.map(char => ({
			char,
			color: charToColor[char] || 'Blue' as keyof typeof COLORS
		}));

		const letters = FIXED_LAYOUT.letters.map(char => ({
			char,
			color: charToColor[char] || 'Blue' as keyof typeof COLORS
		}));

		const symbols = FIXED_LAYOUT.symbols.map(char => ({
			char,
			color: charToColor[char] || 'Blue' as keyof typeof COLORS
		}));

		// Combine the groups
		const newCharacters = [...numbers, ...letters, ...symbols];
		setCharacters(newCharacters);
	}, []);

	// Handle error dialog close
	const handleErrorDialogClose = useCallback(() => {
		setShowResultDialog(false);
		setResultMessage({ title: "", description: "", status: "" });
		// Reset to idle state and scroll back to this section
		setAuthState('idle');
		resetAuthState();
		
		// Scroll back to this section after a brief delay
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 100);
	}, [resetAuthState]);

	// Function to start authentication with optimized state updates
	const startAuthentication = useCallback(async () => {
		// Force immediate state update and re-render
		setIsLoading(true);
		setAuthState('initializing');
		
		// Add a small delay to ensure the UI updates
		await new Promise(resolve => setTimeout(resolve, 50));

		try {
			// Ensure minimum loading time for better UX
			const [authResult] = await Promise.all([
				getAuthRound(),
				new Promise(resolve => setTimeout(resolve, 800)) // Minimum 800ms loading time
			]);

			const { newAuthRound, sdk: newSdk } = authResult;
			
			if (!newSdk) {
				throw new Error("Failed to initialize SDK");
			}
			
			if (!newAuthRound?.colorAssignment) {
				throw new Error("Invalid auth round data");
			}

			// Batch all successful state updates
			setSdk(newSdk);
			setRoundData({
				colorAssignment: newAuthRound.colorAssignment as unknown as ColorAssignment,
				currentRound: newAuthRound.currentRound,
				proverState: newAuthRound.proverState as unknown as ProverState
			});
			
			generateNewChallenge(newAuthRound.colorAssignment as unknown as ColorAssignment);
			
			// Final state updates
			setIsLoading(false);
			setAuthState('playing');
			
		} catch (err) {
			console.error("Failed to initialize authentication:", err);
			
			// Batch error state updates
			setIsLoading(false);
			setAuthState('idle'); // Return to idle state on error
			
			// Set error dialog message
			let errorMessage = "Authentication failed. Please try again.";
			if (err instanceof Error && err.message.includes("cancelled")) {
				errorMessage = "Authentication was cancelled.";
			}
			
			setResultMessage({
				title: "Authentication Failed",
				description: errorMessage,
				status: "error"
			});
			setShowResultDialog(true);
			
			// Auto-close the dialog after 2 seconds
			setTimeout(() => {
				handleErrorDialogClose();
			}, 2000);
		}
	}, [getAuthRound, generateNewChallenge, resetAuthState, handleErrorDialogClose]);

	// Memoized colors array to avoid repeated object key lookups
	const colorKeys = useMemo(() => Object.keys(COLORS) as Array<keyof typeof COLORS>, []);

	// Function to get random color - optimized
	const getRandomColor = useCallback((): keyof typeof COLORS => {
		return colorKeys[Math.floor(Math.random() * colorKeys.length)];
	}, [colorKeys]);

	const handleDirectionSelect = useCallback(async (direction: string) => {
		if (showResultDialog || !sdk || !roundData?.colorAssignment) return;

		const newSelectedDirections = [...selectedDirections, direction];
		setSelectedDirections(newSelectedDirections);
		let shuffleInterval: NodeJS.Timeout | undefined;

		try {
			setIsTransitioning(true);
			// shuffleInterval = showColorShuffleAnimation();

			const currentDirection = direction[0].toLowerCase();
			const roundResult = await resolveCurrentRound(sdk, currentDirection);

			if (shuffleInterval) {
				clearInterval(shuffleInterval);
			}
			
			// Batch animation state updates
			// setIsShuffling(false);
			setIsTransitioning(false);
			// setColorOffset(0);

			// Process round result
			if ('verificationResponse' in roundResult && roundResult.verificationResponse !== null) {
				if (roundResult.verificationResponse.verificationResult.verification_result) {
					// Set game state to completed
					setAuthState('completed');
				} else {
					setResultMessage({
						title: "Authentication Failed",
						description: "Incorrect sequence. Please try again.",
						status: "error"
					});
					setShowResultDialog(true);
					setTimeout(() => {
						handleErrorDialogClose();
					}, 2000);
				}
			} else if ('colorAssignment' in roundResult && roundResult.colorAssignment) {
				// If no verification response, this is a new round
				const nextRound = currentRound + 1;
				setCurrentRound(nextRound);
				
				setRoundData({
					colorAssignment: roundResult.colorAssignment as unknown as ColorAssignment,
					currentRound: nextRound,
					proverState: roundData.proverState
				});
				
				generateNewChallenge(roundResult.colorAssignment as unknown as ColorAssignment);
			}
		} catch (err) {
			// Ensure animation stops in case of error
			if (shuffleInterval) {
				clearInterval(shuffleInterval);
			}
			
			// Batch error state updates
			// setIsShuffling(false);
			setIsTransitioning(false);
			// setColorOffset(0);
			
			console.error("Failed to process round:", err);
			setResultMessage({
				title: "Error",
				description: "Authentication failed",
				status: "error"
			});
			setShowResultDialog(true);
			setTimeout(() => {
				handleErrorDialogClose();
			}, 2000);
		}
	}, [showResultDialog, sdk, roundData, selectedDirections, resolveCurrentRound, currentRound, generateNewChallenge, handleErrorDialogClose]);

	// Optimized keyboard event handler
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle keyboard events when the game is actively playing
			if (authState !== 'playing' || showResultDialog) return;
			
			const direction = KEYBOARD_TO_DIRECTION[e.code as keyof typeof KEYBOARD_TO_DIRECTION];
			if (!direction) return;
			
			// Only prevent default if we're actually handling the key
			e.preventDefault();
			e.stopPropagation();
			
			handleDirectionSelect(direction);
		};

		// Only add event listener when game is playing
		if (authState === 'playing' && !showResultDialog) {
			window.addEventListener("keydown", handleKeyDown);
		}
		
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleDirectionSelect, showResultDialog, authState]);

	// Character Box Component with optimized re-renders
	const CharacterBox = useMemo(() => {
		return ({ char, color, index }: { char: string; color: keyof typeof COLORS; index: number }) => {
			const [currentColor, setCurrentColor] = useState(color);

			useEffect(() => {
				if (isTransitioning) {
					const interval = setInterval(() => {
						setCurrentColor(getRandomColor());
					}, 100);
					return () => clearInterval(interval);
				} else {
					setCurrentColor(color);
				}
			}, [isTransitioning, color]);

			return (
				<motion.div
					key={`${char}-${index}-${currentRound}`}
					className={`
						text-lg sm:text-2xl md:text-3xl lg:text-4xl
						font-bold flex items-center justify-center 
						py-2 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8
						rounded-lg shadow-lg border
						transition-colors duration-500
						font-mono
					`}
					style={{ 
						color: COLORS[currentColor],
						borderColor: COLORS[currentColor].replace("1)", "0.8)"), 
						backgroundColor: COLORS[currentColor].replace("1)", "0.2)"),
					}}
					whileHover={{ scale: 1.05 }}
					animate={{ 
						scale: [1, 1.02, 1],
						transition: { duration: 2, repeat: Infinity }
					}}
				>
					{char}
				</motion.div>
			);
		};
	}, [isTransitioning, currentRound, getRandomColor]);

	// Show initial "Access Account" button with immediate feedback
	if (authState === 'idle' || authState === 'initializing' || isLoading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-md mx-auto"
				>
					<div className="flex flex-col items-center space-y-6 text-center">
						<Button
							key={`access-btn-${isLoading}-${authState}`}
							onClick={startAuthentication}
							variant="default"
							disabled={isLoading || authState === 'initializing'}
							className="w-full text-lg px-8 py-6 bg-white hover:bg-white/70 text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-none transition-opacity duration-200"
						>
							{isLoading || authState === 'initializing' ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent mr-2" />
									Authenticating...
								</>
							) : (
								<>
									<CircleUser className="w-6 h-6 mr-2" />
									Access Account
								</>
							)}
						</Button>
					</div>
				</motion.div>
			</div>
		);
	}

	// Show completion state
	if (authState === 'completed') {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full max-w-md mx-auto"
				>
					<div className="bg-black/80 rounded-lg p-8 backdrop-blur-sm">
						<div className="flex flex-col items-center space-y-6 text-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
							>
								<CheckCircle className="w-16 h-16 text-white" />
							</motion.div>
							
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="space-y-2"
							>
								<h1 className="text-white text-xl font-bold">
									Success!
								</h1>
								<p className="text-white/70 text-sm">
									You have accessed a secret area
								</p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
								className="w-full"
							>
								<a href="mailto:arvin@usepentagon.com?subject=I%20solved%20it!&body=I%20successfully%20completed%20the%20Pentagon%20authentication%20challenge.">
									<Button variant="default" className="w-full rounded-none">
										arvin@usepentagon.com
									</Button>
								</a>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			
			{authState === 'playing' && (
				<div className="flex flex-col items-center justify-center space-y-6">
					{/* Progress/Input Boxes */}
					<motion.div
						initial={{opacity: 0, y: -20}}
						animate={{opacity: 1, y: 0}}
						className="flex gap-2 sm:gap-3 relative min-h-[2.5rem] sm:min-h-[3rem]"
					>
						{roundData?.colorAssignment && Array.from({ length: roundData.colorAssignment.round }).map((_, i) => (
							<div
								key={i}
								className="
									bg-black/10 rounded-lg w-10 h-10 sm:w-12 sm:h-12 border-2 border-white/60
									flex items-center justify-center 
									text-lg sm:text-xl font-bold
									transition-all duration-200"
							>
								{i < selectedDirections.length && (
									<motion.span
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.2 }}
										className="text-white mt-2"
									>
										*
									</motion.span>
								)}
							</div>
						))}
					</motion.div>

					{/* Character Grid */}
					<div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 px-4">
						<motion.div
							className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 w-full max-w-5xl"
							layout
						>
							{characters.map((item, index) => (
								<CharacterBox
									key={`${item.char}-${index}`}
									char={item.char}
									color={item.color}
									index={index}
								/>
							))}
						</motion.div>
					</div>

					{/* Arrow Keys */}
					<div className="grid grid-cols-3 gap-2 w-48 pt-12">
						{[
							{direction: "UP", col: "col-start-2", row: ""},
							{direction: "LEFT", col: "col-start-1", row: "row-start-2"},
							{direction: "RIGHT", col: "col-start-3", row: "row-start-2"},
							{direction: "DOWN", col: "col-start-2", row: "row-start-3"},
						].map(({direction, col, row}) => (
							<div
								key={direction}
								className={`${col} ${row} group`}
							>
								<Button
									variant="outline"
									onClick={(e) => {
										e.preventDefault();
										handleDirectionSelect(direction);
									}}
									className="bg-black/10 border-white/60 text-white/60 w-full aspect-square active:scale-95 transition-all duration-200 group-hover:scale-105 hover:bg-white/10"
								>
									{direction === "UP" && (
										<ArrowUp className="h-8 w-8 sm:h-8 sm:w-8 text-white group-hover:animate-pulse" />
									)}
									{direction === "DOWN" && (
										<ArrowDown className="h-8 w-8 sm:h-8 sm:w-8 text-white group-hover:animate-pulse" />
									)}
									{direction === "LEFT" && (
										<ArrowLeft className="h-8 w-8 sm:h-8 sm:w-8 text-white group-hover:animate-pulse" />
									)}
									{direction === "RIGHT" && (
										<ArrowRight className="h-8 w-8 sm:h-8 sm:w-8 text-white group-hover:animate-pulse" />
									)}
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			<Dialog open={showResultDialog} onOpenChange={() => {}}>
				<DialogContent className="bg-black/90 border-white/20 max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
					<DialogTitle className="sr-only">
						{resultMessage.status === 'error' ? 'Error' : 'Result'}
					</DialogTitle>
					
					<div className="flex flex-col items-center space-y-6 text-center p-6">
						{resultMessage.status === 'error' ? (
							<XCircle className="w-16 h-16 text-red-400" />
						) : (
							<CheckCircle className="w-16 h-16 text-emerald-400" />
						)}
						
						<div className="space-y-2">
							<DialogTitle className={`${resultMessage.status === 'error' ? 'text-red-400' : 'text-emerald-400'} text-xl font-bold`}>
								{resultMessage.title || "Result"}
							</DialogTitle>
							<DialogDescription className={`${resultMessage.status === 'error' ? 'text-red-400/70' : 'text-emerald-400/70'} text-sm`}>
								{resultMessage.description || "Authentication failed. Please try again."}
							</DialogDescription>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}