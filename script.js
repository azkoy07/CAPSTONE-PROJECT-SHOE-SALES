/**
 * script.js — Shoe Sales
 * Logika aplikasi: state, helpers, produk, keranjang, checkout, pesanan, render, events.
 */

'use strict';

/* ============================================================
   BAGIAN 1 — SEED DATA & KONSTANTA
   ============================================================ */

const CATEGORIES = ['Semua', 'Sneakers', 'Running', 'Formal', 'Casual', 'Sandal'];

const PRODUCT_COLORS = [
  { bg: '#dbeafe', emoji: '👟' },
  { bg: '#fee2e2', emoji: '👠' },
  { bg: '#dcfce7', emoji: '🥾' },
  { bg: '#fef9c3', emoji: '👡' },
  { bg: '#ede9fe', emoji: '👞' },
  { bg: '#ffedd5', emoji: '🥿' },
  { bg: '#cffafe', emoji: '👟' },
  { bg: '#fce7f3', emoji: '👢' },
  { bg: '#f0fdf4', emoji: '👟' },
  { bg: '#fef3c7', emoji: '👞' },
];

const SEED_PRODUCTS = [
  { id: 'p1', name: 'Air Max 90 Classic',   brand: 'Nike',        category: 'Sneakers', price: 1450000, stock: 15, description: 'Sepatu sneakers ikonik dengan bantalan udara Max Air. Cocok untuk aktivitas kasual sehari-hari.',           colorIndex: 0, createdAt: Date.now() - 8000000 },
  { id: 'p2', name: 'UltraBoost 22',         brand: 'Adidas',      category: 'Running',  price: 1890000, stock: 8,  description: 'Teknologi Boost untuk energi balik maksimal. Ideal untuk pelari jarak menengah hingga jauh.',              colorIndex: 1, createdAt: Date.now() - 7000000 },
  { id: 'p3', name: 'Oxford Brogue Premier', brand: 'Clarks',      category: 'Formal',   price: 980000,  stock: 3,  description: 'Sepatu formal dengan detail brogue elegan berbahan kulit sintetis premium. Sempurna untuk acara resmi.',   colorIndex: 2, createdAt: Date.now() - 6000000 },
  { id: 'p4', name: 'Classic Canvas Low',    brand: 'Converse',    category: 'Casual',   price: 620000,  stock: 20, description: 'Sepatu kanvas klasik yang ringan dan serbaguna untuk menemani aktivitas santai Anda.',                    colorIndex: 3, createdAt: Date.now() - 5000000 },
  { id: 'p5', name: 'Gel-Nimbus 25',         brand: 'ASICS',       category: 'Running',  price: 2100000, stock: 0,  description: 'Sepatu lari premium dengan teknologi GEL untuk peredaman benturan optimal. Pilihan utama maraton.',        colorIndex: 4, createdAt: Date.now() - 4000000 },
  { id: 'p6', name: 'Mayari Slide',          brand: 'Birkenstock', category: 'Sandal',   price: 750000,  stock: 12, description: 'Sandal dua tali dengan footbed kork anatomis yang menyesuaikan telapak kaki. Nyaman seharian.',           colorIndex: 5, createdAt: Date.now() - 3000000 },
  { id: 'p7', name: 'Chuck 70 High Top',     brand: 'Converse',    category: 'Casual',   price: 880000,  stock: 2,  description: 'Varian high-top ikonik dengan kanvas tebal dan sol lebih tebal. Detail vintage yang timeless.',           colorIndex: 6, createdAt: Date.now() - 2000000 },
  { id: 'p8', name: 'Pegasus 40',            brand: 'Nike',        category: 'Running',  price: 1650000, stock: 18, description: 'Sepatu lari serbaguna dengan bantalan React responsif. Cocok untuk training harian dan tempo run.',       colorIndex: 7, createdAt: Date.now() - 1000000 },
];

const SHIPPING_FREE_THRESHOLD = 1_000_000;
const SHIPPING_COST = 20_000;

/* ============================================================
   BAGIAN 2 — STATE APLIKASI
   ============================================================ */

function loadState() {
  let products = readLS('ss_products');
  if (!products || !Array.isArray(products) || products.length === 0) {
    products = SEED_PRODUCTS;
    writeLS('ss_products', products);
  }
  const cart   = readLS('ss_cart')   || [];
  const orders = readLS('ss_orders') || [];
  return { products, cart, orders };
}

let state = loadState();

// UI state — tidak di-persist
let uiState = {
  view: 'storefront',       // 'storefront' | 'my-orders' | 'admin'
  searchQuery: '',
  activeCategory: 'Semua',
  sortBy: 'newest',
  cartOpen: false,
  orderFilter: 'Semua',     // filter admin
  myOrderFilter: 'Semua',   // filter halaman pembeli
  adminTab: 'products',     // 'products' | 'orders'
};

/* ============================================================
   BAGIAN 3 — HELPERS & UTILITAS
   ============================================================ */

function readLS(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function writeLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error('localStorage error', e); }
}

function formatRp(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID');
}
function genId(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9).toUpperCase();
}
function escHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str ?? '')));
  return d.innerHTML;
}
function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type = 'success', duration = 3000) {
  const icons = {
    success: `<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>`,
    error:   `<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    info:    `<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
    warning: `<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', 'alert');
  el.innerHTML = `${icons[type] || ''}<span>${escHtml(message)}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, duration);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('flex');
  setTimeout(() => el.querySelector('button, [tabindex="0"], input, select, textarea')?.focus(), 50);
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('flex');
}

function stockInfo(stock) {
  if (stock <= 0) return { label: 'Habis',        cls: 'badge-out' };
  if (stock <= 5) return { label: 'Stok menipis', cls: 'badge-low' };
  return              { label: 'Tersedia',        cls: 'badge-available' };
}

/**
 * Render gambar produk: foto asli (base64) jika ada, fallback ke emoji placeholder.
 * @param {object} product  objek produk lengkap
 * @param {'card'|'modal'}  size
 */
function productImage(product, size = 'card') {
  const c   = PRODUCT_COLORS[(product.colorIndex || 0) % PRODUCT_COLORS.length];
  const cls = size === 'card' ? 'product-img-wrap' : 'product-img-wrap-modal';
  if (product.image) {
    return `<div class="${cls}" style="background:${c.bg};padding:0;overflow:hidden;" role="img" aria-label="Gambar ${escHtml(product.name)}">
              <img src="${product.image}" alt="${escHtml(product.name)}" class="w-full h-full object-cover" loading="lazy" />
            </div>`;
  }
  return `<div class="${cls}" style="background:${c.bg};" role="img" aria-label="Gambar ${escHtml(product.name)}">${c.emoji}</div>`;
}

/** Warna & label status pesanan */
function orderStatusBadge(status) {
  if (status === 'Selesai')  return { cls: 'bg-green-100 text-green-700',  label: '✅ Selesai' };
  if (status === 'Dikirim')  return { cls: 'bg-blue-100 text-blue-700',    label: '🚚 Dikirim' };
  return                            { cls: 'bg-orange-100 text-orange-700', label: '⏳ Diproses' };
}

/* ============================================================
   BAGIAN 4 — OPERASI PRODUK
   ============================================================ */

function getFilteredProducts() {
  let list = [...state.products];
  if (uiState.activeCategory !== 'Semua')
    list = list.filter(p => p.category === uiState.activeCategory);
  if (uiState.searchQuery) {
    const q = uiState.searchQuery.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }
  switch (uiState.sortBy) {
    case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'name-az':    list.sort((a, b) => a.name.localeCompare(b.name)); break;
    default:           list.sort((a, b) => b.createdAt - a.createdAt);
  }
  return list;
}
function saveProducts() { writeLS('ss_products', state.products); }

function addProduct(data) {
  const p = { id: genId('p'), name: data.name.trim(), brand: data.brand.trim(), category: data.category,
    price: Number(data.price), stock: Number(data.stock), description: data.description.trim(),
    image: data.image || null,   // base64 data URL atau null
    colorIndex: Math.floor(Math.random() * PRODUCT_COLORS.length), createdAt: Date.now() };
  state.products.unshift(p); saveProducts(); return p;
}
function updateProduct(id, data) {
  const i = state.products.findIndex(p => p.id === id); if (i === -1) return;
  state.products[i] = { ...state.products[i], name: data.name.trim(), brand: data.brand.trim(),
    category: data.category, price: Number(data.price), stock: Number(data.stock),
    description: data.description.trim(),
    // Hanya update gambar jika ada yang baru di-upload
    ...(data.image ? { image: data.image } : {}) };
  saveProducts();
}
function deleteProduct(id) { state.products = state.products.filter(p => p.id !== id); saveProducts(); }

/* ============================================================
   BAGIAN 5 — OPERASI KERANJANG
   ============================================================ */

function saveCart() { writeLS('ss_cart', state.cart); }

function addToCart(productId, size, qty = 1) {
  const product = state.products.find(p => p.id === productId);
  if (!product || product.stock <= 0) return false;
  const key = `${productId}__${size}`;
  const existing = state.cart.find(c => c.key === key);
  if (existing) {
    const nq = existing.qty + qty;
    if (nq > product.stock) { showToast(`Stok tidak cukup. Tersedia: ${product.stock}`, 'warning'); return false; }
    existing.qty = nq;
  } else {
    if (qty > product.stock) { showToast(`Stok tidak cukup. Tersedia: ${product.stock}`, 'warning'); return false; }
    state.cart.push({ key, productId, size, qty, name: product.name, brand: product.brand, price: product.price, colorIndex: product.colorIndex });
  }
  saveCart(); renderCartBadge(); return true;
}
function updateCartQty(key, delta) {
  const item = state.cart.find(c => c.key === key); if (!item) return;
  const product = state.products.find(p => p.id === item.productId);
  const max = product ? product.stock : item.qty;
  const nq = item.qty + delta;
  if (nq < 1) return removeCartItem(key);
  if (nq > max) { showToast(`Stok tersedia hanya ${max}`, 'warning'); return; }
  item.qty = nq; saveCart(); renderCart();
}
function removeCartItem(key) {
  state.cart = state.cart.filter(c => c.key !== key);
  saveCart(); renderCart(); renderCartBadge(); showToast('Item dihapus dari keranjang', 'info');
}
function cartTotals() {
  const subtotal = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  return { subtotal, shipping, total: subtotal + shipping };
}
function cartItemCount() { return state.cart.reduce((s, c) => s + c.qty, 0); }

/* ============================================================
   BAGIAN 6 — OPERASI PESANAN
   ============================================================ */

function saveOrders() { writeLS('ss_orders', state.orders); }

/**
 * @param {object} formData
 * @param {Array|null} overrideItems  null = pakai state.cart (mode keranjang)
 */
function createOrder(formData, overrideItems = null) {
  const items    = overrideItems ? overrideItems : state.cart.map(c => ({ ...c }));
  const subtotal = items.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total    = subtotal + shipping;
  const order = {
    id: genId('o'), orderNo: 'SS-' + genId(),
    buyerName: formData.buyerName, phone: formData.phone,
    address: formData.address, shippingMethod: formData.shippingMethod,
    paymentMethod: formData.paymentMethod,
    items, subtotal, shipping, total, status: 'Diproses', createdAt: Date.now(),
  };
  // Kurangi stok
  order.items.forEach(item => {
    const p = state.products.find(x => x.id === item.productId);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });
  saveProducts(); state.orders.unshift(order); saveOrders();
  // Kosongkan keranjang hanya jika bukan "Beli Sekarang"
  if (!overrideItems) { state.cart = []; saveCart(); renderCartBadge(); }
  return order;
}
function updateOrderStatus(id, status) {
  const o = state.orders.find(x => x.id === id); if (o) { o.status = status; saveOrders(); }
}
function updateOrderBuyer(id, data) {
  const o = state.orders.find(x => x.id === id);
  if (!o) return;
  o.buyerName = data.buyerName.trim(); o.phone = data.phone.trim();
  o.address = data.address.trim(); o.paymentMethod = data.paymentMethod; saveOrders();
}
function deleteOrder(id) { state.orders = state.orders.filter(o => o.id !== id); saveOrders(); }

/* ============================================================
   BAGIAN 7 — RENDER STOREFRONT
   ============================================================ */

function renderCategoryFilters() {
  document.getElementById('category-filters').innerHTML = CATEGORIES.map(cat => `
    <button type="button" class="cat-btn${cat === uiState.activeCategory ? ' active' : ''}"
            data-category="${escHtml(cat)}" aria-pressed="${cat === uiState.activeCategory}">
      ${escHtml(cat)}
    </button>`).join('');
}

function renderProductGrid() {
  const grid  = document.getElementById('product-grid');
  const count = document.getElementById('results-count');
  const list  = getFilteredProducts();
  count.textContent = `${list.length} produk ditemukan`;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center py-20 text-gray-400">
        <div class="text-6xl mb-4">🔍</div>
        <p class="text-lg font-semibold text-gray-500">Produk tidak ditemukan</p>
        <p class="text-sm mt-1">Coba kata kunci atau filter yang berbeda.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const si   = stockInfo(p.stock);
    const sold = p.stock <= 0;
    const c    = PRODUCT_COLORS[p.colorIndex % PRODUCT_COLORS.length];
    return `
      <article class="product-card flex flex-col" data-product-id="${p.id}" tabindex="0"
               role="button" aria-label="Lihat detail ${escHtml(p.name)}">
        <!-- Gambar -->
        ${productImage(p, 'card')}

        <!-- Info -->
        <div class="p-3 flex flex-col flex-1 gap-1.5">
          <div class="flex items-start justify-between gap-1">
            <div class="min-w-0">
              <p class="text-[11px] text-gray-400 font-medium">${escHtml(p.brand)}</p>
              <h3 class="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">${escHtml(p.name)}</h3>
            </div>
            <span class="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${si.cls}">${si.label}</span>
          </div>
          <p class="text-[11px] text-gray-400">${escHtml(p.category)}</p>
          <p class="text-base font-bold text-blue-700">${formatRp(p.price)}</p>

          <!-- Aksi — 2 tombol jika tersedia, 1 disabled jika habis -->
          ${sold
            ? `<button type="button" class="mt-1 w-full py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed" disabled aria-disabled="true">Stok Habis</button>`
            : `<div class="mt-1 flex gap-1.5">
                <button type="button"
                        class="flex-1 py-2 text-xs font-semibold rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        data-add-cart="${p.id}" aria-label="Tambah ${escHtml(p.name)} ke keranjang">
                  🛒 Keranjang
                </button>
                <button type="button"
                        class="flex-1 py-2 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                        data-buy-now="${p.id}" aria-label="Beli sekarang ${escHtml(p.name)}">
                  Beli
                </button>
              </div>`}
        </div>
      </article>`;
  }).join('');
}

