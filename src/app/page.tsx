import { ModeToggle } from "@/components/toggle-dark";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ModeToggle />
      <Button>Get Started</Button>
    </div>
  );
}
