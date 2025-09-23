import apiClient from './apiClient';

export const userService = {

    async getProfile() {
        try {
            const response = await apiClient.get('/user/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async updateProfile(userData) {
        try {
            const response = await apiClient.put('/user/profile', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async changePassword(passwordData) {
        try {
            const response = await apiClient.put('/user/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async updateAvatar(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.put('/user/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
