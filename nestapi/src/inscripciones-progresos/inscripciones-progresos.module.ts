import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from './entities/inscripcion.entity.js';
import { Progreso } from './entities/progreso.entity.js';
import { Cuestionario } from '../cuestionarios/entities/cuestionario.entity.js';
import { InscripcionesController } from './inscripciones.controller.js';
import { ProgresosController } from './progresos.controller.js';
import { InscripcionesService } from './inscripciones.service.js';
import { ProgresosService } from './progresos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Inscripcion, Progreso, Cuestionario])],
  controllers: [InscripcionesController, ProgresosController],
  providers: [InscripcionesService, ProgresosService],
  exports: [InscripcionesService, ProgresosService, TypeOrmModule],
})
export class InscripcionesProgresosModule {}

