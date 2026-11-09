import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ format: 'email', example: 'ana@example.test', maxLength: 254 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    format: 'password',
    example: 'Ejemplo-MiniAula-2026',
    maxLength: 72,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password!: string;
}
