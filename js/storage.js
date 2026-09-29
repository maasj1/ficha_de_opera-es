// Evidências fotográficas (Supabase Storage, bucket `evidencias`).
// Compacta no cliente (max 1280px, JPEG ~0.72) antes de enviar.
(function () {
  const BUCKET = 'evidencias';
  const MAX_DIM = 1280;
  const QUALITY = 0.72;
  const MAX_POR_ITEM = 3;

  function client() {
    return (window.DB && typeof DB.getClient === 'function' && DB.getClient()) || null;
  }
  function baseUrl() {
    const cfg = window.APP_CONFIG || {};
    return String(cfg.SUPABASE_URL || '').replace(/\/$/, '') + '/storage/v1/object/public/' + BUCKET + '/';
  }
  function publicUrl(path) {
    return baseUrl() + String(path).split('/').map(encodeURIComponent).join('/');
  }

  // Garante arquivo decodificável: converte HEIC/HEIF (foto de iPhone) para JPEG.
  // Suporta JPG, PNG, WEBP, GIF e HEIC/HEIF.
  async function toDecodable(file) {
    if (!file) throw new Error('Nenhum arquivo selecionado.');
    const name = file.name || 'foto';
    const isHeic = /heic|heif/i.test(file.type || '') || /\.hei[cf]$/i.test(name);
    if (isHeic) {
      if (typeof heic2any !== 'function')
        throw new Error('Foto HEIC não suportada aqui. Converta para JPG e tente de novo.');
      const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
      const blob = Array.isArray(out) ? out[0] : out;
      return new File([blob], name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
    }
    if (file.type && !file.type.startsWith('image/'))
      throw new Error('Selecione uma imagem (JPG, PNG, WEBP ou HEIC).');
    return file;
  }

  async function compress(file) {
    file = await toDecodable(file);
    let bmp;
    try {
      bmp = await createImageBitmap(file);
    } catch (_) {
      throw new Error('Não consegui ler esta imagem. Tente JPG ou PNG.');
    }
    const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(bmp, 0, 0, w, h);
    if (bmp.close) bmp.close();
    return new Promise((res, rej) => c.toBlob(
      b => (b ? res(b) : rej(new Error('Falha ao compactar imagem.'))),
      'image/jpeg', QUALITY));
  }

  // Traduz erros do Storage em mensagens acionáveis.
  function friendlyStorageError(error, acao) {
    const msg = String((error && (error.message || error.error)) || error || '');
    if (/NoSuchBucket|Bucket not found/i.test(msg))
      return new Error("Bucket 'evidencias' não existe. Rode a migration supabase/migration_evidencias_assinaturas.sql no SQL Editor.");
    if (/row-level security|RLS|not authorized|unauthorized|permission/i.test(msg))
      return new Error('Sem permissão no Storage. Confira as policies do bucket e se você está logado.');
    if (/too large|too_large|payload|entity/i.test(msg))
      return new Error('Foto muito grande para enviar.');
    if (/Duplicate|already exists/i.test(msg) && acao === 'upload')
      return new Error('DUPLICATE_RETRY');
    return error instanceof Error ? error : new Error(msg || 'Falha no Storage.');
  }

  async function upload(grupoId, itemN, file) {
    const sb = client();
    if (!sb) throw new Error('Sem conexão.');
    const blob = await compress(file);
    for (let tentativa = 0; tentativa < 2; tentativa++) {
      const path = grupoId + '/item' + itemN + '_' + Date.now() + '.jpg';
      const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
        contentType: 'image/jpeg', upsert: false
      });
      if (!error) return path;
      const friendly = friendlyStorageError(error, 'upload');
      if (String(friendly.message) === 'DUPLICATE_RETRY') continue;
      throw friendly;
    }
    throw new Error('Não foi possível enviar. Tente de novo.');
  }

  async function remove(paths) {
    const sb = client();
    if (!sb || !paths || !paths.length) return;
    const { error } = await sb.storage.from(BUCKET).remove(paths);
    if (error) throw friendlyStorageError(error, 'remove');
  }

  window.Fotos = { upload, remove, publicUrl, MAX_POR_ITEM };
})();
