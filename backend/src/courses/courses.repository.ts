import { Injectable } from '@nestjs/common';
import type { Transaction } from 'sequelize';
import { CatalogDto } from '../common/request.dto';
import { DatabaseRepository } from '../database/database.repository';
import { CourseDto } from './courses.dto';

export type Course = {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  estado: string;
  instructor_id: number;
  creado_en: Date;
  instructor_nombre?: string;
  total_lecciones?: number;
  total_inscritos?: number;
};
export type Lesson = {
  id: number;
  curso_id: number;
  titulo: string;
  tipo: 'contenido' | 'cuestionario';
  contenido: string | null;
  video_url: string | null;
  orden: number;
  nota_minima: string | null;
};

@Injectable()
export class CoursesRepository {
  constructor(private readonly db: DatabaseRepository) {}

  async categories() {
    const rows = await this.db.select<{ categoria: string }>(
      "SELECT DISTINCT categoria FROM cursos WHERE estado = 'publicado' ORDER BY categoria",
    );
    return rows.map((row) => row.categoria);
  }

  async find(id: number, transaction?: Transaction, lock = false) {
    const [course] = await this.db.select<Course>(
      `SELECT c.*, u.nombre AS instructor_nombre FROM cursos c
       JOIN usuarios u ON u.id = c.instructor_id WHERE c.id = $id
       ${lock ? 'FOR UPDATE OF c' : ''}`,
      { id },
      transaction,
    );
    return course;
  }

  async findLesson(id: number, transaction?: Transaction) {
    const [lesson] = await this.db.select<Lesson>(
      'SELECT * FROM lecciones WHERE id = $id',
      { id },
      transaction,
    );
    return lesson;
  }

  lessons(id: number, transaction?: Transaction) {
    return this.db.select<Lesson>(
      'SELECT * FROM lecciones WHERE curso_id = $id ORDER BY orden, id',
      { id },
      transaction,
    );
  }

  async list(query: CatalogDto, instructorId?: number) {
    return this.db.transaction(async (transaction) => {
      const where =
        instructorId === undefined
          ? "c.estado = 'publicado' AND ($categoria::text IS NULL OR c.categoria = $categoria) AND ($q::text IS NULL OR strpos(lower(c.titulo), lower($q)) > 0)"
          : 'c.instructor_id = $instructorId AND ($estado::text IS NULL OR c.estado = $estado)';
      const bind = {
        categoria: query.categoria ?? null,
        q: query.q ?? null,
        instructorId: instructorId ?? null,
        estado: query.estado ?? null,
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
      };
      // The window total and rows come from one statement and one snapshot.
      const rows = await this.db.select<Course & { total: string }>(
        `SELECT c.*, u.nombre AS instructor_nombre,
           (SELECT count(*)::integer FROM lecciones l WHERE l.curso_id = c.id) AS total_lecciones,
           (SELECT count(*)::integer FROM inscripciones i WHERE i.curso_id = c.id) AS total_inscritos,
           count(*) OVER() AS total
         FROM cursos c JOIN usuarios u ON u.id = c.instructor_id WHERE ${where}
         ORDER BY c.id DESC LIMIT $limit OFFSET $offset`,
        bind,
        transaction,
      );
      const [count] = rows.length
        ? []
        : await this.db.select<{ total: string }>(
            `SELECT count(*) AS total FROM cursos c WHERE ${where}`,
            bind,
            transaction,
          );
      const total = Number(rows[0]?.total ?? count?.total ?? 0);
      return {
        data: rows.map(({ total: _total, ...course }) => course),
        total,
        page: query.page,
        limit: query.limit,
      };
    });
  }

  async create(data: CourseDto, instructorId: number) {
    const [course] = await this.db.select<Course>(
      `WITH creado AS (
         INSERT INTO cursos (titulo, descripcion, categoria, nivel, instructor_id)
         VALUES ($titulo, $descripcion, $categoria, $nivel, $instructorId) RETURNING *
       ) SELECT * FROM creado`,
      {
        titulo: data.titulo,
        descripcion: data.descripcion,
        categoria: data.categoria,
        nivel: data.nivel,
        instructorId,
      },
    );
    return course;
  }

  async update(id: number, data: CourseDto, transaction: Transaction) {
    const [course] = await this.db.select<Course>(
      `WITH actualizado AS (
         UPDATE cursos SET titulo = $titulo, descripcion = $descripcion,
           categoria = $categoria, nivel = $nivel WHERE id = $id RETURNING *
       ) SELECT * FROM actualizado`,
      {
        id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        categoria: data.categoria,
        nivel: data.nivel,
      },
      transaction,
    );
    return course;
  }

  async state(id: number, estado: string, transaction: Transaction) {
    const [course] = await this.db.select<Course>(
      `WITH actualizado AS (
         UPDATE cursos SET estado = $estado WHERE id = $id RETURNING *
       ) SELECT * FROM actualizado`,
      { id, estado },
      transaction,
    );
    return course;
  }

  async hasEnrollments(id: number, transaction: Transaction) {
    const [result] = await this.db.select<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM inscripciones WHERE curso_id = $id) AS existe',
      { id },
      transaction,
    );
    return result.existe;
  }

  remove(id: number, transaction: Transaction) {
    return this.db.execute(
      'DELETE FROM cursos WHERE id = $id',
      { id },
      transaction,
    );
  }
}
