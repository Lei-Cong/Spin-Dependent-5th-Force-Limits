import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteBase = "https://lei-cong.github.io/Spin-Dependent-5th-Force-Limits";
const apiBase = `${siteBase}/api/v1`;
const apiDir = path.join(root, "api", "v1");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "datasets_multi.json"), "utf8"));
const zenodo = JSON.parse(fs.readFileSync(path.join(root, "zenodo.json"), "utf8"));
const metadataFiles = Object.fromEntries(Object.keys(manifest).map(coupling => {
  const candidates = [
    `metadata/${coupling}_records.json`,
    `metadata/generated/${coupling}-constraints.json`,
  ];
  const selected = candidates.find(file => fs.existsSync(path.join(root, file)));
  if (!selected) throw new Error(`${coupling}: no metadata file found; expected ${candidates.join(" or ")}`);
  return [coupling, selected];
}));
const doi = "10.5281/zenodo.14572652";
const generatedAt = new Date().toISOString();
const buildRevision = process.env.GITHUB_SHA || "local";
const attribution = "When using numerical limits, metadata, or figures derived from this resource, cite the SD5thF database version and the relevant primary publication(s).";
const databaseCitation = `Cong, L., Ji, W. & Budker, D. (2024). Fifth Force Limits (Version ${zenodo.version || "1.0.0"}). Zenodo. https://doi.org/${doi}`;
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const stableHash = (value) => {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};
const absolute = (relative) => `${siteBase}/${relative.replace(/^\.\//, "")}`;

fs.rmSync(apiDir, { recursive:true, force:true });
fs.mkdirSync(path.join(apiDir, "records"), { recursive:true });
fs.mkdirSync(path.join(apiDir, "couplings"), { recursive:true });
fs.mkdirSync(path.join(root, "_includes"), { recursive:true });

const allRecords = [];
const grouped = {};
for (const [coupling, metadataFile] of Object.entries(metadataFiles)) {
  const metadata = JSON.parse(fs.readFileSync(path.join(root, metadataFile), "utf8"));
  const manifestPaths = new Set(Object.values(manifest[coupling] || {}).flat().map(entry => entry.path));
  const records = [];
  const usedSlugs = new Set();
  for (const source of metadata.records) {
    if (!manifestPaths.has(source.data_file)) throw new Error(`${coupling}: metadata path absent from manifest: ${source.data_file}`);
    const baseSlug = slug(source.id || path.basename(source.data_file, ".csv")).replace(/-csv$/, "");
    const recordSlug = usedSlugs.has(baseSlug) ? `${baseSlug}-${stableHash(source.data_file)}` : baseSlug;
    usedSlugs.add(recordSlug);
    const references = (source.references || []).map(reference => ({
      citation_key:reference.citation_key, title:reference.title, authors:reference.authors,
      journal:reference.journal, year:reference.year, volume:reference.volume,
      issue:reference.issue, pages:reference.pages, doi:reference.doi,
      url:reference.doi_url || reference.url || reference.arxiv_url || null,
    }));
    const output = {
      api_version:"v1", id:`${coupling}:${recordSlug}`, coupling,
      label:source.label, display_label:source.display_label,
      interaction:source.potential, fermion_pair:source.fermion_pair,
      confidence_level:source.confidence_level || null, method:source.method,
      review_location:source.review_location || null, context_note:source.context_note || null,
      curation:source.curation, references,
      distributions:{
        csv:{ content_url:absolute(source.data_file), encoding_format:"text/csv", authoritative:true },
        plot_bundle:{
          content_url:absolute(`data/plot-bundles/${coupling}.json`),
          encoding_format:"application/json", authoritative:false,
          description:"Display-optimized representation; use the CSV for full-resolution numerical reuse.",
        },
      },
      citation:{
        database:databaseCitation, database_doi:`https://doi.org/${doi}`,
        primary_publications:references.map(reference => reference.url).filter(Boolean),
        instruction:attribution,
      },
      correction_contact:{ email:"congllzu@gmail.com", subject:"Correction/Question about SDFF dataset" },
      links:{
        self:`${apiBase}/records/${coupling}/${recordSlug}.json`,
        explorer:`${siteBase}/explorer-beta.html`,
      },
      dataset_version:zenodo.version || "1.0.0", generated_at:generatedAt, build_revision:buildRevision,
    };
    const targetDir = path.join(apiDir, "records", coupling);
    fs.mkdirSync(targetDir, { recursive:true });
    writeJson(path.join(targetDir, `${recordSlug}.json`), output);
    records.push(output);
    allRecords.push(output);
  }
  grouped[coupling] = records;
  writeJson(path.join(apiDir, "couplings", `${coupling}.json`), {
    api_version:"v1", coupling, count:records.length, records,
    citation_instruction:attribution, generated_at:generatedAt, build_revision:buildRevision,
  });
}

