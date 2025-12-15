import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFullEncuesta, getEncuestaResultados } from '../api/apiService';
import { FiArrowLeft, FiPieChart, FiBarChart2, FiDownload, FiSearch } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/Table.css';
import '../styles/Encuesta.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const EncuestaResultadosPage = () => {
    const { id } = useParams();
    const [encuesta, setEncuesta] = useState(null);
    const [resultados, setResultados] = useState([]);
    const [invitaciones, setInvitaciones] = useState([]); // Nuevo estado para invitaciones
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [vistaActual, setVistaActual] = useState('graficas'); // 'graficas' o 'tabla'
    const [searchTerm, setSearchTerm] = useState(''); // Estado para búsqueda

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [encuestaRes, resultadosData] = await Promise.all([
                    getFullEncuesta(id),
                    getEncuestaResultados(id),
                ]);

                setEncuesta(encuestaRes.data);
                setResultados(resultadosData.data.resultados); // Acceder a la propiedad 'resultados'
                setInvitaciones(resultadosData.data.invitaciones); // Acceder a la propiedad 'invitaciones'

            } catch (err) {
                setError('Error al cargar los resultados de la encuesta.');
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

    // Calcular estadísticas generales
    const calcularEstadisticas = () => {
        const stats = {
            totalRespuestas: resultados.length,
            preguntasRespondidas: Object.keys(groupedResults).length,
            totalPreguntas: encuesta.preguntas.length,
            lugares: {},
            tiposEmpresa: {},
            giros: {}
        };

        resultados.forEach(r => {
            if (r.lugar) stats.lugares[r.lugar] = (stats.lugares[r.lugar] || 0) + 1;
            if (r.tipo_empresa) stats.tiposEmpresa[r.tipo_empresa] = (stats.tiposEmpresa[r.tipo_empresa] || 0) + 1;
            if (r.giro) stats.giros[r.giro] = (stats.giros[r.giro] || 0) + 1;
        });

        return stats;
    };

    const estadisticas = calcularEstadisticas();

    // Preparar datos para gráficas de distribución
    const prepararDatosLugares = () => {
        return Object.entries(estadisticas.lugares).map(([nombre, cantidad]) => ({
            nombre,
            cantidad
        }));
    };

    const prepararDatosTiposEmpresa = () => {
        return Object.entries(estadisticas.tiposEmpresa).map(([nombre, cantidad]) => ({
            nombre,
            cantidad
        }));
    };

    const prepararDatosNiveles = (pregunta) => {
        const preguntaResults = groupedResults[pregunta.id] || { respuestas: [] };
        const conteoNiveles = {};

        preguntaResults.respuestas.forEach(r => {
            const nivel = r.nombre_nivel_seleccionado || 'Sin nivel';
            conteoNiveles[nivel] = (conteoNiveles[nivel] || 0) + 1;
        });

        return Object.entries(conteoNiveles).map(([nivel, cantidad]) => ({
            nivel,
            cantidad
        }));
    };

    // Función para filtrar resultados por búsqueda
    const filtrarResultados = (respuestas) => {
        if (!searchTerm.trim()) return respuestas;

        return respuestas.filter(r => {
            const nombreEncuestado = r.usuario_nombre ||
                (r.invitacion_pin ? `Invitado (${r.invitacion_pin})` : 'Anónimo');
            return nombreEncuestado.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.lugar && r.lugar.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (r.tipo_empresa && r.tipo_empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (r.giro && r.giro.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    };

    // Función para descargar CSV
    const descargarCSV = () => {
        // Preparar datos para CSV
        const csvData = [];

        // Headers
        const headers = [
            'Pregunta',
            'Encuestado',
            'Nivel Seleccionado',
            'Comentario',
            'Lugar',
            'Tipo Empresa',
            'Giro',
            'Egresados Universidad',
            'Fecha Respuesta'
        ];
        csvData.push(headers.join(','));

        // Datos
        encuesta.preguntas.forEach(pregunta => {
            const preguntaResults = groupedResults[pregunta.id] || { respuestas: [] };

            preguntaResults.respuestas.forEach(r => {
                const nombreEncuestado = r.nombre_completo ||
                    (r.invitacion_pin ? `Invitado (${r.invitacion_pin})` : 'Anónimo');

                const row = [
                    `"${pregunta.texto.replace(/"/g, '""')}"`, // Escapar comillas
                    `"${nombreEncuestado.replace(/"/g, '""')}"`,
                    `"${r.nombre_nivel_seleccionado || 'N/A'}"`,
                    `"${(r.comentario || '-').replace(/"/g, '""')}"`,
                    `"${r.lugar || '-'}"`,
                    `"${r.tipo_empresa || '-'}"`,
                    `"${r.giro || '-'}"`,
                    r.egresados_universidad || '-',
                    new Date(r.fecha_respuesta).toLocaleDateString('es-MX')
                ];
                csvData.push(row.join(','));
            });
        });

        // Crear blob y descargar con BOM UTF-8 y saltos de línea Windows
        const csvContent = "\uFEFF" + csvData.join("\r\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `resultados_encuesta_${encuesta.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="page-container">
            <Link to="/encuestas" className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                <FiArrowLeft /> Volver a la lista de encuestas
            </Link>

            <div className="encuesta-resultados-container">
                <div className="encuesta-header">
                    <h1>Resultados de Encuesta: {encuesta.nombre}</h1>
                    <p>{encuesta.descripcion}</p>
                    {encuesta.para_externos && invitaciones.length > 0 && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: '#e0f7fa',
                            borderRadius: '8px',
                            border: '1px solid #b2ebf2'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: '#00796b' }}>
                                Enlace(s) para responder la encuesta:
                            </h3>
                            {invitaciones.map((inv, index) => (
                                <p key={inv.id} style={{ marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                                    <strong style={{ color: '#004d40' }}>PIN {index + 1}:</strong>{' '}
                                    <a
                                        href={`${window.location.origin}/encuestas/responder/${inv.pin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#0288d1', textDecoration: 'underline' }}
                                    >
                                        {window.location.origin}/encuestas/responder/{inv.pin}
                                    </a>
                                </p>
                            ))}
                            <p style={{ marginTop: '1rem', fontSize: '0.9em', color: '#00796b' }}>
                                Comparte estos enlaces con los encuestados externos.
                            </p>
                        </div>
                    )}
                </div>

                {/* Resumen Estadístico */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                    marginTop: '2rem' /* Añadido un margen superior para separar del bloque de enlaces */
                }}>
                    <div style={{
                        background: '#f8f9fa',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #dee2e6'
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '1rem' }}>Total Respuestas</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#0088FE' }}>
                            {estadisticas.totalRespuestas}
                        </p>
                    </div>
                    <div style={{
                        background: '#f8f9fa',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #dee2e6'
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '1rem' }}>Preguntas Respondidas</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#00C49F' }}>
                            {estadisticas.preguntasRespondidas} / {estadisticas.totalPreguntas}
                        </p>
                    </div>
                    <div style={{
                        background: '#f8f9fa',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #dee2e6'
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '1rem' }}>Lugares Diferentes</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#FFBB28' }}>
                            {Object.keys(estadisticas.lugares).length}
                        </p>
                    </div>
                </div>

                {/* Barra de Herramientas */}
                <div style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Botones de Vista */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            className={`btn ${vistaActual === 'graficas' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setVistaActual('graficas')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FiPieChart />
                            Vista Gráficas
                        </button>
                        <button
                            className={`btn ${vistaActual === 'tabla' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setVistaActual('tabla')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FiBarChart2 />
                            Vista Tabla Detallada
                        </button>
                    </div>

                    {/* Botón de Descarga CSV */}
                    <button
                        className="btn btn-success"
                        onClick={descargarCSV}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        disabled={resultados.length === 0}
                    >
                        <FiDownload />
                        Descargar CSV
                    </button>
                </div>

                {/* Barra de Búsqueda (solo en vista tabla) */}
                {vistaActual === 'tabla' && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            position: 'relative',
                            maxWidth: '500px'
                        }}>
                            <FiSearch style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#6c757d',
                                fontSize: '1.2rem'
                            }} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, lugar, tipo de empresa o giro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem 0.8rem 3rem',
                                    border: '2px solid #dee2e6',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                            />
                        </div>
                        {searchTerm && (
                            <p style={{
                                marginTop: '0.5rem',
                                fontSize: '0.9rem',
                                color: '#6c757d'
                            }}>
                                Mostrando resultados filtrados
                            </p>
                        )}
                    </div>
                )}

                {vistaActual === 'graficas' && (
                    <>
                        {/* Gráficas de Distribución General */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h2>Distribución de Participantes</h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                gap: '2rem',
                                marginTop: '1.5rem'
                            }}>
                                {/* Gráfica de Lugares */}
                                {prepararDatosLugares().length > 0 && (
                                    <div style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #dee2e6',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                        <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#495057' }}>
                                            Por Lugar
                                        </h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={prepararDatosLugares()}
                                                    dataKey="cantidad"
                                                    nameKey="nombre"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label
                                                >
                                                    {prepararDatosLugares().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Gráfica de Tipos de Empresa */}
                                {prepararDatosTiposEmpresa().length > 0 && (
                                    <div style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #dee2e6',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                        <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#495057' }}>
                                            Por Tipo de Empresa
                                        </h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={prepararDatosTiposEmpresa()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="nombre" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="cantidad" fill="#00C49F" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gráficas por Pregunta */}
                        <h2 style={{ marginBottom: '1.5rem' }}>Distribución de Respuestas por Pregunta</h2>
                        {encuesta.preguntas.length === 0 ? (
                            <p>No hay preguntas en esta encuesta.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {encuesta.preguntas.map(pregunta => {
                                    const datosNiveles = prepararDatosNiveles(pregunta);
                                    const preguntaResults = groupedResults[pregunta.id] || { respuestas: [] };

                                    return (
                                        <div key={pregunta.id} style={{
                                            background: 'white',
                                            padding: '1.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }}>
                                            <h4 style={{ marginBottom: '0.5rem', color: '#212529' }}>
                                                {pregunta.texto}
                                            </h4>
                                            <p style={{
                                                color: '#6c757d',
                                                fontSize: '0.9rem',
                                                marginBottom: '1rem',
                                                fontStyle: 'italic'
                                            }}>
                                                Total de respuestas: {preguntaResults.respuestas.length}
                                            </p>

                                            {datosNiveles.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart data={datosNiveles}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="nivel" />
                                                        <YAxis allowDecimals={false} />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar
                                                            dataKey="cantidad"
                                                            fill="#8884d8"
                                                            name="Cantidad de respuestas"
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <p style={{
                                                    textAlign: 'center',
                                                    color: '#6c757d',
                                                    padding: '2rem'
                                                }}>
                                                    No hay respuestas para esta pregunta aún.
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {vistaActual === 'tabla' && (
                    <>
                        <h2>Respuestas Detalladas</h2>
                        {encuesta.preguntas.length === 0 ? (
                            <p>No hay preguntas en esta encuesta.</p>
                        ) : (
                            <div className="resultados-preguntas-list">
                                {encuesta.preguntas.map(pregunta => {
                                    const preguntaResults = groupedResults[pregunta.id] || { respuestas: [] };

                                    return (
                                        <div key={pregunta.id} style={{
                                            marginBottom: '2rem',
                                            background: 'white',
                                            padding: '1.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }}>
                                            <h4 style={{ marginBottom: '1rem' }}>{pregunta.texto}</h4>

                                            {preguntaResults.respuestas.length > 0 ? (
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table className="styled-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Encuestado</th>
                                                                <th>Nivel</th>
                                                                <th>Comentario</th>
                                                                <th>Lugar</th>
                                                                <th>Tipo Empresa</th>
                                                                <th>Giro</th>
                                                                <th>Egresados</th>
                                                                <th>Fecha</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filtrarResultados(preguntaResults.respuestas).map((r, idx) => (
                                                                <tr key={idx}>
                                                                    <td>
                                                                        {r.nombre_completo ||
                                                                            (r.invitacion_pin ? `Invitado (${r.invitacion_pin})` : 'Anónimo')}
                                                                    </td>
                                                                    <td>
                                                                        <span style={{
                                                                            background: '#e7f3ff',
                                                                            padding: '0.25rem 0.75rem',
                                                                            borderRadius: '12px',
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: '500',
                                                                            display: 'inline-block'
                                                                        }}>
                                                                            {r.nombre_nivel_seleccionado || 'N/A'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                                                                        {r.comentario || '-'}
                                                                    </td>
                                                                    <td>{r.lugar || '-'}</td>
                                                                    <td>{r.tipo_empresa || '-'}</td>
                                                                    <td>{r.giro || '-'}</td>
                                                                    <td>{r.egresados_universidad || '-'}</td>
                                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                                        {new Date(r.fecha_respuesta).toLocaleDateString('es-MX')}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p style={{
                                                    textAlign: 'center',
                                                    color: '#6c757d',
                                                    padding: '1rem',
                                                    fontStyle: 'italic'
                                                }}>
                                                    No hay respuestas aún para esta pregunta.
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EncuestaResultadosPage;
