const DATA = window.KORA_DATA;
const STORAGE_KEY = 'kora-corte3-state';
const CREATED_KEY = 'kora-created-profiles';
const defaultState = {
  uiVersion: 7,
  profileId: 'luna',
  acceptedLegal: false,
  acceptedAt: null,
  legalDraft: { terms: false, privacy: false, roleData: false },
  saved: [],
  liked: [],
  playlist: ['valentina-cruz', 'santa-loma'],
  shared: [],
  discarded: [],
  interactions: {},
  comments: {},
  dismissedNotifications: [],
  settingsState: { notifications: true, privateMode: false, compactMode: false, highContrast: false },
  friendMessages: [],
  currentArtist: 0,
  isPlaying: false,
  playback: 0,
  previewMode: 'short',
  theme: 'light',
  invoices: [],
  accountHidden: false,
  published: [],
  audioMessage: '',
  shuffle: false,
  repeat: false,
  reposted: [],
  lastPausedAt: null
};
let state = loadState();
let playTimer = null;
let audioPlayer = null;
let audioContext = null;
let fallbackNodes = null;
let sessionMedia = {};
let nowPlayingHideTimer = null;
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState, currentArtist: Math.floor(Math.random() * DATA.artists.length) };
    const parsed = { ...defaultState, ...JSON.parse(raw) };
    if (parsed.uiVersion !== 7) {
      parsed.uiVersion = 7;
      parsed.currentArtist = Math.floor(Math.random() * DATA.artists.length);
    }
    return parsed;
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

