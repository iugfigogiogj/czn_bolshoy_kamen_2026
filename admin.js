// ========== АДМИН-ПАНЕЛЬ (ТОЛЬКО СЕРВЕР) ==========

let currentNewsId = null;
let currentVacancyId = null;
let newsTags = [];
let newsImageData = null;
let vacancyDetails = ['', '', ''];
let selectedBadge = '';
let deleteId = null;
let deleteType = null;

// Для отзывов
let allReviews = [];
let currentFilter = 'pending';

// ========== АВТОРИЗАЦИЯ ==========
function login() {
    const pass = document.getElementById('password').value;
    if (pass === CONFIG.ADMIN_PASSWORD) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH, 'true');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadNewsList();
        loadVacanciesList();
        loadReviews();
        renderVacancyDetails();
        document.getElementById('loginError').style.display = 'none';
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH);
    location.reload();
}

// ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ==========
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tab === 'news') {
        document.querySelector('.tab-btn.news-tab').classList.add('active');
        document.getElementById('tab-news').classList.add('active');
        loadNewsList();
    } else if (tab === 'vacancies') {
        document.querySelector('.tab-btn.vacancies-tab').classList.add('active');
        document.getElementById('tab-vacancies').classList.add('active');
        loadVacanciesList();
        renderVacancyDetails();
    } else if (tab === 'reviews') {
        document.querySelector('.tab-btn.reviews-tab').classList.add('active');
        document.getElementById('tab-reviews').classList.add('active');
        loadReviews();
    }
}

