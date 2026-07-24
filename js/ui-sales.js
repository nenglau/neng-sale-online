//  SALES
// ══════════════════════════════════════
function setSalesTab(tab){
  S.salesTab=tab;
  S.pendingEditMode=false;
  document.getElementById('sales-panel-pending').style.display=tab==='pending'?'block':'none';
  document.getElementById('sales-panel-manage').style.display=tab==='manage'?'block':'none';
  document.getElementById('sales-tab-pending').classList.toggle('active',tab==='pending');
  document.getElementById('sales-tab-manage').classList.toggle('active',tab==='manage');
  if(tab==='pending') renderPendingOrders();
  else renderSalesTable();
}
function renderSalesPage(){
  // Update pending badge count
  const cnt=S.db.sales.filter(s=>s.status==='ລໍຖ້າ').length;
  const badge=document.getElementById('tab-pending-badge');
  if(badge) badge.textContent=cnt;
  setSalesTab(S.salesTab);
}
function renderPendingOrders(){
  // Exit edit mode UI reset
  const toolbar=document.getElementById('pending-edit-toolbar');
  if(toolbar) toolbar.classList.toggle('visible',S.pendingEditMode);
  const btnEdit=document.getElementById('btn-pending-edit');
  if(btnEdit) btnEdit.style.background=S.pendingEditMode?'var(--green)':''  , btnEdit.style.color=S.pendingEditMode?'#fff':'';

  const data=getPendingPeriodData();
  const countEl=document.getElementById('pending-count-label');
  if(countEl) countEl.textContent=data.length?`${data.length} ລາຍການ`:'';
  const container=document.getElementById('pending-orders-list');
  const cardsEl=document.getElementById('pending-cards');
  if(!container) return;
  if(!data.length){
    container.innerHTML='<div class="empty"><i class="fa fa-check-circle" style="color:var(--green)"></i><p>ບໍ່ມີອໍເດີຕ້ອງສົ່ງ 🎉</p></div>';
    if(cardsEl) cardsEl.innerHTML='<div class="empty"><i class="fa fa-check-circle" style="color:var(--green)"></i><p>ບໍ່ມີອໍເດີຕ້ອງສົ່ງ 🎉</p></div>';
    return;
  }
  container.className='panel-body'+(S.pendingEditMode?' edit-mode':'');
  container.style.padding='12px 16px';
  container.innerHTML=data.map(s=>{
    const tot=s.qty*s.price-(s.discount||0);
    // Find shipping info from branches
    const sc=S.db.shipCos.find(x=>x.name===s.shipping_company);
    const br=sc?S.db.systemBranches.find(b=>b.shipping_company_id===sc.id&&b.name===s.branch):null;
    const prov=br?br.province:(s.province||'');
    const dist=br?br.district:(s.district||'');
    const branchName=s.branch||'';
    const shipLine=[prov,dist,branchName].filter(Boolean);
    return `<div class="order-card" id="ocard-${s.id}">
      <input type="checkbox" class="order-card-check" id="chk-${s.id}" onchange="updatePendingCount()">
      <div class="order-card-row">
        <div class="order-field"><i class="fa fa-calendar" style="color:var(--gray-500);font-size:12px"></i> ${fmtDate(s.date)}</div>
        <div class="order-field"><strong style="font-size:14px">${esc(s.customer_name||'—')}</strong></div>
        <div class="order-field" style="font-weight:700;font-size:15px;color:var(--blue)">${s.customer_phone?`<i class="fa fa-phone" style="font-size:13px"></i> ${esc(s.customer_phone)}`:'—'}</div>
        <div class="order-field">${s.channel?`<span class="order-channel-tag ${getChannelClass(s.channel)}">${esc(s.channel)}</span>`:''}</div>
        <div class="order-field highlight"><i class="fa fa-box" style="font-size:12px"></i> ${esc(s.product_name||'-')} × ${s.qty}</div>
        <div class="order-field"><strong style="color:var(--green-dark);font-size:15px">${fmt(tot)} ₭</strong></div>
        <div class="order-card-actions">
          <button class="btn-icon edit" onclick="editSale('${s.id}')" title="ແກ້ໄຂ"><i class="fa fa-pen"></i></button>
          <button class="btn-icon del" onclick="delSale('${s.id}')" title="ລຶບ"><i class="fa fa-trash"></i></button>
        </div>
      </div>
      ${shipLine.length?`<div style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${s.shipping_company?`<span class="order-shipping-tag" style="background:${getShippingCompanyColor(s.shipping_company)};color:${getShippingCompanyTextColor(s.shipping_company)}"><i class="fa fa-truck"></i>${esc(s.shipping_company)}</span>`:''}
        ${shipLine.length?`<span style="font-size:13px;color:var(--gray-700);font-weight:600"><i class="fa fa-map-marker-alt" style="color:var(--green);font-size:12px"></i> ${esc(shipLine.join(' › '))}</span>`:''}
      </div>`:''}
    </div>`;
  }).join('');

  // ── Mobile card view (ອໍເດີຕ້ອງສົ່ງ): 3-row layout, same as ຈັດການຍອດ ──
  if(cardsEl){
    cardsEl.innerHTML=data.map((s,i)=>{
      const tot=s.qty*s.price-(s.discount||0);
      const sc=S.db.shipCos.find(x=>x.name===s.shipping_company);
      const br=sc?S.db.systemBranches.find(b=>b.shipping_company_id===sc.id&&b.name===s.branch):null;
      const prov=stripLaoPrefix(br?br.province:(s.province||''),'ແຂວງ');
      const dist=stripLaoPrefix(br?br.district:(s.district||''),'ເມືອງ');
      const branch=stripLaoPrefix(s.branch,'ສາຂາ');
      const shipStyle=shippingCardStyle(s.shipping_company);
      const loc=[prov,dist,branch].filter(Boolean).map(esc).join(' > ')||'-';
      const custBits=[s.customer_phone?esc(s.customer_phone):'',s.customer_name?esc(s.customer_name):''].filter(Boolean).join(' / ')||'-';
      return `<div class="sale-card" onclick="editSale('${s.id}')">
        <div class="sc-row sc-row1">
          <div class="sc-row1l">
            <input type="checkbox" class="order-card-check sc-chk" data-id="${s.id}" onclick="event.stopPropagation()" onchange="updatePendingCount()">
            <span class="sc-idx">#${i+1}</span>
            <span class="sc-date">${fmtDate(s.date)}</span>
          </div>
          <div class="sc-row1r">
            ${s.channel?`<span class="order-channel-tag ${getChannelClass(s.channel)}">${esc(s.channel)}</span>`:''}
            ${s.shipping_company?`<span class="sc-ship-badge"${shipStyle?` style="color:${shipStyle.color};background:${shipStyle.bg}"`:''}>${esc(s.shipping_company)}</span>`:''}
          </div>
        </div>
        <div class="sc-row sc-row2">
          <div class="sc-product">${esc(s.product_name||'-')} × ${s.qty}</div>
          <div class="sc-cust">${custBits}</div>
        </div>
        <div class="sc-row sc-row3">
          <div class="sc-loc">📍 ${loc}</div>
          <div class="sc-amt">${fmt(tot)} ກີບ</div>
        </div>
      </div>`;
    }).join('');
  }
  updatePendingCount();
}
function togglePendingEditMode(){
  S.pendingEditMode=!S.pendingEditMode;
  renderPendingOrders();
}
function visibleOrderChks(){
  // Both the desktop pending list and mobile card view render .order-card-check
  // elements; only one set is visually shown at a time (CSS media query). Scope to
  // the visible set so bulk-select counts/ids never double up.
  return [...document.querySelectorAll('.order-card-check')].filter(c=>c.offsetParent!==null);
}
function orderChkId(c){
  return c.dataset.id||c.id.replace('chk-','');
}
function updatePendingCount(){
  const checked=visibleOrderChks().filter(c=>c.checked).length;
  const el=document.getElementById('pending-selected-count');
  if(el) el.textContent=checked?`ເລືອກ ${checked} ລາຍການ`:'';
  // highlight selected cards
  document.querySelectorAll('.order-card').forEach(card=>{
    const chk=card.querySelector('.order-card-check');
    card.classList.toggle('selected',chk&&chk.checked);
  });
}
function selectAllPending(){
  const checks=visibleOrderChks();
  const allChecked=checks.every(c=>c.checked);
  checks.forEach(c=>c.checked=!allChecked);
  updatePendingCount();
}
async function markShippedAndPrint(){
  const checked=visibleOrderChks().filter(c=>c.checked);
  if(!checked.length){toast('ກະລຸນາເລືອກລາຍການ','error');return;}
  const ids=checked.map(orderChkId);
  const ordersToShip=S.db.sales.filter(s=>ids.includes(s.id));
  // Update Supabase
  const{error}=await sb.from('sales').update({status:'ສຳເລັດ'}).in('id',ids);
  if(error){toast(error.message,'error');return;}
  S.db.sales=S.db.sales.map(s=>ids.includes(s.id)?{...s,status:'ສຳເລັດ'}:s);
  toast(`ອັບເດດ ${ids.length} ລາຍການ → ສຳເລັດ ✓`,'success');
  // Print
  printShippingOrders(ordersToShip);
  S.pendingEditMode=false;
  renderPendingOrders();
  // Update badge
  const cnt=S.db.sales.filter(s=>s.status==='ລໍຖ້າ').length;
  const badge=document.getElementById('tab-pending-badge');
  if(badge) badge.textContent=cnt;
}
function printShippingOrders(orders){
  const seller=getSellerInfo();
  const cards=orders.map((s,idx)=>{
    const tot=s.qty*s.price-(s.discount||0);
    const sc=S.db.shipCos.find(x=>x.name===s.shipping_company);
    const br=sc?S.db.systemBranches.find(b=>b.shipping_company_id===sc.id&&b.name===s.branch):null;
    const prov=br?br.province:(s.province||'');
    const dist=br?br.district:(s.district||'');
    const branchName=s.branch||'';
    // fix2: case-insensitive product lookup, use category field
    const prodName=(s.product_name||'').trim().toLowerCase();
    const prod=S.db.products.find(p=>(p.name||'').trim().toLowerCase()===prodName);
    const category=prod&&prod.category?prod.category:'';
    const isLast=idx===orders.length-1;
    return `<div class="card${isLast?'':' page-break'}">
      <!-- SENDER HALF -->
      <div class="sender">
        <div class="shop-name">ຮ້ານ: <strong>${esc(seller.shop)}</strong></div>
        <div class="seller-row">
          <span>ເບີໂທ: <strong>${esc(seller.phone)}</strong> ${esc(seller.name)}</span>
          <span>ປະເພດ: <strong>${esc(category)}</strong></span>
        </div>
      </div>
      <div class="sep"></div>
      <!-- RECIPIENT HALF -->
      <div class="recipient">
        <div class="recip-name">ຜູ້ຮັບ: <strong>${esc(s.customer_name||'—')}</strong>${s.customer_phone?`<span class="phone"> ${esc(s.customer_phone)}</span>`:''}</div>
        <div class="row3">
          <span class="c3l">ສາຂາ: <strong>${esc(branchName)}</strong></span>
          <span class="c3m">ເມືອງ: <strong>${esc(dist)}</strong></span>
          <span class="c3r">ແຂວງ: <strong>${esc(prov)}</strong></span>
        </div>
        <div class="row2 cod-row">
          <span>COD: <strong>${fmt(tot)}</strong> ກີບ</span>
          <span class="field-r">ວັນທີ: <strong>${esc(fmtDate(s.date))}</strong></span>
        </div>
      </div>
      <div class="ship-footer">ຂົນສົ່ງ: <strong>${esc(s.shipping_company||'')}</strong></div>
    </div>`;
  }).join('');
  const html=`<!DOCTYPE html><html lang="lo"><head><meta charset="UTF-8">
  <title>ລາຍການຈັດສົ່ງ</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap">
  <style>
    @page{size:85.6mm 53.98mm;margin:0}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Noto Sans Lao',sans-serif;font-size:8.5pt;color:#111;background:#fff}
    .card{width:85.6mm;height:53.98mm;padding:2.5mm 3mm;display:flex;flex-direction:column;border:0.5pt solid #bbb}
    .page-break{page-break-after:always}
    .sender{display:flex;flex-direction:column;justify-content:space-between;flex:1}
    .shop-name{text-align:center;font-size:9.5pt;padding-top:0.5mm}
    .seller-row{display:flex;justify-content:space-between;align-items:baseline;gap:1mm;font-size:7.5pt;padding-bottom:0.5mm}
    .recipient{display:flex;flex-direction:column;gap:1.1mm;padding-top:0.5mm;flex:1}
    .row2{display:flex;justify-content:space-between;align-items:baseline;gap:2mm}
    .row3{display:flex;align-items:baseline;gap:0.5mm;font-size:7pt}
    .c3l{flex:1.3;text-align:left;overflow:hidden;white-space:nowrap}
    .c3m{flex:1.1;text-align:left;overflow:hidden;white-space:nowrap}
    .c3r{flex:1.3;text-align:left;overflow:hidden;white-space:nowrap}
    .ship-footer{text-align:center;font-size:7.5pt;padding-top:1mm;border-top:0.5pt solid #ccc;margin-top:0.5mm}
    .field-r{text-align:right;white-space:nowrap}
    .col-r{text-align:left;white-space:nowrap;padding-left:3mm}
    .dots{letter-spacing:1pt;color:#333}
    .sep{border-top:1pt dashed #666;margin:1.5mm 0 0.5mm}
    .recip-name{font-size:9pt}
    .phone{color:#444;font-size:8pt}
    .cod-row{margin-top:0.5mm}
    *{font-weight:400!important;color:#000!important}
    @media print{body{-webkit-print-color-adjust:exact}}
  </style>
  </head><body>
  ${cards}
  <script>window.onload=function(){window.print();}<\/script>
  </body></html>`;
  const w=window.open('','_blank','width=500,height=400');
  if(w){w.document.write(html);w.document.close();}
}
function setSalesPeriod(p){
  S.salesPeriod=p;
  document.querySelectorAll('#sales-period .period-tab').forEach(t=>t.classList.toggle('active',t.dataset.p===p));
  const btn=document.getElementById('sales-custom-btn');
  if(btn) btn.classList.toggle('active',p==='custom');
  renderSalesTable();
}
function getSalesPeriodData(){
  const now=new Date(), ym=now.toISOString().slice(0,7), yr=String(now.getFullYear());
  let data=S.db.sales;
  if(S.salesPeriod==='custom'&&S.customRanges.sales){
    const {start,end}=S.customRanges.sales;
    data=data.filter(s=>s.date>=start&&s.date<=end);
  }
  else if(S.salesPeriod==='7day'){const d7=new Date();d7.setDate(d7.getDate()-7);data=data.filter(s=>new Date(s.date)>=d7);}
  else if(S.salesPeriod==='month') data=data.filter(s=>s.date.startsWith(ym));
  else if(S.salesPeriod==='year') data=data.filter(s=>s.date.startsWith(yr));
  return data;
}
function setPendingPeriod(p){
  S.pendingPeriod=p;
  document.querySelectorAll('#pending-period .period-tab').forEach(t=>t.classList.toggle('active',t.dataset.p===p));
  const btn=document.getElementById('pending-custom-btn');
  if(btn) btn.classList.toggle('active',p==='custom');
  renderPendingOrders();
}
function getPendingPeriodData(){
  const now=new Date(), ym=now.toISOString().slice(0,7), yr=String(now.getFullYear());
  let data=S.db.sales.filter(s=>s.status==='ລໍຖ້າ');
  if(S.pendingPeriod==='custom'&&S.customRanges.pending){
    const {start,end}=S.customRanges.pending;
    data=data.filter(s=>s.date>=start&&s.date<=end);
  }
  else if(S.pendingPeriod==='7day'){const d7=new Date();d7.setDate(d7.getDate()-7);data=data.filter(s=>new Date(s.date)>=d7);}
  else if(S.pendingPeriod==='month') data=data.filter(s=>s.date.startsWith(ym));
  else if(S.pendingPeriod==='year') data=data.filter(s=>s.date.startsWith(yr));
  return data;
}
function renderSalesTable(){
  const q=v('sales-search').toLowerCase(), sf=v('sales-sf'), cf=v('sales-cf');
  let data=getSalesPeriodData();
  data=data.filter(s=>(!q||(s.product_name||'').toLowerCase().includes(q)||(s.customer_name||'').toLowerCase().includes(q)||(s.customer_phone||'').includes(q))&&(!sf||s.status===sf)&&(!cf||s.channel===cf));
  const tb=document.getElementById('sales-tbody');
  const cardsEl=document.getElementById('sales-cards');
  if(!data.length){
    tb.innerHTML='<tr><td colspan="13"><div class="empty"><i class="fa fa-inbox"></i><p>ຍັງບໍ່ມີຂໍ້ມູນ</p></div></td></tr>';
    if(cardsEl) cardsEl.innerHTML='<div class="empty"><i class="fa fa-inbox"></i><p>ຍັງບໍ່ມີຂໍ້ມູນ</p></div>';
    return;
  }
  tb.innerHTML=data.map((s,i)=>{
    const tot=s.qty*s.price-(s.discount||0), pr=s.qty*(s.price-s.cost)-(s.discount||0);
    return `<tr><td><input type="checkbox" class="sale-chk" data-id="${s.id}" onchange="updateSalesBulkBar()" style="cursor:pointer"></td>
    <td style="color:var(--gray-500)">${i+1}</td><td>${fmtDate(s.date)}</td><td style="font-weight:700">${esc(s.product_name||'-')}</td>
    <td>${s.channel?`<span class="order-channel-tag ${getChannelClass(s.channel)}">${esc(s.channel)}</span>`:'-'}</td>
    <td>${s.shipping_company?`<span class="order-shipping-tag" style="background:${getShippingCompanyColor(s.shipping_company)};color:${getShippingCompanyTextColor(s.shipping_company)};font-size:11px;padding:2px 8px">${esc(s.shipping_company)}</span>`:'-'}</td>
    <td>
      <div style="font-weight:600;font-size:14px">${esc(s.customer_name||'-')}</div>
      <div style="font-weight:700;font-size:15px;color:var(--blue);margin-top:4px">${s.customer_phone||'-'}</div>
      <div style="font-size:13px;color:var(--gray-700);margin-top:2px">
        ${s.district?esc(s.district):''}${s.district && s.province?', ':''}${s.province?esc(s.province):''}
      </div>
      <div style="font-size:12px;color:var(--gray-500)">${s.branch?esc(s.branch):''}</div>
    </td>
    <td style="text-align:center">${s.qty}</td><td>${fmt(s.price)} ₭</td>
    <td style="color:var(--orange)">${s.discount?fmt(s.discount)+' ₭':'-'}</td>
    <td style="font-weight:700">${fmt(tot)} ₭</td>
    <td style="font-weight:700;color:${pr>=0?'var(--green)':'var(--red)'}">${fmt(pr)} ₭</td>
    <td>${badge(s.status)}</td>
    <td><button class="btn-icon edit" onclick="editSale('${s.id}')"><i class="fa fa-pen"></i></button> <button class="btn-icon del" onclick="delSale('${s.id}')"><i class="fa fa-trash"></i></button></td></tr>`;
  }).join('');

  // ── Mobile card view (ຈັດການຍອດ): 3-row layout per card ──
  if(cardsEl){
    cardsEl.innerHTML=data.map((s,i)=>{
      const tot=s.qty*s.price-(s.discount||0);
      const prov=stripLaoPrefix(s.province,'ແຂວງ');
      const dist=stripLaoPrefix(s.district,'ເມືອງ');
      const branch=stripLaoPrefix(s.branch,'ສາຂາ');
      const shipStyle=shippingCardStyle(s.shipping_company);
      const loc=[prov,dist,branch].filter(Boolean).map(esc).join(' > ')||'-';
      const custBits=[s.customer_phone?esc(s.customer_phone):'',s.customer_name?esc(s.customer_name):''].filter(Boolean).join(' / ')||'-';
      return `<div class="sale-card" onclick="editSale('${s.id}')">
        <div class="sc-row sc-row1">
          <div class="sc-row1l">
            <input type="checkbox" class="sale-chk sc-chk" data-id="${s.id}" onclick="event.stopPropagation()" onchange="updateSalesBulkBar()">
            <span class="sc-idx">#${i+1}</span>
            <span class="sc-date">${fmtDate(s.date)}</span>
          </div>
          <div class="sc-row1r">
            ${s.channel?`<span class="order-channel-tag ${getChannelClass(s.channel)}">${esc(s.channel)}</span>`:''}
            ${s.shipping_company?`<span class="sc-ship-badge"${shipStyle?` style="color:${shipStyle.color};background:${shipStyle.bg}"`:''}>${esc(s.shipping_company)}</span>`:''}
          </div>
        </div>
        <div class="sc-row sc-row2">
          <div class="sc-product">${esc(s.product_name||'-')}</div>
          <div class="sc-cust">${custBits}</div>
        </div>
        <div class="sc-row sc-row3">
          <div class="sc-loc">📍 ${loc}</div>
          <div class="sc-amt">${fmt(tot)} ກີບ</div>
        </div>
      </div>`;
    }).join('');
  }

  // reset header checkbox
  const ca=document.getElementById('sales-chk-all'); if(ca) ca.checked=false;
  updateSalesBulkBar();
}
function visibleSaleChks(){
  // Both the desktop table and mobile card view render .sale-chk elements; only one
  // set is visually shown at a time (CSS media query). Scope to the visible set so
  // bulk-select counts/ids never double up.
  return [...document.querySelectorAll('.sale-chk')].filter(c=>c.offsetParent!==null);
}
function toggleSelectAllSales(checked){
  visibleSaleChks().forEach(c=>c.checked=checked);
  updateSalesBulkBar();
}
function updateSalesBulkBar(){
  const all=visibleSaleChks();
  const checked=all.filter(c=>c.checked);
  const bar=document.getElementById('sales-bulk-bar');
  const lbl=document.getElementById('sales-bulk-count');
  const ca=document.getElementById('sales-chk-all');
  if(bar) bar.style.display=checked.length?'flex':'none';
  if(lbl) lbl.textContent=`ເລືອກແລ້ວ ${checked.length} ລາຍການ`;
  if(ca) ca.indeterminate=checked.length>0&&checked.length<all.length, ca.checked=all.length>0&&checked.length===all.length;
}
function clearSalesSelection(){
  visibleSaleChks().forEach(c=>c.checked=false);
  const ca=document.getElementById('sales-chk-all'); if(ca) ca.checked=false;
  updateSalesBulkBar();
}
async function bulkDeleteSales(){
  const ids=visibleSaleChks().filter(c=>c.checked).map(c=>c.dataset.id);
  if(!ids.length) return;
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:`ລົບ ${ids.length} ລາຍການທີ່ເລືອກ?\nການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້`,
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const{error}=await sb.from('sales').delete().in('id',ids);
  if(error){toast(error.message,'error');return;}
  S.db.sales=S.db.sales.filter(s=>!ids.includes(s.id));
  toast(`ລົບ ${ids.length} ລາຍການສຳເລັດ`,'success');
  renderSalesTable(); updatePendingCount();
}
let _editingOriginalStatus=null;
function toggleCancelFeeSection(){
  const show=v('s-status')==='ຍົກເລີກ';
  const el=document.getElementById('cancel-fee-section');
  if(el) el.style.display=show?'block':'none';
}
function openSaleModal(){
  sv('sale-id',''); document.getElementById('sale-modal-title').textContent='ເພີ່ມການຂາຍໃໝ່';
  // Reset to add mode: only ລໍຖ້າ
  document.getElementById('s-status').innerHTML='<option>ລໍຖ້າ</option>';
  _editingOriginalStatus=null;
  sv('s-cancel-shipfee',''); sv('s-cancel-note',''); toggleCancelFeeSection();
  sv('s-date',today()); sv('s-cname',''); sv('s-cphone',''); sv('s-ship','');
  populateProvinces(); sv('s-prov',''); sv('s-dist',''); sv('s-branch','');
  sv('s-prod',''); sv('s-qty',1); sv('s-price',''); sv('s-cost',''); sv('s-disc',0); sv('s-status','ລໍຖ້າ'); sv('s-note','');
  buildShipCombo(); buildProvCombo(); buildDistCombo(); buildBranchCombo(); buildProdCombo(); calcTotal();
  openModal('modal-sale');
}
function editSale(id){
  const s=S.db.sales.find(x=>x.id===id); if(!s) return;
  document.getElementById('sale-modal-title').textContent='ແກ້ໄຂການຂາຍ';
  // Show all status options when editing
  const sel=document.getElementById('s-status');
  sel.innerHTML='<option>ລໍຖ້າ</option><option>ຈັດສົ່ງ</option><option>ສຳເລັດ</option><option>ຍົກເລີກ</option>';
  _editingOriginalStatus=s.status;
  sv('sale-id',id); sv('s-date',s.date); sv('s-channel',s.channel||'Facebook');
  sv('s-cname',s.customer_name||''); sv('s-cphone',s.customer_phone||'');
  sv('s-ship',s.shipping_company||''); populateProvinces(s.province||'');
  setTimeout(()=>{sv('s-prov',s.province||''); updateDistricts(s.district||'');},30);
  sv('s-branch',s.branch||''); sv('s-prod',s.product_name||'');
  sv('s-qty',s.qty); sv('s-price',s.price); sv('s-cost',s.cost);
  sv('s-disc',s.discount||0); sv('s-status',s.status); sv('s-note',s.note||'');
  sv('s-cancel-shipfee',''); sv('s-cancel-note',''); toggleCancelFeeSection();
  buildShipCombo(); buildProvCombo(); buildDistCombo(); buildBranchCombo(); buildProdCombo(); calcTotal(); openModal('modal-sale');
}
let _savingSale=false;
async function saveSale(){
  if(_savingSale) return; // ignore double-click/double-tap while a save is already running
  _savingSale=true;
  const btn=document.getElementById('btn-save-sale');
  if(btn) btn.disabled=true;
  try{
    const date=v('s-date'),prod=v('s-prod'),qty=+v('s-qty')||1,price=+v('s-price')||0,cost=+v('s-cost')||0;
    if(!date||!prod){toast('ກະລຸນາປ້ອນ ວັນທີ ແລະ ສິນຄ້າ','error');return;}
    const ship=v('s-ship').trim();
    // Shipping company must already exist (fixed reference data) — no auto-create here.
    const shipCoObj=S.db.shipCos.find(x=>x.name.trim()===ship);
    const branch=v('s-branch').trim();
    const prov=v('s-prov').trim();
    const dist=v('s-dist').trim();

    // Branch is the one thing that can be new: if it doesn't already exist under the
    // selected shipping company + province + district, create it in system_branches now.
    if(branch && prov && shipCoObj){
      const distNorm=dist||'';
      const exists=(S.db.systemBranches||[]).some(b=>
        (b.name||'').trim()===branch &&
        (b.province||'').trim()===prov &&
        (b.district||'').trim()===distNorm &&
        b.shipping_company_id===shipCoObj.id
      );
      if(!exists){
        const bpayload={shipping_company_id:shipCoObj.id,name:branch,province:prov,district:distNorm};
        const{data:nb,error:berr}=await sb.from('system_branches').insert(bpayload).select().single();
        if(berr){
          toast('ບໍ່ສາມາດບັນທຶກສາຂາໃໝ່: '+berr.message,'error');
        } else if(nb){
          S.db.branches.push(nb); S.db.branches.sort((a,b)=>a.name.localeCompare(b.name));
          S.db.systemBranches.push(nb); S.db.systemBranches.sort((a,b)=>a.name.localeCompare(b.name));
        }
      }
    }

    const pl={company_id:S.company.id,user_id:S.user.id,date,channel:v('s-channel'),
      customer_name:v('s-cname')||null,customer_phone:v('s-cphone')||null,
      product_name:prod,qty,price,cost,discount:+v('s-disc')||0,
      shipping_company:ship||null,province:prov||null,district:dist||null,branch:branch||null,
      status:v('s-status'),note:v('s-note')||null};
    const eid=v('sale-id'); let err;
    if(eid){const{error}=await sb.from('sales').update(pl).eq('id',eid);err=error;if(!err)S.db.sales=S.db.sales.map(x=>x.id===eid?{...x,...pl}:x);}
    else{const{data,error}=await sb.from('sales').insert(pl).select().single();err=error;if(!err)S.db.sales.unshift(data);}
    if(err){toast(err.message,'error');return;}

    // Cancelled order + shipping-cost entered → log it as a linked expense in ການເງິນ (once per transition into ຍົກເລີກ)
    const newStatus=v('s-status');
    const cancelFee=+v('s-cancel-shipfee')||0;
    if(newStatus==='ຍົກເລີກ' && _editingOriginalStatus!=='ຍົກເລີກ' && cancelFee>0){
      const finPl={company_id:S.company.id,user_id:S.user.id,date:today(),description:'ຕີກັບ',category:'ຄ່າຂົນສົ່ງ',type:'ລາຍຈ່າຍ',amount:cancelFee,product_name:prod,note:v('s-cancel-note')||null};
      const{data:finData,error:finErr}=await sb.from('finance').insert(finPl).select().single();
      if(finErr){toast('ບັນທຶກຄ່າຂົນສົ່ງບໍ່ສຳເລັດ: '+finErr.message,'error');}
      else if(finData){S.db.finance.unshift(finData);}
    }

    closeModal('modal-sale'); toast('ບັນທຶກສຳເລັດ ✓','success'); renderSalesPage();
  }catch(e){
    console.error('saveSale error:',e);
    toast('ເກີດຂໍ້ຜິດພາດ: '+(e?.message||e),'error');
  }finally{
    _savingSale=false;
    if(btn) btn.disabled=false;
  }
}
async function delSale(id){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:'ລຶບລາຍການນີ້?',
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const{error}=await sb.from('sales').delete().eq('id',id);
  if(error){toast(error.message,'error');return;}
  S.db.sales=S.db.sales.filter(x=>x.id!==id); toast('ລຶບສຳເລັດ','success'); renderSalesPage();
}
function calcTotal(){
  const q=+v('s-qty')||0,p=+v('s-price')||0,c=+v('s-cost')||0,d=+v('s-disc')||0;
  document.getElementById('c-total').textContent=fmt(q*p)+' ₭';
  document.getElementById('c-after').textContent=fmt(q*p-d)+' ₭';
  document.getElementById('c-profit').textContent=fmt(q*(p-c)-d)+' ₭';
}

