import json
import os
import time
import feedparser
from urllib.parse import quote

MAX_RESULTS_PER_QUERY = 30
FINAL_N = 10

QUERIES = [
    'all:"spin-dependent force"',
    'all:"spin dependent force"',
    'all:"spin-dependent interaction"',
    'all:"exotic spin-dependent interaction"',
    'all:"fifth force" AND all:spin',
    'all:"monopole-dipole"',
    'all:"dipole-dipole" AND all:axion',
    'all:"axion-mediated"',
    'all:"axionlike" AND all:spin',
    'all:"ultralight boson" AND all:spin',
    'all:"new boson" AND all:spin',
    'all:"new force" AND all:spin',
    'all:"comagnetometer" AND all:"dark matter"',
    'all:"electric dipole moment" AND all:axion',
    'all:"atomic parity violation" AND all:"new physics"',
]

STRONG_KEYWORDS = [
    "spin-dependent force",
    "spin dependent force",
    "spin-dependent interaction",
    "spin dependent interaction",
    "exotic spin-dependent",
    "fifth force",
    "monopole-dipole",
    "dipole-dipole",
    "axion-mediated",
    "axion mediated",
    "ultralight boson",
    "new boson",
    "new force",
]

MEDIUM_KEYWORDS = [
    "axion",
    "alp",
    "axionlike",
    "dark matter",
    "comagnetometer",
    "electric dipole moment",
    "edm",
    "atomic parity violation",
    "parity violation",
    "spectroscopy",
    "clock",
    "frequency shift",
    "yukawa",
]

EXCLUDE_KEYWORDS = [
    "spin-dependent transport",
    "spin dependent transport",
    "spin-dependent scattering",
    "spin dependent scattering",
    "spin-dependent cross section",
    "spin-orbit torque",
    "spintronics",
    "magnetic skyrmion",
]

TAG_KEYWORDS = {
    "fifth force": ["fifth force", "new force"],
    "spin-dependent": ["spin-dependent", "spin dependent"],
    "axion": ["axion", "alp", "axionlike"],
    "dark matter": ["dark matter"],
    "monopole-dipole": ["monopole-dipole"],
    "dipole-dipole": ["dipole-dipole"],
    "comagnetometer": ["comagnetometer"],
    "EDM": ["electric dipole moment", "edm"],
    "APV": ["atomic parity violation", "parity violation"],
    "spectroscopy": ["spectroscopy", "clock", "frequency"],
    "Yukawa": ["yukawa"],
}


def clean_text(text):
    return " ".join(text.replace("\n", " ").split())


def arxiv_url(query):
    return (
        "https://export.arxiv.org/api/query?"
        f"search_query={quote(query)}"
        "&sortBy=submittedDate"
        "&sortOrder=descending"
        f"&max_results={MAX_RESULTS_PER_QUERY}"
    )


def infer_tags(title, summary):
    text = f"{title} {summary}".lower()
    tags = []
    for tag, keywords in TAG_KEYWORDS.items():
        if any(k in text for k in keywords):
            tags.append(tag)
    return tags if tags else ["related"]


def relevance_score(title, summary):
    text = f"{title} {summary}".lower()

    if any(k in text for k in EXCLUDE_KEYWORDS):
        return -10

    score = 0

    for k in STRONG_KEYWORDS:
        if k in text:
            score += 5

    for k in MEDIUM_KEYWORDS:
        if k in text:
            score += 2

    # Bonus: likely directly relevant to your database
    if ("spin" in text and ("force" in text or "interaction" in text)):
        score += 4

    if ("axion" in text and ("spin" in text or "force" in text or "interaction" in text)):
        score += 3

    if ("yukawa" in text and ("spin" in text or "boson" in text)):
        score += 3

    return score


def main():
    papers_by_id = {}

    for query in QUERIES:
        print(f"Query: {query}")
        feed = feedparser.parse(arxiv_url(query))

        for entry in feed.entries:
            title = clean_text(entry.title)
            summary = clean_text(entry.summary)
            link = entry.link
            arxiv_id = link.split("/abs/")[-1]

            score = relevance_score(title, summary)

            if score <= 0:
                continue

            papers_by_id[arxiv_id] = {
                "title": title,
                "authors": ", ".join(author.name for author in entry.authors),
                "published": entry.published[:10],
                "summary": summary[:700] + "...",
                "link": link,
                "tags": infer_tags(title, summary),
                "score": score,
            }

        time.sleep(3)  # polite delay for arXiv API

    papers = sorted(
        papers_by_id.values(),
        key=lambda p: (p["score"], p["published"]),
        reverse=True
    )[:FINAL_N]

    os.makedirs("data", exist_ok=True)

    with open("data/latest_arxiv.json", "w", encoding="utf-8") as f:
        json.dump(papers, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(papers)} papers to data/latest_arxiv.json")


if __name__ == "__main__":
    main()