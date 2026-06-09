"use server";

import { generateStudentSpeech } from "@/lib/elevenlabs";
import { db } from "@/db";
import { student, user } from "@/db/schemas";
import { createAdminClient } from "@/lib/supabase/supabase";
import { eq } from "drizzle-orm";

import { STORAGE_BUCKET_AUDIO } from "@/configs";

export async function getStudentAudioUrl(
  qrCode: string,
): Promise<string | null> {
  const [row] = await db
    .select()
    .from(student)
    .innerJoin(user, eq(student.id, user.id))
    .where(eq(student.qrCode, qrCode))
    .limit(1);

  if (!row) return null;
  if (row.student.audioUrl) return row.student.audioUrl;

  try {
    const buffer = await generateStudentSpeech(row.user.name, row.student.className ?? undefined);

    const safeName = row.user.name.replace(/[^\w-]/g, "_");
    const fileName = `${qrCode}-${safeName}.mp3`;
    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET_AUDIO)
      .upload(fileName, buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError.message);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from(STORAGE_BUCKET_AUDIO)
      .getPublicUrl(fileName);

    await db
      .update(student)
      .set({ audioUrl: publicUrl.publicUrl })
      .where(eq(student.qrCode, qrCode));

    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Failed to generate audio:", error);
    return null;
  }
}
