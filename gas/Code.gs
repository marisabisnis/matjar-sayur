/**
 * Google Apps Script — Pesan Sayur Backend
 * 
 * Deploy sebagai Web App:
 * 1. Buka script.google.com → New Project
 * 2. Paste kode ini di Code.gs
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL deployment → simpan di .env.local
 * 
 * Spreadsheet harus punya tab:
 *   products, categories, stores, payment_methods, orders, sliders, coupons
 */

const SPREADSHEET_ID = '1HHVN9Fn6wHb0xGbHsHAqFrqAxklNinJjpKyvqZTAYQg';

/**
 * Vercel Deploy Hook URL
 * Dapatkan dari: Vercel → Settings → Git → Deploy Hooks
 * Ganti URL di bawah dengan URL deploy hook kamu
 */
const VERCEL_DEPLOY_HOOK_URL = 'https://api.vercel.com/v1/integrations/deploy/prj_tjyhjeQ4LU2i02FcDU9J91VhvY2x/e12nHdk6Pm';

/**
 * Menu kustom di Google Sheets
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🛒 Pesan Sayur')
    .addItem('🔄 Update Website', 'rebuildWebsite')
    .addSeparator()
    .addSubMenu(ui.createMenu('📱 WA Follow-up')
      .addItem('✅ Konfirmasi Pesanan', 'waKonfirmasi')
      .addItem('💳 Reminder Pembayaran', 'waReminderBayar')
      .addItem('🚚 Pesanan Dikirim', 'waPesananDikirim')
      .addItem('🚚 Kirim Notif (Bulk)', 'bulkKirimNotif')
      .addItem('🎉 Pesanan Selesai', 'waPesananSelesai')
      .addItem('💬 Pesan Custom', 'waPesanCustom')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Dashboard')
      .addItem('📈 Ringkasan Hari Ini', 'dashboardHariIni')
      .addItem('🏆 Produk Terlaris', 'produkTerlaris')
    )
    .addSeparator()
    .addItem('🔃 Refresh WA Links', 'refreshWALinks')
    .addItem('📊 Setup Headers', 'setupHeaders')
    .addToUi();
}

/**
 * GitHub repo config — untuk push data JSON langsung ke repo
 * Buat Personal Access Token di: https://github.com/settings/tokens
 * Scope yang dibutuhkan: repo (full control)
 */
const GITHUB_TOKEN = 'PASTE_GITHUB_TOKEN_DISINI';
const GITHUB_OWNER = 'marisabisnis';
const GITHUB_REPO = 'pesan-sayur';
const GITHUB_BRANCH = 'main';

/**
 * Push multiple files ke GitHub dalam 1 commit via Git Trees API
 * files = [{ path: 'public/data/stores.json', content: '...' }, ...]
 */
function pushFilesToGitHub(files, commitMessage) {
  var baseApi = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO;
  var headers = { 'Authorization': 'Bearer ' + GITHUB_TOKEN, 'Content-Type': 'application/json' };
  
  // 1. Get latest commit SHA on branch
  var refRes = UrlFetchApp.fetch(baseApi + '/git/ref/heads/' + GITHUB_BRANCH, { headers: headers, muteHttpExceptions: true });
  if (refRes.getResponseCode() !== 200) {
    throw new Error('Gagal ambil branch ref: ' + refRes.getResponseCode());
  }
  var latestSha = JSON.parse(refRes.getContentText()).object.sha;
  
  // 2. Get the tree SHA of latest commit
  var commitRes = UrlFetchApp.fetch(baseApi + '/git/commits/' + latestSha, { headers: headers, muteHttpExceptions: true });
  var baseTreeSha = JSON.parse(commitRes.getContentText()).tree.sha;
  
  // 3. Create blobs for each file
  var treeItems = [];
  for (var i = 0; i < files.length; i++) {
    var blobRes = UrlFetchApp.fetch(baseApi + '/git/blobs', {
      method: 'POST', headers: headers,
      payload: JSON.stringify({ content: files[i].content, encoding: 'utf-8' })
    });
    var blobSha = JSON.parse(blobRes.getContentText()).sha;
    treeItems.push({ path: files[i].path, mode: '100644', type: 'blob', sha: blobSha });
  }
  
  // 4. Create new tree
  var treeRes = UrlFetchApp.fetch(baseApi + '/git/trees', {
    method: 'POST', headers: headers,
    payload: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
  });
  var newTreeSha = JSON.parse(treeRes.getContentText()).sha;
  
  // 5. Create commit
  var newCommitRes = UrlFetchApp.fetch(baseApi + '/git/commits', {
    method: 'POST', headers: headers,
    payload: JSON.stringify({ message: commitMessage, tree: newTreeSha, parents: [latestSha] })
  });
  var newCommitSha = JSON.parse(newCommitRes.getContentText()).sha;
  
  // 6. Update branch ref
  var updateRes = UrlFetchApp.fetch(baseApi + '/git/refs/heads/' + GITHUB_BRANCH, {
    method: 'PATCH', headers: headers,
    payload: JSON.stringify({ sha: newCommitSha })
  });
  
  if (updateRes.getResponseCode() !== 200) {
    throw new Error('Gagal update branch: ' + updateRes.getResponseCode());
  }
  return newCommitSha;
}

/**
 * Trigger rebuild website di Vercel
 * Flow: Ambil data dari Sheets → Push 1 commit ke GitHub → Auto deploy
 */
