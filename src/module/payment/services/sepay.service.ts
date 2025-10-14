// src/payment/services/sepay.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/payment.entity';
import { UserWallet } from '../entities/user-wallet.entity';
import axios from 'axios';

@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);
  private readonly apiKey: string;
  private readonly accountNumber: string;
  private readonly accountName: string;
  private readonly bankCode: string;

  constructor(
  @InjectRepository(Payment)
  private paymentRepo: Repository<Payment>,

  @InjectRepository(UserWallet)
  private walletRepo: Repository<UserWallet>,
    
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('SEPAY_API_KEY');
    this.accountNumber = this.configService.get('SEPAY_ACCOUNT_NUMBER');
    this.accountName = this.configService.get('SEPAY_ACCOUNT_NAME');
    this.bankCode = this.configService.get('SEPAY_BANK_CODE');
  }

  /**
   * Tạo payment với QR Code
   */
  async createPayment(userId: string, amount: number) {
    const transactionId = `SP${Date.now().toString().slice(-8)}`;
    
    // Tạo payment record
    const payment = this.paymentRepo.create({
      userId,
      amount,
      paymentMethod: PaymentMethod.SEPAY,
      paymentStatus: PaymentStatus.PENDING,
      transactionId,
    });
    await this.paymentRepo.save(payment);

    // Tạo QR Code
    const content = transactionId;
    const qrCodeUrl = `https://img.vietqr.io/image/${this.bankCode}-${this.accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(this.accountName)}`;

    this.logger.log(`✅ Created payment: ${transactionId} - ${amount.toLocaleString()}đ`);

    return {
      transactionId,
      amount,
      bankCode: this.bankCode,
      bankName: 'Ngân Hàng TMCP Quân Đội (MB)',
      accountNumber: this.accountNumber,
      accountName: this.accountName,
      content,
      qrCodeUrl,
      status: 'pending',
      gateway: 'sepay',
    };
  }

  /**
   * Check payment từ SePay API
   */
  async checkPaymentStatus(transactionId: string) {
    try {
      const response = await axios.get(
        'https://my.sepay.vn/userapi/transactions/list',
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          params: { limit: 100 },
        }
      );

      const transaction = response.data?.transactions?.find(
        (t: any) => t.transaction_content?.includes(transactionId)
      );

      if (transaction) {
        await this.processPayment({
          transaction_id: transaction.id,
          amount_in: transaction.amount_in,
          content: transaction.transaction_content,
        });

        return { found: true, status: 'completed', amount: transaction.amount_in };
      }

      return { found: false, status: 'pending' };
    } catch (error) {
  this.logger.error(`Error checking payment: ${error instanceof Error ? error.message : error}`);
      throw new BadRequestException('Cannot check payment status');
    }
  }

  /**
   * Process payment (update payment + wallet)
   */
  private async processPayment(data: any) {
    const match = data.content.match(/SP\d{8}/);
    if (!match) throw new BadRequestException('Invalid transaction');
    
    const transactionId = match[0];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { transactionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment || payment.paymentStatus !== 'pending') {
        await queryRunner.commitTransaction();
        return;
      }

      if (data.amount_in !== payment.amount) {
  payment.paymentStatus = PaymentStatus.FAILED;
        await queryRunner.manager.save(payment);
        await queryRunner.commitTransaction();
        throw new BadRequestException('Amount mismatch');
      }

      // Update payment
  payment.paymentStatus = PaymentStatus.COMPLETED;
      // Nếu entity không có gatewayResponse/paymentDate thì bỏ dòng này
      if ('gatewayResponse' in payment) payment.gatewayResponse = JSON.stringify(data);
      if ('paymentDate' in payment) payment.paymentDate = new Date();
      await queryRunner.manager.save(payment);

      // Update wallet
      const wallet = await queryRunner.manager.findOne(UserWallet, {
        where: { userId: payment.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new BadRequestException('Wallet not found');

      wallet.balance = Number(wallet.balance) + data.amount_in;
      await queryRunner.manager.save(wallet);

      this.logger.log(`✅ Payment completed: ${transactionId} - Wallet: ${wallet.balance}`);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}