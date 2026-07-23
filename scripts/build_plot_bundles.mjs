import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "datasets_multi.json"), "utf8"));
const outputDir = path.join(root, "data", "plot-bundles");
fs.mkdirSync(outputDir, { recursive:true });

function parseSeries(file) {
  const rows = fs.readFileSync(path.join(root, file), "utf8").trim().split(/\r?\n/);
  const x = [], y = [];
  for (const row of rows) {
    const [xValue, yValue] = row.includes(",") ? row.split(",") : row.trim().split(/\s+/);
    const xi = Number(xValue), yi = Number(yValue);
    if (Number.isFinite(xi) && Number.isFinite(yi) && xi > 0 && yi > 0) {
      x.push(xi);
      y.push(yi);
    }
  }
  return { x, y };
}

function minMaxDecimate(x, y, maxPoints = 1200) {
  if (x.length <= maxPoints) return { x, y };
  const bucketSize = Math.ceil((x.length - 2) / ((maxPoints - 2) / 2));
  const selected = new Set([0, x.length - 1]);
  for (let start = 1; start < x.length - 1; start += bucketSize) {
    const end = Math.min(x.length - 1, start + bucketSize);
    let minIndex = start, maxIndex = start;
    for (let index = start + 1; index < end; index += 1) {
      if (y[index] < y[minIndex]) minIndex = index;
      if (y[index] > y[maxIndex]) maxIndex = index;
    }
    selected.add(minIndex);
    selected.add(maxIndex);
  }
  const indices = [...selected].sort((a, b) => a - b);
  return { x:indices.map(index => x[index]), y:indices.map(index => y[index]) };
}

for (const [coupling, charts] of Object.entries(manifest)) {
  const bundle = {};
  for (const entry of Object.values(charts).flat()) {
    const full = parseSeries(entry.path);
    bundle[entry.path] = minMaxDecimate(full.x, full.y);
  }
  const target = path.join(outputDir, `${coupling}.json`);
  fs.writeFileSync(target, `${JSON.stringify(bundle)}\n`);
  console.log(`${coupling}: ${Object.keys(bundle).length} curves -> ${path.relative(root, target)}`);
}