function renderCartBadge() {
  const badge = document.getElementById('cart-badge');
  const n = cartItemCount();
  badge.textContent = n > 99 ? '99+' : n;
  badge.classList.toggle('hidden', n === 0);
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const footer    = document.getElementById('cart-footer');

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full py-16 text-gray-400">
        <div class="text-5xl mb-4">🛒</div>
        <p class="font-semibold text-gray-500">Keranjang kosong</p>
        <p class="text-sm mt-1 text-center">Tambahkan produk dari katalog atau gunakan tombol <strong>Beli</strong> di card produk.</p>
      </div>`;
    footer.innerHTML = '';
    return;
  }

  container.innerHTML = state.cart.map(item => {
    const c = PRODUCT_COLORS[item.colorIndex % PRODUCT_COLORS.length];
    return `
    <div class="flex gap-3 items-start" data-cart-key="${escHtml(item.key)}">
      <div class="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-2xl"
           style="background:${c.bg}" aria-hidden="true">${c.emoji}</div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-800 leading-snug truncate">${escHtml(item.name)}</p>
        <p class="text-xs text-gray-400">${escHtml(item.brand)} · EU ${escHtml(String(item.size))}</p>
        <p class="text-sm font-bold text-blue-700 mt-0.5">${formatRp(item.price)}</p>
        <div class="flex items-center gap-2 mt-1.5">
          <button type="button" class="qty-btn" data-qty-key="${escHtml(item.key)}" data-delta="-1" aria-label="Kurangi jumlah">−</button>
          <span class="text-sm font-medium w-5 text-center">${item.qty}</span>
          <button type="button" class="qty-btn" data-qty-key="${escHtml(item.key)}" data-delta="1" aria-label="Tambah jumlah">+</button>
        </div>
      </div>
      <div class="flex flex-col items-end gap-1 shrink-0">
        <p class="text-sm font-semibold text-gray-700">${formatRp(item.price * item.qty)}</p>
        <button type="button" class="text-gray-300 hover:text-red-500 transition p-1"
                data-remove-cart="${escHtml(item.key)}" aria-label="Hapus ${escHtml(item.name)}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>`;
  }).join('');

  const { subtotal, shipping, total } = cartTotals();
  footer.innerHTML = `
    <div class="space-y-1 text-sm text-gray-600 mb-3">
      <div class="flex justify-between"><span>Subtotal</span><span>${formatRp(subtotal)}</span></div>
      <div class="flex justify-between">
        <span>Ongkos Kirim</span>
        <span class="${shipping === 0 ? 'text-green-600 font-semibold' : ''}">${shipping === 0 ? 'GRATIS' : formatRp(shipping)}</span>
      </div>
      ${shipping === 0 && subtotal > 0 ? `<p class="text-xs text-green-600">🎉 Gratis ongkir untuk belanja ≥ Rp1.000.000</p>` : ''}
    </div>
    <div class="flex justify-between font-bold text-gray-800 border-t pt-3 mb-4">
      <span>Total</span><span class="text-blue-700">${formatRp(total)}</span>
    </div>
    <button type="button" id="checkout-btn"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
      Checkout →
    </button>`;
}

/* ============================================================
   BAGIAN 8 — HALAMAN PESANAN SAYA (PEMBELI)
   ============================================================ */

