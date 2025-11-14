import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupEvent } from './group-event.entity';
import { User } from '../../User/entities/User.entity';

@Entity('event_participants')
export class EventParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => GroupEvent, (event) => event.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: GroupEvent;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
