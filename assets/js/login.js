const DATA = window.KORA_DATA;
const STORAGE_KEY = 'kora-corte3-state';
const CREATED_KEY = 'kora-created-profiles';
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function toast(message) {
  const node = qs('[data-toast]');
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(node.timer);
  node.timer = setTimeout(() => node.classList.remove('is-visible'), 2600);
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

function saveProfile(profile) {
  const previous = loadState();
  const next = { ...previous, profileId: profile.id, accountHidden: false, theme: previous.theme || 'dark' };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  toast(`Entrando como ${profile.name}.`);
  setTimeout(() => { window.location.href = 'index.html'; }, 420);
}

function createdProfiles() {
  try {
    return JSON.parse(localStorage.getItem(CREATED_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function writeCreatedProfiles(profiles) {
  localStorage.setItem(CREATED_KEY, JSON.stringify(profiles));
}

function avatarMarkup(profile) {
  if (profile.avatar) return `<span class="avatar-shell"><img src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}" onerror="this.classList.add('is-hidden')"><span>${escapeHtml(profile.initial || profile.name.slice(0, 1))}</span></span>`;
  return `<span class="avatar-shell"><span>${escapeHtml(profile.initial || profile.name.slice(0, 1))}</span></span>`;
}

function profileCard(profile) {
  return `<button class="login-card" type="button" data-profile-id="${escapeHtml(profile.id)}"><div class="list-item">${avatarMarkup(profile)}<span class="list-item-content"><strong>${escapeHtml(profile.name)}</strong><span>${escapeHtml(profile.roleLabel)} · ${escapeHtml(profile.city || 'Cali')}</span></span></div><p>${escapeHtml(profile.bio || 'Perfil de prueba para KORA.')}</p></button>`;
}

function renderProfiles() {
  qs('[data-team-login]').innerHTML = DATA.teamMembers.map(profileCard).join('');
  qs('[data-role-login]').innerHTML = DATA.roleProfiles.map(profileCard).join('');
  const created = createdProfiles();
  qs('[data-created-count]').textContent = created.length;
  qs('[data-created-login]').innerHTML = created.length ? created.map(profile => `<button class="list-item clickable" type="button" data-profile-id="${escapeHtml(profile.id)}">${avatarMarkup(profile)}<span class="list-item-content"><strong>${escapeHtml(profile.name)}</strong><span>${escapeHtml(profile.email)} · ${escapeHtml(profile.roleLabel)}</span></span></button>`).join('') : '<div class="empty-state">Aún no hay usuarios creados en este navegador.</div>';
}

function roleLabel(role) {
  if (role === 'artist') return 'Artista local';
  if (role === 'company') return 'Scout discográfica';
  return 'Explorador musical';
}

function createProfileFromForm(form) {
  const data = new FormData(form);
  const role = data.get('role') || 'user';
  const name = data.get('name') || data.get('email').split('@')[0];
  const profile = {
    id: `created-${Date.now()}`,
    name,
    email: data.get('email'),
    role,
    roleLabel: roleLabel(role),
    city: 'Cali',
    initial: name.trim().slice(0, 1).toUpperCase(),
    bio: role === 'artist' ? 'Cuenta creada para publicar música y revisar licencias.' : role === 'company' ? 'Cuenta creada para scouting y analítica autorizada.' : 'Cuenta creada para descubrir, guardar y compartir artistas locales.'
  };
  const profiles = createdProfiles();
  profiles.push(profile);
  writeCreatedProfiles(profiles);
  saveProfile(profile);
}

function signIn(form) {
  const data = new FormData(form);
  const email = data.get('email');
  const found = createdProfiles().find(profile => profile.email === email);
  if (found) {
    saveProfile(found);
    return;
  }
  const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  const profile = { id: `created-${Date.now()}`, name, email, role: 'user', roleLabel: 'Explorador musical', city: 'Cali', initial: name.slice(0, 1), bio: 'Cuenta creada desde inicio de sesión.' };
  const profiles = createdProfiles();
  profiles.push(profile);
  writeCreatedProfiles(profiles);
  saveProfile(profile);
}

function setAuthTab(tab) {
  qsa('[data-auth-tab]').forEach(button => button.classList.toggle('is-active', button.dataset.authTab === tab));
  qsa('[data-auth-form]').forEach(form => form.classList.toggle('is-active', form.dataset.authForm === tab));
}

function bindEvents() {
  document.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.profileId) {
      const profile = [...DATA.teamMembers, ...DATA.roleProfiles, ...createdProfiles()].find(item => item.id === target.dataset.profileId);
      if (profile) saveProfile(profile);
    }
    if (target.dataset.authTab) setAuthTab(target.dataset.authTab);
  });
  qs('[data-auth-form="signin"]').addEventListener('submit', event => {
    event.preventDefault();
    signIn(event.currentTarget);
  });
  qs('[data-auth-form="signup"]').addEventListener('submit', event => {
    event.preventDefault();
    createProfileFromForm(event.currentTarget);
  });
}

renderProfiles();
bindEvents();
