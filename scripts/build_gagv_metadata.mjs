import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bibPath = path.join(root, "MyLibrary.bib");
const texPath = path.join(root, "review-source", "0MainTextversion3.tex");
const dataRoot = path.join(root, "Dataset", "normalized", "gAgV");
const reviewKey = "cong_spin-dependent_2025";
const citationAliases = {
  "liang_new_2022": "liang_new_2023"
};

function parseBibTeX(source) {
  const entries = [];
  // Split on entry headers rather than trusting global brace balance. Zotero
  // exports can contain a malformed record; one bad record must not hide every
  // valid record that follows it from the audit.
  const headers = [...source.matchAll(/^@([A-Za-z]+)\s*\{\s*([^,\s]+)\s*,/gm)];
  for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
    const header = headers[headerIndex];
    const bodyStart = header.index + header[0].length;
    const bodyEnd = headerIndex + 1 < headers.length ? headers[headerIndex + 1].index : source.length;
    const rawBody = source.slice(bodyStart, bodyEnd).replace(/\}\s*$/, "");
    const fields = {};
    let index = 0;
    while (index < rawBody.length) {
      const fieldMatch = rawBody.slice(index).match(/^\s*,?\s*([A-Za-z][\w-]*)\s*=\s*/);
      if (!fieldMatch) {
        index++;
        continue;
      }
      const name = fieldMatch[1].toLowerCase();
      index += fieldMatch[0].length;
      const opener = rawBody[index];
      let value = "";
      if (opener === "{") {
        let fieldDepth = 1;
        index++;
        const start = index;
        for (; index < rawBody.length && fieldDepth > 0; index++) {
          if (rawBody[index] === "{" && rawBody[index - 1] !== "\\") fieldDepth++;
          if (rawBody[index] === "}" && rawBody[index - 1] !== "\\") fieldDepth--;
        }
        value = rawBody.slice(start, index - 1);
      } else if (opener === '"') {
        index++;
        const start = index;
        for (; index < rawBody.length; index++) {
          if (rawBody[index] === '"' && rawBody[index - 1] !== "\\") break;
        }
        value = rawBody.slice(start, index);
        index++;
      } else {
        const valueMatch = rawBody.slice(index).match(/^([^,\n}]+)/);
        value = valueMatch ? valueMatch[1].trim() : "";
        index += valueMatch ? valueMatch[0].length : 1;
      }
      fields[name] = value.replace(/\s+/g, " ").trim();
    }
    entries.push({ type: header[1].toLowerCase(), key: header[2], fields });
  }
  return entries;
}

function extractCitations(tex) {
  const keys = [];
  const citationPattern = /\\(?:cite|citep|citet|citealp|citeyear|onlinecite|nocite)[A-Za-z*]*(?:\[[^\]]*\])?\{([^}]+)\}/g;
  for (const match of tex.matchAll(citationPattern)) {
    for (const key of match[1].split(",")) {
      const clean = key.trim();
      if (clean) keys.push(clean);
    }
  }
  return keys;
}

function listCsvFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...listCsvFiles(full));
    if (entry.isFile() && entry.name.endsWith(".csv")) found.push(full);
  }
  return found.sort();
}

