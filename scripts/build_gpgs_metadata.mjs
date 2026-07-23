import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "datasets_multi.json"), "utf8"));
const bibText = fs.readFileSync(path.join(root, "MyLibrary.bib"), "utf8");
const reviewText = fs.readFileSync(path.join(root, "review-source", "0MainTextversion3.tex"), "utf8");

function parseBib(text) {
  const entries = new Map();
  const headers = [...text.matchAll(/^@([A-Za-z]+)\s*\{\s*([^,\s]+)\s*,/gm)];
  for (let headerIndex = 0; headerIndex < headers.length; headerIndex += 1) {
    const header = headers[headerIndex];
    const bodyStart = header.index + header[0].length;
    const bodyEnd = headerIndex + 1 < headers.length ? headers[headerIndex + 1].index : text.length;
    const body = text.slice(bodyStart, bodyEnd).replace(/\}\s*$/, "");
    const fields = {};
    let index = 0;
    while (index < body.length) {
      const match = body.slice(index).match(/^\s*,?\s*([A-Za-z][\w-]*)\s*=\s*/);
      if (!match) { index += 1; continue; }
      const name = match[1].toLowerCase();
      index += match[0].length;
      const opener = body[index];
      let value = "";
      if (opener === "{") {
        let depth = 1;
        index += 1;
        const start = index;
        for (; index < body.length && depth; index += 1) {
          if (body[index] === "{" && body[index - 1] !== "\\") depth += 1;
          if (body[index] === "}" && body[index - 1] !== "\\") depth -= 1;
        }
        value = body.slice(start, index - 1);
      } else if (opener === '"') {
        index += 1;
        const start = index;
        while (index < body.length && (body[index] !== '"' || body[index - 1] === "\\")) index += 1;
        value = body.slice(start, index);
        index += 1;
      } else {
        const bare = body.slice(index).match(/^([^,\n}]+)/);
        value = bare?.[1]?.trim() ?? "";
        index += bare?.[0]?.length ?? 1;
      }
      fields[name] = value.replace(/\s+/g, " ").trim();
    }
    entries.set(header[2], fields);
  }
  return entries;
}

