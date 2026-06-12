import { auth } from "../src/lib/better-auth/auth";
import { db } from "../src/db";
import { student } from "../src/db/schemas";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

const jsonPath = path.join(process.cwd(), "file/DATA 2026-1_DATA ANAK .json");
const rawData = fs.readFileSync(jsonPath, "utf-8");
const studentData: Record<string, string | number | null>[] = JSON.parse(rawData);

const adminUsers = [
  {
    name: "Admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin" as const,
  },
];

function excelSerialToDate(serial: number | null): Date | null {
  if (serial === null) return null;
  return new Date((serial - 25569) * 86400000);
}

function convertGender(
  gender: string | null,
): "laki-laki" | "perempuan" | null {
  if (gender === null) return null;
  if (gender === "L") return "laki-laki";
  if (gender === "P") return "perempuan";
  return null;
}

function generateEmail(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
  return `${base}.${index}@example.com`;
}

function sanitizeFilename(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9\-]/g, "");
}

async function main() {
  const qrDir = path.join(process.cwd(), "file", "qrcodes");
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

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

  // Create student users from JSON
  for (let i = 0; i < studentData.length; i++) {
    const data = studentData[i];
    const studentName = (data.name as string) || `Student ${i + 1}`;

    try {
      const email = generateEmail(studentName, i + 1);
      const user = await auth.api.createUser({
        body: {
          name: studentName,
          email,
          password: "password123",
          // role: "student", aktifkan comment  kalau mau seed
        },
      });

      const qrCode = `STU-${crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 10)}`;

      await db.insert(student).values({
        id: user.user.id,
        nickname: studentName,
        qrCode,
        gender: convertGender(data.gender as string | null),
        classId: null,
        usia: (data.usia as string) || null,
        tempatLahir: (data["tempat lahir"] as string) || null,
        tanggalLahir: excelSerialToDate(data["tanggal lahir"] as number | null),
        alamat: (data.alamat as string) || null,
        namaAyah: (data["nama ayah"] as string) || null,
        namaIbu: (data["nama ibu"] as string) || null,
        pekerjaanAyah: (data["pekerjaan ayah"] as string) || null,
        pekerjaanIbu: (data["pekerjaan ibu"] as string) || null,
        noHp: (data["no hp"] as string) || null,
        tahunMasuk: (data["tahun masuk"] as string) || null,
      });

      const filename = sanitizeFilename(studentName);
      const qrPath = path.join(qrDir, `${filename}.png`);
      await QRCode.toFile(qrPath, qrCode, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });

      console.log(`Student created: ${studentName} (${email}) -> ${filename}.png`);
    } catch (error) {
      console.error(
        `Failed to create student ${studentName}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log("\nSeeding complete!");
}

main().catch(console.error);
