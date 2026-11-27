import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './persona.entity.js';
import { CreatePersonaDto } from './dto/create-persona.dto.js';
import { UpdatePersonaDto } from './dto/update-persona.dto.js';

@Injectable()
export class PersonasService {
  public constructor(
    @InjectRepository(Persona)
    private readonly repository: Repository<Persona>,
  ) {}

  public getAll() {
    return this.repository.find();
  }

  public async getOne(id: number) {
    const persona = await this.repository.findOneBy({ id });
    if (!persona) {
      throw new NotFoundException(`Persona with id ${id} not found`);
    }
    return persona;
  }

  public create(dto: CreatePersonaDto) {
    const newPersona = this.repository.create({
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      edad: dto.edad,
      ciudad: dto.ciudad,
      fechaNacimiento: dto.fechaNacimiento,
    });
    return this.repository.save(newPersona);
  }

  public async update(id: number, dto: CreatePersonaDto) {
    const persona = await this.getOne(id);
    return this.repository.save({
      id: persona.id,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      edad: dto.edad,
      ciudad: dto.ciudad,
      fechaNacimiento: dto.fechaNacimiento,
    });
  }

  public async partialUpdate(id: number, dto: UpdatePersonaDto) {
    const persona = await this.getOne(id);
    const updated = this.repository.merge(persona, dto);
    return this.repository.save(updated);
  }

  public async remove(id: number) {
    const persona = await this.getOne(id);
    await this.repository.remove(persona);
  }
}