function svgIcon(name) {
  const icons = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.4v13.2L18.4 12 8 5.4Z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" fill="currentColor"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6 10.9 19.6C5.7 14.9 2.3 11.8 2.3 8A4.5 4.5 0 0 1 6.9 3.4c2 0 3.8 1.1 5.1 2.8 1.3-1.7 3.1-2.8 5.1-2.8A4.5 4.5 0 0 1 21.7 8c0 3.8-3.4 6.9-8.6 11.6L12 20.6Zm0-2.7.1-.1c4.8-4.4 7.6-6.9 7.6-9.8a2.6 2.6 0 0 0-2.6-2.6c-1.6 0-3.1 1-3.9 2.4h-2.4C10 6.4 8.5 5.4 6.9 5.4A2.6 2.6 0 0 0 4.3 8c0 2.9 2.8 5.4 7.6 9.8l.1.1Z" fill="currentColor"/></svg>',
    heartFilled: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6 10.9 19.6C5.7 14.9 2.3 11.8 2.3 8A4.5 4.5 0 0 1 6.9 3.4c2 0 3.8 1.1 5.1 2.8 1.3-1.7 3.1-2.8 5.1-2.8A4.5 4.5 0 0 1 21.7 8c0 3.8-3.4 6.9-8.6 11.6L12 20.6Z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.4 16.6-4-4 1.4-1.4 2.6 2.6 7.8-7.8 1.4 1.4-9.2 9.2Z" fill="currentColor"/></svg>',
    repost: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h9.2l-2.1-2.1L15.5 3 21 8.5 15.5 14l-1.4-1.9 2.1-2.1H7v3H5V9a2 2 0 0 1 2-2Zm10 10H7.8l2.1 2.1L8.5 21 3 15.5 8.5 10l1.4 1.9L7.8 14H17v-3h2v4a2 2 0 0 1-2 2Z" fill="currentColor"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.1c-1 0-1.9.4-2.5 1.1L8.9 13.4c.1-.4.1-.6.1-.9s0-.5-.1-.9l6.5-3.8A3.4 3.4 0 1 0 14.4 6l-6.5 3.8a3.4 3.4 0 1 0 0 5.4l6.6 3.9A3.4 3.4 0 1 0 18 16.1Z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 8 7-8 7V5Zm9 0h2v14h-2V5Z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 19 8 12l8-7v14ZM5 5h2v14H5V5Z" fill="currentColor"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3h4v4h-2V6.4l-4.7 4.7-1.4-1.4L17.6 5H17V3ZM3 7h3.6l12 12H21v2h-3.2L5.8 9H3V7Zm11.3 7.2 1.4 1.4L19 12.4V11h2v4h-4v-2h.6l-3.3 3.2ZM3 17h2.8l3.1-3.1 1.4 1.4L6.6 19H3v-2Z" fill="currentColor"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h9.2l-2.1-2.1L15.5 3 21 8.5 15.5 14l-1.4-1.9 2.1-2.1H7v3H5V9a2 2 0 0 1 2-2Zm10 10H7.8l2.1 2.1L8.5 21 3 15.5 8.5 10l1.4 1.9L7.8 14H17v-3h2v4a2 2 0 0 1-2 2Z" fill="currentColor"/></svg>',
    friends: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 2c-3.2 0-6 1.6-6 3.8V20h12v-2.7c0-2.2-2.8-3.8-6-3.8Zm8.5-1.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.7c-.8 0-1.6.1-2.3.4 1.1.9 1.8 2 1.8 3.2V20h4v-2.4c0-2-1.9-3.9-3.5-3.9Z" fill="currentColor"/></svg>'
  };
  return icons[name] || '';
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
  qs('[data-account-state]').textContent = state.accountHidden ? 'Perfil oculto' : profile.role === 'company' ? 'Scouting activo' : profile.role === 'artist' ? 'Publicación activa' : profile.role === 'ambassador' || profile.roleLabel.toLowerCase().includes('embajador') ? 'Curaduría activa' : 'Explorando Cali';
  qs('[data-account-meta]').textContent = profile.role === 'company' ? 'Métricas autorizadas por artistas visibles.' : profile.role === 'artist' ? 'Licencia, cápsulas y visibilidad configurables.' : profile.role === 'ambassador' || profile.roleLabel.toLowerCase().includes('embajador') ? 'Tableros, amigos y contexto comunitario.' : 'Guardados, playlists y actividad protegidos.';
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
  const looped = [...artists, ...artists, ...artists];
  qs('[data-capsule-grid]').innerHTML = looped.map((artist, index) => {
    const realIndex = index % artists.length;
    const saved = state.saved.includes(artist.id);
    const active = realIndex === state.currentArtist;
    return `
      <article class="capsule-card tone-${escapeHtml(artist.tone || 'sunset')} ${active ? 'is-active' : ''}" data-loop-card="${realIndex}">
        <div class="capsule-cover tone-surface">${imgMarkup(artist.cover, artist.track, artist.symbol)}</div>
        <div>
          <p class="eyebrow">${escapeHtml(artist.scene)}</p>
          <h3>${escapeHtml(artist.track)}</h3>
          <p>${escapeHtml(artist.name)} · ${escapeHtml(artist.genre)}</p>
        </div>
        <div class="tag-row"><span class="tag">${escapeHtml(artist.neighborhood)}</span><span class="tag">${artist.match}% match</span><span class="tag">${escapeHtml(artist.language)}</span></div>
        <div class="action-row">
          <button class="soft-button" type="button" data-select-artist="${realIndex}">Ver</button>
          <button class="soft-button ${saved ? 'is-active' : ''}" type="button" data-save-artist="${escapeHtml(artist.id)}">${saved ? 'Guardado' : 'Guardar'}</button>
        </div>
      </article>
    `;
  }).join('');
  requestAnimationFrame(() => prepareCapsuleLoop(true));
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
  const playButton = qs('[data-toggle-play]');
  if (playButton) {
    playButton.innerHTML = `${svgIcon(state.isPlaying ? 'pause' : 'play')}<span class="visually-hidden">${state.isPlaying ? 'Pausar' : 'Reproducir'}</span>`;
    playButton.setAttribute('aria-label', state.isPlaying ? 'Pausar' : 'Reproducir');
  }
  qs('[data-toggle-preview-mode]').textContent = state.previewMode === 'short' ? 'Escuchar completa' : 'Volver a cápsula 30s';
  qsa('[data-like-current]').forEach(button => {
    button.classList.toggle('is-active', liked);
    button.innerHTML = `<span>${svgIcon(liked ? 'heartFilled' : 'heart')}</span><b>${liked ? 'Te gusta' : 'Me gusta'}</b>`;
  });
  qsa('[data-save-current]').forEach(button => {
    if (button.classList.contains('player-action')) {
      button.classList.toggle('is-active', saved);
      button.innerHTML = `<span>${svgIcon(saved ? 'check' : 'plus')}</span><b>${saved ? 'Guardado' : 'Guardar'}</b>`;
    }
  });
  qsa('[data-repost-current]').forEach(button => {
    button.classList.toggle('is-active', reposted);
    button.innerHTML = `<span>${svgIcon('repost')}</span><b>${reposted ? 'Reposteado' : 'Repostear'}</b>`;
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
  state.lastPausedAt = null;
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
  renderNotificationBadge();
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
    state.lastPausedAt = Date.now();
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
  const profile = activeProfile();
  const headline = qs('[data-view="interaction"] .section-heading h1');
  const cta = qs('[data-add-playlist]');
  if (headline) headline.textContent = profile.role === 'company' ? 'Radar de artistas, señales y oportunidades para scouting.' : profile.role === 'artist' ? 'Respuestas, comunidad y señales para tus lanzamientos.' : profile.role === 'ambassador' || profile.roleLabel.toLowerCase().includes('embajador') ? 'Curaduría comunitaria, votaciones y conversación local.' : 'Interacción con artistas, curadores y escena local.';
  if (cta) cta.textContent = profile.role === 'company' ? 'Marcar artista para contacto' : profile.role === 'artist' ? 'Impulsar cápsula activa' : profile.role === 'ambassador' || profile.roleLabel.toLowerCase().includes('embajador') ? 'Crear aporte curatorial' : 'Sumar a playlist local';
  const posts = profile.role === 'company' ? DATA.interactions.slice().reverse() : DATA.interactions;
  qs('[data-artist-feed]').innerHTML = posts.map(post => {
    const artist = artistById(post.artistId) || DATA.artists[0];
    const postComments = state.comments[post.id] || [];
    const count = (state.interactions[post.id] || 0) + postComments.length;
    const saved = state.saved.includes(artist.id);
    const label = profile.role === 'company' ? 'Guardar en radar' : profile.role === 'artist' ? 'Guardar referencia' : 'Guardar artista';
    const commentPreview = postComments.slice(-2).map(comment => `<article class="comment-chip"><strong>${escapeHtml(comment.author)}</strong><span>${escapeHtml(comment.text)}</span></article>`).join('');
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
        ${commentPreview ? `<div class="comment-list">${commentPreview}</div>` : `<div class="comment-list muted-comment">Aún no hay comentarios visibles. Sé el primero en aportar contexto.</div>`}
        <div class="action-row"><button class="primary-button" type="button" data-interact-post="${escapeHtml(post.id)}">${escapeHtml(post.cta)}</button><button class="soft-button ${saved ? 'is-saved' : ''}" type="button" data-save-artist="${escapeHtml(artist.id)}">${saved ? 'Guardado' : label}</button><button class="soft-button" type="button" data-share-artist="${escapeHtml(artist.id)}">Compartir cápsula</button></div>
      </article>
    `;
  }).join('');
  const playlist = state.playlist.map(artistById).filter(Boolean);
  qs('[data-playlist-list]').innerHTML = playlist.length ? playlist.map(artist => `
    <article class="list-item"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(artist.track)}</strong><span>${escapeHtml(artist.name)} · añadido por la comunidad</span></div></article>
  `).join('') : '<div class="empty-state">La playlist local todavía no tiene aportes.</div>';
  qs('[data-impact-box]').innerHTML = profile.role === 'company' ? `<strong>${playlist.length} señales comerciales</strong><p>El radar prioriza artistas con autorización y afinidad cultural para scouting responsable.</p>` : `<strong>${playlist.length} artistas visibles</strong><p>Cada aporte aparece como señal cultural para otros usuarios y aumenta la probabilidad de descubrimiento local.</p>`;
  const friendsNode = qs('[data-friend-activity]');
  if (friendsNode) friendsNode.innerHTML = DATA.friendActivity.map(item => `<article class="mini-card"><strong>${escapeHtml(item.name)} ${escapeHtml(item.action)}</strong><span>${escapeHtml(item.detail)}</span></article>`).join('');
  const notificationsNode = qs('[data-notification-list]');
  if (notificationsNode) notificationsNode.innerHTML = DATA.notifications.filter(item => !state.dismissedNotifications.includes(item.id || item.title)).slice(0, 2).map(item => `<article class="mini-card"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></article>`).join('') || '<article class="mini-card"><strong>Sin notificaciones pendientes</strong><span>Tu bandeja está limpia.</span></article>';
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
  const roleName = profile.role === 'company' ? 'Acceso empresarial' : profile.role === 'artist' ? 'Publicación musical' : profile.role === 'ambassador' || profile.roleLabel.toLowerCase().includes('embajador') ? 'Embajada cultural' : profile.roleLabel.toLowerCase().includes('curador') ? 'Curaduría local' : 'Descubrimiento musical';
  qs('[data-profile-overview]').innerHTML = `
    <div class="profile-hero-mini">
      <span class="avatar-shell large-avatar">${avatarMarkup(profile)}</span>
      <div><p class="eyebrow">Perfil activo</p><h2>${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.bio)}</p></div>
    </div>
    <div class="profile-panel-stack">
      <div class="tag-cloud"><span class="tag">${escapeHtml(profile.roleLabel)}</span><span class="tag">${escapeHtml(profile.city)}</span><span class="tag">${escapeHtml(profile.code || 'Cuenta creada')}</span></div>
      <div class="profile-metrics"><span><b>${savedCount}</b><small>Guardados</small></span><span><b>${likedCount}</b><small>Likes</small></span><span><b>${state.playlist.length}</b><small>Playlist</small></span><span><b>${invoiceCount}</b><small>Facturas</small></span></div>
      <div class="profile-summary-grid"><article class="mini-card"><strong>Sesión activa</strong><span>${state.isPlaying ? `Escuchando ${escapeHtml(activeArtist().track)}` : 'Lista para descubrir cápsulas locales'}</span></article><article class="mini-card"><strong>Permisos</strong><span>${state.acceptedLegal ? 'Autorizaciones registradas' : 'Autorizaciones pendientes'}</span></article><article class="mini-card"><strong>Rol diferencial</strong><span>${escapeHtml(roleName)}</span></article><article class="mini-card"><strong>Última cápsula</strong><span>${escapeHtml(activeArtist().track)} · ${escapeHtml(activeArtist().name)}</span></article></div>
      <div class="profile-activity-strip"><span class="status-chip">${escapeHtml(roleName)}</span><span class="status-chip">Cali</span><span class="status-chip">Célula A</span></div>
      <div class="profile-actions-row"><button class="soft-button" type="button" data-open-friends>Actividad de amigos</button><button class="soft-button" type="button" data-open-settings>Ajustes</button><button class="soft-button" type="button" data-open-ai>KORA AI</button></div>
    </div>
  `;
  qs('[data-role-workspace]').innerHTML = roleWorkspace(profile);
  qs('[data-privacy-list]').innerHTML = privacyCards(profile).map(item => `<article class="privacy-card"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join('');
}
function roleWorkspace(profile) {
  const playlistCards = (DATA.playlists || []).map(item => `<article class="playlist-card"><span class="list-cover">${imgMarkup(item.cover, item.name, '♪')}</span><div><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.mood)}</p><span class="tag">Curada por ${escapeHtml(item.curator)}</span></div></article>`).join('');
  if (profile.role === 'artist') {
    return `<div class="panel-head"><div><p class="eyebrow">Workspace artista</p><h2>Publicación y promoción</h2></div><span class="counter-pill">Licencia</span></div><p>Tu perfil tiene una pestaña separada para publicar música, subir cápsulas y controlar visibilidad empresarial.</p><div class="role-action-grid"><article class="role-feature"><strong>Cápsulas</strong><span>Publica adelantos de 30 segundos con historia y portada.</span></article><article class="role-feature"><strong>Métricas</strong><span>Revisa guardados, likes, reposts y señales culturales.</span></article><article class="role-feature"><strong>Visibilidad CM</strong><span>Decide si empresas autorizadas pueden analizar tu lanzamiento.</span></article></div><div class="role-work-actions"><button class="primary-button full" type="button" data-view-target="publish">Ir a publicar música</button><button class="soft-button full" type="button" data-open-ai>Generar copy de lanzamiento</button></div>`;
  }
  if (profile.role === 'company') {
    return `<div class="panel-head"><div><p class="eyebrow">Workspace empresa</p><h2>Scouting y analítica</h2></div><span class="counter-pill">CM</span></div><p>Marca artistas, compara señales y prepara contacto comercial sin acceder a datos no autorizados.</p><div class="company-radar-grid">${runtimeArtists().slice(0, 5).map(artist => `<article class="list-item"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(artist.name)}</strong><span>${artist.match}% afinidad · ${escapeHtml(artist.scene)}</span></div><button class="soft-button ${state.saved.includes(artist.id) ? 'is-active' : ''}" type="button" data-save-artist="${escapeHtml(artist.id)}">${state.saved.includes(artist.id) ? 'En radar' : 'Radar'}</button></article>`).join('')}</div><div class="role-action-grid"><article class="role-feature"><strong>Contacto</strong><span>Genera una lista de artistas marcados para campaña.</span></article><article class="role-feature"><strong>Riesgo legal</strong><span>Solo muestra visibilidad comercial autorizada.</span></article></div>`;
  }
  if (profile.role === 'ambassador' || profile.roleLabel.toLowerCase().includes('embajador')) {
    return `<div class="panel-head"><div><p class="eyebrow">Workspace embajadora</p><h2>Curaduría comunitaria</h2></div><span class="counter-pill">Comunidad</span></div><p>Organiza hallazgos, activa conversaciones y comparte cápsulas con contexto cultural.</p><div class="role-action-grid"><article class="role-feature"><strong>Tableros</strong><span>Crea rutas de escucha por barrio, mood o escena.</span></article><article class="role-feature"><strong>Amigos</strong><span>Comparte cápsulas y motiva aportes a playlists.</span></article><article class="role-feature"><strong>Contexto</strong><span>Agrega notas para que el descubrimiento no sea genérico.</span></article></div><div class="playlist-grid">${playlistCards}</div><button class="primary-button full" type="button" data-interact-post="post-4">Aportar a tablero visual</button>`;
  }
  if (profile.role === 'curator' || profile.roleLabel.toLowerCase().includes('curador')) {
    return `<div class="panel-head"><div><p class="eyebrow">Workspace curador</p><h2>Lectura crítica y tableros</h2></div><span class="counter-pill">Curaduría</span></div><p>Compara cápsulas, guarda contexto y crea recorridos digitales para otros oyentes.</p><div class="role-action-grid"><article class="role-feature"><strong>Notas</strong><span>Escribe aportes de lectura cultural en el feed.</span></article><article class="role-feature"><strong>Tableros</strong><span>Ordena música por escena, barrio y energía.</span></article><article class="role-feature"><strong>Compartir</strong><span>Envía hallazgos a amigos dentro de KORA.</span></article></div><div class="playlist-grid">${playlistCards}</div>`;
  }
  return `<div class="panel-head"><div><p class="eyebrow">Workspace usuario</p><h2>Amigos, chat y descubrimiento</h2></div><span class="counter-pill">Social</span></div><p>Crea tableros de hallazgos, guarda artistas y comparte cápsulas con tus amigos dentro de KORA.</p><div class="role-action-grid"><article class="role-feature"><strong>Chat musical</strong><span>Envía la cápsula activa a tus amigos y conversa sobre ella.</span></article><article class="role-feature"><strong>Playlists</strong><span>Arma rutas locales por mood, barrio o recomendación.</span></article><article class="role-feature"><strong>Guardados</strong><span>Construye tu memoria musical personal.</span></article></div><div class="playlist-grid">${playlistCards}</div><div class="role-work-actions"><button class="primary-button full" type="button" data-open-friends>Abrir amigos y chat</button><button class="soft-button full" type="button" data-save-current>Guardar cápsula actual</button></div>`;
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
  const pausedVisible = Boolean(state.lastPausedAt && Date.now() - state.lastPausedAt < 15000);
  clearTimeout(nowPlayingHideTimer);
  if (!state.isPlaying && !pausedVisible) {
    bar.hidden = true;
    bar.classList.remove('is-paused', 'is-fading');
    return;
  }
  bar.hidden = false;
  bar.classList.toggle('is-paused', !state.isPlaying);
  bar.classList.remove('is-fading');
  if (!state.isPlaying && state.lastPausedAt) {
    const remaining = Math.max(0, 15000 - (Date.now() - state.lastPausedAt));
    nowPlayingHideTimer = setTimeout(() => {
      bar.classList.add('is-fading');
      setTimeout(() => {
        bar.hidden = true;
        bar.classList.remove('is-paused', 'is-fading');
      }, 420);
    }, remaining);
  }
  const playIcon = state.isPlaying ? 'pause' : 'play';
  const playLabel = state.isPlaying ? 'Pausar' : 'Reproducir';
  bar.innerHTML = `
    <div class="mini-now-media"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div><strong>${escapeHtml(artist.track)}</strong><span>${escapeHtml(artist.name)} · ${formatTime(state.playback)}${state.isPlaying ? '' : ' · pausado'}</span></div></div>
    <div class="mini-now-controls"><button class="icon-button" type="button" data-prev-artist aria-label="Anterior">${svgIcon('prev')}</button><button class="primary-button play-toggle mini-play" type="button" data-toggle-play aria-label="${playLabel}">${svgIcon(playIcon)}<span class="visually-hidden">${playLabel}</span></button><button class="icon-button" type="button" data-next-artist aria-label="Siguiente">${svgIcon('next')}</button><button class="soft-button ${state.shuffle ? 'is-active' : ''}" type="button" data-toggle-shuffle>${svgIcon('shuffle')}<span>Aleatorio</span></button><button class="soft-button ${state.repeat ? 'is-active' : ''}" type="button" data-toggle-repeat>${svgIcon('repeat')}<span>Repetir</span></button></div>
    <div class="mini-now-actions"><button class="soft-button" type="button" data-repost-current>${svgIcon('repost')}<span>Repost</span></button><button class="soft-button" type="button" data-open-friends>${svgIcon('friends')}<span>Amigos</span></button><button class="soft-button" type="button" data-share-menu>${svgIcon('share')}<span>Compartir</span></button></div>
  `;
}

