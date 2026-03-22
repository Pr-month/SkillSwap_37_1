import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { RequestStatus } from '../enums/request.enums';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  receiver: User;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  offeredSkill: Skill;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  requestedSkill: Skill;

  @Column({ default: false })
  isRead: boolean;
}
