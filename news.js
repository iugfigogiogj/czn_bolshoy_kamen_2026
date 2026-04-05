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
        
        news.sort(function(a, b) {
            var da = a.date.split('.');
            var db = b.date.split('.');
            return new Date(db[2], db[1]-1, db[0]) - new Date(da[2], da[1]-1, da[0]);
        });
        
        var html = '';
        for (var i = 0; i < news.length; i++) {
            var item = news[i];
            var tags = [];
            if (item.tags) {
                try {
                    tags = JSON.parse(item.tags);
                } catch(e) {
                    tags = [];
                }
            }
            
            var tagsHtml = '';
            if (tags.length > 0) {
                tagsHtml = '<div class="news-tags">';
                for (var t = 0; t < tags.length; t++) {
                    tagsHtml += '<span class="news-tag">#' + tags[t] + '</span>';
                }
                tagsHtml += '</div>';
            }
            
            var previewText = item.preview || '';
            if (previewText.length > 150) {
                previewText = previewText.substring(0, 150) + '...';
            }
            
            html += '<article class="news-card" onclick="openNews(' + item.id + ')">';
            html += '<div class="news-image-container">';
            html += '<img src="' + (item.image || 'https://via.placeholder.com/800x400?text=Новость') + '" alt="' + item.title + '" class="news-image" onerror="this.src=\'https://via.placeholder.com/800x400?text=Новость\'">';
            html += '</div>';
            html += '<div class="news-content">';
            html += '<div class="news-date">' + item.date + '</div>';
            html += '<h3>' + item.title + '</h3>';
            html += '<p>' + previewText + '</p>';
            html += tagsHtml;
            html += '<a href="#" class="news-link" onclick="event.preventDefault(); openNews(' + item.id + ')">Читать далее →</a>';
            html += '</div>';
            html += '</article>';
        }
        
        newsGrid.innerHTML = html;
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        newsGrid.innerHTML = '<p class="no-data">Ошибка загрузки новостей</p>';
    }
}

async function openNews(newsId) {
    try {
        const news = await API.getNews();
        var item = null;
        for (var i = 0; i < news.length; i++) {
            if (news[i].id == newsId) {
                item = news[i];
                break;
            }
        }
        if (!item) return;
        
        var oldModal = document.querySelector('.news-modal');
        if (oldModal) oldModal.remove();
        
        var tags = [];
        if (item.tags) {
            try {
                tags = JSON.parse(item.tags);
            } catch(e) {
                tags = [];
            }
        }
        
        var tagsHtml = '';
        if (tags.length > 0) {
            tagsHtml = '<div class="news-modal-tags">';
            for (var t = 0; t < tags.length; t++) {
                tagsHtml += '<span class="news-modal-tag">#' + tags[t] + '</span>';
            }
            tagsHtml += '</div>';
        }
        
        var detailsHtml = item.details ? '<div class="news-modal-details">' + item.details.replace(/\n/g, '<br>') + '</div>' : '';
        var contentHtml = item.content ? '<div class="news-modal-full">' + item.content + '</div>' : '';
        
        var modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.innerHTML = '<div class="news-modal-content">' +
            '<div class="news-modal-close">&times;</div>' +
            '<div class="news-modal-image-container">' +
            '<img src="' + (item.image || 'https://via.placeholder.com/800x400') + '" alt="' + item.title + '" class="news-modal-image" onerror="this.src=\'https://via.placeholder.com/800x400?text=Новость\'">' +
            '</div>' +
            '<div class="news-modal-body">' +
            '<div class="news-modal-date">' + item.date + '</div>' +
            '<h2 class="news-modal-title">' + item.title + '</h2>' +
            tagsHtml +
            '<div class="news-modal-preview">' + (item.preview || '') + '</div>' +
            detailsHtml +
            contentHtml +
            '</div>' +
            '</div>';
        
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
