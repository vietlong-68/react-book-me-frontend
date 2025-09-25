import apiClient from './apiClient';

export const providerService = {

    async getMyProviders() {
        try {
            const response = await apiClient.get('/provider/my-providers');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getProviderById(providerId) {
        try {
            const response = await apiClient.get(`/provider/${providerId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getProviderServices(providerId) {
        try {
            const response = await apiClient.get(`/provider/services/${providerId}/services`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getProviderServicesPaginated(providerId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
        try {
            const response = await apiClient.get(`/provider/services/${providerId}/services/paginated`, {
                params: { page, size, sortBy, sortDir }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getServiceById(providerId, serviceId) {
        try {
            const response = await apiClient.get(`/provider/services/${providerId}/services/${serviceId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async createService(providerId, formData) {
        try {
            const response = await apiClient.post(`/provider/services/${providerId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async updateService(providerId, serviceId, formData) {
        try {
            const response = await apiClient.put(`/provider/services/${providerId}/services/${serviceId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async deleteService(providerId, serviceId) {
        try {
            const response = await apiClient.delete(`/provider/services/${providerId}/services/${serviceId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async activateService(providerId, serviceId) {
        try {
            const response = await apiClient.put(`/provider/services/${providerId}/services/${serviceId}/activate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async deactivateService(providerId, serviceId) {
        try {
            const response = await apiClient.put(`/provider/services/${providerId}/services/${serviceId}/deactivate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },



    async updateProvider(providerId, providerData, logoFile = null, bannerFile = null) {
        try {
            const formData = new FormData();


            if (providerData.businessName) {
                formData.append('businessName', providerData.businessName);
            }
            if (providerData.bio) {
                formData.append('bio', providerData.bio);
            }
            if (providerData.address) {
                formData.append('address', providerData.address);
            }
            if (providerData.phoneNumber) {
                formData.append('phoneNumber', providerData.phoneNumber);
            }
            if (providerData.websiteUrl) {
                formData.append('websiteUrl', providerData.websiteUrl);
            }


            if (logoFile) {
                formData.append('logoFile', logoFile);
            }


            if (bannerFile) {
                formData.append('bannerFile', bannerFile);
            }

            const response = await apiClient.put(`/provider/${providerId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getPublicServices(page = 0, size = 10) {
        try {
            const response = await apiClient.get(`/services?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getPublicServiceById(serviceId) {
        try {
            const response = await apiClient.get(`/services/${serviceId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
