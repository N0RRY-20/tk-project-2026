import { createAdminClient } from "./supabase";

const BUCKET = "avatars";

function getStorage() {
  return createAdminClient().storage.from(BUCKET);
}

export function getFileNameFromUrl(url: string): string {
  return url.split("/").pop() as string;
}

export async function deleteAvatarFiles(fileNames: string[]) {
  if (fileNames.length === 0) return;
  const { error } = await getStorage().remove(fileNames);
  if (error) {
    console.error("Failed to delete avatar file(s):", error.message);
  }
}
