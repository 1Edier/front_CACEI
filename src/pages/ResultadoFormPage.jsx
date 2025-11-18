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

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            const fetchResultado = async () => {
                try {
                    const { data } = await getResultadoById(id);
                    setFormData(data); // El estado ahora contiene toda la estructura
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
        setFormData(prev => ({
            ...prev,
            estructura: {
                ...prev.estructura,
                criterios: [
                    ...prev.estructura.criterios,
                    { nombre: '', orden: prev.estructura.criterios.length + 1, indicadores: [] }
                ]
            }
        }));
    };

    const handleCriterioChange = (index, value) => {
        const nuevosCriterios = [...formData.estructura.criterios];
        nuevosCriterios[index].nombre = value;
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));
    };

    const handleRemoveCriterio = (index) => {
        const nuevosCriterios = formData.estructura.criterios.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));
    };

    // --- MANEJADORES PARA INDICADORES ---
    const handleAddIndicador = (criterioIndex) => {
        const nuevosCriterios = [...formData.estructura.criterios];
        const indicadoresActuales = nuevosCriterios[criterioIndex].indicadores;
        
        // Crear descriptores vacíos basados en los niveles actuales
        const nuevosDescriptores = formData.estructura.niveles.reduce((acc, nivel) => {
            acc[nivel.toLowerCase().replace(/ /g, '_')] = ''; // ej: "superior_al_promedio"
            return acc;
        }, {});

        indicadoresActuales.push({
            nombre: '',
            orden: indicadoresActuales.length + 1,
            descriptores: nuevosDescriptores,
        });
        setFormData(prev => ({ ...prev, estructura: { ...prev.estructura, criterios: nuevosCriterios } }));
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

    return (
        <div className="form-container" style={{ maxWidth: '900px' }}>
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

                {/* --- CONSTRUCTOR DE RÚBRICA --- */}
                <div className="rubrica-builder">
                    <h3>Criterios de Evaluación</h3>
                    {formData.estructura.criterios.map((criterio, critIndex) => (
                        <div key={critIndex} className="criterio-card">
                            <div className="criterio-header">
                                <strong>Criterio {critIndex + 1}</strong>
                                <button type="button" className="btn btn-sm btn-danger-outline" onClick={() => handleRemoveCriterio(critIndex)}>Eliminar Criterio</button>
                            </div>
                            <div className="form-group">
                                <label>Nombre del Criterio</label>
                                <input type="text" value={criterio.nombre} onChange={(e) => handleCriterioChange(critIndex, e.target.value)} required />
                            </div>
                            
                            {/* --- INDICADORES --- */}
                            <h4>Indicadores</h4>
                            {criterio.indicadores.map((indicador, indIndex) => (
                                <div key={indIndex} className="indicador-card">
                                    <div className="indicador-header">
                                        <strong>Indicador {indIndex + 1}</strong>
                                        <button type="button" className="btn btn-sm btn-danger-outline" onClick={() => handleRemoveIndicador(critIndex, indIndex)}>Eliminar Indicador</button>
                                    </div>
                                    <div className="form-group">
                                        <label>Nombre del Indicador</label>
                                        <input type="text" value={indicador.nombre} onChange={(e) => handleIndicadorChange(critIndex, indIndex, 'nombre', e.target.value)} required />
                                    </div>

                                    {/* --- DESCRIPTORES --- */}
                                    <h5>Descriptores por Nivel</h5>
                                    {formData.estructura.niveles.map((nivel) => {
                                        const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                                        return (
                                            <div key={nivelKey} className="form-group">
                                                <label>{nivel}</label>
                                                <textarea value={indicador.descriptores[nivelKey] || ''} onChange={(e) => handleDescriptorChange(critIndex, indIndex, nivelKey, e.target.value)} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                            <div className="add-btn-container">
                                <button type="button" className="btn btn-secondary" onClick={() => handleAddIndicador(critIndex)}>+ Añadir Indicador</button>
                            </div>
                        </div>
                    ))}
                    <div className="add-btn-container">
                        <button type="button" className="btn" onClick={handleAddCriterio}>+ Añadir Criterio</button>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '2rem' }}>
                    {loading ? 'Guardando...' : 'Guardar Rúbrica'}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default ResultadoFormPage;