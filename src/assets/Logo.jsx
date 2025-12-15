import React from 'react';
// Paso 1: Importamos la imagen PNG desde la misma carpeta.
// React (a través de Vite/Webpack) procesará esta imagen y nos dará la ruta correcta.
import logoImage from './logo.png';

const Logo = ({ className }) => (
  // Paso 2: Reemplazamos el <svg> por una etiqueta <img>.
  <img 
    src={logoImage} // La fuente de la imagen es la que importamos.
    alt="Logo de la Universidad" // Texto alternativo para accesibilidad.
    className={className} // Mantenemos la clase para que los estilos sigan funcionando.
  />
);

export default Logo;