function rebuildWebsite() {
  var ui = SpreadsheetApp.getUi();
  
  if (GITHUB_TOKEN === 'PASTE_GITHUB_TOKEN_DISINI') {
    ui.alert('⚠️ GitHub Token belum diatur!\n\n1. Buka https://github.com/settings/tokens\n2. Buat token baru (classic) dengan scope "repo"\n3. Paste token di Code.gs baris GITHUB_TOKEN');
    return;
  }
  
  var confirm = ui.alert(
    '🔄 Update Website',
    'Apakah Anda yakin ingin update website dengan data terbaru dari spreadsheet?\n\nProses ini membutuhkan ~1-2 menit.',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return;
  
  try {
    // 1. Collect all data from sheets
    var allData = {
      products: parseProducts(sheetToJSON('products')),
      categories: parseCategories(sheetToJSON('categories')),
      stores: parseStores(sheetToJSON('stores')),
      payments: parsePayments(sheetToJSON('payment_methods')),
      sliders: parseSliders(sheetToJSON('sliders')),
      coupons: parseCoupons(sheetToJSON('coupons'))
    };
    
    // 2. Prepare files for single commit
    var files = [
      { path: 'public/data/products.json', content: JSON.stringify(allData.products, null, 2) },
      { path: 'public/data/categories.json', content: JSON.stringify(allData.categories, null, 2) },
      { path: 'public/data/stores.json', content: JSON.stringify(allData.stores, null, 2) },
      { path: 'public/data/payments.json', content: JSON.stringify(allData.payments, null, 2) },
      { path: 'public/data/sliders.json', content: JSON.stringify(allData.sliders, null, 2) },
      { path: 'public/data/coupons.json', content: JSON.stringify(allData.coupons, null, 2) }
    ];
    
    // 3. Push all files in 1 commit → triggers Vercel auto-deploy
    pushFilesToGitHub(files, 'data: update semua data dari Sheets');
    
    ui.alert('✅ Berhasil!\n\n📦 6 file data di-push ke GitHub (1 commit)\n🚀 Vercel sedang rebuild website otomatis\n\nPerubahan akan muncul dalam ~1-2 menit.');
  } catch (e) {
    ui.alert('❌ Error: ' + e.message);
  }
}

function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

/**
 * Jalankan fungsi ini dari Apps Script Editor (▶ Run) untuk otorisasi.
 * Setelah otorisasi berhasil, tombol menu di Sheets akan berfungsi.
 */
function authorizeAndRebuild() {
  const response = UrlFetchApp.fetch(VERCEL_DEPLOY_HOOK_URL, { method: 'POST' });
  Logger.log('Status: ' + response.getResponseCode());
  Logger.log('✅ Rebuild triggered! Website akan update dalam ~1 menit.');
}

/**
 * Convert sheet data to array of objects using header row
 */
function sheetToJSON(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
}

/**
 * Parse products — handle variasi_json, foto_galeri, booleans, numbers
 */
function parseProducts(raw) {
  return raw
    .filter(r => r.id)
    .map(r => ({
      id: String(r.id),
      kategori_id: String(r.kategori_id),
      nama: r.nama || '',
      slug: r.slug || '',
      deskripsi: r.deskripsi || '',
      harga: Number(r.harga) || 0,
      harga_diskon: (r.harga_diskon !== '' && r.harga_diskon !== null && r.harga_diskon !== undefined && Number(r.harga_diskon) > 0) ? Number(r.harga_diskon) : null,
      foto_utama: r.foto_utama || '',
      foto_galeri: r.foto_galeri ? String(r.foto_galeri).split(',').map(s => s.trim()).filter(Boolean) : [],
      stok: Number(r.stok) || 0,
      satuan: r.satuan || '',
      aktif: r.aktif === true || r.aktif === 'TRUE' || r.aktif === 'true',
      unggulan: r.unggulan === true || r.unggulan === 'TRUE' || r.unggulan === 'true',
      urutan: Number(r.urutan) || 0,
      min_qty: Number(r.min_qty) || 1,
      variasi: parseVariasi(r.variasi_json),
      seo_title: r.seo_title || '',
      seo_desc: r.seo_desc || '',
      kategori_nama: r.kategori_nama || '',
    }));
}

function parseVariasi(json) {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Parse categories
 */
function parseCategories(raw) {
  return raw
    .filter(r => r.id)
    .map(r => ({
      id: String(r.id),
      nama: r.nama || '',
      slug: r.slug || '',
      icon_url: r.icon_url || '',
      urutan: Number(r.urutan) || 0,
      aktif: r.aktif === true || r.aktif === 'TRUE' || r.aktif === 'true',
    }));
}

/**
 * Parse stores
 */
function parseStores(raw) {
  return raw
    .filter(r => r.id)
    .map(r => ({
      id: String(r.id),
      nama: r.nama || '',
      alamat: r.alamat || '',
      lat: Number(r.lat) || 0,
      lng: Number(r.lng) || 0,
      telepon: String(r.telepon || ''),
      whatsapp: String(r.whatsapp || ''),
      jam_buka: r.jam_buka || '',
      tarif_per_km: Number(r.tarif_per_km) || 0,
      min_order: Number(r.min_order) || 0,
      max_jarak_km: Number(r.max_jarak_km) || 0,
      gratis_ongkir_diatas: Number(r.gratis_ongkir_diatas) || 0,
      logo_url: r.logo_url || '',
      banner_url: r.banner_url || '',
      aktif: r.aktif === true || r.aktif === 'TRUE' || r.aktif === 'true',
    }));
}

/**
 * Parse payment methods
 */
function parsePayments(raw) {
  return raw
    .filter(r => r.tipe)
    .map(r => ({
      tipe: r.tipe || '',
      provider: r.provider || '',
      no_rekening: String(r.no_rekening || ''),
      atas_nama: r.atas_nama || '',
      logo_url: r.logo_url || '',
      instruksi: r.instruksi || '',
      qris_url: r.qris_url || '',
      aktif: r.aktif === true || r.aktif === 'TRUE' || r.aktif === 'true',
    }));
}

/**
 * Parse sliders (promo banner carousel)
 */
function parseSliders(raw) {
  return raw
    .filter(r => r.id)
    .map(r => ({
      id: String(r.id),
      gambar_url: r.gambar_url || '',
      judul: r.judul || '',
      deskripsi: r.deskripsi || '',
      tipe_link: r.tipe_link || 'url',
      link_tujuan: r.link_tujuan || '',
      urutan: Number(r.urutan) || 0,
      aktif: r.aktif === true || r.aktif === 'TRUE' || r.aktif === 'true',
    }))
    .filter(s => s.aktif)
    .sort((a, b) => a.urutan - b.urutan);
}

/**
 * Parse coupons
 */
function parseCoupons(raw) {
  return raw
    .filter(r => r.kode)
    .map(r => ({
      kode: String(r.kode).toUpperCase(),
      tipe: r.tipe || 'nominal',
      nilai: Number(r.nilai) || 0,
      min_order: Number(r.min_order) || 0,
      max_diskon: Number(r.max_diskon) || 0,
      batas_pakai: Number(r.batas_pakai) || 0,
      sudah_dipakai: Number(r.sudah_dipakai) || 0,
      berlaku_dari: r.berlaku_dari ? new Date(r.berlaku_dari).toISOString() : '',
      berlaku_sampai: r.berlaku_sampai ? new Date(r.berlaku_sampai).toISOString() : '',
      aktif: r.aktif === true || r.aktif === 'TRUE' || r.aktif === 'true',
    }));
}

/**
 * GET handler — returns JSON data
 */
function doGet(e) {
  const action = e.parameter.action || 'products';
  let data;

  switch (action) {
    case 'products':
      data = parseProducts(sheetToJSON('products'));
      break;
    case 'categories':
      data = parseCategories(sheetToJSON('categories'));
      break;
    case 'stores':
      data = parseStores(sheetToJSON('stores'));
      break;
    case 'payments':
      data = parsePayments(sheetToJSON('payment_methods'));
      break;
    case 'sliders':
      data = parseSliders(sheetToJSON('sliders'));
      break;
    case 'coupons':
      data = parseCoupons(sheetToJSON('coupons'));
      break;
    case 'get_order': {
      const orderId = String(e.parameter.id || '').trim();
      if (!orderId) {
        data = { success: false, error: 'Parameter id diperlukan' };
        break;
      }
      const orderSheet = getSheet('orders');
      if (!orderSheet) {
        data = { success: false, error: 'Sheet orders tidak ditemukan' };
        break;
      }
      const orderData = orderSheet.getDataRange().getValues();
      if (orderData.length < 2) {
        data = { success: false, error: 'Order tidak ditemukan' };
        break;
      }
      const orderHeaders = orderData[0];
      const orderRow = orderData.slice(1).find(row => String(row[0]) === orderId);
      if (!orderRow) {
        data = { success: false, error: 'Order tidak ditemukan' };
        break;
      }
      const order = {};
      // Hanya ambil 16 kolom data (sampai link_maps), skip kolom WA hyperlink
      var safeHeaders = orderHeaders.slice(0, 16);
      safeHeaders.forEach((h, i) => { order[h] = orderRow[i]; });
      // Parse items_json back to array
      try { order.items_json = JSON.parse(order.items_json || '[]'); } catch(ex) { order.items_json = []; }
      data = { success: true, order: order };
      break;
    }
    case 'search_orders': {
      const telp = String(e.parameter.telepon || '').replace(/[^0-9]/g, '');
      if (!telp || telp.length < 8) {
        data = { success: false, error: 'Nomor telepon tidak valid' };
        break;
      }
      const soSheet = getSheet('orders');
      if (!soSheet) {
        data = { success: false, error: 'Sheet orders tidak ditemukan' };
        break;
      }
      const soData = soSheet.getDataRange().getValues();
      if (soData.length < 2) {
        data = { success: true, orders: [] };
        break;
      }
      const soHeaders = soData[0];
      const telpIdx = soHeaders.indexOf('telepon');
      const matched = soData.slice(1)
        .filter(row => {
          const rowTelp = String(row[telpIdx] || '').replace(/[^0-9]/g, '');
          return rowTelp === telp || rowTelp.endsWith(telp) || telp.endsWith(rowTelp);
        })
        .map(row => {
          const obj = {};
          // Hanya ambil 16 kolom data, skip kolom WA hyperlink
          var safeSOHeaders = soHeaders.slice(0, 16);
          safeSOHeaders.forEach((h, i) => { obj[h] = row[i]; });
          try { obj.items_json = JSON.parse(obj.items_json || '[]'); } catch(ex) { obj.items_json = []; }
          return obj;
        })
        .reverse()
        .slice(0, 20);
      data = { success: true, orders: matched };
      break;
    }
    case 'all':
      data = {
        products: parseProducts(sheetToJSON('products')),
        categories: parseCategories(sheetToJSON('categories')),
        stores: parseStores(sheetToJSON('stores')),
        payments: parsePayments(sheetToJSON('payment_methods')),
        sliders: parseSliders(sheetToJSON('sliders')),
        coupons: parseCoupons(sheetToJSON('coupons')),
      };
      break;
    default:
      data = { error: 'Unknown action: ' + action };
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST handler — write order to sheet
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    
    if (body.action === 'order') {
      const d = body.data;
      const sheet = getSheet('orders');
      
      if (!sheet) {
        return jsonResponse({ success: false, error: 'Sheet "orders" not found' });
      }
      
      // Use client-generated orderId if provided, else generate server-side
      const orderId = d.orderId || ('ORD-' + new Date().getTime().toString(36).toUpperCase());
      const tanggal = new Date().toISOString();
      
      sheet.appendRow([
        orderId,
        tanggal,
        d.nama || '',
        d.telepon || '',
        d.alamat || '',
        JSON.stringify(d.items || []),
        Number(d.subtotal) || 0,
        Number(d.ongkir) || 0,
        Number(d.total) || 0,
        d.jadwal || '',
        d.metodeBayar || '',
        'pending',
        d.catatan || '',
        Number(d.diskon) || 0,
        d.kupon || '',
        d.linkMaps || '',
      ]);
      
      // Auto-generate WA hyperlinks di kolom Q-U
      var lastRow = sheet.getLastRow();
      generateWALinksForRow(sheet, lastRow, {
        orderId: orderId,
        nama: d.nama || '',
        telepon: String(d.telepon || ''),
        alamat: d.alamat || '',
        items: d.items || [],
        total: Number(d.total) || 0,
        jadwal: d.jadwal || '',
        metodeBayar: d.metodeBayar || ''
      });
      
      return jsonResponse({ success: true, orderId: orderId });
    }

    if (body.action === 'validate_coupon') {
      const kode = String(body.kode || '').toUpperCase().trim();
      const subtotal = Number(body.subtotal) || 0;
      
      const coupons = parseCoupons(sheetToJSON('coupons'));
      const coupon = coupons.find(c => c.kode === kode);
      
      if (!coupon) {
        return jsonResponse({ success: false, error: 'Kode kupon tidak ditemukan' });
      }
      if (!coupon.aktif) {
        return jsonResponse({ success: false, error: 'Kupon sudah tidak aktif' });
      }
      if (coupon.batas_pakai > 0 && coupon.sudah_dipakai >= coupon.batas_pakai) {
        return jsonResponse({ success: false, error: 'Kupon sudah habis dipakai' });
      }
      if (coupon.berlaku_sampai && new Date() > new Date(coupon.berlaku_sampai)) {
        return jsonResponse({ success: false, error: 'Kupon sudah kadaluarsa' });
      }
      if (coupon.berlaku_dari && new Date() < new Date(coupon.berlaku_dari)) {
        return jsonResponse({ success: false, error: 'Kupon belum berlaku' });
      }
      if (subtotal < coupon.min_order) {
        return jsonResponse({ success: false, error: 'Minimum belanja Rp' + coupon.min_order.toLocaleString('id-ID') });
      }
      
      return jsonResponse({
        success: true,
        coupon: {
          kode: coupon.kode,
          tipe: coupon.tipe,
          nilai: coupon.nilai,
          max_diskon: coupon.max_diskon,
        }
      });
    }
    
    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// WA FOLLOW-UP TEMPLATES
// Admin: klik baris order → menu WA Follow-up
// ============================================

/**
 * Ambil data order dari baris yang dipilih di sheet 'orders'
 */
function getSelectedOrder() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getName() !== 'orders') {
    return { error: 'Buka tab "orders" dulu, lalu pilih baris pesanan.' };
  }
  var row = sheet.getActiveRange().getRow();
  if (row < 2) {
    return { error: 'Pilih baris data pesanan (bukan header).' };
  }
  var data = sheet.getRange(row, 1, 1, 16).getValues()[0];
  // Kolom: id_order(0), tanggal(1), nama(2), telepon(3), alamat(4),
  // items_json(5), subtotal(6), ongkir(7), total(8),
  // jadwal(9), metode_bayar(10), status(11), catatan(12),
  // diskon(13), kupon(14), link_maps(15)
  return {
    row: row,
    orderId: data[0],
    tanggal: data[1],
    nama: data[2],
    telepon: String(data[3]),
    alamat: data[4],
    items: data[5],
    subtotal: data[6],
    ongkir: data[7],
    total: data[8],
    jadwal: data[9],
    metodeBayar: data[10],
    status: data[11],
    catatan: data[12]
  };
}

/**
 * Format nomor telepon ke format WA (62xxx)
 */
function formatWANumber(phone) {
  var clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  if (!clean.startsWith('62')) clean = '62' + clean;
  return clean;
}

/**
 * Buka WA link dan update status order
 */
function openWALink(message, order, newStatus) {
  var ui = SpreadsheetApp.getUi();
  var waNumber = formatWANumber(order.telepon);
  var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message);
  
  // Update status di sheet jika diminta
  if (newStatus) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
    sheet.getRange(order.row, 12).setValue(newStatus); // kolom L = status
  }
  
  // Tampilkan link yang bisa diklik
  var html = '<html><body style="font-family:sans-serif;text-align:center;padding:20px">'
    + '<p>✅ Pesan WA siap dikirim ke <b>' + order.nama + '</b></p>'
    + '<p style="margin:16px 0"><a href="' + waUrl + '" target="_blank" '
    + 'style="background:#25D366;color:white;padding:12px 24px;border-radius:8px;'
    + 'text-decoration:none;font-weight:bold;font-size:16px">'
    + '📱 Buka WhatsApp</a></p>'
    + '<p style="color:#666;font-size:12px">Klik tombol di atas untuk membuka chat WA</p>'
    + '</body></html>';
  
  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(350)
    .setHeight(180);
  ui.showModalDialog(htmlOutput, '📱 WhatsApp Follow-up');
}

