// ========== ВАКАНСИИ ==========

function loadVacancies() {
    const vacanciesGrid = document.getElementById('vacanciesGrid');
    if (!vacanciesGrid) return;
    
    const vacancies = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.VACANCIES) || '[]');
    
    if (vacancies.length === 0) {
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
        
        const details = vacancy.details || [];
        const detailsHtml = details.map(d => `<li>${d}</li>`).join('');
        
        html += `
            <div class="vacancy-card">
                ${badgeText ? `<div class="vacancy-badge ${badgeClass}">${badgeText}</div>` : ''}
                <h3>${vacancy.title}</h3>
                <div class="vacancy-company">${vacancy.company}</div>
                <div class="vacancy-salary">${vacancy.salary}</div>
                <ul class="vacancy-details">
                    ${detailsHtml}
                </ul>
                <button class="vacancy-btn" onclick="applyForVacancy('${vacancy.id}')">Узнать подробнее</button>
            </div>
        `;
    });
    
    vacanciesGrid.innerHTML = html;
}

function applyForVacancy(vacancyId) {
    const vacancies = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.VACANCIES) || '[]');
    const vacancy = vacancies.find(v => v.id == vacancyId);
    
    if (vacancy) {
        if (vacancy.apply_link && vacancy.apply_link.trim() !== '') {
            window.open(vacancy.apply_link, '_blank');
        } else {
            alert('Ссылка на вакансию не указана. Обратитесь в центр занятости по телефону 8 (42335) 4-08-34');
        }
    }
}

document.addEventListener('DOMContentLoaded', loadVacancies);

window.addEventListener('storage', function(e) {
    if (e.key === CONFIG.STORAGE_KEYS.VACANCIES) {
        loadVacancies();
    }
});