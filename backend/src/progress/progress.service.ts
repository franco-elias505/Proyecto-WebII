import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SessionUser } from '../auth/auth.guard';
import { CoursesService } from '../courses/courses.service';
import { DatabaseRepository } from '../database/database.repository';
import { InscriptionsRepository } from '../inscriptions/inscriptions.repository';
import { LessonsRepository } from '../lessons/lessons.repository';

@Injectable()
export class ProgressService {
  constructor(
    private readonly courses: CoursesService,
    private readonly lessonsRepository: LessonsRepository,
    private readonly inscriptionsRepository: InscriptionsRepository,
    private readonly db: DatabaseRepository,
  ) {}

  async completeContentLesson(lessonId: number, student: SessionUser) {
    return this.courses.withLesson(lessonId, async (lesson, course, transaction) => {
      if (lesson.tipo !== 'contenido') {
        throw new BadRequestException(
          'Solo las lecciones de tipo contenido se marcan directamente como completadas. Para cuestionarios, responde el examen correspondiente.',
        );
      }
      if (course.estado === 'borrador') {
        throw new ForbiddenException('El curso no está publicado.');
      }

      const isEnrolled = await this.lessonsRepository.isEnrolled(
        course.id,
        student.id,
        transaction,
      );
      if (!isEnrolled) {
        throw new ForbiddenException(
          'Debes inscribirte en el curso para registrar progreso.',
        );
      }

      const statuses = await this.lessonsRepository.statuses(
        course.id,
        student.id,
        transaction,
      );
      const current = statuses.find((l) => l.id === lessonId);
      if (current?.bloqueada) {
        throw new ForbiddenException(
          'Lección bloqueada. Completa primero las lecciones anteriores.',
        );
      }

      const enrollment = await this.inscriptionsRepository.findByStudentAndCourse(
        student.id,
        course.id,
        transaction,
      );
      if (!enrollment) {
        throw new NotFoundException('Inscripción no encontrada.');
      }

      await this.db.execute(
        `INSERT INTO progreso (curso_id, inscripcion_id, leccion_id, completada, intentos, mejor_nota, actualizado_en)
         VALUES ($courseId, $enrollmentId, $lessonId, true, 0, NULL, now())
         ON CONFLICT (inscripcion_id, leccion_id)
         DO UPDATE SET completada = true, actualizado_en = now()`,
        {
          courseId: course.id,
          enrollmentId: enrollment.id,
          lessonId,
        },
        transaction,
      );

      await this.db.refreshCourseProgress(course.id, transaction);

      return {
        leccion_id: lessonId,
        completada: true,
        mensaje: 'Lección marcada como completada con éxito.',
      };
    });
  }

  async getCourseProgress(courseId: number, student: SessionUser) {
    return this.courses.withCourse(courseId, async (course, transaction) => {
      const enrollment = await this.inscriptionsRepository.findByStudentAndCourse(
        student.id,
        courseId,
        transaction,
      );
      if (!enrollment) {
        throw new ForbiddenException(
          'No estás inscrito en este curso.',
        );
      }

      const statuses = await this.lessonsRepository.statuses(
        courseId,
        student.id,
        transaction,
      );

      const total = statuses.length;
      const completed = statuses.filter((l) => l.completada).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        curso_id: courseId,
        inscrito: true,
        completado: enrollment.completado,
        total_lecciones: total,
        lecciones_completadas: completed,
        porcentaje: percentage,
        lecciones: statuses,
      };
    });
  }
}
