import MobiusGame from "./mobius-game";
import {Metadata} from "next";

export const metadata: Metadata = {
	title: "Game level",
	description:
		"Your game to learn the new quantum resistant authentication method.",
};

export default async function TutorialPage({
	params,
}: {
	params: Promise<{level: string}>;
}) {
	const unwrappedParams = await params;
	const level = parseInt(unwrappedParams.level);

	return (
		<div className="flex flex-col flex-1 items-center justify-center min-h-screen">
			<MobiusGame
				password="COINFI"
				bearing={{
					up: {color: "rgba(255, 255, 0, 1)", key: "w"},
					down: {color: "rgba(0, 255, 0, 1)", key: "s"},
					left: {color: "rgba(0, 122, 255, 1)", key: "a"},
					right: {color: "rgba(255, 0, 0, 1)", key: "d"},
				}}
				level={level}
			/>
		</div>
	);
}