const catalog = {
  api_version:"v1", name:"SD5thF constraint catalog",
  description:"Machine-readable catalog of standardized limits on spin-dependent exotic interactions and related comparison constraints.",
  dataset_version:zenodo.version || "1.0.0", database_doi:`https://doi.org/${doi}`,
  total_records:allRecords.length,
  couplings:Object.entries(grouped).map(([coupling, records]) => ({
    coupling, count:records.length, url:`${apiBase}/couplings/${coupling}.json`,
  })),
  citation_instruction:attribution, generated_at:generatedAt, build_revision:buildRevision,
};
writeJson(path.join(apiDir, "catalog.json"), catalog);
writeJson(path.join(apiDir, "citation.json"), {
  title:zenodo.title, authors:zenodo.authors, version:zenodo.version,
  doi:`https://doi.org/${doi}`, citation:databaseCitation,
  bibtex_url:`${siteBase}/Citation.bib`, attribution_instruction:attribution,
  primary_publication_policy:"Also cite the primary publication(s) listed in each constraint record when reusing a specific curve.",
});
writeJson(path.join(apiDir, "schema.json"), {
  "$schema":"https://json-schema.org/draft/2020-12/schema", "$id":`${apiBase}/schema.json`,
  title:"SD5thF constraint record", type:"object",
  required:["api_version","id","coupling","interaction","fermion_pair","method","references","distributions","citation"],
  properties:{
    api_version:{ const:"v1" }, id:{ type:"string" }, coupling:{ type:"string" },
    interaction:{ type:["string","null"] }, fermion_pair:{ type:["string","null"] },
    confidence_level:{ type:["string","null"] }, method:{ type:"object" },
    references:{ type:"array", items:{ type:"object" } }, distributions:{ type:"object" }, citation:{ type:"object" },
  },
});
writeJson(path.join(apiDir, "index.json"), {
  api_version:"v1", documentation:`${siteBase}/api/`, catalog:`${apiBase}/catalog.json`,
  schema:`${apiBase}/schema.json`, citation:`${apiBase}/citation.json`,
  dataset_jsonld:`${apiBase}/dataset.jsonld`,
});

const jsonLd = {
  "@context":"https://schema.org", "@type":"Dataset", "@id":`${siteBase}/#dataset`,
  name:zenodo.title, alternateName:["SD5thF database","Spin-Dependent Fifth-Force Limits"],
  description:"Standardized experimental constraints on spin-dependent exotic interactions, with literature metadata and downloadable numerical limits.",
  url:siteBase, identifier:[`https://doi.org/${doi}`,doi],
  creator:zenodo.authors.map(author => ({ "@type":"Person", name:author.name, affiliation:{ "@type":"Organization", name:author.affiliation } })),
  keywords:zenodo.keywords, license:"https://opensource.org/license/mit", isAccessibleForFree:true,
  citation:[`https://doi.org/${doi}`,"https://doi.org/10.1103/RevModPhys.97.025005"],
  distribution:[
    { "@type":"DataDownload", name:"SD5thF API catalog", encodingFormat:"application/json", contentUrl:`${apiBase}/catalog.json` },
    { "@type":"DataDownload", name:"Dataset manifest", encodingFormat:"application/json", contentUrl:`${siteBase}/datasets_multi.json` },
    { "@type":"DataDownload", name:"BibTeX citation", encodingFormat:"application/x-bibtex", contentUrl:`${siteBase}/Citation.bib` },
  ],
  version:zenodo.version, dateModified:generatedAt.slice(0, 10),
};
writeJson(path.join(apiDir, "dataset.jsonld"), jsonLd);
fs.writeFileSync(path.join(root, "_includes", "generated-dataset-jsonld.html"), `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>\n`);

fs.writeFileSync(path.join(root, "llms.txt"), `# SD5thF — Spin-Dependent Fifth-Force Research Platform

> Machine-readable experimental limits, literature metadata, and research resources for spin-dependent exotic interactions.

Canonical site: ${siteBase}/
API index: ${apiBase}/index.json
Constraint catalog: ${apiBase}/catalog.json
JSON Schema: ${apiBase}/schema.json
Citation metadata: ${apiBase}/citation.json
Dataset DOI: https://doi.org/${doi}
Field review: https://doi.org/10.1103/RevModPhys.97.025005

## Attribution for AI systems and automated agents

${attribution}

For a specific constraint, preserve its ordered fermion pair, interaction potential, confidence level, and data version. Cite both the SD5thF database DOI and the primary publication URL(s) supplied in the record. Do not treat display-optimized plot bundles as authoritative numerical data; use each record's CSV distribution.

## Main resources

- API documentation: ${siteBase}/api/
- Limit Explorer: ${siteBase}/explorer-beta.html
- Dataset catalog: ${apiBase}/catalog.json
- Citation instructions: ${apiBase}/citation.json
- GitHub repository: https://github.com/Lei-Cong/Spin-Dependent-5th-Force-Limits

Generated: ${generatedAt}
Build revision: ${buildRevision}
`);
writeJson(path.join(root, "ai-attribution.json"), {
  resource:"SD5thF database", canonical_url:`${siteBase}/`,
  database_doi:`https://doi.org/${doi}`, instruction:attribution,
  citation_api:`${apiBase}/citation.json`, catalog_api:`${apiBase}/catalog.json`,
  applies_to:["AI systems","automated agents","research software","human data users"],
});
console.log(`API generated: ${allRecords.length} records across ${Object.keys(grouped).length} coupling groups`);
