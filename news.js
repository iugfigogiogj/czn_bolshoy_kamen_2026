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
            const [d1, m1, y1] = a.date.split('.');
            const [d2, m2, y2] = b.date.split('.');
            return new Date(y2, m2-1, d2) - new Date(y1, m1-1, d1);
        });
        
        newsGrid.innerHTML = '';
        
        for (const item of news) {
            let tags = [];
            try {
                tags = item.tags ? JSON.parse(item.tags) : [];
            } catch(e) { tags = []; }
            
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'news-tags';
            for (const tag of tags) {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'news-tag';
                tagSpan.textContent = '#' + tag;
                tagsDiv.appendChild(tagSpan);
            }
            
            const article = document.createElement('article');
            article.className = 'news-card';
            
            const imgContainer = document.createElement('div');
            imgContainer.className = 'news-image-container';
            
            const img = document.createElement('img');
            img.src = item.image || 'https://via.placeholder.com/800x400?text=Новость';
            img.alt = item.title;
            img.className = 'news-image';
            img.onerror = function() { this.src = 'https://via.placeholder.com/800x400?text=Новость'; };
            imgContainer.appendChild(img);
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'news-content';
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'news-date';
            dateDiv.textContent = item.date;
            
            const titleH3 = document.createElement('h3');
            titleH3.textContent = item.title;
            titleH3.style.cursor = 'pointer';
            titleH3.onclick = function() { openNews(item.id); };
            
            const previewP = document.createElement('p');
            let previewText = item.preview.substring(0, 150);
            if (item.preview.length > 150) previewText += '...';
            previewP.textContent = previewText;
            
            const readLink = document.createElement('a');
            readLink.href = '#';
            readLink.className = 'news-link';
            readLink.textContent = 'Читать далее →';
            readLink.onclick = function(e) {
                e.preventDefault();
                openNews(item.id);
            };
            
            contentDiv.appendChild(dateDiv);
            contentDiv.appendChild(titleH3);
            contentDiv.appendChild(previewP);
            if (tags.length > 0) contentDiv.appendChild(tagsDiv);
            contentDiv.appendChild(readLink);
            
            article.appendChild(imgContainer);
            article.appendChild(contentDiv);
            
            newsGrid.appendChild(article);
        }
        
    } catch (error) {
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) newsGrid.innerHTML = '<p class="no-data">Ошибка загрузки новостей</p>';
        console.error('Ошибка загрузки новостей:', error);
    }
}

async function openNews(newsId) {
    try {
        const news = await API.getNews();
        const item = news.find(function(n) { return n.id == newsId; });
        if (!item) return;
        
        const existingModal = document.querySelector('.news-modal');
        if (existingModal) existingModal.remove();
        
        let tags = [];
        try {
            tags = item.tags ? JSON.parse(item.tags) : [];
        } catch(e) { tags = []; }
        
        const modal = document.createElement('div');
        modal.className = 'news-modal';
        
        let modalHtml = '<div class="news-modal-content">';
        modalHtml += '<div class="news-modal-close">&times;</div>';
        modalHtml += '<div class="news-modal-image-container">';
        modalHtml += '<img src="' + (item.image || 'https://via.placeholder.com/800x400') + '" alt="' + item.title + '" class="news-modal-image" onerror="this.src=\'https://via.placeholder.com/800x400?text=Новость\'">';
        modalHtml += '</div>';
        modalHtml += '<div class="news-modal-body">';
        modalHtml += '<div class="news-modal-date">' + item.date + '</div>';
        modalHtml += '<h2 class="news-modal-title">' + item.title + '</h2>';
        
        if (tags.length > 0) {
            modalHtml += '<div class="news-modal-tags">';
            for (let i = 0; i < tags.length; i++) {
                modalHtml += '<span class="news-modal-tag">#' + tags[i] + '</span>';
            }
            modalHtml += '</div>';
        }
        
        modalHtml += '<div class="news-modal-preview">' + item.preview + '</div>';
        if (item.details) modalHtml += '<div class="news-modal-details">' + item.details.replace(/\n/g, '<br>') + '</div>';
        if (item.content) modalHtml += '<div class="news-modal-full">' + item.content + '</div>';
        modalHtml += '</div></div>';
        
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.news-modal-close');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.preventDefault();
                modal.remove();
                document.body.style.overflow = '';
            };
        }
        
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
