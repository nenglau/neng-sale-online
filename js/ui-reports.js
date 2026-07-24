// ══════════════════════════════════════
//  REPORTS
// ══════════════════════════════════════
function setRepPeriod(p){
  S.repPeriod=p;
  document.querySelectorAll('#rep-period .period-tab').forEach(t=>t.classList.toggle('active',t.dataset.p===p));
  const btn=document.getElementById('rep-custom-btn');
  if(btn) btn.classList.toggle('active',p==='custom');
  renderReports();
}
function getRepData(){
  const now=new Date(), ym=now.toISOString().slice(0,7), yr=String(now.getFullYear());
  let data=S.db.sales.filter(s=>s.status==='ສຳເລັດ');
  if(S.repPeriod==='custom'&&S.customRanges.rep){
    const {start,end}=S.customRanges.rep;
    data=data.filter(s=>s.date>=start&&s.date<=end);
  }
  else if(S.repPeriod==='7day'){const d7=new Date();d7.setDate(d7.getDate()-7);data=data.filter(s=>new Date(s.date)>=d7);}
  else if(S.repPeriod==='month') data=data.filter(s=>s.date.startsWith(ym));
  else if(S.repPeriod==='year') data=data.filter(s=>s.date.startsWith(yr));
  return data;
}
function renderReports(){
  const data=getRepData();
  const prodFilter=v('rep-prod-filter');
  const filteredData=prodFilter?data.filter(s=>s.product_name===prodFilter):data;
  const rev=filteredData.reduce((a,s)=>a+(s.qty*s.price-(s.discount||0)),0);
  const prof=filteredData.reduce((a,s)=>a+(s.qty*(s.price-s.cost)-(s.discount||0)),0);
  const qty=filteredData.reduce((a,s)=>a+s.qty,0);
  const margin=rev>0?((prof/rev)*100).toFixed(1):0;
  document.getElementById('rep-stats').innerHTML=`
    <div class="stat-card"><span class="stat-icon">💰</span><div class="stat-label">ຍອດຂາຍ</div><div class="stat-value">${fmt(rev)} ₭</div></div>
    <div class="stat-card"><span class="stat-icon">📈</span><div class="stat-label">ກຳໄລ</div><div class="stat-value" style="color:var(--green)">${fmt(prof)} ₭</div></div>
    <div class="stat-card orange"><span class="stat-icon">📦</span><div class="stat-label">ຈຳນວນ</div><div class="stat-value">${qty} <span style="font-size:14px">ຊິ້ນ</span></div></div>
    <div class="stat-card blue"><span class="stat-icon">%</span><div class="stat-label">Margin</div><div class="stat-value">${margin}%</div><div class="stat-sub" style="font-size:10px;line-height:1.3">ອັດຕາກຳໄລທຽບກັບຍອດຂາຍ (ກຳໄລ÷ຍອດຂາຍ×100)</div></div>`;
  drawRepSales(filteredData); renderRepCities(filteredData);
  // Top products
  const pm={};
  filteredData.forEach(s=>{const k=s.product_name||'ອື່ນໆ';if(!pm[k])pm[k]={qty:0,rev:0,prof:0};pm[k].qty+=s.qty;pm[k].rev+=s.qty*s.price-(s.discount||0);pm[k].prof+=s.qty*(s.price-s.cost)-(s.discount||0);});
  const top=Object.entries(pm).sort((a,b)=>b[1].rev-a[1].rev).slice(0,10);
  const tb=document.getElementById('rep-top');
  tb.innerHTML=top.length?top.map(([name,d],i)=>`<tr><td style="font-weight:700;color:var(--green)">${i+1}</td><td style="font-weight:600">${esc(name)}</td><td style="text-align:center">${d.qty}</td><td style="font-weight:700">${fmt(d.rev)} ₭</td><td style="color:var(--green);font-weight:600">${fmt(d.prof)} ₭</td></tr>`).join(''):'<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--gray-500)">ຍັງບໍ່ມີຂໍ້ມູນ</td></tr>';
}
function drawRepSales(data){
  const ctx=document.getElementById('chart-rep-sales'); if(!ctx) return;
  const days=S.repPeriod==='7day'?7:S.repPeriod==='month'?30:12;
  const L=[],R=[],P=[];
  if(S.repPeriod==='year'){
    for(let m=0;m<12;m++){const mo=String(m+1).padStart(2,'0');const key=new Date().getFullYear()+'-'+mo;L.push(mo);const md=data.filter(s=>s.date.startsWith(key));R.push(md.reduce((a,s)=>a+(s.qty*s.price-(s.discount||0)),0));P.push(md.reduce((a,s)=>a+(s.qty*(s.price-s.cost)-(s.discount||0)),0));}
  } else {
    for(let i=days-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().slice(0,10);L.push(ds.slice(5));const dd=data.filter(s=>s.date===ds);R.push(dd.reduce((a,s)=>a+(s.qty*s.price-(s.discount||0)),0));P.push(dd.reduce((a,s)=>a+(s.qty*(s.price-s.cost)-(s.discount||0)),0));}
  }
  dc('rep-sales');
  charts['rep-sales']=new Chart(ctx,{type:'line',data:{labels:L,datasets:[{label:'ຍອດຂາຍ',data:R,borderColor:'#4caf50',backgroundColor:'rgba(76,175,80,.1)',tension:.3,fill:true},{label:'ກຳໄລ',data:P,borderColor:'#1565c0',backgroundColor:'rgba(21,101,192,.06)',tension:.3,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtK(v)}}}}});
}
function getSaleLocation(s){
  const sc=S.db.shipCos.find(x=>x.name===s.shipping_company);
  const br=sc?S.db.systemBranches.find(b=>b.shipping_company_id===sc.id&&b.name===s.branch):null;
  const prov=br?br.province:(s.province||'');
  const dist=br?br.district:(s.district||'');
  const city=dist||prov||'ບໍ່ລະບຸ';
  const key=`${prov||'—'}|${dist||'—'}`;
  return {key,city,prov:prov||'—'};
}
function renderRepCities(data){
  const el=document.getElementById('rep-cities'); if(!el) return;
  dc('rep-ch');
  const totalOrders=data.length;
  const pm={};
  data.forEach(s=>{
    const {prov}=getSaleLocation(s);
    if(!pm[prov])pm[prov]={prov,count:0};
    pm[prov].count+=1;
  });
  const top=Object.values(pm).sort((a,b)=>b.count-a.count).slice(0,4);
  el.innerHTML=top.length?top.map((c,i)=>{
    const pct=totalOrders>0?((c.count/totalOrders)*100).toFixed(1):'0.0';
    return `<div class="rep-city-row">
      <span class="rep-city-rank">${i+1}</span>
      <div class="rep-city-name">${esc(c.prov)}</div>
      <span class="rep-city-rev">${c.count} order</span>
      <span class="rep-city-pct">${pct}%</span>
    </div>`;
  }).join(''):'<div class="empty" style="padding:40px 0"><i class="fa fa-map-marker-alt"></i><p>ຍັງບໍ່ມີຂໍ້ມູນ</p></div>';
}
