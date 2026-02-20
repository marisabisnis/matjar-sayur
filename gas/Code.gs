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

function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
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
      orderHeaders.forEach((h, i) => { order[h] = orderRow[i]; });
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
          soHeaders.forEach((h, i) => { obj[h] = row[i]; });
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
      -6.17, 106.83, '081234567890', '6281234567890',
      '06:00 - 20:00', 3000, 25000, 10, 100000, '', '', true
    ]);
  }
  
  // ===== PAYMENT METHODS HEADERS + DATA =====
  const payments = ss.getSheetByName('payment_methods');
  if (payments && payments.getLastRow() < 1) {
    payments.appendRow(['tipe', 'provider', 'no_rekening', 'atas_nama', 'logo_url', 'instruksi', 'aktif']);
    payments.appendRow(['transfer', 'BCA', '1234567890', 'Pesan Sayur', '', 'Transfer ke BCA 1234567890 a.n. Pesan Sayur', true]);
    payments.appendRow(['qris', 'QRIS', '', 'Pesan Sayur', '', 'Scan QR Code yang dikirim via WhatsApp', true]);
    payments.appendRow(['cod', 'COD', '', '', '', 'Bayar tunai saat pesanan tiba', true]);
  }
  
  // ===== ORDERS HEADERS =====
  const orders = ss.getSheetByName('orders');
  if (orders && orders.getLastRow() < 1) {
    orders.appendRow([
      'id_order', 'tanggal', 'nama', 'telepon', 'alamat',
      'items_json', 'subtotal', 'ongkir', 'total',
      'jadwal', 'metode_bayar', 'status', 'catatan',
      'diskon', 'kupon', 'link_maps'
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
