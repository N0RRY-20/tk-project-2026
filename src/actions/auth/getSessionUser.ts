"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user, student } from "@/db/schemas";
import { eq } from "drizzle-orm";
import type { UserRow } from "@/types/user";

export async function getSessionUser(): Promise<UserRow | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const rows = await db
    .select()
    .from(student)
    .innerJoin(user, eq(student.id, user.id))
    .where(eq(student.id, session.user.id))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.user.id,
    name: row.user.name,
    email: row.user.email,
    image: row.user.image,
    role: row.user.role,
    nickname: row.student.nickname ?? null,
    gender: row.student.gender ?? null,
    className: row.student.className ?? null,
    qrCode: row.student.qrCode ?? null,
    audio_url: row.student.audioUrl ?? null,
  };
}
