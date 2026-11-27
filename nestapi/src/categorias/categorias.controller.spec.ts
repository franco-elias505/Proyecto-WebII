import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller.js';
import { CategoriasService } from './categorias.service.js';

describe('CategoriasController', () => {
  let controller: CategoriasController;
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
      controllers: [CategoriasController],
      providers: [{ provide: CategoriasService, useValue: service }],
    }).compile();

    controller = module.get<CategoriasController>(CategoriasController);
  });

  it('delegates findAll to the service', async () => {
    service.getAll.mockResolvedValue([{ id: 1, nombre: 'Electrónica' }]);
    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, nombre: 'Electrónica' },
    ]);
    expect(service.getAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service', async () => {
    service.getOne.mockResolvedValue({ id: 1, nombre: 'Electrónica' });
    await expect(controller.findOne(1)).resolves.toEqual({
      id: 1,
      nombre: 'Electrónica',
    });
    expect(service.getOne).toHaveBeenCalledWith(1);
  });

  it('delegates create to the service', async () => {
    const dto = { nombre: 'Electrónica' };
    service.create.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service', async () => {
    const dto = { nombre: 'Hogar' };
    service.update.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates partialUpdate to the service', async () => {
    service.partialUpdate.mockResolvedValue({ id: 1, nombre: 'Hogar' });
    await expect(
      controller.partialUpdate(1, { nombre: 'Hogar' }),
    ).resolves.toEqual({
      id: 1,
      nombre: 'Hogar',
    });
    expect(service.partialUpdate).toHaveBeenCalledWith(1, { nombre: 'Hogar' });
  });

  it('delegates remove to the service', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
