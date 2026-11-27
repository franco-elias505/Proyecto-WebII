import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mascota } from './entities/mascota.entity.js';
import { Persona } from '../personas/persona.entity.js';
import { CreateMascotaDto } from './dto/create-mascota.dto.js';
import { UpdateMascotaDto } from './dto/update-mascota.dto.js';

@Injectable()
export class MascotasService {
  public constructor(
    @InjectRepository(Mascota)
    private readonly repository: Repository<Mascota>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) { }

  public getAll() {
    return this.repository.find({
      relations: {
        persona: true,
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        persona: {
          id: true,
          nombres: true,
          apellidos: true,
        },
      },
    });
  }

  public async getOne(id: number) {
    const mascota = await this.repository.findOne({
      where: { id },
      relations: {
        persona: true,
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        personaId: true,
        persona: {
          id: true,
          nombres: true,
          apellidos: true,
        },
      },
    });
    if (!mascota) {
      throw new NotFoundException(`Mascota with id ${id} not found`);
    }
    return mascota;
  }

  public async create(dto: CreateMascotaDto) {
    await this.ensurePersonaExists(dto.personaId);
    const newMascota = this.repository.create({
      nombre: dto.nombre,
      tipo: dto.tipo,
      personaId: dto.personaId,
    });
    return this.repository.save(newMascota);
  }

  public async update(id: number, dto: CreateMascotaDto) {
    const mascota = await this.findEntity(id);
    await this.ensurePersonaExists(dto.personaId);
    return this.repository.save({
      id: mascota.id,
      nombre: dto.nombre,
      tipo: dto.tipo,
      personaId: dto.personaId,
    });
  }

  public async partialUpdate(id: number, dto: UpdateMascotaDto) {
    const mascota = await this.findEntity(id);
    if (dto.personaId !== undefined) {
      await this.ensurePersonaExists(dto.personaId);
    }
    const updated = this.repository.merge(mascota, dto);
    return this.repository.save(updated);
  }

  public async remove(id: number) {
    const mascota = await this.findEntity(id);
    await this.repository.remove(mascota);
  }

  private async findEntity(id: number) {
    const mascota = await this.repository.findOneBy({ id });
    if (!mascota) {
      throw new NotFoundException(`Mascota with id ${id} not found`);
    }
    return mascota;
  }

  private async ensurePersonaExists(personaId: number) {
    const exists = await this.personaRepository.existsBy({ id: personaId });
    if (!exists) {
      throw new NotFoundException(`Persona with id ${personaId} not found`);
    }
  }
}
