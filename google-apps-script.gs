// ============================================================
// Herb & Gadget — Google Apps Script (Web App)
// ວິທີໃຊ້:
// 1. ເປີດ Google Sheet ຂອງທ່ານ
// 2. ໄປທີ່ Extensions > Apps Script
// 3. ລຶບ code ທີ່ມີຢູ່ ແລ້ວ paste code ທັງໝົດນີ້ລົງໄປ
// 4. ກົດ Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5. ກົດ Deploy ແລ້ວ Copy URL ໄປວາງໃນ Dashboard Settings
//
// 6. (ສຳລັບ auto-export ທຸກຄືນ 23:00) ຕື່ມຄ່າ 3 ຕົວໃນ CONFIG ຂ້າງລຸ່ມ
//    ແລ້ວຕັ້ງ Trigger ຕາມ auto-export-setup.md
// ============================================================

const SHEET_NAMES = {
  sales:    'ຍອດຂາຍ',
  finance:  'ການເງິນ',
  products: 'ສິນຄ້າ',
  ads:      'ໂຄສະນາ'
};

// Column order here MUST match the order returned by buildRow() below — they're built together.
const HEADERS = {
  sales:    ['ID','ວັນທີ','ສິນຄ້າ','ຊ່ອງທາງ','ລູກຄ້າ','ເບີໂທ','ຈຳນວນ','ລາຄາ','ຕົ້ນທຶນ','ສ່ວນຫຼຸດ','ຍອດລວມ','ກຳໄລ','ບໍລິສັດຂົນສົ່ງ','ແຂວງ','ເມືອງ','ສາຂາ','ສະຖານະ','ໝາຍເຫດ','ບັນທຶກເວລາ'],
  finance:  ['ID','ວັນທີ','ລາຍການ','ໝວດ','ປະເພດ','ຈຳນວນ','ສິນຄ້າ','ໝາຍເຫດ','ບັນທຶກເວລາ'],
  products: ['ID','ຊື່ສິນຄ້າ','SKU','ໝວດ','ລາຄາຂາຍ','ຕົ້ນທຶນ','Stock','ສະຖານະ','ອັບເດດເວລາ'],
  ads:      ['ID','ວັນທີ','ແພລດຟອມ','ຊື່ແຄມເປຍ','ສິນຄ້າ','ງົບ','ໃຊ້ໄປ','ລາຍຮັບ','ROAS','ສະຖານະ','ບັນທຶກເວລາ']
};

// ============================================================
// CONFIG — only needed for the daily 23:00 auto-export (see step 6 above)
// ============================================================
const SUPABASE_URL = 'https://bhyjvqcgynlxsanptgfq.supabase.co';
const SUPABASE_SERVICE_KEY = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE'; // Supabase → Settings → API → service_role (secret)

// ============================================================
// MAIN ENTRY POINTS
// ============================================================

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Herb & Gadget API ready 🌿' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { sheet, action, data } = body;

    if (!SHEET_NAMES[sheet]) throw new Error('Unknown sheet: ' + sheet);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = getOrCreateSheet(ss, SHEET_NAMES[sheet], HEADERS[sheet]);

    let result;
    if (action === 'append')       result = appendRow(ws, sheet, data);
    else if (action === 'update')  result = updateRow(ws, data.id, sheet, data);
    else if (action === 'delete')  result = deleteRow(ws, data.id);
    else if (action === 'sync_all') result = syncAll(ss, data);
    else throw new Error('Unknown action: ' + action);

    return jsonResponse({ status: 'ok', result });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message }, 400);
  }
}

// ============================================================
// SHEET HELPERS
// ============================================================

function getOrCreateSheet(ss, name, headers) {
  let ws = ss.getSheetByName(name);
  if (!ws) {
    ws = ss.insertSheet(name);
    const headerRange = ws.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground('#1a1d27');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    ws.setFrozenRows(1);
    ws.setColumnWidths(1, headers.length, 130);
  }
  return ws;
}

function appendRow(ws, sheetKey, data) {
  const row = buildRow(sheetKey, data);
  ws.appendRow(row);
  styleLastRow(ws);
  return { rows: ws.getLastRow() - 1 };
}

function updateRow(ws, id, sheetKey, data) {
  const rowIdx = findRowById(ws, id);
  if (rowIdx < 0) return appendRow(ws, sheetKey, data); // upsert
  const row = buildRow(sheetKey, data);
  ws.getRange(rowIdx, 1, 1, row.length).setValues([row]);
  return { updated: rowIdx };
}

function deleteRow(ws, id) {
  const rowIdx = findRowById(ws, id);
  if (rowIdx < 0) return { deleted: false };
  ws.deleteRow(rowIdx);
  return { deleted: true };
}

