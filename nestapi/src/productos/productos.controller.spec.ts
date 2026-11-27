import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller.js';
import { ProductosService } from './productos.service.js';

describe('ProductosController', () => {
  let controller: ProductosController;
  const service = {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    partialUpdate: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [{ provide: ProductosService, useValue: service }],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
  });

  it('delegates findAll to the service', async () => {
    service.getAll.mockResolvedValue([{ id: 1, nombre: 'Producto A' }]);
    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, nombre: 'Producto A' },
    ]);
    expect(service.getAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service', async () => {
    service.getOne.mockResolvedValue({ id: 1, nombre: 'Producto A' });
    await expect(controller.findOne(1)).resolves.toEqual({
      id: 1,
      nombre: 'Producto A',
    });
    expect(service.getOne).toHaveBeenCalledWith(1);
  });

  it('delegates create to the service', async () => {
    const dto = {
      nombre: 'Monitor',
      precio: 250,
      stock: 8,
      categoriaId: 1,
    };
    service.create.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service', async () => {
    const dto = {
      nombre: 'Monitor 4K',
      precio: 350,
      stock: 5,
      categoriaId: 1,
    };
    service.update.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates partialUpdate to the service', async () => {
    service.partialUpdate.mockResolvedValue({ id: 1, nombre: 'Monitor Curvo' });
    await controller.partialUpdate(1, { nombre: 'Monitor Curvo' });
    expect(service.partialUpdate).toHaveBeenCalledWith(1, {
      nombre: 'Monitor Curvo',
    });
  });

  it('delegates remove to the service', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
