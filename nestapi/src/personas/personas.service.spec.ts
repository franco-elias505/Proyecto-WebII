import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Persona } from './persona.entity.js';
import { PersonasService } from './personas.service.js';

describe('PersonasService', () => {
  let service: PersonasService;
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };

  const persona: Persona = {
    id: 1,
    nombres: 'Ana',
    apellidos: 'Pérez',
    edad: 30,
    ciudad: 'Lima',
    fechaNacimiento: new Date('1995-01-01'),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonasService,
        { provide: getRepositoryToken(Persona), useValue: repository },
      ],
    }).compile();

    service = module.get<PersonasService>(PersonasService);
  });

  it('returns all personas', async () => {
    repository.find.mockResolvedValue([persona]);
    await expect(service.getAll()).resolves.toEqual([persona]);
  });

  it('returns one persona by id', async () => {
    repository.findOneBy.mockResolvedValue(persona);
    await expect(service.getOne(1)).resolves.toEqual(persona);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('throws NotFoundException when persona does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.getOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('partially updates an existing persona', async () => {
    const updated = { ...persona, ciudad: 'Cusco' };
    repository.findOneBy.mockResolvedValue(persona);
    repository.merge.mockReturnValue(updated);
    repository.save.mockResolvedValue(updated);

    await expect(
      service.partialUpdate(1, { ciudad: 'Cusco' }),
    ).resolves.toEqual(updated);
    expect(repository.merge).toHaveBeenCalledWith(persona, { ciudad: 'Cusco' });
    expect(repository.save).toHaveBeenCalledWith(updated);
  });

  it('throws NotFoundException when partially updating a missing persona', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(
      service.partialUpdate(99, { edad: 40 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('replaces every field of an existing persona', async () => {
    const dto = {
      nombres: 'Luis',
      apellidos: 'Gómez',
      edad: 41,
      ciudad: 'Arequipa',
      fechaNacimiento: new Date('1984-05-10'),
    };
    const replaced = { id: 1, ...dto };
    repository.findOneBy.mockResolvedValue(persona);
    repository.save.mockResolvedValue(replaced);

    await expect(service.update(1, dto)).resolves.toEqual(replaced);
    expect(repository.save).toHaveBeenCalledWith(replaced);
  });

  it('throws NotFoundException when replacing a missing persona', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(
      service.update(99, {
        nombres: 'Luis',
        apellidos: 'Gómez',
        edad: 41,
        ciudad: 'Arequipa',
        fechaNacimiento: new Date('1984-05-10'),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing persona', async () => {
    repository.findOneBy.mockResolvedValue(persona);
    repository.remove.mockResolvedValue(persona);

    await service.remove(1);
    expect(repository.remove).toHaveBeenCalledWith(persona);
  });

  it('throws NotFoundException when removing a missing persona', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
