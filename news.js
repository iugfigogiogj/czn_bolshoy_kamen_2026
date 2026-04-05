async function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    
    try {
        const news = await API.getNews();
        
        if (news.length === 0) {
            newsGrid.innerHTML = '<p>Новостей пока нет</p>';
            return;
        }
        
        news.sort(function(a, b) {
            return new Date(b.date.split('.').reverse().join('-')) - new Date(a.date.split('.').reverse().join('-'));
        });
        
        newsGrid.innerHTML = '';
        
        for (let i = 0; i < news.length; i++) {
            const item = news[i];
            
            const article = document.createElement('article');
            article.className = 'news-card';
            
            const img = document.createElement('img');
            img.src = item.image || 'https://via.placeholder.com/800x400';
            img.style.width = '100%';
            img.style.height = '200px';
            img.style.objectFit = 'cover';
            
            const title = document.createElement('h3');
            title.textContent = item.title;
            title.style.cursor = 'pointer';
            title.onclick = function() { openNews(item.id); };
            
            const date = document.createElement('div');
            date.textContent = item.date;
            date.style.color = '#666';
            date.style.fontSize = '14px';
            
            const preview = document.createElement('p');
            preview.textContent = item.preview.substring(0, 150);
            
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = 'Читать далее →';
            link.onclick = function(e) {
                e.preventDefault();
                openNews(item.id);
            };
            
            article.appendChild(img);
            article.appendChild(date);
            article.appendChild(title);
            article.appendChild(preview);
            article.appendChild(link);
            
            newsGrid.appendChild(article);
        }
        
    } catch (error) {
        newsGrid.innerHTML = '<p>Ошибка загрузки новостей</p>';
    }
}

async function openNews(newsId) {
    try {
        const news = await API.getNews();
        let item = null;
        for (let i = 0; i < news.length; i++) {
            if (news[i].id == newsId) {
                item = news[i];
                break;
            }
        }
        if (!item) return;
        
        const oldModal = document.querySelector('.news-modal');
        if (oldModal) oldModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        const content = document.createElement('div');
        content.style.backgroundColor = 'white';
        content.style.maxWidth = '700px';
        content.style.width = '90%';
        content.style.maxHeight = '85vh';
        content.style.overflow = 'auto';
        content.style.borderRadius = '12px';
        content.style.padding = '20px';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.float = 'right';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function() { modal.remove(); };
        
        const img = document.createElement('img');
        img.src = item.image || 'https://via.placeholder.com/800x400';
        img.style.width = '100%';
        img.style.borderRadius = '8px';
        
        const title = document.createElement('h2');
        title.textContent = item.title;
        
        const date = document.createElement('div');
        date.textContent = item.date;
        date.style.color = '#666';
        
        const preview = document.createElement('p');
        preview.textContent = item.preview;
        
        content.appendChild(closeBtn);
        content.appendChild(img);
        content.appendChild(title);
        content.appendChild(date);
        content.appendChild(preview);
        
        if (item.details) {
            const details = document.createElement('div');
            details.innerHTML = item.details;
            content.appendChild(details);
        }
        
        if (item.content) {
            const fullText = document.createElement('div');
            fullText.innerHTML = item.content;
            content.appendChild(fullText);
        }
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        modal.onclick = function(e) {
            if (e.target === modal) modal.remove();
        };
        
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadNews);
