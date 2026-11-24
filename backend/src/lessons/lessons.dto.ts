import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  IsUUID,
} from 'class-validator';
import { Trim, IdParams } from '../common/request.dto';

export class FileParams extends IdParams {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  archivoId!: string;
}

export class LessonDto {
  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo!: string;

  @ApiProperty({ enum: ['contenido', 'cuestionario'] })
  @IsIn(['contenido', 'cuestionario'])
  tipo!: 'contenido' | 'cuestionario';

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @Trim()
  @IsString()
  @MaxLength(100000)
  contenido?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  videoUrl?: string | null;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, nullable: true })
  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  notaMinima?: number | null;
}

export class LessonOrderDto {
  @ApiProperty({
    type: [Number],
    description: 'Todos los IDs del curso en el nuevo orden.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  lecciones!: number[];
}
