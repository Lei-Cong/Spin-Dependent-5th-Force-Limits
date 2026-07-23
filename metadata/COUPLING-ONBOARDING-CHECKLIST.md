# Coupling onboarding checklist

Every new coupling type must pass this checklist before it is linked from the
public Limits Explorer.

## Dataset inventory and naming

- Inventory every displayed CSV and identify its interaction potential and
  ordered fermion pair.
- Use compact ordered-pair symbols such as `e-N`, `N-e`, `n-N`, and `N-N`.
- Record filename corrections, joined replacements, excluded partial files,
  and confidence-level selections in
  `metadata/reports/data-file-change-log.md`.

## Literature metadata

- Match each experimental curve to its BibTeX citation key.
- Include a DOI or stable URL and complete journal, volume, issue,
  pages/article number, and year.
- Link review-only Combined and astrophysical constraints to the RMP review
  without inventing a separate primary-paper match.
- Add source and sensor only for dedicated fifth-force experiments.
- Add a visible note when a curve is converted through a later paper or review.

## Viewer encoding

- Interaction potential determines line style.
- The most represented experimental potential uses a solid line; other
  potentials use distinct line styles.
- Ordered fermion pair determines curve colour.
- Combined and astrophysical/cosmological constraints use distinct gray solid
  lines.
- Fermion-pair filter chips use the same colours as their curves.
- Potential filter chips display the corresponding line styles.

## Legend naming

- Use compact `Author year · pair`, for example `Hunter 2013 · e-e`.
- Never spell out fermion names in plot legends.
- Remove `et al.` and unnecessary initials from plot legends while retaining
  fuller authorship in the metadata card.
- Keep the pair suffix when one paper contributes more than one curve.
- Collapse multi-segment Combined constraints to one legend entry per pair.

## Metadata-card interaction

- Clicking a curve, plot legend item, or checklist name opens the matching
  right-hand record.
- The card shows potential, ordered pair, applicable method/source/sensor
  fields, complete publication details, and a working DOI link.
- The CSV download resolves to the exact displayed data file.
- The full-record dialog contains the same metadata and correction guidance.

## Release verification

- Every manifest path has exactly one metadata record.
- Every non-review-only record has a DOI or stable URL.
- Rendered traces with different fermion pairs visibly use different colours.
- Curve, legend, and checklist entry routes all open the correct card.
- Upload the viewer HTML, manifest, metadata JSON, renamed CSV files, and
  changed scripts/styles together; updating only the HTML is insufficient.
- Bump manifest and metadata cache-version query strings for every release.
