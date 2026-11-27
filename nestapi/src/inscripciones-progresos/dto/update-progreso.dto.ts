import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class UpdateProgresoDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  porcentaje?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calificacion?: number;

  @IsOptional()
  @IsBoolean()
  completado?: boolean;

  @IsOptional()
  @IsISO8601()
  fechaActualizacion?: Date;

  @IsOptional()
  @IsInt()
  @IsPositive()
  inscripcionId?: number;
}

