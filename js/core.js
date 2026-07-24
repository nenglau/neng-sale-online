// ══════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════
const SB_URL = 'https://bhyjvqcgynlxsanptgfq.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoeWp2cWNneW5seHNhbnB0Z2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjI3NTcsImV4cCI6MjA5Mzc5ODc1N30.XrmedfWjYAaTKgO5YM2wXz2a-IoygEZ_DVADaMkDKKI';
const sb = supabase.createClient(SB_URL, SB_KEY);
let GAS_URL = localStorage.getItem('gas_url') || '';

// ══════════════════════════════════════
//  STATE
// ══════════════════════════════════════
let S = {
  user:null, profile:null, company:null, role:null, page:'dashboard',
  finPeriod:'month', adsPeriod:'7day', repPeriod:'7day', salesPeriod:'7day', pendingPeriod:'all',
  salesTab:'pending', dashPeriod:'all', pendingEditMode:false,
  navHistory:[],
  customRanges:{dash:null,fin:null,ads:null,rep:null,sales:null,pending:null},
  db:{sales:[],finance:[],products:[],ads:[],members:[],shipCos:[],branches:[],systemBranches:[]}
};
let charts = {};

// ══════════════════════════════════════
//  AUTH
// ══════════════════════════════════════
function switchAuthTab(t){
  document.querySelectorAll('.auth-tab').forEach((el,i)=>el.classList.toggle('active',(i===0&&t==='login')||(i===1&&t==='register')));
  document.getElementById('login-form').classList.toggle('active',t==='login');
  document.getElementById('register-form').classList.toggle('active',t==='register');
  hideMsg();
}
function showMsg(m,type='error'){const e=document.getElementById('auth-msg');e.textContent=m;e.className='auth-msg '+type;e.style.display='block';}
function hideMsg(){document.getElementById('auth-msg').style.display='none';}

