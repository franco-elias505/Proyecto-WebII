import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../courses/courses.service';
import { DatabaseRepository } from '../database/database.repository';
import { InscriptionsRepository } from '../inscriptions/inscriptions.repository';
import { LessonsRepository } from '../lessons/lessons.repository';
import { QuizzesRepository } from './quizzes.repository';
import { QuizzesService } from './quizzes.service';

describe('QuizzesService', () => {
  let service: QuizzesService;
  let repository: Partial<QuizzesRepository>;
  let coursesService: Partial<CoursesService>;
  let lessonsRepository: Partial<LessonsRepository>;
  let inscriptionsRepository: Partial<InscriptionsRepository>;
  let db: Partial<DatabaseRepository>;

  beforeEach(async () => {
    repository = {
      findPublicQuestions: jest.fn(),
      findQuestionsWithAnswers: jest.fn(),
      findQuestionById: jest.fn(),
      createQuestion: jest.fn(),
      updateQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
      getProgress: jest.fn(),
      recordQuizAttempt: jest.fn(),
    };
    coursesService = {
      withLesson: jest.fn(),
    };
    lessonsRepository = {
      isEnrolled: jest.fn(),
      statuses: jest.fn(),
    };
    inscriptionsRepository = {
      findByStudentAndCourse: jest.fn(),
    };
    db = {
      refreshCourseProgress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        { provide: QuizzesRepository, useValue: repository },
        { provide: CoursesService, useValue: coursesService },
        { provide: LessonsRepository, useValue: lessonsRepository },
        { provide: InscriptionsRepository, useValue: inscriptionsRepository },
        { provide: DatabaseRepository, useValue: db },
      ],
    }).compile();

    service = module.get<QuizzesService>(QuizzesService);
  });

  it('should throw BadRequestException when submitting to a non-quiz lesson', async () => {
    (coursesService.withLesson as jest.Mock).mockImplementation((_id, fn) =>
      fn({ id: 1, tipo: 'contenido' }, { id: 10, estado: 'publicado' }, {}),
    );

    await expect(
      service.submitQuiz(1, { id: 2, rol: 'estudiante' }, []),
    ).rejects.toThrow(BadRequestException);
  });

  it('should calculate grade and record progress on quiz submit', async () => {
    (coursesService.withLesson as jest.Mock).mockImplementation((_id, fn) =>
      fn(
        { id: 1, tipo: 'cuestionario', curso_id: 10, nota_minima: 70 },
        { id: 10, estado: 'publicado' },
        {},
      ),
    );
    (lessonsRepository.isEnrolled as jest.Mock).mockResolvedValue(true);
    (lessonsRepository.statuses as jest.Mock).mockResolvedValue([
      { id: 1, bloqueada: false },
    ]);
    (inscriptionsRepository.findByStudentAndCourse as jest.Mock).mockResolvedValue({
      id: 5,
    });
    (repository.getProgress as jest.Mock).mockResolvedValue({
      intentos: 0,
      mejor_nota: null,
      completada: false,
    });
    (repository.findQuestionsWithAnswers as jest.Mock).mockResolvedValue([
      { id: 101, indice_correcto: 1 },
      { id: 102, indice_correcto: 0 },
    ]);

    const result = await service.submitQuiz(1, { id: 2, rol: 'estudiante' }, [
      { pregunta_id: 101, opcion_seleccionada: 1 },
      { pregunta_id: 102, opcion_seleccionada: 0 },
    ]);

    expect(result.nota).toBe(100);
    expect(result.aprobado).toBe(true);
    expect(result.intentos).toBe(1);
    expect(repository.recordQuizAttempt).toHaveBeenCalled();
  });
});
