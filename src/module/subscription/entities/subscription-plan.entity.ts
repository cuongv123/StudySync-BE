import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  planName: string; // Plan name from database

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  price: number;

  @Column()
  personalStorageLimitMb: number;

  @Column()
  videoCallMinutesLimit: number;

  @Column()
  aiQueriesLimit: number;

  @Column({ default: 30 })
  durationDays: number; // 0 = unlimited, positive number = days duration

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @OneToMany('UserSubscription', 'plan')
  userSubscriptions: any[];

  @CreateDateColumn()
  createdAt: Date;

  // Business Logic Methods
  isFree(): boolean {
    return this.planName === 'free' || this.price === 0;
  }

  isPro(): boolean {
    return this.planName === 'pro';
  }

  isProMax(): boolean {
    return this.planName === 'promax';
  }

  isUnlimited(): boolean {
    return this.durationDays === 0;
  }

  getFormattedPrice(): string {
    if (this.isFree()) return 'Miễn phí';
    return `${this.price.toLocaleString('vi-VN')} VND`;
  }

  getDurationText(): string {
    if (this.isUnlimited()) return 'Không giới hạn';
    return `${this.durationDays} ngày`;
  }

  getFeatureSummary(): string {
    return `${this.aiQueriesLimit} AI queries, ${this.personalStorageLimitMb}MB storage, ${this.videoCallMinutesLimit} phút video`;
  }
}