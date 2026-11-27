import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mascota, TipoMascota } from './entities/mascota.entity.js';
import { Persona } from '../personas/persona.entity.js';
import { MascotasService } from './mascotas.service.js';

describe('MascotasService', () => {
  let service: MascotasService;
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };
  const personaRepository = { existsBy: vi.fn() };

  const mascota: Mascota = {
    id: 1,
    nombre: 'Firulais',
    tipo: TipoMascota.PERRO,
    personaId: 1,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MascotasService,
        { provide: getRepositoryToken(Mascota), useValue: repository },
        { provide: getRepositoryToken(Persona), useValue: personaRepository },
      ],
    }).compile();

    service = module.get<MascotasService>(MascotasService);
  });

  it('returns all mascotas', async () => {
    repository.find.mockResolvedValue([mascota]);
    await expect(service.getAll()).resolves.toEqual([mascota]);
  });

  it('returns the mascota with only id, nombres and apellidos of its persona', async () => {
    repository.findOne.mockResolvedValue(mascota);
    await expect(service.getOne(1)).resolves.toEqual(mascota);
    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        relations: { persona: true },
        select: expect.objectContaining({
          persona: { id: true, nombres: true, apellidos: true },
        }),
      }),
    );
  });

  it('throws NotFoundException when mascota does not exist', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.getOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a mascota when the owner exists', async () => {
    const dto = { nombre: 'Michi', tipo: TipoMascota.GATO, personaId: 1 };
    personaRepository.existsBy.mockResolvedValue(true);
    repository.create.mockReturnValue(dto);
    repository.save.mockResolvedValue({ id: 2, ...dto });

    await expect(service.create(dto)).resolves.toEqual({ id: 2, ...dto });
    expect(personaRepository.existsBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('rejects creation when the owner does not exist', async () => {
    personaRepository.existsBy.mockResolvedValue(false);
    await expect(
      service.create({ nombre: 'Lola', tipo: TipoMascota.LLAMA, personaId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('replaces every field of an existing mascota', async () => {
    const dto = { nombre: 'Paco', tipo: TipoMascota.LORO, personaId: 2 };
    repository.findOneBy.mockResolvedValue(mascota);
    personaRepository.existsBy.mockResolvedValue(true);
    repository.save.mockResolvedValue({ id: 1, ...dto });

    await expect(service.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(repository.save).toHaveBeenCalledWith({ id: 1, ...dto });
  });

  it('partially updates without checking owner when personaId is absent', async () => {
    const updated = { ...mascota, nombre: 'Rex' };
    repository.findOneBy.mockResolvedValue(mascota);
    repository.merge.mockReturnValue(updated);
    repository.save.mockResolvedValue(updated);

    await expect(service.partialUpdate(1, { nombre: 'Rex' })).resolves.toEqual(
      updated,
    );
    expect(personaRepository.existsBy).not.toHaveBeenCalled();
  });

  it('rejects partial update to a missing owner', async () => {
    repository.findOneBy.mockResolvedValue(mascota);
    personaRepository.existsBy.mockResolvedValue(false);
    await expect(
      service.partialUpdate(1, { personaId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing mascota', async () => {
    repository.findOneBy.mockResolvedValue(mascota);
    await service.remove(1);
    expect(repository.remove).toHaveBeenCalledWith(mascota);
  });
});
