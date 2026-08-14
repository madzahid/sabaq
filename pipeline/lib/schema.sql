PRAGMA journal_mode = DELETE;

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);

-- Global word ids 1..83668, matching the QUL layout's word references.
-- is_marker = 1 for the ayah-number glyph, which is not a word.
-- marks is a JSON array with one entry per character: a rule name or null.
CREATE TABLE words (
  id        INTEGER PRIMARY KEY,
  surah     INTEGER NOT NULL,
  ayah      INTEGER NOT NULL,
  position  INTEGER NOT NULL,
  text      TEXT    NOT NULL,
  is_marker INTEGER NOT NULL DEFAULT 0,
  marks     TEXT
);

-- One row per printed line. type is 'ayah' | 'surah_name' | 'basmallah'.
CREATE TABLE lines (
  page          INTEGER NOT NULL,
  line_no       INTEGER NOT NULL,
  type          TEXT    NOT NULL,
  is_centered   INTEGER NOT NULL DEFAULT 0,
  first_word_id INTEGER,
  last_word_id  INTEGER,
  surah         INTEGER,
  PRIMARY KEY (page, line_no)
);

CREATE TABLE pages (
  page       INTEGER PRIMARY KEY,
  juz        INTEGER NOT NULL,
  surah      INTEGER NOT NULL,
  first_ayah TEXT    NOT NULL
);

CREATE INDEX idx_words_ayah ON words (surah, ayah);
