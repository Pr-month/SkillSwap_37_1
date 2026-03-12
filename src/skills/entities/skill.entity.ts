import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // @Column()
  // category: string;

  @Column('text', { array: true, default: [] })
  images: string[];

  @ManyToOne(() => User, (user) => user.skills)
  owner: User;

  @ManyToMany(() => User, (user) => user.favoriteSkills)
  favoritedBy: User[];
}
