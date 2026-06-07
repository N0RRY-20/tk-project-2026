"use server";

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { db } from "@/db";
import { student, user } from "@/db/schemas";
import { createAdminClient } from "@/lib/supabase/supabase";
import { eq } from "drizzle-orm";

import {
  ELEVENLABS_VOICE_ID,
  ELEVENLABS_MODEL_ID,
  ELEVENLABS_OUTPUT_FORMAT,
  STORAGE_BUCKET_AUDIO,
} from "@/configs";

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

  const text = `Ananda ${row.user.name} silahkan pulang`;

  try {
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const { data: stream, rawResponse } = await client.textToSpeech
      .convert(ELEVENLABS_VOICE_ID, {
        text,
        modelId: ELEVENLABS_MODEL_ID,
        outputFormat: ELEVENLABS_OUTPUT_FORMAT,
      })
      .withRawResponse();

    if (rawResponse.status < 200 || rawResponse.status >= 300) {
      console.error("ElevenLabs API error:", rawResponse.status);
      return null;
    }

    const reader = stream.getReader();
    const chunks: Buffer[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }

    if (chunks.length === 0) {
      console.error("ElevenLabs returned empty audio");
      return null;
    }

    const buffer = Buffer.concat(chunks);
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
