// ========== УПРАВЛЕНИЕ КОНТЕНТОМ ==========

class ContentManager {
    constructor() {
        this.news = [];
        this.currentPage = 1;
        this.currentTag = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.loadNews();
        this.setupEventListeners();
        this.renderNews();
        this.renderTags();
    }

    loadNews() {
        // Загружаем новости из localStorage
        const savedNews = localStorage.getItem(CONFIG.STORAGE_KEYS.NEWS);
        if (savedNews) {
            this.news = JSON.parse(savedNews);
        } else {
            this.news = DEFAULT_NEWS;
            this.saveNews();
        }
    }

    saveNews() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.NEWS, JSON.stringify(this.news));
    }

    setupEventListeners() {
        // Поиск по новостям
        const searchInput = document.getElementById('newsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.renderNews();
            });
        }

        // Слушаем изменения в админке
        window.addEventListener('storage', (e) => {
            if (e.key === CONFIG.STORAGE_KEYS.NEWS) {
                this.loadNews();
                this.renderNews();
                this.renderTags();
            }
        });
    }

    getFilteredNews() {
        let filtered = [...this.news];

        // Фильтр по тегу
        if (this.currentTag !== 'all') {
            filtered = filtered.filter(news => news.tags && news.tags.includes(this.currentTag));
        }

        // Фильтр по поиску
        if (this.searchQuery) {
            filtered = filtered.filter(news => {
                const searchable = `${news.title} ${news.preview} ${news.content} ${news.tags?.join(' ')}`.toLowerCase();
                return searchable.includes(this.searchQuery);
            });
        }

        return filtered;
    }

    renderNews() {
        const grid = document.getElementById('newsGrid');
        const pagination = document.getElementById('newsPagination');
        
        if (!grid) return;

        const filtered = this.getFilteredNews();
        const totalPages = Math.ceil(filtered.length / CONFIG.NEWS.PER_PAGE);
        const start = (this.currentPage - 1) * CONFIG.NEWS.PER_PAGE;
        const end = start + CONFIG.NEWS.PER_PAGE;
        const pageNews = filtered.slice(start, end);

        if (pageNews.length === 0) {
            grid.innerHTML = '<div class="no-data">Новостей не найдено</div>';
            if (pagination) pagination.innerHTML = '';
            return;
        }

        let html = '';
        pageNews.forEach(news => {
            const previewText = news.preview.length > CONFIG.NEWS.PREVIEW_LENGTH 
                ? news.preview.substring(0, CONFIG.NEWS.PREVIEW_LENGTH) + '...' 
                : news.preview;

            // Подсветка поиска
            const highlightedTitle = this.highlightText(news.title, this.searchQuery);
            const highlightedPreview = this.highlightText(previewText, this.searchQuery);

            html += `
                <article class="news-card" onclick="openNewsModal('${news.title.replace(/'/g, "\\'")}', \`${news.content.replace(/`/g, '\\`')}\`)">
                    ${news.image ? `<img src="${news.image}" alt="${news.title}" class="news-image">` : ''}
                    <div class="news-date">${news.date}</div>
                    <h3>${highlightedTitle}</h3>
                    <p>${highlightedPreview}</p>
                    <div class="news-tags">
                        ${news.tags ? news.tags.map(tag => 
                            `<span class="news-tag" onclick="event.stopPropagation(); contentManager.filterByTag('${tag}')">#${tag}</span>`
                        ).join('') : ''}
                    </div>
                    <a href="#" class="news-link" onclick="event.preventDefault(); event.stopPropagation(); openNewsModal('${news.title.replace(/'/g, "\\'")}', \`${news.content.replace(/`/g, '\\`')}\`)">Читать далее →</a>
                </article>
            `;
        });

        grid.innerHTML = html;

        // Пагинация
        if (pagination) {
            if (totalPages <= 1) {
                pagination.innerHTML = '';
            } else {
                let paginationHtml = '';
                for (let i = 1; i <= totalPages; i++) {
                    paginationHtml += `<button class="${i === this.currentPage ? 'active' : ''}" onclick="contentManager.goToPage(${i})">${i}</button>`;
                }
                pagination.innerHTML = paginationHtml;
            }
        }
    }

    highlightText(text, query) {
        if (!query || !CONFIG.SEARCH.HIGHLIGHT) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    renderTags() {
        const container = document.getElementById('newsTagsFilter');
        if (!container) return;

        // Собираем все теги
        const allTags = new Set();
        this.news.forEach(news => {
            if (news.tags) {
                news.tags.forEach(tag => allTags.add(tag));
            }
        });

        const tagsArray = Array.from(allTags).sort();

        let html = `
            <button class="tag-filter-btn ${this.currentTag === 'all' ? 'active' : ''}" onclick="contentManager.filterByTag('all')">Все</button>
        `;

        tagsArray.forEach(tag => {
            html += `
                <button class="tag-filter-btn ${this.currentTag === tag ? 'active' : ''}" onclick="contentManager.filterByTag('${tag}')">#${tag}</button>
            `;
        });

        container.innerHTML = html;
    }

    filterByTag(tag) {
        this.currentTag = tag;
        this.currentPage = 1;
        this.renderNews();
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderNews();
    }

    // Методы для админки
    addNews(newsItem) {
        newsItem.id = Date.now();
        this.news.unshift(newsItem);
        this.saveNews();
        this.renderNews();
        this.renderTags();
    }

    updateNews(id, updatedNews) {
        const index = this.news.findIndex(n => n.id === id);
        if (index !== -1) {
            this.news[index] = { ...this.news[index], ...updatedNews };
            this.saveNews();
            this.renderNews();
            this.renderTags();
        }
    }

    deleteNews(id) {
        this.news = this.news.filter(n => n.id !== id);
        this.saveNews();
        this.renderNews();
        this.renderTags();
    }

    getNews(id) {
        return this.news.find(n => n.id === id);
    }
}

// Инициализация
const contentManager = new ContentManager();