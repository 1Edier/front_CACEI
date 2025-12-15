import { useAuth } from '../hooks/useAuth';
import { FiCheckCircle, FiBook, FiPieChart, FiUsers, FiClipboard, FiBarChart2, FiTrendingUp, FiAward } from 'react-icons/fi';

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header Section con color primario */}
            <div style={{
                background: 'var(--primary-color)',
                padding: '3rem 2rem',
                borderRadius: '16px',
                marginBottom: '2.5rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 150, 136, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    zIndex: 0
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2.5rem',
                        marginBottom: '0.75rem',
                        color: 'white',
                        fontWeight: '700',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Bienvenido al Sistema de Gestión de Rúbricas y Encuestas
                    </h1>
                    <p style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        color: 'rgba(255,255,255,0.95)',
                        fontWeight: '500'
                    }}>
                        {user?.nombre_completo ? ` Hola, ${user.nombre_completo}` : 'Sistema CACEI'}
                    </p>
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50px',
                        display: 'inline-block',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                        <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: '500' }}>
                             Gestiona tus resultados de aprendizaje y encuestas de manera eficiente
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {[
                    { icon: <FiClipboard />, title: 'Resultados', count: 'Gestiona', color: '#009688', bg: '#E0F2F1' },
                    { icon: <FiBarChart2 />, title: 'Encuestas', count: 'Crea', color: '#00796B', bg: '#B2DFDB' },
                    { icon: <FiPieChart />, title: 'Análisis', count: 'Visualiza', color: '#004D40', bg: '#80CBC4' },
                    { icon: <FiTrendingUp />, title: 'Resultados', count: 'Exporta', color: '#00695C', bg: '#4DB6AC' }
                ].map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #E2E8F0',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 150, 136, 0.15)';
                            e.currentTarget.style.borderColor = stat.color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.borderColor = '#E2E8F0';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '80px',
                            height: '80px',
                            background: stat.bg,
                            borderRadius: '50%',
                            opacity: 0.5
                        }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '2rem', color: stat.color, marginBottom: '0.5rem' }}>
                                {stat.icon}
                            </div>
                            <h3 style={{ margin: '0 0 0.25rem 0', color: '#2D3748', fontSize: '0.95rem', fontWeight: '600' }}>
                                {stat.title}
                            </h3>
                            <p style={{ margin: 0, color: stat.color, fontSize: '1.25rem', fontWeight: 'bold' }}>
                                {stat.count}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Feature Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginBottom: '2.5rem'
            }}>
                {/* Card 1: Gestión de Rúbricas */}
                <div
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        border: '2px solid transparent',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 150, 136, 0.2)';
                        e.currentTarget.style.borderColor = '#009688';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '5px',
                        background: 'linear-gradient(90deg, #009688 0%, #00796B 100%)'
                    }} />
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A202C', marginBottom: '1rem' }}>
                        Gestión de Resultados de Aprendizaje
                    </h2>
                    <p style={{ color: '#4A5568', lineHeight: '1.8', fontSize: '1rem', marginBottom: '1.5rem' }}>
                        Crea y administra resultados de aprendizaje con sus criterios de evaluación.
                        Puedes definir niveles de desempeño y mantener un historial de cambios.
                    </p>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        {['Crear', 'Editar', 'Historial', 'Niveles'].map((tag, i) => (
                            <span key={i} style={{
                                padding: '0.4rem 0.9rem',
                                background: '#E0F2F1',
                                color: '#00796B',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#009688', fontWeight: '600' }}>
                            <FiCheckCircle /> Explorar funcionalidad →
                        </div>
                    </div>
                </div>

                {/* Card 2: Encuestas */}
                <div
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        border: '2px solid transparent',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 150, 136, 0.2)';
                        e.currentTarget.style.borderColor = '#009688';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '5px',
                        background: 'linear-gradient(90deg, #00796B 0%, #004D40 100%)'
                    }} />
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A202C', marginBottom: '1rem' }}>
                        Creación de Encuestas
                    </h2>
                    <p style={{ color: '#4A5568', lineHeight: '1.8', fontSize: '1rem', marginBottom: '1.5rem' }}>
                        Diseña encuestas personalizadas vinculadas a resultados de aprendizaje.
                        Genera invitaciones con PIN para compartir con encuestados externos.
                    </p>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        {['PINs', 'Invitaciones', 'Datos', 'Acceso'].map((tag, i) => (
                            <span key={i} style={{
                                padding: '0.4rem 0.9rem',
                                background: '#B2DFDB',
                                color: '#004D40',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00796B', fontWeight: '600' }}>
                            <FiCheckCircle /> Explorar funcionalidad →
                        </div>
                    </div>
                </div>

                {/* Card 3: Resultados y Análisis */}
                <div
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        border: '2px solid transparent',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 150, 136, 0.2)';
                        e.currentTarget.style.borderColor = '#009688';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '5px',
                        background: 'linear-gradient(90deg, #004D40 0%, #00695C 100%)'
                    }} />
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A202C', marginBottom: '1rem' }}>
                        Resultados y Análisis
                    </h2>
                    <p style={{ color: '#4A5568', lineHeight: '1.8', fontSize: '1rem', marginBottom: '1.5rem' }}>
                        Visualiza y analiza las respuestas de las encuestas con gráficas interactivas.
                        Exporta datos a CSV para análisis adicional.
                    </p>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        {['Gráficas', 'Tablas', 'Filtros', 'CSV'].map((tag, i) => (
                            <span key={i} style={{
                                padding: '0.4rem 0.9rem',
                                background: '#80CBC4',
                                color: '#004D40',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#004D40', fontWeight: '600' }}>
                            <FiCheckCircle /> Explorar funcionalidad →
                        </div>
                    </div>
                </div>

                {/* Card 4: Gestión de Usuarios (solo admin) */}
                {user?.rol === 'administrador' && (
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            padding: '2rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            border: '2px solid transparent',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 150, 136, 0.2)';
                            e.currentTarget.style.borderColor = '#009688';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '5px',
                            background: 'linear-gradient(90deg, #00695C 0%, #009688 100%)'
                        }} />
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            position: 'relative'
                        }}>
                            👥
                            <span style={{
                                position: 'absolute',
                                top: 0,
                                right: '-10px',
                                background: '#FF6B6B',
                                color: 'white',
                                fontSize: '0.7rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '10px',
                                fontWeight: 'bold'
                            }}>
                                ADMIN
                            </span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A202C', marginBottom: '1rem' }}>
                            Gestión de Usuarios
                        </h2>
                        <p style={{ color: '#4A5568', lineHeight: '1.8', fontSize: '1rem', marginBottom: '1.5rem' }}>
                            Como administrador, puedes gestionar los usuarios del sistema,
                            crear nuevos administradores y controlar el acceso.
                        </p>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            {['Crear', 'Editar', 'Activar', 'Estadísticas'].map((tag, i) => (
                                <span key={i} style={{
                                    padding: '0.4rem 0.9rem',
                                    background: '#4DB6AC',
                                    color: '#FFFFFF',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00695C', fontWeight: '600' }}>
                                <FiCheckCircle /> Explorar funcionalidad →
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Start Guide */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2.5rem',
                boxShadow: '0 8px 20px rgba(0, 150, 136, 0.12)',
                border: '2px solid #009688',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E0F2F1 100%)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                    <h2 style={{ color: '#009688', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                        Guía de Inicio Rápido
                    </h2>
                    <p style={{ color: '#4A5568', fontSize: '1.1rem' }}>
                        Sigue estos pasos para comenzar a usar el sistema
                    </p>
                </div>
                <div style={{
                    display: 'grid',
                    gap: '1.5rem',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    {[
                        {
                            num: '1',
                            title: 'Gestionar Resultados de Aprendizaje',
                            desc: 'Ve a "Rúbricas" en el menú para crear y administrar resultados de aprendizaje con sus criterios de evaluación y niveles de desempeño.',
                            icon: <FiBook />
                        },
                        {
                            num: '2',
                            title: 'Crear una Encuesta',
                            desc: 'En "Encuestas", selecciona "Crear Encuesta" para diseñar una nueva encuesta vinculando preguntas a los resultados de aprendizaje.',
                            icon: <FiClipboard />
                        },
                        {
                            num: '3',
                            title: 'Generar Invitaciones con PIN',
                            desc: 'Desde el listado de encuestas, accede al detalle de una encuesta y genera invitaciones con PINs únicos para compartir.',
                            icon: <FiUsers />
                        },
                        {
                            num: '4',
                            title: 'Compartir con Encuestados',
                            desc: 'Los encuestados externos acceden usando la URL con el PIN generado y completan la encuesta sin necesidad de autenticarse.',
                            icon: <FiBarChart2 />
                        },
                        {
                            num: '5',
                            title: 'Ver Resultados y Análisis',
                            desc: 'En el detalle de cada encuesta, consulta los resultados con gráficas de distribución por nivel y exporta los datos a CSV.',
                            icon: <FiAward />
                        }
                    ].map((step, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1.5rem',
                                padding: '1.5rem',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                border: '2px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(10px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 150, 136, 0.15)';
                                e.currentTarget.style.borderColor = '#009688';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            <div style={{
                                backgroundColor: '#009688',
                                color: 'white',
                                borderRadius: '50%',
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)'
                            }}>
                                {step.num}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ color: '#009688', fontSize: '1.25rem' }}>{step.icon}</div>
                                    <h3 style={{ margin: 0, color: '#1A202C', fontSize: '1.15rem', fontWeight: '600' }}>
                                        {step.title}
                                    </h3>
                                </div>
                                <p style={{ margin: 0, color: '#4A5568', lineHeight: '1.7', fontSize: '0.95rem' }}>
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Help Section */}
            <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)',
                borderLeft: '5px solid #009688',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 150, 136, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>💡</div>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', color: '#1A202C', fontSize: '1.1rem' }}>
                            Consejo Rápido
                        </h3>
                        <p style={{ margin: 0, color: '#2D3748', fontSize: '1rem', lineHeight: '1.6' }}>
                            Utiliza la barra de navegación superior para acceder rápidamente a todas las funciones del sistema.
                            Si tienes dudas, cada sección cuenta con tooltips y mensajes de ayuda.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
