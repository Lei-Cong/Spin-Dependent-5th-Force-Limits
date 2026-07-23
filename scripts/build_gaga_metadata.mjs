import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const audit = JSON.parse(fs.readFileSync(path.join(root, "metadata/reports/gAgA-candidate-audit.json"), "utf8"));
const bibSource = fs.readFileSync(path.join(root, "MyLibrary.bib"), "utf8");
const reviewKey = "cong_spin-dependent_2025";

function parseBibTeX(source) {
  const entries = [];
  const headers = [...source.matchAll(/^@([A-Za-z]+)\s*\{\s*([^,\s]+)\s*,/gm)];
  for (let h = 0; h < headers.length; h++) {
    const header = headers[h];
    const start = header.index + header[0].length;
    const end = h + 1 < headers.length ? headers[h + 1].index : source.length;
    const body = source.slice(start, end).replace(/\}\s*$/, "");
    const fields = {};
    let i = 0;
    while (i < body.length) {
      const match = body.slice(i).match(/^\s*,?\s*([A-Za-z][\w-]*)\s*=\s*/);
      if (!match) { i++; continue; }
      const name = match[1].toLowerCase();
      i += match[0].length;
      const opener = body[i];
      let value = "";
      if (opener === "{") {
        let depth = 1;
        const valueStart = ++i;
        for (; i < body.length && depth > 0; i++) {
          if (body[i] === "{" && body[i - 1] !== "\\") depth++;
          if (body[i] === "}" && body[i - 1] !== "\\") depth--;
        }
        value = body.slice(valueStart, i - 1);
      } else if (opener === '"') {
        const valueStart = ++i;
        for (; i < body.length; i++) if (body[i] === '"' && body[i - 1] !== "\\") break;
        value = body.slice(valueStart, i++);
      } else {
        const bare = body.slice(i).match(/^([^,\n}]+)/);
        value = bare?.[1].trim() || "";
        i += bare?.[0].length || 1;
      }
      fields[name] = value.replace(/\s+/g, " ").trim();
    }
    entries.push({ type: header[1].toLowerCase(), key: header[2], fields });
  }
  return entries;
}

const bibliography = new Map(parseBibTeX(bibSource).map(entry => [entry.key, entry]));

