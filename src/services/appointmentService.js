import apiClient from './apiClient';

export const appointmentService = {

    async getAppointmentsByStatus(status, page = 0, size = 10) {
        try {
            const response = await apiClient.get(`/user/appointments/status/${status}?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getAllAppointments(page = 0, size = 10) {
        try {
            const response = await apiClient.get(`/user/appointments?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getAppointmentById(appointmentId) {
        try {
            const response = await apiClient.get(`/appointments/${appointmentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async createAppointment(appointmentData) {
        try {
            const response = await apiClient.post('/appointments', appointmentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async cancelAppointment(appointmentId) {
        try {
            const response = await apiClient.put(`/appointments/${appointmentId}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getProviderAppointmentsByStatus(status, page = 0, size = 10) {
        try {
            const response = await apiClient.get(`/provider/appointments/status/${status}?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getProviderAppointmentsPaginated(page = 0, size = 10) {
        try {
            const response = await apiClient.get(`/provider/appointments/paginated?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async confirmAppointment(appointmentId) {
        try {
            const response = await apiClient.put(`/appointments/${appointmentId}/confirm`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async completeAppointment(appointmentId) {
        try {
            const response = await apiClient.put(`/appointments/${appointmentId}/complete`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
