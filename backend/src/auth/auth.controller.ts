import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('api/auth')
@ApiTags('Autenticación')
@ApiResponse({ status: 400, description: 'Datos inválidos.' })
@ApiResponse({ status: 429, description: 'Límite de solicitudes superado.' })
@UseGuards(ThrottlerGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Devuelve el JWT y el usuario.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas.' })
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario' })
  @ApiResponse({ status: 201, description: 'Devuelve el usuario creado.' })
  @ApiResponse({ status: 409, description: 'Correo ya registrado.' })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }
}