function showAiAssistant() {
  const artist = activeArtist();
  showModal(`<h2>KORA AI</h2><p>Estoy leyendo la cápsula activa y el contexto cultural para ayudarte a decidir rápido.</p><div class="ai-card"><strong>${escapeHtml(artist.track)} · ${escapeHtml(artist.name)}</strong><p>${escapeHtml(artist.story)}</p><span class="status-chip">Pregunta sugerida: ¿por qué este artista importa en Cali?</span></div><div class="settings-list"><button class="soft-button full" type="button" data-ai-action="recommend">Recomiéndame algo parecido</button><button class="soft-button full" type="button" data-ai-action="summary">Resume el contexto cultural</button><button class="soft-button full" type="button" data-ai-action="playlist">Crear playlist con este sonido</button></div><div class="ai-output" data-ai-output><strong>Listo para ayudarte.</strong><span>Elige una acción para generar una respuesta personalizada.</span></div><button class="primary-button full" type="button" data-close-modal>Cerrar</button>`);
}

function runAiAction(action) {
  const output = qs('[data-ai-output]');
  if (!output) return;
  const artist = activeArtist();
  output.classList.add('is-thinking');
  output.innerHTML = '<strong>KORA AI está escribiendo...</strong><span>Analizando sonido, barrio, afinidad y señales de guardado.</span>';
  setTimeout(() => {
    output.classList.remove('is-thinking');
    if (action === 'recommend') {
      const matches = runtimeArtists().filter(item => item.id !== artist.id).slice(0, 3);
      output.innerHTML = `<strong>Recomendación para seguir explorando</strong><span>Por tu cápsula activa, seguiría con ${matches.map(item => escapeHtml(item.track)).join(', ')}. Mantienen cercanía de escena, entrada rápida y lectura local clara.</span>`;
      return;
    }
    if (action === 'summary') {
      output.innerHTML = `<strong>Resumen cultural</strong><span>${escapeHtml(artist.track)} conecta ${escapeHtml(artist.neighborhood)} con ${escapeHtml(artist.scene)}. La señal principal es ${escapeHtml(artist.insight[0])}</span>`;
      return;
    }
    output.innerHTML = `<strong>Playlist creada</strong><span>Organicé una ruta con ${escapeHtml(artist.track)}, Barrio Norte y Tierra Sonora para combinar identidad local, descubrimiento rápido y alta probabilidad de guardado.</span>`;
  }, 850);
}

