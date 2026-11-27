import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';

@Injectable()
export class ProductosService {
  public constructor(
    @InjectRepository(Producto)
    private readonly repository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) { }

  public getAll() {
    return this.repository.find({
      relations: {
        categoria: true,
      },
      select: {
        id: true,
        nombre: true,
        precio: true,
        stock: true,
        categoriaId: true,
        categoria: {
          id: true,
          nombre: true,
        },
      },
    });
  }

  public async getOne(id: number) {
    const producto = await this.repository.findOne({
      where: { id },
      relations: {
        categoria: true,
      },
      select: {
        id: true,
        nombre: true,
        precio: true,
        stock: true,
        categoriaId: true,
        categoria: {
          id: true,
          nombre: true,
        },
      },
    });
    if (!producto) {
      throw new NotFoundException(`Producto with id ${id} not found`);
    }
    return producto;
  }

  public async create(dto: CreateProductoDto) {
    await this.ensureCategoriaExists(dto.categoriaId);
    const newProducto = this.repository.create({
      nombre: dto.nombre,
      precio: dto.precio,
      stock: dto.stock,
      categoriaId: dto.categoriaId,
    });
    return this.repository.save(newProducto);
  }

  public async update(id: number, dto: CreateProductoDto) {
    const producto = await this.findEntity(id);
    await this.ensureCategoriaExists(dto.categoriaId);
    return this.repository.save({
      id: producto.id,
      nombre: dto.nombre,
      precio: dto.precio,
      stock: dto.stock,
      categoriaId: dto.categoriaId,
    });
  }

  public async partialUpdate(id: number, dto: UpdateProductoDto) {
    const producto = await this.findEntity(id);
    if (dto.categoriaId !== undefined) {
      await this.ensureCategoriaExists(dto.categoriaId);
    }
    const updated = this.repository.merge(producto, dto);
    return this.repository.save(updated);
  }

  public async remove(id: number) {
    const producto = await this.findEntity(id);
    await this.repository.remove(producto);
  }

  private async findEntity(id: number) {
    const producto = await this.repository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto with id ${id} not found`);
    }
    return producto;
  }

  private async ensureCategoriaExists(categoriaId: number) {
    const exists = await this.categoriaRepository.existsBy({ id: categoriaId });
    if (!exists) {
      throw new NotFoundException(`Categoria with id ${categoriaId} not found`);
    }
  }
}