function renderMyOrders() {
  // Filter
  const filters = ['Semua', 'Diproses', 'Selesai'];
  document.getElementById('my-order-filters').innerHTML = filters.map(f => `
    <button type="button" class="cat-btn whitespace-nowrap${f === uiState.myOrderFilter ? ' active' : ''}"
            data-my-order-filter="${f}" aria-pressed="${f === uiState.myOrderFilter}">
      ${f}
    </button>`).join('');

  let list = [...state.orders].sort((a, b) => b.createdAt - a.createdAt);
  if (uiState.myOrderFilter !== 'Semua')
    list = list.filter(o => o.status === uiState.myOrderFilter);

  const container = document.getElementById('my-order-list');

  if (list.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center py-20 text-gray-400">
        <div class="text-6xl mb-4">📋</div>
        <p class="text-lg font-semibold text-gray-500">Belum ada pesanan</p>
        <p class="text-sm mt-1 mb-5">Yuk belanja sekarang dan temukan sepatu favoritmu!</p>
        <button type="button" id="go-shop-btn"
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          Belanja Sekarang
        </button>
      </div>`;
    // listener tombol "Belanja Sekarang" di empty state
    document.getElementById('go-shop-btn')?.addEventListener('click', () => switchView('storefront'));
    return;
  }

  container.innerHTML = list.map(o => {
    const sb = orderStatusBadge(o.status);
    return `
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <!-- Header pesanan -->
      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div>
          <p class="text-xs font-mono font-bold text-blue-600">${escHtml(o.orderNo)}</p>
          <p class="text-[11px] text-gray-400 mt-0.5">${formatDate(o.createdAt)}</p>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full font-semibold ${sb.cls}">${sb.label}</span>
      </div>

      <!-- Daftar item -->
      <div class="px-4 py-3 space-y-2">
        ${o.items.map(item => {
          const c = PRODUCT_COLORS[item.colorIndex % PRODUCT_COLORS.length];
          return `
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-xl"
                 style="background:${c.bg}" aria-hidden="true">${c.emoji}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">${escHtml(item.name)}</p>
              <p class="text-xs text-gray-400">${escHtml(item.brand)} · EU ${item.size} · × ${item.qty}</p>
            </div>
            <p class="text-sm font-bold text-blue-700 shrink-0">${formatRp(item.price * item.qty)}</p>
          </div>`;
        }).join('')}
      </div>

      <!-- Footer pesanan -->
      <div class="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
        <div class="text-xs text-gray-500 space-y-0.5">
          <p>📦 ${escHtml(o.shippingMethod)} &nbsp;·&nbsp; 💳 ${escHtml(o.paymentMethod)}</p>
          <p>📍 ${escHtml(o.address)}</p>
        </div>
        <div class="text-right">
          ${o.shipping === 0 ? `<p class="text-xs text-green-600 font-medium">Gratis Ongkir</p>` : `<p class="text-xs text-gray-400">Ongkir: ${formatRp(o.shipping)}</p>`}
          <p class="text-base font-bold text-gray-800">Total: ${formatRp(o.total)}</p>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ============================================================
   BAGIAN 9 — MODAL DETAIL PRODUK
   ============================================================ */

function openProductModal(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;

  const si    = stockInfo(p.stock);
  const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
  const c     = PRODUCT_COLORS[p.colorIndex % PRODUCT_COLORS.length];

  document.getElementById('modal-product-name').textContent = p.name;
  document.getElementById('modal-product-body').innerHTML = `
    ${productImage(p, 'modal')}
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <span class="text-sm font-medium text-gray-500">${escHtml(p.brand)}</span>
      <span class="text-xs text-gray-400">·</span>
      <span class="text-xs text-gray-400">${escHtml(p.category)}</span>
      <span class="text-xs px-2 py-0.5 rounded-full font-medium ${si.cls}">${si.label}</span>
    </div>
    <p class="text-2xl font-bold text-blue-700 mb-3">${formatRp(p.price)}</p>
    <p class="text-sm text-gray-500 mb-5 leading-relaxed">${escHtml(p.description || 'Tidak ada deskripsi.')}</p>
    ${p.stock > 0 ? `
    <div class="mb-4">
      <p class="text-sm font-semibold text-gray-700 mb-2">Pilih Ukuran (EU) <span class="text-red-500">*</span></p>
      <div class="flex flex-wrap gap-2" id="modal-sizes" role="group" aria-label="Pilih ukuran">
        ${sizes.map(s => `<button type="button" class="size-btn" data-size="${s}" aria-pressed="false" aria-label="Ukuran EU ${s}">${s}</button>`).join('')}
      </div>
      <p id="modal-size-err" class="text-xs text-red-500 mt-1.5 hidden">⚠ Pilih ukuran terlebih dahulu.</p>
    </div>
    <div class="flex items-center gap-3 mb-5">
      <p class="text-sm font-semibold text-gray-700">Jumlah:</p>
      <button type="button" class="qty-btn" id="modal-qty-dec" aria-label="Kurangi jumlah">−</button>
      <span id="modal-qty-val" class="text-sm font-semibold w-6 text-center">1</span>
      <button type="button" class="qty-btn" id="modal-qty-inc" aria-label="Tambah jumlah">+</button>
      <span class="text-xs text-gray-400 ml-1">Stok: ${p.stock}</span>
    </div>
    <div class="flex gap-3">
      <button type="button" id="modal-add-cart-btn"
              class="flex-1 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        🛒 Keranjang
      </button>
      <button type="button" id="modal-buy-now-btn"
              class="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
        Beli Sekarang
      </button>
    </div>
    ` : `<div class="text-center py-6 bg-gray-50 rounded-xl"><p class="text-gray-400 font-medium">Produk ini sedang tidak tersedia.</p></div>`}
  `;

  let selectedSize = null;
  let qty = 1;

  const sizeErr   = document.getElementById('modal-size-err');
  const qtyVal    = document.getElementById('modal-qty-val');
  const qtyDec    = document.getElementById('modal-qty-dec');
  const qtyInc    = document.getElementById('modal-qty-inc');
  const addBtn    = document.getElementById('modal-add-cart-btn');
  const buyBtn    = document.getElementById('modal-buy-now-btn');
  const sizesWrap = document.getElementById('modal-sizes');

  if (!addBtn) { openModal('product-modal-overlay'); return; }

  function requireSize() {
    if (selectedSize) return true;
    sizeErr.classList.remove('hidden');
    sizesWrap.querySelector('.size-btn')?.focus();
    return false;
  }

  sizesWrap.addEventListener('click', e => {
    const btn = e.target.closest('.size-btn');
    if (!btn) return;
    sizesWrap.querySelectorAll('.size-btn').forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('selected'); btn.setAttribute('aria-pressed', 'true');
    selectedSize = Number(btn.dataset.size);
    sizeErr.classList.add('hidden');
  });

  const updateQty = () => {
    if (qtyVal) qtyVal.textContent = qty;
    if (qtyDec) qtyDec.disabled = qty <= 1;
    if (qtyInc) qtyInc.disabled = qty >= p.stock;
  };
  qtyDec?.addEventListener('click', () => { if (qty > 1) { qty--; updateQty(); } });
  qtyInc?.addEventListener('click', () => { if (qty < p.stock) { qty++; updateQty(); } });
  updateQty();

  addBtn.addEventListener('click', () => {
    if (!requireSize()) return;
    if (addToCart(p.id, selectedSize, qty)) {
      closeModal('product-modal-overlay');
      showToast(`${p.name} (EU ${selectedSize}) ditambahkan ke keranjang!`);
      renderCart();
    }
  });

  buyBtn.addEventListener('click', () => {
    if (!requireSize()) return;
    if (qty > p.stock) { showToast(`Stok tidak cukup. Tersedia: ${p.stock}`, 'warning'); return; }
    openCheckoutModal([{ key: `${p.id}__${selectedSize}`, productId: p.id, size: selectedSize, qty,
      name: p.name, brand: p.brand, price: p.price, colorIndex: p.colorIndex }]);
  });

  openModal('product-modal-overlay');
}

/* ============================================================
   BAGIAN 10 — CHECKOUT
   ============================================================ */

function openCheckoutModal(buyNowItems = null) {
  const items    = buyNowItems || state.cart;
  const subtotal = items.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total    = subtotal + shipping;

  const modeBanner = buyNowItems
    ? `<div class="flex items-center gap-2 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-4">
        <span>⚡</span>
        <span>Beli Sekarang · ${items.map(i => `${escHtml(i.name)} EU${i.size} ×${i.qty}`).join(', ')}</span>
       </div>` : '';

  document.getElementById('checkout-body').innerHTML = `
    ${modeBanner}
    <div class="mb-5 p-3 bg-gray-50 rounded-xl text-sm space-y-1 text-gray-600 border border-gray-100">
      ${items.map(i => `<div class="flex justify-between text-xs"><span>${escHtml(i.name)} EU${i.size} ×${i.qty}</span><span>${formatRp(i.price * i.qty)}</span></div>`).join('')}
      <div class="border-t pt-2 mt-1 space-y-1">
        <div class="flex justify-between"><span>Subtotal</span><span>${formatRp(subtotal)}</span></div>
        <div class="flex justify-between"><span>Ongkos Kirim</span>
          <span class="${shipping === 0 ? 'text-green-600 font-semibold' : ''}">${shipping === 0 ? 'GRATIS' : formatRp(shipping)}</span>
        </div>
        <div class="flex justify-between font-bold text-gray-800 border-t pt-1"><span>Total</span><span class="text-blue-700">${formatRp(total)}</span></div>
      </div>
    </div>
    <form id="checkout-form" novalidate class="space-y-4">
      <div>
        <label for="co-name" class="block text-sm font-medium text-gray-700 mb-1">Nama Penerima <span class="text-red-500">*</span></label>
        <input id="co-name" type="text" class="form-input" placeholder="Nama lengkap" />
        <p id="co-name-err" class="text-xs text-red-500 mt-1 hidden"></p>
      </div>
      <div>
        <label for="co-phone" class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon <span class="text-red-500">*</span></label>
        <input id="co-phone" type="tel" class="form-input" placeholder="08xx-xxxx-xxxx" />
        <p id="co-phone-err" class="text-xs text-red-500 mt-1 hidden"></p>
      </div>
      <div>
        <label for="co-address" class="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman <span class="text-red-500">*</span></label>
        <textarea id="co-address" rows="3" class="form-input resize-none" placeholder="Jalan, nomor, kota, provinsi, kode pos"></textarea>
        <p id="co-address-err" class="text-xs text-red-500 mt-1 hidden"></p>
      </div>
      <div>
        <label for="co-shipping" class="block text-sm font-medium text-gray-700 mb-1">Metode Pengiriman <span class="text-red-500">*</span></label>
        <select id="co-shipping" class="form-input">
          <option value="">— Pilih Metode —</option>
          <option>JNE Reguler</option><option>JNE Express</option>
          <option>J&amp;T Economy</option><option>SiCepat BEST</option><option>Ambil Sendiri</option>
        </select>
        <p id="co-shipping-err" class="text-xs text-red-500 mt-1 hidden"></p>
      </div>
      <div>
        <label for="co-payment" class="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran <span class="text-red-500">*</span></label>
        <select id="co-payment" class="form-input">
          <option value="">— Pilih Metode —</option>
          <option>Transfer Bank</option><option>E-Wallet</option><option>COD (Bayar di Tempat)</option>
        </select>
        <p id="co-payment-err" class="text-xs text-red-500 mt-1 hidden"></p>
      </div>
      <button type="submit"
              class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
        Konfirmasi Pesanan
      </button>
    </form>`;

  document.getElementById('checkout-form').addEventListener('submit', e => handleCheckoutSubmit(e, buyNowItems));
  openModal('checkout-overlay');
}

function handleCheckoutSubmit(e, buyNowItems = null) {
  e.preventDefault();
  const name     = document.getElementById('co-name');
  const phone    = document.getElementById('co-phone');
  const address  = document.getElementById('co-address');
  const shipping = document.getElementById('co-shipping');
  const payment  = document.getElementById('co-payment');
  let valid = true;

  function setErr(el, errId, msg) {
    const err = document.getElementById(errId);
    if (msg) { el.classList.add('is-invalid'); err.textContent = msg; err.classList.remove('hidden'); valid = false; }
    else { el.classList.remove('is-invalid'); err.textContent = ''; err.classList.add('hidden'); }
  }
  setErr(name,     'co-name-err',     name.value.trim().length < 3 ? 'Nama minimal 3 karakter.' : '');
  setErr(phone,    'co-phone-err',    !/^[0-9+\-\s]{8,15}$/.test(phone.value.trim()) ? 'Nomor telepon tidak valid.' : '');
  setErr(address,  'co-address-err',  address.value.trim().length < 10 ? 'Alamat minimal 10 karakter.' : '');
  setErr(shipping, 'co-shipping-err', !shipping.value ? 'Pilih metode pengiriman.' : '');
  setErr(payment,  'co-payment-err',  !payment.value  ? 'Pilih metode pembayaran.' : '');
  if (!valid) return;

  const order = createOrder({
    buyerName: name.value.trim(), phone: phone.value.trim(),
    address: address.value.trim(), shippingMethod: shipping.value,
    paymentMethod: payment.value.replace(' (Bayar di Tempat)', ''),
  }, buyNowItems);

  closeModal('checkout-overlay');
  closeModal('product-modal-overlay');
  closeCart();
  renderProductGrid();

  document.getElementById('confirm-order-no').textContent = order.orderNo;
  openModal('confirm-overlay');
}

/* ============================================================
   BAGIAN 11 — RENDER ADMIN
   ============================================================ */

function renderAdminSummary() {
  const totalProducts = state.products.length;
  const totalOrders   = state.orders.length;
  const processing    = state.orders.filter(o => o.status === 'Diproses').length;
  const revenue       = state.orders.filter(o => o.status === 'Selesai').reduce((s, o) => s + o.total, 0);

  document.getElementById('admin-summary').innerHTML = [
    { label: 'Total Produk',    value: totalProducts,     icon: '📦', color: 'text-blue-600',   clickTab: 'products' },
    { label: 'Total Pesanan',   value: totalOrders,       icon: '🛒', color: 'text-purple-600', clickTab: 'orders',  filter: 'Semua' },
    { label: 'Sedang Diproses', value: processing,        icon: '⏳', color: 'text-orange-500', clickTab: 'orders',  filter: 'Diproses' },
    { label: 'Pendapatan',      value: formatRp(revenue), icon: '💰', color: 'text-green-600',  clickTab: 'sales' },
  ].map(c => `
    <button type="button" class="summary-card text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl hover:shadow-md transition"
            data-summary-tab="${c.clickTab}" data-summary-filter="${c.filter || ''}">
      <p class="text-2xl mb-1">${c.icon}</p>
      <p class="text-xs text-gray-400 font-medium mb-1">${c.label}</p>
      <p class="text-2xl font-bold ${c.color}">${c.value}</p>
      <p class="text-[10px] text-gray-300 mt-1">Klik untuk detail →</p>
    </button>`).join('');
}

function renderAdminProductList() {
  const container = document.getElementById('admin-product-list');
  const label     = document.getElementById('product-count-label');
  if (label) label.textContent = state.products.length;

  if (state.products.length === 0) {
    container.innerHTML = `<div class="text-center py-10 text-gray-400"><div class="text-5xl mb-3">📦</div><p>Belum ada produk. Tambahkan produk baru.</p></div>`;
    return;
  }
  container.innerHTML = state.products.map(p => {
    const si = stockInfo(p.stock);
    const c  = PRODUCT_COLORS[p.colorIndex % PRODUCT_COLORS.length];
    return `
    <div class="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-200 transition">
      <div class="w-12 h-12 rounded-xl shrink-0 overflow-hidden flex items-center justify-center text-xl" style="background:${c.bg}" aria-hidden="true">
        ${p.image ? `<img src="${p.image}" alt="${escHtml(p.name)}" class="w-full h-full object-cover" />` : c.emoji}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-800 truncate">${escHtml(p.name)}</p>
        <p class="text-xs text-gray-400 mt-0.5">${escHtml(p.brand)} · ${escHtml(p.category)} · ${formatRp(p.price)}</p>
        <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${si.cls}">${si.label} (stok: ${p.stock})</span>
      </div>
      <div class="flex gap-1 shrink-0">
        <button type="button" class="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" data-edit-product="${p.id}" aria-label="Edit ${escHtml(p.name)}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button type="button" class="p-2 rounded-lg hover:bg-red-50 text-red-500 transition" data-delete-product="${p.id}" aria-label="Hapus ${escHtml(p.name)}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

function renderOrderFilters() {
  document.getElementById('order-filters').innerHTML = ['Semua', 'Diproses', 'Selesai'].map(f => `
    <button type="button" class="cat-btn text-xs${f === uiState.orderFilter ? ' active' : ''}"
            data-order-filter="${f}" aria-pressed="${f === uiState.orderFilter}">${f}</button>`).join('');
}

function renderAdminOrderList() {
  const container = document.getElementById('admin-order-list');
  let list = uiState.orderFilter === 'Semua' ? [...state.orders] : state.orders.filter(o => o.status === uiState.orderFilter);

  if (list.length === 0) {
    container.innerHTML = `<div class="text-center py-10 text-gray-400"><div class="text-5xl mb-3">🛒</div><p>Tidak ada pesanan ${uiState.orderFilter !== 'Semua' ? uiState.orderFilter.toLowerCase() : ''}.</p></div>`;
    return;
  }

  container.innerHTML = list.map(o => {
    const sb = orderStatusBadge(o.status);
    return `
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 transition">
      <!-- Row header -->
      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div>
          <p class="text-xs font-mono font-bold text-blue-600">${escHtml(o.orderNo)}</p>
          <p class="text-sm font-semibold text-gray-800">${escHtml(o.buyerName)}</p>
          <p class="text-xs text-gray-400">${formatDate(o.createdAt)} · ${escHtml(o.paymentMethod)}</p>
        </div>
        <span class="shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${sb.cls}">${sb.label}</span>
      </div>

      <!-- Items -->
      <div class="px-4 py-3 space-y-1">
        ${o.items.map(i => `<p class="text-xs text-gray-600">${escHtml(i.name)} · EU${i.size} × ${i.qty} · <span class="font-medium">${formatRp(i.price * i.qty)}</span></p>`).join('')}
      </div>

      <!-- Totals + Actions -->
      <div class="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs text-gray-400">Ongkir: ${o.shipping === 0 ? '<span class="text-green-600 font-medium">GRATIS</span>' : formatRp(o.shipping)}</p>
          <p class="text-base font-bold text-gray-800">Total: ${formatRp(o.total)}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-white text-gray-600 transition font-medium"
                  data-view-order="${o.id}">✏️ Detail/Edit</button>
          ${o.status === 'Diproses'
            ? `<button type="button" class="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition"
                       data-complete-order="${o.id}">✅ Selesai</button>`
            : `<button type="button" class="text-xs px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition"
                       data-revert-order="${o.id}">↩ Diproses</button>`}
          <button type="button" class="text-xs px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 font-medium transition"
                  data-delete-order="${o.id}">🗑 Hapus</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderAdmin() {
  renderAdminSummary();
  renderAdminProductList();
  renderOrderFilters();
  renderAdminOrderList();
}

/* ============================================================
   BAGIAN 11b — RENDER DATA PENJUALAN (Admin)
   ============================================================ */

function renderAdminSalesPanel() {
  const container = document.getElementById('admin-sales-body');

  // Hanya pesanan dengan status Selesai yang dihitung sebagai pendapatan
  const doneOrders = state.orders.filter(o => o.status === 'Selesai');
  const allOrders  = state.orders;

  // ---- Metrik ringkasan ----
  const totalRevenue   = doneOrders.reduce((s, o) => s + o.total, 0);
  const totalOrders    = allOrders.length;
  const doneCount      = doneOrders.length;
  const processingCount = allOrders.filter(o => o.status === 'Diproses').length;
  const avgOrderValue  = doneCount > 0 ? totalRevenue / doneCount : 0;

  // ---- Rekap per produk (dari pesanan Selesai) ----
  const productSales = {};
  doneOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.name, brand: item.brand,
          colorIndex: item.colorIndex, qty: 0, revenue: 0,
        };
      }
      productSales[item.productId].qty     += item.qty;
      productSales[item.productId].revenue += item.price * item.qty;
    });
  });
  // Urutkan berdasarkan revenue tertinggi
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

  // ---- Rekap per metode pembayaran (dari pesanan Selesai) ----
  const paymentBreakdown = {};
  doneOrders.forEach(o => {
    paymentBreakdown[o.paymentMethod] = (paymentBreakdown[o.paymentMethod] || 0) + o.total;
  });

  // ---- Render ----
  if (doneOrders.length === 0 && allOrders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20 text-gray-400">
        <div class="text-6xl mb-4">📊</div>
        <p class="text-lg font-semibold text-gray-500">Belum ada data penjualan</p>
        <p class="text-sm mt-1">Data akan muncul setelah ada pesanan yang selesai.</p>
      </div>`;
    return;
  }

  // Bar chart sederhana via CSS width
  const maxRevenue = topProducts.length > 0 ? topProducts[0].revenue : 1;

  container.innerHTML = `

    <!-- ===== Metrik Utama ===== -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="sales-metric-card border-l-4 border-green-500">
        <p class="text-xs text-gray-400 mb-1">Total Pendapatan</p>
        <p class="text-xl font-bold text-green-600">${formatRp(totalRevenue)}</p>
        <p class="text-[11px] text-gray-400 mt-1">Dari ${doneCount} pesanan selesai</p>
      </div>
      <div class="sales-metric-card border-l-4 border-blue-500">
        <p class="text-xs text-gray-400 mb-1">Rata-rata Nilai Pesanan</p>
        <p class="text-xl font-bold text-blue-600">${formatRp(avgOrderValue)}</p>
        <p class="text-[11px] text-gray-400 mt-1">Per transaksi selesai</p>
      </div>
      <div class="sales-metric-card border-l-4 border-orange-400">
        <p class="text-xs text-gray-400 mb-1">Pesanan Diproses</p>
        <p class="text-xl font-bold text-orange-500">${processingCount}</p>
        <p class="text-[11px] text-gray-400 mt-1">Menunggu diselesaikan</p>
      </div>
      <div class="sales-metric-card border-l-4 border-purple-400">
        <p class="text-xs text-gray-400 mb-1">Total Semua Pesanan</p>
        <p class="text-xl font-bold text-purple-600">${totalOrders}</p>
        <p class="text-[11px] text-gray-400 mt-1">Selesai + diproses</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

      <!-- ===== Produk Terlaris ===== -->
      <div class="xl:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h3 class="text-sm font-bold text-gray-800">🏆 Produk Terlaris</h3>
          <p class="text-xs text-gray-400 mt-0.5">Berdasarkan pendapatan dari pesanan selesai</p>
        </div>
        ${topProducts.length === 0
          ? `<p class="text-sm text-gray-400 text-center py-8">Belum ada data produk terjual.</p>`
          : `<div class="divide-y divide-gray-100">
              ${topProducts.map((p, i) => {
                const barWidth = Math.round((p.revenue / maxRevenue) * 100);
                const c = PRODUCT_COLORS[p.colorIndex % PRODUCT_COLORS.length];
                return `
                <div class="px-5 py-3 flex items-center gap-3">
                  <span class="text-xs font-bold text-gray-400 w-5 shrink-0">#${i + 1}</span>
                  <div class="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-lg"
                       style="background:${c.bg}" aria-hidden="true">${c.emoji}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">${escHtml(p.name)}</p>
                    <p class="text-xs text-gray-400">${escHtml(p.brand)} · ${p.qty} unit terjual</p>
                    <!-- Mini bar chart -->
                    <div class="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500 rounded-full transition-all duration-500"
                           style="width:${barWidth}%" aria-label="${barWidth}% dari produk tertinggi"></div>
                    </div>
                  </div>
                  <p class="text-sm font-bold text-blue-700 shrink-0 text-right">${formatRp(p.revenue)}</p>
                </div>`;
              }).join('')}
            </div>`}
      </div>

      <!-- ===== Metode Pembayaran ===== -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h3 class="text-sm font-bold text-gray-800">💳 Metode Pembayaran</h3>
          <p class="text-xs text-gray-400 mt-0.5">Dari pesanan selesai</p>
        </div>
        ${Object.keys(paymentBreakdown).length === 0
          ? `<p class="text-sm text-gray-400 text-center py-8">Belum ada data.</p>`
          : `<div class="divide-y divide-gray-100">
              ${Object.entries(paymentBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([method, amount]) => {
                  const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  const icons = { 'Transfer Bank': '🏦', 'E-Wallet': '📱', 'COD': '💵' };
                  return `
                  <div class="px-5 py-3">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-sm font-medium text-gray-700">${icons[method] || '💳'} ${escHtml(method)}</span>
                      <span class="text-xs font-bold text-gray-500">${pct}%</span>
                    </div>
                    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-green-500 rounded-full" style="width:${pct}%"></div>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">${formatRp(amount)}</p>
                  </div>`;
                }).join('')}
            </div>`}
      </div>

    </div>

    <!-- ===== Rincian Pesanan Selesai ===== -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-gray-800">📋 Rincian Pesanan Selesai</h3>
          <p class="text-xs text-gray-400 mt-0.5">${doneCount} transaksi · total ${formatRp(totalRevenue)}</p>
        </div>
      </div>
      ${doneOrders.length === 0
        ? `<p class="text-sm text-gray-400 text-center py-8">Belum ada pesanan selesai.</p>`
        : `<div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th class="px-5 py-3 font-semibold">No. Pesanan</th>
                  <th class="px-5 py-3 font-semibold">Pembeli</th>
                  <th class="px-5 py-3 font-semibold hidden sm:table-cell">Item</th>
                  <th class="px-5 py-3 font-semibold hidden md:table-cell">Pembayaran</th>
                  <th class="px-5 py-3 font-semibold hidden md:table-cell">Tanggal</th>
                  <th class="px-5 py-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${doneOrders.map(o => `
                  <tr class="hover:bg-gray-50 transition">
                    <td class="px-5 py-3 font-mono text-xs text-blue-600 font-bold">${escHtml(o.orderNo)}</td>
                    <td class="px-5 py-3">
                      <p class="font-medium text-gray-800">${escHtml(o.buyerName)}</p>
                      <p class="text-xs text-gray-400">${escHtml(o.phone)}</p>
                    </td>
                    <td class="px-5 py-3 hidden sm:table-cell">
                      <p class="text-xs text-gray-500 max-w-[180px] truncate">${o.items.map(i => `${escHtml(i.name)} ×${i.qty}`).join(', ')}</p>
                    </td>
                    <td class="px-5 py-3 hidden md:table-cell text-xs text-gray-600">${escHtml(o.paymentMethod)}</td>
                    <td class="px-5 py-3 hidden md:table-cell text-xs text-gray-400">${formatDate(o.createdAt)}</td>
                    <td class="px-5 py-3 text-right font-bold text-green-600">${formatRp(o.total)}</td>
                  </tr>`).join('')}
              </tbody>
              <tfoot class="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td colspan="5" class="px-5 py-3 text-sm font-bold text-gray-700 hidden md:table-cell">Total Pendapatan</td>
                  <td colspan="3" class="px-5 py-3 text-sm font-bold text-gray-700 md:hidden">Total Pendapatan</td>
                  <td class="px-5 py-3 text-right text-base font-bold text-green-700">${formatRp(totalRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>`}
    </div>
  `;
}

/** Switch tab admin (products / orders / sales) */
function switchAdminTab(tab, orderFilter = null) {
  uiState.adminTab = tab;
  if (orderFilter) uiState.orderFilter = orderFilter;

  const panels = {
    products: document.getElementById('admin-products-panel'),
    orders:   document.getElementById('admin-orders-panel'),
    sales:    document.getElementById('admin-sales-panel'),
  };
  const tabs = {
    products: document.getElementById('admin-tab-products'),
    orders:   document.getElementById('admin-tab-orders'),
    sales:    document.getElementById('admin-tab-sales'),
  };

  // Sembunyikan semua panel & nonaktifkan semua tab
  Object.values(panels).forEach(p => p.classList.add('hidden'));
  Object.values(tabs).forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });

  // Aktifkan panel & tab yang dipilih
  panels[tab]?.classList.remove('hidden');
  tabs[tab]?.classList.add('active');
  tabs[tab]?.setAttribute('aria-selected', 'true');

  // Render konten
  if (tab === 'orders') {
    renderOrderFilters();
    renderAdminOrderList();
  } else if (tab === 'sales') {
    renderAdminSalesPanel();
  } else {
    renderAdminProductList();
  }
}

/* ============================================================
   BAGIAN 12 — FORM PRODUK (Admin)
   ============================================================ */

function openProductForm(productId = null) {
  const isEdit = Boolean(productId);
  const p = isEdit ? state.products.find(x => x.id === productId) : null;
  document.getElementById('product-form-title').textContent = isEdit ? 'Edit Produk' : 'Tambah Produk Baru';
  document.getElementById('pf-id').value       = isEdit ? p.id : '';
  document.getElementById('pf-name').value     = isEdit ? p.name : '';
  document.getElementById('pf-brand').value    = isEdit ? p.brand : '';
  document.getElementById('pf-category').value = isEdit ? p.category : '';
  document.getElementById('pf-price').value    = isEdit ? p.price : '';
  document.getElementById('pf-stock').value    = isEdit ? p.stock : '';
  document.getElementById('pf-desc').value     = isEdit ? p.description : '';
  ['pf-name-err','pf-brand-err','pf-category-err','pf-price-err','pf-stock-err'].forEach(id => {
    const el = document.getElementById(id); if (el) { el.textContent = ''; el.classList.add('hidden'); }
  });
  ['pf-name','pf-brand','pf-category','pf-price','pf-stock'].forEach(id =>
    document.getElementById(id)?.classList.remove('is-invalid'));

  // Tampilkan foto existing saat edit
  const preview     = document.getElementById('pf-img-preview');
  const placeholder = document.getElementById('pf-img-placeholder');
  const dropZone    = document.getElementById('pf-img-drop');
  const removeBtn   = document.getElementById('pf-img-remove');
  if (preview && placeholder && dropZone) {
    if (isEdit && p.image) {
      window._pfImageData = p.image;
      preview.src = p.image;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
      dropZone.classList.add('has-image');
      removeBtn?.classList.remove('hidden');
    } else {
      window._pfImageData = null;
      preview.src = ''; preview.classList.add('hidden');
      placeholder.classList.remove('hidden');
      dropZone.classList.remove('has-image');
      removeBtn?.classList.add('hidden');
      const fi = document.getElementById('pf-image'); if (fi) fi.value = '';
    }
  }

  openModal('product-form-overlay');
}

function handleProductFormSubmit(e) {
  e.preventDefault();
  const idVal   = document.getElementById('pf-id').value;
  const nameEl  = document.getElementById('pf-name');
  const brandEl = document.getElementById('pf-brand');
  const catEl   = document.getElementById('pf-category');
  const priceEl = document.getElementById('pf-price');
  const stockEl = document.getElementById('pf-stock');
  const descEl  = document.getElementById('pf-desc');
  let valid = true;

  function setErr(el, errId, msg) {
    const err = document.getElementById(errId);
    if (msg) { el.classList.add('is-invalid'); err.textContent = msg; err.classList.remove('hidden'); valid = false; }
    else { el.classList.remove('is-invalid'); if (err) { err.textContent = ''; err.classList.add('hidden'); } }
  }
  setErr(nameEl,  'pf-name-err',     !nameEl.value.trim()      ? 'Nama produk wajib diisi.' : '');
  setErr(brandEl, 'pf-brand-err',    !brandEl.value.trim()     ? 'Merek wajib diisi.' : '');
  setErr(catEl,   'pf-category-err', !catEl.value              ? 'Pilih kategori.' : '');
  setErr(priceEl, 'pf-price-err',    Number(priceEl.value) <= 0 ? 'Harga harus lebih dari 0.' : '');
  setErr(stockEl, 'pf-stock-err',    Number(stockEl.value) < 0  ? 'Stok tidak boleh negatif.' : '');
  if (!valid) return;

  // Sertakan gambar dari upload (base64) jika ada
  const data = { name: nameEl.value, brand: brandEl.value, category: catEl.value,
    price: priceEl.value, stock: stockEl.value, description: descEl.value,
    image: window._pfImageData || null };
  if (idVal) { updateProduct(idVal, data); showToast('Produk berhasil diperbarui!'); }
  else       { addProduct(data);           showToast('Produk berhasil ditambahkan!'); }

  closeModal('product-form-overlay');
  renderAdmin();
  renderProductGrid();
}

/* ============================================================
   BAGIAN 13 — MODAL EDIT PESANAN (Admin)
   ============================================================ */

function openOrderModal(orderId) {
  const o = state.orders.find(x => x.id === orderId);
  if (!o) return;
  document.getElementById('order-form-title').textContent = `Detail Pesanan ${o.orderNo}`;
  document.getElementById('order-form-body').innerHTML = `
    <div class="mb-4 p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-500 border border-gray-100">
      ${o.items.map(i => `
        <div class="flex justify-between">
          <span>${escHtml(i.name)} · EU${i.size} × ${i.qty}</span>
          <span class="font-medium">${formatRp(i.price * i.qty)}</span>
        </div>`).join('')}
      <div class="flex justify-between border-t pt-1 mt-1 font-bold text-gray-700">
        <span>Total (termasuk ongkir)</span><span>${formatRp(o.total)}</span>
      </div>
    </div>
    <form id="order-edit-form" novalidate class="space-y-4">
      <input type="hidden" id="oe-id" value="${escHtml(o.id)}" />
      <div>
        <label for="oe-name" class="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
        <input id="oe-name" type="text" class="form-input" value="${escHtml(o.buyerName)}" />
        <p id="oe-name-err" class="text-xs text-red-500 mt-1 hidden"></p>
      </div>
      <div>
        <label for="oe-phone" class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
        <input id="oe-phone" type="tel" class="form-input" value="${escHtml(o.phone)}" />
        <p id="oe-phone-err" class="text-xs text-red-500 mt-1 hidden"></p>
      </div>
      <div>
        <label for="oe-address" class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
        <textarea id="oe-address" rows="2" class="form-input resize-none">${escHtml(o.address)}</textarea>
        <p id="oe-address-err" class="text-xs text-red-500 mt-1 hidden"></p>
      </div>
      <div>
        <label for="oe-payment" class="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
        <select id="oe-payment" class="form-input">
          <option ${o.paymentMethod === 'Transfer Bank' ? 'selected' : ''}>Transfer Bank</option>
          <option ${o.paymentMethod === 'E-Wallet'      ? 'selected' : ''}>E-Wallet</option>
          <option ${o.paymentMethod === 'COD'           ? 'selected' : ''}>COD</option>
        </select>
      </div>
      <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        Simpan Perubahan
      </button>
    </form>`;
  document.getElementById('order-edit-form').addEventListener('submit', handleOrderEditSubmit);
  openModal('order-form-overlay');
}

function handleOrderEditSubmit(e) {
  e.preventDefault();
  const id      = document.getElementById('oe-id').value;
  const nameEl  = document.getElementById('oe-name');
  const phoneEl = document.getElementById('oe-phone');
  const addrEl  = document.getElementById('oe-address');
  const payEl   = document.getElementById('oe-payment');
  let valid = true;
  function setErr(el, errId, msg) {
    const err = document.getElementById(errId);
    if (msg) { el.classList.add('is-invalid'); err.textContent = msg; err.classList.remove('hidden'); valid = false; }
    else { el.classList.remove('is-invalid'); if (err) { err.textContent = ''; err.classList.add('hidden'); } }
  }
  setErr(nameEl,  'oe-name-err',    nameEl.value.trim().length < 3 ? 'Nama minimal 3 karakter.' : '');
  setErr(phoneEl, 'oe-phone-err',   !/^[0-9+\-\s]{8,15}$/.test(phoneEl.value.trim()) ? 'Nomor tidak valid.' : '');
  setErr(addrEl,  'oe-address-err', addrEl.value.trim().length < 5 ? 'Alamat terlalu pendek.' : '');
  if (!valid) return;
  updateOrderBuyer(id, { buyerName: nameEl.value, phone: phoneEl.value, address: addrEl.value, paymentMethod: payEl.value });
  showToast('Data pesanan diperbarui!');
  closeModal('order-form-overlay');
  renderAdmin();
}

/* ============================================================
   BAGIAN 14 — CART OPEN / CLOSE
   ============================================================ */

function openCart() {
  uiState.cartOpen = true;
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.remove('hidden');
  document.getElementById('close-cart-btn').focus();
}
function closeCart() {
  uiState.cartOpen = false;
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.add('hidden');
}

/* ============================================================
   BAGIAN 15 — SWITCH VIEW
   ============================================================ */

/**
 * @param {'storefront'|'my-orders'|'admin'} view
 */
function switchView(view) {
  uiState.view = view;

  const storefront    = document.getElementById('storefront');
  const myOrdersPage  = document.getElementById('my-orders-page');
  const adminPanel    = document.getElementById('admin-panel');
  const footer        = document.getElementById('main-footer');
  const searchWrap    = document.getElementById('header-search-wrap');
  const buyerSubnav   = document.getElementById('buyer-subnav');
  const cartBtn       = document.getElementById('cart-btn');
  const myOrdersBtn   = document.getElementById('my-orders-btn');
  const subnavCatalog = document.getElementById('subnav-catalog');
  const roleBuyerBtn  = document.getElementById('role-buyer-btn');
  const roleSellerBtn = document.getElementById('role-seller-btn');

  // Sembunyikan semua panel
  storefront.classList.add('hidden');
  myOrdersPage.classList.add('hidden');
  adminPanel.classList.add('hidden');

  // Reset subnav tabs
  subnavCatalog?.classList.remove('active');
  myOrdersBtn?.classList.remove('active');
  myOrdersBtn?.setAttribute('aria-pressed', 'false');

  if (view === 'admin') {
    // Mode Penjual
    adminPanel.classList.remove('hidden');
    footer.classList.remove('hidden');
    searchWrap?.classList.add('hidden');
    buyerSubnav?.classList.add('hidden');
    cartBtn?.classList.add('hidden');
    roleBuyerBtn?.classList.remove('active'); roleBuyerBtn?.setAttribute('aria-pressed', 'false');
    roleSellerBtn?.classList.add('active');   roleSellerBtn?.setAttribute('aria-pressed', 'true');
    renderAdmin();
    // Sembunyikan chat widget di mode Penjual
    chatSetVisible(false);

  } else if (view === 'my-orders') {
    // Mode Pembeli — halaman pesanan
    myOrdersPage.classList.remove('hidden');
    footer.classList.add('hidden');
    searchWrap?.classList.add('hidden');
    buyerSubnav?.classList.remove('hidden');
    cartBtn?.classList.remove('hidden');
    myOrdersBtn?.classList.add('active');
    myOrdersBtn?.setAttribute('aria-pressed', 'true');
    roleBuyerBtn?.classList.add('active');    roleBuyerBtn?.setAttribute('aria-pressed', 'true');
    roleSellerBtn?.classList.remove('active'); roleSellerBtn?.setAttribute('aria-pressed', 'false');
    renderMyOrders();
    // Tampilkan chat widget di mode Pembeli
    chatSetVisible(true);

  } else {
    // Mode Pembeli — storefront
    storefront.classList.remove('hidden');
    footer.classList.remove('hidden');
    searchWrap?.classList.remove('hidden');
    buyerSubnav?.classList.remove('hidden');
    cartBtn?.classList.remove('hidden');
    subnavCatalog?.classList.add('active');
    roleBuyerBtn?.classList.add('active');    roleBuyerBtn?.setAttribute('aria-pressed', 'true');
    roleSellerBtn?.classList.remove('active'); roleSellerBtn?.setAttribute('aria-pressed', 'false');
    renderProductGrid();
    // Tampilkan chat widget di mode Pembeli
    chatSetVisible(true);
  }
}

/** Inisialisasi logika upload foto di form produk */
function initProductImageUpload() {
  const dropZone  = document.getElementById('pf-img-drop');
  const fileInput = document.getElementById('pf-image');
  const preview   = document.getElementById('pf-img-preview');
  const placeholder = document.getElementById('pf-img-placeholder');
  const removeBtn = document.getElementById('pf-img-remove');
  if (!dropZone || !fileInput) return;

  // State: data URL foto yang sedang dipilih (null = tidak ada)
  window._pfImageData = null;

  function showPreview(dataUrl) {
    window._pfImageData = dataUrl;
    preview.src = dataUrl;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    dropZone.classList.add('has-image');
    removeBtn.classList.remove('hidden');
  }
  function clearPreview() {
    window._pfImageData = null;
    preview.src = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    dropZone.classList.remove('has-image');
    removeBtn.classList.add('hidden');
    fileInput.value = '';
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (PNG/JPG/WebP).', 'error'); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 2 MB.', 'error'); return;
    }
    const reader = new FileReader();
    reader.onload = e => showPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  // Klik zona → trigger input file
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });

  // Pilih file
  fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

  // Drag & drop
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  // Hapus foto
  removeBtn.addEventListener('click', e => { e.stopPropagation(); clearPreview(); });
}

/* ============================================================
   BAGIAN 16 — EVENT LISTENERS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Init render
  renderCategoryFilters();
  renderProductGrid();
  renderCart();
  renderCartBadge();

  /* --- Header nav --- */
  document.getElementById('logo-btn').addEventListener('click', e => {
    e.preventDefault();
    if (uiState.view !== 'storefront') switchView('storefront');
  });

  // Role switcher: chip Pembeli / Penjual
  document.getElementById('role-buyer-btn').addEventListener('click', () => {
    if (uiState.view !== 'storefront' && uiState.view !== 'my-orders') switchView('storefront');
  });
  document.getElementById('role-seller-btn').addEventListener('click', () => {
    switchView('admin');
  });

  // Sub-nav beranda
  document.getElementById('subnav-catalog').addEventListener('click', () => {
    switchView('storefront');
  });
  // Sub-nav pesanan saya
  document.getElementById('my-orders-btn').addEventListener('click', () => {
    switchView(uiState.view === 'my-orders' ? 'storefront' : 'my-orders');
  });
  document.getElementById('back-from-orders-btn').addEventListener('click', () => switchView('storefront'));

  // Init upload foto (form produk sudah ada di DOM)
  initProductImageUpload();

  /* --- Cart --- */
  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('close-cart-btn').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);

  /* --- Search & filters --- */
  document.getElementById('search-input').addEventListener('input', debounce(e => {
    uiState.searchQuery = e.target.value.trim();
    renderProductGrid();
  }, 300));
  document.getElementById('sort-select').addEventListener('change', e => {
    uiState.sortBy = e.target.value; renderProductGrid();
  });
  document.getElementById('category-filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    uiState.activeCategory = btn.dataset.category;
    renderCategoryFilters(); renderProductGrid();
  });

  /* --- Product Grid (event delegation) --- */
  document.getElementById('product-grid').addEventListener('click', e => {
    // Tombol "Keranjang" di card → buka modal
    const addBtn = e.target.closest('[data-add-cart]');
    if (addBtn && !addBtn.disabled) { e.stopPropagation(); openProductModal(addBtn.dataset.addCart); return; }
    // Tombol "Beli" di card → buka modal langsung ke Beli Sekarang
    const buyBtn = e.target.closest('[data-buy-now]');
    if (buyBtn && !buyBtn.disabled) { e.stopPropagation(); openProductModal(buyBtn.dataset.buyNow); return; }
    // Klik card
    const card = e.target.closest('[data-product-id]');
    if (card) openProductModal(card.dataset.productId);
  });
  document.getElementById('product-grid').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-product-id]');
      if (card) { e.preventDefault(); openProductModal(card.dataset.productId); }
    }
  });

  /* --- Cart items (event delegation) --- */
  document.getElementById('cart-items').addEventListener('click', e => {
    const qtyBtn    = e.target.closest('[data-qty-key]');
    const removeBtn = e.target.closest('[data-remove-cart]');
    if (qtyBtn)    updateCartQty(qtyBtn.dataset.qtyKey, Number(qtyBtn.dataset.delta));
    if (removeBtn) removeCartItem(removeBtn.dataset.removeCart);
  });
  document.getElementById('cart-footer').addEventListener('click', e => {
    if (e.target.closest('#checkout-btn')) {
      if (state.cart.length === 0) { showToast('Keranjang kosong!', 'warning'); return; }
      openCheckoutModal();
    }
  });

  /* --- My Orders filters (event delegation) --- */
  document.getElementById('my-order-filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-my-order-filter]');
    if (!btn) return;
    uiState.myOrderFilter = btn.dataset.myOrderFilter;
    renderMyOrders();
  });

  /* --- Confirm modal buttons --- */
  document.getElementById('confirm-go-orders-btn').addEventListener('click', () => {
    closeModal('confirm-overlay');
    uiState.myOrderFilter = 'Semua';
    switchView('my-orders');
  });
  document.getElementById('close-confirm-btn').addEventListener('click', () => {
    closeModal('confirm-overlay');
    switchView('storefront');
  });

  /* --- Modal close buttons --- */
  document.getElementById('close-product-modal-btn').addEventListener('click', () => closeModal('product-modal-overlay'));
  document.getElementById('close-checkout-btn').addEventListener('click', () => closeModal('checkout-overlay'));
  document.getElementById('close-product-form-btn').addEventListener('click', () => closeModal('product-form-overlay'));
  document.getElementById('cancel-product-form-btn').addEventListener('click', () => closeModal('product-form-overlay'));
  document.getElementById('close-order-form-btn').addEventListener('click', () => closeModal('order-form-overlay'));

  // Klik overlay → tutup
  ['product-modal-overlay', 'checkout-overlay', 'confirm-overlay', 'product-form-overlay', 'order-form-overlay'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(id); });
  });

  // Esc
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (uiState.cartOpen) { closeCart(); return; }
    ['product-modal-overlay', 'checkout-overlay', 'confirm-overlay', 'product-form-overlay', 'order-form-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('hidden')) closeModal(id);
    });
  });

  /* --- Product form --- */
  document.getElementById('product-form').addEventListener('submit', handleProductFormSubmit);

  /* --- Admin panel --- */
  document.getElementById('add-product-btn').addEventListener('click', () => openProductForm());

  // Tab nav admin
  document.getElementById('admin-tab-products').addEventListener('click', () => switchAdminTab('products'));
  document.getElementById('admin-tab-orders').addEventListener('click', () => switchAdminTab('orders'));
  document.getElementById('admin-tab-sales').addEventListener('click', () => switchAdminTab('sales'));

  // Summary card click → navigate to tab
  document.getElementById('admin-summary').addEventListener('click', e => {
    const card = e.target.closest('[data-summary-tab]');
    if (!card) return;
    switchAdminTab(card.dataset.summaryTab, card.dataset.summaryFilter || null);
  });

  // Product list actions (event delegation)
  document.getElementById('admin-product-list').addEventListener('click', e => {
    const editBtn   = e.target.closest('[data-edit-product]');
    const deleteBtn = e.target.closest('[data-delete-product]');
    if (editBtn) { openProductForm(editBtn.dataset.editProduct); return; }
    if (deleteBtn) {
      const p = state.products.find(x => x.id === deleteBtn.dataset.deleteProduct);
      if (p && confirm(`Hapus produk "${p.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
        deleteProduct(deleteBtn.dataset.deleteProduct);
        renderAdmin(); renderProductGrid();
        showToast('Produk dihapus.', 'info');
      }
    }
  });

  // Order filters (event delegation)
  document.getElementById('order-filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-order-filter]');
    if (!btn) return;
    uiState.orderFilter = btn.dataset.orderFilter;
    renderOrderFilters(); renderAdminOrderList();
  });

  // Order list actions (event delegation)
  document.getElementById('admin-order-list').addEventListener('click', e => {
    const viewBtn     = e.target.closest('[data-view-order]');
    const completeBtn = e.target.closest('[data-complete-order]');
    const revertBtn   = e.target.closest('[data-revert-order]');
    const deleteBtn   = e.target.closest('[data-delete-order]');

    if (viewBtn)     { openOrderModal(viewBtn.dataset.viewOrder); return; }
    if (completeBtn) { updateOrderStatus(completeBtn.dataset.completeOrder, 'Selesai');  renderAdmin(); showToast('Pesanan ditandai Selesai.'); return; }
    if (revertBtn)   { updateOrderStatus(revertBtn.dataset.revertOrder,   'Diproses'); renderAdmin(); showToast('Dikembalikan ke Diproses.', 'info'); return; }
    if (deleteBtn) {
      const o = state.orders.find(x => x.id === deleteBtn.dataset.deleteOrder);
      if (o && confirm(`Hapus pesanan ${o.orderNo}?`)) {
        deleteOrder(deleteBtn.dataset.deleteOrder);
        renderAdmin(); showToast('Pesanan dihapus.', 'info');
      }
    }
  });

  /* --- Chat Widget init --- */
  initChatWidget();

});