async function doLogin(){
  const email=v('login-email'),pass=v('login-password');
  if(!email||!pass){showMsg('ກະລຸນາປ້ອນ email ແລະ ລະຫັດຜ່ານ');return;}
  const{data,error}=await sb.auth.signInWithPassword({email,password:pass});
  if(error){showMsg(error.message);return;}
  await afterLogin(data.user);
}
async function doRegister(){
  const name=v('reg-name'),email=v('reg-email'),pass=v('reg-password');
  if(!name||!email||!pass){showMsg('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ');return;}
  if(pass.length<6){showMsg('ລະຫັດຜ່ານຕ້ອງຢ່າງໜ້ອຍ 6 ຕົວ');return;}
  const{error}=await sb.auth.signUp({email,password:pass,options:{data:{name}}});
  if(error){showMsg(error.message);return;}
  showMsg('ສ້າງ account ສຳເລັດ! ກວດ email ຂອງທ່ານ ຫຼື ເຂົ້າສູ່ລະບົບໄດ້ທັນທີ','success');
}
// ແສງຟອມລືມລະຫັດຜ່ານ
function doForgotPassword(){
  document.getElementById('login-form').style.display='none';
  document.getElementById('register-form').style.display='none';
  document.getElementById('forgot-form').style.display='block';
  document.getElementById('reset-form').style.display='none';
  hideMsg();
  // ຄັດລຶບ email ຈາກ login ໄປໃສ່ forgot form
  document.getElementById('forgot-email').value=v('login-email');
}
// ແສງຟອມ login ປົກກະຕິ
function showLoginForm(){
  document.getElementById('login-form').style.display='block';
  document.getElementById('register-form').style.display='none';
  document.getElementById('forgot-form').style.display='none';
  document.getElementById('reset-form').style.display='none';
  hideMsg();
}
// ສົ່ງອີເມລ reset ລະຫັດຜ່ານ
async function doSendResetEmail(){
  const email=v('forgot-email');
  if(!email){showMsg('ກະລຸນາປ້ອນ email ຂອງທ່ານ');return;}
  const{error}=await sb.auth.resetPasswordForEmail(email,{
    redirectTo:'https://nenglau.github.io/neng-sale-online/'
  });
  if(error){showMsg(error.message);return;}
  showMsg('ສົ່ງ email ສຳເລັດ! ກວດ email ຂອງທ່ານ ເພື່ອຕັ້ງລະຫັດຜ່ານໃໝ່','success');
}
// ຕັ້ງລະຫັດຜ່ານໃໝ່
async function doResetPassword(){
  const pass=v('reset-password'),confirm=v('reset-confirm');
  if(!pass||!confirm){showMsg('ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນ');return;}
  if(pass.length<6){showMsg('ລະຫັດຜ່ານຕ້ອງຢ່າງໜ້ອຍ 6 ຕົວ');return;}
  if(pass!==confirm){showMsg('ລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນບໍ່ຕົງກັນ');return;}
  const{error}=await sb.auth.updateUser({password:pass});
  if(error){showMsg(error.message);return;}
  showMsg('ຕັ້ງລະຫັດຜ່ານໃໝ່ສຳເລັດ! ກັບໄປໜ້າ login','success');
  // ລຶບ URL hash ເພື່ອບໍ່ໃຫ້ຄ້າ token ເກົ່າ
  window.location.hash='';
  // ກັບໄປໜ້າ login ຫຼັງ 2 ວິນາທີ
  setTimeout(()=>showLoginForm(),2000);
}
// ເຊັກ URL hash ຕອນໂຫຼດໜ້າເວັບ ເພື່ອຕັດສິນໃຈ token recovery
async function checkRecoveryToken(){
  const hash=window.location.hash;
  if(hash.includes('#access_token=')&&hash.includes('type=recovery')){
    // ມີ recovery token ໃນ URL
    try{
      // ໃຫ້ Supabase ປະມວນຜົນ session ຈາກ URL hash
      await sb.auth.getSession();
      // ແສງຟອມຕັ້ງລະຫັດຜ່ານໃໝ່
      document.getElementById('login-form').style.display='none';
      document.getElementById('register-form').style.display='none';
      document.getElementById('forgot-form').style.display='none';
      document.getElementById('reset-form').style.display='block';
      hideMsg();
      showMsg('ກະລຸນາຕັ້ງລະຫັດຜ່ານໃໝ່','success');
    }catch(e){
      showMsg('ລິງກ໌ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸແລ້ວ','error');
      showLoginForm();
    }
  }
}
async function doLogout(){
  await sb.auth.signOut();
  try{localStorage.removeItem('hg_company');localStorage.removeItem('hg_page');}catch(e){}
  S={...S,user:null,profile:null,company:null,role:null,db:{sales:[],finance:[],products:[],ads:[],members:[],shipCos:[],branches:[],systemBranches:[]}};
  showScreen('auth-screen');
}
async function forceRefresh(){
  const btn=document.getElementById('btn-refresh-update');
  if(btn){
    btn.innerHTML='<i class="fa fa-spinner fa-spin"></i> ກຳລັງອັບເດດ...';
    btn.disabled=true;
  }
  try{
    if('serviceWorker' in navigator){
      const reg=await navigator.serviceWorker.getRegistration();
      if(reg){
        await reg.postMessage('CLEAR_CACHE');
        await reg.postMessage('SKIP_WAITING');
      }
    }
    if('caches' in window){
      const cacheNames=await caches.keys();
      await Promise.all(cacheNames.map(name=>caches.delete(name)));
    }
    setTimeout(()=>location.reload(true),500);
  }catch(e){
    console.error('Refresh error:',e);
    setTimeout(()=>location.reload(true),500);
  }
}
async function afterLogin(user){
  S.user=user;
  const{data:p}=await sb.from('profiles').select('*').eq('id',user.id).single();
  S.profile=p||{name:user.email.split('@')[0],email:user.email};
  // Try to restore last company (for refresh/reload)
  try{
    const saved=localStorage.getItem('hg_company');
    if(saved){
      const co=JSON.parse(saved);
      // Verify user still has access
      const{data:m}=await sb.from('company_members').select('role').eq('company_id',co.id).eq('user_id',user.id).single();
      if(m){await selectCompany(co.id,co.name,co.logo,m.role);return;}
    }
  }catch(e){}
  await loadCompanyScreen();
}

