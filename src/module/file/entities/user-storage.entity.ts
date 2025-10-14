import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../User/entities/User.entity';

@Entity('user_storage')
export class UserStorage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('bigint', { default: 0 })
  usedSpace: number; // bytes

  @Column('bigint', { default: 104857600 }) // 100MB in bytes
  maxSpace: number;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method
  get availableSpace(): number {
    return this.maxSpace - this.usedSpace;
  }

  get usedPercentage(): number {
    return (this.usedSpace / this.maxSpace) * 100;
  }
}
