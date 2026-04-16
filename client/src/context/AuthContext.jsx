import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token && token !== 'undefined') {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const storedUser = localStorage.getItem('user');
          if (storedUser && storedUser !== 'undefined') {
            setUser(JSON.parse(storedUser));
          }
        } else {
          handleLogoutCleanup();
        }
      } catch (e) {
        console.error("Auth init error:", e);
        handleLogoutCleanup();
      } finally {
        setLoading(false);
      }
    };

    // Global Interceptor for 401s
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogoutCleanup();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    initializeAuth();
    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);


  const handleLogoutCleanup = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  const login = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  const logout = () => {
    handleLogoutCleanup();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
