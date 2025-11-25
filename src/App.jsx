import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './hooks/useAuth'; // Importar el hook

// Importa todas las páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResultadosListPage from './pages/ResultadosListPage';
import EncuestaResponderPage from './pages/EncuestaResponderPage';
import ResultadoFormPage from './pages/ResultadoFormPage';
import ResultadoHistoryPage from './pages/ResultadoHistoryPage';
import ResultadoDetailPage from './pages/ResultadoDetailPage';
import EncuestaCreatePage from './pages/EncuestaCreatePage';
import EncuestaListPage from './pages/EncuestaListPage';
import EncuestaResultadosPage from './pages/EncuestaResultadosPage';
import GraciasPage from './pages/GraciasPage'; // Importar la página de agradecimiento

const ProfilePage = () => {
    const { user } = useAuth(); // Ahora podemos usar el hook
    return (
        <div>
            <h1>Mi Perfil</h1>
            <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
    );
};
const UsuariosPage = () => <h1>Gestionar Usuarios (Admin)</h1>;


function App() {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        {/* Rutas Públicas */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        {/* Rutas Privadas */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/usuarios" element={<UsuariosPage />} />
                            
                            {/* Rutas de Rúbricas (Resultados de Aprendizaje) */}
                            <Route path="/resultados" element={<ResultadosListPage />} />
                            <Route path="/resultados/nuevo" element={<ResultadoFormPage />} />
                            <Route path="/resultados/:id" element={<ResultadoDetailPage />} /> 
                            <Route path="/resultados/:id/editar" element={<ResultadoFormPage />} />
                            <Route path="/resultados/:id/historial" element={<ResultadoHistoryPage />} />

                            {/* Encuestas */}
                            <Route path="/encuestas" element={<EncuestaListPage />} />
                            <Route path="/encuestas/create" element={<EncuestaCreatePage />} />
                            {/* <Route path="/encuestas/:id/responder" element={<EncuestaResponderPage />} />  Esta ruta se mueve a pública */}
                            <Route path="/encuestas/:id/resultados" element={<EncuestaResultadosPage />} />
                        </Route>

                        {/* Rutas Públicas (Encuestas Externas) */}
                        <Route path="/encuestas/responder/:pin" element={<EncuestaResponderPage />} />
                        <Route path="/gracias" element={<GraciasPage />} /> {/* Usar el componente GraciasPage */}

                        {/* Ruta para página no encontrada */}
                        <Route path="*" element={<h1>404: Página No Encontrada</h1>} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;
