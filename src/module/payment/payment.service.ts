import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, EntityManager } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionPayment, PaymentStatus } from '../subscription/entities/subscription-payment.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { UserSubscription, SubscriptionStatus } from '../subscription/entities/user-subscription.entity';
import { PayOSService, PayOSWebhookData } from '../subscription/services/payos.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(SubscriptionPayment)
    private readonly paymentRepository: Repository<SubscriptionPayment>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepository: Repository<UserSubscription>,
    private readonly payosService: PayOSService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Tạo payment link với PayOS để user mua subscription
   */
  async createSubscriptionPayment(
    userId: string,
    planId: number,
    userInfo: { name?: string; email?: string; phone?: string },
  ) {
    // Validate plan
    const plan = await this.planRepository.findOne({
      where: { id: planId, isActive: true },
    });
    
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Check if trying to buy FREE plan
    if (plan.planName.toLowerCase() === 'free') {
      throw new BadRequestException('Cannot purchase FREE plan');
    }

    // Check existing subscription
    const existingSub = await this.subscriptionRepository.findOne({
      where: { userId, isActive: true },
      relations: ['plan'],
    });

    if (existingSub) {
      // Nếu đang có gói free (id = 0 là mock free plan) → Cho phép mua
      if (existingSub.id === 0) {
        this.logger.log(`User ${userId} upgrading from free to ${plan.planName}`);
      } 
      // Nếu đang có gói trả phí → Cho phép upgrade lên gói cao hơn
      else if (existingSub.planId === planId) {
        throw new BadRequestException('You already have this subscription plan');
      } else {
        this.logger.log(`User ${userId} upgrading from ${existingSub.plan.planName} to ${plan.planName}`);
      }
    }

    // Generate unique order code (only numbers for PayOS)
    // PayOS yêu cầu orderCode phải là số và không quá 17 chữ số
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderCodeStr = timestamp.slice(-14) + random; // Lấy 14 số cuối của timestamp + 3 số random = 17 số
    const orderCode = Number(orderCodeStr);
    
    this.logger.log(`Generated orderCode: ${orderCode} (length: ${orderCodeStr.length})`);
    this.logger.log(`User info for payment: ${JSON.stringify(userInfo)}`);
    this.logger.log(`Plan details: ${plan.planName}, Price: ${plan.price}`);

    // Validate price
    if (!plan.price || plan.price <= 0) {
      throw new BadRequestException('Invalid plan price');
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      userId,
      planId,
      orderCode: orderCode.toString(), // Store as string in DB
      amount: plan.price,
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepository.save(payment);

    // Create PayOS payment link
    try {
      // PayOS yêu cầu description tối đa 25 ký tự
      const description = `${plan.planName} - ${plan.durationDays}d`.slice(0, 25);
      
      const paymentLink = await this.payosService.createPaymentLink({
        orderCode: orderCode.toString(),
        amount: plan.price,
        description: description,
        buyerName: userInfo.name || 'Guest',
        buyerEmail: userInfo.email || 'guest@studysync.com',
        buyerPhone: userInfo.phone || '0000000000',
        buyerAddress: 'N/A',
        items: [
          {
            name: `${plan.planName} Subscription`,
            quantity: 1,
            price: plan.price,
          },
        ],
      });

      // Update payment with checkout URL and PayOS response
      payment.checkoutUrl = paymentLink.checkoutUrl;
      payment.payosResponse = JSON.stringify(paymentLink); // Convert to JSON string
      payment.paymentMethod = 'PAYOS';
      await this.paymentRepository.save(payment);

      return {
        orderCode,
        checkoutUrl: paymentLink.checkoutUrl,
        qrCode: paymentLink.qrCode,
        amount: plan.price,
        planName: plan.planName,
      };
    } catch (error: any) {
      // Mark payment as failed
      payment.status = PaymentStatus.CANCELLED;
      await this.paymentRepository.save(payment);
      
      // Log đầy đủ thông tin lỗi từ PayOS
      this.logger.error(`Failed to create payment link for orderCode ${orderCode}`);
      this.logger.error(`Error message: ${error.message}`);
      this.logger.error(`Error details: ${JSON.stringify(error?.response?.data || error)}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      
      // Trả về lỗi chi tiết hơn
      const errorMessage = error.message || 'Unknown error from PayOS';
      throw new BadRequestException(`Failed to create payment link: ${errorMessage}`);
    }
  }

  /**
   * Xử lý webhook từ PayOS khi payment thành công
   */
    async verifyWebhook(webhookBody: any): Promise<PayOSWebhookData> {
    return this.payosService.verifyWebhook(webhookBody);
  }

  /**
   * Chỉ nhận `data` đã verify chữ ký. Chạy trong transaction, khóa dòng chống xử lý trùng.
   * Lỗi bất ngờ được throw ra để controller trả 500 -> PayOS retry.
   */
  async handlePaymentWebhook(data: PayOSWebhookData) {
    const orderCode = String(data.orderCode);
    this.logger.log(`Processing verified webhook for order: ${orderCode}`);

    return this.paymentRepository.manager.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(SubscriptionPayment);

      // Khóa dòng payment. Không join relation (FOR UPDATE + LEFT JOIN bị lỗi).
      const payment = await paymentRepo.findOne({
        where: { orderCode },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        this.logger.warn(`Payment not found for order: ${orderCode}`);
        return { processed: false, message: 'Payment not found' };
      }

      if (payment.status === PaymentStatus.PAID) {
        this.logger.log(`Payment already processed: ${orderCode}`);
        return { processed: false, message: 'Payment already processed' };
      }

      // Chỉ tin `code` nằm trong `data` (phần được ký)
      if (data.code !== '00') {
        if (payment.status === PaymentStatus.PENDING) {
          payment.status = PaymentStatus.CANCELLED;
          payment.callbackData = data;
          await paymentRepo.save(payment);
        }
        this.logger.log(`Payment not successful for order ${orderCode} (code=${data.code})`);
        return { processed: false, message: 'Payment cancelled' };
      }

      // So khớp số tiền
      if (Number(data.amount) !== Number(payment.amount)) {
        this.logger.error(
          `Amount mismatch for order ${orderCode}: received=${data.amount}, expected=${payment.amount}. Needs manual review.`,
        );
        payment.callbackData = data;
        await paymentRepo.save(payment);
        return { processed: false, message: 'Amount mismatch' };
      }

      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      payment.callbackData = data;
      await paymentRepo.save(payment);

      await this.activateSubscription(manager, payment.userId, payment.planId);

      this.logger.log(`Subscription activated for user: ${payment.userId}`);
      return { processed: true, message: 'Subscription activated successfully' };
    });
  }

  private async activateSubscription(manager: EntityManager, userId: string, planId: number) {
    const plan = await manager.getRepository(SubscriptionPlan).findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const subscriptionRepo = manager.getRepository(UserSubscription);

    // Tắt gói cũ (trường hợp nâng cấp)
    const updated = await subscriptionRepo.update(
      { userId, isActive: true },
      { isActive: false, status: SubscriptionStatus.EXPIRED },
    );

    if (updated.affected && updated.affected > 0) {
      this.logger.log(`Deactivated ${updated.affected} old subscription(s) for user ${userId}`);
    }

    // Tạo gói mới
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = subscriptionRepo.create({
      userId,
      planId,
      startDate,
      endDate,
      isActive: true,
      autoRenew: false,
      status: SubscriptionStatus.ACTIVE,
      purchasedFromWallet: false,
    });

    await subscriptionRepo.save(subscription);
    this.logger.log(`New ${plan.planName} subscription activated for user ${userId}, expires at ${endDate.toISOString()}`);
  }
  /**
   * Get payment history for user
   */
  async getUserPayments(userId: string) {
     if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return await this.paymentRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get payment by order code
   */
  async getPaymentByOrderCode(orderCode: string) {
    const payment = await this.paymentRepository.findOne({
      where: { orderCode: orderCode },
      relations: ['plan'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get full transaction info from PayOS
   * Returns complete transaction details including bank info, reference, etc.
   */
  async getPayOSTransactionInfo(orderCode: string) {
    try {
      this.logger.log(`Fetching transaction info from PayOS for order: ${orderCode}`);
      
      // Get payment record from database first
      const payment = await this.paymentRepository.findOne({
        where: { orderCode: orderCode },
        relations: ['plan'],
      });

      // If payment not found in database, return error immediately
      if (!payment) {
        this.logger.error(`Payment not found in database for order: ${orderCode}`);
        throw new NotFoundException('Mã thanh toán không tồn tại trong hệ thống. Vui lòng tạo payment mới.');
      }

      // Try to get transaction info from PayOS
      let payosInfo = null;
      try {
        payosInfo = await this.payosService.getPaymentInfo(orderCode);
      } catch (payosError: any) {
        // Log PayOS error but still return database info
        this.logger.warn(`PayOS API error for order ${orderCode}: ${payosError.message}`);
        
        // If PayOS returns "không tồn tại" (code 101), payment might be expired or cancelled
        if (payosError.message?.includes('không tồn tại') || payosError.message?.includes('code: 101')) {
          this.logger.warn(`Payment link expired or cancelled on PayOS for order: ${orderCode}`);
          
          // Return database info only
          return {
            orderCode: payment.orderCode,
            amount: payment.amount,
            status: 'EXPIRED_OR_NOT_FOUND_ON_PAYOS',
            message: 'Payment link không tồn tại trên PayOS (có thể đã hết hạn hoặc bị hủy). Vui lòng tạo payment mới.',
            paymentRecord: {
              id: payment.id,
              userId: payment.userId,
              planId: payment.planId,
              planName: payment.plan?.planName,
              status: payment.status,
              paidAt: payment.paidAt,
              createdAt: payment.createdAt,
            },
          };
        }
        
        // Other PayOS errors, rethrow
        throw payosError;
      }

      // Success: Return full info from both PayOS and database
      return {
        // PayOS transaction info
        orderCode: payosInfo.orderCode,
        amount: payosInfo.amount,
        description: payosInfo.description,
        status: payosInfo.status,
        currency: payosInfo.currency || 'VND',
        paymentLinkId: payosInfo.paymentLinkId,
        checkoutUrl: payosInfo.checkoutUrl,
        qrCode: payosInfo.qrCode,
        
        // Transaction details (if paid)
        transactions: payosInfo.transactions || [],
        
        // Database payment info
        paymentRecord: {
          id: payment.id,
          userId: payment.userId,
          planId: payment.planId,
          planName: payment.plan?.planName,
          status: payment.status,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get transaction info: ${error.message}`);
      
      // Return user-friendly error message
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new NotFoundException(
        `Không thể lấy thông tin thanh toán. Lỗi: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Cancel payment by user
   * Only allows cancelling PENDING payments
   */
  async cancelPayment(userId: string, orderCode: string) {
    // Find payment
    const payment = await this.paymentRepository.findOne({
      where: { orderCode },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check ownership
    if (payment.userId !== userId) {
      throw new BadRequestException('You are not authorized to cancel this payment');
    }

    // Only allow cancelling PENDING payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel payment with status: ${payment.status}`);
    }

    // Try to cancel on PayOS
    try {
      await this.payosService.cancelPaymentLink(orderCode, 'Cancelled by user');
      this.logger.log(` Payment link cancelled on PayOS: ${orderCode}`);
    } catch (error: any) {
      // If PayOS cancel fails (e.g., payment already expired), just log warning
      this.logger.warn(` Failed to cancel on PayOS (may already be expired): ${error.message}`);
    }

    // Update status in database
    payment.status = PaymentStatus.CANCELLED;
    await this.paymentRepository.save(payment);

    this.logger.log(` Payment cancelled by user ${userId}: ${orderCode}`);
    return { message: 'Payment cancelled successfully' };
  }

  /**
   * Cron job: Tự động expire payments quá 5 phút
   * Chạy mỗi 5 phút
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async expireOldPendingPayments() {
    try {
      this.logger.log(' Running cron job: Expire old pending payments');
      
      // Tính thời gian 5 phút trước
      const expireThreshold = new Date();
      expireThreshold.setMinutes(expireThreshold.getMinutes() - 15);
      
      // Tìm tất cả payments PENDING quá 5 phút
      const expiredPayments = await this.paymentRepository.find({
        where: {
          status: PaymentStatus.PENDING,
          createdAt: LessThan(expireThreshold),
        },
      });
      
      if (expiredPayments.length === 0) {
        this.logger.log(' No expired payments found');
        return;
      }
      
      // Update status thành EXPIRED (không phải CANCELLED)
      const orderCodes = expiredPayments.map(p => p.orderCode);
      await this.paymentRepository.update(
        { 
          status: PaymentStatus.PENDING,
          createdAt: LessThan(expireThreshold)
        },
        { 
          status: PaymentStatus.EXPIRED 
        }
      );
      
      this.logger.log(` Expired ${expiredPayments.length} pending payments: ${orderCodes.join(', ')}`);
    } catch (error: any) {
      this.logger.error(` Failed to expire old payments: ${error.message}`);
    }
  }
}
