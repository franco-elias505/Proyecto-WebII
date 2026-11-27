import { Module } from '@nestjs/common';
import { PersonasController } from './personas.controller.js';
import { PersonasService } from './personas.service.js';
import { Persona } from './persona.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PersonasController],
  providers: [PersonasService],
  imports: [TypeOrmModule.forFeature([Persona])],
})
export class PersonasModule {}
