'use strict';
/* ====== SETTINGS: edit these ====== */
const WHATSAPP_NUMBER = '94XXXXXXXXX'; // country code + number, no + or spaces, e.g. 94771234567
/* ================================== */

const PRODUCTS = {
  'pineapple':    { name: 'Pineapple',    cat: 'Fruits' },
  'banana':       { name: 'Banana',       cat: 'Fruits' },
  'jackfruit':    { name: 'Jackfruit',    cat: 'Fruits' },
  'guava':        { name: 'Guava',        cat: 'Fruits' },
  'butterfly-pea':{ name: 'Butterfly pea',cat: 'Flowers' },
  'chamomile':    { name: 'Chamomile',    cat: 'Flowers' },
  'lavender':     { name: 'Lavender',     cat: 'Flowers' },
  'curry-leaves': { name: 'Curry leaves', cat: 'Leafy greens' }
};

// Mobile navigation
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Footer year
const yr = document.getElementById('year');
if (yr) yr.textContent = new Date().getFullYear();

// Filter tabs (products + gallery): buttons[data-filter] filter items[data-group]
document.querySelectorAll('[data-filter-group]').forEach(group => {
  const tabs = group.querySelectorAll('.tab');
  const items = document.querySelectorAll(group.dataset.filterGroup);
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === tab)));
    const f = tab.dataset.filter;
    items.forEach(i => { i.hidden = !(f === 'all' || i.dataset.group === f); });
  }));
});

// Product detail page: ?p=pineapple
const nameEl = document.getElementById('p-name');
if (nameEl) {
  const slug = new URLSearchParams(location.search).get('p') || 'pineapple';
  const p = PRODUCTS[slug] || PRODUCTS['pineapple'];
  nameEl.textContent = p.name;
  document.title = p.name + ' | Haritha Foods Product';
  document.getElementById('p-cat').textContent = p.cat;
  document.getElementById('p-crumb').textContent = p.name;
  document.getElementById('p-intro').textContent = 'Dehydrated ' + p.name.toLowerCase() + ', available in bulk or in branded consumer packs.';
  document.querySelectorAll('[data-order-link]').forEach(a => { a.href = 'order.html?p=' + slug; });
  document.querySelectorAll('[data-product-link]').forEach(a => {
    a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hello, I would like a quote for dehydrated ' + p.name.toLowerCase() + '.');
  });
}

// WhatsApp buttons without a product
document.querySelectorAll('[data-whatsapp]').forEach(a => {
  a.href = 'https://wa.me/' + WHATSAPP_NUMBER;
  a.target = '_blank'; a.rel = 'noopener';
});

// Forms: validate, then open WhatsApp with the message pre-filled
document.querySelectorAll('form[data-whatsapp-form]').forEach(form => {
  const status = form.querySelector('.status');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const err = f.parentElement.querySelector('.error');
      let msg = '';
      if (!f.value.trim()) msg = 'This field is required.';
      else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) msg = 'Enter a valid email address.';
      if (err) err.textContent = msg;
      if (msg) ok = false;
    });
    if (!ok) { if (status) status.textContent = ''; return; }
    const lines = [...form.querySelectorAll('input,textarea,select')]
      .filter(f => f.value.trim())
      .map(f => form.querySelector('label[for="' + f.id + '"]').textContent + ': ' + f.value.trim());
    const text = (form.dataset.subject || 'Inquiry') + '\n' + lines.join('\n');
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    if (status) status.textContent = 'Thank you! WhatsApp has opened with your message. Press send to complete it.';
    form.reset();
  });
});

/* ===== Demo accounts and orders =====
   Stored in THIS browser only (localStorage). This is for the sample site.
   For the real website use a server: WordPress users + WooCommerce, or a backend with a database. */
