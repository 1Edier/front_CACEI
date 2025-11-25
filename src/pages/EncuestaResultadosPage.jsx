import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFullEncuesta, getEncuestaResultados } from '../api/apiService'; // Eliminado getAllNivelesDesempeno
import { FiArrowLeft } from 'react-icons/fi';
import '../styles/Table.css';
import '../styles/Encuesta.css'; // Reutilizamos algunos estilos de encuesta

const EncuestaResultadosPage = () => {
    const { id } = useParams();
    const [encuesta, setEncuesta] = useState(null);
    const [resultados, setResultados] = useState([]);
    // const [nivelesDesempenoMap, setNivelesDesempenoMap] = useState({}); // Eliminado: los niveles ahora vienen por nombre
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [encuestaRes, resultadosRes] = await Promise.all([ // Ya no se carga getAllNivelesDesempeno
                    getFullEncuesta(id),
                    getEncuestaResultados(id),
                ]);

                setEncuesta(encuestaRes.data);
                setResultados(resultadosRes.data);

                // Crear un mapa de niveles de desempeño para fácil acceso (ya no es necesario si el backend envía el nombre)
                // const nivelesMap = nivelesRes.data.reduce((acc, nivel) => {
                //     acc[nivel.id] = nivel;
                //     return acc;
                // }, {});
                // setNivelesDesempenoMap(nivelesMap);
                
            } catch (err) {
                setError('Error al cargar los resultados de la encuesta.'); // Mensaje de error actualizado
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <p>Cargando resultados de la encuesta...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!encuesta) return <p>No se encontró la encuesta.</p>;

    // Agrupar respuestas por pregunta
    const groupedResults = resultados.reduce((acc, respuesta) => {
        const preguntaId = respuesta.id_encuesta_pregunta;
        if (!acc[preguntaId]) {
            acc[preguntaId] = {
                respuestas: []
            };
        }
        acc[preguntaId].respuestas.push(respuesta);
        return acc;
    }, {});

    // Agrupar preguntas de la encuesta por indicador para el renderizado
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

    return (
        <div className="page-container">
            <Link to="/encuestas" className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                <FiArrowLeft /> Volver a la lista de encuestas
            </Link>
            <div className="encuesta-resultados-container">
                <div className="encuesta-header">
                    <h1>Resultados de Encuesta: {encuesta.nombre}</h1>
                    <p>{encuesta.descripcion}</p>
                </div>

                <h2>Preguntas y Respuestas</h2>

                {encuesta.preguntas.length === 0 ? (
                    <p>No hay preguntas en esta encuesta para mostrar resultados.</p>
                ) : (
                    <div className="resultados-preguntas-list">
                        {encuesta.preguntas.map(pregunta => {
                            const preguntaResults = groupedResults[pregunta.id] || { respuestas: [] };
                            
                            return (
                                <div key={pregunta.id} className="pregunta-resultados-item" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                                    <h4>Pregunta: {pregunta.texto}</h4>
                                    
                                    {preguntaResults.respuestas.length > 0 ? (
                                        <div className="respuestas-individuales">
                                            <h5>Respuestas Individuales:</h5>
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Encuestado</th>
                                                        <th>Nivel Seleccionado</th>
                                                        <th>Comentario</th>
                                                        <th>Lugar</th>
                                                        <th>Tipo Empresa</th>
                                                        <th>Giro</th>
                                                        <th>Egresados Uni</th>
                                                        <th>Fecha</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preguntaResults.respuestas.map((r, idx) => (
                                                        <tr key={idx}>
                                                            <td>{r.usuario_nombre || r.usuario || r.invitacion_pin ? `Invitado (${r.invitacion_pin})` : 'Anónimo'}</td>
                                                            <td>{r.nombre_nivel_seleccionado}</td>
                                                            <td>{r.comentario || '-'}</td>
                                                            <td>{r.lugar || '-'}</td>
                                                            <td>{r.tipo_empresa || '-'}</td>
                                                            <td>{r.giro || '-'}</td>
                                                            <td>{r.egresados_universidad || '-'}</td>
                                                            <td>{new Date(r.fecha_respuesta).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p>No hay respuestas aún para esta pregunta.</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EncuestaResultadosPage;