function showSharePanel() {
  const artist = activeArtist();
  showModal(`<h2>Compartir cápsula</h2><p>Elige cómo quieres compartir ${escapeHtml(artist.track)}.</p><div class="settings-list"><button class="soft-button full" type="button" data-open-friends>Compartir con amigos</button><button class="soft-button full" type="button">Copiar enlace de KORA</button><button class="soft-button full" type="button">Enviar a WhatsApp</button><button class="soft-button full" type="button">Publicar en Instagram</button><button class="soft-button full" type="button">Compartir en Facebook</button></div><button class="primary-button full" type="button" data-close-modal>Cerrar</button>`);
}

function showSettingsPanel() {
  const rows = DATA.settings.map((item, index) => `<article class="settings-row"><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></div><button class="switch-button ${settingEnabled(index) ? 'is-on' : ''}" type="button" data-toggle-setting="${index}"><span></span></button></article>`).join('');
  showModal(`<h2>Ajustes de KORA</h2><p>Personaliza la experiencia de reproducción, privacidad y comunidad.</p><div class="settings-list">${rows}</div><button class="primary-button full" type="button" data-close-modal>Guardar ajustes</button>`);
}

function settingEnabled(index) {
  const keys = ['notifications', 'privateMode', 'compactMode', 'highContrast', 'newPlaylist', 'helpCommunity', 'aboutKora'];
  const key = keys[index] || `setting${index}`;
  return Boolean(state.settingsState && state.settingsState[key]);
}

