import apiClient from './apiClient';

export const authService = {

    async register(userData) {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async login(email, password) {
        try {
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });


            if (response.data.success && response.data.data.token) {
                localStorage.setItem('token', response.data.data.token);
            }

            return response.data;
        } catch (error) {


            const errorData = error.response?.data || error;
            throw {
                message: errorData.message || 'Đăng nhập thất bại!',
                response: error.response
            };
        }
    },


    async logout() {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {

        } finally {

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },


    async checkToken(token) {
        try {
            const response = await apiClient.post('/auth/introspect', { token });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getCurrentUser() {
        try {
            const response = await apiClient.get('/user/profile');


            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.data));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    },


    getToken() {
        return localStorage.getItem('token');
    },


    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};
