import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEncuesta, getAllResultados, createEncuestaInvitacion } from '../api/apiService';
import '../styles/Form.css'; // Estilos para formularios
import '../styles/Table.css'; // Estilos para tablas, si se usan para mostrar rúbricas

const EncuestaCreatePage = () => {
    const navigate = useNavigate();
    const [encuestaData, setEncuestaData] = useState({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        para_externos: false, // Nuevo campo para_externos
    });
    // const [invitacionData, setInvitacionData] = useState({ // Eliminado: los datos de invitación los llena el encuestado
    //     lugar: '',
    //     tipo_empresa: '',
    //     giro: '',
    //     egresados_universidad: '',
    // });
    const [generatedLink, setGeneratedLink] = useState(''); // Nuevo estado para el link/PIN generado

    const [allResultados, setAllResultados] = useState([]);
    const [selectedResultados, setSelectedResultados] = useState([]); // IDs de resultados seleccionados
    const [preguntas, setPreguntas] = useState([]); // Lista de preguntas a enviar
    const [newPreguntaText, setNewPreguntaText] = useState(''); // Texto de la nueva pregunta
    const [newPreguntaContext, setNewPreguntaContext] = useState({ // Contexto para la nueva pregunta
        id_resultado_aprendizaje: null,
        criterio_path: '',
        indicador_path: '',
        indicador_nombre: '' // Para mostrar en el UI
    });
    // const [nivelesDesempeno, setNivelesDesempeno] = useState([]); // Eliminado: los niveles ahora vienen de la estructura
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resultadosRes = await getAllResultados(); // Ya no se carga getAllNivelesDesempeno
                setAllResultados(resultadosRes.data);
                // setNivelesDesempeno(nivelesRes.data); // Eliminado
            } catch (err) {
                setError('Error al cargar datos necesarios (resultados de aprendizaje).'); // Mensaje de error actualizado
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEncuestaChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEncuestaData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // const handleInvitacionChange = (e) => { // Eliminado
    //     const { name, value } = e.target;
    //     setInvitacionData(prev => ({ ...prev, [name]: value }));
    // };

    const handleResultadoToggle = (resultadoId) => {
        setSelectedResultados(prev =>
            prev.includes(resultadoId)
                ? prev.filter(id => id !== resultadoId)
                : [...prev, resultadoId]
        );
        // Limpiar preguntas asociadas a este resultado si se deselecciona
        setPreguntas(prev => prev.filter(p => p.id_resultado_aprendizaje !== resultadoId));
        // Resetear contexto si se deselecciona el resultado actualmente seleccionado para la pregunta
        if (newPreguntaContext.id_resultado_aprendizaje === resultadoId) {
            setNewPreguntaContext({
                id_resultado_aprendizaje: null,
                criterio_path: '',
                indicador_path: '',
                indicador_nombre: ''
            });
            setNewPreguntaText('');
        }
    };

    const handleNewPreguntaContextChange = (id_resultado_aprendizaje, criterio_path, indicador_path, indicador_nombre) => {
        setNewPreguntaContext({
            id_resultado_aprendizaje,
            criterio_path,
            indicador_path,
            indicador_nombre
        });
        setNewPreguntaText(''); // Limpiar texto al cambiar el contexto
    };

    const handleAddPregunta = () => {
        if (newPreguntaText.trim() && newPreguntaContext.id_resultado_aprendizaje && newPreguntaContext.criterio_path && newPreguntaContext.indicador_path) {
            const resultadoAsociado = allResultados.find(r => r.id === newPreguntaContext.id_resultado_aprendizaje);
            let opcionesDescriptores = [];
            if (resultadoAsociado) {
                const indicador = resolveJsonPath(resultadoAsociado.estructura, newPreguntaContext.indicador_path);
                if (indicador && indicador.descriptores) {
                    opcionesDescriptores = Object.keys(indicador.descriptores).map(nivelNombre => ({ texto: nivelNombre }));
                }
            }

            setPreguntas(prev => [
                ...prev,
                {
                    id_resultado_aprendizaje: newPreguntaContext.id_resultado_aprendizaje,
                    criterio_path: newPreguntaContext.criterio_path,
                    indicador_path: newPreguntaContext.indicador_path,
                    texto: newPreguntaText.trim(),
                    opciones: opcionesDescriptores, // Añadir las opciones de descriptores aquí
                    orden: prev.length + 1,
                    obligatorio: true, // Por defecto, obligatorio
                }
            ]);
            setNewPreguntaText('');
        } else {
            setError('Por favor, ingresa el texto de la pregunta y selecciona un indicador.');
        }
    };

    const handleRemovePregunta = (indexToRemove) => {
        setPreguntas(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Ajustar el orden de las preguntas antes de enviar
            const preguntasToSubmit = preguntas.map((p, index) => ({ ...p, orden: index + 1 }));

            const res = await createEncuesta({ ...encuestaData, preguntas: preguntasToSubmit });
            
            // Si la encuesta es para externos y tiene preguntas, generar la invitación
            if (res.data.encuesta.para_externos && preguntasToSubmit.length > 0) {
                const invitacionRes = await createEncuestaInvitacion(res.data.encuesta.id); // No se pasan los datos de invitación aquí
                const pin = invitacionRes.data.invitacion.pin;
                const link = `${window.location.origin}/encuestas/responder/${pin}`; // Generar link
                setGeneratedLink(link); // Guardar el link para mostrarlo
                alert(`Encuesta externa creada exitosamente. Comparte este enlace: ${link}`);
            } else {
                navigate('/encuestas');
            }
        } catch (err) {
            setError('Error al crear la encuesta o la invitación.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p className="error-message">{error}</p>;

    const resolveJsonPath = (obj, path) => {
        if (!obj || !path) return undefined;
        const parts = path.split('.').slice(1);
        let current = obj;
        for (const part of parts) {
            const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
                const [, key, index] = arrayMatch;
                if (current[key] && Array.isArray(current[key]) && current[key][parseInt(index)] !== undefined) {
                    current = current[key][parseInt(index)];
                } else {
                    return undefined;
                }
            } else {
                if (current[part] !== undefined) {
                    current = current[part];
                } else {
                    return undefined;
                }
            }
        }
        return current;
    };

    return (
        <div className="form-container">
            <h1>Crear Nueva Encuesta</h1>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="nombre">Nombre de la Encuesta</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={encuestaData.nombre}
                        onChange={handleEncuestaChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={encuestaData.descripcion}
                        onChange={handleEncuestaChange}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="fecha_inicio">Fecha de Inicio</label>
                    <input
                        type="date"
                        id="fecha_inicio"
                        name="fecha_inicio"
                        value={encuestaData.fecha_inicio}
                        onChange={handleEncuestaChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="fecha_fin">Fecha de Fin</label>
                    <input
                        type="date"
                        id="fecha_fin"
                        name="fecha_fin"
                        value={encuestaData.fecha_fin}
                        onChange={handleEncuestaChange}
                        required
                    />
                </div>

                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="para_externos"
                        name="para_externos"
                        checked={encuestaData.para_externos}
                        onChange={handleEncuestaChange}
                    />
                    <label htmlFor="para_externos">Encuesta para Público Externo</label>
                </div>

                {generatedLink && (
                    <div className="generated-link-section" style={{ marginTop: '20px', padding: '15px', border: '1px solid #4CAF50', borderRadius: '8px', backgroundColor: '#e8f5e9' }}>
                        <h3>Enlace de Invitación Generado</h3>
                        <p>Comparte este enlace con los encuestados externos:</p>
                        <a href={generatedLink} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                            {generatedLink}
                        </a>
                        <button type="button" onClick={() => navigator.clipboard.writeText(generatedLink)} className="btn btn-sm" style={{ marginLeft: '10px', backgroundColor: '#007bff', color: 'white' }}>Copiar Enlace</button>
                    </div>
                )}

                <h2>Seleccionar Rúbricas y Añadir Preguntas</h2>
                <p>Selecciona las rúbricas de las que provendrán los criterios e indicadores a los que se asociarán las preguntas de la encuesta. Luego, añade preguntas para los indicadores seleccionados.</p>

                <div className="resultados-selection-container">
                    {allResultados.map(resultado => (
                        <div key={resultado.id} className="resultado-card">
                            <div className="resultado-header">
                                <input
                                    type="checkbox"
                                    id={`resultado-${resultado.id}`}
                                    checked={selectedResultados.includes(resultado.id)}
                                    onChange={() => handleResultadoToggle(resultado.id)}
                                />
                                <label htmlFor={`resultado-${resultado.id}`}>
                                    <strong>{resultado.codigo}:</strong> {resultado.descripcion}
                                </label>
                            </div>
                            {selectedResultados.includes(resultado.id) && (
                                <div className="criterios-indicadores-list" style={{ marginLeft: '20px' }}>
                                    {resultado.estructura.criterios.map((criterio, cIndex) => (
                                        <div key={cIndex} className="criterio-group" style={{ borderLeft: '2px solid #eee', paddingLeft: '10px', marginTop: '10px' }}>
                                            <h4>Criterio: {criterio.nombre}</h4>
                                            {criterio.indicadores.map((indicador, iIndex) => {
                                                const criterioPath = `$.criterios[${cIndex}]`;
                                                const indicadorPath = `$.criterios[${cIndex}].indicadores[${iIndex}]`;
                                                return (
                                                    <div key={iIndex} className="indicador-item" style={{ marginBottom: '5px' }}>
                                                        <input
                                                            type="radio"
                                                            name={`pregunta-context-${resultado.id}`}
                                                            id={`indicador-${resultado.id}-${cIndex}-${iIndex}`}
                                                            checked={
                                                                newPreguntaContext.id_resultado_aprendizaje === resultado.id &&
                                                                newPreguntaContext.criterio_path === criterioPath &&
                                                                newPreguntaContext.indicador_path === indicadorPath
                                                            }
                                                            onChange={() => handleNewPreguntaContextChange(resultado.id, criterioPath, indicadorPath, indicador.nombre)}
                                                        />
                                                        <label htmlFor={`indicador-${resultado.id}-${cIndex}-${iIndex}`}>
                                                            Indicador: {indicador.nombre}
                                                        </label>
                                                        {newPreguntaContext.id_resultado_aprendizaje === resultado.id &&
                                                         newPreguntaContext.criterio_path === criterioPath &&
                                                         newPreguntaContext.indicador_path === indicadorPath && (
                                                            <div style={{ marginLeft: '30px', borderLeft: '1px dashed #ccc', paddingLeft: '10px', marginTop: '5px' }}>
                                                                <p><strong>Niveles de Desempeño para esta rúbrica:</strong></p>
                                                                <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                                                                    {resultado.estructura.niveles.map((nivel, idx) => ( // Usar los niveles de desempeño de la estructura de la rúbrica
                                                                        <li key={idx}>{nivel}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
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

                <div className="add-pregunta-section" style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                    <h2>Añadir Nueva Pregunta</h2>
                    {newPreguntaContext.indicador_nombre ? (
                        <p>Añadiendo pregunta para: <strong>{newPreguntaContext.indicador_nombre}</strong> (Rúbrica ID: {newPreguntaContext.id_resultado_aprendizaje})</p>
                    ) : (
                        <p>Selecciona un indicador de la lista de rúbricas para añadir una pregunta.</p>
                    )}
                    <div className="form-group">
                        <label htmlFor="newPreguntaText">Texto de la Pregunta</label>
                        <textarea
                            id="newPreguntaText"
                            value={newPreguntaText}
                            onChange={(e) => setNewPreguntaText(e.target.value)}
                            placeholder="Escribe el texto de la pregunta aquí..."
                            disabled={!newPreguntaContext.indicador_path}
                            required
                        ></textarea>
                    </div>
                    <button type="button" onClick={handleAddPregunta} className="btn btn-secondary" disabled={!newPreguntaContext.indicador_path || !newPreguntaText.trim()}>
                        Añadir Pregunta a la Encuesta
                    </button>
                </div>

                <div className="preguntas-list-final" style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                    <h2>Preguntas de la Encuesta ({preguntas.length})</h2>
                    {preguntas.length === 0 && <p>No hay preguntas añadidas a esta encuesta aún.</p>}
                    <ol>
                        {preguntas.map((pregunta, index) => {
                            // Encontrar el resultado de aprendizaje para mostrar su código
                            const resultadoAsociado = allResultados.find(r => r.id === pregunta.id_resultado_aprendizaje);
                            let indicadorNombre = "N/A";
                            if (resultadoAsociado) {
                                const estructura = resultadoAsociado.estructura;
                                const indicador = resolveJsonPath(estructura, pregunta.indicador_path);
                                if (indicador) {
                                    indicadorNombre = indicador.nombre;
                                }
                            }
                            
                            return (
                                <li key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{pregunta.texto}</strong>
                                        <p style={{ fontSize: '0.85em', color: '#666', margin: '5px 0 0 0' }}>
                                            Asociada a: {resultadoAsociado ? resultadoAsociado.codigo : 'N/A'} {indicadorNombre}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => handleRemovePregunta(index)} className="btn btn-danger btn-sm">
                                        Eliminar
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Encuesta'}
                </button>
            </form>
        </div>
    );
};

export default EncuestaCreatePage;
