import type {NextConfig} from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
	dest: "public",
	disable: process.env.NODE_ENV === "development",
	register: true,
	skipWaiting: true,
	swcMinify: true,
	fallbacks: {
		page: "/offline",
	},
	reloadOnOnline: true,
	cacheOnFrontEndNav: true,
	aggressiveFrontEndNavCaching: false,
	workboxOptions: {
		disableDevLogs: true,
		maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
		cleanupOutdatedCaches: true,
		clientsClaim: true,
		skipWaiting: true,
	},
});

const nextConfig: NextConfig = {
	reactStrictMode: true,
};

module.exports = withPWA(nextConfig);