import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Add this shuffle function at the top of the component
export const rotateArray = <T>(array: T[]): T[] => {
	const offset = Math.floor(Math.random() * 40) + 1; // Random number between 1-40
	const newArray = [...array];
	// Rotate array by offset positions
	const rotated = [...newArray.slice(-offset), ...newArray.slice(0, -offset)];
	return rotated;
};

// Generate all characters in order
const numbers = Array.from("0123456789");
const letters = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const symbols = Array.from("!@#$");
export const allChars = [...numbers, ...letters, ...symbols];

export function validateEmail(email: string) {
	const re =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}
