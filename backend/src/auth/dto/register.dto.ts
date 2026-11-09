import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Ana Pérez', maxLength: 120 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @ApiProperty({ enum: ['estudiante', 'instructor'], example: 'estudiante' })
  @IsIn(['estudiante', 'instructor'])
  rol!: 'estudiante' | 'instructor';

  @ApiProperty({
    format: 'password',
    example: 'Ejemplo-MiniAula-2026',
    minLength: 8,
    maxLength: 72,
    description: 'La contraseña admite hasta 72 bytes.',
  })
  declare password: string;
}
