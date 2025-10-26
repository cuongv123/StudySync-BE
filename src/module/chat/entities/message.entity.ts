import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudyGroup } from '../../group/entities/group.entity';
import { User } from '../../User/entities/User.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'integer', name: 'groupId' })
  groupId: number;

  @Column({ type: 'uuid', name: 'senderId' })
  senderId: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }[];

  @Column({ type: 'boolean', default: false, name: 'isEdited' })
  isEdited: boolean;

  @Column({ type: 'boolean', default: false, name: 'isDeleted' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'deletedAt' })
  deletedAt?: Date;

  @Column({ type: 'integer', nullable: true, name: 'replyToId' })
  replyToId?: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => StudyGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: StudyGroup;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'replyToId' })
  replyTo?: Message;
}
