import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "datasets_multi.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(root, "api", "v1", "catalog.json"), "utf8"));
let expected = 0;
let failures = 0;
const recordFiles = [];

for (const [coupling, charts] of Object.entries(manifest)) {
  const paths = Object.values(charts).flat().map(entry => entry.path);
  expected += paths.length;
  const endpoint = JSON.parse(fs.readFileSync(path.join(root, "api", "v1", "couplings", `${coupling}.json`), "utf8"));
  if (endpoint.records.length !== paths.length) {
    console.error(`${coupling}: manifest=${paths.length}, API=${endpoint.records.length}`);
    failures += 1;
  }
  for (const record of endpoint.records) {
    const recordPath = path.join(root, "api", "v1", "records", coupling, `${record.id.split(":")[1]}.json`);
    recordFiles.push(recordPath);
    if (!fs.existsSync(recordPath)) {
      console.error(`${record.id}: missing individual record endpoint`);
      failures += 1;
    }
    const relativeCsv = record.distributions.csv.content_url.split("/Spin-Dependent-5th-Force-Limits/")[1];
    if (!relativeCsv || !fs.existsSync(path.join(root, relativeCsv))) {
      console.error(`${record.id}: missing CSV`);
      failures += 1;
    }
    if (!record.citation?.database_doi || !record.citation?.instruction) {
      console.error(`${record.id}: missing citation metadata`);
      failures += 1;
    }
    if (record.curation?.status !== "review_only" && !record.references.some(reference => reference.url)) {
      console.error(`${record.id}: curated record has no publication URL`);
      failures += 1;
    }
  }
}
if (catalog.total_records !== expected) {
  console.error(`catalog total=${catalog.total_records}, expected=${expected}`);
  failures += 1;
}
if (new Set(recordFiles).size !== expected) {
  console.error(`individual record endpoints are not unique: ${new Set(recordFiles).size}/${expected}`);
  failures += 1;
}
if (failures) process.exit(1);
console.log(`API verified: ${expected} records, ${catalog.couplings.length} coupling groups`);
