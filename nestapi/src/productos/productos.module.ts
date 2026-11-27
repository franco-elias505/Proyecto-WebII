import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service.js';
import { ProductosController } from './productos.controller.js';
import { Producto } from './entities/producto.entity.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria])],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}