/* ============================================================
   BAGIAN 17 — AI AGENT CHAT WIDGET (REVISI v3)
   Arsitektur: getAgentReply(userText) → { text, html?, cards, quickReplies, action }
   Prinsip:
   • Tidak ada konfirmasi berlebihan — pilih ukuran = langsung tambah ke keranjang
   • Satu sumber kebenaran: semua logic di getAgentReply / chatSendMessage
   • Toleran terhadap typo & kalimat informal
   ============================================================ */

/* ----------------------------------------------------------
   (a) KONFIGURASI & FAQ
   ---------------------------------------------------------- */

/**
 * Data FAQ: keyword → jawaban teks.
 * Jawaban null = ditangani oleh intent handler khusus (size_guide).
 */
const AGENT_FAQ = [
  {
    keys: ['retur', 'return', 'kembali barang', 'tukar', 'kembalikan'],
    answer: '↩️ **Kebijakan Retur**\nKami menerima retur dalam **7 hari** setelah barang diterima, dengan syarat:\n• Kondisi sepatu masih baru & belum dipakai\n• Kemasan asli utuh\n\nHubungi CS kami untuk memproses retur.'
  },
  {
    keys: ['garansi', 'warranty'],
    answer: '🛡️ **Garansi Produk**\nSetiap produk bergaransi **3 bulan** untuk cacat bahan dari pabrik. Kerusakan akibat pemakaian normal tidak termasuk garansi.'
  },
  {
    keys: ['ongkos kirim', 'ongkir', 'biaya kirim', 'pengiriman', 'kirim'],
    answer: '🚚 **Info Pengiriman**\n• Ongkos kirim: **Rp20.000**\n• **GRATIS ongkir** untuk pembelian ≥ Rp1.000.000\n• Estimasi tiba: 2–5 hari kerja'
  },
  {
    keys: ['bayar', 'pembayaran', 'metode bayar', 'cara bayar', 'payment'],
    answer: '💳 **Metode Pembayaran**\n• Transfer Bank (BCA, Mandiri, BNI)\n• E-Wallet (GoPay, OVO, Dana, ShopeePay)\n• COD – Bayar di Tempat'
  },
  {
    keys: ['ukuran', 'size guide', 'panduan ukuran', 'ukuran sepatu', 'size'],
    answer: null // ditangani size_guide intent
  },
  {
    keys: ['kontak', 'hubungi', 'cs', 'customer service', 'whatsapp', 'wa', 'email'],
    answer: '📞 **Hubungi Kami**\n• WhatsApp: 0812-XXXX-XXXX *(placeholder)*\n• Email: cs@shoesales.id *(placeholder)*\n• Jam operasional: Senin–Sabtu 08.00–20.00 WIB'
  },
  {
    keys: ['lokasi', 'alamat toko', 'toko fisik', 'offline', 'toko'],
    answer: '📍 Saat ini kami beroperasi **100% online**. Pengiriman ke seluruh wilayah Indonesia.'
  },
  {
    keys: ['diskon', 'promo', 'voucher', 'kupon', 'sale', 'obral'],
    answer: '🏷️ Pantau halaman utama untuk promo terbaru! Saat ini belum ada kode voucher aktif. Ikuti media sosial kami untuk update promo.'
  },
  {
    keys: ['estimasi', 'lama kirim', 'berapa hari', 'kapan sampai'],
    answer: '📅 Estimasi pengiriman **2–5 hari kerja** setelah pembayaran dikonfirmasi.'
  },
  {
    keys: ['material', 'bahan', 'kualitas', 'original', 'asli', 'palsu'],
    answer: '✅ Semua produk kami adalah **100% original** dari brand resmi. Kualitas terjamin dan bahan pilihan.'
  },
];

