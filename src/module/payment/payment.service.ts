import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionPayment, PaymentStatus } from '../subscription/entities/subscription-payment.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { UserSubscription, SubscriptionStatus } from '../subscription/entities/user-subscription.entity';
import { PayOSService } from '../subscription/services/payos.service';
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
  async handlePaymentWebhook(webhookData: any) {
    this.logger.log('=== Webhook Data Received ===');
    this.logger.log(JSON.stringify(webhookData, null, 2));
    
    // PayOS có thể gửi data với cấu trúc khác nhau
    const orderCode = webhookData.orderCode || webhookData.data?.orderCode || webhookData.order_code;
    
    this.logger.log(`Processing webhook for order: ${orderCode}`);

    if (!orderCode) {
      this.logger.error('OrderCode is missing in webhook data!');
      this.logger.error('Webhook keys:', Object.keys(webhookData));
      throw new BadRequestException('OrderCode is required');
    }

    // Verify webhook signature đã được xử lý ở controller
    // Webhook data format từ PayOS:
    // { orderCode, amount, description, accountNumber, reference, transactionDateTime, ... }

    // Find payment record
    const payment = await this.paymentRepository.findOne({
      where: { orderCode: String(orderCode) },
      relations: ['plan'],
    });

    if (!payment) {
      this.logger.error(`Payment not found for order: ${orderCode}`);
      throw new NotFoundException('Payment not found');
    }

    // Check if already processed
    if (payment.status === PaymentStatus.PAID) {
      this.logger.log(`Payment already processed: ${orderCode}`);
      return { message: 'Payment already processed' };
    }

    // Update payment status
    if (webhookData.code === '00' || webhookData.success) {
      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      await this.paymentRepository.save(payment);

      // Activate subscription
      await this.activateSubscription(payment.userId, payment.planId);

      this.logger.log(`Subscription activated for user: ${payment.userId}`);
      return { message: 'Subscription activated successfully' };
    } else {
      payment.status = PaymentStatus.CANCELLED;
      await this.paymentRepository.save(payment);

      this.logger.log(`Payment cancelled for order: ${webhookData.orderCode}`);
      return { message: 'Payment cancelled' };
    }
  }

  /**
   * Activate subscription sau khi thanh toán thành công
   */
  private async activateSubscription(userId: string, planId: number) {
    const plan = await this.planRepository.findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Deactivate any existing subscription (upgrade case)
    const updated = await this.subscriptionRepository.update(
      { userId, isActive: true },
      { isActive: false, status: SubscriptionStatus.EXPIRED },
    );

    if (updated.affected && updated.affected > 0) {
      this.logger.log(`Deactivated ${updated.affected} old subscription(s) for user ${userId}`);
    }

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = this.subscriptionRepository.create({
      userId,
      planId,
      startDate,
      endDate,
      isActive: true,
      autoRenew: false,
      status: SubscriptionStatus.ACTIVE,
      purchasedFromWallet: false,
    });

    await this.subscriptionRepository.save(subscription);
    this.logger.log(`✅ New ${plan.planName} subscription activated for user ${userId}, expires at ${endDate.toISOString()}`);
  }

  /**
   * Get payment history for user
   */
  async getUserPayments(userId: string) {
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
   * Verify webhook signature từ PayOS
   */
  async verifyWebhookSignature(webhookData: any): Promise<boolean> {
    try {
      // PayOS SDK có method verifyPaymentWebhookData để verify signature
      const isValid = this.payosService.verifyWebhookSignature(webhookData);
      
      if (isValid) {
        this.logger.log(' Webhook signature verified successfully');
      } else {
        this.logger.warn(' Invalid webhook signature');
      }
      
      return isValid;
    } catch (error: any) {
      this.logger.error(`Failed to verify webhook signature: ${error.message}`);
      return false;
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
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      // Tìm tất cả payments PENDING quá 5 phút
      const expiredPayments = await this.paymentRepository.find({
        where: {
          status: PaymentStatus.PENDING,
          createdAt: LessThan(fiveMinutesAgo),
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
          createdAt: LessThan(fiveMinutesAgo)
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
