import apiClient from './apiClient';

export const scheduleService = {

    async getProviderSchedules() {
        try {
            const response = await apiClient.get(`/provider/schedules`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getAvailableSchedules(serviceId) {
        try {
            const response = await apiClient.get(`/schedules/available`, {
                params: { serviceId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async createSchedule(scheduleData) {
        try {
            const response = await apiClient.post('/provider/schedules', scheduleData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async updateSchedule(scheduleId, scheduleData) {
        try {
            const response = await apiClient.put(`/provider/schedules/${scheduleId}`, scheduleData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async deleteSchedule(scheduleId) {
        try {
            const response = await apiClient.delete(`/provider/schedules/${scheduleId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    async getScheduleById(scheduleId) {
        try {
            const response = await apiClient.get(`/schedules/${scheduleId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async createRecurringSchedule(data) {
        try {
            const response = await apiClient.post('/provider/schedules/recurring', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};