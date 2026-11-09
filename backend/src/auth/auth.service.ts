import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, hashSync, truncates } from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_COST = 12;

@Injectable()
export class AuthService {
  private readonly dummyHash = hashSync(
    randomBytes(32).toString('hex'),
    BCRYPT_COST,
  );

  constructor(
    private readonly repository: AuthRepository,
    private readonly jwt: JwtService,
  ) {}

  private validatePasswordSize(password: string) {
    if (truncates(password)) {
      throw new BadRequestException('La contraseña supera los 72 bytes.');
    }
  }

  async register({ nombre, email, password, rol }: RegisterDto) {
    this.validatePasswordSize(password);
    if ([...password].length < 8) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres.',
      );
    }

    const usuario = await this.repository.createUser({
      nombre,
      email,
      rol,
      password_hash: await hash(password, BCRYPT_COST),
    });
    if (!usuario) {
      throw new ConflictException('El correo ya está registrado.');
    }

    return { usuario };
  }

  async login({ email, password }: LoginDto) {
    this.validatePasswordSize(password);

    const user = await this.repository.findByEmail(email);
    const validPassword = await compare(
      password,
      user?.password_hash ?? this.dummyHash,
    );
    if (!user || !validPassword) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const { id, nombre, email: userEmail, rol } = user;
    return {
      accessToken: await this.jwt.signAsync({ sub: id, rol }),
      usuario: { id, nombre, email: userEmail, rol },
    };
  }
}
