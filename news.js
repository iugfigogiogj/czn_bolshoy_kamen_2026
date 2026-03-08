// ========== НОВОСТИ С ФОТО ==========

// Загружаем и показываем новости
function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    
    const news = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NEWS) || '[]');
    
    if (news.length === 0) {
        newsGrid.innerHTML = '<p class="no-data">Новостей пока нет</p>';
        return;
    }
    
    // Сортируем по дате (свежие сверху)
    news.sort((a, b) => {
        const [d1, m1, y1] = a.date.split('.').map(Number);
        const [d2, m2, y2] = b.date.split('.').map(Number);
        return new Date(y2, m2-1, d2) - new Date(y1, m1-1, d1);
    });
    
    let html = '';
    news.forEach(item => {
        const tagsHtml = item.tags && item.tags.length > 0 
            ? `<div class="news-tags">${item.tags.map(t => `<span class="news-tag">#${t}</span>`).join('')}</div>`
            : '';
        
        html += `
            <article class="news-card" onclick="openNews(${item.id})">
                <div class="news-image-container">
                    <img src="${item.image || 'https://via.placeholder.com/800x400?text=Новость'}" 
                         alt="${item.title}" 
                         class="news-image"
                         onerror="this.src='https://via.placeholder.com/800x400?text=Новость'">
                </div>
                <div class="news-content">
                    <div class="news-date">${item.date}</div>
                    <h3>${item.title}</h3>
                    <p>${item.preview.substring(0, 150)}${item.preview.length > 150 ? '...' : ''}</p>
                    ${tagsHtml}
                    <a href="#" class="news-link" onclick="event.preventDefault(); openNews(${item.id})">Читать далее →</a>
                </div>
            </article>
        `;
    });
    
    newsGrid.innerHTML = html;
}

