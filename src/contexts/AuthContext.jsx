import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, getProfile, registerUser } from '../api/apiService'; // Asegúrate de importar todo lo necesario

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Mantenemos el estado de carga

    // Usamos useCallback para memorizar la función y evitar que se recree innecesariamente
    const fetchAndSetUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Si hay token, pedimos el perfil del usuario para validar la sesión
                const { data } = await getProfile();
                setUser(data);
            } catch (error) {
                console.error("Token de sesión inválido. Limpiando...");
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Al cargar la app, intentamos obtener el usuario si hay un token
        fetchAndSetUser();
    }, [fetchAndSetUser]);

    const login = async (credentials) => {
        try {
            const { data } = await loginUser(credentials);
            if (data.token) {
                localStorage.setItem('token', data.token);
                // Inmediatamente después del login, obtenemos el perfil actualizado del usuario
                await fetchAndSetUser(); 
            }
        } catch (error) {
            // Limpiamos cualquier dato en caso de un login fallido
            localStorage.removeItem('token');
            setUser(null);
            console.error("Error en el login:", error);
            throw error; // Re-lanzamos el error para que el componente LoginPage pueda manejarlo
        }
    };

    const register = async (userData) => {
        // La lógica de registro no cambia, solo llama a la API
        return await registerUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // No es necesario un estado `isAuthenticated`, la UI reaccionará a `user` siendo `null`
    };

    // El valor del contexto que se compartirá con el resto de la app
    const value = {
        user,
        isAuthenticated: !!user, // Estado derivado: es true si `user` no es null
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Solo renderizamos la app cuando hemos terminado de verificar la sesión */}
            {!loading && children}
        </AuthContext.Provider>
    );
};