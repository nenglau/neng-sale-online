// ══════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════
function setDashPeriod(p){
  S.dashPeriod=p;
  document.querySelectorAll('#dash-period .period-tab').forEach(t=>t.classList.toggle('active',t.dataset.p===p));
  const btn=document.getElementById('dash-custom-btn');
  if(btn) btn.classList.toggle('active',p==='custom');
  renderDash();
}
function getDashData(){
  const now=new Date(), ym=now.toISOString().slice(0,7), yr=String(now.getFullYear());
  let sales=S.db.sales, fin=S.db.finance;
  if(S.dashPeriod==='custom'&&S.customRanges.dash){
    const {start,end}=S.customRanges.dash;
    sales=sales.filter(s=>s.date>=start&&s.date<=end);
    fin=fin.filter(f=>f.date>=start&&f.date<=end);
  }
  else if(S.dashPeriod==='7day'){const d7=new Date();d7.setDate(d7.getDate()-7);sales=sales.filter(s=>new Date(s.date)>=d7);fin=fin.filter(f=>new Date(f.date)>=d7);}
  else if(S.dashPeriod==='month'){sales=sales.filter(s=>s.date.startsWith(ym));fin=fin.filter(f=>f.date.startsWith(ym));}
  else if(S.dashPeriod==='year'){sales=sales.filter(s=>s.date.startsWith(yr));fin=fin.filter(f=>f.date.startsWith(yr));}
  return {sales,fin};
}
function getDashPeriodAds(){
  const now=new Date(), ym=now.toISOString().slice(0,7), yr=String(now.getFullYear());
  let ads=S.db.ads;
  if(S.dashPeriod==='custom'&&S.customRanges.dash){
    const {start,end}=S.customRanges.dash;
    ads=ads.filter(a=>a.date>=start&&a.date<=end);
  }
  else if(S.dashPeriod==='7day'){const d7=new Date();d7.setDate(d7.getDate()-7);ads=ads.filter(a=>new Date(a.date)>=d7);}
  else if(S.dashPeriod==='month') ads=ads.filter(a=>a.date.startsWith(ym));
  else if(S.dashPeriod==='year') ads=ads.filter(a=>a.date.startsWith(yr));
  return ads;
}
function renderDash(){
  const {sales,fin}=getDashData();
  const prodFilter=v('dash-prod-filter');
  const filteredSales=prodFilter?sales.filter(s=>s.product_name===prodFilter):sales;
  const filteredFin=prodFilter?fin.filter(f=>f.product_name===prodFilter):fin;
  const rev=filteredSales.filter(s=>s.status==='ສຳເລັດ').reduce((a,s)=>a+(s.qty*s.price-(s.discount||0)),0);
  const prof=filteredSales.filter(s=>s.status==='ສຳເລັດ').reduce((a,s)=>a+(s.qty*(s.price-s.cost)-(s.discount||0)),0);
  const finExp=filteredFin.filter(f=>f.type==='ລາຍຈ່າຍ').reduce((a,f)=>a+f.amount,0);
  const adsBudget=getDashPeriodAds().reduce((a,x)=>a+(x.budget||0),0);
  const exp=finExp+adsBudget;
  const totalOrders=filteredSales.length;
  const canceledOrders=filteredSales.filter(s=>s.status==='ຍົກເລີກ').length;
  document.getElementById('dash-stats').innerHTML=`
    <div class="stat-card"><span class="stat-icon">💰</span><div class="stat-label">ຍອດຂາຍ (ສຳເລັດ)</div><div class="stat-value">${fmt(rev)}</div><div class="stat-sub">₭</div></div>
    <div class="stat-card"><span class="stat-icon">📈</span><div class="stat-label">ກຳໄລລວມ</div><div class="stat-value" style="color:var(--green)">${fmt(prof)}</div><div class="stat-sub">₭</div></div>
    <div class="stat-card blue"><span class="stat-icon">📦</span><div class="stat-label">order ທັງໝົດ</div><div class="stat-value">${totalOrders}</div><div class="stat-sub">ລາຍການ</div></div>
    <div class="stat-card purple"><span class="stat-icon">❌</span><div class="stat-label">order ຍົກເລີກ</div><div class="stat-value">${canceledOrders}</div><div class="stat-sub">ລາຍການ</div></div>
    <div class="stat-card red"><span class="stat-icon">💸</span><div class="stat-label">ລາຍຈ່າຍ</div><div class="stat-value">${fmt(exp)}</div><div class="stat-sub">₭</div></div>`;
  const tbody=document.getElementById('dash-recent');
  const rec=filteredSales.slice(0,10);
  tbody.innerHTML=rec.length?rec.map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${esc(s.product_name||'-')}</td><td>${esc(s.customer_name||'-')}</td><td>${s.qty}</td><td style="font-weight:700">${fmt(s.qty*s.price-(s.discount||0))} ₭</td><td>${badge(s.status)}</td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--gray-500)">ຍັງບໍ່ມີຂໍ້ມູນ</td></tr>';
  draw7Days(filteredSales); drawChannel(filteredSales,filteredFin);
}
function draw7Days(filteredSales){
  const ctx=document.getElementById('chart-sales7'); if(!ctx) return;
  const src=filteredSales||S.db.sales;
  const L=[],D=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().slice(0,10);L.push(ds.slice(5));D.push(src.filter(s=>s.date===ds&&s.status==='ສຳເລັດ').reduce((a,s)=>a+(s.qty*s.price-(s.discount||0)),0));}
  dc('sales7'); charts['sales7']=new Chart(ctx,{type:'bar',data:{labels:L,datasets:[{label:'ຍອດ',data:D,backgroundColor:'rgba(76,175,80,.7)',borderColor:'#2e7d32',borderWidth:1,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtK(v)}}}}});
}
function drawChannel(filteredSales,filteredFin){
  const ctx=document.getElementById('chart-channel'); if(!ctx) return;
  const src=filteredSales||S.db.sales;
  const fin=filteredFin||getDashData().fin;
  const prof=src.filter(s=>s.status==='ສຳເລັດ').reduce((a,s)=>a+(s.qty*(s.price-s.cost)-(s.discount||0)),0);
  const finExp=fin.filter(f=>f.type==='ລາຍຈ່າຍ').reduce((a,f)=>a+f.amount,0);
  const adsBudget=getDashPeriodAds().reduce((a,x)=>a+(x.budget||0),0);
  const totalExp=finExp+adsBudget;
  const netProfit=prof-totalExp;
  const netPct=prof>0?((netProfit/prof)*100).toFixed(1):0;
  dc('channel'); charts['channel']=new Chart(ctx,{type:'doughnut',data:{labels:['ກຳໄລລວມ','ລາຍຈ່າຍ'],datasets:[{data:[prof,totalExp],backgroundColor:['#4caf50','#f44336']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{family:'Noto Sans Lao',size:12,weight:'bold'},color:(ctx)=>ctx.index===0?'#4caf50':'#f44336',generateLabels:(chart)=>{const ds=chart.data.datasets[0];const sum=ds.data.reduce((a,b)=>a+b,0);return chart.data.labels.map((label,i)=>{const pct=sum>0?((ds.data[i]/sum)*100).toFixed(1):'0.0';return{text:`${label} ${pct}%`,fillStyle:ds.backgroundColor[i],strokeStyle:ds.backgroundColor[i],lineWidth:0,hidden:!chart.getDataVisibility(i),index:i};});}}},datalabels:{color:'#fff',font:{family:'Noto Sans Lao',weight:'bold',size:14},formatter:(val,ctx)=>{const sum=ctx.dataset.data.reduce((a,b)=>a+b,0);return sum>0?((val/sum)*100).toFixed(1)+'%':'0%';}},title:{display:true,text:`ກຳໄລສຸດທິ: ${netProfit>=0?'+':''}${netPct}% (${fmt(netProfit)} ₭)`,font:{family:'Noto Sans Lao',size:14,weight:'bold'},color:netProfit>=0?'#4caf50':'#f44336',padding:10}}}});
}
