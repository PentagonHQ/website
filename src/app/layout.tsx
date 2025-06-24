import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/ui/toaster";

const defaultUrl = "https://usepentagon.com";

const title = "Pentagon";
const description =
	"A set of protocols that involve cutting-edge cryptoeconomics, core infrastructure, and an ecosystem to incentivize users to collaborate rather than compete. At its core, encryption, digital signatures, and digital cash are cemented, allowing the ability for cyberspatial and real-world communities to begin and thrive.";
const url = "https://usepentagon.com";
const siteName = "Pentagon";

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	manifest: "/manifest.json",
	robots: "index, follow",
	title: {
		default: title,
		template: title + " | %s",
	},
	description,
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title,
	},
	formatDetection: {
		telephone: true,
		email: true,
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: [
			{
				url: "/icons/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
		other: [
			{
				rel: "apple-touch-icon",
				url: "/icons/apple-touch-icon.png",
			},
			{
				rel: "apple-touch-icon-precomposed",
				url: "/icons/apple-touch-icon.png",
			},
		],
	},
	openGraph: {
		title,
		description,
		url,
		siteName,
		images: [
			{
				url: "https://coin.fi/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Image of Coin Fi Coins raining down!",
				type: "image/jpeg",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: ["https://coin.fi/og-image.jpg"],
		creator: "@CoinDotFi",
		site: "@CoinDotFi",
	},
};

export const viewport: Viewport = {
	minimumScale: 1,
	initialScale: 1,
	width: "device-width",
	userScalable: false,
	viewportFit: "cover",
};

export const generateHeaders = {
	headers: [
		{
			key: "Link",
			value: "</manifest.json>; rel=prefetch",
		},
	],
};

const poppins = Poppins({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	return (
		<html
			lang="en"
			className={poppins.className}
			suppressHydrationWarning
		>
			<body className="bg-black">
				<main className="min-h-screen bg-black">
					{children}
				</main>
				<Toaster />
			</body>
		</html>
	);
}
