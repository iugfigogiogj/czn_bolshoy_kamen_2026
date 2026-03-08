// ========== ОТЗЫВЫ ==========

// Загрузка опубликованных отзывов
async function loadPublishedReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    try {
        const reviews = await API.getPublishedReviews();
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<h3>Опубликованные отзывы</h3><p class="no-data">Пока нет отзывов</p>';
            return;
        }
        
        let html = '<h3>Опубликованные отзывы</h3>';
        
        reviews.forEach(review => {
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
    } catch (error) {
        reviewsList.innerHTML = '<h3>Опубликованные отзывы</h3><p class="no-data">Ошибка загрузки отзывов</p>';
        console.error('Ошибка загрузки отзывов:', error);
    }
}

// Защита от XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Отправка нового отзыва
async function submitReview(formData) {
    const statusDiv = document.getElementById('reviewFormStatus');
    
    try {
        const result = await API.createReview(formData);
        
        if (result.success) {
            showStatus(statusDiv, '✅ Спасибо! Отзыв отправлен на модерацию.', 'success');
            return true;
        } else {
            throw new Error('Ошибка отправки');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showStatus(statusDiv, '❌ Ошибка при отправке', 'error');
        return false;
    }
}

function showStatus(element, message, type) {
    if (element) {
        element.textContent = message;
        element.className = 'form-status ' + type;
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
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

// Загружаем отзывы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadPublishedReviews();
    initReviewForm();
});