/** Panduan ukuran: panjang kaki (cm) → EU & UK & US size */
const AGENT_SIZE_GUIDE = [
  { cm: 22.5, eu: 36, uk: 3.5, us: 4   },
  { cm: 23.0, eu: 37, uk: 4,   us: 5   },
  { cm: 23.5, eu: 37, uk: 4.5, us: 5.5 },
  { cm: 24.0, eu: 38, uk: 5,   us: 6   },
  { cm: 24.5, eu: 38, uk: 5.5, us: 6.5 },
  { cm: 25.0, eu: 39, uk: 6,   us: 7   },
  { cm: 25.5, eu: 40, uk: 6.5, us: 7.5 },
  { cm: 26.0, eu: 41, uk: 7,   us: 8   },
  { cm: 26.5, eu: 41, uk: 7.5, us: 8.5 },
  { cm: 27.0, eu: 42, uk: 8,   us: 9   },
  { cm: 27.5, eu: 43, uk: 8.5, us: 9.5 },
  { cm: 28.0, eu: 43, uk: 9,   us: 10  },
  { cm: 28.5, eu: 44, uk: 9.5, us: 10.5},
  { cm: 29.0, eu: 44, uk: 10,  us: 11  },
  { cm: 29.5, eu: 45, uk: 10.5,us: 11.5},
  { cm: 30.0, eu: 45, uk: 11,  us: 12  },
];

/* ----------------------------------------------------------
   (b) NORMALISASI TEKS & DETEKSI INTENT
   ---------------------------------------------------------- */

/**
 * Normalkan teks: lowercase, hapus tanda baca, ganti sinonim umum.
 * Toleran terhadap kalimat informal & typo umum.
 */
function agentNormalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()[\]]+/g, ' ')
    .replace(/\s+/g, ' ')
    // Sinonim sepatu
    .replace(/\bsepatu lari\b/g,       'running')
    .replace(/\bsepatu santai\b/g,     'casual')
    .replace(/\bsepatu kerja\b/g,      'formal')
    .replace(/\bsepatu kantor\b/g,     'formal')
    .replace(/\bsepatu resmi\b/g,      'formal')
    .replace(/\bsepatu olahraga\b/g,   'sneakers')
    .replace(/\bsepatu sport\b/g,      'sneakers')
    .replace(/\bsepatu jepit\b/g,      'sandal')
    .replace(/\bsandal gunung\b/g,     'sandal')
    .replace(/\bsneaker\b/g,           'sneakers')
    .replace(/\bsneaker s\b/g,         'sneakers')
    // Sinonim harga/budget
    .replace(/\bmurah(nya)?\b/g,       'budget rendah')
    .replace(/\bmahal(nya)?\b/g,       'budget tinggi')
    .replace(/\bterjangkau\b/g,        'budget rendah')
    .replace(/\bharga rendah\b/g,      'budget rendah')
    // Sinonim aksi belanja
    .replace(/\bpengen\b/g,            'mau')
    .replace(/\bingin\b/g,             'mau')
    .replace(/\bsaya mau\b/g,          'mau')
    .replace(/\bsaya ingin\b/g,        'mau')
    .replace(/\baku mau\b/g,           'mau')
    .replace(/\btolong\b/g,            '')
    .replace(/\bplease\b/g,            '')
    .replace(/\bdong\b/g,              '')
    .replace(/\bnih\b/g,               '')
    .replace(/\byuk\b/g,               '')
    .replace(/\bkak\b/g,               '')
    .replace(/\bmin\b/g,               '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deteksi intent — urutan dari yang paling spesifik ke paling umum.
 * @param {string} norm  teks ternormalisasi
 * @returns {string}
 */
function agentDetectIntent(norm) {
  // ── 1. Konfirmasi eksplisit ─────────────────────────────────────────
  if (/^(ya|iya|ok|oke|yes|yep|setuju|boleh|bisa|lanjut|jadi|deal|tentu)$/.test(norm))    return 'confirm_yes';
  if (/^(tidak|gak|nggak|ngga|no|nope|batal|cancel|jangan|ga|skip|lewat)$/.test(norm))    return 'confirm_no';

  // ── 2. Sapaan ───────────────────────────────────────────────────────
  if (/^(hai|halo|hallo|hi|hello|hey|hei|permisi|assalam|pagi|siang|sore|malam|p+|h+)/.test(norm) ||
      /\b(apa kabar|bisa bantu|bantuan|help|ada yang bisa|gimana caranya mulai)\b/.test(norm)) {
    return 'greeting';
  }

  // ── 3. Status pesanan ───────────────────────────────────────────────
  if (/ss-\d{4,}/i.test(norm) ||
      /\b(nomor pesanan|cek pesanan|status pesanan|status order|lacak|tracking|order saya|pesanan ku|resi|pesanan aku)\b/.test(norm)) {
    return 'order_status';
  }
  // "pesanan saya" sendiri → lihat daftar pesanan
  if (/\b(pesanan saya|daftar pesanan|lihat pesanan|riwayat pesanan)\b/.test(norm)) {
    return 'order_status';
  }

  // ── 4. Panduan ukuran ───────────────────────────────────────────────
  if (/\b\d{2}[.,]?\d?\s*cm\b/.test(norm) ||
      /\b(panduan ukuran|size guide|size chart|panjang kaki|ukuran kaki|eu berapa|ukuran apa|mau tahu ukuran|cari ukuran|tabel ukuran|konversi ukuran)\b/.test(norm)) {
    return 'size_guide';
  }

  // ── 5. Lihat isi keranjang ──────────────────────────────────────────
  if (/\b(keranjang saya|isi keranjang|cek keranjang|lihat keranjang|cart saya|barang di keranjang|apa saja di keranjang)\b/.test(norm)) {
    return 'cart_view';
  }

  // ── 6. Cara checkout / cara beli ────────────────────────────────────
  if (/\b(cara checkout|cara beli|cara pesan|cara order|langkah pembelian|proses beli|proses checkout|gimana beli|gimana pesan|bagaimana beli)\b/.test(norm)) {
    return 'checkout_info';
  }

  // ── 7. Cek stok / harga ─────────────────────────────────────────────
  if (/\b(stok|masih ada|habis kah|harga berapa|berapa harga|harganya|stoknya|ada nggak|ada tidak|tersedia tidak)\b/.test(norm)) {
    return 'stock_price';
  }

  // ── 8. Produk kurasi ────────────────────────────────────────────────
  if (/\b(termurah|paling murah|budget rendah|harga paling|terlaris|best seller|paling laku|terpopuler|populer|paling hits|termahal|paling mahal|premium|terbaru|new arrival|produk baru)\b/.test(norm)) {
    return 'curated';
  }

  // ── 9. Aksi tambah ke keranjang ─────────────────────────────────────
  // (setelah cek stok agar "ada stoknya, mau beli" tidak salah)
  if (/\b(tambah ke keranjang|add to cart|masukkan keranjang|mau beli|mau pesan|mau order|beli sekarang|tambahkan ke keranjang)\b/.test(norm)) {
    return 'cart_action';
  }

  // ── 10. Rekomendasi / cari produk ───────────────────────────────────
  // Sengaja ditempatkan setelah intent spesifik
  if (/\b(rekomendasi|rekomen|rekomendasikan|saran|sarankan|cari|tampilkan|ada produk|produk apa|mau lihat|pengen lihat|sepatu|sneakers|running|formal|casual|sandal|merek|brand|koleksi)\b/.test(norm) ||
      agentExtractBrand(norm) != null ||
      agentExtractCategory(norm) != null) {
    return 'recommend';
  }

  // ── 11. FAQ ─────────────────────────────────────────────────────────
  for (const faq of AGENT_FAQ) {
    if (faq.keys.some(k => norm.includes(k))) return 'faq';
  }

  return 'unknown';
}

/* ----------------------------------------------------------
   (c) EKSTRAKSI ENTITAS
   ---------------------------------------------------------- */

/** Kategori produk dari teks. */
function agentExtractCategory(norm) {
  const cats = ['sneakers', 'running', 'formal', 'casual', 'sandal'];
  return cats.find(c => norm.includes(c)) || null;
}

/** Merek dari katalog produk. Terpanjang dulu agar "new balance" menang atas "new". */
function agentExtractBrand(norm) {
  if (!state || !state.products) return null;
  const brands = [...new Set(state.products.map(p => p.brand.toLowerCase()))];
  brands.sort((a, b) => b.length - a.length);
  return brands.find(b => norm.includes(b)) || null;
}

/**
 * Budget maksimum dari teks.
 * Contoh: "500rb" → 500000, "1.5 juta" → 1500000, "800000" → 800000
 */
function agentExtractBudget(norm) {
  const m1 = norm.match(/(\d[\d.,]*)\s*(rb|ribu)/);
  if (m1) return parseFloat(m1[1].replace(/[.,]/g, '')) * 1000;
  const m2 = norm.match(/(\d[\d.,]*)\s*(juta|jt\b)/);
  if (m2) return parseFloat(m2[1].replace(/[.,]/g, '')) * 1_000_000;
  const m3 = norm.match(/\b(\d{5,})\b/);
  if (m3) return parseInt(m3[1]);
  return null;
}

/**
 * Ukuran EU dari teks.
 * "EU 40", "size 40", "40", "26 cm" → angka EU.
 */
function agentExtractSize(norm) {
  const m = norm.match(/\b(?:eu|size|ukuran)?\s*([3-4][0-9])\b/);
  if (m) {
    const n = parseInt(m[1]);
    if (n >= 36 && n <= 45) return n;
  }
  const cmMatch = norm.match(/\b(\d{2}(?:[.,]\d)?)\s*cm\b/);
  if (cmMatch) {
    const val = parseFloat(cmMatch[1].replace(',', '.'));
    const entry = AGENT_SIZE_GUIDE.reduce((prev, cur) =>
      Math.abs(cur.cm - val) < Math.abs(prev.cm - val) ? cur : prev
    );
    return entry.eu;
  }
  return null;
}

/** Nomor pesanan (SS-XXXXXX). */
function agentExtractOrderNo(text) {
  const m = text.toUpperCase().match(/SS-\d{4,}/);
  return m ? m[0] : null;
}

/**
 * Cari produk berdasarkan nama — tiap kata keyword harus muncul di nama produk.
 * @param {string} norm
 * @returns {object[]}
 */
function agentSearchByName(norm) {
  const stopWords = new Set([
    'ada','cari','mau','minta','tampilkan','lihat','produk','sepatu',
    'yang','saya','aku','ini','itu','dong','nih','kak','min','tolong','please'
  ]);
  const words = norm.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
  if (words.length === 0) return [];
  return state.products.filter(p => {
    const nameLow = p.name.toLowerCase();
    return words.some(w => nameLow.includes(w));
  });
}

/* ----------------------------------------------------------
   (d) PEMBANGUN RESPONS PER INTENT
   ---------------------------------------------------------- */

/** Salam pembuka — tampilkan jumlah produk tersedia. */
function agentReplyGreeting() {
  const count = state.products.filter(p => p.stock > 0).length;
  return {
    text: `Halo! 👋 Selamat datang di **Shoe Sales**.\nAda **${count} produk** siap kirim untukmu sekarang.\n\nMau cari apa hari ini?`,
    quickReplies: ['Lihat semua produk', 'Sneakers', 'Running', 'Panduan ukuran', 'Cek pesanan saya'],
  };
}

/**
 * Tampilkan produk berdasarkan filter (kategori, merek, nama, budget).
 * Semua produk ditampilkan (termasuk habis stok, dengan badge jelas).
 */
function agentReplyRecommend(norm, ctx) {
  const category = agentExtractCategory(norm);
  const brand    = agentExtractBrand(norm);
  const budget   = agentExtractBudget(norm);

  if (category) ctx.category = category;
  if (brand)    ctx.brand    = brand;
  if (budget)   ctx.budget   = budget;

  // Reset semua filter jika minta "semua produk"
  if (/\b(semua produk|semua|all|lihat semua|tampilkan semua)\b/.test(norm)) {
    ctx.category = null; ctx.brand = null; ctx.budget = null;
  }

  let products = state.products.slice();

  // Cari berdasarkan nama dulu (lebih spesifik)
  const byName = agentSearchByName(norm);
  if (byName.length > 0 && !category && !brand) {
    products = byName;
  } else {
    if (ctx.category) products = products.filter(p => p.category.toLowerCase() === ctx.category);
    if (ctx.brand)    products = products.filter(p => p.brand.toLowerCase() === ctx.brand);
    if (ctx.budget)   products = products.filter(p => p.price <= ctx.budget);
  }

  // Tersedia dulu, lalu terbaru
  products = products
    .sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0) || (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 6);

  if (products.length === 0) {
    const avail = state.products.filter(p => p.stock > 0).slice(0, 4);
    return {
      text: 'Maaf, tidak ada produk sesuai kriteria itu. Ini beberapa pilihan yang tersedia:',
      cards: avail,
      quickReplies: ['Sneakers', 'Running', 'Casual', 'Panduan ukuran'],
    };
  }

  const labels = [
    ctx.category && ctx.category,
    ctx.brand    && ctx.brand,
    ctx.budget   && `≤ ${formatRp(ctx.budget)}`,
  ].filter(Boolean);
  const filterText = labels.length ? ` — ${labels.join(', ')}` : '';
  const habis = products.filter(p => p.stock <= 0).length;
  const habisNote = habis > 0 ? ` *(${habis} habis stok)*` : '';

  return {
    text: `**${products.length} produk**${filterText}${habisNote} 👇\nKlik kartu untuk detail & pilih ukuran.`,
    cards: products,
    quickReplies: ['Lihat semua produk', 'Panduan ukuran', 'Info pengiriman'],
  };
}

