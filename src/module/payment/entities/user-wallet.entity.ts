import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../User/entities/User.entity';

@Entity('user_wallets')
export class UserWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0.00,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  balance: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  // Relations (tạm bỏ để test)
  // @OneToOne(() => User)
  // @JoinColumn({ name: 'userId' })
  // user: User;

  @OneToMany('WalletTransaction', 'wallet')
  transactions: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  hasEnoughBalance(amount: number): boolean {
    return this.balance >= amount;
  }

  canDeduct(amount: number): boolean {
    return this.balance >= amount && amount > 0;
  }

  addBalance(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    this.balance += amount;
  }

  deductBalance(amount: number): void {
    if (!this.canDeduct(amount)) {
      throw new Error('Insufficient balance or invalid amount');
    }
    this.balance -= amount;
  }

  getFormattedBalance(): string {
    return `${this.balance.toLocaleString('vi-VN')} ${this.currency}`;
  }
}