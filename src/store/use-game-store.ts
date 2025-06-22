import {create} from "zustand";
import {Timer} from "@/src/types";
import {rotateArray, allChars} from "@/lib/utils";

interface DialogState {
	isOpen: boolean;
	type: "level" | "result" | "completion" | null;
}

interface GameState {
	// Game state
	isGameStarted: boolean;
	isTimerRunning: boolean;
	showDialog: boolean;
	showSequence: boolean;
	showRememberText: boolean;
	showResultDialog: boolean;
	showCompletionDialog: boolean;
	isRevealingSequence: boolean;

	// Level and sequence
	currentLevel: number;
	sequence: string[];
	currentIndex: number;
	revealIndex: number;
	colorOffset: number;

	// Timer
	timer: Timer;

	// Result message
	resultMessage: {
		title: string;
		description: string;
		status: "success" | "error" | "";
	};

	// Game config
	levelConfig: {
		[key: number]: {
			title: string;
			description: string;
			buttonText: string;
			sequenceLength: number;
			colorRotation: boolean;
			shuffleChars: boolean;
		};
	};

	// Add new state
	shuffledChars: string[];
	password: string;
	bearing: {
		up: {color: string};
		down: {color: string};
		left: {color: string};
		right: {color: string};
	};

	// Add keyboard mapping state
	keyMap: {
		ArrowUp: "up";
		ArrowRight: "right";
		ArrowDown: "down";
		ArrowLeft: "left";
		w: "up";
		d: "right";
		s: "down";
		a: "left";
	};

	// Add level-specific state
	isColorRotationEnabled: boolean;
	isCharacterShuffleEnabled: boolean;
	isSequenceHidden: boolean;
	areButtonsColorless: boolean;

	// Actions
	setGameStarted: (started: boolean) => void;
	setTimerRunning: (running: boolean) => void;
	// setShowDialog: (show: boolean) => void;
	setLevel: (level: number) => void;
	resetGame: () => void;
	updateTimer: () => void;
	addToSequence: (char: string) => void;
	resetSequence: () => void;
	showError: (message: string) => void;
	rotateColors: () => void;
	startSequenceReveal: () => void;
	completeSequenceReveal: () => void;
	formatTime: (time: Timer) => string;
	formatTimeSpent: (timer: Timer) => string;
	startLevel: (level: number) => void;
	completeLevel: () => void;

	// Add new actions
	handleDirectionClick: (direction: "up" | "down" | "left" | "right") => void;
	getCharacterColor: (char: string, index: number) => string;
	getCorrectDirection: (char: string) => string | null;
	setShuffledChars: (chars: string[]) => void;
	initializeGame: (password: string, bearing: any, level: number) => void;

	// Add these actions
	handleStartGame: () => void;
	handleSequenceReveal: () => void;
	setShowSequence: (show: boolean) => void;
	setTimer: (timer: Timer) => void;
	setShowResultDialog: (show: boolean) => void;
	setShowCompletionDialog: (show: boolean) => void;

	// Add new dialog actions
	setDialog: (dialog: Partial<DialogState>) => void;

	// Remove these individual dialog states
	// showDialog: boolean;
	// showResultDialog: boolean;
	// showCompletionDialog: boolean;

	// ... other state properties

	dialog: DialogState;
}

