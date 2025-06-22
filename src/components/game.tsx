import {useEffect} from "react";
import {useParams} from "next/navigation";
import MobiusGame from "../app/game/[level]/mobius-game";
import {useGameStore} from "@/store/use-game-store";
import {GameDialog} from "../app/game/[level]/game-dialog";

interface GameProps {
	onVerifyDirection?: (direction: string) => Promise<boolean>;
}

export function Game({ onVerifyDirection }: GameProps) {
	const params = useParams();
	const level = parseInt(params.level as string);
	const {initializeGame} = useGameStore();

	useEffect(() => {
		if (level === 7) {
			return;
		}

		const password = "COINFI";
		const bearing = {
			up: {color: "rgba(234, 179, 8, 1)", key: "w"},    // Yellow
			right: {color: "rgba(239, 68, 68, 1)", key: "d"},  // Red
			down: {color: "rgba(34, 197, 94, 1)", key: "s"},   // Green
			left: {color: "rgba(59, 130, 246, 1)", key: "a"},  // Blue
		};

		initializeGame(password, bearing, level);
	}, [level, initializeGame]);

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
			
			<div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
				<GameDialog type="level" />
				<MobiusGame 
					password="COINFI" 
					bearing={{
						up: {color: "rgba(234, 179, 8, 1)", key: "w"},    // Yellow
						right: {color: "rgba(239, 68, 68, 1)", key: "d"},  // Red
						down: {color: "rgba(34, 197, 94, 1)", key: "s"},   // Green
						left: {color: "rgba(59, 130, 246, 1)", key: "a"},  // Blue
					}} 
					level={level}
					onVerifyDirection={onVerifyDirection}
				/>
			</div>
		</div>
	);
} 