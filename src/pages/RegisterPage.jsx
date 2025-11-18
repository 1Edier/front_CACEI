import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await register(formData);
            setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error en el registro');
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Registrarse</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Usuario</label>
                    <input type="text" name="usuario" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" name="nombre_completo" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Contraseña</label>
                    <input type="password" name="contrasena" onChange={handleChange} required />
                </div>
                 {/* Por simplicidad, el rol se puede predefinir o ser seleccionado si la lógica lo permite */}
                <button type="submit" className="btn btn-primary">Registrarse</button>
                {error && <p className="error-message">{error}</p>}
                {success && <p style={{color: 'green', textAlign: 'center'}}>{success}</p>}
            </form>
        </div>
    );
};

export default RegisterPage;