export const useGameStore = create<GameState>((set, get) => ({
	// Initial state
	dialog: {
		isOpen: true,
		type: "level",
	},

	isGameStarted: false,
	isTimerRunning: false,
	showDialog: false,
	showSequence: false,
	showRememberText: false,
	showResultDialog: false,
	showCompletionDialog: false,
	isRevealingSequence: false,

	currentLevel: 1,
	sequence: [],
	currentIndex: 0,
	revealIndex: -1,
	colorOffset: 0,

	timer: {
		minutes: 1,
		seconds: 0,
		milliseconds: 0,
	},
	colors: {
		red: "rgba(239, 68, 68, 1)",
		green: "rgba(34, 197, 94, 1)",
		blue: "rgba(59, 130, 246, 1)",
		yellow: "rgba(234, 179, 8, 1)",
	},

	keyMap: {
		ArrowUp: "up",
		ArrowRight: "right",
		ArrowDown: "down",
		ArrowLeft: "left",
		w: "up",
		d: "right",
		s: "down",
		a: "left",
	} as const,

	resultMessage: {
		title: "",
		description: "",
		status: "",
	},

	levelConfig: {
		1: {
			title: "How to unlock me",
			description: "The password is COINFI! Match the color direction to the password.",
			buttonText: "Start Level 1",
			sequenceLength: 4,
			colorRotation: false,
			shuffleChars: false,
		},
		2: {
			title: "Colorless password", 
			description: "The password now appears in gray - match the characters with their colored versions below!",
			buttonText: "Start Level 2",
			sequenceLength: 4,
			colorRotation: true,
			shuffleChars: false,
		},
		3: {
			title: "Color rotation",
			description: "Colors will now rotate after each correct input. Stay focused on the changing patterns!",
			buttonText: "Start Level 3",
			sequenceLength: 5,
			colorRotation: true,
			shuffleChars: true,
		},
		4: {
			title: "Position rotation",
			description: "Characters and colors will now rotate positions after each input!",
			buttonText: "Start Level 4",
			sequenceLength: 5,
			colorRotation: true,
			shuffleChars: true,
		},
		5: {
			title: "Lose your bearings",
			description: "The directional buttons have lost their colors. They were Up/yellow, right/red, left/blue and down/green",
			buttonText: "Start Level 5",
			sequenceLength: 6,
			colorRotation: true,
			shuffleChars: true,
		},
		6: {
			title: "Can you master me?",
			description: "Final challenge! The password is now hidden. Remember both the password and the color bearings!",
			buttonText: "Start Ultimate Level",
			sequenceLength: 6,
			colorRotation: true,
			shuffleChars: true,
		},
		7: {
			title: "Custom Challenge",
			description: "Test your custom password and color bearings setup",
			buttonText: "Start Level 7",
			sequenceLength: 6,
			colorRotation: true,
			shuffleChars: true,
		},
	},

	// Add new state
	shuffledChars: allChars,
	password: "",
	bearing: {
		up: {color: ""},
		down: {color: ""},
		left: {color: ""},
		right: {color: ""},
	},

	// Add level-specific state
	isColorRotationEnabled: false,
	isCharacterShuffleEnabled: false,
	isSequenceHidden: false,
	areButtonsColorless: false,

	// Actions
	setGameStarted: (started) => set({isGameStarted: started}),

	setTimerRunning: (running) => set({isTimerRunning: running}),

	// setShowDialog: (show) => set({showDialog: show}),

	setLevel: (level) => set({currentLevel: level}),

	startLevel: (level) => {
		set({
			currentLevel: level,
			isGameStarted: true,
			dialog: {
				isOpen: false,
				type: null,
			},
			sequence: [],
			currentIndex: 0,
			revealIndex: -1,
			timer: {minutes: 1, seconds: 0, milliseconds: 0},
			colorOffset: 0,
			// Set level-specific features
			isColorRotationEnabled: level >= 3,
			isCharacterShuffleEnabled: level >= 4,
			isSequenceHidden: level >= 6,
			areButtonsColorless: level >= 5,
			// Start sequence reveal
			isRevealingSequence: true,
			showSequence: true,
			showRememberText: false,
			// Start timer for level 6 immediately
			isTimerRunning: level === 6,
		});
	},

	completeLevel: () => {
		const state = get();
		const nextLevel = state.currentLevel + 1;

		// Check if this is the final level
		if (state.currentLevel === 6) {
			set({
				dialog: {isOpen: true, type: "completion"},
			});
			return;
		}

		// Update level and reset game state
		set({
			currentLevel: nextLevel,
			sequence: [],
			currentIndex: 0,
			revealIndex: -1,
			timer: {minutes: 1, seconds: 0, milliseconds: 0},
			colorOffset: 0,
			isColorRotationEnabled: nextLevel >= 3,
			isCharacterShuffleEnabled: nextLevel >= 4,
			isSequenceHidden: nextLevel >= 6,
			areButtonsColorless: nextLevel >= 5,
			// dialog: {isOpen: true, type: "level"},
		});

		// Navigate to next level
		if (typeof window !== "undefined") {
			window.location.href = `/dashboard/game/${nextLevel}`;
		}
	},

	resetGame: () =>
		set({
			sequence: [],
			currentIndex: 0,
			timer: {minutes: 1, seconds: 0, milliseconds: 0},
			isGameStarted: false,
			isTimerRunning: false,
			dialog: {
				isOpen: true,
				type: "level",
			},
			currentLevel: 1,
		}),

	updateTimer: () => {
		const state = get();
		if (!state.isTimerRunning) return;

		const {timer} = state;
		if (
			timer.minutes === 0 &&
			timer.seconds === 0 &&
			timer.milliseconds === 0
		) {
			set({
				isTimerRunning: false,
				sequence: [],
				currentIndex: 0,
				dialog: {
					isOpen: true,
					type: "level",
				},
			});
			return;
		}

		let newTimer = {...timer};
		if (timer.milliseconds > 0) {
			newTimer.milliseconds -= 10;
		} else if (timer.seconds > 0) {
			newTimer.seconds -= 1;
			newTimer.milliseconds = 990;
		} else if (timer.minutes > 0) {
			newTimer.minutes -= 1;
			newTimer.seconds = 59;
			newTimer.milliseconds = 990;
		}

		set({timer: newTimer});
	},

	addToSequence: (char) =>
		set((state) => ({
			sequence: [...state.sequence, char],
		})),

	resetSequence: () =>
		set({
			sequence: [],
			currentIndex: 0,
		}),

	showError: (message) => {
		set({
			resultMessage: {
				title: "Oops!",
				description: message,
				status: "error",
			},
			dialog: {
				isOpen: true,
				type: "result",
			},
		});

		// Hide error message after delay
		setTimeout(() => {
			set({
				dialog: {
					isOpen: false,
					type: null,
				},
			});
		}, 1500);
	},

	rotateColors: () =>
		set((state) => ({
			colorOffset: (state.colorOffset + 1) % 4,
		})),

	startSequenceReveal: () =>
		set({
			showSequence: true,
			isRevealingSequence: true,
			revealIndex: -1,
		}),

	completeSequenceReveal: () =>
		set({
			showSequence: false,
			isRevealingSequence: false,
			showRememberText: false,
			isTimerRunning: true,
			timer: {minutes: 1, seconds: 0, milliseconds: 0},
		}),

	formatTime: (time) => {
		if (
			time.minutes === 1 &&
			time.seconds === 0 &&
			time.milliseconds === 0
		) {
			return "1:00";
		}

		if (time.minutes === 0) {
			const milliseconds = String(
				Math.floor(time.milliseconds / 10)
			).padStart(2, "0");
			return `${time.seconds}:${milliseconds}`;
		}

		const seconds = String(time.seconds).padStart(2, "0");
		const milliseconds = String(
			Math.floor(time.milliseconds / 10)
		).padStart(2, "0");
		return `${time.minutes}:${seconds}:${milliseconds}`;
	},

	formatTimeSpent: (timer) => {
		const spentSeconds = 59 - timer.seconds;
		const spentMilliseconds = 999 - timer.milliseconds;
		return `${timer.minutes}:${spentSeconds < 10 ? "0" : ""}${spentSeconds}.${spentMilliseconds < 100 ? "0" : ""}${spentMilliseconds}`;
	},

	handleDirectionClick: (direction: "up" | "down" | "left" | "right") => {
		const state = get();
		if (!state.isGameStarted) return;

		const currentChar = state.password[state.currentIndex];
		const correctDirection = state.getCorrectDirection(currentChar);
		const isCorrect = direction === correctDirection;

		if (isCorrect) {
			state.addToSequence(currentChar);

			// Level 3+: Color rotation
			if (state.isColorRotationEnabled) {
				set((state) => ({
					colorOffset: (state.colorOffset + 1) % 4,
				}));
			}

			// Level 4+: Character shuffle
			if (state.isCharacterShuffleEnabled) {
				set((state) => ({
					shuffledChars: rotateArray([...state.shuffledChars]),
				}));
			}

			// Check for level completion
			if (state.currentIndex === state.password.length - 1) {
				const timeSpent = state.formatTimeSpent(state.timer);

				set({
					isTimerRunning: false,
					resultMessage: {
						title: state.currentLevel === 6 ? "Congratulations!" : "Level Complete!",
						description: state.currentLevel === 6 
							? "You've mastered all levels! Ready to create your own challenge?"
							: `Time: ${timeSpent}`,
						status: "success",
					},
					dialog: {
						isOpen: true,
						type: state.currentLevel === 6 ? "completion" : "result",
					},
				});

				// After a delay, proceed to next level or show completion
				setTimeout(() => {
					set({
						dialog: {
							isOpen: false,
							type: null,
						},
					});
					if (state.currentLevel === 6) {
						set({
							dialog: {
								isOpen: true, 
								type: "completion",
							},
						});
					} else {
						state.completeLevel();
					}
				}, 2000);
			} else {
				// Continue with next character
				set((state) => ({
					currentIndex: state.currentIndex + 1,
				}));
			}
		} else {
			state.resetSequence();

			// Level 3+: Double rotation on error
			if (state.isColorRotationEnabled) {
				set((state) => ({
					colorOffset: (state.colorOffset + 2) % 4,
				}));
			}

			// Level 4+: Double shuffle on error
			if (state.isCharacterShuffleEnabled) {
				set((state) => ({
					shuffledChars: rotateArray(rotateArray([...state.shuffledChars])),
				}));
			}

			state.showError("Wrong direction! Try again.");
		}
	},

	getCharacterColor: (char, index) => {
		const state = get();
		const colors = [
			state.bearing.up.color,
			state.bearing.down.color,
			state.bearing.left.color,
			state.bearing.right.color,
		];

		// Level 6: Only hide sequence characters, not the character grid
		if (state.isSequenceHidden && index !== -1) {
			return "rgba(255, 255, 255, 0.6)";
		}

		// Level 2+: Gray sequence characters
		if (state.currentLevel >= 2 && index >= state.sequence.length && index !== -1) {
			return "rgba(156, 163, 175, 0.5)";
		}

		// Get colors for both sequence and character grid
		const chars = state.isCharacterShuffleEnabled
			? state.shuffledChars
			: allChars;
		const charIndex = chars.findIndex((c) => c === char);
		if (charIndex === -1) return "rgba(52, 211, 153, 0.5)";

		return colors[(charIndex + state.colorOffset) % colors.length];
	},

	getCorrectDirection: (char) => {
		const state = get();
		const colors = [
			state.bearing.up.color,
			state.bearing.down.color,
			state.bearing.left.color,
			state.bearing.right.color,
		];

		// For level 3+, use shuffledChars instead of allChars for character index
		const chars = state.isCharacterShuffleEnabled ? state.shuffledChars : allChars;
		const charIndex = chars.findIndex((c) => c === char);
		if (charIndex === -1) return null;

		const charColor = colors[(charIndex + state.colorOffset) % colors.length];
		const colorDirectionMap = {
			[state.bearing.up.color]: "up",
			[state.bearing.down.color]: "down",
			[state.bearing.left.color]: "left",
			[state.bearing.right.color]: "right",
		};

		return colorDirectionMap[charColor as keyof typeof colorDirectionMap];
	},

	setShuffledChars: (chars) => set({shuffledChars: chars}),

	initializeGame: (password, bearing, level) =>
		set({
			password,
			bearing,
			shuffledChars: allChars,
			currentLevel: level,
			isGameStarted: true,
			dialog: {
				isOpen: true,
				type: "level",
			},
			sequence: [],
			currentIndex: 0,
			timer: {minutes: 1, seconds: 0, milliseconds: 0},
			isTimerRunning: false,
			showSequence: false,
			showRememberText: false,
			isRevealingSequence: false,
			colorOffset: 0,
			isColorRotationEnabled: level >= 3,
			isCharacterShuffleEnabled: level >= 4,
			isSequenceHidden: level >= 6,
			areButtonsColorless: level >= 5,
		}),

	handleStartGame: () => {
		const state = get();

		// Shuffle characters for levels 3+
		if (state.currentLevel >= 3) {
			state.setShuffledChars(rotateArray(allChars));
		}

		// Start the level with sequence reveal
		set((state) => ({
			...state,
			isGameStarted: true,
			dialog: {
				isOpen: false,
				type: null,
			},
			sequence: [],
			currentIndex: 0,
			revealIndex: -1,
			timer: {minutes: 1, seconds: 0, milliseconds: 0},
			colorOffset: 0,
			isColorRotationEnabled: state.currentLevel >= 3,
			isCharacterShuffleEnabled: state.currentLevel >= 4,
			isSequenceHidden: state.currentLevel >= 6,
			areButtonsColorless: state.currentLevel >= 5,
			// Start sequence reveal
			isRevealingSequence: true,
			showSequence: true,
			showRememberText: false,
			// Remove timer start from here
			isTimerRunning: false,
		}));

		// Start sequence reveal animation
		setTimeout(() => {
			state.handleSequenceReveal();
		}, 500);
	},

	handleSequenceReveal: () => {
		const state = get();

		if (!state.isRevealingSequence) return;

		// Handle level-specific sequence reveal
		if (state.currentLevel === 1) {
			// For level 1: Show sequence immediately without remember text
			set({
				isRevealingSequence: false,
				showSequence: true,
				isTimerRunning: true,
				showRememberText: false,
				revealIndex: state.password.length - 1,
			});
			return;
		} else if (state.currentLevel === 6) {
			// For level 6: Hide sequence completely
			set({
				isRevealingSequence: false,
				showSequence: false,
				isTimerRunning: true,
				showRememberText: false,
			});
			return;
		}

		// Handle sequence reveal animation for levels 2-5
		if (state.revealIndex < state.password.length - 1) {
			setTimeout(() => {
				set((state) => ({
					revealIndex: state.revealIndex + 1,
					showSequence: true,
					showRememberText: false,
				}));
				// Continue revealing sequence
				setTimeout(() => state.handleSequenceReveal(), 300);
			}, 300);
		} else if (state.revealIndex === state.password.length - 1) {
			// Show "Remember this sequence"
			setTimeout(() => {
				set({
					showSequence: false,
					showRememberText: true,
				});

				// Hide remember text and start game
				setTimeout(() => {
					set({
						showRememberText: false,
						isRevealingSequence: false,
						isTimerRunning: true, // Start timer here after remember text
						timer: {minutes: 1, seconds: 0, milliseconds: 0}, // Reset timer when starting
					});
				}, 1500);
			}, 1000);
		}
	},

	setShowSequence: (show) => set({showSequence: show}),

	setTimer: (timer) => set({timer}),

	setShowResultDialog: (show) => set({showResultDialog: show}),

	setShowCompletionDialog: (show) => set({showCompletionDialog: show}),

	// Add new dialog action
	setDialog: (dialog) =>
		set((state) => ({
			dialog: {...state.dialog, ...dialog},
		})),
}));
