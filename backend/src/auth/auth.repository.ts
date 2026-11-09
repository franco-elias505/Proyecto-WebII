import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/db.config';

type PublicUser = {
  id: number;
  nombre: string;
  email: string;
  rol: 'estudiante' | 'instructor';
};

type LoginUser = PublicUser & { password_hash: string };

@Injectable()
export class AuthRepository {
  async createUser({
    nombre,
    email,
    rol,
    password_hash,
  }: Omit<LoginUser, 'id'>): Promise<PublicUser | undefined> {
    const [user] = await sequelize.query<PublicUser>(
      `WITH creado AS (
         INSERT INTO usuarios (nombre, email, rol, password_hash)
         VALUES ($nombre, lower($email), $rol, $password_hash)
         ON CONFLICT (lower(email)) DO NOTHING
         RETURNING id, nombre, email, rol
       )
       SELECT id, nombre, email, rol FROM creado`,
      {
        bind: { nombre, email, rol, password_hash },
        type: QueryTypes.SELECT,
      },
    );

    return user;
  }

  async findByEmail(email: string): Promise<LoginUser | undefined> {
    const [user] = await sequelize.query<LoginUser>(
      `SELECT id, nombre, email, rol, password_hash
       FROM usuarios
       WHERE lower(email) = lower($email)`,
      { bind: { email }, type: QueryTypes.SELECT },
    );

    return user;
  }
}
