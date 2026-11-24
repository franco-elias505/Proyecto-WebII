import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Transaction } from 'sequelize';
import { DatabaseRepository } from '../database/database.repository';
import { CatalogDto } from '../common/request.dto';
import { CourseDto } from './courses.dto';
import { Course, CoursesRepository, Lesson } from './courses.repository';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly repository: CoursesRepository,
    private readonly db: DatabaseRepository,
    private readonly storage: StorageService,
  ) {}

  catalog(query: CatalogDto) {
    return this.repository.list(query);
  }
  categories() {
    return this.repository.categories();
  }
  mine(id: number, query: CatalogDto) {
    return this.repository.list(query, id);
  }
  create(id: number, data: CourseDto) {
    return this.repository.create(data, id);
  }

  editor(id: number, ownerId: number) {
    return this.withOwner(id, ownerId, async (course, transaction) => ({
      ...course,
      lecciones: await this.repository.lessons(id, transaction),
    }));
  }

  async detail(id: number) {
    const course = await this.repository.find(id);
    if (!course || course.estado !== 'publicado') {
      throw new NotFoundException('Curso publicado no encontrado.');
    }
    const lessons = await this.repository.lessons(id);
    return {
      ...course,
      lecciones: lessons.map(({ id, titulo, tipo, orden }) => ({
        id,
        titulo,
        tipo,
        orden,
      })),
    };
  }

  async withCourse<T>(
    id: number,
    work: (course: Course, transaction: Transaction) => Promise<T>,
  ) {
    return this.db.transaction(async (transaction) => {
      const course = await this.repository.find(id, transaction, true);
      if (!course) throw new NotFoundException('Curso no encontrado.');
      return work(course, transaction);
    });
  }

  withOwner<T>(
    id: number,
    ownerId: number,
    work: (course: Course, transaction: Transaction) => Promise<T>,
  ) {
    return this.withCourse(id, (course, transaction) => {
      if (course.instructor_id !== ownerId) {
        throw new ForbiddenException('El curso pertenece a otro instructor.');
      }
      return work(course, transaction);
    });
  }

  async withLesson<T>(
    id: number,
    work: (
      lesson: Lesson,
      course: Course,
      transaction: Transaction,
    ) => Promise<T>,
  ) {
    const found = await this.repository.findLesson(id);
    if (!found) throw new NotFoundException('Lección no encontrada.');
    return this.withCourse(found.curso_id, async (course, transaction) => {
      const lesson = await this.repository.findLesson(id, transaction);
      if (!lesson || lesson.curso_id !== course.id) {
        throw new NotFoundException('Lección no encontrada.');
      }
      return work(lesson, course, transaction);
    });
  }

  update(id: number, ownerId: number, data: CourseDto) {
    return this.withOwner(id, ownerId, (_course, transaction) =>
      this.repository.update(id, data, transaction),
    );
  }

  state(id: number, ownerId: number, estado: string) {
    return this.withOwner(id, ownerId, async (_course, transaction) => {
      if (
        estado === 'publicado' &&
        !(await this.repository.lessons(id, transaction)).length
      ) {
        throw new ConflictException('El curso necesita al menos una lección.');
      }
      return this.repository.state(id, estado, transaction);
    });
  }

  async remove(id: number, ownerId: number) {
    const lessons = await this.withOwner(
      id,
      ownerId,
      async (_course, transaction) => {
        if (await this.repository.hasEnrollments(id, transaction)) {
          throw new ConflictException(
            'El curso tiene inscritos. Archívalo para conservar sus datos.',
          );
        }
        const lessons = await this.repository.lessons(id, transaction);
        await this.repository.remove(id, transaction);
        return lessons;
      },
    );
    for (const lesson of lessons) await this.storage.removeLesson(lesson.id);
  }
}
