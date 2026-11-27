import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateCuestionarioDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  duracionMinutos: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  puntajeMaximo: number;
}

