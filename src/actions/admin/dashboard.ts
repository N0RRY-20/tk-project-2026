"use server";

import { db } from "@/db";
import { user, student } from "@/db/schemas";
import { eq, count, gte, desc } from "drizzle-orm";

export type RecentUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
};

export type ClassDistItem = {
  className: string | null;
  count: number;
};

export type DashboardStats = {
  totalUsers: number;
  totalAdmins: number;
  totalStudents: number;
  newThisMonth: number;
  recentUsers: RecentUser[];
  classDistribution: ClassDistItem[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalResult] = await db.select({ count: count() }).from(user);
  const totalUsers = totalResult?.count ?? 0;

  const [adminResult] = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.role, "admin"));
  const totalAdmins = adminResult?.count ?? 0;

  const [studentResult] = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.role, "student"));
  const totalStudents = studentResult?.count ?? 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [newThisMonthResult] = await db
    .select({ count: count() })
    .from(user)
    .where(gte(user.createdAt, startOfMonth));
  const newThisMonth = newThisMonthResult?.count ?? 0;

  const recentUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(5);

  const classDistribution = await db
    .select({
      className: student.className,
      count: count(),
    })
    .from(student)
    .groupBy(student.className);

  return {
    totalUsers,
    totalAdmins,
    totalStudents,
    newThisMonth,
    recentUsers,
    classDistribution,
  };
}
