import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFullEncuesta, submitRespuesta, validateEncuestaInvitacion, submitRespuestaExterna } from '../api/apiService';
import '../styles/Encuesta.css';
import '../styles/Form.css';

const EncuestaResponderPage = () => {
    const { id: urlId, pin: urlPin } = useParams(); // 'id' para encuestas internas, 'pin' para externas
    const navigate = useNavigate();
    const [encuesta, setEncuesta] = useState(null);
    const [respuestas, setRespuestas] = useState({}); // { preguntaId: nombre_nivel_seleccionado }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isExternalEncuesta, setIsExternalEncuesta] = useState(false);
    const [invitacionData, setInvitacionData] = useState(null); // Datos de la invitación si es externa
    const [encuestadoData, setEncuestadoData] = useState({ // Datos que el encuestado externo ingresa
        nombre_encuestado: '',
        lugar: '',
        tipo_empresa: '',
        giro: '',
        egresados_universidad: '',
    });
    const [showEncuestadoForm, setShowEncuestadoForm] = useState(false); // Para mostrar el formulario de datos del encuestado

    useEffect(() => {
        const fetchData = async () => {
            try {
                let currentEncuesta = null;
                let currentInvitacion = null;

                if (urlPin) {
                    setIsExternalEncuesta(true);
                    const res = await validateEncuestaInvitacion(urlPin);
                    currentInvitacion = res.data.invitacion;
                    currentEncuesta = res.data.encuesta;
                    setInvitacionData(currentInvitacion);
                    // Si ya se usó la invitación, no pedir datos de nuevo
                    if (currentInvitacion.fecha_uso && currentInvitacion.usada_por) {
                        setEncuestadoData(prev => ({ ...prev, nombre_encuestado: currentInvitacion.usada_por }));
                    } else {
                        setShowEncuestadoForm(true); // Mostrar formulario para pedir nombre
                    }
                } else if (urlId) {
                    setIsExternalEncuesta(false);
                    const res = await getFullEncuesta(urlId);
                    currentEncuesta = res.data;
                } else {
                    setError("No se proporcionó ID de encuesta ni PIN de invitación.");
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
                setError("Error al cargar la encuesta o validar invitación.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [urlId, urlPin]);

    const handleRespuestaChange = (preguntaId, nombre_nivel_seleccionado) => {
        setRespuestas(prev => ({ ...prev, [preguntaId]: nombre_nivel_seleccionado }));
    };

    const handleEncuestadoDataChange = (e) => {
        const { name, value } = e.target;
        setEncuestadoData(prev => ({ ...prev, [name]: value }));
    };

    const handleEncuestadoSubmit = (e) => {
        e.preventDefault();
        if (encuestadoData.nombre_encuestado.trim()) {
            setShowEncuestadoForm(false);
        } else {
            setError('Por favor, ingresa tu nombre o el nombre de tu empresa para continuar.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const promises = [];

        if (isExternalEncuesta && showEncuestadoForm) {
            setError('Por favor, completa tus datos antes de enviar la encuesta.');
            return;
        }

        for (const preguntaId in respuestas) {
            const nombre_nivel_seleccionado = respuestas[preguntaId];
            if (!nombre_nivel_seleccionado) {
                const pregunta = encuesta.preguntas.find(p => p.id === parseInt(preguntaId));
                if (pregunta && pregunta.obligatorio) {
                    setError(`Por favor, responde a todas las preguntas obligatorias. Pregunta: "${pregunta.texto}"`);
                    return;
                }
            }
            if (isExternalEncuesta) {
                promises.push(submitRespuestaExterna({
                    id_encuesta_pregunta: parseInt(preguntaId),
                    nombre_nivel_seleccionado: nombre_nivel_seleccionado,
                    comentario: '',
                    id_invitacion: invitacionData.id,
                    nombre_encuestado: encuestadoData.nombre_encuestado,
                    lugar: encuestadoData.lugar,
                    tipo_empresa: encuestadoData.tipo_empresa,
                    giro: encuestadoData.giro,
                    egresados_universidad: encuestadoData.egresados_universidad,
                }));
            } else {
                promises.push(submitRespuesta({
                    id_encuesta_pregunta: parseInt(preguntaId),
                    nombre_nivel_seleccionado: nombre_nivel_seleccionado,
                    comentario: '',
                }));
            }
        }

        try {
            await Promise.all(promises);
            alert('Encuesta enviada con éxito');
            if (isExternalEncuesta) {
                navigate('/gracias'); // Redirigir a una página de agradecimiento para externos
            } else {
                navigate('/encuestas');
            }
        } catch (err) {
            console.error("Error al enviar respuestas", err);
            setError('Hubo un error al enviar la encuesta. Intenta de nuevo.');
        }
    };

    if (loading) return <p>Cargando encuesta...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!encuesta) return <p>No se encontró la encuesta.</p>;

    // Agrupar preguntas por el contexto de la rúbrica (criterio, indicador)
    // Esto es para mostrar las preguntas bajo su respectivo indicador
    const preguntasAgrupadas = encuesta.preguntas.reduce((acc, pregunta) => {
        const key = `${pregunta.id_resultado_aprendizaje}-${pregunta.criterio_path}-${pregunta.indicador_path}`;
        if (!acc[key]) {
            acc[key] = {
                resultado_codigo: pregunta.resultado_codigo,
                criterio_nombre: pregunta.criterio_nombre,
                indicador_nombre: pregunta.indicador_nombre,
                descriptores: pregunta.descriptores,
                niveles: pregunta.niveles,
                preguntas: []
            };
        }
        acc[key].preguntas.push(pregunta);
        return acc;
    }, {});

    if (showEncuestadoForm) {
        return (
            <div className="form-container">
                <h1>{encuesta.nombre}</h1>
                <p>{encuesta.descripcion}</p>
                <form onSubmit={handleEncuestadoSubmit} className="form">
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
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-primary">Comenzar Encuesta</button>
                </form>
            </div>
        );
    }

    return (
        <div className="encuesta-responder-container">
            <h1>{encuesta.nombre}</h1>
            <p>{encuesta.descripcion}</p>
            {isExternalEncuesta && ( // Ya no se muestra invitacionData aquí directamente
                <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '5px', marginBottom: '1rem', backgroundColor: '#f9f9f9' }}>
                    <p>Respondiendo como: <strong>{encuestadoData.nombre_encuestado || 'Invitado Externo'}</strong></p>
                    <p style={{fontSize: '0.85em'}}>
                        Lugar: {encuestadoData.lugar || 'N/A'}, Empresa: {encuestadoData.tipo_empresa || 'N/A'}, Giro: {encuestadoData.giro || 'N/A'}, Egresados: {encuestadoData.egresados_universidad || 'N/A'}
                    </p>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                {encuesta.preguntas.map(pregunta => (
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
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Encuesta'}
                </button>
            </form>
        </div>
    );
};

export default EncuestaResponderPage;