const mappings = [
  [/Wang_2022/, "wang_limits_2022", "dedicated_source_sensor", "noble_gas_spin_amplifier", "optically_polarized_rubidium_87_electron_spins", "xenon_129_nuclear_spin_amplifier_with_rubidium_readout"],
  [/Almasi_?2020/, "almasi_new_2020", "dedicated_source_sensor", "self_compensating_comagnetometer", "rotatable_iron_shielded_samarium_cobalt_5_electron_spin_source", "rubidium_21_neon_self_compensating_comagnetometer"],
  [/Karshenboim_2011/, "karshenboim_hyperfine_2011", "complementary_experiment", "atomic_hyperfine_spectroscopy"],
  [/Hunter_2013/, "hunter_using_2013", "dedicated_source_sensor", "earth_source_spin_experiment", "earth_geoelectrons", "spin_polarized_torsion_pendulum"],
  [/Hunter_2014/, "hunter_using_2014", "dedicated_source_sensor", "geoelectron_source_spin_experiment", "earth_geoelectrons", "spin_polarized_torsion_pendulum"],
  [/Ficek_2018/, "ficek_constraints_2018", "complementary_experiment", "antiprotonic_helium_spectroscopy"],
  [/Fadeev_2022/, "fadeev_pseudovector_2022", "complementary_experiment", "atomic_spectroscopy_reanalysis"],
  [/Cong_2025/, "cong_improved_2025", "complementary_experiment", "hydrogen_spectroscopy"],
  [/Clayburn_2023/, "clayburn_using_2023", "dedicated_source_sensor", "earth_source_spin_velocity_experiment", "rotating_unpolarized_earth", "spin_polarized_torsion_pendulum"],
  [/Kim_2018/, "kim_experimental_2018", "dedicated_source_sensor", "optically_polarized_vapor", "moving_mass", "optically_polarized_vapor"],
  [/LH Wu_2023/, "wu_spin-mechanical_2023", "dedicated_source_sensor", "spin_mechanical_quantum_sensor", "moving_mass", "spin_mechanical_quantum_chip"],
  [/Wei Xiao_2024/, "xiao_exotic_2024", "complementary_experiment", "alkali_vapor_frequency_shift_noise_analysis"],
  [/DG Wu_2023/, "wu_improved_2023", "dedicated_source_sensor", "ensemble_nv_diamond_magnetometer", "moving_mass", "ensemble_nv_diamond_magnetometer"],
  [/Wu_2021/, "wu_experimental_2022", "dedicated_source_sensor", "atomic_magnetometer_array", "rotating_source_masses", "atomic_magnetometer_array"],
  [/Heckel_2008/, "heckel_preferred-frame_2008", "dedicated_source_sensor", "spin_polarized_torsion_pendulum", "preferred_frame_background", "spin_polarized_torsion_pendulum"],
  [/Ding_2020/, "ding_constraints_2020", "dedicated_source_sensor", "single_nv_center", "moving_mass", "single_nv_center"],
  [/Xiao_2023/, "xiao_femtotesla_2023", "dedicated_source_sensor", "diffusion_optical_pumping_magnetometer", "moving_mass", "atomic_magnetometer"],
  [/Vasilakis_2009/, "vasilakis_limits_2009", "dedicated_source_sensor", "self_compensating_comagnetometer", "polarized_helium_3_nuclear_spins", "potassium_helium_3_self_compensating_comagnetometer"],
  [/Haddock_2018c/, "haddock_search_2018", "dedicated_source_sensor", "neutron_spin_rotation", "bulk_matter", "neutron_spin_rotation"],
  [/Su_2021/, "su_search_2021", "dedicated_source_sensor", "spin_based_amplifier", "polarized_spin_source", "spin_based_amplifier"],
  [/Wei_2022/, "wei_constraints_2022", "dedicated_source_sensor", "spin_based_amplifier", "polarized_spin_source", "spin_based_amplifier"],
  [/451_Wu_2023/, "wu_new_2023", "dedicated_source_sensor", "astronomical_source_reanalysis", "sun_and_moon", "comagnetometer"],
  [/Kimball_2010/, "jackson_kimball_constraints_2010", "complementary_experiment", "spin_exchange_collision_analysis"],
  [/Parnell_2020/, "parnell_search_2020", "dedicated_source_sensor", "neutron_interferometry", "bulk_matter", "neutron_spin_echo_interferometer"],
  [/ledbetter_2013|Ledbetter_2013/, "ledbetter_constraints_2013", "complementary_experiment", "molecular_spectroscopy"],
  [/voronin_2020/i, "voronin_constraint_2020", "complementary_experiment", "neutron_diffraction"],
  [/Ramsey_1979/, "ramsey_tensor_1979", "complementary_experiment", "molecular_beam_magnetic_resonance"],
  [/Terrano_2015/, "terrano_short-range_2015", "dedicated_source_sensor", "spin_polarized_torsion_pendulum", "polarized_electron_source", "spin_polarized_torsion_pendulum"],
  [/Ficek_2017/, "ficek_constraints_2017", "complementary_experiment", "helium_fine_structure_spectroscopy"],
  [/Heckel_2013/, "heckel_limits_2013", "dedicated_source_sensor", "spin_polarized_torsion_pendulum", "polarized_electron_source", "spin_polarized_torsion_pendulum"],
  [/Rong_2018/, "rong_constraints_2018", "dedicated_source_sensor", "single_electron_spin_quantum_sensor", "electron_spin_source", "single_nv_center"],
  [/Kotler_2015/, "kotler_constraints_2015", "dedicated_source_sensor", "trapped_ion_spin_sensor", "electron_spin_source", "trapped_ion"],
  [/Jiao_2019/, "jiao_searching_2020", "complementary_experiment", "molecular_ruler_spectroscopy"],
  [/Ji_2018/, "ji_new_2018", "dedicated_source_sensor", "atomic_magnetometer", "polarized_spin_source", "atomic_magnetometer"],
  [/Ritter_1990/, "ritter_experimental_1990", "dedicated_source_sensor", "polarized_mass_equivalence_test", "polarized_mass", "torsion_balance"]
];

const excluded = [
  "2Vasilakis_2009_1_m_abs_ee",
  "45Haddock_2018a_m_abs_nN",
  "45Haddock_2018b_m_abs_nN copy",
  "23Cong_2025_m_ep_gAgA_90CL",
  "2Cong_2025_m_ep_gAgA_90CL",
  "2Cong_2025_m_ep_gAgA_95CL",
  "3Cong_2025_m_ep_gAgA_90CL",
  "3Cong_2025_m_ep_gAgA_95CL"
];

function pairFor(curve) {
  if (curve.filename.includes("Cong_2025")) return "e-p";
  if (curve.filename.includes("Fadeev_2022_2")) return "e-e+";
  return curve.fermion_pair;
}

function firstAuthorSurname(authors) {
  const first = String(authors || "").split(/\s+and\s+/i)[0].trim();
  return (first.includes(",") ? first.split(",")[0] : first.split(/\s+/).at(-1) || "").replace(/[{}]/g, "").trim();
}

