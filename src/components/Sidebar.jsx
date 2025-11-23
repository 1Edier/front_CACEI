import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../assets/Logo'; // Importamos el logo
import { FiHome, FiFileText, FiCheckSquare, FiLogOut, FiUsers } from 'react-icons/fi';
import '../styles/Sidebar.css'; // Crearemos este archivo CSS

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: "/", text: "Inicio", icon: <FiHome />, roles: ['administrador', 'docente', 'coordinador', 'auditor'] },
        { to: "/resultados", text: "Rúbricas", icon: <FiFileText />, roles: ['administrador', 'docente', 'coordinador', 'auditor'] },
        { to: "/encuestas", text: "Encuestas", icon: <FiCheckSquare />, roles: ['administrador', 'docente', 'coordinador', 'auditor'] },
        { to: "/usuarios", text: "Gestionar Usuarios", icon: <FiUsers />, roles: ['administrador'] }, // Ejemplo de ruta solo para admin
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Logo className="sidebar-logo" />
            </div>
            <nav className="sidebar-nav">
                {navLinks.filter(link => link.roles.includes(user?.rol)).map(link => (
                    <NavLink key={link.to} to={link.to} className="sidebar-link" end>
                        {link.icon}
                        <span>{link.text}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="user-profile">
                    <span className="user-avatar">{user?.nombre_completo.charAt(0)}</span>
                    <div className="user-info">
                        <span className="user-name">{user?.nombre_completo}</span>
                        <span className="user-role">{user?.rol}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-button">
                    <FiLogOut />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;