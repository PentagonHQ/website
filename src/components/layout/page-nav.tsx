"use client";

import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {usePathname} from "next/navigation";
import {Fragment} from "react";

export default function PageNav() {
	const pathname = usePathname();

	if (pathname.startsWith("/dashboard")) {
		return null;
	}

	return (
		<Fragment>
			<Link
				href="/"
				className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-8 group p-6"
			>
				<ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
				Back to Home
			</Link>
		</Fragment>
	);
}
