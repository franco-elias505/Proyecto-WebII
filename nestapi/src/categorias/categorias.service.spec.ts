import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity.js';
import { CategoriasService } from './categorias.service.js';

describe('CategoriasService', () => {
  let service: CategoriasService;
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };

  const categoria: Categoria = {
    id: 1,
    nombre: 'Electrónica',
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: getRepositoryToken(Categoria), useValue: repository },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
  });

  it('returns all categorias', async () => {
    repository.find.mockResolvedValue([categoria]);
    await expect(service.getAll()).resolves.toEqual([categoria]);
  });

  it('returns one categoria by id', async () => {
    repository.findOneBy.mockResolvedValue(categoria);
    await expect(service.getOne(1)).resolves.toEqual(categoria);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('throws NotFoundException when categoria does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.getOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a categoria', async () => {
    const dto = { nombre: 'Hogar' };
    repository.create.mockReturnValue(dto);
    repository.save.mockResolvedValue({ id: 2, ...dto });

    await expect(service.create(dto)).resolves.toEqual({ id: 2, ...dto });
    expect(repository.save).toHaveBeenCalledWith(dto);
  });

  it('replaces an existing categoria', async () => {
    const dto = { nombre: 'Ropa' };
    repository.findOneBy.mockResolvedValue(categoria);
    repository.save.mockResolvedValue({ id: 1, ...dto });

    await expect(service.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(repository.save).toHaveBeenCalledWith({ id: 1, ...dto });
  });

  it('throws NotFoundException when replacing a missing categoria', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.update(99, { nombre: 'Ropa' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('partially updates an existing categoria', async () => {
    const updated = { ...categoria, nombre: 'Electro' };
    repository.findOneBy.mockResolvedValue(categoria);
    repository.merge.mockReturnValue(updated);
    repository.save.mockResolvedValue(updated);

    await expect(
      service.partialUpdate(1, { nombre: 'Electro' }),
    ).resolves.toEqual(updated);
    expect(repository.merge).toHaveBeenCalledWith(categoria, {
      nombre: 'Electro',
    });
    expect(repository.save).toHaveBeenCalledWith(updated);
  });

  it('throws NotFoundException when partially updating a missing categoria', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(
      service.partialUpdate(99, { nombre: 'Electro' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing categoria', async () => {
    repository.findOneBy.mockResolvedValue(categoria);
    repository.remove.mockResolvedValue(categoria);

    await service.remove(1);
    expect(repository.remove).toHaveBeenCalledWith(categoria);
  });

  it('throws NotFoundException when removing a missing categoria', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
