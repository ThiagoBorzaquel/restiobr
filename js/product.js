/* =============================================
   RESTIO BEM-ESTAR — produto.js
   ============================================= */

const AFFILIATE_TAG = 'restiobr-20';
const AMAZON_BASE   = 'https://www.amazon.com.br/dp/';

function buildAmazonLink(asin) {
  return `${AMAZON_BASE}${asin}?tag=${AFFILIATE_TAG}`;
}

function renderStars(rating) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  let h = '';
  for (let i = 0; i < full;  i++) h += '<span class="star">★</span>';
  if (half) h += '<span class="star">⭒</span>';
  for (let i = 0; i < empty; i++) h += '<span class="star empty">★</span>';
  return h;
}

function formatReviews(n) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'mil' : n.toString();
}

/* ─── FAQ em português ─── */
function generateFAQ(product) {
  const cat = product.category;
  const base = [
    {
      q: `O ${product.title.split('–')[0].trim()} vale o preço?`,
      a: `Com base em ${formatReviews(product.reviews)} avaliações verificadas de clientes e nota ${product.rating}/5, este produto entrega consistentemente o que promete. O consenso é claro: considerando os benefícios que oferece ao bem-estar, o custo-benefício é excelente. Muitos clientes relatam que ele rapidamente se torna parte indispensável da rotina diária.`
    },
    {
      q: `Há garantia ou política de devolução?`,
      a: `Sim — todas as compras na Amazon.com.br têm a política padrão de devolução, permitindo devoluções em até 30 dias após o recebimento. Muitos produtos de bem-estar incluem também garantia do fabricante. As informações completas estão na página do produto na Amazon.`
    },
    {
      q: `Em quanto tempo verei resultados?`,
      a: `Os resultados variam de pessoa para pessoa, mas a maioria dos clientes nas avaliações relata perceber melhorias na primeira ou segunda semana de uso consistente. Como qualquer produto de bem-estar, os melhores resultados vêm do uso regular como parte de uma rotina saudável mais ampla.`
    },
    {
      q: `O produto é original e tem nota fiscal?`,
      a: `Sim, todos os produtos vendidos pela Amazon.com.br são originais e acompanhados de nota fiscal eletrônica (NF-e). A Amazon.com.br é um marketplace confiável com proteção total ao consumidor conforme o Código de Defesa do Consumidor brasileiro.`
    }
  ];

  const catFAQ = {
    sono: [{
      q: `Este produto pode ajudar com insônia?`,
      a: `Embora este produto não seja um dispositivo médico e não se destine a diagnosticar ou tratar distúrbios do sono, muitos clientes com dificuldades leves relatam melhorias significativas. Se você tem insônia diagnosticada, recomendamos consultar um médico ou especialista do sono em paralelo ao uso de qualquer produto de bem-estar.`
    }],
    estresse: [{
      q: `É indicado para quem tem ansiedade?`,
      a: `Muitos clientes que lidam com estresse e ansiedade do dia a dia consideram este produto útil como parte de uma rotina de autocuidado. No entanto, ele não substitui acompanhamento profissional de saúde mental. Se você experimenta ansiedade significativa, converse com um psicólogo ou psiquiatra.`
    }],
    energia: [{
      q: `Pode ser usado antes de dormir?`,
      a: `Depende do produto específico e da sua sensibilidade individual. Recomendamos verificar as orientações de uso na descrição e nas avaliações dos clientes. A maioria dos produtos de recuperação muscular e energia são adequados para uso noturno.`
    }],
    foco: [{
      q: `É adequado para meditação e mindfulness?`,
      a: `Com certeza — muitos clientes usam especificamente este produto para aprimorar sua prática de meditação e mindfulness. Os benefícios calmantes e de foco frequentemente complementam muito bem os exercícios de respiração e atenção plena.`
    }]
  };

  return [...base, ...(catFAQ[cat] || [])];
}

