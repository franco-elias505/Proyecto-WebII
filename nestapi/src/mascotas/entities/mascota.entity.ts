import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Persona } from '../../personas/persona.entity.js';

export enum TipoMascota {
  PERRO = 'perro',
  GATO = 'gato',
  LORO = 'loro',
  LLAMA = 'llama',
}

@Entity()
export class Mascota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'enum', enum: TipoMascota })
  tipo: TipoMascota;

  @Column()
  personaId: number;

  @ManyToOne(() => Persona, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personaId' })
  persona?: Persona;
}
