import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class CreateProgresoDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  porcentaje: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  calificacion: number;

  @IsNotEmpty()
  @IsBoolean()
  completado: boolean;

  @IsNotEmpty()
  @IsISO8601()
  fechaActualizacion: Date;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  inscripcionId: number;
}

