import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Inscripcion } from './inscripcion.entity.js';

@Entity()
export class Progreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  porcentaje: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) =>
        value !== null && value !== undefined ? Number(value) : value,
    },
  })
  calificacion: number;

  @Column({ type: 'boolean', default: false })
  completado: boolean;

  @Column({ type: 'date' })
  fechaActualizacion: Date;

  @Column()
  inscripcionId: number;

  @ManyToOne(() => Inscripcion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inscripcionId' })
  inscripcion?: Inscripcion;
}
