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

    useEffect(() => {
        const fetchData = async () => {
            try {
                let currentEncuesta = null;
                let currentInvitacion = null;

                if (urlPin) {
                    setIsExternalEncuesta(true);
                    const res = await validateEncuestaInvitacion(urlPin);
                    // El backend ahora devuelve id_encuesta_base y pin (base), no una nueva invitación.
                    currentEncuesta = res.data.encuesta;
                    // Guardar el id_encuesta_base para usarlo al momento de enviar el formulario
                    setInvitacionData({ id_encuesta: res.data.id_encuesta_base, pin: res.data.pin });
                    setShowEncuestadoForm(true);

                } else if (urlId) {
                    setIsExternalEncuesta(false);
                    const res = await getFullEncuesta(urlId);
                    currentEncuesta = res.data;
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
                navigate('/error', { replace: true }); // Redirigir a una página de error o al inicio
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [urlId, urlPin, navigate]); // Añadir navigate a las dependencias del useEffect

    const handleRespuestaChange = (preguntaId, nombre_nivel_seleccionado) => {
        setRespuestas(prev => ({ ...prev, [preguntaId]: nombre_nivel_seleccionado }));
    };

    const handleEncuestadoDataChange = (e) => {
        const { name, value } = e.target;
        
        // Validación especial para egresados_universidad
        if (name === 'egresados_universidad') {
            // Solo permitir números positivos
            if (value === '') {
                setEncuestadoData(prev => ({ ...prev, [name]: '' }));
            } else {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue) && numValue > 0) {
                    setEncuestadoData(prev => ({ ...prev, [name]: numValue }));
                } else if (numValue <= 0) { // Permitir limpiar el campo o corregir valores negativos/cero
                    setEncuestadoData(prev => ({ ...prev, [name]: '' }));
                }
            }
        } else {
            setEncuestadoData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const promises = [];

        let currentIdEncuestaBase = null;

        // Validar datos del encuestado si es una encuesta externa
        if (isExternalEncuesta && showEncuestadoForm) {
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

            // Validar que egresados sea un número positivo
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
            
            // Si es encuesta externa, necesitamos el id_encuesta_base del estado
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
                comentario: '', // Si hay un campo de comentario, se debería recoger aquí
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
                // Para encuestas internas, se sigue el flujo original de una promesa por respuesta
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p>Cargando encuesta...</p>
            </div>
        );
    }

    if (!encuesta) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p>No se encontró la encuesta.</p>
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

    return (
        <div className="encuesta-responder-container">
            <h1>{encuesta.nombre}</h1>
            <p>{encuesta.descripcion}</p>
            {isExternalEncuesta && (
                <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '5px', marginBottom: '1rem', backgroundColor: '#f9f9f9' }}>
                    <p>Respondiendo como: <strong>{encuestadoData.nombre_encuestado || 'Invitado Externo'}</strong></p>
                    <p style={{fontSize: '0.85em'}}>
                        Lugar: {encuestadoData.lugar || 'N/A'}, Empresa: {encuestadoData.tipo_empresa || 'N/A'}, Giro: {encuestadoData.giro || 'N/A'}, Egresados: {encuestadoData.egresados_universidad || 'N/A'}
                    </p>
                </div>
            )}
            
            {isExternalEncuesta && showEncuestadoForm && (
                <div className="form-container" style={{marginBottom: '2rem'}}>
                    <h2>Datos del Encuestado</h2>
                    <p>Por favor, ingresa tus datos para comenzar la encuesta.</p>
                    <div className="form-group">
                        <label htmlFor="nombre_encuestado">Nombre / Empresa</label>
                        <input
                            type="text"
                            id="nombre_encuestado"
                            name="nombre_encuestado"
                            value={encuestadoData.nombre_encuestado}
                            onChange={handleEncuestadoDataChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lugar">Lugar</label>
                        <input
                            type="text"
                            id="lugar"
                            name="lugar"
                            value={encuestadoData.lugar}
                            onChange={handleEncuestadoDataChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tipo_empresa">Tipo de Empresa</label>
                        <input
                            type="text"
                            id="tipo_empresa"
                            name="tipo_empresa"
                            value={encuestadoData.tipo_empresa}
                            onChange={handleEncuestadoDataChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="giro">Giro (Actividad principal)</label>
                        <input
                            type="text"
                            id="giro"
                            name="giro"
                            value={encuestadoData.giro}
                            onChange={handleEncuestadoDataChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="egresados_universidad">Número de Egresados de la Universidad</label>
                        <input
                            type="number"
                            id="egresados_universidad"
                            name="egresados_universidad"
                            value={encuestadoData.egresados_universidad}
                            onChange={handleEncuestadoDataChange}
                            min="1"
                            step="1"
                            required
                        />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {Object.values(preguntasAgrupadas).map((grupo, groupIndex) => (
                    <div key={groupIndex} className="encuesta-group">
                        {grupo.preguntas.map(pregunta => (
                            <div key={pregunta.id} className="pregunta-item-responder">
                                <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                                    {pregunta.texto} {pregunta.obligatorio && <span style={{ color: 'red' }}>*</span>}
                                </label>
                                <div className="opciones-pregunta-container">
                                    {pregunta.niveles_desempeno && pregunta.niveles_desempeno.map((nivelNombre, index) => (
                                        <div key={index} className="opcion-radio-item">
                                            <input
                                                type="radio"
                                                id={`pregunta-${pregunta.id}-nivel-${index}`}
                                                name={`pregunta-${pregunta.id}`}
                                                value={nivelNombre}
                                                checked={respuestas[pregunta.id] === nivelNombre}
                                                onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                                                required={pregunta.obligatorio}
                                            />
                                            <label htmlFor={`pregunta-${pregunta.id}-nivel-${index}`}>{nivelNombre}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Encuesta'}
                </button>
            </form>
        </div>
    );
};

export default EncuestaResponderPage;
