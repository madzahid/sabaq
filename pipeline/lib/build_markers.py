"""
Margin markers — ruku, sajdah and the para quarters.

None of this is in the layout or word-text sources; QUL publishes it separately
and the files live (gitignored) in data/source/metadata/. Every marker resolves
to a verse key, every verse key to a word id, and every word id to a
(page, line_no) through the line spans already in quran.sqlite.

Everything here was checked against the printed 16-line scan. See docs/DATA.md.
"""
import bisect, json, os, sqlite3, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
DB   = os.path.join(ROOT, "public", "data", "quran.sqlite")
MD   = os.path.join(ROOT, "data", "source", "metadata")

# Hanafi / Indo-Pak mushafs mark 14 sajdahs. QUL ships 15: the extra is the
# second sajdah in Surah Al-Hajj, marked in Shafi'i copies but not this one.
SAJDAH_EXCLUDE = {"22:77"}

# A para is 8 rubs. Its quarter marks fall on the 3rd, 5th and 7th, printed as
# words in the outer margin. Verified: para 1 gives al-Rub on printed page 8
# and al-Thalatha on printed page 16, both confirmed against the scan.
QUARTERS = {3: ("rub", "الرَّبْع"), 5: ("nisf", "النِّصْف"), 7: ("thalatha", "الثَّلٰثَة")}


def main():
    db = sqlite3.connect(DB)

    spans = list(db.execute(
        "SELECT page, line_no, first_word_id, last_word_id FROM lines "
        "WHERE type='ayah' AND first_word_id IS NOT NULL ORDER BY first_word_id"))
    starts = [s[2] for s in spans]

    def locate(wid):
        i = bisect.bisect_right(starts, wid) - 1
        if i >= 0 and spans[i][2] <= wid <= spans[i][3]:
            return spans[i][0], spans[i][1]
        return None, None

    def word(vk, last=False):
        s, a = vk.split(":")
        fn = "MAX" if last else "MIN"
        cond = "" if last else " AND is_marker=0"
        row = db.execute(
            f"SELECT {fn}(id) FROM words WHERE surah=? AND ayah=?{cond}", (int(s), int(a))
        ).fetchone()
        return row[0] if row else None

    page_juz = dict(db.execute("SELECT page, juz FROM pages"))
    rows = []

    # ---- ruku: the sign is printed where the ruku ENDS -------------------
    with open(os.path.join(MD, "quran-metadata-ruku.json"), encoding="utf-8") as f:
        ruku = json.load(f)
    per_juz = {}
    for v in sorted(ruku.values(), key=lambda v: v["ruku_number"]):
        p, l = locate(word(v["last_verse_key"], last=True))
        if p is None:
            continue
        j = page_juz[p]
        per_juz[j] = per_juz.get(j, 0) + 1
        # Above the ع: how many ayahs the ruku holds. Below: its number within
        # the para. Verified on printed page 549 (5/38 for Al-Falaq, 6/39 for
        # An-Nas) — the only page where the scan was legible enough to read.
        rows.append((p, l, "ruku", None, v["verses_count"], per_juz[j]))

    # ---- sajdah ----------------------------------------------------------
    sj = sqlite3.connect(os.path.join(MD, "quran-metadata-sajda.sqlite"))
    kept = 0
    for _, vk, _ in sj.execute("SELECT sajdah_number, verse_key, sajdah_type FROM sajdah"):
        if vk in SAJDAH_EXCLUDE:
            continue
        p, l = locate(word(vk, last=True))
        if p is None:
            continue
        # The printed copy draws a rule above the sajdah words with السجدة
        # over it, inside the text area. Reproducing that needs word-level
        # ranges we do not have, so the word goes in the margin instead —
        # unmistakable, and it avoids U+06E9 (۩), whose font coverage is poor
        # enough that it renders as a stray arrow on many devices.
        rows.append((p, l, "sajdah", "السَّجْدَة", None, None))
        kept += 1

    # ---- para quarters ---------------------------------------------------
    rb = sqlite3.connect(os.path.join(MD, "quran-metadata-rub.sqlite"))
    for n, vk in rb.execute("SELECT rub_number, first_verse_key FROM rub ORDER BY rub_number"):
        pos = ((n - 1) % 8) + 1
        if pos not in QUARTERS:
            continue
        kind, label = QUARTERS[pos]
        p, l = locate(word(vk))
        if p is None:
            continue
        rows.append((p, l, kind, label, None, None))

    # ---- manzil: a property of the page, printed at its foot -------------
    mz = sqlite3.connect(os.path.join(MD, "quran-metadata-manzil.sqlite"))
    bounds = []
    for n, fv in mz.execute("SELECT manzil_number, first_verse_key FROM manzil ORDER BY manzil_number"):
        p, _ = locate(word(fv))
        bounds.append((p or 1, n))
    manzil_of = {}
    for page in range(1, 549):
        cur = 1
        for start, n in bounds:
            if page >= start:
                cur = n
        manzil_of[page] = cur

    db.execute("DROP TABLE IF EXISTS markers")
    db.execute("""CREATE TABLE markers (
        page    INTEGER NOT NULL,
        line_no INTEGER NOT NULL,
        kind    TEXT    NOT NULL,
        label   TEXT,
        n_above INTEGER,
        n_below INTEGER)""")
    db.executemany("INSERT INTO markers VALUES (?,?,?,?,?,?)", rows)
    db.execute("CREATE INDEX idx_markers_page ON markers (page)")

    db.execute("DROP TABLE IF EXISTS page_manzil")
    db.execute("CREATE TABLE page_manzil (page INTEGER PRIMARY KEY, manzil INTEGER NOT NULL)")
    db.executemany("INSERT INTO page_manzil VALUES (?,?)", sorted(manzil_of.items()))

    # write_db.py is the canonical place for this, but a full pipeline rebuild
    # is expensive and this step is cheap, so make it self-sufficient: a
    # database that has markers should always know its page offset too.
    db.execute("INSERT OR REPLACE INTO meta VALUES ('page_offset','1')")
    db.execute("INSERT OR REPLACE INTO meta VALUES ('sajdahs', ?)", (str(kept),))
    db.execute("INSERT OR REPLACE INTO meta VALUES ('rukus', ?)",
               (str(sum(1 for r in rows if r[2] == 'ruku')),))
    db.commit()

    from collections import Counter
    c = Counter(r[2] for r in rows)
    print("markers written:", dict(c))
    print("sajdahs kept:", kept, "(22:77 excluded — Hanafi)")


if __name__ == "__main__":
    main()
