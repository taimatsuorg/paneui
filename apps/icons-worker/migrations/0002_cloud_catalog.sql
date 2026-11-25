ALTER TABLE icons ADD COLUMN source TEXT NOT NULL DEFAULT 'builtin';

CREATE TABLE IF NOT EXISTS icon_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  component TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_icon_events_created_at ON icon_events(created_at DESC);
