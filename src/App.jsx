import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AppLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ApplicationManagementPage from './pages/ApplicationManagementPage';
import EditApplicationPage from './pages/EditApplicationPage';
import ProfilePage from './pages/ProfilePage';

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


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
