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

@Entity('payment_attempts')
export class PaymentAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ default: 1 })
  attemptCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastAttemptAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  blockedUntil: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  canAttemptPayment(): boolean {
    // Check if user is currently blocked
    if (this.blockedUntil && new Date() < this.blockedUntil) {
      return false;
    }

    // Allow if less than 3 attempts
    return this.attemptCount < 3;
  }

  incrementAttempt(maxAttempts: number = 3, blockDurationMinutes: number = 30): void {
    this.attemptCount += 1;
    this.lastAttemptAt = new Date();

    // Block after reaching max attempts
    if (this.attemptCount >= maxAttempts) {
      this.blockedUntil = new Date(Date.now() + blockDurationMinutes * 60 * 1000);
    }
  }

  resetAttempts(): void {
    this.attemptCount = 0;
    this.blockedUntil = null;
  }

  getBlockedTimeRemaining(): number | null {
    if (!this.blockedUntil) return null;
    
    const remaining = this.blockedUntil.getTime() - Date.now();
    return remaining > 0 ? remaining : null;
  }

  getBlockedMinutesRemaining(): number | null {
    const remaining = this.getBlockedTimeRemaining();
    return remaining ? Math.ceil(remaining / 60000) : null;
  }

  isBlocked(): boolean {
    return this.getBlockedTimeRemaining() !== null;
  }
}