# Proyecto Web II

## Ejecutar con Docker Compose

Requisitos:

- Docker Desktop con Compose v2.
- Un valor aleatorio de al menos 32 bytes en `JWT_SECRET` en el `.env` de la
  raíz. Usa `.env.example` como referencia. Puedes generar el valor con
  `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432

PostgreSQL utiliza el volumen `postgres_data`, por lo que los datos sobreviven
al reinicio de los contenedores. Para detener los servicios:

```bash
docker compose down
```

Para eliminar también los datos persistidos:

```bash
docker compose down -v
```

## Esquema inicial de MiniAula

Para ejecutar el backend contra un PostgreSQL local, configura en el `.env`
de la raíz las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y
`DB_PASSWORD`. Desde `backend`, ejecuta `npm ci` y `npm run start:dev`.
NestJS verifica la conexión antes de abrir el puerto HTTP.

### Registro e inicio de sesión

Envía `POST /api/auth/register` con `nombre`, `email`, `password` y
`rol` (`estudiante` o `instructor`). La contraseña requiere al menos ocho
caracteres y admite hasta 72 bytes. El registro devuelve `201` con el usuario
creado, o `409` si el correo ya está registrado.

Envía `POST /api/auth/login` con un cuerpo JSON con `email` y `password`
de un usuario existente cuyo `password_hash` sea bcrypt. La respuesta exitosa
incluye `accessToken` (válido por una hora) y `usuario` con id, nombre, correo y
rol. El endpoint permite cinco solicitudes por IP por minuto.

Para levantar solo PostgreSQL, ejecuta `docker compose up -d postgres`.
Al crear un volumen nuevo, PostgreSQL aplica automáticamente la migración
`database/migrations/001_esquema_inicial.sql`. Puedes comprobar las tablas con
este comando desde PowerShell:

```powershell
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"'
```

Si el volumen ya estaba inicializado y aún no tiene las tablas de MiniAula,
aplica la migración una vez con el siguiente comando. Conserva el volumen y
detiene la ejecución si hay un error:

```powershell
docker compose exec postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/001_esquema_inicial.sql'
```

El esquema incluye usuarios, cursos, lecciones, preguntas, inscripciones y
progreso. Las notas van de 0 a 100 y el índice de la respuesta correcta comienza
en 0, igual que en JavaScript. Las opciones se almacenan como un arreglo de
texto. La columna `curso_id` de progreso permite comprobar con claves foráneas
que la inscripción y la lección pertenecen al mismo curso.

La base protege la unicidad del correo, del orden de las lecciones, de las
inscripciones y del progreso por lección. También limita el contador a tres
intentos e impide borrar cursos con inscripciones. La API deberá validar los
roles, el estado del curso, el desbloqueo secuencial y la calificación, y
actualizar intentos, mejor nota y progreso en una transacción.

### Variables de entorno

Compose incluye valores de desarrollo por defecto. Se pueden sobrescribir
creando un archivo `.env` en esta carpeta:

```env
POSTGRES_DB=proyecto_webii
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=8080
OBSERVE_APP_KEY=
OBSERVE_APP_SECRET=
```

El backend recibe además `DB_HOST=postgres`, porque dentro de Compose los
servicios se comunican usando el nombre del servicio y no `localhost`.
