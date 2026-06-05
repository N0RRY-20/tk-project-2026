"use server";

import { auth } from "@/lib/better-auth/auth";
import { SignOutState } from "@/types/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function signOutAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: SignOutState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<SignOutState> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Logout gagal",
    };
  }
}
