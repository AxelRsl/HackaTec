import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Configurar axios para incluir el token en todas las solicitudes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [currentUser]);

  // Verificar si hay un usuario autenticado al cargar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        // Configurar axios para esta solicitud
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Hacer petición al endpoint de perfil
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`);
        
        if (response.data && response.data.success) {
          setCurrentUser(response.data.data);
        } else {
          // Si hay respuesta pero no es exitosa, limpiar
          setCurrentUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setCurrentUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/login`, {
        email,
        password
      });

      if (response.data && response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setCurrentUser(user);
        return true;
      } else {
        setError(response.data.message || 'Error desconocido al iniciar sesión');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al conectar con el servidor');
      return false;
    }
  };

  // Función para registrar un usuario
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/register`, userData);

      if (response.data && response.data.success) {
        // Iniciar sesión automáticamente después del registro
        return login(userData.email, userData.password);
      } else {
        setError(response.data.message || 'Error desconocido al registrarse');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al conectar con el servidor');
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    navigate('/login');
  };

  // Función para actualizar preferencias del usuario
  const updateUserPreferences = async (preferences) => {
    try {
      setError(null);
      const response = await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/preferences`, preferences);

      if (response.data && response.data.success) {
        setCurrentUser({
          ...currentUser,
          preferences: {
            ...currentUser.preferences,
            ...preferences
          }
        });
        return true;
      } else {
        setError(response.data.message || 'Error al actualizar preferencias');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al conectar con el servidor');
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUserPreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
