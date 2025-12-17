import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <main>{children}</main>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {isSidebarOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                        display: 'none'
                    }}
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: '#F7FAFC',
                minWidth: 0,
                width: '100%'
            }}>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="mobile-menu-toggle"
                    style={{
                        display: 'none',
                        position: 'fixed',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 1001,
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        fontSize: '1.5rem',
                        lineHeight: 1
                    }}
                >
                    ☰
                </button>
                <div style={{ padding: '0 0.5rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;