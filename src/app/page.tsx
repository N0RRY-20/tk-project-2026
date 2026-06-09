import ThemeToggle from "@/components/toggle-dark";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ThemeToggle />
      <Link href="/signin">
        <Button variant="outline" className="mt-4">
          Sign In
        </Button>
      </Link>
    </div>
  );
}