const sourceMap = {
  "Heckel_2013": { key: "heckel_limits_2013", category: "dedicated_source_sensor", technique: "spin_polarized_torsion_pendulum", source: "polarized_electron_source", sensor: "torsion_pendulum" },
  "Hunter_2013": { key: "hunter_using_2013", category: "dedicated_source_sensor", technique: "earth_source_spin_experiment", source: "earth_geoelectrons", sensor: "spin_polarized_torsion_pendulum" },
  "Hunter_2014": { key: "hunter_using_2014", category: "dedicated_source_sensor", technique: "geoelectron_source_spin_experiment", source: "earth_geoelectrons", sensor: "spin_polarized_torsion_pendulum" },
  "Wang_2023": { key: "wang_search_2023", category: "dedicated_source_sensor", technique: "quantum_spin_amplifier", source: "polarized_spin_source", sensor: "quantum_spin_amplifier" },
  "Antypas_2019": { key: "antypas_isotopic_2019", category: "complementary_experiment", technique: "atomic_parity_violation", source: "", sensor: "" },
  "Clayburn_2023": { key: "clayburn_using_2023", category: "dedicated_source_sensor", technique: "earth_source_spin_velocity_experiment", source: "rotating_unpolarized_earth", sensor: "spin_polarized_torsion_pendulum" },
  "Dzuba_2017": { key: "dzuba_probing_2017", category: "complementary_experiment", technique: "atomic_parity_violation_interpretation", source: "", sensor: "" },
  "Heckel_2008": { key: "heckel_preferred-frame_2008", category: "dedicated_source_sensor", technique: "spin_polarized_torsion_pendulum", source: "preferred_frame_background", sensor: "spin_polarized_torsion_pendulum" },
  "Jiao_2021": { key: "jiao_experimental_2021", category: "dedicated_source_sensor", technique: "single_electron_spin_quantum_sensor", source: "moving_mass", sensor: "single_nv_center" },
  "Kim_2019": { key: "kim_experimental_2019", category: "dedicated_source_sensor", technique: "optically_polarized_vapor", source: "moving_mass", sensor: "optically_polarized_vapor" },
  "Liang_2022": { key: "liang_new_2023", category: "dedicated_source_sensor", technique: "ensemble_nv_diamond_magnetometer", source: "moving_mass", sensor: "ensemble_nv_diamond_magnetometer", confirmed: true, label: "Liang 2023", note: "Published in 2023; the legacy CSV filename retains the 2022 pre-publication year." },
  "Wu_2022": { key: "wu_experimental_2022", category: "dedicated_source_sensor", technique: "atomic_magnetometer_array", source: "polarized_spin_source", sensor: "atomic_magnetometer_array" },
  "Vasilakis_2009": { key: "vasilakis_limits_2009", category: "dedicated_source_sensor", technique: "self_compensating_comagnetometer", source: "polarized_helium_3_nuclear_spins", sensor: "potassium_helium_3_self_compensating_comagnetometer" },
  "Shu_2024": { key: "shu_constraint_2024", category: "dedicated_source_sensor", technique: "atom_interferometer", source: "earth", sensor: "atom_interferometer" },
  "Su_2021": { key: "su_search_2021", category: "dedicated_source_sensor", technique: "spin_based_amplifier", source: "polarized_spin_source", sensor: "spin_based_amplifier" },
  "Wu_2023": { key: "wu_new_2023", category: "dedicated_source_sensor", technique: "solar_lunar_source_comagnetometer_reanalysis", source: "sun_and_moon", sensor: "dual_species_comagnetometers" },
  "Yan_2013": { key: "yan_new_2013", category: "dedicated_source_sensor", technique: "neutron_spin_rotation", source: "bulk_matter", sensor: "neutron_spin_rotation" },
  "Yan_2015": { key: "yan_searching_2015", category: "dedicated_source_sensor", technique: "polarized_helium_spin_relaxation", source: "cell_walls", sensor: "polarized_helium_spin_relaxation" }
};

const pairNames = {
  "e-e": "electron-electron",
  "e-n": "electron-neutron",
  "e-p": "electron-proton",
  "e-N": "electron-nucleon",
  "n-n": "neutron-neutron",
  "n-p": "neutron-proton",
  "n-N": "neutron-nucleon",
  "p-N": "proton-nucleon",
  "N-N": "nucleon-nucleon"
};

function quote(value) {
  return JSON.stringify(String(value));
}

