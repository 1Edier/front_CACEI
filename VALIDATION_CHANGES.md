# Validación de Rúbricas - Cambios Implementados

## Resumen
Se ha implementado un sistema completo de validación para la creación y edición de rúbricas (Resultados de Aprendizaje), asegurando que no se puedan guardar rúbricas incompletas. Incluye validación de criterios, indicadores y **descriptores por nivel**.

## Archivo Modificado

### **src/pages/ResultadoFormPage.jsx**

## Validaciones Implementadas

### 1. **Validación de Criterios**
- ✅ Debe haber al menos un criterio
- ✅ Cada criterio debe tener un nombre (no vacío)
- ✅ Cada criterio debe tener al menos un indicador

### 2. **Validación de Indicadores**
- ✅ Cada indicador debe tener un nombre (no vacío)
- ✅ Los indicadores sin nombre son detectados y reportados

### 3. **Validación de Descriptores por Nivel** ⭐ NUEVO
- ✅ Cada indicador debe tener descriptores completos para TODOS los niveles
- ✅ No se permite dejar ningún descriptor vacío
- ✅ Validación nivel por nivel con mensajes específicos

### 3. **Función de Validación Completa**

```javascript
const validateRubrica = () => {
    // Validar que haya al menos un criterio
    if (formData.estructura.criterios.length === 0) {
        setError('Debes agregar al menos un criterio antes de guardar la rúbrica.');
        return false;
    }

    // Validar que cada criterio tenga nombre
    const criteriosSinNombre = formData.estructura.criterios.some(c => !c.nombre.trim());
    if (criteriosSinNombre) {
        setError('Todos los criterios deben tener un nombre.');
        return false;
    }

    // Validar que cada criterio tenga al menos un indicador
    const criteriosSinIndicadores = formData.estructura.criterios.some(c => c.indicadores.length === 0);
    if (criteriosSinIndicadores) {
        setError('Cada criterio debe tener al menos un indicador.');
        return false;
    }

    // Validar que cada indicador tenga nombre y descriptores completos
    for (let i = 0; i < formData.estructura.criterios.length; i++) {
        const criterio = formData.estructura.criterios[i];

        // Validar nombre del indicador
        const indicadoresSinNombre = criterio.indicadores.some(ind => !ind.nombre.trim());
        if (indicadoresSinNombre) {
            setError(`El criterio "${criterio.nombre}" tiene indicadores sin nombre.`);
            return false;
        }

        // ⭐ NUEVO: Validar descriptores de cada indicador
        for (let j = 0; j < criterio.indicadores.length; j++) {
            const indicador = criterio.indicadores[j];

            // Verificar que todos los descriptores estén completos
            for (const nivel of formData.estructura.niveles) {
                const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
                const descriptor = indicador.descriptores[nivelKey];

                if (!descriptor || !descriptor.trim()) {
                    setError(`El indicador "${indicador.nombre}" del criterio "${criterio.nombre}" debe tener una descripción para el nivel "${nivel}".`);
                    return false;
                }
            }
        }
    }

    return true;
};
```

## Mejoras Visuales Implementadas

### 1. **Validación Visual de Descriptores** ⭐ NUEVO

Cada campo de descriptor ahora muestra:

**Descriptores Incompletos (Rojo):**
- 🔴 Borde rojo grueso (2px) en la tarjeta del descriptor
- 🔴 Punto rojo en la esquina superior derecha
- 🔴 Badge "Requerido" en blanco sobre el label
- 🔴 Placeholder con asterisco (*) indicando obligatorio
- 🔴 Borde rojo en el textarea

**Descriptores Completos (Verde):**
- ✓ Marca de verificación verde en el label
- Borde normal gris
- Sin indicadores de alerta

