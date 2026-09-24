// Autenticação (Supabase Auth, email + senha).
// Exige sessão em todas as páginas protegidas via Auth.require().
(function () {
  function client() {
    return (window.DB && typeof DB.getClient === 'function' && DB.getClient()) || null;
  }

  async function user() {
    const sb = client();
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data?.session?.user || null;
  }

  async function profile() {
    const sb = client();
    const u = await user();
    if (!sb || !u) return null;
    const { data } = await sb.from('profiles').select('nome, papel').eq('id', u.id).single();
    return data || null;
  }

  async function isGestor() {
    const p = await profile();
    return p?.papel === 'gestor';
  }

  // Bloqueia a página sem sessão: revela o body só se logado.
  async function require() {
    const u = await user();
    if (!u) {
      const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      location.replace('login.html?next=' + next);
      return null;
    }
    document.body.style.visibility = 'visible';
    mountUser();
    return u;
  }

  // Preenche #userBox (topbar) com nome + Sair.
  async function mountUser() {
    const box = document.getElementById('userBox');
    if (!box) return;
    const [u, p] = await Promise.all([user(), profile()]);
    if (!u) return;
    const nome = p?.nome || u.email || 'Técnico';
    const papel = p?.papel === 'gestor' ? ' · gestor' : '';
    box.style.display = '';
    box.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = nome + papel;
    const sair = document.createElement('button');
    sair.type = 'button';
    sair.className = 'link like-btn';
    sair.textContent = 'Sair';
    sair.onclick = signOut;
    box.appendChild(span);
    box.appendChild(document.createTextNode(' · '));
    box.appendChild(sair);
  }

  async function signOut() {
    const sb = client();
    if (sb) await sb.auth.signOut();
    location.replace('login.html');
  }

  window.Auth = { user, profile, isGestor, require, mountUser, signOut };
})();
