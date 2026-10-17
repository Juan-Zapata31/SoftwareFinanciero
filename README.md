# Software Financiero

Proyecto PPI con frontend en React + Vite, backend en Node.js + Express y base de datos PostgreSQL. El frontend consume la API con Axios.

## Estado frente a los requisitos

| Requisito | Estado |
| --- | --- |
| React + Vite y Node.js + Express | Implementado |
| PostgreSQL | Pool de conexiones configurado con `DATABASE_URL` |
| Consumo de API con Axios | Implementado en las solicitudes del frontend |
| Middlewares, rutas y controladores | Implementados para la creación de usuarios |
| Validación de datos y restricciones en PostgreSQL | Implementada para nombre, apellido y correo |
| CRUD completo (GET, POST, PUT, DELETE) | Pendiente: por ahora solo está implementado POST para usuarios |

El backend se conecta a la base de datos PostgreSQL que ya tienes configurada usando `DATABASE_URL`. La ruta de creación disponible es `POST /api/users`; los endpoints de diagnóstico son `GET /api/health` y `GET /api/health/db`.

## Cómo se organiza el código del backend

- `server/src/index.js` inicia Express y conecta las rutas.
- `server/src/routes/users.js` define la ruta `POST /api/users`.
- `server/src/middleware/validateUser.js` revisa los datos antes de guardarlos.
- `server/src/controllers/usersController.js` ejecuta el `INSERT` en PostgreSQL y responde al frontend.
- `server/src/db.js` crea la conexión compartida con PostgreSQL.

El formulario de bienvenida usa Axios para enviar nombre, apellido y correo. La validación del backend revisa los datos antes de guardarlos; la tabla existente también debe tener sus propias restricciones.

## Preparación local

1. Usa la base de datos y el esquema que ya tienes creados. No necesitas ejecutar un SQL adicional.
2. En un equipo nuevo, crea tus archivos de configuración copiando los ejemplos:

   ```powershell
   Copy-Item server\.env.example server\.env
   Copy-Item Financiero\.env.example Financiero\.env
   ```

   En `server/.env`, cambia `TU_CONTRASENA` y ajusta usuario, servidor, puerto y nombre de base de datos para que `DATABASE_URL` apunte a tu PostgreSQL. En `Financiero/.env`, configura `VITE_API_URL` para que apunte al backend e incluya `/api`. Si ya tienes tus propios `.env`, consérvalos y no hace falta copiarlos. La tabla `users` debe tener las columnas `id`, `name`, `lastName` y `email`, que son las que utiliza el POST actual.
3. Instala dependencias y ejecuta cada proceso en una terminal distinta desde la raíz del repositorio:

   ```powershell
   npm.cmd --prefix server install
   npm.cmd --prefix server run dev
   ```

   ```powershell
   npm.cmd --prefix Financiero install
   npm.cmd --prefix Financiero run dev
   ```

4. Abre la URL que Vite muestre (normalmente `http://localhost:5173`). La página `/api-test` permite comprobar la conexión a PostgreSQL y el formulario de bienvenida permite probar el POST.

Los `.env.example` se pueden compartir porque solo contienen valores de ejemplo. No subas los `.env` reales: contienen la configuración privada de cada equipo.
