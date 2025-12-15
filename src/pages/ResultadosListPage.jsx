import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllResultados, deleteResultado } from '../api/apiService';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2'; // <-- 1. Importar SweetAlert2
import withReactContent from 'sweetalert2-react-content'; // <-- 2. Importar el wrapper de React
import { FiPlus, FiEye, FiEdit3, FiTrash2, FiClock } from 'react-icons/fi'; // <-- Iconos mejorados
import '../styles/Table.css';

const MySwal = withReactContent(Swal); // <-- 3. Crear una instancia para usar en React

const ResultadosListPage = () => {
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchResultados = async () => {
            try {
                const { data } = await getAllResultados();
                setResultados(data);
            } catch (error) {
                console.error("Error al cargar resultados:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResultados();
    }, []);

    // =======================================================
    // ========= ESTA ES LA FUNCIÓN ACTUALIZADA =============
    // =======================================================
    const handleDelete = (id) => {
        MySwal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Color rojo para el botón de confirmación
            cancelButtonColor: '#3085d6', // Color azul para el de cancelar
            confirmButtonText: '¡Sí, eliminar!',
            cancelButtonText: 'Cancelar',
            reverseButtons: true, // Pone el botón de confirmar a la derecha
            customClass: {
                popup: 'swal-popup-custom',
                confirmButton: 'swal-button-custom',
                cancelButton: 'swal-button-custom',
            }
        }).then(async (result) => {
            // Si el usuario confirma la acción...
            if (result.isConfirmed) {
                try {
                    await deleteResultado(id);
                    // Actualizar el estado para remover la rúbrica de la UI
                    setResultados(prevResultados => prevResultados.filter(r => r.id !== id));

                    // Mostrar una alerta de éxito
                    MySwal.fire(
                        '¡Eliminado!',
                        'La rúbrica ha sido eliminada.',
                        'success'
                    );
                } catch (error) {
                    console.error("Error al eliminar:", error);
                    // Mostrar el mensaje de error del backend si está disponible
                    const errorMessage = error.response?.data?.message || 'No se pudo eliminar la rúbrica.';
                    MySwal.fire(
                        'Error',
                        errorMessage,
                        'error'
                    );
                }
            }
        });
    };

    if (loading) return <p>Cargando rúbricas...</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Lista de Rúbricas</h1>
                {['administrador', 'coordinador'].includes(user?.rol) && (
                    <Link to="/resultados/nuevo" className="btn btn-primary">
                        <FiPlus /> Crear Nueva Rúbrica
                    </Link>
                )}
            </div>
            <div className="table-wrapper">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultados.map(res => (
                            <tr key={res.id}>
                                <td>{res.codigo}</td>
                                <td>{res.descripcion}</td>
                                <td className="action-buttons">
                                    <Link to={`/resultados/${res.id}`} className="btn btn-secondary">
                                        <FiEye /> Ver
                                    </Link>

                                    {['administrador', 'coordinador'].includes(user?.rol) && (
                                        <Link to={`/resultados/${res.id}/editar`} className="btn">
                                            <FiEdit3 /> Editar
                                        </Link>
                                    )}

                                    {user?.rol === 'administrador' && (
                                        <button onClick={() => handleDelete(res.id)} className="btn btn-danger">
                                            <FiTrash2 /> Eliminar
                                        </button>
                                    )}

                                    {['administrador', 'auditor'].includes(user?.rol) && (
                                        <Link to={`/resultados/${res.id}/historial`} className="btn">
                                            <FiClock /> Historial
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultadosListPage;