import { auth } from "../src/lib/better-auth/auth";
import { db } from "../src/db";
import { student } from "../src/db/schemas";
import crypto from "crypto";

const adminUsers = Array.from({ length: 20 }, (_, i) => ({
  name: `Admin ${i + 1}`,
  email: `admin${i + 1}@example.com`,
  password: "password123",
  role: "admin" as const,
}));

const studentUsers = Array.from({ length: 20 }, (_, i) => ({
  name: `Student ${i + 1}`,
  email: `student${i + 1}@example.com`,
  password: "password123",
  role: "student" as const,
  nickname: `student${i + 1}`,
  gender: i % 2 === 0 ? ("laki-laki" as const) : ("perempuan" as const),
  className: `Class ${String.fromCharCode(65 + (i % 5))}`,
}));

async function main() {
  // Create admin users
  for (const userData of adminUsers) {
    try {
      const user = await auth.api.createUser({
        body: userData,
      });
      console.log("Admin created:", user.user.name, user.user.email);
    } catch (error) {
      console.error(
        `Failed to create admin ${userData.name}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Create student users
  for (const userData of studentUsers) {
    try {
      const { nickname, gender, className, ...authData } = userData;
      const user = await auth.api.createUser({
        body: {
          ...authData,
          role: authData.role as "admin" | "user",
        },
      });

      const qrCode = `STU-${crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 10)}`;

      // Insert student record
      await db.insert(student).values({
        id: user.user.id,
        nickname,
        gender,
        className,
        qrCode,
      });

      console.log("Student created:", user.user.name, user.user.email);
    } catch (error) {
      console.error(
        `Failed to create student ${userData.name}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log("\nSeeding complete!");
}

main().catch(console.error);
