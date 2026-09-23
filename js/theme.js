// Tema claro/escuro — persiste em localStorage.
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('codeba_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));
  updateBtn();

  function updateBtn() {
    document.querySelectorAll('.theme-toggle').forEach(b => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      b.textContent = isDark ? '☀' : '🌙';
      b.title = isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro';
    });
  }

  window.toggleTheme = function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('codeba_theme', next);
    updateBtn();
  };

  // aplica imediatamente no carregamento para evitar flash
  document.addEventListener('DOMContentLoaded', updateBtn);
})();
