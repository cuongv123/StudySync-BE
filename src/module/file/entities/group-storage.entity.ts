import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudyGroup } from '../../group/entities/group.entity';

@Entity('group_storage')
export class GroupStorage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  groupId: number;

  @OneToOne(() => StudyGroup)
  @JoinColumn({ name: 'groupId' })
  group: StudyGroup;

  @Column('bigint', { default: 0 })
  usedSpace: number; // bytes

  @Column('bigint', { default: 1073741824 }) // 1GB in bytes
  maxSpace: number;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get availableSpace(): number {
    return this.maxSpace - this.usedSpace;
  }

  get usedPercentage(): number {
    return (this.usedSpace / this.maxSpace) * 100;
  }
}
