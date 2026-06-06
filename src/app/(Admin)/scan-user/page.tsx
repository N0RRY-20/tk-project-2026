import { ModeToggle } from "@/components/toggle-dark";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ScanPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ModeToggle />
      welcome to scan user page
    </div>
  );
}
