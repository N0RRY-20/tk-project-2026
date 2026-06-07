"use client";

import * as React from "react";
import { CircleUserRoundIcon } from "lucide-react";
import { AccountDrawer } from "@/components/account-drawer";
import { Button } from "@/components/ui/button";

export function ProfileActions({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full">
        <CircleUserRoundIcon />
        Account Settings
      </Button>
      <AccountDrawer
        open={open}
        onOpenChange={setOpen}
        user={user}
      />
    </>
  );
}
