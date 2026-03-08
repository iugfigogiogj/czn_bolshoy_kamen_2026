// ========== АДМИН-ПАНЕЛЬ - РАБОТА С СЕРВЕРОМ ==========

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

async function saveNews() {
    const newsData = {
        title: document.getElementById('newsTitle').value,
        date: document.getElementById('newsDate').value,
        image: document.getElementById('newsImage').value || '',
        preview: document.getElementById('newsPreview').value,
        details: document.getElementById('newsDetails').value || '',
        content: document.getElementById('newsContent').value || '',
        tags: newsTags
    };
    
    try {
        if (currentNewsId) {
            await API.updateNews(currentNewsId, newsData);
            alert('Новость обновлена!');
        } else {
            await API.createNews(newsData);
            alert('Новость опубликована!');
        }
        resetNewsForm();
        loadNewsList();
    } catch (error) {
        alert('Ошибка сохранения новости');
        console.error(error);
    }
}

async function deleteNews(newsId) {
    try {
        await API.deleteNews(newsId);
        loadNewsList();
    } catch (error) {
        alert('Ошибка удаления новости');
        console.error(error);
    }
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
            let badgeText = '';
            switch(item.badge) {
                case 'hot': badgeText = '🔥 Срочно'; break;
                case 'attractive': badgeText = '💰 Высокая ЗП'; break;
                case 'flexible': badgeText = '⏰ Гибкий график'; break;
                case 'housing': badgeText = '🏠 Жилье'; break;
                case 'parttime': badgeText = '⚡ Подработка'; break;
            }
            
            html += `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${item.title}</h3>
                        <div class="item-meta">
                            <span>🏢 ${item.company}</span>
                            <span>💰 ${item.salary}</span>
                            ${badgeText ? `<span>${badgeText}</span>` : ''}
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

async function saveVacancy() {
    const details = vacancyDetails.filter(d => d.trim() !== '');
    
    const vacancyData = {
        title: document.getElementById('vacancyTitle').value,
        company: document.getElementById('vacancyCompany').value,
        salary: document.getElementById('vacancySalary').value,
        badge: selectedBadge || '',
        details: details,
        apply_link: document.getElementById('vacancyLink').value || ''
    };
    
    try {
        if (currentVacancyId) {
            await API.updateVacancy(currentVacancyId, vacancyData);
            alert('Вакансия обновлена!');
        } else {
            await API.createVacancy(vacancyData);
            alert('Вакансия опубликована!');
        }
        resetVacancyForm();
        loadVacanciesList();
    } catch (error) {
        alert('Ошибка сохранения вакансии');
        console.error(error);
    }
}

async function deleteVacancy(vacancyId) {
    try {
        await API.deleteVacancy(vacancyId);
        loadVacanciesList();
    } catch (error) {
        alert('Ошибка удаления вакансии');
        console.error(error);
    }
}

// ========== ОТЗЫВЫ ==========
async function loadReviews() {
    try {
        const pending = await API.getPendingReviews();
        allReviews = pending;
        renderReviews();
        updateReviewStats();
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

async function approveReview(id) {
    try {
        await API.approveReview(id);
        loadReviews();
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
    } catch (error) {
        alert('Ошибка при отклонении отзыва');
        console.error(error);
    }
}
