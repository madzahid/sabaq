# Data notes

## Sources

| Dataset | Source | Rows |
|---|---|---|
| 16-line page layout | QUL — *Indopak 16 lines (Taj company)* | 8,742 lines / 548 pages |
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
