// ========== ОБЩИЙ МОДУЛЬ ДЛЯ РАБОТЫ С API ==========

const API = {
    // Базовые методы
    async get(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API GET ${endpoint} error:`, error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API POST ${endpoint} error:`, error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API PUT ${endpoint} error:`, error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API DELETE ${endpoint} error:`, error);
            throw error;
        }
    },

    // ========== НОВОСТИ ==========
    async getNews() {
        return await this.get('/api/news');
    },

    async createNews(newsData) {
        return await this.post('/api/news', newsData);
    },

    async updateNews(newsId, newsData) {
        return await this.put(`/api/news/${newsId}`, newsData);
    },

    async deleteNews(newsId) {
        return await this.delete(`/api/news/${newsId}`);
    },

    // ========== ВАКАНСИИ ==========
    async getVacancies() {
        return await this.get('/api/vacancies');
    },

    async createVacancy(vacancyData) {
        return await this.post('/api/vacancies', vacancyData);
    },

    async updateVacancy(vacancyId, vacancyData) {
        return await this.put(`/api/vacancies/${vacancyId}`, vacancyData);
    },

    async deleteVacancy(vacancyId) {
        return await this.delete(`/api/vacancies/${vacancyId}`);
    },

    // ========== ОТЗЫВЫ ==========
    async getPublishedReviews() {
        return await this.get('/api/reviews/published');
    },

    async getPendingReviews() {
        return await this.get('/api/reviews/pending');
    },

    async createReview(reviewData) {
        return await this.post('/api/reviews', reviewData);
    },

    async approveReview(reviewId) {
        return await this.post(`/api/reviews/${reviewId}/approve`, {});
    },

    async rejectReview(reviewId) {
        return await this.post(`/api/reviews/${reviewId}/reject`, {});
    }
};