// ══════════════════════════════════════
//  COMBO INPUTS
// ══════════════════════════════════════
function buildProdCombo(){
  const list=document.getElementById('combo-prod');
  list.innerHTML=S.db.products.map(p=>`<div class="combo-item" onmousedown="pickProd('${esc(p.name)}',${p.price},${p.cost})">${esc(p.name)}</div>`).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ຍັງບໍ່ມີສິນຄ້າ</div>';
}
function buildShipCombo(){
  const list=document.getElementById('combo-ship');
  list.innerHTML=S.db.shipCos.map(s=>`<div class="combo-item" onmousedown="pickShip('${esc(s.name)}')">${esc(s.name)}</div>`).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ຍັງບໍ່ມີ — ພິມຊື່ໄດ້ທັນທີ</div>';
}
function pickShip(name){
  sv('s-ship',name); sv('s-prov',''); sv('s-dist',''); sv('s-branch','');
  sv('br-ship',name); sv('br-prov',''); sv('br-dist','');
  buildProvCombo(); buildDistCombo(); buildBranchCombo(); closeCombo('ship');
  // Rebuild branch combo to filter by selected shipping company
  setTimeout(()=>buildBranchCombo(),50);
}
function buildProvCombo(){
  const list=document.getElementById('combo-prov');
  list.innerHTML=getAllProvinces().map(p=>`<div class="combo-item" onmousedown="pickProv('${esc(p)}')">${esc(p)}</div>`).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ຍັງບໍ່ມີ</div>';
}
function pickProv(name){
  sv('s-prov',name); sv('s-dist',''); sv('s-branch','');
  buildDistCombo(); buildBranchCombo(); closeCombo('prov');
  // Rebuild branch combo to filter by selected province
  setTimeout(()=>buildBranchCombo(),50);
}
function buildDistCombo(){
  const prov=v('s-prov').trim();
  const list=document.getElementById('combo-dist');
  list.innerHTML=prov?getAllDistricts(prov).map(d=>`<div class="combo-item" onmousedown="pickDist('${esc(d)}')">${esc(d)}</div>`).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ຍັງບໍ່ມີ</div>':'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ເລືອກແຂວງກ່ອນ</div>';
}
function pickDist(name){
  sv('s-dist',name); sv('s-branch','');
  buildBranchCombo(); closeCombo('dist');
  // Rebuild branch combo to filter by selected district
  setTimeout(()=>buildBranchCombo(),50);
}
function buildBranchCombo(){
  const provName=v('s-prov').trim();
  const distName=v('s-dist').trim();
  const shipName=v('s-ship').trim();
  const list=document.getElementById('combo-branch');
  if(!list) return;

  // Get branches from system_branches (shared across all users)
  let systemBranches=S.db.systemBranches||[];
  if(provName) systemBranches=systemBranches.filter(b=>(b.province||'').trim()===provName);
  if(distName) systemBranches=systemBranches.filter(b=>(b.district||'').trim()===distName);
  if(shipName){
    const shipCo=S.db.shipCos.find(x=>x.name.trim()===shipName);
    if(shipCo) systemBranches=systemBranches.filter(b=>b.shipping_company_id===shipCo.id);
  }

  list.innerHTML=systemBranches.map(b=>{
    const shipCo=S.db.shipCos.find(x=>x.id===b.shipping_company_id);
    const shipName=shipCo?shipCo.name:'';
    return `<div class="combo-item" onmousedown="pickBranchWithLocation('${esc(b.name)}','${esc(b.province)}','${esc(b.district)}','${esc(shipName)}')">${esc(b.name)} <small style="color:var(--gray-500)">(${esc(shipName)}, ${esc(b.province)}, ${esc(b.district)})</small></div>`;
  }).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ຍັງບໍ່ມີ — ພິມຊື່ໄດ້ທັນທີ</div>';
}
function openBranchAllCombo(){
  const list=document.getElementById('combo-branch');
  if(!list) return;
  
  // Require shipping company to be selected
  const shipName=v('s-ship').trim();
  if(!shipName){
    list.innerHTML='<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ກະລຸນາເລືອກບໍລິສັດຂົນສົ່ງກ່ອນ</div>';
    openCombo('branch');
    return;
  }
  
  // Show branches filtered by shipping company, province, and district
  const shipCo=S.db.shipCos.find(x=>x.name.trim()===shipName);
  const provName=v('s-prov').trim();
  const distName=v('s-dist').trim();
  const allBranches=S.db.systemBranches||[];
  let filtered=shipCo?allBranches.filter(b=>b.shipping_company_id===shipCo.id):[];
  if(provName) filtered=filtered.filter(b=>(b.province||'').trim()===provName);
  if(distName) filtered=filtered.filter(b=>(b.district||'').trim()===distName);
  list.innerHTML=filtered.map(b=>`<div class="combo-item" onmousedown="pickBranchWithLocation('${esc(b.name)}','${esc(b.province)}','${esc(b.district)}','${esc(shipName)}')">${esc(b.name)} <small style="color:var(--gray-500)">(${esc(b.province)}, ${esc(b.district)})</small></div>`).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ຍັງບໍ່ມີ</div>';
  openCombo('branch');
}
function filterBranchAll(){
  const input=v('s-branch').toLowerCase();
  const list=document.getElementById('combo-branch');
  if(!list) return;

  // Require shipping company to be selected
  const shipName=v('s-ship').trim();
  if(!shipName){
    list.innerHTML='<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ກະລຸນາເລືອກບໍລິສັດຂົນສົ່ງກ່ອນ</div>';
    openCombo('branch');
    return;
  }

  // Filter branches by name, shipping company, province, and district
  const shipCo=S.db.shipCos.find(x=>x.name.trim()===shipName);
  const provName=v('s-prov').trim();
  const distName=v('s-dist').trim();
  const allBranches=S.db.systemBranches||[];
  let filtered=shipCo?allBranches.filter(b=>b.shipping_company_id===shipCo.id):[];
  if(provName) filtered=filtered.filter(b=>(b.province||'').trim()===provName);
  if(distName) filtered=filtered.filter(b=>(b.district||'').trim()===distName);
  filtered=filtered.filter(b=>(b.name||'').toLowerCase().includes(input));

  list.innerHTML=filtered.map(b=>`<div class="combo-item" onmousedown="pickBranchWithLocation('${esc(b.name)}','${esc(b.province)}','${esc(b.district)}','${esc(shipName)}')">${esc(b.name)} <small style="color:var(--gray-500)">(${esc(b.province)}, ${esc(b.district)})</small></div>`).join('')||'<div style="padding:8px 12px;color:var(--gray-500);font-size:12px">ບໍ່ພົບ</div>';
  openCombo('branch');
}
function pickBranchWithLocation(branchName,province,district,shippingCompany){
  sv('s-branch',branchName);
  sv('s-prov',province);
  sv('s-dist',district);
  if(shippingCompany) sv('s-ship',shippingCompany);
  closeCombo('branch');
}
function filterCombo(type){
  const input=type==='prod'?v('s-prod'):type==='branch'?v('s-branch'):type==='prov'?v('s-prov'):type==='dist'?v('s-dist'):v('s-ship');
  const q=input.toLowerCase();
  const list=document.getElementById('combo-'+type);
  list.querySelectorAll('.combo-item').forEach(item=>{item.style.display=item.textContent.toLowerCase().includes(q)?'':'none';});
}
function filterShipCombo(){
  const input=document.getElementById('br-ship');
  const list=document.getElementById('combo-ship');
  const q=input.value.toLowerCase();
  list.querySelectorAll('.combo-item').forEach(item=>{item.style.display=item.textContent.toLowerCase().includes(q)?'':'none';});
}
function openCombo(type){document.getElementById('combo-'+type).classList.add('open');}
function closeCombo(type){document.getElementById('combo-'+type).classList.remove('open');}
function pickComboVal(fieldId,val){sv(fieldId,val);}
function pickProd(name,price,cost){sv('s-prod',name);sv('s-price',price);sv('s-cost',cost);calcTotal();closeCombo('prod');}

function getChannelClass(channel){
  if(!channel) return '';
  const lower=channel.toLowerCase();
  if(lower.includes('whatsapp')) return 'whatsapp';
  if(lower.includes('facebook')) return 'facebook';
  if(lower.includes('tiktok')) return 'tiktok';
  return '';
}
function getChannelColor(channel){
  if(!channel) return '#e0e0e0';
  const lower=channel.toLowerCase();
  if(lower.includes('whatsapp')) return '#e8f5e9';
  if(lower.includes('facebook')) return '#e3f2fd';
  if(lower.includes('tiktok')) return '#fce4ec';
  return '#f5f5f5';
}
