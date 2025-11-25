import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEncuestas } from '../api/apiService';
import '../styles/Table.css'; // Estilos para tablas

const EncuestaListPage = () => {
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
        <div className="table-container">
            <h1>Listado de Encuestas</h1>
            {encuestas.length === 0 ? (
                <p>No hay encuestas disponibles.</p>
            ) : (
                <table className="table">
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
                                <td>
                                    <Link to={`/encuestas/${encuesta.id}/resultados`} className="btn btn-sm btn-info">Ver Resultados</Link>
                                    <Link to={`/encuestas/${encuesta.id}/responder`} className="btn btn-sm btn-primary" style={{ marginLeft: '0.5rem' }}>Responder</Link>
                                    {/* Aquí se podrían añadir botones para editar o eliminar */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <Link to="/encuestas/create" className="btn btn-primary mt-3">Crear Nueva Encuesta</Link>
        </div>
    );
};

export default EncuestaListPage;
