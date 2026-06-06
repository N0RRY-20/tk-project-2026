"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect, useActionState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { FieldGroup } from "@/components/ui/field";
import { FormInput } from "@/components/common/form-input";
import { Loader2Icon } from "lucide-react";

import { addUserFormSchema } from "@/validations/user-validation";
import {
  USER_DEFAULTS,
  INITIAL_USER_FORM_STATE,
} from "@/constants/user-constant";
import { createUserAction } from "@/actions/admin/userCreate";
import type { UserFormState } from "@/types/user";

type AddUserFormData = z.infer<typeof addUserFormSchema>;

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddUserSheet({ open, onOpenChange, onSuccess }: AddUserSheetProps) {
  const router = useRouter();
  const [isPendingTransition, startTransition] = useTransition();
  const [state, dispatch, isPending] = useActionState(
    async (prevState: UserFormState, formData: FormData) => {
      return createUserAction(prevState, formData);
    },
    INITIAL_USER_FORM_STATE,
  );

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: USER_DEFAULTS as unknown as AddUserFormData,
  });

  const role = form.watch("role");
  const isStudent = role === "student";

  useEffect(() => {
    if (state.status === "success") {
      toast.success("User created successfully");
      form.reset();
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } else if (state.status === "error") {
      const errorMsg = state.errors?._form?.[0] || "Failed to create user";
      toast.error(errorMsg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (state.status === "error") {
      startTransition(() => dispatch(new FormData()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    startTransition(() => dispatch(formData));
  });

  const isLoading = isPending || isPendingTransition;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add User</SheetTitle>
          <SheetDescription>
            Create a new user account. Student accounts require additional
            fields.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-user-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <FieldGroup>
            <FormInput
              control={form.control}
              name="name"
              label="Name"
              placeholder="Full name"
            />

            <FormInput
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="Email address"
            />

            <FormInput
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
            />

            <FormInput
              control={form.control}
              name="role"
              label="Role"
              variant="select"
              selectPlaceholder="Select role"
              selectOptions={[
                { value: "admin", label: "Admin" },
                { value: "student", label: "Student" },
              ]}
            />

            <FormInput
              control={form.control}
              name="nickname"
              label="Nickname"
              placeholder="Nickname (optional)"
            />

            {isStudent && (
              <>
                <FormInput
                  control={form.control}
                  name="gender"
                  label="Gender"
                  variant="select"
                  selectPlaceholder="Select gender"
                  selectOptions={[
                    { value: "laki-laki", label: "Laki-laki" },
                    { value: "perempuan", label: "Perempuan" },
                  ]}
                />

                <FormInput
                  control={form.control}
                  name="className"
                  label="Class"
                  placeholder="Class name"
                />
              </>
            )}
          </FieldGroup>
        </form>

        <SheetFooter className="shrink-0 flex-row justify-end px-6 pb-6">
          <Button type="submit" form="add-user-form" disabled={isLoading}>
            {isLoading && (
              <Loader2Icon className="size-4 animate-spin mr-2" />
            )}
            Create User
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
