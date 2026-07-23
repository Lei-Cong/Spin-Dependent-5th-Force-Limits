---
layout: default
title: API
description: Versioned machine-readable access to the SD5thF constraint database.
---

# SD5thF API

The SD5thF API is a versioned, read-only static interface for research
software, automated agents, and reproducible data reuse.

Current version: **v1**

The `v1` field names and endpoint paths are stable. Additive metadata fields may
be introduced without changing the version; incompatible changes will be
published under a new version such as `v2`.

The API version is not the scientific database release number. The API version
identifies the machine-interface contract, whereas citable database releases
are independently versioned and archived through the Zenodo DOI below. New
records and compatible metadata additions therefore do not by themselves
require an API version change.

- [API index](./v1/index.json)
- [Constraint catalog](./v1/catalog.json)
- [Record schema](./v1/schema.json)
- [Citation metadata](./v1/citation.json)
- [Dataset JSON-LD](./v1/dataset.jsonld)

Coupling endpoints:

- [gAgV](./v1/couplings/gAgV.json)
- [gAgA](./v1/couplings/gAgA.json)
- [gVgV](./v1/couplings/gVgV.json)
- [gpgs](./v1/couplings/gpgs.json)
- [gpgp](./v1/couplings/gpgp.json)
- [gsgs](./v1/couplings/gsgs.json)
- [V1 comparisons](./v1/couplings/V1.json)

## Citation and attribution

When using numerical limits, metadata, or figures derived from this resource,
cite the SD5thF database version and the relevant primary publication or
publications listed in the individual record.

The full-resolution CSV is authoritative. Plot bundles are optimized for
interactive display and should not be used for numerical reuse.

The catalog, record endpoints, plot bundles, JSON-LD, and machine-readable
citation guidance are regenerated automatically from the website manifest and
metadata before every GitHub Pages deployment.

Database DOI: [10.5281/zenodo.14572652](https://doi.org/10.5281/zenodo.14572652)

Questions or corrections may be sent to `congllzu@gmail.com` with the subject
“Correction/Question about SDFF dataset”.
