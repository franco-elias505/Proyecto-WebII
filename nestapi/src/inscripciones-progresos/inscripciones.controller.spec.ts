import { Test, TestingModule } from '@nestjs/testing';
import { InscripcionesController } from './inscripciones.controller.js';
import { InscripcionesService } from './inscripciones.service.js';
import { EstadoInscripcion } from './entities/inscripcion.entity.js';

describe('InscripcionesController', () => {
  let controller: InscripcionesController;
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
      controllers: [InscripcionesController],
      providers: [{ provide: InscripcionesService, useValue: service }],
    }).compile();

    controller = module.get<InscripcionesController>(InscripcionesController);
  });

  it('delegates findAll to the service', async () => {
    service.getAll.mockResolvedValue([{ id: 1, estudiante: 'Carlos' }]);
    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, estudiante: 'Carlos' },
    ]);
    expect(service.getAll).toHaveBeenCalled();
  });

  it('delegates findOne to the service', async () => {
    service.getOne.mockResolvedValue({ id: 1, estudiante: 'Carlos' });
    await expect(controller.findOne(1)).resolves.toEqual({
      id: 1,
      estudiante: 'Carlos',
    });
    expect(service.getOne).toHaveBeenCalledWith(1);
  });

  it('delegates create to the service', async () => {
    const dto = {
      estudiante: 'Carlos',
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date(),
      cuestionarioId: 1,
    };
    service.create.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service', async () => {
    const dto = {
      estudiante: 'Carlos Actualizado',
      estado: EstadoInscripcion.COMPLETADA,
      fechaInscripcion: new Date(),
      cuestionarioId: 1,
    };
    service.update.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates partialUpdate to the service', async () => {
    service.partialUpdate.mockResolvedValue({
      id: 1,
      estado: EstadoInscripcion.COMPLETADA,
    });
    await controller.partialUpdate(1, { estado: EstadoInscripcion.COMPLETADA });
    expect(service.partialUpdate).toHaveBeenCalledWith(1, {
      estado: EstadoInscripcion.COMPLETADA,
    });
  });

  it('delegates remove to the service', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
