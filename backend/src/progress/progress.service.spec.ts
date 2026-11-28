import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../courses/courses.service';
import { DatabaseRepository } from '../database/database.repository';
import { InscriptionsRepository } from '../inscriptions/inscriptions.repository';
import { LessonsRepository } from '../lessons/lessons.repository';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let coursesService: Partial<CoursesService>;
  let lessonsRepository: Partial<LessonsRepository>;
  let inscriptionsRepository: Partial<InscriptionsRepository>;
  let db: Partial<DatabaseRepository>;

  beforeEach(async () => {
    coursesService = {
      withLesson: jest.fn(),
      withCourse: jest.fn(),
    };
    lessonsRepository = {
      isEnrolled: jest.fn(),
      statuses: jest.fn(),
    };
    inscriptionsRepository = {
      findByStudentAndCourse: jest.fn(),
    };
    db = {
      execute: jest.fn(),
      refreshCourseProgress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: CoursesService, useValue: coursesService },
        { provide: LessonsRepository, useValue: lessonsRepository },
        { provide: InscriptionsRepository, useValue: inscriptionsRepository },
        { provide: DatabaseRepository, useValue: db },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  it('should reject completing questionnaire lesson as content', async () => {
    (coursesService.withLesson as jest.Mock).mockImplementation((_id, fn) =>
      fn({ id: 1, tipo: 'cuestionario' }, { id: 10, estado: 'publicado' }, {}),
    );

    await expect(
      service.completeContentLesson(1, { id: 2, rol: 'estudiante' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should successfully complete content lesson', async () => {
    (coursesService.withLesson as jest.Mock).mockImplementation((_id, fn) =>
      fn({ id: 1, tipo: 'contenido' }, { id: 10, estado: 'publicado' }, {}),
    );
    (lessonsRepository.isEnrolled as jest.Mock).mockResolvedValue(true);
    (lessonsRepository.statuses as jest.Mock).mockResolvedValue([
      { id: 1, bloqueada: false },
    ]);
    (inscriptionsRepository.findByStudentAndCourse as jest.Mock).mockResolvedValue({
      id: 5,
    });

    const result = await service.completeContentLesson(1, {
      id: 2,
      rol: 'estudiante',
    });
    expect(result.completada).toBe(true);
    expect(db.execute).toHaveBeenCalled();
    expect(db.refreshCourseProgress).toHaveBeenCalled();
  });
});
