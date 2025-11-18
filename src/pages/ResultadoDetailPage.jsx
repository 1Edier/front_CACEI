// src/pages/ResultadoDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResultadoById } from '../api/apiService';
import '../styles/Table.css';

const ResultadoDetailPage = () => {
    const { id } = useParams();
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResultado = async () => {
            try {
                const { data } = await getResultadoById(id);
                setResultado(data);
            } catch (err) {
                setError('No se pudo cargar la rúbrica.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResultado();
    }, [id]);

    if (loading) return <p>Cargando rúbrica...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!resultado) return <p>No se encontró la rúbrica.</p>;

    const { codigo, descripcion, estructura } = resultado;
    const { niveles, criterios } = estructura;

    return (
        <div>
            <Link to="/resultados" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                &larr; Volver a la lista
            </Link>
            <div className="rubrica-view-container">
                <div className="rubrica-header">
                    <h1>{codigo}: {descripcion}</h1>
                </div>

                <table className="visual-rubrica-table">
                    <thead>
                        <tr>
                            <th>Criterio de desempeño</th>
                            <th>Indicador de desempeño</th>
                            {niveles.map(nivel => (
                                <th key={nivel}>{nivel}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {criterios.map((criterio) => (
                            criterio.indicadores.map((indicador, indicadorIndex) => (
                                <tr key={`${criterio.orden}-${indicador.orden}`}>
                                    {indicadorIndex === 0 && (
                                        <td
                                            rowSpan={criterio.indicadores.length}
                                            className="criterio-cell-vertical"
                                        >
                                            {criterio.nombre}
                                        </td>
                                    )}
                                    {/* --- LÍNEA MODIFICADA --- */}
                                    {/* Se añade el número del indicador antes del nombre */}
                                    <td className="indicador-cell-visual">
                                        {indicador.orden || indicadorIndex + 1}. {indicador.nombre}
                                    </td>
                                    
                                    {niveles.map(nivel => {
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
        </div>
    );
};

export default ResultadoDetailPage;