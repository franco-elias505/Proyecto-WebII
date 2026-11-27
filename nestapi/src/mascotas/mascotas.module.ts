import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MascotasService } from './mascotas.service.js';
import { MascotasController } from './mascotas.controller.js';
import { Mascota } from './entities/mascota.entity.js';
import { Persona } from '../personas/persona.entity.js';

@Module({
  controllers: [MascotasController],
  providers: [MascotasService],
  imports: [TypeOrmModule.forFeature([Mascota, Persona])],
})
export class MascotasModule {}