/**
 * Format ringkasan items untuk pesan WA
 */
function formatItemsSummary(itemsJson) {
  try {
    var items = JSON.parse(itemsJson);
    return items.map(function(item, i) {
      return (i + 1) + '. ' + item.nama + ' x' + item.qty;
    }).join('\n');
  } catch(e) {
    return '(detail pesanan)';
  }
}

/**
 * Format harga ke Rupiah
 */
function formatRupiah(num) {
  return 'Rp' + Number(num).toLocaleString('id-ID');
}

// === TEMPLATE 1: Konfirmasi Pesanan ===
function waKonfirmasi() {
  var ui = SpreadsheetApp.getUi();
  var order = getSelectedOrder();
  if (order.error) { ui.alert(order.error); return; }
  
  var items = formatItemsSummary(order.items);
  var strukUrl = 'https://pesan-sayur.vercel.app/struk/' + order.orderId;
  var msg = 'Assalamu\'alaikum ' + order.nama + ' 🙏\n\n'
    + 'Terima kasih sudah belanja di *Pesan Sayur*! ✅\n\n'
    + 'Pesanan Anda sudah kami terima:\n'
    + '📋 *ID: ' + order.orderId + '*\n'
    + '━━━━━━━━━━━━━━━━\n'
    + items + '\n'
    + '━━━━━━━━━━━━━━━━\n'
    + '💰 *Total: ' + formatRupiah(order.total) + '*\n'
    + '🚚 Jadwal: ' + order.jadwal + '\n'
    + '💳 Bayar: ' + order.metodeBayar + '\n\n'
    + '⏱️ Pesanan sedang kami siapkan, estimasi 15-30 menit.\n'
    + '📄 Detail pesanan: ' + strukUrl + '\n\n'
    + 'Terima kasih sudah menunggu ya! 🥬';
  
  openWALink(msg, order, 'confirmed');
}

