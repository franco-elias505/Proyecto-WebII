import { Test, TestingModule } from '@nestjs/testing';
import { PersonasController } from './personas.controller.js';
import { PersonasService } from './personas.service.js';

describe('PersonasController', () => {
  let controller: PersonasController;
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
      controllers: [PersonasController],
      providers: [{ provide: PersonasService, useValue: service }],
    }).compile();

    controller = module.get<PersonasController>(PersonasController);
  });

  it('delegates findOne to the service', async () => {
    service.getOne.mockResolvedValue({ id: 1 });
    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
    expect(service.getOne).toHaveBeenCalledWith(1);
  });

  it('delegates partialUpdate to the service', async () => {
    service.partialUpdate.mockResolvedValue({ id: 1, edad: 40 });
    await expect(controller.partialUpdate(1, { edad: 40 })).resolves.toEqual({
      id: 1,
      edad: 40,
    });
    expect(service.partialUpdate).toHaveBeenCalledWith(1, { edad: 40 });
  });

  it('delegates update to the service', async () => {
    const dto = {
      nombres: 'Luis',
      apellidos: 'Gómez',
      edad: 41,
      ciudad: 'Arequipa',
      fechaNacimiento: new Date('1984-05-10'),
    };
    service.update.mockResolvedValue({ id: 1, ...dto });
    await expect(controller.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates remove to the service', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
