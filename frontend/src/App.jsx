import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login          from './pages/Login';
import NotFound       from './pages/NotFound';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard      from './pages/Dashboard';
import Patients       from './pages/Patients';
import Appointments   from './pages/Appointments';
import Prescriptions  from './pages/Prescriptions';
import AIAssistant    from './pages/AIAssistant';
import Analytics      from './pages/Analytics';
import ManageDoctors       from './pages/admin/ManageDoctors';
import ManageReceptionists from './pages/admin/ManageReceptionists';
import PatientProfile      from './pages/patient/PatientProfile';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1f2937',
              color: '#f9fafb',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="patients" element={
              <ProtectedRoute roles={['admin', 'doctor', 'receptionist']}>
                <Patients />
              </ProtectedRoute>
            } />

            <Route path="appointments" element={<Appointments />} />
            <Route path="prescriptions" element={<Prescriptions />} />

            <Route path="ai-assistant" element={
              <ProtectedRoute roles={['doctor']}>
                <AIAssistant />
              </ProtectedRoute>
            } />

            <Route path="analytics" element={
              <ProtectedRoute roles={['admin', 'doctor']}>
                <Analytics />
              </ProtectedRoute>
            } />

            <Route path="admin/doctors" element={
              <ProtectedRoute roles={['admin']}>
                <ManageDoctors />
              </ProtectedRoute>
            } />

            <Route path="admin/receptionists" element={
              <ProtectedRoute roles={['admin']}>
                <ManageReceptionists />
              </ProtectedRoute>
            } />

            <Route path="patient/profile" element={
              <ProtectedRoute roles={['patient']}>
                <PatientProfile />
              </ProtectedRoute>
            } />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}