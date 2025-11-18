import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFullEncuesta, submitRespuesta } from '../api/apiService';
import '../styles/Encuesta.css';
import '../styles/Form.css';

const EncuestaResponderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [encuesta, setEncuesta] = useState(null);
    const [respuestasItems, setRespuestasItems] = useState({}); // Respuestas para ítems de rúbrica
    const [respuestasPreguntas, setRespuestasPreguntas] = useState({}); // Respuestas para preguntas abiertas
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEncuesta = async () => {
            try {
                const { data } = await getFullEncuesta(id);
                setEncuesta(data);
                // Inicializar respuestas de preguntas si existen
                const initialPreguntaRespuestas = {};
                data.preguntas.forEach(pregunta => {
                    initialPreguntaRespuestas[pregunta.id] = '';
                });
                setRespuestasPreguntas(initialPreguntaRespuestas);
            } catch (error) {
                console.error("Error al cargar la encuesta", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEncuesta();
    }, [id]);

    const handleRespuestaItemChange = (itemId, nivel) => {
        setRespuestasItems(prev => ({ ...prev, [itemId]: nivel }));
    };

    const handleRespuestaPreguntaChange = (preguntaId, texto) => {
        setRespuestasPreguntas(prev => ({ ...prev, [preguntaId]: texto }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const promises = [];

        // Enviar respuestas de ítems de rúbrica
        Object.entries(respuestasItems).forEach(([itemId, nivel]) => {
            promises.push(submitRespuesta({
                id_encuesta_item: parseInt(itemId),
                nivel_seleccionado: nivel,
                comentario: '', // Puedes agregar un campo de comentario si quieres
            }));
        });

        // TODO: Enviar respuestas de preguntas abiertas.
        // Esto requerirá una nueva función en apiService y en el backend
        // para guardar las respuestas de las preguntas.
        // Por ahora, solo se enviarán las respuestas de los ítems.
        console.log("Respuestas de preguntas a enviar:", respuestasPreguntas);

        try {
            await Promise.all(promises);
            alert('Encuesta enviada con éxito');
            navigate('/encuestas');
        } catch (error) {
            console.error("Error al enviar respuestas", error);
            alert('Hubo un error al enviar la encuesta.');
        }
    };

    if (loading) return <p>Cargando encuesta...</p>;
    if (!encuesta) return <p>No se encontró la encuesta.</p>;

    // Agrupar preguntas por indicador para facilitar el renderizado
    const preguntasPorIndicador = encuesta.preguntas.reduce((acc, pregunta) => {
        const key = `${pregunta.id_resultado_aprendizaje}-${pregunta.criterio_path}-${pregunta.indicador_path}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(pregunta);
        return acc;
    }, {});

    return (
        <div>
            <h1>{encuesta.nombre}</h1>
            <p>{encuesta.descripcion}</p>
            <form onSubmit={handleSubmit}>
                {encuesta.items.map(item => {
                    const indicadorKey = `${item.id_resultado_aprendizaje}-${item.criterio_path}-${item.indicador_path}`;
                    const preguntasAsociadas = preguntasPorIndicador[indicadorKey] || [];

                    return (
                        <div key={item.id} className="encuesta-item">
                            <h3 className="criterio-title">{item.criterio_nombre}</h3>
                            <p className="indicador-title">{item.indicador_nombre}</p>
                            <div className="niveles-container">
                                {Object.entries(item.descriptores).map(([nivel, descripcion]) => (
                                    <div key={nivel} className="nivel-option">
                                        <input
                                            type="radio"
                                            id={`item-${item.id}-nivel-${nivel}`}
                                            name={`item-${item.id}`}
                                            value={nivel}
                                            onChange={() => handleRespuestaItemChange(item.id, nivel)}
                                            required={item.obligatorio}
                                        />
                                        <div>
                                            <label htmlFor={`item-${item.id}-nivel-${nivel}`}>{nivel}</label>
                                            <p>{descripcion}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {preguntasAsociadas.length > 0 && (
                                <div className="preguntas-asociadas-container" style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                    <h4>Preguntas Adicionales para este Indicador:</h4>
                                    {preguntasAsociadas.map(pregunta => (
                                        <div key={pregunta.id} className="pregunta-item-responder" style={{ marginBottom: '1rem' }}>
                                            <label htmlFor={`pregunta-${pregunta.id}`}>{pregunta.texto}</label>
                                            <textarea
                                                id={`pregunta-${pregunta.id}`}
                                                value={respuestasPreguntas[pregunta.id] || ''}
                                                onChange={(e) => handleRespuestaPreguntaChange(pregunta.id, e.target.value)}
                                                required={pregunta.obligatorio}
                                                rows="3"
                                                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            ></textarea>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
                <button type="submit" className="btn btn-primary" style={{marginTop: '2rem'}}>Enviar Encuesta</button>
            </form>
        </div>
    );
};

export default EncuestaResponderPage;
