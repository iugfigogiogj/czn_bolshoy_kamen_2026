// ========== НОВОСТИ ==========

async function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    
    try {
        const news = await API.getNews();
        
        if (news.length === 0) {
            newsGrid.innerHTML = '<p class="no-data">Новостей пока нет</p>';
            return;
        }
        
        news.sort((a, b) => {
            const [d1, m1, y1] = a.date.split('.').map(Number);
            const [d2, m2, y2] = b.date.split('.').map(Number);
            return new Date(y2, m2-1, d2) - new Date(y1, m1-1, d1);
        });
        
        let html = '';
        news.forEach(item => {
            const tags = item.tags ? JSON.parse(item.tags) : [];
            const tagsHtml = tags.length > 0 
                ? `<div class="news-tags">${tags.map(t => `<span class="news-tag">#${t}</span>`).join('')}</div>`
                : '';
            
html += `
    <article class="news-card">
        <div class="news-image-container">
            <img src="${item.image || 'https://via.placeholder.com/800x400?text=Новость'}" 
                 alt="${item.title}" 
                 class="news-image"
                 onerror="this.src='https://via.placeholder.com/800x400?text=Новость'">
        </div>
        <div class="news-content">
            <div class="news-date">${item.date}</div>
            <h3 onclick="openNews(${item.id})" style="cursor: pointer;">${item.title}</h3>
            <p>${item.preview.substring(0, 150)}${item.preview.length > 150 ? '...' : ''}</p>
            ${tagsHtml}
            <a href="#" class="news-link" onclick="event.preventDefault(); openNews(${item.id})">Читать далее →</a>
        </div>
    </article>
`;
        
        newsGrid.innerHTML = html;
    } catch (error) {
        newsGrid.innerHTML = '<p class="no-data">Ошибка загрузки новостей</p>';
        console.error('Ошибка загрузки новостей:', error);
    }
}

async function openNews(newsId) {
    try {
        const news = await API.getNews();
        const item = news.find(n => n.id == newsId);
        if (!item) return;
        
        const existingModal = document.querySelector('.news-modal');
        if (existingModal) existingModal.remove();
        
        const tags = item.tags ? JSON.parse(item.tags) : [];
        const tagsHtml = tags.length > 0 
            ? `<div class="news-modal-tags">${tags.map(t => `<span class="news-modal-tag">#${t}</span>`).join('')}</div>`
            : '';
        
        const detailsHtml = item.details ? `<div class="news-modal-details">${item.details.replace(/\n/g, '<br>')}</div>` : '';
        const contentHtml = item.content ? `<div class="news-modal-full">${item.content}</div>` : '';
        
        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.innerHTML = `
            <div class="news-modal-content">
                <div class="news-modal-close">&times;</div>
                <div class="news-modal-image-container">
                    <img src="${item.image || 'https://via.placeholder.com/800x400'}" 
                         alt="${item.title}"
                         class="news-modal-image"
                         onerror="this.src='https://via.placeholder.com/800x400?text=Новость'">
                </div>
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
        
        modal.querySelector('.news-modal-close').onclick = function(e) {
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
        
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Ошибка открытия новости:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadNews);
