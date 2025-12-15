import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import Logo from '../assets/Logo';
import '../styles/LoginPage.css'; // Estilos específicos para esta página
import '../styles/Form.css'; // Estilos generales de formularios

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', contrasena: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(credentials);
            navigate('/'); // Redirige al HomePage después de un login exitoso
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <motion.div 
                className="login-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-promo-panel">
                    <Logo className="logo" />
                    <h1>Sistema de Gestión de Rúbricas</h1>
                    <p>Una plataforma moderna para la evaluación académica y la mejora continua.</p>
                </div>

                <div className="login-form-panel">
                    <h2 className="form-title">Iniciar Sesión</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email"
                                value={credentials.email} 
                                onChange={handleChange} 
                                required 
                                placeholder="tu_correo@example.com"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contrasena">Contraseña</label>
                            <input 
                                type="password" 
                                id="contrasena" 
                                name="contrasena"
                                value={credentials.contrasena} 
                                onChange={handleChange} 
                                required 
                                placeholder="••••••••"
                            />
                        </div>
                        
                        {error && <p className="form-feedback error">{error}</p>}

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Ingresando...' : 'Entrar'}
                        </button>
                    </form>
                    <p className="form-link">
                        ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
