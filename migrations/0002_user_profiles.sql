CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  last_name TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name_kana TEXT NOT NULL DEFAULT '',
  first_name_kana TEXT NOT NULL DEFAULT '',
  pen_name TEXT NOT NULL DEFAULT '',
  country_region TEXT NOT NULL DEFAULT '',
  phone_country_code TEXT NOT NULL DEFAULT '',
  phone_number TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  prefecture TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT NOT NULL DEFAULT '',
  occupation TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '',
  wechat_id TEXT NOT NULL DEFAULT '',
  certificate_language TEXT NOT NULL DEFAULT 'ja' CHECK (certificate_language IN ('ja', 'en', 'zh')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_country_region ON user_profiles(country_region);
