// ══════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════
let productCategories=['ສະໝຸນໄພ','ສ້ຽວ/ອຸປະກອນ','ຊຸດ','ອື່ນໆ'];

function renderProductsTable(){
  const q=v('prod-search').toLowerCase();
  const data=S.db.products.filter(p=>!q||(p.name||'').toLowerCase().includes(q)||(p.sku||'').toLowerCase().includes(q));
  const tb=document.getElementById('prod-tbody');
  if(!data.length){tb.innerHTML='<tr><td colspan="9"><div class="empty"><i class="fa fa-box-open"></i><p>ຍັງບໍ່ມີສິນຄ້າ</p></div></td></tr>';return;}
  tb.innerHTML=data.map(p=>`<tr>
    <td style="font-weight:700">${esc(p.name)}</td><td style="font-size:12px;color:var(--gray-500)">${p.sku||'-'}</td>
    <td><span class="badge badge-gray">${p.category||'-'}</span></td>
    <td style="font-weight:600">${fmt(p.price)} ₭</td><td>${fmt(p.cost)} ₭</td>
    <td style="color:var(--green);font-weight:600">${fmt(p.price-p.cost)} ₭</td>
    <td style="text-align:center;font-weight:700;color:${(p.stock||0)<=5?'var(--red)':'inherit'}">${p.stock||0}</td>
    <td>${p.status==='ວາງຂາຍ'?'<span class="badge badge-green">ວາງຂາຍ</span>':p.status==='ໝົດ'?'<span class="badge badge-red">ໝົດ</span>':'<span class="badge badge-gray">ຢຸດ</span>'}</td>
    <td><button class="btn-icon edit" onclick="editProduct('${p.id}')"><i class="fa fa-pen"></i></button> <button class="btn-icon del" onclick="delProduct('${p.id}')"><i class="fa fa-trash"></i></button></td></tr>`).join('');
}
function openProductModal(){
  sv('prod-id','');document.getElementById('prod-title').textContent='ເພີ່ມສິນຄ້າ';
  sv('p-name','');sv('p-sku','');sv('p-cat','ສະໝຸນໄພ');sv('p-price','');sv('p-cost','');sv('p-stock',0);sv('p-status','ວາງຂາຍ');
  updateProductCategoryOptions();
  openModal('modal-product');
}
function editProduct(id){
  const p=S.db.products.find(x=>x.id===id); if(!p) return;
  document.getElementById('prod-title').textContent='ແກ້ໄຂສິນຄ້າ';
  sv('prod-id',id);sv('p-name',p.name);sv('p-sku',p.sku||'');sv('p-cat',p.category||'');sv('p-price',p.price);sv('p-cost',p.cost);sv('p-stock',p.stock||0);sv('p-status',p.status);
  updateProductCategoryOptions();
  openModal('modal-product');
}
function updateProductCategoryOptions(){
  const sel=document.getElementById('p-cat');
  if(!sel) return;
  sel.innerHTML='';
  productCategories.forEach(c=>{
    const opt=document.createElement('option');
    opt.value=c;
    opt.textContent=c;
    sel.appendChild(opt);
  });
}
function openProductCatModal(){
  renderProductCategories();
  openModal('modal-product-cat');
}
function renderProductCategories(){
  const list=document.getElementById('prod-cat-list');
  if(!list) return;
  list.innerHTML=productCategories.map((c,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--gray-50);border-radius:6px;margin-bottom:6px">
    <span style="flex:1;font-size:13px">${esc(c)}</span>
    <button class="btn-icon del" onclick="deleteProductCategory(${i})" style="color:var(--red)"><i class="fa fa-trash"></i></button>
  </div>`).join('');
}
function addProductCategory(){
  const name=v('prod-cat-new').trim();
  if(!name){toast('ກະລຸນາໃສ່ຊື່ຫມວດ','error');return;}
  if(productCategories.includes(name)){toast('ຫມວດນີ້ມີແລ້ວ','error');return;}
  productCategories.push(name);
  sv('prod-cat-new','');
  renderProductCategories();
  updateProductCategoryOptions();
  toast('ເພີ່ມຫມວດສຳເລັດ','success');
}
function deleteProductCategory(index){
  const confirmed=confirm('ຕ້ອງການລົບຫມວດນີ້ບໍ?');
  if(!confirmed) return;
  productCategories.splice(index,1);
  renderProductCategories();
  updateProductCategoryOptions();
  toast('ລົບຫມວດສຳເລັດ','success');
}
async function saveProduct(){
  const name=v('p-name'); if(!name){toast('ກະລຸນາໃສ່ຊື່','error');return;}
  const pl={company_id:S.company.id,name,sku:v('p-sku')||null,category:v('p-cat'),price:+v('p-price')||0,cost:+v('p-cost')||0,stock:+v('p-stock')||0,status:v('p-status')};
  const eid=v('prod-id'); let err;
  if(eid){const{error}=await sb.from('products').update(pl).eq('id',eid);err=error;if(!err)S.db.products=S.db.products.map(x=>x.id===eid?{...x,...pl}:x);}
  else{const{data,error}=await sb.from('products').insert(pl).select().single();err=error;if(!err)S.db.products.push(data);}
  if(err){toast(err.message,'error');return;}
  closeModal('modal-product'); toast('ບັນທຶກສຳເລັດ ✓','success'); renderProductsTable();
}
async function delProduct(id){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:'ລຶບສິນຄ້ານີ້?',
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const{error}=await sb.from('products').delete().eq('id',id);
  if(error){toast(error.message,'error');return;}
  S.db.products=S.db.products.filter(x=>x.id!==id); toast('ລຶບສຳເລັດ','success'); renderProductsTable();
}
