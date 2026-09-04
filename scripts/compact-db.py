#!/usr/bin/env python3
"""
Shrinks public/data/quran.sqlite after a pipeline run.

Two changes, both measured on the real database:

  marks column    3.59 MB -> 0.35 MB
    It held JSON — one rule plus six nulls per word, stored as
    ["ham_wasl",null,null,null,null,null,null]. It now holds one character per
    letter, "h......", decoded by decodeMarks() in src/lib/tajweed.ts.

    RULE ORDER BELOW IS THE FORMAT. It must match RULE_CHARS in that file
    exactly. Reordering or removing a rule silently moves every tajweed colour
    onto the wrong letter — change both in the same commit or not at all.

  idx_words_ayah  1.09 MB -> 0
    Nothing queries words by (surah, ayah): every read is by id, or a MIN(id)
    group. The index was pure download weight for the reader.

Net: 8.49 MB -> 3.45 MB raw, 2.06 MB -> 1.31 MB gzipped.

Run after `npm run pipeline`, before `npm run build`. Idempotent — a database
that is already compact is left untouched.
"""
import json
import os
import sqlite3
import sys

RULES = [
    'ghunnah', 'idgham_ghunnah', 'idgham_shafawi', 'ikhafa', 'ikhafa_shafawi',
    'iqlab', 'qalaqah', 'slnt', 'ham_wasl', 'laam_shamsiyah',
    'idgham_wo_ghunnah', 'idgham_mutajanisayn', 'idgham_mutaqaribayn',
    'madda_normal', 'madda_permissible', 'madda_obligatory', 'madda_necessary',
]
CH = {r: chr(ord('a') + i) for i, r in enumerate(RULES)}

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(root, 'public', 'data', 'quran.sqlite')
if not os.path.exists(db_path):
    sys.exit('public/data/quran.sqlite not found — run npm run pipeline first')

before = os.path.getsize(db_path)
db = sqlite3.connect(db_path)

sample = db.execute(
    "SELECT marks FROM words WHERE marks IS NOT NULL LIMIT 1").fetchone()
if sample and not sample[0].startswith('['):
    print('already compact — nothing to do')
    sys.exit(0)

rows = db.execute("SELECT id, marks FROM words WHERE marks IS NOT NULL").fetchall()
updates = []
for wid, raw in rows:
    arr = json.loads(raw)
    for r in arr:
        if r is not None and r not in CH:
            sys.exit(f'unknown tajweed rule {r!r} — add it to RULES *and* to '
                     f'RULE_CHARS in src/lib/tajweed.ts, at the end')
    enc = ''.join('.' if r is None else CH[r] for r in arr)
    # A word with no rule anywhere needs no row of dots.
    updates.append((None if set(enc) == {'.'} else enc, wid))

db.executemany("UPDATE words SET marks = ? WHERE id = ?", updates)
db.execute("DROP INDEX IF EXISTS idx_words_ayah")
db.commit()
db.execute("VACUUM")
db.close()

after = os.path.getsize(db_path)
mb = lambda n: n / 1048576
print(f'quran.sqlite: {mb(before):.2f} MB -> {mb(after):.2f} MB '
      f'({mb(before - after):.2f} MB saved)')
