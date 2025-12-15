import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Para rutas públicas como Login, no mostramos el layout principal
        return <main>{children}</main>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '2rem', backgroundColor: '#F7FAFC' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;