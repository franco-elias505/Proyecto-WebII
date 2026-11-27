import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cuestionario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  descripcion: string;

  @Column({ type: 'int' })
  duracionMinutos: number;

  @Column({ type: 'int' })
  puntajeMaximo: number;
}

