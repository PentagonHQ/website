"use client";

import {useState} from "react";
import {Input} from "@/ui/input";
import {Textarea} from "@/ui/textarea";
import {SubmitButton} from "@/components/home/submit-button";
import {sendContactForm} from "@/actions/resend";
import {useToast} from "@/src/hooks/use-toast";
import {validateEmail} from "@/lib/utils";

export default function ContactPage() {
	const {toast} = useToast();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
	});

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!validateEmail(formData.email)) {
			toast({
				variant: "destructive",
				title: "Invalid email",
				description: "Please enter a valid email address",
			});
			return;
		}

		const form = new FormData();
		form.append("name", formData.name);
		form.append("email", formData.email);
		form.append("message", formData.message);

		try {
			await sendContactForm(form);
			toast({
				title: "Success",
				description: "Form submitted successfully!",
			});
			setFormData({
				name: "",
				email: "",
				message: "",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to submit the form. Please try again.",
			});
		}
	};

	return (
		<div className="flex flex-col items-center justify-center p-4">
			<div className="max-w-md w-full space-y-6 text-center mb-8">
				<h1 className="text-2xl font-bold text-emerald-400">
					Get in Touch
				</h1>
				<p className="text-emerald-400/70">
					Have questions about our platform? Want to collaborate? We'd
					love to hear from you. Our team typically responds within 24
					hours.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
				<Input
					name="name"
					type="text"
					value={formData.name}
					onChange={(e) =>
						setFormData((prev) => ({...prev, name: e.target.value}))
					}
					className="text-base w-full px-4 py-3 bg-transparent border border-emerald-400/30 rounded text-emerald-400 placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300"
					placeholder="Name..."
					required
				/>
				<Input
					name="email"
					type="email"
					value={formData.email}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							email: e.target.value,
						}))
					}
					pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
					className="text-base w-full px-4 py-3 bg-transparent border border-emerald-400/30 rounded text-emerald-400 placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300"
					title="Please enter a valid email address without aliases"
					placeholder="Email..."
					required
				/>
				<Textarea
					name="message"
					value={formData.message}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							message: e.target.value,
						}))
					}
					className="text-base w-full px-4 py-3 bg-transparent border border-emerald-400/30 rounded text-emerald-400 placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300"
					placeholder="I want to..."
					required
				/>
				<SubmitButton
					pendingText="Sending..."
					className="w-full px-6 py-3 text-emerald-400 bg-transparent border border-emerald-400/50 hover:bg-emerald-400/10 transition-all duration-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Send
				</SubmitButton>
			</form>
		</div>
	);
}
