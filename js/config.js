// Configuração do Supabase (projeto ficha_de_operacao).
// Valores padrão do projeto; a tela inicial pode sobrescrever via localStorage.
window.APP_CONFIG = {
  SUPABASE_URL: localStorage.getItem('sb_url') || 'https://yolihnlzmhjmzaukcyiz.supabase.co',
  SUPABASE_ANON_KEY: localStorage.getItem('sb_key') || 'sb_publishable_bnKIhFON0bD5LC6nWaIcbQ_a5bcVJrc'
};