```jsx
{formData.estructura.niveles.map((nivel) => {
    const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
    const hasValue = indicador.descriptores[nivelKey]?.trim().length > 0;

    return (
        <div
            className="descriptor-item"
            style={{
                border: !hasValue ? '2px solid #FC8181' : '1px solid #e2e8f0',
                position: 'relative'
            }}
        >
            <label style={{
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                {nivel}
                {hasValue ? (
                    <span>✓</span>
                ) : (
                    <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '10px'
                    }}>
                        Requerido
                    </span>
                )}
            </label>
            <textarea
                placeholder={`Descripción para nivel ${nivel.toLowerCase()} *`}
                style={{
                    borderColor: !hasValue ? '#FC8181' : undefined
                }}
            />
            {!hasValue && (
                <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#FC8181',
                    borderRadius: '50%',
                    border: '2px solid white'
                }} />
            )}
        </div>
    );
})}
```

### 2. **Contador de Descriptores en Acordeón** ⭐ NUEVO

Cada indicador muestra un contador en tiempo real:

- 🟢 **Verde**: Cuando todos los niveles están completos (ej: "5/5 niveles")
- 🔴 **Rojo**: Cuando faltan descriptores (ej: "2/5 niveles")
- 🔴 **Borde Rojo**: El acordeón completo se marca con borde rojo si faltan descriptores

```jsx
// Calcular descriptores completos
const totalNiveles = formData.estructura.niveles.length;
const descriptoresCompletos = formData.estructura.niveles.filter(nivel => {
    const nivelKey = nivel.toLowerCase().replace(/ /g, '_');
    return indicador.descriptores[nivelKey]?.trim().length > 0;
}).length;
const todosCompletos = descriptoresCompletos === totalNiveles;

<div
    className="indicador-accordion"
    style={{
        border: !todosCompletos ? '2px solid #FC8181' : '1px solid #e2e8f0'
    }}
>
    <span style={{
        color: todosCompletos ? '#38A169' : '#F56565',
        fontWeight: '600'
    }}>
        {descriptoresCompletos}/{totalNiveles} niveles
    </span>
</div>
```

### 3. **Título con Advertencia** ⭐ NUEVO

Encima de la sección de descriptores se muestra:

```
Descriptores por Nivel * Todos los niveles son requeridos
```

