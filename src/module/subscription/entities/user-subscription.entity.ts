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
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  planId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ default: false })
  purchasedFromWallet: boolean;

  // Usage tracking
  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  usagePersonalStorageMb: number;

  @Column({ default: 0 })
  usageVideoMinutes: number;

  @Column({ default: 0 })
  usageAiQueries: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastResetDate: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => SubscriptionPlan, plan => plan.userSubscriptions)
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  isExpired(): boolean {
    if (!this.endDate) return false; // Free plan không hết hạn
    return new Date() > this.endDate;
  }

  getDaysRemaining(): number | null {
    if (!this.endDate) return null; // Free plan
    
    const now = new Date();
    const diffTime = this.endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  isExpiringSoon(days: number = 3): boolean {
    const remaining = this.getDaysRemaining();
    return remaining !== null && remaining <= days && remaining > 0;
  }

  canUseAI(): boolean {
    if (!this.plan) return false;
    if (this.isExpired()) return false;
    return this.usageAiQueries < this.plan.aiQueriesLimit;
  }

  canUseStorage(additionalMb: number): boolean {
    if (!this.plan) return false;
    if (this.isExpired()) return false;
    return (this.usagePersonalStorageMb + additionalMb) <= this.plan.personalStorageLimitMb;
  }

  canUseVideo(additionalMinutes: number): boolean {
    if (!this.plan) return false;
    if (this.isExpired()) return false;
    return (this.usageVideoMinutes + additionalMinutes) <= this.plan.videoCallMinutesLimit;
  }

  getRemainingAiQueries(): number {
    if (!this.plan || this.isExpired()) return 0;
    return Math.max(0, this.plan.aiQueriesLimit - this.usageAiQueries);
  }

  getRemainingStorage(): number {
    if (!this.plan || this.isExpired()) return 0;
    return Math.max(0, this.plan.personalStorageLimitMb - this.usagePersonalStorageMb);
  }

  getRemainingVideoMinutes(): number {
    if (!this.plan || this.isExpired()) return 0;
    return Math.max(0, this.plan.videoCallMinutesLimit - this.usageVideoMinutes);
  }

  incrementAiUsage(): void {
    this.usageAiQueries += 1;
  }

  incrementStorageUsage(mb: number): void {
    this.usagePersonalStorageMb += mb;
  }

  incrementVideoUsage(minutes: number): void {
    this.usageVideoMinutes += minutes;
  }

  resetUsage(): void {
    this.usageAiQueries = 0;
    this.usagePersonalStorageMb = 0;
    this.usageVideoMinutes = 0;
    this.lastResetDate = new Date();
  }

  expire(): void {
    this.status = SubscriptionStatus.EXPIRED;
    this.isActive = false;
  }

  activate(): void {
    this.status = SubscriptionStatus.ACTIVE;
    this.isActive = true;
  }

  cancel(): void {
    this.status = SubscriptionStatus.CANCELLED;
    this.isActive = false;
  }
}