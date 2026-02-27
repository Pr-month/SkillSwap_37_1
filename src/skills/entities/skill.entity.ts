import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // @Column()
  // category: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @ManyToOne(() => User, (user) => user.skills)
  owner: User;
}