// ══════════════════════════════════════
//  COMPANY
// ══════════════════════════════════════
async function loadCompanyScreen(){
  showScreen('company-screen');
  document.getElementById('comp-user-name').textContent=S.profile?.name||S.user.email;
  const listEl=document.getElementById('company-list');
  listEl.innerHTML='<div class="loading"><div class="spinner"></div>ກຳລັງໂຫຼດ...</div>';
  const{data,error}=await sb.from('company_members').select('role, companies(id,name,logo_url,description)').eq('user_id',S.user.id);
  listEl.innerHTML='';
  if(!data?.length){listEl.innerHTML='<p style="color:var(--gray-500);padding:8px 0">ຍັງບໍ່ມີ. ສ້າງໃໝ່ດ້ານລຸ່ມ.</p>';return;}
  data.forEach(m=>{
    const c=m.companies;
    const card=mkEl(`<div class="company-card" onclick="selectCompany('${c.id}','${esc(c.name)}','${c.logo_url||''}','${m.role}')">
      <div class="logo">${c.logo_url?`<img src="${c.logo_url}">`:esc(c.name[0]||'🌿')}</div>
      <div class="name">${esc(c.name)}</div>
      <div class="role">${roleLabel(m.role)}</div>
    </div>`);
    listEl.appendChild(card);
  });
}
async function selectCompany(id,name,logo,role){
  // Reload company data from Supabase to ensure latest data (including logo)
  const{data:coData}=await sb.from('companies').select('*').eq('id',id).single();
  if(coData){
    S.company={id,name:coData.name,logo:coData.logo_url}; S.role=role;
  }else{
    S.company={id,name,logo}; S.role=role;
  }
  // Save company for refresh restore
  try{ localStorage.setItem('hg_company', JSON.stringify({id,name:S.company.name,logo:S.company.logo,role})); }catch(e){}
  await loadData();
  setupApp();
  setupRealtime();
  showScreen('app-screen');
  // Restore last page or default to dashboard
  const savedPage=localStorage.getItem('hg_page')||'dashboard';
  navigate(savedPage);
}
function goCompanySelect(){loadCompanyScreen();}
async function createCompany(){
  const name=v('nc-name').trim();
  if(!name){toast('ກະລຸນາໃສ່ຊື່','error');return;}
  const{data:c,error:e1}=await sb.from('companies').insert({name,description:v('nc-desc')||null,created_by:S.user.id}).select().single();
  if(e1){toast(e1.message,'error');return;}
  const{error:e2}=await sb.from('company_members').insert({company_id:c.id,user_id:S.user.id,role:'owner'});
  if(e2){toast(e2.message,'error');return;}
  closeModal('modal-company-create');
  toast('ສ້າງສຳເລັດ ✓','success');
  loadCompanyScreen();
}

// ══════════════════════════════════════
//  CUSTOM CONFIRM DIALOG
// ══════════════════════════════════════
let confirmResolve=null;
function showConfirm(options){
  const{title='ຢືນຍັນ',message='ທ່ານແນ່ໃຈບໍ?',icon='⚠️',confirmText='ຕົກລົງ',cancelText='ຍົກເລີກ',type='normal'}=options;
  document.getElementById('confirm-title').textContent=title;
  document.getElementById('confirm-message').textContent=message;
  document.getElementById('confirm-icon').textContent=icon;
  document.getElementById('confirm-ok').textContent=confirmText;
  document.getElementById('confirm-cancel').textContent=cancelText;
  const okBtn=document.getElementById('confirm-ok');
  okBtn.className='confirm-btn '+(type==='danger'?'confirm-btn-danger':'confirm-btn-confirm');
  const overlay=document.getElementById('confirm-dialog');
  overlay.classList.add('open');
  return new Promise((resolve)=>{
    confirmResolve=resolve;
  });
}
function closeConfirm(result){
  const overlay=document.getElementById('confirm-dialog');
  overlay.classList.remove('open');
  if(confirmResolve){
    confirmResolve(result);
    confirmResolve=null;
  }
}
document.getElementById('confirm-cancel').onclick=()=>closeConfirm(false);
document.getElementById('confirm-ok').onclick=()=>closeConfirm(true);
document.getElementById('confirm-dialog').onclick=(e)=>{
  if(e.target.id==='confirm-dialog') closeConfirm(false);
};

