import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { StudyGroup } from '../../group/entities/group.entity';
import { User } from '../../User/entities/User.entity';
import { EventType } from '../../../common/enums/event-type.enum';
import { EventParticipant } from './event-participant.entity';

@Entity('group_events')
export class GroupEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  groupId: number;

  @Column({ type: 'uuid' })
  creatorId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.MEETING,
  })
  eventType: EventType;

  @Column({ type: 'timestamp with time zone' })
  eventDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string;

  @Column({ type: 'integer', nullable: true })
  reminderMinutes: number;

  @Column({ type: 'boolean', default: false })
  isAllDay: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => StudyGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: StudyGroup;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToMany(() => EventParticipant, (participant) => participant.event, {
    cascade: true,
  })
  participants: EventParticipant[];
}
