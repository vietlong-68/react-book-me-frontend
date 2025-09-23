import apiClient from './apiClient';

export const providerApplicationService = {

    async submitApplication(formData) {
        try {
            const response = await apiClient.post('/provider-applications', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getMyApplications() {
        try {
            const response = await apiClient.get('/provider-applications/my-applications');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getApplicationById(applicationId) {
        try {
            const response = await apiClient.get(`/provider-applications/${applicationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async updateApplication(applicationId, formData) {
        try {
            const response = await apiClient.put(`/provider-applications/${applicationId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async cancelApplication(applicationId) {
        try {
            const response = await apiClient.delete(`/provider-applications/${applicationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
