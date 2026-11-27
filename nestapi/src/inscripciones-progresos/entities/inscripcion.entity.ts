import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cuestionario } from '../../cuestionarios/entities/cuestionario.entity.js';

export enum EstadoInscripcion {
  ACTIVA = 'activa',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

@Entity()
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  estudiante: string;

  @Column({
    type: 'enum',
    enum: EstadoInscripcion,
    default: EstadoInscripcion.ACTIVA,
  })
  estado: EstadoInscripcion;

  @Column({ type: 'date' })
  fechaInscripcion: Date;

  @Column()
  cuestionarioId: number;

  @ManyToOne(() => Cuestionario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cuestionarioId' })
  cuestionario?: Cuestionario;
}