// ========== МОДАЛЬНОЕ ОКНО ==========
function openNews(newsId) {
    const news = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NEWS) || '[]');
    const item = news.find(n => n.id == newsId);
    if (!item) return;
    
    // Удаляем предыдущее модальное окно если есть
    const existingModal = document.querySelector('.news-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    
    // Теги
    const tagsHtml = item.tags && item.tags.length > 0 
        ? `<div class="news-modal-tags">${item.tags.map(t => `<span class="news-modal-tag">#${t}</span>`).join('')}</div>`
        : '';
    
    // Подробности
    const detailsHtml = item.details 
        ? `<div class="news-modal-details">${item.details.replace(/\n/g, '<br>')}</div>`
        : '';
    
    // Полный текст
    const contentHtml = item.content 
        ? `<div class="news-modal-full">${item.content}</div>`
        : '';
    
    modal.innerHTML = `
        <div class="news-modal-content">
            <!-- Крестик -->
            <div class="news-modal-close">&times;</div>
            
            <!-- Фото -->
            <div class="news-modal-image-container">
                <img src="${item.image || 'https://via.placeholder.com/800x400'}" 
                     alt="${item.title}"
                     class="news-modal-image"
                     onerror="this.src='https://via.placeholder.com/800x400?text=Новость'">
            </div>
            
            <!-- Контент -->
            <div class="news-modal-body">
                <div class="news-modal-date">${item.date}</div>
                <h2 class="news-modal-title">${item.title}</h2>
                ${tagsHtml}
                <div class="news-modal-preview">${item.preview}</div>
                ${detailsHtml}
                ${contentHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие
    const closeBtn = modal.querySelector('.news-modal-close');
    closeBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        modal.remove();
        document.body.style.overflow = '';
    };
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
    
    const escHandler = function(e) {
        if (e.key === 'Escape' && document.body.contains(modal)) {
            modal.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    document.body.style.overflow = 'hidden';
}

// ========== СТИЛИ ==========
const styles = document.createElement('style');
styles.textContent = `
    /* Карточки новостей на главной - ИСПРАВЛЕНО */
    .news-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.3s, box-shadow 0.3s;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .news-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }
    
    /* Контейнер фото - ВСЕГДА ОДИНАКОВЫЙ */
    .news-image-container {
        width: 100%;
        height: 220px;
        overflow: hidden;
        background: #f5f5f5;
    }
    
    /* Фото заполняет контейнер */
    .news-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
        display: block;
    }
    
    .news-card:hover .news-image {
        transform: scale(1.05);
    }
    
    /* Контент карточки */
    .news-content {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .news-date {
        color: #0066CC;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    .news-content h3 {
        color: #004999;
        font-size: 20px;
        margin-bottom: 10px;
        line-height: 1.3;
    }
    
    .news-content p {
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 15px;
        flex: 1;
    }
    
    .news-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 15px;
    }
    
    .news-tag {
        background: #E6F2FF;
        color: #004999;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
    }
    
    .news-link {
        color: #0066CC;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        display: inline-block;
        margin-top: auto;
    }
    
    .news-link:hover {
        color: #DC3545;
    }
    
    /* Модальное окно */
    .news-modal {
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
    }
    
    .news-modal-content {
        max-width: 650px;
        width: 100%;
        max-height: 85vh;
        overflow-y: auto;
        background: white;
        border-radius: 16px;
        position: relative;
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        animation: modalShow 0.2s ease;
    }
    
    @keyframes modalShow {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    
/* Крестик - ИСПРАВЛЕННЫЙ */
.news-modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 28px;  /* Уменьшил размер */
    font-weight: 300;
    display: flex;
    align-items: center;     /* Выравнивание по вертикали */
    justify-content: center; /* Выравнивание по горизонтали */
    border-radius: 50%;
    cursor: pointer;
    backdrop-filter: blur(2px);
    transition: all 0.2s;
    z-index: 10;
    line-height: 1;          /* Убираем лишнюю высоту строки */
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.news-modal-close:hover {
    background: rgba(220, 53, 69, 0.9);
    transform: scale(1.05);
}
    
    /* Фото в модалке */
    .news-modal-image-container {
        width: 100%;
        height: 280px;
        overflow: hidden;
        background: #f5f5f5;
    }
    
    .news-modal-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    
    /* Контент модалки */
    .news-modal-body {
        padding: 30px;
    }
    
    .news-modal-date {
        color: #0066CC;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .news-modal-title {
        color: #004999;
        font-size: 26px;
        margin-bottom: 15px;
        line-height: 1.3;
    }
    
    .news-modal-tags {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 20px;
    }
    
    .news-modal-tag {
        background: #E6F2FF;
        color: #004999;
        padding: 6px 14px;
        border-radius: 30px;
        font-size: 14px;
    }
    
    .news-modal-preview {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
        border-left: 4px solid #0066CC;
    }
    
    .news-modal-details {
        background: #fff3cd;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        font-size: 15px;
        line-height: 1.6;
        color: #856404;
    }
    
    .news-modal-full {
        font-size: 16px;
        line-height: 1.7;
        color: #333;
    }
    
    .news-modal-full h1,
    .news-modal-full h2,
    .news-modal-full h3 {
        color: #004999;
        margin: 25px 0 15px;
    }
    
    .news-modal-full h1 { font-size: 24px; }
    .news-modal-full h2 { font-size: 22px; }
    .news-modal-full h3 { font-size: 20px; }
    
    .news-modal-full p {
        margin-bottom: 15px;
    }
    
    .news-modal-full ul,
    .news-modal-full ol {
        margin: 15px 0;
        padding-left: 25px;
    }
    
    .news-modal-full li {
        margin-bottom: 8px;
    }
    
    /* Пустые состояния */
    .no-data {
        text-align: center;
        padding: 50px;
        color: #999;
        font-style: italic;
    }
    
    /* Адаптивность */
    @media (max-width: 600px) {
        .news-modal {
            padding: 15px;
        }
        
        .news-modal-content {
            max-width: 100%;
            max-height: 90vh;
        }
        
        .news-modal-image-container {
            height: 220px;
        }
        
        .news-modal-body {
            padding: 20px;
        }
        
        .news-modal-title {
            font-size: 22px;
        }
        
        .news-modal-close {
            top: 10px;
            right: 10px;
            width: 35px;
            height: 35px;
            font-size: 28px;
        }
        
        .news-image-container {
            height: 180px;
        }
        
        .news-content {
            padding: 15px;
        }
        
        .news-content h3 {
            font-size: 18px;
        }
    }
`;

document.head.appendChild(styles);

// Загружаем новости
document.addEventListener('DOMContentLoaded', loadNews);

// Слушаем изменения
window.addEventListener('storage', function(e) {
    if (e.key === CONFIG.STORAGE_KEYS.NEWS) {
        loadNews();
    }
});