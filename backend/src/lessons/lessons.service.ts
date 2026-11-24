import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Transaction } from 'sequelize';
import { CoursesRepository, Lesson } from '../courses/courses.repository';
import { CoursesService } from '../courses/courses.service';
import { DatabaseRepository } from '../database/database.repository';
import { LessonDto } from './lessons.dto';
import { LessonsRepository } from './lessons.repository';
import type { SessionUser } from '../auth/auth.guard';
import type { Request } from 'express';
import type { UploadedFile } from 'express-fileupload';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class LessonsService {
  constructor(
    private readonly repository: LessonsRepository,
    private readonly courses: CoursesService,
    private readonly courseRepository: CoursesRepository,
    private readonly db: DatabaseRepository,
    private readonly storage: StorageService,
  ) {}

  list(courseId: number, studentId: number) {
    return this.courses.withCourse(courseId, async (course, transaction) => {
      if (
        course.estado === 'borrador' ||
        !(await this.repository.isEnrolled(courseId, studentId, transaction))
      ) {
        throw new ForbiddenException(
          'Debes estar inscrito para acceder a las lecciones.',
        );
      }
      return this.repository.statuses(courseId, studentId, transaction);
    });
  }

  private readable<T>(
    id: number,
    user: SessionUser,
    work: (lesson: Lesson, transaction: Transaction) => Promise<T>,
  ) {
    return this.courses.withLesson(id, async (lesson, course, transaction) => {
      if (user.rol === 'instructor' && course.instructor_id === user.id)
        return work(lesson, transaction);
      if (
        user.rol !== 'estudiante' ||
        course.estado === 'borrador' ||
        !(await this.repository.isEnrolled(course.id, user.id, transaction))
      ) {
        throw new ForbiddenException('No tienes acceso a esta lección.');
      }
      const statuses = await this.repository.statuses(
        course.id,
        user.id,
        transaction,
      );
      if (statuses.find((l) => l.id === id)?.bloqueada !== false) {
        throw new ForbiddenException(
          'Lección bloqueada. Completa las anteriores y aprueba sus cuestionarios.',
        );
      }
      return work(lesson, transaction);
    });
  }

  view(id: number, user: SessionUser) {
    return this.readable(id, user, async (lesson, transaction) => ({
      ...lesson,
      archivos: await this.repository.files(id, transaction),
    }));
  }

  async upload(id: number, ownerId: number, request: Request) {
    const files = request.files;
    const file = files?.archivo;
    if (
      !file ||
      Array.isArray(file) ||
      Object.keys(files).length !== 1 ||
      Object.keys(request.body ?? {}).length
    ) {
      throw new BadRequestException(
        'Envía un solo archivo en el campo archivo.',
      );
    }
    let saved: Awaited<ReturnType<StorageService['save']>> | undefined;
    try {
      return await this.withOwner(id, ownerId, async (lesson, transaction) => {
        if (lesson.tipo !== 'contenido')
          throw new BadRequestException(
            'Los adjuntos pertenecen a lecciones de contenido.',
          );
        saved = await this.storage.save(id, file as UploadedFile);
        await this.repository.addFile(id, saved, transaction);
        return this.repository.files(id, transaction);
      });
    } catch (error) {
      if (saved) await this.storage.remove(id, saved.nombre_guardado);
      throw error;
    }
  }

  download(id: number, fileId: string, user: SessionUser) {
    return this.readable(id, user, async (_lesson, transaction) => {
      const file = await this.repository.file(id, fileId, transaction);
      if (!file) throw new NotFoundException('Archivo no encontrado.');
      return {
        ...file,
        stream: await this.storage.read(id, file.nombre_guardado),
      };
    });
  }

  async deleteFile(id: number, fileId: string, ownerId: number) {
    const file = await this.withOwner(
      id,
      ownerId,
      async (_lesson, transaction) => {
        const found = await this.repository.file(id, fileId, transaction);
        if (!found) throw new NotFoundException('Archivo no encontrado.');
        await this.repository.removeFile(fileId, transaction);
        return found;
      },
    );
    await this.storage.remove(id, file.nombre_guardado);
  }

  private validate(data: LessonDto) {
    if (data.tipo === 'contenido') {
      if ((!data.contenido && !data.videoUrl) || data.notaMinima != null) {
        throw new BadRequestException(
          'El contenido necesita texto o video y no admite nota mínima.',
        );
      }
    } else if (
      data.notaMinima == null ||
      data.contenido != null ||
      data.videoUrl != null
    ) {
      throw new BadRequestException(
        'El cuestionario requiere nota mínima y no admite texto ni video.',
      );
    }
  }

  withOwner<T>(
    id: number,
    ownerId: number,
    work: (lesson: Lesson, transaction: Transaction) => Promise<T>,
  ) {
    return this.courses.withLesson(id, (lesson, course, transaction) => {
      if (course.instructor_id !== ownerId) {
        throw new ForbiddenException('La lección pertenece a otro instructor.');
      }
      return work(lesson, transaction);
    });
  }

  create(courseId: number, ownerId: number, data: LessonDto) {
    this.validate(data);
    return this.courses.withOwner(
      courseId,
      ownerId,
      async (_course, transaction) => {
        const result = await this.repository.create(
          courseId,
          data,
          transaction,
        );
        await this.db.refreshCourseProgress(courseId, transaction);
        return result;
      },
    );
  }

  update(id: number, ownerId: number, data: LessonDto) {
    this.validate(data);
    return this.withOwner(id, ownerId, async (lesson, transaction) => {
      if (lesson.tipo !== data.tipo) {
        throw new BadRequestException(
          'El tipo de una lección existente no se puede cambiar.',
        );
      }
      const result = await this.repository.update(id, data, transaction);
      await this.db.refreshCourseProgress(lesson.curso_id, transaction);
      return result;
    });
  }

  async remove(id: number, ownerId: number) {
    await this.withOwner(id, ownerId, async (lesson, transaction) => {
      const lessons = await this.courseRepository.lessons(
        lesson.curso_id,
        transaction,
      );
      const course = await this.courseRepository.find(
        lesson.curso_id,
        transaction,
      );
      if (course?.estado === 'publicado' && lessons.length === 1) {
        throw new ConflictException(
          'Archiva el curso antes de eliminar su última lección.',
        );
      }
      await this.repository.remove(id, transaction);
      await this.repository.reorder(
        lesson.curso_id,
        lessons.filter((l) => l.id !== id).map((l) => l.id),
        transaction,
      );
      await this.db.refreshCourseProgress(lesson.curso_id, transaction);
    });
    await this.storage.removeLesson(id);
  }

  reorder(courseId: number, ownerId: number, ids: number[]) {
    return this.courses.withOwner(
      courseId,
      ownerId,
      async (_course, transaction) => {
        const lessons = await this.courseRepository.lessons(
          courseId,
          transaction,
        );
        if (
          ids.length !== lessons.length ||
          lessons.some((l) => !ids.includes(l.id))
        ) {
          throw new BadRequestException(
            'Envía todos los IDs del curso, sin omisiones ni repeticiones.',
          );
        }
        await this.repository.reorder(courseId, ids, transaction);
        return this.courseRepository.lessons(courseId, transaction);
      },
    );
  }
}
