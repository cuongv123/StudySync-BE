import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../User/entities/User.entity';
import { StudyGroup } from '../../group/entities/group.entity';

export enum NotificationType {
  INVITE_RECEIVED = 'invite_received',
  JOIN_REQUEST = 'join_request', 
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',
  MEMBER_REMOVED = 'member_removed',
  GROUP_UPDATED = 'group_updated',
  LEADERSHIP_TRANSFERRED = 'leadership_transferred',
  LEADERSHIP_RECEIVED = 'leadership_received',
  LEADERSHIP_CHANGED = 'leadership_changed',
  NEW_MESSAGE = 'new_message',
  MESSAGE_REPLY = 'message_reply'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'notificationType'
  })
  type: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content' })
  content: string;

  @Column({ 
    name: 'isRead',
    default: false 
  })
  isRead: boolean;

  @Column({ 
    name: 'userId',
    type: 'uuid' 
  })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ 
    name: 'relatedId',
    type: 'integer',
    nullable: true 
  })
  relatedId?: number;

  @Column({ 
    name: 'relatedType',
    type: 'varchar',
    length: 50,
    nullable: true 
  })
  relatedType?: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}