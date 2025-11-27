// CACEI/src/pages/GraciasPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Form.css'; // O cualquier estilo general que tengas

const GraciasPage = () => {
    return (
        <div className="form-container" style={{ textAlign: 'center', maxWidth: '600px', margin: '50px auto', padding: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h1>¡Gracias por responder la encuesta!</h1>
            <p>Tu participación es muy valiosa para nosotros.</p>
            
        </div>
    );
};

export default GraciasPage;
