import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../User/entities/User.entity';
import { StudyGroup } from './group.entity';

export enum MemberRole {
  LEADER = 'leader',
  MEMBER = 'member'
  // Không cần MODERATOR cho nhóm nhỏ (6 người)
}

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', name: 'userId' })
  userId: string;

  @Column({ type: 'integer', name: 'groupId' })
  groupId: number;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER
  })
  role: MemberRole;

  @CreateDateColumn({ name: 'joinedAt' })
  joinedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => StudyGroup, group => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: StudyGroup;
}