// ══════════════════════════════════════
//  LOAD DATA
// ══════════════════════════════════════
async function loadData(){
  const cid=S.company.id;
  const[sa,fi,pr,ad,mb,sc,br]=await Promise.all([
    sb.from('sales').select('*').eq('company_id',cid).order('date',{ascending:false}),
    sb.from('finance').select('*').eq('company_id',cid).order('date',{ascending:false}),
    sb.from('products').select('*').eq('company_id',cid).order('name'),
    sb.from('ads').select('*').eq('company_id',cid).order('date',{ascending:false}),
    sb.from('company_members').select('*, profiles(name,email)').eq('company_id',cid),
    sb.from('shipping_companies').select('*').order('name'),
    sb.from('system_branches').select('*').order('name')
  ]);
  S.db.sales=sa.data||[]; S.db.finance=fi.data||[]; S.db.products=pr.data||[];
  S.db.ads=ad.data||[]; S.db.members=mb.data||[]; S.db.shipCos=sc.data||[];
  S.db.branches=br.data||[]; S.db.systemBranches=br.data||[];
}
async function refreshData(){await loadData(); renderPage(S.page);}

// ══════════════════════════════════════
//  SETUP APP UI
// ══════════════════════════════════════
function setupApp(){
  const c=S.company, u=S.profile||S.user;
  document.getElementById('sb-company-name').textContent=c.name;
  document.getElementById('sb-role').textContent=roleLabel(S.role);
  document.getElementById('sb-user-name').textContent=u.name||u.email.split('@')[0];
  document.getElementById('sb-user-email').textContent=maskEmail(u.email||S.user.email);
  document.getElementById('sb-avatar').textContent=(u.name||u.email)[0].toUpperCase();
  const logoEl=document.getElementById('sb-logo');
  if(c.logo){logoEl.innerHTML=`<img src="${c.logo}">`;}
  else{logoEl.textContent=c.name[0]||'🌿';}
  populateProvinces();
  populateProductFilters();
  if(window.innerWidth<=768) document.getElementById('menu-btn').style.display='block';
}
function populateProductFilters(){
  const filters=['dash-prod-filter','ads-prod-filter','rep-prod-filter'];
  filters.forEach(id=>{
    const el=document.getElementById(id);
    if(el){
      el.innerHTML='<option value="">ທຸກລາຍການ</option>';
      if(S.db.products && S.db.products.length){
        S.db.products.forEach(p=>{
          const opt=document.createElement('option');
          opt.value=p.name;
          opt.textContent=p.name;
          el.appendChild(opt);
        });
      }
    }
  });
}
function maskEmail(email){
  if(!email||!email.includes('@')) return email;
  const [local,domain]=email.split('@');
  if(local.length<=3){return email;}
  const firstTwo=local.slice(0,2);
  const lastChar=local.slice(-1);
  const maskedMiddle='*'.repeat(local.length-3);
  return `${firstTwo}${maskedMiddle}${lastChar}@${domain}`;
}
let _realtimeChannel=null;
function setupRealtime(){
  if(_realtimeChannel) sb.removeChannel(_realtimeChannel);
  const cid=S.company.id;
  _realtimeChannel=sb.channel('realtime:'+cid)
    .on('postgres_changes',{event:'*',schema:'public',table:'sales',filter:`company_id=eq.${cid}`},()=>refreshData())
    .on('postgres_changes',{event:'*',schema:'public',table:'finance',filter:`company_id=eq.${cid}`},()=>refreshData())
    .on('postgres_changes',{event:'*',schema:'public',table:'products',filter:`company_id=eq.${cid}`},()=>refreshData())
    .on('postgres_changes',{event:'*',schema:'public',table:'shipping_companies'},()=>refreshData())
    .on('postgres_changes',{event:'*',schema:'public',table:'system_branches'},()=>refreshData())
    .subscribe();
}

