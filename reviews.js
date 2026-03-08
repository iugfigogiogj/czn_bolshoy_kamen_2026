// ========== ОТЗЫВЫ И ПРЕДЛОЖЕНИЯ ==========

// Загрузка опубликованных отзывов
function loadPublishedReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    // Получаем отзывы из localStorage
    const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const publishedReviews = allReviews.filter(r => r.status === 'approved');
    
    if (publishedReviews.length === 0) {
        reviewsList.innerHTML = '<h3>Опубликованные отзывы</h3><p class="no-data">Пока нет отзывов</p>';
        return;
    }
    
    let html = '<h3>Опубликованные отзывы</h3>';
    
    publishedReviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const categoryText = review.category === 'work-review' ? 'Отзыв о работе' : 'Предложение';
        
        html += `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">${escapeHtml(review.name)}</div>
                    <div class="review-rating">${stars}</div>
                    <div class="review-date">${review.date}</div>
                </div>
                <div class="review-category-badge ${review.category}">${categoryText}</div>
                <p class="review-text">${escapeHtml(review.text)}</p>
            </div>
        `;
    });
    
    reviewsList.innerHTML = html;
}

// Защита от XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показать статус (оставляем функцию, но не используем)
function showStatus(element, message, type) {
    if (element) {
        element.textContent = message;
        element.className = 'form-status ' + type;
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 2000);
    }
}

// Отправка нового отзыва (УБИРАЕМ showStatus)
async function submitReview(formData) {
    const statusDiv = document.getElementById('reviewFormStatus');
    
    try {
        // Получаем существующие отзывы
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        
        // Добавляем новый отзыв с ID и статусом
        const newReview = {
            id: Date.now() + Math.random(),
            name: formData.name,
            category: formData.category,
            rating: formData.rating,
            text: formData.text,
            date: formData.date,
            status: 'pending'
        };
        
        reviews.push(newReview);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        // УБИРАЕМ showStatus - НИКАКОГО СООБЩЕНИЯ
        // Просто сохраняем и все
        
        // Отправляем уведомление в админку
        localStorage.setItem('review_updated', Date.now().toString());
        
        return true;
        
    } catch (error) {
        console.error('Ошибка:', error);
        return false;
    }
}

// Инициализация формы отзывов
function initReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('reviewName')?.value || 'Анонимно',
            category: document.getElementById('reviewCategory')?.value,
            rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value) || 0,
            text: document.getElementById('reviewText')?.value,
            date: new Date().toLocaleDateString('ru-RU')
        };
        
        if (!formData.category) {
            alert('Выберите тип отзыва');
            return;
        }
        
        if (!formData.text.trim()) {
            alert('Напишите текст отзыва');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        const success = await submitReview(formData);
        
        if (success) {
            form.reset();
            document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
    });
}

// Слушаем изменения в localStorage (для синхронизации с админкой)
window.addEventListener('storage', function(e) {
    if (e.key === 'reviews' || e.key === 'review_updated') {
        loadPublishedReviews();
    }
});

// Загружаем отзывы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadPublishedReviews();
    initReviewForm();
});