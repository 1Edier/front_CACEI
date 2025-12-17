# Manual de Usuario - Frontend CACEI

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Ejecución](#ejecución)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Funcionalidades Principales](#funcionalidades-principales)
8. [Guía de Uso](#guía-de-uso)
9. [Tecnologías Utilizadas](#tecnologías-utilizadas)
10. [Solución de Problemas](#solución-de-problemas)

---

## Descripción General

El Frontend CACEI es una aplicación web desarrollada con React que proporciona una interfaz de usuario moderna e intuitiva para la gestión de:

- **Autenticación de usuarios**: Login y registro
- **Gestión de usuarios**: Administración de usuarios del sistema
- **Resultados de Aprendizaje (Rúbricas)**: Creación, edición y visualización de rúbricas de evaluación
- **Encuestas**: Creación de encuestas, respuesta a encuestas y visualización de resultados
- **Dashboard**: Página principal con estadísticas y accesos rápidos

La aplicación se conecta a un backend API RESTful desplegado en Render.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 14 o superior)
- **npm** (Node Package Manager)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

---

## Instalación

### Paso 1: Navegar al Directorio del Proyecto

```bash
cd CACEI
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias, incluyendo:

**Dependencias principales:**
- `react` y `react-dom`: Framework de interfaz de usuario
- `react-router-dom`: Enrutamiento de la aplicación
- `axios`: Cliente HTTP para comunicación con la API
- `framer-motion`: Animaciones fluidas
- `react-icons`: Iconos
- `recharts`: Gráficos y visualizaciones
- `sweetalert2`: Alertas y modales elegantes
- `react-datepicker`: Selector de fechas

**Dependencias de desarrollo:**
- `vite`: Herramienta de build y desarrollo
- `tailwindcss`: Framework CSS
- `eslint`: Linter para código JavaScript

---

## Configuración

### Configuración de la API

El archivo que conecta el frontend con el backend es [src/api/apiService.js](src/api/apiService.js).

**URL del Backend (Configuración Actual):**

```javascript
const API_URL = 'https://back-cacei.onrender.com/api/v1';
```

Si necesitas cambiar la URL del backend (por ejemplo, para desarrollo local):

1. Abre [src/api/apiService.js](src/api/apiService.js)
2. Modifica la línea 5:
   ```javascript
   const API_URL = 'http://localhost:3000/api/v1';  // Para desarrollo local
   ```

### Configuración de Tailwind CSS

La aplicación utiliza Tailwind CSS para los estilos. La configuración está en [tailwind.config.js](tailwind.config.js).

---

## Ejecución

### Modo Desarrollo

```bash
npm run dev
```

Este comando:
- Inicia el servidor de desarrollo de Vite
- Abre la aplicación en `http://localhost:5173` (por defecto)
- Habilita Hot Module Replacement (HMR) para recarga automática al editar archivos

### Modo Producción

#### 1. Construir la Aplicación

```bash
npm run build
```

Este comando genera una versión optimizada de la aplicación en la carpeta `dist/`.

#### 2. Previsualizar el Build

```bash
npm run preview
```

Este comando inicia un servidor para previsualizar la versión de producción.

#### 3. Iniciar en Producción

```bash
npm start
```

Este comando ejecuta la aplicación en modo producción usando el puerto especificado en la variable de entorno `$PORT`.

---

## Estructura del Proyecto

```
CACEI/
│
├── public/               # Archivos estáticos
│   └── logo.png
│
├── src/                  # Código fuente
│   ├── api/              # Servicios de API
│   │   └── apiService.js # Configuración de axios y endpoints
│   │
│   ├── assets/           # Recursos (imágenes, iconos)
│   │
│   ├── components/       # Componentes reutilizables
│   │   ├── Layout.jsx    # Layout principal de la app
│   │   ├── Navbar.jsx    # Barra de navegación
│   │   ├── Sidebar.jsx   # Menú lateral
│   │   └── PrivateRoute.jsx # Protección de rutas
│   │
│   ├── contexts/         # Contextos de React
│   │   └── AuthContext.jsx # Contexto de autenticación
│   │
│   ├── hooks/            # Custom hooks
│   │   └── useAuth.js    # Hook de autenticación
│   │
│   ├── pages/            # Páginas de la aplicación
│   │   ├── HomePage.jsx              # Dashboard principal
│   │   ├── LoginPage.jsx             # Inicio de sesión
│   │   ├── UsuariosPage.jsx          # Gestión de usuarios
│   │   ├── ResultadosListPage.jsx    # Lista de rúbricas
│   │   ├── ResultadoFormPage.jsx     # Crear/editar rúbrica
│   │   ├── ResultadoDetailPage.jsx   # Detalle de rúbrica
│   │   ├── ResultadoHistoryPage.jsx  # Historial de rúbrica
│   │   ├── EncuestaListPage.jsx      # Lista de encuestas
│   │   ├── EncuestaCreatePage.jsx    # Crear encuesta
│   │   ├── EncuestaResponderPage.jsx # Responder encuesta
│   │   ├── EncuestaResultadosPage.jsx# Resultados de encuesta
│   │   └── GraciasPage.jsx           # Página de agradecimiento
│   │
│   ├── styles/           # Estilos adicionales
│   │
│   ├── App.jsx           # Componente principal con rutas
│   ├── App.css           # Estilos del App
│   ├── main.jsx          # Punto de entrada de React
│   └── index.css         # Estilos globales y Tailwind
│
├── .gitignore            # Archivos ignorados por git
├── eslint.config.js      # Configuración de ESLint
├── index.html            # HTML principal
├── package.json          # Dependencias y scripts
├── tailwind.config.js    # Configuración de Tailwind
└── vite.config.js        # Configuración de Vite
```

---

## Funcionalidades Principales

### 1. Autenticación

#### Login
- Los usuarios pueden iniciar sesión con su correo y contraseña
- Al autenticarse, reciben un token JWT que se almacena en localStorage
- El token se envía automáticamente en todas las peticiones protegidas

#### Protección de Rutas
- Las rutas privadas solo son accesibles para usuarios autenticados
- Si un usuario no autenticado intenta acceder a una ruta privada, es redirigido al login

### 2. Dashboard (Página Principal)

La página de inicio ([pages/HomePage.jsx](src/pages/HomePage.jsx)) muestra:

- **Estadísticas generales**: Total de usuarios, rúbricas y encuestas
- **Gráficos**: Visualizaciones de datos con recharts
- **Accesos rápidos**: Botones para las funcionalidades principales
- **Actividad reciente**: Lista de las últimas acciones

### 3. Gestión de Usuarios

Desde [pages/UsuariosPage.jsx](src/pages/UsuariosPage.jsx) los administradores pueden:

- **Ver todos los usuarios** del sistema en una tabla
- **Crear nuevos usuarios** con nombre, apellido, correo, contraseña y rol
- **Editar usuarios existentes**: Modificar información y cambiar estado (activo/inactivo)
- **Eliminar usuarios**: Desactivar usuarios del sistema

**Roles disponibles:**
- Docente
- Coordinador
- Administrador

### 4. Resultados de Aprendizaje (Rúbricas)

#### Lista de Rúbricas ([ResultadosListPage.jsx](src/pages/ResultadosListPage.jsx))
- Visualiza todas las rúbricas creadas
- Búsqueda y filtrado de rúbricas
- Acceso rápido a ver detalles, editar o eliminar

#### Crear/Editar Rúbrica ([ResultadoFormPage.jsx](src/pages/ResultadoFormPage.jsx))
- **Información básica**: Código, descripción, nivel
- **Criterios de evaluación**: Agregar múltiples criterios con peso
- **Niveles de desempeño**: Definir escalas de evaluación
- Validación de formularios

#### Detalle de Rúbrica ([ResultadoDetailPage.jsx](src/pages/ResultadoDetailPage.jsx))
- Visualización completa de la rúbrica
- Todos los criterios y niveles de desempeño
- Opciones para editar o ver historial

#### Historial ([ResultadoHistoryPage.jsx](src/pages/ResultadoHistoryPage.jsx))
- Muestra todas las versiones anteriores de una rúbrica
- Permite ver qué cambios se hicieron y cuándo
- Control de versiones completo

### 5. Encuestas

#### Lista de Encuestas ([EncuestaListPage.jsx](src/pages/EncuestaListPage.jsx))
- Visualiza todas las encuestas creadas
- Información sobre estado (activa/inactiva)
- Acceso a crear nueva encuesta, ver resultados o generar invitaciones

#### Crear Encuesta ([EncuestaCreatePage.jsx](src/pages/EncuestaCreatePage.jsx))
- **Información básica**: Título, descripción, tipo de encuesta
- **Preguntas**: Agregar múltiples preguntas
  - Tipos: Opción múltiple, texto libre, escala Likert
  - Opciones de respuesta configurables
  - Orden de preguntas
- **Vista previa**: Ver cómo se verá la encuesta antes de crearla

#### Responder Encuesta ([EncuestaResponderPage.jsx](src/pages/EncuestaResponderPage.jsx))
- **Acceso público**: Disponible mediante PIN de invitación
- **Interfaz intuitiva**: Responder todas las preguntas paso a paso
- **Validación**: Asegura que todas las preguntas requeridas sean respondidas
- **Confirmación**: Página de agradecimiento al finalizar

#### Resultados de Encuesta ([EncuestaResultadosPage.jsx](src/pages/EncuestaResultadosPage.jsx))
- **Estadísticas generales**: Número de respuestas, tasa de completitud
- **Gráficos**: Visualización de resultados por pregunta
  - Gráficos de barras para opciones múltiples
  - Promedios para escalas Likert
  - Lista de respuestas para preguntas abiertas
- **Exportación**: Descargar resultados (funcionalidad futura)

---

## Guía de Uso

### Primera Vez Usando la Aplicación

#### Paso 1: Iniciar Sesión

1. Abre la aplicación en tu navegador
2. Serás redirigido a la página de login
3. Ingresa tu correo y contraseña
4. Haz clic en "Iniciar Sesión"

#### Paso 2: Navegar por el Dashboard

1. Después del login, verás el Dashboard principal
2. Explora las estadísticas y gráficos
3. Usa el menú lateral (Sidebar) para navegar a diferentes secciones

#### Paso 3: Usar el Menú de Navegación

**Sidebar (Menú Lateral):**
- Inicio (Dashboard)
- Usuarios
- Resultados de Aprendizaje
- Encuestas

**Navbar (Barra Superior):**
- Logo de la aplicación
- Nombre de usuario
- Botón de cerrar sesión

### Crear una Rúbrica

1. En el Sidebar, haz clic en "Resultados de Aprendizaje"
2. Haz clic en el botón "Nueva Rúbrica"
3. Completa el formulario:
   - Código: Ej. "RA-001"
   - Descripción: Ej. "Analizar sistemas de información"
   - Nivel: Selecciona el nivel apropiado
4. Agrega criterios de evaluación:
   - Haz clic en "Agregar Criterio"
   - Ingresa la descripción del criterio
   - Asigna un peso (porcentaje)
5. Define niveles de desempeño (Excelente, Bueno, Suficiente, Insuficiente)
6. Haz clic en "Guardar"

### Crear una Encuesta

1. En el Sidebar, haz clic en "Encuestas"
2. Haz clic en "Nueva Encuesta"
3. Completa la información básica:
   - Título de la encuesta
   - Descripción
   - Tipo (Satisfacción, Evaluación, etc.)
4. Agrega preguntas:
   - Haz clic en "Agregar Pregunta"
   - Selecciona el tipo de pregunta
   - Escribe el texto de la pregunta
   - Si es opción múltiple, agrega las opciones
5. Vista previa de la encuesta
6. Haz clic en "Crear Encuesta"

### Generar Invitación para Encuesta

1. En la lista de encuestas, haz clic en "Generar PIN"
2. Opcionalmente, ingresa el correo del destinatario
3. Se generará un PIN único
4. Comparte el enlace con el PIN a los participantes
5. Los participantes pueden responder sin necesidad de login

### Ver Resultados de una Encuesta

1. En la lista de encuestas, haz clic en "Ver Resultados"
2. Visualiza las estadísticas generales
3. Revisa los gráficos de cada pregunta
4. Analiza las respuestas abiertas

---

## Tecnologías Utilizadas

### Framework y Bibliotecas Principales

- **React 19.1.1**: Biblioteca de interfaz de usuario
- **React Router DOM 7.9.5**: Enrutamiento y navegación
- **Vite 7.1.7**: Build tool y servidor de desarrollo

### Comunicación con API

- **Axios 1.13.2**: Cliente HTTP para peticiones al backend

### Estilos y UI

- **Tailwind CSS 4.1.16**: Framework CSS utility-first
- **Framer Motion 12.23.24**: Animaciones fluidas y transiciones
- **React Icons 5.5.0**: Iconos SVG

### Componentes Especializados

- **Recharts 3.5.0**: Gráficos y visualizaciones de datos
- **SweetAlert2 11.26.3**: Alertas y modales elegantes
- **React DatePicker 8.10.0**: Selector de fechas

### Herramientas de Desarrollo

- **ESLint**: Linter para mantener calidad del código
- **PostCSS**: Procesamiento de CSS
- **Autoprefixer**: Prefijos CSS automáticos

---

## Solución de Problemas

### La aplicación no inicia

**Problema**: Error al ejecutar `npm run dev`

**Soluciones**:
1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que las dependencias estén instaladas: `npm install`
3. Elimina `node_modules` y reinstala:
   ```bash
   rm -rf node_modules
   npm install
   ```
4. Limpia la caché de npm:
   ```bash
   npm cache clean --force
   ```

### No puedo iniciar sesión

**Problema**: Error al intentar hacer login

**Soluciones**:
1. Verifica que el backend esté corriendo y accesible
2. Verifica la URL del backend en [src/api/apiService.js](src/api/apiService.js:5)
3. Abre la consola del navegador (F12) y revisa si hay errores de red
4. Verifica que las credenciales sean correctas

### Error de CORS

**Problema**: Error de CORS en la consola del navegador

**Soluciones**:
1. Verifica que el backend tenga CORS habilitado
2. Verifica que la URL del backend sea correcta
3. Si estás en desarrollo local, asegúrate de que el backend acepte peticiones de `http://localhost:5173`

### Las páginas están en blanco

**Problema**: La aplicación carga pero las páginas están vacías

**Soluciones**:
1. Abre la consola del navegador (F12) y revisa errores de JavaScript
2. Verifica que el token de autenticación sea válido
3. Cierra sesión y vuelve a iniciar sesión
4. Limpia el localStorage del navegador:
   ```javascript
   localStorage.clear()
   ```

### Los estilos no se aplican correctamente

**Problema**: La aplicación se ve sin estilos o desordenada

**Soluciones**:
1. Verifica que Tailwind CSS esté correctamente configurado
2. Reconstruye la aplicación:
   ```bash
   npm run build
   ```
3. Reinicia el servidor de desarrollo
4. Limpia la caché del navegador (Ctrl + Shift + Delete)

### Error al crear encuesta o rúbrica

**Problema**: No se puede guardar la información

**Soluciones**:
1. Verifica que todos los campos requeridos estén completos
2. Revisa la consola para ver mensajes de validación
3. Verifica que el backend esté funcionando correctamente
4. Verifica que el token de autenticación no haya expirado

### Las animaciones van lentas

**Problema**: La aplicación se siente lenta o pesada

**Soluciones**:
1. Cierra otras pestañas del navegador
2. Usa un navegador moderno actualizado
3. Verifica que tu computadora cumpla con los requisitos mínimos
4. Desactiva extensiones del navegador que puedan interferir

---

## Navegadores Soportados

La aplicación funciona correctamente en:

- Google Chrome (versión 90+)
- Mozilla Firefox (versión 88+)
- Microsoft Edge (versión 90+)
- Safari (versión 14+)

---

## Características de Seguridad

### Autenticación

- Tokens JWT con expiración de 1 día
- Almacenamiento seguro en localStorage
- Redirección automática al login si el token expira

### Protección de Rutas

- Rutas privadas protegidas por el componente `PrivateRoute`
- Verificación de autenticación antes de renderizar páginas
- Redireccionamiento automático a login para usuarios no autenticados

### Validación de Formularios

- Validación del lado del cliente antes de enviar datos
- Mensajes de error claros para el usuario
- Prevención de envío de datos inválidos

---

## Mejores Prácticas de Uso

### Para Usuarios

1. **Cierra sesión** cuando termines de usar la aplicación en computadoras compartidas
2. **Usa contraseñas fuertes** para tu cuenta
3. **No compartas** tu token de autenticación
4. **Reporta errores** al administrador del sistema

### Para Administradores

1. **Respaldos regulares**: Aunque los datos están en el backend, mantén respaldos
2. **Gestión de usuarios**: Desactiva cuentas de usuarios que ya no necesiten acceso
3. **Monitoreo**: Revisa regularmente las estadísticas del dashboard
4. **Actualización**: Mantén la aplicación actualizada con las últimas versiones

---

## Atajos de Teclado

- **Ctrl + K**: Búsqueda rápida (si está implementada)
- **Esc**: Cerrar modales
- **Enter**: Confirmar en formularios
- **Tab**: Navegar entre campos de formulario

---

## Recursos Adicionales

### Documentación de Tecnologías

- [React Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Recharts Docs](https://recharts.org/)
- [SweetAlert2 Docs](https://sweetalert2.github.io/)

### Soporte

Para problemas técnicos, preguntas o sugerencias:
- Contacta al equipo de desarrollo
- Revisa el manual del backend para problemas relacionados con la API

---

## Actualizaciones y Versiones

### Cómo Actualizar la Aplicación

1. Obtén la última versión del código
2. Instala las nuevas dependencias:
   ```bash
   npm install
   ```
3. Construye la nueva versión:
   ```bash
   npm run build
   ```
4. Reinicia la aplicación

---

## Glosario

- **Rúbrica**: Herramienta de evaluación que establece criterios y niveles de desempeño
- **Resultado de Aprendizaje**: Declaración de lo que un estudiante debe ser capaz de hacer
- **PIN**: Código de acceso único para responder encuestas sin autenticación
- **JWT**: JSON Web Token, mecanismo de autenticación
- **Dashboard**: Panel principal con resumen de información
- **CORS**: Cross-Origin Resource Sharing, política de seguridad de navegadores
- **HMR**: Hot Module Replacement, recarga automática durante desarrollo

---

**Versión del Manual**: 1.0
**Fecha de Actualización**: Diciembre 2025
**Autor**: Equipo de Desarrollo CACEI
