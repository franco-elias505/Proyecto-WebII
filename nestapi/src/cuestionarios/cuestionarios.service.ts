import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuestionario } from './entities/cuestionario.entity.js';
import { CreateCuestionarioDto } from './dto/create-cuestionario.dto.js';
import { UpdateCuestionarioDto } from './dto/update-cuestionario.dto.js';

@Injectable()
export class CuestionariosService {
  public constructor(
    @InjectRepository(Cuestionario)
    private readonly repository: Repository<Cuestionario>,
  ) {}

  public getAll() {
    return this.repository.find();
  }

  public async getOne(id: number) {
    const cuestionario = await this.repository.findOneBy({ id });
    if (!cuestionario) {
      throw new NotFoundException(`Cuestionario with id ${id} not found`);
    }
    return cuestionario;
  }

  public create(dto: CreateCuestionarioDto) {
    const newCuestionario = this.repository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      duracionMinutos: dto.duracionMinutos,
      puntajeMaximo: dto.puntajeMaximo,
    });
    return this.repository.save(newCuestionario);
  }

  public async update(id: number, dto: CreateCuestionarioDto) {
    const cuestionario = await this.getOne(id);
    return this.repository.save({
      id: cuestionario.id,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      duracionMinutos: dto.duracionMinutos,
      puntajeMaximo: dto.puntajeMaximo,
    });
  }

  public async partialUpdate(id: number, dto: UpdateCuestionarioDto) {
    const cuestionario = await this.getOne(id);
    const updated = this.repository.merge(cuestionario, dto);
    return this.repository.save(updated);
  }

  public async remove(id: number) {
    const cuestionario = await this.getOne(id);
    await this.repository.remove(cuestionario);
  }
}

