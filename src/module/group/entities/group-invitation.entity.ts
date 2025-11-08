import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../User/entities/User.entity';
import { StudyGroup } from './group.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

@Entity('group_invitations')
export class GroupInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'inviteEmail' })
  inviteEmail: string;

  @Column({ type: 'uuid', name: 'inviterId' })
  inviterId: string;

  @Column({ type: 'integer', name: 'groupId' })
  groupId: number;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'pending',
    name: 'status'
  })
  status: InvitationStatus;

  @Column({ type: 'text', nullable: true, name: 'message' })
  message: string;

  @CreateDateColumn({ name: 'invitedAt' })
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'respondedAt' })
  respondedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'expiresAt' })
  expiresAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inviterId' })
  inviter: User;

  @ManyToOne(() => StudyGroup, group => group.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: StudyGroup;
}