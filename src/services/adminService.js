import apiClient from './apiClient';

export const adminService = {

    async getDashboardStats() {
        try {
            const [pendingApps, users, activeProviders, tokenStats] = await Promise.all([
                this.getPendingApplications(),
                this.getAllUsers(),
                this.getActiveProviders(),
                this.getTokenStats()
            ]);

            return {
                pendingApplications: pendingApps.data?.length || 0,
                totalUsers: users.data?.length || 0,
                activeProviders: activeProviders.data?.length || 0,
                tokenStats: tokenStats.data || {}
            };
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getPendingApplications() {
        try {
            const response = await apiClient.get('/admin/provider-applications/status/PENDING');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getApplicationsByStatus(status) {
        try {

            const response = await apiClient.get(`/admin/provider-applications/status/${status}`);
            return response.data;
        } catch (error) {

            try {
                const response = await apiClient.get(`/provider-applications/admin/status/${status}`);
                return response.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    },

    async getApplicationById(applicationId) {
        try {
            const response = await apiClient.get(`/admin/provider-applications/${applicationId}`);
            return response.data;
        } catch (error) {
            try {
                const response = await apiClient.get(`/provider-applications/admin/${applicationId}`);
                return response.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    },

    async approveApplication(applicationId) {
        try {
            const response = await apiClient.put(`/admin/provider-applications/${applicationId}/approve`);
            return response.data;
        } catch (error) {
            try {
                const response = await apiClient.put(`/provider-applications/admin/${applicationId}/approve`);
                return response.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    },

    async rejectApplication(applicationId, reason) {
        try {
            const response = await apiClient.put(`/admin/provider-applications/${applicationId}/reject`, {
                reason
            });
            return response.data;
        } catch (error) {
            try {
                const response = await apiClient.put(`/provider-applications/admin/${applicationId}/reject`, {
                    reason
                });
                return response.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    },


    async getAllUsers() {
        try {
            const response = await apiClient.get('/admin/users');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getUsersPaginated(page = 0, size = 10) {
        try {
            const response = await apiClient.get(`/admin/users/paginated?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async createUser(userData) {
        try {
            const response = await apiClient.post('/admin/users', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async updateUser(userId, userData) {
        try {
            const response = await apiClient.patch(`/admin/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async changeUserRole(userId, role) {
        try {
            const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async deleteUser(userId) {
        try {
            const response = await apiClient.delete(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getAllProviders() {
        try {
            const response = await apiClient.get('/admin/providers');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getProvidersByStatus(status) {
        try {
            const response = await apiClient.get(`/admin/providers/status/${status}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getActiveProviders() {
        return this.getProvidersByStatus('ACTIVE');
    },

    async changeProviderStatus(providerId, status) {
        try {
            const response = await apiClient.put(`/admin/providers/${providerId}/status?status=${status}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getAllCategories() {
        try {
            const response = await apiClient.get('/admin/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async createCategory(categoryData) {
        try {
            const response = await apiClient.post('/admin/categories', categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async updateCategory(categoryId, categoryData) {
        try {
            const response = await apiClient.put(`/admin/categories/${categoryId}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async activateCategory(categoryId) {
        try {
            const response = await apiClient.put(`/admin/categories/${categoryId}/activate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async deactivateCategory(categoryId) {
        try {
            const response = await apiClient.put(`/admin/categories/${categoryId}/deactivate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async deleteCategory(categoryId) {
        try {
            const response = await apiClient.delete(`/admin/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getServicesPaginated(page = 0, size = 10) {
        try {
            const response = await apiClient.get(`/admin/services/paginated?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getServiceById(serviceId) {
        try {
            const response = await apiClient.get(`/admin/services/${serviceId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getTokenStats() {
        try {
            const response = await apiClient.get('/admin/blacklist/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async cleanupExpiredTokens() {
        try {
            const response = await apiClient.post('/admin/blacklist/cleanup');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getUserActiveTokens(userId) {
        try {
            const response = await apiClient.get(`/admin/blacklist/user/${userId}/active-tokens`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async forceLogoutUser(userId) {
        try {
            const response = await apiClient.post(`/admin/blacklist/user/${userId}/force-logout`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
