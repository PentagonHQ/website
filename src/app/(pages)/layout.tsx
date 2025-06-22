import {Fragment} from "react";
import PageNav from "@/components/layout/page-nav";

export default function Layout({children}: {children: React.ReactNode}) {
	return (
		<Fragment>
			<PageNav />
			{children}
		</Fragment>
	);
}
