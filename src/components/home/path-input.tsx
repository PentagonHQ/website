"use client";

export default function PathInput() {
	let refCode = "";
	if (typeof window !== "undefined") {
		const searchParams = new URLSearchParams(process.env.NODE_ENV === 'development' ? window.location.search : 'https://coin.fi');
		refCode = searchParams.get("ref") || "";
	}

	return <input type="hidden" name="refCode" value={refCode} />;
}
