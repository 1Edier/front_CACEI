import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEncuestas } from '../api/apiService';
import { useAuth } from '../hooks/useAuth';
import { FiPlus, FiBarChart2 } from 'react-icons/fi';
import '../styles/Table.css';

const EncuestaListPage = () => {
    const { user } = useAuth();
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEncuestas = async () => {
            try {
                const { data } = await getAllEncuestas();
                setEncuestas(data);
            } catch (err) {
                setError('Error al cargar las encuestas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEncuestas();
    }, []);

    if (loading) return <p>Cargando encuestas...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Listado de Encuestas</h1>
                {['administrador', 'coordinador'].includes(user?.rol) && (
                    <Link to="/encuestas/create" className="btn btn-primary">
                        <FiPlus /> Crear Nueva Encuesta
                    </Link>
                )}
            </div>

            <div className="table-wrapper">
                {encuestas.length === 0 ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>No hay encuestas disponibles.</p>
                ) : (
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Fecha de Inicio</th>
                                <th>Fecha de Fin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {encuestas.map(encuesta => (
                                <tr key={encuesta.id}>
                                    <td>{encuesta.nombre}</td>
                                    <td>{encuesta.descripcion}</td>
                                    <td>{new Date(encuesta.fecha_inicio).toLocaleDateString()}</td>
                                    <td>{new Date(encuesta.fecha_fin).toLocaleDateString()}</td>
                                    <td className="action-buttons">
                                        <Link to={`/encuestas/${encuesta.id}/resultados`} className="btn btn-secondary">
                                            <FiBarChart2 /> Ver Resultados
                                        </Link>
                                        
                                        {/* ======================================================= */}
                                        {/* ========= BOTÓN "RESPONDER" ELIMINADO ================= */}
                                        {/* ======================================================= */}
                                        
                                        {/* Aquí se podrían añadir botones para editar o eliminar en el futuro */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EncuestaListPage;