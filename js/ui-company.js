// ══════════════════════════════════════
//  COMPANY SETTINGS
// ══════════════════════════════════════
function renderCoInfo(){
  const el=document.getElementById('co-info-content')||document.getElementById('co-settings');
  const sl=getSellerInfo();
  el.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:900px">
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">ຂໍ້ມູນບໍລິສັດ</span><button class="btn btn-outline btn-sm" id="btn-edit-co" onclick="toggleCoEdit()"><i class="fa fa-pen"></i> ແກ້ໄຂ</button></div>
          <div class="panel-body">
            <div id="co-display-mode">
              <div class="form-group"><label>Logo</label><div class="sidebar-logo" style="width:56px;height:56px;font-size:28px">${S.company.logo?`<img src="${S.company.logo}">`:esc(S.company.name[0]||'🌿')}</div></div>
              <div class="form-group"><label>ຊື່</label><div style="font-weight:600">${esc(S.company.name)}</div></div>
              <div class="form-group"><label>Google Apps Script URL</label><div style="font-size:13px;color:var(--gray-700)">${esc(GAS_URL)||'—'}</div></div>
            </div>
            <div id="co-edit-mode" style="display:none">
              <div class="form-group"><label>Logo</label><div style="display:flex;align-items:center;gap:12px"><div class="sidebar-logo" style="width:56px;height:56px;font-size:28px">${S.company.logo?`<img src="${S.company.logo}">`:esc(S.company.name[0]||'🌿')}</div><div><input type="file" id="co-logo" accept="image/*" style="display:none" onchange="uploadCompanyLogo(this)"><button class="btn btn-outline btn-sm" id="btn-upload-logo" onclick="document.getElementById('co-logo').click()"><i class="fa fa-upload"></i> ອັບໂຫຼດ</button></div></div><div id="logo-progress" style="display:none;margin-top:8px"><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;background:var(--gray-200);border-radius:3px;overflow:hidden"><div id="logo-progress-bar" style="height:100%;background:var(--green);width:0%;transition:width 0.2s"></div></div><span id="logo-progress-text" style="font-size:11px;color:var(--gray-500)">0%</span></div></div></div>
              <div class="form-group"><label>ຊື່ *</label><input class="fc" id="co-name" value="${esc(S.company.name)}"></div>
              <div class="form-group"><label>Google Apps Script URL</label><input class="fc" id="co-gas" value="${esc(GAS_URL)}" placeholder="https://script.google.com/..."><div style="font-size:11px;color:var(--gray-500);margin-top:4px">ໃຊ້ສຳລັບ Export ໄປ Google Sheets</div></div>
              <div style="display:flex;gap:8px"><button class="btn btn-green" onclick="saveCoSettings()">💾 ບັນທຶກ</button><button class="btn btn-outline" onclick="toggleCoEdit()">ຍົກເລີກ</button></div>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">🏪 ຂໍ້ມູນຜູ້ຂາຍ (ສຳລັບພິມບິນ)</span>
            <button class="btn btn-outline btn-sm" onclick="openSellerModal()"><i class="fa fa-pen"></i> ແກ້ໄຂ</button>
          </div>
          <div class="panel-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">
              <div><span style="color:var(--gray-500)">ຮ້ານ:</span> <strong>${esc(sl.shop||'—')}</strong></div>
              <div><span style="color:var(--gray-500)">ເບີໂທ:</span> <strong>${esc(sl.phone||'—')}</strong></div>
              <div><span style="color:var(--gray-500)">ຊື່ຜູ້ຂາຍ:</span> <strong>${esc(sl.name||'—')}</strong></div>
            </div>
            <div style="font-size:11px;color:var(--gray-500);margin-top:10px">ຂໍ້ມູນນີ້ຈະສະແດງໃນ "ສ່ວນຜູ້ຂາຍ" ເທີ່ງບິນຈັດສົ່ງ</div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><span class="panel-title">ສະມາຊິກ (${S.db.members.length})</span>
          ${S.role==='owner'||S.role==='admin'?`<button class="btn btn-outline btn-sm" onclick="openModal('modal-invite')">+ ເພີ່ມ</button>`:''}
        </div>
        <div class="panel-body">
          ${S.db.members.map(m=>{const p=m.profiles||{};return `<div class="member-row"><div class="member-avatar">${(p.name||p.email||'?')[0].toUpperCase()}</div><div class="member-info"><div class="member-name">${esc(p.name||'-')}</div><div class="member-email">${esc(p.email||'-')}</div></div><span class="badge ${m.role==='owner'?'badge-green':m.role==='admin'?'badge-blue':'badge-gray'}">${roleLabel(m.role)}</span>${S.role==='owner'&&m.user_id!==S.user.id?`<button class="btn-icon del" style="margin-left:4px" onclick="removeMember('${m.id}')">✕</button>`:''}</div>`;}).join('')||'<p style="color:var(--gray-500)">ຍັງບໍ່ມີ</p>'}
        </div>
      </div>
    </div>`;
}
function renderCoSettings(){renderCoInfo();}

function renderCoShipping(){
  const el=document.getElementById('co-shipping-content');
  if(!el) return;
  el.innerHTML=`
    <div style="max-width:720px">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">ບໍລິສັດຂົນສົ່ງ</span>
          <button class="btn btn-green btn-sm" onclick="addShipCo()">+ ເພີ່ມບໍລິສັດ</button>
        </div>
        <div class="panel-body" id="shipping-main-list">
          ${renderShippingWithBranches()}
        </div>
      </div>
    </div>`;
}
function renderShippingWithBranches(){
  if(!S.db.shipCos.length) return '<p style="color:var(--gray-500);font-size:13px">ຍັງບໍ່ມີ — ກົດ "+ ເພີ່ມບໍລິສັດ"</p>';
  return S.db.shipCos.map((sc,scIdx)=>{
    const branches=S.db.systemBranches.filter(b=>b.shipping_company_id===sc.id);
    const bid='sc-branches-'+sc.id;
    const cnt=branches.length;
    // Level 1: group by province
    const byProv={};
    branches.forEach(b=>{const p=b.province||'ບໍ່ລະບຸ';if(!byProv[p])byProv[p]=[];byProv[p].push(b);});
    const branchHTML=Object.keys(byProv).sort().map((prov,provIdx)=>{
      const pid='prov-'+scIdx+'-'+provIdx;
      const provBranches=byProv[prov];
      const provDisp=prov;
      // Level 2: group by district inside province
      const byDist={};
      provBranches.forEach(b=>{const d=b.district||'ບໍ່ລະບຸເມືອງ';if(!byDist[d])byDist[d]=[];byDist[d].push(b);});
      const distHTML=Object.keys(byDist).sort().map((dist,distIdx)=>{
        const did='dist-'+scIdx+'-'+provIdx+'-'+distIdx;
        const distBranches=byDist[dist];
        const distDisp=dist.startsWith('ເມືອງ')?dist:'ເມືອງ'+dist;
        return `<div style="margin-bottom:3px">
          <div onclick="toggleAccordion('${did}')" style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:var(--gray-50);border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;user-select:none">
            <i id="arr-${did}" class="fa fa-chevron-right" style="font-size:9px;transition:.2s;color:var(--gray-500)"></i>
            <i class="fa fa-city" style="color:var(--blue);font-size:11px"></i>
            ${esc(distDisp)}
            <span style="margin-left:auto;font-size:11px;color:var(--gray-500);font-weight:400">${distBranches.length} ສາຂາ</span>
            <button class="btn-icon" style="width:22px;height:22px;color:var(--blue)" onclick="event.stopPropagation();renameDistrict('${sc.id}','${esc(prov)}','${esc(dist)}')" title="ແກ້ໄຂຊື່ເມືອງ"><i class="fa fa-pen" style="font-size:9px"></i></button>
            <button class="btn-icon" style="width:22px;height:22px;color:var(--green)" onclick="event.stopPropagation();openAddBranch('${sc.id}','${esc(prov)}','${esc(dist)}')" title="ເພີ່ມສາຂາໃນເມືອງນີ້"><i class="fa fa-plus" style="font-size:9px"></i></button>
          </div>
          <div id="${did}" style="display:none;padding:2px 0 2px 22px">
            ${distBranches.map(b=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-bottom:1px solid var(--gray-100)">
              <span style="font-size:13px">📍 ${esc(b.name||'-')}</span>
              <div style="display:flex;gap:4px">
                <button class="btn-icon" style="color:var(--blue)" onclick="openEditBranch('${b.id}','${esc(b.name||'')}','${esc(b.province||'')}','${esc(b.district||'')}','${sc.id}')"><i class="fa fa-pen" style="font-size:10px"></i></button>
                <button class="btn-icon del" onclick="delBranch('${b.id}')">✕</button>
              </div>
            </div>`).join('')}
          </div>
        </div>`;
      }).join('');
      return `<div style="margin-bottom:4px">
        <div onclick="toggleAccordion('${pid}')" style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--gray-100);border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;user-select:none">
          <i id="arr-${pid}" class="fa fa-chevron-right" style="font-size:10px;transition:.2s;color:var(--gray-500)"></i>
          <i class="fa fa-map-marker-alt" style="color:var(--green);font-size:12px"></i>
          ${esc(provDisp)}
          <span style="margin-left:auto;font-size:11px;color:var(--gray-500);font-weight:400">${provBranches.length} ສາຂາ</span>
          <button class="btn-icon" style="width:24px;height:24px;color:var(--blue)" onclick="event.stopPropagation();renameProvince('${sc.id}','${esc(prov)}')" title="ແກ້ໄຂຊື່ແຂວງ"><i class="fa fa-pen" style="font-size:10px"></i></button>
          <button class="btn-icon" style="width:24px;height:24px;color:var(--green)" onclick="event.stopPropagation();openAddBranch('${sc.id}','${esc(prov)}','')" title="ເພີ່ມສາຂາໃນແຂວງນີ້"><i class="fa fa-plus" style="font-size:10px"></i></button>
        </div>
        <div id="${pid}" style="display:none;padding:4px 0 4px 18px">
          ${distHTML}
        </div>
      </div>`;
    }).join('');
    return `<div style="margin-bottom:10px;border:1px solid var(--gray-200);border-radius:var(--radius);overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 14px;background:var(--green-hover);cursor:pointer" onclick="toggleAccordion('${bid}')">
        <span style="display:flex;align-items:center;gap:8px;font-weight:600">
          <i id="arr-${bid}" class="fa fa-chevron-right" style="font-size:11px;transition:.2s;color:var(--green)"></i>
          <i class="fa fa-truck" style="color:var(--green)"></i>
          ${esc(sc.name)}
          ${cnt?`<span style="font-size:12px;color:var(--gray-500);font-weight:400">(${cnt} ສາຂາ)</span>`:''}
        </span>
        <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
          <button class="btn btn-outline btn-sm" onclick="openAddBranch('${sc.id}')">+ ເພີ່ມສາຂາ</button>
          <button class="btn-icon del" onclick="delShipCo('${sc.id}')">✕</button>
        </div>
      </div>
      <div id="${bid}" style="display:none;padding:8px 14px">
        ${cnt?branchHTML:'<p style="color:var(--gray-500);font-size:13px;padding:4px 0">ຍັງບໍ່ມີສາຂາ — ກົດ "+ ເພີ່ມສາຂາ"</p>'}
      </div>
    </div>`;
  }).join('');
}
function toggleAccordion(id){
  const el=document.getElementById(id);
  const arr=document.getElementById('arr-'+id);
  if(!el) return;
  const open=el.style.display==='block';
  el.style.display=open?'none':'block';
  if(arr) arr.style.transform=open?'':'rotate(90deg)';
}

