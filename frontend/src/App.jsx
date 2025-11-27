import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './views/Dashboard';
import Internships from './views/Internships';
import InternshipDetail from './views/InternshipDetail';
import Profile from './views/Profile';
import Applications from './views/Applications';
import Login from './views/Login';
import Register from './views/Register';
import AdminDashboard from './views/admin/Dashboard';
import AdminInternships from './views/admin/Internships';
import AdminUsers from './views/admin/Users';
import './styles/App.css';

// Create a client for React Query
const queryClient = new QueryClient();

// Private Route Component
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Main App Component
const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar');
      const sidebarToggle = document.getElementById('sidebar-toggle');
      
      if (sidebar && sidebarToggle && 
          !sidebar.contains(event.target) && 
          !sidebarToggle.contains(event.target) && 
          window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                
                <Route path="/internships" element={
                  <PrivateRoute>
                    <Internships />
                  </PrivateRoute>
                } />
                
                <Route path="/internships/:id" element={
                  <PrivateRoute>
                    <InternshipDetail />
                  </PrivateRoute>
                } />
                
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                
                <Route path="/applications" element={
                  <PrivateRoute>
                    <Applications />
                  </PrivateRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <PrivateRoute adminOnly>
                    <AdminDashboard />
                  </PrivateRoute>
                } />
                
                <Route path="/admin/internships" element={
                  <PrivateRoute adminOnly>
                    <AdminInternships />
                  </PrivateRoute>
                } />
                
                <Route path="/admin/users" element={
                  <PrivateRoute adminOnly>
                    <AdminUsers />
                  </PrivateRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// App Wrapper with Providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  </QueryClientProvider>
);

export default App;
