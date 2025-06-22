"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthHook } from "@/src/hooks/use-auth-hook";
import { COLORS } from "@/src/constants/auth";
import { CoinAuth } from "c1ph3r_c01n";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { useData } from "@/context/data-provider";
import { useSupabase } from "@/hooks/use-supabase";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

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

// Define the fixed layout
const FIXED_LAYOUT = {
	numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
	letters: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
				'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
				'Z', 'X', 'C', 'V', 'B', 'N', 'M'],
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

interface VerificationResponse {
	verificationResult: boolean;
	message: string;
}

export default function Level7() {
	const router = useRouter();
	const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
	const [currentRound, setCurrentRound] = useState(0);
	const [roundData, setRoundData] = useState<AuthRound | null>(null);
	const [showError, setShowError] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [characters, setCharacters] = useState<{ char: string; color: keyof typeof COLORS }[]>([]);
	const [sdk, setSdk] = useState<CoinAuth | null>(null);
	const { getAuthRound, resolveCurrentRound, authState, resetAuthState } = useAuthHook();
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [colorOffset, setColorOffset] = useState(0);
	const [isShuffling, setIsShuffling] = useState(false);
	const {gameData} = useData();
	const userGameStats = gameData?.userGameStats;
	const { user } = useData();
	const { insertGameRecord } = useSupabase();
	const [startTime, setStartTime] = useState<Date | null>(null);
	const [timer, setTimer] = useState({ minutes: 1, seconds: 0, milliseconds: 0 });
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [showRememberText, setShowRememberText] = useState(false);
	const [showSequence, setShowSequence] = useState(false);
	const [revealIndex, setRevealIndex] = useState(-1);
	const [gameState, setGameState] = useState<'initializing' | 'ready' | 'playing' | 'completed'>('initializing');
	const [showInstructions, setShowInstructions] = useState(true);
	const [previousBestTime, setPreviousBestTime] = useState<string | null>(null);
	const [resultMessage, setResultMessage] = useState({
		title: "",
		description: "",
		status: "" as "success" | "error" | "",
	});
	const [showResultDialog, setShowResultDialog] = useState(false);
	const [showCompletionDialog, setShowCompletionDialog] = useState(false);
	const [isRevealingSequence, setIsRevealingSequence] = useState(false);
	const [characterPositions, setCharacterPositions] = useState<Array<{char: string; id: number}>>([]);
	const [isGameDataLoading, setIsGameDataLoading] = useState(true);

	// Reset auth state when component unmounts
	useEffect(() => {
		return () => {
			resetAuthState();
		};
	}, []);

	// Timer effect
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isTimerRunning) {
			interval = setInterval(() => {
				setTimer(prevTimer => {
					// Check if timer has reached zero
					if (prevTimer.minutes === 0 && prevTimer.seconds === 0 && prevTimer.milliseconds === 0) {
						setShowError(true);
						setIsTimerRunning(false);
						return prevTimer;
					}

					// Calculate new timer values
					let newTimer = {...prevTimer};
					if (prevTimer.milliseconds > 0) {
						newTimer.milliseconds -= 10;
					} else if (prevTimer.seconds > 0) {
						newTimer.seconds -= 1;
						newTimer.milliseconds = 990;
					} else if (prevTimer.minutes > 0) {
						newTimer.minutes -= 1;
						newTimer.seconds = 59;
						newTimer.milliseconds = 990;
					}

					return newTimer;
				});
			}, 10);
		}
		return () => clearInterval(interval);
	}, [isTimerRunning]);

	// Format timer display
	const formatTime = (time: { minutes: number; seconds: number; milliseconds: number }) => {
		return `${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}.${String(time.milliseconds).padStart(2, '0')}`;
	};

	const formatTimeSpent = (timer: { minutes: number; seconds: number; milliseconds: number }) => {
		const spentSeconds = 59 - timer.seconds;
		const spentMilliseconds = 999 - timer.milliseconds;
		return `${timer.minutes}:${spentSeconds < 10 ? "0" : ""}${spentSeconds}.${spentMilliseconds < 100 ? "0" : ""}${spentMilliseconds}`;
	};

	// Add a data loading check effect
	useEffect(() => {
		const checkDataLoading = () => {
			if (!gameData || !userGameStats || userGameStats.length === 0) {
				setIsGameDataLoading(true);
				return;
			}
			setIsGameDataLoading(false);
		};

		checkDataLoading();
	}, [gameData, userGameStats]);

	// Update initialization effect
	useEffect(() => {
		const init = async () => {
			try {
				if (!authState.isInitialized) {
					return;
				}

				if (authState.isAuthenticating || authState.isAuthenticated) {
					return;
				}

				// Wait for game data to be available
				if (!gameData || !userGameStats || userGameStats.length === 0) {
					return;
				}

				setGameState('initializing');
				setIsLoading(true);

				// Check if user has completed level 6
				const level6Stats = userGameStats.find((stat: {level: number}) => stat.level === 6);
				if (!level6Stats?.completion_count) {
					router.push("/dashboard/game");
					return;
				}

				const { newAuthRound, sdk: newSdk } = await getAuthRound();
				
				if (!newSdk) {
					throw new Error("Failed to initialize SDK");
				}
				
				setSdk(newSdk);
				
				if (!newAuthRound?.colorAssignment) {
					throw new Error("Invalid auth round data");
				}

				setRoundData({
					colorAssignment: newAuthRound.colorAssignment as unknown as ColorAssignment,
					currentRound: newAuthRound.currentRound,
					proverState: newAuthRound.proverState as unknown as ProverState
				});
				
				generateNewChallenge(newAuthRound.colorAssignment as unknown as ColorAssignment);
				setGameState('ready');
				
			} catch (err) {
				console.error("Failed to initialize authentication:", err);
				setShowError(true);
				if (!(err instanceof Error && err.message.includes("cancelled"))) {
					setTimeout(() => {
						setShowError(false);
						resetAuthState();
					}, 2000);
				}
			} finally {
				setIsLoading(false);
			}
		};

		init();
	}, [authState.isInitialized, authState.isAuthenticating, authState.isAuthenticated, gameData, userGameStats]);

	const handleRetry = () => {
		window.location.reload();
	};

	const handlePlayAgain = () => {
		setShowCompletionDialog(false);
		window.location.href = '/dashboard/game/7';
	};

	// Function to shuffle array
	const shuffleArray = <T,>(array: T[]): T[] => {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	};

	// Generate characters with color mappings from API response
	const generateNewChallenge = (roundData: ColorAssignment) => {
		if (!roundData?.color_mapping || !roundData?.rotated_alphabet) return;

		const colorMapping = roundData.color_mapping;
		const rotatedAlphabet = roundData.rotated_alphabet;

		const colorNameToKey: Record<string, keyof typeof COLORS> = {
			'Red': 'Red',
			'Green': 'Green',
			'Blue': 'Blue',
			'Yellow': 'Yellow'
		};

		const charToColor: Record<string, keyof typeof COLORS> = {};
		rotatedAlphabet.split('').forEach((char: string) => {
			charToColor[char] = colorNameToKey[colorMapping[char]];
		});

		// Create and sort characters within their respective groups
		const numbers = FIXED_LAYOUT.numbers
			.sort((a, b) => a.localeCompare(b))
			.map(char => ({
				char,
				color: charToColor[char] || 'Blue'
			}));

		const letters = FIXED_LAYOUT.letters
			.sort((a, b) => a.localeCompare(b))
			.map(char => ({
				char,
				color: charToColor[char] || 'Blue'
			}));

		const symbols = FIXED_LAYOUT.symbols
			// .sort((a, b) => a.localeCompare(b))
			.map(char => ({
				char,
				color: charToColor[char] || 'Blue'
			}));

		// Combine the sorted groups
		const newCharacters = [...numbers, ...letters, ...symbols];
		setCharacters(newCharacters);
	};

	// Function to get random color
	const getRandomColor = (): keyof typeof COLORS => {
		const colors: (keyof typeof COLORS)[] = ['Red', 'Green', 'Blue', 'Yellow'];
		return colors[Math.floor(Math.random() * colors.length)];
	};

	// Update showColorShuffleAnimation to be continuous
	const showColorShuffleAnimation = () => {
		setIsShuffling(true);
		return setInterval(() => {
			setColorOffset((prev) => (prev + 1) % 4);
		}, 200);
	};

	// Function to get color with shuffle effect
	const getColorWithShuffle = (color: keyof typeof COLORS): string => {
		if (isShuffling) {
			const uniqueColors = Object.keys(COLORS) as Array<keyof typeof COLORS>;
			const colorIndex = uniqueColors.indexOf(color);
			if (colorIndex === -1) return COLORS[color];
			const rotatedIndex = (colorIndex + colorOffset) % uniqueColors.length;
			const rotatedColor = uniqueColors[rotatedIndex];
			return COLORS[rotatedColor];
		}
		return COLORS[color];
	};

	const handleDirectionSelect = async (direction: string) => {
		if (showError || showSuccess || !sdk || !roundData?.colorAssignment) return;

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
			setIsShuffling(false);
			setIsTransitioning(false);
			setColorOffset(0);

			// Process round result
			if ('verificationResponse' in roundResult && roundResult.verificationResponse !== null) {
				if (roundResult.verificationResponse.verificationResult.verification_result) {
					// Stop timer
					setIsTimerRunning(false);
					
					// Calculate time spent
					const endTime = new Date();
					const timeSpent = startTime ? 
						`${Math.floor((endTime.getTime() - startTime.getTime()) / 1000)}:${(endTime.getTime() - startTime.getTime()) % 1000}` 
						: "0:0";

					// Save game record
					if (user) {
						try {
							await insertGameRecord({
								user_id: user.id,
								level: 7,
								time_spent: timeSpent
							});
						} catch (error) {
							console.error("Failed to save game record:", error);
						}
					}

					setResultMessage({
						title: "Success!",
						description: "Level completed successfully",
						status: "success"
					});
					setShowResultDialog(true);
					
					// Show completion dialog after success message
					setTimeout(() => {
						setShowResultDialog(false);
						setShowCompletionDialog(true);
					}, 1000);
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
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code.startsWith('Arrow') || ['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
				e.preventDefault();
			}

			const direction = KEYBOARD_TO_DIRECTION[e.code as keyof typeof KEYBOARD_TO_DIRECTION];
			if (!direction || showError || showSuccess) return;

			handleDirectionSelect(direction);
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedDirections, showError, showSuccess, handleDirectionSelect]);

	// Character Box Component with color shuffle animation
	const CharacterBox = ({ char, color, index }: { char: string; color: keyof typeof COLORS; index: number }) => {
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

	// Add startGame function
	const startGame = () => {
		setShowInstructions(false);
		setGameState('playing');
		setTimeout(() => {
			setShowSequence(true);
			let currentIndex = 0;
			const revealInterval = setInterval(() => {
				if (currentIndex >= roundData!.colorAssignment.round) {
					clearInterval(revealInterval);
					setShowSequence(false);
					setIsTimerRunning(true);
					setStartTime(new Date());
					// setTimeout(() => {
					// 	setShowSequence(false);
					// 	setStartTime(new Date());
					// 	setIsTimerRunning(true);
					// }, 1000);
					return;
				}
				setRevealIndex(currentIndex);
				currentIndex++;
			}, 800);
		}, 2000);
	};

	if (isLoading || isGameDataLoading || gameState === 'initializing') {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Dialog open={true} onOpenChange={() => {}}>
					<DialogContent className="border-emerald-400/20 bg-black/40 w-[90%] max-w-md min-h-[200px] flex flex-col justify-center items-center p-8 rounded-lg">
						<VisuallyHidden>
							<DialogHeader>
								<DialogTitle>Loading</DialogTitle>
							</DialogHeader>
						</VisuallyHidden>
						<div className="flex flex-col items-center space-y-4">
							<div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
							<p className="text-emerald-400">
								{isGameDataLoading ? "Loading game data..." : "Initializing Level 7..."}
							</p>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	if (gameState === 'ready' && showInstructions) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Dialog open={true} onOpenChange={() => {}}>
					<DialogContent className="border-emerald-400/20 bg-black/40 w-[90%] max-w-2xl min-h-[200px] flex flex-col justify-between items-center p-8 rounded-lg">
						<DialogHeader className="space-y-6">
							<div className="flex flex-col items-center gap-4">
								<DialogTitle className="text-3xl font-bold text-emerald-400">Level 7: Authentication Challenge</DialogTitle>
							</div>
							<div className="space-y-4 text-center text-emerald-400/70 text-lg leading-relaxed">
								<DialogDescription className="text-md">
									Can you master the final challenge?
								</DialogDescription>
								<DialogDescription className="text-md">
									Remember the sequence of colors and directions to prove your identity.
								</DialogDescription>
								<DialogDescription className="text-md">
									You have 1 minute to complete the challenge.
								</DialogDescription>
							</div>
							<Button
								onClick={startGame}
								className="mt-4 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-lg px-8 py-4"
							>
								Start Challenge
							</Button>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	const hasCustomCredentials = `
		<script>
		(function checkCredentials() {
			window.hasCustomCredentials = !!(localStorage.getItem('c1ph3r_encrypted_directions') && localStorage.getItem('c1ph3r_encrypted_password'));
			window.dispatchEvent(new Event('credentialsChecked'));
		})();
		</script>
	`;

	return (
		<div className="flex flex-col flex-1 items-center justify-center min-h-screen">
			<div dangerouslySetInnerHTML={{ __html: hasCustomCredentials }} />
			{/* <div className="w-full h-full flex-1 items-center justify-center"> */}
			<div className="relative z-10 min-h-screen flex flex-col flex-1 items-center p-8">
				{gameState === 'ready' && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0 }}
						className="text-center"
					>
						<h1 className="text-4xl font-bold text-emerald-400 mb-4">Level 7</h1>
						<p className="text-emerald-400/70 text-xl">Authentication Challenge</p>
					</motion.div>
				)}

				{gameState === 'playing' && (
					<>
						{/* Timer */}
						<div className="flex flex-col w-full items-center gap-4 mb-4">
							<div className={`text-2xl font-mono font-bold ${
								timer.minutes === 0 && timer.seconds <= 10
									? "text-red-400 animate-pulse"
									: "text-emerald-400"
							}`}>
								{formatTime(timer)}
							</div>
						</div>

						{/* Progress/Input Boxes */}
						<motion.div
							initial={{opacity: 0, y: -20}}
							animate={{opacity: 1, y: 0}}
							className="flex gap-2 sm:gap-3 mb-4 relative min-h-[2.5rem] sm:min-h-[3rem]"
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
						<div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 my-6 px-4">
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
						<div className="grid grid-cols-3 gap-2 w-36 sm:w-44 md:w-48 mt-4">
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
					</>
				)}
			</div>

			{/* Result Dialog */}
			<Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
				<DialogContent className={`border-${resultMessage.status === 'success' ? 'emerald' : 'red'}-400/20 bg-black/40 w-[90%] max-w-md min-h-[200px] flex flex-col justify-center items-center p-8 rounded-lg`}>
					<DialogHeader className="space-y-6 w-full">
						<div className="flex flex-col items-center gap-4">
							{resultMessage.status === 'success' ? (
								<CheckCircle className="w-16 h-16 text-emerald-400" />
							) : (
								<XCircle className="w-16 h-16 text-red-400" />
							)}
							<DialogTitle className={`text-center text-${resultMessage.status === 'success' ? 'emerald' : 'red'}-400 text-3xl font-bold`}>
								{resultMessage.title}
							</DialogTitle>
						</div>
						<DialogDescription className={`text-center text-${resultMessage.status === 'success' ? 'emerald' : 'red'}-400/70 text-lg leading-relaxed`}>
							{resultMessage.description}
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>

			{/* Completion Dialog */}
			<Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
				<DialogContent className="border-emerald-400/20 bg-black/40 w-[90%] max-w-md min-h-[200px] flex flex-col justify-center items-center p-8 rounded-lg">
					<DialogHeader className="space-y-6 w-full">
						<div className="flex flex-col items-center gap-4">
							<CheckCircle className="w-16 h-16 text-emerald-400" />
							<DialogTitle className="text-center text-emerald-400 text-3xl font-bold">
								Congratulations!
							</DialogTitle>
						</div>
						<div className="space-y-4 text-center text-emerald-400/70 text-lg leading-relaxed">
							<DialogDescription className="text-md">
								You have mastered Level 7! Can you beat your previous time?
							</DialogDescription>
							<div className="flex flex-col items-center gap-2">
								<span className="text-md font-medium">Current Time: {formatTimeSpent(timer)}</span>
							</div>
						</div>
						<div className="flex flex-col gap-3 w-full">
							<Button
								onClick={handlePlayAgain}
								className="w-full bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-lg px-8 py-4"
							>
								Play Again
							</Button>
						</div>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</div>
	);
}