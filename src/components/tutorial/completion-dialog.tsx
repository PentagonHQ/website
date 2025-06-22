import React from 'react'

export default function CompletionDialog() {
  return (
	<div>completion-dialog</div>
  )
}


// 'use client'

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
// import { BearingConfig, CompletionDialogProps, StepContent } from "@/src/types";
// import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";

// const completionSteps: Record<number, StepContent> = {
// 	0: {
// 		title: "Challenge Complete!",
// 		description: "Impressive! You solved it in {time}.",
// 	},
// 	1: {
// 		title: "Password Security",
// 		description: "\nNumbers (0-9)\nLetters (A-Z)\nSymbols (!, @, #, $)\n\nMake your password quantum secure!",
// 	},
// 	2: {
// 		title: "",
// 		description: "",
// 		fields: [
// 			{
// 				id: "password",
// 				label: "",
// 				type: "text",
// 				maxLength: 8,
// 			},
// 		],
// 	},
// 	3: {
// 		title: "Map Your Colors",
// 		description: "Choose which color represents each direction.",
// 		fields: [
// 			{
// 				id: "colors",
// 				label: "",
// 				type: "color",
// 			},
// 		],
// 	},
// 	4: {
// 		title: "What's Next?",
// 		description: "Ready for more challenges?",
// 		fields: [
// 			{
// 				id: "next",
// 				label: "",
// 				type: "navigation",
// 			},
// 		],
// 	},
// };

// const CustomPasswordInput = ({
// 	value,
// 	onChange,
// }: {
// 	value: string;
// 	onChange: (value: string) => void;
// }) => {
// 	const keys = [
// 		["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
// 		["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
// 		["A", "S", "D", "F", "G", "H", "J", "K", "L"],
// 		["Z", "X", "C", "V", "B", "N", "M"],
// 		["@", "#", "$", "%"]
// 	];

// 	const calculatePasswordStrength = (pwd: string): number => {
// 		return Math.min(pwd.length * 10, 100); // 10% per character, max 100%
// 	};

// 	const getStrengthColor = (strength: number): string => {
// 		if (strength <= 25) return "bg-red-400";
// 		if (strength <= 75) return "bg-orange-400";
// 		return "bg-emerald-400";
// 	};

// 	const handleKeyPress = (key: string) => {
// 		if (value.length < 10) {
// 			onChange(value + key);
// 		}
// 	};

// 	const handleBackspace = () => {
// 		onChange(value.slice(0, -1));
// 	};

// 	return (
// 		<div className="space-y-4">
// 			<div className="w-full p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-lg">
// 				<div className="text-2xl text-emerald-400 font-mono min-h-[40px] text-center">
// 					{value ? "•".repeat(value.length) : ""}
// 				</div>
// 			</div>
			
// 			<div className="space-y-2">
// 				<div className="flex justify-between text-sm text-emerald-400">
// 					<span>{value.length}</span>
// 					<span>{calculatePasswordStrength(value)}%</span>
// 				</div>
// 				<div className="w-full bg-emerald-400/10 h-2 rounded-full overflow-hidden">
// 					<div
// 						className={`h-full transition-all duration-300 ${getStrengthColor(
// 							calculatePasswordStrength(value)
// 						)}`}
// 						style={{
// 							width: `${calculatePasswordStrength(value)}%`,
// 						}}
// 					/>
// 				</div>
// 			</div>

// 			<div className="mx-auto w-full space-y-2">
// 				{keys.map((row, i) => (
// 					<div key={i} className="flex justify-center gap-1">
// 						{row.map((key) => (
// 							<Button
// 								key={key}
// 								onClick={() => handleKeyPress(key)}
// 								disabled={value.length >= 10}
// 								className="
// 									w-[8vw] h-[8vw]
// 									max-w-[60px] max-h-[60px]
// 									min-w-[40px] min-h-[40px]
// 									text-base sm:text-xl md:text-2xl
// 									bg-emerald-400/10 
// 									text-emerald-400 
// 									hover:bg-emerald-400/20 
// 									disabled:opacity-50
// 									disabled:cursor-not-allowed
// 									font-bold
// 									rounded-lg 
// 									shadow-lg
// 									border 
// 									border-emerald-400/20
// 									transition-all 
// 									duration-200
// 								"
// 							>
// 								{key}
// 							</Button>
// 						))}
// 					</div>
// 				))}
// 				<div className="flex justify-center">
// 					<Button
// 						onClick={handleBackspace}
// 						className="
// 							w-[16vw] h-[8vw]
// 							max-w-[120px] max-h-[60px]
// 							min-w-[80px] min-h-[40px]
// 							text-base sm:text-xl md:text-2xl
// 							bg-emerald-400/10 
// 							text-emerald-400 
// 							hover:bg-emerald-400/20 
// 							font-bold
// 							rounded-lg 
// 							shadow-lg
// 							border 
// 							border-emerald-400/20
// 							transition-all 
// 							duration-200
// 						"
// 					>
// 						⌫
// 					</Button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// const ColorSelector = ({
// 	value,
// 	onChange,
// }: {
// 	value: {
// 		upColor: "yellow" | "green" | "blue" | "red";
// 		downColor: "yellow" | "green" | "blue" | "red";
// 		leftColor: "yellow" | "green" | "blue" | "red";
// 		rightColor: "yellow" | "green" | "blue" | "red";
// 	};
// 	onChange: (colors: typeof value) => void;
// }) => {
// 	const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
	
