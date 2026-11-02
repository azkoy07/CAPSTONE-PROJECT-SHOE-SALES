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

});
