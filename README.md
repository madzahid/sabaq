# Sabaq · سبق

A Quran reader built for memorisation — and for the person sitting across from
the child, listening.

<img src="docs/page-363.png" width="420" alt="Page 363">

## What it is

A pixel-faithful **16-line Indo-Pak Mushaf** (Taj Company layout) with
colour-coded tajweed, where every word is individually addressable. That last
part is what makes the real features possible:

- **حفظ موڈ** — blur the page, recall from memory, tap a word to check
- **لقمہ marking** *(next)* — a teacher or parent taps the word where the
  student stumbled, in one tap, without breaking their flow
- Session recording, revision queue, mutashabihat pairing *(planned)*

## Status

| | |
|---|---|
| Pages | 548 |
| Words | 83,668 |
| Tajweed marks | 77,835 |
| Ayah alignment | 99.89% |

Reader and hifz mode work. Listening mode is next.

## Running it

    npm install
    npm run dev

## Data sources

All content comes from the [Quranic Universal Library](https://qul.tarteel.ai):

- Indopak 16 lines layout (Taj Company)
- Indopak Nastaleeq script, word by word
- Tajweed annotations via the Uthmani tajweed script

Text should be validated against an authoritative printed edition before
release. See `docs/DATA.md`.

## Licence

Code: MIT. Quranic text belongs to no one and is used with attribution to the
sources above.
