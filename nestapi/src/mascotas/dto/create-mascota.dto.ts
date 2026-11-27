import { IsEnum, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { TipoMascota } from '../entities/mascota.entity.js';

export class CreateMascotaDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsEnum(TipoMascota)
  tipo: TipoMascota;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  personaId: number;
}
