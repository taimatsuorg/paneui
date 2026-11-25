CREATE TABLE IF NOT EXISTS icons (
  name TEXT PRIMARY KEY,
  component TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'outline',
  body TEXT NOT NULL,
  svg TEXT NOT NULL,
  jsx TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_icons_category ON icons(category);
CREATE INDEX IF NOT EXISTS idx_icons_updated_at ON icons(updated_at DESC);
