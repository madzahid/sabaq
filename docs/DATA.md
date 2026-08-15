# Data notes

## Sources

| Dataset | Source | Rows |
|---|---|---|
| 16-line page layout | QUL — *Indopak 16 lines* | 8,742 lines / 548 pages |
| Indo-Pak word text | QUL — *Indopak Nastaleeq, word by word* | 83,668 words |
| Tajweed annotations | Uthmani tajweed script (via `alfurqan`) | 59,877 spans |

## Alignment

Tajweed rules are published against **Uthmani** text. The Mushaf we render is
**Indo-Pak**. The two scripts do not tokenise the same way, so the rules have to
be transferred.

    6,229 / 6,236 ayahs aligned      99.89%
    77,835 marks placed
    17 marks could not be located
    48,399 words carry at least one colour

## The 7 ayahs still to review

Word counts differ between the two scripts here. They render correctly but
carry no tajweed colour until someone checks them by hand.

    2:181    uthmani 13   indopak 14
    13:37    uthmani 19   indopak 20
    34:8     uthmani 17   indopak 16
    37:130   uthmani  4   indopak  3
    (plus 3 more — see pipeline output)

## Edition difference

QUL's Taj layout puts **29:53** at the top of page 363. The printed PDF this
project was modelled on starts that page at **29:45**. Same surah, same juz, a
few ayahs apart — Taj has printed more than one edition. Confirm against the
physical Mushaf the student actually uses before treating page numbers as
authoritative.

## Verification

`tests/verify_pages.py` renders all 548 pages headless and asserts:

- every page has exactly 16 lines (except pages with surah headers)
- no line is empty
- word ids are contiguous across the page
- no word renders as an empty string

Run it before any release.

## Margin markers — ruku, sajdah, para quarters (UNRESOLVED)

`quran.sqlite` contains no ruku, sajdah, rub or manzil markers, because neither
source database carries them: `taj-indopak-16-lines.db` has layout only and
`indopak-nastaleeq.db` has word text only. QUL publishes them separately, and
those files are extracted (gitignored) under `data/source/metadata/`.

Mapping them is solved: every marker's first verse resolves to a word id, and
every word id resolves to a `(page, line_no)` through the existing line spans.
A dry run placed **558/558 rukus and 15/15 sajdahs** on a page and line.

What is NOT solved is whether QUL's data describes *this* edition. Three
discrepancies must be settled against the printed Taj copy before any of it is
rendered — a wrong marker on a Mushaf is worse than a missing one.

### 1. Sajdah — QUL ships 15, Indo-Pak marks 14

The extra entry is **22:77**, the second sajdah in Surah Al-Hajj: marked in
Shafi'i mushafs, not in Hanafi ones, which hold that Al-Hajj has only 22:18.
It is numbered 15 and appended after 96:19, out of Quranic order, which
suggests it was added to a base list of 14.

**Decision: drop 22:77, mark 14.** Pending confirmation from the printed copy.

QUL's `sajdah_type` column (4 `required`, 11 `optional`) does not reflect the
Hanafi position, where all sajdah tilawah are wajib. It must not drive
rendering for this edition.

### 2. Ruku — file has 558, QUL's own page says "approximately 540"

Their description contradicts their data, and Indo-Pak mushafs conventionally
mark 540. Until the printed copy is counted, 18 ruku signs are unaccounted for.

### 3. Rub — wrong scheme

The file has 240 rows = 60 hizb x 4, the Madani rub-al-hizb used in Saudi
mushafs. Indo-Pak margins mark **ربع / نصف / ثلاثہ within each para** — 3 per
para, 90 total. These can likely be derived as rubs `8(p-1)+3, +5, +7` for para
`p`, which yields para 1 quarters at 2:44, 2:75 and 2:106 — **unverified**.

### 4. Page numbering is one behind the printed copy — RESOLVED

Verified against `16-line-quran-tajwid-colored.pdf` (555 PDF pages; the Quranic
text occupies printed pages 2-549):

| Landmark | Printed | Ours |
|---|---|---|
| Al-Fatiha | 2 | 1 |
| Al-Baqarah 2:1 | 3 | 2 |
| Para 2 (2:142, سیقول) | 21 | 20 |
| Last text page (Al-Falaq, An-Nas, دعاء ختم القرآن) | 549 | 548 |

Printed pages 2..549 inclusive = 548 pages, exactly our 1..548. **No page is
missing.** The printed book numbers its title page as 1 and begins the Quranic
text on printed page 2.

Fix: `meta.page_offset = 1`, written by `pipeline/lib/write_db.py` and applied
at display time only via `printedPage()` / `internalPage()` in `src/db/quran.ts`.
The layout and text keep their own indices and are never renumbered. Because it
lives in `meta`, a second Taj edition only needs a different value.

### 5. Ruku counts — QUL appears to match this edition

Each surah band in the scan prints `رکوعها`. Checked against QUL's ruku file:
Al-Fatiha 1 = 1, Al-Baqarah 40 = 40. So QUL's total of 558 is more trustworthy
than the "approximately 540" in QUL's own page description. More surah bands
should be spot-checked before rendering.

Marker placement observed in the scan: the ع sits in the **outer margin at the
end of its ruku**, with its number beneath (printed page 549 shows ع ٣٨ and
ع ٣٩). Each surah band also carries `ایاتها` and the revelation order.