function toggleSetting(index) {
  const keys = ['notifications', 'privateMode', 'compactMode', 'highContrast', 'newPlaylist', 'helpCommunity', 'aboutKora'];
  const key = keys[index] || `setting${index}`;
  state.settingsState = { ...(state.settingsState || {}), [key]: !settingEnabled(index) };
  saveState();
  showSettingsPanel();
  toast(state.settingsState[key] ? 'Ajuste activado.' : 'Ajuste desactivado.');
}

function unreadNotifications() {
  return DATA.notifications.filter(item => !state.dismissedNotifications.includes(item.id || item.title));
}

function renderNotificationBadge() {
  const button = qs('[data-open-notifications].top-icon');
  if (!button) return;
  const count = unreadNotifications().length;
  let badge = qs('[data-notification-badge]', button);
  if (!badge) {
    badge = document.createElement('span');
    badge.dataset.notificationBadge = '';
    button.appendChild(badge);
  }
  badge.textContent = count > 9 ? '9+' : String(count);
  badge.hidden = count === 0;
}

function showNotificationsPanel() {
  const unread = unreadNotifications();
  const content = unread.length ? unread.map(item => `<article class="notification-card"><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></div><button class="soft-button" type="button" data-dismiss-notification="${escapeHtml(item.id || item.title)}">Cerrar</button></article>`).join('') : '<div class="empty-state">No tienes notificaciones pendientes.</div>';
  showModal(`<h2>Notificaciones</h2><p>Gestiona actualizaciones de cápsulas, playlists y autorizaciones.</p><div class="settings-list">${content}</div><button class="primary-button full" type="button" data-close-modal>Cerrar</button>`);
}

