"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schemas";
import { auth } from "@/lib/better-auth/auth";
import { getFileNameFromUrl, deleteAvatarFiles } from "@/lib/supabase/storage";

export async function bulkDeleteUserAction(userIds: string[]) {
  const headersList = await headers();

  try {
    // Hapus avatar dari storage sebelum hapus user
    const users = await db
      .select({ id: user.id, image: user.image })
      .from(user)
      .where(inArray(user.id, userIds));
    const fileNames = users
      .map((u) => (u.image ? getFileNameFromUrl(u.image) : null))
      .filter((f): f is string => f !== null);
    await deleteAvatarFiles(fileNames);

    for (const userId of userIds) {
      await auth.api.removeUser({
        headers: headersList,
        body: { userId },
      });
    }

    revalidatePath("/user-management");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete users",
    };
  }
}
