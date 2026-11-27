import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  EstadoInscripcion,
  Inscripcion,
} from './entities/inscripcion.entity.js';
import { Cuestionario } from '../cuestionarios/entities/cuestionario.entity.js';
import { InscripcionesService } from './inscripciones.service.js';

describe('InscripcionesService', () => {
  let service: InscripcionesService;
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };
  const cuestionarioRepository = { existsBy: vi.fn() };

  const inscripcion: Inscripcion = {
    id: 1,
    estudiante: 'María López',
    estado: EstadoInscripcion.ACTIVA,
    fechaInscripcion: new Date('2026-11-20'),
    cuestionarioId: 1,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscripcionesService,
        { provide: getRepositoryToken(Inscripcion), useValue: repository },
        {
          provide: getRepositoryToken(Cuestionario),
          useValue: cuestionarioRepository,
        },
      ],
    }).compile();

    service = module.get<InscripcionesService>(InscripcionesService);
  });

  it('returns all inscripciones', async () => {
    repository.find.mockResolvedValue([inscripcion]);
    await expect(service.getAll()).resolves.toEqual([inscripcion]);
  });

  it('returns one inscripcion with relations', async () => {
    repository.findOne.mockResolvedValue(inscripcion);
    await expect(service.getOne(1)).resolves.toEqual(inscripcion);
    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        relations: { cuestionario: true },
      }),
    );
  });

  it('throws NotFoundException when inscripcion does not exist', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.getOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates an inscripcion when the cuestionario exists', async () => {
    const dto = {
      estudiante: 'Juan Díaz',
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2026-11-24'),
      cuestionarioId: 1,
    };
    cuestionarioRepository.existsBy.mockResolvedValue(true);
    repository.create.mockReturnValue(dto);
    repository.save.mockResolvedValue({ id: 2, ...dto });

    await expect(service.create(dto)).resolves.toEqual({ id: 2, ...dto });
    expect(cuestionarioRepository.existsBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('rejects creation when cuestionario does not exist', async () => {
    cuestionarioRepository.existsBy.mockResolvedValue(false);
    await expect(
      service.create({
        estudiante: 'Juan',
        estado: EstadoInscripcion.ACTIVA,
        fechaInscripcion: new Date('2026-11-24'),
        cuestionarioId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('replaces every field of an existing inscripcion', async () => {
    const dto = {
      estudiante: 'María Modificada',
      estado: EstadoInscripcion.COMPLETADA,
      fechaInscripcion: new Date('2026-11-20'),
      cuestionarioId: 2,
    };
    repository.findOneBy.mockResolvedValue(inscripcion);
    cuestionarioRepository.existsBy.mockResolvedValue(true);
    repository.save.mockResolvedValue({ id: 1, ...dto });

    await expect(service.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(repository.save).toHaveBeenCalledWith({ id: 1, ...dto });
  });

  it('partially updates without checking cuestionario when cuestionarioId is absent', async () => {
    const updated = { ...inscripcion, estado: EstadoInscripcion.COMPLETADA };
    repository.findOneBy.mockResolvedValue(inscripcion);
    repository.merge.mockReturnValue(updated);
    repository.save.mockResolvedValue(updated);

    await expect(
      service.partialUpdate(1, { estado: EstadoInscripcion.COMPLETADA }),
    ).resolves.toEqual(updated);
    expect(cuestionarioRepository.existsBy).not.toHaveBeenCalled();
  });

  it('rejects partial update to a missing cuestionario', async () => {
    repository.findOneBy.mockResolvedValue(inscripcion);
    cuestionarioRepository.existsBy.mockResolvedValue(false);
    await expect(
      service.partialUpdate(1, { cuestionarioId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing inscripcion', async () => {
    repository.findOneBy.mockResolvedValue(inscripcion);
    await service.remove(1);
    expect(repository.remove).toHaveBeenCalledWith(inscripcion);
  });
});
