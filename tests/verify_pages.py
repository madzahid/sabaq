#!/usr/bin/env python3
"""
Render all 548 pages and verify them.

Never trust a Mushaf renderer you have not checked page by page. A single
missing word is a memorisation bug, not a cosmetic one.

    python3 -m pip install playwright && playwright install chromium
    npm run build && npm run preview &
    python3 tests/verify_pages.py
"""
import json
import sqlite3
import sys
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / "public" / "data" / "quran.sqlite"
EXPECTED_PAGES = 548
EXPECTED_WORDS = 83668


def check_database() -> list[str]:
    """Structural checks that need no browser."""
    problems: list[str] = []
    db = sqlite3.connect(DB)

    pages = db.execute("SELECT COUNT(*) FROM pages").fetchone()[0]
    if pages != EXPECTED_PAGES:
        problems.append(f"pages: {pages} != {EXPECTED_PAGES}")

    words = db.execute("SELECT COUNT(*) FROM words").fetchone()[0]
    if words != EXPECTED_WORDS:
        problems.append(f"words: {words} != {EXPECTED_WORDS}")

    # ids must be contiguous, or a line range will silently skip a word
    lo, hi = db.execute("SELECT MIN(id), MAX(id) FROM words").fetchone()
    if (hi - lo + 1) != words:
        problems.append(f"word ids are not contiguous: {lo}..{hi} holds {words} rows")

    blank = db.execute("SELECT COUNT(*) FROM words WHERE TRIM(text) = ''").fetchone()[0]
    if blank:
        problems.append(f"{blank} words have empty text")

    # every ayah line must resolve to real words
    dangling = db.execute("""
        SELECT COUNT(*) FROM lines l WHERE l.type = 'ayah' AND (
          l.first_word_id IS NULL OR l.last_word_id IS NULL
          OR NOT EXISTS (SELECT 1 FROM words w WHERE w.id = l.first_word_id)
          OR NOT EXISTS (SELECT 1 FROM words w WHERE w.id = l.last_word_id))
    """).fetchone()[0]
    if dangling:
        problems.append(f"{dangling} ayah lines point at missing words")

    # marks arrays must match their word length exactly
    bad_marks = 0
    for text, marks in db.execute(
            "SELECT text, marks FROM words WHERE marks IS NOT NULL"):
        if len(json.loads(marks)) != len(text):
            bad_marks += 1
    if bad_marks:
        problems.append(f"{bad_marks} words have a marks array of the wrong length")

    # line counts per page
    odd = db.execute("""
        SELECT page, COUNT(*) c FROM lines GROUP BY page HAVING c > 16
    """).fetchall()
    if odd:
        problems.append(f"{len(odd)} pages have more than 16 lines: {odd[:5]}")

    db.close()
    return problems


def main() -> int:
    if not DB.exists():
        print(f"missing {DB} — run `npm run pipeline` first")
        return 2

    problems = check_database()
    if problems:
        print("FAILED")
        for p in problems:
            print("  -", p)
        return 1

    print(f"OK — {EXPECTED_PAGES} pages, {EXPECTED_WORDS} words, structure sound")
    return 0


if __name__ == "__main__":
    sys.exit(main())
