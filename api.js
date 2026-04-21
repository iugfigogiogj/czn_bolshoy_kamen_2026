// ========== API ДЛЯ РАБОТЫ С SUPABASE ==========

const API = {
    // ========== НОВОСТИ ==========
    async getNews() {
        const { data, error } = await supabaseClient
            .from('news')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getNewsById(id) {
        const { data, error } = await supabaseClient
            .from('news')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async createNews(newsData) {
        const { data, error } = await supabaseClient
            .from('news')
            .insert([newsData])
            .select();
        if (error) throw error;
        return { id: data[0].id, success: true };
    },

    async updateNews(newsId, newsData) {
        const { error } = await supabaseClient
            .from('news')
            .update(newsData)
            .eq('id', newsId);
        if (error) throw error;
        return { success: true };
    },

    async deleteNews(newsId) {
        const { error } = await supabaseClient
            .from('news')
            .delete()
            .eq('id', newsId);
        if (error) throw error;
        return { success: true };
    },

    // ========== ВАКАНСИИ ==========
    async getVacancies() {
        const { data, error } = await supabaseClient
            .from('vacancies')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getVacancyById(id) {
        const { data, error } = await supabaseClient
            .from('vacancies')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async createVacancy(vacancyData) {
        const { data, error } = await supabaseClient
            .from('vacancies')
            .insert([vacancyData])
            .select();
        if (error) throw error;
        return { id: data[0].id, success: true };
    },

    async updateVacancy(vacancyId, vacancyData) {
        const { error } = await supabaseClient
            .from('vacancies')
            .update(vacancyData)
            .eq('id', vacancyId);
        if (error) throw error;
        return { success: true };
    },

    async deleteVacancy(vacancyId) {
        const { error } = await supabaseClient
            .from('vacancies')
            .delete()
            .eq('id', vacancyId);
        if (error) throw error;
        return { success: true };
    },

    // ========== ОТЗЫВЫ ==========
    async getPublishedReviews() {
        const { data, error } = await supabaseClient
            .from('reviews')
            .select('*')
            .eq('status', 'approved')
            .order('id', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getPendingReviews() {
        const { data, error } = await supabaseClient
            .from('reviews')
            .select('*')
            .eq('status', 'pending')
            .order('id', { ascending: false });
        if (error) throw error;
        return data;
    },

    async createReview(reviewData) {
        const { data, error } = await supabaseClient
            .from('reviews')
            .insert([reviewData])
            .select();
        if (error) throw error;
        return { id: data[0].id, success: true };
    },

    async approveReview(reviewId) {
        const { error } = await supabaseClient
            .from('reviews')
            .update({ status: 'approved' })
            .eq('id', reviewId);
        if (error) throw error;
        return { success: true };
    },

    async rejectReview(reviewId) {
        const { error } = await supabaseClient
            .from('reviews')
            .delete()
            .eq('id', reviewId);
        if (error) throw error;
        return { success: true };
    },

    async deleteReview(reviewId) {
        const { error } = await supabaseClient
            .from('reviews')
            .delete()
            .eq('id', reviewId);
        if (error) throw error;
        return { success: true };
    }
};
