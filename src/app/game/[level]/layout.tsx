import {Fragment} from "react";
import {Metadata} from "next";
import {createClient} from "@/supabase/server";
import {redirect} from "next/navigation";

export const metadata: Metadata = {
	title: "Game",
	description:
		"Play the memory game to learn quantum resistant authentication.",
};

export default async function GameLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	const {
		data: {user},
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/");
	}

	return <Fragment>{children}</Fragment>;
}
