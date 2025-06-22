"use client";

import {useGameStore} from "@/store/use-game-store";
import {GameDialog} from "./game-dialog";

export function DialogManager() {
	const {dialog} = useGameStore();

	// Only render the dialog that matches the current type
	if (!dialog.type) return null;

	return <GameDialog type={dialog.type} />;
}
