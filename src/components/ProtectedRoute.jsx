import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {

    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }


    if (requireAdmin) {
        const user = authService.getUser();
        if (!user || user.role !== 'ADMIN') {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
