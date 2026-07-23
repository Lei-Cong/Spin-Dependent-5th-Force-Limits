import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "datasets_multi.json"), "utf8"));
const bibSource = fs.readFileSync(path.join(root, "MyLibrary.bib"), "utf8");
const review = fs.readFileSync(path.join(root, "review-source/0MainTextversion3.tex"), "utf8");
const methodTemplates = new Map();
for (const relative of [
  "metadata/generated/gAgV-constraints.json",
  "metadata/generated/gAgA-constraints.json",
  "metadata/generated/gVgV-constraints.json",
  "metadata/gpgs_records.json",
]) {
  const source = JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
  for (const item of source.records) {
    for (const reference of item.references || []) {
      if (reference.citation_key && !methodTemplates.has(reference.citation_key)) {
        methodTemplates.set(reference.citation_key, item.method);
      }
    }
  }
}

function parseBib(source) {
  const result = new Map();
  const headers = [...source.matchAll(/^@([A-Za-z]+)\s*\{\s*([^,\s]+)\s*,/gm)];
  for (let h = 0; h < headers.length; h += 1) {
    const header = headers[h];
    const start = header.index + header[0].length;
    const end = h + 1 < headers.length ? headers[h + 1].index : source.length;
    const body = source.slice(start, end).replace(/\}\s*$/, "");
    const fields = {};
    let i = 0;
    while (i < body.length) {
      const match = body.slice(i).match(/^\s*,?\s*([A-Za-z][\w-]*)\s*=\s*/);
      if (!match) { i += 1; continue; }
      const name = match[1].toLowerCase();
      i += match[0].length;
      const opener = body[i];
      let value = "";
      if (opener === "{") {
        let depth = 1;
        i += 1;
        const valueStart = i;
        for (; i < body.length && depth; i += 1) {
          if (body[i] === "{" && body[i - 1] !== "\\") depth += 1;
          if (body[i] === "}" && body[i - 1] !== "\\") depth -= 1;
        }
        value = body.slice(valueStart, i - 1);
      } else if (opener === '"') {
        i += 1;
        const valueStart = i;
        while (i < body.length && (body[i] !== '"' || body[i - 1] === "\\")) i += 1;
        value = body.slice(valueStart, i);
        i += 1;
      } else {
        const bare = body.slice(i).match(/^([^,\n}]+)/);
        value = bare?.[1]?.trim() ?? "";
        i += bare?.[0]?.length ?? 1;
      }
      fields[name] = value.replace(/\s+/g, " ").trim();
    }
    result.set(header[2], fields);
  }
  return result;
}