function recordToYaml(record) {
  const lines = [
    `- id: ${quote(record.id)}`,
    `  label: ${quote(record.label)}`,
    `  data_file: ${quote(record.data_file)}`,
    `  coupling: gAgV`,
    `  potential: ${quote(record.potential)}`,
    `  fermion_pair: ${quote(record.fermion_pair)}`,
    `  method:`,
    `    category: ${quote(record.method.category)}`,
    `    technique: ${quote(record.method.technique)}`,
    `    source: ${quote(record.method.source || "")}`,
    `    sensor: ${quote(record.method.sensor || "")}`,
    `  references:`
  ];
  for (const reference of record.references) lines.push(`    - ${quote(reference)}`);
  lines.push(
    `  review_location:`,
    `    section: ${quote("Axial-vector/Vector interaction gAgV")}`,
    `    figure: ${quote("Fig. 9")}`,
    `  curation:`,
    `    status: ${quote(record.curation.status)}`,
    `    evidence:`
  );
  for (const evidence of record.curation.evidence) lines.push(`      - ${quote(evidence)}`);
  if (record.curation.note) lines.push(`    note: ${quote(record.curation.note)}`);
  return lines.join("\n");
}

const bibSource = fs.readFileSync(bibPath, "utf8");
const texSource = fs.readFileSync(texPath, "utf8");
const bibEntries = parseBibTeX(bibSource);
const bibByKey = new Map();
const duplicateKeys = new Map();
for (const entry of bibEntries) {
  if (bibByKey.has(entry.key)) duplicateKeys.set(entry.key, (duplicateKeys.get(entry.key) || 1) + 1);
  else bibByKey.set(entry.key, entry);
}

const allCitationKeys = extractCitations(texSource);
const gAgVStart = texSource.indexOf("\\subsection{Axial-vector/Vector interaction");
const gAgVEnd = texSource.indexOf("\\subsection{Axial-vector/Axial-vector interaction", gAgVStart);
const gAgVTex = texSource.slice(gAgVStart, gAgVEnd);
const gAgVCitationSet = new Set(extractCitations(gAgVTex));
const records = [];

for (const fullPath of listCsvFiles(dataRoot)) {
  const relative = path.relative(root, fullPath).split(path.sep).join("/");
  const filename = path.basename(fullPath, ".csv");
  const folderPair = path.basename(path.dirname(fullPath));
  const pairToken = filename.match(/_((?:e|n|p|N)-(?:e|n|p|N))$/)?.[1] || folderPair;
  const fermionPair = pairNames[pairToken] || pairToken;
  const potentialToken = filename.match(/^(V1213|V11|V16)_/)?.[1] || "combined";
  const potential = potentialToken === "V1213" ? "V12+13" : potentialToken;
  if (filename.startsWith("Combined_")) {
    const technique = filename.replace(/^Combined_/, "").replace(/_[^-]+-[^-]+$/, "").toLowerCase();
    records.push({
      id: filename.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: filename.replaceAll("_", " "),
      data_file: relative,
      potential: "combined",
      fermion_pair: fermionPair,
      method: { category: "combined", technique },
      references: [reviewKey],
      curation: {
        status: "review_only",
        evidence: ["filename", "review Fig. 9", "review comparison appendix"]
      }
    });
    continue;
  }
  const stemMatch = filename.match(/^V(?:1213|11|16)_(.+_\d{4})_[^-]+-[^-]+$/);
  const stem = stemMatch?.[1];
  const mapping = sourceMap[stem];
  const referenceExists = mapping ? bibByKey.has(mapping.key) : false;
  const citedInSection = mapping ? gAgVCitationSet.has(mapping.key) : false;
  const status = mapping?.confirmed ? "confirmed" : (!mapping || !referenceExists ? "needs_review" : "probable");
  const evidence = ["filename author/year"];
  if (citedInSection) evidence.push("citation in review gAgV section");
  if (referenceExists) evidence.push("BibTeX record");
  records.push({
    id: filename.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: mapping?.label || filename.replace(/^V(?:1213|11|16)_/, "").replace(/_[enpN]-[enpN]$/, "").replaceAll("_", " "),
    data_file: relative,
    potential,
    fermion_pair: fermionPair,
    method: mapping
      ? {
          category: mapping.category,
          technique: mapping.technique,
          source: mapping.category === "dedicated_source_sensor" ? (mapping.source || "") : "",
          sensor: mapping.category === "dedicated_source_sensor" ? (mapping.sensor || "") : ""
        }
      : { category: "complementary_experiment", technique: "unresolved", source: "", sensor: "" },
    references: mapping ? [mapping.key] : [],
    curation: {
      status,
      evidence,
      note: mapping?.note || (!mapping ? `No explicit mapping rule for ${stem || filename}.` : "")
    }
  });
}

