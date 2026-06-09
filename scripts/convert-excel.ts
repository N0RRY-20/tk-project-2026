import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

const filePath = path.resolve("file/DATA 2026-1.xlsx");
const outputDir = path.resolve("file");

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(filePath);

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rows = raw.filter((r) => r.some((c) => c !== undefined && c !== null && c !== ""));

  const headerIndex = rows.findIndex((r) =>
    r.some((c) => String(c).trim().toUpperCase().includes("NAMA"))
  );

  if (headerIndex === -1) {
    console.warn(`⚠ ${sheetName}: No header row found, skipping`);
    continue;
  }

  const headers = rows[headerIndex].map((h) => String(h).trim());
  const skipCols = new Set(["NO"]);
  const validCols = headers
    .map((h, i) => (h && !h.startsWith("__EMPTY") && !skipCols.has(h) ? i : -1))
    .filter((i) => i !== -1);

  const data = rows.slice(headerIndex + 1).map((row) => {
    const obj: Record<string, unknown> = {};
    for (const col of validCols) {
      obj[headers[col]] = row[col] ?? null;
    }
    return obj;
  }).filter((r) => {
    const nameCol = headers.indexOf("NAMA LENGKAP");
    return nameCol === -1 || (r["NAMA LENGKAP"] !== null && r["NAMA LENGKAP"] !== undefined);
  });

  const outputPath = path.join(outputDir, `DATA 2026-1_${sheetName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✔ ${sheetName}: ${data.length} rows → ${outputPath}`);
}

console.log("\n✅ Done! All sheets converted.");
