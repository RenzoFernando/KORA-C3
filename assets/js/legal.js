const DATA = window.KORA_DATA;
const qs = (selector, scope = document) => scope.querySelector(selector);
const params = new URLSearchParams(window.location.search);
let active = params.get('doc') || 'terms';
if (!DATA.legalDocs[active]) active = 'terms';

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function renderTabs() {
  const labels = { terms: 'Términos', privacy: 'Datos', license: 'Licencia', payments: 'Pagos' };
  qs('[data-legal-tabs]').innerHTML = Object.keys(DATA.legalDocs).map(key => `<a class="soft-button ${key === active ? 'is-active' : ''}" href="legal.html?doc=${key}">${labels[key]}</a>`).join('');
}

function renderDocument() {
  const doc = DATA.legalDocs[active];
  qs('[data-legal-document]').innerHTML = `
    <p class="eyebrow">KORA</p>
    <h1>${escapeHtml(doc.title)}</h1>
    <p>${escapeHtml(doc.lead)}</p>
    ${doc.sections.map(section => `<section class="legal-section"><h2>${escapeHtml(section[0])}</h2><p>${escapeHtml(section[1])}</p></section>`).join('')}
    <section class="legal-section"><a class="primary-button" href="index.html">Volver a KORA</a></section>
  `;
}

renderTabs();
renderDocument();
