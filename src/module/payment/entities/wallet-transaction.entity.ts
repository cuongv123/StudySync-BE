import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../User/entities/User.entity';
import { UserWallet } from './user-wallet.entity';

export enum WalletTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export enum WalletTransactionReferenceType {
  PAYMENT = 'payment',
  SUBSCRIPTION = 'subscription',
  REFUND = 'refund',
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  walletId: number;

  @Column({
    type: 'enum',
    enum: WalletTransactionType,
  })
  type: WalletTransactionType;

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

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  referenceId: number;

  @Column({
    type: 'enum',
    enum: WalletTransactionReferenceType,
    nullable: true,
  })
  referenceType: WalletTransactionReferenceType;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  balanceBefore: number;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  balanceAfter: number;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => UserWallet, wallet => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: UserWallet;

  @CreateDateColumn()
  createdAt: Date;

  // Business Logic Methods
  getFormattedAmount(): string {
    const sign = this.type === WalletTransactionType.DEPOSIT ? '+' : '-';
    return `${sign}${this.amount.toLocaleString('vi-VN')} VND`;
  }

  isDeposit(): boolean {
    return this.type === WalletTransactionType.DEPOSIT;
  }

  isWithdraw(): boolean {
    return this.type === WalletTransactionType.WITHDRAW;
  }
}