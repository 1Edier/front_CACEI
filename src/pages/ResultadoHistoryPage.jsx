// src/pages/ResultadoHistoryPage.js
import React, {useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResultadoHistory } from '../api/apiService';
import '../styles/Table.css';

const ResultadoHistoryPage = () => {
    const { id } = useParams();
    const [history, setHistory] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await getResultadoHistory(id);
                setHistory(data);
                // Por defecto, seleccionamos la versión más reciente para mostrarla
                if (data.length > 0) {
                    setSelectedVersion(data[0]);
                }
            } catch (err) {
                setError('No se pudo cargar el historial.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [id]);

    const getActionColor = (action) => {
        switch (action) {
            case 'INSERT': return 'green';
            case 'UPDATE': return '#fd7e14'; // Naranja
            case 'DELETE': return 'red';
            default: return 'black';
        }
    };

    if (loading) return <p>Cargando historial...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div>
            <Link to="/resultados" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                &larr; Volver a la lista
            </Link>
            <h1>Historial de Cambios</h1>

            <div className="history-container">
                {/* --- Columna Izquierda: Lista de Versiones --- */}
                <div className="version-list">
                    {history.length > 0 ? history.map(entry => (
                        <div
                            key={entry.id}
                            className={`version-item ${selectedVersion?.id === entry.id ? 'active' : ''}`}
                            onClick={() => setSelectedVersion(entry)}
                        >
                            <h4>Versión {entry.version}</h4>
                            <span className="version-meta">
                                Por: {entry.usuario_nombre || 'N/A'}
                            </span>
                            <span className="version-meta">
                                Fecha: {new Date(entry.fecha_cambio).toLocaleString()}
                            </span>
                            <span className="version-action" style={{ color: selectedVersion?.id === entry.id ? 'white' : getActionColor(entry.accion) }}>
                                Acción: {entry.accion}
                            </span>
                        </div>
                    )) : <p>No hay historial para esta rúbrica.</p>}
                </div>

                {/* --- Columna Derecha: Detalles de la Versión Seleccionada --- */}
                <div className="version-details">
                    {selectedVersion ? (
                        <div className="rubrica-view-container">
                            <div className="rubrica-header">
                                <h2>{selectedVersion.codigo}: {selectedVersion.descripcion}</h2>
                                <p>Mostrando detalles de la <strong>Versión {selectedVersion.version}</strong></p>
                            </div>
                            <table className="visual-rubrica-table">
                                <thead>
                                    <tr>
                                        <th>Criterio de desempeño</th>
                                        <th>Indicador de desempeño</th>
                                        {selectedVersion.estructura.niveles.map(nivel => (
                                            <th key={nivel}>{nivel}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedVersion.estructura.criterios.map((criterio) => (
                                        criterio.indicadores.map((indicador, indicadorIndex) => (
                                            <tr key={`${criterio.orden}-${indicador.orden}`}>
                                                {indicadorIndex === 0 && (
                                                    <td rowSpan={criterio.indicadores.length} className="criterio-cell-vertical">
                                                        {criterio.nombre}
                                                    </td>
                                                )}
                                                <td className="indicador-cell-visual">
                                                    {indicador.orden || indicadorIndex + 1}. {indicador.nombre}
                                                </td>
                                                {selectedVersion.estructura.niveles.map(nivel => {
                                                    const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                                                    return (
                                                        <td key={nivelKey}>{indicador.descriptores[nivelKey] || ''}</td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rubrica-view-container">
                            <p>Selecciona una versión de la lista para ver sus detalles.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultadoHistoryPage;