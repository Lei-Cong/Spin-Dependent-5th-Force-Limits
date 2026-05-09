import json
import os
import feedparser
from urllib.parse import quote

SEARCH_QUERY = (
    '"spin-dependent" OR '
    '"fifth force" OR '
    '"exotic interaction" OR '
    '"axion-mediated" OR '
    '"new boson" OR '
    '"precision measurement" OR '
    '"comagnetometer" OR '
    '"electric dipole moment" OR '
    '"atomic parity violation"'
)

ARXIV_URL = (
    "http://export.arxiv.org/api/query?"
    f"search_query=all:{quote(SEARCH_QUERY)}"
    "&sortBy=submittedDate"
    "&sortOrder=descending"
    "&max_results=10"
)

TAG_KEYWORDS = {
    "fifth force": ["fifth force", "new force"],
    "spin-dependent": ["spin-dependent", "spin dependent"],
    "axion": ["axion", "alp"],
    "dark matter": ["dark matter"],
    "comagnetometer": ["comagnetometer"],
    "EDM": ["electric dipole moment", "edm"],
    "APV": ["atomic parity violation", "parity violation"],
    "spectroscopy": ["spectroscopy", "clock", "frequency"],
}


def clean_text(text):
    return " ".join(text.replace("\n", " ").split())


def infer_tags(title, summary):
    text = f"{title} {summary}".lower()
    tags = []

    for tag, keywords in TAG_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            tags.append(tag)

    return tags if tags else ["related"]


def main():
    feed = feedparser.parse(ARXIV_URL)

    papers = []

    for entry in feed.entries:
        title = clean_text(entry.title)
        summary = clean_text(entry.summary)

        papers.append({
            "title": title,
            "authors": ", ".join(author.name for author in entry.authors),
            "published": entry.published[:10],
            "summary": summary[:700] + "...",
            "link": entry.link,
            "tags": infer_tags(title, summary),
        })

    os.makedirs("data", exist_ok=True)

    with open("data/latest_arxiv.json", "w", encoding="utf-8") as f:
        json.dump(papers, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(papers)} papers to data/latest_arxiv.json")


if __name__ == "__main__":
    main()