// ══════════════════════════════════════
//  NAVIGATE
// ══════════════════════════════════════
const PAGE_TITLES={dashboard:'Dashboard',sales:'ຈັດການຍອດຂາຍ',finance:'ການເງິນ',products:'ສິນຄ້າ',ads:'ໂຄສະນາ',reports:'ລາຍງານ',company:'ຂໍ້ມູນບໍລິສັດ','co-info':'ຂໍ້ມູນບໍລິສັດ','co-shipping':'ບໍລິສັດຂົນສົ່ງ'};
function toggleSettings(){
  const sub=document.getElementById('settings-submenu');
  const arr=document.getElementById('settings-arrow');
  const open=sub.style.display==='block';
  sub.style.display=open?'none':'block';
  arr.style.transform=open?'':'rotate(90deg)';
}
function navigate(page, pushHistory=true){
  if(page==='company') page='co-info';
  // push current page to history before switching (only if different)
  if(pushHistory && S.page && S.page!==page){
    S.navHistory.push(S.page);
    if(S.navHistory.length>20) S.navHistory.shift();
  }
  // auto-open settings submenu for settings pages
  if(page==='co-info'||page==='co-shipping'){
    document.getElementById('settings-submenu').style.display='block';
    document.getElementById('settings-arrow').style.transform='rotate(90deg)';
  }
  S.page=page;
  // Save current page so refresh restores it
  try{ localStorage.setItem('hg_page', page); }catch(e){}
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item,.nav-subitem').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  const pg=document.getElementById('page-'+page);
  if(pg) pg.classList.add('active');
  document.getElementById('page-title').textContent=PAGE_TITLES[page]||page;
  const ta=document.getElementById('topbar-actions');
  ta.innerHTML=(page!=='dashboard')?`<button class="btn btn-outline btn-sm" onclick="showExportMenu(this,'${page}')"><i class="fa fa-download"></i> Export</button><button class="btn btn-outline btn-sm" onclick="refreshData()"><i class="fa fa-sync"></i></button>`:'<button class="btn btn-outline btn-sm" onclick="refreshData()"><i class="fa fa-sync"></i></button>';
  // show/hide back button
  const bb=document.getElementById('back-btn');
  if(bb) bb.style.display=S.navHistory.length?'inline-flex':'none';
  renderPage(page);
  if(window.innerWidth<=768) document.getElementById('sidebar').classList.remove('open');
}
function openSellerModal(){
  try{
    sv('seller-shopname',localStorage.getItem('hg_seller_shop')||S.company?.name||'');
    sv('seller-name',localStorage.getItem('hg_seller_name')||'');
    sv('seller-phone',localStorage.getItem('hg_seller_phone')||'');
  }catch(e){}
  openModal('modal-seller');
}
function saveSellerInfo(){
  try{
    localStorage.setItem('hg_seller_shop',v('seller-shopname').trim());
    localStorage.setItem('hg_seller_name',v('seller-name').trim());
    localStorage.setItem('hg_seller_phone',v('seller-phone').trim());
  }catch(e){}
  closeModal('modal-seller');
  toast('ບັນທຶກຂໍ້ມູນຜູ້ຂາຍສຳເລັດ ✓','success');
  // refresh co-info panel preview if currently viewing it
  if(S.page==='co-info') renderCoInfo();
}
function getSellerInfo(){
  try{return{shop:localStorage.getItem('hg_seller_shop')||S.company?.name||'',name:localStorage.getItem('hg_seller_name')||'',phone:localStorage.getItem('hg_seller_phone')||''};}
  catch(e){return{shop:S.company?.name||'',name:'',phone:''};}
}
function goBack(){
  if(!S.navHistory.length) return;
  const prev=S.navHistory.pop();
  navigate(prev, false);
}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');}
function renderPage(p){
  if(p==='dashboard') renderDash();
  else if(p==='sales') renderSalesPage();
  else if(p==='finance') renderFin();
  else if(p==='products') renderProductsTable();
  else if(p==='ads') renderAds();
  else if(p==='reports') renderReports();
  else if(p==='company'||p==='co-info') renderCoInfo();
  else if(p==='co-shipping') renderCoShipping();
}

// ══════════════════════════════════════
//  DATE RANGE PICKER
// ══════════════════════════════════════
function openDateRangePicker(context){
  sv('date-range-context',context);
  const range=S.customRanges[context];
  sv('date-range-start',range?range.start:today());
  sv('date-range-end',range?range.end:today());
  openModal('modal-date-range');
}
function applyDateRange(){
  const context=v('date-range-context');
  const start=v('date-range-start');
  const end=v('date-range-end');
  if(!start||!end){toast('ກະລຸນາເລືອກວັນທີ','error');return;}
  if(start>end){toast('ວັນທີເລີ່ມຕ້ອງບໍ່ເກີນວັນທີສິ້ນສຸດ','error');return;}
  S.customRanges[context]={start,end};
  const btnId=context+'-custom-btn';
  const btn=document.getElementById(btnId);
  if(btn) btn.innerHTML=formatDateRange(start,end);
  if(context==='dash') setDashPeriod('custom');
  else if(context==='fin') setFinPeriod('custom');
  else if(context==='ads') setAdsPeriod('custom');
  else if(context==='rep') setRepPeriod('custom');
  else if(context==='sales') setSalesPeriod('custom');
  else if(context==='pending') setPendingPeriod('custom');
  closeModal('modal-date-range');
}
function formatDateRange(start,end){
  const d1=new Date(start), d2=new Date(end);
  const fmt=d=>d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
  return fmt(d1)+'-'+fmt(d2);
}

