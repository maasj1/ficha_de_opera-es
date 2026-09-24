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
    const { data } = await sb.from('profiles').select('nome, papel, funcao, setor').eq('id', u.id).single();
    return data || null;
  }

  // Garante linha de perfil (criada no 1º login; gestor completa depois).
  async function ensureProfile() {
    const sb = client();
    const u = await user();
    if (!sb || !u) return null;
    const { data } = await sb.from('profiles').select('id').eq('id', u.id).single();
    if (data) return data;
    const nome = String(u.email || '').split('@')[0].replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()) || null;
    await sb.from('profiles').insert({ id: u.id, nome });
    return { id: u.id };
  }

  const FUNCAO_LABEL = {
    tecnico: 'Técnico', fiel: 'Fiel', chefe: 'Chefe de área',
    gerente: 'Gerente', outro: 'Outra função'
  };

  // Campos do formulário preenchidos por função operacional.
  const FUNCAO_FIELDS = {
    tecnico: ['tecnico_operacoes', 'tecnico_nome'],
    fiel: ['fiel_armazem'],
    chefe: ['chefe_nome'],
    gerente: ['gerente_nome']
  };

  // Preenche campos vazios com o nome do usuário, conforme sua função.
  async function autofill(form) {
    const p = await profile();
    if (!p?.nome || !p?.funcao) return;
    (FUNCAO_FIELDS[p.funcao] || []).forEach(name => {
      form.querySelectorAll(`[name="${name}"]`).forEach(el => {
        if (el.type !== 'radio' && !el.value) el.value = p.nome;
      });
    });
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

  // Preenche #userBox (topbar) com nome + função + Sair.
  // Gestor ganha link "Usuários" na navegação.
  async function mountUser() {
    const box = document.getElementById('userBox');
    const [u, p] = await Promise.all([user(), profile()]);
    if (box && u) {
      const nome = p?.nome || u.email || 'Técnico';
      const funcao = p?.funcao && FUNCAO_LABEL[p.funcao] ? ' · ' + FUNCAO_LABEL[p.funcao] : '';
      const papel = p?.papel === 'gestor' ? ' (gestor)' : '';
      box.style.display = '';
      box.innerHTML = '';
      const span = document.createElement('span');
      span.textContent = nome + funcao + papel;
      const sair = document.createElement('button');
      sair.type = 'button';
      sair.className = 'link like-btn';
      sair.textContent = 'Sair';
      sair.onclick = signOut;
      box.appendChild(span);
      box.appendChild(document.createTextNode(' · '));
      box.appendChild(sair);
    }
    if (u && (await isGestorSafe(p))) {
      const nav = document.querySelector('header.topbar nav');
      if (nav && !nav.querySelector('[data-nav-usuarios]')) {
        const a = document.createElement('a');
        a.href = 'usuarios.html';
        a.textContent = 'Usuários';
        a.setAttribute('data-nav-usuarios', '1');
        nav.appendChild(a);
      }
    }
  }

  async function isGestorSafe(p) {
    const prof = p || await profile();
    return prof?.papel === 'gestor';
  }

  async function signOut() {
    const sb = client();
    if (sb) await sb.auth.signOut();
    location.replace('login.html');
  }

  window.Auth = { user, profile, ensureProfile, isGestor, require, mountUser, signOut, autofill, FUNCAO_LABEL };
})();
