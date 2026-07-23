# Constraint metadata pilot

Before adding another coupling type to the public explorer, follow the
[coupling onboarding checklist](./COUPLING-ONBOARDING-CHECKLIST.md). It makes
fermion-pair colours, compact legends, literature cards, DOI links, data-file
auditing, and release verification mandatory rather than optional.

This directory contains the first metadata pilot for the `gAgV` dataset.

- `schema.yml` defines the compact, public-facing record structure.
- `drafts/gAgV-candidate-matches.yml` contains machine-generated candidate mappings and is not yet authoritative.
- `generated/gAgV-publications.json` contains bibliography fields resolved from `MyLibrary.bib`.
- `reports/gAgV-matching-report.md` summarizes matches and items requiring review.
- `reports/bibliography-audit.md` checks citation-key consistency between the review LaTeX and `MyLibrary.bib`.

The existing CSV files and plotting manifest remain unchanged. Candidate records become authoritative only after scientific review.
