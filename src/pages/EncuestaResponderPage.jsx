import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getFullEncuesta, submitRespuesta, validateEncuestaInvitacion, submitFullEncuestaExterna } from '../api/apiService';
import '../styles/Encuesta.css';
import '../styles/Form.css';

const EncuestaResponderPage = () => {
    const { id: urlId, pin: urlPin } = useParams();
    const navigate = useNavigate();
    const [encuesta, setEncuesta] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isExternalEncuesta, setIsExternalEncuesta] = useState(false);
    const [invitacionData, setInvitacionData] = useState(null);
    const [encuestadoData, setEncuestadoData] = useState({
        nombre_encuestado: '',
        lugar: '',
        tipo_empresa: '',
        giro: '',
        egresados_universidad: '',
    });
    const [showEncuestadoForm, setShowEncuestadoForm] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Datos personales, 2: Encuesta

    useEffect(() => {
        const fetchData = async () => {
            try {
                let currentEncuesta = null;

                if (urlPin) {
                    setIsExternalEncuesta(true);
                    const res = await validateEncuestaInvitacion(urlPin);
                    currentEncuesta = res.data.encuesta;
                    setInvitacionData({ id_encuesta: res.data.id_encuesta_base, pin: res.data.pin });
                    setShowEncuestadoForm(true);

                } else if (urlId) {
                    setIsExternalEncuesta(false);
                    const res = await getFullEncuesta(urlId);
                    currentEncuesta = res.data;
                    setCurrentStep(2); // Skip step 1 for internal surveys
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se proporcionó ID de encuesta ni PIN de invitación.',
                        confirmButtonColor: '#3182ce',
                    });
                    setLoading(false);
                    return;
                }

                setEncuesta(currentEncuesta);
                const initialRespuestas = {};
                currentEncuesta.preguntas.forEach(pregunta => {
                    initialRespuestas[pregunta.id] = '';
                });
                setRespuestas(initialRespuestas);

            } catch (err) {
                console.error("Error al cargar la encuesta o validar invitación", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar',
                    text: 'No se pudo cargar la encuesta. Por favor, intenta de nuevo.',
                    confirmButtonColor: '#3182ce',
                });
                navigate('/error', { replace: true });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [urlId, urlPin, navigate]);

    const handleRespuestaChange = (preguntaId, nombre_nivel_seleccionado) => {
        setRespuestas(prev => ({ ...prev, [preguntaId]: nombre_nivel_seleccionado }));
    };

    const handleEncuestadoDataChange = (e) => {
        const { name, value } = e.target;

        if (name === 'egresados_universidad') {
            if (value === '') {
                setEncuestadoData(prev => ({ ...prev, [name]: '' }));
            } else {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue) && numValue > 0) {
                    setEncuestadoData(prev => ({ ...prev, [name]: numValue }));
                } else if (numValue <= 0) {
                    setEncuestadoData(prev => ({ ...prev, [name]: '' }));
                }
            }
        } else {
            setEncuestadoData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleContinueToSurvey = () => {
        // Validar datos del encuestado
        if (!encuestadoData.nombre_encuestado.trim() ||
            !encuestadoData.lugar.trim() ||
            !encuestadoData.tipo_empresa.trim() ||
            !encuestadoData.giro.trim() ||
            !encuestadoData.egresados_universidad) {

            Swal.fire({
                icon: 'warning',
                title: 'Datos incompletos',
                html: '<p style="text-align: left; margin: 1rem 0;">Por favor, completa todos los datos del encuestado:</p><ul style="text-align: left; margin: 0.5rem 0;"><li>Nombre / Empresa</li><li>Lugar</li><li>Tipo de Empresa</li><li>Giro (Actividad principal)</li><li>Número de Egresados de la Universidad (mayor a 0)</li></ul>',
                confirmButtonColor: '#3182ce',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        const egresados = parseInt(encuestadoData.egresados_universidad, 10);
        if (isNaN(egresados) || egresados <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Número de egresados inválido',
                text: 'Por favor, ingresa un número mayor a 0 en el campo de egresados.',
                confirmButtonColor: '#3182ce',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        setCurrentStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let currentIdEncuestaBase = null;

        if (isExternalEncuesta && showEncuestadoForm) {
            currentIdEncuestaBase = invitacionData?.id_encuesta;
            if (!currentIdEncuestaBase) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo obtener el ID de la encuesta base. Recarga la página.',
                    confirmButtonColor: '#f56565',
                });
                return;
            }
        }

        // Validar preguntas obligatorias
        const formattedRespuestas = [];
        for (const preguntaId in respuestas) {
            const nombre_nivel_seleccionado = respuestas[preguntaId];
            if (!nombre_nivel_seleccionado) {
                const pregunta = encuesta.preguntas.find(p => p.id === parseInt(preguntaId));
                if (pregunta && pregunta.obligatorio) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Pregunta sin responder',
                        html: `<p><strong>Por favor, responde a todas las preguntas obligatorias.</strong></p><p style="margin-top: 1rem; color: #2d3748;">"${pregunta.texto}"</p>`,
                        confirmButtonColor: '#3182ce',
                        confirmButtonText: 'Entendido',
                    });
                    return;
                }
            }
            formattedRespuestas.push({
                id_encuesta_pregunta: parseInt(preguntaId),
                nombre_nivel_seleccionado: nombre_nivel_seleccionado,
                comentario: '',
            });
        }

        try {
            if (isExternalEncuesta) {
                const fullExternalSurveyData = {
                    id_encuesta_base: currentIdEncuestaBase,
                    nombre_encuestado: encuestadoData.nombre_encuestado,
                    lugar: encuestadoData.lugar,
                    tipo_empresa: encuestadoData.tipo_empresa,
                    giro: encuestadoData.giro,
                    egresados_universidad: encuestadoData.egresados_universidad,
                    respuestas: formattedRespuestas,
                };
                await submitFullEncuestaExterna(fullExternalSurveyData);
            } else {
                const promises = formattedRespuestas.map(resp => submitRespuesta(resp));
                await Promise.all(promises);
            }

            Swal.fire({
                icon: 'success',
                title: '¡Encuesta enviada!',
                text: 'Tus respuestas han sido guardadas correctamente.',
                confirmButtonColor: '#48bb78',
                confirmButtonText: 'Continuar',
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    if (isExternalEncuesta) {
                        navigate('/gracias');
                    } else {
                        navigate('/encuestas');
                    }
                }
            });

        } catch (err) {
            console.error("Error al enviar respuestas", err);
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar',
                text: 'Hubo un problema al enviar la encuesta. Por favor, intenta de nuevo.',
                confirmButtonColor: '#f56565',
                confirmButtonText: 'Reintentar',
            });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando encuesta...</p>
            </div>
        );
    }

    if (!encuesta) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h2>Encuesta no encontrada</h2>
                <p>No se pudo cargar la encuesta solicitada.</p>
            </div>
        );
    }

    const preguntasAgrupadas = encuesta.preguntas.reduce((acc, pregunta) => {
        const key = `${pregunta.id_resultado_aprendizaje}-${pregunta.criterio_path}-${pregunta.indicador_path}`;
        if (!acc[key]) {
            acc[key] = {
                resultado_codigo: pregunta.resultado_codigo,
                criterio_nombre: pregunta.criterio_nombre,
                indicador_nombre: pregunta.indicador_nombre,
                descriptores: pregunta.descriptores,
                niveles: pregunta.niveles_desempeno,
                preguntas: []
            };
        }
        acc[key].preguntas.push(pregunta);
        return acc;
    }, {});

    const totalPreguntas = encuesta.preguntas.length;
    const preguntasRespondidas = Object.values(respuestas).filter(r => r !== '').length;
    const progresoPercentage = totalPreguntas > 0 ? (preguntasRespondidas / totalPreguntas) * 100 : 0;

    return (
        <div className="encuesta-responder-container">
            {/* Header con título y descripción */}
            <div className="encuesta-header">
                <div className="encuesta-badge">📋 Encuesta</div>
                <h1>{encuesta.nombre}</h1>
                <p className="encuesta-descripcion">{encuesta.descripcion}</p>
            </div>

            {/* Indicador de pasos */}
            {isExternalEncuesta && (
                <div className="steps-indicator">
                    <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                        <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
                        <div className="step-label">Datos Personales</div>
                    </div>
                    <div className="step-divider"></div>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Responder Encuesta</div>
                    </div>
                </div>
            )}

            {/* Paso 1: Datos del Encuestado */}
            {isExternalEncuesta && showEncuestadoForm && currentStep === 1 && (
                <div className="encuestado-form-card">
                    <div className="card-header">
                        <h2>👤 Datos del Encuestado</h2>
                        <p>Por favor, completa tus datos para comenzar la encuesta.</p>
                    </div>

                    <div className="form-grid">
                        <div className="form-group-modern">
                            <label htmlFor="nombre_encuestado">
                                <span className="label-icon">🏢</span>
                                Nombre / Empresa
                            </label>
                            <input
                                type="text"
                                id="nombre_encuestado"
                                name="nombre_encuestado"
                                value={encuestadoData.nombre_encuestado}
                                onChange={handleEncuestadoDataChange}
                                placeholder="Ej: Empresa XYZ S.A."
                                required
                            />
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="lugar">
                                <span className="label-icon">📍</span>
                                Lugar
                            </label>
                            <input
                                type="text"
                                id="lugar"
                                name="lugar"
                                value={encuestadoData.lugar}
                                onChange={handleEncuestadoDataChange}
                                placeholder="Ej: Ciudad de México"
                                required
                            />
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="tipo_empresa">
                                <span className="label-icon">🏭</span>
                                Tipo de Empresa
                            </label>
                            <input
                                type="text"
                                id="tipo_empresa"
                                name="tipo_empresa"
                                value={encuestadoData.tipo_empresa}
                                onChange={handleEncuestadoDataChange}
                                placeholder="Ej: Privada, Pública, Mixta"
                                required
                            />
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="giro">
                                <span className="label-icon">💼</span>
                                Giro (Actividad principal)
                            </label>
                            <input
                                type="text"
                                id="giro"
                                name="giro"
                                value={encuestadoData.giro}
                                onChange={handleEncuestadoDataChange}
                                placeholder="Ej: Tecnología, Manufactura"
                                required
                            />
                        </div>

                        <div className="form-group-modern full-width">
                            <label htmlFor="egresados_universidad">
                                <span className="label-icon">🎓</span>
                                Número de Egresados de la Universidad
                            </label>
                            <input
                                type="number"
                                id="egresados_universidad"
                                name="egresados_universidad"
                                value={encuestadoData.egresados_universidad}
                                onChange={handleEncuestadoDataChange}
                                min="1"
                                step="1"
                                placeholder="Ingresa un número mayor a 0"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary btn-continue"
                        onClick={handleContinueToSurvey}
                    >
                        Continuar a la Encuesta →
                    </button>
                </div>
            )}

            {/* Paso 2: Formulario de Encuesta */}
            {currentStep === 2 && (
                <>
                    {/* Barra de progreso */}
                    <div className="progress-section">
                        <div className="progress-header">
                            <span className="progress-label">
                                Progreso: {preguntasRespondidas} de {totalPreguntas} preguntas
                            </span>
                            <span className="progress-percentage">{Math.round(progresoPercentage)}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progresoPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Resumen de datos (si es encuesta externa) */}
                    {isExternalEncuesta && (
                        <div className="encuestado-summary">
                            <div className="summary-icon">✅</div>
                            <div className="summary-content">
                                <strong>Respondiendo como:</strong> {encuestadoData.nombre_encuestado}
                                <div className="summary-details">
                                    {encuestadoData.lugar} • {encuestadoData.tipo_empresa} • {encuestadoData.giro} • {encuestadoData.egresados_universidad} egresados
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="encuesta-form-modern">
                        {Object.values(preguntasAgrupadas).map((grupo, groupIndex) => (
                            <div key={groupIndex} className="pregunta-group-card">
                                {grupo.preguntas.map((pregunta, pIndex) => (
                                    <div key={pregunta.id} className="pregunta-item-modern">
                                        <div className="pregunta-header">
                                            <span className="pregunta-numero">Pregunta {groupIndex * grupo.preguntas.length + pIndex + 1}</span>
                                            {pregunta.obligatorio && <span className="badge-required">Obligatoria</span>}
                                        </div>

                                        <label className="pregunta-texto">
                                            {pregunta.texto}
                                        </label>

                                        <div className="opciones-container-modern">
                                            {pregunta.niveles_desempeno && pregunta.niveles_desempeno.map((nivelNombre, index) => (
                                                <label
                                                    key={index}
                                                    className={`opcion-radio-modern ${respuestas[pregunta.id] === nivelNombre ? 'selected' : ''}`}
                                                    htmlFor={`pregunta-${pregunta.id}-nivel-${index}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        id={`pregunta-${pregunta.id}-nivel-${index}`}
                                                        name={`pregunta-${pregunta.id}`}
                                                        value={nivelNombre}
                                                        checked={respuestas[pregunta.id] === nivelNombre}
                                                        onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                                                        required={pregunta.obligatorio}
                                                    />
                                                    <span className="radio-custom"></span>
                                                    <span className="radio-label">{nivelNombre}</span>
                                                    {respuestas[pregunta.id] === nivelNombre && (
                                                        <span className="checkmark">✓</span>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        <button type="submit" className="btn btn-primary btn-submit-modern" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <span>✓</span>
                                    Enviar Encuesta
                                </>
                            )}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default EncuestaResponderPage;
