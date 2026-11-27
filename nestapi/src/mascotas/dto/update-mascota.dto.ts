import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { TipoMascota } from '../entities/mascota.entity.js';

export class UpdateMascotaDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(TipoMascota)
  tipo?: TipoMascota;

  @IsOptional()
  @IsInt()
  @IsPositive()
  personaId?: number;
}
