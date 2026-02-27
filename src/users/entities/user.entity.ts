import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  about: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ nullable: true })
  city: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills: Skill[];

  // @Column('simple-array', { nullable: true })
  // wantToLearn: string[];

  @OneToMany(() => Skill, (skill) => skill.owner)
  favoriteSkills: Skill[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;
}
