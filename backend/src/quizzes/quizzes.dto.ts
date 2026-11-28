import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Enunciado o pregunta',
    example: '¿Cuál es la palabra clave para declarar una constante en JavaScript?',
  })
  @IsString()
  @IsNotEmpty({ message: 'El enunciado de la pregunta no puede estar vacío.' })
  @MaxLength(1000)
  enunciado: string;

  @ApiProperty({
    description: 'Opciones de respuesta (al menos 2 opciones)',
    example: ['const', 'let', 'var', 'define'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2, { message: 'Debe proporcionar al menos 2 opciones de respuesta.' })
  @ArrayMaxSize(10, { message: 'No puede haber más de 10 opciones.' })
  @IsString({ each: true })
  opciones: string[];

  @ApiProperty({
    description: 'Índice de la respuesta correcta (base 0)',
    example: 0,
  })
  @IsInt({ message: 'El índice correcto debe ser un número entero.' })
  @Min(0)
  @Max(9)
  indice_correcto: number;
}

export class UpdateQuestionDto extends CreateQuestionDto {}

export class AnswerItemDto {
  @ApiProperty({ description: 'ID de la pregunta', example: 1 })
  @IsInt()
  @Min(1)
  pregunta_id: number;

  @ApiProperty({ description: 'Índice de la opción elegida por el estudiante', example: 0 })
  @IsInt()
  @Min(0)
  opcion_seleccionada: number;
}

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Lista de respuestas para cada pregunta del cuestionario',
    type: [AnswerItemDto],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debes enviar al menos una respuesta.' })
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  respuestas: AnswerItemDto[];
}