// ========== НОВОСТИ ==========
async function loadNewsList() {
    const list = document.getElementById('newsList');
    if (!list) return;

    try {
        const news = await API.getNews();

        if (news.length === 0) {
            list.innerHTML = '<p class="no-data">Новостей пока нет</p>';
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

            html += `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${item.title}</h3>
                        <div class="item-meta">
                            <span>📅 ${item.date}</span>
                            ${tags.length ? `<span>🏷️ ${tags.length} тегов</span>` : ''}
                            ${item.image ? '<span>📷 с фото</span>' : ''}
                        </div>
                        <p>${item.preview.substring(0, 100)}...</p>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editNews(${item.id})">✏️ Изменить</button>
                        <button class="delete-btn" onclick="confirmDelete('news', ${item.id})">🗑️ Удалить</button>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    } catch (error) {
        list.innerHTML = '<p class="no-data">Ошибка загрузки новостей</p>';
        console.error(error);
    }
}

async function editNews(id) {
    try {
        const news = await API.getNews();
        const item = news.find(n => n.id == id);
        if (!item) return;

        currentNewsId = id;
        newsTags = item.tags ? JSON.parse(item.tags) : [];
        newsImageData = item.image || null;

        document.getElementById('newsFormTitle').innerHTML = '✏️ Редактировать новость';
        document.getElementById('newsSubmitBtn').textContent = 'Обновить';
        document.getElementById('newsTitle').value = item.title;
        document.getElementById('newsDate').value = item.date;
        document.getElementById('newsPreview').value = item.preview;
        document.getElementById('newsDetails').value = item.details || '';
        document.getElementById('newsContent').value = item.content || '';

        if (item.image) {
            document.getElementById('newsImagePreview').src = item.image;
            document.getElementById('newsImagePreviewContainer').classList.add('show');
            document.getElementById('newsImageSize').textContent = item.image.startsWith('data:') ? 'Загруженное фото' : 'URL фото';
        }

        renderNewsTags();
        switchTab('news');
    } catch (error) {
        console.error('Ошибка загрузки новости:', error);
    }
}

function resetNewsForm() {
    currentNewsId = null;
    newsTags = [];
    newsImageData = null;
    document.getElementById('newsFormTitle').innerHTML = '➕ Добавить новость';
    document.getElementById('newsSubmitBtn').textContent = 'Опубликовать';
    document.getElementById('newsForm').reset();
    document.getElementById('newsImagePreviewContainer').classList.remove('show');
    document.getElementById('newsFileInput').value = '';
    renderNewsTags();
}

// ========== ВАКАНСИИ ==========
async function loadVacanciesList() {
    const list = document.getElementById('vacanciesList');
    if (!list) return;

    try {
        const vacancies = await API.getVacancies();

        if (vacancies.length === 0) {
            list.innerHTML = '<p class="no-data">Вакансий пока нет</p>';
            return;
        }

        let html = '';
        vacancies.forEach(item => {
            const details = item.details ? JSON.parse(item.details) : [];
            let badgeClass = '';
            let badgeText = '';
            
            switch(item.badge) {
                case 'hot':
                    badgeClass = 'badge-hot';
                    badgeText = '🔥 Срочно';
                    break;
                case 'attractive':
                    badgeClass = 'badge-attractive';
                    badgeText = '💰 Высокая ЗП';
                    break;
                case 'flexible':
                    badgeClass = 'badge-flexible';
                    badgeText = '⏰ Гибкий график';
                    break;
                case 'housing':
                    badgeClass = 'badge-housing';
                    badgeText = '🏠 Жилье';
                    break;
                case 'parttime':
                    badgeClass = 'badge-parttime';
                    badgeText = '⚡ Подработка';
                    break;
            }

            html += `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${item.title}</h3>
                        <div class="item-meta">
                            <span>🏢 ${item.company}</span>
                            <span>💰 ${item.salary}</span>
                            ${badgeText ? `<span class="${badgeClass}" style="display:inline-block; padding:2px 8px; border-radius:12px; font-size:11px;">${badgeText}</span>` : ''}
                            ${item.apply_link ? '<span>🔗 есть ссылка</span>' : ''}
                        </div>
                        <p>${details.length} условий</p>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editVacancy(${item.id})">✏️ Изменить</button>
                        <button class="delete-btn" onclick="confirmDelete('vacancy', ${item.id})">🗑️ Удалить</button>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    } catch (error) {
        list.innerHTML = '<p class="no-data">Ошибка загрузки вакансий</p>';
        console.error(error);
    }
}

async function editVacancy(id) {
    try {
        const vacancies = await API.getVacancies();
        const item = vacancies.find(v => v.id == id);
        if (!item) return;

        currentVacancyId = id;
        vacancyDetails = item.details ? JSON.parse(item.details) : [''];
        selectedBadge = item.badge || '';

        document.getElementById('vacancyFormTitle').innerHTML = '✏️ Редактировать вакансию';
        document.getElementById('vacancySubmitBtn').textContent = 'Обновить';
        document.getElementById('vacancyTitle').value = item.title;
        document.getElementById('vacancyCompany').value = item.company;
        document.getElementById('vacancySalary').value = item.salary;
        document.getElementById('vacancyLink').value = item.apply_link || '';

        document.querySelectorAll('.badge-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.value === item.badge) {
                opt.classList.add('selected');
            }
        });

        renderVacancyDetails();
        switchTab('vacancies');
    } catch (error) {
        console.error('Ошибка загрузки вакансии:', error);
    }
}

function resetVacancyForm() {
    currentVacancyId = null;
    vacancyDetails = ['', '', ''];
    selectedBadge = '';

    document.getElementById('vacancyFormTitle').innerHTML = '➕ Добавить вакансию';
    document.getElementById('vacancySubmitBtn').textContent = 'Опубликовать';
    document.getElementById('vacancyForm').reset();
    document.getElementById('vacancyLink').value = '';

    document.querySelectorAll('.badge-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.value === '') {
            opt.classList.add('selected');
        }
    });

    renderVacancyDetails();
}

