import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEncuestas, getEncuestaResultados } from '../api/apiService';
import { useAuth } from '../hooks/useAuth';
import { FiPlus, FiBarChart2, FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../styles/Table.css';

const MySwal = withReactContent(Swal);

const EncuestaListPage = () => {
    const { user } = useAuth();
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEncuestas = async () => {
            try {
                const { data } = await getAllEncuestas();
                setEncuestas(data);
            } catch (err) {
                setError('Error al cargar las encuestas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEncuestas();
    }, []);

    const handleDownloadAllCSV = async () => {
        if (encuestas.length === 0) {
            MySwal.fire('Atención', 'No hay encuestas para descargar.', 'info');
            return;
        }

        setDownloading(true);
        MySwal.fire({
            title: 'Generando Reporte Global...',
            text: 'Recopilando datos de todas las encuestas. Esto puede tardar unos momentos.',
            allowOutsideClick: false,
            didOpen: () => {
                MySwal.showLoading();
            }
        });

        try {
            const allRows = [];
            // Encabezados del CSV Global
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
            allRows.push(headers.join(','));

            // Iterar sobre cada encuesta para obtener sus resultados
            for (const encuesta of encuestas) {
                try {
                    const { data } = await getEncuestaResultados(encuesta.id);

                    // La API devuelve un objeto con la propiedad 'resultados'
                    const resultados = data.resultados || [];

                    if (resultados && resultados.length > 0) {
                        resultados.forEach(res => {
                            // Determinar el nombre del encuestado
                            const nombreEncuestado = res.nombre_completo ||
                                (res.invitacion_pin ? `Invitado (${res.invitacion_pin})` : 'Anónimo');

                            // Crear una fila por cada respuesta del encuestado
                            // Escapar comillas dobles y envolver cada campo en comillas
                            const preguntaTexto = res.pregunta_texto || '';
                            const nivelSeleccionado = res.nombre_nivel_seleccionado || 'N/A';
                            const comentario = res.comentario || '-';
                            const lugar = res.lugar || '-';
                            const tipoEmpresa = res.tipo_empresa || '-';
                            const giro = res.giro || '-';
                            const egresados = res.egresados_universidad || '-';
                            const fechaRespuesta = new Date(res.fecha_respuesta).toLocaleDateString('es-MX');

                            const row = [
                                `"${preguntaTexto.replace(/"/g, '""')}"`,
                                `"${nombreEncuestado.replace(/"/g, '""')}"`,
                                `"${nivelSeleccionado.replace(/"/g, '""')}"`,
                                `"${comentario.replace(/"/g, '""')}"`,
                                `"${lugar.replace(/"/g, '""')}"`,
                                `"${tipoEmpresa.replace(/"/g, '""')}"`,
                                `"${giro.replace(/"/g, '""')}"`,
                                `"${egresados.toString().replace(/"/g, '""')}"`,
                                `"${fechaRespuesta}"`
                            ];
                            allRows.push(row.join(','));
                        });
                    }
                } catch (err) {
                    console.warn(`No se pudieron cargar resultados para la encuesta ${encuesta.id}`, err);
                    // Continuamos con la siguiente encuesta sin detener el proceso
                }
            }

            // Generar y descargar el archivo con saltos de línea apropiados para Windows
            const csvContent = "\uFEFF" + allRows.join("\r\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `REPORTE_GLOBAL_ENCUESTAS_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            MySwal.fire({
                icon: 'success',
                title: '¡Descarga Completa!',
                text: 'El reporte global se ha generado exitosamente.',
                timer: 3000
            });

        } catch (error) {
            console.error("Error generando CSV global:", error);
            MySwal.fire('Error', 'Hubo un problema al generar el reporte global.', 'error');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <p>Cargando encuestas...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Listado de Encuestas</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {['administrador', 'coordinador'].includes(user?.rol) && (
                        <>
                            <button
                                onClick={handleDownloadAllCSV}
                                className="btn btn-success"
                                disabled={downloading || encuestas.length === 0}
                            >
                                <FiDownload /> {downloading ? 'Generando...' : 'Descargar Todo (CSV)'}
                            </button>
                            <Link to="/encuestas/create" className="btn btn-primary">
                                <FiPlus /> Crear Nueva Encuesta
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="table-wrapper">
                {encuestas.length === 0 ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>No hay encuestas disponibles.</p>
                ) : (
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Fecha de Inicio</th>
                                <th>Fecha de Fin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {encuestas.map(encuesta => (
                                <tr key={encuesta.id}>
                                    <td>{encuesta.nombre}</td>
                                    <td>{encuesta.descripcion}</td>
                                    <td>{new Date(encuesta.fecha_inicio).toLocaleDateString()}</td>
                                    <td>{new Date(encuesta.fecha_fin).toLocaleDateString()}</td>
                                    <td className="action-buttons">
                                        <Link to={`/encuestas/${encuesta.id}/resultados`} className="btn btn-secondary">
                                            <FiBarChart2 /> Ver Resultados
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EncuestaListPage;