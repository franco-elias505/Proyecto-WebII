import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesRepository } from '../courses/courses.repository';
import { DatabaseRepository } from '../database/database.repository';
import { InscriptionsRepository } from './inscriptions.repository';

@Injectable()
export class InscriptionsService {
  constructor(
    private readonly repository: InscriptionsRepository,
    private readonly coursesRepository: CoursesRepository,
    private readonly db: DatabaseRepository,
  ) {}

  async enroll(courseId: number, studentId: number) {
    const course = await this.coursesRepository.find(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado.');
    }
    if (course.estado !== 'publicado') {
      throw new ForbiddenException(
        'Solo puedes inscribirte en cursos publicados.',
      );
    }

    const existing = await this.repository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (existing) {
      throw new ConflictException('Ya estás inscrito en este curso.');
    }

    return this.db.transaction(async (transaction) => {
      const enrollment = await this.repository.create(
        studentId,
        courseId,
        transaction,
      );
      await this.repository.initializeProgress(
        courseId,
        enrollment.id,
        transaction,
      );
      await this.db.refreshCourseProgress(courseId, transaction);
      return enrollment;
    });
  }

  async status(courseId: number, studentId: number) {
    const enrollment = await this.repository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    return {
      inscrito: !!enrollment,
      inscripcion: enrollment || null,
    };
  }

  myCourses(studentId: number) {
    return this.repository.listStudentCourses(studentId);
  }

  async cancel(enrollmentId: number, studentId: number) {
    const enrollment = await this.repository.findById(enrollmentId);
    if (!enrollment || enrollment.estudiante_id !== studentId) {
      throw new NotFoundException('Inscripción no encontrada.');
    }
    await this.repository.delete(enrollmentId, studentId);
    return { message: 'Inscripción cancelada con éxito.' };
  }
}
