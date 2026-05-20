const DATA = window.KORA_DATA;
const STORAGE_KEY = 'kora-corte3-state';
const CREATED_KEY = 'kora-created-profiles';
const defaultState = {
  uiVersion: 10,
  profileId: 'luna',
  acceptedLegal: false,
  acceptedAt: null,
  onboardingSeen: false,
  onboardingSnoozedUntil: 0,
  legalRole: null,
  viewGuidesSeen: {},
  viewGuideSnoozed: {},
  discoverSummaryCollapsed: false,
  savedMeta: {},
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
  communityEvents: [],
  scoutingLog: [],
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
    if (parsed.uiVersion !== 10) {
      parsed.uiVersion = 10;
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

function roleDefinition(profile) {
  const roles = DATA.roleSystem || {};
  return roles[profile.role] || roles.user || { label: profile.roleLabel || 'Explorador musical', action: 'Descubrir', purpose: 'Participa en el descubrimiento musical local.', accountState: 'Explorando Cali', accountMeta: 'Guardados, playlists y actividad protegidos.', profileAxis: 'Descubrimiento musical', interactionHeadline: 'Interacción con artistas, curadores y escena local.', interactionCta: 'Sumar a playlist local', saveLabel: 'Guardar artista', impactTitle: 'artistas visibles', impactBody: 'Cada aporte aparece como señal cultural para otros usuarios.', workspace: { eyebrow: 'Rol', title: profile.roleLabel || 'Explorador musical', badge: 'KORA', intro: 'Participa en el ecosistema musical local.', features: [], actions: [] }, privacy: [] };
}


function roleLegalCopy(profile) {
  const role = profile?.role || 'user';
  const legal = DATA.roleLegal || {};
  return legal[role] || legal.user || { title: 'Autorizaciones KORA', lead: 'Acepta las condiciones para continuar.', terms: 'Acepto las condiciones de uso de KORA.', privacy: 'Autorizo el tratamiento de datos personales necesario para usar KORA.', roleData: 'Acepto el tratamiento de datos asociado a mi rol.' };
}

function legalDocLink(doc, label) {
  return `<a href="legal.html?doc=${escapeHtml(doc)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
}

function legalConsentCopy(roleLegal) {
  return {
    terms: `He leído y acepto los ${legalDocLink('terms', 'Términos y Condiciones')} de KORA. ${escapeHtml(roleLegal.terms)}`,
    privacy: `Acepto la ${legalDocLink('privacy', 'Autorización de Tratamiento de Datos Personales')}. ${escapeHtml(roleLegal.privacy)}`,
    roleData: `${escapeHtml(roleLegal.roleData)} Consulta también la ${legalDocLink('license', 'Licencia Musical')} y las ${legalDocLink('payments', 'condiciones de pago')} cuando apliquen.`
  };
}

function currentView() {
  const active = qs('.view.is-active');
  return active?.dataset.view || 'discover';
}

function viewGuideKey(view) {
  return `${activeProfile().role}:${view}`;
}

function viewGuideCopy(view) {
  const profile = activeProfile();
  const role = roleDefinition(profile);
  const guide = (DATA.viewGuides || {})[view] || (DATA.viewGuides || {}).discover || { eyebrow: 'Guía KORA', title: 'Qué vas a encontrar', body: 'Esta sección te ayuda a participar en KORA.', roleNotes: {} };
  const roleNote = guide.roleNotes?.[profile.role] || role.purpose;
  return { ...guide, roleNote, roleLabel: role.label, roleAction: role.action };
}

function savedReason(artist) {
  if (!artist) return 'Conectó con tu escena local.';
  const prompts = DATA.memoryPrompts || [];
  if (artist.tags?.length) return `Conectó con ${artist.tags.slice(0, 2).join(' y ')}.`;
  return prompts[Math.abs(String(artist.id || '').length) % prompts.length] || 'Conectó con tu escena local.';
}

function formatMemoryDate(value) {
  if (!value) return 'Guardado recientemente';
  const elapsed = Date.now() - new Date(value).getTime();
  if (elapsed < 60000) return 'Guardado hace un momento';
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 60) return `Guardado hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Guardado hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Guardado hace ${days} d`;
}

function memoryReminderItems() {
  return state.saved.map(id => {
    const artist = artistById(id);
    if (!artist) return null;
    const meta = state.savedMeta?.[id] || {};
    return {
      id: `memory-${id}`,
      title: `Vuelve a escuchar ${artist.track}`,
      body: meta.note ? `Tu nota: ${meta.note}` : `Lo guardaste porque ${meta.reason || savedReason(artist)}`,
      artistId: id,
      memory: true,
      type: 'memory'
    };
  }).filter(Boolean);
}

function formatCommunityTime(value) {
  if (!value) return 'Ahora';
  const elapsed = Date.now() - new Date(value).getTime();
  if (elapsed < 60000) return 'Ahora';
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

function communityTypeLabel(type) {
  return DATA.communityTypes?.[type] || 'Comunidad';
}

function addCommunityEvent(type, artist, options = {}) {
  if (!state.communityEvents) state.communityEvents = [];
  const profile = activeProfile();
  const role = roleDefinition(profile);
  const safeArtist = artist || activeArtist();
  const titleByType = {
    save: `${profile.name} guardó ${safeArtist.track}`,
    comment: `${profile.name} comentó un hallazgo`,
    repost: `${profile.name} reposteó ${safeArtist.track}`,
    share: `${profile.name} compartió ${safeArtist.track}`,
    playlist: `${profile.name} sumó ${safeArtist.track} a la playlist local`,
    publish: `${profile.name} publicó una nueva cápsula`,
    curator: `${profile.name} dejó una señal curatorial`,
    context: `${profile.name} agregó contexto cultural`,
    scout: `${profile.name} registró una revisión responsable`
  };
  const bodyByType = {
    save: `${safeArtist.name} ahora aparece como señal de memoria musical para la comunidad.`,
    comment: options.text || `La conversación suma criterio social sobre ${safeArtist.track}.`,
    repost: `El hallazgo queda visible para amigos, curadores y escena local.`,
    share: `La cápsula viaja con contexto, no solo como enlace suelto.`,
    playlist: `La playlist colaborativa crece con una señal humana de descubrimiento.`,
    publish: `${safeArtist.name} ya tiene una cápsula disponible para escuchar, guardar y comentar.`,
    curator: `La recomendación ayuda a otros usuarios a decidir con razones.`,
    context: `El aporte conecta música, barrio y memoria cultural.`,
    scout: `La revisión queda registrada como scouting responsable con límites de datos autorizados.`
  };
  state.communityEvents.unshift({
    id: `event-${Date.now()}-${String(Math.random()).slice(2, 7)}`,
    type,
    actor: profile.name,
    actorId: profile.id,
    role: role.label,
    roleAction: role.action,
    artistId: safeArtist.id,
    artistName: safeArtist.name,
    track: safeArtist.track,
    postId: options.postId || '',
    title: options.title || titleByType[type] || `${profile.name} participó en KORA`,
    body: options.body || bodyByType[type] || role.purpose,
    note: options.note || '',
    at: new Date().toISOString(),
    notification: options.notification !== false
  });
  state.communityEvents = state.communityEvents.slice(0, 40);
}

function communityNotificationItems() {
  return (state.communityEvents || []).filter(item => item.notification).map(item => ({
    id: `community-${item.id}`,
    title: item.title,
    body: item.body,
    artistId: item.artistId,
    postId: item.postId,
    community: true,
    type: item.type,
    actor: item.actor
  }));
}

function communityActivityCards(limit = 6) {
  const events = (state.communityEvents || []).filter(item => !notificationBelongsToActiveProfile(item)).slice(0, limit);
  if (!events.length) {
    const active = activeProfileNameParts();
    return DATA.friendActivity.filter(item => {
      const name = String(item.name || '').trim().toLowerCase();
      return name !== active.firstName && name !== active.fullName;
    }).map(item => `<article class="mini-card"><strong>${escapeHtml(item.name)} ${escapeHtml(item.action)}</strong><span>${escapeHtml(item.detail)}</span></article>`).join('');
  }
  return events.map(item => `<article class="mini-card community-mini"><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></div><small>${escapeHtml(communityTypeLabel(item.type))} · ${escapeHtml(formatCommunityTime(item.at))}</small></article>`).join('');
}

function communitySignalPanel() {
  const events = state.communityEvents || [];
  const comments = Object.values(state.comments || {}).reduce((total, list) => total + list.length, 0);
  const reposts = state.reposted.length;
  const saves = state.saved.length;
  const playlist = state.playlist.length;
  const signals = DATA.communitySignals || [];
  return `<article class="panel-card community-overview"><div class="panel-head"><div><p class="eyebrow">Comunidad activa</p><h2>Lo que pasa alrededor de la música</h2></div><span class="counter-pill">${events.length} señales</span></div><div class="community-metrics"><span><b>${saves}</b><small>Guardados</small></span><span><b>${comments}</b><small>Comentarios</small></span><span><b>${reposts}</b><small>Reposts</small></span><span><b>${playlist}</b><small>Playlist</small></span></div><div class="community-signal-grid">${signals.map(item => `<article class="role-feature"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></article>`).join('')}</div></article>`;
}

function roleFeatureCards(features) {
  return (features || []).map(item => `<article class="role-feature"><strong>${escapeHtml(item[0])}</strong><span>${escapeHtml(item[1])}</span></article>`).join('');
}

function roleActionButtons(actions) {
  return (actions || []).map(item => {
    const className = item[0] === 'primary' ? 'primary-button full' : 'soft-button full';
    const label = escapeHtml(item[1]);
    const action = item[2] || '';
    if (action.startsWith('view:')) return `<button class="${className}" type="button" data-view-target="${escapeHtml(action.slice(5))}">${label}</button>`;
    if (action.startsWith('interactPost:')) return `<button class="${className}" type="button" data-interact-post="${escapeHtml(action.slice(13))}">${label}</button>`;
    if (action === 'openFriends') return `<button class="${className}" type="button" data-open-friends>${label}</button>`;
    if (action === 'saveCurrent') return `<button class="${className}" type="button" data-save-current>${label}</button>`;
    if (action === 'openAi') return `<button class="${className}" type="button" data-open-ai>${label}</button>`;
    return `<button class="${className}" type="button">${label}</button>`;
  }).join('');
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
  setTimeout(() => maybeShowViewGuide(view), 420);
}

function renderProfileChrome() {
  const profile = activeProfile();
  const role = roleDefinition(profile);
  const isArtist = profile.role === 'artist';
  document.body.classList.toggle('is-artist', isArtist);
  qsa('[data-role-nav="artist"]').forEach(node => node.classList.toggle('hidden', !isArtist));
  qsa('[data-profile-name]').forEach(node => node.textContent = profile.name);
  qsa('[data-profile-role]').forEach(node => node.textContent = role.label);
  qsa('[data-profile-initial]').forEach(node => node.textContent = profile.initial || profile.name.slice(0, 1));
  qsa('[data-profile-avatar]').forEach(node => {
    node.src = profile.avatar || '';
    node.alt = profile.name;
    node.classList.toggle('is-hidden', !profile.avatar);
  });
  qs('[data-account-state]').textContent = state.accountHidden ? 'Perfil oculto' : role.accountState;
  qs('[data-account-meta]').textContent = role.accountMeta;
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
  const track = qs('[data-capsule-grid]');
  track.innerHTML = artists.map((artist, index) => {
    const saved = state.saved.includes(artist.id);
    const active = index === state.currentArtist;
    return `
      <article class="capsule-card tone-${escapeHtml(artist.tone || 'sunset')} ${active ? 'is-active' : ''}" data-loop-card="${index}">
        <div class="capsule-cover tone-surface">${imgMarkup(artist.cover, artist.track, artist.symbol)}</div>
        <div>
          <p class="eyebrow">${escapeHtml(artist.scene)}</p>
          <h3>${escapeHtml(artist.track)}</h3>
          <p>${escapeHtml(artist.name)} · ${escapeHtml(artist.genre)}</p>
        </div>
        <div class="tag-row"><span class="tag">${escapeHtml(artist.neighborhood)}</span><span class="tag">${artist.match}% match</span><span class="tag">${escapeHtml(artist.language)}</span></div>
        <div class="action-row">
          <button class="soft-button" type="button" data-select-artist="${index}">Ver</button>
          <button class="soft-button ${saved ? 'is-active' : ''}" type="button" data-save-artist="${escapeHtml(artist.id)}">${saved ? 'Guardado' : 'Guardar'}</button>
        </div>
      </article>
    `;
  }).join('');
  requestAnimationFrame(() => scrollActiveCapsuleIntoView(false));
}

function renderSaved() {
  if (!state.savedMeta) state.savedMeta = {};
  const savedArtists = state.saved.map(artistById).filter(Boolean);
  qs('[data-saved-count]').textContent = savedArtists.length;
  qs('[data-saved-board]').innerHTML = savedArtists.length ? savedArtists.map(artist => {
    const meta = state.savedMeta[artist.id] || {};
    const reason = meta.reason || savedReason(artist);
    return `
    <article class="list-item memory-card">
      <span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span>
      <div class="list-item-content memory-content">
        <strong>${escapeHtml(artist.name)}</strong>
        <span>${escapeHtml(artist.track)} · ${escapeHtml(artist.neighborhood)}</span>
        <small>${escapeHtml(formatMemoryDate(meta.savedAt))}</small>
        <p>Lo guardaste porque ${escapeHtml(reason)}</p>
        ${meta.note ? `<em>${escapeHtml(meta.note)}</em>` : `<em>Sin nota personal todavía.</em>`}
      </div>
      <div class="memory-actions">
        <button class="primary-button" type="button" data-replay-saved="${escapeHtml(artist.id)}">Vuelve a escuchar</button>
        <button class="soft-button" type="button" data-open-save-note="${escapeHtml(artist.id)}">Nota</button>
        <button class="soft-button" type="button" data-remove-saved="${escapeHtml(artist.id)}">Quitar</button>
      </div>
    </article>
  `}).join('') : '<div class="empty-state">Todavía no tienes hallazgos guardados. Cuando guardes una cápsula, KORA recordará por qué conectó contigo.</div>';
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
  const artist = artistById(id);
  if (!artist) return;
  if (!state.savedMeta) state.savedMeta = {};
  if (state.saved.includes(id)) {
    state.saved = state.saved.filter(item => item !== id);
    delete state.savedMeta[id];
    saveState();
    renderAll();
    toast('Hallazgo retirado de tu tablero.');
    return;
  }
  state.saved.push(id);
  state.savedMeta[id] = {
    savedAt: new Date().toISOString(),
    reason: savedReason(artist),
    note: '',
    reminderAt: Date.now() + 86400000
  };
  addCommunityEvent('save', artist, { body: `${activeProfile().name} guardó ${artist.track} porque ${savedReason(artist)}` });
  saveState();
  renderAll();
  toast('Hallazgo guardado. También aparece como señal comunitaria.');
}

function removeSaved(id) {
  state.saved = state.saved.filter(item => item !== id);
  if (state.savedMeta) delete state.savedMeta[id];
  saveState();
  renderAll();
}

function replaySaved(id) {
  const index = runtimeArtists().findIndex(item => item.id === id);
  if (index >= 0) {
    setCurrentArtist(index);
    setView('player');
    toast('Hallazgo abierto para volver a escucharlo.');
  }
}

function showSaveNote(id) {
  const artist = artistById(id);
  if (!artist) return;
  const meta = state.savedMeta?.[id] || {};
  showModal(`<h2>Nota para ${escapeHtml(artist.track)}</h2><p>Agrega una razón breve para recordar por qué guardaste este hallazgo.</p><form class="settings-list" data-save-note-form="${escapeHtml(id)}"><label>Nota personal<textarea name="note" maxlength="160">${escapeHtml(meta.note || '')}</textarea></label><button class="primary-button full" type="submit">Guardar nota</button><button class="soft-button full" type="button" data-close-modal>Cerrar</button></form>`);
}

function submitSaveNote(form) {
  const id = form.dataset.saveNoteForm;
  const artist = artistById(id);
  if (!artist) return;
  if (!state.savedMeta) state.savedMeta = {};
  state.savedMeta[id] = { ...(state.savedMeta[id] || {}), savedAt: state.savedMeta[id]?.savedAt || new Date().toISOString(), reason: state.savedMeta[id]?.reason || savedReason(artist), note: new FormData(form).get('note').trim(), reminderAt: Date.now() + 86400000 };
  saveState();
  closeModal();
  renderAll();
  toast('Nota guardada en tu memoria musical.');
}

function repostArtist(id) {
  const artist = artistById(id) || activeArtist();
  if (state.reposted.includes(artist.id)) {
    state.reposted = state.reposted.filter(item => item !== artist.id);
    toast('Repost retirado de tu perfil.');
  } else {
    state.reposted.push(artist.id);
    addCommunityEvent('repost', artist);
    toast(`Reposteaste ${artist.track} en tu actividad comunitaria.`);
  }
  saveState();
  renderAll();
}

function repostCurrent() {
  repostArtist(activeArtist().id);
}

function shareCurrent() {
  const artist = activeArtist();
  if (!state.shared.includes(artist.id)) state.shared.push(artist.id);
  addCommunityEvent('share', artist, { notification: false });
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
  const role = roleDefinition(profile);
  const headline = qs('[data-view="interaction"] .section-heading h1');
  const cta = qs('[data-add-playlist]');
  if (headline) headline.textContent = role.interactionHeadline;
  if (cta) cta.textContent = role.interactionCta;
  const posts = profile.role === 'company' ? DATA.interactions.slice().reverse() : DATA.interactions;
  const feedHtml = posts.map(post => {
    const artist = artistById(post.artistId) || DATA.artists[0];
    const postComments = state.comments[post.id] || [];
    const count = (state.interactions[post.id] || 0) + postComments.length;
    const saved = state.saved.includes(artist.id);
    const reposted = state.reposted.includes(artist.id);
    const communityForArtist = (state.communityEvents || []).filter(item => item.artistId === artist.id).length;
    const commentPreview = postComments.slice(-3).map(comment => `<article class="comment-chip"><div><strong>${escapeHtml(comment.author)}</strong><small>${escapeHtml(comment.role || 'Comunidad')} · ${escapeHtml(comment.at || 'Ahora')}</small></div><span>${escapeHtml(comment.text)}</span></article>`).join('');
    return `
      <article class="feed-card tone-${escapeHtml(artist.tone || 'sunset')}">
        <div class="feed-top">
          <div class="feed-author">
            <span class="list-cover tone-surface">${imgMarkup(artist.avatar || artist.cover, artist.name, artist.symbol)}</span>
            <div class="feed-author-text"><strong>${escapeHtml(artist.name)}</strong><span>${escapeHtml(post.type)} · ${escapeHtml(artist.neighborhood)}</span></div>
          </div>
          <span class="counter-pill">${count + communityForArtist} señales</span>
        </div>
        <div class="feed-body"><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.body)}</p></div>
        <div class="community-tags"><span>${escapeHtml(post.type)}</span><span>${postComments.length} comentarios</span><span>${communityForArtist} movimientos</span><span>${escapeHtml(artist.scene)}</span></div>
        ${commentPreview ? `<div class="comment-list">${commentPreview}</div>` : `<div class="comment-list muted-comment">Aún no hay comentarios visibles. Sé el primero en aportar contexto, criterio o memoria local.</div>`}
        <div class="action-row"><button class="primary-button" type="button" data-interact-post="${escapeHtml(post.id)}">${escapeHtml(post.cta)}</button><button class="soft-button ${saved ? 'is-saved' : ''}" type="button" data-save-artist="${escapeHtml(artist.id)}">${saved ? 'Guardado' : escapeHtml(role.saveLabel)}</button><button class="soft-button ${reposted ? 'is-active' : ''}" type="button" data-repost-artist="${escapeHtml(artist.id)}">${reposted ? 'Reposteado' : 'Repostear'}</button><button class="soft-button" type="button" data-share-artist="${escapeHtml(artist.id)}">Compartir cápsula</button></div>
      </article>
    `;
  }).join('');
  qs('[data-artist-feed]').innerHTML = `${communitySignalPanel()}${feedHtml}`;
  const playlist = state.playlist.map(artistById).filter(Boolean);
  qs('[data-playlist-list]').innerHTML = playlist.length ? playlist.map(artist => `
    <article class="list-item"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(artist.track)}</strong><span>${escapeHtml(artist.name)} · añadido por la comunidad</span></div><button class="soft-button" type="button" data-repost-artist="${escapeHtml(artist.id)}">Repost</button></article>
  `).join('') : '<div class="empty-state">La playlist local todavía no tiene aportes.</div>';
  qs('[data-impact-box]').innerHTML = `<strong>${playlist.length} ${escapeHtml(role.impactTitle)}</strong><p>${escapeHtml(role.impactBody)}</p><div class="community-trail">${communityActivityCards(3)}</div>`;
  const friendsNode = qs('[data-friend-activity]');
  if (friendsNode) friendsNode.innerHTML = communityActivityCards(5);
  const notificationsNode = qs('[data-notification-list]');
  if (notificationsNode) notificationsNode.innerHTML = unreadNotifications().slice(0, 4).map(item => `<article class="mini-card"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></article>`).join('') || '<article class="mini-card"><strong>Sin notificaciones pendientes</strong><span>Tu bandeja está limpia.</span></article>';
}

function ecosystemConfig() {
  return DATA.ecosystemPanels || {
    title: 'Herramientas del ecosistema KORA',
    body: 'Artistas, empresas y usuarios participan con permisos claros, métricas visibles y funciones separadas por rol.',
    artist: { eyebrow: 'Workspace artista', title: 'Publicación y seguimiento del artista', badge: 'Herramientas de artista', body: 'Publicación, métricas, licencia y autorización de visibilidad.', items: ['Publicaciones', 'Métricas', 'Licencia', 'Autorización'] },
    company: { eyebrow: 'Radar empresarial', title: 'Scouting con datos autorizados', badge: 'Acceso controlado', body: 'Radar, escenas activas y scouting responsable.', items: ['Radar', 'Escenas', 'Métricas', 'Límites'] }
  };
}

function phasePrototypePanel(type) {
  const ecosystem = ecosystemConfig();
  const block = ecosystem[type] || ecosystem.artist;
  const items = block.items || [];
  return `
    <div class="phase-panel-layout">
      <div>
        <p class="eyebrow">${escapeHtml(block.eyebrow)}</p>
        <h2>${escapeHtml(block.title)}</h2>
        <p>${escapeHtml(block.body)}</p>
        <div class="tag-cloud">${items.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div>
      </div>
      <aside class="phase-validation-note">
        <span class="counter-pill">${escapeHtml(block.badge)}</span>
        <strong>${escapeHtml(ecosystem.title)}</strong>
        <p>${escapeHtml(ecosystem.body)}</p>
      </aside>
    </div>
  `;
}

function renderPrototypePanels() {
  const artistPanel = qs('[data-artist-prototype-panel]');
  if (artistPanel) artistPanel.innerHTML = phasePrototypePanel('artist');
  const companyPanel = qs('[data-company-prototype-panel]');
  if (companyPanel) companyPanel.innerHTML = phasePrototypePanel('company');
}

function renderDiscoverSummary() {
  const card = qs('[data-discover-summary]');
  if (!card) return;
  const collapsed = Boolean(state.discoverSummaryCollapsed);
  card.classList.toggle('is-collapsed', collapsed);
  const button = qs('[data-toggle-discover-summary]');
  const label = qs('[data-discover-summary-label]');
  const content = qs('[data-discover-summary-content]');
  if (button) button.setAttribute('aria-expanded', String(!collapsed));
  if (label) label.textContent = collapsed ? 'Mostrar' : 'Ocultar';
  if (content) content.hidden = collapsed;
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


function profilePlanId(profile = activeProfile()) {
  if (profile.planId) return profile.planId;
  const roleMap = { user: 'free', curator: 'premium', ambassador: 'premium', artist: 'artist', company: 'company' };
  return roleMap[profile.role] || 'free';
}

function profilePlan(profile = activeProfile()) {
  return DATA.plans.find(plan => plan.id === profilePlanId(profile)) || DATA.plans[0];
}

function renderBilling() {
  const profile = activeProfile();
  const activePlan = profilePlan(profile);
  qs('[data-plan-grid]').innerHTML = DATA.plans.map(plan => {
    const isCurrent = plan.id === activePlan.id;
    return `
    <article class="plan-card ${isCurrent ? 'is-current-plan' : ''}">
      <p class="eyebrow">${escapeHtml(plan.audience)}</p>
      <h2>${escapeHtml(plan.name)}</h2>
      <div class="tag-row"><span class="status-chip">${escapeHtml(plan.badge)}</span>${isCurrent ? '<span class="status-chip">Plan activo</span>' : ''}</div>
      <div class="plan-price">${plan.price ? money(plan.price) : 'Sin costo'}</div>
      <div class="stack-list">${plan.features.map(feature => `<div class="privacy-card">${escapeHtml(feature)}</div>`).join('')}</div>
      ${plan.note ? `<p class="support-copy">${escapeHtml(plan.note)}</p>` : ''}
      <button class="soft-button full" type="button" data-select-plan="${escapeHtml(plan.id)}">${isCurrent ? 'Usar este plan' : 'Elegir plan'}</button>
    </article>
  `;
  }).join('');
  const paidPlans = DATA.plans.filter(plan => plan.price > 0);
  qs('[data-plan-select]').innerHTML = paidPlans.map(plan => `<option value="${escapeHtml(plan.id)}">${escapeHtml(plan.name)} · ${money(plan.price)}</option>`).join('');
  if (activePlan.price > 0) qs('[data-plan-select]').value = activePlan.id;
  qs('[data-invoice-count]').textContent = state.invoices.length;
  qs('[data-invoice-list]').innerHTML = state.invoices.length ? state.invoices.slice().reverse().map(invoice => `
    <article class="invoice-card"><strong>${escapeHtml(invoice.number)}</strong><p>${escapeHtml(invoice.planName)} · ${money(invoice.total)} · ${escapeHtml(invoice.paidAt)}</p><span class="status-chip">Factura electrónica generada</span></article>
  `).join('') : '<div class="empty-state">Aún no hay facturas registradas.</div>';
  qs('[data-company-access-panel]').innerHTML = profile.role === 'company' ? `
    <div class="panel-head"><div><p class="eyebrow">Acceso empresas CM</p><h2>Datos disponibles por autorización</h2></div><span class="counter-pill">${escapeHtml(activePlan.name)}</span></div>
    <div class="tag-cloud"><span class="tag">Métricas agregadas</span><span class="tag">Artistas visibles</span><span class="tag">Límites de uso</span><span class="tag">Acceso controlado</span></div>
    <p>El acceso empresarial se limita a artistas que autorizaron visibilidad o análisis de perfil. La información se presenta para scouting responsable, no para contacto automático ni cesión irrestricta de datos.</p>
    <div class="phase-mini-grid"><article class="mini-card"><strong>Qué puede ver</strong><span>Match cultural, escena, guardados agregados y señales comunitarias.</span></article><article class="mini-card"><strong>Qué no puede ver</strong><span>Datos privados, contacto directo o información no autorizada por artistas.</span></article></div>
  ` : `
    <div class="panel-head"><div><p class="eyebrow">Plan asociado</p><h2>${escapeHtml(activePlan.name)} para ${escapeHtml(profile.name)}</h2></div><span class="counter-pill">${activePlan.price ? money(activePlan.price) : 'Sin costo'}</span></div>
    <p>Este perfil tiene un plan sugerido según su rol. Puedes cambiarlo en el selector de pago para generar una factura o probar otro modelo de suscripción.</p>
    <div class="phase-mini-grid"><article class="mini-card"><strong>Beneficio principal</strong><span>${escapeHtml(activePlan.features[0] || 'Acceso a KORA')}</span></article><article class="mini-card"><strong>Alcance comercial</strong><span>${escapeHtml(activePlan.note || 'Condiciones visibles antes del pago.')}</span></article></div>
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
  showModal(`<h2>Pago registrado</h2><div class="invoice-card"><strong>${escapeHtml(invoice.number)}</strong><p>${escapeHtml(invoice.planName)}</p><p>Subtotal: ${money(invoice.subtotal)}<br>IVA incluido: ${money(invoice.tax)}<br>Total: ${money(invoice.total)}</p><span class="status-chip">Enviada a ${escapeHtml(invoice.email)}</span></div><div class="legal-note">Comprobante generado para la demostración. Las condiciones comerciales, retracto, reversión y alcance por rol están documentados en la sección legal.</div><button class="primary-button full" type="button" data-close-modal>Entendido</button>`);
  form.reset();
}

