import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class EnrollCourseDto {
  @ApiPropertyOptional({
    description: 'ID del curso al que desea inscribirse (si no se envía en URL)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del curso debe ser un número entero.' })
  @Min(1)
  @Max(2147483647)
  curso_id?: number;
}
