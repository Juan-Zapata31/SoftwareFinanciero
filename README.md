# Software Financiero

Proyecto PPI con frontend en React + Vite, backend en Node.js + Express y base de datos PostgreSQL. El frontend consume la API con Axios.

## Estado frente a los requisitos

| Requisito | Estado |
| --- | --- |
| React + Vite y Node.js + Express | Implementado |
| PostgreSQL | Pool de conexiones configurado con `DATABASE_URL` |
| Consumo de API con Axios | Implementado en las solicitudes del frontend |
| Middlewares, rutas y controladores | Implementados para usuarios e ingresos |
| Validación de datos y restricciones en PostgreSQL | Implementada para usuarios e ingresos |
| CRUD completo (GET, POST, PUT, DELETE) | Implementado para usuarios e ingresos |

El backend se conecta a la base de datos PostgreSQL que ya tienes configurada usando `DATABASE_URL`. Los ingresos se administran mediante `GET`, `POST`, `PUT` y `DELETE /api/ingresos`; las operaciones requieren haber iniciado sesión. `POST /api/ingresos` acepta un ingreso individual o un arreglo de hasta 100 ingresos y guarda el arreglo en una sola transacción (si uno falla, no se guarda ninguno). Cada ingreso se relaciona con `users.id` mediante `ingresos.usuario_id`, una clave foránea que impide eliminar usuarios con ingresos relacionados. Los endpoints de diagnóstico son `GET /api/health` y `GET /api/health/db`.

El botón **Iniciar sesión** valida las credenciales contra `POST /api/auth/login`. Las variables `ADMIN_USERNAME` y `ADMIN_PASSWORD` se leen primero desde `server/.env.local` y luego desde `server/.env`; el archivo `.env.local` está excluido de Git para no publicar la clave. Tras iniciar sesión, el token temporal autoriza las rutas CRUD de `/api/users`; la sesión vence después de ocho horas o al cerrar sesión.

## Cómo se organiza el código del backend

- `server/src/index.js` inicia Express y conecta las rutas.
- `server/src/routes/users.js` define las rutas CRUD de `/api/users`.
- `server/src/routes/incomes.js` define las rutas CRUD de `/api/ingresos`.
- `server/src/controllers/incomesController.js` consulta y modifica los registros de ingresos en PostgreSQL.
- `server/src/middleware/validateIncome.js` valida datos y valores recibidos antes de guardar ingresos.
- `server/src/middleware/validateUser.js` revisa los datos antes de guardarlos.
- `server/src/controllers/usersController.js` ejecuta el `INSERT` en PostgreSQL y responde al frontend.
- `server/src/db.js` crea la conexión compartida con PostgreSQL.

El formulario de bienvenida usa Axios para enviar nombre, apellido y correo. La validación del backend revisa los datos antes de guardarlos; la tabla existente también debe tener sus propias restricciones.

## Preparación local

1. Usa la base de datos PostgreSQL y el esquema que ya tienes creados. Si la tabla `ingresos` todavía tiene la columna `cliente` y no tiene `usuario_id`, ejecuta en pgAdmin el script `server/migrations/20261029_align_ingresos_with_app.sql` conectado a esa base de datos. El script se detiene si ya hay ingresos para evitar perder datos; en ese caso, esos registros deben migrarse manualmente relacionándolos con usuarios.
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