// ========== ОТЗЫВЫ ==========
async function loadReviews() {
    try {
        const [pending, approved] = await Promise.all([
            API.getPendingReviews(),
            API.getPublishedReviews()
        ]);
        allReviews = [...pending, ...approved];
        updateReviewStats();
        renderReviews();
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

function updateReviewStats() {
    const pendingEl = document.getElementById('pendingCount');
    const approvedEl = document.getElementById('approvedCount');
    const pendingCount = allReviews.filter(r => r.status === 'pending').length;
    const approvedCount = allReviews.filter(r => r.status === 'approved').length;

    if (pendingEl) pendingEl.textContent = pendingCount;
    if (approvedEl) approvedEl.textContent = approvedCount;
}

function filterReviews(filter) {
    currentFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

    if (filter === 'pending') {
        document.querySelectorAll('.filter-btn')[0]?.classList.add('active');
    } else if (filter === 'approved') {
        document.querySelectorAll('.filter-btn')[1]?.classList.add('active');
    }

    renderReviews();
}

function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    let filteredReviews = [];
    if (currentFilter === 'pending') {
        filteredReviews = allReviews.filter(r => r.status === 'pending');
    } else if (currentFilter === 'approved') {
        filteredReviews = allReviews.filter(r => r.status === 'approved');
    } else {
        filteredReviews = allReviews;
    }

    if (filteredReviews.length === 0) {
        grid.innerHTML = '<div class="no-data">📭 Нет отзывов в этой категории</div>';
        return;
    }

    let html = '';
    filteredReviews.forEach((review) => {
        const reviewId = review.id;
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const categoryText = review.category === 'work-review' ? 'Отзыв о работе' : 'Предложение';
        const categoryClass = review.category === 'work-review' ? 'work-review' : 'suggestion';
        const statusClass = review.status === 'pending' ? 'pending' : 'approved';

        html += `
            <div class="review-card ${statusClass}" data-id="${reviewId}">
                <div class="review-header">
                    <span class="review-author">${escapeHtml(review.name)}</span>
                    <span class="review-rating">${stars}</span>
                </div>
                <span class="review-category ${categoryClass}">${categoryText}</span>
                <div class="review-date">📅 ${review.date || 'Дата не указана'}</div>
                <div class="review-text">${escapeHtml(review.text)}</div>
                <div class="review-actions">
                    <button class="review-view" onclick="viewReview(${reviewId})">👁️ Просмотр</button>
                    ${review.status === 'pending' ?
                        `<button class="review-approve" onclick="approveReview(${reviewId})">✅ Опубликовать</button>
                         <button class="review-reject" onclick="rejectReview(${reviewId})">❌ Отклонить</button>` :
                        `<button class="review-reject" onclick="deleteReview(${reviewId})">🗑️ Удалить</button>`
                    }
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

async function approveReview(id) {
    try {
        await API.approveReview(id);
        loadReviews();
        localStorage.setItem('content_updated', Date.now().toString()); // Сигнал на главную
    } catch (error) {
        alert('Ошибка при одобрении отзыва');
        console.error(error);
    }
}

async function rejectReview(id) {
    if (!confirm('Вы уверены, что хотите отклонить этот отзыв?')) return;

    try {
        await API.rejectReview(id);
        loadReviews();
        localStorage.setItem('content_updated', Date.now().toString()); // Сигнал на главную
    } catch (error) {
        alert('Ошибка при отклонении отзыва');
        console.error(error);
    }
}

async function deleteReview(id) {
    if (!confirm('Удалить этот отзыв?')) return;

    try {
        await API.deleteReview(id);
        loadReviews();
        localStorage.setItem('content_updated', Date.now().toString()); // Сигнал на главную
    } catch (error) {
        alert('Ошибка при удалении отзыва: ' + error.message);
        console.error(error);
    }
}

async function viewReview(id) {
    const review = allReviews.find(r => r.id == id);
    if (!review) {
        alert('Отзыв не найден');
        return;
    }

    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const categoryText = review.category === 'work-review' ? 'Отзыв о работе' : 'Предложение';

    const modal = document.createElement('div');
    modal.className = 'review-modal';
    modal.innerHTML = `
        <div class="review-modal-content">
            <span class="review-modal-close" onclick="this.closest('.review-modal').remove()">&times;</span>
            <h3 style="color: #003A70; margin-bottom: 20px;">Просмотр отзыва</h3>

            <div style="margin-bottom: 15px;">
                <strong style="color: #666;">Автор:</strong>
                <p style="margin: 5px 0; font-size: 18px; font-weight: 600;">${escapeHtml(review.name)}</p>
            </div>

            <div style="margin-bottom: 15px;">
                <strong style="color: #666;">Оценка:</strong>
                <p style="margin: 5px 0; color: #FFD700; font-size: 20px;">${stars}</p>
            </div>

            <div style="margin-bottom: 15px;">
                <strong style="color: #666;">Категория:</strong>
                <p style="margin: 5px 0;"><span class="review-category ${review.category}" style="display: inline-block;">${categoryText}</span></p>
            </div>

            <div style="margin-bottom: 15px;">
                <strong style="color: #666;">Дата:</strong>
                <p style="margin: 5px 0;">${review.date || 'Дата не указана'}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <strong style="color: #666;">Текст:</strong>
                <p style="margin: 10px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; line-height: 1.6;">${escapeHtml(review.text)}</p>
            </div>

            <div style="display: flex; gap: 10px;">
                <button style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="this.closest('.review-modal').remove()">Закрыть</button>
                ${review.status === 'pending' ?
                    `<button style="flex: 1; padding: 10px; background: #00A650; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="approveReview(${review.id}); this.closest('.review-modal').remove()">Опубликовать</button>
                     <button style="flex: 1; padding: 10px; background: #E31B23; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="rejectReview(${review.id}); this.closest('.review-modal').remove()">Отклонить</button>`
                    : ''
                }
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function renderNewsTags() {
    const container = document.getElementById('newsTagsContainer');
    if (newsTags.length === 0) {
        container.innerHTML = '<div style="color:#999;">Теги не добавлены</div>';
        return;
    }

    let html = '';
    newsTags.forEach((tag, index) => {
        html += `
            <div class="tag">
                #${tag}
                <span class="tag-remove" onclick="removeNewsTag(${index})">×</span>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addNewsTag() {
    const input = document.getElementById('newsTagInput');
    const tag = input.value.trim().toLowerCase().replace(/#/g, '');

    if (tag && !newsTags.includes(tag)) {
        newsTags.push(tag);
        renderNewsTags();
        input.value = '';
    }
}

function removeNewsTag(index) {
    newsTags.splice(index, 1);
    renderNewsTags();
}

function renderVacancyDetails() {
    const container = document.getElementById('detailsList');
    if (!container) return;

    let html = '';
    vacancyDetails.forEach((detail, index) => {
        html += `
            <div class="detail-item">
                <input type="text" value="${detail}" placeholder="Например: График: 2/2" oninput="updateVacancyDetail(${index}, this.value)">
                <button class="remove-detail" onclick="removeVacancyDetail(${index})" ${vacancyDetails.length <= 1 ? 'style="display:none;"' : ''}>×</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function addVacancyDetail() {
    vacancyDetails.push('');
    renderVacancyDetails();
}

function removeVacancyDetail(index) {
    if (vacancyDetails.length > 1) {
        vacancyDetails.splice(index, 1);
        renderVacancyDetails();
    }
}

function updateVacancyDetail(index, value) {
    vacancyDetails[index] = value;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ЗАГРУЗКА ФОТО ==========
function handleNewsFileSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        if (file.size > 10 * 1024 * 1024) {
            alert('Файл слишком большой. Максимальный размер 10 МБ');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            newsImageData = e.target.result;

            const preview = document.getElementById('newsImagePreview');
            preview.src = e.target.result;

            const size = (file.size / 1024).toFixed(1);
            document.getElementById('newsImageSize').textContent = size + ' KB';

            document.getElementById('newsImagePreviewContainer').classList.add('show');
            document.getElementById('newsImage').value = '';
        };
        reader.readAsDataURL(file);
    }
}

function previewNewsImageUrl(url) {
    if (url) {
        newsImageData = url;
        document.getElementById('newsImagePreview').src = url;
        document.getElementById('newsImagePreviewContainer').classList.add('show');
        document.getElementById('newsImageSize').textContent = 'URL фото';
    }
}

function resetNewsImage() {
    document.getElementById('newsFileInput').value = '';
    document.getElementById('newsImagePreviewContainer').classList.remove('show');
    document.getElementById('newsImage').value = '';
    newsImageData = null;
}

// ========== ГЛАВНЫЙ ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin.js загружен и запущен');
    
    // Проверка авторизации
    if (localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH) === 'true') {
        console.log('Пользователь авторизован');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadNewsList();
        loadVacanciesList();
        loadReviews();
        renderVacancyDetails();
    } else {
        console.log('Пользователь не авторизован');
    }
    
    // Навешиваем обработчики на формы
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        console.log('✅ Найден newsForm, навешиваю обработчик');
        newsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Форма новости отправлена!');
            
            const newsData = {
                title: document.getElementById('newsTitle').value,
                date: document.getElementById('newsDate').value,
                image: newsImageData || document.getElementById('newsImage').value || '',
                preview: document.getElementById('newsPreview').value,
                details: document.getElementById('newsDetails').value || '',
                content: document.getElementById('newsContent').value || '',
                tags: newsTags
            };

            console.log('Отправляю данные:', newsData);

            try {
                let result;
                if (currentNewsId) {
                    result = await API.updateNews(currentNewsId, newsData);
                    console.log('Новость обновлена:', result);
                    alert('Новость обновлена!');
                } else {
                    result = await API.createNews(newsData);
                    console.log('Новость создана:', result);
                    alert('Новость опубликована!');
                }
                resetNewsForm();
                await loadNewsList();
                localStorage.setItem('content_updated', Date.now().toString()); // Сигнал на главную
                switchTab('news');
            } catch (error) {
                console.error('❌ Полная ошибка:', error);
                alert('Ошибка сохранения новости: ' + error.message);
            }
        });
    } else {
        console.error('❌ newsForm не найден!');
    }

    const vacancyForm = document.getElementById('vacancyForm');
    if (vacancyForm) {
        console.log('✅ Найден vacancyForm, навешиваю обработчик');
        vacancyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Форма вакансии отправлена!');
            
            const details = vacancyDetails.filter(d => d.trim() !== '');
            
            const vacancyData = {
                title: document.getElementById('vacancyTitle').value,
                company: document.getElementById('vacancyCompany').value,
                salary: document.getElementById('vacancySalary').value,
                badge: selectedBadge || '',
                details: details,
                apply_link: document.getElementById('vacancyLink').value || ''
            };

            console.log('Отправляю данные:', vacancyData);

            try {
                if (currentVacancyId) {
                    await API.updateVacancy(currentVacancyId, vacancyData);
                    alert('Вакансия обновлена!');
                } else {
                    await API.createVacancy(vacancyData);
                    alert('Вакансия опубликована!');
                }
                resetVacancyForm();
                await loadVacanciesList();
                localStorage.setItem('content_updated', Date.now().toString()); // Сигнал на главную
                switchTab('vacancies');
            } catch (error) {
                console.error('❌ Ошибка:', error);
                alert('Ошибка сохранения вакансии: ' + error.message);
            }
        });
    } else {
        console.error('❌ vacancyForm не найден!');
    }
    
    // Обработчики удаления
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const confirmModal = document.getElementById('confirmModal');

    if (confirmYes) {
        console.log('✅ Найден confirmYes');
        confirmYes.onclick = deleteItem;
    }
    if (confirmNo) {
        console.log('✅ Найден confirmNo');
        confirmNo.onclick = closeModal;
    }

    window.onclick = function(e) {
        if (e.target === confirmModal) {
            closeModal();
        }
    };
});

