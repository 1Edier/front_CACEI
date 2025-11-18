import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main>
                <div className="container">
                    {children}
                </div>
            </main>
            {/* Puedes agregar un footer aquí si lo deseas */}
        </>
    );
};

export default Layout;