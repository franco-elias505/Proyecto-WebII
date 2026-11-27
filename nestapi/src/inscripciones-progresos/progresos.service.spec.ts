import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Progreso } from './entities/progreso.entity.js';
import { Inscripcion } from './entities/inscripcion.entity.js';
import { ProgresosService } from './progresos.service.js';

describe('ProgresosService', () => {
  let service: ProgresosService;
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };
  const inscripcionRepository = { existsBy: vi.fn() };

  const progreso: Progreso = {
    id: 1,
    porcentaje: 85,
    calificacion: 92.5,
    completado: false,
    fechaActualizacion: new Date('2026-11-22'),
    inscripcionId: 1,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgresosService,
        { provide: getRepositoryToken(Progreso), useValue: repository },
        {
          provide: getRepositoryToken(Inscripcion),
          useValue: inscripcionRepository,
        },
      ],
    }).compile();

    service = module.get<ProgresosService>(ProgresosService);
  });

  it('returns all progresos', async () => {
    repository.find.mockResolvedValue([progreso]);
    await expect(service.getAll()).resolves.toEqual([progreso]);
  });

  it('returns one progreso with relations', async () => {
    repository.findOne.mockResolvedValue(progreso);
    await expect(service.getOne(1)).resolves.toEqual(progreso);
    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        relations: { inscripcion: true },
      }),
    );
  });

  it('throws NotFoundException when progreso does not exist', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.getOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a progreso when the inscripcion exists', async () => {
    const dto = {
      porcentaje: 100,
      calificacion: 98,
      completado: true,
      fechaActualizacion: new Date('2026-11-24'),
      inscripcionId: 1,
    };
    inscripcionRepository.existsBy.mockResolvedValue(true);
    repository.create.mockReturnValue(dto);
    repository.save.mockResolvedValue({ id: 2, ...dto });

    await expect(service.create(dto)).resolves.toEqual({ id: 2, ...dto });
    expect(inscripcionRepository.existsBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('rejects creation when inscripcion does not exist', async () => {
    inscripcionRepository.existsBy.mockResolvedValue(false);
    await expect(
      service.create({
        porcentaje: 50,
        calificacion: 50,
        completado: false,
        fechaActualizacion: new Date('2026-11-24'),
        inscripcionId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('replaces every field of an existing progreso', async () => {
    const dto = {
      porcentaje: 90,
      calificacion: 95,
      completado: true,
      fechaActualizacion: new Date('2026-11-23'),
      inscripcionId: 1,
    };
    repository.findOneBy.mockResolvedValue(progreso);
    inscripcionRepository.existsBy.mockResolvedValue(true);
    repository.save.mockResolvedValue({ id: 1, ...dto });

    await expect(service.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(repository.save).toHaveBeenCalledWith({ id: 1, ...dto });
  });

  it('partially updates without checking inscripcion when inscripcionId is absent', async () => {
    const updated = { ...progreso, porcentaje: 95 };
    repository.findOneBy.mockResolvedValue(progreso);
    repository.merge.mockReturnValue(updated);
    repository.save.mockResolvedValue(updated);

    await expect(service.partialUpdate(1, { porcentaje: 95 })).resolves.toEqual(
      updated,
    );
    expect(inscripcionRepository.existsBy).not.toHaveBeenCalled();
  });

  it('rejects partial update to a missing inscripcion', async () => {
    repository.findOneBy.mockResolvedValue(progreso);
    inscripcionRepository.existsBy.mockResolvedValue(false);
    await expect(
      service.partialUpdate(1, { inscripcionId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing progreso', async () => {
    repository.findOneBy.mockResolvedValue(progreso);
    await service.remove(1);
    expect(repository.remove).toHaveBeenCalledWith(progreso);
  });
});