const usedKeys = [...new Set(records.flatMap(record => record.references))].sort();
const publications = {};
function firstAuthorSurname(authors) {
  const first = String(authors || "").split(/\s+and\s+/i)[0].trim();
  if (!first) return "";
  return (first.includes(",") ? first.split(",")[0] : first.split(/\s+/).at(-1)).replace(/[{}]/g, "").trim();
}
for (const key of usedKeys) {
  const entry = bibByKey.get(key);
  if (!entry) continue;
  const doi = entry.fields.doi || "";
  const eprint = entry.fields.eprint || "";
  publications[key] = {
    citation_key: key,
    type: entry.type,
    title: entry.fields.title || "",
    authors_bibtex: entry.fields.author || "",
    year: entry.fields.year || "",
    journal: entry.fields.journal || entry.fields.journaltitle || "",
    volume: entry.fields.volume || "",
    issue: entry.fields.number || entry.fields.issue || "",
    pages: entry.fields.pages || "",
    doi,
    doi_url: doi ? `https://doi.org/${doi}` : "",
    arxiv: eprint,
    arxiv_url: eprint ? `https://arxiv.org/abs/${eprint.replace(/^arXiv:/i, "")}` : "",
    url: entry.fields.url || (doi ? `https://doi.org/${doi}` : "")
  };
  publications[key].first_author = firstAuthorSurname(publications[key].authors_bibtex);
  publications[key].short_citation = [publications[key].first_author ? `${publications[key].first_author} et al.` : "", publications[key].year].filter(Boolean).join(" ");
}

const outputDirs = [
  path.join(root, "metadata", "drafts"),
  path.join(root, "metadata", "generated"),
  path.join(root, "metadata", "reports")
];
for (const dir of outputDirs) fs.mkdirSync(dir, { recursive: true });

const yaml = [
  "# AUTO-GENERATED CANDIDATE FILE — scientific review required before publication.",
  "schema_version: 0.1",
  "coupling: gAgV",
  `generated_from:`,
  `  review_latex: ${quote("review-source/0MainTextversion3.tex")}`,
  `  bibliography: ${quote("MyLibrary.bib")}`,
  "records:",
  ...records.map(record => recordToYaml(record).split("\n").map(line => `  ${line}`).join("\n"))
].join("\n") + "\n";
fs.writeFileSync(path.join(root, "metadata", "drafts", "gAgV-candidate-matches.yml"), yaml);
fs.writeFileSync(path.join(root, "metadata", "generated", "gAgV-publications.json"), JSON.stringify(publications, null, 2) + "\n");
const browserConstraints = {
  schema_version: "0.1",
  coupling: "gAgV",
  notice: "Unless otherwise noted, the constraints shown here have been standardized using the interaction conventions adopted in the RMP review and may therefore differ from values presented in the original publications.",
  records: records.map(record => ({
    ...record,
    display_label: record.curation.status !== "review_only" && record.references[0] && publications[record.references[0]]
      ? publications[record.references[0]].short_citation.replace(" et al.", "")
      : record.label.replace(/^Combined /, "Combined · ").replace(/ [enpN]-[enpN]$/, ""),
    review_location: {
      section: "Axial-vector/Vector interaction gAgV",
      figure: "Fig. 9"
    },
    references: record.references.map(key => publications[key]).filter(Boolean)
  }))
};
fs.writeFileSync(
  path.join(root, "metadata", "generated", "gAgV-constraints.json"),
  JSON.stringify(browserConstraints, null, 2) + "\n"
);

