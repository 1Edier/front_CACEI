import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">Sistema de Rúbricas</Link>
            <ul className="navbar-links">
                {isAuthenticated ? (
                    <>
                        <li><Link to="/resultados">Rúbricas</Link></li>
                        <li><Link to="/encuestas">Encuestas</Link></li>
                        {(user?.rol === 'administrador' || user?.rol === 'coordinador') && <li><Link to="/encuestas/nueva">Crear Encuesta</Link></li>}
                        {user?.rol === 'administrador' && <li><Link to="/admin/usuarios">Usuarios</Link></li>}
                        <li><Link to="/profile">Hola, {user?.nombre_completo || user?.usuario}</Link></li>
                        <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Iniciar Sesión</Link></li>
                        <li><Link to="/register">Registrarse</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
