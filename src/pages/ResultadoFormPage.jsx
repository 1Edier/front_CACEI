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

    // --- VALIDACIONES ---
    const validateRubrica = () => {
        // Validar que haya al menos un criterio
        if (formData.estructura.criterios.length === 0) {
            setError('Debes agregar al menos un criterio antes de guardar la rúbrica.');
            return false;
        }

        // Validar que cada criterio tenga nombre
        const criteriosSinNombre = formData.estructura.criterios.some(c => !c.nombre.trim());
        if (criteriosSinNombre) {
            setError('Todos los criterios deben tener un nombre.');
            return false;
        }

        // Validar que cada criterio tenga al menos un indicador
        const criteriosSinIndicadores = formData.estructura.criterios.some(c => c.indicadores.length === 0);
        if (criteriosSinIndicadores) {
            setError('Cada criterio debe tener al menos un indicador.');
            return false;
        }

        // Validar que cada indicador tenga nombre y descriptores completos
        for (let i = 0; i < formData.estructura.criterios.length; i++) {
            const criterio = formData.estructura.criterios[i];

            // Validar nombre del indicador
            const indicadoresSinNombre = criterio.indicadores.some(ind => !ind.nombre.trim());
            if (indicadoresSinNombre) {
                setError(`El criterio "${criterio.nombre}" tiene indicadores sin nombre.`);
                return false;
            }

            // Validar descriptores de cada indicador
            for (let j = 0; j < criterio.indicadores.length; j++) {
                const indicador = criterio.indicadores[j];

                // Verificar que todos los descriptores estén completos
                for (const nivel of formData.estructura.niveles) {
                    const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                    const descriptor = indicador.descriptores[nivelKey];

                    if (!descriptor || !descriptor.trim()) {
                        setError(`El indicador "${indicador.nombre}" del criterio "${criterio.nombre}" debe tener una descripción para el nivel "${nivel}".`);
                        return false;
                    }
                }
            }
        }

        return true;
    };

    // --- MANEJADOR DE ENVÍO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validar antes de enviar
        if (!validateRubrica()) {
            return;
        }

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

    // Calcular estado de validación
    const totalCriterios = formData.estructura.criterios.length;
    const criteriosValidos = formData.estructura.criterios.filter(c => {
        if (!c.nombre.trim() || c.indicadores.length === 0) return false;

        // Verificar que todos los indicadores tengan nombre y descriptores completos
        return c.indicadores.every(ind => {
            if (!ind.nombre.trim()) return false;

            // Verificar que todos los descriptores estén completos
            return formData.estructura.niveles.every(nivel => {
                const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                return ind.descriptores[nivelKey]?.trim().length > 0;
            });
        });
    }).length;
    const totalIndicadores = formData.estructura.criterios.reduce((acc, c) => acc + c.indicadores.length, 0);
    const isFormValid = totalCriterios > 0 && criteriosValidos === totalCriterios;

    return (
        <div className="form-container" style={{ maxWidth: '1200px' }}>
            <h2 className="form-title">{isEditing ? 'Editar Rúbrica' : 'Crear Nueva Rúbrica'}</h2>

            {/* Indicador de Estado */}
            {totalCriterios > 0 && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem 1.5rem',
                    backgroundColor: isFormValid ? '#D4EDDA' : '#FFF3CD',
                    border: `2px solid ${isFormValid ? '#C3E6CB' : '#FFE69C'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>
                            {isFormValid ? '✅' : '⚠️'}
                        </span>
                        <div>
                            <div style={{ fontWeight: '600', color: isFormValid ? '#155724' : '#856404' }}>
                                Estado de la Rúbrica: {isFormValid ? 'Lista para Guardar' : 'Incompleta'}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: isFormValid ? '#155724' : '#856404', marginTop: '0.25rem' }}>
                                {criteriosValidos} de {totalCriterios} criterio{totalCriterios !== 1 ? 's' : ''} completo{criteriosValidos !== 1 ? 's' : ''} • {totalIndicadores} indicador{totalIndicadores !== 1 ? 'es' : ''} en total
                            </div>
                        </div>
                    </div>
                    {!isFormValid && (
                        <div style={{ fontSize: '0.85rem', color: '#856404', textAlign: 'right' }}>
                            Completa todos los criterios con al menos un indicador
                        </div>
                    )}
                </div>
            )}

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
                                {formData.estructura.criterios.map((criterio, index) => {
                                    const hasIndicadores = criterio.indicadores.length > 0;
                                    const hasName = criterio.nombre.trim().length > 0;
                                    const isValid = hasIndicadores && hasName;

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`rubrica-tab-button ${activeCriterioIndex === index ? 'active' : ''}`}
                                            onClick={() => setActiveCriterioIndex(index)}
                                            style={{
                                                borderLeft: !isValid ? '4px solid #F56565' : '4px solid transparent'
                                            }}
                                        >
                                            <div className="tab-number">
                                                {index + 1}
                                                {!isValid && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '-4px',
                                                        right: '-4px',
                                                        width: '12px',
                                                        height: '12px',
                                                        backgroundColor: '#F56565',
                                                        borderRadius: '50%',
                                                        border: '2px solid white'
                                                    }} />
                                                )}
                                            </div>
                                            <div className="tab-info">
                                                <div className="tab-name">
                                                    {criterio.nombre || 'Sin nombre'}
                                                    {!hasName && <span style={{ color: '#F56565', marginLeft: '0.5rem' }}>⚠️</span>}
                                                </div>
                                                <div className="tab-meta" style={{ color: !hasIndicadores ? '#F56565' : undefined }}>
                                                    {criterio.indicadores.length} indicador{criterio.indicadores.length !== 1 ? 'es' : ''}
                                                    {!hasIndicadores && ' ⚠️ Requerido'}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
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

                                                        // Calcular descriptores completos
                                                        const totalNiveles = formData.estructura.niveles.length;
                                                        const descriptoresCompletos = formData.estructura.niveles.filter(nivel => {
                                                            const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                                                            return indicador.descriptores[nivelKey]?.trim().length > 0;
                                                        }).length;
                                                        const todosCompletos = descriptoresCompletos === totalNiveles;

                                                        return (
                                                            <div
                                                                key={indIndex}
                                                                className="indicador-accordion"
                                                                style={{
                                                                    border: !todosCompletos ? '2px solid #FC8181' : '1px solid #e2e8f0'
                                                                }}
                                                            >
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
                                                                        <span style={{
                                                                            marginLeft: 'auto',
                                                                            fontSize: '0.85rem',
                                                                            color: todosCompletos ? '#38A169' : '#F56565',
                                                                            fontWeight: '600'
                                                                        }}>
                                                                            {descriptoresCompletos}/{totalNiveles} niveles
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

                                                                        <h5 className="descriptores-title">
                                                                            Descriptores por Nivel
                                                                            <span style={{
                                                                                fontSize: '0.8rem',
                                                                                fontWeight: '500',
                                                                                color: '#E53E3E',
                                                                                marginLeft: '0.5rem'
                                                                            }}>
                                                                                * Todos los niveles son requeridos
                                                                            </span>
                                                                        </h5>
                                                                        <div className="descriptores-grid">
                                                                            {formData.estructura.niveles.map((nivel) => {
                                                                                const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                                                                                const hasValue = indicador.descriptores[nivelKey]?.trim().length > 0;

                                                                                return (
                                                                                    <div
                                                                                        key={nivelKey}
                                                                                        className="descriptor-item"
                                                                                        style={{
                                                                                            border: !hasValue ? '2px solid #FC8181' : '1px solid #e2e8f0',
                                                                                            position: 'relative'
                                                                                        }}
                                                                                    >
                                                                                        <label className="descriptor-label" style={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'space-between'
                                                                                        }}>
                                                                                            {nivel}
                                                                                            {hasValue ? (
                                                                                                <span style={{ fontSize: '1rem' }}>✓</span>
                                                                                            ) : (
                                                                                                <span style={{
                                                                                                    fontSize: '0.7rem',
                                                                                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                                                                                    padding: '0.2rem 0.5rem',
                                                                                                    borderRadius: '10px'
                                                                                                }}>
                                                                                                    Requerido
                                                                                                </span>
                                                                                            )}
                                                                                        </label>
                                                                                        <textarea
                                                                                            value={indicador.descriptores[nivelKey] || ''}
                                                                                            onChange={(e) => handleDescriptorChange(activeCriterioIndex, indIndex, nivelKey, e.target.value)}
                                                                                            placeholder={`Descripción para nivel ${nivel.toLowerCase()} *`}
                                                                                            rows="3"
                                                                                            style={{
                                                                                                borderColor: !hasValue ? '#FC8181' : undefined
                                                                                            }}
                                                                                        />
                                                                                        {!hasValue && (
                                                                                            <div style={{
                                                                                                position: 'absolute',
                                                                                                top: '0.5rem',
                                                                                                right: '0.5rem',
                                                                                                width: '10px',
                                                                                                height: '10px',
                                                                                                backgroundColor: '#FC8181',
                                                                                                borderRadius: '50%',
                                                                                                border: '2px solid white',
                                                                                                boxShadow: '0 0 4px rgba(252, 129, 129, 0.5)'
                                                                                            }} />
                                                                                        )}
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

                {error && (
                    <div className="form-feedback error" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                        ⚠️ {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-submit"
                    disabled={loading || formData.estructura.criterios.length === 0}
                    title={formData.estructura.criterios.length === 0 ? 'Debes agregar al menos un criterio con un indicador' : ''}
                >
                    {loading ? 'Guardando...' : 'Guardar Rúbrica'}
                </button>

                {formData.estructura.criterios.length === 0 && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#FFF3CD',
                        border: '1px solid #FFE69C',
                        borderRadius: '8px',
                        color: '#856404',
                        fontSize: '0.95rem',
                        textAlign: 'center'
                    }}>
                        💡 Recuerda: Debes agregar al menos un criterio con un indicador antes de guardar la rúbrica.
                    </div>
                )}
            </form>
        </div>
    );
};

export default ResultadoFormPage;