const bib = parseBib(bibText);
const clean = (value = "") => value.replace(/\\&/g, "&").replace(/\\textendash/g, "–").replace(/\\textemdash/g, "—")
  .replace(/\\['"`^~=]\{?([A-Za-z])\}?/g, "$1").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
function publication(key) {
  const item = bib.get(key);
  if (!item) throw new Error(`Missing BibTeX entry: ${key}`);
  const doi = item.doi?.replace(/^https?:\/\/doi\.org\//i, "");
  return {
    citation_key: key, title: clean(item.title), authors: clean(item.author), journal: clean(item.journal),
    year: Number(item.year) || item.year, volume: clean(item.volume), issue: clean(item.number),
    pages: clean(item.pages), doi, doi_url: doi ? `https://doi.org/${doi}` : "", url: doi ? `https://doi.org/${doi}` : item.url,
  };
}

const rules = [
  ["Crescini_2022","crescini_search_2022","Crescini et al. 2022","rotating lead masses","GSO crystal magnetometer read out by a dc SQUID","dedicated_source_sensor"],
  ["Prosnyak_2023","prosnyak_updated_2023","Prosnyak et al. 2023","","","complementary"],
  ["Stadnik_2018","stadnik_improved_2018","Stadnik & Flambaum 2018","","","complementary"],
  ["Hunter_2014","hunter_using_2014","Hunter et al. 2014","Earth's geoelectrons","spin-polarized torsion pendulum","dedicated_source_sensor"],
  ["Agrawal_2023","agrawal_searching_2023","Agrawal et al. 2023","","","complementary"],
  ["Dzuba_2018","dzuba_new_2018","Dzuba et al. 2018","","","complementary"],
  ["Heckel_2008","heckel_preferred-frame_2008","Heckel et al. 2008","unpolarized laboratory source masses","spin-polarized torsion pendulum","dedicated_source_sensor"],
  ["Hoedl_2011","hoedl_improved_2011","Hoedl et al. 2011","unpolarized source mass","spin-polarized torsion pendulum","dedicated_source_sensor"],
  ["Lee_2018","lee_improved_2018","Lee et al. 2018","unpolarized source mass","K–³He self-compensating comagnetometer","dedicated_source_sensor"],
  ["Liang_2022","liang_new_2023","Liang et al. 2023","oscillating unpolarized mass","ensemble nitrogen-vacancy spin sensor","dedicated_source_sensor"],
  ["Rong_2018","rong_searching_2018","Rong et al. 2018","moving unpolarized mass","single nitrogen-vacancy spin sensor","dedicated_source_sensor"],
  ["Terrano_2015","terrano_short-range_2015","Terrano et al. 2015","unpolarized source mass","spin-polarized torsion pendulum","dedicated_source_sensor"],
  ["Wineland_1991","wineland_search_1991","Wineland et al. 1991","Earth","trapped-ion spin spectroscopy","dedicated_source_sensor"],
  ["Ayres_2023","ayres_search_2023","Ayres et al. 2023","Earth","ultracold-neutron and mercury co-magnetometer","dedicated_source_sensor"],
  ["Feng_2022","feng_search_2022","Feng et al. 2022","Earth","noble-gas comagnetometer","dedicated_source_sensor"],
  ["Tullney_2013","tullney_constraints_2013","Tullney et al. 2013","Earth","³He–¹²⁹Xe comagnetometer","dedicated_source_sensor"],
  ["Venema_1992","venema_search_1992","Venema et al. 1992","Earth","Hg–Cs spin-precession comparison","dedicated_source_sensor"],
  ["Voronin_2009","voronin_neutron_2009","Voronin et al. 2009","noncentrosymmetric crystal electric field","polarized-neutron diffraction","dedicated_source_sensor"],
  ["Wu_2023","wu_new_2023","L. Y. Wu et al. 2023","Sun and Earth","spin-based quantum sensor","dedicated_source_sensor"],
  ["Zhang_2023","zhang_search_2023","Zhang et al. 2023","Earth","noble-gas comagnetometer","dedicated_source_sensor"],
  ["guigue_2015","guigue_constraining_2015","Guigue et al. 2015","cell walls","polarized ³He relaxation","dedicated_source_sensor"],
  ["Baruch_2024","baruch_constraining_2024","Baruch et al. 2024","","","complementary"],
  ["Stadnik_2015","stadnik_nuclear_2015","Stadnik & Flambaum 2015","","","complementary"],
];
const conversions = [
  ["Safronova_2018_Kimball","jackson_kimball_constraints_2017","Jackson Kimball et al. 2017"],
  ["Safronova_2018_Youdin","youdin_limits_1996","Youdin et al. 1996"],
];
const legendLabel = (label) => label
  .replace(/^L\. Y\. /, "")
  .replace(/^Jackson Kimball /, "Kimball ")
  .replace(/ et al\./, "")
  .replace(/ & Flambaum/, "")
  .trim();

const sectionStart = reviewText.search(/Pseudoscalar\/Scalar interaction/i);
const sectionEnd = reviewText.indexOf("\\subsection", sectionStart + 100);
const reviewSection = reviewText.slice(sectionStart, sectionEnd);
const location = { section:"Pseudoscalar/Scalar interaction gpgs", figure:"Fig. 13" };
const isCombined = (name) => /combined/i.test(name);
const isAstrophysical = (name) => /astro/i.test(name);
const potential = (name) => isCombined(name) ? "combined" : isAstrophysical(name) ? "astrophysical" : name.startsWith("15") ? "V15" : "V9+10";
const pairFromName = (name) => {
  if (/Ne(?:\.csv)?$/.test(name)) return "N-e";
  if (name.includes("Baruch_2024")) return "N-N";
  if (/ee(?:\.csv)?$/i.test(name) || /gepg(?:es|ee)combined/i.test(name) || /eeastro/i.test(name)) return "e-e";
  if (/eN(?:\.csv)?$/.test(name) || /gepgNscombined/i.test(name) || /eNastro/i.test(name)) return "e-N";
  if (/en(?:\.csv)?$/.test(name)) return "e-n";
  if (/ep(?:\.csv)?$/.test(name)) return "e-p";
  if (/nN(?:\.csv)?$/i.test(name) || /gnpgNscombined/i.test(name) || /nNastro/i.test(name) || /Venema_1992.*NN/i.test(name)) return "n-N";
  if (/pN(?:\.csv)?$/i.test(name) || /gppgNscombined/i.test(name) || /pNastro/i.test(name)) return "p-N";
  throw new Error(`Cannot infer ordered fermion pair from ${name}`);
};
const datasets = Object.entries(manifest.gpgs ?? {})
  .flatMap(([groupPair, items]) => items.map((dataset) => ({ ...dataset, groupPair })));

const records = datasets.map((dataset) => {
  const filename = path.basename(dataset.path);
  const pair = pairFromName(filename);
  const common = {
    id:filename.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    data_file:dataset.path, filename, coupling:"gpgs", fermion_pair:pair, potential:potential(filename),
    confidence_level:null, review_location:null, references:[],
    method:{ category:"", technique:"", source:"", sensor:"" },
    curation:{ status:"curated", note:"" },
  };
  if (isCombined(filename)) {
    const segment = Number(filename.match(/combined(\d+)/i)?.[1] ?? 1);
    return { ...common, label:`Combined · segment ${segment}`, display_label:"Combined", review_location:location,
      method:{ category:"combined", technique:"combined constraint", source:"", sensor:"" },
      curation:{ status:"review_only", note:"Combined constraint compiled for the RMP review." }, segment };
  }
  if (isAstrophysical(filename)) {
    return { ...common, label:"Astrophysical", display_label:"Astrophysical", review_location:location,
      method:{ category:"astrophysical", technique:"astrophysical constraint", source:"", sensor:"" },
      curation:{ status:"review_only", note:"Astrophysical constraint compiled for the RMP review." } };
  }
  const converted = conversions.find(([token]) => filename.includes(token));
  if (converted) {
    const [, key, label] = converted;
    return { ...common, label, display_label:legendLabel(label), review_location:location,
      references:[publication(key), publication("safronova_search_2018")],
      method:{ category:"complementary", technique:"converted primary experimental constraint", source:"", sensor:"" },
      context_note:"This curve presents the primary experimental result as converted to the gₚgₛ framework in Safronova et al. (2018).",
      curation:{ status:"curated", note:"Primary result linked together with the conversion source." } };
  }
  const rule = rules.find(([token]) => filename.includes(token));
  if (!rule) throw new Error(`No gpgs metadata rule for ${filename}`);
  const [, key, label, source, sensor, category] = rule;
  const cited = [key, ...(key === "liang_new_2023" ? ["liang_new_2022"] : [])].some((candidate) => reviewSection.includes(candidate));
  return { ...common, label, display_label:legendLabel(label), review_location:cited ? location : null, references:[publication(key)],
    method:{ category, technique:category === "dedicated_source_sensor" ? "dedicated fifth-force experiment" : "complementary constraint or reinterpretation", source, sensor } };
}).sort((a, b) => a.data_file.localeCompare(b.data_file));

const output = path.join(root, "metadata", "gpgs_records.json");
fs.writeFileSync(output, `${JSON.stringify({
  generated_at:new Date().toISOString(),
  notice:"Constraint values use the standardized conventions of the RMP review; individual records link the relevant primary literature where available.",
  records
}, null, 2)}\n`);
console.log(`Wrote ${records.length} gpgs metadata records to ${output}`);
