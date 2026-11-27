import { IsISO8601, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdatePersonaDto {
  @IsOptional()
  @IsNotEmpty()
  nombres?: string;
  @IsOptional()
  @IsNotEmpty()
  apellidos?: string;
  @IsOptional()
  @IsNumber()
  edad?: number;
  @IsOptional()
  @IsNotEmpty()
  ciudad?: string;
  @IsOptional()
  @IsISO8601()
  fechaNacimiento?: Date;
}
