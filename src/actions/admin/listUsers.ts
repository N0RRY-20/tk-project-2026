"use server";

import { db } from "@/db";
import { student, classTable } from "@/db/schemas";
import { inArray, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/better-auth/auth";
import type { UserRow } from "@/types/user";

interface PaginateUsersParams {
  limit: number;
  offset: number;
  search?: string;
  role?: string;
}

export async function paginateUsers(
  params: PaginateUsersParams,
): Promise<{ users: UserRow[]; total: number }> {
  const headersList = await headers();

  const query: Record<string, string | number> = {
    limit: params.limit,
    offset: params.offset,
  };

  if (params.search) {
    query.searchValue = params.search;
    query.searchField = "name";
    query.searchOperator = "contains";
  }

  if (params.role && params.role !== "all") {
    query.filterField = "role";
    query.filterValue = params.role;
    query.filterOperator = "eq";
  }

  const result = await auth.api.listUsers({
    headers: headersList,
    query,
  });

  const userIds = result.users.map((u) => u.id);

  const studentRows =
    userIds.length > 0
      ? await db
          .select()
          .from(student)
          .leftJoin(classTable, eq(student.classId, classTable.id))
          .where(inArray(student.id, userIds))
      : [];

  const studentMap = new Map(studentRows.map((s) => [s.student.id, s]));

  const users: UserRow[] = result.users.map((u) => {
    const row = studentMap.get(u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image ?? null,
      role: u.role ?? null,
      nickname: row?.student?.nickname ?? null,
      gender: row?.student?.gender ?? null,
      classId: row?.student?.classId ?? null,
      className: row?.class?.name ?? null,
      qrCode: row?.student?.qrCode ?? null,
      audio_url: row?.student?.audioUrl ?? null,
    };
  });

  return { users, total: result.total };
}
