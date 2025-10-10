import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWallet } from '../entities/user-wallet.entity';
import { WalletTransaction, WalletTransactionType, WalletTransactionReferenceType } from '../entities/wallet-transaction.entity';

export interface CreateWalletTransactionDto {
  userId: string;
  type: WalletTransactionType;
  amount: number;
  description?: string;
  referenceId?: number;
  referenceType?: WalletTransactionReferenceType;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserWallet)
    private walletRepository: Repository<UserWallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
  ) {}

  /**
   * Get user's wallet, create if not exists
   */
  async getOrCreateWallet(userId: string): Promise<UserWallet> {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
      // relations: ['user'], // Tạm bỏ để test
    });

    if (!wallet) {
      // Auto-create wallet if not exists
      wallet = this.walletRepository.create({
        userId,
        balance: 0,
        currency: 'VND',
      });
      wallet = await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  /**
   * Check if user has enough balance
   */
  async hasEnoughBalance(userId: string, amount: number): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.hasEnoughBalance(amount);
  }

  /**
   * Deposit money to wallet (from payment gateway)
   */
  async deposit(
    userId: string,
    amount: number,
    description: string = 'Nạp tiền từ cổng thanh toán',
    referenceId?: number,
    referenceType: WalletTransactionReferenceType = WalletTransactionReferenceType.PAYMENT,
  ): Promise<{ wallet: UserWallet; transaction: WalletTransaction }> {
    if (amount <= 0) {
      throw new BadRequestException('Số tiền nạp phải lớn hơn 0');
    }

    const wallet = await this.getOrCreateWallet(userId);
    const balanceBefore = wallet.balance;

    // Update wallet balance
    wallet.addBalance(amount);
    const updatedWallet = await this.walletRepository.save(wallet);

    // Create transaction record
    const transaction = await this.createTransaction({
      userId,
      type: WalletTransactionType.DEPOSIT,
      amount,
      description,
      referenceId,
      referenceType,
    }, balanceBefore, updatedWallet.balance);

    return { wallet: updatedWallet, transaction };
  }

  /**
   * Withdraw money from wallet (for subscription purchase)
   */
  async withdraw(
    userId: string,
    amount: number,
    description: string = 'Mua gói subscription',
    referenceId?: number,
    referenceType: WalletTransactionReferenceType = WalletTransactionReferenceType.SUBSCRIPTION,
  ): Promise<{ wallet: UserWallet; transaction: WalletTransaction }> {
    if (amount <= 0) {
      throw new BadRequestException('Số tiền rút phải lớn hơn 0');
    }

    const wallet = await this.getOrCreateWallet(userId);
    
    if (!wallet.canDeduct(amount)) {
      throw new BadRequestException('Số dư không đủ để thực hiện giao dịch');
    }

    const balanceBefore = wallet.balance;

    // Update wallet balance
    wallet.deductBalance(amount);
    const updatedWallet = await this.walletRepository.save(wallet);

    // Create transaction record
    const transaction = await this.createTransaction({
      userId,
      type: WalletTransactionType.WITHDRAW,
      amount,
      description,
      referenceId,
      referenceType,
    }, balanceBefore, updatedWallet.balance);

    return { wallet: updatedWallet, transaction };
  }

  /**
   * Get wallet transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['wallet'],
    });

    return { transactions, total };
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(userId: string): Promise<{
    totalDeposited: number;
    totalWithdrawn: number;
    transactionCount: number;
  }> {
    const deposits = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: WalletTransactionType.DEPOSIT })
      .getRawOne();

    const withdrawals = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: WalletTransactionType.WITHDRAW })
      .getRawOne();

    const count = await this.transactionRepository.count({ where: { userId } });

    return {
      totalDeposited: parseFloat(deposits.total) || 0,
      totalWithdrawn: parseFloat(withdrawals.total) || 0,
      transactionCount: count,
    };
  }

  /**
   * Create wallet transaction record
   */
  private async createTransaction(
    data: CreateWalletTransactionDto,
    balanceBefore: number,
    balanceAfter: number,
  ): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(data.userId);

    const transaction = this.transactionRepository.create({
      userId: data.userId,
      walletId: wallet.id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      balanceBefore,
      balanceAfter,
    });

    return await this.transactionRepository.save(transaction);
  }

  /**
   * Get wallet with transaction summary
   */
  async getWalletSummary(userId: string): Promise<{
    wallet: UserWallet;
    recentTransactions: WalletTransaction[];
    stats: {
      totalDeposited: number;
      totalWithdrawn: number;
      transactionCount: number;
    };
  }> {
    const wallet = await this.getOrCreateWallet(userId);
    const { transactions } = await this.getTransactionHistory(userId, 5);
    const stats = await this.getTransactionStats(userId);

    return {
      wallet,
      recentTransactions: transactions,
      stats,
    };
  }
}