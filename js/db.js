// Camada de dados: Supabase (se configurado) + fallback localStorage.
(function () {
  const cfg = window.APP_CONFIG || {};
  let sb = null;

  if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase) {
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }

  function isOnline() { return !!sb; }

  function getClient() { return sb; }

  // ---- fallback local ----
  function readLocal(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }
  function writeLocal(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }

  async function insert(table, row) {
    row = { ...row, created_at: new Date().toISOString() };
    if (!sb) {
      row.id = 'local-' + Date.now();
      const arr = readLocal(table);
      arr.unshift(row);
      writeLocal(table, arr);
      return row;
    }
    const { data, error } = await sb.from(table).insert(row).select().single();
    if (error) throw error;
    return data;
  }

  async function update(table, id, row) {
    if (!sb || String(id).startsWith('local-')) {
      const arr = readLocal(table).map(r => String(r.id) === String(id) ? { ...r, ...row } : r);
      writeLocal(table, arr);
      return arr.find(r => String(r.id) === String(id));
    }
    const { data, error } = await sb.from(table).update(row).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async function listBy(table, column, value) {
    if (!sb) {
      const arr = readLocal(table).filter(r => String(r[column]) === String(value));
      return arr;
    }
    const { data, error } = await sb.from(table).select('*').eq(column, value);
    if (error) throw error;
    return data;
  }

  async function list(table) {
    if (!sb) return readLocal(table);
    const { data, error } = await sb.from(table).select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return data;
  }

  async function get(table, id) {
    if (!sb || String(id).startsWith('local-')) {
      return readLocal(table).find(r => String(r.id) === String(id)) || null;
    }
    const { data, error } = await sb.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async function remove(table, id) {
    if (!sb || String(id).startsWith('local-')) {
      writeLocal(table, readLocal(table).filter(r => String(r.id) !== String(id)));
      return;
    }
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) throw error;
  }

  window.DB = { isOnline, getClient, insert, update, list, listBy, get, remove };
})();