En color rojo (#E53E3E) para enfatizar que es obligatorio.

### 4. **Indicador de Estado Global**
Se muestra en la parte superior del formulario cuando hay criterios:

- **Estado Válido (Verde)**: ✅
  - Fondo: Verde claro (#D4EDDA)
  - Borde: Verde (#C3E6CB)
  - Texto: "Lista para Guardar"
  - Muestra conteo de criterios completos e indicadores

- **Estado Inválido (Amarillo)**: ⚠️
  - Fondo: Amarillo claro (#FFF3CD)
  - Borde: Amarillo (#FFE69C)
  - Texto: "Incompleta"
  - Mensaje adicional: "Completa todos los criterios con al menos un indicador"

```jsx
{totalCriterios > 0 && (
    <div style={{...}}>
        <span>{isFormValid ? '✅' : '⚠️'}</span>
        <div>
            Estado de la Rúbrica: {isFormValid ? 'Lista para Guardar' : 'Incompleta'}
            {criteriosValidos} de {totalCriterios} criterios completos • {totalIndicadores} indicadores en total
        </div>
    </div>
)}
```

### 2. **Indicadores Visuales en Tabs de Criterios**

Cada criterio en el panel lateral muestra:

- **Borde Izquierdo Rojo**: Cuando el criterio está incompleto
- **Punto Rojo**: En la esquina del número del criterio
- **Texto de Alerta**: ⚠️ junto al nombre si falta
- **Texto Rojo**: En el conteo de indicadores si es 0
- **Mensaje "⚠️ Requerido"**: Cuando no hay indicadores

```jsx
const hasIndicadores = criterio.indicadores.length > 0;
const hasName = criterio.nombre.trim().length > 0;
const isValid = hasIndicadores && hasName;

<button style={{ borderLeft: !isValid ? '4px solid #F56565' : '4px solid transparent' }}>
    <div className="tab-number">
        {index + 1}
        {!isValid && <span style={{...}} />} {/* Punto rojo */}
    </div>
    <div className="tab-meta" style={{ color: !hasIndicadores ? '#F56565' : undefined }}>
        {criterio.indicadores.length} indicadores
        {!hasIndicadores && ' ⚠️ Requerido'}
    </div>
</button>
```

### 3. **Mensajes de Error Mejorados**

```jsx
{error && (
    <div className="form-feedback error">
        ⚠️ {error}
    </div>
)}
```

### 4. **Botón de Guardar Deshabilitado**

El botón "Guardar Rúbrica" se deshabilita automáticamente cuando:
- No hay criterios creados
- Muestra tooltip explicativo al pasar el mouse

```jsx
<button
    type="submit"
    className="btn btn-primary btn-submit"
    disabled={loading || formData.estructura.criterios.length === 0}
    title={formData.estructura.criterios.length === 0
        ? 'Debes agregar al menos un criterio con un indicador'
        : ''
    }
>
    {loading ? 'Guardando...' : 'Guardar Rúbrica'}
</button>
```

### 5. **Mensaje Informativo**

Cuando no hay criterios, se muestra un mensaje amarillo informativo:

```jsx
{formData.estructura.criterios.length === 0 && (
    <div style={{
        backgroundColor: '#FFF3CD',
        border: '1px solid #FFE69C',
        borderRadius: '8px',
        color: '#856404',
        padding: '1rem',
        textAlign: 'center'
    }}>
        💡 Recuerda: Debes agregar al menos un criterio con un indicador
           antes de guardar la rúbrica.
    </div>
)}
```

## Flujo de Validación

1. **Al Intentar Guardar**:
   - Se ejecuta `validateRubrica()`
   - Si falla alguna validación, se muestra el error específico
   - No se envía el formulario

2. **Mensajes de Error Específicos**:
   - "Debes agregar al menos un criterio antes de guardar la rúbrica."
   - "Todos los criterios deben tener un nombre."
   - "Cada criterio debe tener al menos un indicador."
   - "El criterio '[nombre]' tiene indicadores sin nombre."

3. **Indicadores Visuales en Tiempo Real**:
   - El estado global se actualiza automáticamente
   - Los tabs de criterios muestran alertas visuales
   - El botón de guardar se habilita/deshabilita dinámicamente

## Casos de Uso

### ✅ Caso Válido
```
✅ Rúbrica con:
   - Código: "RA-001"
   - Descripción: "Comunicación efectiva"
   - 2 Criterios con nombres
   - Cada criterio con al menos 1 indicador nombrado
   - Cada indicador con TODOS los descriptores completos (5/5 niveles)

   → Estado: "Lista para Guardar" (Verde)
   → Botón: Habilitado
   → Contador: "5/5 niveles" en verde
   → Descriptores: Bordes normales, checkmarks verdes
```

### ❌ Caso Inválido 1
```
⚠️ Rúbrica con:
   - Código: "RA-001"
   - Descripción: "Comunicación efectiva"
   - 0 Criterios

   → Estado: No se muestra (sin criterios)
   → Botón: Deshabilitado
   → Mensaje: "Recuerda: Debes agregar al menos un criterio..."
```

### ❌ Caso Inválido 2
```
⚠️ Rúbrica con:
   - Código: "RA-001"
   - Descripción: "Comunicación efectiva"
   - 1 Criterio SIN indicadores

   → Estado: "Incompleta" (Amarillo)
   → Botón: Habilitado (pero validación previene envío)
   → Tab del criterio: Borde rojo + "⚠️ Requerido"
```

### ❌ Caso Inválido 3
```
⚠️ Rúbrica con:
   - Código: "RA-001"
   - Descripción: "Comunicación efectiva"
   - 1 Criterio CON 1 indicador sin nombre

   → Estado: "Incompleta" (Amarillo)
   → Botón: Habilitado (pero validación previene envío)
   → Error al guardar: "El criterio '[nombre]' tiene indicadores sin nombre."
```

### ❌ Caso Inválido 4 ⭐ NUEVO
```
⚠️ Rúbrica con:
   - Código: "RA-001"
   - Descripción: "Comunicación efectiva"
   - 1 Criterio CON nombre
   - 1 Indicador CON nombre
   - Descriptores incompletos: Solo 3 de 5 niveles completados

   → Estado: "Incompleta" (Amarillo)
   → Contador: "3/5 niveles" en rojo
   → Acordeón: Borde rojo
   → Descriptores vacíos: Borde rojo + punto rojo + badge "Requerido"
   → Error al guardar: "El indicador '[nombre]' del criterio '[nombre]'
                       debe tener una descripción para el nivel '[nivel faltante]'."
```

### ❌ Caso Inválido 5 ⭐ NUEVO
```
⚠️ Rúbrica con:
   - Código: "RA-001"
   - Descripción: "Comunicación efectiva"
   - 1 Criterio CON nombre
   - 1 Indicador CON nombre
   - 0 descriptores completados (todos vacíos)

   → Estado: "Incompleta" (Amarillo)
   → Contador: "0/5 niveles" en rojo
   → Acordeón: Borde rojo grueso
   → TODOS los descriptores: Marcados en rojo con alertas
   → Error al guardar: "El indicador '[nombre]' del criterio '[nombre]'
                       debe tener una descripción para el nivel 'Poco'."
```

## Beneficios

1. **UX Mejorada**:
   - Feedback visual inmediato en tiempo real
   - Mensajes claros y específicos por campo
   - Prevención de errores antes de enviar
   - ⭐ Contador de progreso visible (X/Y niveles)

2. **Validación Robusta**:
   - Múltiples niveles de validación (criterios → indicadores → descriptores)
   - Verificación en tiempo real mientras el usuario escribe
   - Mensajes de error contextuales con nombres específicos
   - ⭐ Validación completa de todos los descriptores por nivel

3. **Guía al Usuario**:
   - Indicadores visuales claros (colores, bordes, badges)
   - Estado global visible en todo momento
   - Tooltips informativos
   - Alertas específicas por criterio, indicador y descriptor
   - ⭐ Checkmarks verdes cuando todo está correcto

4. **Prevención de Datos Incompletos**:
   - No se pueden guardar rúbricas vacías
   - Todos los criterios deben estar completos
   - Todos los indicadores deben tener nombre
   - ⭐ TODOS los descriptores deben estar completos (nuevo requisito estricto)

## Compatibilidad

- ✅ Compatible con modo creación
- ✅ Compatible con modo edición
- ✅ Responsive (adaptado a móviles, tablets y desktop)
- ✅ Sin cambios en backend (validación frontend)

## Resumen de Mensajes de Error

1. "Debes agregar al menos un criterio antes de guardar la rúbrica."
2. "Todos los criterios deben tener un nombre."
3. "Cada criterio debe tener al menos un indicador."
4. "El criterio '[nombre]' tiene indicadores sin nombre."
5. ⭐ "El indicador '[nombre]' del criterio '[nombre]' debe tener una descripción para el nivel '[nivel]'."

## Indicadores Visuales por Elemento

### Criterio (Tab en Sidebar)
- ✅ Completo: Borde normal, sin alertas
- ❌ Incompleto: Borde izquierdo rojo + punto rojo + texto "⚠️ Requerido"

### Indicador (Acordeón)
- ✅ Completo: Borde normal + "5/5 niveles" en verde
- ❌ Incompleto: Borde rojo + "X/5 niveles" en rojo

### Descriptor (Tarjeta de Nivel)
- ✅ Completo: Borde normal + checkmark verde ✓
- ❌ Incompleto: Borde rojo grueso + punto rojo + badge "Requerido" + placeholder con *

---

**Fecha de Implementación**: 16 de Diciembre de 2025
**Última Actualización**: 16 de Diciembre de 2025 (Validación de Descriptores)
**Desarrollado por**: Claude Code
**Estado**: ✅ Completado y Probado
**Versión**: 2.0 (con validación completa de descriptores)
