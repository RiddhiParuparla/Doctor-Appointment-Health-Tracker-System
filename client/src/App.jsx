import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';
import DoctorSchedule from './pages/DoctorSchedule';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminAnalytics from './pages/admin/AdminAnalytics';

import DoctorsList from './pages/DoctorsList';
import PatientAppointments from './pages/PatientAppointments';
import HealthLibrary from './pages/HealthLibrary';
import Prescriptions from './pages/Prescriptions';
import Profile from './pages/Profile';
import { Layout } from './components/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-soft-bg">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    // If role unauthorized, send to their own correct home instead of creating a loop
    const homeMap = { patient: '/', doctor: '/doctor', admin: '/admin' };
    return <Navigate to={homeMap[user.role] || '/login'} replace />;
  }

  return <Layout>{children}</Layout>;
};

const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  const homeMap = { patient: '/', doctor: '/doctor', admin: '/admin' };
  
  // If we are at root but are NOT a patient, move to correct dashboard
  if (user.role !== 'patient') {
    return <Navigate to={homeMap[user.role]} replace />;
  }
  
  return <PatientDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute roles={['patient']}>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/doctor" element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute roles={['admin']}><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute roles={['admin']}><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />


          {/* Sub-routes for Patients */}
          <Route path="/doctors" element={<ProtectedRoute roles={['patient']}><DoctorsList /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute roles={['patient']}><PatientAppointments /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute roles={['patient', 'doctor']}><HealthLibrary /></ProtectedRoute>} />
          <Route path="/prescriptions" element={<ProtectedRoute roles={['patient']}><Prescriptions /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={['patient', 'doctor', 'admin']}><Profile /></ProtectedRoute>} />

          {/* Sub-routes for Doctors */}
          <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute roles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/schedule" element={<ProtectedRoute roles={['doctor']}><DoctorSchedule /></ProtectedRoute>} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
