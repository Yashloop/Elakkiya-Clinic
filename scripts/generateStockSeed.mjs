/**
 * Regenerates src/data/stockSeed.json from the master workbook ("A-Z updated.xlsx").
 * Usage: node scripts/generateStockSeed.mjs [path/to/workbook.xlsx]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SOURCE = process.argv[2] || "A-Z updated.xlsx";
const sourcePath = path.resolve(root, SOURCE);
const outPath = path.join(root, "src", "data", "stockSeed.json");

// Excel header -> seed qty key (must stay in sync with src/utils/stockConstants.js)
const COLUMN_MAP = {
  Q: "q",
  30: "pot30",
  200: "pot200",
  "1M": "pot1M",
  "10M": "pot10M",
  "50M": "pot50M",
  CM: "cm",
  "0/1": "lm01",
  "0/3": "lm03",
  "0/6": "lm06",
  "0/30": "lm030",
  "Bach flower": "bachFlower",
  "Biochemic 6X": "biochemic6X",
  "Biochemic 3X": "biochemic3X",
  "Biochemic 1X": "biochemic1X",
  "Sugar of milk": "sugarOfMilk",
  Globules: "globules",
  Tablets: "tablets",
  Ointments: "ointments",
};

const wb = XLSX.readFile(sourcePath);
const sheetName = wb.SheetNames.includes("A-Z") ? "A-Z" : wb.SheetNames[0];
const grid = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
  header: 1,
  blankrows: false,
});

const header = (grid[0] || []).map((h) => String(h ?? "").trim());
const idx = (label) => header.findIndex((h) => h.toLowerCase() === label.toLowerCase());
const snoIdx = idx("S.No.") >= 0 ? idx("S.No.") : 0;
const sectionIdx = idx("Section");
const nameIdx = idx("Remedy");
const repeatIdx = idx("Repeatadly used") >= 0 ? idx("Repeatadly used") : idx("Repeatedly used");

const rows = [];
let seq = 0;
for (let r = 1; r < grid.length; r += 1) {
  const row = grid[r] || [];
  const name = String(row[nameIdx] ?? "").trim();
  if (!name) continue;
  seq += 1;
  const qty = {};
  header.forEach((label, c) => {
    const key = COLUMN_MAP[label];
    if (!key) return;
    const n = Number(row[c]);
    if (Number.isFinite(n) && n !== 0) qty[key] = n;
  });
  const sno = Number(row[snoIdx]);
  rows.push({
    sno: Number.isFinite(sno) && sno > 0 ? sno : seq,
    section: String(row[sectionIdx] ?? "").trim() || name[0].toUpperCase(),
    name,
    qty,
    repeatedlyUsed:
      String(row[repeatIdx] ?? "").trim().toUpperCase() === "YES" ? "YES" : "",
  });
}

// Guarantee unique, stable S.No. values (doc ids are derived from them).
const seen = new Set();
let next = 0;
rows.forEach((row) => {
  if (seen.has(row.sno)) {
    while (seen.has(next)) next += 1;
    row.sno = next;
  }
  seen.add(row.sno);
  next = Math.max(next, row.sno);
});

const seed = {
  version: 2,
  source: path.basename(sourcePath),
  generatedAt: new Date().toISOString().slice(0, 10),
  count: rows.length,
  rows,
};

fs.writeFileSync(outPath, `${JSON.stringify(seed)}\n`);
console.log(`Wrote ${rows.length} rows from "${seed.source}" to ${path.relative(root, outPath)}`);
