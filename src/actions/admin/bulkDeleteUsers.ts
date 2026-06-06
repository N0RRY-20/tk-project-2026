"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/better-auth/auth";

export async function bulkDeleteUserAction(userIds: string[]) {
  const headersList = await headers();

  try {
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
