import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResultadoHistory } from '../api/apiService';
import { FiArrowLeft, FiUser, FiCalendar, FiPlus, FiEdit3, FiTrash2, FiClock } from 'react-icons/fi';
import '../styles/Table.css';
import '../styles/ResultadoHistoryPage.css';

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
                const sortedHistory = data.sort((a, b) => b.version - a.version);
                setHistory(sortedHistory);
                if (sortedHistory.length > 0) {
                    setSelectedVersion(sortedHistory[0]);
                }
            } catch (err) {
                setError('No se pudo cargar el historial.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [id]);

    const getActionInfo = (action) => {
        switch (action) {
            case 'INSERT': return { color: 'var(--success-color)', icon: <FiPlus />, text: 'Creación' };
            case 'UPDATE': return { color: 'var(--warning-color)', icon: <FiEdit3 />, text: 'Actualización' };
            case 'DELETE': return { color: 'var(--danger-color)', icon: <FiTrash2 />, text: 'Eliminación' };
            default: return { color: 'var(--secondary-color)', icon: <FiClock />, text: action };
        }
    };

    if (loading) return <p>Cargando historial...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="page-container">
            <Link to="/resultados" className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                <FiArrowLeft /> Volver a la lista
            </Link>
            
            <div className="page-header">
                <h1>Historial de Cambios</h1>
            </div>

            <div className="history-container">
                {/* --- SECCIÓN SUPERIOR: Tarjetas de Versiones --- */}
                <div className="version-list">
                    {history.length > 0 ? history.map(entry => {
                        const actionInfo = getActionInfo(entry.accion);
                        return (
                            <div
                                key={entry.id}
                                className={`version-item ${selectedVersion?.id === entry.id ? 'active' : ''}`}
                                onClick={() => setSelectedVersion(entry)}
                            >
                                <div className="version-header">
                                    <h4>Versión {entry.version}</h4>
                                    <div className="version-action" style={{ color: selectedVersion?.id === entry.id ? 'white' : actionInfo.color }}>
                                        {actionInfo.icon}
                                        <span>{actionInfo.text}</span>
                                    </div>
                                </div>
                                <div className="version-meta">
                                    <FiUser />
                                    <span>{entry.usuario_nombre || 'N/A'}</span>
                                </div>
                                <div className="version-meta">
                                    <FiCalendar />
                                    <span>{new Date(entry.fecha_cambio).toLocaleString()}</span>
                                </div>
                            </div>
                        )
                    }) : <p style={{ padding: '1rem' }}>No hay historial para esta rúbrica.</p>}
                </div>

                {/* --- SECCIÓN INFERIOR: Tabla de Detalles --- */}
                <div className="version-details">
                    {selectedVersion ? (
                        <div className="rubrica-view-container">
                            <div className="rubrica-header">
                                <h2>{selectedVersion.codigo}: {selectedVersion.descripcion}</h2>
                                <p style={{ marginTop: '0.5rem', color: 'var(--secondary-color)' }}>
                                    Visualizando datos de la <strong>Versión {selectedVersion.version}</strong> guardada el {new Date(selectedVersion.fecha_cambio).toLocaleDateString()}.
                                </p>
                            </div>
                            <div className="table-wrapper">
                                <table className="visual-rubrica-table">
                                    <thead>
                                        <tr>
                                            <th rowSpan="2">Criterio de Desempeño</th>
                                            <th colSpan="2">Indicador de Desempeño</th>
                                            <th colSpan={selectedVersion.estructura.niveles.length}>Descriptor</th>
                                        </tr>
                                        <tr>
                                            <th className="sub-header-num">#</th>
                                            <th className="sub-header-ind">Indicador</th>
                                            {selectedVersion.estructura.niveles.map(nivel => (
                                                <th key={nivel} className="sub-header-nivel">{nivel}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedVersion.estructura.criterios.map((criterio) => (
                                            criterio.indicadores.map((indicador, indicadorIndex) => (
                                                <tr key={`${criterio.orden}-${indicador.orden}`}>
                                                    {indicadorIndex === 0 && <td rowSpan={criterio.indicadores.length} className="criterio-cell-vertical">{criterio.nombre}</td>}
                                                    <td className="indicador-number-cell">{indicador.orden || indicadorIndex + 1}</td>
                                                    <td className="indicador-text-cell">{indicador.nombre}</td>
                                                    {selectedVersion.estructura.niveles.map(nivel => {
                                                        const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                                                        return <td key={nivelKey} className="descriptor-cell">{indicador.descriptores[nivelKey] || ''}</td>;
                                                    })}
                                                </tr>
                                            ))
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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