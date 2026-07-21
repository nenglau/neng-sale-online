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
('ໄຊສົມບູນ', 'ທ່າໂທມ', 'ບ້ານປັູ້', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ທ່າໂທມ', 'ນ້ຳພາງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ທ່າໂທມ', 'ທ່າວຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ທ່າໂທມ', 'ປາກຍອງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ອະນຸວົງ', 'ນ້ຳຍອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ອະນຸວົງ', 'ພູຫົວຊ້າງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ລ້ອງແຈ້ງ', 'ລ້ອງແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຄອນວັດ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຊຽງມີ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ລ້ອງຊານ', 'ສັນປາຕອງ516', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ລ້ອງຊານ', 'ສັນປາຕອງ516', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ໄຊສົມບູນ', 'ລ້ອງຊານ', 'ຄອນວັດ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊສົມບູນ', 'ຮົ່ມ', 'ຜາລະແວກ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ສາລະວັນ
('ສາລະວັນ', 'ສາລະວັນ', 'ບຶງຂາມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ສາລະວັນ', 'ຄົງເຊໂດນ', 'ຄົງເຊໂດນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ໄຊຍະບູລີ
('ໄຊຍະບູລີ', 'ຄອບ', 'ເມືອງຄອບ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ຫຼັກ18', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ສີເມືອງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊຍະບູລີ', 'ໄຊຍະບູລີ', 'ຫຼັກ18', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ໄຊຍະບູລີ', 'ເງິນ', 'ນ້ຳເງິນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ໄຊຍະບູລີ', 'ປາກລາຍ', 'ນ້ຳພູນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຊຽງຂວາງ
('ຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ຕະຫຼາດສາມຊັ້ນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ຄັງພະນຽນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ແປກ (ໂພນສະຫວັນ)', 'ບ້ານມອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ໜອງແຮດ', 'ພັກແຄະ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ໝອກ', 'ນາຄ່ອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ໝອກ', 'ນາຄ່ອນ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ຊຽງຂວາງ', 'ຄຳ', 'ນາຍອງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ຄຸນ', 'ສີເມືອງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ຄຸນ', 'ຊຳຍຸງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ຄຸນ', 'ສີພົມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຊຽງຂວາງ', 'ພູກູດ', 'ບ້ານເລີນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຫົວພັນ
('ຫົວພັນ', 'ຊອນ', 'ຊ້ອນເໜືອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫົວພັນ', 'ຊຳເໜືອ', 'ບ້ານທາດເມືອງ(ຕະຫຼາດໂພໄຊ)', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫົວພັນ', 'ຊຳເໜືອ', 'ນາວຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫົວພັນ', 'ຊຳເໜືອ', 'ໜອງຄ້າງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫົວພັນ', 'ຊຳເໜືອ', 'ຕະຫຼາດຊຳເໜືອ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫົວພັນ', 'ແອດ', 'ບ້ານແອດ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫົວພັນ', 'ກວັນ', 'ເມືອງກັວນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ວຽງຈັນ
('ວຽງຈັນ', 'ກາສີ', 'ທາງແບາງບ້ານຈຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ວຽງຈັນ', 'ວັງວຽງ', 'ຕະຫຼາດວັງວຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ວຽງຈັນ', 'ວັງວຽງ', 'ນາລ້ອງກວາງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ວຽງຈັນ', 'ໝື່ນ', 'ໂນນໂຮ1', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ວຽງຈັນ', 'ທຸລະຄົມ', 'ນາແພງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ວຽງຈັນ', 'ທຸລະຄົມ', 'ບ້ານແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ວຽງຈັນ', 'ໂພນໂຮງ', 'ຕະຫຼາດຫຼັກ52', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
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
('ບໍ່ແກ້ວ', 'ຕົ້ນ\u200bເຜິ້ງ', 'ຕົ້ນ\u200bເຜິ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ບໍ່ແກ້ວ', 'ຜາອຸດົມ', 'ປຸ່ງລາດ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ບໍ່ແກ້ວ', 'ຜາອຸດົມ', 'ໂພນໄຊ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ບໍ່ແກ້ວ', 'ຫ້ວຍຊາຍ', 'ບ້ານປຸ່ງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ບໍ່ແກ້ວ', 'ຫ້ວຍຊາຍ', 'ໃໝ່ພູຄາ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
-- ຫຼວງພະບາງ
('ຫຼວງພະບາງ', 'ປາກອູ', 'ໂພນໂຮມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫຼວງພະບາງ', 'ໂພນທອງ', 'ວັງຊຽງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫຼວງພະບາງ', 'ຫຼວງພະບາງ', 'ພູເຫຼັກຈະເລີນ', (SELECT id FROM shipping_companies WHERE name = 'ຮຸ່ງອາລຸນ')),
('ຫຼວງພະບາງ', 'ປາກແຊງ', 'ປາກແຊງ1', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫຼວງພະບາງ', 'ພູຄູນ', 'ພູຄູນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫຼວງພະບາງ', 'ພູຄູນ', 'ກາສີ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫຼວງພະບາງ', 'ງອຍ', 'ໜອງຂຽວ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫຼວງພະບາງ', 'ນ້ຳບາກ', 'ນ້ຳຖ້ວມເໜືອ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫຼວງພະບາງ', 'ວຽງຄຳ', 'ເມືອງວຽງຄຳ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຈຳປາສັກ
('ຈຳປາສັກ', 'ຈຳປາສັກ', 'ຈຳປາສັກ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ສະຫວັນນະເຂດ
('ສະຫວັນນະເຂດ', 'ຊົນນະບູລີ', 'ສາຂາ1test', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ສະຫວັນນະເຂດ', 'ຈຳພອນ', 'ຈຳພອນ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຫຼວງນ້ຳທາ
('ຫຼວງນ້ຳທາ', 'ຫຼວງນ້ຳທາ', 'ຫຼວງນ້ຳທາ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ຫຼວງນ້ຳທາ', 'ລອງ', 'ຈອມແຈ້ງ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຜົ້ງສາລີ
('ຜົ້ງສາລີ', 'ຜົ້ງສາລີ', 'ຜົ້ງສາລີ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ຄຳມ່ວນ
('ຄຳມ່ວນ', 'ຄູນຄຳ', 'ຄຸນຄຳ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ນະຄອນຫຼວງວຽງຈັນ
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊເສດຖາ', 'ປະຕູໂຊງເຂດພັດທະນາ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ຕະຫຼາດຫຼັກ10', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ນາທົ່ມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊທານີ', 'ໜອງວຽງຄຳ', (SELECT id FROM shipping_companies WHERE name = 'ມີໄຊຂົນສົ່ງ')),
-- ອັດຕະປື
('ອັດຕະປື', 'ສະໜາມໄຊ', 'ສະໜາມໄຊ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ')),
-- ເຊກອງ
('ເຊກອງ', 'ກະລຶມ', 'ກະລຶມ', (SELECT id FROM shipping_companies WHERE name = 'ອານຸສິດ'))
ON CONFLICT DO NOTHING;