// ══════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════
function showExportMenu(btn,page){
  document.querySelectorAll('.export-menu').forEach(m=>m.remove());
  const menu=document.createElement('div');
  menu.className='export-menu';
  menu.style.cssText='position:fixed;background:#fff;border:1px solid var(--gray-300);border-radius:var(--radius);box-shadow:var(--shadow);z-index:300;min-width:180px;padding:4px 0';
  const rect=btn.getBoundingClientRect();
  menu.style.top=(rect.bottom+4)+'px'; menu.style.right=(window.innerWidth-rect.right)+'px';
  menu.innerHTML=`
    <div onclick="exportCSV('${page}');this.parentElement.remove()" style="padding:10px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px" onmouseover="this.style.background='var(--green-hover)'" onmouseout="this.style.background=''">📄 Export Excel</div>
    ${GAS_URL?`<div onclick="exportSheets('${page}');this.parentElement.remove()" style="padding:10px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px" onmouseover="this.style.background='var(--green-hover)'" onmouseout="this.style.background=''">📊 Sync Google Sheets</div>`:'<div style="padding:8px 16px;font-size:12px;color:var(--gray-500)">ຕັ້ງຄ່າ GAS URL ກ່ອນ</div>'}`;
  document.body.appendChild(menu);
  setTimeout(()=>document.addEventListener('click',function rm(){menu.remove();document.removeEventListener('click',rm);},{once:true}),100);
}

function hslToRgb(hsl){
  const match=hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if(!match) return 'f5f5f5';
  let h=parseInt(match[1])/360;
  const s=parseInt(match[2])/100;
  const l=parseInt(match[3])/100;
  let r,g,b;
  if(s===0){
    r=g=b=l;
  }else{
    const hue2rgb=(p,q,t)=>{
      if(t<0) t+=1;
      if(t>1) t-=1;
      if(t<1/6) return p+(q-p)*6*t;
      if(t<1/2) return q;
      if(t<2/3) return p+(q-p)*(2/3-t)*6;
      return p;
    };
    const q=l<0.5?l*(1+s):l+s-l*s;
    const p=2*l-q;
    r=hue2rgb(p,q,h+1/3);
    g=hue2rgb(p,q,h);
    b=hue2rgb(p,q,h-1/3);
  }
  const toHex=x=>{
    const hex=Math.round(x*255).toString(16);
    return hex.length===1?'0'+hex:hex;
  };
  return toHex(r)+toHex(g)+toHex(b);
}

