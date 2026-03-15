// ========== УМНЫЙ ПОИСК ПО САЙТУ ==========

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput || !searchBtn) return;
    
    function searchSite() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            alert('Введите минимум 2 символа для поиска');
            return;
        }
        
        const results = [];
        const queryWords = query.split(/\s+/);
        
        // 1. Ищем по страницам
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            const pageId = page.id;
            const pageTitle = page.querySelector('.page-title')?.textContent || 'Страница';
            const pageText = page.innerText || page.textContent;
            
            let found = false;
            let context = '';
            
            queryWords.forEach(word => {
                if (word.length < 2) return;
                
                const index = pageText.toLowerCase().indexOf(word);
                if (index !== -1) {
                    found = true;
                    const start = Math.max(0, index - 50);
                    const end = Math.min(pageText.length, index + word.length + 50);
                    context = pageText.substring(start, end).replace(/\s+/g, ' ').trim();
                    
                    const regex = new RegExp(word, 'gi');
                    context = context.replace(regex, match => `<mark>${match}</mark>`);
                }
            });
            
            if (found) {
                results.push({
                    type: 'page',
                    id: pageId,
                    title: pageTitle,
                    context: context
                });
            }
        });
        
        // 2. Ищем по новостям
        try {
            const news = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NEWS) || '[]');
            news.forEach(item => {
                const searchText = `${item.title} ${item.preview} ${item.content || ''} ${item.details || ''} ${item.tags ? item.tags.join(' ') : ''}`.toLowerCase();
                
                let found = false;
                queryWords.forEach(word => {
                    if (word.length < 2) return;
                    if (searchText.includes(word)) found = true;
                });
                
                if (found) {
                    results.push({
                        type: 'news',
                        id: item.id,
                        title: item.title,
                        date: item.date,
                        preview: item.preview,
                        tags: item.tags
                    });
                }
            });
        } catch (e) {
            console.log('Нет новостей');
        }
        
        // 3. Ищем по вакансиям
        try {
            const vacancies = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.VACANCIES) || '[]');
            vacancies.forEach(item => {
                const detailsText = item.details ? (Array.isArray(item.details) ? item.details.join(' ') : item.details) : '';
                const searchText = `${item.title} ${item.company} ${item.salary} ${detailsText}`.toLowerCase();
                
                let found = false;
                queryWords.forEach(word => {
                    if (word.length < 2) return;
                    if (searchText.includes(word)) found = true;
                });
                
                if (found) {
                    results.push({
                        type: 'vacancy',
                        id: item.id,
                        title: item.title,
                        company: item.company,
                        salary: item.salary,
                        badge: item.badge
                    });
                }
            });
        } catch (e) {
            console.log('Нет вакансий');
        }
        
        if (results.length === 0) {
            alert(`Ничего не найдено по запросу "${query}"`);
            return;
        }
        
        showResults(results, query);
    }
    
    function showResults(results, query) {
        const modal = document.createElement('div');
        modal.className = 'search-modal';
        
        let html = '<div class="search-modal-content"><div class="search-modal-header"><h2>Результаты: "' + query + '"</h2><span class="search-modal-close">&times;</span></div>';
        html += '<div class="search-stats">Найдено: ' + results.length + '</div>';
        html += '<div class="search-results-list">';
        
        results.forEach(r => {
            if (r.type === 'page') {
                html += '<div class="search-result-item" onclick="gotoPage(\'' + r.id + '\')">';
                html += '<div class="result-header"><span class="result-badge page-badge">📄 Страница</span></div>';
                html += '<h3 class="result-title">' + r.title + '</h3>';
                html += '<p class="result-context">' + r.context + '</p></div>';
            } else if (r.type === 'news') {
                html += '<div class="search-result-item" onclick="openNews(' + r.id + ')">';
                html += '<div class="result-header"><span class="result-badge news-badge">📰 Новость</span>';
                html += '<span class="result-date">' + (r.date || '') + '</span></div>';
                html += '<h3 class="result-title">' + r.title + '</h3>';
                html += '<p class="result-context">' + (r.preview || '') + '</p></div>';
            } else {
                html += '<div class="search-result-item" onclick="gotoPage(\'hot-vacancies\')">';
                html += '<div class="result-header"><span class="result-badge vacancy-badge">💼 Вакансия</span></div>';
                html += '<h3 class="result-title">' + r.title + '</h3>';
                html += '<div class="result-meta">🏢 ' + r.company + ' | 💰 ' + r.salary + '</div></div>';
            }
        });
        
        html += '</div></div>';
        modal.innerHTML = html;
        document.body.appendChild(modal);
        
        modal.querySelector('.search-modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    // Обработчики
    searchBtn.onclick = function(e) {
        e.preventDefault();
        searchSite();
    };
    
    searchInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchSite();
        }
    };
});

// Функции для глобального доступа
window.gotoPage = function(pageId) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
    document.getElementById(pageId)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
