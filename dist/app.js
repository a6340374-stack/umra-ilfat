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

const shareUrl = 'https://a6340374-stack.github.io/umra-ilfat/#poster';
const shareTitle = 'Умра с Ильфатом · 28 ноября — 11 декабря 2026';
const shareText = 'Умра из Уфы с Ильфатом хазратом Юнусбаевым. 28 ноября — 11 декабря 2026. Стоимость 1 690 $. Телефон: +7 (963) 891-21-07.';
const shareButton = document.querySelector('#share-poster');
const shareOptions = document.querySelector('#share-options');
const shareStatus = document.querySelector('#share-status');
let posterFile;

document.querySelector('#share-telegram').href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
document.querySelector('#share-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

// Load the image before the click so the native share keeps its user activation.
if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
  fetch('assets/umra-november-poster.jpg')
    .then(response => { if (!response.ok) throw new Error('Poster unavailable'); return response.blob(); })
    .then(blob => { posterFile = new File([blob], 'umra-ilfat-28-november.jpg', { type: 'image/jpeg' }); })
    .catch(() => { posterFile = undefined; });
}

shareButton.addEventListener('click', async () => {
  shareStatus.textContent = '';
  if (typeof navigator.share !== 'function') {
    shareOptions.open = true;
    shareStatus.textContent = 'Выберите приложение или скопируйте ссылку.';
    return;
  }
  shareButton.disabled = true;
  try {
    const data = posterFile && navigator.canShare?.({ files: [posterFile] })
      ? { files: [posterFile], title: shareTitle, text: shareText }
      : { title: shareTitle, text: shareText, url: shareUrl };
    await navigator.share(data);
  } catch (error) {
    if (error.name !== 'AbortError') {
      shareOptions.open = true;
      shareStatus.textContent = 'Меню отправки недоступно. Выберите другой способ ниже.';
    }
  } finally {
    shareButton.disabled = false;
  }
});

document.querySelector('#copy-poster-link').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    shareStatus.textContent = 'Ссылка скопирована. Вставьте её в сообщение или публикацию.';
  } catch {
    document.querySelector('#manual-share').hidden = false;
    const field = document.querySelector('#poster-share-url');
    field.focus();
    field.select();
    shareStatus.textContent = 'Выделите и скопируйте ссылку из поля.';
  }
});
