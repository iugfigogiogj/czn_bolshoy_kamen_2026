// ========== ПОДКЛЮЧЕНИЕ К SUPABASE ЧЕРЕЗ ПРОКСИ NETLIFY ==========
const SUPABASE_URL = window.location.origin + '/supabase';
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
    console.log('✅ Supabase инициализирован через Netlify Proxy');
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
