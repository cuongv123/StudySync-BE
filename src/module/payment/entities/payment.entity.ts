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
import { UserWallet } from './user-wallet.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum PaymentMethod {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  SUBSCRIPTION = 'subscription',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ nullable: true })
  planId: number;

  @Column({ nullable: true })
  walletId: number;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.DEPOSIT,
  })
  paymentType: PaymentType;

  @Column({ unique: true })
  transactionId: string; // Internal transaction ID

  // @Column({ nullable: true })
  // gatewayTransactionId: string; // Gateway's transaction ID (tạm bỏ vì database chưa có column này)

  @Column({ type: 'text', nullable: true })
  paymentUrl: string; // URL redirect to gateway

  @Column({ type: 'jsonb', nullable: true })
  callbackData: any; // Store callback data from gateway

  @Column({ type: 'text', nullable: true })
  gatewayResponse: string; // Raw gateway response

  // @Column({ type: 'text', nullable: true })
  // failureReason: string;  // Tạm bỏ vì database chưa có column này

  @Column({ type: 'timestamp', nullable: true })
  paymentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // Payment URL expiry

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  @ManyToOne(() => UserWallet, { nullable: true })
  @JoinColumn({ name: 'walletId' })
  wallet: UserWallet;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  isSuccessful(): boolean {
    return this.paymentStatus === PaymentStatus.COMPLETED;
  }

  isFailed(): boolean {
    return [
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
      PaymentStatus.EXPIRED,
    ].includes(this.paymentStatus);
  }

  isPending(): boolean {
    return [
      PaymentStatus.PENDING,
      PaymentStatus.PROCESSING,
    ].includes(this.paymentStatus);
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  canBeProcessed(): boolean {
    return this.isPending() && !this.isExpired();
  }

  markAsCompleted(gatewayTransactionId?: string): void {
    this.paymentStatus = PaymentStatus.COMPLETED;
    this.paymentDate = new Date();
    // if (gatewayTransactionId) {
    //   this.gatewayTransactionId = gatewayTransactionId;
    // }
  }

  markAsFailed(reason?: string): void {
    this.paymentStatus = PaymentStatus.FAILED;
    // this.failureReason = reason; // Tạm comment vì database chưa có column failureReason
  }

  markAsExpired(): void {
    this.paymentStatus = PaymentStatus.EXPIRED;
  }

  getFormattedAmount(): string {
    return `${this.amount.toLocaleString('vi-VN')} VND`;
  }

  getGatewayDisplayName(): string {
    const names = {
      [PaymentMethod.VNPAY]: 'VNPay',
      [PaymentMethod.MOMO]: 'MoMo',
      [PaymentMethod.ZALOPAY]: 'ZaloPay',
    };
    return names[this.paymentMethod] || this.paymentMethod;
  }
}