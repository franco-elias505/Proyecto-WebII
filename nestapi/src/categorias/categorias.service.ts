import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService {
  public constructor(
    @InjectRepository(Categoria)
    private readonly repository: Repository<Categoria>,
  ) {}

  public getAll() {
    return this.repository.find();
  }

  public async getOne(id: number) {
    const categoria = await this.repository.findOneBy({ id });
    if (!categoria) {
      throw new NotFoundException(`Categoria with id ${id} not found`);
    }
    return categoria;
  }

  public create(dto: CreateCategoriaDto) {
    const newCategoria = this.repository.create({
      nombre: dto.nombre,
    });
    return this.repository.save(newCategoria);
  }

  public async update(id: number, dto: CreateCategoriaDto) {
    const categoria = await this.getOne(id);
    return this.repository.save({
      id: categoria.id,
      nombre: dto.nombre,
    });
  }

  public async partialUpdate(id: number, dto: UpdateCategoriaDto) {
    const categoria = await this.getOne(id);
    const updated = this.repository.merge(categoria, dto);
    return this.repository.save(updated);
  }

  public async remove(id: number) {
    const categoria = await this.getOne(id);
    await this.repository.remove(categoria);
  }
}
