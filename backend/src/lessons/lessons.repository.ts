import { Injectable } from '@nestjs/common';
import type { Transaction } from 'sequelize';
import { DatabaseRepository } from '../database/database.repository';
import type { Lesson } from '../courses/courses.repository';
import { LessonDto } from './lessons.dto';

@Injectable()
export class LessonsRepository {
  constructor(private readonly db: DatabaseRepository) {}

  async isEnrolled(
    courseId: number,
    studentId: number,
    transaction: Transaction,
  ) {
    const [result] = await this.db.select<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM inscripciones WHERE curso_id = $courseId AND estudiante_id = $studentId) AS existe',
      { courseId, studentId },
      transaction,
    );
    return result.existe;
  }

  statuses(courseId: number, studentId: number, transaction: Transaction) {
    return this.db.select<{
      id: number;
      titulo: string;
      tipo: string;
      orden: number;
      completada: boolean;
      bloqueada: boolean;
    }>(
      `WITH estado AS (
         SELECT l.id, l.titulo, l.tipo, l.orden,
           CASE WHEN l.tipo = 'cuestionario' THEN COALESCE(p.mejor_nota >= l.nota_minima, false)
             ELSE COALESCE(p.completada, false) END AS completada
         FROM lecciones l
         JOIN inscripciones i ON i.curso_id = l.curso_id AND i.estudiante_id = $studentId
         LEFT JOIN progreso p ON p.inscripcion_id = i.id AND p.leccion_id = l.id
         WHERE l.curso_id = $courseId
       ) SELECT *, NOT COALESCE(bool_and(completada) OVER (
         ORDER BY orden, id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
       ), true) AS bloqueada FROM estado ORDER BY orden, id`,
      { courseId, studentId },
      transaction,
    );
  }

  files(lessonId: number, transaction: Transaction) {
    return this.db.select<{
      id: string;
      nombre_original: string;
      tipo_mime: string;
      tamano: number;
    }>(
      'SELECT id, nombre_original, tipo_mime, tamano FROM archivos_lecciones WHERE leccion_id = $lessonId ORDER BY creado_en, id',
      { lessonId },
      transaction,
    );
  }

  async file(lessonId: number, fileId: string, transaction: Transaction) {
    const [file] = await this.db.select<{
      id: string;
      nombre_original: string;
      nombre_guardado: string;
      tipo_mime: string;
      tamano: number;
    }>(
      'SELECT * FROM archivos_lecciones WHERE leccion_id = $lessonId AND id = $fileId',
      { lessonId, fileId },
      transaction,
    );
    return file;
  }

  async addFile(
    lessonId: number,
    file: {
      id: string;
      nombre_original: string;
      nombre_guardado: string;
      tipo_mime: string;
      tamano: number;
    },
    transaction: Transaction,
  ) {
    await this.db.execute(
      `INSERT INTO archivos_lecciones (id, leccion_id, nombre_original, nombre_guardado, tipo_mime, tamano)
       VALUES ($id, $lessonId, $nombre_original, $nombre_guardado, $tipo_mime, $tamano)`,
      { lessonId, ...file },
      transaction,
    );
  }

  removeFile(fileId: string, transaction: Transaction) {
    return this.db.execute(
      'DELETE FROM archivos_lecciones WHERE id = $fileId',
      { fileId },
      transaction,
    );
  }

  async create(courseId: number, data: LessonDto, transaction: Transaction) {
    const [lesson] = await this.db.select<Lesson>(
      `WITH creada AS (
         INSERT INTO lecciones (curso_id, titulo, tipo, contenido, video_url, nota_minima, orden)
         SELECT $courseId, $titulo, $tipo, $contenido, $videoUrl, $notaMinima,
           COALESCE(max(orden), 0) + 1 FROM lecciones WHERE curso_id = $courseId
         RETURNING *
       ) SELECT * FROM creada`,
      {
        courseId,
        titulo: data.titulo,
        tipo: data.tipo,
        contenido: data.contenido ?? null,
        videoUrl: data.videoUrl ?? null,
        notaMinima: data.notaMinima ?? null,
      },
      transaction,
    );
    return lesson;
  }

  async update(id: number, data: LessonDto, transaction: Transaction) {
    const [lesson] = await this.db.select<Lesson>(
      `WITH actualizada AS (
         UPDATE lecciones SET titulo = $titulo, contenido = $contenido,
           video_url = $videoUrl, nota_minima = $notaMinima
         WHERE id = $id RETURNING *
       ) SELECT * FROM actualizada`,
      {
        id,
        titulo: data.titulo,
        contenido: data.contenido ?? null,
        videoUrl: data.videoUrl ?? null,
        notaMinima: data.notaMinima ?? null,
      },
      transaction,
    );
    return lesson;
  }

  remove(id: number, transaction: Transaction) {
    return this.db.execute(
      'DELETE FROM lecciones WHERE id = $id',
      { id },
      transaction,
    );
  }

  async reorder(courseId: number, ids: number[], transaction: Transaction) {
    await this.db.execute(
      'SET CONSTRAINTS lecciones_orden_unico DEFERRED',
      {},
      transaction,
    );
    await this.db.execute(
      `UPDATE lecciones l SET orden = x.orden::integer
       FROM unnest($ids::integer[]) WITH ORDINALITY AS x(id, orden)
       WHERE l.id = x.id AND l.curso_id = $courseId`,
      { courseId, ids },
      transaction,
    );
  }
}