const statusCounts = records.reduce((acc, record) => {
  acc[record.curation.status] = (acc[record.curation.status] || 0) + 1;
  return acc;
}, {});
const reportRows = records.map(record => {
  const refs = record.references.length ? record.references.join(", ") : "—";
  const note = record.curation.note || "";
  return `| \`${path.basename(record.data_file)}\` | ${record.potential} | ${record.fermion_pair} | \`${refs}\` | ${record.method.technique} | **${record.curation.status}** | ${note.replaceAll("|", "\\|")} |`;
});
const matchingReport = `# gAgV candidate matching report

This is a pilot, not an authoritative scientific release. Existing CSV data and the viewer manifest have not been changed.

## Summary

- CSV curves: ${records.length}
- Confirmed mappings: ${statusCounts.confirmed || 0}
- Probable filename + review + BibTeX matches: ${statusCounts.probable || 0}
- Review-only combined curves: ${statusCounts.review_only || 0}
- Records requiring review: ${statusCounts.needs_review || 0}
- Resolved bibliography records used by the pilot: ${Object.keys(publications).length}

## Candidate records

| Data file | Potential | Fermion pair | Citation key | Review-based method | Status | Note |
| --- | --- | --- | --- | --- | --- | --- |
${reportRows.join("\n")}

## Review decisions requested

1. Confirm the primary and secondary method labels before these records become public metadata.
2. Combined curves intentionally cite only \`${reviewKey}\` in this pilot.
3. \`Liang_2022\` has been resolved to the published 2023 record \`liang_new_2023\`; the legacy CSV filename is retained for compatibility.
`;
fs.writeFileSync(path.join(root, "metadata", "reports", "gAgV-matching-report.md"), matchingReport);

const citedUnique = [...new Set(allCitationKeys)].sort();
const missingReviewKeys = citedUnique.filter(key => !bibByKey.has(key) && !citationAliases[key]);
const missingGAgVKeys = [...gAgVCitationSet].filter(key => !bibByKey.has(key) && !citationAliases[key]).sort();
const resolvedAliases = Object.entries(citationAliases).filter(([oldKey, newKey]) => citedUnique.includes(oldKey) && bibByKey.has(newKey));
const audit = `# Bibliography audit

## Inputs

- BibTeX entries parsed: ${bibEntries.length}
- Unique BibTeX keys: ${bibByKey.size}
- Citation occurrences in review: ${allCitationKeys.length}
- Unique citation keys in review: ${citedUnique.length}
- Unique citation keys in the gAgV section: ${gAgVCitationSet.size}

## Consistency

- Duplicate BibTeX keys: ${duplicateKeys.size}
- Review citation keys absent from MyLibrary.bib: ${missingReviewKeys.length}
- gAgV-section citation keys absent from MyLibrary.bib: ${missingGAgVKeys.length}

### Duplicate keys

${duplicateKeys.size ? [...duplicateKeys.entries()].map(([key, count]) => `- \`${key}\` (${count} entries)`).join("\n") : "- None"}

### Missing keys used in the gAgV section

${missingGAgVKeys.length ? missingGAgVKeys.map(key => `- \`${key}\``).join("\n") : "- None"}

### Confirmed citation aliases

${resolvedAliases.length ? resolvedAliases.map(([oldKey, newKey]) => `- \`${oldKey}\` → \`${newKey}\``).join("\n") : "- None"}

The full-library audit is intentionally reported separately from the curve mapping so that unrelated bibliography issues do not block the gAgV pilot.
`;
fs.writeFileSync(path.join(root, "metadata", "reports", "bibliography-audit.md"), audit);

console.log(JSON.stringify({
  records: records.length,
  statuses: statusCounts,
  used_publications: Object.keys(publications).length,
  duplicate_bib_keys: duplicateKeys.size,
  missing_review_keys: missingReviewKeys.length,
  missing_gagv_keys: missingGAgVKeys.length
}, null, 2));
