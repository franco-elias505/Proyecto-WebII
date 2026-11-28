import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesRepository } from '../courses/courses.repository';
import { DatabaseRepository } from '../database/database.repository';
import { InscriptionsRepository } from './inscriptions.repository';
import { InscriptionsService } from './inscriptions.service';

describe('InscriptionsService', () => {
  let service: InscriptionsService;
  let repository: Partial<InscriptionsRepository>;
  let coursesRepository: Partial<CoursesRepository>;
  let db: Partial<DatabaseRepository>;

  beforeEach(async () => {
    repository = {
      findByStudentAndCourse: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      initializeProgress: jest.fn(),
      listStudentCourses: jest.fn(),
      delete: jest.fn(),
    };
    coursesRepository = {
      find: jest.fn(),
    };
    db = {
      transaction: jest.fn().mockImplementation((fn) => fn({})),
      refreshCourseProgress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscriptionsService,
        { provide: InscriptionsRepository, useValue: repository },
        { provide: CoursesRepository, useValue: coursesRepository },
        { provide: DatabaseRepository, useValue: db },
      ],
    }).compile();

    service = module.get<InscriptionsService>(InscriptionsService);
  });

  it('should throw NotFoundException if course does not exist', async () => {
    (coursesRepository.find as jest.Mock).mockResolvedValue(null);
    await expect(service.enroll(1, 2)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if course is not published', async () => {
    (coursesRepository.find as jest.Mock).mockResolvedValue({
      id: 1,
      estado: 'borrador',
    });
    await expect(service.enroll(1, 2)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ConflictException if already enrolled', async () => {
    (coursesRepository.find as jest.Mock).mockResolvedValue({
      id: 1,
      estado: 'publicado',
    });
    (repository.findByStudentAndCourse as jest.Mock).mockResolvedValue({
      id: 10,
    });
    await expect(service.enroll(1, 2)).rejects.toThrow(ConflictException);
  });

  it('should enroll successfully in a published course', async () => {
    (coursesRepository.find as jest.Mock).mockResolvedValue({
      id: 1,
      estado: 'publicado',
    });
    (repository.findByStudentAndCourse as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockResolvedValue({
      id: 99,
      estudiante_id: 2,
      curso_id: 1,
      completado: false,
    });

    const result = await service.enroll(1, 2);
    expect(result.id).toBe(99);
    expect(repository.create).toHaveBeenCalled();
    expect(repository.initializeProgress).toHaveBeenCalled();
  });
});
