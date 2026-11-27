import { IsISO8601, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePersonaDto {
  @IsNotEmpty()
  nombres: string;
  @IsNotEmpty()
  apellidos: string;
  @IsNotEmpty()
  @IsNumber()
  edad: number;
  @IsNotEmpty()
  ciudad: string;
  @IsNotEmpty()
  @IsISO8601()
  fechaNacimiento: Date;
}
