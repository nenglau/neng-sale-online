-- ══════════════════════════════════════
--  SHIPPING_COMPANIES TABLE SETUP
-- ══════════════════════════════════════

-- Create table
CREATE TABLE IF NOT EXISTS shipping_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE shipping_companies ENABLE ROW LEVEL SECURITY;

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

-- Create table
CREATE TABLE IF NOT EXISTS system_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  name TEXT NOT NULL,
  shipping_company_id UUID REFERENCES shipping_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Migration: Drop old id column (BIGINT) and recreate as UUID if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_branches' 
    AND column_name = 'id' 
    AND data_type = 'bigint'
  ) THEN
    ALTER TABLE system_branches DROP COLUMN id;
    ALTER TABLE system_branches ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
  END IF;
END $$;

-- Migration: Drop company_id column if exists (no longer needed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_branches' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE system_branches DROP COLUMN company_id;
  END IF;
END $$;

-- Migration: Drop old shipping_company column if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_branches' 
    AND column_name = 'shipping_company'
  ) THEN
    ALTER TABLE system_branches DROP COLUMN shipping_company;
  END IF;
END $$;

-- Migration: Add shipping_company_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_branches' 
    AND column_name = 'shipping_company_id'
  ) THEN
    ALTER TABLE system_branches ADD COLUMN shipping_company_id UUID REFERENCES shipping_companies(id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_branches_prov_dist ON system_branches(province, district);
CREATE INDEX IF NOT EXISTS idx_system_branches_name ON system_branches(name);

-- Enable Row Level Security
ALTER TABLE system_branches ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist
DROP POLICY IF EXISTS "Public read access" ON system_branches;
DROP POLICY IF EXISTS "Public insert access" ON system_branches;

-- RLS Policies: Allow public read and insert
CREATE POLICY "Public read access" ON system_branches
  FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON system_branches
  FOR INSERT WITH CHECK (true);

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
('อานุสิต'),
('ฮุงอาลุน'),
('มีไขขนส่ง')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════
--  IMPORT BRANCHES FROM MY BRANCHES.MD
-- ══════════════════════════════════════

-- Insert branches from my branches.md using shipping_company_id references
-- Note: company_id is NULL for template branches, will be assigned when used
INSERT INTO system_branches (province, district, name, shipping_company_id) VALUES
-- ໄຊສົມບູນ
('ແຂວງໄຊສົມບູນ', 'ທ່າໂທມ', 'ບ້ານປັູ້', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ທ່າໂທມ', 'ນ້ຳພາງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ທ່າໂທມ', 'ທ່າວຽງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ທ່າໂທມ', 'ປາກຍອງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ອະນຸວົງ', 'ນ້ຳຍອນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ອະນຸວົງ', 'ພູຫົວຊ້າງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງແຈ້ງ', 'ລ້ອງແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຄອນວັດ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຊຽງມີ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ສັນປາຕອງ516', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ສັນປາຕອງ516', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
('ແຂວງໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຄອນວັດ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊສົມບູນ', 'ຮົ່ມ', 'ຜາລະແວກ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ສາລະວັນ
('ສາລະວັນ', 'ສາລະວັນ', 'ບຶງຂາມ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ສາລະວັນ', 'ຄົງເຊໂດນ', 'ຄົງເຊໂດນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ໄຊຍະບູລີ
('ແຂວງໄຊຍະບູລີ', 'ຄອບ', 'ເມືອງຄອບ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ຫຼັກ18', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ສີເມືອງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ຫຼັກ18', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
('ແຂວງໄຊຍະບູລີ', 'ເງິນ', 'ນ້ຳເງິນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງໄຊຍະບູລີ', 'ປາກລາຍ', 'ນ້ຳພູນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ຊຽງຂວາງ
('ແຂວງຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ຕະຫຼາດສາມຊັ້ນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ຄັງພະນຽນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ບ້ານມອນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ໜອງແຮດ', 'ພັກແຄະ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ໝອກ', 'ນາຄ່ອນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ໝອກ', 'ນາຄ່ອນ', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
('ແຂວງຊຽງຂວາງ', 'ຄຳ', 'ນາຍອງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ຄຸນ', 'ສີເມືອງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ຄຸນ', 'ຊຳຍຸງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ຄຸນ', 'ສີພົມ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຊຽງຂວາງ', 'ພູກູດ', 'ບ້ານເລີນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ຫົວພັນ
('ແຂວງຫົວພັນ', 'ຊອນ', 'ຊ້ອນເໜືອນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫົວພັນ', 'ຊຳເໜືອ', 'ບ້ານທາດເມືອງ(ຕະຫຼາດໂພໄຊ)', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫົວພັນ', 'ຊຳເໜືອ', 'ນາວຽງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫົວພັນ', 'ຊຳເໜືອ', 'ໜອງຄ້າງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫົວພັນ', 'ຊຳເໜືອ', 'ຕະຫຼາດຊຳເໜືອ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫົວພັນ', 'ແອດ', 'ບ້ານແອດ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫົວພັນ', 'ກວັນ', 'ເມືອງກັວນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ວຽງຈັນ
('ແຂວງວຽງຈັນ', 'ກາສີ', 'ທາງແບາງບ້ານຈຽງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງວຽງຈັນ', 'ວັງວຽງ', 'ຕະຫຼາດວັງວຽງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງວຽງຈັນ', 'ວັງວຽງ', 'ນາລ້ອງກວາງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງວຽງຈັນ', 'ໝື່ນ', 'ໂນນໂຮ1', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງວຽງຈັນ', 'ທຸລະຄົມ', 'ນາແພງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງວຽງຈັນ', 'ທຸລະຄົມ', 'ບ້ານແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
('ແຂວງວຽງຈັນ', 'ໂພນໂຮງ', 'ຕະຫຼາດຫຼັກ52', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ອຸດົມໄຊ
('ອຸດົມໄຊ', 'ໄຊ', 'ບ້ານຫຼັກ32', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ອຸດົມໄຊ', 'ໄຊ', 'ນາເລົ່າ1', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ອຸດົມໄຊ', 'ນາໝໍ້', 'ໂຮມໄຊ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ອຸດົມໄຊ', 'ນາໝໍ້', 'ນາໝໍ້', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ບໍລິຄຳໄຊ
('ບໍລິຄຳໄຊ', 'ໄຊຈຳພອນ', 'ນ້ຳອ້ອນ', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
('ບໍລິຄຳໄຊ', 'ຄຳເກີດ', 'ນ້ຳພາວ', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
('ບໍລິຄຳໄຊ', 'ປາກຊັນ', 'ປາກຊັນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ບໍລິຄຳໄຊ', 'ວຽງທອງ', 'ນ້ຳຢ້າງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ບໍ່ແກ້ວ
('ແຂວງບໍ່ແກ້ວ', 'ຕົ້ນ\u200bເຜິ້ງ', 'ຕົ້ນ\u200bເຜິ້ງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງບໍ່ແກ້ວ', 'ຜາອຸດົມ', 'ປຸ່ງລາດ', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
('ແຂວງບໍ່ແກ້ວ', 'ຜາອຸດົມ', 'ໂພນໄຊ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງບໍ່ແກ້ວ', 'ຫ້ວຍຊາຍ', 'ບ້ານປຸ່ງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງບໍ່ແກ້ວ', 'ຫ້ວຍຊາຍ', 'ໃໝ່ພູຄາ', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
-- ຫຼວງພະບາງ
('ແຂວງຫຼວງພະບາງ', 'ປາກອູ', 'ໂພນໂຮມ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫຼວງພະບາງ', 'ໂພນທອງ', 'ວັງຊຽງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫຼວງພະບາງ', 'ຫຼວງພະບາງ', 'ພູເຫຼັກຈະເລີນ', (SELECT id FROM shipping_companies WHERE name = 'ฮุงอาลุน')),
('ແຂວງຫຼວງພະບາງ', 'ປາກແຊງ', 'ປາກແຊງ1', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫຼວງພະບາງ', 'ພູຄູນ', 'ພູຄູນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫຼວງພະບາງ', 'ພູຄູນ', 'ກາສີ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫຼວງພະບາງ', 'ງອຍ', 'ໜອງຂຽວ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫຼວງພະບາງ', 'ນ້ຳບາກ', 'ນ້ຳຖ້ວມເໜືອ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫຼວງພະບາງ', 'ວຽງຄຳ', 'ເມືອງວຽງຄຳ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ຈຳປາສັກ
('ແຂວງຈຳປາສັກ', 'ຈຳປາສັກ', 'ຈຳປາສັກ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ສະຫວັນນະເຂດ
('ແຂວງສະຫວັນນະເຂດ', 'ຊົນນະບູລີ', 'ສາຂາ1test', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງສະຫວັນນະເຂດ', 'ຈຳພອນ', 'ຈຳພອນ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ຫຼວງນ້ຳທາ
('ແຂວງຫຼວງນ້ຳທາ', 'ຫຼວງນ້ຳທາ', 'ຫຼວງນ້ຳທາ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ແຂວງຫຼວງນ້ຳທາ', 'ລອງ', 'ຈອມແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ຜົ້ງສາລີ
('ແຂວງຜົ້ງສາລີ', 'ຜົ້ງສາລີ', 'ຜົ້ງສາລີ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ຄຳມ່ວນ
('ແຂວງຄຳມ່ວນ', 'ຄູນຄຳ', 'ຄຸນຄຳ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ນະຄອນຫຼວງວຽງຈັນ
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊເສດຖາ', 'ປະຕູໂຊງເຂດພັດທະນາ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ຕະຫຼາດຫຼັກ10', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ນາທົ່ມ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ໜອງວຽງຄຳ', (SELECT id FROM shipping_companies WHERE name = 'มีไขขนส่ง')),
-- ອັດຕະປື
('ແຂວງອັດຕະປື', 'ສະໜາມໄຊ', 'ສະໜາມໄຊ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต')),
-- ເຊກອງ
('ແຂວງເຊກອງ', 'ກະລຶມ', 'ກະລຶມ', (SELECT id FROM shipping_companies WHERE name = 'อานุสิต'))
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════
--  DROP OLD BRANCHES TABLE
-- ══════════════════════════════════════

-- Drop old branches table if it exists
DROP TABLE IF EXISTS branches CASCADE;