// 	const colors = [
// 		{ name: 'yellow' as const, class: 'bg-yellow-400' },
// 		{ name: 'green' as const, class: 'bg-green-400' },
// 		{ name: 'blue' as const, class: 'bg-blue-400' },
// 		{ name: 'red' as const, class: 'bg-red-400' },
// 	] as const;

// 	const availableColors = colors.filter(color => !Object.values(value).includes(color.name));

// 	const handleColorSelect = (color: "yellow" | "green" | "blue" | "red") => {
// 		if (!selectedDirection) return;
		
// 		const newColors = {
// 			...value,
// 			[`${selectedDirection}Color`]: color,
// 		};

// 		// If this is the third color being assigned, automatically assign the last one
// 		const assignedCount = Object.values(newColors).filter(Boolean).length;
// 		if (assignedCount === 3) {
// 			const lastDirection = ['up', 'down', 'left', 'right'].find(
// 				// @ts-ignore
// 				dir => !newColors[`${dir}Color`]
// 			) as 'up' | 'down' | 'left' | 'right';
// 			const lastColor = availableColors.find(c => c.name !== color)?.name;
// 			if (lastDirection && lastColor) {
// 				newColors[`${lastDirection}Color`] = lastColor as "yellow" | "green" | "blue" | "red";
// 			}
// 		}

// 		onChange(newColors);
// 		setSelectedDirection(null);
// 	};

// 	const getDirectionColor = (direction: 'up' | 'down' | 'left' | 'right') => {
// 		const colorName = value[`${direction}Color`];
// 		return colorName ? colors.find(c => c.name === colorName)?.class : 'bg-gray-700';
// 	};

// 	const isDirectionMapped = (direction: 'up' | 'down' | 'left' | 'right') => {
// 		return Boolean(value[`${direction}Color`]);
// 	};

// 	return (
// 		<div className="space-y-8">
// 			{/* Always show available colors */}
// 			<div className="flex justify-center gap-4">
// 				{colors.map((color) => {
// 					const isUsed = Object.values(value).includes(color.name);
// 					return (
// 						<button
// 							key={color.name}
// 							onClick={() => !isUsed && selectedDirection && handleColorSelect(color.name as "yellow" | "green" | "blue" | "red")}
// 							className={`
// 								w-12 h-12 rounded-lg border-2 transition-all duration-200
// 								${color.class}
// 								${isUsed ? 'opacity-30 cursor-not-allowed' : selectedDirection ? 'cursor-pointer hover:scale-105' : 'opacity-50'}
// 								${!isUsed && selectedDirection ? 'border-white/50 hover:border-white' : 'border-transparent'}
// 							`}
// 						/>
// 					);
// 				})}
// 			</div>

