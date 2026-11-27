import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity.js';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) =>
        value !== null && value !== undefined ? Number(value) : value,
    },
  })
  precio: number;

  @Column({ type: 'int' })
  stock: number;

  @Column()
  categoriaId: number;

  @ManyToOne(() => Categoria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoriaId' })
  categoria?: Categoria;
}
