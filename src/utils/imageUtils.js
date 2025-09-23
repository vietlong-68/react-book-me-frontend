


const getFileServerBaseURL = () => {
    const env = import.meta.env.VITE_ENV || 'dev';

    if (env === 'prod') {
        return import.meta.env.VITE_FILE_SERVER_BASE_URL_PROD || 'https://vietlong.com';
    } else {
        return import.meta.env.VITE_FILE_SERVER_BASE_URL_DEV || 'http://localhost:8080';
    }
};


export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return null;
    }


    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }


    if (imagePath.startsWith('/')) {
        return `${getFileServerBaseURL()}${imagePath}`;
    }


    return `${getFileServerBaseURL()}/${imagePath}`;
};


export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) {
        return null;
    }

    return getImageUrl(avatarPath);
};

export default {
    getImageUrl,
    getAvatarUrl,
    getFileServerBaseURL
};
