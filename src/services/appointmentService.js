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
            const response = await apiClient.get(`/user/appointments/${appointmentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