function renderProfile() {
  const profile = activeProfile();
  const role = roleDefinition(profile);
  const summary = profileRoleSummary(profile);
  qs('[data-profile-overview]').innerHTML = `
    <div class="profile-hero-mini role-profile-hero">
      <span class="avatar-shell large-avatar">${avatarMarkup(profile)}</span>
      <div><p class="eyebrow">Perfil activo · ${escapeHtml(role.action)}</p><h2>${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.bio || role.purpose)}</p></div>
    </div>
    <div class="profile-panel-stack">
      <div class="tag-cloud"><span class="tag">${escapeHtml(role.label)}</span><span class="tag">${escapeHtml(profile.city)}</span><span class="tag">${escapeHtml(profile.code || 'Cuenta creada')}</span><span class="tag">${escapeHtml(summary.space)}</span><span class="tag">${escapeHtml(profilePlan(profile).name)}</span></div>
      <div class="profile-role-banner"><strong>${escapeHtml(summary.title)}</strong><span>${escapeHtml(summary.body)}</span></div>
      <div class="profile-metrics role-aware-metrics">${profileMetricTiles(profile)}</div>
      <div class="profile-summary-grid">${profileSummaryCards(profile)}</div>
      <div class="profile-activity-strip">${summary.chips.map(item => `<span class="status-chip">${escapeHtml(item)}</span>`).join('')}</div>
      <div class="profile-actions-row"><button class="soft-button" type="button" data-open-friends>Actividad de amigos</button><button class="soft-button" type="button" data-open-settings>Ajustes</button><button class="soft-button" type="button" data-open-ai>KORA AI</button></div>
    </div>
  `;
  qs('[data-role-workspace]').innerHTML = roleWorkspace(profile);
  qs('[data-privacy-list]').innerHTML = privacyCards(profile).map(item => `<article class="privacy-card"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join('');
}

function profileRoleSummary(profile) {
  const role = roleDefinition(profile);
  const summaries = {
    user: {
      space: 'Memoria personal',
      title: 'Espacio de exploración',
      body: 'Tu perfil prioriza hallazgos guardados, playlists locales y actividad reciente para volver a escuchar sin perder lo descubierto.',
      chips: ['Hallazgos', 'Playlists', 'Actividad reciente']
    },
    curator: {
      space: 'Mesa de curaduría',
      title: 'Espacio de recomendación',
      body: 'Tu perfil ordena comentarios, reposts y playlists curadas para convertir canciones emergentes en rutas de escucha con criterio.',
      chips: ['Recomendaciones', 'Comentarios destacados', 'Playlists curadas']
    },
    ambassador: {
      space: 'Mapa cultural',
      title: 'Espacio de contexto local',
      body: 'Tu perfil muestra barrios, escenas y aportes culturales para conectar canciones con memoria territorial y comunidad.',
      chips: ['Barrios', 'Escenas', 'Aportes culturales']
    },
    artist: {
      space: 'Estudio de artista',
      title: 'Espacio de publicación',
      body: 'Tu perfil reúne publicaciones, métricas de recepción y estado legal para que el lanzamiento tenga historia y control de visibilidad.',
      chips: ['Publicaciones', 'Métricas', 'Estado legal']
    },
    company: {
      space: 'Radar de scouting',
      title: 'Espacio de análisis autorizado',
      body: 'Tu perfil prioriza radar de talento, métricas agregadas y límites de datos para analizar artistas con permisos claros.',
      chips: ['Radar', 'Métricas autorizadas', 'Scouting']
    }
  };
  return summaries[profile.role] || { space: role.profileAxis, title: role.label, body: role.purpose, chips: [role.action, role.profileAxis, profile.city || 'Cali'] };
}

function roleMetricItems(profile) {
  const comments = profileComments(profile).length;
  const events = profileCommunityEvents(profile).length;
  const visiblePublished = state.published.filter(item => item.visibility).length;
  const authorizedArtists = runtimeArtists().filter(item => item.visibility || !String(item.id || '').startsWith('published-')).length;
  const common = {
    user: [
      [state.saved.length, 'Hallazgos'],
      [state.playlist.length, 'Playlist'],
      [memoryReminderItems().length, 'Recordatorios'],
      [(state.communityEvents || []).length, 'Actividad']
    ],
    curator: [
      [comments, 'Comentarios'],
      [state.reposted.length, 'Reposts'],
      [DATA.playlists.length, 'Playlists curadas'],
      [events, 'Señales propias']
    ],
    ambassador: [
      [profileNeighborhoods().length, 'Barrios'],
      [profileScenes().length, 'Escenas'],
      [events, 'Aportes'],
      [state.playlist.length, 'Rutas locales']
    ],
    artist: [
      [state.published.length, 'Publicaciones'],
      [artistReceptionCount(), 'Señales'],
      [visiblePublished, 'Visible CM'],
      [state.acceptedLegal ? 1 : 0, 'Estado legal']
    ],
    company: [
      [authorizedArtists, 'Artistas radar'],
      [runtimeArtists().filter(item => item.match >= 88).length, 'Afinidad alta'],
      [state.saved.length, 'En radar'],
      [state.invoices.length, 'Facturas']
    ]
  };
  return common[profile.role] || common.user;
}

function profileMetricTiles(profile) {
  return roleMetricItems(profile).map(item => `<span><b>${escapeHtml(item[0])}</b><small>${escapeHtml(item[1])}</small></span>`).join('');
}

function profileSummaryCards(profile) {
  const role = roleDefinition(profile);
  const summary = profileRoleSummary(profile);
  const signal = lastRoleSignal(profile);
  return [
    ['Acción principal', role.action],
    ['Espacio propio', summary.space],
    ['Permisos', state.acceptedLegal ? `Autorizaciones ${role.label.toLowerCase()}` : 'Autorizaciones pendientes'],
    ['Última señal', signal]
  ].map(item => `<article class="mini-card"><strong>${escapeHtml(item[0])}</strong><span>${escapeHtml(item[1])}</span></article>`).join('');
}

function lastRoleSignal(profile) {
  const events = profileCommunityEvents(profile);
  if (events.length) return events[0].title;
  if (profile.role === 'artist' && state.published.length) return `Publicaste ${state.published[state.published.length - 1].track}`;
  if (profile.role === 'company') return `${runtimeArtists()[0]?.name || 'Artista'} en radar inicial`;
  if (state.saved.length) {
    const artist = artistById(state.saved[state.saved.length - 1]);
    if (artist) return `${artist.track} guardada`;
  }
  return `${activeArtist().track} · ${activeArtist().name}`;
}

function profileCommunityEvents(profile) {
  return (state.communityEvents || []).filter(item => item.actor === profile.name || item.role === roleDefinition(profile).label);
}

function profileComments(profile) {
  return Object.values(state.comments || {}).flat().filter(item => item.author === profile.name || item.role === roleDefinition(profile).label);
}

function profileNeighborhoods() {
  const ids = [...state.saved, ...state.playlist];
  const source = ids.length ? ids.map(artistById).filter(Boolean) : runtimeArtists().slice(0, 6);
  return [...new Set(source.map(item => item.neighborhood).filter(Boolean))];
}

function profileScenes() {
  const ids = [...state.saved, ...state.playlist];
  const source = ids.length ? ids.map(artistById).filter(Boolean) : runtimeArtists().slice(0, 6);
  return [...new Set(source.map(item => item.scene).filter(Boolean))];
}

function artistReceptionCount() {
  const publishedIds = state.published.map(item => item.id);
  const publishedSignals = (state.communityEvents || []).filter(item => publishedIds.includes(item.artistId)).length;
  return publishedSignals + state.saved.filter(id => publishedIds.includes(id)).length + state.reposted.filter(id => publishedIds.includes(id)).length;
}

function roleWorkspace(profile) {
  const role = roleDefinition(profile);
  const workspace = role.workspace || {};
  const features = roleFeatureCards(workspace.features);
  const actions = roleActionButtons(workspace.actions);
  return `<div class="workspace-hero"><div><p class="eyebrow">${escapeHtml(workspace.eyebrow || 'Rol KORA')}</p><h2>${escapeHtml(workspace.title || role.label)}</h2><p>${escapeHtml(workspace.intro || role.purpose)}</p></div><span class="counter-pill">${escapeHtml(workspace.badge || role.action)}</span></div>${roleDashboard(profile)}<div class="role-action-grid">${features}</div>${actions ? `<div class="role-work-actions">${actions}</div>` : ''}`;
}

function roleDashboard(profile) {
  if (profile.role === 'curator') return curatorDashboard(profile);
  if (profile.role === 'ambassador') return ambassadorDashboard(profile);
  if (profile.role === 'artist') return artistDashboard(profile);
  if (profile.role === 'company') return companyDashboard(profile);
  return explorerDashboard(profile);
}

function explorerDashboard(profile) {
  const saved = state.saved.map(artistById).filter(Boolean).slice(-4).reverse();
  const playlist = state.playlist.map(artistById).filter(Boolean).slice(0, 3);
  return `<div class="role-dashboard-grid"><section class="role-workspace-section"><div class="panel-head"><div><p class="eyebrow">Hallazgos</p><h3>Para volver a escuchar</h3></div><span class="counter-pill">${state.saved.length}</span></div>${saved.length ? saved.map(artist => memoryArtistCard(artist)).join('') : '<div class="empty-state">Guarda una cápsula para construir tu memoria musical.</div>'}</section><section class="role-workspace-section"><div class="panel-head"><div><p class="eyebrow">Playlist</p><h3>Rutas activas</h3></div><span class="counter-pill">${playlist.length}</span></div>${playlist.length ? playlist.map(artist => compactArtistCard(artist, 'Repost', 'data-repost-artist')).join('') : '<div class="empty-state">Aún no hay canciones en playlist.</div>'}</section><section class="role-workspace-section role-section-wide"><div class="panel-head"><div><p class="eyebrow">Actividad reciente</p><h3>Lo que mueve tu comunidad</h3></div></div><div class="role-mini-list">${communityActivityCards(4)}</div></section></div>`;
}

function curatorDashboard(profile) {
  const comments = profileComments(profile).slice(-4).reverse();
  const reposted = state.reposted.map(artistById).filter(Boolean).slice(0, 4);
  const playlists = (DATA.playlists || []).slice(0, 3);
  return `<div class="role-dashboard-grid"><section class="role-workspace-section"><div class="panel-head"><div><p class="eyebrow">Recomendaciones</p><h3>Reposts con criterio</h3></div><span class="counter-pill">${reposted.length}</span></div>${reposted.length ? reposted.map(artist => compactArtistCard(artist, 'Recomendar', 'data-repost-artist')).join('') : '<div class="empty-state">Repostea una cápsula para iniciar tu ruta curatorial.</div>'}</section><section class="role-workspace-section"><div class="panel-head"><div><p class="eyebrow">Comentarios</p><h3>Criterio visible</h3></div><span class="counter-pill">${comments.length}</span></div>${comments.length ? comments.map(item => `<article class="role-dossier"><strong>${escapeHtml(item.text)}</strong><span>${escapeHtml(item.at || 'Ahora')}</span></article>`).join('') : '<div class="empty-state">Publica comentarios para que aparezcan como señales curatoriales.</div>'}</section><section class="role-workspace-section role-section-wide"><div class="panel-head"><div><p class="eyebrow">Playlists curadas</p><h3>Rutas de escucha sugeridas</h3></div></div><div class="playlist-grid">${playlists.map(item => `<article class="playlist-card"><span class="list-cover">${imgMarkup(item.cover, item.name, '♪')}</span><div><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.mood)}</p><span class="tag">Curada por ${escapeHtml(item.curator)}</span></div></article>`).join('')}</div></section></div>`;
}

function ambassadorDashboard(profile) {
  const neighborhoods = profileNeighborhoods();
  const scenes = profileScenes();
  const events = profileCommunityEvents(profile).filter(item => ['context', 'comment', 'playlist'].includes(item.type)).slice(0, 4);
  return `<div class="role-dashboard-grid"><section class="role-workspace-section"><div class="panel-head"><div><p class="eyebrow">Barrios</p><h3>Territorios destacados</h3></div><span class="counter-pill">${neighborhoods.length}</span></div><div class="scene-map">${neighborhoods.map(item => `<span>${escapeHtml(item)}</span>`).join('') || '<span>Cali</span>'}</div></section><section class="role-workspace-section"><div class="panel-head"><div><p class="eyebrow">Escenas</p><h3>Lectura cultural</h3></div><span class="counter-pill">${scenes.length}</span></div><div class="scene-map">${scenes.map(item => `<span>${escapeHtml(item)}</span>`).join('') || '<span>Escena local</span>'}</div></section><section class="role-workspace-section role-section-wide"><div class="panel-head"><div><p class="eyebrow">Aportes culturales</p><h3>Memoria agregada por comunidad</h3></div><span class="counter-pill">${events.length}</span></div>${events.length ? events.map(item => `<article class="role-dossier"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></article>`).join('') : '<div class="empty-state">Comenta o suma canciones a playlist para crear aportes culturales visibles.</div>'}</section></div>`;
}

function artistDashboard(profile) {
  const published = state.published.slice().reverse();
  const visible = published.filter(item => item.visibility).length;
  const legalState = state.acceptedLegal ? 'Licencia y autorizaciones registradas' : 'Autorizaciones pendientes';
  return `<div class="role-dashboard-grid">
    <section class="role-workspace-section role-section-wide prototype-inline">${phasePrototypePanel('artist')}</section>
    <section class="role-workspace-section">
      <div class="panel-head"><div><p class="eyebrow">Publicaciones</p><h3>Cápsulas subidas</h3></div><span class="counter-pill">${published.length}</span></div>
      ${published.length ? published.slice(0, 4).map(item => publishedProfileCard(item)).join('') : '<div class="empty-state">Aún no has publicado cápsulas en esta sesión.</div>'}
    </section>
    <section class="role-workspace-section">
      <div class="panel-head"><div><p class="eyebrow">Métricas</p><h3>Recepción simulada</h3></div><span class="counter-pill">${artistReceptionCount()} señales</span></div>
      <div class="artist-health-grid">${artistMetricCards(published)}</div>
    </section>
    <section class="role-workspace-section">
      <div class="panel-head"><div><p class="eyebrow">Estado legal</p><h3>Licencia y autorización</h3></div><span class="counter-pill">${state.acceptedLegal ? 'Activo' : 'Pendiente'}</span></div>
      <div class="license-status-list">${artistAuthorizationCards(published, visible, legalState)}</div>
    </section>
    <section class="role-workspace-section">
      <div class="panel-head"><div><p class="eyebrow">Checklist</p><h3>Antes de publicar</h3></div><span class="counter-pill">Guía</span></div>
      <div class="publish-checklist">${artistChecklistCards()}</div>
    </section>
  </div>`;
}

function artistMetricCards(published) {
  const ids = published.map(item => item.id);
  const relatedEvents = (state.communityEvents || []).filter(item => ids.includes(item.artistId));
  const comments = ids.reduce((total, id) => total + ((state.comments || {})[id]?.length || 0), 0);
  const saves = state.saved.filter(id => ids.includes(id)).length;
  const reposts = state.reposted.filter(id => ids.includes(id)).length;
  const visible = published.filter(item => item.visibility).length;
  return [
    [saves, 'Guardados de cápsulas'],
    [reposts, 'Reposts comunitarios'],
    [comments, 'Comentarios recibidos'],
    [relatedEvents.length, 'Eventos de feed'],
    [visible, 'Visibles para CM'],
    [published.length, 'Cápsulas publicadas']
  ].map(item => `<span><b>${escapeHtml(item[0])}</b><small>${escapeHtml(item[1])}</small></span>`).join('');
}

function artistAuthorizationCards(published, visible, legalState) {
  const items = [
    ['Licencia de plataforma', legalState, state.acceptedLegal ? 'Activo' : 'Pendiente'],
    ['Visibilidad para empresas', `${visible} de ${published.length} cápsulas habilitadas para métricas agregadas`, visible ? 'Autorizada' : 'Sin habilitar'],
    ['Datos compartidos', 'Solo señales agregadas: guardados, reposts, comentarios y afinidad cultural.', 'Limitado'],
    ['Control de publicación', 'Revisar audio, portada, historia, licencia y visibilidad antes de compartir la cápsula.', 'Revisar']
  ];
  return items.map(item => `<article class="role-dossier"><div class="license-status-head"><strong>${escapeHtml(item[0])}</strong><span class="status-chip">${escapeHtml(item[2])}</span></div><span>${escapeHtml(item[1])}</span></article>`).join('');
}

function artistChecklistCards() {
  return (DATA.artistPublishChecklist || []).map(item => `<article class="checklist-card"><span class="status-chip">${escapeHtml(item.state)}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join('');
}

function companyDashboard(profile) {
  const radar = runtimeArtists().slice().sort((a, b) => b.match - a.match).slice(0, 6);
  const authorized = radar.filter(item => artistHasCompanyAuthorization(item));
  const logged = state.scoutingLog || [];
  return `<div class="role-dashboard-grid">
    <section class="role-workspace-section role-section-wide prototype-inline">${phasePrototypePanel('company')}</section>
    <section class="role-workspace-section role-section-wide">
      <div class="panel-head"><div><p class="eyebrow">Radar de talento</p><h3>Artistas con señales de scouting</h3></div><span class="counter-pill">${authorized.length} autorizados</span></div>
      <div class="company-radar-dashboard">${radar.map(artist => companyRadarCard(artist, logged)).join('')}</div>
    </section>
    <section class="role-workspace-section">
      <div class="panel-head"><div><p class="eyebrow">Escenas activas</p><h3>Lectura agregada</h3></div><span class="counter-pill">${companySceneSummary(radar).length}</span></div>
      <div class="scene-activity-list">${companySceneCards(radar)}</div>
    </section>
    <section class="role-workspace-section">
      <div class="panel-head"><div><p class="eyebrow">Métricas autorizadas</p><h3>Datos disponibles</h3></div><span class="counter-pill">${authorized.length}</span></div>
      <div class="artist-health-grid">${companyMetricCards(radar, authorized)}</div>
    </section>
    <section class="role-workspace-section role-section-wide">
      <div class="panel-head"><div><p class="eyebrow">Scouting responsable</p><h3>Uso permitido del radar</h3></div><span class="counter-pill">${logged.length} revisiones</span></div>
      <div class="scouting-responsible-grid">${companyScoutingCards()}</div>
    </section>
  </div>`;
}

function artistHasCompanyAuthorization(artist) {
  return Boolean(artist.visibility || !String(artist.id || '').startsWith('published-'));
}

function companyRadarCard(artist, logged) {
  const allowed = artistHasCompanyAuthorization(artist);
  const reviewed = logged.includes(artist.id);
  return `<article class="list-item company-radar-card ${allowed ? '' : 'is-locked'}"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(artist.name)}</strong><span>${artist.match}% afinidad · ${escapeHtml(artist.scene)} · ${escapeHtml(artist.neighborhood)}</span><div class="role-pill-row"><span>${allowed ? 'Métricas autorizadas' : 'No autorizado para CM'}</span><span>${escapeHtml(artist.track)}</span></div></div><button class="soft-button ${reviewed ? 'is-active' : ''}" type="button" ${allowed ? `data-scout-responsible="${escapeHtml(artist.id)}"` : 'disabled'}>${reviewed ? 'Revisado' : allowed ? 'Registrar revisión' : 'Bloqueado'}</button></article>`;
}

function companySceneSummary(radar) {
  const grouped = radar.reduce((map, artist) => {
    const key = artist.scene || 'Escena local';
    if (!map[key]) map[key] = { scene: key, count: 0, match: 0 };
    map[key].count += 1;
    map[key].match += artist.match || 0;
    return map;
  }, {});
  return Object.values(grouped).map(item => ({ ...item, average: Math.round(item.match / item.count) })).sort((a, b) => b.count - a.count || b.average - a.average);
}

function companySceneCards(radar) {
  return companySceneSummary(radar).map(item => `<article class="role-dossier"><div class="license-status-head"><strong>${escapeHtml(item.scene)}</strong><span class="status-chip">${item.count} artista${item.count === 1 ? '' : 's'}</span></div><span>${item.average}% de afinidad promedio en radar simulado.</span></article>`).join('');
}

function companyMetricCards(radar, authorized) {
  const savedRadar = radar.filter(item => state.saved.includes(item.id)).length;
  const avgMatch = radar.length ? Math.round(radar.reduce((total, item) => total + (item.match || 0), 0) / radar.length) : 0;
  const reviewed = (state.scoutingLog || []).length;
  return [
    [authorized.length, 'Artistas autorizados'],
    [`${avgMatch}%`, 'Match promedio'],
    [savedRadar, 'Guardados en radar'],
    [reviewed, 'Revisiones registradas'],
    [companySceneSummary(radar).length, 'Escenas activas'],
    ['Agregado', 'Tipo de dato']
  ].map(item => `<span><b>${escapeHtml(item[0])}</b><small>${escapeHtml(item[1])}</small></span>`).join('');
}

function companyScoutingCards() {
  return (DATA.companyScoutingSignals || []).map(item => `<article class="checklist-card"><span class="status-chip">Permitido</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></article>`).join('') + `<article class="role-dossier is-highlight"><strong>Sin contacto automático</strong><span>KORA no entrega datos privados ni habilita contacto directo fuera de autorizaciones del artista.</span></article>`;
}

function registerResponsibleScout(artistId) {
  const profile = activeProfile();
  if (profile.role !== 'company') {
    toast('Solo un perfil de empresa o scout puede registrar revisiones de radar.');
    return;
  }
  const artist = artistById(artistId);
  if (!artist) return;
  if (!artistHasCompanyAuthorization(artist)) {
    toast('Este artista no autorizó visibilidad empresarial.');
    return;
  }
  state.scoutingLog = state.scoutingLog || [];
  if (!state.scoutingLog.includes(artist.id)) state.scoutingLog.unshift(artist.id);
  if (!state.saved.includes(artist.id)) state.saved.push(artist.id);
  addCommunityEvent('scout', artist, { title: `${profile.name} revisó ${artist.name} con límites autorizados`, body: `${artist.track} queda en radar empresarial sin contacto directo ni datos privados fuera de autorización.` });
  saveState();
  renderAll();
  toast('Revisión responsable registrada en el radar empresarial.');
}

function memoryArtistCard(artist) {
  const meta = state.savedMeta?.[artist.id] || {};
  const reason = meta.note || meta.reason || savedReason(artist);
  return `<article class="role-dossier"><div class="list-item"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(artist.track)}</strong><span>${escapeHtml(artist.name)} · ${escapeHtml(reason)}</span></div></div><div class="role-pill-row"><span>${escapeHtml(formatMemoryDate(meta.savedAt))}</span><span>${escapeHtml(artist.neighborhood)}</span></div></article>`;
}

function compactArtistCard(artist, label, attr) {
  return `<article class="list-item"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(artist.track)}</strong><span>${escapeHtml(artist.name)} · ${escapeHtml(artist.scene)}</span></div><button class="soft-button" type="button" ${attr}="${escapeHtml(artist.id)}">${escapeHtml(label)}</button></article>`;
}

function publishedProfileCard(item) {
  return `<article class="role-dossier"><div class="list-item"><span class="list-cover tone-${escapeHtml(item.tone || 'violet')}">${imgMarkup(item.cover, item.track, item.symbol)}</span><div class="list-item-content"><strong>${escapeHtml(item.track)}</strong><span>${escapeHtml(item.name)} · ${escapeHtml(item.neighborhood)}</span></div></div><div class="role-pill-row"><span>Licencia registrada</span><span>${item.visibility ? 'Visible CM' : 'Solo comunidad'}</span></div></article>`;
}

function privacyCards(profile) {
  const role = roleDefinition(profile);
  const rolePrivacy = (role.privacy || [])[0];
  return [
    { title: 'Términos aceptados', body: 'Uso de KORA, datos personales y permisos básicos por rol.' },
    { title: role.label, body: rolePrivacy ? rolePrivacy[1] : role.purpose },
    { title: 'Control de cuenta', body: 'Puedes cambiar perfil, revisar términos o bajar la cuenta desde esta sección.' }
  ];
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
  const total = state.previewMode === 'short' ? artist.preview : artist.duration;
  const percent = Math.min(100, Math.max(0, total ? Math.round((state.playback / total) * 100) : 0));
  bar.innerHTML = `
    <div class="mini-now-media"><span class="list-cover tone-${escapeHtml(artist.tone || 'sunset')}">${imgMarkup(artist.cover, artist.track, artist.symbol)}</span><div><strong>${escapeHtml(artist.track)}</strong><span>${escapeHtml(artist.name)} · ${formatTime(state.playback)} / ${formatTime(total)}${state.isPlaying ? '' : ' · pausado'}</span><div class="mini-now-progress"><i style="width:${percent}%"></i></div></div></div>
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

function activeProfileNameParts() {
  const profile = activeProfile();
  const fullName = String(profile.name || '').trim().toLowerCase();
  const firstName = fullName.split(/\s+/)[0] || '';
  return { id: profile.id, fullName, firstName };
}

function notificationBelongsToActiveProfile(item) {
  const active = activeProfileNameParts();
  const actor = String(item.actor || '').trim().toLowerCase();
  const title = String(item.title || '').trim().toLowerCase();
  if (item.actorId && item.actorId === active.id) return true;
  if (actor && (actor === active.fullName || actor === active.firstName)) return true;
  if (active.fullName && title.includes(active.fullName)) return true;
  if (active.firstName && title.startsWith(`${active.firstName} `)) return true;
  return false;
}

function personalizeBaseNotification(item) {
  return { ...item, source: 'system' };
}

function unreadNotifications() {
  const base = DATA.notifications.map(personalizeBaseNotification);
  return [...communityNotificationItems().filter(item => !notificationBelongsToActiveProfile(item)), ...base.filter(item => !notificationBelongsToActiveProfile(item))].filter(item => !state.dismissedNotifications.includes(item.id || item.title));
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
  const content = unread.length ? unread.map(item => `<article class="notification-card ${item.community ? 'is-community' : ''}"><div><span class="status-chip">${escapeHtml(communityTypeLabel(item.type || item.source || 'system'))}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></div><div class="notification-actions">${item.artistId ? `<button class="primary-button" type="button" data-open-notification-artist="${escapeHtml(item.artistId)}">Abrir cápsula</button>` : ''}${item.postId ? `<button class="soft-button" type="button" data-open-notification-post="${escapeHtml(item.postId)}">Ver feed</button>` : ''}<button class="soft-button" type="button" data-dismiss-notification="${escapeHtml(item.id || item.title)}">Cerrar aviso</button></div></article>`).join('') : '<div class="empty-state">No tienes notificaciones pendientes.</div>';
  showModal(`<div class="notification-modal-head"><div><h2>Notificaciones</h2><p>Actualizaciones de comunidad, comentarios, reposts, guardados y recordatorios de hallazgos.</p></div><button class="soft-button" type="button" data-close-modal>Cerrar</button></div><div class="settings-list notification-modal-list">${content}</div>`, 'notifications-modal-card');
}

function dismissNotification(id) {
  if (!state.dismissedNotifications.includes(id)) state.dismissedNotifications.push(id);
  saveState();
  renderAll();
  showNotificationsPanel();
}

function showFriendsPanel() {
  const artist = activeArtist();
  const messages = state.friendMessages.length ? state.friendMessages.map(item => `<article class="chat-bubble"><strong>${escapeHtml(item.author)} → ${escapeHtml(item.friend)}</strong><span>${escapeHtml(item.text)}</span><small>${escapeHtml(item.track)} · ${escapeHtml(item.at || 'Ahora')}</small></article>`).join('') : '<div class="empty-state">Aún no has enviado música a tus amigos.</div>';
  const friends = DATA.friends.map(friend => `<option value="${escapeHtml(friend.name)}">${escapeHtml(friend.name)} · ${escapeHtml(friend.affinity)}</option>`).join('');
  showModal(`<h2>Amigos y actividad</h2><p>Comparte la cápsula activa y revisa qué está moviendo la comunidad sin depender de un chat privado.</p><div class="friend-layout"><div class="settings-list"><article class="privacy-card"><strong>Actividad comunitaria reciente</strong><p>Guardados, comentarios, reposts y playlists aparecen como señales visibles.</p></article>${communityActivityCards(6)}</div><form class="friend-chat-form" data-friend-chat-form><label>Amigo<select name="friend">${friends}</select></label><label>Mensaje<textarea name="message" data-friend-message-text>Escucha ${escapeHtml(artist.track)} de ${escapeHtml(artist.name)}. Creo que conecta con tu playlist local.</textarea></label><button class="primary-button full" type="submit">Enviar cápsula al chat</button></form></div><div class="chat-thread">${messages}</div><button class="soft-button full" type="button" data-close-modal>Cerrar</button>`);
}

function submitFriendMessage(form) {
  const data = new FormData(form);
  const artist = activeArtist();
  state.friendMessages.push({ author: activeProfile().name, friend: data.get('friend'), text: data.get('message'), track: artist.track, at: new Date().toLocaleString('es-CO') });
  if (!state.shared.includes(artist.id)) state.shared.push(artist.id);
  addCommunityEvent('share', artist, { body: `${activeProfile().name} compartió ${artist.track} con ${data.get('friend')} desde la comunidad KORA.` });
  saveState();
  showFriendsPanel();
  toast('Cápsula enviada y registrada como actividad comunitaria.');
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
  const role = roleDefinition(profile);
  const post = DATA.interactions.find(item => item.id === postId);
  const artist = artistById(post?.artistId) || activeArtist();
  state.comments[postId] = state.comments[postId] || [];
  state.comments[postId].push({ author: profile.name, role: role.label, text, at: new Date().toLocaleString('es-CO') });
  state.interactions[postId] = (state.interactions[postId] || 0) + 1;
  addCommunityEvent(profile.role === 'ambassador' ? 'context' : 'comment', artist, { postId, text, body: `${profile.name} aportó: ${text}` });
  saveState();
  closeModal();
  renderInteraction();
  renderNotificationBadge();
  toast('Tu comentario quedó publicado y generó una notificación comunitaria.');
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
  renderDiscoverSummary();
  renderCapsules();
  renderSaved();
  renderPlayer();
  renderInteraction();
  renderPublished();
  renderBilling();
  renderPrototypePanels();
  renderProfile();
  renderNowPlaying();
  renderNotificationBadge();
}

function showLegalGate(force = false) {
  const overlay = qs('[data-consent-overlay]');
  const profile = activeProfile();
  const roleLegal = roleLegalCopy(profile);
  const roleChanged = state.legalRole !== profile.role;
  if (!force && state.acceptedLegal && !roleChanged) {
    overlay.hidden = true;
    showWelcomeOnboarding();
    setTimeout(() => maybeShowViewGuide(currentView()), 700);
    return;
  }
  if (roleChanged && !force) state.legalDraft = { ...defaultState.legalDraft };
  overlay.hidden = false;
  const form = qs('[data-consent-form]');
  qs('#consent-title').textContent = 'Términos y condiciones';
  const lead = qs('[data-consent-role-lead]');
  if (lead) lead.textContent = `${roleLegal.title}. ${roleLegal.lead}`;
  const copyMap = legalConsentCopy(roleLegal);
  Object.keys(copyMap).forEach(name => {
    const text = qs(`[data-legal-copy="${name}"]`, form);
    if (text) text.innerHTML = copyMap[name];
  });
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
  const profile = activeProfile();
  state.acceptedLegal = true;
  state.acceptedAt = new Date().toISOString();
  state.legalRole = profile.role;
  state.legalDraft = { terms: true, privacy: true, roleData: true };
  saveState();
  qs('[data-consent-overlay]').hidden = true;
  toast('Autorizaciones registradas para tu rol.');
  showWelcomeOnboarding();
}

function showModal(html, className = '') {
  const layer = qs('[data-modal-layer]');
  const classes = ['modal-card', className].filter(Boolean).join(' ');
  layer.innerHTML = `<section class="${classes}" role="dialog" aria-modal="true">${html}</section>`;
  layer.hidden = false;
}


function maybeShowViewGuide(view = currentView(), force = false) {
  if (!state.acceptedLegal) return;
  const layer = qs('[data-modal-layer]');
  const overlay = qs('[data-consent-overlay]');
  if (!force && ((layer && !layer.hidden) || (overlay && !overlay.hidden))) return;
  if (!state.viewGuidesSeen) state.viewGuidesSeen = {};
  if (!state.viewGuideSnoozed) state.viewGuideSnoozed = {};
  const key = viewGuideKey(view);
  const snoozedUntil = state.viewGuideSnoozed[key] || 0;
  if (!force && state.viewGuidesSeen[key]) return;
  if (!force && Date.now() < snoozedUntil) return;
  const guide = viewGuideCopy(view);
  showModal(`
    <div class="guide-hero">
      <p class="eyebrow">${escapeHtml(guide.eyebrow)}</p>
      <h2>${escapeHtml(guide.title)}</h2>
      <p>${escapeHtml(guide.body)}</p>
    </div>
    <div class="guide-role-note"><strong>${escapeHtml(guide.roleLabel)} · ${escapeHtml(guide.roleAction)}</strong><p>${escapeHtml(guide.roleNote)}</p></div>
    <div class="onboarding-actions">
      <button class="primary-button" type="button" data-complete-view-guide="${escapeHtml(view)}">Entendido</button>
      <button class="soft-button" type="button" data-remind-view-guide="${escapeHtml(view)}">Recordármelo luego</button>
    </div>
  `, 'guide-card');
}

function completeViewGuide(view) {
  if (!state.viewGuidesSeen) state.viewGuidesSeen = {};
  state.viewGuidesSeen[viewGuideKey(view)] = true;
  saveState();
  closeModal();
}

function remindViewGuideLater(view) {
  completeViewGuide(view);
}


function showActionGuide(action) {
  const profile = activeProfile();
  const role = roleDefinition(profile);
  const guides = {
    discover: ['Descubrir artistas emergentes', 'Explora cápsulas organizadas por barrio, escena, género y afinidad cultural para saber qué quieres escuchar después.'],
    listen: ['Escuchar cápsulas breves', 'Prueba fragmentos rápidos con historia y señales de contexto antes de decidir si quieres escuchar completo.'],
    save: ['Guardar hallazgos', 'Cuando guardas una canción, KORA conserva la razón, permite añadir nota y la puede recordar en notificaciones.'],
    community: ['Compartir comunidad', 'Repostea, comenta o comparte para que el descubrimiento tenga señales humanas y no solo reproducciones.'],
    role: ['Participar según tu rol', `${role.label}: tu experiencia se orienta a ${role.action.toLowerCase()} dentro de la escena musical local.`]
  };
  const [title, body] = guides[action] || guides.discover;
  showModal(`<div class="guide-hero"><p class="eyebrow">Acción principal</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></div><div class="onboarding-actions"><button class="primary-button" type="button" data-close-modal>Entendido</button></div>`, 'guide-card');
}

function showWelcomeOnboarding(force = false) {
  if (!state.acceptedLegal && !force) return;
  if (!force && state.onboardingSeen) return;
  showModal(`
    <div class="onboarding-hero">
      <p class="eyebrow">Bienvenida</p>
      <h2>Antes de explorar, esto es lo que puedes hacer en KORA</h2>
      <p>En KORA puedes descubrir, guardar, comentar, compartir y participar en una comunidad musical local. No es un manual de botones: es una guía rápida de lo que vas a encontrar.</p>
    </div>
    <div class="onboarding-steps" aria-label="Acciones principales de KORA">
      <article class="onboarding-step"><span>01</span><strong>Descubre artistas emergentes de tu escena local.</strong><p>Explora canciones organizadas por afinidad, barrio, género y contexto cultural.</p><button class="soft-button" type="button" data-open-action-guide="discover">Ver resumen</button></article>
      <article class="onboarding-step"><span>02</span><strong>Escucha cápsulas breves con contexto cultural.</strong><p>Prueba fragmentos de 30 segundos acompañados de historia, escena y señales de decisión.</p><button class="soft-button" type="button" data-open-action-guide="listen">Ver resumen</button></article>
      <article class="onboarding-step"><span>03</span><strong>Guarda hallazgos para no olvidarlos.</strong><p>Construye una memoria musical que vuelve a mostrarte lo que conectó contigo.</p><button class="soft-button" type="button" data-open-action-guide="save">Ver resumen</button></article>
      <article class="onboarding-step"><span>04</span><strong>Comparte, comenta y repostea con la comunidad.</strong><p>El descubrimiento se alimenta de amigos, curadores, artistas y conversación pública.</p><button class="soft-button" type="button" data-open-action-guide="community">Ver resumen</button></article>
      <article class="onboarding-step"><span>05</span><strong>Publica o analiza música según tu rol.</strong><p>Exploradores, curadores, embajadores, artistas y empresas participan de forma distinta.</p><button class="soft-button" type="button" data-open-action-guide="role">Ver resumen</button></article>
    </div>
    <div class="onboarding-actions">
      <button class="primary-button" type="button" data-finish-onboarding>Entrar a KORA</button>
    </div>
  `, 'onboarding-card');
}

function remindOnboardingLater() {
  finishOnboarding();
}

function finishOnboarding() {
  state.onboardingSeen = true;
  saveState();
  closeModal();
  toast('Bienvenida completada. Ya puedes explorar KORA.');
  setTimeout(() => maybeShowViewGuide(currentView()), 450);
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
  addCommunityEvent('publish', item, { body: `${profile.name} publicó ${item.track} con historia de ${item.neighborhood}.` });
  saveState();
  form.reset();
  renderAll();
  toast('Cápsula publicada, agregada al feed local y notificada a la comunidad.');
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


function scrollActiveCapsuleIntoView(smooth = true) {
  const track = qs('[data-capsule-grid]');
  if (!track) return;
  const active = qs('.capsule-card.is-active', track);
  if (!active) return;
  const left = active.offsetLeft - Math.max(0, (track.clientWidth - active.clientWidth) / 2);
  track.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'auto' });
}

function scrollCapsules(direction) {
  const artists = runtimeArtists();
  if (!artists.length) return;
  setCurrentArtist(state.currentArtist + direction);
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
  if (target.dataset.replaySaved) replaySaved(target.dataset.replaySaved);
  if (target.dataset.openSaveNote) showSaveNote(target.dataset.openSaveNote);
  if (target.dataset.repostCurrent !== undefined) repostCurrent();
  if (target.dataset.repostArtist) repostArtist(target.dataset.repostArtist);
  if (target.dataset.shareCurrent !== undefined) shareCurrent();
  if (target.dataset.shareMenu !== undefined) showSharePanel();
  if (target.dataset.shareArtist) {
    const artist = artistById(target.dataset.shareArtist);
    if (artist && !state.shared.includes(artist.id)) state.shared.push(artist.id);
    if (artist) {
      state.currentArtist = runtimeArtists().findIndex(item => item.id === artist.id);
      addCommunityEvent('share', artist, { notification: false });
    }
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
    addCommunityEvent('playlist', artist);
    saveState();
    renderInteraction();
    renderNotificationBadge();
    toast('Aporte añadido a la playlist local y visible como actividad comunitaria.');
  }
  if (target.dataset.interactPost) showCommentComposer(target.dataset.interactPost);
  if (target.dataset.scoutResponsible) registerResponsibleScout(target.dataset.scoutResponsible);
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
  if (target.dataset.toggleDiscoverSummary !== undefined) {
    state.discoverSummaryCollapsed = !state.discoverSummaryCollapsed;
    saveState();
    renderDiscoverSummary();
  }
  if (target.dataset.openOnboarding !== undefined) showWelcomeOnboarding(true);
  if (target.dataset.finishOnboarding !== undefined) finishOnboarding();
  if (target.dataset.remindOnboarding !== undefined) remindOnboardingLater();
  if (target.dataset.openViewGuide !== undefined) maybeShowViewGuide(currentView(), true);
  if (target.dataset.openActionGuide) showActionGuide(target.dataset.openActionGuide);
  if (target.dataset.completeViewGuide) completeViewGuide(target.dataset.completeViewGuide);
  if (target.dataset.remindViewGuide) remindViewGuideLater(target.dataset.remindViewGuide);
  if (target.dataset.aiAction) runAiAction(target.dataset.aiAction);
  if (target.dataset.quickComment) applyQuickComment(target.dataset.quickComment);
  if (target.dataset.voiceComment !== undefined) applyVoiceComment();
  if (target.dataset.openNotificationArtist) {
    const index = runtimeArtists().findIndex(item => item.id === target.dataset.openNotificationArtist);
    if (index >= 0) {
      closeModal();
      setCurrentArtist(index);
      setView('player');
    }
  }
  if (target.dataset.openNotificationPost) {
    closeModal();
    setView('interaction');
  }
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
    if (event.target.dataset.saveNoteForm !== undefined) {
      event.preventDefault();
      submitSaveNote(event.target);
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
setTimeout(() => maybeShowViewGuide(currentView()), 900);
setInterval(autoRotateDiscover, 45000);



