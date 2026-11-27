import { Test, TestingModule } from '@nestjs/testing';
import { MascotasController } from './mascotas.controller.js';
import { MascotasService } from './mascotas.service.js';
import { TipoMascota } from './entities/mascota.entity.js';

describe('MascotasController', () => {
  let controller: MascotasController;
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
      controllers: [MascotasController],
      providers: [{ provide: MascotasService, useValue: service }],
    }).compile();

    controller = module.get<MascotasController>(MascotasController);
  });

  it('delegates create to the service', async () => {
    const dto = { nombre: 'Michi', tipo: TipoMascota.GATO, personaId: 1 };
    service.create.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates findOne to the service', async () => {
    service.getOne.mockResolvedValue({ id: 1 });
    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
    expect(service.getOne).toHaveBeenCalledWith(1);
  });

  it('delegates partialUpdate to the service', async () => {
    service.partialUpdate.mockResolvedValue({ id: 1, nombre: 'Rex' });
    await controller.partialUpdate(1, { nombre: 'Rex' });
    expect(service.partialUpdate).toHaveBeenCalledWith(1, { nombre: 'Rex' });
  });

  it('delegates remove to the service', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