/** Produk kurasi: termurah, termahal, terlaris, terbaru. */
function agentReplyCurated(norm) {
  let products = state.products.filter(p => p.stock > 0);
  let label = '';

  if (/\b(termurah|paling murah|budget rendah|harga paling)\b/.test(norm)) {
    products = products.sort((a, b) => a.price - b.price).slice(0, 4);
    label = 'Harga Termurah 💰';
  } else if (/\b(termahal|paling mahal|premium)\b/.test(norm)) {
    products = products.sort((a, b) => b.price - a.price).slice(0, 4);
    label = 'Harga Termahal 👑';
  } else if (/\b(terlaris|best seller|paling laku|terpopuler|populer|paling hits)\b/.test(norm)) {
    products = products.sort((a, b) => a.stock - b.stock).slice(0, 4);
    label = 'Terlaris 🔥';
  } else if (/\b(terbaru|new arrival|produk baru|paling baru)\b/.test(norm)) {
    products = products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 4);
    label = 'Produk Terbaru ✨';
  } else {
    products = products.slice(0, 4);
    label = 'Pilihan Untukmu';
  }

  return {
    text: `**${label}** — ${products.length} pilihan:`,
    cards: products,
    quickReplies: ['Produk termurah', 'Produk terlaris', 'Produk terbaru', 'Panduan ukuran'],
  };
}

/** Info stok & harga spesifik produk. */
function agentReplyStockPrice(norm, ctx) {
  const brand    = agentExtractBrand(norm)    || ctx.brand;
  const category = agentExtractCategory(norm) || ctx.category;

  // Produk aktif di konteks
  if (ctx.productId && !brand && !category) {
    const p = state.products.find(x => x.id === ctx.productId);
    if (p) {
      return {
        text: `Info produk **${p.name}**:`,
        cards: [p],
        quickReplies: p.stock > 0
          ? ['Tambah ke keranjang', 'Info pengiriman']
          : ['Cari produk lain', 'Sneakers', 'Running'],
      };
    }
  }

  // Cari dari nama
  const byName = agentSearchByName(norm);
  let products = byName.length > 0 ? byName : state.products.slice();
  if (brand)    products = products.filter(p => p.brand.toLowerCase() === brand);
  if (category) products = products.filter(p => p.category.toLowerCase() === category);

  if (products.length === 0) {
    return {
      text: 'Produk tidak ditemukan. Coba ketik nama atau merek, atau pilih kategori:',
      quickReplies: ['Sneakers', 'Running', 'Formal', 'Casual', 'Sandal'],
    };
  }
  return {
    text: `Info stok & harga${brand ? ` **${brand}**` : ''}:`,
    cards: products.slice(0, 4),
    quickReplies: ['Tambah ke keranjang', 'Lihat semua produk'],
  };
}

/**
 * Panduan ukuran — tabel HTML lengkap atau rekomendasi langsung jika ada cm.
 */
function agentReplySizeGuide(norm) {
  // Ada angka cm → rekomendasikan langsung
  const cmMatch = norm.match(/\b(\d{2}(?:[.,]\d)?)\s*cm\b/);
  if (cmMatch) {
    const cm = parseFloat(cmMatch[1].replace(',', '.'));
    if (cm >= 22 && cm <= 31) {
      const entry = AGENT_SIZE_GUIDE.reduce((prev, cur) =>
        Math.abs(cur.cm - cm) < Math.abs(prev.cm - cm) ? cur : prev
      );
      return {
        text: null,
        html: `<div class="chat-bubble-bot">
          <p style="margin:0 0 6px">Panjang kaki <strong>${cm} cm</strong> → ukuran yang cocok:</p>
          <table class="chat-size-table">
            <tr><th>EU</th><th>UK</th><th>US</th><th>Panjang Kaki</th></tr>
            <tr>
              <td><strong style="color:#2563eb;font-size:1.05em">EU ${entry.eu}</strong></td>
              <td>UK ${entry.uk}</td><td>US ${entry.us}</td><td>${entry.cm} cm</td>
            </tr>
          </table>
          <p style="margin:6px 0 0;font-size:0.75rem;color:#6b7280">💡 Kalau ragu antara 2 ukuran, pilih yang <strong>lebih besar</strong>.</p>
        </div>`,
        quickReplies: [`Cari EU ${entry.eu}`, 'Lihat produk', 'Info pengiriman'],
      };
    }
  }

  // Ada angka EU di teks (misal "ukuran 40", "eu 41")
  const euDirect = agentExtractSize(norm);
  if (euDirect && !cmMatch) {
    const entry = AGENT_SIZE_GUIDE.find(e => e.eu === euDirect) ||
                  AGENT_SIZE_GUIDE[Math.floor(AGENT_SIZE_GUIDE.length / 2)];
    return {
      text: null,
      html: `<div class="chat-bubble-bot">
        <p style="margin:0 0 6px">Ukuran <strong>EU ${euDirect}</strong> setara dengan:</p>
        <table class="chat-size-table">
          <tr><th>EU</th><th>UK</th><th>US</th><th>Panjang Kaki</th></tr>
          <tr><td><strong>EU ${entry.eu}</strong></td><td>${entry.uk}</td><td>${entry.us}</td><td>~${entry.cm} cm</td></tr>
        </table>
      </div>`,
      quickReplies: [`Cari EU ${euDirect}`, 'Lihat tabel lengkap', 'Lihat produk'],
    };
  }

  // Tampilkan tabel lengkap
  const rows = AGENT_SIZE_GUIDE.map(e =>
    `<tr><td><strong>${e.eu}</strong></td><td>${e.uk}</td><td>${e.us}</td><td>${e.cm} cm</td></tr>`
  ).join('');
  return {
    text: null,
    html: `<div class="chat-bubble-bot">
      <p style="margin:0 0 6px;font-weight:700">📏 Panduan Ukuran Sepatu</p>
      <table class="chat-size-table">
        <tr><th>EU</th><th>UK</th><th>US</th><th>Panjang Kaki</th></tr>
        ${rows}
      </table>
      <p style="margin:8px 0 0;font-size:0.75rem;color:#6b7280">Ketik panjang kakimu misal <strong>"26 cm"</strong> untuk rekomendasi tepat.</p>
    </div>`,
    quickReplies: ['25 cm', '26 cm', '27 cm', '28 cm', 'Lihat produk'],
  };
}

/** Cara checkout / langkah belanja. */
function agentReplyCheckoutInfo() {
  return {
    text: null,
    html: `<div class="chat-bubble-bot">
      <p style="margin:0 0 8px;font-weight:700">🛒 Cara Belanja di Shoe Sales</p>
      <ol style="margin:0;padding-left:1.2rem;font-size:0.8rem;line-height:1.9">
        <li>Pilih produk di katalog atau lewat chat</li>
        <li>Klik kartu produk → pilih <strong>ukuran &amp; jumlah</strong></li>
        <li>Klik <strong>🛒 Keranjang</strong> (atau Beli Sekarang)</li>
        <li>Buka ikon keranjang di header → klik <strong>Checkout</strong></li>
        <li>Isi nama, nomor HP, alamat</li>
        <li>Pilih metode pembayaran → <strong>Buat Pesanan</strong> 🎉</li>
      </ol>
    </div>`,
    quickReplies: ['Lihat produk', 'Info pengiriman', 'Info pembayaran'],
  };
}

/** Tampilkan isi keranjang saat ini. */
function agentReplyCartView() {
  if (state.cart.length === 0) {
    return {
      text: '🛒 Keranjangmu masih kosong. Yuk mulai belanja!',
      quickReplies: ['Sneakers', 'Running', 'Casual', 'Lihat semua produk'],
    };
  }
  const { shipping, total } = cartTotals();
  const rows = state.cart.map(item => {
    const p    = state.products.find(x => x.id === item.productId);
    const name = p ? p.name : item.name || 'Produk';
    return `<div class="chat-cart-row">
      <span>${escHtml(name)} EU ${item.size} ×${item.qty}</span>
      <span>${formatRp(item.price * item.qty)}</span>
    </div>`;
  }).join('');
  const shipLabel = shipping === 0 ? '🎉 GRATIS' : formatRp(shipping);
  return {
    text: null,
    html: `<div class="chat-bubble-bot">
      <p style="margin:0 0 6px;font-weight:700">🛒 Keranjangmu (${state.cart.length} item)</p>
      ${rows}
      <div class="chat-cart-row" style="color:#6b7280"><span>Ongkos kirim</span><span>${shipLabel}</span></div>
      <div class="chat-cart-total"><span>Total</span><span>${formatRp(total)}</span></div>
    </div>`,
    quickReplies: ['Checkout sekarang', 'Lanjut belanja', 'Hapus keranjang'],
  };
}

/**
 * Status pesanan — cek berdasarkan nomor atau tampilkan daftar terakhir.
 * Privasi: tidak tampilkan nama/alamat/nomor telepon.
 */
function agentReplyOrderStatus(text) {
  const orderNo = agentExtractOrderNo(text);

  if (!orderNo) {
    if (state.orders.length > 0) {
      const recent = state.orders.slice(-3).reverse();
      const rows = recent.map(o =>
        `<div class="chat-cart-row">
          <span>${escHtml(o.orderNo)}</span>
          <span>${o.status === 'Selesai' ? '✅' : '🔄'} ${escHtml(o.status)}</span>
        </div>`
      ).join('');
      return {
        text: null,
        html: `<div class="chat-bubble-bot">
          <p style="margin:0 0 6px;font-weight:700">📋 Pesanan Terakhir</p>
          ${rows}
          <p style="margin:6px 0 0;font-size:0.75rem;color:#6b7280">Ketik nomor pesanan untuk detail lengkap.</p>
        </div>`,
        quickReplies: ['Lihat Pesanan Saya', ...recent.map(o => o.orderNo).slice(0, 2)],
      };
    }
    return {
      text: 'Belum ada pesanan. Yuk mulai belanja dan dapatkan pengiriman cepat! 🚀',
      quickReplies: ['Lihat produk', 'Cara checkout'],
    };
  }

  const order = state.orders.find(o => o.orderNo === orderNo);
  if (!order) {
    return {
      text: `Nomor pesanan **${orderNo}** tidak ditemukan.\nPastikan formatnya benar, contoh: SS-123456.`,
      quickReplies: ['Lihat Pesanan Saya'],
    };
  }

  const itemRows = order.items.map(i =>
    `<div class="chat-cart-row">
      <span>${escHtml(i.name)} EU ${i.size} ×${i.qty}</span>
      <span>${formatRp((i.price || 0) * i.qty)}</span>
    </div>`
  ).join('');
  const statusIcon  = order.status === 'Selesai' ? '✅' : '🔄';
  const statusColor = order.status === 'Selesai' ? '#16a34a' : '#ea580c';

  return {
    text: null,
    html: `<div class="chat-bubble-bot">
      <p style="margin:0 0 2px;font-weight:700">📦 ${escHtml(order.orderNo)}</p>
      <p style="margin:0 0 8px;font-size:0.78rem;color:${statusColor};font-weight:600">${statusIcon} ${escHtml(order.status)}</p>
      ${itemRows}
      <div class="chat-cart-total"><span>Total</span><span>${formatRp(order.total)}</span></div>
      <p style="margin:6px 0 0;font-size:0.72rem;color:#6b7280">Metode pembayaran: ${escHtml(order.payment || '-')}</p>
    </div>`,
    quickReplies: ['Lihat Pesanan Saya', 'Lanjut belanja'],
  };
}

/**
 * Tampilkan picker ukuran untuk produk dalam konteks.
 * Setelah ukuran dipilih → tampilkan panel aksi (Tambah ke Keranjang / Beli Sekarang).
 */
function agentReplyCartAction(norm, ctx) {
  // Cek ukuran di pesan — jika ada dan ada produk, tampilkan panel aksi
  const sizeInMsg = agentExtractSize(norm);

  if (ctx.productId) {
    const p = state.products.find(x => x.id === ctx.productId);
    if (p) {
      if (p.stock <= 0) {
        return {
          text: `Maaf, **${p.name}** habis stok. Mau lihat yang lain?`,
          quickReplies: ['Sneakers', 'Running', 'Casual', 'Lihat semua produk'],
        };
      }
      // Jika ukuran sudah ada di pesan → tampilkan panel aksi (Tambah / Beli)
      if (sizeInMsg) {
        ctx.size = sizeInMsg;
        return {
          text: null,
          html: chatActionPanelHtml(p, sizeInMsg),
          quickReplies: [],
          action: { type: 'await_action', productId: p.id, size: sizeInMsg },
        };
      }
      // Belum ada ukuran → tampilkan picker ukuran
      return agentShowSizePicker(p);
    }
  }

  // Tidak ada produk dalam konteks → minta pilih produk
  return {
    text: 'Produk mana yang ingin ditambahkan ke keranjang?\nKlik kartu produk terlebih dahulu, atau ketik nama/kategori:',
    quickReplies: ['Sneakers', 'Running', 'Formal', 'Casual', 'Sandal'],
  };
}

