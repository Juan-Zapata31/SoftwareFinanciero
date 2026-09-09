# JSC: Software Financiero — Versión React

Landing page del proyecto PPI, migrada a React con Vite, organizada por componentes.
Cada componente vive en su propia carpeta con su `.jsx` y su `.css`.

## Estructura

```
src/
├── components/
│   ├── Header/
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── Hero/
│   │   ├── Hero.jsx
│   │   └── Hero.css
│   ├── Bienvenida/
│   │   ├── Bienvenida.jsx
│   │   └── Bienvenida.css
│   ├── Problema/
│   │   ├── Problema.jsx
│   │   └── Problema.css
│   ├── Funcionalidades/
│   │   ├── Funcionalidades.jsx
│   │   └── Funcionalidades.css
│   └── Footer/
│       ├── Footer.jsx
│       └── Footer.css
├── App.jsx
├── App.css
├── main.jsx
└── index.css   (variables de color y estilos globales)
```

## Cómo correrlo

```bash
npm install
npm run dev
```

Luego abre la URL que muestra la terminal (por defecto `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```
