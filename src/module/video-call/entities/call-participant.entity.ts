import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../User/entities/User.entity';
import { VideoCall } from './video-call.entity';

@Entity('call_participants')
export class CallParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  callId: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  peerId: string; // WebRTC peer ID

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ default: false })
  isVideoOff: boolean;

  // Relations
  @ManyToOne(() => VideoCall, (call) => call.participants)
  @JoinColumn({ name: 'callId' })
  call: VideoCall;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