// === TEMPLATE 2: Reminder Pembayaran ===
function waReminderBayar() {
  var ui = SpreadsheetApp.getUi();
  var order = getSelectedOrder();
  if (order.error) { ui.alert(order.error); return; }
  
  // Skip jika metode bayar COD
  if (String(order.metodeBayar).toLowerCase().indexOf('cod') >= 0) {
    ui.alert('✅ Pesanan ini menggunakan COD, tidak perlu reminder pembayaran.');
    return;
  }
  
  // Ambil info rekening dari sheet payment_methods
  var rekeningInfo = getRekeningInfo(order.metodeBayar);
  
  var msg = 'Halo ' + order.nama + ' 👋\n\n'
    + 'Pesanan *' + order.orderId + '* menunggu pembayaran:\n\n'
    + '💰 Total: *' + formatRupiah(order.total) + '*\n'
    + '━━━━━━━━━━━━━━━━\n'
    + rekeningInfo + '\n'
    + '━━━━━━━━━━━━━━━━\n\n'
    + '⏰ Mohon bayar dalam *3 jam* agar pesanan bisa segera kami proses.\n\n'
    + 'Sudah bayar? Kirim bukti transfer ke chat ini ya! ✅';
  
  openWALink(msg, order, null);
}

/**
 * Ambil info rekening dari sheet payment_methods
 */
function getRekeningInfo(metodeBayar) {
  var payments = sheetToJSON('payment_methods');
  var info = '';
  var metode = String(metodeBayar).toLowerCase();
  
  if (metode.indexOf('qris') >= 0) {
    info = '💳 Bayar via *QRIS*\nScan QR Code di halaman struk pesanan Anda.';
  } else {
    // Transfer bank — tampilkan semua rekening aktif
    var banks = payments.filter(function(p) {
      return String(p.tipe).toLowerCase() === 'transfer' && 
             (p.aktif === true || p.aktif === 'TRUE' || p.aktif === 'true');
    });
    if (banks.length > 0) {
      info = '🏦 Transfer ke salah satu rekening:\n';
      banks.forEach(function(b) {
        info += '\n*' + (b.provider || '') + '* — ' + (b.no_rekening || '') + '\n';
        info += 'a.n. *' + (b.atas_nama || '') + '*\n';
      });
    } else {
      info = '💳 Metode: ' + metodeBayar;
    }
  }
  return info;
}

// === TEMPLATE 3: Pesanan Dikirim ===
function waPesananDikirim() {
  var ui = SpreadsheetApp.getUi();
  var order = getSelectedOrder();
  if (order.error) { ui.alert(order.error); return; }
  
  var strukUrl = 'https://pesan-sayur.vercel.app/struk/' + order.orderId;
  var msg = 'Halo ' + order.nama + ' 🎉\n\n'
    + 'Pesanan *' + order.orderId + '* sedang diantar! 🚚\n\n'
    + '📍 Tujuan: ' + order.alamat + '\n'
    + '⏰ Estimasi tiba: *30-60 menit*\n'
    + '📄 Detail: ' + strukUrl + '\n\n'
    + 'Mohon siap di lokasi ya.\n'
    + 'Terima kasih sudah belanja! 🙏';
  
  openWALink(msg, order, 'shipped');
}

// === TEMPLATE 4: Pesanan Selesai ===
function waPesananSelesai() {
  var ui = SpreadsheetApp.getUi();
  var order = getSelectedOrder();
  if (order.error) { ui.alert(order.error); return; }
  
  var msg = 'Halo ' + order.nama + ' 😊\n\n'
    + 'Pesanan *' + order.orderId + '* sudah diterima! ✅\n\n'
    + 'Terima kasih sudah belanja di *Pesan Sayur* 🥬\n'
    + 'Semoga belanjanya bermanfaat!\n\n'
    + '⭐ Puas dengan layanan kami?\n'
    + 'Ceritakan ke teman & keluarga ya!\n\n'
    + '🛒 Belanja lagi: pesan-sayur.vercel.app\n'
    + 'Sampai jumpa di pesanan berikutnya! 🙏';
  
  openWALink(msg, order, 'completed');
}

