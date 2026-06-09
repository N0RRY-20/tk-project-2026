"use server";

import { db } from "@/db";
import { classTable, student, user } from "@/db/schemas";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function getClasses() {
  const rows = await db
    .select()
    .from(classTable)
    .orderBy(classTable.name);

  const counts = await db
    .select({
      classId: student.classId,
      count: sql<number>`COUNT(*)`,
    })
    .from(student)
    .groupBy(student.classId);

  const countMap = new Map(
    counts.map((c) => [c.classId, Number(c.count)]),
  );

  return rows.map((c) => ({
    ...c,
    studentCount: countMap.get(c.id) ?? 0,
  }));
}

export async function getClass(id: string) {
  const [row] = await db
    .select()
    .from(classTable)
    .where(eq(classTable.id, id))
    .limit(1);

  return row ?? null;
}

export async function createClass(name: string) {
  const id = crypto.randomUUID();
  await db.insert(classTable).values({ id, name });
  revalidatePath("/user-management");
  revalidatePath("/classes");
  return { id, name };
}

export async function updateClass(id: string, name: string) {
  await db.update(classTable).set({ name }).where(eq(classTable.id, id));
  revalidatePath("/user-management");
  revalidatePath("/classes");
}

export async function deleteClass(id: string) {
  await db.delete(classTable).where(eq(classTable.id, id));
  revalidatePath("/user-management");
  revalidatePath("/classes");
}

export async function getStudentsForBulkAssign() {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      nickname: student.nickname,
      gender: student.gender,
      classId: student.classId,
      className: classTable.name,
    })
    .from(user)
    .leftJoin(student, eq(user.id, student.id))
    .leftJoin(classTable, eq(student.classId, classTable.id))
    .where(eq(user.role, "student"))
    .orderBy(user.name);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    image: r.image,
    nickname: r.nickname,
    gender: r.gender,
    classId: r.classId,
    className: r.className,
  }));
}

export async function bulkAssignStudents(classId: string | null, studentIds: string[]) {
  await db
    .update(student)
    .set({ classId })
    .where(inArray(student.id, studentIds));
  revalidatePath("/user-management");
  revalidatePath("/classes");
}
