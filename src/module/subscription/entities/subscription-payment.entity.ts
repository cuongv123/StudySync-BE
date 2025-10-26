import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../User/entities/User.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PaymentMethod {
  PAYOS = 'PAYOS',
}

@Entity('payments')
export class SubscriptionPayment {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ nullable: true })
  planId: number;

  @Column({ name: 'transactionId', unique: true })
  orderCode: string; // Map to transactionId - PayOS order code

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ name: 'paymentStatus', type: 'varchar' })
  status: string; // Map to paymentStatus

  @Column({ name: 'paymentMethod', type: 'varchar', default: 'PAYOS' })
  paymentMethod: string;

  // PayOS transaction ID - không lưu vào DB
  payosTransactionId?: string;

  @Column({ type: 'text', nullable: true })
  checkoutUrl: string; // URL chứa QR code

  @Column({ name: 'gatewayResponse', type: 'text', nullable: true })
  payosResponse: string; // Map to gatewayResponse - lưu JSON string

  @Column({ name: 'paymentDate', type: 'timestamp', nullable: true })
  paidAt: Date; // Map to paymentDate

  @Column({ name: 'expiresAt', type: 'timestamp', nullable: true })
  expiredAt: Date;

  @Column({ name: 'walletId', type: 'int4', nullable: true })
  walletId: number; // Giữ lại cho tương thích

  @Column({ name: 'callbackData', type: 'jsonb', nullable: true })
  callbackData: any; // Có thể dùng để lưu webhook data

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