function renderShipList(){
  if(!S.db.shipCos.length) return '<p style="color:var(--gray-500);font-size:13px">ຍັງບໍ່ມີ</p>';
  return S.db.shipCos.map(s=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--gray-200)"><span>${esc(s.name)}</span><button class="btn-icon del" onclick="delShipCo('${s.id}')">✕</button></div>`).join('');
}
function openAddBranch(shipCoId='',province='',district=''){
  sv('branch-id',''); sv('br-name','');
  sv('br-prov',province); sv('br-dist',district);
  const co=S.db.shipCos.find(x=>x.id===shipCoId);
  sv('br-ship',co?co.name:'');
  document.getElementById('branch-modal-title').textContent='ເພີ່ມສາຂາ';
  buildShipCombo();
  populateBranchProvinces(province);
  if(province) setTimeout(()=>updateBranchDistricts(district),30);
  openModal('modal-branch');
}
function openAddBranchFromSale(){
  const ship=v('s-ship').trim();
  const prov=v('s-prov').trim();
  const dist=v('s-dist').trim();
  const co=S.db.shipCos.find(x=>x.name===ship);
  openAddBranch(co?co.id:'',prov,dist);
}
function openEditBranch(id,name,province,district,shipCoId){
  sv('branch-id',id); sv('br-name',name||'');
  sv('br-prov',province||''); sv('br-dist',district||'');
  const co=S.db.shipCos.find(x=>x.id===shipCoId);
  sv('br-ship',co?co.name:'');
  document.getElementById('branch-modal-title').textContent='ແກ້ໄຂສາຂາ';
  buildShipCombo();
  populateBranchProvinces(province||'');
  setTimeout(()=>updateBranchDistricts(district||''),30);
  openModal('modal-branch');
}
async function saveBranch(){
  const shipName=v('br-ship').trim();
  const province=v('br-prov'), district=v('br-dist'), name=v('br-name').trim();
  if(!shipName){toast('ກະລຸນາເລືອກບໍລິສັດຂົນສົ່ງ','error');return;}
  if(!province){toast('ກະລຸນາເລືອກແຂວງ','error');return;}
  const displayName=name||(district?`${province} - ${district}`:province);
  let shipCoObj=S.db.shipCos.find(x=>x.name===shipName);
  if(!shipCoObj){
    const{data:ns}=await sb.from('shipping_companies').insert({name:shipName}).select().single();
    if(ns){S.db.shipCos.push(ns); S.db.shipCos.sort((a,b)=>a.name.localeCompare(b.name)); shipCoObj=ns;}
  }
  if(!shipCoObj){toast('ບໍ່ສາມາດບັນທຶກບໍລິສັດຂົນສົ່ງ','error');return;}
  const bid=v('branch-id');
  const payload={shipping_company_id:shipCoObj.id,name:displayName,province,district:district||null};
  let error;
  if(bid){
    const r=await sb.from('system_branches').update(payload).eq('id',bid);
    error=r.error;
    if(!error){
      S.db.branches=S.db.branches.map(b=>b.id===bid?{...b,...payload}:b);
      S.db.systemBranches=S.db.systemBranches.map(b=>b.id===bid?{...b,...payload}:b);
    }
  } else {
    const r=await sb.from('system_branches').insert(payload).select().single();
    error=r.error;
    if(!error && r.data){
      S.db.branches.push(r.data);
      S.db.branches.sort((a,b)=>a.name.localeCompare(b.name));
      S.db.systemBranches.push(r.data);
      S.db.systemBranches.sort((a,b)=>a.name.localeCompare(b.name));
    }
  }
  if(error){toast(error.message,'error');return;}
  closeModal('modal-branch');
  const sml=document.getElementById('shipping-main-list');
  if(sml) sml.innerHTML=renderShippingWithBranches();
  toast(bid?'ແກ້ໄຂສຳເລັດ':'ເພີ່ມສາຂາສຳເລັດ','success');
  // Reload data from database to ensure persistence
  await loadData();
  // Rebuild province and district combos to include new branch locations
  buildProvCombo();
  buildDistCombo();
  // Rebuild branch combo in sales form if open
  setTimeout(()=>buildBranchCombo(),100);
}
function populateBranchProvinces(sel=''){
  buildBranchProvCombo();
  if(sel) sv('br-prov',sel);
  updateBranchDistricts();
}
function updateBranchDistricts(sel=''){
  buildBranchDistCombo();
  if(sel) sv('br-dist',sel);
}
function buildBranchProvCombo(){
  const list=document.getElementById('combo-br-prov');
  list.innerHTML=getAllProvinces().map(p=>`<div class="combo-item" onmousedown="pickBranchProv('${esc(p)}')">${esc(p)}</div>`).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ຍັງບໍ່ມີ</div>';
}
function pickBranchProv(name){
  sv('br-prov',name); sv('br-dist','');
  buildBranchDistCombo(); closeBranchCombo('prov');
}
function buildBranchDistCombo(){
  const prov=v('br-prov').trim();
  const list=document.getElementById('combo-br-dist');
  list.innerHTML=prov?getAllDistricts(prov).map(d=>`<div class="combo-item" onmousedown="pickBranchDist('${esc(d)}')">${esc(d)}</div>`).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ຍັງບໍ່ມີ</div>':'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ເລືອກແຂວງກ່ອນ</div>';
}
function pickBranchDist(name){
  sv('br-dist',name);
  closeBranchCombo('dist');
}
function openBranchCombo(type){document.getElementById('combo-br-'+type).classList.add('open');}
function closeBranchCombo(type){document.getElementById('combo-br-'+type).classList.remove('open');}
function filterBranchCombo(type){
  const input=document.getElementById('br-'+type);
  const list=document.getElementById('combo-br-'+type);
  const q=input.value.toLowerCase();
  list.querySelectorAll('.combo-item').forEach(item=>{item.style.display=item.textContent.toLowerCase().includes(q)?'':'none';});
}
async function addBranch(shipCoId){ openAddBranch(shipCoId); }
async function editBranch(id,name,province,district,shipCoId){ openEditBranch(id,name,province,district,shipCoId); }
async function delBranch(id){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:'ລຶບສາຂານີ້?',
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const{error}=await sb.from('system_branches').delete().eq('id',id);
  if(error){toast(error.message,'error');return;}
  S.db.branches=S.db.branches.filter(b=>b.id!==id);
  S.db.systemBranches=S.db.systemBranches.filter(b=>b.id!==id);
  document.getElementById('shipping-main-list').innerHTML=renderShippingWithBranches();
}
async function renameProvince(shipCoId,oldName){
  const newName=prompt('ແກ້ໄຂຊື່ແຂວງ:',oldName);
  if(!newName||!newName.trim()||newName.trim()===oldName) return;
  const name=newName.trim();
  const ids=S.db.systemBranches.filter(b=>b.shipping_company_id===shipCoId&&b.province===oldName).map(b=>b.id);
  if(!ids.length) return;
  const{error}=await sb.from('system_branches').update({province:name}).in('id',ids);
  if(error){toast(error.message,'error');return;}
  S.db.branches=S.db.branches.map(b=>ids.includes(b.id)?{...b,province:name}:b);
  S.db.systemBranches=S.db.systemBranches.map(b=>ids.includes(b.id)?{...b,province:name}:b);
  document.getElementById('shipping-main-list').innerHTML=renderShippingWithBranches();
  toast('ແກ້ໄຂຊື່ແຂວງສຳເລັດ ✓','success');
}
async function renameDistrict(shipCoId,province,oldName){
  const newName=prompt('ແກ້ໄຂຊື່ເມືອງ:',oldName);
  if(!newName||!newName.trim()||newName.trim()===oldName) return;
  const name=newName.trim();
  const ids=S.db.systemBranches.filter(b=>b.shipping_company_id===shipCoId&&b.province===province&&b.district===oldName).map(b=>b.id);
  if(!ids.length) return;
  const{error}=await sb.from('system_branches').update({district:name}).in('id',ids);
  if(error){toast(error.message,'error');return;}
  S.db.branches=S.db.branches.map(b=>ids.includes(b.id)?{...b,district:name}:b);
  S.db.systemBranches=S.db.systemBranches.map(b=>ids.includes(b.id)?{...b,district:name}:b);
  document.getElementById('shipping-main-list').innerHTML=renderShippingWithBranches();
  toast('ແກ້ໄຂຊື່ເມືອງສຳເລັດ ✓','success');
}
async function addShipCo(){
  const name=prompt('ຊື່ບໍລິສັດຂົນສົ່ງ:'); if(!name?.trim()) return;
  const{data,error}=await sb.from('shipping_companies').insert({name:name.trim()}).select().single();
  if(error){toast(error.message,'error');return;}
  S.db.shipCos.push(data); S.db.shipCos.sort((a,b)=>a.name.localeCompare(b.name));
  const sml=document.getElementById('shipping-main-list');
  if(sml) sml.innerHTML=renderShippingWithBranches();
  toast('ເພີ່ມສຳເລັດ','success');
}
async function delShipCo(id){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:'ລຶບບໍລິສັດຂົນສົ່ງ ແລະ ສາຂາທັງໝົດ?',
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const{error}=await sb.from('shipping_companies').delete().eq('id',id);
  if(error){toast(error.message,'error');return;}
  S.db.shipCos=S.db.shipCos.filter(x=>x.id!==id);
  S.db.systemBranches=S.db.systemBranches.filter(b=>b.shipping_company_id!==id);
  const sml=document.getElementById('shipping-main-list');
  if(sml) sml.innerHTML=renderShippingWithBranches();
}
async function uploadCompanyLogo(input){
  const file=input.files[0];
  if(!file) return;
  if(file.size>2*1024*1024){toast('ຂະໜາດຮູບຕ້ອງບໍ່ເກີນ 2MB','error');return;}
  const progressEl=document.getElementById('logo-progress');
  const progressBar=document.getElementById('logo-progress-bar');
  const progressText=document.getElementById('logo-progress-text');
  const btn=document.getElementById('btn-upload-logo');
  progressEl.style.display='block';
  progressBar.style.width='0%';
  progressText.textContent='0%';
  btn.disabled=true;
  btn.innerHTML='<i class="fa fa-spinner fa-spin"></i> ກຳລັງອັບໂຫຼດ...';
  const reader=new FileReader();
  reader.onprogress=(e)=>{
    if(e.lengthComputable){
      const pct=Math.round((e.loaded/e.total)*100);
      progressBar.style.width=pct+'%';
      progressText.textContent=pct+'%';
    }
  };
  reader.onload=async(e)=>{
    progressBar.style.width='100%';
    progressText.textContent='100%';
    const base64=e.target.result;
    const{error}=await sb.from('companies').update({logo_url:base64}).eq('id',S.company.id);
    if(error){toast(error.message,'error');resetUploadBtn();return;}
    S.company.logo=base64;
    try{localStorage.setItem('hg_company',JSON.stringify({...S.company,role:S.role}));}catch(e){}
    renderSidebar();
    renderCoInfo();
    toast('ອັບໂຫຼດ logo ສຳເລັດ ✓','success');
    resetUploadBtn();
  };
  reader.onerror=()=>{
    toast('ອັບໂຫຼດລົ້ມເຫຼວ','error');
    resetUploadBtn();
  };
  function resetUploadBtn(){
    setTimeout(()=>{
      progressEl.style.display='none';
      btn.disabled=false;
      btn.innerHTML='<i class="fa fa-upload"></i> ອັບໂຫຼດ';
      input.value='';
    },500);
  }
  reader.readAsDataURL(file);
}
function toggleCoEdit(){
  const displayMode=document.getElementById('co-display-mode');
  const editMode=document.getElementById('co-edit-mode');
  const btn=document.getElementById('btn-edit-co');
  if(displayMode.style.display==='none'){
    displayMode.style.display='block';
    editMode.style.display='none';
    btn.style.display='inline-flex';
  }else{
    displayMode.style.display='none';
    editMode.style.display='block';
    btn.style.display='none';
  }
}
async function saveCoSettings(){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນບັນທຶກ',
    message:'ທ່ານແນ່ໃຈບໍທີ່ຈະບັນທຶກຂໍ້ມູນບໍລິສັດ?',
    icon:'💾',
    confirmText:'ບັນທຶກ',
    cancelText:'ຍົກເລີກ'
  });
  if(!confirmed) return;
  const name=v('co-name'),gas=v('co-gas');
  const{error}=await sb.from('companies').update({name}).eq('id',S.company.id);
  if(error){toast(error.message,'error');return;}
  // Reload company data from Supabase to ensure latest data (including logo)
  const{data:coData}=await sb.from('companies').select('*').eq('id',S.company.id).single();
  if(coData){
    S.company.name=coData.name;
    S.company.logo=coData.logo_url;
    GAS_URL=gas; localStorage.setItem('gas_url',gas);
  }
  try{localStorage.setItem('hg_company',JSON.stringify({...S.company,role:S.role}));}catch(e){}
  document.getElementById('sb-company-name').textContent=S.company.name;
  renderSidebar();
  renderCoInfo();
  toast('ບັນທຶກສຳເລັດ ✓','success');
  toggleCoEditMode(false);
}
async function inviteMember(){
  const email=v('inv-email'),role=v('inv-role');
  if(!email){toast('ກະລຸນາໃສ່ email','error');return;}
  const{data:p}=await sb.from('profiles').select('id').eq('email',email).single();
  if(!p){toast('ບໍ່ພົບ user ນີ້ ກະລຸນາສ້າງ account ກ່ອນ','error');return;}
  const{error}=await sb.from('company_members').insert({company_id:S.company.id,user_id:p.id,role});
  if(error){toast('ເພີ່ມບໍ່ໄດ້ (ອາດຈະມີຢູ່ແລ້ວ)','error');return;}
  closeModal('modal-invite');
  const{data:mb}=await sb.from('company_members').select('*, profiles(name,email)').eq('company_id',S.company.id);
  if(mb) S.db.members=mb;
  toast('ເພີ່ມສຳເລັດ ✓','success'); renderCoSettings();
}
async function removeMember(mid){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:'ລຶບສະມາຊິກນີ້?',
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const{error}=await sb.from('company_members').delete().eq('id',mid);
  if(error){toast(error.message,'error');return;}
  S.db.members=S.db.members.filter(x=>x.id!==mid); toast('ລຶບສຳເລັດ','success'); renderCoSettings();
}
