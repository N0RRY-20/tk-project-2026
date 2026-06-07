"use server";

import { auth } from "@/lib/better-auth/auth";
import { UpdateProfileState } from "@/types/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { updateProfileSchema } from "@/validations/profile-validation";

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  try {
    const validatedFields = updateProfileSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      currentPassword: formData.get("currentPassword") || undefined,
      newPassword: formData.get("newPassword") || undefined,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.issues[0]?.message ?? "Validasi gagal",
      };
    }

    const { name, email, newPassword, currentPassword } = validatedFields.data;
    const headersList = await headers();

    await auth.api.updateUser({
      headers: headersList,
      body: { name },
    });

    const session = await auth.api.getSession({ headers: headersList });
    if (email !== session?.user.email) {
      await auth.api.changeEmail({
        headers: headersList,
        body: { newEmail: email },
      });
    }

    if (newPassword && currentPassword) {
      await auth.api.changePassword({
        headers: headersList,
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        },
      });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal update profil",
    };
  }
}
