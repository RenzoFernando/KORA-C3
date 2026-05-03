const DATA = window.KORA_DATA;
const STORAGE_KEY = 'kora-corte3-state';
const CREATED_KEY = 'kora-created-profiles';
const defaultState = {
  profileId: 'luna',
  acceptedLegal: false,
  acceptedAt: null,
  saved: [],
  liked: [],
  playlist: ['valentina-cruz', 'santa-loma'],
  shared: [],
  discarded: [],
  interactions: {},
  currentArtist: 0,
  isPlaying: false,
  playback: 0,
  previewMode: 'short',
  theme: 'dark',
  invoices: [],
  accountHidden: false,
  published: [],
  audioMessage: '',
  shuffle: false,
  repeat: false,
  reposted: []
};
let state = loadState();
let playTimer = null;
let audioPlayer = null;
let audioContext = null;
let fallbackNodes = null;
let sessionMedia = {};
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    return { ...defaultState, ...JSON.parse(raw) };
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.documentElement.dataset.theme = state.theme;
}

function createdProfiles() {
  try {
    return JSON.parse(localStorage.getItem(CREATED_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function allProfiles() {
  return [...DATA.teamMembers, ...DATA.roleProfiles, ...createdProfiles()];
}

function money(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

function activeProfile() {
  return allProfiles().find(item => item.id === state.profileId) || DATA.teamMembers[0];
}

function runtimeArtists() {
  return [...DATA.artists, ...state.published.map(item => ({ ...item, audio: sessionMedia[item.id]?.audio || item.audio || '', cover: sessionMedia[item.id]?.cover || item.cover || '' }))];
}

function activeArtist() {
  return runtimeArtists()[state.currentArtist] || runtimeArtists()[0];
}

function artistById(id) {
  return runtimeArtists().find(artist => artist.id === id);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function toast(message) {
  const node = qs('[data-toast]');
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(node.timer);
  node.timer = setTimeout(() => node.classList.remove('is-visible'), 3000);
}

function imgMarkup(src, alt, symbol, className = '') {
  if (!src) return `<span class="cover-symbol">${escapeHtml(symbol || '♪')}</span>`;
  return `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'cover-symbol',textContent:'${escapeHtml(symbol || '♪')}' }))">`;
}

function avatarMarkup(profile) {
  if (profile.avatar) return `<img src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}" onerror="this.classList.add('is-hidden')"><span>${escapeHtml(profile.initial || profile.name.slice(0, 1))}</span>`;
  return `<span>${escapeHtml(profile.initial || profile.name.slice(0, 1))}</span>`;
}

function setView(view) {
  const profile = activeProfile();
  if (view === 'publish' && profile.role !== 'artist') {
    toast('La pestaña de publicación está disponible para perfiles de artista local.');
    return;
  }
  qsa('[data-view]').forEach(node => node.classList.toggle('is-active', node.dataset.view === view));
  qsa('[data-view-target]').forEach(node => node.classList.toggle('is-active', node.dataset.viewTarget === view));
  document.body.classList.remove('sidebar-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderProfileChrome() {
  const profile = activeProfile();
  const isArtist = profile.role === 'artist';
  document.body.classList.toggle('is-artist', isArtist);
  qsa('[data-role-nav="artist"]').forEach(node => node.classList.toggle('hidden', !isArtist));
  qsa('[data-profile-name]').forEach(node => node.textContent = profile.name);
  qsa('[data-profile-role]').forEach(node => node.textContent = profile.roleLabel);
  qsa('[data-profile-initial]').forEach(node => node.textContent = profile.initial || profile.name.slice(0, 1));
  qsa('[data-profile-avatar]').forEach(node => {
    node.src = profile.avatar || '';
    node.alt = profile.name;
    node.classList.toggle('is-hidden', !profile.avatar);
  });
  qs('[data-account-state]').textContent = state.accountHidden ? 'Perfil oculto' : profile.role === 'company' ? 'Scouting activo' : profile.role === 'artist' ? 'Publicación activa' : 'Explorando Cali';
  qs('[data-account-meta]').textContent = profile.role === 'company' ? 'Métricas autorizadas por artistas visibles.' : profile.role === 'artist' ? 'Licencia, cápsulas y visibilidad configurables.' : 'Guardados, playlists y actividad protegidos.';
  qsa('[data-theme-toggle]').forEach(button => button.textContent = state.theme === 'dark' ? 'Modo claro' : 'Modo oscuro');
}

function renderSidebarSession() {
  const artist = activeArtist();
  const sideCurrent = qs('[data-side-current]');
  if (qs('[data-side-saved]')) qs('[data-side-saved]').textContent = state.saved.length;
  if (qs('[data-side-playlist]')) qs('[data-side-playlist]').textContent = state.playlist.length;
  if (sideCurrent) {
    sideCurrent.innerHTML = `<span class="side-dot tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><span><b>${escapeHtml(artist.track)}</b><small>${escapeHtml(artist.name)}</small></span>`;
  }
}

function renderHero() {
  const artist = activeArtist();
  qs('[data-hero-panel]').className = `hero-panel tone-${artist.tone || 'sunset'}`;
  qs('[data-hero-panel]').innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(artist.city)} · ${escapeHtml(artist.neighborhood)}</p>
      <h1>${escapeHtml(artist.name)} en ${escapeHtml(artist.preview)} segundos.</h1>
      <p>${escapeHtml(artist.story)}</p>
      <div class="tag-row">${artist.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="action-row">
        <button class="primary-button" type="button" data-go-player>Escuchar cápsula</button>
        <button class="soft-button" type="button" data-save-current>Guardar hallazgo</button>
        <button class="soft-button" type="button" data-share-current>Compartir con contexto</button>
      </div>
    </div>
    <div class="hero-art tone-surface">${imgMarkup(artist.cover, artist.track, artist.symbol)}</div>
  `;
}

function renderCapsules() {
  const artists = runtimeArtists();
  qs('[data-capsule-grid]').innerHTML = artists.map((artist, index) => {
    const saved = state.saved.includes(artist.id);
    const active = index === state.currentArtist;
    return `
      <article class="capsule-card tone-${escapeHtml(artist.tone || 'sunset')} ${active ? 'is-active' : ''}">
        <div class="capsule-cover tone-surface">${imgMarkup(artist.cover, artist.track, artist.symbol)}</div>
        <div>
          <p class="eyebrow">${escapeHtml(artist.scene)}</p>
          <h3>${escapeHtml(artist.track)}</h3>
          <p>${escapeHtml(artist.name)} · ${escapeHtml(artist.genre)}</p>
        </div>
        <div class="tag-row"><span class="tag">${escapeHtml(artist.neighborhood)}</span><span class="tag">${artist.match}% match</span><span class="tag">${escapeHtml(artist.language)}</span></div>
        <div class="action-row">
          <button class="soft-button" type="button" data-select-artist="${index}">Ver</button>
          <button class="soft-button" type="button" data-save-artist="${escapeHtml(artist.id)}">${saved ? 'Guardado' : 'Guardar'}</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderSaved() {
  const savedArtists = state.saved.map(artistById).filter(Boolean);
  qs('[data-saved-count]').textContent = savedArtists.length;
  qs('[data-saved-board]').innerHTML = savedArtists.length ? savedArtists.map(artist => `
    <article class="list-item">
      <span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span>
      <div class="list-item-content"><strong>${escapeHtml(artist.name)}</strong><span>${escapeHtml(artist.track)} · ${escapeHtml(artist.neighborhood)}</span></div>
      <button class="soft-button" type="button" data-remove-saved="${escapeHtml(artist.id)}">Quitar</button>
    </article>
  `).join('') : '<div class="empty-state">Todavía no tienes hallazgos guardados.</div>';
  qs('[data-signal-tags]').innerHTML = ['Decisión rápida', 'Contexto cultural', 'Barrio', 'Escena', 'Idioma', 'Match', 'Guardados', 'Impacto social'].map(tag => `<span class="tag">${tag}</span>`).join('');
}

function renderPlayer() {
  const artist = activeArtist();
  const total = state.previewMode === 'short' ? artist.preview : artist.duration;
  const liked = state.liked.includes(artist.id);
  const saved = state.saved.includes(artist.id);
  const reposted = state.reposted.includes(artist.id);
  qs('[data-player-panel]').className = `player-panel tone-${artist.tone || 'sunset'}`;
  qs('[data-player-panel]').innerHTML = `
    <div class="cover-art tone-surface">${imgMarkup(artist.cover, artist.track, artist.symbol)}</div>
    <div class="player-copy">
      <p class="eyebrow">Cápsula activa · ${state.previewMode === 'short' ? '30 segundos' : 'modo extendido'}</p>
      <h1>${escapeHtml(artist.track)}</h1>
      <p><strong>${escapeHtml(artist.name)}</strong> · ${escapeHtml(artist.genre)} · ${escapeHtml(artist.neighborhood)}</p>
      <p>${escapeHtml(artist.story)}</p>
      <div class="tag-row"><span class="tag">${artist.match}% match cultural</span><span class="tag">${escapeHtml(artist.scene)}</span><span class="tag">${escapeHtml(artist.language)}</span></div>
    </div>
  `;
  qs('[data-player-range]').max = total;
  qs('[data-player-range]').value = Math.min(state.playback, total);
  qs('[data-player-current]').textContent = formatTime(Math.min(state.playback, total));
  qs('[data-player-total]').textContent = formatTime(total);
  qs('[data-toggle-play]').textContent = state.isPlaying ? 'Pausar' : 'Reproducir';
  qs('[data-toggle-preview-mode]').textContent = state.previewMode === 'short' ? 'Escuchar completa' : 'Volver a cápsula 30s';
  qsa('[data-like-current]').forEach(button => {
    button.classList.toggle('is-active', liked);
    button.innerHTML = `<span>${liked ? '♥' : '♡'}</span><b>${liked ? 'Te gusta' : 'Me gusta'}</b>`;
  });
  qsa('[data-save-current]').forEach(button => {
    if (button.classList.contains('player-action')) {
      button.classList.toggle('is-active', saved);
      button.innerHTML = `<span>${saved ? '✓' : '＋'}</span><b>${saved ? 'Guardado' : 'Guardar'}</b>`;
    }
  });
  qsa('[data-repost-current]').forEach(button => {
    button.classList.toggle('is-active', reposted);
    button.innerHTML = `<span>${reposted ? '↺' : '↻'}</span><b>${reposted ? 'Reposteado' : 'Repostear'}</b>`;
  });
  qs('[data-audio-state]').textContent = state.audioMessage || 'Audio listo para reproducir.';
  qs('[data-player-insights]').innerHTML = artist.insight.map(item => `<article class="insight-card"><strong>${escapeHtml(item)}</strong><span>Señal para decidir sin perder el contexto local.</span></article>`).join('');
  qs('[data-queue-list]').innerHTML = runtimeArtists().map((item, index) => `
    <button class="list-item clickable" type="button" data-select-artist="${index}">
      <span class="list-cover tone-${escapeHtml(item.tone || 'sunset')}">${imgMarkup(item.cover, item.track, item.symbol)}</span>
      <span class="list-item-content"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.track)} · ${item.match}%</span></span>
    </button>
  `).join('');
}
function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = String(safe % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

function setCurrentArtist(index) {
  const artists = runtimeArtists();
  const wasPlaying = state.isPlaying;
  state.currentArtist = (index + artists.length) % artists.length;
  state.playback = 0;
  state.isPlaying = false;
  state.audioMessage = 'Audio listo para reproducir.';
  stopPlayback();
  saveState();
  renderAll();
  if (wasPlaying) setTimeout(startPlayback, 80);
}

function toggleLikeCurrent() {
  const artist = activeArtist();
  if (state.liked.includes(artist.id)) state.liked = state.liked.filter(item => item !== artist.id);
  else state.liked.push(artist.id);
  saveState();
  renderAll();
  toast(state.liked.includes(artist.id) ? 'Marcado como me gusta.' : 'Me gusta retirado.');
}

function saveArtist(id) {
  if (state.saved.includes(id)) {
    state.saved = state.saved.filter(item => item !== id);
    saveState();
    renderAll();
    toast('Hallazgo retirado de tu tablero.');
    return;
  }
  state.saved.push(id);
  saveState();
  renderAll();
  toast('Hallazgo guardado en tu tablero.');
}

function removeSaved(id) {
  state.saved = state.saved.filter(item => item !== id);
  saveState();
  renderAll();
}

function repostCurrent() {
  const artist = activeArtist();
  if (state.reposted.includes(artist.id)) {
    state.reposted = state.reposted.filter(item => item !== artist.id);
    toast('Repost retirado de tu perfil.');
  } else {
    state.reposted.push(artist.id);
    toast(`Reposteaste ${artist.track} en tu actividad.`);
  }
  saveState();
  renderAll();
}

function shareCurrent() {
  const artist = activeArtist();
  if (!state.shared.includes(artist.id)) state.shared.push(artist.id);
  saveState();
  renderAll();
  showSharePanel();
}

function getAudioPlayer() {
  if (!audioPlayer && typeof Audio !== 'undefined') {
    audioPlayer = new Audio();
    audioPlayer.preload = 'auto';
  }
  return audioPlayer;
}

function stopFallbackAudio() {
  if (fallbackNodes) {
    try {
      fallbackNodes.oscillator.stop();
    } catch (error) {}
    try {
      fallbackNodes.gain.disconnect();
      fallbackNodes.oscillator.disconnect();
    } catch (error) {}
    fallbackNodes = null;
  }
}

function startFallbackAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  audioContext = audioContext || new AudioCtx();
  if (audioContext.state === 'suspended') audioContext.resume();
  stopFallbackAudio();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const artist = activeArtist();
  const base = 180 + ((state.currentArtist % 6) * 32);
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(base, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(base * 1.5, audioContext.currentTime + 0.35);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.055, audioContext.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.018, audioContext.currentTime + 0.7);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  fallbackNodes = { oscillator, gain, artistId: artist.id };
}

function startClock(total) {
  clearInterval(playTimer);
  playTimer = setInterval(() => {
    const player = getAudioPlayer();
    if (player && !player.paused && player.src) state.playback = Math.min(Math.floor(player.currentTime), total);
    else state.playback = Math.min(state.playback + 1, total);
    if (state.playback >= total || (player && player.ended)) {
      if (state.repeat) {
        state.playback = 0;
        const playerNode = getAudioPlayer();
        if (playerNode && playerNode.src) playerNode.currentTime = 0;
      } else {
        state.playback = total;
        state.isPlaying = false;
        stopPlayback();
      }
    }
    saveState();
    renderPlayer();
    renderNowPlaying();
  }, 600);
}

function startPlayback() {
  stopPlayback();
  const artist = activeArtist();
  const total = state.previewMode === 'short' ? artist.preview : artist.duration;
  const player = getAudioPlayer();
  state.isPlaying = true;
  state.audioMessage = 'Reproduciendo cápsula.';
  saveState();
  if (player && artist.audio) {
    const url = new URL(artist.audio, window.location.href).href;
    if (player.src !== url) player.src = url;
    player.currentTime = Math.min(state.playback, Math.max(total - 1, 0));
    player.play().then(() => {
      state.audioMessage = 'Audio real enlazado correctamente.';
      saveState();
      startClock(total);
      renderPlayer();
    }).catch(() => {
      state.audioMessage = 'No se encontró el WAV o el navegador bloqueó el archivo. Se activa preescucha funcional.';
      startFallbackAudio();
      startClock(total);
      renderPlayer();
    });
  } else {
    state.audioMessage = 'No hay archivo de audio asociado. Se activa preescucha funcional.';
    startFallbackAudio();
    startClock(total);
  }
  renderPlayer();
  renderNowPlaying();
}

function stopPlayback() {
  clearInterval(playTimer);
  playTimer = null;
  const player = getAudioPlayer();
  if (player) player.pause();
  stopFallbackAudio();
}

function togglePlay() {
  if (state.isPlaying) {
    state.isPlaying = false;
    state.audioMessage = 'Pausado.';
    stopPlayback();
    saveState();
    renderPlayer();
    renderNowPlaying();
    return;
  }
  startPlayback();
}

function renderInteraction() {
  qs('[data-artist-feed]').innerHTML = DATA.interactions.map(post => {
    const artist = artistById(post.artistId) || DATA.artists[0];
    const count = state.interactions[post.id] || 0;
    return `
      <article class="feed-card tone-${escapeHtml(artist.tone || 'sunset')}">
        <div class="feed-top">
          <div class="feed-author">
            <span class="list-cover tone-surface">${imgMarkup(artist.avatar || artist.cover, artist.name, artist.symbol)}</span>
            <div class="feed-author-text"><strong>${escapeHtml(artist.name)}</strong><span>${escapeHtml(post.type)} · ${escapeHtml(artist.neighborhood)}</span></div>
          </div>
          <span class="counter-pill">${count} aportes</span>
        </div>
        <div class="feed-body"><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.body)}</p></div>
        <div class="action-row"><button class="primary-button" type="button" data-interact-post="${escapeHtml(post.id)}">${escapeHtml(post.cta)}</button><button class="soft-button" type="button" data-save-artist="${escapeHtml(artist.id)}">Guardar artista</button><button class="soft-button" type="button" data-share-artist="${escapeHtml(artist.id)}">Compartir cápsula</button></div>
      </article>
    `;
  }).join('');
  const playlist = state.playlist.map(artistById).filter(Boolean);
  qs('[data-playlist-list]').innerHTML = playlist.length ? playlist.map(artist => `
    <article class="list-item"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(artist.track)}</strong><span>${escapeHtml(artist.name)} · añadido por la comunidad</span></div></article>
  `).join('') : '<div class="empty-state">La playlist local todavía no tiene aportes.</div>';
  qs('[data-impact-box]').innerHTML = `<strong>${playlist.length} artistas visibles</strong><p>Cada aporte aparece como señal cultural para otros usuarios y aumenta la probabilidad de descubrimiento local.</p>`;
  const friendsNode = qs('[data-friend-activity]');
  if (friendsNode) friendsNode.innerHTML = DATA.friendActivity.map(item => `<article class="mini-card"><strong>${escapeHtml(item.name)} ${escapeHtml(item.action)}</strong><span>${escapeHtml(item.detail)}</span></article>`).join('');
  const notificationsNode = qs('[data-notification-list]');
  if (notificationsNode) notificationsNode.innerHTML = DATA.notifications.slice(0, 2).map(item => `<article class="mini-card"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></article>`).join('');
}
function renderPublished() {
  const profile = activeProfile();
  const published = state.published;
  qs('[data-published-count]').textContent = published.length;
  qs('[data-published-list]').innerHTML = published.length ? published.slice().reverse().map(item => `
    <article class="published-card">
      <div class="list-item"><span class="list-cover tone-${escapeHtml(item.tone || 'violet')}">${imgMarkup(item.cover, item.track, item.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(item.track)}</strong><span>${escapeHtml(item.name)} · ${escapeHtml(item.neighborhood)}</span></div></div>
      <div class="tag-row"><span class="tag">${escapeHtml(item.scene)}</span><span class="tag">Licencia registrada</span><span class="tag">${item.visibility ? 'Visible para CM' : 'Solo comunidad'}</span></div>
    </article>
  `).join('') : `<div class="empty-state">${profile.role === 'artist' ? 'Aún no has publicado cápsulas.' : 'Cambia a un perfil de artista para publicar música.'}</div>`;
  const form = qs('[data-publish-form]');
  qsa('input, textarea, button', form).forEach(node => node.disabled = profile.role !== 'artist');
}

function renderBilling() {
  qs('[data-plan-grid]').innerHTML = DATA.plans.map(plan => `
    <article class="plan-card">
      <p class="eyebrow">${escapeHtml(plan.audience)}</p>
      <h2>${escapeHtml(plan.name)}</h2>
      <span class="status-chip">${escapeHtml(plan.badge)}</span>
      <div class="plan-price">${plan.price ? money(plan.price) : 'Sin costo'}</div>
      <div class="stack-list">${plan.features.map(feature => `<div class="privacy-card">${escapeHtml(feature)}</div>`).join('')}</div>
      <button class="soft-button full" type="button" data-select-plan="${escapeHtml(plan.id)}">Elegir plan</button>
    </article>
  `).join('');
  qs('[data-plan-select]').innerHTML = DATA.plans.filter(plan => plan.price > 0).map(plan => `<option value="${escapeHtml(plan.id)}">${escapeHtml(plan.name)} · ${money(plan.price)}</option>`).join('');
  qs('[data-invoice-count]').textContent = state.invoices.length;
  qs('[data-invoice-list]').innerHTML = state.invoices.length ? state.invoices.slice().reverse().map(invoice => `
    <article class="invoice-card"><strong>${escapeHtml(invoice.number)}</strong><p>${escapeHtml(invoice.planName)} · ${money(invoice.total)} · ${escapeHtml(invoice.paidAt)}</p><span class="status-chip">Factura electrónica generada</span></article>
  `).join('') : '<div class="empty-state">Aún no hay facturas registradas.</div>';
  const profile = activeProfile();
  qs('[data-company-access-panel]').innerHTML = profile.role === 'company' ? `
    <div class="panel-head"><div><p class="eyebrow">Acceso empresas CM</p><h2>Datos disponibles por autorización</h2></div><span class="counter-pill">SLA</span></div>
    <div class="tag-cloud"><span class="tag">Métricas agregadas</span><span class="tag">Artistas visibles</span><span class="tag">Límites de uso</span><span class="tag">Soporte comercial</span></div>
    <p>El acceso empresarial se limita a artistas que autorizaron visibilidad o análisis de perfil. La información se presenta para scouting y gestión de campañas, no para cesión irrestricta de datos.</p>
  ` : `
    <div class="panel-head"><div><p class="eyebrow">Transparencia</p><h2>Condiciones comerciales visibles</h2></div><span class="counter-pill">COP</span></div>
    <p>La sección informa precio integral, factura electrónica, derecho de retracto, reversión del pago y canal de soporte antes de completar la suscripción.</p>
  `;
}

function generateInvoice(form) {
  const formData = new FormData(form);
  const plan = DATA.plans.find(item => item.id === formData.get('plan')) || DATA.plans[1];
  const now = new Date();
  const invoice = {
    number: `KORA-${now.getFullYear()}-${String(state.invoices.length + 1).padStart(4, '0')}`,
    planId: plan.id,
    planName: plan.name,
    subtotal: Math.round(plan.price / 1.19),
    tax: plan.price - Math.round(plan.price / 1.19),
    total: plan.price,
    payer: formData.get('payer'),
    document: formData.get('document'),
    email: formData.get('email'),
    method: formData.get('method'),
    paidAt: now.toLocaleString('es-CO')
  };
  state.invoices.push(invoice);
  saveState();
  renderBilling();
  showModal(`<h2>Pago registrado</h2><div class="invoice-card"><strong>${escapeHtml(invoice.number)}</strong><p>${escapeHtml(invoice.planName)}</p><p>Subtotal: ${money(invoice.subtotal)}<br>IVA incluido: ${money(invoice.tax)}<br>Total: ${money(invoice.total)}</p><span class="status-chip">Enviada a ${escapeHtml(invoice.email)}</span></div><button class="primary-button full" type="button" data-close-modal>Entendido</button>`);
  form.reset();
}

function renderProfile() {
  const profile = activeProfile();
  const likedCount = state.liked.length;
  const savedCount = state.saved.length;
  const invoiceCount = state.invoices.length;
  qs('[data-profile-overview]').innerHTML = `
    <div class="profile-hero-mini">
      <span class="avatar-shell large-avatar">${avatarMarkup(profile)}</span>
      <div><p class="eyebrow">Perfil activo</p><h2>${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.bio)}</p></div>
    </div>
    <div class="tag-cloud"><span class="tag">${escapeHtml(profile.roleLabel)}</span><span class="tag">${escapeHtml(profile.city)}</span><span class="tag">${escapeHtml(profile.code || 'Cuenta creada')}</span></div>
    <div class="profile-metrics"><span><b>${savedCount}</b><small>Guardados</small></span><span><b>${likedCount}</b><small>Likes</small></span><span><b>${state.playlist.length}</b><small>Playlist</small></span><span><b>${invoiceCount}</b><small>Facturas</small></span></div>
    <div class="profile-actions-row"><button class="soft-button" type="button" data-open-friends>Actividad de amigos</button><button class="soft-button" type="button" data-open-settings>Ajustes</button><button class="soft-button" type="button" data-open-ai>KORA AI</button></div>
  `;
  qs('[data-role-workspace]').innerHTML = roleWorkspace(profile);
  qs('[data-privacy-list]').innerHTML = privacyCards(profile).map(item => `<article class="privacy-card"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join('');
}
function roleWorkspace(profile) {
  if (profile.role === 'artist') {
    return `<div class="panel-head"><div><p class="eyebrow">Workspace artista</p><h2>Publicación y promoción</h2></div><span class="counter-pill">Licencia</span></div><p>Tu perfil tiene una pestaña separada para publicar música, subir cápsulas y controlar visibilidad empresarial.</p><button class="primary-button full" type="button" data-view-target="publish">Ir a publicar música</button>`;
  }
  if (profile.role === 'company') {
    return `<div class="panel-head"><div><p class="eyebrow">Workspace empresa</p><h2>Scouting y analítica</h2></div><span class="counter-pill">CM</span></div><div class="stack-list">${runtimeArtists().slice(0, 4).map(artist => `<article class="list-item"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(artist.name)}</strong><span>${artist.match}% afinidad · ${escapeHtml(artist.scene)}</span></div></article>`).join('')}</div><p>Solo aparecen artistas con visibilidad comercial habilitada o datos agregados permitidos por autorización.</p>`;
  }
  return `<div class="panel-head"><div><p class="eyebrow">Workspace usuario</p><h2>Tableros y descubrimiento</h2></div><span class="counter-pill">Pinterest musical</span></div><p>Crea tableros de hallazgos, guarda artistas, comparte cápsulas con contexto y aporta a playlists locales.</p><button class="primary-button full" type="button" data-save-current>Guardar cápsula actual</button>`;
}

function privacyCards(profile) {
  const base = [
    { title: 'Autenticación y perfil', body: 'Se tratan datos necesarios para identificar la cuenta, preferencias y configuración.' },
    { title: 'Control de acceso por roles', body: 'Usuarios, artistas y empresas tienen permisos y datos distintos dentro de la aplicación.' },
    { title: 'Baja y anonimización', body: 'Al bajar la cuenta, el perfil deja de ser visible y pueden conservarse estadísticas globales anonimizadas.' }
  ];
  if (profile.role === 'artist') base.push({ title: 'Visibilidad para empresas CM', body: 'El perfil artístico y sus métricas solo se comparten con empresas cuando existe autorización expresa.' });
  if (profile.role === 'company') base.push({ title: 'Límites empresariales', body: 'La empresa accede a datos autorizados para scouting y gestión, con límites de disponibilidad y veracidad informados.' });
  return base;
}

function renderNowPlaying() {
  const bar = qs('[data-now-playing-bar]');
  if (!bar) return;
  const artist = activeArtist();
  if (!state.isPlaying) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  bar.innerHTML = `
    <div class="mini-now-media"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div><strong>${escapeHtml(artist.track)}</strong><span>${escapeHtml(artist.name)} · ${formatTime(state.playback)}</span></div></div>
    <div class="mini-now-controls"><button class="icon-button" type="button" data-prev-artist>‹</button><button class="primary-button" type="button" data-toggle-play>Pausar</button><button class="icon-button" type="button" data-next-artist>›</button><button class="soft-button ${state.shuffle ? 'is-active' : ''}" type="button" data-toggle-shuffle>Aleatorio</button><button class="soft-button ${state.repeat ? 'is-active' : ''}" type="button" data-toggle-repeat>Repetir</button></div>
    <div class="mini-now-actions"><button class="soft-button" type="button" data-repost-current>Repost</button><button class="soft-button" type="button" data-open-friends>Amigos</button><button class="soft-button" type="button" data-share-menu>Compartir</button></div>
  `;
}

function showAiAssistant() {
  const artist = activeArtist();
  showModal(`<h2>KORA AI</h2><p>Estoy leyendo la cápsula activa y el contexto cultural para ayudarte a decidir rápido.</p><div class="ai-card"><strong>${escapeHtml(artist.track)} · ${escapeHtml(artist.name)}</strong><p>${escapeHtml(artist.story)}</p><span class="status-chip">Pregunta sugerida: ¿por qué este artista importa en Cali?</span></div><div class="settings-list"><button class="soft-button full" type="button">Recomiéndame algo parecido</button><button class="soft-button full" type="button">Resume el contexto cultural</button><button class="soft-button full" type="button">Crear playlist con este sonido</button></div><button class="primary-button full" type="button" data-close-modal>Cerrar</button>`);
}

function showSharePanel() {
  const artist = activeArtist();
  showModal(`<h2>Compartir cápsula</h2><p>Elige cómo quieres compartir ${escapeHtml(artist.track)}.</p><div class="settings-list"><button class="soft-button full" type="button" data-open-friends>Compartir con amigos</button><button class="soft-button full" type="button">Copiar enlace de KORA</button><button class="soft-button full" type="button">Enviar a WhatsApp</button><button class="soft-button full" type="button">Publicar en Instagram</button><button class="soft-button full" type="button">Compartir en Facebook</button></div><button class="primary-button full" type="button" data-close-modal>Cerrar</button>`);
}

function showSettingsPanel() {
  showModal(`<h2>Ajustes de KORA</h2><div class="settings-grid">${DATA.settings.map(item => `<article class="privacy-card"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join('')}</div><button class="primary-button full" type="button" data-close-modal>Guardar</button>`);
}

function showNotificationsPanel() {
  showModal(`<h2>Notificaciones</h2><div class="settings-list">${DATA.notifications.map(item => `<article class="privacy-card"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join('')}</div><button class="primary-button full" type="button" data-close-modal>Cerrar</button>`);
}

function showFriendsPanel() {
  showModal(`<h2>Actividad de amigos</h2><div class="settings-list">${DATA.friendActivity.map(item => `<article class="privacy-card"><strong>${escapeHtml(item.name)} ${escapeHtml(item.action)}</strong><p>${escapeHtml(item.detail)}</p></article>`).join('')}</div><button class="primary-button full" type="button" data-close-modal>Cerrar</button>`);
}

function renderAll() {
  renderProfileChrome();
  renderSidebarSession();
  renderHero();
  renderCapsules();
  renderSaved();
  renderPlayer();
  renderInteraction();
  renderPublished();
  renderBilling();
  renderProfile();
  renderNowPlaying();
}

function showLegalGate(force = false) {
  const overlay = qs('[data-consent-overlay]');
  if (!force && state.acceptedLegal) {
    overlay.hidden = true;
    return;
  }
  overlay.hidden = false;
  const form = qs('[data-consent-form]');
  form.reset();
  qs('.consent-submit', form).disabled = true;
}

function handleConsentForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const valid = ['terms', 'privacy', 'roleData'].every(name => form.elements[name].checked);
  if (!valid) return;
  state.acceptedLegal = true;
  state.acceptedAt = new Date().toISOString();
  saveState();
  qs('[data-consent-overlay]').hidden = true;
  toast('Autorizaciones registradas.');
}

function showModal(html) {
  const layer = qs('[data-modal-layer]');
  layer.innerHTML = `<section class="modal-card" role="dialog" aria-modal="true">${html}</section>`;
  layer.hidden = false;
}

function closeModal() {
  const layer = qs('[data-modal-layer]');
  layer.hidden = true;
  layer.innerHTML = '';
}

function publishTrack(form) {
  const profile = activeProfile();
  if (profile.role !== 'artist') {
    toast('Solo un perfil de artista local puede publicar música.');
    return;
  }
  const formData = new FormData(form);
  const id = `published-${Date.now()}`;
  const audioFile = formData.get('audio');
  const coverFile = formData.get('cover');
  if (audioFile && audioFile.size) sessionMedia[id] = { ...(sessionMedia[id] || {}), audio: URL.createObjectURL(audioFile) };
  if (coverFile && coverFile.size) sessionMedia[id] = { ...(sessionMedia[id] || {}), cover: URL.createObjectURL(coverFile) };
  const item = {
    id,
    name: formData.get('artist'),
    track: formData.get('track'),
    genre: formData.get('genre'),
    city: profile.city || 'Cali',
    neighborhood: formData.get('neighborhood'),
    scene: formData.get('genre'),
    language: 'Español',
    match: 87,
    duration: 120,
    preview: 30,
    symbol: '✹',
    tone: 'violet',
    cover: '',
    audio: '',
    story: formData.get('story'),
    tags: [formData.get('neighborhood'), formData.get('genre'), 'Nuevo lanzamiento', formData.get('visibility') ? 'Visible CM' : 'Comunidad'],
    insight: ['Cápsula publicada desde workspace artista.', 'Licencia de uso registrada para operación de KORA.', 'Lista para guardado, escucha y playlist local.'],
    visibility: Boolean(formData.get('visibility'))
  };
  state.published.push(item);
  state.currentArtist = runtimeArtists().length - 1;
  saveState();
  form.reset();
  renderAll();
  toast('Cápsula publicada y agregada al feed local.');
}

function lowerAccount() {
  state.accountHidden = true;
  state.saved = [];
  state.liked = [];
  state.shared = [];
  state.isPlaying = false;
  stopPlayback();
  saveState();
  renderAll();
  showModal('<h2>Cuenta dada de baja</h2><p>El perfil deja de ser visible inmediatamente. Se limpiaron guardados e interacciones personales de esta sesión. Serás enviado al login para elegir o crear otra cuenta.</p><button class="primary-button full" type="button" data-go-login>Ir al login</button>');
  setTimeout(() => { window.location.href = 'login.html'; }, 2200);
}

function resetEverything() {
  stopPlayback();
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CREATED_KEY);
  sessionStorage.clear();
  window.location.href = 'login.html';
}

function handleGlobalClick(event) {
  const target = event.target.closest('button, a');
  if (!target) return;
  if (target.dataset.viewTarget) setView(target.dataset.viewTarget);
  if (target.dataset.mobileMenu !== undefined) document.body.classList.toggle('sidebar-open');
  if (target.dataset.goLogin !== undefined) window.location.href = 'login.html';
  if (target.dataset.themeToggle !== undefined) {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveState();
    renderProfileChrome();
  }
  if (target.dataset.resetState !== undefined) resetEverything();
  if (target.dataset.nextArtist !== undefined) setCurrentArtist(state.shuffle ? Math.floor(Math.random() * runtimeArtists().length) : state.currentArtist + 1);
  if (target.dataset.prevArtist !== undefined) setCurrentArtist(state.currentArtist - 1);
  if (target.dataset.selectArtist !== undefined) setCurrentArtist(Number(target.dataset.selectArtist));
  if (target.dataset.goPlayer !== undefined) setView('player');
  if (target.dataset.likeCurrent !== undefined) toggleLikeCurrent();
  if (target.dataset.saveCurrent !== undefined) saveArtist(activeArtist().id);
  if (target.dataset.saveArtist) saveArtist(target.dataset.saveArtist);
  if (target.dataset.removeSaved) removeSaved(target.dataset.removeSaved);
  if (target.dataset.repostCurrent !== undefined) repostCurrent();
  if (target.dataset.shareCurrent !== undefined) shareCurrent();
  if (target.dataset.shareMenu !== undefined) showSharePanel();
  if (target.dataset.shareArtist) {
    const artist = artistById(target.dataset.shareArtist);
    if (artist && !state.shared.includes(artist.id)) state.shared.push(artist.id);
    saveState();
    renderAll();
    if (artist) toast(`Compartiste a ${artist.name} con una señal de curaduría local.`);
  }
  if (target.dataset.togglePlay !== undefined) togglePlay();
  if (target.dataset.togglePreviewMode !== undefined) {
    state.previewMode = state.previewMode === 'short' ? 'full' : 'short';
    state.playback = 0;
    state.isPlaying = false;
    state.audioMessage = 'Modo de reproducción actualizado.';
    stopPlayback();
    saveState();
    renderAll();
  }
  if (target.dataset.followListen !== undefined) {
    state.previewMode = 'full';
    if (state.playback < 30) state.playback = 30;
    saveState();
    renderPlayer();
    startPlayback();
    toast('Sigues escuchando la canción completa.');
  }
  if (target.dataset.discardArtist !== undefined) {
    const artist = activeArtist();
    if (!state.discarded.includes(artist.id)) state.discarded.push(artist.id);
    saveState();
    setCurrentArtist(state.currentArtist + 1);
    toast('Cápsula descartada. Pasamos al siguiente artista.');
  }
  if (target.dataset.addPlaylist !== undefined) {
    const artist = activeArtist();
    if (!state.playlist.includes(artist.id)) state.playlist.push(artist.id);
    saveState();
    renderInteraction();
    toast('Aporte añadido a la playlist local.');
  }
  if (target.dataset.interactPost) {
    state.interactions[target.dataset.interactPost] = (state.interactions[target.dataset.interactPost] || 0) + 1;
    saveState();
    renderInteraction();
    toast('Tu aporte quedó asociado al feed del artista.');
  }
  if (target.dataset.selectPlan) {
    qs('[data-plan-select]').value = target.dataset.selectPlan;
    setView('billing');
    toast('Plan seleccionado. Completa los datos de facturación.');
  }
  if (target.dataset.openLegalGate !== undefined) showLegalGate(true);
  if (target.dataset.deleteAccount !== undefined) lowerAccount();
  if (target.dataset.toggleShuffle !== undefined) {
    state.shuffle = !state.shuffle;
    saveState();
    renderNowPlaying();
  }
  if (target.dataset.toggleRepeat !== undefined) {
    state.repeat = !state.repeat;
    saveState();
    renderNowPlaying();
  }
  if (target.dataset.openAi !== undefined) showAiAssistant();
  if (target.dataset.openSettings !== undefined) showSettingsPanel();
  if (target.dataset.openNotifications !== undefined) showNotificationsPanel();
  if (target.dataset.openFriends !== undefined) showFriendsPanel();
  if (target.dataset.closeModal !== undefined) closeModal();
}

function bindEvents() {
  document.addEventListener('click', handleGlobalClick);
  qs('[data-consent-form]').addEventListener('submit', handleConsentForm);
  qs('[data-consent-form]').addEventListener('change', event => {
    const form = event.currentTarget;
    qs('.consent-submit', form).disabled = !['terms', 'privacy', 'roleData'].every(name => form.elements[name].checked);
  });
  qs('[data-payment-form]').addEventListener('submit', event => {
    event.preventDefault();
    generateInvoice(event.currentTarget);
  });
  qs('[data-publish-form]').addEventListener('submit', event => {
    event.preventDefault();
    publishTrack(event.currentTarget);
  });
  qs('[data-player-range]').addEventListener('input', event => {
    state.playback = Number(event.target.value);
    const player = getAudioPlayer();
    if (player && player.src) player.currentTime = state.playback;
    saveState();
    renderPlayer();
  });
}

renderAll();
bindEvents();
showLegalGate();
