"use server";

import { db } from "@/db";
import { student } from "@/db/schemas";

import { revalidatePath } from "next/cache";
import z from "zod";

import { addUserFormSchema } from "@/validations/user-validation";
import { INITIAL_USER_FORM_STATE } from "@/constants/user-constant";
import type { UserFormState } from "@/types/user";
import { auth } from "@/lib/better-auth/auth";

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
    className: formData.get("className"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  try {
    const { name, email, password, role, nickname, gender, className } =
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
        className: className ?? "",
        qrCode,
      };
      await db.insert(student).values(studentData);
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
