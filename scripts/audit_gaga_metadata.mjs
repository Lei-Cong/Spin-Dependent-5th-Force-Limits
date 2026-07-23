import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "datasets_multi.json"), "utf8"));
const bibSource = fs.readFileSync(path.join(root, "MyLibrary.bib"), "utf8");
const texSource = fs.readFileSync(path.join(root, "review-source", "0MainTextversion3.tex"), "utf8");

function parseBibTeX(source) {
  const entries = [];
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
      if (!fieldMatch) { index++; continue; }
      const name = fieldMatch[1].toLowerCase();
      index += fieldMatch[0].length;
      const opener = rawBody[index];
      let value = "";
      if (opener === "{") {
        let depth = 1;
        index++;
        const start = index;
        for (; index < rawBody.length && depth > 0; index++) {
          if (rawBody[index] === "{" && rawBody[index - 1] !== "\\") depth++;
          if (rawBody[index] === "}" && rawBody[index - 1] !== "\\") depth--;
        }
        value = rawBody.slice(start, index - 1);
      } else if (opener === '"') {
        index++;
        const start = index;
        for (; index < rawBody.length; index++) if (rawBody[index] === '"' && rawBody[index - 1] !== "\\") break;
        value = rawBody.slice(start, index++);
      } else {
        const match = rawBody.slice(index).match(/^([^,\n}]+)/);
        value = match ? match[1].trim() : "";
        index += match ? match[0].length : 1;
      }
      fields[name] = value.replace(/\s+/g, " ").trim();
    }
    entries.push({ key: header[2], type: header[1].toLowerCase(), fields });
  }
  return entries;
}

function extractCitations(tex) {
  const keys = new Set();
  const pattern = /\\(?:cite|citep|citet|citealp|citeyear|onlinecite|nocite)[A-Za-z*]*(?:\[[^\]]*\])?\{([^}]+)\}/g;
  for (const match of tex.matchAll(pattern)) {
    match[1].split(",").map(key => key.trim()).filter(Boolean).forEach(key => keys.add(key));
  }
  return keys;
}

function potentialFromFilename(filename) {
  if (filename.startsWith("1a")) return "astrophysical";
  if (filename.startsWith("451") || filename.startsWith("45")) return "V4+5";
  if (filename.startsWith("23")) return "V2+V3";
  if (filename.startsWith("2")) return "V2";
  if (filename.startsWith("3")) return "V3";
  if (filename.startsWith("8")) return "V8";
  return "unresolved";
}

function pairFromFilename(filename) {
  if (/eeastro/i.test(filename)) return "e-e";
  if (/eNastro/i.test(filename)) return "e-N";
  if (/NNastro/i.test(filename)) return "N-N";
  const token = filename.match(/(?:abs_|gAgA_)(ebarpabr|eebar|emubar|epbar|emu|eN|en|ep|ee|nN|pN|NN|nn|np)(?:\s+copy)?$/i)?.[1];
  return ({
    ebarpabr: "e+-pbar",
    eebar: "e-e+",
    emubar: "e-mu+",
    epbar: "e-pbar",
    emu: "e-mu+",
    eN: "e-N",
    en: "e-n",
    ep: "e-p",
    ee: "e-e",
    nN: "n-N",
    pN: "p-N",
    NN: "N-N",
    nn: "n-n",
    np: "n-p"
  })[token] || "unresolved";
}

function authorYearFromFilename(filename) {
  const clean = filename
    .replace(/^(1a|451|45|23|2|3|8)/, "")
    .replace(/_(?:m|eV|millionev).*$/i, "")
    .replace(/^_/, "");
  const match = clean.match(/^(.*?)[ _](\d{4})(?:[abc])?(?:_|$)/);
  if (!match) return null;
  const words = match[1].trim().split(/\s+/);
  return { surname: words.at(-1), year: match[2] };
}

function firstAuthorSurname(authors) {
  const first = String(authors || "").split(/\s+and\s+/i)[0].trim();
  return (first.includes(",") ? first.split(",")[0] : first.split(/\s+/).at(-1) || "")
    .replace(/[{}]/g, "").trim();
}

const entries = parseBibTeX(bibSource);
const gAgAStart = texSource.indexOf("\\subsection{Axial-vector/Axial-vector interaction");
const gAgAEnd = texSource.indexOf("\\subsection{Vector/Vector interaction", gAgAStart);
const sectionKeys = extractCitations(texSource.slice(gAgAStart, gAgAEnd));
const curves = Object.entries(manifest.gAgA || {}).flatMap(([chart, list]) =>
  list.map(entry => {
    const filename = path.basename(entry.path, ".csv");
    const authorYear = authorYearFromFilename(filename);
    const candidates = authorYear ? entries.filter(bib =>
      firstAuthorSurname(bib.fields.author).toLowerCase() === authorYear.surname.toLowerCase() &&
      bib.fields.year === authorYear.year
    ).map(bib => ({
      key: bib.key,
      title: bib.fields.title || "",
      doi: bib.fields.doi || "",
      cited_in_gAgA: sectionKeys.has(bib.key)
    })).sort((a,b) => Number(b.cited_in_gAgA) - Number(a.cited_in_gAgA) || a.key.localeCompare(b.key)) : [];
    return {
      chart,
      filename,
      data_file: entry.path,
      potential: potentialFromFilename(filename),
      fermion_pair: pairFromFilename(filename),
      author_year: authorYear,
      candidates
    };
  })
);

const outputDir = path.join(root, "metadata", "reports");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "gAgA-candidate-audit.json"), JSON.stringify({
  schema_version: "0.1",
  coupling: "gAgA",
  review_citation_keys: [...sectionKeys].sort(),
  curves
}, null, 2) + "\n");

const rows = curves.map(curve => {
  const candidates = curve.candidates.map(candidate =>
    `${candidate.cited_in_gAgA ? "**" : ""}\`${candidate.key}\`${candidate.cited_in_gAgA ? "**" : ""}`
  ).join("<br>") || "—";
  return `| \`${curve.filename}.csv\` | ${curve.potential} | ${curve.fermion_pair} | ${candidates} |`;
});
fs.writeFileSync(path.join(outputDir, "gAgA-candidate-audit.md"), `# gAgA candidate audit

Bold candidate keys are cited within the gAgA section of the review. This file is an audit, not public metadata.

- Curves: ${curves.length}
- Review citation keys: ${sectionKeys.size}
- Curves with no candidate: ${curves.filter(curve => !curve.candidates.length && curve.potential !== "astrophysical").length}
- Curves with multiple candidates: ${curves.filter(curve => curve.candidates.length > 1).length}
- Astrophysical aggregate curves: ${curves.filter(curve => curve.potential === "astrophysical").length}

| Data file | Potential | Fermion pair | BibTeX candidates |
| --- | --- | --- | --- |
${rows.join("\n")}
`);

console.log(JSON.stringify({
  curves: curves.length,
  review_keys: sectionKeys.size,
  no_candidate: curves.filter(curve => !curve.candidates.length && curve.potential !== "astrophysical").length,
  multiple_candidates: curves.filter(curve => curve.candidates.length > 1).length,
  unresolved_pairs: curves.filter(curve => curve.fermion_pair === "unresolved").map(curve => curve.filename)
}, null, 2));