// === TEMPLATE 5: Pesan Custom ===
function waPesanCustom() {
  var ui = SpreadsheetApp.getUi();
  var order = getSelectedOrder();
  if (order.error) { ui.alert(order.error); return; }
  
  var result = ui.prompt(
    '💬 Pesan Custom ke ' + order.nama,
    'Tulis pesan yang ingin dikirim:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() !== ui.Button.OK) return;
  
  var customMsg = result.getResponseText().trim();
  if (!customMsg) { ui.alert('Pesan tidak boleh kosong.'); return; }
  
  openWALink(customMsg, order, null);
}

// ============================================
// PER-ROW WA HYPERLINK GENERATOR
// Auto-generate clickable WA links di kolom Q-U
// ============================================

/**
 * Generate WA hyperlinks untuk 1 baris order
 * Dipanggil otomatis dari doPost saat order masuk
 */
function generateWALinksForRow(sheet, row, d) {
  var waNum = formatWANumber(d.telepon);
  var baseUrl = 'https://wa.me/' + waNum + '?text=';

  // Items summary — max 5 items agar URL tidak terlalu panjang
  var itemsText = '';
  try {
    var items = (typeof d.items === 'string') ? JSON.parse(d.items) : d.items;
    var maxShow = 5;
    var shown = items.slice(0, maxShow);
    itemsText = shown.map(function(item, i) {
      return (i + 1) + '. ' + item.nama + ' x' + item.qty;
    }).join('\n');
    if (items.length > maxShow) {
      itemsText += '\n...dan ' + (items.length - maxShow) + ' item lainnya';
    }
  } catch(e) { itemsText = '(detail pesanan)'; }

  var totalText = 'Rp' + Number(d.total).toLocaleString('id-ID');
  var strukUrl = 'https://pesan-sayur.vercel.app/struk/' + d.orderId;

  // Template 1: Konfirmasi
  var msgKonfirmasi = "Assalamu'alaikum " + d.nama + " \ud83d\ude4f\n\n"
    + "Terima kasih sudah belanja di *Pesan Sayur*! \u2705\n\n"
    + "Pesanan sudah kami terima:\n"
    + "\ud83d\udccb *ID: " + d.orderId + "*\n"
    + "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"
    + itemsText + "\n"
    + "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"
    + "\ud83d\udcb0 *Total: " + totalText + "*\n"
    + "\ud83d\ude9a Jadwal: " + d.jadwal + "\n"
    + "\ud83d\udcb3 Bayar: " + d.metodeBayar + "\n\n"
    + "Pesanan sedang kami siapkan ya! \ud83e\udd6c\n"
    + "\ud83d\udcc4 Detail: " + strukUrl;

  // Template 2: Reminder (skip jika COD)
  var isCOD = String(d.metodeBayar).toLowerCase().indexOf('cod') >= 0;
  var msgReminder = "Halo " + d.nama + " \ud83d\udc4b\n\n"
    + "Pesanan *" + d.orderId + "* menunggu pembayaran:\n\n"
    + "\ud83d\udcb0 Total: *" + totalText + "*\n"
    + "\ud83d\udcb3 Metode: " + d.metodeBayar + "\n\n"
    + "\u23f0 Mohon bayar dalam *3 jam* agar pesanan bisa segera kami proses.\n\n"
    + "Sudah bayar? Kirim bukti transfer ke chat ini ya! \u2705";

  // Template 3: Dikirim
  var msgDikirim = "Halo " + d.nama + " \ud83c\udf89\n\n"
    + "Pesanan *" + d.orderId + "* sedang diantar! \ud83d\ude9a\n\n"
    + "\ud83d\udccd Tujuan: " + d.alamat + "\n"
    + "\u23f0 Estimasi tiba: *30-60 menit*\n"
    + "\ud83d\udcc4 Detail: " + strukUrl + "\n\n"
    + "Mohon siap di lokasi ya. Terima kasih! \ud83d\ude4f";

  // Template 4: Selesai
  var msgSelesai = "Halo " + d.nama + " \ud83d\ude0a\n\n"
    + "Pesanan *" + d.orderId + "* sudah diterima! \u2705\n\n"
    + "Terima kasih sudah belanja di *Pesan Sayur* \ud83e\udd6c\n"
    + "Semoga belanjanya bermanfaat!\n\n"
    + "\u2b50 Puas dengan layanan kami?\n"
    + "Ceritakan ke teman & keluarga ya!\n\n"
    + "\ud83d\uded2 Belanja lagi: pesan-sayur.vercel.app\n"
    + "Sampai jumpa di pesanan berikutnya! \ud83d\ude4f";

  // Struk kurir link
  var strukUrl = 'https://pesan-sayur.vercel.app/struk/' + d.orderId + '?mode=kurir';

  // Escape double-quotes di URL agar HYPERLINK formula tidak rusak
  function safeFormula(url, label) {
    var cleanUrl = url.replace(/"/g, '%22');
    return '=HYPERLINK("' + cleanUrl + '", "' + label + '")';
  }

  // Kolom Q: Konfirmasi
  sheet.getRange(row, 17).setFormula(
    safeFormula(baseUrl + encodeURIComponent(msgKonfirmasi), '\u2705 Konfirmasi')
  );

  // Kolom R: Reminder (atau "✅ COD" jika bayar COD)
  if (isCOD) {
    sheet.getRange(row, 18).setValue('\u2705 COD');
  } else {
    sheet.getRange(row, 18).setFormula(
      safeFormula(baseUrl + encodeURIComponent(msgReminder), '\ud83d\udcb3 Reminder')
    );
  }

  // Kolom S: Dikirim
  sheet.getRange(row, 19).setFormula(
    safeFormula(baseUrl + encodeURIComponent(msgDikirim), '\ud83d\ude9a Dikirim')
  );

  // Kolom T: Selesai
  sheet.getRange(row, 20).setFormula(
    safeFormula(baseUrl + encodeURIComponent(msgSelesai), '\ud83c\udf89 Selesai')
  );

  // Kolom U: Struk Kurir
  sheet.getRange(row, 21).setFormula(
    safeFormula(strukUrl, '\ud83d\udda8\ufe0f Struk')
  );
}

/**
 * Refresh WA links untuk semua order yang sudah ada
 * Menu: 🔃 Refresh WA Links
 */
function refreshWALinks() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
  if (!sheet) { ui.alert('Sheet "orders" tidak ditemukan.'); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { ui.alert('Belum ada data order.'); return; }

  var confirm = ui.alert(
    '\ud83d\udd03 Refresh WA Links',
    'Regenerate semua WA links di kolom Q-U untuk ' + (lastRow - 1) + ' order?',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  var data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var items = row[5]; // items_json
    try { items = JSON.parse(items); } catch(e) { items = []; }

    generateWALinksForRow(sheet, i + 2, {
      orderId: row[0],
      nama: row[2],
      telepon: String(row[3]),
      alamat: row[4],
      items: items,
      total: Number(row[8]),
      jadwal: row[9],
      metodeBayar: row[10]
    });
  }

  ui.alert('\u2705 WA links berhasil di-refresh untuk ' + data.length + ' order!');
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk kirim notif WA "Pesanan Dikirim" ke semua order confirmed
 */
function bulkKirimNotif() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
  if (!sheet) { ui.alert('Sheet "orders" tidak ditemukan.'); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { ui.alert('Belum ada data order.'); return; }

  var data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  var confirmedOrders = [];

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][11]).toLowerCase() === 'confirmed') {
      confirmedOrders.push({
        row: i + 2,
        orderId: data[i][0],
        nama: data[i][2],
        telepon: String(data[i][3]),
        alamat: data[i][4],
        jadwal: data[i][9]
      });
    }
  }

  if (confirmedOrders.length === 0) {
    ui.alert('Tidak ada pesanan dengan status "confirmed".');
    return;
  }

  var confirm = ui.alert(
    '\ud83d\ude9a Bulk Kirim Notif',
    'Kirim notif "Pesanan Dikirim" ke ' + confirmedOrders.length + ' pelanggan?\n\n'
    + confirmedOrders.map(function(o) { return '• ' + o.nama + ' (' + o.orderId + ')'; }).join('\n'),
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  // Generate semua WA links dalam satu HTML popup
  var links = confirmedOrders.map(function(o) {
    var waNum = formatWANumber(o.telepon);
    var oStrukUrl = 'https://pesan-sayur.vercel.app/struk/' + o.orderId;
    var msg = 'Halo ' + o.nama + ' \ud83c\udf89\n\n'
      + 'Pesanan *' + o.orderId + '* sedang diantar! \ud83d\ude9a\n\n'
      + '\ud83d\udccd Tujuan: ' + o.alamat + '\n'
      + '\u23f0 Estimasi tiba: *30-60 menit*\n'
      + '\ud83d\udcc4 Detail: ' + oStrukUrl + '\n\n'
      + 'Mohon siap di lokasi ya. Terima kasih! \ud83d\ude4f';
    var url = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(msg);

    // Update status ke shipped
    sheet.getRange(o.row, 12).setValue('shipped');

    return '<a href="' + url + '" target="_blank" '
      + 'style="display:block;background:#25D366;color:white;padding:10px 16px;'
      + 'border-radius:8px;text-decoration:none;margin:6px 0;font-weight:bold">'
      + '\ud83d\ude9a ' + o.nama + ' — ' + o.orderId + '</a>';
  });

  var html = '<html><body style="font-family:sans-serif;padding:16px">'
    + '<p style="margin-bottom:12px">Klik setiap tombol untuk buka WA:</p>'
    + links.join('')
    + '<p style="color:#666;font-size:12px;margin-top:16px">\u2705 Status sudah diupdate ke "shipped"</p>'
    + '</body></html>';

  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(Math.min(100 + confirmedOrders.length * 55, 500));
  ui.showModalDialog(htmlOutput, '\ud83d\ude9a Bulk Kirim Notif WA');
}

// ============================================
// DASHBOARD
// ============================================

/**
 * Dashboard Ringkasan Hari Ini
 */
