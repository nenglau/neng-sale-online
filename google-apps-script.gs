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
// ============================================================

const SHEET_NAMES = {
  sales:    'ຍອດຂາຍ',
  finance:  'ການເງິນ',
  products: 'ສິນຄ້າ',
  ads:      'ໂຄສະນາ'
};

const HEADERS = {
  sales:    ['ID','ວັນທີ','ສິນຄ້າ','ຊ່ອງທາງ','ລູກຄ້າ','ຈຳນວນ','ລາຄາ','ຕົ້ນທຶນ','ຍອດລວມ','ກຳໄລ','ສະຖານະ','ໝາຍເຫດ','ບັນທຶກເວລາ'],
  finance:  ['ID','ວັນທີ','ລາຍການ','ໝວດ','ປະເພດ','ຈຳນວນ','ໝາຍເຫດ','ບັນທຶກເວລາ'],
  products: ['ID','ຊື່ສິນຄ້າ','SKU','ໝວດ','ລາຄາຂາຍ','ຕົ້ນທຶນ','Stock','ສະຖານະ','ອັບເດດເວລາ'],
  ads:      ['ID','ວັນທີ','ແພລດຟອມ','ຊື່ແຄມເປຍ','ສິນຄ້າ','ງົບ','ໃຊ້ໄປ','ລາຍຮັບ','ROAS','ສະຖານະ','ບັນທຶກເວລາ']
};

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
// ============================================================

function buildRow(sheetKey, d) {
  const now = new Date().toLocaleString('th-TH');
  if (sheetKey === 'sales') {
    return [
      d.id, d.date, d.product, d.channel, d.customer || '',
      d.qty, d.price, d.cost,
      d.qty * d.price,
      d.qty * (d.price - d.cost),
      d.status, d.note || '', now
    ];
  }
  if (sheetKey === 'finance') {
    return [d.id, d.date, d.desc, d.cat, d.type, d.amount, d.note || '', now];
  }
  if (sheetKey === 'products') {
    return [d.id, d.name, d.sku, d.cat, d.price, d.cost, d.stock, d.status, now];
  }
  if (sheetKey === 'ads') {
    const roas = d.spent > 0 ? (d.revenue / d.spent).toFixed(2) : 0;
    return [d.id, d.date, d.platform, d.name, d.product, d.budget, d.spent, d.revenue, roas, d.status, now];
  }
  return [];
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
