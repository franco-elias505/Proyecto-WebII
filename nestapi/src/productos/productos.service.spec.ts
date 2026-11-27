import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { ProductosService } from './productos.service.js';

describe('ProductosService', () => {
  let service: ProductosService;
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };
  const categoriaRepository = { existsBy: vi.fn() };

  const producto: Producto = {
    id: 1,
    nombre: 'Laptop Gamer',
    precio: 1200.5,
    stock: 10,
    categoriaId: 1,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: getRepositoryToken(Producto), useValue: repository },
        { provide: getRepositoryToken(Categoria), useValue: categoriaRepository },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  it('returns all productos', async () => {
    repository.find.mockResolvedValue([producto]);
    await expect(service.getAll()).resolves.toEqual([producto]);
  });

  it('returns the producto with id and nombre of its categoria', async () => {
    repository.findOne.mockResolvedValue(producto);
    await expect(service.getOne(1)).resolves.toEqual(producto);
    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        relations: { categoria: true },
        select: expect.objectContaining({
          categoria: { id: true, nombre: true },
        }),
      }),
    );
  });

  it('throws NotFoundException when producto does not exist', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.getOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a producto when the category exists', async () => {
    const dto = {
      nombre: 'Mouse Inalámbrico',
      precio: 25.99,
      stock: 50,
      categoriaId: 1,
    };
    categoriaRepository.existsBy.mockResolvedValue(true);
    repository.create.mockReturnValue(dto);
    repository.save.mockResolvedValue({ id: 2, ...dto });
    repository.findOne.mockResolvedValue({ id: 2, ...dto });

    await expect(service.create(dto)).resolves.toEqual({ id: 2, ...dto });
    expect(categoriaRepository.existsBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('rejects creation when category does not exist', async () => {
    categoriaRepository.existsBy.mockResolvedValue(false);
    await expect(
      service.create({
        nombre: 'Mouse',
        precio: 20,
        stock: 5,
        categoriaId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('replaces every field of an existing producto', async () => {
    const dto = {
      nombre: 'Teclado Mecánico',
      precio: 85.5,
      stock: 15,
      categoriaId: 2,
    };
    repository.findOneBy.mockResolvedValue(producto);
    categoriaRepository.existsBy.mockResolvedValue(true);
    repository.save.mockResolvedValue({ id: 1, ...dto });
    repository.findOne.mockResolvedValue({ id: 1, ...dto });

    await expect(service.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(repository.save).toHaveBeenCalledWith({ id: 1, ...dto });
  });

  it('partially updates without checking category when categoriaId is absent', async () => {
    const updated = { ...producto, nombre: 'Laptop Pro' };
    repository.findOneBy.mockResolvedValue(producto);
    repository.merge.mockReturnValue(updated);
    repository.save.mockResolvedValue(updated);
    repository.findOne.mockResolvedValue(updated);

    await expect(service.partialUpdate(1, { nombre: 'Laptop Pro' })).resolves.toEqual(
      updated,
    );
    expect(categoriaRepository.existsBy).not.toHaveBeenCalled();
  });

  it('rejects partial update to a missing category', async () => {
    repository.findOneBy.mockResolvedValue(producto);
    categoriaRepository.existsBy.mockResolvedValue(false);
    await expect(
      service.partialUpdate(1, { categoriaId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing producto', async () => {
    repository.findOneBy.mockResolvedValue(producto);
    await service.remove(1);
    expect(repository.remove).toHaveBeenCalledWith(producto);
  });
});
