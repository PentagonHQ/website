import {createClient} from "@/supabase/server";
import {redirect} from "next/navigation";
import Tutorials from "@/components/quest/tutorials";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game",
  description: "Your game to learn the new quantum resistant authentication method.",
};

export default async function TutorialStartPage() {
	const supabase = await createClient();

	const {
		data: {user},
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/");
	}

	return (
		<>
			<Tutorials />
		</>
	);
}