(function () {
  const KU = 'hfp_users', KS = 'hfp_session', KO = 'hfp_orders';
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const users = () => read(KU, []);
  const current = () => { const e = localStorage.getItem(KS); return users().find(u => u.email === e) || null; };
  const norm = s => s.trim().toLowerCase();
  const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  function safeNext() {
    const n = new URLSearchParams(location.search).get('next') || '';
    return /^[a-z-]+\.html(\?[\w=&.-]*)?$/.test(n) ? n : 'order.html';
  }
  async function hash(pw, salt) {
    const text = salt + pw;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h;
  }
  const newSalt = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const setErr = (field, msg) => { const e = field.parentElement.querySelector('.error'); if (e) e.textContent = msg; return !msg; };

  // Header: Log in / Register, or Hi + Log out
  const auth = document.getElementById('auth');
  if (auth) {
    const u = current();
    if (u) {
      const hi = document.createElement('span'); hi.textContent = 'Hi, ' + u.name.split(' ')[0]; hi.className = 'hi';
      const out = document.createElement('button'); out.type = 'button'; out.className = 'btn-outline small'; out.textContent = 'Log out';
      out.addEventListener('click', () => { localStorage.removeItem(KS); location.href = 'index.html'; });
      auth.append(hi, out);
    } else {
      const li = document.createElement('a'); li.href = 'login.html'; li.textContent = 'Log in';
      const rg = document.createElement('a'); rg.href = 'register.html'; rg.className = 'btn small'; rg.textContent = 'Register';
      auth.append(li, rg);
    }
  }
  document.querySelectorAll('[data-keep-search]').forEach(a => { a.href += location.search; });

  // Register
  const reg = document.querySelector('form[data-auth="register"]');
  if (reg) reg.addEventListener('submit', async e => {
    e.preventDefault();
    const f = id => reg.querySelector('#' + id);
    const email = norm(f('r-email').value);
    let ok = true;
    ok = setErr(f('r-name'), f('r-name').value.trim() ? '' : 'Enter your name.') && ok;
    ok = setErr(f('r-email'), !isEmail(email) ? 'Enter a valid email address.' : users().some(u => u.email === email) ? 'An account with this email already exists.' : '') && ok;
    ok = setErr(f('r-phone'), f('r-phone').value.replace(/\D/g, '').length >= 7 ? '' : 'Enter a valid phone number.') && ok;
    ok = setErr(f('r-pass'), f('r-pass').value.length >= 8 ? '' : 'Use at least 8 characters.') && ok;
    ok = setErr(f('r-pass2'), f('r-pass2').value === f('r-pass').value ? '' : 'Passwords do not match.') && ok;
    if (!ok) return;
    const salt = newSalt();
    const all = users();
    all.push({ name: f('r-name').value.trim(), email, phone: f('r-phone').value.trim(), company: f('r-company').value.trim(), salt, hash: await hash(f('r-pass').value, salt) });
    write(KU, all); localStorage.setItem(KS, email);
    location.href = safeNext();
  });

  // Login
  const log = document.querySelector('form[data-auth="login"]');
  if (log) log.addEventListener('submit', async e => {
    e.preventDefault();
    const f = id => log.querySelector('#' + id);
    const msg = log.querySelector('.form-error');
    const email = norm(f('l-email').value);
    let ok = setErr(f('l-email'), isEmail(email) ? '' : 'Enter a valid email address.');
    ok = setErr(f('l-pass'), f('l-pass').value ? '' : 'Enter your password.') && ok;
    if (!ok) return;
    const u = users().find(x => x.email === email);
    if (!u || u.hash !== await hash(f('l-pass').value, u.salt)) { msg.textContent = 'Incorrect email or password.'; return; }
    localStorage.setItem(KS, email);
    location.href = safeNext();
  });

  // Order page: only for logged-in users
  const gate = document.getElementById('order-gate'), app = document.getElementById('order-app');
  if (gate && app) {
    const user = current();
    gate.hidden = !!user; app.hidden = !user;
    if (user) initOrder(user);
  }
  function initOrder(user) {
    const form = document.getElementById('order-form');
    const items = document.getElementById('items');
    const itemsErr = document.getElementById('items-error');
    const status = form.querySelector('.status');
    const pre = new URLSearchParams(location.search).get('p');
    let n = 0;
    function addRow(sel) {
      n++;
      const row = document.createElement('div'); row.className = 'row2';
      const a = document.createElement('div'), b = document.createElement('div');
      const la = document.createElement('label'); la.htmlFor = 'o-prod-' + n; la.textContent = 'Product';
      const s = document.createElement('select'); s.id = 'o-prod-' + n;
      Object.keys(PRODUCTS).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = PRODUCTS[k].name; if (k === sel) o.selected = true; s.appendChild(o); });
      const lb = document.createElement('label'); lb.htmlFor = 'o-qty-' + n; lb.textContent = 'Quantity (kg)';
      const q = document.createElement('input'); q.id = 'o-qty-' + n; q.type = 'number'; q.min = '1'; q.step = '1';
      a.append(la, s); b.append(lb, q); row.append(a, b);
      items.appendChild(row);
    }
    addRow(PRODUCTS[pre] ? pre : null);
    document.getElementById('add-item').addEventListener('click', () => addRow(null));
    form.addEventListener('submit', e => {
      e.preventDefault();
      status.textContent = '';
      const lines = [];
      items.querySelectorAll('.row2').forEach(r => {
        const qty = Number(r.querySelector('input').value);
        if (qty > 0) lines.push({ name: PRODUCTS[r.querySelector('select').value].name, qty });
      });
      const addr = form.querySelector('#o-addr');
      let ok = setErr(addr, addr.value.trim() ? '' : 'Enter a delivery address.');
      itemsErr.textContent = lines.length ? '' : 'Add at least one product with a quantity.';
      if (!lines.length || !ok) return;
      const all = read(KO, []);
      const order = { id: 'HF-' + String(all.length + 1).padStart(4, '0'), email: user.email, date: new Date().toLocaleString(), type: form.querySelector('#o-type').value, items: lines, address: addr.value.trim(), notes: form.querySelector('#o-note').value.trim(), status: 'Received' };
      all.push(order); write(KO, all);
      status.textContent = 'Order ' + order.id + ' placed. We will contact you to confirm.';
      form.reset(); items.innerHTML = ''; addRow(null); render();
    });
    function render() {
      const list = document.getElementById('order-list'); list.innerHTML = '';
      const mine = read(KO, []).filter(o => o.email === user.email).reverse();
      if (!mine.length) { const li = document.createElement('li'); li.textContent = 'No orders yet.'; list.appendChild(li); return; }
      mine.forEach(o => {
        const li = document.createElement('li');
        const d = document.createElement('div');
        const t = document.createElement('strong'); t.textContent = o.id + ' · ' + o.type;
        const m = document.createElement('div'); m.className = 'meta'; m.textContent = o.items.map(i => i.name + ' ' + i.qty + ' kg').join(', ') + ' · ' + o.date;
        const st = document.createElement('span'); st.className = 'pill'; st.textContent = o.status;
        d.append(t, m); li.append(d, st); list.appendChild(li);
      });
    }
    render();
  }
})();
