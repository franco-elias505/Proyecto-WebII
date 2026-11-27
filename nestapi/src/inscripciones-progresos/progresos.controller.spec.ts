import { Test, TestingModule } from '@nestjs/testing';
import { ProgresosController } from './progresos.controller.js';
import { ProgresosService } from './progresos.service.js';

describe('ProgresosController', () => {
  let controller: ProgresosController;
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
      controllers: [ProgresosController],
      providers: [{ provide: ProgresosService, useValue: service }],
    }).compile();

    controller = module.get<ProgresosController>(ProgresosController);
  });

  it('delegates findAll to the service', async () => {
    service.getAll.mockResolvedValue([{ id: 1, porcentaje: 50 }]);
    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, porcentaje: 50 },
    ]);
    expect(service.getAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service', async () => {
    service.getOne.mockResolvedValue({ id: 1, porcentaje: 50 });
    await expect(controller.findOne(1)).resolves.toEqual({
      id: 1,
      porcentaje: 50,
    });
    expect(service.getOne).toHaveBeenCalledWith(1);
  });

  it('delegates create to the service', async () => {
    const dto = {
      porcentaje: 70,
      calificacion: 80,
      completado: false,
      fechaActualizacion: new Date(),
      inscripcionId: 1,
    };
    service.create.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service', async () => {
    const dto = {
      porcentaje: 80,
      calificacion: 85,
      completado: false,
      fechaActualizacion: new Date(),
      inscripcionId: 1,
    };
    service.update.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates partialUpdate to the service', async () => {
    service.partialUpdate.mockResolvedValue({ id: 1, porcentaje: 90 });
    await controller.partialUpdate(1, { porcentaje: 90 });
    expect(service.partialUpdate).toHaveBeenCalledWith(1, { porcentaje: 90 });
  });

  it('delegates remove to the service', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
