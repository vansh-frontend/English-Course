import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { EnrollPage } from './pages/EnrollPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailsPage />} />
        <Route path="enroll/:id" element={<EnrollPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="payment-success" element={<PaymentSuccessPage />} />
        
        {/* Protected routes */}
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;