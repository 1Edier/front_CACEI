// src/api/apiService.js
import axios from 'axios';

// La URL base de tu backend. Asegúrate de que coincida con el puerto de tu backend.
const API_URL = ' http://localhost:3000/api/v1';

// Instancia para peticiones con autenticación
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Instancia para peticiones públicas (sin autenticación)
const publicApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token a las peticiones 'api'
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Auth ---
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');

// --- Resultados de Aprendizaje ---
export const getAllResultados = () => api.get('/resultados-aprendizaje');
export const getResultadoById = (id) => api.get(`/resultados-aprendizaje/${id}`);
export const createResultado = (data) => api.post('/resultados-aprendizaje', data);
export const updateResultado = (id, data) => api.put(`/resultados-aprendizaje/${id}`, data);
export const deleteResultado = (id) => api.delete(`/resultados-aprendizaje/${id}`);
export const getResultadoHistory = (id) => api.get(`/resultados-aprendizaje/${id}/historial`);

// --- Encuestas ---
export const getAllEncuestas = () => api.get('/encuestas');
export const getFullEncuesta = (id) => api.get(`/encuestas/${id}`);
export const createEncuesta = (data) => api.post('/encuestas', data);
export const submitRespuesta = (data) => api.post('/encuestas/respuestas', data);
export const getEncuestaResultados = (id) => api.get(`/encuestas/${id}/resultados`);

// --- Encuestas Externas / Invitaciones ---
export const createEncuestaInvitacion = (id_encuesta, data) => api.post(`/encuestas/${id_encuesta}/invitaciones`, data);
export const validateEncuestaInvitacion = (pin) => publicApi.get(`/encuestas/invitaciones/${pin}`); // Usar publicApi
export const submitRespuestaExterna = (data) => publicApi.post('/encuestas/respuestas/externas', data); // Usar publicApi

// --- Usuarios (Admin) ---
export const getAllUsuarios = () => api.get('/usuarios');
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);

export default api;