// 			{/* Direction Mapping */}
// 			<div className="grid grid-cols-3 gap-2 w-48 mx-auto">
// 				<div className="col-start-2">
// 					<Button
// 						onClick={() => !isDirectionMapped('up') && setSelectedDirection('up')}
// 						className={`
// 							w-full aspect-square rounded-lg flex items-center justify-center 
// 							${getDirectionColor('up')}
// 							transition-all duration-200
// 							${!isDirectionMapped('up') ? 'hover:bg-gray-600' : ''}
// 							${selectedDirection === 'up' ? 'ring-4 ring-white' : ''}
// 						`}
// 						disabled={isDirectionMapped('up')}
// 					>
// 						<ArrowUp className="w-8 h-8 text-white" />
// 					</Button>
// 				</div>
// 				<div className="col-start-1 row-start-2">
// 					<Button
// 						onClick={() => !isDirectionMapped('left') && setSelectedDirection('left')}
// 						className={`
// 							w-full aspect-square rounded-lg flex items-center justify-center
// 							${getDirectionColor('left')}
// 							transition-all duration-200
// 							${!isDirectionMapped('left') ? 'hover:bg-gray-600' : ''}
// 							${selectedDirection === 'left' ? 'ring-4 ring-white' : ''}
// 						`}
// 						disabled={isDirectionMapped('left')}
// 					>
// 						<ArrowLeft className="w-8 h-8 text-white" />
// 					</Button>
// 				</div>
// 				<div className="col-start-3 row-start-2">
// 					<Button
// 						onClick={() => !isDirectionMapped('right') && setSelectedDirection('right')}
// 						className={`
// 							w-full aspect-square rounded-lg flex items-center justify-center
// 							${getDirectionColor('right')}
// 							transition-all duration-200
// 							${!isDirectionMapped('right') ? 'hover:bg-gray-600' : ''}
// 							${selectedDirection === 'right' ? 'ring-4 ring-white' : ''}
// 						`}
// 						disabled={isDirectionMapped('right')}
// 					>
// 						<ArrowRight className="w-8 h-8 text-white" />
// 					</Button>
// 				</div>
// 				<div className="col-start-2 row-start-3">
// 					<Button
// 						onClick={() => !isDirectionMapped('down') && setSelectedDirection('down')}
// 						className={`
// 							w-full aspect-square rounded-lg flex items-center justify-center
// 							${getDirectionColor('down')}
// 							transition-all duration-200
// 							${!isDirectionMapped('down') ? 'hover:bg-gray-600' : ''}
// 							${selectedDirection === 'down' ? 'ring-4 ring-white' : ''}
// 						`}
// 						disabled={isDirectionMapped('down')}
// 					>
// 						<ArrowDown className="w-8 h-8 text-white" />
// 					</Button>
// 				</div>
// 			</div>

// 			{/* Instructions */}
// 			<div className="text-center text-emerald-400/70 text-sm">
// 				{selectedDirection 
// 					? 'Select a color to assign'
// 					: availableColors.length > 0 
// 						? 'Click an arrow to change its color'
// 						: 'All directions have been mapped!'}
// 			</div>
// 		</div>
// 	);
// };

// export default function CompletionDialog({ time, onTryAgain, onCustomize }: CompletionDialogProps) {
//     const router = useRouter();
// 	const [step, setStep] = useState(0);
// 	const [formData, setFormData] = useState({
// 		password: "",
// 		up: "w",
// 		down: "s",
// 		left: "a",
// 		right: "d",
// 		upColor: "" as "yellow" | "green" | "blue" | "red",
// 		downColor: "" as "yellow" | "green" | "blue" | "red",
// 		leftColor: "" as "yellow" | "green" | "blue" | "red",
// 		rightColor: "" as "yellow" | "green" | "blue" | "red",
// 	});

// 	const handleInputChange = (field: string, value: string) => {
// 		setFormData(prev => ({
// 			...prev,
// 			[field]: field === "password" ? value.toUpperCase() : value,
// 		}));
// 	};

// 	const handleSubmit = () => {
// 		const allColorsMapped = ['upColor', 'downColor', 'leftColor', 'rightColor']
// 			.every(direction => formData[direction as keyof typeof formData]);

// 		if (!allColorsMapped) {
// 			return;
// 		}

// 		const bearing = {
// 			up: { color: formData.upColor, key: "w" },
// 			down: { color: formData.downColor, key: "s" },
// 			left: { color: formData.leftColor, key: "a" },
// 			right: { color: formData.rightColor, key: "d" },
// 		} as const;

// 		onCustomize(formData.password, bearing);
// 		setStep(0); 
// 	};

// 	const currentStep = completionSteps[step];

// 	// @ts-ignore
// 	const renderField = (field: StepContent['fields'][0]) => {
// 		if (field.type === 'text' && field.id === 'password') {
// 			return (
// 				<CustomPasswordInput
// 					// @ts-ignore
// 					value={formData[field.id]}
// 					onChange={(value) => handleInputChange(field.id, value)}
// 				/>
// 			);
// 		}

// 		if (field.type === 'color') {
// 			return (
// 				<ColorSelector
// 					value={{
// 						upColor: formData.upColor,
// 						downColor: formData.downColor,
// 						leftColor: formData.leftColor,
// 						rightColor: formData.rightColor,
// 					}}
// 					onChange={(colors) => {
// 						setFormData(prev => ({
// 							...prev,
// 							...colors,
// 						}));
// 					}}
// 				/>
// 			);
// 		}

