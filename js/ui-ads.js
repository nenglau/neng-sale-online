// ══════════════════════════════════════
//  ADS
// ══════════════════════════════════════
function setAdsPeriod(p){
  S.adsPeriod=p;
  document.querySelectorAll('#ads-period .period-tab').forEach(t=>t.classList.toggle('active',t.dataset.p===p));
  const btn=document.getElementById('ads-custom-btn');
  if(btn) btn.classList.toggle('active',p==='custom');
  renderAds();
}
function getAdsPeriodData(){
  const now=new Date(), ym=now.toISOString().slice(0,7), yr=String(now.getFullYear());
  let data=S.db.ads;
  if(S.adsPeriod==='custom'&&S.customRanges.ads){
    const {start,end}=S.customRanges.ads;
    data=data.filter(a=>a.date>=start&&a.date<=end);
  }
  else if(S.adsPeriod==='7day'){const d7=new Date();d7.setDate(d7.getDate()-7);data=data.filter(a=>new Date(a.date)>=d7);}
  else if(S.adsPeriod==='month') data=data.filter(a=>a.date.startsWith(ym));
  else if(S.adsPeriod==='year') data=data.filter(a=>a.date.startsWith(yr));
  return data;
}
function renderAds(){
  const periodData=getAdsPeriodData();
  const prodFilter=v('ads-prod-filter');
  const data=prodFilter?periodData.filter(a=>a.product_name===prodFilter):periodData;
  const budget=data.reduce((a,x)=>a+(x.budget||0),0);
  document.getElementById('ads-stats').innerHTML=`<div class="stat-card purple"><span class="stat-icon">💰</span><div class="stat-label">ງົບໂຄສະນາລວມ</div><div class="stat-value">${fmt(budget)} ₭</div></div>`;
  const tb=document.getElementById('ads-tbody');
  if(!data.length){tb.innerHTML='<tr><td colspan="7"><div class="empty"><i class="fa fa-bullhorn"></i><p>ຍັງບໍ່ມີຂໍ້ມູນ</p></div></td></tr>';return;}
  tb.innerHTML=data.map(a=>{
    const r=a.spent>0?(a.revenue/a.spent).toFixed(2):0;
    return `<tr><td>${fmtDate(a.date)}</td>
    <td>${fmt(a.budget)} ₭</td>
    <td><span class="badge ${a.platform==='Facebook'?'badge-blue':a.platform==='TikTok'?'badge-red':'badge-gray'}">${a.platform}</span></td>
    <td style="font-weight:600">${esc(a.name)}</td><td>${esc(a.product_name||'-')}</td>
    <td style="font-weight:700;color:${r>=2?'var(--green)':'var(--orange)'}">${r}x</td>
    <td><button class="btn-icon edit" onclick="editAds('${a.id}')"><i class="fa fa-pen"></i></button> <button class="btn-icon del" onclick="delAds('${a.id}')"><i class="fa fa-trash"></i></button></td></tr>`;
  }).join('');
  drawAdsChart(data);
}
function drawAdsChart(data){
  const ctx=document.getElementById('chart-ads'); if(!ctx) return;
  const L=[],D=[];
  if(S.adsPeriod==='7day'){
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().slice(0,10);L.push(ds.slice(5));D.push(data.filter(a=>a.date===ds).reduce((a,x)=>a+x.budget,0));}
  }else if(S.adsPeriod==='month'){
    const now=new Date(), ym=now.toISOString().slice(0,7);
    for(let i=1;i<=31;i++){const d=`${ym}-${String(i).padStart(2,'0')}`;L.push(String(i));D.push(data.filter(a=>a.date===d).reduce((a,x)=>a+x.budget,0));}
  }else if(S.adsPeriod==='year'){
    const now=new Date(), yr=String(now.getFullYear());
    const months=['ມ.ກ','ກ.ພ','ມ.ນ','ມ.ສ','ພ.ພ','ມ.ກ','ກ.ຮ','ສ.ຄ','ກ.ຍ','ຕ.ລ','ພ.ຨ','ທ.ຫ'];
    months.forEach((m,i)=>{const d=`${yr}-${String(i+1).padStart(2,'0')}`;L.push(m);D.push(data.filter(a=>a.date.startsWith(d)).reduce((a,x)=>a+x.budget,0));});
  }
  dc('ads'); charts['ads']=new Chart(ctx,{type:'line',data:{labels:L,datasets:[{label:'ງົບ',data:D,backgroundColor:'rgba(156,39,176,.2)',borderColor:'#9c27b0',borderWidth:2,fill:true,tension:.3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtK(v)}}}}});
}
function openAdsModal(){
  sv('ads-id','');
  document.getElementById('ads-title').textContent='ເພີ່ມແຄມເປຍ';
  sv('a-date',today());
  sv('a-budget','');
  sv('a-platform','Facebook');
  sv('a-name','');
  // Load products into dropdown
  const prodSelect=document.getElementById('a-prod');
  prodSelect.innerHTML='<option value="">-- ເລືອກສິນຄ້າ --</option>';
  if(S.db.products && S.db.products.length){
    S.db.products.forEach(p=>{
      const opt=document.createElement('option');
      opt.value=p.name;
      opt.textContent=p.name;
      prodSelect.appendChild(opt);
    });
  }
  sv('a-prod','');
  openModal('modal-ads');
}
function editAds(id){
  const a=S.db.ads.find(x=>x.id===id); if(!a) return;
  document.getElementById('ads-title').textContent='ແກ້ໄຂ';
  sv('ads-id',id);sv('a-date',a.date);sv('a-budget',a.budget);sv('a-platform',a.platform);sv('a-name',a.name);
  // Load products into dropdown
  const prodSelect=document.getElementById('a-prod');
  prodSelect.innerHTML='<option value="">-- ເລືອກສິນຄ້າ --</option>';
  if(S.db.products && S.db.products.length){
    S.db.products.forEach(p=>{
      const opt=document.createElement('option');
      opt.value=p.name;
      opt.textContent=p.name;
      prodSelect.appendChild(opt);
    });
  }
  sv('a-prod',a.product_name||'');
  openModal('modal-ads');
}
async function saveAds(){
  const date=v('a-date'),name=v('a-name');
  if(!date||!name){toast('ກະລຸນາປ້ອນຂໍ້ມູນ','error');return;}
  const pl={company_id:S.company.id,date,platform:v('a-platform'),name,product_name:v('a-prod')||null,budget:+v('a-budget')||0};
  const eid=v('ads-id'); let err;
  if(eid){const{error}=await sb.from('ads').update(pl).eq('id',eid);err=error;if(!err)S.db.ads=S.db.ads.map(x=>x.id===eid?{...x,...pl}:x);}
  else{const{data,error}=await sb.from('ads').insert(pl).select().single();err=error;if(!err)S.db.ads.unshift(data);}
  if(err){toast(err.message,'error');return;}
  closeModal('modal-ads'); toast('ບັນທຶກສຳເລັດ ✓','success'); renderAds();
}
async function delAds(id){
  const confirmed=await showConfirm({
    title:'ຢືນຍັນລົບ',
    message:'ລຶບໂຄສະນານີ້?',
    icon:'🗑ฺ',
    confirmText:'ລົບ',
    cancelText:'ຍົກເລີກ',
    type:'danger'
  });
  if(!confirmed) return;
  const{error}=await sb.from('ads').delete().eq('id',id);
  if(error){toast(error.message,'error');return;}
  S.db.ads=S.db.ads.filter(x=>x.id!==id); toast('ລຶບສຳເລັດ','success'); renderAds();
}
