import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEncuesta, getAllResultados, createEncuestaInvitacion } from '../api/apiService';
import { motion } from 'framer-motion';
import { FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../styles/Form.css';
import '../styles/EncuestaCreatePage.css';

const MySwal = withReactContent(Swal);

// FUNCIÓN DE AYUDA: Formatea un objeto de fecha de JS al formato 'YYYY-MM-DD' que MySQL entiende.
const formatDateForMySQL = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2); // Añade un 0 inicial si es necesario (ej: 01, 02...)
    const day = (`0${d.getDate()}`).slice(-2);      // Añade un 0 inicial si es necesario
    return `${year}-${month}-${day}`;
};

const EncuestaCreatePage = () => {
    const navigate = useNavigate();
    const [encuestaData, setEncuestaData] = useState({
        nombre: '',
        descripcion: '',
        fecha_inicio: new Date(),
        fecha_fin: new Date(),
        para_externos: true,
    });
    const [allResultados, setAllResultados] = useState([]);
    const [selectedResultados, setSelectedResultados] = useState([]);
    const [preguntas, setPreguntas] = useState([]);
    const [newPreguntaText, setNewPreguntaText] = useState('');
    const [newPreguntaContext, setNewPreguntaContext] = useState({
        id_resultado_aprendizaje: null,
        criterio_path: '',
        indicador_path: '',
        indicador_nombre: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resultadosRes = await getAllResultados();
                setAllResultados(resultadosRes.data);
            } catch (err) {
                setError('Error al cargar las rúbricas.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEncuestaChange = (e) => {
        const { name, value } = e.target;
        setEncuestaData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, fieldName) => {
        setEncuestaData(prev => ({ ...prev, [fieldName]: date }));
    };

    const handleAddPregunta = () => {
        if (newPreguntaText.trim() && newPreguntaContext.id_resultado_aprendizaje) {
            const resultadoAsociado = allResultados.find(r => r.id === newPreguntaContext.id_resultado_aprendizaje);
            let opcionesDescriptores = [];

            if (resultadoAsociado?.estructura?.niveles) {
                opcionesDescriptores = resultadoAsociado.estructura.niveles.map(nivelNombre => ({ texto: nivelNombre }));
            }

            setPreguntas(prev => [
                ...prev,
                {
                    id_resultado_aprendizaje: newPreguntaContext.id_resultado_aprendizaje,
                    criterio_path: newPreguntaContext.criterio_path,
                    indicador_path: newPreguntaContext.indicador_path,
                    texto: newPreguntaText.trim(),
                    opciones: opcionesDescriptores,
                }
            ]);
            setNewPreguntaText('');
        }
    };

    const handleResultadoToggle = (resultadoId) => {
        setSelectedResultados(prev =>
            prev.includes(resultadoId)
                ? prev.filter(id => id !== resultadoId)
                : [...prev, resultadoId]
        );
        setPreguntas(prev => prev.filter(p => p.id_resultado_aprendizaje !== resultadoId));
        if (newPreguntaContext.id_resultado_aprendizaje === resultadoId) {
            setNewPreguntaContext({ id_resultado_aprendizaje: null, criterio_path: '', indicador_path: '', indicador_nombre: '' });
            setNewPreguntaText('');
        }
    };

    const handleNewPreguntaContextChange = (id_resultado_aprendizaje, criterio_path, indicador_path, indicador_nombre) => {
        setNewPreguntaContext({ id_resultado_aprendizaje, criterio_path, indicador_path, indicador_nombre });
        setNewPreguntaText('');
    };

    const handleRemovePregunta = (indexToRemove) => {
        setPreguntas(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (preguntas.length === 0) {
            setError('Debes añadir al menos una pregunta a la encuesta.');
            return;
        }
        setLoading(true);

        // Preparamos el objeto de datos (payload) para enviar al backend
        const payload = {
            ...encuestaData,
            // AQUÍ ESTÁ LA CORRECCIÓN: formateamos las fechas antes de enviar
            fecha_inicio: formatDateForMySQL(encuestaData.fecha_inicio),
            fecha_fin: formatDateForMySQL(encuestaData.fecha_fin),
            preguntas: preguntas.map((p, index) => ({ ...p, orden: index + 1, obligatorio: true })),
        };

        try {
            const res = await createEncuesta(payload); // Enviamos el payload con las fechas corregidas
            
            if (res.data.encuesta.para_externos) {
                const invitacionRes = await createEncuestaInvitacion(res.data.encuesta.id);
                const pin = invitacionRes.data.invitacion.pin;
                const link = `${window.location.origin}/encuestas/responder/${pin}`;

                MySwal.fire({
                    title: '¡Encuesta Creada!',
                    html: `
                        <p>La encuesta externa ha sido creada exitosamente.</p>
                        <p style="margin-top: 1rem;">Comparte este enlace único con los participantes:</p>
                        <div class="swal-link-container">
                            <a href="${link}" target="_blank">${link}</a>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Copiar Enlace y Cerrar',
                    showDenyButton: true,
                    denyButtonText: 'Ir a Encuestas',
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigator.clipboard.writeText(link);
                    }
                    navigate('/encuestas');
                });
            } else {
                navigate('/encuestas');
            }
        } catch (err) {
            console.error("Error detallado al crear encuesta:", err.response?.data || err);
            setError('Error al crear la encuesta o la invitación. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };

    const resolveJsonPath = (obj, path) => {
        if (!obj || !path) return undefined;
        const parts = path.split('.').slice(1);
        let current = obj;
        for (const part of parts) {
            const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
                const [, key, index] = arrayMatch;
                current = current?.[key]?.[parseInt(index)];
            } else {
                current = current?.[part];
            }
        }
        return current;
    };

    if (loading && allResultados.length === 0) return <p>Cargando datos...</p>;
    
    return (
        <motion.div 
            className="page-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="page-header">
                <h1>Crear Nueva Encuesta</h1>
            </div>

            <form onSubmit={handleSubmit} className="form-wizard">
                {/* PASO 1: DATOS GENERALES */}
                <div className="wizard-step">
                    <div className="step-header">
                        <span className="step-number">1</span>
                        <h2>Información General de la Encuesta</h2>
                    </div>
                    <div className="form-grid">
                        <div className="form-group grid-col-span-2">
                            <label htmlFor="nombre">Nombre de la Encuesta</label>
                            <input type="text" id="nombre" name="nombre" value={encuestaData.nombre} onChange={handleEncuestaChange} required placeholder="Ej: Encuesta de Satisfacción Egresados 2025" />
                        </div>
                        <div className="form-group grid-col-span-2">
                            <label htmlFor="descripcion">Descripción</label>
                            <textarea id="descripcion" name="descripcion" value={encuestaData.descripcion} onChange={handleEncuestaChange} required placeholder="Describe el propósito de esta encuesta..."></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="fecha_inicio">Fecha de Inicio</label>
                            <div className="date-picker-wrapper">
                                <DatePicker
                                    selected={encuestaData.fecha_inicio}
                                    onChange={(date) => handleDateChange(date, 'fecha_inicio')}
                                    dateFormat="dd/MM/yyyy"
                                    className="date-picker-input"
                                    required
                                />
                                <FiCalendar className="date-picker-icon" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="fecha_fin">Fecha de Fin</label>
                             <div className="date-picker-wrapper">
                                <DatePicker
                                    selected={encuestaData.fecha_fin}
                                    onChange={(date) => handleDateChange(date, 'fecha_fin')}
                                    dateFormat="dd/MM/yyyy"
                                    className="date-picker-input"
                                    minDate={encuestaData.fecha_inicio}
                                    required
                                />
                                <FiCalendar className="date-picker-icon" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PASO 2: SELECCIONAR RÚBRICAS */}
                <div className="wizard-step">
                     <div className="step-header">
                        <span className="step-number">2</span>
                        <h2>Seleccionar Rúbricas y Añadir Preguntas</h2>
                    </div>
                    <p className="step-description">Selecciona las rúbricas y luego los indicadores específicos a los que asociarás tus preguntas.</p>
                    <div className="rubrica-selection-container">
                        {allResultados.map(resultado => (
                            <div key={resultado.id} className="rubrica-card">
                                <div className="rubrica-header" onClick={() => handleResultadoToggle(resultado.id)}>
                                    <input type="checkbox" checked={selectedResultados.includes(resultado.id)} readOnly />
                                    <label><strong>{resultado.codigo}:</strong> {resultado.descripcion}</label>
                                </div>
                                {selectedResultados.includes(resultado.id) && (
                                    <div className="indicadores-list">
                                        {resultado.estructura.criterios.map((criterio, cIndex) => (
                                            <div key={cIndex} className="criterio-group">
                                                <h4>{criterio.nombre}</h4>
                                                {criterio.indicadores.map((indicador, iIndex) => {
                                                    const criterioPath = `$.criterios[${cIndex}]`;
                                                    const indicadorPath = `$.criterios[${cIndex}].indicadores[${iIndex}]`;
                                                    const isSelected = newPreguntaContext.indicador_path === indicadorPath;
                                                    return (
                                                        <div 
                                                            key={iIndex} 
                                                            className={`indicador-item ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => handleNewPreguntaContextChange(resultado.id, criterioPath, indicadorPath, indicador.nombre)}
                                                        >
                                                            <span>{indicador.nombre}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* PASO 3: AÑADIR PREGUNTA */}
                <div className="wizard-step">
                    <div className="step-header">
                        <span className="step-number">3</span>
                        <h2>Añadir Nueva Pregunta</h2>
                    </div>
                     {newPreguntaContext.indicador_nombre ? (
                        <p className="step-description">Añadiendo pregunta para el indicador: <strong>"{newPreguntaContext.indicador_nombre}"</strong></p>
                    ) : (
                        <p className="step-description">Por favor, selecciona un indicador del paso anterior para poder añadir una pregunta.</p>
                    )}
                    <div className="add-pregunta-form">
                        <textarea
                            value={newPreguntaText}
                            onChange={(e) => setNewPreguntaText(e.target.value)}
                            placeholder="Escribe el texto de la pregunta aquí..."
                            disabled={!newPreguntaContext.indicador_path}
                            rows="4"
                        ></textarea>
                        <button type="button" onClick={handleAddPregunta} className="btn btn-secondary" disabled={!newPreguntaContext.indicador_path || !newPreguntaText.trim()}>
                            <FiPlus /> Añadir Pregunta
                        </button>
                    </div>
                </div>

                {/* PASO 4: LISTA DE PREGUNTAS */}
                <div className="wizard-step">
                    <div className="step-header">
                        <span className="step-number">4</span>
                        <h2>Preguntas de la Encuesta ({preguntas.length})</h2>
                    </div>
                    {preguntas.length === 0 ? (
                        <p className="step-description">Aún no has añadido ninguna pregunta.</p>
                    ) : (
                        <div className="preguntas-resumen-list">
                            {preguntas.map((pregunta, index) => {
                                const resultadoAsociado = allResultados.find(r => r.id === pregunta.id_resultado_aprendizaje);
                                const indicador = resultadoAsociado ? resolveJsonPath(resultadoAsociado.estructura, pregunta.indicador_path) : null;
                                return (
                                    <div key={index} className="pregunta-resumen-item">
                                        <div className="pregunta-info">
                                            <span className="pregunta-numero">{index + 1}.</span>
                                            <div className="pregunta-text-content">
                                                <p className="pregunta-texto">{pregunta.texto}</p>
                                                <p className="pregunta-contexto">
                                                    Asociada a: {resultadoAsociado?.codigo || 'N/A'} - {indicador?.nombre || 'Indicador no encontrado'}
                                                </p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => handleRemovePregunta(index)} className="btn btn-danger-outline">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {error && <p className="form-feedback error">{error}</p>}

                <div className="form-submit-container">
                    <button type="submit" className="btn btn-primary" disabled={loading || preguntas.length === 0}>
                        {loading ? 'Creando Encuesta...' : 'Finalizar y Crear Encuesta'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default EncuestaCreatePage;