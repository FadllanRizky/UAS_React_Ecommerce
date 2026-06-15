-- ============================================================
-- MIGRATION: Buat tabel shipping_regions + seed data awal
-- Jalankan SQL ini di Supabase SQL Editor (dashboard)
-- ============================================================

CREATE TABLE IF NOT EXISTS shipping_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  estimated_delivery VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data awal
INSERT INTO shipping_regions (name, estimated_delivery)
SELECT * FROM (VALUES
  ('Jawa Barat', '1-2 Hari'),
  ('Jawa Tengah', '3-4 Hari'),
  ('Jawa Timur', '4-5 Hari'),
  ('Sumatra', '5-6 Hari'),
  ('Luar Pulau / Lainnya', '7-10 Hari')
) AS data(nama, estimasi)
WHERE NOT EXISTS (SELECT 1 FROM shipping_regions LIMIT 1);

-- ============================================================
-- MIGRATION: Tambah kolom avatar_url ke tabel users & admins
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================
-- MIGRATION: Foreign Key transactions.user_id → users.id
-- (Diperlukan agar join query getAdminDashboardTx bekerja)
-- ============================================================
ALTER TABLE transactions ADD CONSTRAINT IF NOT EXISTS fk_transactions_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================
-- MIGRATION: RLS Policy untuk chat_messages (Izinkan INSERT)
-- ============================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert chat" ON chat_messages;
CREATE POLICY "Allow insert chat" ON chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- MIGRATION: Tambah kolom identitas ke chat_messages (opsional)
-- ============================================================
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS client_email TEXT;
