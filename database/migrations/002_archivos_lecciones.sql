BEGIN;

CREATE TABLE IF NOT EXISTS archivos_lecciones (
    id uuid PRIMARY KEY,
    leccion_id integer NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
    nombre_original varchar(200) NOT NULL,
    nombre_guardado varchar(80) NOT NULL,
    tipo_mime varchar(100) NOT NULL,
    tamano integer NOT NULL CHECK (tamano > 0 AND tamano <= 26214400),
    creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS archivos_lecciones_leccion_idx ON archivos_lecciones(leccion_id);

COMMIT;
