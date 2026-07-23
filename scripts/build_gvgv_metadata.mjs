import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "datasets_multi.json"), "utf8"));
const gAgA = JSON.parse(fs.readFileSync(path.join(root, "metadata/generated/gAgA-constraints.json"), "utf8"));
const tex = fs.readFileSync(path.join(root, "review-source/0MainTextversion3.tex"), "utf8");
const reviewKey = "cong_spin-dependent_2025";

const start = tex.indexOf("\\subsection{\\texorpdfstring{Vector/Vector interaction");
const end = tex.indexOf("\\subsection{Limits for massless spin-1 bosons", start);
const section = tex.slice(start, end);
const citedKeys = new Set();
for (const match of section.matchAll(/\\(?:cite|citep|citet|citealp|citeyear|onlinecite|nocite|citeauthor)[A-Za-z*]*(?:\[[^\]]*\])?\{([^}]+)\}/g)) {
  match[1].split(",").map(key => key.trim()).filter(Boolean).forEach(key => citedKeys.add(key));
}

const publications = new Map();
for (const record of gAgA.records) {
  for (const reference of record.references) publications.set(reference.citation_key, reference);
}

const mappings = [
  [/Fadeev_2022/, "fadeev_pseudovector_2022"],
  [/Terrano_2015/, "terrano_short-range_2015"],
  [/Ficek_2017/, "ficek_constraints_2017"],
  [/Cong_2025/, "cong_improved_2025"],
  [/Almasi_2020/, "almasi_new_2020"],
  [/Ficek_2018/, "ficek_constraints_2018"],
  [/Wang_2022/, "wang_limits_2022"],
  [/Clayburn_2023/, "clayburn_using_2023"],
  [/Kim_2018/, "kim_experimental_2018"],
  [/LH Wu_2023/, "wu_spin-mechanical_2023"],
  [/Wei Xiao_2024/, "xiao_exotic_2024"],
  [/DG Wu_2023/, "wu_improved_2023"],
  [/Wu_2021/, "wu_experimental_2022"],
  [/Heckel_2008/, "heckel_preferred-frame_2008"],
  [/Ding_2020/, "ding_constraints_2020"],
  [/Xiao_2023/, "xiao_femtotesla_2023"],
  [/Haddock_2018c/, "haddock_search_2018"],
  [/Vasilakis_2009/, "vasilakis_limits_2009"],
  [/Su_2021/, "su_search_2021"],
  [/Wei_2022/, "wei_constraints_2022"],
  [/45_Wu_2023/, "wu_new_2023"],
  [/Kimball_2010/, "jackson_kimball_constraints_2010"],
  [/Ledbetter_2013/, "ledbetter_constraints_2013"],
  [/voronin_2020/i, "voronin_constraint_2020"],
  [/Ramsey_1979/, "ramsey_tensor_1979"]
];

const sourceTemplate = new Map();
for (const record of gAgA.records) {
  const key = record.references[0]?.citation_key;
  if (key && !sourceTemplate.has(key)) sourceTemplate.set(key, record);
}

function potential(filename) {
  if (/^V_?1|^V1_/.test(filename)) return "V1";
  if (filename.startsWith("1a")) return "astrophysical";
  if (filename.startsWith("23")) return "V2+V3";
  if (filename.startsWith("45")) return "V4+5";
  if (filename.startsWith("3")) return "V3";
  return "other";
}

function pair(filename, dataFile) {
  if (/Cong_2025/.test(filename)) return "e-p";
  if (/V1_gse|V_1gfactor/.test(filename)) return "e-e";
  if (/V1_gsN/.test(filename)) return "N-N";
  if (/eeastro/.test(filename)) return "e-e";
  if (/eNastro/.test(filename)) return "e-N";
  if (/NNastro/.test(filename)) return "N-N";
  if (/Terrano_2015/.test(filename)) return "e-e";
  if (/Fadeev_2022_2/.test(filename)) return "e-e+";
  const token = filename.match(/(?:abs_|gVgV_)(ebarpabr|eebar|emubar|epbar|eN|en|ep|ee|nN|pN|NN|nn|np)(?:\s+copy)?$/i)?.[1];
  return ({
    ebarpabr: "e+-pbar", eebar: "e-e+", emubar: "e-mu+", epbar: "e-pbar",
    eN: "e-N", en: "e-n", ep: "e-p", ee: "e-e",
    nN: "n-N", pN: "p-N", NN: "N-N", nn: "n-n", np: "n-p"
  })[token] || (dataFile.includes("lepton-lepton") ? "e-e" : "other");
}

