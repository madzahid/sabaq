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

# Para quarters are NOT emitted.
#
# The words are real and this edition prints them, but QUL's rub file cannot
# say WHERE. Measured against the scan on six pages, the line we derive (the
# line the rub's first verse begins on) was wrong on five, by +3, +8, 0, +13,
# -4 and +2 lines — no constant offset, so no correction is possible from this
# data. The page was wrong too on roughly a quarter of a 12-page sample.
#
# A mark in the wrong place on a Mushaf is worse than no mark, so they stay off
# until each of the 90 is read off the printed copy. Ruku, sajdah and manzil
# are unaffected: ruku line and numbers matched the scan on all six pages.



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
        # Above the ع: the ruku's number within its SURAH. Below: its number
        # within the para. Verified on printed page 354, which shows ٥ / ٨ for
        # a ruku whose surah_ruku is 5 and juz_ruku is 8 (its verses_count is
        # also 8, which is what made an earlier ayah-count reading look right).
        rows.append((p, l, "ruku", None, v["surah_ruku_number"], per_juz[j]))

    # ---- sajdah ----------------------------------------------------------
    sj = sqlite3.connect(os.path.join(MD, "quran-metadata-sajda.sqlite"))
    kept = 0
    # The printed copy numbers its sajdahs — printed page 536 reads السجدة ١٣.
    # Renumbered 1..14 after dropping 22:77, so the numbers stay contiguous and
    # match what a reader counts in this edition.
    for _, vk, _ in sj.execute(
            "SELECT sajdah_number, verse_key, sajdah_type FROM sajdah ORDER BY "
            "CAST(substr(verse_key,1,instr(verse_key,':')-1) AS INTEGER), "
            "CAST(substr(verse_key,instr(verse_key,':')+1) AS INTEGER)"):
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
        kept += 1
        rows.append((p, l, "sajdah", "السَّجْدَة", None, kept))

    # ---- para quarters ---------------------------------------------------
    # ---- para quarters ------------------------------------------------
    #
    # QUL embeds the division marks in the ayah marker itself as private-use
    # glyphs: U+F64C = الربع, U+F64D = النصف, U+F64E = الثلاثة. That is the
    # authoritative position, and it needs no derivation from the rub file.
    #
    # Cross-checked against 50 marks measured independently off the printed
    # scan by template-matching the three words in the margins: 48 agreed.
    # The 2 the glyphs lack (printed 124 thalatha, printed 534 rub) are taken
    # from that scan measurement, giving a complete 90.
    #
    # This edition prints these in the MARGIN, not inline — src/db/quran.ts
    # strips the glyph from the rendered marker so it does not appear twice.
    GLYPH_KIND = {"\uf64c": "rub", "\uf64d": "nisf", "\uf64e": "thalatha"}
    LABEL = {"rub": "الرَّبْع", "nisf": "النِّصْف", "thalatha": "الثَّلٰثَة"}

    seen = set()
    for wid, text in db.execute("SELECT id, text FROM words WHERE is_marker = 1"):
        for ch, kind in GLYPH_KIND.items():
            if ch in text:
                p_, l_ = locate(wid)
                if p_ is None:
                    continue
                rows.append((p_, l_, kind, LABEL[kind], None, None))
                seen.add((p_, kind))

    # Fill only where a para has no glyph for that kind, using the scan
    # measurement. Guarded by para, not by page: adding blindly produced 31
    # rubs because the glyph for that para sat on a neighbouring page.
    have = {(page_juz[p_], k) for p_, k in seen}
    for page_, line_, kind in ((123, 9, "thalatha"), (533, 8, "rub")):
        if (page_juz[page_], kind) not in have:
            rows.append((page_, line_, kind, LABEL[kind], None, None))

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
