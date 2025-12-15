import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { getAllUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../api/apiService';
import '../styles/Table.css';

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        usuario: '',
        contrasena: '',
        nombre_completo: '',
        email: '',
        rol: 'administrador'
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await getAllUsuarios();
            setUsuarios(response.data);
        } catch (err) {
            setError('Error al cargar los usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Actualizar usuario
                await updateUsuario(editingUser.id, {
                    nombre_completo: formData.nombre_completo,
                    email: formData.email,
                    rol: formData.rol,
                    activo: formData.activo !== undefined ? formData.activo : true
                });
            } else {
                // Crear nuevo usuario
                await createUsuario(formData);
            }

            setShowModal(false);
            resetForm();
            fetchUsuarios();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar el usuario');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            usuario: user.usuario,
            contrasena: '', // No mostramos la contraseña
            nombre_completo: user.nombre_completo,
            email: user.email,
            rol: user.rol,
            activo: user.activo
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
            try {
                await deleteUsuario(id);
                fetchUsuarios();
            } catch (err) {
                setError('Error al desactivar el usuario');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            usuario: '',
            contrasena: '',
            nombre_completo: '',
            email: '',
            rol: 'administrador'
        });
        setEditingUser(null);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    if (loading) {
        return (
            <div className="page-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #48bb78',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    const usuariosActivos = usuarios.filter(u => u.activo).length;
    const usuariosInactivos = usuarios.filter(u => !u.activo).length;
    const administradores = usuarios.filter(u => u.rol === 'administrador').length;

    return (
        <div className="page-container">
            <div style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <h1 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>Gestión de Usuarios</h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                            Administra los usuarios del sistema
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'white',
                            color: '#38a169',
                            border: 'none',
                            fontWeight: '600'
                        }}
                    >
                        <FiUserPlus /> Nuevo Usuario
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    background: '#fee',
                    border: '1px solid #fcc',
                    color: '#c33',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            {/* Tarjetas de estadísticas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '2px solid #e5e7eb'
                }}>
                    <h3 style={{
                        margin: '0 0 0.5rem 0',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        Total Usuarios
                    </h3>
                    <p style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        margin: 0,
                        color: '#48bb78'
                    }}>
                        {usuarios.length}
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '2px solid #e5e7eb'
                }}>
                    <h3 style={{
                        margin: '0 0 0.5rem 0',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        Usuarios Activos
                    </h3>
                    <p style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        margin: 0,
                        color: '#10b981'
                    }}>
                        {usuariosActivos}
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '2px solid #e5e7eb'
                }}>
                    <h3 style={{
                        margin: '0 0 0.5rem 0',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        Usuarios Inactivos
                    </h3>
                    <p style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        margin: 0,
                        color: '#ef4444'
                    }}>
                        {usuariosInactivos}
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '2px solid #e5e7eb'
                }}>
                    <h3 style={{
                        margin: '0 0 0.5rem 0',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        Administradores
                    </h3>
                    <p style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        margin: 0,
                        color: '#38a169'
                    }}>
                        {administradores}
                    </p>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Último Acceso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.usuario}</td>
                                <td>{user.nombre_completo}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.activo ? (
                                        <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <FiCheck /> Activo
                                        </span>
                                    ) : (
                                        <span style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <FiX /> Inactivo
                                        </span>
                                    )}
                                </td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                    {user.ultimo_acceso
                                        ? new Date(user.ultimo_acceso).toLocaleDateString('es-MX')
                                        : 'Nunca'
                                    }
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleEdit(user)}
                                            style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(user.id)}
                                            style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                            disabled={!user.activo}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal para crear/editar usuario */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '0',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            padding: '1.5rem 2rem',
                            borderRadius: '12px 12px 0 0'
                        }}>
                            <h2 style={{ color: 'white', margin: 0 }}>
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: '0.9rem'
                                }}>
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    name="usuario"
                                    value={formData.usuario}
                                    onChange={handleInputChange}
                                    required
                                    disabled={editingUser}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: editingUser ? '#f9fafb' : 'white'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#48bb78'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {!editingUser && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '0.9rem'
                                    }}>
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="contrasena"
                                        value={formData.contrasena}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: '0.9rem'
                                }}>
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    name="nombre_completo"
                                    value={formData.nombre_completo}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#48bb78'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: '0.9rem'
                                }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#48bb78'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {!editingUser && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '0.9rem'
                                    }}>
                                        Rol
                                    </label>
                                    <select
                                        name="rol"
                                        value={formData.rol}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: 'white',
                                            cursor: 'pointer'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#48bb78'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    >
                                        <option value="administrador">Administrador</option>
                                        <option value="usuario">Usuario</option>
                                    </select>
                                </div>
                            )}

                            {editingUser && (
                                <div style={{
                                    marginBottom: '1.25rem',
                                    padding: '1rem',
                                    background: '#f9fafb',
                                    borderRadius: '8px',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            checked={formData.activo}
                                            onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        Usuario Activo
                                    </label>
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                marginTop: '2rem',
                                paddingTop: '1.5rem',
                                borderTop: '2px solid #f3f4f6'
                            }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem 1.5rem',
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 6px rgba(72, 187, 120, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 12px rgba(72, 187, 120, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 6px rgba(72, 187, 120, 0.3)';
                                    }}
                                >
                                    {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem 1.5rem',
                                        background: 'white',
                                        color: '#6b7280',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#f9fafb';
                                        e.target.style.borderColor = '#d1d5db';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'white';
                                        e.target.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsuariosPage;
