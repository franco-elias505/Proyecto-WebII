import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuestionariosController } from './cuestionarios.controller.js';
import { CuestionariosService } from './cuestionarios.service.js';
import { Cuestionario } from './entities/cuestionario.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cuestionario])],
  controllers: [CuestionariosController],
  providers: [CuestionariosService],
  exports: [CuestionariosService, TypeOrmModule],
})
export class CuestionariosModule {}

