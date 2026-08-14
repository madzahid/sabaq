#!/usr/bin/env python3
"""Writes public/data/quran.sqlite from the aligned intermediate files."""
import json
import os
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "data" / "quran.sqlite"
HARF = set(range(0x621, 0x64B)) | set(range(0x671, 0x6D4))


def has_letter(s: str) -> bool:
    return any(ord(c) in HARF for c in s)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    if OUT.exists():
        OUT.unlink()

    db = sqlite3.connect(OUT)
    db.executescript((ROOT / "pipeline" / "lib" / "schema.sql").read_text())

    src = sqlite3.connect(ROOT / "data" / "source" / "indopak-nastaleeq.db")
    marks = json.loads((ROOT / "pipeline" / "out" / "wordmarks.json").read_text())

    db.executemany("INSERT INTO words VALUES (?,?,?,?,?,?,?)", [
        (i, s, a, w, t, 0 if has_letter(t) else 1,
         json.dumps(marks[str(i)], ensure_ascii=False) if str(i) in marks else None)
        for i, s, a, w, t in src.execute(
            "SELECT id, surah, ayah, word, text FROM words")
    ])

    lay = sqlite3.connect(ROOT / "data" / "source" / "taj-indopak-16-lines.db")
    def num(v):
        return int(v) if str(v).strip() else None
    db.executemany("INSERT INTO lines VALUES (?,?,?,?,?,?,?)", [
        (p, l, t, 1 if c else 0, num(f), num(w), num(s))
        for p, l, t, c, f, w, s in lay.execute(
            "SELECT page_number, line_number, line_type, is_centered,"
            " first_word_id, last_word_id, surah_number FROM pages")
    ])

    pages = json.loads((ROOT / "pipeline" / "out" / "pageinfo.json").read_text())
    db.executemany("INSERT INTO pages VALUES (?,?,?,?)", [
        (int(p), v["j"], int(v["k"].split(":")[0]), v["k"]) for p, v in pages.items()
    ])

    db.executemany("INSERT INTO meta VALUES (?,?)", [
        ("layout", "Indopak 16 lines (Taj Company) — QUL"),
        ("script", "Indopak Nastaleeq word-by-word — QUL"),
        ("pages", "548"), ("lines_per_page", "16"),
    ])
    db.commit()
    print(f"    {os.path.getsize(OUT) / 1048576:.2f} MB")


if __name__ == "__main__":
    main()