function syncAll(ss, allData) {
  // Full sync: clear & rewrite all sheets
  const results = {};
  for (const [key, items] of Object.entries(allData)) {
    if (!SHEET_NAMES[key] || !Array.isArray(items)) continue;
    const ws = getOrCreateSheet(ss, SHEET_NAMES[key], HEADERS[key]);
    // Clear data rows (keep header)
    const lastRow = ws.getLastRow();
    if (lastRow > 1) ws.deleteRows(2, lastRow - 1);
    // Write all rows
    if (items.length > 0) {
      const rows = items.map(d => buildRow(key, d));
      ws.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      styleDataRange(ws, rows.length);
    }
    results[key] = items.length;
  }
  return results;
}

// ============================================================
// ROW BUILDERS
// Field names here MUST match the real column names in Supabase / the web app —
// they do NOT match the old placeholder names (d.product, d.customer, d.desc, d.cat)
// that were in the original version of this file, which silently produced blank
// columns in the sheet. Fixed to match: product_name, customer_name, customer_phone,
// discount, shipping_company, province, district, branch, description, category.
// ============================================================

function buildRow(sheetKey, d) {
  const now = new Date().toLocaleString('th-TH');
  if (sheetKey === 'sales') {
    const total = d.qty * d.price - (d.discount || 0);
    const profit = d.qty * (d.price - d.cost) - (d.discount || 0);
    return [
      d.id, d.date, d.product_name, d.channel, d.customer_name || '', d.customer_phone || '',
      d.qty, d.price, d.cost, d.discount || 0,
      total, profit,
      d.shipping_company || '', d.province || '', d.district || '', d.branch || '',
      d.status, d.note || '', now
    ];
  }
  if (sheetKey === 'finance') {
    return [d.id, d.date, d.description, d.category, d.type, d.amount, d.product_name || '', d.note || '', now];
  }
  if (sheetKey === 'products') {
    return [d.id, d.name, d.sku || '', d.category, d.price, d.cost, d.stock, d.status, now];
  }
  if (sheetKey === 'ads') {
    const roas = d.spent > 0 ? (d.revenue / d.spent).toFixed(2) : 0;
    return [d.id, d.date, d.platform, d.name, d.product_name || '', d.budget, d.spent || 0, d.revenue || 0, roas, d.status || '', now];
  }
  return [];
}

// ============================================================
// DAILY AUTO-EXPORT (23:00 Vientiane time, via Time-driven Trigger)
// Sends only sales where exported_to_sheet = false, appends them, then
// marks them exported so they're never sent again.
// Requires: `alter table sales add column if not exists exported_to_sheet boolean not null default false;`
// Setup steps: see auto-export-setup.md
// ============================================================

function dailyAutoExportSales() {
  if (SUPABASE_SERVICE_KEY === 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE') {
    Logger.log('SUPABASE_SERVICE_KEY not set — skipping auto-export.');
    return;
  }

  // 1) Fetch only sales not yet exported
  const listUrl = SUPABASE_URL + '/rest/v1/sales?exported_to_sheet=eq.false&select=*&order=date.asc';
  const listRes = UrlFetchApp.fetch(listUrl, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY
    },
    muteHttpExceptions: true
  });
  const rows = JSON.parse(listRes.getContentText());
  if (!rows || !rows.length) { Logger.log('No new sales to export today.'); return; }

  // 2) Append to the sheet using the same buildRow() logic as manual export, so columns always match
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = getOrCreateSheet(ss, SHEET_NAMES.sales, HEADERS.sales);
  const values = rows.map(r => buildRow('sales', r));
  ws.getRange(ws.getLastRow() + 1, 1, values.length, values[0].length).setValues(values);
  styleDataRange(ws, values.length);

  // 3) Mark as exported so tomorrow's run never resends these
  const ids = rows.map(r => r.id).join(',');
  const patchUrl = SUPABASE_URL + '/rest/v1/sales?id=in.(' + ids + ')';
  UrlFetchApp.fetch(patchUrl, {
    method: 'patch',
    contentType: 'application/json',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY,
      Prefer: 'return=minimal'
    },
    payload: JSON.stringify({ exported_to_sheet: true }),
    muteHttpExceptions: true
  });

  Logger.log('Exported ' + rows.length + ' sales.');
}

// ============================================================
// UTILITIES
// ============================================================

function findRowById(ws, id) {
  const data = ws.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1;
  }
  return -1;
}

function styleLastRow(ws) {
  const row = ws.getLastRow();
  const cols = ws.getLastColumn();
  const range = ws.getRange(row, 1, 1, cols);
  const bg = row % 2 === 0 ? '#f8f9fa' : '#ffffff';
  range.setBackground(bg);
}

function styleDataRange(ws, count) {
  for (let i = 0; i < count; i++) {
    const row = i + 2;
    const cols = ws.getLastColumn();
    ws.getRange(row, 1, 1, cols).setBackground(row % 2 === 0 ? '#f8f9fa' : '#ffffff');
  }
}

function jsonResponse(data, code) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
