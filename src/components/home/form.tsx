"use client";

import {useActionState} from "react";
import {signUpAction} from "@/actions/supabase";
import {FormMessage} from "./form-message";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useSearchParams, useRouter} from "next/navigation";
// import {useData} from "@/context/data-provider";
import {useState, useRef} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";

export type ActionResponse = {
	status: "success" | "error" | "message";
	message: string;
	step?: "verification" | "complete";
};

const initialState: ActionResponse = {status: "success", message: ""};

const FormSchema = z.object({
	email: z.string().email({message: "Please enter a valid email address"}),
	token: z
		.string()
		.min(6, {
			message: "Verification code must be 6 characters.",
		})
		.regex(/^[0-9]+$/, {
			message: "Verification code can only contain numbers",
		})
		.optional(),
});

export function SignUpForm() {
	const router = useRouter();
	// const {user} = useData();
	const searchParams = useSearchParams();
	const refCode = searchParams.get("ref");
	const [email, setEmail] = useState("");
	const [showVerification, setShowVerification] = useState(false);
	const [activeInput, setActiveInput] = useState<number>(0);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			email: "",
			token: "",
		},
	});

	const handleOTPChange = (value: string) => {
		const numbersOnly = value.replace(/[^0-9]/g, '');
		if (numbersOnly.length <= 6) {
			form.setValue('token', numbersOnly);
			setActiveInput(numbersOnly.length);
			if (numbersOnly.length === 6) {
				formRef.current?.requestSubmit();
			}
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text');
		const numbersOnly = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
		form.setValue('token', numbersOnly);
		handleOTPChange(numbersOnly);
	};

	const [state, formAction, isPending] = useActionState(
		async (prevState: ActionResponse, formData: FormData) => {
			const email = formData.get("email") as string;
			const token = formData.get("token") as string;
			const ref = formData.get("refCode") as string;

			const response = await signUpAction(prevState, {
				email,
				token,
				refCode: ref,
			});

			if (response.step === "verification") {
				setShowVerification(true);
				setEmail(email);
			} else if (
				response.step === "complete" &&
				response.status === "success"
			) {
				router.push("/dashboard");
			}

			return response;
		},
		initialState
	);

	// if (user) return null;

	return (
		<Form {...form}>
			<form ref={formRef} action={formAction} className="flex flex-col gap-4">
				<Input type="hidden" name="refCode" value={refCode || ""} />

				{!showVerification ? (
					<FormField
						control={form.control}
						name="email"
						render={({field}) => (
							<FormItem>
								<FormControl>
									<Input
										type="email"
										placeholder="Enter your email"
										className="text-base w-full px-4 py-3 bg-transparent border border-emerald-400/30 rounded text-emerald-400 placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				) : (
					<>
						<Input type="hidden" name="email" value={email} />
						<FormField
							control={form.control}
							name="token"
							render={({field}) => (
								<FormItem>
									<FormControl>
										<InputOTP
											maxLength={6}
											{...field}
											value={field.value || ""}
											onChange={(value) => {
												handleOTPChange(value);
											}}
											className="w-full mx-auto gap-4"
											pattern="[0-9]*"
											inputMode="numeric"
										>
											<InputOTPGroup className="w-full sm:w-2/3 mx-auto gap-4">
												{[...Array(6)].map((_, i) => (
													<InputOTPSlot
														key={i}
														index={i}
														ref={(el: HTMLInputElement | null) => {
															inputRefs.current[i] = el;
														}}
														onPaste={handlePaste}
														className={`w-full h-12 rounded-lg border transition-all duration-300
                            ${
								activeInput === i
									? "border-emerald-400 ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-black"
									: "border-emerald-400/30"
							} 
                            text-emerald-400 bg-transparent`}
													/>
												))}
											</InputOTPGroup>
										</InputOTP>
									</FormControl>
								</FormItem>
							)}
						/>
					</>
				)}

				<Button
					className="w-full sm:w-2/3 mx-auto px-6 py-3 text-emerald-400 bg-transparent border border-emerald-400/50 hover:bg-emerald-400/10 transition-all duration-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
					type="submit"
					disabled={isPending}
				>
					{isPending
						? "Processing..."
						: showVerification
							? "Verify Code"
							: "Get early access"}
				</Button>

				{state?.message && (
					<FormMessage
						message={
							state.status === "success"
								? {success: state.message}
								: {error: state.message}
						}
					/>
				)}
			</form>
		</Form>
	);
}
