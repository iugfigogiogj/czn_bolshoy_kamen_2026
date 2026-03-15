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
        
        // Результаты поиска
        const results = [];
        const queryWords = query.split(/\s+/);
        
        // 1. Ищем по страницам сайта
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            const pageId = page.id;
            const pageTitle = page.querySelector('.page-title')?.textContent || 'Страница';
            const pageText = page.innerText || page.textContent;
            const lowerText = pageText.toLowerCase();
            
            let found = false;
            let context = '';
            
            queryWords.forEach(word => {
                if (word.length < 2) return;
                
                const index = lowerText.indexOf(word);
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
                    context: context,
                    url: `#${pageId}`
                });
            }
        });
        
        // 2. Ищем по новостям (из localStorage)
        const news = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NEWS) || '[]');
        news.forEach(item => {
            const searchText = `${item.title} ${item.preview} ${item.content || ''} ${item.details || ''} ${item.tags ? item.tags.join(' ') : ''}`.toLowerCase();
            
            let found = false;
            queryWords.forEach(word => {
                if (word.length < 2) return;
                if (searchText.includes(word)) found = true;
            });
            
            if (found) {
                let context = item.preview;
                if (context.length > 150) context = context.substring(0, 150) + '...';
                
                results.push({
                    type: 'news',
                    id: item.id,
                    title: item.title,
                    date: item.date,
                    preview: context,
                    image: item.image,
                    tags: item.tags
                });
            }
        });
        
        // 3. Ищем по вакансиям (из localStorage)
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
                    badge: item.badge,
                    details: item.details
                });
            }
        });
        
        // Показываем результаты
        if (results.length === 0) {
            alert(`Ничего не найдено по запросу "${query}"`);
            return;
        }
        
        showSearchResults(results, query);
    }
    
    function showSearchResults(results, query) {
        const modal = document.createElement('div');
        modal.className = 'search-modal';
        
        let resultsHtml = '';
        let newsCount = 0;
        let pageCount = 0;
        let vacancyCount = 0;
        
        results.forEach(result => {
            if (result.type === 'page') {
                pageCount++;
                resultsHtml += `
                    <div class="search-result-item" onclick="gotoPage('${result.id}'); closeSearchModal(this)">
                        <div class="result-header">
                            <span class="result-badge page-badge">📄 Страница</span>
                        </div>
                        <h3 class="result-title">${result.title}</h3>
                        <p class="result-context">${result.context}</p>
                    </div>
                `;
            } else if (result.type === 'news') {
                newsCount++;
                const tagsHtml = result.tags && result.tags.length > 0 
                    ? `<div class="result-tags">${result.tags.map(t => `<span class="result-tag">#${t}</span>`).join('')}</div>`
                    : '';
                
                resultsHtml += `
                    <div class="search-result-item" onclick="openNews(${result.id}); closeSearchModal(this)">
                        <div class="result-header">
                            <span class="result-badge news-badge">📰 Новость</span>
                            <span class="result-date">${result.date}</span>
                        </div>
                        <h3 class="result-title">${highlightText(result.title, query)}</h3>
                        <p class="result-context">${highlightText(result.preview, query)}</p>
                        ${tagsHtml}
                    </div>
                `;
            } else if (result.type === 'vacancy') {
                vacancyCount++;
                let badgeText = '';
                switch(result.badge) {
                    case 'hot': badgeText = '🔥 Срочно'; break;
                    case 'attractive': badgeText = '💰 Высокая ЗП'; break;
                    case 'flexible': badgeText = '⏰ Гибкий график'; break;
                    case 'housing': badgeText = '🏠 Жилье'; break;
                    case 'parttime': badgeText = '⚡ Подработка'; break;
                }
                
                resultsHtml += `
                    <div class="search-result-item" onclick="gotoPage('hot-vacancies'); closeSearchModal(this)">
                        <div class="result-header">
                            <span class="result-badge vacancy-badge">💼 Вакансия</span>
                            ${badgeText ? `<span class="result-badge-small">${badgeText}</span>` : ''}
                        </div>
                        <h3 class="result-title">${highlightText(result.title, query)}</h3>
                        <div class="result-meta">
                            <span>🏢 ${highlightText(result.company, query)}</span>
                            <span>💰 ${highlightText(result.salary, query)}</span>
                        </div>
                    </div>
                `;
            }
        });
        
        modal.innerHTML = `
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <h2>Результаты поиска: "${query}"</h2>
                    <span class="search-modal-close">&times;</span>
                </div>
                <div class="search-stats">Найдено: ${results.length}</div>
                <div class="search-results-list">${resultsHtml}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.search-modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    function highlightText(text, query) {
        if (!text || !query) return text;
        const words = query.split(/\s+/);
        let highlighted = text;
        words.forEach(word => {
            if (word.length < 2) return;
            try {
                const regex = new RegExp(`(${word})`, 'gi');
                highlighted = highlighted.replace(regex, '<mark>$1</mark>');
            } catch (e) {}
        });
        return highlighted;
    }
    
    window.closeSearchModal = function(element) {
        element.closest('.search-modal')?.remove();
    };
    
    window.gotoPage = function(pageId) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
        document.getElementById(pageId)?.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // ПРОСТЫЕ ОБРАБОТЧИКИ
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
