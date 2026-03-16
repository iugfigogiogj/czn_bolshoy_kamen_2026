// ========== ВАКАНСИИ ==========

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

async function loadVacancies() {
    const vacanciesGrid = document.getElementById('vacanciesGrid');
    if (!vacanciesGrid) return;
    
    try {
        const vacancies = await API.getVacancies();
        console.log('Загружены вакансии:', vacancies);
        
        if (!vacancies || vacancies.length === 0) {
            vacanciesGrid.innerHTML = '<p class="no-data">Вакансий пока нет</p>';
            return;
        }
        
        let html = '';
        vacancies.forEach(vacancy => {
            let badgeClass = '';
            let badgeText = '';
            
            switch(vacancy.badge) {
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
                default:
                    badgeClass = '';
                    badgeText = '';
            }
            
            // Парсим детали
            let details = [];
            try {
                details = vacancy.details ? JSON.parse(vacancy.details) : [];
            } catch (e) {
                details = vacancy.details || [];
            }
            
            const detailsHtml = details.map(d => `<li>${d}</li>`).join('');
            
            // Обрезаем длинные тексты
            const shortTitle = truncateText(vacancy.title, 60);
            const shortCompany = truncateText(vacancy.company, 50);
            
            html += `
                <div class="vacancy-card">
                    ${badgeText ? `<div class="vacancy-badge ${badgeClass}">${badgeText}</div>` : ''}
                    <h3 title="${vacancy.title}">${shortTitle}</h3>
                    <div class="vacancy-company" title="${vacancy.company}">${shortCompany}</div>
                    <div class="vacancy-salary">${vacancy.salary}</div>
                    <ul class="vacancy-details">
                        ${detailsHtml}
                    </ul>
                    <button class="vacancy-btn" onclick="applyForVacancy(${vacancy.id})">Узнать подробнее</button>
                </div>
            `;
        });
        
        vacanciesGrid.innerHTML = html;
    } catch (error) {
        console.error('Ошибка загрузки вакансий:', error);
        vacanciesGrid.innerHTML = '<p class="no-data">Ошибка загрузки вакансий</p>';
    }
}

async function applyForVacancy(vacancyId) {
    try {
        const vacancies = await API.getVacancies();
        const vacancy = vacancies.find(v => v.id == vacancyId);
        
        if (vacancy) {
            if (vacancy.apply_link && vacancy.apply_link.trim() !== '') {
                window.open(vacancy.apply_link, '_blank');
            } else {
                alert('Ссылка на вакансию не указана. Обратитесь в центр занятости по телефону 8 (42335) 4-08-34');
            }
        }
    } catch (error) {
        console.error('Ошибка при отклике:', error);
    }
}

// Загружаем при загрузке страницы
document.addEventListener('DOMContentLoaded', loadVacancies);

// Слушаем изменения
window.addEventListener('storage', function(e) {
    if (e.key === CONFIG.STORAGE_KEYS.VACANCIES || e.key === 'content_updated') {
        loadVacancies();
    }
});
