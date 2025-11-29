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
            const header = [
                "ID Encuesta", "Nombre Encuesta", "Fecha Inicio", "Fecha Fin",
                "Fecha Respuesta", "Nombre Encuestado", "Lugar", "Tipo Empresa", "Giro", "Egresados", "Comentarios",
                "Pregunta", "Respuesta", "Nivel Seleccionado"
            ];
            allRows.push(header.join(","));

            // Iterar sobre cada encuesta para obtener sus resultados
            for (const encuesta of encuestas) {
                try {
                    const { data: resultados } = await getEncuestaResultados(encuesta.id);

                    if (resultados && resultados.length > 0) {
                        resultados.forEach(res => {
                            // Datos base de la encuesta y el encuestado
                            const baseInfo = [
                                `"${encuesta.id}"`,
                                `"${(encuesta.nombre || '').replace(/"/g, '""')}"`,
                                `"${(encuesta.fecha_inicio || '').split('T')[0]}"`,
                                `"${(encuesta.fecha_fin || '').split('T')[0]}"`,
                                `"${new Date(res.fecha_respuesta).toLocaleDateString()}"`,
                                `"${(res.encuestado_nombre || 'Anónimo').replace(/"/g, '""')}"`,
                                `"${(res.lugar || '').replace(/"/g, '""')}"`,
                                `"${(res.tipo_empresa || '').replace(/"/g, '""')}"`,
                                `"${(res.giro || '').replace(/"/g, '""')}"`,
                                `"${(res.egresados || '').replace(/"/g, '""')}"`,
                                `"${(res.comentarios || '').replace(/"/g, '""')}"`
                            ];

                            // Iterar sobre las respuestas de este encuestado
                            if (res.respuestas && res.respuestas.length > 0) {
                                res.respuestas.forEach(r => {
                                    const row = [
                                        ...baseInfo,
                                        `"${(r.pregunta_texto || '').replace(/"/g, '""')}"`,
                                        `"${(r.respuesta_valor || '').replace(/"/g, '""')}"`,
                                        `"${(r.nivel_seleccionado || '').replace(/"/g, '""')}"`
                                    ];
                                    allRows.push(row.join(","));
                                });
                            } else {
                                // Si no hay respuestas detalladas, al menos guardar la info del encuestado
                                const row = [...baseInfo, "", "", ""];
                                allRows.push(row.join(","));
                            }
                        });
                    }
                } catch (err) {
                    console.warn(`No se pudieron cargar resultados para la encuesta ${encuesta.id}`, err);
                    // Continuamos con la siguiente encuesta sin detener el proceso
                }
            }

            // Generar y descargar el archivo
            const csvContent = "\uFEFF" + allRows.join("\n");
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