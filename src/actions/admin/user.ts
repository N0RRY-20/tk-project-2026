import { db } from "@/db";
import { user, student, classTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import type { UserRow } from "@/types/user";

export async function getUsers(): Promise<UserRow[]> {
  const rows = await db
    .select()
    .from(user)
    .leftJoin(student, eq(user.id, student.id))
    .leftJoin(classTable, eq(student.classId, classTable.id));

  return rows.map((row) => ({
    id: row.user.id,
    name: row.user.name,
    email: row.user.email,
    image: row.user.image,
    role: row.user.role,
    nickname: row.student?.nickname ?? null,
    gender: row.student?.gender ?? null,
    classId: row.student?.classId ?? null,
    className: row.class?.name ?? null,
    qrCode: row.student?.qrCode ?? null,
    audio_url: row.student?.audioUrl ?? null,
  }));
}
