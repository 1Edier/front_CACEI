import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Form.css';

const LoginPage = () => {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login({ usuario, contrasena });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="usuario">Usuario</label>
                    <input type="text" id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="contrasena">Contraseña</label>
                    <input type="password" id="contrasena" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Entrar</button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
    );
};

export default LoginPage;
