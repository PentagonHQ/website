export interface ToastProps {
	message: string;
	type: "success" | "error" | "info";
}

export interface CompletionDialogProps {
	time: string;
	onTryAgain: () => void;
	onCustomize: (password: string, bearing: BearingConfig) => void;
}

export interface BearingConfig {
	up: {
		color: `rgba(${number}, ${number}, ${number}, ${number})`;
		key: "w" | "s" | "a" | "d";
	};
	down: {
		color: `rgba(${number}, ${number}, ${number}, ${number})`;
		key: "w" | "s" | "a" | "d";
	};
	left: {
		color: `rgba(${number}, ${number}, ${number}, ${number})`;
		key: "w" | "s" | "a" | "d";
	};
	right: {
		color: `rgba(${number}, ${number}, ${number}, ${number})`;
		key: "w" | "s" | "a" | "d";
	};
}

export interface StepContent {
	title: string;
	description: string;
	fields?: {
		id: string;
		label: string;
		type: "text" | "color" | "key" | "navigation";
		placeholder?: string;
		maxLength?: number;
	}[];
}

export interface MobiusGameProps {
	password: string;
	bearing: BearingConfig;
	level: number;
	isTutorial?: boolean;
	onCustomize?: (newPassword: string, newBearing: BearingConfig) => void;
}

export interface Timer {
	minutes: number;
	seconds: number;
	milliseconds: number;
}

export interface ContactFormData {
	firstName: string;
	email: string;
	message: string;
}

export interface EmailTemplateProps {
	firstName: string;
	email: string;
	message: string;
}

export type CompletionAction = "play_again" | "create_password";

export interface GameRecord {
	user_id: string;
	time_spent: string;
	level: number;
	completed_at?: string;
}

export type Direction = "up" | "down" | "left" | "right";

export interface UseKeysProps {
	isGameStarted: boolean;
	bearing: {
		up: {key: string};
		down: {key: string};
		left: {key: string};
		right: {key: string};
	};
	onDirectionClick: (direction: Direction) => void;
}