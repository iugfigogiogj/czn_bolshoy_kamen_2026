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
            console.log('Ошибка при поиске вакансий:', e);
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
        
        let resultsHtml = '';
        let newsCount = 0;
        let pageCount = 0;
        let vacancyCount = 0;
        
        results.forEach(r => {
            if (r.type === 'page') {
                pageCount++;
                resultsHtml += `
                    <div class="search-result-item" onclick="gotoPage('${r.id}')">
                        <div class="result-header">
                            <span class="result-badge page-badge">📄 Страница</span>
                        </div>
                        <h3 class="result-title">${r.title}</h3>
                        <p class="result-context">${r.context}</p>
                    </div>
                `;
            } else if (r.type === 'news') {
                newsCount++;
                const tagsHtml = r.tags && r.tags.length > 0 
                    ? `<div class="result-tags">${r.tags.map(t => `<span class="result-tag">#${t}</span>`).join('')}</div>`
                    : '';
                
                resultsHtml += `
                    <div class="search-result-item" onclick="openNews(${r.id})">
                        <div class="result-header">
                            <span class="result-badge news-badge">📰 Новость</span>
                            <span class="result-date">${r.date || ''}</span>
                        </div>
                        <h3 class="result-title">${r.title}</h3>
                        <p class="result-context">${r.preview || ''}</p>
                        ${tagsHtml}
                    </div>
                `;
            } else if (r.type === 'vacancy') {
                vacancyCount++;
                let badgeText = '';
                let badgeIcon = '';
                switch(r.badge) {
                    case 'hot': 
                        badgeText = 'Срочно';
                        badgeIcon = '🔥';
                        break;
                    case 'attractive': 
                        badgeText = 'Высокая ЗП';
                        badgeIcon = '💰';
                        break;
                    case 'flexible': 
                        badgeText = 'Гибкий график';
                        badgeIcon = '⏰';
                        break;
                    case 'housing': 
                        badgeText = 'Жилье';
                        badgeIcon = '🏠';
                        break;
                    case 'parttime': 
                        badgeText = 'Подработка';
                        badgeIcon = '⚡';
                        break;
                }
                
                resultsHtml += `
                    <div class="search-result-item" onclick="gotoPage('hot-vacancies')">
                        <div class="result-header">
                            <span class="result-badge vacancy-badge">💼 Вакансия</span>
                            ${badgeIcon ? `<span class="result-badge-small">${badgeIcon} ${badgeText}</span>` : ''}
                        </div>
                        <h3 class="result-title">${r.title}</h3>
                        <div class="result-meta">
                            <span>🏢 ${r.company}</span>
                            <span>💰 ${r.salary}</span>
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
                <div class="search-stats">
                    Найдено: ${results.length} 
                    (страниц: ${pageCount}, новостей: ${newsCount}, вакансий: ${vacancyCount})
                </div>
                <div class="search-results-list">
                    ${resultsHtml}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.search-modal-close').onclick = function() {
            modal.remove();
            document.body.style.overflow = '';
        };
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
        
        document.body.style.overflow = 'hidden';
    }
    
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

// Глобальные функции
window.gotoPage = function(pageId) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const link = document.querySelector(`[data-page="${pageId}"]`);
    if (link) link.classList.add('active');
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ========== СТИЛИ ДЛЯ ПОИСКА ==========
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 30px;
        overflow-y: auto;
    }
    
    .search-modal-content {
        max-width: 800px;
        width: 100%;
        max-height: 85vh;
        background: white;
        border-radius: 16px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        animation: modalShow 0.2s ease;
        margin: auto;
        display: flex;
        flex-direction: column;
    }
    
    .search-modal-header {
        padding: 25px 30px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        background: white;
        border-radius: 16px 16px 0 0;
        z-index: 10;
    }
    
    .search-modal-header h2 {
        color: #004999;
        font-size: 22px;
        margin: 0;
    }
    
    .search-modal-close {
        font-size: 32px;
        color: #999;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
    }
    
    .search-modal-close:hover {
        background: #f5f5f5;
        color: #DC3545;
    }
    
    .search-stats {
        padding: 15px 30px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
        font-size: 14px;
        color: #666;
    }
    
    .search-results-list {
        padding: 20px 30px 30px;
        overflow-y: auto;
        max-height: calc(85vh - 120px);
    }
    
    .search-result-item {
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 12px;
        margin-bottom: 15px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
    }
    
    .search-result-item:hover {
        border-color: #0066CC;
        box-shadow: 0 5px 15px rgba(0,102,204,0.1);
        transform: translateY(-2px);
    }
    
    .result-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }
    
    .result-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 600;
        color: white;
    }
    
    .page-badge {
        background: #6c757d;
    }
    
    .news-badge {
        background: #28A745;
    }
    
    .vacancy-badge {
        background: #0066CC;
    }
    
    .result-badge-small {
        display: inline-block;
        padding: 4px 12px;
        background: #f0f0f0;
        border-radius: 30px;
        font-size: 12px;
    }
    
    .result-date {
        color: #999;
        font-size: 13px;
        margin-left: auto;
    }
    
    .result-title {
        color: #004999;
        font-size: 18px;
        margin-bottom: 8px;
        word-wrap: break-word;
    }
    
    .result-context {
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 10px;
        word-wrap: break-word;
    }
    
    .result-meta {
        display: flex;
        gap: 15px;
        color: #666;
        font-size: 14px;
        flex-wrap: wrap;
    }
    
    .result-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 10px;
    }
    
    .result-tag {
        background: #E6F2FF;
        color: #004999;
        padding: 2px 10px;
        border-radius: 20px;
        font-size: 11px;
    }
    
    mark {
        background: #ffeb3b;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 500;
    }
    
    @keyframes modalShow {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    
    @media (max-width: 600px) {
        .search-modal {
            padding: 15px;
        }
        
        .search-modal-header {
            padding: 20px;
        }
        
        .search-modal-header h2 {
            font-size: 18px;
        }
        
        .search-stats {
            padding: 12px 20px;
        }
        
        .search-results-list {
            padding: 15px 20px 20px;
        }
        
        .search-result-item {
            padding: 15px;
        }
    }
`;

document.head.appendChild(searchStyles);
