import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set the auth token for all requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const response = await api.get('/api/auth/me');
          setCurrentUser(response.data.user);
          setUserRole(response.data.user.role);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setCurrentUser(user);
      setUserRole(user.role);
      
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setCurrentUser(user);
      setUserRole(user.role);
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setCurrentUser(null);
    setUserRole(null);
    
    // Redirect to login
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/api/users/me', userData);
      setCurrentUser(response.data.user);
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.message || 'Failed to update profile.';
      toast.error(message);
      return false;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/users/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      const message = error.response?.data?.message || 'Failed to change password.';
      toast.error(message);
      return false;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return userRole === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(userRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        hasRole,
        hasAnyRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
