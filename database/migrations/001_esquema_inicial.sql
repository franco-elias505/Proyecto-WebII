BEGIN;

CREATE TABLE usuarios (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    rol text NOT NULL CHECK (rol IN ('estudiante', 'instructor')),
    creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX usuarios_email_unico ON usuarios (lower(email));

CREATE TABLE cursos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    categoria text NOT NULL,
    nivel text NOT NULL,
    estado text NOT NULL DEFAULT 'borrador'
        CHECK (estado IN ('borrador', 'publicado', 'archivado')),
    instructor_id integer NOT NULL REFERENCES usuarios (id),
    creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cursos_instructor_idx ON cursos (instructor_id);
CREATE INDEX cursos_catalogo_idx ON cursos (categoria, id)
    WHERE estado = 'publicado';

CREATE TABLE lecciones (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    curso_id integer NOT NULL REFERENCES cursos (id) ON DELETE CASCADE,
    titulo text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('contenido', 'cuestionario')),
    contenido text,
    video_url text,
    orden integer NOT NULL CHECK (orden > 0),
    nota_minima numeric(5, 2),
    UNIQUE (curso_id, id),
    CONSTRAINT lecciones_orden_unico UNIQUE (curso_id, orden)
        DEFERRABLE INITIALLY IMMEDIATE,
    CONSTRAINT lecciones_campos_por_tipo CHECK (
        (tipo = 'contenido' AND nota_minima IS NULL)
        OR (tipo = 'cuestionario' AND contenido IS NULL AND video_url IS NULL
            AND nota_minima IS NOT NULL AND nota_minima BETWEEN 0 AND 100)
    )
);

CREATE TABLE preguntas (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    leccion_id integer NOT NULL REFERENCES lecciones (id) ON DELETE CASCADE,
    enunciado text NOT NULL,
    opciones text[] NOT NULL,
    indice_correcto integer NOT NULL,
    CONSTRAINT preguntas_opciones_validas CHECK (
        array_ndims(opciones) = 1 AND array_lower(opciones, 1) = 1
        AND cardinality(opciones) >= 2
        AND indice_correcto >= 0 AND indice_correcto < cardinality(opciones)
    )
);

CREATE INDEX preguntas_leccion_idx ON preguntas (leccion_id);

CREATE TABLE inscripciones (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estudiante_id integer NOT NULL REFERENCES usuarios (id),
    curso_id integer NOT NULL REFERENCES cursos (id),
    fecha_inscripcion timestamptz NOT NULL DEFAULT now(),
    completado boolean NOT NULL DEFAULT false,
    UNIQUE (estudiante_id, curso_id),
    UNIQUE (curso_id, id)
);

CREATE TABLE progreso (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    curso_id integer NOT NULL,
    inscripcion_id integer NOT NULL,
    leccion_id integer NOT NULL,
    completada boolean NOT NULL DEFAULT false,
    intentos smallint NOT NULL DEFAULT 0 CHECK (intentos BETWEEN 0 AND 3),
    mejor_nota numeric(5, 2),
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    UNIQUE (inscripcion_id, leccion_id),
    FOREIGN KEY (curso_id, inscripcion_id) REFERENCES inscripciones (curso_id, id)
        ON DELETE CASCADE,
    FOREIGN KEY (curso_id, leccion_id) REFERENCES lecciones (curso_id, id)
        ON DELETE CASCADE,
    CONSTRAINT progreso_nota_por_intentos CHECK (
        (intentos = 0 AND mejor_nota IS NULL)
        OR (intentos > 0 AND mejor_nota IS NOT NULL AND mejor_nota BETWEEN 0 AND 100)
    )
);

CREATE INDEX progreso_leccion_idx ON progreso (curso_id, leccion_id);

COMMIT;