// ══════════════════════════════════════
//  UTILS
// ══════════════════════════════════════
function showScreen(id){
  // Complete & hide splash bar
  const bar=document.getElementById('splash-bar');
  const splash=document.getElementById('splash-screen');
  if(bar){bar.classList.remove('running');bar.classList.add('done');}
  if(splash&&splash.style.display!=='none'){
    splash.classList.add('hide');
    setTimeout(()=>{splash.style.display='none';splash.classList.remove('hide');},380);
  }
  document.getElementById('auth-screen').style.display=id==='auth-screen'?'flex':'none';
  document.getElementById('company-screen').style.display=id==='company-screen'?'block':'none';
  document.getElementById('app-screen').style.display=id==='app-screen'?'block':'none';
}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function v(id){const e=document.getElementById(id);return e?e.value:'';}
function sv(id,val){const e=document.getElementById(id);if(e)e.value=val;}
function mkEl(html){const d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild;}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmt(n){return Math.round(n||0).toLocaleString();}
function fmtK(n){if(n>=1000000)return (n/1000000).toFixed(1)+'M';if(n>=1000)return (n/1000).toFixed(0)+'K';return n;}
function fmtDate(d){if(!d)return '-';try{const dt=new Date(d);return `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`;}catch{return d;}}
function today(){return new Date().toISOString().slice(0,10);}
function roleLabel(r){return r==='owner'?'Owner':r==='admin'?'Admin':'Staff';}
function badge(s){const m={'ສຳເລັດ':'badge-green','ລໍຖ້າ':'badge-orange','ຈັດສົ່ງ':'badge-blue','ຍົກເລີກ':'badge-red','ດຳເນີນຢູ່':'badge-blue','ຢຸດ':'badge-gray'};return `<span class="badge ${m[s]||'badge-gray'}">${s}</span>`;}
function dc(k){if(charts[k]){charts[k].destroy();delete charts[k];}}
function toast(msg,type='success'){
  const c=document.getElementById('toast');
  const t=document.createElement('div');
  t.className='toast-item '+type;
  t.innerHTML=(type==='success'?'✓ ':type==='error'?'✕ ':'ℹ ')+esc(msg);
  c.appendChild(t);
  setTimeout(()=>{t.style.transition='opacity .4s';t.style.opacity='0';},3000);
  setTimeout(()=>t.remove(),3500);
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');}));

// ══════════════════════════════════════
//  INIT
// ══════════════════════════════════════
async function init(){
  // Show splash bar while checking session — don't flash login page
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('company-screen').style.display='none';
  document.getElementById('app-screen').style.display='none';
  document.getElementById('splash-screen').style.display='flex';
  const bar=document.getElementById('splash-bar');
  if(bar){bar.classList.add('running');}

  const{data:{session}}=await sb.auth.getSession();
  if(session?.user){await afterLogin(session.user);return;}
  // No saved session → show login
  showScreen('auth-screen');
  // ເຊັກ URL hash ສຳລັບ recovery token
  await checkRecoveryToken();
  sb.auth.onAuthStateChange(async(event,session)=>{
    if(event==='SIGNED_IN'&&session?.user) await afterLogin(session.user);
    else if(event==='SIGNED_OUT') showScreen('auth-screen');
  });
}
init();

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// PWA install prompt
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  const btn = document.getElementById('btn-pwa-install');
  if (btn) btn.style.display = 'flex';
});
window.addEventListener('appinstalled', () => {
  _installPrompt = null;
  const btn = document.getElementById('btn-pwa-install');
  if (btn) btn.style.display = 'none';
  toast('ຕິດຕັ້ງ App ສຳເລັດ ✓', 'success');
});
async function installPWA(){
  if (!_installPrompt) return;
  _installPrompt.prompt();
  const result = await _installPrompt.userChoice;
  if (result.outcome === 'accepted') {
    _installPrompt = null;
    document.getElementById('btn-pwa-install').style.display = 'none';
  }
}

