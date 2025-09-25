import apiClient from './apiClient';

export const categoryService = {

    async getCategories() {
        try {
            const response = await apiClient.get('/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