function dismissNotification(id) {
  if (!state.dismissedNotifications.includes(id)) state.dismissedNotifications.push(id);
  saveState();
  renderAll();
  showNotificationsPanel();
}

function showFriendsPanel() {
  const artist = activeArtist();
  const messages = state.friendMessages.length ? state.friendMessages.map(item => `<article class="chat-bubble"><strong>${escapeHtml(item.author)} → ${escapeHtml(item.friend)}</strong><span>${escapeHtml(item.text)}</span><small>${escapeHtml(item.track)}</small></article>`).join('') : '<div class="empty-state">Aún no has enviado música a tus amigos.</div>';
  const friends = DATA.friends.map(friend => `<option value="${escapeHtml(friend.name)}">${escapeHtml(friend.name)} · ${escapeHtml(friend.affinity)}</option>`).join('');
  showModal(`<h2>Amigos en KORA</h2><p>Comparte la cápsula activa y conversa dentro de la aplicación.</p><div class="friend-layout"><div class="settings-list">${DATA.friendActivity.map(item => `<article class="privacy-card"><strong>${escapeHtml(item.name)} ${escapeHtml(item.action)}</strong><p>${escapeHtml(item.detail)}</p></article>`).join('')}</div><form class="friend-chat-form" data-friend-chat-form><label>Amigo<select name="friend">${friends}</select></label><label>Mensaje<textarea name="message" data-friend-message-text>Escucha ${escapeHtml(artist.track)} de ${escapeHtml(artist.name)}. Creo que conecta con tu playlist local.</textarea></label><button class="primary-button full" type="submit">Enviar cápsula al chat</button></form></div><div class="chat-thread">${messages}</div><button class="soft-button full" type="button" data-close-modal>Cerrar</button>`);
}