const bib = parseBib(bibSource);
const clean = (value = "") => value.replace(/\\&/g, "&").replace(/\\textendash/g, "–")
  .replace(/\\textemdash/g, "—").replace(/\\['"`^~=]\{?([A-Za-z])\}?/g, "$1")
  .replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
function publication(key) {
  const item = bib.get(key);
  if (!item) throw new Error(`Missing BibTeX entry ${key}`);
  const doi = item.doi?.replace(/^https?:\/\/doi\.org\//i, "");
  const arxiv = item.eprint?.replace(/^arXiv:/i, "");
  return {
    citation_key:key, title:clean(item.title), authors:clean(item.author),
    journal:clean(item.journal), year:Number(item.year) || item.year,
    volume:clean(item.volume), issue:clean(item.number), pages:clean(item.pages),
    doi, doi_url:doi ? `https://doi.org/${doi}` : "",
    arxiv_url:arxiv ? `https://arxiv.org/abs/${arxiv}` : "",
    url:doi ? `https://doi.org/${doi}` : (item.url || (arxiv ? `https://arxiv.org/abs/${arxiv}` : "")),
  };
}
const idFor = (file) => path.basename(file, ".csv").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const short = (label) => label.replace(/^L\. H\. |^D\. G\. |^L\. Y\. /, "").replace(/^Jackson Kimball /, "Kimball ").replace(/ et al\./, "").replace(/ & Flambaum/, "").trim();
const loc = (section, figure) => ({ section, figure });
const reviewReference = () => publication("cong_spin-dependent_2025");
const record = ({ entry, coupling, pair, potential, label, key, method, reviewLocation, confidence, context, status = "curated", refs }) => ({
  id:idFor(entry.path), label, display_label:short(label), data_file:entry.path,
  coupling, potential, fermion_pair:pair, confidence_level:confidence || null,
  method:method || methodTemplates.get(key) || { category:"complementary", technique:"constraint or reinterpretation", source:"", sensor:"" },
  references:refs || (key ? [publication(key)] : [reviewReference()]),
  review_location:reviewLocation || null,
  ...(context ? { context_note:context } : {}),
  curation:{ status, evidence:[reviewLocation ? `${reviewLocation.figure}, RMP review` : "Primary publication and curated dataset"] },
});

function gpgpRecord(entry) {
  const f = path.basename(entry.path);
  const astro = /astro/i.test(f);
  if (astro) return record({ entry, coupling:"gpgp", pair:/NN/i.test(f)?"N-N":/eN/i.test(f)?"e-N":"e-e", potential:"astrophysical",
    label:"Astrophysical", reviewLocation:loc("Pseudoscalar/Pseudoscalar interaction gpgp","Fig. 14"),
    method:{ category:"astrophysical", technique:"astrophysical constraint", source:"", sensor:"" }, status:"review_only" });
  const mappings = [
    [/Wang_2022/,"wang_limits_2022","Wang et al. 2022","e-n"],
    [/Cong_2025/,"cong_improved_2025","Cong et al. 2025","e-p"],
    [/Almasi_2020/,"almasi_new_2020","Almasi et al. 2020","e-n"],
    [/Fadeev_2022_5/,"fadeev_pseudovector_2022","Fadeev et al. 2022","e-p"],
    [/Fadeev_2022_2/,"fadeev_pseudovector_2022","Fadeev et al. 2022","e-e+"],
    [/Fadeev_2022_3/,"fadeev_pseudovector_2022","Fadeev et al. 2022","e-mu+"],
    [/Fadeev_2022_4/,"fadeev_pseudovector_2022","Fadeev et al. 2022","e-e"],
    [/Ficek_2018/,"ficek_constraints_2018","Ficek et al. 2018","e-pbar"],
    [/Terrano_2015/,"terrano_short-range_2015","Terrano et al. 2015","e-e"],
    [/Ramsey_1979/,"ramsey_tensor_1979","Ramsey 1979","n-p"],
    [/Ledbetter_2013/,"ledbetter_constraints_2013","Ledbetter et al. 2013","p-N"],
    [/Vasilakis_2009/,"vasilakis_limits_2009","Vasilakis et al. 2009","n-n"],
    [/Kimball_2010/,"jackson_kimball_constraints_2010","Jackson Kimball et al. 2010","n-p"],
  ];
  const m = mappings.find(([pattern]) => pattern.test(f));
  if (!m) throw new Error(`No gpgp mapping for ${f}`);
  const [, key, label, pair] = m;
  const cited = review.includes(`{${key}}`) && key !== "cong_improved_2025";
  return record({ entry, coupling:"gpgp", pair, potential:"V3", label, key,
    confidence:/95CL/.test(f)?"95%":null,
    reviewLocation:cited?loc("Pseudoscalar/Pseudoscalar interaction gpgp","Fig. 14"):null });
}

function gsgsRecord(entry) {
  const f = path.basename(entry.path);
  if (f.startsWith("V1_")) {
    const pair=f.includes("gse")?"e-e":"N-N";
    const isNew=f.includes("new2026");
    const comparisonToken=f.replace(/\.csv$/,"").replace(/^V1_(?:gse|gsN)_/,"").replace(/_new2026$/,"");
    const comparisonLabel=({ EEP:"WEP", MS:"Molecular spectroscopy", EMM:"Electron magnetic moment" })[comparisonToken] || comparisonToken.replaceAll("_"," ");
    return record({ entry, coupling:"gsgs", pair, potential:"V1",
      label:isNew?"Cong et al. 2026":comparisonLabel,
      key:isNew?"cong_testing_2026":null,
      reviewLocation:isNew?null:loc("Scalar/Scalar interaction gsgs","Fig. 15"),
      context:isNew?"Updated electron-magnetic-moment constraint from Cong et al. (2026), superseding the legacy viewer curve.":null,
      method:{ category:"combined", technique:isNew?"electron magnetic moment":"combined constraint", source:"", sensor:"" },
      status:isNew?"curated":"review_only" });
  }
  if (/astro/i.test(f)) return record({ entry, coupling:"gsgs", pair:/ee/i.test(f)?"e-e":/NN/i.test(f)?"N-N":"e-N",
    potential:"astrophysical", label:"Astrophysical", reviewLocation:loc("Scalar/Scalar interaction gsgs","Fig. 15"),
    method:{ category:"astrophysical", technique:"astrophysical constraint", source:"", sensor:"" }, status:"review_only" });
  const mappings = [
    [/Clayburn_2023a/,"clayburn_using_2023","Clayburn et al. 2023","e-N"],
    [/Clayburn_2023b/,"clayburn_using_2023","Clayburn et al. 2023","n-N"],
    [/Clayburn_2023c/,"clayburn_using_2023","Clayburn et al. 2023","p-N"],
    [/Kim_2018/,"kim_experimental_2018","Kim et al. 2018","e-N"],
    [/LH Wu_2023/,"wu_spin-mechanical_2023","L. H. Wu et al. 2023","e-N"],
    [/Ficek_2018/,"ficek_constraints_2018","Ficek et al. 2018","e-pbar"],
    [/DG Wu_2023/,"wu_improved_2023","D. G. Wu et al. 2023","e-N"],
    [/Wu_2021/,"wu_experimental_2022","Wu et al. 2022","e-N"],
    [/Heckel_2008/,"heckel_preferred-frame_2008","Heckel et al. 2008","e-N"],
    [/Ding_2020/,"ding_constraints_2020","Ding et al. 2020","e-N"],
    [/Xiao_2024/,"xiao_exotic_2024","Xiao et al. 2024","e-N"],
    [/Xiao_2023/,"xiao_femtotesla_2023","Xiao et al. 2023","e-N"],
    [/Ficek_2017/,"ficek_constraints_2017","Ficek et al. 2017","e-e"],
    [/Haddock_2018a/,"haddock_search_2018","Haddock et al. 2018","n-N"],
    [/Su_2021/,"su_search_2021","Su et al. 2021","N-N"],
    [/Wei_2022a/,"wei_constraints_2022","Wei et al. 2022","n-N"],
    [/Wei_2022b/,"wei_constraints_2022","Wei et al. 2022","p-N"],
    [/Parnell_2020/,"parnell_search_2020","Parnell et al. 2020","n-N"],
    [/voronin_2020/i,"voronin_constraint_2020","Voronin et al. 2020","N-N"],
    [/Wu_2023/,"wu_new_2023","L. Y. Wu et al. 2023","n-N"],
  ];
  const m=mappings.find(([pattern])=>pattern.test(f));
  if(!m) throw new Error(`No gsgs mapping for ${f}`);
  const [,key,label,pair]=m;
  return record({ entry,coupling:"gsgs",pair,potential:"V4+5",label,key,
    reviewLocation:review.includes(`{${key}}`)?loc("Scalar/Scalar interaction gsgs","Fig. 15"):null });
}

function v1Record(entry, chart) {
  const f=path.basename(entry.path);
  if(chart==="V1_alpha_data"){
    const mappings=[
      [/Kapner_2007/,"kapner_tests_2007","Kapner et al. 2007"],
      [/Tan_2020/,"tan_improvement_2020","Tan et al. 2020"],
      [/Lee_2020/,"lee_new_2020","Lee et al. 2020"],
      [/Hoskins_1985/,"hoskins_experimental_1985","Hoskins et al. 1985"],
      [/Chen_2016/,"chen_stronger_2016","Chen et al. 2016"],
      [/Alighanbari_2020/,"alighanbari_precise_2020","Alighanbari et al. 2020"],
      [/Bordag_2001/,"bordag_new_2001","Bordag et al. 2001"],
      [/Salumbides_antipHe_2014/,"salumbides_bounds_2014","Salumbides 2014 · antiprotonic helium"],
      [/Salumbides_ddmu_2014/,"salumbides_bounds_2014","Salumbides 2014 · ddμ"],
    ];
    const m=mappings.find(([pattern])=>pattern.test(f));
    if(!m) return record({ entry,coupling:"V1",pair:"universal",potential:"V1",label:entry.label.replaceAll("_"," "),
      reviewLocation:loc("Spin-independent V1","Fig. 16"),method:{category:"combined",technique:"combined constraint",source:"",sensor:""},status:"review_only" });
    return record({ entry,coupling:"V1",pair:"universal",potential:"V1",label:m[2],key:m[1],
      reviewLocation:loc("Spin-independent V1","Fig. 16"),method:{category:"complementary",technique:"universal Yukawa-force constraint",source:"",sensor:""} });
  }
  const composites = [/^(Casimir|WEP|Torsion|Neutron_scattering)/];
  if(composites.some(pattern=>pattern.test(f))){
    const pair=/_ee/.test(f)?"e-e":/_NN/.test(f)||/Neutron/.test(f)?"N-N":"universal";
    const methodLabel=/^Neutron/.test(f)?"Neutron scattering":f.split("_")[0];
    const alphaContext=/^(Casimir|Torsion|Neutron_scattering)/.test(f)
      ? "This compiled curve is taken from the RMP review. Further details on the underlying spin-independent constraints can be found in the separate V1 |α| panel on this page."
      : null;
    return record({ entry,coupling:"V1",pair,potential:"V1",label:methodLabel,
      reviewLocation:loc("Spin-independent V1","Fig. 17"),context:alphaContext,
      method:{category:"combined",technique:"combined constraint",source:"",sensor:""},status:"review_only" });
  }
  const mappings=[
    [/Delaunay_2022_NN/,"delaunay_self-consistent_2022","Delaunay et al. 2022","N-N",false],
    [/Adkins_2022/,"adkins_precision_2022","Adkins et al. 2022","e-e+",true],
    [/Salumbides_2014_p_N/,"salumbides_bounds_2014","Salumbides et al. 2014","p-N",true],
    [/Delaunay_2017_en/,"delaunay_probing_2017","Delaunay et al. 2017","e-n",true],
    [/Delaunay_2017/,"delaunay_probing_2017","Delaunay et al. 2017","e-e",true],
    [/Ohayon_2022/,"ohayon_precision_2022","Ohayon et al. 2022","e-mu+",true],
    [/Supernova_mu_mu/,"caputo_muonic_2022","Caputo et al. 2022","mu-mu",true],
    [/Stadnik_2023/,"stadnik_searching_2023","Stadnik et al. 2023","e-mu+",true],
    [/Alighanbari_2020/,"alighanbari_precise_2020","Alighanbari et al. 2020","p-N",true],
    [/Salumbides_2014_mu_N/,"salumbides_bounds_2014","Salumbides et al. 2014","mu-N",true],
  ];
  const m=mappings.find(([pattern])=>pattern.test(f));
  if(!m) throw new Error(`No V1 mapping for ${f}`);
  return record({ entry,coupling:"V1",pair:m[3],potential:"V1",label:m[2],key:m[1],
    reviewLocation:m[4]?loc("Spin-independent V1","Fig. 17"):null,
    context:m[4]?null:"This constraint is linked to Delaunay et al. (2022); it is not explicitly cited or discussed in the final review text." });
}

const outputs={
  gpgp:{ notice:"Pseudoscalar/pseudoscalar constraints use the standardized review convention.",records:Object.values(manifest.gpgp).flat().map(gpgpRecord) },
  gsgs:{ notice:"Scalar/scalar constraints combine V4+5 searches with clearly identified V1 and astrophysical comparisons.",records:Object.values(manifest.gsgs).flat().map(gsgsRecord) },
  V1:{ notice:"The two V1 panels are independent: one displays |g_s g_s| constraints and the other displays the universal Yukawa strength |α|.",records:Object.entries(manifest.V1).flatMap(([chart,entries])=>entries.map(entry=>v1Record(entry,chart))) },
};
for(const [name,data] of Object.entries(outputs)){
  const target=path.join(root,"metadata",`${name}_records.json`);
  fs.writeFileSync(target,`${JSON.stringify({generated_at:new Date().toISOString(),...data},null,2)}\n`);
  console.log(`Wrote ${data.records.length} records to ${target}`);
}
