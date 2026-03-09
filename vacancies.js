// ========== ВАКАНСИИ ==========

async function loadVacancies() {
    const vacanciesGrid = document.getElementById('vacanciesGrid');
    if (!vacanciesGrid) return;
    
    try {
        const vacancies = await API.getVacancies();
        
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
            }
            
            const details = vacancy.details ? JSON.parse(vacancy.details) : [];
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
                    <button class="vacancy-btn" onclick="applyForVacancy(${vacancy.id})">Узнать подробнее</button>
                </div>
            `;
        });
        
        vacanciesGrid.innerHTML = html;
    } catch (error) {
        vacanciesGrid.innerHTML = '<p class="no-data">Ошибка загрузки вакансий</p>';
        console.error('Ошибка загрузки вакансий:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadVacancies);

