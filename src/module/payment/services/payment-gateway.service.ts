import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Payment } from '../entities/payment.entity';
import { UserWallet } from '../entities/user-wallet.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { UserSubscription } from '../entities/user-subscription.entity';
import { PaymentAttempt } from '../entities/payment-attempt.entity';

import { VNPayService } from './vnpay.service';
import { MoMoService } from './momo.service';
import { ZaloPayService } from './zalopay.service';
import { WalletService } from './wallet.service';
import { PaymentAttemptService } from './payment-attempt.service';

import { PaymentMethod, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';

// Interface definitions
export interface PaymentUrlResponse {
  paymentUrl: string;
  transactionId: string;
  expiresAt: Date;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentCallbackResponse {
  success: boolean;
  transactionId: string;
  paymentStatus: PaymentStatus;
  message: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly maxDailyAttempts: number;
  private readonly paymentTimeout: number;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,

    private readonly vnpayService: VNPayService,
    private readonly momoService: MoMoService,
    private readonly zalopayService: ZaloPayService,
    private readonly walletService: WalletService,
    private readonly paymentAttemptService: PaymentAttemptService,
    private readonly configService: ConfigService,
  ) {
    this.maxDailyAttempts = this.configService.get<number>('PAYMENT_MAX_DAILY_ATTEMPTS', 10);
    this.paymentTimeout = this.configService.get<number>('PAYMENT_TIMEOUT_MINUTES', 15);
  }

  async createPayment(createPaymentDto: CreatePaymentDto, userId: string, ipAddress?: string, userAgent?: string): Promise<PaymentUrlResponse> {
    try {
      // Validate payment attempt limits
      await this.validatePaymentAttempts(userId, ipAddress);

      // Validate subscription plan if provided
      let subscriptionPlan: SubscriptionPlan | undefined;
      if (createPaymentDto.planId) {
        subscriptionPlan = await this.subscriptionPlanRepository.findOne({
          where: { id: createPaymentDto.planId, isActive: true }
        });
        if (!subscriptionPlan) {
          throw new BadRequestException('Invalid or inactive subscription plan');
        }
      }

      // Get user wallet
      const wallet = await this.walletService.getOrCreateWallet(userId);

      // Create payment record
      const payment = await this.createPaymentRecord({
        userId,
        amount: createPaymentDto.amount,
        paymentMethod: createPaymentDto.paymentMethod,
        paymentType: createPaymentDto.paymentType,
        planId: createPaymentDto.planId ? createPaymentDto.planId.toString() : undefined,
        walletId: wallet.id.toString(),
        ipAddress,
        userAgent,
      });

      // Create payment URL based on gateway
      let paymentUrl: string;
      switch (createPaymentDto.paymentMethod) {
        case PaymentMethod.VNPAY:
          paymentUrl = await this.vnpayService.createPaymentUrl(
            payment.transactionId,
            {
              amount: createPaymentDto.amount,
              orderInfo: `Payment for ${createPaymentDto.paymentType}`,
              orderType: 'billpayment',
              ipAddress: ipAddress || '127.0.0.1',
            }
          );
          break;

        case PaymentMethod.MOMO:
          const momoResult = await this.momoService.createPayment(
            payment.transactionId,
            {
              amount: createPaymentDto.amount,
              orderInfo: `Payment for ${createPaymentDto.paymentType}`,
            }
          );
          paymentUrl = momoResult.payUrl;
          break;

        case PaymentMethod.ZALOPAY:
          paymentUrl = await this.zalopayService.createPaymentUrl(
            payment.transactionId,
            {
              amount: createPaymentDto.amount,
              description: createPaymentDto.description || `StudySync Payment - ${createPaymentDto.paymentType}`,
            }
          );
          break;

        default:
          throw new BadRequestException('Unsupported payment method');
      }

      // Update payment with URL and expiry
      payment.paymentUrl = paymentUrl;
      payment.expiresAt = new Date(Date.now() + this.paymentTimeout * 60 * 1000);
      await this.paymentRepository.save(payment);

      // Payment attempt validation is done in validatePaymentAttempts

      this.logger.log(`Payment created successfully: ${payment.transactionId} for user: ${userId}`);

      return {
        paymentUrl,
        transactionId: payment.transactionId,
        expiresAt: payment.expiresAt,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
      };

    } catch (error) {
      this.logger.error(`Failed to create payment for user: ${userId}`, (error as Error)?.stack || error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to create payment. Please try again later.');
    }
  }

  async handlePaymentCallback(paymentMethod: PaymentMethod, callbackData: any, ipAddress?: string): Promise<PaymentCallbackResponse> {
    try {
      let transactionId: string;
      let isValid: boolean;
      let gatewayTransactionId: string | undefined;

      // Validate callback based on gateway
      switch (paymentMethod) {
        case PaymentMethod.VNPAY:
          const vnpayResult = await this.vnpayService.verifyCallback(callbackData);
          transactionId = callbackData.vnp_TxnRef;
          isValid = vnpayResult.isValid;
          gatewayTransactionId = callbackData.vnp_TransactionNo;
          break;

        case PaymentMethod.MOMO:
          const momoResult = await this.momoService.verifyCallback(callbackData);
          transactionId = callbackData.orderId;
          isValid = momoResult.isValid;
          gatewayTransactionId = callbackData.transId;
          break;

        case PaymentMethod.ZALOPAY:
          const zalopayResult = this.zalopayService.verifyCallback(callbackData);
          transactionId = zalopayResult.transactionId;
          isValid = zalopayResult.isValid;
          const callbackDataObj = JSON.parse(callbackData.data || '{}');
          gatewayTransactionId = callbackDataObj.zp_trans_id;
          break;

        default:
          throw new BadRequestException('Unsupported payment method');
      }

      // Find payment record
      const payment = await this.paymentRepository.findOne({
        where: { transactionId },
        relations: ['user', 'plan', 'wallet'],
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Update payment with callback data
      payment.callbackData = callbackData;
      payment.gatewayResponse = JSON.stringify(callbackData);
      // payment.gatewayTransactionId = gatewayTransactionId; // Tạm comment vì database chưa có column

      if (isValid && payment.canBeProcessed()) {
        // Process successful payment
        await this.processSuccessfulPayment(payment);
        this.logger.log(`Payment processed successfully: ${transactionId}`);
      } else {
        // Handle failed payment
        payment.markAsFailed(isValid ? 'Payment expired or already processed' : 'Invalid callback signature');
        await this.paymentRepository.save(payment);
        this.logger.warn(`Payment failed: ${transactionId} - Payment validation failed`);
      }

      return {
        success: payment.isSuccessful(),
        transactionId: payment.transactionId,
        paymentStatus: payment.paymentStatus,
        message: payment.isSuccessful() ? 'Payment processed successfully' : 'Payment processing failed',
      };

    } catch (error) {
      this.logger.error('Failed to process payment callback', (error as Error)?.stack || error);
      throw new InternalServerErrorException('Failed to process payment callback');
    }
  }

  async getPaymentStatus(transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
      relations: ['user', 'plan', 'wallet'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getUserPayments(userId: string, limit: number = 20, offset: number = 0): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  private async createPaymentRecord(data: {
    userId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentType: PaymentType;
    planId?: string;
    walletId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Payment> {
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = this.paymentRepository.create({
      transactionId,
      userId: data.userId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      paymentType: data.paymentType,
      planId: data.planId ? parseInt(data.planId) : null,
      walletId: data.walletId ? parseInt(data.walletId) : null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    return await this.paymentRepository.save(payment);
  }

  private async processSuccessfulPayment(payment: Payment): Promise<void> {
    // Mark payment as completed
    payment.markAsCompleted(); // Tạm bỏ gatewayTransactionId parameter
    
    // Process based on payment type
    switch (payment.paymentType) {
      case PaymentType.DEPOSIT:
        // Add funds to wallet
        await this.walletService.deposit(
          payment.userId,
          payment.amount,
          `Deposit via ${payment.paymentMethod}`,
          payment.id
        );
        break;

      case PaymentType.SUBSCRIPTION:
        if (payment.planId) {
          await this.processSubscriptionUpgrade(payment);
        }
        break;

      default:
        this.logger.warn(`Unknown payment type: ${payment.paymentType}`);
    }

    await this.paymentRepository.save(payment);
  }

  private async processSubscriptionUpgrade(payment: Payment): Promise<void> {
    if (!payment.plan) {
      this.logger.error(`Subscription payment missing plan: ${payment.transactionId}`);
      return;
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.userSubscriptionRepository.findOne({
      where: { userId: payment.userId, isActive: true },
    });

    if (existingSubscription) {
      // Upgrade existing subscription
      existingSubscription.planId = payment.plan.id;
      existingSubscription.endDate = new Date(
        Date.now() + payment.plan.durationDays * 24 * 60 * 60 * 1000
      );
      // Reset usage counters
      existingSubscription.usagePersonalStorageMb = 0;
      existingSubscription.usageVideoMinutes = 0;
      existingSubscription.usageAiQueries = 0;
      await this.userSubscriptionRepository.save(existingSubscription);
    } else {
      // Create new subscription
      const newSubscription = this.userSubscriptionRepository.create({
        userId: payment.userId,
        planId: payment.plan.id,
        startDate: new Date(),
        endDate: new Date(
          Date.now() + payment.plan.durationDays * 24 * 60 * 60 * 1000
        ),
        isActive: true,
        usagePersonalStorageMb: 0,
        usageVideoMinutes: 0,
        usageAiQueries: 0,
      });
      await this.userSubscriptionRepository.save(newSubscription);
    }

    this.logger.log(`Subscription processed for user: ${payment.userId}, plan: ${payment.planId}`);
  }

  private async validatePaymentAttempts(userId: string, ipAddress?: string): Promise<void> {
    // Check if user can attempt payment
    const attemptResult = await this.paymentAttemptService.canAttemptPayment(userId);
    
    if (!attemptResult.canAttempt) {
      throw new BadRequestException(`Payment attempts blocked. Attempts remaining: ${attemptResult.attemptsRemaining}`);
    }
    
    this.logger.log(`Payment attempt validation passed for user: ${userId}`);
  }
}