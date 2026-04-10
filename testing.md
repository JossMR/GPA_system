## Ejecución

## Comandos Principales

```bash
# Modo watch (desarrollo)
npm test

# Ejecutar una sola vez
npm run test:run

# Con reporte de coverage
npm run test:coverage

# Para CI/CD
npm run test:ci
```
## Ejecutar Tests Específicos

```bash
# Por archivo
npm test -- GPA_user.test.ts

# Por patrón
npm test -- --testNamePattern="formatCurrency"

# Por directorio
npm test -- __tests__/models/

# Watch + patrón
npm test -- formatters --watch
```
## Categorias Evaluadas

| Módulo | Cantidad | Estado |
|--------|----------|--------|
| Models | 89 tests | ✅ |
| Utils | 54 tests | ✅ |
| Components | 8 tests | ✅ |
| Hooks | 9 tests | ✅ |
| Integration | 28 tests | ✅ |

### Tests Unitarios por Módulo

#### 1️⃣ **Modelos de Datos** - 76 Tests
```
__tests__/models/
├── GPA_user.test.ts (12 tests)
│   ✓ Validación de interfaz
│   ✓ Campos requeridos
│   ✓ Generación de timestamps
│
├── GPA_project.test.ts (15 tests)
│   ✓ Creación y validación
│   ✓ Estados del proyecto
│   ✓ Gestión financiera
│   ✓ Ubicación geográfica
│
├── GPA_client.test.ts (18 tests)
│   ✓ Clientes individuales y corporativos
│   ✓ Identificación y contacto
│   ✓ Direcciones y seguimiento
│
├── GPA_payment.test.ts (17 tests)
│   ✓ Validación de pagos
│   ✓ Métodos de pago (8 tipos)
│   ✓ Reembolsos y facturación
│
├── GPA_observation.test.ts (14 tests)
│   ✓ Creación y contenido
│   ✓ Asociación con proyectos
│   ✓ Timeline y timestamps
│   
└── GPA_notification.test.ts (13 tests)
    ✓ Creación y validación
    ✓ Tipos de notificación y destinatarios
    ✓ Fechas y relaciones con proyecto
```

#### 2️⃣ **Utilidades** - 54 Tests
```
__tests__/lib/
├── formatters.test.ts (20 tests)
│   ✓ formatCurrency() - Moneda costarricense
│   ✓ formatNumber() - Números con decimales
│   ✓ Casos edge y valores null
│
├── utils.test.ts (18 tests)
│   ✓ cn() - Combinar clases CSS Tailwind
│   ✓ Merge de clases conflictivas
│   ✓ Casos de uso reales
│
└── database.test.ts (16 tests)
    ✓ Pool de conexiones
    ✓ Transacciones y retries
    ✓ Health checks
```

#### 3️⃣ **Componentes React** - 8 Tests
```
__tests__/components/
└── basic-components.test.tsx (8 tests)
    ✓ ThemeToggle (cambio de tema)
    ✓ Estructura de componentes
    ✓ Imports y exports
```

#### 4️⃣ **Hooks Personalizados** - 9 Tests
```
__tests__/hooks/
└── use-mobile.test.ts (9 tests)
    ✓ Detección de mobile (breakpoint 768px)
    ✓ Responsive behavior
    ✓ Múltiples tamaños de pantalla
```

#### 5️⃣ **Pruebas de Integración** - 28 Tests
```
__tests__/
└── integration.test.ts (28 tests)
    ✓ Workflows de proyectos
    ✓ Gestión de clientes
    ✓ Gestión de usuarios
    ✓ Procesamiento de pagos
    ✓ Validaciones de datos
    ✓ Cálculos financieros
    ✓ Manejo de errores
```

## 🎓 Cobertura por Funcionalidad

### ✅ Gestión de Proyectos
- [x] Creación de proyectos con validación
- [x] 13 estados con transiciones válidas
- [x] Presupuesto y cálculos financieros
- [x] Ubicación (provincia, cantón, distrito)
- [x] Documentos asociados
- [x] Observaciones del proyecto

### ✅ Gestión de Clientes
- [x] Clientes personas naturales
- [x] Clientes entidades jurídicas
- [x] 5 tipos de identificación
- [x] 4 estados civiles
- [x] Información de contacto
- [x] Dirección física completa

### ✅ Gestión de Usuarios
- [x] Creación con validación
- [x] Roles y permisos
- [x] Campos requeridos
- [x] Timestamps de acceso

### ✅ Procesamiento de Pagos
- [x] 8 métodos de pago diferentes
- [x] Imports de pagos múltiples
- [x] Reembolsos (montos negativos)
- [x] Números de factura
- [x] Descripción de transacciones

### ✅ Observaciones y Registros
- [x] Notas con caracteres especiales
- [x] Timeline del proyecto
- [x] Asociación con proyectos

### ✅ Utilidades del Sistema
- [x] Formateo de moneda costarricense (₡)
- [x] Formateo de números con decimales
- [x] Combinar clases CSS Tailwind
- [x] Manejo de conexiones a BD
- [x] Transacciones con rollback

### ✅ Hookss y UI
- [x] Responsive design (mobile/tablet/desktop)
- [x] Theme toggle (light/dark)
- [x] Breakpoint 768px

## 🎯 Funcionalidades Críticas Cubiertas

### Validaciones
```typescript
✓ Email: test@example.com
✓ Teléfono: +506 2222-3333
✓ Identificación: 123456789
✓ Moneda: ₡100,000.00
✓ Fechas: 2024-01-15 14:30:00
```

### Cálculos Financieros
```typescript
✓ Presupuesto: ₡100,000
✓ Pagos: ₡75,000
✓ Restante: ₡25,000
✓ Porcentaje: 75%
✓ Reembolsos: -₡5,000
```

### Estados Complejos
```typescript
✓ Project: 13 estados
✓ Civil Status: 4 estados
✓ ID Type: 5 tipos
✓ Payment Method: 8 métodos
```

## 📈 Métricas de Calidad

| Métrica | Valor |
|---------|-------|
| Total de Tests | 180+ |
| Archivos de Test | 11 |
| Módulos Cubiertos | 8 |
| Funciones Críticas | 40+ |
| Edge Cases | 60+ |
| Integrations | 7 workflows |

## 🔍 Casos Especia Probados

1. **Valores Null/Undefined**: Todas las funciones handlean estos casos
2. **Montos Negativos**: Reembolsos y créditos funcionan correctamente
3. **Caracteres Especiales**: Ñ, tildes, emojis soportados
4. **Límites de Datos**: 0, máximos, mínimos validados
5. **Múltiples Idiomas**: Formato es_CR aplicado
6. **Breakpoints Responsive**: Mobile (320px), tablet (800px), desktop (1920px)

## Resultado Esperado

```
PASS  __tests__/integration.test.ts
PASS  __tests__/models/GPA_notification.test.ts
PASS  __tests__/lib/utils.test.ts
PASS  __tests__/lib/database.test.ts
PASS  __tests__/lib/formatters.test.ts
PASS  __tests__/models/GPA_payment.test.ts
PASS  __tests__/models/GPA_observation.test.ts
PASS  __tests__/models/GPA_project.test.ts
PASS  __tests__/models/GPA_user.test.ts
PASS  __tests__/models/GPA_client.test.ts
PASS  __tests__/hooks/use-mobile.test.ts
PASS  __tests__/components/basic-components.test.tsx
```