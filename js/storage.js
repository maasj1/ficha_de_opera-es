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

  async function compress(file) {
    const bmp = await createImageBitmap(file);
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

  async function upload(grupoId, itemN, file) {
    const sb = client();
    if (!sb) throw new Error('Sem conexão.');
    const blob = await compress(file);
    const path = grupoId + '/item' + itemN + '_' + Date.now() + '.jpg';
    const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
      contentType: 'image/jpeg', upsert: false
    });
    if (error) throw error;
    return path;
  }

  async function remove(paths) {
    const sb = client();
    if (!sb || !paths || !paths.length) return;
    const { error } = await sb.storage.from(BUCKET).remove(paths);
    if (error) throw error;
  }

  window.Fotos = { upload, remove, publicUrl, MAX_POR_ITEM };
})();
