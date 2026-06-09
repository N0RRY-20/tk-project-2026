import { db } from "../src/db";
import { student } from "../src/db/schemas";
import { isNotNull } from "drizzle-orm";

async function main() {
  const students = await db
    .select({ id: student.id, name: student.nickname })
    .from(student)
    .where(isNotNull(student.audioUrl));

  if (students.length === 0) {
    console.log("No cached audio found. Nothing to reset.");
    return;
  }

  console.log(`Found ${students.length} students with cached audio:`);
  students.forEach((s) => console.log(`  - ${s.name || s.id}`));

  await db
    .update(student)
    .set({ audioUrl: null })
    .where(isNotNull(student.audioUrl));

  console.log(`\nReset ${students.length} audio URLs successfully.`);
  console.log("Next scan will regenerate audio with the new template.");
}

main().catch((err) => {
  console.error("Failed to reset audio cache:", err);
  process.exit(1);
});
