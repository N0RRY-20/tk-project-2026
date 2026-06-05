"use client";

import { signOutAction } from "@/actions/auth/signout";
import { SIGNOUT_DEFAULTS } from "@/constants/auth-constant";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "../ui/button";
import { Loader2Icon } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    signOutAction,
    SIGNOUT_DEFAULTS,
  );

  useEffect(() => {
    if (state.success) {
      router.push("/signin");
    }
  }, [state.success, router]);

  return (
    <form action={action} className="fixed top-4 right-4">
      <Button type="submit" className="text-sm">
        {isPending ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Signing out...
          </>
        ) : (
          "Sign out"
        )}
      </Button>
    </form>
  );
}
