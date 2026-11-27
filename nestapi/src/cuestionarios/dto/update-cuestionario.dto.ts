import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateCuestionarioDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  duracionMinutos?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  puntajeMaximo?: number;
}

