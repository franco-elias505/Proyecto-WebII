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
import { AnswerItemDto, CreateQuestionDto } from './quizzes.dto';
import { QuizzesRepository } from './quizzes.repository';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly repository: QuizzesRepository,
    private readonly courses: CoursesService,
    private readonly lessonsRepository: LessonsRepository,
    private readonly inscriptionsRepository: InscriptionsRepository,
    private readonly db: DatabaseRepository,
  ) {}

  async getQuizForStudent(lessonId: number, student: SessionUser) {
    return this.courses.withLesson(lessonId, async (lesson, course, transaction) => {
      if (lesson.tipo !== 'cuestionario') {
        throw new BadRequestException('Esta lección no es de tipo cuestionario.');
      }
      if (course.estado === 'borrador') {
        throw new ForbiddenException('Este curso aún no está publicado.');
      }

      const isEnrolled = await this.lessonsRepository.isEnrolled(
        course.id,
        student.id,
        transaction,
      );
      if (!isEnrolled) {
        throw new ForbiddenException(
          'Debes inscribirte en el curso para acceder a este cuestionario.',
        );
      }

      const statuses = await this.lessonsRepository.statuses(
        course.id,
        student.id,
        transaction,
      );
      const currentStatus = statuses.find((l) => l.id === lessonId);
      if (currentStatus?.bloqueada) {
        throw new ForbiddenException(
          'Cuestionario bloqueado. Debes completar las lecciones anteriores.',
        );
      }

      const enrollment = await this.inscriptionsRepository.findByStudentAndCourse(
        student.id,
        course.id,
        transaction,
      );
      const progress = enrollment
        ? await this.repository.getProgress(enrollment.id, lessonId, transaction)
        : null;

      const questions = await this.repository.findPublicQuestions(
        lessonId,
        transaction,
      );

      const attempts = progress?.intentos ?? 0;
      const bestGrade = progress?.mejor_nota !== null && progress?.mejor_nota !== undefined
        ? Number(progress.mejor_nota)
        : null;
      const completed = progress?.completada ?? false;
      const minGrade = Number(lesson.nota_minima ?? 70);

      return {
        leccion: {
          id: lesson.id,
          curso_id: lesson.curso_id,
          titulo: lesson.titulo,
          nota_minima: minGrade,
        },
        preguntas: questions,
        progreso: {
          intentos: attempts,
          intentos_maximos: 3,
          intentos_restantes: Math.max(0, 3 - attempts),
          mejor_nota: bestGrade,
          completada: completed,
          aprobada: bestGrade !== null && bestGrade >= minGrade,
        },
      };
    });
  }

  async submitQuiz(
    lessonId: number,
    student: SessionUser,
    answers: AnswerItemDto[],
  ) {
    return this.courses.withLesson(lessonId, async (lesson, course, transaction) => {
      if (lesson.tipo !== 'cuestionario') {
        throw new BadRequestException('Esta lección no es de tipo cuestionario.');
      }
      if (course.estado === 'borrador') {
        throw new ForbiddenException('Este curso aún no está publicado.');
      }

      const isEnrolled = await this.lessonsRepository.isEnrolled(
        course.id,
        student.id,
        transaction,
      );
      if (!isEnrolled) {
        throw new ForbiddenException(
          'Debes inscribirte en el curso para responder este cuestionario.',
        );
      }

      const statuses = await this.lessonsRepository.statuses(
        course.id,
        student.id,
        transaction,
      );
      const currentStatus = statuses.find((l) => l.id === lessonId);
      if (currentStatus?.bloqueada) {
        throw new ForbiddenException(
          'Cuestionario bloqueado. Completa las lecciones anteriores.',
        );
      }

      const enrollment = await this.inscriptionsRepository.findByStudentAndCourse(
        student.id,
        course.id,
        transaction,
      );
      if (!enrollment) {
        throw new ForbiddenException('Inscripción no encontrada.');
      }

      const progress = await this.repository.getProgress(
        enrollment.id,
        lessonId,
        transaction,
      );
      const currentAttempts = progress?.intentos ?? 0;
      const isAlreadyCompleted = progress?.completada ?? false;

      if (currentAttempts >= 3 && !isAlreadyCompleted) {
        throw new ForbiddenException(
          'Has alcanzado el límite de 3 intentos para este cuestionario.',
        );
      }

      const fullQuestions = await this.repository.findQuestionsWithAnswers(
        lessonId,
        transaction,
      );
      if (fullQuestions.length === 0) {
        throw new BadRequestException(
          'Este cuestionario no tiene preguntas registradas todavía.',
        );
      }

      let correctCount = 0;
      for (const q of fullQuestions) {
        const studentAnswer = answers.find((a) => a.pregunta_id === q.id);
        if (
          studentAnswer &&
          studentAnswer.opcion_seleccionada === q.indice_correcto
        ) {
          correctCount++;
        }
      }

      const score = Math.round((correctCount / fullQuestions.length) * 100);
      const minGrade = Number(lesson.nota_minima ?? 70);
      const passed = score >= minGrade;
      const newAttempts = Math.min(currentAttempts + 1, 3);
      const currentBest = progress?.mejor_nota !== null && progress?.mejor_nota !== undefined
        ? Number(progress.mejor_nota)
        : 0;
      const newBestGrade = Math.max(currentBest, score);
      const completed = isAlreadyCompleted || passed;

      await this.repository.recordQuizAttempt(
        course.id,
        enrollment.id,
        lessonId,
        newAttempts,
        newBestGrade,
        completed,
        transaction,
      );

      await this.db.refreshCourseProgress(course.id, transaction);

      return {
        nota: score,
        mejor_nota: newBestGrade,
        nota_minima: minGrade,
        intentos: newAttempts,
        intentos_maximos: 3,
        intentos_restantes: Math.max(0, 3 - newAttempts),
        aprobado: passed,
        completada: completed,
        total_preguntas: fullQuestions.length,
        respuestas_correctas: correctCount,
      };
    });
  }

  async listQuestionsForInstructor(lessonId: number, instructor: SessionUser) {
    return this.courses.withLesson(lessonId, async (_lesson, course, transaction) => {
      if (course.instructor_id !== instructor.id) {
        throw new ForbiddenException('Solo el instructor dueño puede ver estas preguntas.');
      }
      return this.repository.findQuestionsWithAnswers(lessonId, transaction);
    });
  }

  async createQuestion(
    lessonId: number,
    instructor: SessionUser,
    data: CreateQuestionDto,
  ) {
    if (data.indice_correcto >= data.opciones.length) {
      throw new BadRequestException(
        'El índice correcto no puede ser mayor o igual a la cantidad de opciones.',
      );
    }
    return this.courses.withLesson(lessonId, async (lesson, course, transaction) => {
      if (course.instructor_id !== instructor.id) {
        throw new ForbiddenException('Solo el dueño del curso puede agregar preguntas.');
      }
      if (lesson.tipo !== 'cuestionario') {
        throw new BadRequestException('La lección debe ser de tipo cuestionario.');
      }
      return this.repository.createQuestion(lessonId, data, transaction);
    });
  }

  async updateQuestion(
    questionId: number,
    instructor: SessionUser,
    data: CreateQuestionDto,
  ) {
    if (data.indice_correcto >= data.opciones.length) {
      throw new BadRequestException(
        'El índice correcto no puede ser mayor o igual a la cantidad de opciones.',
      );
    }
    const question = await this.repository.findQuestionById(questionId);
    if (!question) {
      throw new NotFoundException('Pregunta no encontrada.');
    }
    return this.courses.withLesson(question.leccion_id, async (_lesson, course, transaction) => {
      if (course.instructor_id !== instructor.id) {
        throw new ForbiddenException('Solo el dueño del curso puede editar esta pregunta.');
      }
      return this.repository.updateQuestion(questionId, data, transaction);
    });
  }

  async deleteQuestion(questionId: number, instructor: SessionUser) {
    const question = await this.repository.findQuestionById(questionId);
    if (!question) {
      throw new NotFoundException('Pregunta no encontrada.');
    }
    return this.courses.withLesson(question.leccion_id, async (_lesson, course, transaction) => {
      if (course.instructor_id !== instructor.id) {
        throw new ForbiddenException('Solo el dueño del curso puede eliminar esta pregunta.');
      }
      await this.repository.deleteQuestion(questionId, transaction);
      return { message: 'Pregunta eliminada con éxito.' };
    });
  }
}