function submitFriendMessage(form) {
  const data = new FormData(form);
  const artist = activeArtist();
  state.friendMessages.push({ author: activeProfile().name, friend: data.get('friend'), text: data.get('message'), track: artist.track, at: new Date().toLocaleString('es-CO') });
  if (!state.shared.includes(artist.id)) state.shared.push(artist.id);
  saveState();
  showFriendsPanel();
  toast('Cápsula enviada al chat de amigos.');
}

function showCommentComposer(postId) {
  const post = DATA.interactions.find(item => item.id === postId);
  if (!post) return;
  const artist = artistById(post.artistId) || activeArtist();
  showModal(`<h2>${escapeHtml(post.cta)}</h2><p>${escapeHtml(artist.name)} está esperando una señal de la comunidad sobre ${escapeHtml(post.title.toLowerCase())}.</p><form class="comment-form" data-comment-form data-post-id="${escapeHtml(postId)}"><div class="quick-comment-grid"><button class="soft-button" type="button" data-quick-comment="Me conecta por el barrio y la historia local.">Contexto local</button><button class="soft-button" type="button" data-quick-comment="Voto por la línea con más identidad caleña.">Voto cultural</button><button class="soft-button" type="button" data-quick-comment="Guardaría esta cápsula para compartirla con amigos.">Guardar y compartir</button><button class="soft-button" type="button" data-voice-comment>Grabar aporte de voz</button></div><label>Comentario<textarea name="comment" data-comment-text required placeholder="Escribe tu aporte, voto o comentario para el artista."></textarea></label><button class="primary-button full" type="submit">Publicar aporte</button></form><button class="soft-button full" type="button" data-close-modal>Cancelar</button>`);
}

function submitComment(form) {
  const postId = form.dataset.postId;
  const text = new FormData(form).get('comment').trim();
  if (!text) return;
  const profile = activeProfile();
  state.comments[postId] = state.comments[postId] || [];
  state.comments[postId].push({ author: profile.name, text, at: new Date().toLocaleString('es-CO') });
  state.interactions[postId] = (state.interactions[postId] || 0) + 1;
  saveState();
  closeModal();
  renderInteraction();
  toast('Tu comentario quedó publicado en el feed.');
}

function applyQuickComment(text) {
  const area = qs('[data-comment-text]');
  if (!area) return;
  area.value = text;
  area.focus();
}

function applyVoiceComment() {
  const area = qs('[data-comment-text]');
  if (!area) return;
  area.value = 'Aporte de voz: esta cápsula tiene una entrada clara y representa bien la escena local.';
  toast('Grabación simulada añadida como aporte de voz.');
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
  renderNotificationBadge();
}

