"use client";

import {useEffect} from "react";
import {useGameStore} from "@/store/use-game-store";

export function useKeyboardControls() {
	const {isGameStarted, handleDirectionClick, keyMap} = useGameStore();

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (!isGameStarted) {
				return;
			}

			e.preventDefault();

			// Handle arrow keys directly
			if (e.key === "ArrowUp") {
				handleDirectionClick("up");
				return;
			}
			if (e.key === "ArrowDown") {
				handleDirectionClick("down");
				return;
			}
			if (e.key === "ArrowLeft") {
				handleDirectionClick("left");
				return;
			}
			if (e.key === "ArrowRight") {
				handleDirectionClick("right");
				return;
			}

			// Handle WASD keys
			const key = e.key.toLowerCase();
			const direction = keyMap[key as keyof typeof keyMap];

			if (direction) {
				handleDirectionClick(direction);
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [isGameStarted, handleDirectionClick, keyMap]);
}
