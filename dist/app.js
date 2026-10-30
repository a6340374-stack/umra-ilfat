const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
}));
const dialog = document.querySelector('#photo-dialog');
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  const photo = document.querySelector('#large-photo');
  photo.src = button.dataset.photo;
  photo.alt = button.querySelector('img').alt;
  document.querySelector('#photo-caption').textContent = button.dataset.caption;
  dialog.showModal();
}));
document.querySelector('.close-photo').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });

const shareUrl = 'https://a6340374-stack.github.io/umra-ilfat/?v=ilfat-photo#poster';
const shareTitle = 'Умра с Ильфатом · 28 ноября — 11 декабря 2026';
const shareText = 'Умра из Уфы с Ильфатом хазратом Юнусбаевым. 28 ноября — 11 декабря 2026. Стоимость 1 690 $. Телефон: +7 (963) 891-21-07.';
const shareButton = document.querySelector('#share-poster');
const copyLinkButton = document.querySelector('#copy-poster-link');
const shareStatus = document.querySelector('#share-status');
const countElement = document.querySelector('#share-count');
const counterApi = 'https://countapi.mileshilliard.com/api/v1';
const counterKey = 'umra-ilfat-poster-2026-11-28-a6340374';
const sharedStorageKey = 'umra-ilfat-shared-2026-11-28';
let countedThisBrowser = false;
let countPending = false;
let countRevision = 0;
try { countedThisBrowser = localStorage.getItem(sharedStorageKey) === '1'; } catch { /* Storage may be blocked. */ }

async function requestCounter(action) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(`${counterApi}/${action}/${counterKey}`, {
      cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal
    });
    if (!response.ok) throw new Error('Counter unavailable');
    const data = await response.json();
    if (!Number.isSafeInteger(data.value) || data.value < 0) throw new Error('Invalid counter');
    return data.value;
  } finally { clearTimeout(timeout); }
}

function showCount(value) {
  countElement.textContent = value.toLocaleString('ru-RU');
  countElement.removeAttribute('title');
}

const initialCountRevision = countRevision;
requestCounter('get').then(value => {
  if (countRevision === initialCountRevision) showCount(value);
}).catch(() => {
  if (countRevision === initialCountRevision) {
    countElement.textContent = '—';
    countElement.title = 'Счётчик временно недоступен';
  }
});

async function recordShareAction() {
  if (countedThisBrowser || countPending) return;
  countPending = true;
  countRevision++;
  try {
    showCount(await requestCounter('hit'));
    countedThisBrowser = true;
    try { localStorage.setItem(sharedStorageKey, '1'); } catch { /* Deduplicate in memory for this visit. */ }
  } catch {
    countElement.textContent = '—';
    countElement.title = 'Счётчик временно недоступен';
  } finally { countPending = false; }
}

shareButton.addEventListener('click', async () => {
  shareStatus.textContent = '';
  if (typeof navigator.share !== 'function') {
    copyLinkButton.focus();
    shareStatus.textContent = 'Нажмите «Скопировать ссылку» и вставьте её в сообщение.';
    return;
  }
  shareButton.disabled = true;
  try {
    // Share the website URL so the message retains a clickable site link.
    // The page's Open Graph image supplies Ilfat's portrait in supporting apps.
    await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
    void recordShareAction();
  } catch (error) {
    if (error.name !== 'AbortError') {
      copyLinkButton.focus();
      shareStatus.textContent = 'Меню отправки недоступно. Нажмите «Скопировать ссылку».';
    }
  } finally {
    shareButton.disabled = false;
  }
});

document.querySelector('#copy-poster-link').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    void recordShareAction();
    shareStatus.textContent = 'Ссылка скопирована. Вставьте её в сообщение или публикацию.';
  } catch {
    document.querySelector('#manual-share').hidden = false;
    const field = document.querySelector('#poster-share-url');
    field.focus();
    field.select();
    shareStatus.textContent = 'Выделите и скопируйте ссылку из поля.';
  }
});

document.querySelector('#poster-share-url').addEventListener('copy', () => { void recordShareAction(); });
