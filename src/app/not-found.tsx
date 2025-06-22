import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold text-emerald-400">404 - Not Found</h2>
      <p className="text-emerald-400/60">
        The page you are looking for does not exist.
      </p>
      <button className="border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
        <Link href="/">Return Home</Link>
      </button>
    </div>
  );
}