/**
 * Tampilkan picker ukuran EU 36–45 sebagai tombol inline di bubble.
 * Klik tombol = tampilkan panel aksi (Tambah ke Keranjang / Beli Sekarang).
 * @param {object} p - produk
 */
function agentShowSizePicker(p) {
  const btns = [36,37,38,39,40,41,42,43,44,45].map(s =>
    `<button class="chat-size-pill"
       data-chat-size="${s}" data-product-id="${escHtml(p.id)}"
       style="padding:5px 11px;border:1.5px solid #d1d5db;border-radius:8px;
              background:#fff;font-size:0.8rem;font-weight:600;cursor:pointer;
              transition:all 120ms;min-width:46px"
       onmouseover="this.style.background='#2563eb';this.style.borderColor='#2563eb';this.style.color='#fff'"
       onmouseout="this.style.background='#fff';this.style.borderColor='#d1d5db';this.style.color=''">
      EU ${s}
    </button>`
  ).join('');

  return {
    text: null,
    html: `<div class="chat-bubble-bot">
      <p style="margin:0 0 6px">Pilih ukuran untuk <strong>${escHtml(p.name)}</strong>
        <span style="font-size:0.78rem;color:#6b7280;font-weight:400"> — lalu pilih aksi</span>
      </p>
      <p style="font-size:0.78rem;color:#2563eb;font-weight:600;margin:0 0 8px">${formatRp(p.price)} · Stok: ${p.stock}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${btns}</div>
      <p style="margin:8px 0 0;font-size:0.72rem;color:#6b7280">Atau ketik ukuran, misal: <strong>EU 40</strong> atau <strong>40</strong></p>
    </div>`,
    quickReplies: [],
    action: { type: 'await_size', productId: p.id },
  };
}

/**
 * Render panel aksi dua tombol (Tambah ke Keranjang + Beli Sekarang)
 * setelah ukuran dipilih. Dipanggil dari chatShowActionPanel().
 * @param {object} p    - produk
 * @param {number} size - EU size
 * @returns {string} HTML bubble
 */
function chatActionPanelHtml(p, size) {
  return `<div class="chat-bubble-bot">
    <p style="margin:0 0 4px;font-size:0.82rem">
      <strong>${escHtml(p.name)}</strong> · EU ${size}
      <span style="color:#2563eb;font-weight:700"> ${formatRp(p.price)}</span>
    </p>
    <p style="margin:0 0 8px;font-size:0.78rem;color:#6b7280">Pilih aksi untuk produk ini:</p>
    <div class="chat-action-btns">
      <button class="chat-action-btn cart"
        data-chat-action="add_cart"
        data-product-id="${escHtml(p.id)}"
        data-size="${size}">🛒 Tambah ke Keranjang</button>
      <button class="chat-action-btn buy"
        data-chat-action="buy_now"
        data-product-id="${escHtml(p.id)}"
        data-size="${size}">⚡ Beli Sekarang</button>
    </div>
  </div>`;
}

/** FAQ. */
function agentReplyFaq(norm) {
  for (const faq of AGENT_FAQ) {
    if (faq.keys.some(k => norm.includes(k))) {
      if (!faq.answer) return agentReplySizeGuide(norm);
      return {
        text: faq.answer,
        quickReplies: ['Lihat produk', 'Info pengiriman', 'Cara checkout'],
      };
    }
  }
  return agentReplyUnknown();
}

/** Fallback — semakin gagal semakin arahkan ke CS. */
function agentReplyUnknown(failCount = 0) {
  if (failCount >= 2) {
    return {
      text: 'Hmm, aku belum paham maksudmu. 😅\n\n**Butuh bantuan langsung?**\n📱 WA: 0812-XXXX-XXXX *(placeholder)*\n📧 cs@shoesales.id *(placeholder)*',
      quickReplies: ['Lihat produk', 'Cara checkout', 'Panduan ukuran'],
    };
  }
  return {
    text: 'Maaf, aku kurang paham. Coba pilih topik di bawah ini:',
    quickReplies: ['Lihat produk', 'Cek pesanan saya', 'Panduan ukuran', 'Info pengiriman', 'Cara checkout'],
  };
}

/* ----------------------------------------------------------
   (e) CONVERSATION STATE & getAgentReply()
   ---------------------------------------------------------- */

let agentCtx = {
  productId:     null,
  category:      null,
  brand:         null,
  budget:        null,
  size:          null,
  pendingAction: null,  // { type: 'await_size', productId }
  failCount:     0,
};

/**
 * Fungsi utama agent.
 * TODO (future LLM): ganti isi fungsi ini dengan panggilan ke LLM API:
 *   const res = await fetch('https://api.example.com/v1/chat', {
 *     method: 'POST',
 *     headers: { 'Authorization': 'Bearer YOUR_KEY', 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ message: userText, context: agentCtx, products: state.products })
 *   });
 *   return await res.json();
 *
 * @param {string} userText
 * @returns {{ text:string|null, html?:string|null, cards?:object[], quickReplies?:string[], action?:object }}
 */
function getAgentReply(userText) {
  const norm   = agentNormalize(userText);
  const intent = agentDetectIntent(norm);

  // ── Cek apakah sedang menunggu pilihan ukuran ──────────────────────
  if (agentCtx.pendingAction && agentCtx.pendingAction.type === 'await_size') {
    const pa = agentCtx.pendingAction;

    // Ada ukuran di pesan → tampilkan panel aksi (Tambah / Beli)
    const sizeNow = agentExtractSize(norm);
    if (sizeNow) {
      agentCtx.pendingAction = null;
      agentCtx.size = sizeNow;
      const p = state.products.find(x => x.id === pa.productId);
      if (p && p.stock > 0) {
        agentCtx.failCount = 0;
        // Kembalikan panel aksi dua tombol
        return {
          text: null,
          html: chatActionPanelHtml(p, sizeNow),
          quickReplies: [],
          action: { type: 'await_action', productId: p.id, size: sizeNow },
        };
      }
      if (p && p.stock <= 0) {
        return {
          text: `Maaf, **${p.name}** habis stok.`,
          quickReplies: ['Lihat produk lain', 'Sneakers', 'Running'],
        };
      }
    }

    // Tidak ada ukuran — jika intent "tidak/batal" → batalkan
    if (intent === 'confirm_no') {
      agentCtx.pendingAction = null;
      return {
        text: 'Oke, batal. Ada yang bisa aku bantu?',
        quickReplies: ['Lihat produk', 'Cek pesanan saya', 'Panduan ukuran'],
      };
    }

    // Intent lain yang jelas → lepas pending, proses normal
    if (!['unknown'].includes(intent)) {
      agentCtx.pendingAction = null;
    } else {
      // Intent unknown, masih waiting size → ingatkan
      return {
        text: 'Ketik ukuran EU yang kamu inginkan (36–45), atau klik tombol di atas.',
        quickReplies: ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43'],
      };
    }
  }

  // ── Handle angka EU yang diketik langsung ──────────────────────────
  // Format: "eu 40", "40", "size 40" — TANPA ada di tengah kalimat panjang
  const euMatch = norm.match(/^(?:eu\s*|size\s*|ukuran\s*)?([3-4][0-9])$/);
  if (euMatch) {
    const size = parseInt(euMatch[1]);
    if (size >= 36 && size <= 45 && agentCtx.productId) {
      const p = state.products.find(x => x.id === agentCtx.productId);
      if (p && p.stock > 0) {
        agentCtx.pendingAction = null;
        agentCtx.size = size;
        agentCtx.failCount = 0;
        // Tampilkan panel aksi dua tombol, bukan langsung addToCart
        return {
          text: null,
          html: chatActionPanelHtml(p, size),
          quickReplies: [],
          action: { type: 'await_action', productId: p.id, size },
        };
      }
      if (p && p.stock <= 0) {
        return {
          text: `Maaf, **${p.name}** habis stok.`,
          quickReplies: ['Lihat produk lain', 'Sneakers', 'Running'],
        };
      }
    }
    // Ada ukuran tapi tidak ada produk konteks → simpan ukuran, minta pilih produk
    if (size >= 36 && size <= 45) {
      agentCtx.size = size;
      return {
        text: `Ukuran EU ${size} dicatat! Produk mana yang mau ditambahkan?`,
        quickReplies: ['Sneakers', 'Running', 'Casual', 'Lihat semua produk'],
      };
    }
  }

  // ── Dispatch ke handler intent ─────────────────────────────────────
  let reply;
  switch (intent) {
    case 'greeting':      reply = agentReplyGreeting();                    break;
    case 'recommend':     reply = agentReplyRecommend(norm, agentCtx);     break;
    case 'curated':       reply = agentReplyCurated(norm);                 break;
    case 'stock_price':   reply = agentReplyStockPrice(norm, agentCtx);    break;
    case 'size_guide':    reply = agentReplySizeGuide(norm);               break;
    case 'checkout_info': reply = agentReplyCheckoutInfo();                break;
    case 'cart_view':     reply = agentReplyCartView();                    break;
    case 'order_status':  reply = agentReplyOrderStatus(userText);         break;
    case 'cart_action':   reply = agentReplyCartAction(norm, agentCtx);    break;
    case 'faq':           reply = agentReplyFaq(norm);                     break;
    case 'confirm_yes':
    case 'confirm_no':
      reply = { text: 'Ada yang bisa aku bantu lagi?',
                quickReplies: ['Lihat produk', 'Cek pesanan saya', 'Panduan ukuran'] };
      break;
    default:
      agentCtx.failCount++;
      reply = agentReplyUnknown(agentCtx.failCount);
      break;
  }

  if (intent !== 'unknown') agentCtx.failCount = 0;

  // Simpan pending action dari reply
  if (reply.action && (reply.action.type === 'await_size' || reply.action.type === 'await_action')) {
    agentCtx.pendingAction = reply.action;
    if (reply.action.productId) agentCtx.productId = reply.action.productId;
    if (reply.action.size)      agentCtx.size      = reply.action.size;
  } else if (reply.action && reply.action.type === 'cart_added') {
    // tidak disimpan ke pending
    agentCtx.pendingAction = null;
  } else {
    // clear pending jika intent baru yang berbeda
    if (intent !== 'unknown' && intent !== 'confirm_yes' && intent !== 'confirm_no') {
      agentCtx.pendingAction = null;
    }
  }

  return reply;
}

/* ----------------------------------------------------------
   (f) UI RENDER FUNCTIONS
   ---------------------------------------------------------- */

const CHAT_MAX_MESSAGES = 50;
const CHAT_LS_KEY = 'ss_chat';

function chatLoadHistory() {
  try { return JSON.parse(localStorage.getItem(CHAT_LS_KEY) || '[]'); }
  catch { return []; }
}

function chatSaveHistory(messages) {
  try { localStorage.setItem(CHAT_LS_KEY, JSON.stringify(messages.slice(-CHAT_MAX_MESSAGES))); }
  catch { /* ignore */ }
}

let chatState = {
  open:     false,
  messages: chatLoadHistory(),
  visible:  true,
};

/** Tampilkan/sembunyikan FAB dan panel. Dipanggil dari switchView(). */
function chatSetVisible(visible) {
  chatState.visible = visible;
  const fab = document.getElementById('chat-fab');
  if (!fab) return;
  if (visible) {
    fab.classList.remove('hidden');
  } else {
    fab.classList.add('hidden');
    if (chatState.open) chatClose();
  }
}

function chatOpen() {
  chatState.open = true;
  const panel = document.getElementById('chat-panel');
  const fab   = document.getElementById('chat-fab');
  panel.classList.remove('hidden');
  document.getElementById('chat-fab-icon-open')?.classList.add('hidden');
  document.getElementById('chat-fab-icon-close')?.classList.remove('hidden');
  document.getElementById('chat-unread-badge')?.classList.add('hidden');
  fab.setAttribute('aria-label', 'Tutup asisten');

  if (chatState.messages.length === 0) {
    const w = agentReplyGreeting();
    chatAppendMessage('bot', w.text, null, null, w.quickReplies);
  } else {
    chatRenderAllMessages();
    chatRenderQuickReplies([]);
  }
  setTimeout(() => document.getElementById('chat-input')?.focus(), 60);
}

function chatClose() {
  chatState.open = false;
  document.getElementById('chat-panel')?.classList.add('hidden');
  document.getElementById('chat-fab-icon-open')?.classList.remove('hidden');
  document.getElementById('chat-fab-icon-close')?.classList.add('hidden');
  document.getElementById('chat-fab')?.setAttribute('aria-label', 'Buka asisten Shoe Sales');
}

function chatShowTyping() {
  document.getElementById('chat-typing')?.classList.remove('hidden');
  chatScrollToBottom();
}
function chatHideTyping() {
  document.getElementById('chat-typing')?.classList.add('hidden');
}
function chatScrollToBottom() {
  const el = document.getElementById('chat-messages');
  if (el) el.scrollTop = el.scrollHeight;
}

/**
 * Tampilkan detail produk inline di dalam chat (tidak membuka modal utama).
 * Menyertakan gambar/emoji, info, picker ukuran, lalu panel aksi.
 * @param {string} productId
 */
function chatShowProductDetail(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;

  // Tandai card yang dipilih, hapus tanda dari card lain
  document.querySelectorAll('#chat-messages [data-chat-product]').forEach(el => {
    el.classList.toggle('selected', el.dataset.chatProduct === productId);
  });

  // Simpan produk ke konteks
  agentCtx.productId = productId;
  agentCtx.size      = null;
  agentCtx.pendingAction = null;

  const idx      = state.products.findIndex(x => x.id === p.id);
  const color    = PRODUCT_COLORS[Math.max(0, idx) % PRODUCT_COLORS.length];
  const badgeCls = p.stock > 5 ? 'avail' : p.stock > 0 ? 'low' : 'empty';
  const s        = stockInfo(p.stock);
  const thumbHtml = p.image
    ? `<img src="${escHtml(p.image)}" alt="${escHtml(p.name)}"
           style="width:100%;height:100%;object-fit:cover;border-radius:0.5rem">`
    : `<div style="width:100%;height:100px;border-radius:0.5rem;background:${color};
           display:flex;align-items:center;justify-content:center;font-size:2.8rem">👟</div>`;

  // Jika stok habis — tampilkan info saja tanpa size picker
  if (p.stock <= 0) {
    chatAppendMessage('bot', null,
      `<div class="chat-bubble-bot">
        ${thumbHtml}
        <p style="margin:8px 0 2px;font-weight:700;font-size:0.9rem">${escHtml(p.name)}</p>
        <p style="margin:0 0 4px;font-size:0.75rem;color:#6b7280">${escHtml(p.brand)} · ${escHtml(p.category)}</p>
        <p style="margin:0 0 6px;font-size:0.88rem;color:#2563eb;font-weight:700">${formatRp(p.price)}</p>
        <span class="chat-card-stock-badge ${badgeCls}">${escHtml(s.label)}</span>
        <p style="margin:8px 0 0;font-size:0.8rem;color:#374151">${escHtml(p.description || '')}</p>
        <p style="margin:8px 0 0;font-size:0.8rem;color:#ef4444;font-weight:600">⚠️ Produk ini sedang habis stok.</p>
      </div>`,
      null, ['Lihat produk lain', 'Sneakers', 'Running']);
    return;
  }

  // Size picker
  const sizeBtns = [36,37,38,39,40,41,42,43,44,45].map(sz =>
    `<button class="chat-size-pill"
       data-chat-size="${sz}" data-product-id="${escHtml(p.id)}"
       style="padding:5px 10px;border:1.5px solid #d1d5db;border-radius:8px;
              background:#fff;font-size:0.78rem;font-weight:600;cursor:pointer;
              transition:all 120ms;min-width:42px"
       onmouseover="this.style.background='#2563eb';this.style.borderColor='#2563eb';this.style.color='#fff'"
       onmouseout="this.style.background='#fff';this.style.borderColor='#d1d5db';this.style.color=''">
      EU ${sz}
    </button>`
  ).join('');

  chatAppendMessage('bot', null,
    `<div class="chat-bubble-bot">
      ${thumbHtml}
      <p style="margin:8px 0 2px;font-weight:700;font-size:0.9rem">${escHtml(p.name)}</p>
      <p style="margin:0 0 4px;font-size:0.75rem;color:#6b7280">${escHtml(p.brand)} · ${escHtml(p.category)}</p>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:0.9rem;color:#2563eb;font-weight:700">${formatRp(p.price)}</span>
        <span class="chat-card-stock-badge ${badgeCls}">${escHtml(s.label)}</span>
      </div>
      ${p.description ? `<p style="margin:0 0 10px;font-size:0.8rem;color:#374151;line-height:1.5">${escHtml(p.description)}</p>` : ''}
      <p style="margin:0 0 6px;font-size:0.8rem;font-weight:600;color:#1f2328">Pilih ukuran:</p>
      <div style="display:flex;flex-wrap:wrap;gap:5px">${sizeBtns}</div>
      <p style="margin:8px 0 0;font-size:0.72rem;color:#6b7280">
        Atau ketik ukuran, misal: <strong>EU 40</strong>
      </p>
    </div>`,
    null, []);

  // Set pending agar respons teks ukuran berikutnya langsung ke produk ini
  agentCtx.pendingAction = { type: 'await_size', productId: p.id };
}

