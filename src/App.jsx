import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AppLayout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ApplicationManagementPage from './pages/ApplicationManagementPage';
import EditApplicationPage from './pages/EditApplicationPage';
import ProfilePage from './pages/ProfilePage';


import Dashboard from './pages/admin/Dashboard';
import ApplicationReview from './pages/admin/ApplicationReview';
import UserManagement from './pages/admin/UserManagement';
import ProviderManagement from './pages/admin/ProviderManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import SystemManagement from './pages/admin/SystemManagement';

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <Router>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Home />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply-provider"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ApplicationFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ApplicationManagementPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-application/:applicationId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditApplicationPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <ApplicationReview />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/providers"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <ProviderManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <CategoryManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <ServiceManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <SystemManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
