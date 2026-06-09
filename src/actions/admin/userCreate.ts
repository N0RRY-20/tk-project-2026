"use server";

import { db } from "@/db";
import { student } from "@/db/schemas";

import { revalidatePath } from "next/cache";
import z from "zod";

import { addUserFormSchema } from "@/validations/user-validation";
import { INITIAL_USER_FORM_STATE } from "@/constants/user-constant";
import type { UserFormState } from "@/types/user";
import { auth } from "@/lib/better-auth/auth";
import { uploadAvatarToStorage } from "@/actions/storage/uploadAvatar";

export async function createUserAction(
  prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  if (!formData) return INITIAL_USER_FORM_STATE;

  const validatedFields = addUserFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    nickname: formData.get("nickname"),
    gender: formData.get("gender"),
    classId: formData.get("classId"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  try {
    const { name, email, password, role, nickname, gender, classId } =
      validatedFields.data;
    const user = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: role as "admin" | "user",
      },
    });

    if (role === "student") {
      const qrCode = `STU-${crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 10)}`;
      const studentData: typeof student.$inferInsert = {
        id: user.user.id,
        nickname: nickname ?? null,
        gender: gender as "laki-laki" | "perempuan",
        classId: classId ?? null,
        qrCode,
      };
      await db.insert(student).values(studentData);
    }

    // Upload avatar jika ada file
    const file = formData.get("avatar") as File | null;
    if (file && file.size > 0) {
      try {
        await uploadAvatarToStorage(user.user.id, file);
      } catch (error) {
        console.error("Failed to upload avatar:", error);
      }
    }

    revalidatePath("/user-management");
    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      errors: {
        _form: [
          error instanceof Error ? error.message : "Failed to create user",
        ],
      },
    };
  }
}
