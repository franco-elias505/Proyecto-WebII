# MiniAula · Proyecto Web II

Plataforma de cursos cortos con NestJS, PostgreSQL y React (JavaScript, Vite).
La interfaz utiliza Tailwind CSS y Lucide Icons y consulta los datos de la API.

## Alcance

Se incluyen autenticación, catálogo y detalle de cursos, gestión de cursos del
instructor, edición y orden de lecciones, lectura de contenido y archivos adjuntos.
Las vistas de perfil, inscripción, cuestionarios, progreso y analíticas quedan
fuera de esta entrega y corresponden a la pareja de proyecto.

Las tablas originales se conservan. El acceso secuencial a las lecciones consulta
las inscripciones y el progreso persistidos en PostgreSQL. El editor permite
crear la estructura de una lección de cuestionario; las preguntas y su evaluación
se integrarán desde el módulo correspondiente.

## Preparar la base y cargar datos

Configura el `.env` de la raíz con `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD` y `JWT_SECRET`, siguiendo `.env.example`. La clave JWT debe tener
al menos 32 bytes. Para la base local existente se usa `webii_db` en el puerto
`5501`.

Si la base está vacía, aplica primero `database/migrations/001_esquema_inicial.sql`.
Desde la carpeta `backend`:

```powershell
npm ci
npm run db:seed
npm run start:dev
```

`db:seed` compila el backend, aplica la ampliación de archivos de lecciones
(`002_archivos_lecciones.sql`) y carga:

- 2 instructores y 3 estudiantes.
- 3 cursos publicados: JavaScript, diseño de interfaces e inglés.
- 15 lecciones con lecturas y estructura de cuestionarios.
- 9 inscripciones y sus estados de progreso para probar el acceso secuencial.

Las inscripciones y el progreso son datos iniciales de prueba; no agregan rutas
ni pantallas de esos módulos. El seed usa una transacción, evita duplicados al
repetirlo y conserva las cuentas, contraseñas, cursos e inscripciones existentes.

Todas las cuentas nuevas del seed usan la contraseña **`MiniAula123!`**:

| Correo | Rol | Uso |
| --- | --- | --- |
| instructor1@miniaula.test | Instructor | Administra JavaScript y diseño |
| instructor2@miniaula.test | Instructor | Administra inglés |
| estudiante1@miniaula.test | Estudiante | JavaScript 3/5, diseño 0/5 e inglés 5/5 |
| estudiante2@miniaula.test | Estudiante | JavaScript 1/5 y diseño 2/5 |
| estudiante3@miniaula.test | Estudiante | Inicio de cursos e inglés 1/5 |

Si modificas el avance después, ejecutar el seed conserva esos cambios. Las
credenciales anteriores corresponden únicamente a las cuentas de prueba creadas
por este script.

## Abrir la interfaz

Desde la carpeta `frontend`, en otra terminal:

```powershell
npm ci
npm run dev
```

Abre la dirección que imprime Vite. El catálogo consulta PostgreSQL a través de
la API. Inicia sesión como instructor para crear, editar, publicar y archivar
cursos, organizar lecciones y subir archivos. Usa una cuenta de estudiante del
seed para abrir las lecturas permitidas por su progreso guardado.

`frontend/.env.example` define `VITE_API_URL=/api`. Vite reenvía las peticiones al
backend local en el puerto 3000. `FRONTEND_ORIGIN` controla CORS y por defecto es
`http://localhost:5173`. `API_PROXY_TARGET` permite cambiar el destino local de Vite.

Swagger está en [API Docs](http://localhost:3000/api/docs). Inicia sesión y pega
el `accessToken` en Authorize para probar las rutas protegidas.

## Cursos y lecciones

| Requisito | Implementación |
| --- | --- |
| RF-04 | Catálogo público, búsqueda por título, categorías y paginación |
| RF-05 | Detalle público y temario sin contenido ni adjuntos |
| RF-06 | Creación en borrador y edición de cursos propios |
| RF-07 | Publicación y archivo por el instructor dueño |
| RF-08 | Creación, edición y eliminación de lecciones, texto y enlace a video |
| RF-09 | Reordenamiento transaccional con todos los IDs del curso |
| RF-10 | Temario con estados y acceso según inscripción y avance |
| RN-01 | Verificación del avance previo y aprobación de cuestionarios en el servidor |
| RN-02 | Las rutas de cursos y lecciones omiten respuestas correctas |
| RN-05 | Catálogo de publicados y al menos una lección para publicar |
| RN-06 | Un curso con inscritos solo puede archivarse |
| RN-07 | Guards y servicios comprueban el instructor dueño |
| RN-08 | Estados del estudiante consultados con la identidad del JWT |

Rutas principales:

- `GET /api/cursos` y `GET /api/cursos/categorias`.
- `GET`, `PUT` y `DELETE /api/cursos/:id`; `POST /api/cursos`.
- `PATCH /api/cursos/:id/estado`.
- `GET /api/instructor/cursos` y `GET /api/instructor/cursos/:id`.
- `POST` y `GET /api/cursos/:id/lecciones`.
- `GET`, `PUT` y `DELETE /api/lecciones/:id`.
- `PATCH /api/cursos/:id/lecciones/orden`.
- `POST /api/lecciones/:id/archivos`.
- `GET` y `DELETE /api/lecciones/:id/archivos/:archivoId`.

El tipo de una lección existente es fijo. Los inscritos conservan acceso a cursos
archivados. Se impide eliminar la última lección de un curso publicado. Agregar o
eliminar lecciones recalcula la finalización; modificar la nota mínima reevalúa
el estado con la mejor nota guardada.

## Archivos

El campo multipart `archivo` se procesa en el backend mediante
`express-fileupload`, después de comprobar autenticación y propietario. Se admite
un archivo por solicitud, hasta 25 MB: PDF, PNG, JPEG, MP4 o WebM. Se comprueban
el tipo declarado, la firma, el tamaño y que la lección sea de contenido.

Los archivos se guardan con nombres UUID en `backend/uploads` o `UPLOAD_DIR`.
Los metadatos quedan en PostgreSQL. Descargar exige JWT y permiso sobre la
lección. Eliminar un adjunto, lección o curso retira los archivos correspondientes.
Los archivos y el `.env` quedan ignorados por Git.

## Docker

Con Docker Desktop y `JWT_SECRET` configurado en el `.env` de la raíz:

```powershell
docker compose up --build
```

- Frontend: [MiniAula](http://localhost:8080).
- Swagger: [API Docs](http://localhost:3000/api/docs).
- PostgreSQL: puerto 5432 por defecto.

Compose usa `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_PORT`
para su instancia. `DB_*` corresponde a la ejecución local de NestJS. Dentro de
Compose el backend se conecta a `postgres:5432`.

Las migraciones se aplican automáticamente al crear un volumen vacío. En un
volumen antiguo aplica primero la migración 002. Con ambas migraciones listas,
puedes cargar el seed del contenedor:

```powershell
docker compose exec backend node dist/scripts/seed.js
```

Los volúmenes `postgres_data` y `lesson_uploads` conservan los datos y archivos.
`docker compose down` detiene los servicios conservando esos volúmenes.

## Verificaciones

Desde `frontend`:

```powershell
npm run build
npm run lint
```

Desde `backend`, con PostgreSQL y ambas migraciones aplicadas:

```powershell
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run test:integration
```

La integración crea datos temporales y los elimina al terminar. Verifica permisos,
catálogo, edición, publicación, orden, bloqueo secuencial y subida, descarga y
eliminación de archivos.
