// src/pages/ResultadoFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResultadoById, createResultado, updateResultado } from '../api/apiService';
import '../styles/Form.css';

// Estructura inicial para una nueva rúbrica
const initialState = {
    codigo: '',
    descripcion: '',
    estructura: {
        niveles: ['Poco', 'Debajo del promedio', 'Promedio', 'Superior al promedio', 'Excelente'],
        criterios: [],
    },
};

const ResultadoFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estados para navegación y UI mejorada
    const [activeCriterioIndex, setActiveCriterioIndex] = useState(0);
    const [expandedIndicadores, setExpandedIndicadores] = useState({});

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            const fetchResultado = async () => {
                try {
                    const { data } = await getResultadoById(id);
                    setFormData(data);
                } catch (err) {
                    setError('No se pudo cargar la rúbrica.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchResultado();
        }
    }, [id, isEditing]);

    // --- MANEJADORES DE CAMBIOS GENERALES ---
    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNivelesChange = (e) => {
        const nuevosNiveles = e.target.value.split(',').map(n => n.trim());
        setFormData(prev => ({
            ...prev,
            estructura: { ...prev.estructura, niveles: nuevosNiveles }
        }));
    };

    // --- MANEJADORES PARA CRITERIOS ---
    const handleAddCriterio = () => {
        const newIndex = formData.estructura.criterios.length;
        setFormData(prev => ({
            ...prev,
            estructura: {
                ...prev.estructura,
                criterios: [
                    ...prev.estructura.criterios,
                    { nombre: '', orden: newIndex + 1, indicadores: [] }
                ]
            }
        }));
        setActiveCriterioIndex(newIndex);
    };

    const handleCriterioChange = (index, value) => {
        const nuevosCriterios = [...formData.estructura.criterios];
        nuevosCriterios[index].nombre = value;
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));
    };

    const handleRemoveCriterio = (index) => {
        const nuevosCriterios = formData.estructura.criterios.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));
        if (activeCriterioIndex >= nuevosCriterios.length) {
            setActiveCriterioIndex(Math.max(0, nuevosCriterios.length - 1));
        }
    };

    // --- MANEJADORES PARA INDICADORES ---
    const handleAddIndicador = (criterioIndex) => {
        const nuevosCriterios = [...formData.estructura.criterios];
        const indicadoresActuales = nuevosCriterios[criterioIndex].indicadores;

        const nuevosDescriptores = formData.estructura.niveles.reduce((acc, nivel) => {
            acc[nivel.toLowerCase().replace(/ /g, '_')] = '';
            return acc;
        }, {});

        const newIndicadorIndex = indicadoresActuales.length;
        indicadoresActuales.push({
            nombre: '',
            orden: newIndicadorIndex + 1,
            descriptores: nuevosDescriptores,
        });
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));

        // Auto-expandir el nuevo indicador
        setExpandedIndicadores(prev => ({
            ...prev,
            [`${criterioIndex}-${newIndicadorIndex}`]: true
        }));
    };

    const handleIndicadorChange = (criterioIndex, indicadorIndex, field, value) => {
        const nuevosCriterios = [...formData.estructura.criterios];
        nuevosCriterios[criterioIndex].indicadores[indicadorIndex][field] = value;
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));
    };

    const handleDescriptorChange = (criterioIndex, indicadorIndex, nivelKey, value) => {
        const nuevosCriterios = [...formData.estructura.criterios];
        nuevosCriterios[criterioIndex].indicadores[indicadorIndex].descriptores[nivelKey] = value;
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));
    };

    const handleRemoveIndicador = (criterioIndex, indicadorIndex) => {
        const nuevosCriterios = [...formData.estructura.criterios];
        nuevosCriterios[criterioIndex].indicadores = nuevosCriterios[criterioIndex].indicadores.filter((_, i) => i !== indicadorIndex);
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));
    };

    const toggleIndicador = (criterioIndex, indicadorIndex) => {
        const key = `${criterioIndex}-${indicadorIndex}`;
        setExpandedIndicadores(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // --- NAVEGACIÓN ---
    const goToPreviousCriterio = () => {
        if (activeCriterioIndex > 0) {
            setActiveCriterioIndex(activeCriterioIndex - 1);
        }
    };

    const goToNextCriterio = () => {
        if (activeCriterioIndex < formData.estructura.criterios.length - 1) {
            setActiveCriterioIndex(activeCriterioIndex + 1);
        }
    };

    // --- MANEJADOR DE ENVÍO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isEditing) {
                await updateResultado(id, formData);
            } else {
                await createResultado(formData);
            }
            navigate('/resultados');
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al guardar la rúbrica.');
            console.error("Error de API:", err.response);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Cargando datos de la rúbrica...</p>;

    const activeCriterio = formData.estructura.criterios[activeCriterioIndex];

    return (
        <div className="form-container" style={{ maxWidth: '1200px' }}>
            <h2 className="form-title">{isEditing ? 'Editar Rúbrica' : 'Crear Nueva Rúbrica'}</h2>
            <form onSubmit={handleSubmit}>
                {/* --- DATOS GENERALES --- */}
                <div className="form-group">
                    <label htmlFor="codigo">Código</label>
                    <input type="text" id="codigo" name="codigo" value={formData.codigo} onChange={handleGeneralChange} required maxLength="20" />
                </div>
                <div className="form-group">
                    <label htmlFor="descripcion">Descripción General</label>
                    <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleGeneralChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="niveles">Niveles de Desempeño (separados por coma)</label>
                    <input type="text" id="niveles" name="niveles" value={formData.estructura.niveles.join(', ')} onChange={handleNivelesChange} required />
                </div>

                {/* --- CONSTRUCTOR DE RÚBRICA CON PESTAÑAS --- */}
                <div className="rubrica-builder">
                    <div className="rubrica-builder-header">
                        <h3>Criterios de Evaluación</h3>
                        <button type="button" className="btn btn-add-criterio" onClick={handleAddCriterio}>
                            ➕ Añadir Criterio
                        </button>
                    </div>

                    {formData.estructura.criterios.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay criterios aún. Haz clic en "Añadir Criterio" para comenzar.</p>
                        </div>
                    ) : (
                        <div className="rubrica-tabs-container">
                            {/* Panel Lateral de Navegación */}
                            <div className="rubrica-sidebar">
                                <div className="sidebar-title">Criterios</div>
                                {formData.estructura.criterios.map((criterio, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`rubrica-tab-button ${activeCriterioIndex === index ? 'active' : ''}`}
                                        onClick={() => setActiveCriterioIndex(index)}
                                    >
                                        <div className="tab-number">{index + 1}</div>
                                        <div className="tab-info">
                                            <div className="tab-name">{criterio.nombre || 'Sin nombre'}</div>
                                            <div className="tab-meta">{criterio.indicadores.length} indicador{criterio.indicadores.length !== 1 ? 'es' : ''}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Contenido del Criterio Activo */}
                            <div className="rubrica-content">
                                {activeCriterio && (
                                    <div className="criterio-active-card">
                                        <div className="criterio-header-modern">
                                            <div className="criterio-title-section">
                                                <span className="criterio-badge">Criterio {activeCriterioIndex + 1}</span>
                                                <h4>Configuración del Criterio</h4>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger-outline"
                                                onClick={() => handleRemoveCriterio(activeCriterioIndex)}
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>

                                        <div className="form-group">
                                            <label>Nombre del Criterio</label>
                                            <input
                                                type="text"
                                                value={activeCriterio.nombre}
                                                onChange={(e) => handleCriterioChange(activeCriterioIndex, e.target.value)}
                                                placeholder="Ej: Comunicación efectiva"
                                                required
                                            />
                                        </div>

                                        {/* Indicadores con Acordeones */}
                                        <div className="indicadores-section">
                                            <div className="section-header">
                                                <h4>Indicadores ({activeCriterio.indicadores.length})</h4>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleAddIndicador(activeCriterioIndex)}
                                                >
                                                    ➕ Añadir Indicador
                                                </button>
                                            </div>

                                            {activeCriterio.indicadores.length === 0 ? (
                                                <div className="empty-state-small">
                                                    <p>No hay indicadores. Añade uno para comenzar.</p>
                                                </div>
                                            ) : (
                                                <div className="indicadores-list">
                                                    {activeCriterio.indicadores.map((indicador, indIndex) => {
                                                        const isExpanded = expandedIndicadores[`${activeCriterioIndex}-${indIndex}`];
                                                        return (
                                                            <div key={indIndex} className="indicador-accordion">
                                                                <div className="indicador-accordion-header">
                                                                    <button
                                                                        type="button"
                                                                        className="accordion-toggle"
                                                                        onClick={() => toggleIndicador(activeCriterioIndex, indIndex)}
                                                                    >
                                                                        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
                                                                        <span className="indicador-number">Indicador {indIndex + 1}</span>
                                                                        <span className="indicador-name-preview">
                                                                            {indicador.nombre || 'Sin nombre'}
                                                                        </span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger-outline"
                                                                        onClick={() => handleRemoveIndicador(activeCriterioIndex, indIndex)}
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>

                                                                {isExpanded && (
                                                                    <div className="indicador-accordion-content">
                                                                        <div className="form-group">
                                                                            <label>Nombre del Indicador</label>
                                                                            <input
                                                                                type="text"
                                                                                value={indicador.nombre}
                                                                                onChange={(e) => handleIndicadorChange(activeCriterioIndex, indIndex, 'nombre', e.target.value)}
                                                                                placeholder="Ej: Claridad en la expresión oral"
                                                                                required
                                                                            />
                                                                        </div>

                                                                        <h5 className="descriptores-title">Descriptores por Nivel</h5>
                                                                        <div className="descriptores-grid">
                                                                            {formData.estructura.niveles.map((nivel) => {
                                                                                const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                                                                                return (
                                                                                    <div key={nivelKey} className="descriptor-item">
                                                                                        <label className="descriptor-label">{nivel}</label>
                                                                                        <textarea
                                                                                            value={indicador.descriptores[nivelKey] || ''}
                                                                                            onChange={(e) => handleDescriptorChange(activeCriterioIndex, indIndex, nivelKey, e.target.value)}
                                                                                            placeholder={`Descripción para nivel ${nivel.toLowerCase()}`}
                                                                                            rows="3"
                                                                                        />
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Botones de Navegación */}
                                        <div className="navigation-buttons">
                                            <button
                                                type="button"
                                                className="btn btn-nav"
                                                onClick={goToPreviousCriterio}
                                                disabled={activeCriterioIndex === 0}
                                            >
                                                ← Anterior
                                            </button>
                                            <span className="nav-indicator">
                                                {activeCriterioIndex + 1} de {formData.estructura.criterios.length}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-nav"
                                                onClick={goToNextCriterio}
                                                disabled={activeCriterioIndex === formData.estructura.criterios.length - 1}
                                            >
                                                Siguiente →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Rúbrica'}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default ResultadoFormPage;