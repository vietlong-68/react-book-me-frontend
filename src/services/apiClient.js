import axios from 'axios';

const getBaseURL = () => {
    const env = import.meta.env.VITE_ENV || 'dev';

    if (env === 'prod') {
        return import.meta.env.VITE_API_BASE_URL_PROD || 'https://vietlong.com/api';
    } else {
        return import.meta.env.VITE_API_BASE_URL_DEV || 'http://localhost:8080/api';
    }
};

const apiClient = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {


        if (error.response?.status === 401 && localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
