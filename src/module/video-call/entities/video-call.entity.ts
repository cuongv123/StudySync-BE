import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../User/User.entity';
import { StudyGroup } from '../../group/entities/group.entity';
import { CallParticipant } from './call-participant.entity';
import { CallStatus } from '../../../common/enums/call-status.enum';

@Entity('video_calls')
export class VideoCall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  callTitle: string;

  @Column({ type: 'uuid' })
  startedBy: string;

  @Column({
    type: 'enum',
    enum: CallStatus,
    default: CallStatus.WAITING,
  })
  status: CallStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => StudyGroup, { eager: true })
  @JoinColumn({ name: 'groupId' })
  group: StudyGroup;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'startedBy' })
  starter: User;

  @OneToMany(() => CallParticipant, (participant) => participant.call)
  participants: CallParticipant[];
}