function reviewLocation(key, kind) {
  if (kind === "comparison") return { section: "Vector/Vector interaction gVgV", figure: "Fig. 12" };
  if (!citedKeys.has(key)) return null;
  return { section: "Vector/Vector interaction gVgV", figure: "Fig. 12" };
}

const records = Object.entries(manifest.gVgV).flatMap(([chart, entries]) => entries.map(entry => {
  const filename = path.basename(entry.path, ".csv");
  const pot = potential(filename);
  const fermionPair = pair(filename, entry.path);
  const id = filename.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  if (pot === "V1" || pot === "astrophysical") {
    const label = pot === "V1"
      ? entry.label
      : `Astrophysical · ${fermionPair}`;
    return {
      id, label, display_label: pot === "V1" ? entry.label : "Astrophysical",
      data_file: entry.path, coupling: "gVgV", potential: pot,
      fermion_pair: fermionPair,
      method: {
        category: pot === "V1" ? "comparison_v1" : "astrophysical",
        technique: pot === "V1" ? "spin_independent_v1_comparison" : "astrophysical_constraints",
        source: "", sensor: ""
      },
      references: [publications.get(reviewKey)].filter(Boolean),
      review_location: reviewLocation(reviewKey, "comparison"),
      curation: { status: "review_only", evidence: ["RMP review Fig. 12 and comparison appendices"] }
    };
  }

  const mapping = mappings.find(([pattern]) => pattern.test(filename));
  if (!mapping) throw new Error(`No mapping for ${entry.path}`);
  const key = mapping[1];
  const reference = publications.get(key);
  const template = sourceTemplate.get(key);
  if (!reference || !template) throw new Error(`Missing publication/template for ${key}`);
  const confidence = filename.includes("Cong_2025") ? "95%" : "";
  const display = `${reference.first_author || filename} ${reference.year}${confidence ? ` · ${confidence} CL` : ""}`;
  return {
    id, label: display, display_label: display,
    data_file: entry.path, coupling: "gVgV", potential: pot,
    fermion_pair: fermionPair, confidence_level: confidence,
    method: { ...template.method },
    references: [reference],
    review_location: reviewLocation(key, "publication"),
    curation: {
      status: "confirmed",
      evidence: ["filename", "BibTeX record", ...(citedKeys.has(key) ? ["citation in RMP gVgV section"] : [])],
      note: filename.includes("Cong_2025")
        ? "Published after the review bibliography snapshot; no review figure attribution is displayed."
        : filename.includes("Wu_2021")
          ? "Legacy filename retained; the paper was published in 2022."
          : filename.includes("Haddock_2018c")
            ? "Complete replacement dataset selected; earlier partial a/b files are excluded."
            : ""
    }
  };
}));

const output = {
  schema_version: "0.1",
  coupling: "gVgV",
  notice: "Unless otherwise noted, the constraints shown here have been standardized using the interaction conventions adopted in the RMP review and may therefore differ from values presented in the original publications.",
  records
};
const usedPublications = Object.fromEntries([...new Map(records.flatMap(record =>
  record.references.map(reference => [reference.citation_key, reference])
))]);

fs.mkdirSync(path.join(root, "metadata/generated"), { recursive: true });
fs.mkdirSync(path.join(root, "metadata/reports"), { recursive: true });
fs.writeFileSync(path.join(root, "metadata/generated/gVgV-constraints.json"), JSON.stringify(output, null, 2) + "\n");
fs.writeFileSync(path.join(root, "metadata/generated/gVgV-publications.json"), JSON.stringify(usedPublications, null, 2) + "\n");
fs.writeFileSync(path.join(root, "metadata/reports/gVgV-matching-report.md"), `# gVgV matching report

- Visible curves: ${records.length}
- Publication-linked curves: ${records.filter(record => record.curation.status === "confirmed").length}
- Review-only V1/astrophysical comparison curves: ${records.filter(record => record.curation.status === "review_only").length}
- Publications not cited by key in the review gVgV section: ${records.filter(record => record.curation.status === "confirmed" && !record.review_location).length}
- Cong selection: V2+V3, 95% CL only
- Haddock selection: complete 2018c dataset only
- Terrano filename corrected from eN to ee

No legacy CSV was deleted except for the explicitly renamed Terrano file. Haddock a/b and Cong 90% remain on disk but are excluded from the viewer manifest.
`);

console.log(JSON.stringify({
  records: records.length,
  confirmed: records.filter(record => record.curation.status === "confirmed").length,
  comparison: records.filter(record => record.curation.status === "review_only").length,
  without_review_attribution: records.filter(record => record.curation.status === "confirmed" && !record.review_location).map(record => record.display_label)
}, null, 2));
