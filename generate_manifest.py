import os
import json

DIRS = {
    "gAgA": "Dataset/normalized/gAgA",
    "gAgV": "Dataset/normalized/gAgV",
    "gpgp": "Dataset/normalized/gpgp",
    "gpgs": "Dataset/normalized/gpgs",
    "gsgs": "Dataset/normalized/gsgs",
    "gVgV": "Dataset/normalized/gVgV",
    "V1":   "Dataset/normalized/V1",
}

manifest = {}

for group, base in DIRS.items():
    manifest[group] = {}

    for root, dirs, files in os.walk(base):
        for file in files:
            if not file.lower().endswith((".csv", ".tsv", ".txt")):
                continue

            full_path = os.path.join(root, file).replace("\\", "/")
            rel = full_path[len(base):].lstrip("/")

            parts = rel.split("/")
            subfolder = parts[0] if len(parts) > 1 else "(root)"

            label = os.path.splitext(rel)[0]

            if subfolder not in manifest[group]:
                manifest[group][subfolder] = []

            manifest[group][subfolder].append({
                "path": full_path,
                "label": label
            })

with open("datasets_multi.json", "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print("datasets_multi.json generated.")