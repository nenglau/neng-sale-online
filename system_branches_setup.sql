-- ══════════════════════════════════════
--  SHIPPING_COMPANIES TABLE SETUP
-- ══════════════════════════════════════

-- Drop table and recreate to ensure clean state
DROP TABLE IF EXISTS shipping_companies CASCADE;

-- Create table
CREATE TABLE shipping_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE shipping_companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read, insert, update, and delete
CREATE POLICY "Public read access" ON shipping_companies
  FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON shipping_companies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access" ON shipping_companies
  FOR UPDATE USING (true);

CREATE POLICY "Public delete access" ON shipping_companies
  FOR DELETE USING (true);

-- Migration: Drop company_id column if exists (no longer needed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_companies' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE shipping_companies DROP COLUMN company_id;
  END IF;
END $$;

-- Drop policies if they exist
DROP POLICY IF EXISTS "Public read access" ON shipping_companies;
DROP POLICY IF EXISTS "Public insert access" ON shipping_companies;

-- RLS Policies: Allow public read and insert
CREATE POLICY "Public read access" ON shipping_companies
  FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON shipping_companies
  FOR INSERT WITH CHECK (true);

-- ══════════════════════════════════════
--  SYSTEM_BRANCHES TABLE SETUP
-- ══════════════════════════════════════

-- Drop old branches table first to avoid foreign key issues
DROP TABLE IF EXISTS branches CASCADE;

-- Drop system_branches table and recreate to ensure clean state
DROP TABLE IF EXISTS system_branches CASCADE;

-- Create table
CREATE TABLE system_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  name TEXT NOT NULL,
  shipping_company_id UUID REFERENCES shipping_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_branches_prov_dist ON system_branches(province, district);
CREATE INDEX IF NOT EXISTS idx_system_branches_name ON system_branches(name);

-- Enable Row Level Security
ALTER TABLE system_branches ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might block access
DROP POLICY IF EXISTS "Public read access" ON system_branches;
DROP POLICY IF EXISTS "Public insert access" ON system_branches;
DROP POLICY IF EXISTS "member_access" ON system_branches;
DROP POLICY IF EXISTS "member_insert" ON system_branches;
DROP POLICY IF EXISTS "member_delete" ON system_branches;
DROP POLICY IF EXISTS "sc_select" ON system_branches;
DROP POLICY IF EXISTS "sc_update" ON system_branches;
DROP POLICY IF EXISTS "sc_delete" ON system_branches;

-- RLS Policies: Allow public read, insert, update, and delete
CREATE POLICY "Public read access" ON system_branches
  FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON system_branches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access" ON system_branches
  FOR UPDATE USING (true);

CREATE POLICY "Public delete access" ON system_branches
  FOR DELETE USING (true);

-- ══════════════════════════════════════
--  DROP OLD BRANCHES TABLE
-- ══════════════════════════════════════

-- Drop old branches table if it exists
DROP TABLE IF EXISTS branches CASCADE;

-- ══════════════════════════════════════
--  CLEAR EXISTING DATA
-- ══════════════════════════════════════

-- Clear existing system_branches first (to avoid foreign key constraint)
DELETE FROM system_branches;

-- Clear existing shipping companies
DELETE FROM shipping_companies;

-- ══════════════════════════════════════
--  INSERT SHIPPING COMPANIES
-- ══════════════════════════════════════

-- Insert shipping companies
INSERT INTO shipping_companies (name) VALUES
('ອານຸສິດ'),
('ຮຸ່ງອາລຸນ'),
('ມີໄຊຂົນສົ່ງ')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════
--  IMPORT BRANCHES FROM MY BRANCHES.MD
-- ══════════════════════════════════════

-- Insert branches from my branches.md using shipping_company_id references
-- Note: company_id is NULL for template branches, will be assigned when used
INSERT INTO system_branches (province, district, name, shipping_company_id) VALUES
-- ໄຊສົມບູນ
('ແຂວງໄຊສົມບູນ', 'ທ່າໂທມ', 'ບ້ານປັູ້', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ທ່າໂທມ', 'ນ້ຳພາງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ທ່າໂທມ', 'ທ່າວຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ທ່າໂທມ', 'ປາກຍອງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ອະນຸວົງ', 'ນ້ຳຍອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ອະນຸວົງ', 'ພູຫົວຊ້າງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງແຈ້ງ', 'ລ້ອງແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຄອນວັດ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຊຽງມີ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ສັນປາຕອງ516', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ສັນປາຕອງ516', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຄອນວັດ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊສົມບູນ', 'ຮົ່ມ', 'ຜາລະແວກ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ສາລະວັນ
('ສາລະວັນ', 'ສາລະວັນ', 'ບຶງຂາມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ສາລະວັນ', 'ຄົງເຊໂດນ', 'ຄົງເຊໂດນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ໄຊຍະບູລີ
('ແຂວງໄຊຍະບູລີ', 'ຄອບ', 'ເມືອງຄອບ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ຫຼັກ18', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ສີເມືອງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ຫຼັກ18', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ແຂວງໄຊຍະບູລີ', 'ເງິນ', 'ນ້ຳເງິນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງໄຊຍະບູລີ', 'ປາກລາຍ', 'ນ້ຳພູນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຊຽງຂວາງ
('ແຂວງຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ຕະຫຼາດສາມຊັ້ນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ຄັງພະນຽນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ບ້ານມອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ໜອງແຮດ', 'ພັກແຄະ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ໝອກ', 'ນາຄ່ອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ໝອກ', 'ນາຄ່ອນ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ແຂວງຊຽງຂວາງ', 'ຄຳ', 'ນາຍອງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ຄຸນ', 'ສີເມືອງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ຄຸນ', 'ຊຳຍຸງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ຄຸນ', 'ສີພົມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຊຽງຂວາງ', 'ພູກູດ', 'ບ້ານເລີນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຫົວພັນ
('ແຂວງຫົວພັນ', 'ຊອນ', 'ຊ້ອນເໜືອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫົວພັນ', 'ຊຳເໜືອ', 'ບ້ານທາດເມືອງ(ຕະຫຼາດໂພໄຊ)', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫົວພັນ', 'ຊຳເໜືອ', 'ນາວຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫົວພັນ', 'ຊຳເໜືອ', 'ໜອງຄ້າງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫົວພັນ', 'ຊຳເໜືອ', 'ຕະຫຼາດຊຳເໜືອ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫົວພັນ', 'ແອດ', 'ບ້ານແອດ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫົວພັນ', 'ກວັນ', 'ເມືອງກັວນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ວຽງຈັນ
('ແຂວງວຽງຈັນ', 'ກາສີ', 'ທາງແບາງບ້ານຈຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງວຽງຈັນ', 'ວັງວຽງ', 'ຕະຫຼາດວັງວຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງວຽງຈັນ', 'ວັງວຽງ', 'ນາລ້ອງກວາງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງວຽງຈັນ', 'ໝື່ນ', 'ໂນນໂຮ1', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງວຽງຈັນ', 'ທຸລະຄົມ', 'ນາແພງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງວຽງຈັນ', 'ທຸລະຄົມ', 'ບ້ານແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ແຂວງວຽງຈັນ', 'ໂພນໂຮງ', 'ຕະຫຼາດຫຼັກ52', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ອຸດົມໄຊ
('ອຸດົມໄຊ', 'ໄຊ', 'ບ້ານຫຼັກ32', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ອຸດົມໄຊ', 'ໄຊ', 'ນາເລົ່າ1', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ອຸດົມໄຊ', 'ນາໝໍ້', 'ໂຮມໄຊ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ອຸດົມໄຊ', 'ນາໝໍ້', 'ນາໝໍ້', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ບໍລິຄຳໄຊ
('ບໍລິຄຳໄຊ', 'ໄຊຈຳພອນ', 'ນ້ຳອ້ອນ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ບໍລິຄຳໄຊ', 'ຄຳເກີດ', 'ນ້ຳພາວ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ບໍລິຄຳໄຊ', 'ປາກຊັນ', 'ປາກຊັນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ບໍລິຄຳໄຊ', 'ວຽງທອງ', 'ນ້ຳຢ້າງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ບໍ່ແກ້ວ
('ແຂວງບໍ່ແກ້ວ', 'ຕົ້ນ\u200bເຜິ້ງ', 'ຕົ້ນ\u200bເຜິ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງບໍ່ແກ້ວ', 'ຜາອຸດົມ', 'ປຸ່ງລາດ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ແຂວງບໍ່ແກ້ວ', 'ຜາອຸດົມ', 'ໂພນໄຊ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງບໍ່ແກ້ວ', 'ຫ້ວຍຊາຍ', 'ບ້ານປຸ່ງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງບໍ່ແກ້ວ', 'ຫ້ວຍຊາຍ', 'ໃໝ່ພູຄາ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
-- ຫຼວງພະບາງ
('ແຂວງຫຼວງພະບາງ', 'ປາກອູ', 'ໂພນໂຮມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫຼວງພະບາງ', 'ໂພນທອງ', 'ວັງຊຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫຼວງພະບາງ', 'ຫຼວງພະບາງ', 'ພູເຫຼັກຈະເລີນ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ແຂວງຫຼວງພະບາງ', 'ປາກແຊງ', 'ປາກແຊງ1', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫຼວງພະບາງ', 'ພູຄູນ', 'ພູຄູນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫຼວງພະບາງ', 'ພູຄູນ', 'ກາສີ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫຼວງພະບາງ', 'ງອຍ', 'ໜອງຂຽວ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫຼວງພະບາງ', 'ນ້ຳບາກ', 'ນ້ຳຖ້ວມເໜືອ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫຼວງພະບາງ', 'ວຽງຄຳ', 'ເມືອງວຽງຄຳ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຈຳປາສັກ
('ແຂວງຈຳປາສັກ', 'ຈຳປາສັກ', 'ຈຳປາສັກ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ສະຫວັນນະເຂດ
('ແຂວງສະຫວັນນະເຂດ', 'ຊົນນະບູລີ', 'ສາຂາ1test', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງສະຫວັນນະເຂດ', 'ຈຳພອນ', 'ຈຳພອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຫຼວງນ້ຳທາ
('ແຂວງຫຼວງນ້ຳທາ', 'ຫຼວງນ້ຳທາ', 'ຫຼວງນ້ຳທາ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ແຂວງຫຼວງນ້ຳທາ', 'ລອງ', 'ຈອມແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຜົ້ງສາລີ
('ແຂວງຜົ້ງສາລີ', 'ຜົ້ງສາລີ', 'ຜົ້ງສາລີ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຄຳມ່ວນ
('ແຂວງຄຳມ່ວນ', 'ຄູນຄຳ', 'ຄຸນຄຳ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ນະຄອນຫຼວງວຽງຈັນ
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊເສດຖາ', 'ປະຕູໂຊງເຂດພັດທະນາ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ຕະຫຼາດຫຼັກ10', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ນາທົ່ມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ໜອງວຽງຄຳ', (SELECT id FROM shipping_companies WHERE name = 'ມີໄຊຂົນສົ່ງ')),
-- ອັດຕະປື
('ແຂວງອັດຕະປື', 'ສະໜາມໄຊ', 'ສະໜາມໄຊ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ເຊກອງ
('ແຂວງເຊກອງ', 'ກະລຶມ', 'ກະລຶມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ'))
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════
--  DROP OLD BRANCHES TABLE
-- ══════════════════════════════════════

-- Drop old branches table if it exists
DROP TABLE IF EXISTS branches CASCADE;