/* ─── JSON-LD Produto ─── */
function buildJSONLD(product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.image,
    "description": product.generated_description,
    "brand": { "@type": "Brand", "name": "Amazon" },
    "offers": {
      "@type": "Offer",
      "url": buildAmazonLink(product.asin),
      "priceCurrency": "BRL",
      "price": product.price ? product.price.replace(/[^0-9,]/g, '').replace(',', '.') : undefined,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Amazon Brasil" }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews,
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

function injectJSONLD(data) {
  const script = document.createElement('script');
  script.type  = 'application/ld+json';
  script.textContent = JSON.stringify(data, null, 2);
  document.head.appendChild(script);
}

/* ─── Produtos Relacionados ─── */
function renderRelated(all, currentAsin, category) {
  const related = all.filter(p => p.asin !== currentAsin && p.category === category).slice(0, 3);
  if (!related.length) return '';
  return related.map(p => {
    const link    = `produto.html?asin=${p.asin}`;
    const amzLink = buildAmazonLink(p.asin);
    return `
    <article class="product-card fade-in">
      <div class="product-image-wrap">
        <a href="${link}"><img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/E8F0E0/6B9E6B?text=Produto'"></a>
      </div>
      <div class="product-body">
        <span class="product-category">${p.category}</span>
        <h3 class="product-title"><a href="${link}">${p.title}</a></h3>
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="rating-count">${formatReviews(p.reviews)} avaliações</span>
        </div>
        <div class="product-card-actions">
          <a href="${link}" class="btn-view-detail">Ver Detalhes</a>
          <a href="${amzLink}" class="btn-amazon-card" rel="nofollow sponsored" target="_blank">Amazon →</a>
        </div>
      </div>
    </article>`;
  }).join('');
}

/* ─── Init Página de Produto ─── */
async function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const asin   = params.get('asin');
  if (!asin) { window.location.href = 'index.html'; return; }

  try {
    const res      = await fetch('/data/products.json');
    const products = await res.json();
    const product  = products.find(p => p.asin === asin);

    if (!product) {
      document.getElementById('product-content').innerHTML = `
        <div class="container" style="padding:80px 24px;text-align:center">
          <h2>Produto não encontrado</h2>
          <p style="margin:16px 0 24px">Não encontramos este produto.</p>
          <a href="index.html" class="btn btn-primary">Voltar ao Início</a>
        </div>`;
      return;
    }

    // Meta tags
    document.title = `${product.title} – Restio Bem-Estar`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', product.generated_description.slice(0, 155) + '…');
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${product.title} – Restio Bem-Estar`);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', product.image);

    injectJSONLD(buildJSONLD(product));

    const amazonLink = buildAmazonLink(product.asin);
    const badgeClass = product.badge === 'Mais Vendido' ? 'badge-bestseller' : 'badge-toprated';

    // Breadcrumb
    const bc = document.getElementById('product-breadcrumb');
    if (bc) {
      bc.innerHTML = `
        <a href="index.html">Início</a><span>›</span>
        <a href="categoria.html?categoria=${product.category}">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</a><span>›</span>
        <span>${product.title.split('–')[0].trim()}</span>`;
    }

    // Hero
    const heroEl = document.getElementById('product-hero');
    if (heroEl) {
      heroEl.innerHTML = `
        <div class="product-hero-inner">
          <div class="product-image-main fade-in">
            <img src="${product.image}" alt="${product.title}" loading="eager"
                 onerror="this.src='https://via.placeholder.com/500x400/E8F0E0/6B9E6B?text=Imagem+do+Produto'">
          </div>
          <div class="product-info fade-in">
            <div class="product-info-header">
              ${product.badge ? `<span class="badge ${badgeClass}" style="margin-bottom:16px;display:inline-flex">${product.badge}</span>` : ''}
            </div>
            <h1 class="product-info-title">${product.title}</h1>
            <div class="product-info-rating">
              <div class="stars">${renderStars(product.rating)}</div>
              <span class="rating-number">${product.rating}</span>
              <span class="rating-count">(${formatReviews(product.reviews)} avaliações verificadas)</span>
            </div>
            ${product.price ? `<div class="product-info-price">${product.price}</div>` : ''}
            <div class="product-cta-block">
              <a href="${amazonLink}" class="btn btn-amazon btn-lg" rel="nofollow sponsored" target="_blank">
                🛒 Ver Preço na Amazon
              </a>
              <a href="${amazonLink}#customerReviews" class="btn btn-amazon-outline" rel="nofollow sponsored" target="_blank">
                Ver Todas as Avaliações
              </a>
            </div>
            <div class="product-features-quick">
              <h4>Características Principais</h4>
              <ul>
                ${product.features.map(f => `
                  <li>
                    <span class="feature-check">✓</span>
                    <span>${f}</span>
                  </li>`).join('')}
              </ul>
            </div>
          </div>
        </div>`;
    }

    // Descrição
    const descEl = document.getElementById('product-description');
    if (descEl) {
      const paragraphs = product.generated_description.split('. ').reduce((acc, sent, i) => {
        const group = Math.floor(i / 3);
        acc[group] = (acc[group] || '') + sent + (sent.endsWith('.') ? ' ' : '. ');
        return acc;
      }, []);

      descEl.innerHTML = `
        <div class="product-description-inner">
          <div class="description-text fade-in">
            <div class="section-label">Por que recomendamos</div>
            <h2>Nossa análise: ${product.title.split('–')[0].trim()}</h2>
            ${paragraphs.map(p => `<p>${p.trim()}</p>`).join('')}
            <div class="affiliate-notice">
              ⓘ Esta página contém links de afiliado. Se você comprar através dos nossos links, podemos ganhar uma pequena comissão sem custo adicional para você.
              <a href="politica-de-privacidade.html">Saiba mais</a>.
            </div>
          </div>
          <aside class="product-sidebar">
            <div class="sidebar-card">
              <h4>Nosso Veredicto</h4>
              <div class="product-rating" style="margin-bottom:16px">
                <div class="stars">${renderStars(product.rating)}</div>
                <span class="rating-number">${product.rating}/5</span>
              </div>
              <ul style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
                <li style="display:flex;gap:8px;align-items:flex-start;font-size:0.85rem">
                  <span style="color:var(--green-soft);font-weight:600">✓</span>
                  <span>Altamente avaliado por ${formatReviews(product.reviews)} compradores</span>
                </li>
                <li style="display:flex;gap:8px;align-items:flex-start;font-size:0.85rem">
                  <span style="color:var(--green-soft);font-weight:600">✓</span>
                  <span>Entrega via Amazon com frete rápido</span>
                </li>
                <li style="display:flex;gap:8px;align-items:flex-start;font-size:0.85rem">
                  <span style="color:var(--green-soft);font-weight:600">✓</span>
                  <span>Nota fiscal inclusa e proteção ao consumidor</span>
                </li>
              </ul>
              <a href="${amazonLink}" class="btn btn-amazon" style="width:100%;text-align:center;justify-content:center" rel="nofollow sponsored" target="_blank">
                Comprar na Amazon
              </a>
            </div>
          </aside>
        </div>`;
    }

    // FAQ
    const faqEl = document.getElementById('product-faq');
    if (faqEl) {
      const faqs = generateFAQ(product);
      faqEl.innerHTML = faqs.map(faq => `
        <div class="faq-item">
          <div class="faq-question">
            <span>${faq.q}</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer"><p>${faq.a}</p></div>
        </div>`).join('');
    }

    // Relacionados
    const relEl = document.getElementById('related-products');
    if (relEl) {
      const html = renderRelated(products, asin, product.category);
      relEl.innerHTML = html || '<p style="color:var(--gray-mid)">Nenhum produto relacionado encontrado.</p>';
    }

    // Breadcrumb JSON-LD
    injectJSONLD({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://restiobemestar.com.br/" },
        { "@type": "ListItem", "position": 2, "name": product.category, "item": `https://restiobemestar.com.br/categoria.html?categoria=${product.category}` },
        { "@type": "ListItem", "position": 3, "name": product.title }
      ]
    });

    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    }, 100);

  } catch (err) {
    console.error('Erro ao carregar produto:', err);
    const content = document.getElementById('product-content');
    if (content) content.innerHTML = `<div class="container" style="padding:80px;text-align:center"><p>Erro ao carregar produto. <a href="index.html" style="color:var(--green-mid)">Voltar ao início</a></p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', initProductPage);
