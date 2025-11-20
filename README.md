# 🛡️ Sistema EPP - Gestión de Inventario

> Sistema completo de gestión de inventario de Equipos de Protección Personal (EPP) desarrollado con React, TypeScript y Tailwind CSS.

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.6-38bdf8)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff)](https://vitejs.dev/)

Sistema moderno y escalable para la gestión integral de inventarios de Equipos de Protección Personal, incluyendo control de stock, asignaciones a empleados, alertas y estadísticas en tiempo real.

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Sidebar.tsx              # Barra lateral de navegación
│   ├── Dashboard.tsx            # Panel principal con estadísticas
│   ├── Inventory.tsx            # Componente principal de inventario
│   ├── StockTable.tsx           # Tabla de control de stock
│   ├── AssignmentsTable.tsx     # Tabla de asignaciones
│   ├── AddProductModal.tsx      # Modal para agregar productos
│   ├── BulkAssignmentModal.tsx  # Modal para asignación masiva
│   └── index.ts                 # Exportaciones de componentes
│
├── types/              # Definiciones de tipos e interfaces
│   └── index.ts        # Interfaces: InventoryItem, Assignment, etc.
│
├── utils/              # Funciones utilitarias
│   └── inventory.ts    # Funciones de cálculo y utilidades del inventario
│
├── data/               # Datos iniciales
│   └── initialData.ts  # Datos de ejemplo para inventario y asignaciones
│
└── App.tsx             # Componente principal de la aplicación
```

## Componentes Principales

### App.tsx
Componente raíz que gestiona el estado global de la aplicación y coordina todos los componentes.

### Sidebar
Barra lateral con navegación entre Dashboard e Inventario.

### Dashboard
Panel principal que muestra:
- Estadísticas generales (inversión total, productos, asignaciones)
- Alertas de stock bajo
- Productos próximos a vencer
- Estadísticas detalladas por producto

### Inventory
Vista principal del inventario con dos pestañas:
- **Control de Stock**: Tabla de productos con gestión de stock
- **Asignaciones**: Tabla de asignaciones de equipos a empleados

## ✨ Funcionalidades

- 📦 **Gestión completa de inventario** - Administra todos tus EPP en un solo lugar
- 📊 **Control de stock por categorías/tallas** - Organiza tu inventario de manera eficiente
- 👥 **Asignación de equipos a empleados** - Registra quién tiene qué equipo
- 🚀 **Asignación masiva** - Asigna equipos a múltiples empleados de una vez
- ⚠️ **Alertas inteligentes** - Notificaciones de stock bajo y productos próximos a vencer
- 🔍 **Búsqueda y filtrado avanzado** - Encuentra información rápidamente
- 📈 **Dashboard con estadísticas** - Visualiza métricas importantes de tu inventario
- 💰 **Cálculo de inversión total** - Conoce el valor total de tu inventario

## Tecnologías

- React
- TypeScript
- Tailwind CSS
- Lucide React (iconos)
- Vite (build tool)

## Instalación y Ejecución

### Requisitos previos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos para ejecutar el proyecto

1. **Instalar las dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   - La aplicación se ejecutará en `http://localhost:5173` (o el puerto que Vite indique)
   - Abre tu navegador y ve a esa dirección

### Comandos disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción

### Nota
Si es la primera vez que ejecutas el proyecto, asegúrate de que Node.js esté instalado. Puedes verificar esto ejecutando:
```bash
node --version
npm --version
```

## 📸 Capturas de Pantalla

*(Próximamente: agregar capturas de pantalla del sistema)*

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Siéntete libre de abrir un issue o crear un pull request.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado con ❤️ para la gestión eficiente de equipos de protección personal.

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub.

