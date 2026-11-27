import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion } from './entities/inscripcion.entity.js';
import { Cuestionario } from '../cuestionarios/entities/cuestionario.entity.js';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto.js';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto.js';

@Injectable()
export class InscripcionesService {
  public constructor(
    @InjectRepository(Inscripcion)
    private readonly repository: Repository<Inscripcion>,
    @InjectRepository(Cuestionario)
    private readonly cuestionarioRepository: Repository<Cuestionario>,
  ) {}

  public getAll() {
    return this.repository.find({
      relations: {
        cuestionario: true,
      },
      select: {
        id: true,
        estudiante: true,
        estado: true,
        fechaInscripcion: true,
        cuestionarioId: true,
        cuestionario: {
          id: true,
          titulo: true,
        },
      },
    });
  }

  public async getOne(id: number) {
    const inscripcion = await this.repository.findOne({
      where: { id },
      relations: {
        cuestionario: true,
      },
      select: {
        id: true,
        estudiante: true,
        estado: true,
        fechaInscripcion: true,
        cuestionarioId: true,
        cuestionario: {
          id: true,
          titulo: true,
        },
      },
    });
    if (!inscripcion) {
      throw new NotFoundException(`Inscripcion with id ${id} not found`);
    }
    return inscripcion;
  }

  public async create(dto: CreateInscripcionDto) {
    await this.ensureCuestionarioExists(dto.cuestionarioId);
    const newInscripcion = this.repository.create({
      estudiante: dto.estudiante,
      estado: dto.estado,
      fechaInscripcion: dto.fechaInscripcion,
      cuestionarioId: dto.cuestionarioId,
    });
    return this.repository.save(newInscripcion);
  }

  public async update(id: number, dto: CreateInscripcionDto) {
    const inscripcion = await this.findEntity(id);
    await this.ensureCuestionarioExists(dto.cuestionarioId);
    return this.repository.save({
      id: inscripcion.id,
      estudiante: dto.estudiante,
      estado: dto.estado,
      fechaInscripcion: dto.fechaInscripcion,
      cuestionarioId: dto.cuestionarioId,
    });
  }

  public async partialUpdate(id: number, dto: UpdateInscripcionDto) {
    const inscripcion = await this.findEntity(id);
    if (dto.cuestionarioId !== undefined) {
      await this.ensureCuestionarioExists(dto.cuestionarioId);
    }
    const updated = this.repository.merge(inscripcion, dto);
    return this.repository.save(updated);
  }

  public async remove(id: number) {
    const inscripcion = await this.findEntity(id);
    await this.repository.remove(inscripcion);
  }

  private async findEntity(id: number) {
    const inscripcion = await this.repository.findOneBy({ id });
    if (!inscripcion) {
      throw new NotFoundException(`Inscripcion with id ${id} not found`);
    }
    return inscripcion;
  }

  private async ensureCuestionarioExists(cuestionarioId: number) {
    const exists = await this.cuestionarioRepository.existsBy({
      id: cuestionarioId,
    });
    if (!exists) {
      throw new NotFoundException(
        `Cuestionario with id ${cuestionarioId} not found`,
      );
    }
  }
}
