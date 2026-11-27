import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  nombre?: string;
}
