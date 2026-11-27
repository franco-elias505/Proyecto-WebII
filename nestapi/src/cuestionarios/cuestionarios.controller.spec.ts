import { Test, TestingModule } from '@nestjs/testing';
import { CuestionariosController } from './cuestionarios.controller.js';
import { CuestionariosService } from './cuestionarios.service.js';

describe('CuestionariosController', () => {
  let controller: CuestionariosController;
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
      controllers: [CuestionariosController],
      providers: [{ provide: CuestionariosService, useValue: service }],
    }).compile();

    controller = module.get<CuestionariosController>(CuestionariosController);
  });

  it('delegates findAll to the service', async () => {
    service.getAll.mockResolvedValue([{ id: 1, titulo: 'Examen 1' }]);
    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, titulo: 'Examen 1' },
    ]);
    expect(service.getAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service', async () => {
    service.getOne.mockResolvedValue({ id: 1, titulo: 'Examen 1' });
    await expect(controller.findOne(1)).resolves.toEqual({
      id: 1,
      titulo: 'Examen 1',
    });
    expect(service.getOne).toHaveBeenCalledWith(1);
  });

  it('delegates create to the service', async () => {
    const dto = {
      titulo: 'Nuevo Examen',
      descripcion: 'Prueba',
      duracionMinutos: 40,
      puntajeMaximo: 100,
    };
    service.create.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service', async () => {
    const dto = {
      titulo: 'Actualizado',
      descripcion: 'Prueba actualizada',
      duracionMinutos: 50,
      puntajeMaximo: 100,
    };
    service.update.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates partialUpdate to the service', async () => {
    service.partialUpdate.mockResolvedValue({ id: 1, titulo: 'Parcial' });
    await expect(
      controller.partialUpdate(1, { titulo: 'Parcial' }),
    ).resolves.toEqual({
      id: 1,
      titulo: 'Parcial',
    });
    expect(service.partialUpdate).toHaveBeenCalledWith(1, { titulo: 'Parcial' });
  });

  it('delegates remove to the service', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});