/**
 * Render satu produk mini-card.
 * @param {object} product
 * @returns {string} HTML
 */
function chatProductCardHtml(product) {
  const s      = stockInfo(product.stock);
  const idx    = state.products.findIndex(p => p.id === product.id);
  const color  = PRODUCT_COLORS[Math.max(0, idx) % PRODUCT_COLORS.length];
  const badgeCls = product.stock > 5 ? 'avail' : product.stock > 0 ? 'low' : 'empty';
  const thumb  = product.image
    ? `<div class="chat-card-thumb"><img src="${product.image}" alt="${escHtml(product.name)}" /></div>`
    : `<div class="chat-card-thumb" style="background:${color}">👟</div>`;

  return `<div class="chat-product-card" role="button" tabindex="0"
    data-chat-product="${escHtml(product.id)}"
    aria-label="Lihat detail ${escHtml(product.name)}">
    ${thumb}
    <div class="chat-card-brand">${escHtml(product.brand)} · ${escHtml(product.category)}</div>
    <div class="chat-card-name">${escHtml(product.name)}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:2px">
      <span class="chat-card-price">${formatRp(product.price)}</span>
      <span class="chat-card-stock-badge ${badgeCls}">${escHtml(s.label)}</span>
    </div>
    ${product.stock > 0 ? '<div class="chat-card-cta">Lihat detail →</div>' : ''}
  </div>`;
}

/**
 * Tambahkan satu pesan ke DOM dan localStorage.
 * @param {'bot'|'user'} role
 * @param {string|null}  text       - teks biasa (mendukung **bold** dan \n)
 * @param {string|null}  htmlContent - HTML mentah (untuk tabel, dsb.) — hanya dari bot
 * @param {object[]|null} cards     - array produk mini-card
 * @param {string[]}     quickReplies
 */
function chatAppendMessage(role, text, htmlContent = null, cards = null, quickReplies = []) {
  const msg = { role, text: text || '', html: htmlContent || null,
                cards: cards ? cards.map(c => c.id) : null, ts: Date.now() };
  chatState.messages.push(msg);
  chatSaveHistory(chatState.messages);

  const container = document.getElementById('chat-messages');
  if (!container) return;

  const wrap = document.createElement('div');

  if (role === 'user') {
    wrap.className = 'flex justify-end';
    wrap.innerHTML = `<div class="chat-bubble-user">${escHtml(text || '')}</div>`;
  } else {
    wrap.className = 'flex flex-col gap-1.5';

    if (htmlContent) {
      // HTML sudah ter-format — langsung pasang (hanya digunakan dari kode internal, bukan input user)
      wrap.innerHTML = htmlContent;
    } else {
      const formatted = escHtml(text || '')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      wrap.innerHTML = `<div class="chat-bubble-bot">${formatted}</div>`;
    }

    if (cards && cards.length) {
      const gridEl = document.createElement('div');
      gridEl.className = cards.length > 1 ? 'grid grid-cols-2 gap-2' : '';
      gridEl.innerHTML = cards.map(p => chatProductCardHtml(p)).join('');
      wrap.appendChild(gridEl);
    }
  }

  container.appendChild(wrap);
  if (role === 'bot') chatRenderQuickReplies(quickReplies || []);
  chatScrollToBottom();
}

/** Re-render semua pesan dari history. */
function chatRenderAllMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = '';

  for (const msg of chatState.messages) {
    const wrap = document.createElement('div');
    if (msg.role === 'user') {
      wrap.className = 'flex justify-end';
      wrap.innerHTML = `<div class="chat-bubble-user">${escHtml(msg.text)}</div>`;
    } else {
      wrap.className = 'flex flex-col gap-1.5';
      if (msg.html) {
        wrap.innerHTML = msg.html;
      } else {
        const fmt = escHtml(msg.text || '')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>');
        wrap.innerHTML = `<div class="chat-bubble-bot">${fmt}</div>`;
      }
      if (msg.cards && msg.cards.length) {
        const prods = msg.cards.map(id => state.products.find(p => p.id === id)).filter(Boolean);
        if (prods.length) {
          const gridEl = document.createElement('div');
          gridEl.className = prods.length > 1 ? 'grid grid-cols-2 gap-2' : '';
          gridEl.innerHTML = prods.map(p => chatProductCardHtml(p)).join('');
          wrap.appendChild(gridEl);
        }
      }
    }
    container.appendChild(wrap);
  }
  chatScrollToBottom();
}

/** Render chip quick reply di bar bawah panel. */
function chatRenderQuickReplies(replies) {
  const container = document.getElementById('chat-quick-replies');
  if (!container) return;
  container.innerHTML = '';
  if (!replies || replies.length === 0) return;
  replies.forEach(r => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-qr-btn';
    btn.textContent = r;
    btn.dataset.chatQr = r;
    container.appendChild(btn);
  });
}

/**
 * Proses pengiriman pesan dari pengguna.
 * Semua aksi UI (keranjang, checkout, navigasi) ditangani di sini sebelum
 * diteruskan ke getAgentReply untuk intent umum.
 * @param {string} text
 */
function chatSendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  chatAppendMessage('user', trimmed);
  document.getElementById('chat-input').value = '';
  chatRenderQuickReplies([]);
  chatShowTyping();

  const delay = 300 + Math.random() * 400; // lebih responsif
  setTimeout(() => {
    chatHideTyping();
    const norm = agentNormalize(trimmed);

    // ── Aksi UI langsung (tidak perlu getAgentReply) ──────────────────

    // Buka cart / checkout
    if (/^(checkout sekarang|lanjut checkout|bayar sekarang)$/.test(norm)) {
      chatAppendMessage('bot', null,
        `<div class="chat-bubble-bot">Membuka keranjang untuk checkout 🛒<br>
         <span style="font-size:0.75rem;color:#6b7280">Klik tombol Checkout di drawer keranjang.</span></div>`,
        null, ['Lanjut belanja', 'Info pembayaran']);
      setTimeout(() => openCart(), 250);
      return;
    }

    // Kosongkan keranjang
    if (/\b(hapus keranjang|kosongkan keranjang|empty cart)\b/.test(norm)) {
      state.cart = []; saveCart(); renderCart(); renderCartBadge();
      chatAppendMessage('bot', '🗑️ Keranjang berhasil dikosongkan.', null, null,
        ['Lihat produk', 'Sneakers', 'Running']);
      return;
    }

    // Navigasi ke Pesanan Saya
    if (/^(lihat pesanan saya|riwayat pesanan)$/.test(norm)) {
      if (uiState.view !== 'my-orders') switchView('my-orders');
      const r = agentReplyOrderStatus('');
      chatAppendMessage('bot', r.text, r.html || null, null, r.quickReplies);
      return;
    }

    // Filter kategori cepat dari quick reply atau "cari [kategori]"
    const katMatch = norm.match(/^(?:cari\s+)?(sneakers|running|formal|casual|sandal)$/);
    if (katMatch) {
      agentCtx.category = katMatch[1];
      agentCtx.brand    = null;
      const r = agentReplyRecommend(norm, agentCtx);
      chatAppendMessage('bot', r.text, r.html || null, r.cards || null, r.quickReplies);
      if (uiState.view !== 'storefront') switchView('storefront');
      return;
    }

    // "Cari EU 41" → filter produk berdasarkan ukuran (tampilkan semua kategori)
    const euFilterMatch = norm.match(/^cari\s+(?:eu\s*)?([3-4][0-9])$/);
    if (euFilterMatch) {
      const sz = parseInt(euFilterMatch[1]);
      if (sz >= 36 && sz <= 45) {
        const prods = state.products.filter(p => p.stock > 0).slice(0, 6);
        chatAppendMessage('bot',
          `Produk yang tersedia (tersedia dalam berbagai ukuran termasuk EU ${sz}) 👇`,
          null, prods, ['Lihat semua produk', 'Panduan ukuran']);
        return;
      }
    }

    // "Lihat semua produk" / "Lanjut belanja"
    if (/^(lihat semua produk|lanjut belanja|kembali ke toko|produk tersedia|lihat produk)$/.test(norm)) {
      agentCtx.category = null; agentCtx.brand = null;
      const r = agentReplyRecommend(norm, agentCtx);
      chatAppendMessage('bot', r.text, r.html || null, r.cards || null, r.quickReplies);
      if (uiState.view !== 'storefront') switchView('storefront');
      return;
    }

    // ── Semua input lain → getAgentReply ─────────────────────────────
    const reply = getAgentReply(trimmed);
    chatAppendMessage('bot', reply.text, reply.html || null, reply.cards || null, reply.quickReplies || []);

    // Jika reply berhasil tambah ke keranjang → badge sudah diupdate di dalam getAgentReply
  }, delay);
}

/* ----------------------------------------------------------
   (g) EVENT LISTENERS CHAT WIDGET
   ---------------------------------------------------------- */

function initChatWidget() {
  const fab     = document.getElementById('chat-fab');
  const closeBtn = document.getElementById('chat-close-btn');
  const clearBtn = document.getElementById('chat-clear-btn');
  const sendBtn  = document.getElementById('chat-send-btn');
  const input    = document.getElementById('chat-input');
  const msgArea  = document.getElementById('chat-messages');
  const qrArea   = document.getElementById('chat-quick-replies');

  if (!fab) return;

  // FAB toggle
  fab.addEventListener('click', () => {
    if (chatState.open) chatClose(); else chatOpen();
  });

  // Tutup panel
  closeBtn.addEventListener('click', chatClose);

  // Hapus percakapan → reset
  clearBtn.addEventListener('click', () => {
    chatState.messages = [];
    chatSaveHistory([]);
    agentCtx = { productId: null, category: null, brand: null, budget: null,
                 size: null, pendingAction: null, failCount: 0 };
    const c = document.getElementById('chat-messages');
    if (c) c.innerHTML = '';
    chatRenderQuickReplies([]);
    const w = agentReplyGreeting();
    chatAppendMessage('bot', w.text, null, null, w.quickReplies);
  });

  // Kirim
  sendBtn.addEventListener('click', () => chatSendMessage(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chatSendMessage(input.value); }
  });

  // Quick reply chips
  qrArea.addEventListener('click', e => {
    const btn = e.target.closest('[data-chat-qr]');
    if (btn) chatSendMessage(btn.dataset.chatQr);
  });

  // Event delegation untuk semua klik di dalam area pesan chat
  msgArea.addEventListener('click', e => {

    // 1. Tombol aksi (Tambah ke Keranjang / Beli Sekarang)
    const actionBtn = e.target.closest('[data-chat-action]');
    if (actionBtn) {
      const action    = actionBtn.dataset.chatAction;
      const productId = actionBtn.dataset.productId;
      const size      = parseInt(actionBtn.dataset.size);
      const p         = state.products.find(x => x.id === productId);
      if (!p) return;

      if (action === 'add_cart') {
        // Tambah ke keranjang
        const ok = addToCart(p.id, String(size), 1);
        renderCartBadge();
        renderCart();
        agentCtx.pendingAction = null;
        agentCtx.size = null;
        if (ok) {
          // Nonaktifkan kedua tombol panel ini agar tidak diklik dua kali
          actionBtn.closest('.chat-action-btns')?.querySelectorAll('.chat-action-btn').forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.5';
            b.style.cursor  = 'default';
          });
          chatAppendMessage('bot',
            `✅ **${p.name}** EU ${size} berhasil ditambahkan ke keranjang!`,
            null, null,
            ['Lihat keranjang', 'Lanjut belanja', 'Checkout sekarang']);
          showToast(`${p.name} EU ${size} ditambahkan ke keranjang`, 'success');
        } else {
          chatAppendMessage('bot',
            `⚠️ Stok tidak cukup untuk **${p.name}** EU ${size}.`,
            null, null, ['Pilih ukuran lain', 'Lihat produk lain']);
        }

      } else if (action === 'buy_now') {
        // Beli sekarang — langsung buka checkout dengan item ini
        const cartItem = [{
          key:        `${p.id}__${size}`,
          productId:  p.id,
          size:       String(size),
          qty:        1,
          name:       p.name,
          brand:      p.brand,
          price:      p.price,
          colorIndex: state.products.findIndex(x => x.id === p.id) % PRODUCT_COLORS.length,
        }];
        agentCtx.pendingAction = null;
        agentCtx.size = null;
        // Nonaktifkan tombol panel ini
        actionBtn.closest('.chat-action-btns')?.querySelectorAll('.chat-action-btn').forEach(b => {
          b.disabled = true;
          b.style.opacity = '0.5';
          b.style.cursor  = 'default';
        });
        chatAppendMessage('bot',
          `⚡ Membuka halaman checkout untuk **${p.name}** EU ${size}...`,
          null, null, []);
        // Buka checkout setelah sebentar agar pesan tampil dulu
        setTimeout(() => openCheckoutModal(cartItem), 300);
      }
      return;
    }

    // 2. Tombol ukuran EU (size pill) — tampilkan panel aksi dua tombol
    const sizePill = e.target.closest('[data-chat-size]');
    if (sizePill) {
      const size      = parseInt(sizePill.dataset.chatSize);
      const productId = sizePill.dataset.productId;
      const p         = productId ? state.products.find(x => x.id === productId) : null;

      if (p) {
        agentCtx.productId     = p.id;
        agentCtx.size          = size;
        agentCtx.pendingAction = null;

        if (p.stock <= 0) {
          chatAppendMessage('bot', `Maaf, **${p.name}** habis stok.`,
            null, null, ['Lihat produk lain', 'Sneakers', 'Running']);
          return;
        }

        // Nonaktifkan semua pill di bubble ukuran yang sama agar tidak diklik dua kali
        sizePill.closest('div')?.querySelectorAll('[data-chat-size]').forEach(b => {
          b.disabled = true;
          b.style.opacity = '0.6';
          b.style.cursor  = 'default';
        });
        // Tandai pill terpilih
        sizePill.style.background    = '#2563eb';
        sizePill.style.borderColor   = '#2563eb';
        sizePill.style.color         = '#fff';
        sizePill.style.opacity       = '1';

        // Tampilkan panel aksi dua tombol
        chatAppendMessage('bot', null, chatActionPanelHtml(p, size), null, []);
        agentCtx.pendingAction = { type: 'await_action', productId: p.id, size };
      } else {
        // Tidak ada info produk — fallback ke teks EU
        if (productId) agentCtx.productId = productId;
        agentCtx.size = size;
        agentCtx.pendingAction = null;
        chatSendMessage(`EU ${size}`);
      }
      return;
    }

    // 3. Klik kartu produk → tampilkan detail inline (TIDAK membuka modal utama)
    const card = e.target.closest('[data-chat-product]');
    if (card) {
      // Hanya highlight card yang diklik, bukan semua
      document.querySelectorAll('#chat-messages [data-chat-product]').forEach(el => {
        el.classList.toggle('selected', el === card);
      });
      chatShowProductDetail(card.dataset.chatProduct);
    }
  });

  msgArea.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-chat-product]');
      if (card) { e.preventDefault(); card.click(); }
    }
  });

  // Esc tutup panel
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && chatState.open) chatClose();
  });

  chatSetVisible(true);
}
