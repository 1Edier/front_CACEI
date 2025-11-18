import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEncuesta, getAllResultados } from '../api/apiService'; // Necesitaremos createEncuesta y getAllResultados
import '../styles/Form.css'; // Estilos para formularios
import '../styles/Table.css'; // Estilos para tablas, si se usan para mostrar rúbricas

const EncuestaCreatePage = () => {
    const navigate = useNavigate();
    const [encuestaData, setEncuestaData] = useState({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
    });
    const [allResultados, setAllResultados] = useState([]);
    const [selectedResultados, setSelectedResultados] = useState([]); // IDs de resultados seleccionados
    const [selectedItems, setSelectedItems] = useState({}); // { resultadoId: { criterioPath: { indicadorPath: { selected: boolean, nuevaPregunta: string, preguntas: [] } } } }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResultados = async () => {
            try {
                const { data } = await getAllResultados();
                setAllResultados(data);
            } catch (err) {
                setError('Error al cargar los resultados de aprendizaje.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResultados();
    }, []);

    const handleEncuestaChange = (e) => {
        const { name, value } = e.target;
        setEncuestaData(prev => ({ ...prev, [name]: value }));
    };

    const handleResultadoSelect = (resultadoId) => {
        const isCurrentlySelected = selectedResultados.includes(resultadoId);
        
        setSelectedResultados(prev => 
            isCurrentlySelected
                ? prev.filter(id => id !== resultadoId)
                : [...prev, resultadoId]
        );
        
        if (isCurrentlySelected) {
            setSelectedItems(prev => {
                const newItems = { ...prev };
                delete newItems[resultadoId];
                return newItems;
            });
        } else {
            const resultado = allResultados.find(r => r.id === resultadoId);
            if (resultado) {
                setSelectedItems(prev => {
                    const newItems = { ...prev };
                    newItems[resultadoId] = {};
                    
                    resultado.estructura.criterios.forEach((criterio, cIndex) => {
                        const criterioPath = `$.criterios[${cIndex}]`;
                        newItems[resultadoId][criterioPath] = {};
                        
                        criterio.indicadores.forEach((indicador, iIndex) => {
                            const indicadorPath = `$.criterios[${cIndex}].indicadores[${iIndex}]`;
                            newItems[resultadoId][criterioPath][indicadorPath] = { selected: true, nuevaPregunta: '', preguntas: [] };
                        });
                    });
                    
                    return newItems;
                });
            }
        }
    };

    const handleItemSelect = (resultadoId, criterioPath, indicadorPath) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            if (!newItems[resultadoId]) newItems[resultadoId] = {};
            if (!newItems[resultadoId][criterioPath]) newItems[resultadoId][criterioPath] = {};

            const currentItem = newItems[resultadoId][criterioPath][indicadorPath];
            if (currentItem && currentItem.selected) {
                // Deseleccionar y limpiar preguntas
                newItems[resultadoId][criterioPath][indicadorPath] = { selected: false, nuevaPregunta: '', preguntas: [] };
            } else {
                // Seleccionar
                newItems[resultadoId][criterioPath][indicadorPath] = { selected: true, nuevaPregunta: '', preguntas: [] };
            }
            return newItems;
        });
    };

    const handleAddPreguntaToIndicador = (resultadoId, criterioPath, indicadorPath, texto) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            newItems[resultadoId][criterioPath][indicadorPath].nuevaPregunta = texto;
            return newItems;
        });
    };

    const handleSavePreguntaToIndicador = (resultadoId, criterioPath, indicadorPath) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            const indicador = newItems[resultadoId][criterioPath][indicadorPath];
            if (indicador.nuevaPregunta.trim()) {
                indicador.preguntas.push({ texto: indicador.nuevaPregunta.trim() });
                indicador.nuevaPregunta = '';
            }
            return newItems;
        });
    };

    const handleRemovePreguntaFromIndicador = (resultadoId, criterioPath, indicadorPath, indexToRemove) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            newItems[resultadoId][criterioPath][indicadorPath].preguntas = newItems[resultadoId][criterioPath][indicadorPath].preguntas.filter((_, index) => index !== indexToRemove);
            return newItems;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const itemsToSubmit = [];
        const preguntasToSubmit = [];

        for (const resultadoId in selectedItems) {
            const resultado = allResultados.find(r => r.id === parseInt(resultadoId));
            if (!resultado) continue;

            for (const criterioPath in selectedItems[resultadoId]) {
                for (const indicadorPath in selectedItems[resultadoId][criterioPath]) {
                    const itemData = selectedItems[resultadoId][criterioPath][indicadorPath];
                    if (itemData.selected) {
                        itemsToSubmit.push({
                            id_resultado_aprendizaje: parseInt(resultadoId),
                            criterio_path: criterioPath,
                            indicador_path: indicadorPath,
                            orden: itemsToSubmit.length + 1,
                            obligatorio: true
                        });

                        if (itemData.preguntas && itemData.preguntas.length > 0) {
                            itemData.preguntas.forEach(pregunta => {
                                preguntasToSubmit.push({
                                    id_resultado_aprendizaje: parseInt(resultadoId),
                                    criterio_path: criterioPath,
                                    indicador_path: indicadorPath,
                                    texto: pregunta.texto,
                                    orden: preguntasToSubmit.length + 1,
                                    obligatorio: true
                                });
                            });
                        }
                    }
                }
            }
        }

        try {
            const newEncuesta = await createEncuesta({ ...encuestaData, items: itemsToSubmit, preguntas: preguntasToSubmit });
            navigate('/encuestas');
        } catch (err) {
            setError('Error al crear la encuesta.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p className="error-message">{error}</p>;

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

                <h2>Seleccionar Rúbricas y sus Componentes</h2>
                <p>Selecciona las rúbricas y luego los criterios/indicadores que deseas incluir en la encuesta. Puedes añadir preguntas específicas a cada indicador.</p>

                <div className="resultados-selection-container">
                    {allResultados.map(resultado => (
                        <div key={resultado.id} className="resultado-card">
                            <div className="resultado-header">
                                <input
                                    type="checkbox"
                                    id={`resultado-${resultado.id}`}
                                    checked={selectedResultados.includes(resultado.id)}
                                    onChange={() => handleResultadoSelect(resultado.id)}
                                />
                                <label htmlFor={`resultado-${resultado.id}`}>
                                    <strong>{resultado.codigo}:</strong> {resultado.descripcion}
                                </label>
                            </div>
                            {selectedResultados.includes(resultado.id) && (
                                <div className="criterios-indicadores-list">
                                    {resultado.estructura.criterios.map((criterio, cIndex) => (
                                        <div key={cIndex} className="criterio-group">
                                            <h4>Criterio: {criterio.nombre}</h4>
                                            {criterio.indicadores.map((indicador, iIndex) => {
                                                const criterioPath = `$.criterios[${cIndex}]`;
                                                const indicadorPath = `$.criterios[${cIndex}].indicadores[${iIndex}]`;
                                                return (
                                                    <div key={iIndex} className="indicador-item">
                                                        <input
                                                            type="checkbox"
                                                            id={`indicador-${resultado.id}-${cIndex}-${iIndex}`}
                                                            checked={selectedItems[resultado.id]?.[criterioPath]?.[indicadorPath]?.selected || false}
                                                            onChange={() => handleItemSelect(resultado.id, criterioPath, indicadorPath)}
                                                        />
                                                        <label htmlFor={`indicador-${resultado.id}-${cIndex}-${iIndex}`}>
                                                            Indicador: {indicador.nombre}
                                                        </label>
                                                        {selectedItems[resultado.id]?.[criterioPath]?.[indicadorPath]?.selected && (
                                                            <div className="pregunta-por-indicador-container" style={{ marginLeft: '20px', marginTop: '10px', borderLeft: '2px solid #eee', paddingLeft: '10px' }}>
                                                                <div className="form-group" style={{ marginBottom: '5px' }}>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Añadir pregunta para este indicador"
                                                                        value={selectedItems[resultado.id]?.[criterioPath]?.[indicadorPath]?.nuevaPregunta || ''}
                                                                        onChange={(e) => handleAddPreguntaToIndicador(resultado.id, criterioPath, indicadorPath, e.target.value)}
                                                                        style={{ width: 'calc(100% - 80px)', marginRight: '10px' }}
                                                                    />
                                                                    <button type="button" onClick={() => handleSavePreguntaToIndicador(resultado.id, criterioPath, indicadorPath)} className="btn btn-sm">
                                                                        Guardar
                                                                    </button>
                                                                </div>
                                                                <div className="preguntas-list-indicador">
                                                                    {(selectedItems[resultado.id]?.[criterioPath]?.[indicadorPath]?.preguntas || []).map((pregunta, pIndex) => (
                                                                        <div key={pIndex} className="pregunta-item-indicador" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '0.0.9em' }}>
                                                                            <span>- {pregunta.texto}</span>
                                                                            <button type="button" onClick={() => handleRemovePreguntaFromIndicador(resultado.id, criterioPath, indicadorPath, pIndex)} className="btn btn-danger btn-sm">
                                                                                Eliminar
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
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

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Encuesta'}
                </button>
            </form>
        </div>
    );
};

export default EncuestaCreatePage;
