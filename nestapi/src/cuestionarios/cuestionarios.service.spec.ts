import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cuestionario } from './entities/cuestionario.entity.js';
import { CuestionariosService } from './cuestionarios.service.js';

describe('CuestionariosService', () => {
  let service: CuestionariosService;
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };

  const cuestionario: Cuestionario = {
    id: 1,
    titulo: 'Examen de Redes',
    descripcion: 'Evaluación del módulo de redes',
    duracionMinutos: 60,
    puntajeMaximo: 100,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuestionariosService,
        { provide: getRepositoryToken(Cuestionario), useValue: repository },
      ],
    }).compile();

    service = module.get<CuestionariosService>(CuestionariosService);
  });

  it('returns all cuestionarios', async () => {
    repository.find.mockResolvedValue([cuestionario]);
    await expect(service.getAll()).resolves.toEqual([cuestionario]);
  });

  it('returns one cuestionario by id', async () => {
    repository.findOneBy.mockResolvedValue(cuestionario);
    await expect(service.getOne(1)).resolves.toEqual(cuestionario);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('throws NotFoundException when cuestionario does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.getOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a cuestionario', async () => {
    const dto = {
      titulo: 'Examen BD',
      descripcion: 'Bases de datos SQL',
      duracionMinutos: 45,
      puntajeMaximo: 100,
    };
    repository.create.mockReturnValue(dto);
    repository.save.mockResolvedValue({ id: 2, ...dto });

    await expect(service.create(dto)).resolves.toEqual({ id: 2, ...dto });
    expect(repository.save).toHaveBeenCalledWith(dto);
  });

  it('replaces an existing cuestionario', async () => {
    const dto = {
      titulo: 'Examen BD Avanzado',
      descripcion: 'Bases de datos NoSQL',
      duracionMinutos: 90,
      puntajeMaximo: 100,
    };
    repository.findOneBy.mockResolvedValue(cuestionario);
    repository.save.mockResolvedValue({ id: 1, ...dto });

    await expect(service.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(repository.save).toHaveBeenCalledWith({ id: 1, ...dto });
  });

  it('throws NotFoundException when replacing a missing cuestionario', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(
      service.update(99, {
        titulo: 'Examen',
        descripcion: 'Desc',
        duracionMinutos: 30,
        puntajeMaximo: 50,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('partially updates an existing cuestionario', async () => {
    const updated = { ...cuestionario, titulo: 'Examen Modificado' };
    repository.findOneBy.mockResolvedValue(cuestionario);
    repository.merge.mockReturnValue(updated);
    repository.save.mockResolvedValue(updated);

    await expect(
      service.partialUpdate(1, { titulo: 'Examen Modificado' }),
    ).resolves.toEqual(updated);
    expect(repository.merge).toHaveBeenCalledWith(cuestionario, {
      titulo: 'Examen Modificado',
    });
    expect(repository.save).toHaveBeenCalledWith(updated);
  });

  it('throws NotFoundException when partially updating a missing cuestionario', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(
      service.partialUpdate(99, { titulo: 'Inexistente' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing cuestionario', async () => {
    repository.findOneBy.mockResolvedValue(cuestionario);
    repository.remove.mockResolvedValue(cuestionario);

    await service.remove(1);
    expect(repository.remove).toHaveBeenCalledWith(cuestionario);
  });

  it('throws NotFoundException when removing a missing cuestionario', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});

