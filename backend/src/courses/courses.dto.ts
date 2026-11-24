import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../common/request.dto';

export class CourseDto {
  @ApiProperty({ example: 'Introducción a PostgreSQL' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo!: string;

  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  descripcion!: string;

  @ApiProperty({ example: 'Programación' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  categoria!: string;

  @ApiProperty({ example: 'Principiante' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nivel!: string;
}

export class CourseStateDto {
  @ApiProperty({ enum: ['publicado', 'archivado'] })
  @IsIn(['publicado', 'archivado'])
  estado!: 'publicado' | 'archivado';
}