// ══════════════════════════════════════
//  EXPORT (shared across pages: sales/finance/products/ads/reports)
// ══════════════════════════════════════
function exportCSV(page){
  let hdr=[],rows=[];
  const db=S.db;
  if(page==='sales'){
    hdr=['ວັນທີ','ຊ່ອງທາງ','ຊື່ລູກຄ້າ','ເບີໂທ','ບໍລິສັດຂົນສົ່ງ','ແຂວງ','ເມືອງ','ສາຂາ/ທີ່ຢູ່','ສິນຄ້າ','ຈຳນວນ','ລາຄາຂາຍ','ຕົ້ນທຶນ','ສ່ວນຫຼຸດ','ຍອດລວມ','ກຳໄລ','ສະຖານະ','ໝາຍເຫດ'];
    rows=getSalesPeriodData().map(s=>{
      const total=s.qty*s.price-(s.discount||0);
      const profit=s.qty*(s.price-s.cost)-(s.discount||0);
      return [s.date,s.channel||'',s.customer_name||'',s.customer_phone||'',s.shipping_company||'',s.province||'',s.district||'',s.branch||'',s.product_name||'',s.qty,s.price,s.cost,s.discount||0,total,profit,s.status||'',s.note||''];
    });
  }
  else if(page==='finance'){hdr=['ວັນທີ','ລາຍການ','ໝວດ','ປະເພດ','ຈຳນວນ','ສິນຄ້າ','ໝາຍເຫດ'];rows=db.finance.map(f=>[f.date,f.description,f.category,f.type,f.amount,f.product_name||'',f.note||'']);}
  else if(page==='products'){hdr=['ຊື່','SKU','ໝວດ','ລາຄາ','ຕົ້ນທຶນ','Stock','ສະຖານະ'];rows=db.products.map(p=>[p.name,p.sku||'',p.category,p.price,p.cost,p.stock||0,p.status]);}
  else if(page==='ads'||page==='reports'){hdr=['ວັນທີ','ແພລດຟອມ','ຊື່','ສິນຄ້າ','ງົບ','ໃຊ້ໄປ','ລາຍຮັບ','ROAS','ສະຖານະ'];rows=db.ads.map(a=>[a.date,a.platform,a.name,a.product_name||'',a.budget,a.spent,a.revenue,a.spent>0?(a.revenue/a.spent).toFixed(2):0,a.status]);}
  
  // Create Excel file using SheetJS
  const wb=XLSX.utils.book_new();
  const ws_data=[hdr,...rows];
  const ws=XLSX.utils.aoa_to_sheet(ws_data);
  
  // Set column widths for better readability
  ws['!cols']=page==='sales'?[
    {wch:12},{wch:10},{wch:18},{wch:14},{wch:16},{wch:14},{wch:14},{wch:16},{wch:16},{wch:8},{wch:10},{wch:10},{wch:10},{wch:12},{wch:12},{wch:10},{wch:18}
  ]:[
    {wch:15}, // ວັນທີ
    {wch:20}, // ຊື່ລູກຄ້າ
    {wch:15}, // ເບີໂທລູກຄ້າ
    {wch:10}, // ລາຄາ
    {wch:12}, // ແຫຼ່ງທີ່ມາ
    {wch:10}, // ຈຳນວນຊິ້ນ
    {wch:15}, // ບໍລິສັດຂົນ
    {wch:15}  // ໄດ້ຮັບຂອງແລ້ວ
  ];
  
  // Add color coding for sales page
  if(page==='sales'){
    const range=XLSX.utils.decode_range(ws['!ref']);
    for(let R=range.s.r+1;R<=range.e.r;R++){
      // Channel column (index 1, column B)
      const channelCell=ws[XLSX.utils.encode_cell({r:R,c:1})];
      if(channelCell){
        const channel=channelCell.v;
        const color=getChannelColor(channel);
        if(!channelCell.s) channelCell.s={};
        channelCell.s.fill={fgColor:{rgb:color.replace('#','')}};
      }
      // Shipping company column (index 4, column E)
      const shipCell=ws[XLSX.utils.encode_cell({r:R,c:4})];
      if(shipCell){
        const ship=shipCell.v;
        const hslColor=getShippingCompanyColor(ship);
        const rgb=hslToRgb(hslColor);
        if(!shipCell.s) shipCell.s={};
        shipCell.s.fill={fgColor:{rgb:rgb}};
      }
      // Alternating column colors
      for(let C=range.s.c;C<=range.e.c;C++){
        const cell=ws[XLSX.utils.encode_cell({r:R,c:C})];
        if(cell){
          if(!cell.s) cell.s={};
          if(C%2===0){
            cell.s.fill={fgColor:{rgb:'f5f5f5'}};
          }
        }
      }
    }
    // Header row styling
    for(let C=range.s.c;C<=range.e.c;C++){
      const headerCell=ws[XLSX.utils.encode_cell({r:range.s.r,c:C})];
      if(headerCell){
        if(!headerCell.s) headerCell.s={};
        headerCell.s.fill={fgColor:{rgb:'1a1d27'}};
        headerCell.s.font={color:{rgb:'ffffff'},bold:true};
      }
    }
  }
  
  XLSX.utils.book_append_sheet(wb,ws,'Orders');
  XLSX.writeFile(wb,`${S.company.name}_${page}_${today()}.xlsx`);
  toast('Export Excel ສຳເລັດ ✓','success');
}
async function exportSheets(page){
  if(!GAS_URL){toast('ກະລຸນາຕັ້ງຄ່າ GAS URL ໃນ ຕັ້ງຄ່າ → ຕັ້ງຄ່າບໍລິສັດ','error');return;}
  const map={sales:'sales',finance:'finance',products:'products',ads:'ads',reports:'ads'};
  const sheet=map[page]||'sales';
  const data=page==='sales'?getSalesPeriodData():(S.db[sheet]||[]);
  const payload={sheet,action:'sync_all',data:{[sheet]:data}};
  try{
    toast('ກຳລັງ sync...','info');
    const res=await fetch(GAS_URL,{method:'POST',body:JSON.stringify(payload),headers:{'Content-Type':'application/json'}});
    const r=await res.json();
    r.status==='ok'?toast('Sync Google Sheets ສຳເລັດ ✓','success'):toast('Error: '+r.message,'error');
  }catch(e){toast('ບໍ່ສາມາດ connect: '+e.message,'error');}
}
