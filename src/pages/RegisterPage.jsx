import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/apiService'; // Importamos directamente la función
import { motion } from 'framer-motion';
import Logo from '../assets/Logo';
import '../styles/LoginPage.css'; // Reutilizamos los estilos del login para consistencia
import '../styles/Form.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        usuario: '',
        nombre_completo: '',
        email: '',
        contrasena: '',
        rol: 'docente' // Valor por defecto
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await registerUser(formData);
            setSuccess('¡Registro exitoso! Serás redirigido al login en unos segundos.');
            setTimeout(() => navigate('/login'), 3000); // 3 segundos para que el usuario lea el mensaje
        } catch (err) {
            setError(err.response?.data?.message || 'Error en el registro. Inténtalo de nuevo.');
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
                    <h1>Crea tu Cuenta</h1>
                    <p>Únete a nuestra plataforma para optimizar la evaluación y el seguimiento académico.</p>
                </div>

                <div className="login-form-panel">
                    <h2 className="form-title">Registro de Nuevo Usuario</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="usuario">Usuario</label>
                            <input type="text" id="usuario" name="usuario" onChange={handleChange} required placeholder="ej: juan.perez" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nombre_completo">Nombre Completo</label>
                            <input type="text" id="nombre_completo" name="nombre_completo" onChange={handleChange} required placeholder="Juan Pérez García" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" onChange={handleChange} required placeholder="juan.perez@universidad.com" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contrasena">Contraseña</label>
                            <input type="password" id="contrasena" name="contrasena" onChange={handleChange} required placeholder="••••••••" />
                        </div>
                        
                        {error && <p className="form-feedback error">{error}</p>}
                        {success && <p className="form-feedback success">{success}</p>}

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </form>
                    <p className="form-link">
                        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;