function dashboardHariIni() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
  if (!sheet) { ui.alert('Sheet "orders" tidak ditemukan.'); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { ui.alert('Belum ada data order.'); return; }

  var data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  var today = new Date();
  // Gunakan format lokal WIB (UTC+7) bukan UTC agar tanggal benar
  var todayStr = Utilities.formatDate(today, 'Asia/Jakarta', 'yyyy-MM-dd');

  var stats = { total: 0, revenue: 0, pending: 0, confirmed: 0, shipped: 0, completed: 0 };

  for (var i = 0; i < data.length; i++) {
    var orderDate = '';
    try { orderDate = Utilities.formatDate(new Date(data[i][1]), 'Asia/Jakarta', 'yyyy-MM-dd'); } catch(e) {}
    if (orderDate === todayStr) {
      stats.total++;
      stats.revenue += Number(data[i][8]) || 0;
      var status = String(data[i][11]).toLowerCase();
      if (status === 'pending') stats.pending++;
      else if (status === 'confirmed') stats.confirmed++;
      else if (status === 'shipped') stats.shipped++;
      else if (status === 'completed') stats.completed++;
    }
  }

  // Total all-time
  var allRevenue = 0;
  var allOrders = data.length;
  for (var j = 0; j < data.length; j++) {
    allRevenue += Number(data[j][8]) || 0;
  }

  var avgOrder = stats.total > 0 ? Math.round(stats.revenue / stats.total) : 0;

  var html = '<html><body style="font-family:sans-serif;padding:20px">'
    + '<h2 style="margin:0 0 16px;color:#16a34a">\ud83d\udcc8 Dashboard Hari Ini</h2>'
    + '<p style="color:#666;margin-bottom:16px">' + today.toLocaleDateString('id-ID', {weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</p>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    + '<div style="background:#dcfce7;padding:16px;border-radius:12px;text-align:center">'
    + '<div style="font-size:28px;font-weight:bold;color:#16a34a">' + stats.total + '</div>'
    + '<div style="font-size:12px;color:#666">Order Hari Ini</div></div>'
    + '<div style="background:#dbeafe;padding:16px;border-radius:12px;text-align:center">'
    + '<div style="font-size:28px;font-weight:bold;color:#2563eb">Rp' + stats.revenue.toLocaleString('id-ID') + '</div>'
    + '<div style="font-size:12px;color:#666">Revenue Hari Ini</div></div>'
    + '<div style="background:#fef3c7;padding:16px;border-radius:12px;text-align:center">'
    + '<div style="font-size:28px;font-weight:bold;color:#d97706">' + stats.pending + '</div>'
    + '<div style="font-size:12px;color:#666">Pending</div></div>'
    + '<div style="background:#e0e7ff;padding:16px;border-radius:12px;text-align:center">'
    + '<div style="font-size:28px;font-weight:bold;color:#4f46e5">' + stats.confirmed + '</div>'
    + '<div style="font-size:12px;color:#666">Confirmed</div></div>'
    + '<div style="background:#fce7f3;padding:16px;border-radius:12px;text-align:center">'
    + '<div style="font-size:28px;font-weight:bold;color:#db2777">' + stats.shipped + '</div>'
    + '<div style="font-size:12px;color:#666">Shipped</div></div>'
    + '<div style="background:#d1fae5;padding:16px;border-radius:12px;text-align:center">'
    + '<div style="font-size:28px;font-weight:bold;color:#059669">' + stats.completed + '</div>'
    + '<div style="font-size:12px;color:#666">Completed</div></div>'
    + '</div>'
    + '<div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px">'
    + '<p style="margin:4px 0">\ud83d\udcb0 Rata-rata per order: <b>Rp' + avgOrder.toLocaleString('id-ID') + '</b></p>'
    + '<p style="margin:4px 0">\ud83d\udce6 Total order (all-time): <b>' + allOrders + '</b></p>'
    + '<p style="margin:4px 0">\ud83d\udcb5 Total revenue (all-time): <b>Rp' + allRevenue.toLocaleString('id-ID') + '</b></p>'
    + '</div></body></html>';

  var htmlOutput = HtmlService.createHtmlOutput(html).setWidth(420).setHeight(480);
  ui.showModalDialog(htmlOutput, '\ud83d\udcc8 Dashboard');
}

/**
 * Produk Terlaris — Top 10 produk berdasarkan qty terjual
 */
function produkTerlaris() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
  if (!sheet) { ui.alert('Sheet "orders" tidak ditemukan.'); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { ui.alert('Belum ada data order.'); return; }

  var data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  var productMap = {};

  for (var i = 0; i < data.length; i++) {
    try {
      var items = JSON.parse(data[i][5]);
      for (var j = 0; j < items.length; j++) {
        var nama = items[j].nama;
        var qty = Number(items[j].qty) || 1;
        var harga = Number(items[j].harga) || 0;
        if (!productMap[nama]) productMap[nama] = { qty: 0, revenue: 0 };
        productMap[nama].qty += qty;
        productMap[nama].revenue += (harga + (Number(items[j].tambahan) || 0)) * qty;
      }
    } catch(e) {}
  }

  var sorted = Object.keys(productMap).map(function(nama) {
    return { nama: nama, qty: productMap[nama].qty, revenue: productMap[nama].revenue };
  }).sort(function(a, b) { return b.qty - a.qty; }).slice(0, 10);

  if (sorted.length === 0) {
    ui.alert('Belum ada data produk terjual.');
    return;
  }

  var rows = sorted.map(function(p, i) {
    var medal = i === 0 ? '\ud83e\udd47' : i === 1 ? '\ud83e\udd48' : i === 2 ? '\ud83e\udd49' : (i + 1) + '.';
    return '<tr><td style="padding:8px">' + medal + '</td>'
      + '<td style="padding:8px;font-weight:' + (i < 3 ? 'bold' : 'normal') + '">' + p.nama + '</td>'
      + '<td style="padding:8px;text-align:center">' + p.qty + '</td>'
      + '<td style="padding:8px;text-align:right">Rp' + p.revenue.toLocaleString('id-ID') + '</td></tr>';
  }).join('');

  var html = '<html><body style="font-family:sans-serif;padding:20px">'
    + '<h2 style="margin:0 0 16px;color:#16a34a">\ud83c\udfc6 Produk Terlaris</h2>'
    + '<table style="width:100%;border-collapse:collapse">'
    + '<tr style="background:#f1f5f9"><th style="padding:8px;text-align:left">#</th>'
    + '<th style="padding:8px;text-align:left">Produk</th>'
    + '<th style="padding:8px;text-align:center">Terjual</th>'
    + '<th style="padding:8px;text-align:right">Revenue</th></tr>'
    + rows
    + '</table></body></html>';

  var htmlOutput = HtmlService.createHtmlOutput(html).setWidth(450).setHeight(400);
  ui.showModalDialog(htmlOutput, '\ud83c\udfc6 Produk Terlaris');
}

/**
 * ============================================
 * SETUP — Jalankan 1x dari Apps Script Editor
 * Menu: Run → setupHeaders
 * ============================================
 */
function setupHeaders() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // ===== PRODUCTS HEADERS + DATA =====
  const products = ss.getSheetByName('products');
  if (products && products.getLastRow() < 1) {
    products.appendRow([
      'id', 'kategori_id', 'nama', 'slug', 'deskripsi', 'harga', 'harga_diskon',
      'foto_utama', 'foto_galeri', 'stok', 'satuan', 'aktif', 'unggulan',
      'urutan', 'min_qty', 'variasi_json', 'seo_title', 'seo_desc', 'kategori_nama'
    ]);
    // Demo data
    products.appendRow([
      '1', '1', 'Bayam Hijau Ikat Segar', 'bayam-hijau-ikat-segar',
      'Bayam organik segar yang dipetik langsung dari petani lokal di Bogor setiap pagi. Kaya akan zat besi, vitamin A, dan C.',
      5500, 3500,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDA7euk2FF4kuHMgVPlpE5SnFA808p9_iVh2iEkUCKB3zsqRK8vCPnR9vc9MU-BmuPyEPdp4EJC3i3o5-LIQiByr-DWMggskKwvVYXHijGFHPayHMompl_v1y5VFtstyXje03MJcC7TRKaKH3EYcrhucnzi3S335jT5eBs9vk1QRxJGlk1qbmfRiH8TxrDa5bWsanUvKpoLZS-hTjPZjDxZ4STC81iLLfDtFBjW4TMGNo1fuD8jkgT7PWVTDGdhAx8Tno98q-JW9LM',
      '', 100, 'ikat', true, true, 1, 1,
      '[{"nama":"Ukuran","opsi":[{"label":"500gr","tambahan":0},{"label":"1kg","tambahan":5000}]}]',
      'Bayam Hijau Segar Organik - Pesan Sayur',
      'Beli bayam hijau segar organik langsung dari petani.',
      'Sayuran'
    ]);
    products.appendRow([
      '2', '1', 'Wortel Brastagi 500g', 'wortel-brastagi-500g',
      'Wortel Brastagi pilihan, manis dan renyah. Cocok untuk jus, sup, atau tumisan.',
      15000, 12000,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAX03yclpjzYy9b7ZK8SJEaxTk5uwCo1ieBMcwrpume3bMmy6Lr9PTupnDNQvl9wM-USPhtEJAbtJCpSE_avhROuCovR5M7w4-ld-Q3Z30BXq-2zU7vdXQDSkc1JZMIEzGaOyfHZVWTZ5wu5XS52hKXxTV7SNYZC1HGodzW_rgIVSzDRiM7B_BfUs-RqGMjb0jfzg8kWa6Fd2pX26E7vvh2B73Ro6H6YBQ2F9k3KJEwPmBv26dOAbUI-1jD2yumShgWtKhWYGam-A8',
      '', 80, 'pack', true, true, 2, 1, '', 'Wortel Brastagi Segar 500g - Pesan Sayur',
      'Wortel Brastagi pilihan, manis dan renyah.', 'Sayuran'
    ]);
    products.appendRow([
      '3', '1', 'Tomat Merah Segar 1kg', 'tomat-merah-segar-1kg',
      'Tomat merah segar berkualitas tinggi. Cocok untuk masakan, sambal, atau jus segar.',
      15000, '',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBiZRTsKOS9hrIMA2W9-hztFG-Wt7GMOQOesvXqPMC-tlmP14y8Lmb2ACg7GXh7yiuSR_jyTfgFXQlB_3BgOj43i1qo3lWObmdk75_W6YT_vXOB7BVFy6QriZT7UFuHWcLVpJ_9UNrWVQ6bDdSC0YJ9JKzs5YBJwnnHbBv4MCVWt4ZxIq7R19hlknrwQwm09aPc4m9dX_7vadW3zRwL5k2ejyUD_seeNgnakuA9jo6hHExQ6GTOJdRUdyBLOHkpqIY78rmuyFDxQRE',
      '', 60, 'kg', true, true, 3, 1, '', 'Tomat Merah Segar 1kg - Pesan Sayur',
      'Tomat merah segar berkualitas tinggi, kaya vitamin C.', 'Sayuran'
    ]);
    products.appendRow([
      '4', '3', 'Tempe Daun Premium', 'tempe-daun-premium',
      'Tempe premium dibungkus daun pisang tradisional. Tekstur padat dan rasa gurih khas.',
      5500, 5000,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBeQbBmT83x9oFZN8EIsUuZFDvGE8w5jklGO-0ZBumOcSeJuW1KUfVk7g8TANAlM10taLujfDOr-hJlb2C7TK9R3AbBJpIWbGPI9gLnDikmzbH7daBKI1gJ7aQZNbTEgPI6gLncdBu23PPg6TluhA5UEcOfb7Fd5WAZxd5h4Y32X0sO4QURrGc0_yFZlrr1JFKX_h_u0sjvuNnnBvyCwqOPayPA1KJ_tTnTTIvmNDleW9ni0LGeamIp_Zx-FcRM5I_08uEt9E0X8gA',
      '', 120, 'bungkus', true, true, 4, 1, '', 'Tempe Daun Premium - Pesan Sayur',
      'Tempe premium bungkus daun pisang.', 'Lauk Pauk'
    ]);
    products.appendRow([
      '5', '1', 'Kentang Dieng 1kg', 'kentang-dieng-1kg',
      'Kentang Dieng berkualitas tinggi. Tekstur halus, cocok untuk digoreng, direbus, atau dibuat perkedel.',
      18000, '',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAF6KIxGSTf_6lTLW_-6BpnVmED-o3n_lxAposF0-FMWx9gvyGexWuoqsICikDs9F_F80pSTeWB15ZC__xVVdIk-5PMHgJmT7hc-gfU-mLmTUvnoNZo7QWbm0JeHYVNFfG5D3IlQmvGzLhy0FzqDMUIf9TsLNmVEg8v8UWzwPGosDdO2N6fcWwf2U5e9shzJVo9fsFwRYLw6b9LZ7_hSxR2xl6Jrb8Gpxl8g38Re0-maV4vcQlaTMj1X78_PCzFNhZJ7FDl30O1HsU',
      '', 50, 'kg', true, true, 5, 1, '', 'Kentang Dieng Segar 1kg - Pesan Sayur',
      'Kentang Dieng berkualitas tinggi, tekstur halus.', 'Sayuran'
    ]);
    products.appendRow([
      '6', '4', 'Cabai Merah Keriting 250g', 'cabai-merah-keriting-250g',
      'Cabai merah keriting segar pilihan. Pedas mantap untuk sambal dan masakan sehari-hari.',
      20000, 17000,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbCbYolh3O__CW37-ggBn3_2vLWoFgDuiyB8B9X9r0wCwSF5qa3POikfr0frBw_pkAyNsXDHp_Cq733zzg6MlIVjkX0v9Cw3MvWcYSBt32ze267NDEZopjBZD8FdO2qBGCoM5IgMCq2gDrYQ44tZSr6SY24wFug_nMl0S7ajSxNOfzff_iFu0scZzLrddbqo9zwdUM5OaTzrq0DO_UIojHToq-4gxPRyIAXzrebrWPjSIF5F_a8iW9ekK6RmR57ijgXI2eaLNERBQ',
      '', 70, 'pack', true, true, 6, 1, '', 'Cabai Merah Keriting Segar 250g - Pesan Sayur',
      'Cabai merah keriting segar pilihan, pedas mantap.', 'Bumbu'
    ]);
    products.appendRow([
      '7', '3', 'Dada Ayam Fillet 500g', 'dada-ayam-fillet-500g',
      'Dada ayam fillet tanpa tulang, segar dan berkualitas.',
      32000, '',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB5Nz2a8bOXvAqkS2KfGnPGoXy2EYCXGRCbcefXYpqM3aA0lmuAdFCTlPdTFi4FFjbwP6U4hj6unGveKKJyNQY0Fv6QSK_DDi143UkmIKC1mbCPKDXdi_HE8L0uDDngPSbhLXxu9BRO0kQvg8J3iV3ycy2laaG7iaQaBGyWCRqd62GLXzETlBGga4iBUtU44h5aTqEFdj5jcyAIjM_TBnonMT6WB-X0C7ZkgkMOEEeZQZtgne_jwtqdqEyjrhk8XXUgKhy12Eek2B8',
      '', 40, 'pack', true, true, 7, 1, '', 'Dada Ayam Fillet Segar 500g - Pesan Sayur',
      'Dada ayam fillet segar tanpa tulang.', 'Lauk Pauk'
    ]);
    products.appendRow([
      '8', '1', 'Brokoli Segar per Bonggol', 'brokoli-segar-per-bonggol',
      'Brokoli segar hijau pilihan, kaya akan serat dan vitamin.',
      10000, 9500,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQN543MM8JcT_gEkkMHj91rpslLL-GGPtCwcO12zw7mFZy3YLfTifAzN-HpmksfsgD7OOtPnhMP0XVzYWRrdEA3CHehVJzWEiPTZB7rH2PzNJr2islxRZL1xKT5v8VZpOD7S9vIQ1ny5Z5vC5-9oT_Hl8klcLR8EAIgDlIt0T_G-al3muTCQ-WEu95zBC81PgccA6FouDIdG177PTqGQP5_A3xQWQJP8e63Wf6ZnwHTWxH_eYscJctx9XHlyMQyl7z5xrDvf5343E',
      '', 45, 'bonggol', true, true, 8, 1, '', 'Brokoli Segar per Bonggol - Pesan Sayur',
      'Brokoli segar hijau pilihan, kaya serat dan vitamin.', 'Sayuran'
    ]);
  }
  
  // ===== CATEGORIES HEADERS + DATA =====
  const categories = ss.getSheetByName('categories');
  if (categories && categories.getLastRow() < 1) {
    categories.appendRow(['id', 'nama', 'slug', 'icon_url', 'urutan', 'aktif']);
    categories.appendRow(['1', 'Sayuran Segar', 'sayuran-segar', 'nutrition', 1, true]);
    categories.appendRow(['2', 'Buah-buahan', 'buah-buahan', 'emoji_nature', 2, true]);
    categories.appendRow(['3', 'Lauk Pauk', 'lauk-pauk', 'set_meal', 3, true]);
    categories.appendRow(['4', 'Bumbu Dapur', 'bumbu-dapur', 'soup_kitchen', 4, true]);
    categories.appendRow(['5', 'Minuman', 'minuman', 'local_cafe', 5, true]);
    categories.appendRow(['6', 'Snack', 'snack', 'cookie', 6, true]);
  }
  
  // ===== STORES HEADERS + DATA =====
  const stores = ss.getSheetByName('stores');
  if (stores && stores.getLastRow() < 1) {
    stores.appendRow([
      'id', 'nama', 'alamat', 'lat', 'lng', 'telepon', 'whatsapp',
      'jam_buka', 'tarif_per_km', 'min_order', 'max_jarak_km',
      'gratis_ongkir_diatas', 'logo_url', 'banner_url', 'aktif'
    ]);
    stores.appendRow([
      '1', 'Pesan Sayur Pusat', 'Jl. Pasar Baru No. 1, Jakarta',
      -6.17, 106.83, '081219199323', '6281219199323',
      '06:00 - 20:00', 3000, 25000, 10, 100000, '', '', true
    ]);
  }
  
  // ===== PAYMENT METHODS HEADERS + DATA =====
  const payments = ss.getSheetByName('payment_methods');
  if (payments && payments.getLastRow() < 1) {
    payments.appendRow(['tipe', 'provider', 'no_rekening', 'atas_nama', 'logo_url', 'instruksi', 'qris_url', 'aktif']);
    payments.appendRow(['transfer', 'BSI', '1234567890', 'Pesan Sayur', '', 'Transfer ke BSI', '', true]);
    payments.appendRow(['transfer', 'Mandiri', '1234567890', 'Pesan Sayur', '', 'Transfer ke Mandiri', '', true]);
    payments.appendRow(['transfer', 'JAGO', '1234567890', 'Pesan Sayur', '', 'Transfer ke JAGO', '', true]);
    payments.appendRow(['qris', 'QRIS', '', 'Pesan Sayur', '', 'Scan QR Code untuk bayar', '', true]);
    payments.appendRow(['cod', 'COD', '', '', '', 'Bayar tunai saat pesanan tiba', '', true]);
  }
  
  // ===== ORDERS HEADERS =====
  const orders = ss.getSheetByName('orders');
  if (orders && orders.getLastRow() < 1) {
    orders.appendRow([
      'id_order', 'tanggal', 'nama', 'telepon', 'alamat',
      'items_json', 'subtotal', 'ongkir', 'total',
      'jadwal', 'metode_bayar', 'status', 'catatan',
      'diskon', 'kupon', 'link_maps',
      '📱 Konfirmasi', '📱 Reminder', '📱 Dikirim', '📱 Selesai', '🖨️ Struk'
    ]);
  }
  
  // ===== SLIDERS HEADERS + DATA =====
  let sliders = ss.getSheetByName('sliders');
  if (!sliders) {
    sliders = ss.insertSheet('sliders');
  }
  if (sliders.getLastRow() < 1) {
    sliders.appendRow(['id', 'gambar_url', 'judul', 'deskripsi', 'tipe_link', 'link_tujuan', 'urutan', 'aktif']);
    sliders.appendRow([
      '1',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA2WxZz_fwmZTgqB3sA-ZAfoxdMarzWeLh1xAOzx1bVQ5gL81GyZnVSrU2MzmY6_HOnK0OxBUbKpwPbfRdAAoDLZignyD65JZ-ZdaykzSnGtiOdl0Iio65_UGOG7AUOAoDEUy7FZrmI6cQgtGSVWaohgvEVHv-z__vb_Q6V4a9XUK-RrUgcfgUfDAT1RielLExIHFdlZbHFTZzwVYLfCQESzQnQS11WTgbDmUh9al2EE2HIjmvLzI9OmXL7Ekdoy69VVelvRxNML2g',
      'Belanja Segar Setiap Hari',
      'Gratis ongkir untuk pembelian minimal Rp100rb',
      'kategori', '/kategori/sayuran-segar', 1, true
    ]);
    sliders.appendRow([
      '2',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBeQbBmT83x9oFZN8EIsUuZFDvGE8w5jklGO-0ZBumOcSeJuW1KUfVk7g8TANAlM10taLujfDOr-hJlb2C7TK9R3AbBJpIWbGPI9gLnDikmzbH7daBKI1gJ7aQZNbTEgPI6gLncdBu23PPg6TluhA5UEcOfb7Fd5WAZxd5h4Y32X0sO4QURrGc0_yFZlrr1JFKX_h_u0sjvuNnnBvyCwqOPayPA1KJ_tTnTTIvmNDleW9ni0LGeamIp_Zx-FcRM5I_08uEt9E0X8gA',
      'Promo Lauk Pauk',
      'Tempe & tahu segar harga spesial minggu ini!',
      'kategori', '/kategori/lauk-pauk', 2, true
    ]);
    sliders.appendRow([
      '3',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbCbYolh3O__CW37-ggBn3_2vLWoFgDuiyB8B9X9r0wCwSF5qa3POikfr0frBw_pkAyNsXDHp_Cq733zzg6MlIVjkX0v9Cw3MvWcYSBt32ze267NDEZopjBZD8FdO2qBGCoM5IgMCq2gDrYQ44tZSr6SY24wFug_nMl0S7ajSxNOfzff_iFu0scZzLrddbqo9zwdUM5OaTzrq0DO_UIojHToq-4gxPRyIAXzrebrWPjSIF5F_a8iW9ekK6RmR57ijgXI2eaLNERBQ',
      'Bumbu Segar Pilihan',
      'Cabai, bawang, lengkap! Bikin masakan makin sedap',
      'kategori', '/kategori/bumbu-dapur', 3, true
    ]);
  }
  
  // ===== COUPONS HEADERS + DATA =====
  let coupons = ss.getSheetByName('coupons');
  if (!coupons) {
    coupons = ss.insertSheet('coupons');
  }
  if (coupons.getLastRow() < 1) {
    coupons.appendRow(['kode', 'tipe', 'nilai', 'min_order', 'max_diskon', 'batas_pakai', 'sudah_dipakai', 'berlaku_dari', 'berlaku_sampai', 'aktif']);
    coupons.appendRow(['HEMAT10', 'persen', 10, 50000, 15000, 100, 0, '2026-01-01', '2026-12-31', true]);
    coupons.appendRow(['DISKON5K', 'nominal', 5000, 30000, 0, 50, 0, '2026-01-01', '2026-12-31', true]);
    coupons.appendRow(['FREEONGKIR', 'gratis_ongkir', 0, 75000, 0, 200, 0, '2026-01-01', '2026-12-31', true]);
  }
  
  Logger.log('✅ Setup selesai! Semua sheet sudah terisi headers dan data demo.');
}
