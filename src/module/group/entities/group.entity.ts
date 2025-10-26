import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from '../../User/entities/User.entity';
import { GroupMember } from './group-member.entity';
import { GroupInvitation } from './group-invitation.entity';

@Entity('study_groups')
export class StudyGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'groupName' })
  groupName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', name: 'leaderId' })
  leaderId: string;

  @Column({ type: 'integer', default: 1024, name: 'storageLimitMb' })
  storageLimitMb: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'totalStorageUsedMb' })
  totalStorageUsedMb: number;

  @Column({ type: 'boolean', default: true, name: 'isActive' })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leaderId' })
  leader: User;

  @OneToMany(() => GroupMember, groupMember => groupMember.group, { cascade: true })
  members: GroupMember[];

  @OneToMany(() => GroupInvitation, invitation => invitation.group, { cascade: true })
  invitations: GroupInvitation[];
}