// ========== УДАЛЕНИЕ ==========
function confirmDelete(type, id) {
    deleteType = type;
    deleteId = id;
    document.getElementById('confirmModal').style.display = 'flex';
}

async function deleteItem() {
    if (!deleteId || !deleteType) return;

    try {
        if (deleteType === 'news') {
            await API.deleteNews(deleteId);
            loadNewsList();
        } else if (deleteType === 'vacancy') {
            await API.deleteVacancy(deleteId);
            loadVacanciesList();
        }
        localStorage.setItem('content_updated', Date.now().toString()); // Сигнал на главную
        closeModal();
    } catch (error) {
        alert('Ошибка удаления: ' + error.message);
        console.error(error);
    }
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
    deleteId = null;
    deleteType = null;
}
// Слушаем изменения в localStorage (для синхронизации между вкладками)
window.addEventListener('storage', function(e) {
    if (e.key === 'reviews' || e.key === 'content_updated' || e.key === 'review_updated') {
        console.log('🔄 Обновление данных из другой вкладки');
        
        // Определяем какая вкладка активна и обновляем соответствующие данные
        const activeTab = document.querySelector('.tab-btn.active')?.textContent;
        
        if (activeTab?.includes('НОВОСТИ')) {
            loadNewsList();
        } else if (activeTab?.includes('ВАКАНСИИ')) {
            loadVacanciesList();
        } else if (activeTab?.includes('ОТЗЫВЫ')) {
            loadReviews();
        }
    }
});
