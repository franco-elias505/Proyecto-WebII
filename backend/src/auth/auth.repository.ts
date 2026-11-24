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
  async resourceCourse(kind: 'curso' | 'leccion' | 'pregunta', id: number) {
    const queries = {
      curso: 'SELECT id, instructor_id FROM cursos WHERE id = $id',
      leccion:
        'SELECT c.id, c.instructor_id FROM cursos c JOIN lecciones l ON l.curso_id = c.id WHERE l.id = $id',
      pregunta:
        'SELECT c.id, c.instructor_id FROM cursos c JOIN lecciones l ON l.curso_id = c.id JOIN preguntas p ON p.leccion_id = l.id WHERE p.id = $id',
    };
    const [course] = await sequelize.query<{
      id: number;
      instructor_id: number;
    }>(queries[kind], { bind: { id }, type: QueryTypes.SELECT });
    return course;
  }

  async isEnrolled(courseId: number, studentId: number) {
    const [result] = await sequelize.query<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM inscripciones WHERE curso_id = $courseId AND estudiante_id = $studentId) AS existe',
      { bind: { courseId, studentId }, type: QueryTypes.SELECT },
    );
    return result.existe;
  }

  async findSessionUser(id: number) {
    const [user] = await sequelize.query<Pick<PublicUser, 'id' | 'rol'>>(
      'SELECT id, rol FROM usuarios WHERE id = $id',
      { bind: { id }, type: QueryTypes.SELECT },
    );
    return user;
  }

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
