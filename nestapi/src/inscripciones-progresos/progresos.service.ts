import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progreso } from './entities/progreso.entity.js';
import { Inscripcion } from './entities/inscripcion.entity.js';
import { CreateProgresoDto } from './dto/create-progreso.dto.js';
import { UpdateProgresoDto } from './dto/update-progreso.dto.js';

@Injectable()
export class ProgresosService {
  public constructor(
    @InjectRepository(Progreso)
    private readonly repository: Repository<Progreso>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
  ) {}

  public getAll() {
    return this.repository.find({
      relations: {
        inscripcion: true,
      },
      select: {
        id: true,
        porcentaje: true,
        calificacion: true,
        completado: true,
        fechaActualizacion: true,
        inscripcionId: true,
        inscripcion: {
          id: true,
          estudiante: true,
        },
      },
    });
  }

  public async getOne(id: number) {
    const progreso = await this.repository.findOne({
      where: { id },
      relations: {
        inscripcion: true,
      },
      select: {
        id: true,
        porcentaje: true,
        calificacion: true,
        completado: true,
        fechaActualizacion: true,
        inscripcionId: true,
        inscripcion: {
          id: true,
          estudiante: true,
        },
      },
    });
    if (!progreso) {
      throw new NotFoundException(`Progreso with id ${id} not found`);
    }
    return progreso;
  }

  public async create(dto: CreateProgresoDto) {
    await this.ensureInscripcionExists(dto.inscripcionId);
    const newProgreso = this.repository.create({
      porcentaje: dto.porcentaje,
      calificacion: dto.calificacion,
      completado: dto.completado,
      fechaActualizacion: dto.fechaActualizacion,
      inscripcionId: dto.inscripcionId,
    });
    return this.repository.save(newProgreso);
  }

  public async update(id: number, dto: CreateProgresoDto) {
    const progreso = await this.findEntity(id);
    await this.ensureInscripcionExists(dto.inscripcionId);
    return this.repository.save({
      id: progreso.id,
      porcentaje: dto.porcentaje,
      calificacion: dto.calificacion,
      completado: dto.completado,
      fechaActualizacion: dto.fechaActualizacion,
      inscripcionId: dto.inscripcionId,
    });
  }

  public async partialUpdate(id: number, dto: UpdateProgresoDto) {
    const progreso = await this.findEntity(id);
    if (dto.inscripcionId !== undefined) {
      await this.ensureInscripcionExists(dto.inscripcionId);
    }
    const updated = this.repository.merge(progreso, dto);
    return this.repository.save(updated);
  }

  public async remove(id: number) {
    const progreso = await this.findEntity(id);
    await this.repository.remove(progreso);
  }

  private async findEntity(id: number) {
    const progreso = await this.repository.findOneBy({ id });
    if (!progreso) {
      throw new NotFoundException(`Progreso with id ${id} not found`);
    }
    return progreso;
  }

  private async ensureInscripcionExists(inscripcionId: number) {
    const exists = await this.inscripcionRepository.existsBy({
      id: inscripcionId,
    });
    if (!exists) {
      throw new NotFoundException(
        `Inscripcion with id ${inscripcionId} not found`,
      );
    }
  }
}
