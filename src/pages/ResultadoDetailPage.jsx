// src/pages/ResultadoDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResultadoById } from '../api/apiService';
import { FiArrowLeft } from 'react-icons/fi';
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
        <div className="page-container">
            <Link to="/resultados" className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                <FiArrowLeft /> Volver a la lista
            </Link>
            <div className="rubrica-view-container">
                <div className="rubrica-header">
                    <h1>{codigo}: {descripcion}</h1>
                </div>

                <div className="table-wrapper">
                    <table className="visual-rubrica-table">
                        <thead>
                            <tr>
                                <th rowSpan="2">Criterio de Desempeño</th>
                                {/* ==== CAMBIO 1: La cabecera ahora abarca 2 columnas ==== */}
                                <th colSpan="2">Indicador de Desempeño</th> 
                                {/* ==== CAMBIO 2: La cabecera "Descriptor" abarca los 5 niveles ==== */}
                                <th colSpan={niveles.length}>Descriptor</th>
                            </tr>
                            <tr>
                                {/* ==== CAMBIO 3: Fila de cabecera secundaria para los niveles ==== */}
                                <th className="sub-header-num">#</th>
                                <th className="sub-header-ind">Indicador</th>
                                {niveles.map(nivel => (
                                    <th key={nivel} className="sub-header-nivel">{nivel}</th>
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
                                        
                                        {/* ======================================================= */}
                                        {/* ==== CAMBIO 4: Celda dividida en dos <td> separadas ==== */}
                                        {/* ======================================================= */}
                                        <td className="indicador-number-cell">
                                            {indicador.orden || indicadorIndex + 1}
                                        </td>
                                        <td className="indicador-text-cell">
                                            {indicador.nombre}
                                        </td>
                                        
                                        {niveles.map(nivel => {
                                            const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                                            return (
                                                <td key={nivelKey} className="descriptor-cell">{indicador.descriptores[nivelKey] || ''}</td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResultadoDetailPage;