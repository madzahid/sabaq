# Pipeline

Runs on a dev machine, never in the app. Turns the two QUL downloads into
`public/data/quran.sqlite`.

## Inputs — put these in `data/source/`

Both from https://qul.tarteel.ai (free, no account needed):

| File | Where |
|---|---|
| `taj-indopak-16-lines.db` | Resources → Mushaf layouts → *Indopak 16 lines layout (Taj company)* |
| `indopak-nastaleeq.db` | Resources → Quran script → *Indopak Nastaleeq script — Word by Word* |

They are gitignored because they are third-party data; the built database is
committed instead so the app runs straight after `npm install`.

## Run

    npm run pipeline

## What it does

1. Reads the Uthmani tajweed-annotated text (from the `alfurqan` package) and
   parses its markup with a **stack**, not a regex — the tags nest.
2. Tokenises both scripts identically: split on whitespace, split again after a
   waqf mark that is followed by a letter, then merge any single-letter token
   into the next one.
3. Drops the final "word" of each ayah on the Indo-Pak side — that is the
   ayah-number glyph, not a word.
4. For each rule in an Uthmani word, records *the Nth occurrence of letter X*
   and finds the same occurrence in the Indo-Pak word. Madd rules that attach to
   `ـٰ` fall back to the nearest alif/waw/ya, since Indo-Pak does not write it.
5. Writes `words`, `lines`, `pages` and `meta` tables.

## Expected output

    words 83668 | markers 6238 | coloured 48399 | lines 8742 | pages 548
    alignment 6229/6236 = 99.89%

If alignment drops below that, something in the tokeniser changed. Check
`docs/DATA.md` before "fixing" anything.
