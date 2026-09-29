// Alertas de risco (Fase A — dentro do app).
// Calculado dos dados salvos, sem mudança no banco.
// CRÍTICO: NÃO nos itens 24 (paralisação), 15 (incidente),
//          12 (contaminação ambiental) ou 21 (NR-16/NR-20).
// GRAVE: NÃO em item de norma /G ou /GR.
(function () {
  const CRITICOS = [24, 15, 12, 21];

  function normaDe(numero) {
    const meta = (window.ITENS || []).find(x => x[0] === numero) || [];
    return meta[2] || '';
  }

  function nivelItem(numero, resposta) {
    if (resposta !== 'NAO') return null;
    if (CRITICOS.includes(numero)) return 'critico';
    if (/\/G/.test(normaDe(numero))) return 'grave';
    return null;
  }

  // -> { nivel: 'critico' | 'grave' | null, itens: [numeros com alerta] }
  function avaliarInsp(insp) {
    const out = { nivel: null, itens: [] };
    if (!insp || !Array.isArray(insp.itens)) return out;
    insp.itens.forEach(it => {
      const nv = nivelItem(it.numero, it.resposta);
      if (nv) {
        out.itens.push(it.numero);
        if (nv === 'critico') out.nivel = 'critico';
        else if (!out.nivel) out.nivel = 'grave';
      }
    });
    return out;
  }

  function avaliarGrupo(g) {
    return avaliarInsp(g ? g.insp : null);
  }

  window.Risco = { CRITICOS, nivelItem, avaliarInsp, avaliarGrupo };
})();
