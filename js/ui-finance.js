// ══════════════════════════════════════
//  FINANCE
// ══════════════════════════════════════
function setFinPeriod(p){
  S.finPeriod=p;
  document.querySelectorAll('#fin-period .period-tab').forEach(t=>t.classList.toggle('active',t.dataset.p===p));
  const btn=document.getElementById('fin-custom-btn');
  if(btn) btn.classList.toggle('active',p==='custom');
  renderFin();
}
function renderFin(){
  const now=new Date(), ym=now.toISOString().slice(0,7), yr=String(now.getFullYear());
  let data=S.db.finance;
  if(S.finPeriod==='custom'&&S.customRanges.fin){
    const {start,end}=S.customRanges.fin;
    data=data.filter(f=>f.date>=start&&f.date<=end);
  }
  else if(S.finPeriod==='month') data=data.filter(f=>f.date.startsWith(ym));
  else if(S.finPeriod==='year') data=data.filter(f=>f.date.startsWith(yr));
  const finExp=data.filter(f=>f.type==='ລາຍຈ່າຍ').reduce((a,f)=>a+f.amount,0);
  document.getElementById('fin-stats').innerHTML=`<div class="stat-card red"><span class="stat-icon">💸</span><div class="stat-label">ລາຍຈ່າຍ</div><div class="stat-value" style="color:var(--red)">${fmt(finExp)} ₭</div></div>`;
  const tb=document.getElementById('fin-tbody');
  if(!data.length){tb.innerHTML='<tr><td colspan="7"><div class="empty"><i class="fa fa-wallet"></i><p>ຍັງບໍ່ມີຂໍ້ມູນ</p></div></td></tr>';return;}
  tb.innerHTML=data.map(f=>`<tr><td>${fmtDate(f.date)}</td><td style="font-weight:600">${esc(f.description||'-')}</td>
    <td><span class="badge badge-gray">${f.category||'-'}</span></td>
    <td>${f.type==='ລາຍຮັບ'?'<span class="badge badge-green">ລາຍຮັບ</span>':'<span class="badge badge-red">ລາຍຈ່າຍ</span>'}</td>
    <td style="font-weight:700;color:${f.type==='ລາຍຮັບ'?'var(--green)':'var(--red)'}">${fmt(f.amount)} ₭</td>
    <td style="color:var(--gray-500)">${esc(f.note||'-')}</td>
    <td><button class="btn-icon edit" onclick="editFin('${f.id}')"><i class="fa fa-pen"></i></button> <button class="btn-icon del" onclick="delFin('${f.id}')"><i class="fa fa-trash"></i></button></td></tr>`).join('');
}
function getCategories(){
  const stored=localStorage.getItem('finance_categories');
  if(stored) return JSON.parse(stored);
  const defaultCats=['ຍອດຂາຍ','ຄ່າໂຄສະນາ','ຄ່າຈ້າງ','ຄ່າເຊົ່າ','ຄ່າຂົນສົ່ງ','ອຸປະກອນ','ອື່ນໆ'];
  localStorage.setItem('finance_categories',JSON.stringify(defaultCats));
  return defaultCats;
}
function saveCategories(cats){
  localStorage.setItem('finance_categories',JSON.stringify(cats));
}
function loadCatDropdown(){
  const cats=getCategories();
  const sel=document.getElementById('f-cat');
  const currentVal=sel.value;
  sel.innerHTML=cats.map(c=>`<option>${esc(c)}</option>`).join('');
  if(cats.includes(currentVal)) sel.value=currentVal;
}
function openCatModal(){
  renderCatList();
  openModal('modal-cat');
}
function renderCatList(){
  const cats=getCategories();
  const el=document.getElementById('cat-list');
  el.innerHTML=cats.map((c,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--gray-200)"><span>${esc(c)}</span><button class="btn-icon del" onclick="delCategory(${i})"><i class="fa fa-trash"></i></button></div>`).join('');
}
function addCategory(){
  const input=document.getElementById('cat-new');
  const name=input.value.trim();
  if(!name){toast('ກະລຸນາປ້ອນຊື່หมวดหมู่','error');return;}
  const cats=getCategories();
  if(cats.includes(name)){toast('หมวดหมู่นี้มีอยู่แล้ว','error');return;}
  cats.push(name);
  saveCategories(cats);
  input.value='';
  renderCatList();
  loadCatDropdown();
  toast('เพิ่มหมวดหมู่สำเร็จ','success');
}
async function delCategory(index){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:'ລົບໝວດນີ້?',
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const cats=getCategories();
  cats.splice(index,1);
  saveCategories(cats);
  renderCatList();
  loadCatDropdown();
  toast('ลบหมวดหมู่สำเร็จ','success');
}
function populateFinProductDropdown(){
  const sel=document.getElementById('f-product');
  if(!sel) return;
  const currentVal=sel.value;
  sel.innerHTML='<option value="">-- ເລືອກສິນຄ້າ --</option>'+(S.db.products||[]).map(p=>`<option>${esc(p.name)}</option>`).join('');
  if(currentVal) sel.value=currentVal;
}
function openFinanceModal(){loadCatDropdown();populateFinProductDropdown();sv('fin-id','');document.getElementById('fin-title').textContent='ເພີ່ມລາຍການ';sv('f-date',today());sv('f-type','ລາຍຮັບ');sv('f-desc','');sv('f-cat','ຍອດຂາຍ');sv('f-product','');sv('f-amount','');sv('f-note','');openModal('modal-finance');}
function editFin(id){
  const f=S.db.finance.find(x=>x.id===id); if(!f) return;
  loadCatDropdown();
  populateFinProductDropdown();
  document.getElementById('fin-title').textContent='ແກ້ໄຂລາຍການ';
  sv('fin-id',id);sv('f-date',f.date);sv('f-type',f.type);sv('f-desc',f.description);sv('f-cat',f.category||'');sv('f-product',f.product_name||'');sv('f-amount',f.amount);sv('f-note',f.note||'');
  openModal('modal-finance');
}
async function saveFinance(){
  const date=v('f-date'),desc=v('f-desc'),amt=+v('f-amount'),product=v('f-product');
  if(!date||!desc||!amt){toast('ກະລຸນາປ້ອນຂໍ້ມູນ','error');return;}
  if(!product){toast('ກະລຸນາເລືອກສິນຄ້າ','error');return;}
  const pl={company_id:S.company.id,user_id:S.user.id,date,description:desc,category:v('f-cat'),type:v('f-type'),amount:amt,product_name:product,note:v('f-note')||null};
  const eid=v('fin-id'); let err;
  if(eid){const{error}=await sb.from('finance').update(pl).eq('id',eid);err=error;if(!err)S.db.finance=S.db.finance.map(x=>x.id===eid?{...x,...pl}:x);}
  else{const{data,error}=await sb.from('finance').insert(pl).select().single();err=error;if(!err)S.db.finance.unshift(data);}
  if(err){toast(err.message,'error');return;}
  closeModal('modal-finance'); toast('ບັນທຶກສຳເລັດ ✓','success'); renderFin();
}
async function delFin(id){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:'ລຶບລາຍການນີ້?',
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const{error}=await sb.from('finance').delete().eq('id',id);
  if(error){toast(error.message,'error');return;}
  S.db.finance=S.db.finance.filter(x=>x.id!==id); toast('ລຶບສຳເລັດ','success'); renderFin();
}
