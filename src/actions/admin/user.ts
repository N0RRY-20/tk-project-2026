import { db } from "@/db";
import { user, student } from "@/db/schemas";
import { eq } from "drizzle-orm";
import type { UserRow } from "@/types/user";

export async function getUsers(): Promise<UserRow[]> {
  const rows = await db
    .select()
    .from(user)
    .leftJoin(student, eq(user.id, student.id));

  return rows.map((row) => ({
    id: row.user.id,
    name: row.user.name,
    email: row.user.email,
    image: row.user.image,
    role: row.user.role,
    nickname: row.student?.nickname ?? null,
    gender: row.student?.gender ?? null,
    className: row.student?.className ?? null,
    qrCode: row.student?.qrCode ?? null,
  }));
}
