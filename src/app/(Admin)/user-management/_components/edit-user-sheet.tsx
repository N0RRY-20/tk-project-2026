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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CameraIcon, Loader2Icon, Trash2Icon } from "lucide-react";

import { updateUserFormSchema } from "@/validations/user-validation";
import { INITIAL_USER_UPDATE_STATE } from "@/constants/user-constant";
import { updateUserAction } from "@/actions/admin/userUpdate";
import { uploadAvatarAction } from "@/actions/storage/uploadAvatar";
import { getClasses } from "@/actions/admin/class";
import type { UserUpdateFormState, UserRow } from "@/types/user";
import { getInitials } from "./columns";

type EditUserFormData = z.infer<typeof updateUserFormSchema>;

interface EditUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRow | null;
  onSuccess?: () => void;
}

export function EditUserSheet({ open, onOpenChange, user, onSuccess }: EditUserSheetProps) {
  const router = useRouter();
  const [isPendingTransition, startTransition] = useTransition();
  const [state, dispatch, isPending] = useActionState(
    async (prevState: UserUpdateFormState, formData: FormData) => {
      return updateUserAction(prevState, formData);
    },
    INITIAL_USER_UPDATE_STATE,
  );

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(updateUserFormSchema),
    values: {
      id: user?.id ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "",
      nickname: user?.nickname ?? "",
      gender: user?.gender ?? "",
      classId: user?.classId ?? "",
    },
  });

  const role = form.watch("role");
  const isStudent = role === "student";

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [classList, setClassList] = React.useState<{ value: string; label: string }[]>([]);

  React.useEffect(() => {
    if (open && isStudent) {
      getClasses().then((classes) => {
        setClassList(classes.map((c) => ({ value: c.id, label: c.name })));
      });
    }
  }, [open, isStudent]);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  useEffect(() => {
    if (state.status === "success") {
      toast.success("User updated successfully");
      form.reset();
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } else if (state.status === "error") {
      const errorMsg = state.errors?._form?.[0] || "Failed to update user";
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile || !user) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("avatar", selectedFile);
      const result = await uploadAvatarAction(formData);
      if (result.status === "success") {
        toast.success("Avatar updated");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.errors?._form?.[0] || "Failed to upload avatar");
      }
    } catch {
      toast.error("Upload failed. File too large or network error.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Update user account details. Leave password empty to keep current password.
          </SheetDescription>
        </SheetHeader>

        <form
          id="edit-user-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <FieldGroup>
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 pb-2">
              <Avatar className="size-16">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="Preview" />
                ) : user?.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback>
                  {user ? (
                    getInitials(user.name)
                  ) : (
                    <CameraIcon className="size-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CameraIcon className="size-4 mr-2" />
                  {user?.image ? "Change Photo" : "Add Photo"}
                </Button>
                {selectedFile && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadAvatar}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar && (
                        <Loader2Icon className="size-4 animate-spin mr-2" />
                      )}
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

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
              placeholder="Leave empty to keep current"
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
                  name="classId"
                  label="Class"
                  variant="select"
                  selectPlaceholder="Select class"
                  selectOptions={classList}
                />
              </>
            )}
          </FieldGroup>
        </form>

        <SheetFooter className="shrink-0 flex-row justify-end px-6 pb-6">
          <Button type="submit" form="edit-user-form" disabled={isLoading}>
            {isLoading && (
              <Loader2Icon className="size-4 animate-spin mr-2" />
            )}
            Update User
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
