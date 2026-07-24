// ══════════════════════════════════════
//  LAO GEO
// ══════════════════════════════════════
const LAO_GEO = {
  'ນະຄອນຫຼວງວຽງຈັນ':['ຈັນທະບູລີ','ສີໂຄດຕະບອງ','ໄຊເສດຖາ','ສີສັດຕະນາກ','ນາຊາຍທອງ','ໄຊທານີ','ຫາດຊາຍຟອງ','ສັງທອງ','ປາກງື່ມ'],
  'ຜົ້ງສາລີ':['ບຸນໃຕ້','ຂວາ','ໃໝ່','ຍອດອູ','ຜົ້ງສາລີ','ສຳພັນ','ບຸນເໜືອ'],
  'ຫຼວງນ້ຳທາ':['ຫຼວງນ້ຳທາ','ສິງ','ລອງ','ວຽງພູຄາ','ນາແລ'],
  'ອຸດົມໄຊ':['ໄຊ','ຫຼາ','ນາໝໍ້','ງາ','ແບ່ງ','ຮຸນ','ປາກແບ່ງ'],
  'ບໍ່ແກ້ວ':['ຫ້ວຍຊາຍ','ຕົ້ນ\u200bເຜິ້ງ','ເມິງ','ຜາອຸດົມ','ປາກທາ'],
  'ຫຼວງພະບາງ':['ຫຼວງພະບາງ','ຊຽງເງິນ','ນານ','ປາກອູ','ນ້ຳບາກ','ງອຍ','ປາກແຊງ','ໂພນໄຊ','ຈອມເພັດ','ວຽງຄຳ','ພູຄູນ','ໂພນທອງ'],
  'ຫົວພັນ':['ຊຳເໜືອ','ຊຽງຄໍ້','ຮ້ຽມ','ວຽງໄຊ','ຫົວເມືອງ','ຊຳໃຕ້','ສົບເບົາ','ແອດ','ກວັນ','ຊ່ອນ'],
  'ໄຊຍະບູລີ':['ບໍ່ແຕນ','ຫົງສາ','ແກ່ນທ້າວ','ຄອບ','ເງິນ','ປາກລາຍ','ພຽງ','ທົ່ງມີໄຊ','ໄຊຍະບູລີ','ຊຽງຮ່ອນ','ໄຊສະຖານ'],
  'ຊຽງຂວາງ':['ແປກ (ໂພນສະຫວັນ)','ຄຳ','ໜອງແຮດ','ຄຸນ','ໝອກ','ພູກູດ','ຜາໄຊ'],
  'ວຽງຈັນ':['ເຟືອງ','ຫີນເຫີບ','ກາສີ','ແກ້ວອຸດົມ','ແມດ','ໂພນໂຮງ','ທຸລະຄົມ','ວັງວຽງ','ວຽງຄຳ','ຊະນະຄາມ','ໝື່ນ'],
  'ບໍລິຄຳໄຊ':['ປາກຊັນ','ທ່າພະບາດ','ປາກກະດິງ','ບໍລິຄັນ','ຄຳເກີດ','ວຽງທອງ','ໄຊຈຳພອນ'],
  'ຄຳມ່ວນ':['ທ່າແຂກ','ມະຫາໄຊ','ໜອງບົກ','ຫີນບູນ','ຍົມມະລາດ','ບົວລະພາ','ນາກາຍ','ເຊບັ້ງໄຟ','ໄຊບົວທອງ','ຄູນຄຳ'],
  'ສະຫວັນນະເຂດ':['ໄກສອນ ພົມວິຫານ','ອາດສະພັງທອງ','ພີນ','ເຊໂປນ','ນອງ','ທ່າປາງທອງ','ສອງຄອນ','ຈຳພອນ','ຊົນນະບູລີ','ໄຊບູລີ','ວິລະບູລີ','ອາດສະພອນ','ໄຊພູທອງ','ພະລານໄຊ'],
  'ສາລະວັນ':['ສາລະວັນ','ຕຸ້ມລານ','ລະຄອນເພັງ','ວາປີ','ຄົງເຊໂດນ','ເລົ່າງາມ','ຕະໂອ້ຍ','ສະໝ້ວຍ'],
  'ເຊກອງ':['ທ່າແຕງ','ລະມາມ','ກະລຶມ','ດັກຈຶງ'],
  'ຈຳປາສັກ':['ປາກເຊ','ຊະນະສົມບູນ','ບາຈຽງຈະເລີນສຸກ','ປາກຊ່ອງ','ປະທຸມພອນ','ໂພນທອງ','ຈຳປາສັກ','ສຸຂຸມາ','ມູນລະປະໂມກ','ໂຂງ'],
  'ອັດຕະປື':['ໄຊເຊດຖາ','ສາມັກຄີໄຊ','ສະໜາມໄຊ','ຊານໄຊ','ໄຊພູວົງ'],
  'ໄຊສົມບູນ':['ອະນຸວົງ','ລ້ອງແຈ້ງ','ລ້ອງຊານ','ຮົ່ມ','ທ່າໂທມ']
};

function stripLaoPrefix(str,prefix){
  if(!str) return '';
  const s=String(str).trim();
  return s.startsWith(prefix)?s.substring(prefix.length).trim():s;
}
function shippingCardStyle(name){
  if(!name) return null;
  const n=name.trim();
  if(n==='ອານຸສິດ') return {color:'#c62828',bg:'#ffebee'};
  if(n==='ຮຸ່ງອາລຸນ') return {color:'#1565c0',bg:'#e3f2fd'};
  if(n==='ມີໄຊຂົນສົ່ງ') return {color:'#8d6e00',bg:'#fff8e1'};
  return null;
}

// ══════════════════════════════════════
//  GEO
// ══════════════════════════════════════
function getAllProvinces(){
  const custom=[...new Set(S.db.systemBranches.map(b=>b.province).filter(Boolean))];
  const customClean=custom.map(p=>p.startsWith('ແຂວງ')?p.substring(4):p);
  return [...new Set([...Object.keys(LAO_GEO),...customClean])].sort();
}
function getAllDistricts(prov){
  const std=LAO_GEO[prov]||[];
  const custom=[...new Set(S.db.systemBranches.filter(b=>b.province===prov&&b.district).map(b=>b.district))];
  return [...new Set([...std,...custom])].sort();
}
function populateProvinces(sel=''){
  buildProvCombo();
  if(!sel) updateDistricts();
}
function updateDistricts(sel=''){
  buildDistCombo();
  if(sel) sv('s-dist',sel);
}

// ══════════════════════════════════════
//  COLOR CODING HELPERS
// ══════════════════════════════════════
function getShippingCompanyColor(name){
  if(!name) return '#e0e0e0';
  // Generate consistent color based on name hash
  let hash=0;
  for(let i=0;i<name.length;i++){
    hash=name.charCodeAt(i)+((hash<<5)-hash);
  }
  const hue=Math.abs(hash)%360;
  return `hsl(${hue},70%,90%)`;
}
function getShippingCompanyTextColor(name){
  if(!name) return '#616161';
  let hash=0;
  for(let i=0;i<name.length;i++){
    hash=name.charCodeAt(i)+((hash<<5)-hash);
  }
  const hue=Math.abs(hash)%360;
  return `hsl(${hue},70%,30%)`;
}
