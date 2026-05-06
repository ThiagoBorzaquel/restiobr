/* =============================================
   RESTIO BEM-ESTAR — main.js
   ============================================= */

const AFFILIATE_TAG  = 'restiobr-20';
const AMAZON_BASE    = 'https://www.amazon.com.br/dp/';
const PRODUCTS_URL   = '/data/products.json';

/* ─── Link Amazon.com.br ─── */
function buildAmazonLink(asin) {
  return `${AMAZON_BASE}${asin}?tag=${AFFILIATE_TAG}`;
}

/* ─── Estrelas ─── */
function buildStarsHTML(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  let html = '<span class="stars">';
  for (let i = 0; i < full;  i++) html += '<span class="star">★</span>';
  if (half)                        html += '<span class="star">⭒</span>';
  for (let i = 0; i < empty; i++) html += '<span class="star empty">★</span>';
  return html + '</span>';
}

/* ─── Formatar número de avaliações ─── */
function formatReviews(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'mil';
  return n.toString();
}

/* ─── Card de Produto ─── */
function buildProductCard(p) {
  const amazonLink = buildAmazonLink(p.asin);
  const detailLink = `produto.html?asin=${p.asin}`;
  const badgeClass = p.badge === 'Mais Vendido' ? 'badge-bestseller' : 'badge-toprated';
  const badgeHTML  = p.badge ? `<span class="badge ${badgeClass}">${p.badge}</span>` : '';

  return `
  <article class="product-card fade-in" data-category="${p.category}" itemscope itemtype="https://schema.org/Product">
    <div class="product-image-wrap">
      <a href="${detailLink}">
        <img src="${p.image}" alt="${p.title}" loading="lazy" itemprop="image"
             onerror="this.src='https://via.placeholder.com/400x300/E8F0E0/6B9E6B?text=Produto'">
      </a>
      <div class="product-badge">${badgeHTML}</div>
    </div>
    <div class="product-body">
      <span class="product-category">${p.category}</span>
      <h3 class="product-title" itemprop="name">
        <a href="${detailLink}">${p.title}</a>
      </h3>
      <div class="product-rating">
        ${buildStarsHTML(p.rating)}
        <span style="font-family:var(--font-display);font-size:1.1rem;color:var(--green-dark)">${p.rating}</span>
        <span class="rating-count">(${formatReviews(p.reviews)} avaliações)</span>
      </div>
      ${p.price ? `<div class="product-price">${p.price}</div>` : ''}
      <div class="product-card-actions">
        <a href="${detailLink}" class="btn-view-detail">Ver Detalhes</a>
        <a href="${amazonLink}" class="btn-amazon-card" rel="nofollow sponsored" target="_blank">Amazon →</a>
      </div>
    </div>
  </article>`;
}

/* ─── Carregar Produtos ─── */
async function loadProducts(options = {}) {
  const { category = null, containerId = 'products-grid', limit = null } = options;
  const container = document.getElementById(containerId);
  if (!container) return [];

  container.innerHTML = Array(limit || 4).fill(0).map(() => `
    <div class="product-card">
      <div class="product-image-wrap skeleton" style="height:220px"></div>
      <div class="product-body">
        <div class="skeleton" style="height:12px;width:60px;margin-bottom:10px"></div>
        <div class="skeleton" style="height:20px;width:80%;margin-bottom:8px"></div>
        <div class="skeleton" style="height:16px;width:50%;margin-bottom:16px"></div>
        <div class="skeleton" style="height:40px"></div>
      </div>
    </div>`).join('');

  try {
    const res    = await fetch(PRODUCTS_URL);
    let products = await res.json();
    if (category) products = products.filter(p => p.category === category);
    if (limit)    products = products.slice(0, limit);
    container.innerHTML = products.map(buildProductCard).join('');
    initFadeIn();
    return products;
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    container.innerHTML = `<p style="color:var(--gray-mid);text-align:center;padding:40px">Não foi possível carregar os produtos. Tente novamente.</p>`;
    return [];
  }
}

/* ─── Carregar por Categoria (seções da home) ─── */
async function loadFeaturedByCategory() {
  const sections = document.querySelectorAll('[data-products-category]');
  if (!sections.length) return;
  let products = [];
  try {
    const res = await fetch(PRODUCTS_URL);
    products  = await res.json();
  } catch { return; }

  sections.forEach(section => {
    const cat    = section.getAttribute('data-products-category');
    const subset = products.filter(p => p.category === cat).slice(0, 4);
    section.innerHTML = subset.map(buildProductCard).join('');
  });
  initFadeIn();
}

/* ─── Header scroll ─── */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ─── Menu mobile ─── */
function initMobileMenu() {
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn   = document.querySelector('.mobile-menu-close');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const close = () => { mobileMenu.classList.remove('open'); document.body.style.overflow = ''; };
  if (closeBtn) closeBtn.addEventListener('click', close);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ─── Fade-in por Intersection Observer ─── */
function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}
window.initFadeIn = initFadeIn;

/* ─── Cookie Consent (LGPD) ─── */
function initCookies() {
  const banner    = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');
  if (!banner) return;
  if (!localStorage.getItem('rb_cookie_consent')) {
    setTimeout(() => banner.classList.add('active'), 1500);
  }
  const dismiss = (value) => {
    localStorage.setItem('rb_cookie_consent', value);
    banner.classList.remove('active');
    if (value === 'aceito') loadAnalytics();
  };
  if (acceptBtn) acceptBtn.addEventListener('click', () => dismiss('aceito'));
  if (rejectBtn) rejectBtn.addEventListener('click', () => dismiss('recusado'));
}

function loadAnalytics() {
  // Substitua G-XXXXXXXXXX pelo seu ID do Google Analytics 4
  /*
  const script  = document.createElement('script');
  script.src    = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  script.async  = true;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
  */
}

/* ─── FAQ Accordion ─── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

/* ─── Newsletter ─── */
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (email) {
      form.innerHTML = '<p style="color:var(--green-light);font-size:1rem;">✓ Obrigado! Você está na lista.</p>';
    }
  });
}

/* ─── Nav link ativo ─── */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.style.color = 'var(--green-mid)';
  });
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCookies();
  initFAQ();
  initActiveNav();
  initNewsletter();
  initFadeIn();

  if (document.getElementById('products-grid')) {
    const cat = new URLSearchParams(window.location.search).get('categoria');
    loadProducts({ category: cat, containerId: 'products-grid' });
  }
  if (document.querySelector('[data-products-category]')) {
    loadFeaturedByCategory();
  }
});
