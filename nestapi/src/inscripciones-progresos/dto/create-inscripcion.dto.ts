import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { EstadoInscripcion } from '../entities/inscripcion.entity.js';

export class CreateInscripcionDto {
  @IsNotEmpty()
  @IsString()
  estudiante: string;

  @IsNotEmpty()
  @IsEnum(EstadoInscripcion)
  estado: EstadoInscripcion;

  @IsNotEmpty()
  @IsISO8601()
  fechaInscripcion: Date;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  cuestionarioId: number;
}

