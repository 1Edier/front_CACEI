import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllResultados, deleteResultado } from '../api/apiService';
import { useAuth } from '../hooks/useAuth';
import '../styles/Table.css';

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

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta rúbrica?')) {
            try {
                await deleteResultado(id);
                setResultados(resultados.filter(r => r.id !== id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert('No se pudo eliminar la rúbrica.');
            }
        }
    };

    if (loading) return <p>Cargando rúbricas...</p>;

    return (
        <div>
            <h1>Lista de Rúbricas (Resultados de Aprendizaje)</h1>
            {['administrador', 'coordinador'].includes(user?.rol) && (
                <Link to="/resultados/nuevo" className="btn btn-primary" style={{marginBottom: '1rem'}}>Crear Nueva Rúbrica</Link>
            )}
            <div className="table-container">
                <table className="styled-table">
                    <thead>
                        {/* ... (thead existente) */}
                    </thead>
                    <tbody>
                        {resultados.map(res => (
                            <tr key={res.id}>
                                <td>{res.codigo}</td>
                                <td>{res.descripcion}</td>
                                <td className="action-buttons">
                                    <Link to={`/resultados/${res.id}`} className="btn btn-secondary">Ver</Link>
                                    
                                    {/* --- LÍNEAS AÑADIDAS/MODIFICADAS --- */}
                                    {['administrador', 'coordinador'].includes(user?.rol) && (
                                        <Link to={`/resultados/${res.id}/editar`} className="btn">Editar</Link>
                                    )}

                                    {user?.rol === 'administrador' && (
                                        <button onClick={() => handleDelete(res.id)} className="btn btn-danger">Eliminar</button>
                                    )}
                                    {['administrador', 'auditor'].includes(user?.rol) && (
                                         <Link to={`/resultados/${res.id}/historial`} className="btn">Historial</Link>
                                    )}
                                    {/* --- FIN DE LÍNEAS AÑADIDAS/MODIFICADAS --- */}
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