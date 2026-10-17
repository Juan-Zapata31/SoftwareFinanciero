# JSC: Software Financiero — Frontend React

Frontend del proyecto PPI, desarrollado con React y Vite. Las solicitudes a la API se realizan con Axios.

## Estructura

```
src/
├── components/    # Componentes reutilizables y sus estilos
├── pages/         # Páginas de la aplicación
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## Cómo correrlo

```bash
npm install
npm run dev
```

Configura `VITE_API_URL` en `Financiero/.env` (por ejemplo, `http://localhost:3000/api`) antes de iniciar el frontend. En un equipo nuevo, puedes crear el archivo copiando `.env.example`. Para iniciar PostgreSQL y el backend, sigue las instrucciones del [README principal](../README.md).

Luego abre la URL que muestra la terminal (por defecto `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```
