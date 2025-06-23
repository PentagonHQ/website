"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthHook } from "@/src/hooks/use-auth-hook";
import { COLORS } from "@/src/constants/auth";
import { CoinAuth } from "c1ph3r_c01n";
import { Button } from "@/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle, XCircle, CircleUser, ChevronDown } from "lucide-react";

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
	const [showError, setShowError] = useState(false);
	const [isLoading, setIsLoading] = useState(false); // Changed initial state to false
	const [characters, setCharacters] = useState<{ char: string; color: keyof typeof COLORS }[]>([]);
	const [sdk, setSdk] = useState<CoinAuth | null>(null);
	const { getAuthRound, resolveCurrentRound, resetAuthState } = useAuthHook();
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [colorOffset, setColorOffset] = useState(0);
	const [isShuffling, setIsShuffling] = useState(false);
	const [showSequence, setShowSequence] = useState(false);
	const [revealIndex, setRevealIndex] = useState(-1);
	const [gameState, setGameState] = useState<'idle' | 'initializing' | 'playing' | 'completed'>('idle');
	const [resultMessage, setResultMessage] = useState({
		title: "",
		description: "",
		status: "" as "success" | "error" | "",
	});
	const [showResultDialog, setShowResultDialog] = useState(false);
	const [showCompletionDialog, setShowCompletionDialog] = useState(false);

	// Reset auth state when component unmounts
	useEffect(() => {
		return () => {
			resetAuthState();
		};
	}, []);

	console.log("roundData", roundData);

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

	// Function to start authentication with optimized state updates
	const startAuthentication = useCallback(async () => {
		// Immediately show loading state for better perceived performance
		setGameState('initializing');
		setIsLoading(true);
		setShowError(false);

		try {
			const { newAuthRound, sdk: newSdk } = await getAuthRound();
			
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
			setGameState('playing');
			setIsLoading(false);
			
		} catch (err) {
			console.error("Failed to initialize authentication:", err);
			
			// Batch error state updates
			setShowError(true);
			setIsLoading(false);
			setGameState('idle'); // Return to idle state on error
			
			if (!(err instanceof Error && err.message.includes("cancelled"))) {
				setTimeout(() => {
					setShowError(false);
					resetAuthState();
				}, 2000);
			}
		}
	}, [getAuthRound, generateNewChallenge, resetAuthState]);

	// Memoized colors array to avoid repeated object key lookups
	const colorKeys = useMemo(() => Object.keys(COLORS) as Array<keyof typeof COLORS>, []);

	// Function to get random color - optimized
	const getRandomColor = useCallback((): keyof typeof COLORS => {
		return colorKeys[Math.floor(Math.random() * colorKeys.length)];
	}, [colorKeys]);

	// Update showColorShuffleAnimation to be continuous
	const showColorShuffleAnimation = useCallback(() => {
		setIsShuffling(true);
		return setInterval(() => {
			setColorOffset((prev) => (prev + 1) % 4);
		}, 200);
	}, []);

	// Function to get color with shuffle effect - memoized
	const getColorWithShuffle = useCallback((color: keyof typeof COLORS): string => {
		if (isShuffling) {
			const colorIndex = colorKeys.indexOf(color);
			if (colorIndex === -1) return COLORS[color];
			const rotatedIndex = (colorIndex + colorOffset) % colorKeys.length;
			const rotatedColor = colorKeys[rotatedIndex];
			return COLORS[rotatedColor];
		}
		return COLORS[color];
	}, [isShuffling, colorOffset, colorKeys]);

	const handleDirectionSelect = useCallback(async (direction: string) => {
		if (showError || !sdk || !roundData?.colorAssignment) return;

		const newSelectedDirections = [...selectedDirections, direction];
		setSelectedDirections(newSelectedDirections);
		let shuffleInterval: NodeJS.Timeout | undefined;

		try {
			setIsTransitioning(true);
			shuffleInterval = showColorShuffleAnimation();

			const currentDirection = direction[0].toLowerCase();
			const roundResult = await resolveCurrentRound(sdk, currentDirection);

			if (shuffleInterval) {
				clearInterval(shuffleInterval);
			}
			
			// Batch animation state updates
			setIsShuffling(false);
			setIsTransitioning(false);
			setColorOffset(0);

			// Process round result
			if ('verificationResponse' in roundResult && roundResult.verificationResponse !== null) {
				if (roundResult.verificationResponse.verificationResult.verification_result) {
					// Set game state to completed
					setGameState('completed');
				} else {
					setResultMessage({
						title: "Authentication Failed",
						description: "Incorrect sequence. Please try again.",
						status: "error"
					});
					setShowResultDialog(true);
					setTimeout(() => {
						window.location.reload();
					}, 1500);
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
			setIsShuffling(false);
			setIsTransitioning(false);
			setColorOffset(0);
			
			console.error("Failed to process round:", err);
			setResultMessage({
				title: "Error",
				description: "Authentication failed",
				status: "error"
			});
			setShowResultDialog(true);
			setTimeout(() => {
				window.location.reload();
			}, 1500);
		}
	}, [showError, sdk, roundData, selectedDirections, showColorShuffleAnimation, resolveCurrentRound, currentRound, generateNewChallenge]);

	// Optimized keyboard event handler
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle keyboard events when the game is actively playing
			if (gameState !== 'playing' || showError) return;
			
			const direction = KEYBOARD_TO_DIRECTION[e.code as keyof typeof KEYBOARD_TO_DIRECTION];
			if (!direction) return;
			
			// Only prevent default if we're actually handling the key
			e.preventDefault();
			e.stopPropagation();
			
			handleDirectionSelect(direction);
		};

		// Only add event listener when game is playing
		if (gameState === 'playing' && !showError) {
			window.addEventListener("keydown", handleKeyDown);
		}
		
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleDirectionSelect, showError, gameState]);

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

	// Start the sequence reveal when game begins
	const startSequenceReveal = useCallback(() => {
		setTimeout(() => {
			setShowSequence(true);
			let currentIndex = 0;
			const revealInterval = setInterval(() => {
				if (currentIndex >= roundData!.colorAssignment.round) {
					clearInterval(revealInterval);
					setShowSequence(false);
					return;
				}
				setRevealIndex(currentIndex);
				currentIndex++;
			}, 800);
		}, 1000);
	}, [roundData]);

	// Handle navigation to next section
	const handleNextSection = useCallback(() => {
		// Dispatch a custom event to notify the parent component to scroll to next section
		window.dispatchEvent(new CustomEvent('navigateToNextSection'));
	}, []);

	// Show initial "Access Account" button with immediate feedback
	if (gameState === 'idle') {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-md mx-auto"
				>
					<div className="flex flex-col items-center space-y-6 text-center">
						<Button
							onClick={startAuthentication}
							variant="default"
							disabled={isLoading}
							className="w-full text-lg px-8 py-6 bg-white hover:bg-white/70 text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
						>
							{isLoading ? (
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
						
						{showError && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="w-full p-4 bg-red-400/10 border border-red-400/20 rounded-lg"
							>
								<div className="flex items-center gap-2 text-red-400">
									<XCircle className="w-4 h-4 flex-shrink-0" />
									<p className="text-sm">
										Authentication failed. Please try again.
									</p>
								</div>
							</motion.div>
						)}
					</div>
				</motion.div>
			</div>
		);
	}

	// Show loading state with faster transition
	if (isLoading || gameState === 'initializing') {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }} // Faster transition
					className="w-full max-w-md mx-auto"
				>
					<div className="border-emerald-400/20 bg-black/80 border rounded-lg p-8 backdrop-blur-sm">
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
							<p className="text-emerald-400">
								Authenticating...
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		);
	}

	// Show completion state
	if (gameState === 'completed') {
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
								<Button
									onClick={handleNextSection}
									variant="default"
									className="w-full"
								>
									Continue
									<ChevronDown className="w-4 h-4 ml-2" />
								</Button>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			{/* <div dangerouslySetInnerHTML={{ __html: hasCustomCredentials }} /> */}
			
			{gameState === 'playing' && (
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
								style={{
									borderColor: i < selectedDirections.length
										? "rgba(52, 211, 153, 0.4)"
										: "rgba(52, 211, 153, 0.1)",
									backgroundColor: i < selectedDirections.length
										? "rgba(52, 211, 153, 0.05)"
										: "transparent",
								}}
								className={`
									w-10 h-10 sm:w-12 sm:h-12 border-2
									${i === currentRound ? "ring-4 ring-white/30 scale-110" : ""}
									rounded-lg flex items-center justify-center 
									text-lg sm:text-xl font-bold
									transition-all duration-200
								`}
							>
								{showSequence && i <= revealIndex ? (
									<motion.span
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.2 }}
										className="text-emerald-400"
									>
										{roundData.colorAssignment.rotated_alphabet[i]}
									</motion.span>
								) : i < selectedDirections.length && (
									<motion.span
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.2 }}
										className="text-emerald-400"
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
									style={{
										backgroundColor: "rgba(255, 255, 255, 0.05)",
										color: "rgba(255, 255, 255, 0.05)",
										borderColor: "rgba(255, 255, 255, 0.1)",
									}}
									className="w-full aspect-square active:scale-95 transition-all duration-200 group-hover:scale-105 hover:bg-white/10"
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

			{/* Result State */}
			{showResultDialog && (
				<div className="fixed inset-0 flex items-center justify-center p-8 z-50">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="w-full max-w-md mx-auto"
					>
						<div className={`border-${resultMessage.status === 'success' ? 'emerald' : 'red'}-400/20 bg-black/80 border rounded-lg p-8 backdrop-blur-sm`}>
							<div className="flex flex-col items-center gap-6 text-center">
								{resultMessage.status === 'success' ? (
									<CheckCircle className="w-16 h-16 text-emerald-400" />
								) : (
									<XCircle className="w-16 h-16 text-red-400" />
								)}
								<h1 className={`text-${resultMessage.status === 'success' ? 'emerald' : 'red'}-400 text-3xl font-bold`}>
									{resultMessage.title}
								</h1>
								<p className={`text-${resultMessage.status === 'success' ? 'emerald' : 'red'}-400/70 text-lg leading-relaxed`}>
									{resultMessage.description}
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
}