function showLegalGate(force = false) {
  const overlay = qs('[data-consent-overlay]');
  if (!force && state.acceptedLegal) {
    overlay.hidden = true;
    return;
  }
  overlay.hidden = false;
  const form = qs('[data-consent-form]');
  const draft = state.legalDraft || defaultState.legalDraft;
  ['terms', 'privacy', 'roleData'].forEach(name => {
    form.elements[name].checked = Boolean(draft[name]);
  });
  qs('.consent-submit', form).disabled = !['terms', 'privacy', 'roleData'].every(name => form.elements[name].checked);
}

function handleConsentForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const valid = ['terms', 'privacy', 'roleData'].every(name => form.elements[name].checked);
  if (!valid) return;
  state.acceptedLegal = true;
  state.acceptedAt = new Date().toISOString();
  state.legalDraft = { terms: true, privacy: true, roleData: true };
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


function carouselUnit() {
  const track = qs('[data-capsule-grid]');
  if (!track) return 0;
  return track.scrollWidth / 3;
}

function prepareCapsuleLoop(force = false) {
  const track = qs('[data-capsule-grid]');
  if (!track) return;
  const unit = carouselUnit();
  if (!unit) return;
  if (force && !track.dataset.loopReady) {
    track.scrollLeft = unit;
    track.dataset.loopReady = 'true';
    return;
  }
  if (track.scrollLeft < unit * 0.45) track.scrollLeft += unit;
  if (track.scrollLeft > unit * 1.55) track.scrollLeft -= unit;
}

function scrollCapsules(direction) {
  const track = qs('[data-capsule-grid]');
  if (!track) return;
  prepareCapsuleLoop();
  const firstCard = qs('.capsule-card', track);
  const amount = firstCard ? firstCard.getBoundingClientRect().width + 16 : Math.max(240, Math.floor(track.clientWidth * 0.72));
  track.scrollBy({ left: amount * direction, behavior: 'smooth' });
  setTimeout(() => prepareCapsuleLoop(), 460);
}

function autoRotateDiscover() {
  const discover = qs('[data-view="discover"]');
  if (!discover || !discover.classList.contains('is-active') || state.isPlaying) return;
  setCurrentArtist(Math.floor(Math.random() * runtimeArtists().length));
}

function updateFileLabel(input) {
  const label = qs(`[data-file-label="${input.name}"]`);
  if (!label) return;
  label.textContent = input.files && input.files[0] ? input.files[0].name : input.name === 'audio' ? 'Seleccionar audio' : 'Seleccionar portada';
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
  if (target.dataset.capsuleNext !== undefined) scrollCapsules(1);
  if (target.dataset.capsulePrev !== undefined) scrollCapsules(-1);
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
    if (artist) state.currentArtist = runtimeArtists().findIndex(item => item.id === artist.id);
    saveState();
    renderAll();
    if (artist) showSharePanel();
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
  if (target.dataset.interactPost) showCommentComposer(target.dataset.interactPost);
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
  if (target.dataset.aiAction) runAiAction(target.dataset.aiAction);
  if (target.dataset.quickComment) applyQuickComment(target.dataset.quickComment);
  if (target.dataset.voiceComment !== undefined) applyVoiceComment();
  if (target.dataset.dismissNotification) dismissNotification(target.dataset.dismissNotification);
  if (target.dataset.toggleSetting !== undefined) toggleSetting(Number(target.dataset.toggleSetting));
  if (target.dataset.openSettings !== undefined) showSettingsPanel();
  if (target.dataset.openNotifications !== undefined) showNotificationsPanel();
  if (target.dataset.openFriends !== undefined) showFriendsPanel();
  if (target.dataset.closeModal !== undefined) closeModal();
}

function bindEvents() {
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('submit', event => {
    if (event.target.dataset.commentForm !== undefined) {
      event.preventDefault();
      submitComment(event.target);
    }
    if (event.target.dataset.friendChatForm !== undefined) {
      event.preventDefault();
      submitFriendMessage(event.target);
    }
  });
  qs('[data-consent-form]').addEventListener('submit', handleConsentForm);
  qs('[data-consent-form]').addEventListener('change', event => {
    const form = event.currentTarget;
    state.legalDraft = {
      terms: form.elements.terms.checked,
      privacy: form.elements.privacy.checked,
      roleData: form.elements.roleData.checked
    };
    saveState();
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
  qsa('.file-picker input[type="file"]').forEach(input => input.addEventListener('change', () => updateFileLabel(input)));
}

renderAll();
bindEvents();
showLegalGate();
setInterval(autoRotateDiscover, 45000);
