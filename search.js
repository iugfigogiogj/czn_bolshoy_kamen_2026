// ========== УМНЫЙ ПОИСК ПО САЙТУ ==========

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput || !searchBtn) return;
    
    // Функция поиска
    function searchSite() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            alert('Введите минимум 2 символа для поиска');
            return;
        }
        
        // Результаты поиска
        const results = [];
        const queryWords = query.split(/\s+/); // Разбиваем запрос на отдельные слова
        
        // 1. Ищем по страницам сайта
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            const pageId = page.id;
            const pageTitle = page.querySelector('.page-title')?.textContent || 'Страница';
            const pageText = page.innerText || page.textContent;
            const lowerText = pageText.toLowerCase();
            
            let found = false;
            let context = '';
            
            // Проверяем каждое слово из запроса
            queryWords.forEach(word => {
                if (word.length < 2) return;
                
                const index = lowerText.indexOf(word);
                if (index !== -1) {
                    found = true;
                    // Берем контекст (100 символов вокруг)
                    const start = Math.max(0, index - 50);
                    const end = Math.min(pageText.length, index + word.length + 50);
                    context = pageText.substring(start, end).replace(/\s+/g, ' ').trim();
                    
                    // Выделяем найденное слово
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
        
        // 2. Ищем по новостям (из localStorage или API)
        let news = [];
        if (typeof API !== 'undefined' && API.getNews) {
            try {
                news = await API.getNews();
            } catch (e) {
                news = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NEWS) || '[]');
            }
        } else {
            news = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NEWS) || '[]');
        }
        
        for (const item of news) {
            const searchText = `${item.title} ${item.preview} ${item.content || ''} ${item.details || ''} ${item.tags ? item.tags.join(' ') : ''}`.toLowerCase();
            
            let found = false;
            queryWords.forEach(word => {
                if (word.length < 2) return;
                if (searchText.includes(word)) found = true;
            });
            
            if (found) {
                // Находим контекст в preview
                let context = item.preview;
                if (context.length > 150) {
                    context = context.substring(0, 150) + '...';
                }
                
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
        }
        
        // 3. Ищем по вакансиям (из localStorage или API)
        let vacancies = [];
        if (typeof API !== 'undefined' && API.getVacancies) {
            try {
                vacancies = await API.getVacancies();
            } catch (e) {
                vacancies = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.VACANCIES) || '[]');
            }
        } else {
            vacancies = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.VACANCIES) || '[]');
        }
        
        for (const item of vacancies) {
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
        }
        
        // Показываем результаты
        if (results.length === 0) {
            alert(`Ничего не найдено по запросу "${query}"`);
            return;
        }
        
        showSearchResults(results, query);
    }
    
    function showSearchResults(results, query) {
        // Создаем модальное окно
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
                        <div class="result-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                            <span class="result-badge vacancy-badge" style="display: inline-block; padding: 4px 12px; background: #0066CC; color: white; border-radius: 30px; font-size: 12px; font-weight: 600; position: relative; top: 0; right: 0; left: auto; float: none; margin: 0;">💼 Вакансия</span>
                            ${badgeText ? `<span class="result-badge-small" style="display: inline-block; padding: 4px 12px; background: #f0f0f0; border-radius: 30px; font-size: 12px; position: relative; top: 0; right: 0; left: auto; float: none; margin: 0;">${badgeText}</span>` : ''}
                        </div>
                        <h3 class="result-title" style="color: #004999; font-size: 18px; margin-bottom: 8px; clear: both;">${highlightText(result.title, query)}</h3>
                        <div class="result-meta" style="display: flex; gap: 15px; color: #666; font-size: 14px; margin-bottom: 8px; flex-wrap: wrap;">
                            <span>🏢 ${highlightText(result.company, query)}</span>
                            <span>💰 ${highlightText(result.salary, query)}</span>
                        </div>
                        ${result.details ? `<p class="result-details" style="color: #999; font-size: 13px; margin-top: 8px;">${Array.isArray(result.details) ? result.details.slice(0, 2).map(d => highlightText(d, query)).join(' • ') : ''}</p>` : ''}
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
                </div>
                
                <div class="search-results-list">
                    ${resultsHtml}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Закрытие
        const closeBtn = modal.querySelector('.search-modal-close');
        closeBtn.onclick = function() {
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
    
    function highlightText(text, query) {
        if (!text || !query) return text;
        const words = query.split(/\s+/);
        let highlighted = text;
        words.forEach(word => {
            if (word.length < 2) return;
            try {
                const regex = new RegExp(`(${word})`, 'gi');
                highlighted = highlighted.replace(regex, '<mark>$1</mark>');
            } catch (e) {
                // Игнорируем ошибки регекса
            }
        });
        return highlighted;
    }
    
    // Функция закрытия модалки
    window.closeSearchModal = function(element) {
        const modal = element.closest('.search-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    };
    
    // Функция перехода на страницу
    window.gotoPage = function(pageId) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        const link = document.querySelector(`[data-page="${pageId}"]`);
        if (link) {
            link.classList.add('active');
        }
        
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // ========== ИСПРАВЛЕННЫЕ ОБРАБОТЧИКИ ==========
    
    // Принудительно убираем возможные блокировки CSS
    searchBtn.style.pointerEvents = 'auto';
    searchBtn.style.cursor = 'pointer';
    searchBtn.style.position = 'relative';
    searchBtn.style.zIndex = '9999';
    searchBtn.style.opacity = '1';
    searchBtn.style.visibility = 'visible';
    
    // Основной обработчик клика
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔍 Поиск по кнопке');
        searchSite();
    });
    
    // Дополнительный обработчик на всякий случай
    searchBtn.addEventListener('mousedown', function(e) {
        e.preventDefault();
    });
    
    // Обработчик Enter в поле ввода
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log('🔍 Поиск по Enter');
            searchSite();
        }
    });
    
    // Проверка при загрузке страницы
    console.log('✅ Поиск инициализирован');
});

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
        align-items: flex-start;
        padding: 30px;
        overflow-y: auto;
    }
    
    .search-modal-content {
        max-width: 800px;
        width: 100%;
        background: white;
        border-radius: 16px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        animation: modalShow 0.2s ease;
        margin: auto;
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
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .search-result-item {
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 12px;
        margin-bottom: 15px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
        display: block;
        width: 100%;
        box-sizing: border-box;
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
        width: 100%;
    }
    
    .result-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 600;
        color: white;
        position: relative;
        top: 0;
        right: 0;
        left: auto;
        float: none;
        margin: 0;
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
        position: relative;
        top: 0;
        right: 0;
        left: auto;
        float: none;
        margin: 0;
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
        clear: both;
        width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
    
    .result-context {
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 10px;
        width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
    
    .result-meta {
        display: flex;
        gap: 15px;
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
        flex-wrap: wrap;
        width: 100%;
    }
    
    .result-details {
        color: #999;
        font-size: 13px;
        margin-top: 8px;
        width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
    
    .result-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 10px;
        width: 100%;
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
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
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
