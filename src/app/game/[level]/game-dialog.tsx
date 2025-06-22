"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/ui/dialog";
import {Button} from "@/ui/button";
import {CheckCircle, XCircle} from "lucide-react";
import {useGameStore} from "@/store/use-game-store";
import {useRouter} from "next/navigation";
import React from "react";

interface GameDialogProps {
	type: "level" | "result" | "completion";
}

export function GameDialog({type}: GameDialogProps) {
	const router = useRouter();
	const {
		currentLevel,
		handleStartGame,
		resultMessage,
		startLevel,
		dialog,
		setDialog,
		isGameStarted,
		levelConfig
	} = useGameStore();

	// Add check for localStorage items
	const hasCustomChallenge = React.useMemo(() => {
		if (typeof window === 'undefined') return false;
		return localStorage.getItem('c1ph3r_encrypted_directions') !== null && 
			   localStorage.getItem('c1ph3r_encrypted_password') !== null;
	}, []);

	React.useEffect(() => {
		if (
			type === "level" &&
			!isGameStarted &&
			(!dialog.isOpen || dialog.type !== "level")
		) {
			setDialog({
				isOpen: true,
				type: "level",
			});
		}
	}, [type, isGameStarted, dialog.isOpen, dialog.type, setDialog]);

	const handleDialogClose = (open: boolean) => {
		if (!open) {
			setDialog({isOpen: false, type: null});
			if (type === "level") {
				handleStartGame();
			}
		}
	};

	const onStartLevel = () => {
		handleStartGame();
		setDialog({isOpen: false, type: null});
	};

	const handleCompletionAction = (
		action: "play_again" | "create_password" | "complete_custom"
	) => {
		setDialog({isOpen: false, type: null});

		if (action === "play_again") {
			startLevel(6);
			router.push("/dashboard/game/6");
		} else if (action === "create_password") {
			router.push("/dashboard/setup");
		} else {
			// Handle complete custom action
			router.push("/dashboard/game/7");
		}
	};

	const getDialogContent = () => {
		switch (type) {
			case "level":
				return (
					<>
						<DialogHeader className="space-y-6">
							<DialogTitle className="text-center text-emerald-400 text-3xl font-bold">
								{levelConfig[currentLevel].title}
							</DialogTitle>
							<DialogDescription className="text-center text-emerald-400/70 text-lg leading-relaxed">
								{levelConfig[currentLevel].description}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className="mt-8 w-full">
							<Button
								onClick={onStartLevel}
								className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-lg px-8 py-6 w-full"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Escape") {
										e.preventDefault();
										handleDialogClose(false);
									}
								}}
							>
								{levelConfig[currentLevel].buttonText}
							</Button>
						</DialogFooter>
					</>
				);

			case "result":
				return (
					<DialogHeader className="space-y-6">
						<div className="flex flex-col items-center gap-4">
							{resultMessage.status === "success" ? (
								<CheckCircle className="w-16 h-16 text-emerald-400" />
							) : resultMessage.status === "error" ? (
								<XCircle className="w-16 h-16 text-red-400" />
							) : null}
							<DialogTitle
								className={`text-center text-3xl font-bold ${
									resultMessage.status === "success"
										? "text-emerald-400"
										: "text-red-400"
								}`}
							>
								{resultMessage.title}
							</DialogTitle>
						</div>
						<DialogDescription
							className={`text-center text-lg leading-relaxed ${
								resultMessage.status === "success"
									? "text-emerald-400/70"
									: "text-red-400/70"
							}`}
						>
							{resultMessage.description}
						</DialogDescription>
					</DialogHeader>
				);

			case "completion":
				return (
					<>
						<DialogHeader className="space-y-6">
							<div className="flex flex-col items-center gap-4">
								<CheckCircle className="w-16 h-16 text-emerald-400" />
								<DialogTitle className="text-center text-emerald-400 text-3xl font-bold">
									Master of the Game!
								</DialogTitle>
							</div>
							<DialogDescription className="text-center text-emerald-400/70 text-lg leading-relaxed">
								{hasCustomChallenge 
									? "Ready to complete your custom challenge? Let's see if you can solve your own puzzle!"
									: "Ready to create your own challenge? Set up your password and color bearings for Level 7!"}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className="mt-8 w-full flex flex-col sm:flex-row gap-4">
							<Button
								onClick={() => handleCompletionAction(hasCustomChallenge ? "complete_custom" : "create_password")}
								className="flex-1 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-lg px-8 py-6"
							>
								{hasCustomChallenge ? "Custom Challenge" : "Create My Challenge"}
							</Button>
							<Button
								onClick={() => handleCompletionAction("play_again")}
								className="flex-1 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-lg px-8 py-6"
							>
								Play Again
							</Button>
						</DialogFooter>
					</>
				);

			default:
				return null;
		}
	};

	const getDialogStyles = () => {
		const baseStyles =
			"border-emerald-400/20 bg-black/80 w-[90%] max-w-2xl flex flex-col justify-between items-center p-8 rounded-lg";

		switch (type) {
			case "level":
				return `${baseStyles} min-h-[250px]`;
			case "result":
				return `${baseStyles} min-h-[200px] bg-black/40`;
			case "completion":
				return `${baseStyles} min-h-[250px] bg-black/40`;
			default:
				return baseStyles;
		}
	};

	return (
		<Dialog
			open={dialog.isOpen && dialog.type === type}
			onOpenChange={handleDialogClose}
			defaultOpen={type === "level" && !isGameStarted}
		>
			<DialogContent
				className={getDialogStyles()}
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				{getDialogContent()}
			</DialogContent>
		</Dialog>
	);
}
