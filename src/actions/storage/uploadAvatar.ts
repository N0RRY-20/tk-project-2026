"use server";

import { db } from "@/db";
import { user } from "@/db/schemas";
import { createAdminClient } from "@/lib/supabase/supabase";
import { getFileNameFromUrl, deleteAvatarFiles } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import sharp from "sharp";

// Validasi file
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 500 * 1024; // 500KB
const MAX_DIMENSION = 1024; // px

async function compressImage(
  buffer: Buffer,
  mimeType: string,
): Promise<Buffer> {
  let quality = 85;

  let result: Buffer;

  do {
    const pipeline = sharp(buffer).resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    });

    if (mimeType === "image/png") {
      pipeline.png({ quality });
    } else if (mimeType === "image/webp") {
      pipeline.webp({ quality });
    } else {
      pipeline.jpeg({ quality });
    }

    result = await pipeline.toBuffer();
    quality -= 10;
  } while (result.length > MAX_SIZE && quality > 10);

  return result;
}

export async function uploadAvatarToStorage(userId: string, file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      status: "error",
      errors: { _form: ["Tipe file harus JPG/PNG/WebP"] },
    };
  }

  // Ambil data user untuk cek image lama
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId));
  if (!existingUser) {
    return { status: "error", errors: { _form: ["User tidak ditemukan"] } };
  }

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}-${existingUser.name}.${ext}`;
  const filePath = fileName;

  // Hapus avatar lama jika ada
  if (existingUser.image) {
    await deleteAvatarFiles([getFileNameFromUrl(existingUser.image)]);
  }

  // Upload file baru (kompres otomatis, jaga ≤ 500KB)
  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  const original = buffer;
  buffer = Buffer.from(await compressImage(buffer, file.type));
  if (original.length < buffer.length) {
    buffer = original;
  }

  // ======kode upload ke storage========
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { status: "error", errors: { _form: [uploadError.message] } };
  }

  // Dapatkan public URL
  const { data: publicUrl } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Simpan URL ke database
  await db
    .update(user)
    .set({ image: publicUrl.publicUrl })
    .where(eq(user.id, userId));

  revalidatePath("/user-management");

  return { status: "success", imageUrl: publicUrl.publicUrl };
}

export async function uploadAvatarAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const file = formData.get("avatar") as File;

  if (!userId || !file || file.size === 0) {
    return {
      status: "error",
      errors: { _form: ["File atau userId required"] },
    };
  }

  return uploadAvatarToStorage(userId, file);
}