// 		if (field.type === 'navigation') {
// 			return (
// 				<div className="space-y-4 w-full">
// 					<Button
// 						onClick={() => router.push('/dashboard')}
// 						className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 
// 							text-xl px-8 py-6 w-full font-semibold"
// 					>
// 						Go to Dashboard
// 					</Button>
// 					<Button
// 						onClick={onTryAgain}
// 						className="bg-white/5 text-white hover:bg-white/10 
// 							text-xl px-8 py-6 w-full font-semibold"
// 					>
// 						Play Again
// 					</Button>
// 				</div>
// 			);
// 		}

// 		return null;
// 	};

// 	const renderStepContent = () => {
// 		if (step === 1) { // Password Security Info step
// 			return (
// 				<div className="w-full space-y-8">
// 					<div className="space-y-6">
// 						<div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4">
// 							<div className="text-md text-emerald-400/70 leading-relaxed text-center">
// 								M@B1U53VAR0CKS
// 							</div>
// 						</div>
// 					</div>
// 					<div className="flex justify-between gap-4">
// 						<Button
// 							onClick={() => setStep(0)}
// 							variant="outline"
// 							className="bg-black border border-emerald-400/20 text-emerald-400 hover:text-emerald-400/70 hover:bg-emerald-400/20"
// 						>
// 							Back
// 						</Button>
// 						<Button
// 							onClick={() => setStep(2)}
// 							className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
// 						>
// 							Next
// 						</Button>
// 					</div>
// 				</div>
// 			);
// 		}

// 		return (
// 			<div className="w-full space-y-6">
// 				{currentStep.fields?.map((field) => (
// 					<div key={field.id} className="space-y-4">
// 						{renderField(field)}
// 					</div>
// 				))}
				
// 				<div className="flex justify-between gap-4">
// 					<Button
// 						onClick={() => setStep(prev => prev - 1)}
// 						variant="outline"
// 						className="bg-black border border-emerald-400/20 text-emerald-400 hover:text-emerald-400/70 hover:bg-emerald-400/20"
// 					>
// 						Back
// 					</Button>
// 					<Button
// 						onClick={() => {
// 							if (step === Object.keys(completionSteps).length - 1) {
// 								handleSubmit();
// 							} else {
// 								setStep(prev => prev + 1);
// 							}
// 						}}
// 						disabled={
// 							(step === 2 && formData.password.length < 4) ||
// 							(step === 3 && !['upColor', 'downColor', 'leftColor', 'rightColor']
// 								// @ts-ignore
// 								.every(direction => formData[direction]))
// 						}
// 						className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
// 					>
// 						{step === Object.keys(completionSteps).length - 1 ? "Create Game" : "Next"}
// 					</Button>
// 				</div>
// 			</div>
// 		);
// 	};

// 	return (
// 	<DialogContent className="border-none bg-black w-full min-h-screen flex flex-col items-center justify-center p-8">
// 		<DialogHeader className="space-y-6 max-w-2xl mx-auto w-full">
// 				{/* Only show title/description if they're not empty */}
// 				{currentStep.title && (
// 			<DialogTitle className="text-center text-emerald-400 text-4xl font-bold">
// 						{currentStep.title}
// 			</DialogTitle>
// 				)}
// 				{currentStep.description && (
// 					<DialogDescription className="text-center text-emerald-400/70 text-xl leading-relaxed whitespace-pre-line">
// 						{currentStep.description.replace("{time}", time)}
// 			</DialogDescription>
// 				)}
// 		</DialogHeader>
		
// 		<div className="flex flex-col items-center justify-center gap-8 mt-12 max-w-md w-full">
// 				{step === 0 ? (
// 			<div className="w-full space-y-4">
// 				<Button
// 					onClick={onTryAgain}
// 					className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 
// 						text-xl px-8 py-6 w-full font-semibold"
// 				>
// 					Try Again
// 				</Button>
				
// 				<div className="relative">
// 					<div className="absolute inset-0 flex items-center">
// 						<span className="w-full border-t border-emerald-400/20" />
// 					</div>
// 					<div className="relative flex justify-center text-sm uppercase">
// 						<span className="bg-black px-2 text-emerald-400/50">or</span>
// 					</div>
// 				</div>

// 				<Button
// 							onClick={() => setStep(1)}
// 					className="bg-white/5 text-white hover:bg-white/10 
// 						text-xl px-8 py-6 w-full font-semibold group"
// 				>
// 					Create your own!
// 					<motion.span
// 						className="ml-2 inline-block"
// 						animate={{ x: [0, 4, 0] }}
// 						transition={{ 
// 							duration: 1.5,
// 							repeat: Infinity,
// 							ease: "easeInOut"
// 						}}
// 					>
// 						→
// 					</motion.span>
// 				</Button>
// 			</div>
// 				) : (
// 					renderStepContent()
// 				)}
// 		</div>
// 	</DialogContent>
// );
// };