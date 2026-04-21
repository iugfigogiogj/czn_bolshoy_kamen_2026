// ========== ПОДКЛЮЧЕНИЕ К SUPABASE ==========
const SUPABASE_URL = 'https://kobehbqvfcpuwlubwaus.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kHCVJfX3Qh2uGvZSkARa-Q_jDtqfDu7';

// Глобальный объект supabase
let supabaseClient = null;

// Инициализация Supabase
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase SDK не загружен!');
        return;
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase инициализирован');
    return supabaseClient;
}

// Ждём загрузку SDK
if (typeof supabase !== 'undefined') {
    initSupabase();
} else {
    console.log('⏳ Ожидание загрузки Supabase SDK...');
    window.addEventListener('load', () => {
        if (typeof supabase !== 'undefined') {
            initSupabase();
        }
    });
}