function publication(key) {
  const entry = bibliography.get(key);
  if (!entry) throw new Error(`Missing BibTeX entry: ${key}`);
  const f = entry.fields;
  const doi = f.doi || "";
  const eprint = f.eprint || "";
  const result = {
    citation_key: key,
    type: entry.type,
    title: f.title || "",
    authors_bibtex: f.author || "",
    year: f.year || "",
    journal: f.journal || f.journaltitle || "",
    volume: f.volume || "",
    issue: f.number || f.issue || "",
    pages: f.pages || "",
    doi,
    doi_url: doi ? `https://doi.org/${doi}` : "",
    arxiv: eprint,
    arxiv_url: eprint ? `https://arxiv.org/abs/${eprint.replace(/^arXiv:/i, "")}` : "",
    url: f.url || (doi ? `https://doi.org/${doi}` : "")
  };
  result.first_author = firstAuthorSurname(result.authors_bibtex);
  result.short_citation = [result.first_author ? `${result.first_author} et al.` : "", result.year].filter(Boolean).join(" ");
  return result;
}

const curves = audit.curves
  .filter(curve => !excluded.includes(curve.filename))
  .filter(curve => !curve.filename.includes("Haddock_2018"))
  .concat([{
    chart: "nucleon-nucleon",
    filename: "45Haddock_2018c_m_abs_nN",
    data_file: "Dataset/normalized/gAgA/nucleon-nucleon/45Haddock_2018c_m_abs_nN.csv",
    potential: "V4+5",
    fermion_pair: "n-N"
  }]);

const records = curves.map(curve => {
  if (curve.potential === "astrophysical") {
    return {
      id: curve.filename.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: `Astrophysical · ${pairFor(curve)}`,
      display_label: "Astrophysical",
      data_file: curve.data_file,
      coupling: "gAgA",
      potential: "astrophysical",
      fermion_pair: pairFor(curve),
      method: { category: "astrophysical", technique: "astrophysical_constraints", source: "", sensor: "" },
      references: [publication(reviewKey)],
      review_location: { section: "Axial-vector/Axial-vector interaction gAgA", figure: "Figs. 10–11" },
      curation: { status: "review_only", evidence: ["review comparison figures"] }
    };
  }
  const match = mappings.find(([pattern]) => pattern.test(curve.filename));
  if (!match) throw new Error(`No confirmed mapping for ${curve.filename}`);
  const [, key, category, technique, source = "", sensor = ""] = match;
  const ref = publication(key);
  const confidence = curve.filename.includes("Cong_2025") ? "95%" : "";
  return {
    id: curve.filename.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: `${ref.first_author || curve.filename} ${ref.year}${confidence ? ` · ${confidence} CL` : ""}`,
    display_label: `${ref.first_author || curve.filename} ${ref.year}${confidence ? ` · ${confidence} CL` : ""}`,
    data_file: curve.data_file,
    coupling: "gAgA",
    potential: curve.potential,
    fermion_pair: pairFor(curve),
    confidence_level: confidence,
    method: { category, technique, source, sensor },
    references: [ref],
    review_location: { section: "Axial-vector/Axial-vector interaction gAgA", figure: curve.chart === "lepton-lepton" ? "Fig. 10" : "Fig. 11" },
    curation: {
      status: "confirmed",
      evidence: ["filename", "RMP review gAgA section", "BibTeX record"],
      note: curve.filename.includes("Jiao_2019") ? "Legacy filename retained; the paper was published in 2020."
        : curve.filename.includes("Wu_2021") ? "Legacy filename retained; the paper was published in 2022."
        : curve.filename.includes("Haddock_2018c") ? "Complete replacement dataset selected; earlier partial a/b files are excluded."
        : ""
    }
  };
});

const publications = Object.fromEntries([...new Map(records.flatMap(record => record.references).map(ref => [ref.citation_key, ref]))]);
const output = {
  schema_version: "0.1",
  coupling: "gAgA",
  notice: "Unless otherwise noted, the constraints shown here have been standardized using the interaction conventions adopted in the RMP review and may therefore differ from values presented in the original publications.",
  records
};

fs.mkdirSync(path.join(root, "metadata/generated"), { recursive: true });
fs.mkdirSync(path.join(root, "metadata/reports"), { recursive: true });
fs.writeFileSync(path.join(root, "metadata/generated/gAgA-constraints.json"), JSON.stringify(output, null, 2) + "\n");
fs.writeFileSync(path.join(root, "metadata/generated/gAgA-publications.json"), JSON.stringify(publications, null, 2) + "\n");
fs.writeFileSync(path.join(root, "metadata/reports/gAgA-matching-report.md"), `# gAgA matching report

- Published curves: ${records.length}
- Publication-linked curves: ${records.filter(record => record.curation.status === "confirmed").length}
- Review-only astrophysical curves: ${records.filter(record => record.curation.status === "review_only").length}
- Excluded legacy/partial curves: ${excluded.length}
- Cong 2025 selection: V2+V3, 95% CL only
- Vasilakis selection: V3 neutron-neutron only
- Haddock selection: complete 2018c dataset only

No CSV file was deleted. Exclusions are implemented in the viewer manifest and generated metadata.
`);

console.log(JSON.stringify({
  records: records.length,
  confirmed: records.filter(record => record.curation.status === "confirmed").length,
  review_only: records.filter(record => record.curation.status === "review_only").length,
  publications: Object.keys(publications).length
}, null, 2));
