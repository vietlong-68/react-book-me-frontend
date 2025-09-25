import apiClient from './apiClient';

export const scheduleService = {

    async getProviderSchedules(providerId, startDate, endDate) {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await apiClient.get(`/provider/schedules?providerId=${providerId}&${params.toString()}`);
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
            const response = await apiClient.get(`/provider/schedules/${scheduleId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
