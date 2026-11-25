// ========== ЛЁГКИЙ КЛИЕНТ SUPABASE НА ЧИСТОМ FETCH (БЕЗ ВНЕШНИХ CDN) ==========
const SUPABASE_URL = window.location.origin + '/supabase';
const SUPABASE_KEY = 'sb_publishable_kHCVJfX3Qh2uGvZSkARa-Q_jDtqfDu7';

function createFetchSupabaseClient(url, key) {
    const baseHeaders = {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
    };

    return {
        from(table) {
            let queryParams = [];
            let method = 'GET';
            let bodyData = null;
            let singleRow = false;
            let headers = { ...baseHeaders };

            const builder = {
                select(columns = '*') {
                    queryParams.push(`select=${encodeURIComponent(columns)}`);
                    return builder;
                },
                eq(col, val) {
                    queryParams.push(`${encodeURIComponent(col)}=eq.${encodeURIComponent(val)}`);
                    return builder;
                },
                neq(col, val) {
                    queryParams.push(`${encodeURIComponent(col)}=neq.${encodeURIComponent(val)}`);
                    return builder;
                },
                order(col, opts = {}) {
                    const dir = opts.ascending === false ? 'desc' : 'asc';
                    queryParams.push(`order=${encodeURIComponent(col)}.${dir}`);
                    return builder;
                },
                limit(n) {
                    queryParams.push(`limit=${n}`);
                    return builder;
                },
                single() {
                    singleRow = true;
                    headers['Accept'] = 'application/vnd.pgrst.object+json';
                    return builder;
                },
                insert(rows) {
                    method = 'POST';
                    bodyData = JSON.stringify(rows);
                    headers['Prefer'] = 'return=representation';
                    return builder;
                },
                update(values) {
                    method = 'PATCH';
                    bodyData = JSON.stringify(values);
                    headers['Prefer'] = 'return=representation';
                    return builder;
                },
                delete() {
                    method = 'DELETE';
                    return builder;
                },
                async then(resolve, reject) {
                    try {
                        const qs = queryParams.length ? '?' + queryParams.join('&') : '';
                        const res = await fetch(`${url}/rest/v1/${table}${qs}`, {
                            method,
                            headers,
                            body: bodyData
                        });
                        const text = await res.text();
                        const data = text ? JSON.parse(text) : null;
                        if (!res.ok) {
                            resolve({ data: null, error: data || { message: res.statusText } });
                        } else {
                            resolve({ data, error: null });
                        }
                    } catch (err) {
                        resolve({ data: null, error: err });
                    }
                }
            };
            return builder;
        }
    };
}

let supabaseClient = createFetchSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
console.log('✅ Supabase подключён через встроенный fetch и Netlify Proxy');
