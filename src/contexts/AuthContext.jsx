// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as api from '../api/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const profile = await api.getProfile();
                    setUser(profile.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Token inválido, cerrando sesión.");
                    logout();
                }
            }
            setIsLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (credentials) => {
        const { data } = await api.loginUser(credentials);
        localStorage.setItem('token', data.token);
        setUser(data.usuario);
        setIsAuthenticated(true);
        return data;
    };

    const register = async (userData) => {
        const { data } = await api.registerUser(userData);
        // Opcional: auto-login después del registro
        // await login({ usuario: userData.usuario, contrasena: userData.contrasena });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};