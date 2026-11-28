import { Injectable } from '@nestjs/common';
import type { Transaction } from 'sequelize';
import { DatabaseRepository } from '../database/database.repository';

export type Enrollment = {
  id: number;
  estudiante_id: number;
  curso_id: number;
  fecha_inscripcion: Date;
  completado: boolean;
};

export type StudentCourseSummary = {
  inscripcion_id: number;
  curso_id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  instructor_nombre: string;
  fecha_inscripcion: Date;
  completado: boolean;
  total_lecciones: number;
  lecciones_completadas: number;
};

@Injectable()
export class InscriptionsRepository {
  constructor(private readonly db: DatabaseRepository) {}

  async findByStudentAndCourse(
    studentId: number,
    courseId: number,
    transaction?: Transaction,
  ) {
    const [enrollment] = await this.db.select<Enrollment>(
      `SELECT id, estudiante_id, curso_id, fecha_inscripcion, completado
       FROM inscripciones
       WHERE estudiante_id = $studentId AND curso_id = $courseId`,
      { studentId, courseId },
      transaction,
    );
    return enrollment;
  }

  async findById(id: number, transaction?: Transaction) {
    const [enrollment] = await this.db.select<Enrollment>(
      `SELECT id, estudiante_id, curso_id, fecha_inscripcion, completado
       FROM inscripciones
       WHERE id = $id`,
      { id },
      transaction,
    );
    return enrollment;
  }

  async create(
    studentId: number,
    courseId: number,
    transaction: Transaction,
  ): Promise<Enrollment> {
    const [created] = await this.db.select<Enrollment>(
      `INSERT INTO inscripciones (estudiante_id, curso_id)
       VALUES ($studentId, $courseId)
       RETURNING id, estudiante_id, curso_id, fecha_inscripcion, completado`,
      { studentId, courseId },
      transaction,
    );
    return created;
  }

  async initializeProgress(
    courseId: number,
    enrollmentId: number,
    transaction: Transaction,
  ) {
    const lessons = await this.db.select<{ id: number }>(
      'SELECT id FROM lecciones WHERE curso_id = $courseId ORDER BY orden',
      { courseId },
      transaction,
    );
    for (const lesson of lessons) {
      await this.db.execute(
        `INSERT INTO progreso (curso_id, inscripcion_id, leccion_id, completada, intentos, mejor_nota)
         VALUES ($courseId, $enrollmentId, $lessonId, false, 0, NULL)
         ON CONFLICT (inscripcion_id, leccion_id) DO NOTHING`,
        { courseId, enrollmentId, lessonId: lesson.id },
        transaction,
      );
    }
  }

  listStudentCourses(studentId: number) {
    return this.db.select<StudentCourseSummary>(
      `SELECT i.id AS inscripcion_id,
              c.id AS curso_id,
              c.titulo,
              c.descripcion,
              c.categoria,
              c.nivel,
              u.nombre AS instructor_nombre,
              i.fecha_inscripcion,
              i.completado,
              COALESCE(COUNT(DISTINCT l.id), 0)::integer AS total_lecciones,
              COALESCE(COUNT(DISTINCT CASE WHEN p.completada THEN l.id END), 0)::integer AS lecciones_completadas
       FROM inscripciones i
       JOIN cursos c ON c.id = i.curso_id
       JOIN usuarios u ON u.id = c.instructor_id
       LEFT JOIN lecciones l ON l.curso_id = c.id
       LEFT JOIN progreso p ON p.inscripcion_id = i.id AND p.leccion_id = l.id
       WHERE i.estudiante_id = $studentId
       GROUP BY i.id, c.id, u.nombre
       ORDER BY i.fecha_inscripcion DESC`,
      { studentId },
    );
  }

  async delete(id: number, studentId: number, transaction?: Transaction) {
    await this.db.execute(
      'DELETE FROM inscripciones WHERE id = $id AND estudiante_id = $studentId',
      { id, studentId },
      transaction,
    );
  }
}
