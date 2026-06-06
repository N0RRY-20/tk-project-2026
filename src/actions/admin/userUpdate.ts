"use server";

import { db } from "@/db";
import { student } from "@/db/schemas";
import { eq } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import z from "zod";

import { updateUserFormSchema } from "@/validations/user-validation";
import { INITIAL_USER_UPDATE_STATE } from "@/constants/user-constant";
import type { UserUpdateFormState } from "@/types/user";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

export async function updateUserAction(
  prevState: UserUpdateFormState,
  formData: FormData,
): Promise<UserUpdateFormState> {
  if (!formData) return INITIAL_USER_UPDATE_STATE;

  const validatedFields = updateUserFormSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || undefined,
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
    const {
      id,
      name,
      email,
      password,
      role,
      nickname,
      gender,
      className,
    } = validatedFields.data;
    const headersList = await headers();
    await auth.api.adminUpdateUser({
      headers: headersList,
      body: {
        userId: id,
        data: { name, email, role: role as "admin" | "user" },
      },
    });

    if (password) {
      await auth.api.setUserPassword({
        headers: headersList,
        body: {
          userId: id,
          newPassword: password,
        },
      });
    }

    await db.transaction(async (tx) => {
      if (role === "admin") {
        await tx.delete(student).where(eq(student.id, id));
      } else if (role === "student") {
        const [existingStudent] = await tx
          .select()
          .from(student)
          .where(eq(student.id, id));
        const qrCode =
          existingStudent?.qrCode ||
          `STU-${crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 10)}`;
        const studentData: typeof student.$inferInsert = {
          id,
          nickname: nickname ?? null,
          gender: gender as "laki-laki" | "perempuan",
          className: className ?? "",
          qrCode,
        };
        await tx
          .insert(student)
          .values(studentData)
          .onConflictDoUpdate({
            target: student.id,
            set: {
              nickname: studentData.nickname,
              gender: studentData.gender,
              className: studentData.className,
              qrCode: studentData.qrCode,
            },
          });
      }
    });

    revalidatePath("/user-management");
    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      errors: {
        _form: [
          error instanceof Error ? error.message : "Failed to update user",
        ],
      },
    };
  }
}
