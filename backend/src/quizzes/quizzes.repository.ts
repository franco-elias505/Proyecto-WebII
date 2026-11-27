import { Injectable } from '@nestjs/common';
import type { Transaction } from 'sequelize';
import { DatabaseRepository } from '../database/database.repository';
import { CreateQuestionDto } from './quizzes.dto';

export type PublicQuestion = {
  id: number;
  leccion_id: number;
  enunciado: string;
  opciones: string[];
};

export type FullQuestion = PublicQuestion & {
  indice_correcto: number;
};

export type LessonProgress = {
  id: number;
  curso_id: number;
  inscripcion_id: number;
  leccion_id: number;
  completada: boolean;
  intentos: number;
  mejor_nota: number | null;
};

@Injectable()
export class QuizzesRepository {
  constructor(private readonly db: DatabaseRepository) {}

  findPublicQuestions(lessonId: number, transaction?: Transaction) {
    return this.db.select<PublicQuestion>(
      `SELECT id, leccion_id, enunciado, opciones
       FROM preguntas
       WHERE leccion_id = $lessonId
       ORDER BY id`,
      { lessonId },
      transaction,
    );
  }

  findQuestionsWithAnswers(lessonId: number, transaction?: Transaction) {
    return this.db.select<FullQuestion>(
      `SELECT id, leccion_id, enunciado, opciones, indice_correcto
       FROM preguntas
       WHERE leccion_id = $lessonId
       ORDER BY id`,
      { lessonId },
      transaction,
    );
  }

  async findQuestionById(id: number, transaction?: Transaction) {
    const [question] = await this.db.select<FullQuestion>(
      `SELECT id, leccion_id, enunciado, opciones, indice_correcto
       FROM preguntas
       WHERE id = $id`,
      { id },
      transaction,
    );
    return question;
  }

  async createQuestion(
    lessonId: number,
    data: CreateQuestionDto,
    transaction?: Transaction,
  ): Promise<FullQuestion> {
    const [question] = await this.db.select<FullQuestion>(
      `INSERT INTO preguntas (leccion_id, enunciado, opciones, indice_correcto)
       VALUES ($lessonId, $enunciado, $opciones, $indice_correcto)
       RETURNING id, leccion_id, enunciado, opciones, indice_correcto`,
      {
        lessonId,
        enunciado: data.enunciado,
        opciones: data.opciones,
        indice_correcto: data.indice_correcto,
      },
      transaction,
    );
    return question;
  }

  async updateQuestion(
    id: number,
    data: CreateQuestionDto,
    transaction?: Transaction,
  ): Promise<FullQuestion> {
    const [updated] = await this.db.select<FullQuestion>(
      `UPDATE preguntas
       SET enunciado = $enunciado,
           opciones = $opciones,
           indice_correcto = $indice_correcto
       WHERE id = $id
       RETURNING id, leccion_id, enunciado, opciones, indice_correcto`,
      {
        id,
        enunciado: data.enunciado,
        opciones: data.opciones,
        indice_correcto: data.indice_correcto,
      },
      transaction,
    );
    return updated;
  }

  async deleteQuestion(id: number, transaction?: Transaction) {
    await this.db.execute(
      'DELETE FROM preguntas WHERE id = $id',
      { id },
      transaction,
    );
  }

  async getProgress(
    enrollmentId: number,
    lessonId: number,
    transaction?: Transaction,
  ) {
    const [progress] = await this.db.select<LessonProgress>(
      `SELECT id, curso_id, inscripcion_id, leccion_id, completada, intentos, mejor_nota
       FROM progreso
       WHERE inscripcion_id = $enrollmentId AND leccion_id = $lessonId`,
      { enrollmentId, lessonId },
      transaction,
    );
    return progress;
  }

  async recordQuizAttempt(
    courseId: number,
    enrollmentId: number,
    lessonId: number,
    newAttempts: number,
    newBestGrade: number,
    completed: boolean,
    transaction: Transaction,
  ) {
    await this.db.execute(
      `INSERT INTO progreso (curso_id, inscripcion_id, leccion_id, completada, intentos, mejor_nota, actualizado_en)
       VALUES ($courseId, $enrollmentId, $lessonId, $completed, $newAttempts, $newBestGrade, now())
       ON CONFLICT (inscripcion_id, leccion_id)
       DO UPDATE SET
         intentos = $newAttempts,
         mejor_nota = $newBestGrade,
         completada = progreso.completada OR $completed,
         actualizado_en = now()`,
      {
        courseId,
        enrollmentId,
        lessonId,
        newAttempts,
        newBestGrade,
        completed,
      },
      transaction,
    );
  }
}
