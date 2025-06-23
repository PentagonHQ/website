import Link from "next/link";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold text-white">404 - Not Found</h2>
      <p className="text-white/60">
        The page you are looking for does not exist.
      </p>
      <Link href="/">
        <Button className="rounded-none">Return Home</Button>
      </Link>
    </div>
  );
}
