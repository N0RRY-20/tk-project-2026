"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schemas";
import { auth } from "@/lib/better-auth/auth";
import { getFileNameFromUrl, deleteAvatarFiles } from "@/lib/supabase/storage";

export async function deleteUserAction(userId: string) {
  const headersList = await headers();

  try {
    // Hapus avatar dari storage sebelum hapus user
    const [existing] = await db
      .select({ image: user.image })
      .from(user)
      .where(eq(user.id, userId));
    if (existing?.image) {
      await deleteAvatarFiles([getFileNameFromUrl(existing.image)]);
    }

    await auth.api.removeUser({
      headers: headersList,
      body: { userId },
    });

    revalidatePath("/user-management");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
