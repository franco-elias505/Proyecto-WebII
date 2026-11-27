import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { EstadoInscripcion } from '../entities/inscripcion.entity.js';

export class UpdateInscripcionDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  estudiante?: string;

  @IsOptional()
  @IsEnum(EstadoInscripcion)
  estado?: EstadoInscripcion;

  @IsOptional()
  @IsISO8601()
  fechaInscripcion?: Date;

  @IsOptional()
  @IsInt()
  @IsPositive()
  cuestionarioId?: number;
}

