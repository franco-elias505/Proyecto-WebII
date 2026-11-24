import { Injectable } from '@nestjs/common';
import { QueryTypes, Transaction } from 'sequelize';
import { sequelize } from '../config/db.config';

@Injectable()
export class DatabaseRepository {
  select<T extends object>(
    sql: string,
    bind: Record<string, unknown> = {},
    transaction?: Transaction,
  ): Promise<T[]> {
    return sequelize.query<T>(sql, {
      bind,
      transaction,
      type: QueryTypes.SELECT,
    });
  }

  async execute(
    sql: string,
    bind: Record<string, unknown> = {},
    transaction?: Transaction,
  ): Promise<void> {
    await sequelize.query(sql, { bind, transaction });
  }

  transaction<T>(work: (transaction: Transaction) => Promise<T>) {
    return sequelize.transaction(work);
  }

  async refreshCourseProgress(courseId: number, transaction: Transaction) {
    await this.execute(
      `UPDATE progreso p SET
         completada = COALESCE(p.mejor_nota >= l.nota_minima, false),
         actualizado_en = now()
       FROM lecciones l WHERE l.id = p.leccion_id AND l.curso_id = $courseId
         AND l.tipo = 'cuestionario'
         AND p.completada IS DISTINCT FROM COALESCE(p.mejor_nota >= l.nota_minima, false)`,
      { courseId },
      transaction,
    );
    await this.execute(
      `UPDATE inscripciones i SET completado =
         EXISTS(SELECT 1 FROM lecciones l WHERE l.curso_id = i.curso_id)
         AND NOT EXISTS(
           SELECT 1 FROM lecciones l
           LEFT JOIN progreso p ON p.leccion_id = l.id AND p.inscripcion_id = i.id
           WHERE l.curso_id = i.curso_id AND NOT COALESCE(p.completada, false)
         )
       WHERE i.curso_id = $courseId`,
      { courseId },
      transaction,
    );
  }
}
