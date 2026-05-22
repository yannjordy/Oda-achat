CREATE TABLE IF NOT EXISTS notifications_admin (
  id BIGSERIAL PRIMARY KEY,
  titre TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  lien TEXT NOT NULL DEFAULT '',
  lue BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications_admin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert" ON notifications_admin
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon select" ON notifications_admin
  FOR SELECT TO anon
  USING (true);
