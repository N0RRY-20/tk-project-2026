"use server";

import { db } from "@/db";
import { student } from "@/db/schemas";
import { inArray } from "drizzle-orm";
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

  const studentRows = userIds.length > 0
    ? await db.select().from(student).where(inArray(student.id, userIds))
    : [];

  const studentMap = new Map(studentRows.map((s) => [s.id, s]));

  const users: UserRow[] = result.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image ?? null,
    role: u.role ?? null,
    nickname: studentMap.get(u.id)?.nickname ?? null,
    gender: studentMap.get(u.id)?.gender ?? null,
    className: studentMap.get(u.id)?.className ?? null,
    qrCode: studentMap.get(u.id)?.qrCode ?? null,
  }));

  return { users, total: result.total };
}
