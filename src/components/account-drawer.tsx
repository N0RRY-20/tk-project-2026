"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useTransition } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormInput } from "@/components/common/form-input";
import { updateProfileSchema } from "@/validations/profile-validation";
import { updateProfileAction } from "@/actions/auth/updateProfile";

interface AccountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    email: string;
  };
}

export function AccountDrawer({
  open,
  onOpenChange,
  user,
}: AccountDrawerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [profileState, profileAction, isProfilePending] = useActionState(
    updateProfileAction,
    { success: false },
  );

  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: user.name,
      email: user.email,
      currentPassword: "",
      newPassword: "",
    },
  });

  React.useEffect(() => {
    if (profileState.success) {
      onOpenChange(false);
      form.reset();
      router.refresh();
    }
  }, [profileState, form, router, onOpenChange]);

  const isLoading = isProfilePending;

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("currentPassword", data.currentPassword ?? "");
    formData.append("newPassword", data.newPassword ?? "");
    startTransition(() => profileAction(formData));
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Account</DrawerTitle>
          <DrawerDescription>
            Update your profile information
          </DrawerDescription>
        </DrawerHeader>

        <form
          id="account-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <FieldGroup>
            {profileState.error ? (
              <p className="text-xs text-destructive">{profileState.error}</p>
            ) : null}
            <FormInput
              control={form.control}
              name="name"
              label="Name"
              placeholder="Your name"
            />
            <FormInput
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="your@email.com"
            />
            <FormInput
              control={form.control}
              name="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Leave empty to keep"
            />
            <FormInput
              control={form.control}
              name="newPassword"
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
            />
          </FieldGroup>
        </form>

        <DrawerFooter>
          <Button type="submit" form="account-form" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
