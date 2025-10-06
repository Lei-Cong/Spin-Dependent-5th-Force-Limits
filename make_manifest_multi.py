#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto-generate a datasets_multi.json manifest for the SDFF multi-chart viewer.
It scans specified group directories (e.g. Dataset/normalized/gAgA, gAgV, ...)
recursively, collects all .csv/.tsv/.txt files, and writes a JSON manifest with
the following structure:

{
  "gAgA": {
    "subfolderA": [
      {"path":"Dataset/normalized/gAgA/subfolderA/file1.csv","label":"file1"},
      {"path":"Dataset/normalized/gAgA/subfolderA/file2.csv","label":"file2"}
    ],
    "subfolderB": [ ... ]
  },
  "gAgV": { ... },
  ...
}

Paths are written RELATIVE to --base (so that index_multi.html served from that
base can fetch them directly). The "subfolder" key is the first-level directory
name under each group (or "(root)" if files are directly under the group).
"""
import os
import json
import argparse
from typing import Dict, List

VALID_EXTS = (".csv", ".tsv", ".txt")

DEFAULT_GROUP_DIRS = {
    "gAgA": "Dataset/normalized/gAgA",
    "gAgV": "Dataset/normalized/gAgV",
    "gpgp": "Dataset/normalized/gpgp",
    "gpgs": "Dataset/normalized/gpgs",
    "gsgs": "Dataset/normalized/gsgs",
    "gVgV": "Dataset/normalized/gVgV",
    "V1":   "Dataset/normalized/V1",
}

def posixpath(path: str) -> str:
    return path.replace("\\", "/")

def first_level_subfolder(group_root: str, file_dir: str) -> str:
    """Return first-level subfolder name under group_root for file_dir.
    If file is directly under group_root, return '(root)'."""
    rel = os.path.relpath(file_dir, group_root)
    rel = posixpath(rel)
    if rel in (".", ""):
        return "(root)"
    return rel.split("/", 1)[0]

def scan_group(base_abs: str, group_key: str, group_rel_dir: str) -> Dict[str, List[Dict]]:
    """Scan a single group directory and return {subfolder: [entries...]}
    where each entry is {"path": <relpath from base>, "label": <stem>}."""
    result: Dict[str, List[Dict]] = {}
    group_root_abs = os.path.join(base_abs, group_rel_dir)
    if not os.path.isdir(group_root_abs):
        print(f"[WARN] Group '{group_key}' dir not found: {group_root_abs}")
        return result

    for dirpath, _, filenames in os.walk(group_root_abs):
        for fn in filenames:
            if not fn.lower().endswith(VALID_EXTS):
                continue
            file_abs = os.path.join(dirpath, fn)
            file_rel_from_base = os.path.relpath(file_abs, base_abs)
            file_rel_from_base = posixpath(file_rel_from_base)

            subfolder = first_level_subfolder(group_root_abs, dirpath)
            label = os.path.splitext(os.path.basename(fn))[0]

            result.setdefault(subfolder, []).append({
                "path": file_rel_from_base,
                "label": label
            })

    for sub in list(result.keys()):
        result[sub] = sorted(result[sub], key=lambda e: (e["path"].lower()))
    return result

def main():
    ap = argparse.ArgumentParser(description="Generate datasets_multi.json for SDFF viewer (multi-group, per-subfolder)")
    ap.add_argument("--base", default=".", help="Web root directory (where index_multi.html will be served). Default: '.'")
    ap.add_argument("--out", default="datasets_multi.json", help="Output JSON filename. Default: datasets_multi.json")
    ap.add_argument("--map", nargs="*", metavar="GROUP=REL_PATH",
                    help=("Override default group-directory mapping, e.g. "
                          "gAgA=Dataset/normalized/gAgA gAgV=Dataset/normalized/gAgV"))
    args = ap.parse_args()

    base_abs = os.path.abspath(args.base)

    group_dirs = dict(DEFAULT_GROUP_DIRS)
    if args.map:
        for item in args.map:
            if "=" not in item:
                raise SystemExit(f"Invalid --map item '{item}'. Expected GROUP=REL_PATH")
            k, v = item.split("=", 1)
            k = k.strip()
            v = v.strip()
            if not k or not v:
                raise SystemExit(f"Invalid --map item '{item}'.")
            group_dirs[k] = v

    manifest: Dict[str, Dict[str, List[Dict]]] = {}
    for key, rel_dir in group_dirs.items():
        manifest[key] = scan_group(base_abs, key, rel_dir)

    out_path = os.path.join(base_abs, args.out)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"[OK] Wrote manifest: {out_path}")
    print(f"[INFO] Groups: {', '.join(sorted(manifest.keys()))}")
    total_files = sum(len(v) for g in manifest.values() for v in g.values())
    print(f"[INFO] Total files: {total_files}")

if __name__ == "__main__":
    main()
