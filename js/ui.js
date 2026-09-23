// UI helpers: toasts com ícones + skeletons. Sem dependências.
(function () {
  function ensureBox() {
    let box = document.getElementById('toasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toasts';
      box.className = 'no-print';
      document.body.appendChild(box);
    }
    return box;
  }

  const ICONS = { ok: '✓', err: '✕', info: 'ℹ' };

  window.toast = function (msg, type) {
    const box = ensureBox();
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = ICONS[type] || ICONS.info;

    const text = document.createElement('span');
    text.textContent = msg;

    el.appendChild(icon);
    el.appendChild(text);
    box.appendChild(el);

    // Fade out
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(60px) scale(.95)';
      el.style.transition = 'opacity .4s ease, transform .4s ease';
    }, 3400);
    setTimeout(() => el.remove(), 3900);
  };

  window.skeleton = function (el, rows) {
    if (!el) return;
    el.innerHTML = Array.from({ length: rows || 3 })
      .map((_, i) => `<div class="skeleton" style="animation-delay:${i * .08}s;min-height:${62 + i * 4}px">carregando…</div>`)
      .join('');
  };
})();
