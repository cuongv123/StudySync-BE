import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const orderCode = Number(Date.now().toString() + Math.floor(Math.random() * 1000).toString());
    
    this.logger.log(`Generated orderCode: ${orderCode}`);

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
      const paymentLink = await this.payosService.createPaymentLink({
        orderCode: orderCode.toString(),
        amount: plan.price,
        description: `Subscription: ${plan.planName} - ${plan.durationDays} days`,
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
      
      this.logger.error(`Failed to create payment link: ${error.message}`);
      throw new BadRequestException('Failed to create payment link');
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
      where: { orderCode },
      relations: ['plan', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Verify webhook signature từ PayOS
   */
  async verifyWebhookSignature(webhookData: any): Promise<boolean> {
    try {
      // PayOS SDK có method verifyPaymentWebhookData để verify signature
      const isValid = this.payosService.verifyWebhookSignature(webhookData);
      
      if (isValid) {
        this.logger.log('✅ Webhook signature verified successfully');
      } else {
        this.logger.warn('❌ Invalid webhook signature');
      }
      
      return isValid;
    } catch (error: any) {
      this.logger.error(`Failed to verify webhook signature: ${error.message}`);
      return false;
    }
  }
}
